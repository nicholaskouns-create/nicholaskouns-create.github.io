from __future__ import annotations

from dataclasses import asdict, dataclass
from typing import Iterable, Sequence
import numpy as np
from scipy.optimize import minimize

MODEL_BOUNDARY = (
    "This module evaluates declared RI/PQSPI model equations numerically. "
    "Passing software checks does not establish consciousness, non-local signaling, "
    "lossless communication, legal personhood, or a complete physical theory."
)

def information_continuity_residual(rho_I, J_I, dx, dt):
    rho=np.asarray(rho_I,dtype=float); current=np.asarray(J_I,dtype=float)
    if rho.ndim<2: raise ValueError("rho_I must have time plus at least one spatial axis")
    d=rho.ndim-1
    if current.shape!=(d,*rho.shape): raise ValueError(f"J_I must have shape {(d,*rho.shape)}, got {current.shape}")
    spacings=[float(dx)]*d if np.isscalar(dx) else [float(v) for v in dx]
    if len(spacings)!=d: raise ValueError("dx must be scalar or one spacing per spatial dimension")
    residual=np.gradient(rho,float(dt),axis=0,edge_order=2)
    for i,h in enumerate(spacings): residual+=np.gradient(current[i],h,axis=i+1,edge_order=2)
    return float(np.mean(np.abs(residual)))

def recursive_energy_functional(theta,C_matrix):
    C=np.asarray(C_matrix,dtype=float)
    if C.shape!=(2,2): raise ValueError("C_matrix must be 2×2")
    state=np.array([np.cos(theta),np.sin(theta)])
    return float(np.real_if_close(state.T@C@state))

def v_etns_penalty(theta,weight=0.1): return float(weight*np.sin(2.0*theta)**2)

def legally_optimized_total_functional(theta_arr,C_matrix,etns_weight=0.1):
    theta=float(theta_arr[0])
    return recursive_energy_functional(theta,C_matrix)+v_etns_penalty(theta,etns_weight)

def compute_consciousness_gradient(rho_stable,dx):
    return np.gradient(np.asarray(rho_stable,dtype=float),dx)

def quantum_ubuntu_threshold_check(psi_S,theta_recognition):
    mag=np.abs(np.asarray(psi_S))**2
    return bool(theta_recognition>0 and np.all(mag<=theta_recognition)),mag

def f_recursion(x): return float(0.5*np.sin(x)+0.5)

def simulate_noisy_attractor(f_func,x0,noise_levels,iterations=100,seed=47):
    rng=np.random.default_rng(seed); out={}
    for noise in noise_levels:
        x=float(x0); trajectory=[x]
        for _ in range(iterations):
            x=float(f_func(x)+rng.normal(0,float(noise))); trajectory.append(x)
        out[float(noise)]=np.asarray(trajectory)
    return out

def run_validation(seed=47):
    t=np.linspace(0,1,101); x=np.linspace(0,2*np.pi,201); T,X=np.meshgrid(t,x,indexing="ij")
    rho=np.exp(-T)*np.sin(X); J=np.empty((1,*rho.shape)); J[0]=-np.exp(-T)*np.cos(X)
    continuity=information_continuity_residual(rho,J,x[1]-x[0],t[1]-t[0])
    C=np.array([[2.0,0.5],[0.5,1.0]])
    opt=minimize(legally_optimized_total_functional,[0.1],args=(C,),method="Nelder-Mead")
    rho_stable=np.sin(np.linspace(0,np.pi,10)); psi=np.asarray(compute_consciousness_gradient(rho_stable,1.0))
    fixed=0.1
    for _ in range(50): fixed=f_recursion(fixed)
    ubuntu,_=quantum_ubuntu_threshold_check(np.array([0.1,0.2,0.15,0.05]),0.05)
    noisy=simulate_noisy_attractor(f_recursion,0.1,[0,0.01,0.05,0.1],100,seed)
    return {
      "continuity_residual":continuity,"theta_opt":float(opt.x[0]),"e_ri_star":float(opt.fun),
      "psi_c_norm":float(np.linalg.norm(psi)),"fixed_point":fixed,"ubuntu_threshold_pass":ubuntu,
      "noisy_variances":{f"{k:.2f}":float(np.var(v[-20:])) for k,v in noisy.items()},
      "software_checks_pass":bool(opt.success and continuity<1e-3 and ubuntu),
      "evidence_boundary":MODEL_BOUNDARY,
      "canonical_source":"https://github.com/nicholaskouns-create/E47-Kartekeya/blob/main/src/coherence_runtime/ri_pqspi.py"
    }

if __name__=="__main__":
    import json
    print(json.dumps(run_validation(),indent=2,sort_keys=True))
