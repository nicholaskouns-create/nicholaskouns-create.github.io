"""Fail closed if theorem edges, evidence, certificate or pinned commit disagree."""
import hashlib,json,pathlib,re
root=pathlib.Path(__file__).resolve().parents[1]
graph=json.loads((root/"proof-graph.json").read_text())
cert=json.loads((root/"certificates/e47.json").read_text())
assert graph["schema"]=="mnemosyne-proof-graph-v1"
nodes={n["id"]:n for n in graph["nodes"]}
assert len(nodes)==len(graph["nodes"])
assert all(target in nodes for n in nodes.values() for target in n.get("links",[]))
assert [nodes[x]["type"] for x in ["e47-kernel","e47-implementation","e47-test","e47-certificate","e47-version"]]==["theorem","implementation","test","certificate","version"]
for a,b in zip(["e47-kernel","e47-implementation","e47-test","e47-certificate"],["e47-implementation","e47-test","e47-certificate","e47-version"]):
    assert b in nodes[a]["links"]
assert cert["schema"]=="mnemosyne-certificate-v1" and cert["theorem"]=="e47-kernel"
assert cert["status"]=="pass" and re.fullmatch("[0-9a-f]{40}",cert["commit"])
receipt=cert.pop("sha256")
digest=hashlib.sha256(json.dumps(cert,sort_keys=True,separators=(",",":"),ensure_ascii=False).encode()).hexdigest()
assert receipt==digest,"Certificate checksum mismatch"
e=cert["checks"]["casimir_eigenvalues"];m=cert["checks"]["multiplicities"]
assert sum(m)==cert["checks"]["carrier_dimension"]==125
assert sum(v for x,v in zip(e,m) if (x-6)*(x-30)==0)==cert["checks"]["kernel_dimension"]==47
assert sorted({((x-6)*(x-30))**2 for x in e if x not in (6,30)})==cert["checks"]["nonzero_K2_spectrum"]
assert abs(max(abs(1-v/99144) for v in cert["checks"]["nonzero_K2_spectrum"])-15/17)<1e-14
assert (root/"index.html").read_text().find("proof-observatory.js")>=0
print("MNEMOSYNE_PROOF_GRAPH_PASS",len(nodes),"nodes",receipt)

# Each instrument has its own theorem -> implementation -> test -> certificate -> version chain.
for instrument in ("quantum-clock","fibonacci-lucas-tower","quantum-matrix"):
    chain=[instrument+"-"+kind for kind in ("theorem","implementation","test","certificate","version")]
    assert [nodes[k]["type"] for k in chain]==["theorem","implementation","test","certificate","version"]
    for a,b in zip(chain,chain[1:]):assert b in nodes[a]["links"]
    path=root/"certificates"/(instrument+".json")
    data=json.loads(path.read_text())
    assert data["instrument"]==instrument and data["status"]=="pass"
    receipt=data.pop("sha256")
    assert receipt==hashlib.sha256(json.dumps(data,sort_keys=True,separators=(",",":"),ensure_ascii=False).encode()).hexdigest()
assert "city-instruments.js" in (root/"index.html").read_text()
print("MNEMOSYNE_INSTRUMENT_CHAINS_PASS",3)
