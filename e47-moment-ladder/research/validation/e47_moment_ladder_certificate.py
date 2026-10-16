#!/usr/bin/env python3
"""MC-E47-MOMENT-LADDER/1.0 — where the moment selector can cut two sectors.

On a carrier H = V_j^(x)n with total Casimir C, let mu and sigma^2 be the mean and variance
of spec(C) under the normalized trace, c = j(j+1), and

    K_mom = (C - (mu - sigma) I)(C - (mu + sigma) I).

Ladder lemma.  sigma is rational iff n = (x + 1)/2 with x^2 - 6 y^2 = 1:
               n = 1, 3, 25, 243, 2401, 23763, ...   Then sigma = y c.
               Off the ladder no root is rational, so K_mom is invertible on every carrier.
Chain lemma.   On rung k the roots are s_(k-1) c and s_k c with
               s = 1, 5, 45, 441, 4361, ...,   s_k = n_k + y_k = (1 + u_k)/2,
               where v sqrt2 + u sqrt3 = (sqrt2 + sqrt3)^(2k+1).
               The upper root of each rung is the lower root of the next.
Theorem.       Both roots are Casimir values only on the cube (rung 1), where they carry the
               Fibonacci–Lucas family. On rungs 2, 3, 4 (n = 25, 243, 2401) this never
               happens for j > 0. On every rung k >= 2 the landing condition is a genus-one
               curve, so at most finitely many spins land (Siegel). Rungs 5..9: none with
               2j + 1 < 10^1000 (exact search from both roots).
Count.         On the cube family (2j+1, 2J+1) = (F_k, L_k), k odd, the upper sector has
               multiplicity F_(k-2) and dim ker K = F_k^2 + F_(k-2) L_k. On the cube this is
               47 = 5^2 + 2*11. Along the family F_k * Omega(k) -> 3/phi.

Evidence: E0 proofs (see E47_Moment_Ladder_Theorem.md); E1 exact integer and rational
arithmetic for every check. No floating point is used except to print the 3/phi limit.

    python3 e47-moment-ladder/research/validation/e47_moment_ladder_certificate.py            # rungs <= 6, ~10 s
    python3 e47-moment-ladder/research/validation/e47_moment_ladder_certificate.py --rungs 9  # rungs <= 9, ~3 min
"""
from __future__ import annotations

import argparse
import json
import math
import os
import time
from decimal import Decimal, getcontext
from fractions import Fraction as F
from pathlib import Path

from sympy.solvers.diophantine.diophantine import diop_DN

OUT = Path(__file__).with_name("E47_MOMENT_LADDER_CERTIFICATE.json")
if os.environ.get("E47_CERT_OUT"):
    OUT = Path(os.environ["E47_CERT_OUT"])


def issq(n: int) -> bool:
    return n >= 0 and math.isqrt(n) ** 2 == n


def rational_square(q: F) -> bool:
    return q >= 0 and issq(q.numerator) and issq(q.denominator)


# ---------------------------------------------------------------- the ladder

