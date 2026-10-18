# README — md_trpcage: replica molecular-dynamics observables (unit U20)

**Course:** Data Science for Computational Drug Discovery and Biomedical Research (LBQC, Universidad Católica del Maule).
**Generated:** 2026-10-18 on a 12-core Apple-silicon Mac (CPU platform, 3 OpenMM threads per run, two runs concurrently).
**Licence:** CC BY 4.0 for the simulated data and tables. Starting coordinates: RCSB PDB **1L2Y** (Trp-cage miniprotein TC5b, NMR, model 1), public domain under the wwPDB policy.

These are *real* simulations (not synthetic numbers): six independent 1 ns NPT trajectories of Trp-cage in explicit water,
two temperatures × three replicas. They are deliberately short so that the autocorrelation, convergence and
"replicas disagree" lessons of U20 are visible in the data.

## 1. System preparation
| Item | Value |
|---|---|
| Starting structure | PDB 1L2Y, model 1 only (20 residues NLYIQWLKDGGPSSGRPPPS) |
| Preparation | PDBFixer 1.12.0: missing atoms added, hydrogens at pH 7.0 (net charge +1) |
| Force field | AMBER ff14SB (`amber14-all.xml`) + TIP3P-FB water (`amber14/tip3pfb.xml`) |
| Box | cubic, 1.0 nm padding → edge 3.7498 nm after solvation |
| Solvent / ions | 1499 waters, 4 Na⁺, 5 Cl⁻ (0.15 M NaCl + neutralisation) |
| Total atoms | 4810 (304 protein atoms) |
| Non-bonded | PME, 1.0 nm real-space cutoff; HBonds constrained; rigid water |
| Minimisation | L-BFGS to 10 kJ mol⁻¹ nm⁻¹ (E: −16,003 → −91,686 kJ/mol). **The minimised structure is the RMSD reference** (`md_trpcage_protein.pdb`). |

## 2. Simulation protocol (identical for the six runs; only temperature and seed change)
| Stage | Ensemble | Length | Details |
|---|---|---|---|
| NVT equilibration | NVT | 50 ps | LangevinMiddleIntegrator, γ = 1 ps⁻¹, 2 fs; velocities drawn at target T with the replica seed |
| NPT equilibration | NPT | 100 ps | + MonteCarloBarostat 1 bar, attempt every 25 steps (barostat seed = replica seed; integrator seed = seed+1000) |
| Production | NPT | 1.0 ns | same integrator/barostat; frames and state every 1,000 steps (2 ps); checkpoint every 100 ps |

Conditions and seeds (seed = integrator seed in NVT, barostat seed in NPT/production; integrator seed in NPT/production = seed + 1000):

| run | seed | T (K) | production wall-clock (min) | ns/day (3 threads) |
|---|---|---|---|---|
| A1 | 101 | 300 | 49.0 | 29.4 |
| A2 | 102 | 300 | 49.4 | 29.2 |
| A3 | 103 | 300 | 55.9 | 25.8 |
| B1 | 201 | 340 | 49.3 | 29.2 |
| B2 | 202 | 340 | 49.6 | 29.0 |
| B3 | 203 | 340 | 56.4 | 25.5 |

Total wall-clock for the six runs including equilibration: 2 h 57 min (10:16 → 13:12 local), two runs at a time with
`OPENMM_CPU_THREADS=3` each. A single run with 6 threads reached 49.0 ns/day in a 20 ps test; two concurrent 3-thread
runs give 29.2 ns/day each (58.4 aggregate), which is why the paired layout was chosen.
Condition B (340 K) is a mild destabilising temperature: Trp-cage melts (Tm ≈ 315 K experimentally) on the microsecond
scale, so at 1 ns one expects **larger fluctuations but not unfolding** — exactly the "is the effect real or is it replica noise?" situation U20 is about.

Software: Python 3.11.17, OpenMM 8.6.1, PDBFixer 1.12.0, MDTraj 1.11.1, MDAnalysis 2.10.0 (installed, not required), NumPy 2.4.6, pandas 2.3.3, SciPy 1.17.1.
Scripts: `prep.py`, `run_md.py`, `analyze.py`, `stats.py` (kept alongside this README in `scripts_md/`).

