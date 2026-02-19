---
name: symbology-compat
description: Assess whether ArcGIS symbology will survive KMZ/Google Earth export and suggest compatible alternatives
---

# Symbology Compatibility

Assess whether ArcGIS Pro symbology will survive export to KMZ, KML, Google Earth, or other interchange formats — and recommend compatible alternatives when it won’t.

## Intent

Help users avoid broken or invisible symbology after exporting by flagging unsupported renderers, symbol types, and label configurations before the export happens.

## Prerequisites

### Recommended: `arcgispro-cli`

Install [`arcgispro-cli`](https://pypi.org/project/arcgispro-cli/) to inspect layer symbology directly:

```powershell
pip install arcgispro-cli
arcgispro install
```

Click **Snapshot** in ArcGIS Pro, then the agent can check renderer type, symbol details, and label settings:

```bash
arcgispro layer "Roads" --json     # renderer type, symbol info
arcgispro layers --json            # all layers at once
```

## Inputs

- `layer_name` (string) — layer to assess
- `export_format` (string, optional) — target format: `KMZ`, `KML`, `Shapefile`, `GeoJSON`, `FGDB`. Default: `KMZ`
- `renderer_info` (object, optional) — if no CLI, user-described renderer (type, field, symbol types)

## Outputs

- `compatibility_report` (object) — containing:
  - `compatible` — boolean, overall pass/fail
  - `issues` — array of incompatibilities with severity, description, and suggested fix
  - `safe_symbols` — list of symbols/renderers that will export cleanly

## Safety

- **Read-only** — this skill inspects symbology; it never modifies layers, renderers, or exports
- Does not perform the export itself
- Safe to run on any layer at any time

## Compatibility Matrix

### Renderers

| Renderer Type | KMZ/KML | Shapefile | GeoJSON | Notes |
|--------------|---------|-----------|---------|-------|
| Simple (single symbol) | ✅ | ✅ | ✅ | Best compatibility |
| Unique Values | ✅ | ⚠️ loses renderer | ⚠️ loses renderer | Values preserved, styling lost |
| Graduated Colors | ⚠️ flattened | ⚠️ loses renderer | ⚠️ loses renderer | Becomes single color per feature |
| Graduated Symbols | ❌ | ❌ | ❌ | Size variation not supported |
| Proportional Symbols | ❌ | ❌ | ❌ | Not translatable |
| Dot Density | ❌ | ❌ | ❌ | No equivalent in interchange formats |
| Heat Map | ❌ | N/A | N/A | Raster-based, no vector equivalent |
| Dictionary Renderer | ❌ | ❌ | ❌ | Military symbology, highly specialized |

### Symbol Types

| Symbol Type | KMZ/KML | Notes |
|------------|---------|-------|
| Simple marker (circle, square) | ✅ | Translates to KML icon |
| Picture marker | ⚠️ | Embedded if small; may degrade |
| Character marker (font-based) | ❌ | Font not available in Google Earth |
| Multilayer symbols | ⚠️ | Only top layer may survive |
| 3D symbols | ❌ | No KML equivalent |
| Procedural symbols | ❌ | CityEngine symbols, no export path |
| Hatch fill | ⚠️ | Converts to solid fill |
| Gradient fill | ❌ | No KML support |

### Labels

| Feature | KMZ/KML | Notes |
|---------|---------|-------|
| Simple labels | ✅ | Text and basic font |
| Maplex label engine | ⚠️ | Placement logic lost; positions may shift |
| Label expressions (Arcade/Python) | ⚠️ | Values baked in at export time |
| Annotation | ❌ | Not exported as labels |
| Halos / callouts | ❌ | Not supported in KML |

## Workflow

### 1. Gather symbology info

If `arcgispro-cli` is available:
```bash
arcgispro layer "Roads" --json    # renderer type + symbol details
```

Otherwise, ask the user:
- What renderer type? (single symbol, unique values, graduated, etc.)
- What symbol types? (simple marker, picture marker, character marker, etc.)
- Are labels enabled? What label engine?
- Any transparency, visual effects, or 3D symbols?

### 2. Check each element against the matrix

For every renderer, symbol, and label configuration, look up compatibility in the matrix above. Flag anything that scores ⚠️ or ❌.

### 3. Suggest alternatives

For each incompatible element, recommend a safe fallback:

| Issue | Suggested Fix |
|-------|--------------|
| Character marker (Wingdings) | Replace with simple marker (circle/square) or embed a PNG picture marker |
| Graduated symbols | Switch to graduated colors (fill-based) |
| Hatch fill | Use solid fill with transparency |
| Maplex labels with halos | Simplify to standard labels, remove halos |
| Dot density renderer | Pre-compute density as a field, use graduated colors |
| 3D symbols | Replace with 2D equivalents |

### 4. Produce the report

```markdown
## Symbology Compatibility: Roads Layer → KMZ

**Overall:** ⚠️ 2 issues found

### ❌ Won’t Survive Export
| Element | Issue | Fix |
|---------|-------|-----|
| Character marker (ESRI Default) | Font unavailable in Google Earth | Replace with simple circle marker |

### ⚠️ Partial Support
| Element | Issue | Fix |
|---------|-------|-----|
| Maplex labels with halos | Halos dropped, placement may shift | Remove halos; verify label positions after export |

### ✅ Compatible
- Unique values renderer on ROAD_TYPE — values will transfer
- Simple line symbol — supported in KML
```

## Example Prompts

- "Check if this layer’s symbology will export to KMZ cleanly"
- "Recommend fallback styles for Google Earth"
- "Will my graduated color map survive conversion to KML?"
- "Which of my layers have export-safe symbology?"
- "What symbology should I use if I need to export to both KMZ and shapefile?"

## Artifacts

- `symbology_compat_report.md` — compatibility assessment with fixes

## Entrypoint

- `SKILL.md`

## Tips

- Run this **before** exporting, not after — fixing symbology in ArcGIS Pro is much easier than fixing KML by hand
- When in doubt, use simple markers and solid fills — they have the best cross-format compatibility
- If `arcgispro-cli` is installed, the agent can batch-check all layers in a project at once
- Pair with `/project-audit` for a comprehensive pre-export review
