import os, sys, time, json
cond, rep, seed, temp, nsteps_prod, threads = sys.argv[1], int(sys.argv[2]), int(sys.argv[3]), float(sys.argv[4]), int(sys.argv[5]), sys.argv[6]
os.environ["OPENMM_CPU_THREADS"] = threads
from openmm.app import *
from openmm import *
from openmm.unit import *
tag = f"{cond}{rep}"
pdb = PDBFile("minimized_system.pdb")
system = XmlSerializer.deserialize(open("system.xml").read())
plat = Platform.getPlatformByName("CPU")
log = open(f"log_{tag}.txt","a")
def P(*a):
    print(*a, file=log, flush=True)
# --- NVT 50 ps
integ = LangevinMiddleIntegrator(temp*kelvin, 1/picosecond, 0.002*picoseconds); integ.setRandomNumberSeed(seed)
sim = Simulation(pdb.topology, system, integ, plat)
sim.context.setPositions(pdb.positions)
sim.context.setVelocitiesToTemperature(temp*kelvin, seed)
t0=time.time(); sim.step(25000); P(f"NVT 50 ps done {time.time()-t0:.0f}s")
# --- NPT 100 ps: add barostat
st = sim.context.getState(getPositions=True, getVelocities=True)
system.addForce(MonteCarloBarostat(1*bar, temp*kelvin, 25))
system.getForce(system.getNumForces()-1).setRandomNumberSeed(seed)
integ = LangevinMiddleIntegrator(temp*kelvin, 1/picosecond, 0.002*picoseconds); integ.setRandomNumberSeed(seed+1000)
sim = Simulation(pdb.topology, system, integ, plat)
sim.context.setPositions(st.getPositions()); sim.context.setVelocities(st.getVelocities())
t0=time.time(); sim.step(50000); P(f"NPT 100 ps done {time.time()-t0:.0f}s")
sim.saveState(f"equil_{tag}.xml")
# --- production
sim.currentStep = 0
sim.reporters.append(XTCReporter(f"traj_{tag}.xtc", 1000))              # every 2 ps, all atoms
sim.reporters.append(StateDataReporter(f"state_{tag}.csv", 1000, step=True, time=True, potentialEnergy=True,
                     kineticEnergy=True, temperature=True, volume=True, density=True, speed=True, separator=","))
sim.reporters.append(CheckpointReporter(f"chk_{tag}.chk", 50000))      # every 100 ps
t0=time.time(); sim.step(nsteps_prod); dt=time.time()-t0
ns = nsteps_prod*0.002/1000
P(f"PROD {ns} ns done {dt:.0f}s  ns/day={ns/(dt/86400):.1f}")
sim.saveState(f"final_{tag}.xml")
json.dump({"cond":cond,"rep":rep,"seed":seed,"temp_K":temp,"prod_steps":nsteps_prod,"threads":threads,
           "prod_wall_s":dt,"ns_per_day":ns/(dt/86400)}, open(f"timing_{tag}.json","w"))
