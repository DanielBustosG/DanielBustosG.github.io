import os, sys, time, json
os.environ.setdefault("OPENMM_CPU_THREADS","6")
from pdbfixer import PDBFixer
from openmm.app import *
from openmm import *
from openmm.unit import *
import openmm, pdbfixer

# model 1 only
lines=[]; inmodel=False; done=False
for l in open("1L2Y.pdb"):
    if l.startswith("MODEL"):
        inmodel = (int(l.split()[1])==1); continue
    if l.startswith("ENDMDL"):
        if inmodel: done=True
        inmodel=False; continue
    if inmodel or (not done and not l.startswith(("ATOM","HETATM","TER"))):
        lines.append(l)
open("1L2Y_model1.pdb","w").write("".join(lines))

fixer = PDBFixer(filename="1L2Y_model1.pdb")
fixer.findMissingResidues(); fixer.findMissingAtoms(); fixer.addMissingAtoms()
fixer.addMissingHydrogens(7.0)
ff = ForceField("amber14-all.xml","amber14/tip3pfb.xml")
modeller = Modeller(fixer.topology, fixer.positions)
modeller.addSolvent(ff, model="tip3p", padding=1.0*nanometer, boxShape="cube",
                    ionicStrength=0.15*molar, positiveIon="Na+", negativeIon="Cl-")
system = ff.createSystem(modeller.topology, nonbondedMethod=PME, nonbondedCutoff=1.0*nanometer,
                         constraints=HBonds, rigidWater=True)
print("n_atoms", system.getNumParticles(), "box", modeller.topology.getPeriodicBoxVectors()[0][0])
from collections import Counter
c=Counter(r.name for r in modeller.topology.residues()); print("NA",c.get("NA"),"CL",c.get("CL"),"HOH",c.get("HOH"))
integ = LangevinMiddleIntegrator(300*kelvin, 1/picosecond, 0.002*picoseconds)
plat = Platform.getPlatformByName("CPU")
sim = Simulation(modeller.topology, system, integ, plat)
sim.context.setPositions(modeller.positions)
e0 = sim.context.getState(getEnergy=True).getPotentialEnergy()
t=time.time(); sim.minimizeEnergy(tolerance=10*kilojoule_per_mole/nanometer, maxIterations=0)
st = sim.context.getState(getEnergy=True, getPositions=True)
print("E before %.0f after %.0f kJ/mol, %.0fs" % (e0.value_in_unit(kilojoule_per_mole), st.getPotentialEnergy().value_in_unit(kilojoule_per_mole), time.time()-t))
PDBFile.writeFile(modeller.topology, st.getPositions(), open("minimized_system.pdb","w"))
with open("system.xml","w") as f: f.write(XmlSerializer.serialize(system))
# protein-only reference
import mdtraj as md
tr = md.load("minimized_system.pdb"); prot = tr.topology.select("protein")
tr.atom_slice(prot).save_pdb("md_trpcage_protein.pdb")
print("protein atoms", len(prot), "residues", tr.atom_slice(prot).n_residues)
json.dump({"openmm":openmm.__version__,"pdbfixer":pdbfixer.__version__,"n_atoms":system.getNumParticles(),
           "box_nm":modeller.topology.getPeriodicBoxVectors()[0][0].value_in_unit(nanometer),
           "n_NA":c.get("NA"),"n_CL":c.get("CL"),"n_HOH":c.get("HOH")}, open("prep_info.json","w"), indent=1)
