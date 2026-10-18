"""Frozen screening library for U19 (ligand-based virtual-screening analytics).

Actives: ROCK1 compounds with pActivity >= 6.5 (exact measurements) from the curated table.
Decoys : molecules measured at eight unrelated, non-kinase targets, excluded by Tanimoto similarity
         to any ROCK1 ligand, then PROPERTY-MATCHED to the actives (DUD-E logic, 10 decoys per active).
Both a property-matched and a randomly drawn decoy set are frozen so that U19 can quantify the effect
of decoy design on enrichment.
"""
import json, hashlib, numpy as np, pandas as pd
from rdkit import Chem, RDLogger, DataStructs
from rdkit.Chem import Descriptors, Crippen, QED, rdMolDescriptors, rdFingerprintGenerator
from rdkit.Chem.Scaffolds import MurckoScaffold
from rdkit.Chem.MolStandardize import rdMolStandardize
from scipy.spatial import cKDTree
RDLogger.DisableLog("rdApp.*")
rng = np.random.default_rng(0)

cur = pd.read_csv("rock1_chembl_curated.csv")
raw = pd.read_csv("rock1_chembl_raw.csv")
pool = pd.read_csv("decoy_pool_raw.csv")
print("curated", len(cur), "pool", len(pool))

norm = rdMolStandardize.Normalizer(); unch = rdMolStandardize.Uncharger(); lfc = rdMolStandardize.LargestFragmentChooser()
def std(smi):
    m = Chem.MolFromSmiles(smi)
    if m is None: return None, None, None
    try:
        m = lfc.choose(norm.normalize(m)); m = unch.uncharge(m); Chem.SanitizeMol(m)
    except Exception: return None, None, None
    return Chem.MolToSmiles(m), Chem.MolToInchiKey(m), m

PROPS = ["MolWt","MolLogP","TPSA","HBD","HBA","RotB","formal_charge"]
def props(m):
    return dict(MolWt=Descriptors.MolWt(m), MolLogP=Crippen.MolLogP(m), TPSA=rdMolDescriptors.CalcTPSA(m),
                HBD=rdMolDescriptors.CalcNumHBD(m), HBA=rdMolDescriptors.CalcNumHBA(m),
                RotB=rdMolDescriptors.CalcNumRotatableBonds(m),
                formal_charge=Chem.GetFormalCharge(m), HeavyAtoms=m.GetNumHeavyAtoms(),
                AromaticRings=rdMolDescriptors.CalcNumAromaticRings(m), RingCount=rdMolDescriptors.CalcNumRings(m),
                FractionCSP3=rdMolDescriptors.CalcFractionCSP3(m), QED=QED.qed(m),
                scaffold_smiles=MurckoScaffold.MurckoScaffoldSmiles(mol=m, includeChirality=False))

gen = rdFingerprintGenerator.GetMorganGenerator(radius=2, fpSize=2048)

# ---- actives
act = cur[(~cur.censored) & (cur.pActivity >= 6.5) & cur.HeavyAtoms.between(15, 50)].copy()
act_mols = [Chem.MolFromSmiles(s) for s in act.std_smiles]
act["_mol"] = act_mols
act = act[act._mol.notna()].reset_index(drop=True)
print("actives (pAct>=6.5, 15-50 heavy atoms):", len(act))

# ---- all known ROCK1 ligands (for the exclusion rule): every standardised structure in the curated table
rock_fps = [gen.GetFingerprint(Chem.MolFromSmiles(s)) for s in cur.std_smiles]
rock_keys = set(cur.inchikey)

# ---- decoy pool: standardise, exclude ROCK1 ligands and anything similar to one
recs = []
for mid, smi, tid, tname in pool[["molecule_chembl_id","canonical_smiles","source_target","source_target_name"]].itertuples(index=False):
    s, ik, m = std(smi)
    if m is None or ik in rock_keys: continue
    if not (15 <= m.GetNumHeavyAtoms() <= 50): continue
    recs.append(dict(chembl_id=mid, std_smiles=s, inchikey=ik, source_target=tid, source_target_name=tname, _mol=m))
dec = pd.DataFrame(recs).drop_duplicates("inchikey").reset_index(drop=True)
print("decoy candidates after standardisation/size filter:", len(dec))
dec_fps = [gen.GetFingerprint(m) for m in dec._mol]
maxsim = np.array([max(DataStructs.BulkTanimotoSimilarity(fp, rock_fps)) for fp in dec_fps])
dec["max_tanimoto_to_rock1"] = maxsim.round(4)
dec = dec[maxsim < 0.35].reset_index(drop=True)
print("decoy candidates after Tanimoto < 0.35 exclusion:", len(dec))

