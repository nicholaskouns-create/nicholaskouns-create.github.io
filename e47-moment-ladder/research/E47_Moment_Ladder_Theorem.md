# E47 Moment Ladder — where the moment selector can cut two sectors

**Certificate:** `MC-E47-MOMENT-LADDER/1.0` · 18/18 PASS
**Executable:** [`validation/e47_moment_ladder_certificate.py`](validation/e47_moment_ladder_certificate.py) — default run searches rungs ≤ 6 (≈10 s); `--rungs 9` searches rungs ≤ 9 (≈2½ min)
**Record:** [`validation/E47_MOMENT_LADDER_CERTIFICATE.json`](validation/E47_MOMENT_LADDER_CERTIFICATE.json)
**Evidence:** E0 proofs below; E1 exact integer and rational arithmetic (exact characters, Pell class enumeration to \(10^{1000}\), PARI 2-descent ranks).
**Derivation:** Claude (Anthropic), 16 October 2026, for the E47 corpus of Nicholas Shane Kouns. Closes the open boundary of the [moment selector](https://github.com/nicholaskouns-create/E47-Kartekeya/blob/304116d156c7ebc784175eea095faed62dc97ef3/research/e47/E47_Moment_Selector_Theorem.md).
**Live instrument:** [The Moment Ladder](https://nicholaskouns-create.github.io/e47-moment-ladder/) — every number recomputed in exact arithmetic in the browser.

## Setting

On \(H=V_j^{\otimes n}\) with total Casimir \(C\), write \(c=j(j+1)\) and let \(\mu,\sigma^2\) be the mean and variance of \(\operatorname{spec}C\) under the normalized trace. The moment selector is

\[
K_{\mathrm{mom}}=\bigl(C-(\mu-\sigma)I\bigr)\bigl(C-(\mu+\sigma)I\bigr),\qquad \mu=nc,\quad \sigma^2=\tfrac{2n(n-1)}{3}\,c^2 .
\]

A root *lands* when it equals a Casimir value \(J(J+1)\) of a sector present in \(H\). The selector theorem settled \(n=3\) and left open: *"For n = 25, 243, ... sigma is rational and the question is open."*

## Theorem — the moment ladder

**I. The ladder.** \(\sigma\) is rational exactly when \(n=(x+1)/2\) with \(x^2-6y^2=1\), i.e. \(x+y\sqrt6=(5+2\sqrt6)^k\):

| \(k\) | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| \(n_k\) | 1 | 3 | 25 | 243 | 2401 | 23763 | 235225 | 2328483 | 23049601 | 228167523 |
| \(\sigma/c=y_k\) | 0 | 2 | 20 | 198 | 1960 | 19402 | 192060 | 1901198 | 18819920 | 186298002 |
| \(s_k=n_k+y_k\) | 1 | 5 | 45 | 441 | 4361 | 43165 | 427285 | 4229681 | 41869521 | 414465525 |

Off the ladder no root is rational, so \(K_{\mathrm{mom}}\) is invertible on every carrier.

**II. The chain.** On rung \(k\) the roots are \(s_{k-1}\,c\) and \(s_k\,c\). The upper root of each rung is the lower root of the next. In closed form \(s_k=(1+u_k)/2\) with \(v\sqrt2+u\sqrt3=(\sqrt2+\sqrt3)^{2k+1}\), and \(s_{2i}=u_ix_i\), \(s_{2i+1}=u_ix_{i+1}\).

**III. Where both roots land.** Both roots land (a kernel of two whole sectors)

- on rung 1 (\(n=3\)) exactly when \(2j+1=F_k\), \(k\) odd — the Fibonacci–Lucas family;
- on rungs 2, 3, 4 (\(n=25,243,2401\)) never, for \(j>0\);
- on every rung \(k\ge2\) for at most finitely many \(j\);
- on rungs 5–9 for no \(j\) with \(2j+1<10^{1000}\) (E1).

**IV. The count.** On the Fibonacci–Lucas family the upper sector \(J\) (\(2J+1=L_k\)) has multiplicity \(F_{k-2}\) and the lower sector has multiplicity \(F_k\), so

\[
\dim\ker K=F_k^2+F_{k-2}L_k=F_k^2+F_{2k-2}+1,\qquad 47=5^2+2\cdot11,\qquad F_k\,\Omega(k)\longrightarrow \frac{3}{\varphi}.
\]

## Proofs

**P1 (ladder).** If \(\sigma/c=\sqrt{2n(n-1)/3}\) is rational then \(6n(n-1)=9(\sigma/c)^2\) is an integer square \(r^2\); \(3\mid r\), so \(r=3y\) and \(2n(n-1)=3y^2\). With \(x=2n-1\), \(x^2-1=4n(n-1)=6y^2\). Off the ladder \(\mu\pm\sigma\) is irrational while every Casimir value is rational. ∎

**P2 (chain).** \((x_k,y_k)=(5x_{k-1}+12y_{k-1},\,2x_{k-1}+5y_{k-1})\) gives \(n_k-y_k=(x_{k-1}+2y_{k-1}+1)/2=n_{k-1}+y_{k-1}\). The closed form follows from \((\sqrt2+\sqrt3)^2=5+2\sqrt6\). ∎

**P3 (\(n=25\)).** The roots are \(5c\) and \(45c\), so a double landing needs \(J_2(J_2+1)=9J_1(J_1+1)\). With \(B=2J+1\): \(9B_1^2-B_2^2=8\), i.e. \((3B_1-B_2)(3B_1+B_2)=8\). Both factors are positive with equal parity and the larger is at least 4, so the split is \(2\cdot4\): \(B_1=B_2=1\), \(J_1=J_2=0\), \(c=0\). ∎

**P4 (\(n=243,2401\)).** \(441=21^2\) is the upper root of rung 3 and the lower root of rung 4. With \(a=2j+1\), \(J(J+1)=441\,j(j+1)\) reads \((21a-B)(21a+B)=440\). For \(a\ge2\), \(21a+B\ge43\); the even splits above that (\(2\cdot220,\ 4\cdot110,\ 10\cdot44\)) give \(42a=222,114,54\), none divisible by 42. So that root never lands for \(j>0\). ∎

**P5 (genus).** A double landing on rung \(k\) is an integer point on \(b^2-sa^2=1-s,\ d^2-s'a^2=1-s'\) with \(s=s_{k-1}, s'=s_k\). The pencil degenerates at \(0,\infty,-s'/s,-(s'-1)/(s-1)\), distinct when \(s,s'\notin\{0,1\}\), \(s\ne s'\) — every rung \(k\ge2\). The curve is smooth of genus one; Siegel's theorem gives finitely many integer points. On the cube \(s=1\): \(b=\pm a\) splits off (the lower root always lands, \(J=j\)) and the conic \(b^2-5a^2=-4\) of genus zero remains, whose integer points are the Fibonacci–Lucas pairs. ∎

*Remark (E1).* The obstruction above the cube is integrality, not algebra. The associated elliptic curves \(Y^2=(X+s)(X+s')(X+ss')\) have rank 1, 1, 2, 2 on rungs 2–5 (PARI `ellrank`), with the trivial point \((0,ss')\) of infinite order; on rung 2 the rational spin \(j=98/1501\) lands both roots (\(2J+1=2321/1501\) and \(5519/1501\)).

**P6 (count).** In \(V_j^{\otimes3}=V_j\otimes\bigoplus_{L=0}^{2j}V_L\), spin \(J\in[j,3j]\) occurs once for each \(L\in[J-j,2j]\): multiplicity \(3j-J+1\); spin \(j\) occurs \(2j+1\) times. With \(2j+1=F_k\), \(2J+1=L_k=F_k+2F_{k-1}\): \(3j-J+1=(3F_k-L_k)/2=F_{k-2}\). For odd \(k\), \(F_{k-2}L_k=F_{2k-2}+1\), so \(F_k\Omega=1+(F_{2k-2}+1)/F_k^2\to1+\sqrt5/\varphi^2=3/\varphi\). ∎

## Computation (E1)

- Ladder brute force: \(6n(n-1)\) is a square for \(n\le300000\) exactly at \(n=1,3,25,243,2401,23763,235225\).
- Moment lemma read off exact characters \((1+q+\dots+q^{2j})^n\) at \(n=3,25,243,2401\). On 25 factors of spin 2 the kernel is the spin-5 sector alone (multiplicity 1336434458122590): the cube's upper root reappears as rung 2's lower root.
- Rungs 2–9: every \(a=2j+1<10^{1000}\) with \(s(a^2-1)+1\) a square, from Pell class representatives (LMM via `sympy.diop_DN`) and the fundamental unit; class enumeration agrees with brute force for \(a\le20000\). Intersections taken from both roots: only \(a=1\).

| rung | \(n\) | lower lands (\(a<10^{1000}\)) | upper lands | both |
|---:|---:|---:|---:|---|
| 2 | 25 | 2392 | 2392 | none |
| 3 | 243 | 2392 | 0 | none |
| 4 | 2401 | 0 | 332 | none |
| 5 | 23763 | 332 | 548 | none |
| 6 | 235225 | 548 | 439 | none |
| 7 | 2328483 | 439 | 77 | none |
| 8 | 23049601 | 77 | 78 | none |
| 9 | 228167523 | 78 | 91 | none |

## Boundary

- **E0:** P1–P6. **E1:** the rung 5–9 search to \(10^{1000}\), the character replays, the ranks.
- **Open:** rungs \(k\ge5\) above the search bound. Siegel's theorem is ineffective; a complete answer per rung needs linear forms in logarithms (Baker–Davenport). Conjecture: no rung above the cube lands twice.
- The moment rule is a chosen selector; the theorem shows where it can act, not that it is the only natural rule.
- No physical identification is claimed.

**One ladder of rational spreads. Its roots meet on the cube: 125 → 47.**
