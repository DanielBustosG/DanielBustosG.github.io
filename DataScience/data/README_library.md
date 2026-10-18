# Screening library — ligand-based virtual-screening analytics (Unit 19)

A frozen, ranked-list benchmark: ROCK1 actives mixed with decoys, so that a student can build several
**ligand-based** rankings inside the notebook (maximum Tanimoto similarity to a reference set, fingerprint k-NN,
a QSAR probability, a descriptor-distance score), evaluate them with early-recognition metrics, and measure how much
the *design of the decoy set* changes the answer. No docking and no protein structure is involved: the course teaches
the analytics of a ranked list, while the structure-based programs themselves are taught in the bioinformatics course.

**Source.** ChEMBL REST API (EMBL-EBI), release **ChEMBL_37** (2026-05-01), downloaded **2026-10-18**.
Licence **CC BY-SA 3.0**. Tools: RDKit 2026.03.4, pandas 3.0.3, SciPy (`cKDTree`). Build script: `build_library.py`
(seed `numpy.random.default_rng(0)`, `random_state=0` throughout).

## `screening_library.csv` — 12,018 rows × 25 columns

| group | rows | definition |
|---|---|---|
| actives (`label = 1`) | 1,327 | ROCK1 compounds from `rock1_chembl_curated.csv` with an exact measurement, pActivity ≥ 6.5 and 15–50 heavy atoms |
| property-matched decoys (`decoy_set = property_matched`) | 6,923 | nearest neighbours of the actives in standardised (MolWt, cLogP, TPSA, HBD, HBA, RotB, formal charge) space, 10 per active without replacement (the pool ran out at 6,923) |
| random decoys (`decoy_set = random`) | 3,768 | drawn uniformly from the remaining candidate pool with `random_state=0` |

Decoy candidate pool: 12,574 molecules with measured IC50/Ki at eight unrelated, **non-kinase** targets — thrombin
(CHEMBL204), hERG (CHEMBL240), MAO-B (CHEMBL2039), 5-HT6 (CHEMBL3371), 5-HT1A (CHEMBL214), µ-opioid (CHEMBL233),
HDAC2 (CHEMBL1937) and dopamine D2 (CHEMBL217). Filtering: RDKit standardisation (normalise → largest fragment →
uncharge) → 15–50 heavy atoms (12,132) → **not** present in the ROCK1 activity table and **maximum Tanimoto similarity
(Morgan radius 2, 2,048 bits) to any of the 4,280 ROCK1 ligands below 0.35** (10,691 candidates) → matching.

| column | meaning |
|---|---|
| `inchikey`, `std_smiles`, `chembl_id` | standardised structure and provenance |
| `label`, `role` | 1 / `active` vs 0 / `decoy` — the ground truth of the benchmark |
| `decoy_set` | `property_matched`, `random`, or `n/a` for actives |
| `source_target`, `source_target_name` | where a decoy's measured activity comes from (`CHEMBL3231` / ROCK1 for actives) |
| `matched_active`, `match_distance` | for matched decoys: the active it was matched to and the Euclidean distance in standardised property space |
| `max_tanimoto_to_rock1` | similarity of a decoy to the closest known ROCK1 ligand (all < 0.35 by construction) |
| `pActivity` | −log10(M) for actives; empty for decoys |
| `MolWt`, `MolLogP`, `TPSA`, `HBD`, `HBA`, `RotB`, `formal_charge`, `HeavyAtoms`, `AromaticRings`, `RingCount`, `FractionCSP3`, `QED` | RDKit properties (the matching variables plus extras) |
| `scaffold_smiles` | Bemis–Murcko generic scaffold (4,791 distinct scaffolds in the library) |

## Why two decoy sets

Property matching makes the benchmark harder and more honest. Means ± sd of the matching variables:

| | MolWt | cLogP | TPSA | HBD | HBA | RotB |
|---|---|---|---|---|---|---|
| actives | 379 ± 68 | 3.44 ± 1.01 | 84.7 ± 21.9 | 2.34 ± 0.86 | 4.64 ± 1.42 | 5.06 ± 2.00 |
| matched decoys | 405 ± 85 | 3.41 ± 1.19 | 80.3 ± 32.0 | 1.94 ± 1.18 | 4.61 ± 1.56 | 5.51 ± 2.60 |
| random decoys | 413 ± 116 | 3.90 ± 1.86 | 60.5 ± 56.8 | 1.13 ± 1.96 | 3.95 ± 2.09 | 6.17 ± 3.94 |

Reference numbers computed when freezing the file (a maximum-Tanimoto ranking against 25 randomly chosen reference
actives, those 25 removed from the evaluation): ROC-AUC **0.917** and EF1% **6.3** against matched decoys versus
**0.943** and **3.9** against random decoys. A random forest trained on the **properties alone** reaches a 5-fold
ROC-AUC of **0.979** on the matched set and **0.999** on the random set — the artificial-enrichment diagnostic that
Unit 19 asks students to run and interpret: even a carefully matched decoy set retains separable composition, so a
benchmark AUC is never evidence that a model learnt the pharmacology.

The active fraction in this file (11 %) is far above a real screening library (0.01–1 %). Unit 19 subsamples actives
to simulate realistic prevalence and shows what that does to enrichment factors and to the expected hit rate.

## Integrity

`manifest_library.json` carries the SHA-256, row and column counts, the decoy-pool targets, the tool versions and the
sanity numbers quoted above.
