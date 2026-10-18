import json, time, requests, pandas as pd, io, datetime
S=requests.Session()
# ---------- (a) real protein families from UniProt (reviewed, human+mammals) ----------
FAM = {
 "globin": '(family:"globin family") AND (reviewed:true)',
 "serine_protease_S1": '(family:"peptidase S1 family") AND (reviewed:true) AND (organism_id:9606)',
 "protein_kinase_AGC": '(family:"protein kinase superfamily") AND (family:"AGC Ser/Thr protein kinase family") AND (reviewed:true)',
 "carbonic_anhydrase": '(family:"alpha-carbonic anhydrase family") AND (reviewed:true)',
 "cytochrome_P450": '(family:"cytochrome P450 family") AND (reviewed:true) AND (organism_id:9606)',
 "lysozyme_C": '(family:"glycosyl hydrolase 22 family") AND (reviewed:true)',
}
rows=[]
for fam,q in FAM.items():
    r=S.get("https://rest.uniprot.org/uniprotkb/search",
            params=dict(query=q, format="tsv", size=120,
                        fields="accession,id,protein_name,organism_name,length,sequence,protein_families"), timeout=120)
    r.raise_for_status()
    df=pd.read_csv(io.StringIO(r.text), sep="\t")
    df["family"]=fam
    rows.append(df)
    print(fam, len(df), flush=True)
prot=pd.concat(rows, ignore_index=True)
prot=prot[prot.Sequence.str.len().between(80, 1200)].drop_duplicates("Entry").reset_index(drop=True)
prot.columns=[c.replace(" ","_").lower() for c in prot.columns]
prot=prot.rename(columns={"entry":"accession","entry_name":"entry_name","protein_names":"protein_name",
                          "organism":"organism","length":"length","sequence":"sequence","protein_families":"uniprot_family_annotation"})
prot.to_csv("protein_families.csv", index=False)
with open("protein_families.fasta","w") as fh:
    for t in prot.itertuples(index=False):
        fh.write(f">{t.accession}|{t.family}|{str(t.organism).split('(')[0].strip()} {str(t.protein_name)[:60]}\n")
        for i in range(0,len(t.sequence),60): fh.write(t.sequence[i:i+60]+"\n")
print("proteins", prot.shape, prot.family.value_counts().to_dict(), flush=True)

# ---------- (b) real drug-target bipartite table from ChEMBL ----------
B="https://www.ebi.ac.uk/chembl/api/data/"
def get(path,**p):
    for a in range(4):
        try:
            r=S.get(B+path,params=p,timeout=150,headers={"Accept":"application/json"}); r.raise_for_status(); return r.json()
        except Exception as e: print("retry",a,type(e).__name__,flush=True); time.sleep(5)
    raise RuntimeError(path)
cur=pd.read_csv("rock1_chembl_curated.csv")
# the 400 best-characterised ROCK1 compounds (most measurements), plus every named compound
top=cur.sort_values(["n_measurements","n_assays"],ascending=False).head(400)
named=cur[cur.pref_name.notna()]
sel=pd.concat([top,named]).drop_duplicates("inchikey")
ids=sorted({i for s in sel.chembl_ids for i in str(s).split("|")})
print("compounds queried:", len(ids), flush=True)
acts=[]
for i in range(0,len(ids),25):
    j=get("activity.json", molecule_chembl_id__in=",".join(ids[i:i+25]), limit=1000,
          standard_type__in="IC50,Ki,Kd", pchembl_value__isnull="false",
          only="molecule_chembl_id,target_chembl_id,standard_type,pchembl_value,target_organism,assay_type")
    acts += j["activities"]
    off=1000
    while j["page_meta"].get("next"):
        j=get("activity.json", molecule_chembl_id__in=",".join(ids[i:i+25]), limit=1000, offset=off,
              standard_type__in="IC50,Ki,Kd", pchembl_value__isnull="false",
              only="molecule_chembl_id,target_chembl_id,standard_type,pchembl_value,target_organism,assay_type")
        acts += j["activities"]; off+=1000
    if i % 100 == 0: print("  ", i, len(acts), flush=True)
dt=pd.DataFrame(acts)
dt=dt[dt.target_organism.eq("Homo sapiens") & dt.pchembl_value.notna()]
dt["pchembl_value"]=dt.pchembl_value.astype(float)
edges=(dt.groupby(["molecule_chembl_id","target_chembl_id"], as_index=False)
         .agg(pchembl_median=("pchembl_value","median"), n_measurements=("pchembl_value","size")))
print("edges", len(edges), "compounds", edges.molecule_chembl_id.nunique(), "targets", edges.target_chembl_id.nunique(), flush=True)
# target annotation
tids=sorted(edges.target_chembl_id.unique())
trec=[]
for i in range(0,len(tids),30):
    j=get("target.json", target_chembl_id__in=",".join(tids[i:i+30]), limit=30,
          only="target_chembl_id,pref_name,target_type,organism,target_components")
    for t in j["targets"]:
        comp=(t.get("target_components") or [{}])[0]
        trec.append(dict(target_chembl_id=t["target_chembl_id"], target_name=t.get("pref_name"),
                         target_type=t.get("target_type"), organism=t.get("organism"),
                         uniprot=comp.get("accession"),
                         protein_class=";".join(sorted({c.get("l3") or c.get("l2") or "" for c in (comp.get("target_component_classifications") or [])}) ) or None))
targets=pd.DataFrame(trec)
edges.to_csv("drug_target_edges.csv", index=False)
targets.to_csv("drug_target_targets.csv", index=False)
deg=edges.groupby("molecule_chembl_id").size()
print("degree distribution:", deg.describe().round(2).to_dict(), flush=True)
print("multi-target compounds:", int((deg>1).sum()), "of", len(deg), flush=True)
print("target types:", targets.target_type.value_counts().head(6).to_dict(), flush=True)
