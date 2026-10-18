import sys, json, numpy as np, pandas as pd, mdtraj as md
tags = sys.argv[1:] if len(sys.argv)>1 else ["A1","A2","A3","B1","B2","B3"]
T_OFFSET = 100.0   # ps: reporter clock continued from the 100 ps NPT equilibration
ref = md.load("minimized_system.pdb")
prot_idx = ref.topology.select("protein")
ref_p = ref.atom_slice(prot_idx)
top = ref_p.topology
ca = top.select("name CA")
w6_ring = top.select("resSeq 6 and resname TRP and (name CG CD1 CD2 NE1 CE2 CE3 CZ2 CZ3 CH2)")
p12_ring = top.select("resSeq 12 and resname PRO and (name CB CG CD)")
helix_res = [r.index for r in top.residues if 2 <= r.resSeq <= 8]
# all backbone N-H ... O=C pairs with |i-j| >= 2
res = list(top.residues)
triplets=[]
for ri in res:
    N = [a.index for a in ri.atoms if a.name=="N"]; H = [a.index for a in ri.atoms if a.name=="H"]
    if not (N and H): continue
    for rj in res:
        if abs(ri.index-rj.index) < 2: continue
        O = [a.index for a in rj.atoms if a.name=="O"]
        if O: triplets.append((N[0],H[0],O[0]))
triplets=np.array(triplets)
print("backbone donor-acceptor pairs:", len(triplets), "W6 ring atoms", len(w6_ring), "P12 ring atoms", len(p12_ring), "helix res", len(helix_res))
rows=[]; rmsf_rows=[]; coords={}; info={}
for tag in tags:
    cond, rep = tag[0], int(tag[1])
    t = md.load(f"traj_{tag}.xtc", top="minimized_system.pdb")
    p = t.atom_slice(prot_idx)
    dca = np.linalg.norm(np.diff(p.xyz[:, ca, :], axis=1), axis=2)
    assert dca.max() < 0.45, f"{tag}: protein broken across PBC (max CA-CA {dca.max():.2f})"
    rmsd = md.rmsd(p, ref_p, atom_indices=ca, ref_atom_indices=ca)
    rg = md.compute_rg(p.atom_slice(ca))
    d = md.compute_distances(p, triplets[:,[1,2]], periodic=False)
    ang = md.compute_angles(p, triplets, periodic=False)
    nhb = ((d < 0.25) & (ang > np.deg2rad(120))).sum(axis=1)
    dssp = md.compute_dssp(p, simplified=True)[:, helix_res]
    hfrac = (dssp == "H").mean(axis=1)
    d_w6_p12 = np.linalg.norm(p.xyz[:, w6_ring, :].mean(axis=1) - p.xyz[:, p12_ring, :].mean(axis=1), axis=1)
    st = pd.read_csv(f"state_{tag}.csv"); st.columns = [c.strip('#" ') for c in st.columns]
    n = min(len(st), p.n_frames)
    time_ps = np.round(st.iloc[:n]["Time (ps)"].values - T_OFFSET, 1)
    rows.append(pd.DataFrame({"condition":cond,"replica":rep,"time_ps":time_ps,
        "rmsd_ca_nm":rmsd[:n],"rg_nm":rg[:n],"n_hbonds":nhb[:n],"helix_fraction":hfrac[:n],
        "dist_W6_P12_nm":d_w6_p12[:n],
        "potential_energy_kJ_mol":st.iloc[:n]["Potential Energy (kJ/mole)"].values,
        "temperature_K":st.iloc[:n]["Temperature (K)"].values,
        "box_volume_nm3":st.iloc[:n]["Box Volume (nm^3)"].values}))
    # superpose protein on reference CA (in place) -> coords for PCA, and RMSF around the replica mean
    p.superpose(ref_p, atom_indices=ca, ref_atom_indices=ca)
    xyz_ca = p.xyz[:n, ca, :]
    coords[tag] = xyz_ca.astype(np.float32)
    pc = md.Trajectory(xyz_ca.copy(), top.subset(ca))
    for _ in range(2):   # iterative superposition on the replica mean structure
        mean = md.Trajectory(pc.xyz.mean(axis=0)[None], pc.topology); pc.superpose(mean)
    rmsf = np.sqrt(((pc.xyz - pc.xyz.mean(axis=0))**2).sum(axis=2).mean(axis=0))
    for i, r in enumerate(pc.topology.residues):
        rmsf_rows.append({"condition":cond,"replica":rep,"residue":r.resSeq,"resname":r.name,"rmsf_nm":rmsf[i]})
    info[tag] = dict(frames=int(p.n_frames), state_rows=int(len(st)))
    print(tag, "frames", p.n_frames, "state rows", len(st), "meanRMSD %.3f meanRg %.3f hb %.1f helix %.2f dW6P12 %.3f T %.1f" %
          (rmsd[:n].mean(), rg[:n].mean(), nhb[:n].mean(), hfrac[:n].mean(), d_w6_p12[:n].mean(), st.iloc[:n]["Temperature (K)"].mean()))
    if tag == "A1":
        p[4::5].save_xtc("md_trpcage_strideA1.xtc")   # frames at 10,20,...,1000 ps -> 100 frames, superposed on reference
out = pd.concat(rows, ignore_index=True)
out.to_csv("md_trpcage_observables.csv", index=False, float_format="%.6g")
pd.DataFrame(rmsf_rows).to_csv("md_trpcage_rmsf.csv", index=False, float_format="%.5g")
np.savez_compressed("md_trpcage_ca_coords.npz", time_ps=time_ps.astype(np.float32),
    ca_resSeq=np.array([r.resSeq for r in top.subset(ca).residues]), ca_resname=np.array([r.name for r in top.subset(ca).residues]),
    ref_ca=ref_p.xyz[0, ca, :].astype(np.float32), **coords)
json.dump(info, open("analysis_info.json","w"))
print(out.shape)
