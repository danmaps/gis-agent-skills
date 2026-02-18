# GIS Agent Skills Library

Vendor-neutral skills for GIS agents. Human-readable, framework-agnostic.

## Structure
- `skills/` — individual skills
- `packs/` — collections of skills
- `schemas/` — JSON/YAML schemas
- `tools/` — tooling helpers
- `examples/` — usage examples
- `tests/` — validation checks

## What’s included (v0)
- One sample skill scaffold
- Minimal schemas
- Pack example

## Contributing
- Keep skills readable and conservative by default
- Document inputs, outputs, safety, and artifacts
- Prefer simple, inspectable patterns

---

## Why GIS-native skills matter (insight)
A quick scan of popular “agent skill catalogs” shows a gap: almost none are truly GIS‑native. Most assume tabular/text data, generic APIs, or frontend/infra concerns. Very few understand projections, spatial joins, topology, rasters vs vectors, geometry validity, or enterprise GIS constraints.

