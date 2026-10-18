# ROCK1 bioactivity snapshot — the running dataset of the course

**Target.** Rho-associated protein kinase 1 (ROCK1), ChEMBL target `CHEMBL3231`, UniProt `Q13464`, *Homo sapiens*.
ROCK1 is a serine/threonine kinase downstream of RhoA; its inhibitors (fasudil, Y-27632, ripasudil, belumosudil…) are
studied for glaucoma, fibrosis, cardiovascular and neurodegenerative indications. It is one of the laboratory's own
targets, which is why it threads Blocks B–D of the course.

**Source.** ChEMBL REST API (EMBL-EBI), release **ChEMBL_37** (release date 2026-05-01), downloaded **2026-10-18**.

Query (paged 1,000 records at a time):

```
https://www.ebi.ac.uk/chembl/api/data/activity.json?target_chembl_id=CHEMBL3231&standard_type__in=IC50,Ki,Kd
```

Molecule names, `max_phase` and `molecule_type` were added from
`https://www.ebi.ac.uk/chembl/api/data/molecule.json?molecule_chembl_id__in=…` (40 ids per request).

**Licence.** ChEMBL data are distributed under **CC BY-SA 3.0**; cite Zdrazil B *et al.* The ChEMBL Database in 2023.
*Nucleic Acids Res.* 2024;52(D1):D1180–D1192. doi:10.1093/nar/gkad1004.

**Tool versions.** Python 3.11, pandas 3.0.3, RDKit 2026.03.4 (conda environment `p2x3-chem`).

---

## `rock1_chembl_raw.csv` — 5,089 rows × 25 columns (4.4 MB)

Activity records **exactly as the API delivered them**: nothing was cleaned, converted, deduplicated or filtered.
This is the file units U3–U6 work on. Its defects are the lesson:

- Two measurement vocabularies: the *reported* values (`type`, `relation`, `value`, `units` — 3,446 nM, 470 µM, 2 nmol/L and
  a handful of exotic strings such as `10'-8M`, `10^-10M`) and the ChEMBL-*standardised* ones (`standard_type`,
  `standard_relation`, `standard_value`, `standard_units` — all nM).
- Censored values: `standard_relation` is `=` in 3,336 rows, `>` in 1,410, `<` in 312, `<=` in 5 and missing in 26.
- Three measurement types mixed: IC50 (3,262), Ki (1,480), Kd (347) — comparable only with care.
- 78 rows duplicated on (molecule, type, value, assay); `potential_duplicate` flags ChEMBL's own suspicion.
- 13 rows carry `data_validity_comment = "Outside typical range"`; 3 rows have no structure; 26 have no `standard_value`.
- 276 assays from 225 documents, several reporting the same compound.

| column | meaning |
|---|---|
| `activity_id` | ChEMBL activity primary key |
| `molecule_chembl_id`, `canonical_smiles` | compound identifier and structure as deposited |
| `type`, `relation`, `value`, `units` | the measurement **as reported in the paper** (uncurated) |
| `standard_type`, `standard_relation`, `standard_value`, `standard_units` | ChEMBL's standardised measurement |
| `pchembl_value` | ChEMBL's −log10(molar) value, missing for censored rows |
| `assay_chembl_id`, `assay_type`, `assay_description`, `bao_label` | assay identity, type (B = binding, F = functional) and description |
| `document_chembl_id` | source publication |
| `target_chembl_id`, `target_organism` | target identity (filter: human) |
| `data_validity_comment`, `activity_comment`, `potential_duplicate` | ChEMBL quality flags |
| `pref_name`, `max_phase`, `molecule_type` | compound name and clinical phase (538 named rows, 433 with phase > 0) |

## `rock1_chembl_curated.csv` — 4,280 rows × 33 columns (1.0 MB)

The **reference curated table**: one row per standardised parent structure (InChIKey). It is the answer key for the
curation exercises of U4/U6 and the modelling table of U7–U17, U19, U23, U26 and U27.

Protocol (deterministic; the per-step counts are in `rock1_curation_log.csv`):

1. raw records (5,089) → 2. drop rows without a structure (5,086) → 3. human target only (5,086) →
4. drop `data_validity_comment` flags (5,073) → 5. drop rows without a numeric `standard_value` (5,047) →
6. harmonise units to nM — nM/µM/mM/M/pM/fM/nmol/L/µmol/L convertible, others dropped (5,047; the standardised column is
already nM, the conversion matters for the *reported* column students harmonise themselves) →
7. drop non-positive or absurd values, ≤ 0 or > 10⁸ nM (5,047) → 8. RDKit standardisation — `Normalizer`,
`LargestFragmentChooser`, `Uncharger`, canonical SMILES, InChIKey (5,047) → 9. keep 3 ≤ heavy atoms ≤ 70 (5,045
measurements, 4,290 molecule ids) → 10. aggregate replicate measurements per InChIKey (**4,280 compounds**).

Aggregation: the median of the **exact** (`=`) measurements when a compound has any; compounds whose measurements are all
censored keep the median of the censored values and are marked `censored = True` (1,516 compounds; 2,764 have at least one
exact value). Censored rows are **kept on purpose** — excluding them silently is one of the field's standard errors.

| column | meaning |
|---|---|
| `inchikey`, `std_smiles` | standardised parent structure (the row key) |
| `chembl_ids` | all ChEMBL molecule ids collapsed into this parent, `|`-separated |
| `pref_name`, `max_phase` | name and highest clinical phase (297 named compounds, 248 with phase > 0) |
| `pActivity` | −log10(activity in M) — the regression target (median over exact measurements) |
| `pActivity_sd`, `pActivity_min`, `pActivity_max`, `pActivity_range`, `wide_spread` | replicate spread; `wide_spread` = range > 1 log unit (60 compounds) |
| `relation`, `censored` | `=` for compounds with exact data; `censored = True` when every measurement is `>` or `<` |
| `n_measurements`, `n_exact`, `n_censored`, `n_IC50`, `n_Ki`, `n_Kd`, `n_assays`, `n_documents` | provenance counts (492 compounds have more than one measurement) |
| `MolWt`, `MolLogP`, `TPSA`, `HBD`, `HBA`, `RotB`, `AromaticRings`, `RingCount`, `HeavyAtoms`, `FractionCSP3`, `QED` | RDKit descriptors |
| `scaffold_smiles` | Bemis–Murcko generic scaffold (2,005 distinct scaffolds, 1,453 of them singletons — the basis of the scaffold split in U12) |

Summary of the exact-value subset (2,764 compounds): pActivity mean 6.51, sd 1.11, range 3.57–9.82, median 6.44.
Class balance: pActivity ≥ 6.0 → 1,898 active / 866 inactive; ≥ 6.5 → 1,339 / 1,425; ≥ 7.0 → 914 / 1,850.

Fingerprints are **not** stored: notebooks compute Morgan fingerprints (radius 2, 2,048 bits) from `std_smiles` with RDKit.

## `rock1_curation_log.csv` — 10 rows

`step`, `description`, `n_rows`, `n_molecules`, `note` for each protocol step above.

## Integrity

`manifest_rock1.json` carries the SHA-256, row and column counts of each file, the ChEMBL release, the query, the
download date and the summary statistics quoted here.
