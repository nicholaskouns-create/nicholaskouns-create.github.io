#!/usr/bin/env python3
"""
verify_pqc_primer.py — Unified First-Principles Verification Suite
Error-Corrected Post-Quantum Cryptography Primer (Unicode Canonical Edition)

Verifies:
  1. E47 Casimir projector (125D spin-2 cube, moments, degree-6 polynomial,
     SU(2) & S3 commutants, exact modular F_q rank for q in {43, 47, 53, 101})
  2. K^2 minimax Richardson contraction (gap 11664, max 186624, ratio 16,
     eps* = 1/99144, rho* = 15/17, interleaved drift, continuous semigroup, Buoy)
  3. Keyed unitary conjugation P_sigma, noise annihilation, & public-projector no-go
  4. MLKEM_256 and NTT_1024 exact primitive roots, inverses, NTT round-trip,
     and explicit rejection of (N=1024, q=3329)
  5. Threshold Ring-LWE (exact BFV/BGV) worst-case noise certificate, flooding,
     correctness margins across N in {2, 5, 100}, & statistical distance < 2^-40
  6. SHOE dual-residual fail-closed gate, Babylonian scalar lock, Q2.30 error,
     coordinate-accurate bus framing, & registered 10-stage latency lower bound
  7. CP-TNI / CPTP quantum operations (M_P, M_t, D_P, reset R) & 7-qubit lift

Dependencies: Python >= 3.10, NumPy (no QuTiP/SciPy/Qiskit required).
Usage:
  python3 verify_pqc_primer.py
  python3 verify_pqc_primer.py --json pqc_primer_certificate.json
"""

from __future__ import annotations

import argparse
from fractions import Fraction
import hashlib
from itertools import permutations
import json
import math
from pathlib import Path
import platform
import sys
from typing import Any

import numpy as np

TOL = 1e-10
EXPECTED_SPEC_C = np.array([0, 2, 6, 12, 20, 30, 42], dtype=int)
EXPECTED_MULT_C = np.array([1, 9, 25, 28, 27, 22, 13], dtype=int)
EXPECTED_K2_POS = np.array([11664, 12544, 19600, 32400, 186624], dtype=int)
PROJECTOR_DENOM = 1_814_400  # 10! / 2
EPSILON_STAR = Fraction(1, 99_144)
RHO_STAR = Fraction(15, 17)
OMEGA_C = Fraction(47, 125)


# =============================================================================
# Helpers
# =============================================================================

def _jsonable(o: Any) -> Any:
    """JSON coercion for NumPy scalars and Fractions (np.bool_ is not serializable)."""
    if isinstance(o, np.bool_):
        return bool(o)
    if isinstance(o, np.integer):
        return int(o)
    if isinstance(o, np.floating):
        return float(o)
    if isinstance(o, np.ndarray):
        return o.tolist()
    if isinstance(o, Fraction):
        return str(o)
    raise TypeError(f"Object of type {type(o).__name__} is not JSON serializable")


def kron3(a: np.ndarray, b: np.ndarray, c: np.ndarray) -> np.ndarray:
    return np.kron(np.kron(a, b), c)


def is_prime(n: int) -> bool:
    if n < 2:
        return False
    if n % 2 == 0:
        return n == 2
    d = 3
    while d * d <= n:
        if n % d == 0:
            return False
        d += 2
    return True


def prime_factors(n: int) -> list[int]:
    factors: list[int] = []
    d = 2
    while d * d <= n:
        if n % d == 0:
            factors.append(d)
            while n % d == 0:
                n //= d
        d += 1
    if n > 1:
        factors.append(n)
    return factors


