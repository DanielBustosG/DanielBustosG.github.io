"""Reference curation protocol for the ROCK1 ChEMBL snapshot (answer key for units U4/U6,
modelling table for U7-U17, U19, U23, U26, U27). Deterministic; RDKit standardisation."""
import json, hashlib, datetime, numpy as np, pandas as pd
from rdkit import Chem, RDLogger
from rdkit.Chem import Descriptors, Crippen, QED, rdMolDescriptors
from rdkit.Chem.Scaffolds import MurckoScaffold
from rdkit.Chem.MolStandardize import rdMolStandardize
RDLogger.DisableLog("rdApp.*")

raw = pd.read_csv("rock1_chembl_raw.csv")
log = []
def step(name, df, note=""):
    log.append(dict(step=len(log)+1, description=name, n_rows=len(df),
                    n_molecules=df.molecule_chembl_id.nunique(), note=note))
    print(f"{len(log):2d}. {name:<62s} rows={len(df):5d} mols={df.molecule_chembl_id.nunique():5d}", flush=True)
    return df

df = step("raw records as delivered by the ChEMBL API", raw)
df = step("drop rows without a structure (canonical_smiles)", df[df.canonical_smiles.notna()].copy())
df = step("human target only (target_organism == 'Homo sapiens')", df[df.target_organism.eq("Homo sapiens")].copy())
flagged = df.data_validity_comment.notna()
df = step("drop ChEMBL data_validity_comment flags", df[~flagged].copy(),
          note="; ".join(f"{k}: {v}" for k, v in df.loc[flagged.values, "data_validity_comment"].value_counts().items()))
df = step("drop rows without a numeric standard_value", df[df.standard_value.notna()].copy())
# unit harmonisation to nM
CONV = {"nM":1.0, "uM":1e3, "µM":1e3, "mM":1e6, "M":1e9, "pM":1e-3, "fM":1e-6, "nmol/L":1.0, "umol/L":1e3}
df["value_nM"] = df.standard_units.map(CONV) * df.standard_value
bad_units = df.value_nM.isna()
df = step("harmonise units to nM (drop non-convertible units)", df[~bad_units].copy(),
          note="dropped units: " + json.dumps(df.loc[bad_units, "standard_units"].value_counts().to_dict()))
df = step("drop non-positive or absurd values (<=0 or >1e8 nM)", df[(df.value_nM > 0) & (df.value_nM <= 1e8)].copy())
df["pActivity_raw"] = -np.log10(df.value_nM * 1e-9)

# structure standardisation
norm = rdMolStandardize.Normalizer(); unch = rdMolStandardize.Uncharger()
lfc = rdMolStandardize.LargestFragmentChooser()
def standardise(smi):
    m = Chem.MolFromSmiles(smi)
    if m is None: return None, None
    try:
        m = lfc.choose(norm.normalize(m)); m = unch.uncharge(m); Chem.SanitizeMol(m)
    except Exception:
        return None, None
    return Chem.MolToSmiles(m), Chem.MolToInchiKey(m)
uniq = {s: standardise(s) for s in df.canonical_smiles.unique()}
df["std_smiles"] = df.canonical_smiles.map(lambda s: uniq[s][0])
df["inchikey"]   = df.canonical_smiles.map(lambda s: uniq[s][1])
df = step("RDKit standardisation (normalise, largest fragment, uncharge) + InChIKey", df[df.inchikey.notna()].copy())
df = step("keep small organic molecules (3 <= heavy atoms <= 70)",
          df[df.std_smiles.map(lambda s: 3 <= Chem.MolFromSmiles(s).GetNumHeavyAtoms() <= 70)].copy())
df["censored"] = ~df.standard_relation.fillna("=").eq("=")
measurements = df.copy()

