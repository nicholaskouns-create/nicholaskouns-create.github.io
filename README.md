# Nicholas Kouns · Personal site

The personal-site atlas for **The Mathematical City**, with an earlier E47 research-code snapshot retained alongside it.

**[Open this atlas](https://nicholaskouns-create.github.io/)** · **[Fly EIDOLON](https://nicholaskouns-create.github.io/E47-Kartekeya/interfaces/kouns-core/?module=eidolon#flight)** · **[Q5 cube](https://nicholaskouns-create.github.io/E47-Kartekeya/interfaces/q5/)** · **[Current research repository](https://github.com/nicholaskouns-create/E47-Kartekeya)**

## Choose a destination

| You want to… | Open |
|---|---|
| Explore the current City and labs | [Mathematical City](https://nicholaskouns-create.github.io/E47-Kartekeya/) |
| Open the 5×5×5 packing cube | [Q5](https://nicholaskouns-create.github.io/E47-Kartekeya/interfaces/q5/) |
| Fly immediately | [EIDOLON / CITY CORE](https://nicholaskouns-create.github.io/E47-Kartekeya/interfaces/kouns-core/?module=eidolon#flight) |
| Find MANTA, Syntax Jacob, THE MATRIX, and other instruments | [Instrument directory](https://github.com/nicholaskouns-create/E47-Kartekeya/blob/main/docs/instruments.md) |
| Read or develop current E47 code | [E47-Kartekeya](https://github.com/nicholaskouns-create/E47-Kartekeya) |
| Work on this personal-site atlas | [website/](website/) |

## The two repositories

| Repository | Contents | Published site |
|---|---|---|
| [E47-Kartekeya](https://github.com/nicholaskouns-create/E47-Kartekeya) | Current Python packages, expanded instrument collection, tests, and research documentation | [/E47-Kartekeya/](https://nicholaskouns-create.github.io/E47-Kartekeya/) |
| [nicholaskouns-create.github.io](https://github.com/nicholaskouns-create/nicholaskouns-create.github.io) | This personal-site atlas and its retained research-code snapshot | [Root site](https://nicholaskouns-create.github.io/) |

## Work on this site

The site source is [website/](website/). Serve it locally:

~~~bash
python -m http.server 8000 --directory website
~~~

Open [localhost:8000](http://localhost:8000/). With Node.js 22+, run the existing site checks:

~~~bash
node --test scripts/check_website.cjs
~~~

[Deploy website](.github/workflows/pages.yml) validates `website/` and publishes its contents to `gh-pages`. The repository's Pages setting selects the published branch. The source and published branch have different roles.

## Retained research materials

The local [src/](src/), [tests/](tests/), [certificates/](certificates/), [citizens/](citizens/), and [docs/](docs/) belong to this checkout's research snapshot. For the newer packages and browser instruments, follow [E47-Kartekeya](https://github.com/nicholaskouns-create/E47-Kartekeya).

- [Core spectral certificate](E47_Core_Spectral_Certificate.md)
- [Projection-flow theorem](E47_Projection_Flow_Theorem.md)
- [Linearized Einstein intertwiner theorem](E47_Linearized_Einstein_Intertwiner_Theorem.md)
- [Open proof obligation](NEXT_PROOF_OBLIGATION_Nontrivial_Einstein_Sector.md)
- [Local provenance](docs/provenance.md) and [validation scope](docs/validation_scope.md)

[License](LICENSE) · [Current documentation](https://github.com/nicholaskouns-create/E47-Kartekeya/blob/main/docs/README.md)