## 3. Files
| file | content | shape |
|---|---|---|
| `md_trpcage_observables.csv` | tidy per-frame table, 6 runs × 500 frames | (3000, 11) |
| `md_trpcage_rmsf.csv` | per-residue Cα RMSF per run | (120, 5) |
| `md_trpcage_ca_coords.npz` | Cα coordinates of all six runs at 2 ps, float32, superposed on the reference Cα | keys A1,A2,A3,B1,B2,B3 (500,20,3) + time_ps, ca_resSeq, ca_resname, ref_ca (20,3) |
| `md_trpcage_strideA1.xtc` | protein-only trajectory of run A1, every 10 ps (frames at 10…1000 ps), superposed on reference | 100 frames × 304 atoms |
| `md_trpcage_protein.pdb` | protein topology/reference (minimised structure) for the xtc and the npz | 304 atoms, 20 residues |
| `md_trpcage_replica_summary.csv` | per-run means, SD, block SE, τ_int, n_eff | (6, 19) |
| `md_trpcage_condition_summary.csv` | per-condition mean ± SE (n = 3 replicas) and Welch t-test | (8, 7) |
| `manifest_md.json` | SHA-256, sizes and shapes of all of the above | — |

## 4. Column dictionary — `md_trpcage_observables.csv`
| column | type | definition |
|---|---|---|
| `condition` | str | `A` = 300 K, `B` = 340 K |
| `replica` | int | 1–3; independent seeds (A: 101–103, B: 201–203) |
| `time_ps` | float | production time, 2 … 1000 ps in 2 ps steps (the 150 ps equilibration is not included) |
| `rmsd_ca_nm` | float | Cα RMSD (nm) to the minimised starting structure after optimal Cα superposition (`mdtraj.rmsd`) |
| `rg_nm` | float | radius of gyration of the 20 Cα atoms (nm), mass-weighted (`mdtraj.compute_rg`) |
| `n_hbonds` | int | number of backbone N–H···O=C hydrogen bonds in the frame; geometric criterion applied to **all** 274 backbone donor/acceptor pairs with \|i−j\| ≥ 2: d(H···O) < 0.25 nm and ∠N–H···O > 120° (the Baker–Hubbard geometry, evaluated per frame, so the pair set is identical for every run) |
| `helix_fraction` | float | fraction of residues 2–8 (the α-helix of Trp-cage) assigned `H` by DSSP (MDTraj simplified DSSP, H/E/C) |
| `dist_W6_P12_nm` | float | distance (nm) between the centroid of the Trp6 indole ring (CG, CD1, CD2, NE1, CE2, CE3, CZ2, CZ3, CH2) and the centroid of the Pro12 pyrrolidine side chain (CB, CG, CD) — the defining hydrophobic contact of the "cage" |
| `potential_energy_kJ_mol` | float | total potential energy of the whole system (OpenMM StateDataReporter) |
| `temperature_K` | float | instantaneous kinetic temperature |
| `box_volume_nm3` | float | periodic box volume (NPT) |

`md_trpcage_rmsf.csv`: `condition`, `replica`, `residue` (1–20), `resname`, `rmsf_nm` = root-mean-square fluctuation of each Cα
around the **replica's own mean structure** after iterative superposition on that mean (not relative to the reference).

`md_trpcage_ca_coords.npz`: `np.load(...)['A1']` → array (500, 20, 3) in nm, frames at `time_ps`; all runs are superposed on
`ref_ca` (minimised structure Cα), so arrays can be concatenated directly for PCA/tICA across replicas.

## 5. Results summary (what the lead/students should expect to see)
Per run (means over the 500 production frames; τ_int = integrated autocorrelation time of the Cα RMSD, summed to the first zero crossing of the ACF; n_eff = 1000 ps / (2 τ_int); rmsf_mean = mean Cα RMSF over the 20 residues):

