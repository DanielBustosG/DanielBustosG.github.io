import numpy as np, pandas as pd, json
from scipy import stats
df = pd.read_csv("md_trpcage_observables.csv")
def acf(x, maxlag):
    x = x - x.mean(); v = (x*x).mean(); n=len(x)
    return np.array([ (x[:n-k]*x[k:]).mean()/v for k in range(maxlag+1)])
def tau_int(x, dt):
    """integrated autocorrelation time (in ps): tau = dt*(1 + 2*sum_{k>=1} rho_k), summed to the first zero crossing"""
    r = acf(x, len(x)//4)
    neg = np.where(r <= 0)[0]; K = neg[0] if len(neg) else len(r)
    return dt*(1 + 2*r[1:K].sum()), K*dt
def block_se(x, nblocks=10):
    b = np.array_split(x, nblocks); m = np.array([bi.mean() for bi in b]); return m.std(ddof=1)/np.sqrt(nblocks)
rows=[]
for (c, r), g in df.groupby(["condition","replica"]):
    g = g.sort_values("time_ps"); dt = float(np.median(np.diff(g.time_ps)))
    tau, firstzero = tau_int(g.rmsd_ca_nm.values, dt)
    neff = len(g)*dt/(2*tau) if tau>0 else np.nan
    rows.append(dict(condition=c, replica=r, n_frames=len(g), dt_ps=dt,
        rmsd_mean=g.rmsd_ca_nm.mean(), rmsd_sd=g.rmsd_ca_nm.std(), rmsd_blockSE=block_se(g.rmsd_ca_nm.values),
        rg_mean=g.rg_nm.mean(), rg_sd=g.rg_nm.std(), hbonds_mean=g.n_hbonds.mean(), helix_mean=g.helix_fraction.mean(),
        dW6P12_mean=g.dist_W6_P12_nm.mean(), T_mean=g.temperature_K.mean(), Epot_mean=g.potential_energy_kJ_mol.mean(),
        vol_mean=g.box_volume_nm3.mean(), tau_int_rmsd_ps=tau, acf_first_zero_ps=firstzero, n_eff_rmsd=neff,
        rmsd_last200ps=g[g.time_ps > g.time_ps.max()-200].rmsd_ca_nm.mean()))
per = pd.DataFrame(rows); per.to_csv("md_trpcage_replica_summary.csv", index=False, float_format="%.5g")
pd.set_option("display.width", 250); print(per.round(4).to_string(index=False))
print()
cond_rows=[]
for col in ["rmsd_mean","rg_mean","hbonds_mean","helix_mean","dW6P12_mean","tau_int_rmsd_ps","T_mean","vol_mean"]:
    a = per[per.condition=="A"][col].values; b = per[per.condition=="B"][col].values
    t, pv = stats.ttest_ind(a, b, equal_var=False)
    cond_rows.append(dict(observable=col, A_mean=a.mean(), A_se=a.std(ddof=1)/np.sqrt(3), B_mean=b.mean(), B_se=b.std(ddof=1)/np.sqrt(3), welch_t=t, p=pv))
cond = pd.DataFrame(cond_rows); cond.to_csv("md_trpcage_condition_summary.csv", index=False, float_format="%.5g")
print(cond.round(4).to_string(index=False))
