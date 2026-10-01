---
name: analysis-readiness-check
description: Decide if a dataset/project is ready for a specific spatial analysis (buffer, overlay, join, routing) and list blockers + preflight steps.
---

# Analysis Readiness Check

Answer: **"Should I even run this yet?"**

## Inputs

- Dataset or project context (paths, layer names, storage type, projection info if known)
- Intended operation:
  - buffer
  - overlay (intersect/union/erase)
  - spatial join
  - routing/network analysis
  - raster analysis
- Constraints (optional): performance target, platform (Pro vs AGOL), deadline

## What to check (decision tree)

### 1) Basic integrity
- Missing geometries, empty layers, obviously wrong extents
- Geometry validity (self-intersections, null shapes, mixed types)
- Unexpected duplicates in ID fields

### 2) Spatial reference + units
- Are inputs in compatible projections?
- Are distance/area units appropriate for the requested operation?
- If geographic coords (degrees) are used for distance operations, flag as **not ready**.

### 3) Attribute readiness
- Join keys: type, null rate, uniqueness, indexing
- Coded values/domains: is interpretation clear?
- Required fields present (e.g., speed/impedance for routing)

### 4) Performance + scaling risk
- Estimated feature counts and geometry complexity
- Network share vs local disk vs enterprise DB
- Obvious index needs (spatial + join fields)

### 5) Output expectations
- Define what “correct output” means (units, schema, fields, topology)
- Identify validation checks to run after execution (see `post-run-validation`)

## Output

- **Verdict:** Ready / Not ready
- **Blocking issues:** a short list (max ~5) with plain-language impact
- **Recommended preflight:** ordered checklist to become ready
- Optional: safest “first run” settings (scratch workspace, env settings, chunking)

## Tooling hints

- If ArcGIS Pro context is available, prefer using `arcgispro_cli` exports to ground the check:
  - `arcgispro status --json`
  - `arcgispro layers --json`
  - `arcgispro tables --json`

## Example prompt

User: "Can I run a parcel buffer + intersect with zoning yet?"  
Output: Not ready (projection is geographic; join field null spike; spatial index missing). Provide a 5-step preflight plan.
