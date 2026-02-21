---
name: arcpy-script
description: Generate ArcPy scripts for ArcGIS Pro using live map context, layer sampling, and ArcGIS‑aware prompt rules
---

# ArcPy Script

Generate ArcPy code tailored to the user’s active ArcGIS Pro project by using real map/layer context and ArcGIS‑specific constraints. Output should be **code-only** unless the user explicitly asks for explanations.

## Intent

Produce scripts that work on the first run by grounding the prompt in:
- Actual map metadata and spatial reference
- Real layer names, fields, and small sample records
- Visible layer context and optional view extent

## Inputs

- `task_description` (string)
- `project_path` (string, optional)
- `map_name` (string, optional)
- `layer_names` (array, optional)
- `selected_only` (bool, optional)
- `max_features_per_layer` (int, optional, default 50)
- `simplify_ratio` (float, optional, default 0.01)
- `include_view_extent` (bool, optional)
- `include_map_screenshot` (bool, optional)
- `provider` (string, optional: OpenAI, OpenRouter, Azure OpenAI, Claude, DeepSeek, Local LLM)
- `model` (string, optional)

## Context Capture (mirror arcgispro_ai)

### Use arcgispro-cli for real project context

If available, call `arcgispro-cli` to fetch live project details:
- `arcgispro layers --json` for exact layer names and types
- `arcgispro fields "LayerName"` for real field schemas
- `arcgispro context` for full project dump

Prefer actual layer/field names from these outputs over guesses.

When available, build a `map_info` JSON payload that includes:
- Map metadata: name, title, description, spatial reference, units, rotation, time-enabled
- Layer summaries: visibility, layer type, data source type, extent, spatial reference
- Feature layers: field samples + simplified geometry samples (GeoJSON‑like)
- View extent polygon (optional)
- Active view screenshot (optional, base64 PNG)

## Prompt Rules (critical)

- Use `arcpy` only
- Prefer `SelectLayerByAttribute` for attribute filters
- If distance/near queries are requested, also use `SelectLayerByLocation`
- No `ORDER BY` in selection SQL
- Use `active_map.listLayers("LayerName")[0]` when zooming
- Use `arcpy.AddMessage` for user-facing output
- Return **only** a Python code block (no preamble, no trailing commentary)

## Capabilities to Match

- Map/layer metadata extraction
- Visible-layer context sampling with simplified geometries
- Optional view screenshot for vision‑capable models
- Provider/model selection and key resolution
- Field‑level enrichment via AI responses (optional follow‑up tool)

## Output

- A single, runnable ArcPy script
- Safe defaults and minimal assumptions
- Handles missing layers or empty selections gracefully

## Examples

**User:** “Select the 3 counties with lowest population density and zoom to them.”

**Agent output:** Python only, using `SelectLayerByAttribute`, `SearchCursor`, and `active_view.camera.setExtent(...)`.
