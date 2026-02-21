---
name: spatial-index
description: Recommend and apply spatial index strategies for GIS datasets
---

# Spatial Index

Recommend or apply spatial indexing to improve query performance.

## Inputs

- `dataset` (string)
- `platform` (string, optional: file_gdb, enterprise_gdb, shapefile)
- `operation` (string, optional: create, rebuild, check)

## Output

- Recommended index action
- Expected impact
- Exact ArcPy commands if applicable

## Example

**User:** “Create spatial index for Parcels in a file geodatabase.”

**Output:** ArcPy AddSpatialIndex step with warnings about locks.
