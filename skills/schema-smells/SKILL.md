---
name: schema-smells
description: Detect common schema and data quality smells in GIS layers
---

# Schema Smells

Identify schema issues that cause brittle analyses or slow performance.

## Inputs

- `layer_names` (array)
- `checks` (array, optional)

## Use arcgispro-cli

- `arcgispro fields "LayerName"`
- `arcgispro layers --json`

## Output

A list of smells with severity and fixes, for example:
- Mixed field types across similar layers
- Nullable ID fields
- Domainless coded values
- Unindexed join fields
- Geometry type mismatches

## Example

**User:** “Check parcels and addresses for schema smells.”

**Output:** 6–10 smells with fixes and priorities.
