# GEO periodontitis gene-expression dataset (U21 — Omics data)

**Frozen on:** 2026-10-18 · **Course:** Data Science for Computational Drug Discovery and Biomedical Research (LBQC, UCM)
**Series:** [GSE16134](https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSE16134) — *Bacterial Correlates of Gingival Gene Expression* (Demmer, Papapanou, Pavlidis; submitted May 15 2009, last update Mar 25 2019)
**Platform:** GPL570, Affymetrix Human Genome U133 Plus 2.0 Array (54,675 probe sets); annotation file `GPL570.annot.gz` dated Aug 09 2016 (Entrez Gene symbols / IDs).
**Tools:** Python 3.11.15, pandas 2.3.3, numpy 2.4.6, scipy 1.17.1. Input SHA-256: series matrix `002e389f5635d9f4de92a93f8b65ded5b2c4baabb4f613222ce8896e24c75b97`, annotation `d7cd44352127b1e34f3a720ebea86093ef255a38f1612a85a2962b71bde8f394`.

## Original study and citations
120 patients undergoing periodontal surgery each contributed 2–4 interproximal gingival papillae from maxillary posterior teeth (310 arrays in total): *diseased* sites (bleeding on probing + interproximal PPD > 3 mm + CAL > 2 mm) and, in a subset of patients, one clinically *healthy* site (no BoP, PPD < 5 mm, CAL < 3 mm, as stated in GEO). Subgingival plaque was sampled before harvesting. Full design: 241 diseased + 69 healthy samples; 69 patients have one healthy and ≥1 diseased site, 51 patients have diseased sites only.

- Papapanou PN, Behle JH, Kebschull M, Celenti R, Wolf DL, Handfield M, Pavlidis P, Demmer RT. *Subgingival bacterial colonization profiles correlate with gingival tissue gene expression.* **BMC Microbiol** 2009;9:221. doi:[10.1186/1471-2180-9-221](https://doi.org/10.1186/1471-2180-9-221) (PMID 19835625 — primary GSE16134 paper).
- Kebschull M, Demmer RT, Grün B, Guarnieri P, Pavlidis P, Papapanou PN. *Gingival tissue transcriptomes identify distinct periodontitis phenotypes.* **J Dent Res** 2014;93(5):459–468. doi:[10.1177/0022034514527288](https://doi.org/10.1177/0022034514527288) (PMID 24646639).
- Demmer RT, Behle JH, Wolf DL, Handfield M, Kebschull M, Celenti R, Pavlidis P, Papapanou PN. *Transcriptomes in healthy and diseased gingival tissues.* **J Periodontol** 2008;79(11):2112–2124. doi:[10.1902/jop.2008.080139](https://doi.org/10.1902/jop.2008.080139) (first 90 patients, GSE10334; GSE16134 extends that cohort).

DOIs were verified against api.crossref.org and NCBI E-utilities on 2026-10-18. Note: the DOI 10.1111/j.1600-051X.2008.01249.x sometimes quoted for Demmer 2008 resolves to a different article (Nesse et al., PISA, J Clin Periodontol 2008) and is **not** used here.

## Processing (as stated in GEO) and what was done here
- GEO: "All CEL files in the series were processed using RMA in R using justRMA with default parameters." Values are therefore **log2 RMA intensities** (full matrix range 2.33–14.48). No further normalisation or transformation was applied.
- Probe → gene: probes with no Entrez symbol or mapping to several genes (`///`) were dropped (54,675 → 42,904 probes, 20,848 symbols). For each symbol the probe with the **highest mean expression across all 310 arrays** was kept.
- Gene filter: the **5,000 genes with the highest variance across all 310 arrays** were retained (variance 0.220–15.25).
- Sample subset (balanced, paired): every patient with a healthy site (69 patients) contributes its healthy sample and its **first** diseased sample (lowest "Sample n" index in the GEO title). All 69 patients with a healthy site have exactly one, so the subset is 69 complete pairs = **138 samples (69 diseased / 69 healthy)**. Diseased-only patients (51) were excluded; no further truncation. Patient ids are kept so paired analyses are possible.
- Values rounded to 4 decimals.

## Files and column dictionary
### `geo_periodontitis_expr.csv` (5,000 genes × 138 samples, 4.8 MB)
Row index `symbol` (Entrez gene symbol); columns are `sample_id` values (`P###_D` diseased, `P###_H` healthy); cells are log2 RMA expression.

### `geo_periodontitis_meta.csv` (138 rows)
| column | meaning |
|---|---|
| sample_id | `P<patient>_D` / `P<patient>_H`; matches expression columns |
| geo_accession | GSM id |
| patient_id | `P001`…`P120` (GEO patient number, zero-padded) |
| status | `diseased` / `healthy` (site phenotype) |
| sample_in_patient | "Sample n" index in the GEO sample title |
| site_label | GEO wording: Affected / Unaffected |
| paired | True for all rows (patient has both site types) |
| subset_rule | `paired_patient` |
| tissue | Gingival |
| phenotype_definition | clinical definition string from `characteristics_ch1` |
| title | original GEO sample title |

No sex, age, tooth-type or smoking fields are provided in the GSE16134 series matrix (only tissue and phenotype); these covariates are not available here.

### `geo_periodontitis_genes.csv` (5,000 rows)
`symbol`, `entrez_id`, `probe_id` (Affymetrix probe set used), `mean`, `variance` (on the 138-sample subset), `mean_full310`, `variance_full310` (on all 310 arrays; variance_full310 was the selection criterion).

### `genesets_kegg_2021.gmt` (259 sets) and `genesets_gobp_2023.gmt` (1,458 sets)
Enrichr libraries `KEGG_2021_Human` (320 sets) and `GO_Biological_Process_2023` (5,407 sets), downloaded 2026-10-18 from maayanlab.cloud, intersected with the 5,000 matrix genes, keeping sets with 10–500 members. Standard GMT: name, description, genes.

## Sanity check (not for publication)
Paired t-test diseased vs healthy on the 69 pairs: 3766 / 5,000 genes at BH-FDR < 0.05 (unpaired Welch-free t-test: 3420). PC1 explains 27.4% of variance and separates diseased from healthy sites. Top up-regulated genes by mean log2FC: IGHD, IGHM, LOC100293211, BMS1P20, IGLL5, IGLJ3, TNFRSF17, IGK, POU2AF1, MLIP — immunoglobulin / plasma-cell genes, as expected for periodontitis tissue.

## Licence / terms
GEO data are freely available without restriction (NCBI policy; public domain for US-government hosted data, original authors retain attribution via the citations above). Enrichr libraries are free for academic/non-commercial use; KEGG pathway names originate from KEGG. The derived files here are distributed for teaching under the course licence (CC BY 4.0 for course text; data terms as above).