# compound-level aggregation
def agg(g):
    ex = g[~g.censored]
    base = dict(
        chembl_ids="|".join(sorted(g.molecule_chembl_id.unique())),
        pref_name=next((x for x in g.pref_name.dropna()), None),
        max_phase=g.max_phase.max(),
        std_smiles=g.std_smiles.iloc[0],
        n_measurements=len(g), n_exact=len(ex), n_censored=int(g.censored.sum()),
        n_IC50=int((g.standard_type == "IC50").sum()), n_Ki=int((g.standard_type == "Ki").sum()),
        n_Kd=int((g.standard_type == "Kd").sum()), n_assays=g.assay_chembl_id.nunique(),
        n_documents=g.document_chembl_id.nunique(),
        relation="=" if len(ex) else ("|".join(sorted(g.standard_relation.dropna().unique())) or ">"),
        censored=len(ex) == 0)
    src = ex if len(ex) else g
    base.update(pActivity=src.pActivity_raw.median(),
                pActivity_sd=src.pActivity_raw.std(ddof=1) if len(src) > 1 else np.nan,
                pActivity_min=src.pActivity_raw.min(), pActivity_max=src.pActivity_raw.max())
    base["pActivity_range"] = base["pActivity_max"] - base["pActivity_min"]
    base["wide_spread"] = bool(base["pActivity_range"] > 1.0)
    return pd.Series(base)
comp = measurements.groupby("inchikey", sort=True).apply(agg, include_groups=False).reset_index()
comp = step("aggregate replicate measurements per standardised InChIKey (median)",
            comp.assign(molecule_chembl_id=comp.chembl_ids), note="compound level")
comp = comp.drop(columns="molecule_chembl_id")

# descriptors
def desc(smi):
    m = Chem.MolFromSmiles(smi)
    return pd.Series(dict(
        MolWt=Descriptors.MolWt(m), MolLogP=Crippen.MolLogP(m), TPSA=rdMolDescriptors.CalcTPSA(m),
        HBD=rdMolDescriptors.CalcNumHBD(m), HBA=rdMolDescriptors.CalcNumHBA(m),
        RotB=rdMolDescriptors.CalcNumRotatableBonds(m), AromaticRings=rdMolDescriptors.CalcNumAromaticRings(m),
        HeavyAtoms=m.GetNumHeavyAtoms(), FractionCSP3=rdMolDescriptors.CalcFractionCSP3(m),
        RingCount=rdMolDescriptors.CalcNumRings(m), QED=QED.qed(m),
        scaffold_smiles=MurckoScaffold.MurckoScaffoldSmiles(mol=MurckoScaffold.GetScaffoldForMol(m), includeChirality=False)))
comp = pd.concat([comp, comp.std_smiles.apply(desc)], axis=1)
comp["pActivity"] = comp.pActivity.round(3)
for c in ["pActivity_sd","pActivity_min","pActivity_max","pActivity_range","MolWt","MolLogP","TPSA","FractionCSP3","QED"]:
    comp[c] = comp[c].astype(float).round(3)
cols = ["inchikey","std_smiles","chembl_ids","pref_name","max_phase","pActivity","pActivity_sd","pActivity_min",
        "pActivity_max","pActivity_range","wide_spread","relation","censored","n_measurements","n_exact","n_censored",
        "n_IC50","n_Ki","n_Kd","n_assays","n_documents","MolWt","MolLogP","TPSA","HBD","HBA","RotB","AromaticRings",
        "RingCount","HeavyAtoms","FractionCSP3","QED","scaffold_smiles"]
comp = comp[cols].sort_values("inchikey").reset_index(drop=True)
comp.to_csv("rock1_chembl_curated.csv", index=False)
pd.DataFrame(log).to_csv("rock1_curation_log.csv", index=False)

ex = comp[~comp.censored]
summary = dict(
    raw_rows=len(raw), measurements_after_curation=len(measurements), compounds=len(comp),
    compounds_exact=int((~comp.censored).sum()), compounds_censored_only=int(comp.censored.sum()),
    pActivity=dict(ex.pActivity.describe().round(3)),
    scaffolds=int(comp.scaffold_smiles.nunique()),
    singleton_scaffolds=int((comp.scaffold_smiles.value_counts() == 1).sum()),
    class_balance={f"pAct>={t}": dict(active=int((ex.pActivity >= t).sum()), inactive=int((ex.pActivity < t).sum()))
                   for t in (6.0, 6.5, 7.0)},
    wide_spread_compounds=int(comp.wide_spread.sum()),
    multi_measurement=int((comp.n_measurements > 1).sum()),
    named=int(comp.pref_name.notna().sum()), max_phase_gt0=int((comp.max_phase.fillna(0) > 0).sum()))
json.dump(summary, open("curation_summary.json","w"), indent=1, default=str)
print(json.dumps(summary, indent=1, default=str))
