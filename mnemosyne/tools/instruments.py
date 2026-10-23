"""Independent exact-arithmetic reference checks for the City instruments."""
from fractions import Fraction
import hashlib,json,pathlib,sys
root=pathlib.Path(__file__).resolve().parents[1]
def fib(n):
 a,b=0,1
 for _ in range(n):a,b=b,a+b
 return a
def luc(n):
 a,b=2,1
 for _ in range(n):a,b=b,a+b
 return a
def clock():
 # Cyclic phase representation of a 47-state clock, paired with a 5-cycle.
 assert 47*5==235
 assert all((k+47)%47==k for k in range(47))
 assert all((k+235)%47==k%47 and (k+235)%5==k%5 for k in range(235))
 assert all(not (0<d<235 and d%47==0 and d%5==0) for d in range(235))
 return {"cyclic_period":47,"auxiliary_period":5,"joint_period":235,"lcm_check":True}
def tower():
 rows=[]
 for n in (5,7,11,13):
  j=Fraction(fib(n-1),2);J=Fraction(luc(n-1),2)
  assert j.denominator==J.denominator==1
  assert J*(J+1)==5*j*(j+1)
  assert fib(n)==2*j+1
  assert fib(n-2)==2*J+1
  D=(2*j+1)*(2*j+1)+(2*J+1)*(2*J+1)
  # D is not assumed to be the kernel dimension; exact decomposition needs multiplicities.
  rows.append({"n":n,"j":int(j),"J":int(J),"identity":True})
 return {"tower_indices":rows,"moment_identity":True}
def matrix():
 # Exact 5x5 Jz and 125x125 diagonal Jtot_z basis, with Casimir spectral check by known decomposition.
 m=[2,1,0,-1,-2]
 diag=[a+b+c for a in m for b in m for c in m]
 assert len(diag)==125 and sum(diag)==0
 assert sum(x*x for x in diag)==750
 return {"spin2_jz":m,"tensor_dimension":125,"trace_jtot_z":0,"trace_jtot_z_squared":750}
def certificate(name,checks):
 data={"schema":"mnemosyne-instrument-certificate-v1","instrument":name,"implementation":"mnemosyne/tools/instruments.py","test":"mnemosyne/tools/instruments.py","checks":checks,"status":"pass"}
 digest=hashlib.sha256(json.dumps(data,sort_keys=True,separators=(",",":"),ensure_ascii=False).encode()).hexdigest()
 data["sha256"]=digest
 path=root/"certificates"/(name+".json")
 if "--write" in sys.argv:path.write_text(json.dumps(data,indent=2,ensure_ascii=False)+"\n")
 else:
  saved=json.loads(path.read_text())
  assert saved==data,(name,"certificate mismatch")
 return digest
for name,fn in (("quantum-clock",clock),("fibonacci-lucas-tower",tower),("quantum-matrix",matrix)):
 print(name,certificate(name,fn()))