# ---- properties
act_p = pd.DataFrame([props(m) for m in act._mol])
act = pd.concat([act.drop(columns=[c for c in act.columns if c in set(act_p.columns) | {'_mol'}]), act_p], axis=1)
dec_p = pd.DataFrame([props(m) for m in dec._mol])
dec = pd.concat([dec.drop(columns=[c for c in dec.columns if c in set(dec_p.columns) | {'_mol'}]), dec_p], axis=1)

# ---- property matching: 10 decoys per active, nearest in standardised property space, without replacement
mu, sd = act[PROPS].mean(), act[PROPS].std(ddof=0).replace(0, 1.0)
print('property sd:', sd.round(3).to_dict())
A = ((act[PROPS] - mu) / sd).to_numpy(float); D = ((dec[PROPS] - mu) / sd).to_numpy(float)
keep = np.isfinite(D).all(axis=1); dec = dec[keep].reset_index(drop=True); D = D[keep]
assert np.isfinite(A).all(), 'non-finite active properties'
tree = cKDTree(D)
K = 10
used, matched = set(), []
order = rng.permutation(len(A))
for ai in order:
    dist, idx = tree.query(A[ai], k=min(400, len(D)))
    picked = 0
    for d, di in zip(np.atleast_1d(dist), np.atleast_1d(idx)):
        if di in used: continue
        used.add(int(di)); matched.append((int(di), act.inchikey.iloc[ai], float(d))); picked += 1
        if picked == K: break
print("matched decoys:", len(matched))
mi = [m[0] for m in matched]
matched_dec = dec.iloc[mi].copy()
matched_dec["matched_active"] = [m[1] for m in matched]
matched_dec["match_distance"] = np.round([m[2] for m in matched], 4)
matched_dec["decoy_set"] = "property_matched"

# ---- random decoy set of the same size (the contrast)
rest = dec.drop(index=mi)
rand = rest.sample(n=min(len(matched_dec), len(rest)), random_state=0).copy()
rand["matched_active"] = None; rand["match_distance"] = np.nan; rand["decoy_set"] = "random"

# ---- assemble
act_out = act.assign(label=1, role="active", source_target="CHEMBL3231", source_target_name="ROCK1 (this target)",
                     decoy_set="n/a", matched_active=None, match_distance=np.nan,
                     max_tanimoto_to_rock1=np.nan, chembl_id=act.chembl_ids)
cols = ["inchikey","std_smiles","chembl_id","label","role","decoy_set","source_target","source_target_name",
        "matched_active","match_distance","max_tanimoto_to_rock1","pActivity",
        "MolWt","MolLogP","TPSA","HBD","HBA","RotB","formal_charge","HeavyAtoms","AromaticRings","RingCount",
        "FractionCSP3","QED","scaffold_smiles"]
dec_out = pd.concat([matched_dec, rand], ignore_index=True).assign(label=0, role="decoy", pActivity=np.nan)
lib = pd.concat([act_out[cols], dec_out[cols]], ignore_index=True)
for c in ["MolWt","MolLogP","TPSA","FractionCSP3","QED","pActivity"]:
    lib[c] = lib[c].astype(float).round(3)
lib = lib.sort_values(["role","decoy_set","inchikey"]).reset_index(drop=True)
lib.to_csv("screening_library.csv", index=False)

# ---- report: property matching quality and a quick similarity-ranking sanity check
summary = dict(n_total=len(lib), n_actives=int(lib.label.sum()),
               n_decoys_matched=int((lib.decoy_set == "property_matched").sum()),
               n_decoys_random=int((lib.decoy_set == "random").sum()),
               decoy_sources=lib[lib.role == "decoy"].source_target_name.value_counts().to_dict(),
               scaffolds=int(lib.scaffold_smiles.nunique()))
for st in ["property_matched", "random"]:
    sub = lib[(lib.role == "decoy") & (lib.decoy_set == st)]
    summary[f"props_{st}"] = {p: [round(sub[p].mean(), 2), round(sub[p].std(), 2)] for p in ["MolWt","MolLogP","TPSA","HBD","HBA","RotB"]}
summary["props_actives"] = {p: [round(lib[lib.label == 1][p].mean(), 2), round(lib[lib.label == 1][p].std(), 2)] for p in ["MolWt","MolLogP","TPSA","HBD","HBA","RotB"]}
json.dump(summary, open("library_summary.json","w"), indent=1, default=str)
print(json.dumps(summary, indent=1, default=str)[:2500])
