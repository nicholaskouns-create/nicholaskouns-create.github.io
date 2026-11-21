import numpy as np

OMEGA = np.exp(2j * np.pi / 5.0)

def build_basis():
    basis = []
    for J in range(7):
        for j12 in range(5):
            if abs(j12 - 2) <= J <= j12 + 2:
                for M in range(J, -J - 1, -1):
                    C = J * (J + 1)
                    K = (C - 6) * (C - 30)
                    basis.append((J, j12, M, C, K))
    return basis

BASIS = build_basis()
N = 128
C_ARR = np.zeros(N, dtype=float)
K_ARR = np.zeros(N, dtype=float)
for i, (J, j12, M, C, K) in enumerate(BASIS):
    C_ARR[i] = C
    K_ARR[i] = K
for i in (125, 126, 127):
    C_ARR[i] = 42.0
    K_ARR[i] = 432.0

E47_IDX = np.array([i for i, (J, _, _, _, _) in enumerate(BASIS) if J in (2, 5)], dtype=int)
M2_IDX = np.array([i for i, (J, _, _, _, _) in enumerate(BASIS) if J == 2], dtype=int)
M5_IDX = np.array([i for i, (J, _, _, _, _) in enumerate(BASIS) if J == 5], dtype=int)
OUT_IDX = np.array([i for i in range(125) if i not in set(E47_IDX.tolist())], dtype=int)

def normalize(psi):
    n = np.linalg.norm(psi)
    if n == 0:
        return psi
    return psi / n

def init_random_e47(rng=None):
    rng = np.random.default_rng() if rng is None else rng
    psi = np.zeros(N, dtype=complex)
    psi[E47_IDX] = rng.standard_normal(len(E47_IDX)) + 1j * rng.standard_normal(len(E47_IDX))
    return normalize(psi)

def init_random_full(rng=None):
    rng = np.random.default_rng() if rng is None else rng
    psi = np.zeros(N, dtype=complex)
    psi[:125] = rng.standard_normal(125) + 1j * rng.standard_normal(125)
    return normalize(psi)

def inject_k_error(psi, strength=0.6, rng=None):
    rng = np.random.default_rng() if rng is None else rng
    out = psi.copy()
    out[OUT_IDX] += strength * (rng.standard_normal(len(OUT_IDX)) + 1j * rng.standard_normal(len(OUT_IDX)))
    return normalize(out)

def apply_p47(psi):
    out = np.zeros(N, dtype=complex)
    out[E47_IDX] = psi[E47_IDX]
    return normalize(out)

def evolve_k(psi, dtau):
    return psi * np.exp(-1j * K_ARR * dtau)

def apply_m2(psi, a=0, b=0):
    out = psi.copy()
    block = psi[M2_IDX].reshape(5, 5).copy()
    for j in range(5):
        block[j, :] *= OMEGA ** (j * b)
    block = np.roll(block, shift=a, axis=0)
    out[M2_IDX] = block.reshape(-1)
    return normalize(out)

def apply_m5(psi, gate="I"):
    out = psi.copy()
    block = psi[M5_IDX].reshape(2, 11).copy()
    if gate == "I":
        U = np.array([[1, 0], [0, 1]], dtype=complex)
    elif gate == "X":
        U = np.array([[0, 1], [1, 0]], dtype=complex)
    elif gate == "Y":
        U = np.array([[0, -1j], [1j, 0]], dtype=complex)
    elif gate == "Z":
        U = np.array([[1, 0], [0, -1]], dtype=complex)
    elif gate == "H":
        U = np.array([[1, 1], [1, -1]], dtype=complex) / np.sqrt(2)
    else:
        raise ValueError(gate)
    out[M5_IDX] = (U @ block).reshape(-1)
    return normalize(out)

def fidelity(psi):
    return float(np.sum(np.abs(psi[E47_IDX]) ** 2))

def expectation_k(psi):
    return float(np.sum((np.abs(psi) ** 2) * K_ARR))

def validation():
    return {
        "carrier_dimension": 125,
        "rank_P47": int(len(E47_IDX)),
        "m2_dim": int(len(M2_IDX)),
        "m5_dim": int(len(M5_IDX)),
        "spec_C": sorted(set(int(c) for c in C_ARR[:125])),
        "spec_K": sorted(set(int(k) for k in K_ARR[:125])),
        "KP47_max": float(np.max(np.abs(K_ARR[E47_IDX]))),
        "invalid_K": [432, 432, 432],
    }

if __name__ == "__main__":
    print(validation())
    psi = init_random_e47()
    print(fidelity(psi), expectation_k(psi))
    psi = inject_k_error(psi)
    print(fidelity(psi), expectation_k(psi))
    psi = apply_p47(psi)
    print(fidelity(psi), expectation_k(psi))
    psi = evolve_k(psi, 0.5)
    print(fidelity(psi), expectation_k(psi))
    psi = apply_m2(psi, a=1, b=1)
    print(fidelity(psi), expectation_k(psi))
    psi = apply_m5(psi, gate="H")
    print(fidelity(psi), expectation_k(psi))
