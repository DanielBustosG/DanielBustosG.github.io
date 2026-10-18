# Two further frozen datasets: protein families (U21) and the drug–target network (U22)

## `protein_families.csv` / `protein_families.fasta` — 621 real protein sequences in 6 families

**Source.** UniProtKB REST API (`https://rest.uniprot.org/uniprotkb/search`), **reviewed (Swiss-Prot) entries only**,
downloaded **2026-10-18**. Licence **CC BY 4.0** (UniProt Consortium). One query per family, each limited to 120 entries
and then filtered to sequences of 80–1,200 residues:

| `family` label | UniProt query | sequences |
|---|---|---|
| `globin` | `family:"globin family"` | 118 |
| `serine_protease_S1` | `family:"peptidase S1 family"`, human | 118 |
| `lysozyme_C` | `family:"glycosyl hydrolase 22 family"` | 118 |
| `carbonic_anhydrase` | `family:"alpha-carbonic anhydrase family"` | 108 |
| `protein_kinase_AGC` | `family:"AGC Ser/Thr protein kinase family"` | 99 |
| `cytochrome_P450` | `family:"cytochrome P450 family"`, human | 60 |

Columns: `accession`, `entry_name`, `protein_name`, `organism`, `length`, `sequence`,
`uniprot_family_annotation` (UniProt's own family string), `family` (the label above, used as the class and as the
grouping variable). The FASTA headers are `>accession|family|organism protein_name`.

Why these six families: they are unambiguous, well annotated, and span very different sequence lengths and
compositions, so a k-mer classifier trained on them succeeds — and then fails honestly when the split is made by
family rather than at random, which is the point Unit 21 makes. Several families contain many orthologues of the same
protein across species, which is exactly the leakage trap a random split hides.

## `drug_target_edges.csv` / `drug_target_targets.csv` — a real polypharmacology network

**Source.** ChEMBL REST API, release **ChEMBL_37**, downloaded **2026-10-18**, licence **CC BY-SA 3.0**.
Starting set: the 608 best-characterised ROCK1 compounds (the 400 with the most measurements in
`rock1_chembl_curated.csv`, plus every compound in it that carries a name). For each, **all** of its `IC50`/`Ki`/`Kd`
activities with a `pchembl_value` were retrieved — 67,132 records across 1,740 ChEMBL targets — and then restricted to
**human single-protein targets** measured for at least three of these compounds.

`drug_target_edges.csv` (16,047 rows): `molecule_chembl_id`, `target_chembl_id`, `pchembl_median` (median of that
compound's measurements at that target, −log10 M), `n_measurements`.

`drug_target_targets.csv` (479 rows): `target_chembl_id`, `target_name`, `target_type` (all `SINGLE PROTEIN`),
`organism`, `uniprot`, `protein_class` (ChEMBL protein classification where the API returned one; frequently empty,
which Unit 22 treats as a real annotation-coverage problem rather than hiding).

Graph properties as frozen: 602 compounds × 479 targets, **560 of the 602 compounds bind more than one target**
(median degree 5, maximum 386) — genuine measured polypharmacology, not inferred. The busiest targets are ROCK1
(CHEMBL3231, 344 compounds) and ROCK2 (CHEMBL2973, 310), followed by other kinases: the bipartite projection therefore
has real structure, and the ROCK1/ROCK2 selectivity question can be asked of the data directly.

**Selection bias to teach, not to hide:** these compounds were chosen *because* they are ROCK1 ligands, so the network
is a neighbourhood of the ROCK kinases and not a sample of pharmacological space. Degree reflects how much a compound
has been *assayed*, not only how promiscuous it is. Both effects are explicit exercises in Unit 22.

## Integrity

`manifest_extra.json` carries the SHA-256, row and column counts, sources, dates and licences of all four files.