def ladder(K: int):
    """Rungs k = 0..K: (n_k, y_k, s_k, u_k) from x + y sqrt6 = (5 + 2 sqrt6)^k."""
    xy, uv = [(1, 0)], [(1, 1)]
    while len(xy) <= K + 1:
        x, y = xy[-1]
        xy.append((5 * x + 12 * y, 2 * x + 5 * y))
        u, v = uv[-1]
        uv.append((5 * u + 4 * v, 6 * u + 5 * v))       # (sqrt2+sqrt3)^(2k+1) = v sqrt2 + u sqrt3
    n = [(x + 1) // 2 for x, _ in xy]
    y = [b for _, b in xy]
    s = [a + b for a, b in zip(n, y)]
    u = [a for a, _ in uv]
    return n, y, s, u, [x for x, _ in xy], uv


# ---------------------------------------------------------------- exact characters

def char_mults(j2: int, n: int) -> dict[int, int]:
    """Exact multiplicities {2J: m_J} of V_j^(x)n from the character (1 + q + ... + q^(2j))^n."""
    a, coef = j2 + 1, [1]
    for _ in range(n):
        new, run = [0] * (len(coef) + a - 1), 0
        for i in range(len(new)):
            if i < len(coef):
                run += coef[i]
            if i >= a:
                run -= coef[i - a]
            new[i] = run
        coef = new
    deg = len(coef) - 1                                  # = 2 n j
    out = {}
    for r in range(deg // 2 + 1):                        # weight m = nj - r; spin J = nj - r
        m = coef[r] - (coef[r - 1] if r else 0)
        if m:
            out[deg - 2 * r] = m
    return out


def casimir(J2: int) -> F:
    return F(J2 * (J2 + 2), 4)


def moments(mult: dict[int, int]):
    D = sum(m * (J2 + 1) for J2, m in mult.items())
    mu = sum(m * (J2 + 1) * casimir(J2) for J2, m in mult.items()) / D
    var = sum(m * (J2 + 1) * casimir(J2) ** 2 for J2, m in mult.items()) / D - mu ** 2
    return D, mu, var


def landing(root: F):
    """2J with J(J+1) = root, if such a half-integer J >= 0 exists."""
    disc = 4 * root + 1
    if disc.denominator != 1 or not issq(disc.numerator):
        return None
    return math.isqrt(disc.numerator) - 1


# ---------------------------------------------------------------- landing sets

def landing_set(D: int, digits: int) -> list[int]:
    """All a >= 1 with D(a^2 - 1) + 1 a perfect square and a < 10^digits (a = 2j + 1)."""
    if issq(D):                                          # (r a)^2 - b^2 = D - 1: finitely many
        r, N, out = math.isqrt(D), D - 1, set()
        for p in range(1, math.isqrt(N) + 1):
            if N % p == 0 and (p + N // p) % (2 * r) == 0:
                a = (p + N // p) // (2 * r)
                if issq(D * (a * a - 1) + 1):
                    out.add(a)
        return sorted(out)
    N, bound, out = 1 - D, 10 ** digits, set()
    fund = diop_DN(D, N)                                  # one representative per class (LMM)
    (x1, y1), = diop_DN(D, 1)                             # fundamental unit
    for x0, y0 in fund:
        for sx in (1, -1):
            for sy in (1, -1):
                for ux, uy in ((x1, y1), (x1, -y1)):
                    x, y = sx * x0, sy * y0
                    while not (abs(y) >= bound and abs(x) >= bound):
                        assert x * x - D * y * y == N
                        if 0 < abs(y) < bound:
                            out.add(abs(y))
                        x, y = x * ux + D * y * uy, x * uy + y * ux
    return sorted(out)


# ---------------------------------------------------------------- certificate

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--rungs", type=int, default=6, help="search rungs 2..RUNGS (default 6)")
    ap.add_argument("--digits", type=int, default=1000, help="search bound 2j+1 < 10^DIGITS")
    args = ap.parse_args()
    t0 = time.time()
    n, y, s, u, x, uv = ladder(12)

    # ladder lemma: rational sigma <=> Pell rung (brute force over n), sigma = y c
    brute = [m for m in range(1, 300001) if issq(6 * m * (m - 1))]
    ladder_bruteforce = brute == [m for m in n if m <= 300000]
    sigma_is_y_c = all(F(2 * n[k] * (n[k] - 1), 3) == y[k] ** 2 for k in range(13))

    # chain lemma
    chain = all(n[k] - y[k] == s[k - 1] for k in range(1, 13))
    chain_closed = all(2 * s[k] == 1 + u[k] for k in range(13)) and all(3 * a * a - 2 * b * b == 1 for a, b in uv)
    chain_factor = all(s[2 * i] == u[i] * x[i] and s[2 * i + 1] == u[i] * x[i + 1] for i in range(6))

    # moment lemma read directly off exact characters on rungs 1-4
    lemma_rows, lemma_ok = [], True
    for nn, j2s in ((3, range(1, 9)), (25, range(1, 7)), (243, (1, 2, 4)), (2401, (1, 2))):
        for j2 in j2s:
            mult = char_mults(j2, nn)
            D, mu, var = moments(mult)
            c = casimir(j2)
            ok = D == (j2 + 1) ** nn and mu == nn * c and var == F(2 * nn * (nn - 1), 3) * c * c
            sig = F(math.isqrt(var.numerator), math.isqrt(var.denominator))
            lo, hi = landing(mu - sig), landing(mu + sig)
            lo_m, hi_m = (mult.get(lo, 0) if lo is not None else 0), (mult.get(hi, 0) if hi is not None else 0)
            lemma_ok &= ok
            lemma_rows.append(dict(n=nn, j=str(F(j2, 2)), mu=str(mu), sigma=str(sig),
                                   lower_root_lands=None if not lo_m else str(F(lo, 2)),
                                   upper_root_lands=None if not hi_m else str(F(hi, 2)),
                                   dim_kernel=str(lo_m * ((lo or 0) + 1) + hi_m * ((hi or 0) + 1))))
    rung2_j2 = next(r for r in lemma_rows if r["n"] == 25 and r["j"] == "2")
    rung2_j2_is_cube_upper = rung2_j2["lower_root_lands"] == "5" and rung2_j2["upper_root_lands"] is None \
        and char_mults(4, 25)[10] == 1336434458122590

    # rung 2 (n = 25): 9 J1(J1+1) = J2(J2+1)  =>  (3B1 - B2)(3B1 + B2) = 8,  B = 2J + 1 >= 1
    pairs8 = [(p, 8 // p) for p in range(1, 9) if 8 % p == 0 and p < 8 // p and (p + 8 // p) % 6 == 0]
    rung2_proof = [((p + q) // 6, (q - p) // 2) for p, q in pairs8] == [(1, 1)]
    # rungs 3, 4: the coefficient 441 = 21^2  =>  (21a - B)(21a + B) = 440 forces a = 1
    rung34_wall = issq(s[3]) and landing_set(s[3], 0) == [1]

    # genus one for every rung k >= 2: pencil roots 0, inf, -s'/s, -(s'-1)/(s-1) distinct
    genus_one = all(s[k - 1] not in (0, 1) and s[k] not in (0, 1) and s[k - 1] != s[k] for k in range(2, 13))
    genus_zero_cube = s[0] == 1                           # rung 1: one quadric degenerates

    # landing sets: class enumeration agrees with brute force, then intersections to 10^digits
    K = max(2, min(args.rungs, 11))
    sets, small_ok = {}, True
    for k in range(1, K + 1):
        for D in (s[k - 1], s[k]):
            if D != 1 and D not in sets:
                sets[D] = landing_set(D, args.digits)
                brute_D = [a for a in range(1, 20001) if issq(D * (a * a - 1) + 1)]
                small_ok &= [a for a in sets[D] if a <= 20000] == brute_D
    rung_rows, no_double = [], True
    for k in range(2, K + 1):
        lo, hi = s[k - 1], s[k]
        both_lo = [a for a in sets[lo] if issq(hi * (a * a - 1) + 1)]
        both_hi = [a for a in sets[hi] if issq(lo * (a * a - 1) + 1)]
        no_double &= both_lo == [1] and both_hi == [1]
        rung_rows.append(dict(k=k, n=n[k], sigma_over_c=y[k], lower=lo, upper=hi,
                              lower_lands_first=[str(a) for a in sets[lo][:4]],
                              upper_lands_first=[str(a) for a in sets[hi][:4]],
                              lower_lands_count=len(sets[lo]), upper_lands_count=len(sets[hi]),
                              both_land_a=both_lo))

    # the obstruction is arithmetic: a rational 'spin' lands both roots on rung 2
    jq = F(98, 1501)
    cq = jq * (jq + 1)
    rational_double = all(rational_square(4 * m * cq + 1) for m in (1, 5, 45))

    # the count on the cube family
    fib, luc = [0, 1], [2, 1]
    while len(fib) < 260:
        fib.append(fib[-1] + fib[-2])
        luc.append(luc[-1] + luc[-2])
    count_closed, fam = True, []
    for k in range(3, 123, 2):
        j2, J2 = fib[k] - 1, luc[k] - 1
        m_up = (3 * j2 - J2) // 2 + 1                    # mult of J in V_j^(x)3 for j <= J <= 3j
        dim = (j2 + 1) ** 2 + m_up * (J2 + 1)
        count_closed &= m_up == fib[k - 2] and dim == fib[k] ** 2 + fib[k - 2] * luc[k] == fib[k] ** 2 + fib[2 * k - 2] + 1
        if k <= 21:
            fam.append(dict(k=k, j=str(F(j2, 2)), J=str(F(J2, 2)), upper_multiplicity=m_up,
                            dim_kernel=dim, dim_carrier=fib[k] ** 3, omega=str(F(dim, fib[k] ** 3))))
    count_char = all(char_mults(fib[k] - 1, 3).get(luc[k] - 1) == fib[k - 2]
                     and char_mults(fib[k] - 1, 3).get(fib[k] - 1) == fib[k] for k in range(3, 16, 2))
    getcontext().prec = 120
    phi = (1 + Decimal(5).sqrt()) / 2
    k = 121
    lim = Decimal(fib[k] ** 2 + fib[k - 2] * luc[k]) / Decimal(fib[k] ** 2)
    limit_ok = abs(lim - 3 / phi) < Decimal(10) ** -45

    optional = {}
    try:                                                   # informational; not part of PASS
        import cypari2
        pari = cypari2.Pari()
        for kk in (2, 3, 4, 5):
            lo, hi = s[kk - 1], s[kk]
            E = pari.ellinit([0, lo + hi + lo * hi, 0, lo * hi * (1 + lo + hi), (lo * hi) ** 2])
            r = pari.ellrank(E)
            optional[f"rung{kk}_rank_bounds"] = [int(r[0]), int(r[1])]
    except Exception as exc:                              # pragma: no cover
        optional["pari"] = f"unavailable: {type(exc).__name__}"

    checks = {
        "ladder_rational_sigma_iff_pell_to_n300000": ladder_bruteforce,
        "ladder_sigma_equals_y_c": sigma_is_y_c,
        "chain_upper_root_is_next_lower_root": chain,
        "chain_s_equals_one_plus_u_over_two": chain_closed,
        "chain_s_factors_as_u_times_x": chain_factor,
        "moment_lemma_from_exact_characters_n3_25_243_2401": lemma_ok,
        "rung2_j2_kernel_is_spin5_sector_only": rung2_j2_is_cube_upper,
        "rung2_n25_no_double_landing_proof": rung2_proof,
        "rung3_rung4_441_wall": rung34_wall,
        "every_rung_k_ge_2_is_genus_one": genus_one,
        "cube_rung_is_genus_zero": genus_zero_cube,
        "class_enumeration_matches_bruteforce_to_20000": small_ok,
        f"rungs_2_to_{K}_no_double_landing_below_10^{args.digits}": no_double,
        "rational_spin_98_over_1501_lands_both_on_rung2": rational_double,
        "cube_upper_multiplicity_F_k_minus_2_from_characters_k3_to_k15": count_char,
        "cube_count_F_k_sq_plus_F_k_minus_2_L_k_to_k121": count_closed,
        "cube_count_47_equals_5sq_plus_2x11": fam[1]["dim_kernel"] == 47 == 5 ** 2 + 2 * 11,
        "family_F_k_omega_tends_to_3_over_phi": limit_ok,
    }
    checks = {key: bool(v) for key, v in checks.items()}
    cert = {
        "schema": "MC-E47-MOMENT-LADDER/1.0",
        "status": "PASS" if all(checks.values()) else "FAIL",
        "checks": checks,
        "exact": {
            "evidence": "E0 proofs; E1 exact integer and rational arithmetic",
            "ladder": [dict(k=k, n=n[k], sigma_over_c=y[k], upper_root_coefficient=s[k]) for k in range(10)],
            "rungs": rung_rows,
            "search_bound": f"2j+1 < 10^{args.digits}",
            "moment_lemma_rows": lemma_rows,
            "rational_double_landing_rung2": {"j": "98/1501", "2J_lower+1": "2321/1501", "2J_upper+1": "5519/1501"},
            "cube_family": fam,
            "limit": {"k": 121, "F_k_omega": str(lim)[:32], "three_over_phi": str(3 / phi)[:32]},
        },
        "optional_pari": optional,
        "seconds": round(time.time() - t0, 1),
        "boundary": ("Finiteness on rungs k >= 2 is Siegel's theorem and is ineffective; beyond rung 4 the "
                     "absence of double landings is computed to the stated bound, not proved. The moment rule "
                     "is a chosen selector. No physical identification is claimed."),
    }
    OUT.write_text(json.dumps(cert, indent=2, sort_keys=True) + "\n")
    print(json.dumps({k: cert[k] for k in ("schema", "status", "checks", "optional_pari", "seconds")}, indent=2))
    if cert["status"] != "PASS":
        raise SystemExit(1)


if __name__ == "__main__":
    main()