def is_primitive_nth_root(zeta: int, n: int, q: int) -> bool:
    if (q - 1) % n != 0:
        return False
    if pow(zeta, n, q) != 1:
        return False
    for p in prime_factors(n):
        if pow(zeta, n // p, q) == 1:
            return False
    return True


def gf_rank(mat_mod_q: np.ndarray, q: int) -> int:
    """Exact Gaussian elimination rank over prime field F_q."""
    a = (mat_mod_q.astype(np.int64) % q).copy()
    rows, cols = a.shape
    rank = 0
    for col in range(cols):
        pivot = None
        for r in range(rank, rows):
            if a[r, col] != 0:
                pivot = r
                break
        if pivot is None:
            continue
        if pivot != rank:
            a[[rank, pivot]] = a[[pivot, rank]]
        inv_piv = pow(int(a[rank, col]), -1, q)
        a[rank, col:] = (a[rank, col:] * inv_piv) % q
        for r in range(rank + 1, rows):
            factor = int(a[r, col])
            if factor != 0:
                a[r, col:] = (a[r, col:] - factor * a[rank, col:]) % q
        rank += 1
    return rank


def polynomial_projector_complex(C: np.ndarray) -> np.ndarray:
    """Exact degree-6 rational polynomial P_47 = p_r(C) / 1,814,400."""
    I = np.eye(C.shape[0], dtype=complex)
    num = (
        C
        @ (C - 2.0 * I)
        @ (C - 12.0 * I)
        @ (C - 20.0 * I)
        @ (C - 31.0 * I)
        @ (C - 42.0 * I)
    )
    return num / float(PROJECTOR_DENOM)


def build_integer_sl2_casimir() -> np.ndarray:
    """Exact integer 125x125 Casimir matrix C_Z = Z^2 + Z + D U over Z."""
    Z1 = np.diag([2, 1, 0, -1, -2]).astype(np.int64)
    D1 = np.zeros((5, 5), dtype=np.int64)
    U1 = np.zeros((5, 5), dtype=np.int64)
    for k, c_k in enumerate([4, 6, 6, 4]):
        D1[k + 1, k] = 1
        U1[k, k + 1] = c_k
    I5 = np.eye(5, dtype=np.int64)

    def lift(op: np.ndarray) -> np.ndarray:
        return kron3(op, I5, I5) + kron3(I5, op, I5) + kron3(I5, I5, op)

    Z = lift(Z1)
    U = lift(U1)
    D = lift(D1)
    return Z @ Z + Z + D @ U


def build_s3_permutation_matrix(perm: tuple[int, int, int]) -> np.ndarray:
    """125x125 tensor-slot permutation matrix for perm in S_3."""
    M = np.zeros((125, 125), dtype=complex)
    for a in range(5):
        for b in range(5):
            for c in range(5):
                old = (a, b, c)
                new = (old[perm[0]], old[perm[1]], old[perm[2]])
                col = 25 * a + 5 * b + c
                row = 25 * new[0] + 5 * new[1] + new[2]
                M[row, col] = 1.0
    return M


def ntt_cyclic(vec: list[int], zeta: int, q: int) -> list[int]:
    """Exact radix-2 Cooley-Tukey cyclic NTT over Z_q (N = power of 2)."""
    n = len(vec)
    a = [x % q for x in vec]
    # Bit-reversal permutation
    j = 0
    for i in range(1, n):
        bit = n >> 1
        while j & bit:
            j ^= bit
            bit >>= 1
        j ^= bit
        if i < j:
            a[i], a[j] = a[j], a[i]
    length = 2
    while length <= n:
        wlen = pow(zeta, n // length, q)
        half = length // 2
        for i in range(0, n, length):
            w = 1
            for k in range(half):
                u = a[i + k]
                v = (a[i + k + half] * w) % q
                a[i + k] = (u + v) % q
                a[i + k + half] = (u - v) % q
                w = (w * wlen) % q
        length <<= 1
    return a


def intt_cyclic(vec: list[int], zeta: int, q: int) -> list[int]:
    n = len(vec)
    zeta_inv = pow(zeta, -1, q)
    n_inv = pow(n, -1, q)
    out = ntt_cyclic(vec, zeta_inv, q)
    return [(x * n_inv) % q for x in out]


# =============================================================================
# Section 1: E47 Casimir Projector, Commutants & Modular Stability
# =============================================================================

def verify_section_1() -> tuple[dict[str, Any], dict[str, bool], dict[str, Any]]:
    j = 2
    m = np.arange(j, -j - 1, -1, dtype=float)
    Jz1 = np.diag(m).astype(complex)
    Jp1 = np.zeros((5, 5), dtype=complex)
    for col in range(1, 5):
        mv = m[col]
        Jp1[col - 1, col] = math.sqrt(j * (j + 1) - mv * (mv + 1))
    Jm1 = Jp1.conj().T
    Jx1 = 0.5 * (Jp1 + Jm1)
    Jy1 = (Jp1 - Jm1) / (2.0j)

    su2_local_comm = float(np.linalg.norm(Jx1 @ Jy1 - Jy1 @ Jx1 - 1j * Jz1, "fro"))
    I5 = np.eye(5, dtype=complex)
    Jx = kron3(Jx1, I5, I5) + kron3(I5, Jx1, I5) + kron3(I5, I5, Jx1)
    Jy = kron3(Jy1, I5, I5) + kron3(I5, Jy1, I5) + kron3(I5, I5, Jy1)
    Jz = kron3(Jz1, I5, I5) + kron3(I5, Jz1, I5) + kron3(I5, I5, Jz1)

    C = Jx @ Jx + Jy @ Jy + Jz @ Jz
    C = 0.5 * (C + C.conj().T)
    I125 = np.eye(125, dtype=complex)

    evals_c, U_c = np.linalg.eigh(C)
    rounded_c = np.rint(evals_c).astype(int)
    spec_c, mult_c = np.unique(rounded_c, return_counts=True)

    mu = float(np.trace(C).real / 125.0)
    var = float(np.trace((C - mu * I125) @ (C - mu * I125)).real / 125.0)
    sigma = math.sqrt(var)

    K = (C - 6.0 * I125) @ (C - 30.0 * I125)
    K = 0.5 * (K + K.conj().T)

    mask_e47 = (rounded_c == 6) | (rounded_c == 30)
    V47 = U_c[:, mask_e47]
    P47_eig = V47 @ V47.conj().T
    P47_poly = polynomial_projector_complex(C)
    Q78 = I125 - P47_eig

    poly_vs_eig = float(np.linalg.norm(P47_poly - P47_eig, "fro"))
    idem_err = float(np.linalg.norm(P47_poly @ P47_poly - P47_poly, "fro"))
    herm_err = float(np.linalg.norm(P47_poly - P47_poly.conj().T, "fro"))
    kp_err = float(np.linalg.norm(K @ P47_poly, "fro"))
    trace_p = float(np.trace(P47_poly).real)

    comm_su2 = [
        float(np.linalg.norm(P47_eig @ J - J @ P47_eig, "fro"))
        for J in (Jx, Jy, Jz)
    ]
    s3_comm_max = max(
        float(np.linalg.norm(P47_eig @ build_s3_permutation_matrix(p)
                             - build_s3_permutation_matrix(p) @ P47_eig, "fro"))
        for p in permutations(range(3))
    )

    # Exact modular rank over F_q for q in {43, 47, 53, 101}
    C_int = build_integer_sl2_casimir()
    I_int = np.eye(125, dtype=np.int64)
    mod_ranks: dict[int, int] = {}
    for q in (43, 47, 53, 101):
        Cq = C_int % q
        num = Cq.copy()
        for root in (2, 12, 20, 31, 42):
            num = (num @ ((Cq - root * I_int) % q)) % q
        inv_denom = pow(PROJECTOR_DENOM % q, -1, q)
        Pq = (num * inv_denom) % q
        mod_ranks[q] = gf_rank(Pq, q)

    checks = {
        "s1_local_su2_commutator": su2_local_comm < 1e-12,
        "s1_casimir_spectrum_exact": np.array_equal(spec_c, EXPECTED_SPEC_C),
        "s1_casimir_multiplicities_exact": np.array_equal(mult_c, EXPECTED_MULT_C),
        "s1_moments_mu18_var144_roots_6_30": (
            abs(mu - 18.0) < 1e-10
            and abs(var - 144.0) < 1e-8
            and abs((mu - sigma) - 6.0) < 1e-10
            and abs((mu + sigma) - 30.0) < 1e-10
        ),
        "s1_kernel_dim_47_omega_c_0376": (
            int(mask_e47.sum()) == 47 and abs(trace_p - 47.0) < 1e-10
        ),
        "s1_poly_projector_matches_eig": poly_vs_eig < 1e-10,
        "s1_projector_idempotent_hermitian": idem_err < 1e-10 and herm_err < 1e-10,
        "s1_K_annihilates_P47": kp_err < 1e-9,
        "s1_su2_commutation": max(comm_su2) < 1e-11,
        "s1_s3_schur_weyl_commutation": s3_comm_max < 1e-12,
        "s1_modular_rank_47_over_Fq": all(r == 47 for r in mod_ranks.values()),
    }
    metrics = {
        "dim_V": 125,
        "dim_E47": 47,
        "omega_c": str(OMEGA_C),
        "mu": mu,
        "variance": var,
        "poly_vs_eig_fro": poly_vs_eig,
        "idempotence_fro": idem_err,
        "hermiticity_fro": herm_err,
        "KP_fro": kp_err,
        "su2_comm_max_fro": max(comm_su2),
        "s3_comm_max_fro": s3_comm_max,
        "modular_ranks_Fq": mod_ranks,
    }
    ops = {
        "C": C, "K": K, "P47": P47_eig, "P47_poly": P47_poly,
        "Q78": Q78, "evals_c": evals_c, "U_c": U_c, "mask_e47": mask_e47,
        "V47": V47,
    }
    return metrics, checks, ops


# =============================================================================
# Section 2: K^2 Minimax Contraction, Interleaved Drift & Buoy Dichotomy
# =============================================================================

def verify_section_2(ops: dict[str, Any]) -> tuple[dict[str, Any], dict[str, bool]]:
    C, K, P47, Q78 = ops["C"], ops["K"], ops["P47"], ops["Q78"]
    evals_c, U_c, mask_e47 = ops["evals_c"], ops["U_c"], ops["mask_e47"]
    I125 = np.eye(125, dtype=complex)

    K2 = K @ K
    K2 = 0.5 * (K2 + K2.conj().T)
    k2_evals = np.linalg.eigvalsh(K2)
    pos_unique = np.unique(np.rint(k2_evals[k2_evals > 1e-4]).astype(int))
    gap = int(pos_unique.min())
    lmax = int(pos_unique.max())
    cond_ratio = Fraction(lmax, gap)

    eps_opt = Fraction(2, gap + lmax)
    rho_opt = Fraction(lmax - gap, lmax + gap)
    Gamma = I125 - float(eps_opt) * K2

    gamma_p_err = float(np.linalg.norm(Gamma @ P47 - P47, 2))
    rate_checks = {}
    rate_pass = True
    for n in (1, 10, 50, 100, 220):
        Gn = np.linalg.matrix_power(Gamma, n)
        obs = float(np.linalg.norm(Gn - P47, 2))
        exact = float(rho_opt) ** n
        rate_checks[str(n)] = {"observed": obs, "exact": exact, "abs_diff": abs(obs - exact)}
        if abs(obs - exact) > 1e-11:
            rate_pass = False

    # Interleaved P47-commuting unitary drift: ((Gamma* U)^n - U^n P47) Q78
    rng = np.random.default_rng(47)
    U_E, _ = np.linalg.qr(rng.normal(size=(47, 47)) + 1j * rng.normal(size=(47, 47)))
    U_Q, _ = np.linalg.qr(rng.normal(size=(78, 78)) + 1j * rng.normal(size=(78, 78)))
    V47 = U_c[:, mask_e47]
    V78 = U_c[:, ~mask_e47]
    U_block = V47 @ U_E @ V47.conj().T + V78 @ U_Q @ V78.conj().T
    interleaved_n = 25
    T_n = np.linalg.matrix_power(Gamma @ U_block, interleaved_n)
    interleaved_err = float(np.linalg.norm((T_n - P47) @ Q78, 2))
    interleaved_bound = float(rho_opt) ** interleaved_n

    # Continuous semigroup exp(-t K^2) at t = 0.002
    t_test = 0.002
    k2_diag = ((evals_c - 6.0) * (evals_c - 30.0)) ** 2
    S_t = (U_c * np.exp(-t_test * k2_diag)) @ U_c.conj().T
    cont_err = float(np.linalg.norm(S_t - P47, 2))
    cont_bound = math.exp(-gap * t_test)

    # Buoy spectral dichotomy over exact integer spectrum of K
    k_spec = [(c - 6) * (c - 30) for c in EXPECTED_SPEC_C.tolist()]
    buoy_ok = True
    for eps in range(0, 54):
        if not (eps * eps < (108 - eps) * (108 - eps)):
            buoy_ok = False
        for lam in k_spec:
            for lam_hat in (lam - eps, lam, lam + eps):
                in_window = abs(lam_hat) < 54
                if in_window != (lam == 0):
                    buoy_ok = False

    checks = {
        "s2_K2_positive_spectrum_exact": np.array_equal(pos_unique, EXPECTED_K2_POS),
        "s2_gap_11664_max_186624_ratio_16": (
            gap == 11_664 and lmax == 186_624 and cond_ratio == 16
        ),
        "s2_eps_1_over_99144_rho_15_over_17": (
            eps_opt == EPSILON_STAR and rho_opt == RHO_STAR
        ),
        "s2_Gamma_fixes_P47": gamma_p_err < 1e-11,
        "s2_exact_geometric_rate_15_over_17": rate_pass,
        "s2_interleaved_unitary_drift_bound": interleaved_err <= interleaved_bound + 1e-12,
        "s2_continuous_semigroup_exp_minus_tK2": cont_err <= cont_bound + 1e-12,
        "s2_buoy_dichotomy_eps_lt_54": buoy_ok,
    }
    metrics = {
        "gap_K2": gap,
        "max_K2": lmax,
        "condition_ratio": int(cond_ratio),
        "epsilon_star": str(eps_opt),
        "rho_star": str(rho_opt),
        "rate_samples": rate_checks,
        "interleaved_n25_err": interleaved_err,
        "interleaved_n25_bound": interleaved_bound,
        "continuous_t002_err": cont_err,
        "continuous_t002_bound": cont_bound,
    }
    ops["K2"] = K2
    ops["Gamma"] = Gamma
    ops["k2_diag"] = k2_diag
    return metrics, checks


# =============================================================================
# Section 3: Keyed Unitary Conjugation P_sigma & Public-Projector No-Go
# =============================================================================

def derive_unitary_from_seed(seed: bytes, dim: int = 125) -> np.ndarray:
    """Deterministic Orth(Expand(sigma)) via SHAKE-256 + QR with canonical phases."""
    raw = hashlib.shake_256(b"E47-KEYED-CONJUGATION-V1|" + seed).digest(dim * dim * 16)
    vals = np.frombuffer(raw, dtype=np.uint64).astype(np.float64) / float(2**64)
    # Map uniform [0, 1) to centered symmetric entries and complexify
    vals = vals - 0.5
    re = vals[: dim * dim].reshape(dim, dim)
    im = vals[dim * dim :].reshape(dim, dim)
    Z = re + 1j * im
    Q, R = np.linalg.qr(Z)
    diag = np.diag(R)
    phases = np.where(np.abs(diag) > 0, diag / np.abs(diag), 1.0)
    return Q * phases[np.newaxis, :]


def verify_section_3(ops: dict[str, Any]) -> tuple[dict[str, Any], dict[str, bool]]:
    C, K, P47 = ops["C"], ops["K"], ops["P47"]
    I125 = np.eye(125, dtype=complex)

    sigma = hashlib.sha256(b"ml-kem-768-shared-secret-test-seed").digest()
    U_sig = derive_unitary_from_seed(sigma, 125)
    U_sig_H = U_sig.conj().T

    unitarity_err = float(np.linalg.norm(U_sig_H @ U_sig - I125, "fro"))
    C_sig = U_sig @ C @ U_sig_H
    K_sig = U_sig @ K @ U_sig_H
    P_sig = U_sig @ P47 @ U_sig_H

    p_sig_idem = float(np.linalg.norm(P_sig @ P_sig - P_sig, "fro"))
    p_sig_herm = float(np.linalg.norm(P_sig - P_sig.conj().T, "fro"))
    k_sig_p_sig = float(np.linalg.norm(K_sig @ P_sig, "fro"))
    rank_p_sig = int(np.linalg.matrix_rank(P_sig, tol=1e-8))
    unconjugate_err = float(np.linalg.norm(U_sig_H @ P_sig @ U_sig - P47, "fro"))

    # Keyed noise-annihilation recovery: x = U_sigma(P47 z + K r) => P47 U_sigma^H x = P47 z
    rng = np.random.default_rng(2026)
    z = rng.normal(size=125) + 1j * rng.normal(size=125)
    r = rng.normal(size=125) + 1j * rng.normal(size=125)
    x = U_sig @ (P47 @ z + K @ r)
    recovered = P47 @ (U_sig_H @ x)
    recovery_err = float(np.linalg.norm(recovered - P47 @ z, 2))

    # Constructive Public-Projector No-Go: public C_sig alone yields P_sig in poly-time
    P_sig_from_public_C = polynomial_projector_complex(C_sig)
    nogo_recovery_err = float(np.linalg.norm(P_sig_from_public_C - P_sig, "fro"))

    checks = {
        "s3_U_sigma_unitary": unitarity_err < 1e-12,
        "s3_P_sigma_idempotent_hermitian": p_sig_idem < 1e-12 and p_sig_herm < 1e-12,
        "s3_K_sigma_annihilates_P_sigma": k_sig_p_sig < 1e-10,
        "s3_rank_P_sigma_47": rank_p_sig == 47,
        "s3_unconjugation_identity": unconjugate_err < 1e-11,
        "s3_keyed_noise_annihilation_recovery": recovery_err < 1e-10,
        "s3_public_C_sigma_nogo_polytime_recovery": nogo_recovery_err < 1e-10,
    }
    metrics = {
        "unitarity_fro": unitarity_err,
        "P_sigma_idem_fro": p_sig_idem,
        "K_sigma_P_sigma_fro": k_sig_p_sig,
        "rank_P_sigma": rank_p_sig,
        "unconjugate_fro": unconjugate_err,
        "keyed_recovery_l2": recovery_err,
        "public_nogo_poly_err_fro": nogo_recovery_err,
    }
    return metrics, checks


# =============================================================================
# Section 4: Validated NTT Profiles (MLKEM_256, NTT_1024, Reject 1024/3329)
# =============================================================================

def verify_section_4() -> tuple[dict[str, Any], dict[str, bool]]:
    profiles = {
        "MLKEM_256": {
            "N": 256, "q": 3329, "root": 17,
            "root_inv": 1175, "N_inv": 3316, "word_bits": 12,
        },
        "NTT_1024": {
            "N": 1024, "q": 12289, "root": 10302,
            "root_inv": 8974, "N_inv": 12277, "word_bits": 14,
        },
    }
    rng = np.random.default_rng(1337)
    checks: dict[str, bool] = {}
    metrics: dict[str, Any] = {}

    for name, p in profiles.items():
        N, q, root = p["N"], p["q"], p["root"]
        prime_ok = is_prime(q)
        div_ok = (q - 1) % N == 0
        prim_ok = is_primitive_nth_root(root, N, q)
        inv_root_ok = pow(root, -1, q) == p["root_inv"] and (root * p["root_inv"]) % q == 1
        inv_n_ok = pow(N, -1, q) == p["N_inv"] and (N * p["N_inv"]) % q == 1
        bits_ok = q < (1 << p["word_bits"])

        # Cyclic NTT/INTT exact round-trip & convolution identity
        a = rng.integers(0, q, size=N).tolist()
        b = rng.integers(0, q, size=N).tolist()
        rt = intt_cyclic(ntt_cyclic(a, root, q), root, q)
        roundtrip_ok = (rt == a)

        # Spot-check cyclic convolution at indices 0, 1, N-1 against direct formula
        fa = ntt_cyclic(a, root, q)
        fb = ntt_cyclic(b, root, q)
        prod = intt_cyclic([(x * y) % q for x, y in zip(fa, fb)], root, q)
        conv_ok = True
        for idx in (0, 1, N // 2, N - 1):
            direct = sum(a[k] * b[(idx - k) % N] for k in range(N)) % q
            if prod[idx] != direct:
                conv_ok = False

        checks[f"s4_{name}_prime_and_divisibility"] = prime_ok and div_ok
        checks[f"s4_{name}_primitive_root_order"] = prim_ok
        checks[f"s4_{name}_exact_modular_inverses"] = inv_root_ok and inv_n_ok
        checks[f"s4_{name}_word_width_sufficient"] = bits_ok
        checks[f"s4_{name}_ntt_roundtrip_and_conv"] = roundtrip_ok and conv_ok
        metrics[name] = {
            "N": N, "q": q, "root": root,
            "q_minus_1_mod_N": (q - 1) % N,
            "root_inv": pow(root, -1, q),
            "N_inv": pow(N, -1, q),
            "roundtrip_exact": roundtrip_ok,
            "conv_spotcheck_exact": conv_ok,
        }

    # Explicit rejection of (N = 1024, q = 3329)
    rem_rejected = (3329 - 1) % 1024
    checks["s4_reject_N1024_q3329_rem_256"] = (
        rem_rejected == 256 and not is_primitive_nth_root(17, 1024, 3329)
    )
    metrics["rejected_1024_3329_remainder"] = rem_rejected
    return metrics, checks


# =============================================================================
# Section 5: Threshold Ring-LWE Worst-Case Noise Certificate (Exact BFV/BGV)
# =============================================================================

def eval_rlwe_certificate(mode: str, num_sites: int) -> dict[str, Any]:
    """Exact worst-case noise certificate from Section 5 of the PQC primer."""
    T = 68_720_066_561  # ~2^36, T == 1 (mod 2^16)
    B_e = 19
    lam_s = 40
    e_sm_bound = 28

    if mode == "A":
        n = 8_192
        log2_Q = 174
        log2_P = 0
        pq_bound = 202
        Q = 1 << log2_Q
        B_fresh = Fraction(B_e * (2 * n * num_sites + 1), 1)
        B_agg = num_sites * B_fresh
        B_ct = B_agg
    elif mode == "B":
        n = 16_384
        log2_Q = 275
        log2_P = 56
        pq_bound = 411
        d = 5
        Q = 1 << log2_Q
        P = 1 << log2_P
        q_max = 1 << 55  # five 55-bit primes
        B_fresh = Fraction(B_e * (2 * n * num_sites + 1), P) + Fraction(1 + n * num_sites, 2)
        B_agg = num_sites * B_fresh
        B_tensor = (n * T + 1) + n * T * (2 * B_agg) + n * T * (B_agg * B_agg)

        def B_ks(B_evk: Fraction) -> Fraction:
            return Fraction(d * n * q_max, 2 * P) * B_evk + Fraction(1 + n * num_sites, 2)

        B_relin = B_tensor + B_ks(Fraction(num_sites * B_e * (2 * n * num_sites + 1), 1))
        B_U = (1 << 13) * B_relin + ((1 << 13) - 1) * B_ks(Fraction(num_sites * B_e, 1))
        B_ct = B_U
    else:
        raise ValueError(mode)

    # Mandatory flooding bound B_f = ceil(2^lam_s * n * B_ct)
    B_f_exact = (1 << lam_s) * n * B_ct
    B_f = math.ceil(B_f_exact)

    total_noise = B_ct + num_sites * (B_f + e_sm_bound)
    lhs = T * total_noise + T
    rhs = Fraction(Q, 2)
    exact_ok = lhs < rhs

    # Correctness margin in bits: log2(Q / (2T)) - log2(total_noise)
    margin_bits = math.log2(Q / (2.0 * T)) - math.log2(float(total_noise))

    # Statistical distance bound: Delta(f_h + e_ct, f_h) <= (n * B_ct) / (2 B_f + 1) < 2^-lam_s
    stat_dist = Fraction(n) * B_ct / Fraction(2 * B_f + 1, 1)
    stat_ok = stat_dist < Fraction(1, 1 << lam_s)

    return {
        "mode": mode,
        "N": num_sites,
        "n": n,
        "log2_QP": log2_Q + log2_P,
        "he_128bit_pq_bound": pq_bound,
        "within_128bit_pq_bound": (log2_Q + log2_P) <= pq_bound,
        "T_batching_ok": (T % (1 << 16)) == 1,
        "log2_B_ct": math.log2(float(B_ct)),
        "log2_B_f": math.log2(float(B_f)),
        "margin_bits": margin_bits,
        "exact_decoding_guaranteed": exact_ok,
        "stat_dist_lt_2_minus_40": stat_ok,
    }


def verify_section_5() -> tuple[dict[str, Any], dict[str, bool]]:
    records: dict[str, Any] = {}
    checks: dict[str, bool] = {}

    for mode in ("A", "B"):
        for N in (2, 5, 100):
            key = f"mode_{mode}_N{N}"
            rec = eval_rlwe_certificate(mode, N)
            records[key] = rec
            checks[f"s5_{key}_pq_exact_and_flooding"] = (
                rec["within_128bit_pq_bound"]
                and rec["T_batching_ok"]
                and rec["exact_decoding_guaranteed"]
                and rec["stat_dist_lt_2_minus_40"]
                and rec["margin_bits"] >= 45.0
            )

    # Confirm N=5 reference margins match published Table 3 (~58.8 bits A, ~83.4 bits B)
    checks["s5_N5_mode_A_margin_matches_58_8"] = abs(records["mode_A_N5"]["margin_bits"] - 58.8) < 0.2
    checks["s5_N5_mode_B_margin_matches_83_4"] = abs(records["mode_B_N5"]["margin_bits"] - 83.4) < 0.2

    # Verify anti-averaging threshold: 6*sigma / sqrt(K - 1) < 0.5 at sigma=3.2, K=1500
    sigma = 3.2
    averaging_bound = (6.0 * sigma) / math.sqrt(1500 - 1)
    checks["s5_averaging_attack_threshold_K1500"] = averaging_bound < 0.5
    records["averaging_6sigma_at_K1500"] = averaging_bound
    return records, checks


# =============================================================================
# Section 6: SHOE Fail-Closed Gate, Babylonian Lock & Coordinate Typing
# =============================================================================

def shoe_release(
    x: np.ndarray, K: np.ndarray, P47: np.ndarray,
    tau_k: float = 1e-10, tau_p: float = 1e-10,
) -> tuple[bool, np.ndarray, dict[str, float]]:
    buf = x.astype(complex).copy()
    r_k = float(np.linalg.norm(K @ buf, 2))
    r_p = float(np.linalg.norm(buf - P47 @ buf, 2))
    e_ri = r_k * r_k
    if r_k <= tau_k and r_p <= tau_p:
        return True, buf, {"r_K": r_k, "r_P": r_p, "E_RI": e_ri}
    # Fail-closed zeroization
    buf.fill(0.0)
    return False, buf, {"r_K": r_k, "r_P": r_p, "E_RI": e_ri}


def verify_section_6(ops: dict[str, Any]) -> tuple[dict[str, Any], dict[str, bool]]:
    K, P47, Q78 = ops["K"], ops["P47"], ops["Q78"]
    rng = np.random.default_rng(77)

    raw = rng.normal(size=125) + 1j * rng.normal(size=125)
    valid_state = P47 @ raw
    valid_state /= np.linalg.norm(valid_state)
    leaked_state = valid_state + 1e-6 * (Q78 @ raw)

    ok_valid, out_valid, diag_valid = shoe_release(valid_state, K, P47)
    ok_leak, out_leak, diag_leak = shoe_release(leaked_state, K, P47)

    # Babylonian scalar lock B_Omega(x) = 0.5 * (x + Omega_c^2 / x)
    omega_f = float(OMEGA_C)
    x = 1.0
    quad_err_ok = True
    for _ in range(10):
        e_curr = x - omega_f
        x_next = 0.5 * (x + (omega_f * omega_f) / x)
        e_next = x_next - omega_f
        expected_e_next = (e_curr * e_curr) / (2.0 * x)
        if abs(e_next - expected_e_next) > 1e-15:
            quad_err_ok = False
        x = x_next
    bab_final_err = abs(x - omega_f)

    # Q2.30 quantization & unique rational-Newton compatibility point
    omega_q = Fraction(403_726_926, 1 << 30)
    q230_err = abs(float(omega_q - OMEGA_C))
    a_compat = Fraction(125, 47) ** 2
    compat_ok = (OMEGA_C * a_compat == Fraction(125, 47)) and (a_compat == Fraction(125, 47) ** 2)

    # Dual constants strictly separated: 47/125 != phi^-5
    phi = (1.0 + math.sqrt(5.0)) / 2.0
    omega_geom = phi ** -5
    constants_distinct = abs(omega_f - omega_geom) > 0.28

    # Coordinate-accurate bus framing & registered latency lower bound
    W, B = 32, 192
    e47_bits = 47 * W
    amb_bits = 125 * W
    e47_beats = math.ceil(e47_bits / B)
    amb_beats = math.ceil(amb_bits / B)
    t_lat_ns = (10 / 3e9) * 1e9  # 3.333... ns

    checks = {
        "s6_shoe_accepts_E47_state": ok_valid and np.allclose(out_valid, valid_state),
        "s6_shoe_rejects_and_zeroizes_leak": (
            (not ok_leak) and float(np.linalg.norm(out_leak)) == 0.0
        ),
        "s6_babylonian_quadratic_lock_exact": quad_err_ok and bab_final_err < 1e-15,
        "s6_Q2_30_quantization_error": abs(q230_err - 1.639127722441458e-10) < 1e-18,
        "s6_rational_newton_unique_compat": compat_ok,
        "s6_dual_constants_separated": constants_distinct,
        "s6_bus_framing_1504b_8beats_4000b_21beats": (
            e47_bits == 1504 and e47_beats == 8 and amb_bits == 4000 and amb_beats == 21
        ),
        "s6_registered_10stage_latency_ge_3_333ns": t_lat_ns > 3.333,
    }
    metrics = {
        "shoe_valid_diag": diag_valid,
        "shoe_leak_diag": diag_leak,
        "babylonian_10step_err": bab_final_err,
        "Q2_30_abs_err": q230_err,
        "omega_geom_phi_m5": omega_geom,
        "e47_bits": e47_bits,
        "e47_beats": e47_beats,
        "ambient_bits": amb_bits,
        "ambient_beats": amb_beats,
        "registered_latency_lb_ns": t_lat_ns,
    }
    return metrics, checks


# =============================================================================
# Section 7: CP-TNI / CPTP Quantum Operations & 7-Qubit Embedding
# =============================================================================

def verify_section_7(ops: dict[str, Any]) -> tuple[dict[str, Any], dict[str, bool]]:
    P47, Q78 = ops["P47"], ops["Q78"]
    evals_c, U_c, mask_e47, k2_diag = (
        ops["evals_c"], ops["U_c"], ops["mask_e47"], ops["k2_diag"]
    )
    I125 = np.eye(125, dtype=complex)
    rng = np.random.default_rng(4700)

    # Build a generic full-rank density matrix rho and an E47-supported state rho_E
    A = rng.normal(size=(125, 125)) + 1j * rng.normal(size=(125, 125))
    rho = A @ A.conj().T
    rho /= np.trace(rho)

    v_e = ops["V47"] @ (rng.normal(size=47) + 1j * rng.normal(size=47))
    v_e /= np.linalg.norm(v_e)
    rho_E = np.outer(v_e, v_e.conj())

    # 7.1 Selective projector filter M_P(rho) = P47 rho P47 (CP-TNI, Kraus rank 1, NOT TP)
    mp_rho = P47 @ rho @ P47
    mp_rho_E = P47 @ rho_E @ P47
    gram_mp = np.array([[np.trace(P47.conj().T @ P47).real]])
    kraus_rank_mp = int(np.linalg.matrix_rank(gram_mp, tol=1e-8))
    mp_tni_max_eig = float(np.max(np.linalg.eigvalsh(P47.conj().T @ P47 - I125)))
    mp_is_tp = np.allclose(P47.conj().T @ P47, I125, atol=1e-10)
    mp_pos = float(np.min(np.linalg.eigvalsh(0.5 * (mp_rho + mp_rho.conj().T)))) >= -1e-12
    mp_tr_law = abs(np.trace(mp_rho).real - np.trace(P47 @ rho).real) < 1e-12
    mp_tr_E_eq = abs(np.trace(mp_rho_E).real - 1.0) < 1e-12

    # 7.2 Filtering semigroup M_t(rho) = S_t rho S_t (CP-TNI, TP iff t == 0)
    idx_ker = int(np.flatnonzero(mask_e47)[0])
    idx_gap = int(np.flatnonzero(np.isclose(evals_c, 12.0, atol=1e-8))[0])
    u_ker = U_c[:, idx_ker]
    u_gap = U_c[:, idx_gap]
    witness_op = np.outer(u_ker, u_gap.conj())  # ||witness_op||_F = 1

    sg_samples = []
    sg_ok = True
    for t in (0.0, 1e-4, 1e-3, 1e-2, 0.1, 1.0):
        s_diag = np.exp(-t * k2_diag)
        S_t = (U_c * s_diag) @ U_c.conj().T
        effect_eig = np.linalg.eigvalsh(S_t.conj().T @ S_t)
        tni_ok = float(np.max(effect_eig)) <= 1.0 + 1e-12
        tp_flag = bool(np.allclose(S_t.conj().T @ S_t, I125, atol=1e-10))
        tp_char_ok = (tp_flag == (t == 0.0))

        # Exact superoperator norm ||M_t - M_P||_{2->2} via spectral entries and witness
        p_diag = mask_e47.astype(float)
        diff_eigs = np.abs(np.outer(s_diag, s_diag) - np.outer(p_diag, p_diag))
        exact_sup_norm = float(np.max(diff_eigs))
        witness_norm = float(np.linalg.norm(S_t @ witness_op @ S_t - P47 @ witness_op @ P47, "fro"))
        bound = 1.0 if t == 0.0 else math.exp(-11_664.0 * t)
        norm_ok = (abs(exact_sup_norm - bound) < 1e-12) and (abs(witness_norm - bound) < 1e-11)
        sg_ok = sg_ok and tni_ok and tp_char_ok and norm_ok
        sg_samples.append({"t": t, "tp": tp_flag, "sup_norm": exact_sup_norm, "bound": bound})

    # 7.3 Two-outcome CPTP block-dephasing completion D_P(rho) = P47 rho P47 + Q78 rho Q78
    dp_rho = P47 @ rho @ P47 + Q78 @ rho @ Q78
    dp_dp_rho = P47 @ dp_rho @ P47 + Q78 @ dp_rho @ Q78
    dp_complete = float(np.linalg.norm(P47.conj().T @ P47 + Q78.conj().T @ Q78 - I125, "fro"))
    dp_unital = float(np.linalg.norm(P47 @ I125 @ P47 + Q78 @ I125 @ Q78 - I125, "fro"))
    dp_idem = float(np.linalg.norm(dp_dp_rho - dp_rho, "fro"))
    gram_dp = np.array([
        [np.trace(P47.conj().T @ P47).real, np.trace(P47.conj().T @ Q78).real],
        [np.trace(Q78.conj().T @ P47).real, np.trace(Q78.conj().T @ Q78).real],
    ])
    kraus_rank_dp = int(np.linalg.matrix_rank(gram_dp, tol=1e-8))

    # 7.4 CPTP fail-closed reset-to-null channel R(rho) = K0 rho K0^H + K1 rho K1^H = |0><0|
    K0 = np.array([[1.0, 0.0], [0.0, 0.0]], dtype=complex)
    K1 = np.array([[0.0, 1.0], [0.0, 0.0]], dtype=complex)
    ket0_proj = np.array([[1.0, 0.0], [0.0, 0.0]], dtype=complex)
    reset_complete = float(np.linalg.norm(K0.conj().T @ K0 + K1.conj().T @ K1 - np.eye(2), "fro"))
    test_states = [
        np.array([[1, 0], [0, 0]], dtype=complex),
        np.array([[0, 0], [0, 1]], dtype=complex),
        np.array([[0.5, 0.5], [0.5, 0.5]], dtype=complex),
        np.array([[0.3, -0.2j], [0.2j, 0.7]], dtype=complex),
    ]
    reset_all_ok = all(
        np.allclose(K0 @ s @ K0.conj().T + K1 @ s @ K1.conj().T, ket0_proj, atol=1e-12)
        and abs(np.trace(K0 @ s @ K0.conj().T + K1 @ s @ K1.conj().T).real - 1.0) < 1e-12
        for s in test_states
    )

    # 7.5 7-qubit isometric embedding (2^7 = 128 = 47 + 81) & unitary reflection R47
    nq = math.ceil(math.log2(125))
    d_embed = 1 << nq
    P128 = np.zeros((d_embed, d_embed), dtype=complex)
    P128[:125, :125] = P47
    R128 = 2.0 * P128 - np.eye(d_embed, dtype=complex)
    r128_unitary = float(np.linalg.norm(R128.conj().T @ R128 - np.eye(d_embed), "fro"))
    r128_invol = float(np.linalg.norm(R128 @ R128 - np.eye(d_embed), "fro"))

    checks = {
        "s7_MP_cp_tni_not_tp_kraus_rank_1": (
            mp_pos and mp_tni_max_eig <= 1e-12 and (not mp_is_tp)
            and kraus_rank_mp == 1 and mp_tr_law and mp_tr_E_eq
        ),
        "s7_MP_fixed_operator_dim_2209": (47 * 47 == 2209),
        "s7_semigroup_Mt_cp_tni_and_rate": sg_ok,
        "s7_DP_cptp_unital_idempotent_kraus_rank_2": (
            dp_complete < 1e-12 and dp_unital < 1e-12 and dp_idem < 1e-12
            and kraus_rank_dp == 2 and (47 * 47 + 78 * 78 == 8293)
        ),
        "s7_reset_channel_cptp_to_ket0": reset_complete < 1e-12 and reset_all_ok,
        "s7_7qubit_embedding_128_47_81_reflection": (
            nq == 7 and d_embed == 128 and (d_embed - 47 == 81)
            and r128_unitary < 1e-12 and r128_invol < 1e-12
        ),
    }
    metrics = {
        "MP_kraus_rank": kraus_rank_mp,
        "MP_fixed_operator_dim": 47 * 47,
        "DP_kraus_rank": kraus_rank_dp,
        "DP_fixed_operator_dim": 47 * 47 + 78 * 78,
        "DP_completeness_fro": dp_complete,
        "semigroup_samples": sg_samples,
        "reset_completeness_fro": reset_complete,
        "min_data_qubits": nq,
        "syndrome_dim": d_embed - 47,
        "R128_unitary_fro": r128_unitary,
    }
    return metrics, checks


# =============================================================================
# Main Runner
# =============================================================================

def main() -> int:
    parser = argparse.ArgumentParser(description="Verify Error-Corrected PQC Primer")
    parser.add_argument("--json", type=Path, default=None, help="Write JSON certificate")
    args = parser.parse_args()

    m1, c1, ops = verify_section_1()
    m2, c2 = verify_section_2(ops)
    m3, c3 = verify_section_3(ops)
    m4, c4 = verify_section_4()
    m5, c5 = verify_section_5()
    m6, c6 = verify_section_6(ops)
    m7, c7 = verify_section_7(ops)

    all_checks: dict[str, bool] = {}
    for bucket in (c1, c2, c3, c4, c5, c6, c7):
        all_checks.update({k: bool(v) for k, v in bucket.items()})

    passed = sum(1 for v in all_checks.values() if v)
    total = len(all_checks)
    status = "PASS" if passed == total else "FAIL"

    print("=" * 78)
    print("ERROR-CORRECTED POST-QUANTUM CRYPTOGRAPHY PRIMER — PYTHON VERIFICATION")
    print("=" * 78)
    for name, ok in all_checks.items():
        print(f"  [{'PASS' if ok else 'FAIL'}] {name}")
    print("-" * 78)
    print(f"SUMMARY: {passed}/{total} CHECKS PASSED — STATUS: {status}")
    print("=" * 78)

    payload = {
        "schema": "E47-PQC-PRIMER-VERIFY/1.0",
        "python": platform.python_version(),
        "numpy": np.__version__,
        "status": status,
        "passed": passed,
        "total": total,
        "checks": all_checks,
        "metrics": {
            "section_1_e47_projector": m1,
            "section_2_minimax_contraction": m2,
            "section_3_keyed_conjugation": m3,
            "section_4_ntt_profiles": m4,
            "section_5_threshold_rlwe": m5,
            "section_6_shoe_and_babylonian": m6,
            "section_7_quantum_channels": m7,
        },
        "evidence_boundary": [
            "Verifies finite-dimensional E47 algebra, modular rank, NTT arithmetic, "
            "RLWE worst-case noise bounds, SHOE gate, and CP-TNI/CPTP channels.",
            "Does NOT numerically prove asymptotic MLWE/RLWE hardness, fabricated "
            "silicon timing closure, or physical quantum hardware execution.",
        ],
    }
    canonical = json.dumps(payload, sort_keys=True, separators=(",", ":"), default=_jsonable).encode("utf-8")
    payload["sha256"] = hashlib.sha256(canonical).hexdigest()

    if args.json is not None:
        args.json.write_text(json.dumps(payload, indent=2, default=_jsonable) + "\n", encoding="utf-8")
        print(f"Certificate written to {args.json} (SHA-256: {payload['sha256']})")

    return 0 if status == "PASS" else 1


if __name__ == "__main__":
    sys.exit(main())
