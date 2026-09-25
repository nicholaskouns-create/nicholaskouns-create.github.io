# Nicholas Kouns · Personal Atlas

This repository is the **vestibule** for The Mathematical City. The current executable research repository is [E47-Kartekeya](https://github.com/nicholaskouns-create/E47-Kartekeya); this repo provides the root GitHub Pages site, cross-repository navigation and retained historical research material.

**[OPEN THE ROOT README ROUTER](https://nicholaskouns-create.github.io/readme/)** · **[LIVE ROUTE PACKETS](https://nicholaskouns-create.github.io/packets/)** · **[OPEN THE CITY](https://nicholaskouns-create.github.io/E47-Kartekeya/)** · **[CURRENT RESEARCH REPO](https://github.com/nicholaskouns-create/E47-Kartekeya)** · **[AIMS ROOT DIRECTORY](https://www.aims.healthcare/journal/e47-by-nicholas-kouns-root-directory)**

---

# README = VESTIBULE

The repository README is now a live index into the larger research architecture. Its interactive twin is [`/readme/`](https://nicholaskouns-create.github.io/readme/) and its machine-readable twin is [`website/data/readme-router.json`](website/data/readme-router.json).

## Choose a route

| I want to… | Open |
|---|---|
| Enter the City | [The Mathematical City](https://nicholaskouns-create.github.io/E47-Kartekeya/) |
| Use a single cross-platform index | [README Router](https://nicholaskouns-create.github.io/readme/) |
| Traverse registered objects across platforms | [Live Route Packets](https://nicholaskouns-create.github.io/packets/) |
| Understand the formalism | [Formalism Atlas](https://nicholaskouns-create.github.io/E47-Kartekeya/interfaces/formalism-atlas/) |
| Run the instruments | [Instrument Portal](https://nicholaskouns-create.github.io/E47-Kartekeya/interfaces/instruments/) |
| Verify the current spectral proof | [125 × 125 Matrix Proof](https://nicholaskouns-create.github.io/E47-Kartekeya/interfaces/e47-spectral-matrix-proof/) |
| Open the living research atlas | [Notion](https://mathematicalcity.notion.site/?pvs=74) |
| Inspect source dossiers | [Google Drive certificate corpus](https://docs.google.com/document/d/1FPyhzhx9rpHEh7fSz2djpv19NNJ5Kx3QMbHJmRulHXo/edit?usp=drivesdk) |
| Inspect live registry/provenance | [SEE · Citadel](https://gpkjvihkyectnenvnbng.supabase.co/functions/v1/city-app-host/see/) |
| Read the public narrative | [AIMS E47 Root Directory](https://www.aims.healthcare/journal/e47-by-nicholas-kouns-root-directory) |
| Work on current code | [E47-Kartekeya](https://github.com/nicholaskouns-create/E47-Kartekeya) |

## The substrate map

| Platform | What it contributes |
|---|---|
| **GitHub** | source, tests, certificates, diffs, Actions, Pages |
| **Notion** | living linked context and research pages |
| **Drive** | long-form source artifacts and durable dossiers |
| **Supabase** | live registries, runtime state, provenance and receipts |
| **AIMS** | public exposition and readable publication |

The point is not to make one platform canonical over the rest. The router exposes the native strength of each one and keeps the handoffs visible.

## Two repositories, two roles

| Repository | Role | Published surface |
|---|---|---|
| [E47-Kartekeya](https://github.com/nicholaskouns-create/E47-Kartekeya) | current executable research, tests, certificates, instruments and formalism | [City](https://nicholaskouns-create.github.io/E47-Kartekeya/) |
| [nicholaskouns-create.github.io](https://github.com/nicholaskouns-create/nicholaskouns-create.github.io) | root personal atlas, cross-repo entry layer, retained snapshot | [Root site](https://nicholaskouns-create.github.io/) |

## Current finite core

```text
V₂⊗³ → C → K=(C−6I)(C−30I) → E₄₇ → P₄₇
dim V = 125
dim E₄₇ = 47
Ωc = 47/125 = 0.376
Γ* = I − K²/99144
ρ* = 15/17
```

For the executable and certified version, use [E47-Kartekeya](https://github.com/nicholaskouns-create/E47-Kartekeya), not this retained snapshot.

## Retained research materials

These files remain useful as historical or local references:

- [Core spectral certificate](E47_Core_Spectral_Certificate.md)
- [Projection-flow theorem](E47_Projection_Flow_Theorem.md)
- [Linearized Einstein intertwiner theorem](E47_Linearized_Einstein_Intertwiner_Theorem.md)
- [Open proof obligation](NEXT_PROOF_OBLIGATION_Nontrivial_Einstein_Sector.md)
- [Local provenance](docs/provenance.md)
- [Local validation scope](docs/validation_scope.md)

## Work on this site

Site source: [`website/`](website/)

```bash
python -m http.server 8000 --directory website
node --test scripts/check_website.cjs
```

[Deploy workflow](.github/workflows/pages.yml) validates the site and verifies the live root after publication.

[License](LICENSE) · [Current documentation](https://github.com/nicholaskouns-create/E47-Kartekeya/blob/main/docs/README.md)
