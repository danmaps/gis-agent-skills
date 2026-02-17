# GIS Agent Skills Library (v0)

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

That gap is the opportunity.

### GIS‑adjacent examples (from a large public catalog)
These are useful, but they live around GIS rather than inside it:

1) **Azure Maps Search**
- Upstream of GIS: ingestion + enrichment, not analysis
- Bridge: address mess → coordinates → GIS‑grade inputs

2) **D3.js Geographic Visualization**
- Communication surface, not a GIS replacement
- When the goal is understanding + trust (not spatial precision), D3 wins

3) **Computer Vision + Spatial Aggregation**
- CV detects; GIS aggregates + contextualizes + decides
- This CV→GIS pipeline is the canonical GeoAI pattern

### What’s missing (and why it matters)
A GIS‑serious catalog would include skills like:
- Geometry‑aware data validation
- Spatial joins and overlays
- Projection management and reprojection
- Raster analysis and zonal statistics
- Network analysis with topology awareness
- Enterprise data access with permissions and lineage

### Meta insight
These skills only become “GIS skills” when spatial structure is applied. The catalog doesn’t do that work. That reinforces the thesis: GIS expertise isn’t about tools — it’s about knowing where spatial reasoning belongs in a system. Agents don’t know that by default. This library fills that gap.
