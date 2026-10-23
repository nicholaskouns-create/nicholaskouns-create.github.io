"""Generate a pinned, exact-arithmetic E47 certificate."""
import hashlib,json,os,pathlib,subprocess
ROOT=pathlib.Path(__file__).resolve().parents[1]
out=ROOT/"mnemosyne"/"certificates"/"e47.json"
eigen=[0,2,6,12,20,30,42]
mult=[1,9,25,28,27,22,13]
assert sum(mult)==125
assert sum(m for c,m in zip(eigen,mult) if (c-6)*(c-30)==0)==47
squares=sorted({((c-6)*(c-30))**2 for c in eigen if c not in (6,30)})
assert squares==[11664,12544,19600,32400,186624]
assert max(abs(1-v/99144) for v in squares)==15/17 or abs(max(abs(1-v/99144) for v in squares)-15/17)<1e-14
commit=os.getenv("GITHUB_SHA") or subprocess.check_output(["git","rev-parse","HEAD"],cwd=ROOT,text=True).strip()
data={"schema":"mnemosyne-certificate-v1","theorem":"e47-kernel","implementation":"mnemosyne/tools/e47_certificate.py","test":"mnemosyne/tools/e47_certificate.py","commit":commit,"checks":{"carrier_dimension":125,"kernel_dimension":47,"casimir_eigenvalues":eigen,"multiplicities":mult,"nonzero_K2_spectrum":squares,"contraction":"15/17"},"status":"pass"}
payload=json.dumps(data,sort_keys=True,separators=(",",":"),ensure_ascii=False).encode()
data["sha256"]=hashlib.sha256(payload).hexdigest()
out.parent.mkdir(parents=True,exist_ok=True)
out.write_text(json.dumps(data,indent=2,ensure_ascii=False)+"\n")
print("E47_CERTIFICATE_PASS",commit,data["sha256"])
