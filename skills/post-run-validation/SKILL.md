---
name: post-run-validation
description: Sanity-check GIS outputs after an operation (row counts, extents, null spikes, geometry validity) and produce a confidence score.
---

# Post-run Validation

Close the loop after analysis or scripting. "No error thrown" is not validation.

## Inputs

- Input dataset summary (name/path, feature count, extent, SR, key fields)
- Output dataset summary (same fields)
- Intended operation (buffer, clip, intersect, dissolve, join, routing, etc.)
- Optional: expected magnitude of change (e.g., "~same row count", "should shrink extent")

## Checks (pick the ones that fit)

### 1) Basic counts
- Rows/features before vs after
- If output is 0 or massively smaller/larger than expected, flag

### 2) Extent + spatial reference
- Output extent overlaps input extent (unless expected otherwise)
- SR matches expectation; units make sense

### 3) Null and uniqueness spikes
- For key fields: null rate before vs after
- For IDs: uniqueness before vs after (did a dissolve/join duplicate or collapse unexpectedly?)

### 4) Geometry sanity
- Geometry type matches expectation
- Invalid geometry signals increased (self-intersections, empty shapes)
- Obvious topology smells (slivers after overlay, tiny polygons)

### 5) Field/schema drift
- Required fields present
- Unexpected field renames or type changes
- Domain/coded value preservation (if relevant)

## Output

- **Verdict:** Pass / Warn / Fail
- **Anomalies:** bullet list with evidence (counts, % deltas)
- **Confidence score:** 0–100 with 1–2 sentence justification
- **Next actions:** what to inspect next (map view spot-check, sample records, rerun with env settings)

## Tooling hints

If ArcGIS Pro context is available, use `arcgispro_cli` exports to ground the checks:
- `arcgispro layers --json`
- `arcgispro tables --json`
- `arcgispro status --json`

If you can compute simple stats, prefer deterministic checks over vibes.

## Example

User: "I ran intersect parcels x flood zones. Is it sane?"  
Output: Warn (extent OK, SR OK, but output count is 5% of expected; null spike in APN; geometry sliver risk). Confidence 62/100.
