---
name: agol-publish-checklist
description: Create a pre‑publish checklist for ArcGIS Online items with risk and data quality checks
---

# AGOL Publish Checklist

Generate a concise, practical checklist to publish an item to AGOL safely.

## Inputs

- `dataset_type` (string: feature layer, table, raster, tile)
- `data_source` (string)
- `target_audience` (string, optional)
- `sensitivity` (string, optional)

## Output

Checklist grouped by:
1) Data readiness
2) Metadata + licensing
3) Symbology + scale
4) Hosting + performance
5) Sharing + access

## Guidance

- Include field/domain validation and null checks
- Flag potential privacy issues
- Note tiling or generalization needs for large datasets

## Example

**User:** “Publish a county parcels feature layer.”

**Output:** Checklist covering schema validation, metadata, scale dependencies, and sharing settings.
