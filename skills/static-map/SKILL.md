---
name: static-map
description: Assess and publish relatively static, read-only ArcGIS maps as hosted vector tile layers when feature-service capabilities are unnecessary
---

# Static Map

Help a GIS practitioner choose and, when explicitly requested, execute the least capable ArcGIS Online publication architecture that fully satisfies a map's requirements.

## Intent

Use a hosted vector tile layer for maps whose primary job is fast, read-only visualization. Do not optimize for conversion volume: the correct outcome may be a recommendation to use a hosted feature layer or another service.

The workflow is:

1. classify the map and interaction requirements
2. stop and recommend a feature service when critical feature behavior is required
3. inspect map layers, scale ranges, labels, symbology, metadata, and popup fields
4. report supported, approximated, and unsupported cartography before packaging
5. minimize retained attributes
6. prepare a `.vtpk` with ArcGIS Pro's Create Vector Tile Package workflow
7. inspect the package before publication
8. publish with `SharePackage(publish_web_layer=True)` without an associated feature layer
9. optionally create a lightweight web map
10. return a publishing receipt with warnings, limitations, and replacement instructions

Default to **prepare mode**. Execution is allowed only in an ArcGIS Pro-authenticated environment with `arcpy` available and explicit target sharing details.

## Decision gate

### Recommend a hosted vector tile layer when most of these are true

- read-only visualization
- static or periodically republished data
- many features draw simultaneously
- users primarily pan and zoom
- cartography matters more than feature interaction
- no editing, live updates, arbitrary queries, attachments, related records, or transactional behavior
- simple identify is optional and needs only a small set of fields
- the data can tolerate scale-appropriate generalization

### Stop and recommend a feature layer or another architecture when any critical requirement includes

- editing
- frequent, real-time, or near-real-time updates
- arbitrary attribute or spatial queries
- complex filtering or selections driving application behavior
- attachments, related records, or rich popup experiences
- downstream feature analysis or feature-level APIs
- complete feature geometry at arbitrary scales
- transactional behavior

Explain the architectural reason; do not merely refuse the workflow.

## Interaction levels

- **Level 0 — display only:** retain only fields needed for drawing, styling, and labeling.
- **Level 1 — simple identify:** retain a small, explicitly requested set of popup fields and ObjectID when feature identity is needed.
- **Level 2 — rich feature interaction:** recommend a feature layer. Rich popups, charts, attachments, related information, editing, querying, and application-level feature behavior do not fit the static simplification.

## Inputs

Use information available in the current Copilot session, repository, and ArcGIS Pro context:

- `project_path` — `.aprx` path
- `map_name`
- `layer_names` — optional subset
- `output_name`
- `portal_url` and existing ArcGIS Pro portal authentication
- `folder`
- `sharing` — owner by default; organization, groups, or public only when explicitly requested
- `groups`
- `summary` and `tags`
- `minimum_scale` and `maximum_scale`
- `popup_mode` — `none` or `simple`
- `popup_fields`
- `execute` — false by default
- `create_web_map`
- `replace_item_id` — explicit replacement intent only

Ask only for information needed to prevent an unsafe, destructive, or incorrectly shared publication. Never infer public, organization, or group sharing from an ambiguous request.

## Preflight output

Before packaging, produce a report with:

```text
STATIC MAP PREFLIGHT
Map: <name>
Layers: <count>
Vector layers: <count>
Raster layers: <count>
Editing required: <yes/no>
Live updates required: <yes/no>
Rich queries required: <yes/no>
Interaction: <display only/simple identify/rich feature interaction>
Candidate: <VECTOR TILE/FEATURE LAYER/OTHER>
Warnings:
- <specific compatibility, metadata, scale, or attribute warning>
Recommendation:
<architecture and why>
```

Classify cartography as **Supported**, **Approximated**, or **Unsupported**. Never silently remove or materially simplify important symbology. Common warning areas include gradients, hatches, marker effects, markers along lines or polygon outlines, and unsupported symbol effects.

Warn when many popup fields are requested. Retain only fields demonstrated to be needed for drawing, labels, styles, or simple identify. Include ObjectID only when identity is required.

## Publishing workflow

### Prepare mode

Prepare a reviewable ArcPy script and parameter summary. Validate the project path, map selection, output location, scale settings, sharing target, and replacement intent. Do not publish.

### Execute mode

Require all of the following:

- `arcpy` is available in the ArcGIS Pro Python environment
- the target portal is already authenticated in ArcGIS Pro
- the target sharing level and folder are explicit
- replacement is explicit when an existing item is involved
- no credentials are present in generated code or arguments

Use the package route:

```text
ArcGISProject -> Map -> CreateVectorTilePackage -> SharePackage(publish_web_layer=True)
```

Do not use `VectorTileSharingDraft` as the default route because it is designed around a vector tile layer with an associated feature layer. Do not create an associated feature layer for this workflow.

Use the standard online tiling scheme unless a justified alternative is required. Inspect and report the `.vtpk` path, file size, layer count, retained fields, scale range, and warnings before publication.

For replacement, create a new package and use ArcGIS Pro's replacement workflow so the production item identity remains stable when supported. Never overwrite an existing production layer without an explicit `replace_item_id`.

Automatic web-map creation is optional and must not block package publication. If requested, include only an approved basemap, the vector tile layer, initial extent, title, summary, and explicit sharing.

## Outputs

Return the preflight report, compatibility findings, package path and size, retained popup fields, publication item IDs/URLs when available, warnings, and a publishing receipt suitable for saving as Markdown.

For a rejected candidate, return the blocking requirements and the recommended architecture instead of generating misleading vector-tile steps.

## Example request

> Assess the read-only "County Boundaries" map in my ArcGIS Pro project for hosted vector tile publishing. Users only need to pan, zoom, and see county names; do not publish yet. Report compatibility warnings and prepare the packaging steps.

## Cost and storage language

Explain that vector tile layers use ArcGIS Online's tile-storage model rather than hosted feature storage and may be materially cheaper for this use case. Do not hard-code credit rates because they change. Label any organization-specific comparison as an estimate and identify its source and date.

## Safety

- Never request, store, print, or embed ArcGIS credentials.
- Never publish publicly unless explicitly requested.
- Default sharing to owner.
- Never retain all source fields by default.
- Never silently remove unsupported symbology.
- Never describe a vector tile layer as editable or query-equivalent to a feature layer.
- Never publish sensitive data merely because it is technically possible.
- Never replace an existing production item without explicit replacement intent.
- Surface validation and publishing errors; do not return success-shaped fallbacks.

## Read next

- `references/decision-guide.md`
- `references/vector-tile-limitations.md`
- `references/publishing-patterns.md`
- `scripts/publish_static_map.py`
