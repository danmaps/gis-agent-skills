---
name: geoparquet-pack
description: Package GIS layers into GeoParquet with metadata and validation
---

# GeoParquet Pack

Generate a GeoParquet export plan and metadata bundle for a GIS layer.

## Inputs

- `layer_name` (string)
- `output_path` (string)
- `partition_by` (string, optional)
- `include_bbox` (bool, optional)

## Output

- Export steps (ArcPy or GDAL)
- Validation checklist (schema + CRS + bbox)
- Metadata summary (CRS, geometry type, fields)

## Example

**User:** “Package parcels to GeoParquet.”

**Output:** Steps to export, validate, and write metadata.

## Intent

State the operational goal of the skill and what good output should accomplish.

## Outputs

Return a concise, usable result with the key artifacts or recommendations.

## Safety

Do not invent data, credentials, or system context. Flag uncertainty and risky operations clearly.