| condition | replica | rmsd_mean | rmsd_sd | rg_mean | hbonds_mean | helix_mean | dW6P12_mean | T_mean | vol_mean | tau_int_rmsd_ps | n_eff_rmsd | rmsf_mean |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| A | 1 | 0.1098 | 0.01546 | 0.6919 | 9.508 | 0.946 | 0.5957 | 300.9 | 47.75 | 138 | 3.624 | 0.0716 |
| A | 2 | 0.1595 | 0.01097 | 0.6859 | 8.948 | 0.8554 | 0.6131 | 300.3 | 47.76 | 36.17 | 13.82 | 0.0525 |
| A | 3 | 0.2515 | 0.02118 | 0.6952 | 7.642 | 0.8451 | 0.5866 | 300.1 | 47.78 | 43.53 | 11.48 | 0.0543 |
| B | 1 | 0.1211 | 0.01375 | 0.6899 | 9.006 | 0.9583 | 0.5943 | 340.3 | 48.82 | 36.44 | 13.72 | 0.0603 |
| B | 2 | 0.1885 | 0.03335 | 0.6848 | 8.71 | 0.8334 | 0.5962 | 340.3 | 48.86 | 170.8 | 2.927 | 0.0697 |
| B | 3 | 0.1504 | 0.03372 | 0.696 | 9.444 | 0.9606 | 0.5498 | 340.1 | 48.84 | 130.2 | 3.84 | 0.0928 |

Per condition (mean ± SE over the 3 replica means; Welch t-test with n = 3 vs 3):

| observable | A_mean | A_se | B_mean | B_se | welch_t | p |
|---|---|---|---|---|---|---|
| rmsd_mean | 0.1736 | 0.0415 | 0.1533 | 0.0195 | 0.4427 | 0.6895 |
| rg_mean | 0.691 | 0.002723 | 0.6903 | 0.003259 | 0.1669 | 0.8758 |
| hbonds_mean | 8.699 | 0.5528 | 9.053 | 0.2132 | -0.5975 | 0.5985 |
| helix_mean | 0.8822 | 0.03204 | 0.9174 | 0.04201 | -0.667 | 0.5437 |
| dW6P12_mean | 0.5985 | 0.007779 | 0.5801 | 0.01517 | 1.078 | 0.3605 |
| tau_int_rmsd_ps | 72.55 | 32.77 | 112.5 | 39.79 | -0.7747 | 0.4833 |
| T_mean | 300.4 | 0.2211 | 340.2 | 0.07034 | -171.6 | 5.755e-06 |
| vol_mean | 47.76 | 0.00902 | 48.84 | 0.01166 | -72.89 | 4.573e-07 |

Interpretation for teaching:
* **Temperature and volume** separate the conditions trivially (Welch p = 6e-6 for the mean temperature and 5e-7 for the mean box volume, n = 3 replicas) — the thermostat/barostat work.
* **No structural observable differs significantly at 1 ns** (RMSD, Rg, H-bonds, helix fraction, cage distance: p ≥ 0.36).
  The between-replica spread at *the same* temperature (300 K RMSD means 0.110 / 0.160 / 0.252 nm) is larger than the
  300 K vs 340 K difference. Replica A3 settled into a different local basin already during equilibration
  (its first 200 ps block has RMSD 0.26 nm, then stable), illustrating that the starting-structure relaxation is part of the
  "burn-in" and that one replica is never enough.
* **RMSF carries the temperature signal** (mean Cα RMSF 0.052–0.072 nm at 300 K vs 0.060–0.093 nm at 340 K; termini and the
  Gly10–Gly11 / Pro12 loop fluctuate most), i.e. fluctuations respond to T before the mean structure does.
* **Autocorrelation:** τ_int of the RMSD is 36–171 ps, so 500 frames at 2 ps are only 3–14 *independent* samples per run;
  the naive SE (σ/√500) under-estimates the uncertainty by a factor √(2τ_int/Δt) ≈ 6–13. Use block averaging or
  the replica-level SE (n = 3).

## 6. Reproducing
`python prep.py` (builds system.xml + minimized_system.pdb), then `python run_md.py <A|B> <rep> <seed> <T> 500000 <threads>`
for each run, then `python analyze.py` and `python stats.py`. Runs are deterministic only up to the CPU platform's
floating-point reduction order; expect statistically equivalent, not bit-identical, trajectories.
