---
name: arcgis-single-file-map
description: Build a polished standalone HTML map from ArcGIS REST/GeoJSON data, designed to be double-clicked and opened from the local computer using the ArcGIS Maps SDK 5.x web components.
---

# ArcGIS Single-File Map

Produce one `.html` file that the user can **double-click to open in a browser** from their own computer. No server, no build step, no install. It needs internet access to load the ArcGIS Maps SDK and basemap from `js.arcgis.com`.

Use `references/single-file-template.html`. Edit only its `CONFIG` block.

## What the template gives you

- Full-window `<arcgis-map>` with zoom, home, search, legend, dual scale bar, and a basemap toggle (street/topo to satellite).
- Title card with a live feature count.
- Auto-zoom to the data, click popups, optional unique-value styling via `colorBy` (legend updates automatically).
- Visible on-page error message if the SDK or a layer fails to load.

## SDK rules

- Use **ArcGIS Maps SDK 5.x** (`SDK_VERSION` 5.1 pinned in the script URLs; `5.2` currently serves a pre-release build). 5.x is ES-module only: no `require()`, no AMD. Use `$arcgis.import(["@arcgis/core/..."])` for core classes.
- Use the web components (`<arcgis-map>`, `<arcgis-legend>`, ...) instead of the deprecated 4.x widgets.
- Do not use 4.x or CDN-less Leaflet unless the user asks.

## Rules

- **Public data only.** Never embed tokens, API keys, or credentials; do not point at secured or internal services.
- Opened from `file://`, so use `https://` URLs for data. For relative GeoJSON files, tell the user it may be blocked by the browser; embed it inline (`geojson: { ... }`) when small.
- Keep the page self-contained: one file, only the template's CDN references.
- Popups must use `fieldInfos`/text, never `innerHTML` with attribute values.
- Large layers: prefer a `where` filter or `maxFeatures`; tell the user if the layer is big or truncated.
- Choose a purposeful design: meaningful title and subtitle, a color that suits the topic, `colorBy` when a category field is useful, a basemap that fits (`gray-vector` for dense data, `satellite`/`hybrid` for imagery context, `topo-vector` by default).

## ArcGIS data patterns

- `url`: public FeatureServer or MapServer layer URL (e.g. `.../FeatureServer/0`). Check fields first with `<layer>?f=json` to pick `popupFields` and `colorBy`.
- `geojson`: a URL or an inline object.
- Multiple layers: add more entries to `layers`; the first is used for zoom-to-data.
- Add `where` to filter (e.g. `STATE = 'CA'`).

## Workflow

1. Identify the data and inspect its fields and geometry type.
2. Copy `references/single-file-template.html` to `output_path` (default `map.html`) and edit `CONFIG`.
3. Open it in a browser and confirm it renders the basemap, features, popups, and legend. Fix any on-page error message.
4. Tell the user to double-click the file to open it.

## Inputs

- `task_description` (string): Map, layers, and interactions wanted
- `data_source` (string or object): Public ArcGIS REST layer URL, GeoJSON, or inline features
- `title` (string, optional)
- `center` (array, optional): `[longitude, latitude]`
- `zoom` (number, optional)
- `output_path` (string, optional): default `map.html`

## Output

- The standalone `.html` file.
- Short summary of layers, symbology, and basemap.
- Whether it was opened and verified, plus any truncation.
- Confirmation that no credentials were used.

## Example

**User:** "Make a map of active wildfires I can double-click to open."
**Result:** `wildfires.html` from the template with `layers[0].url` set to the public perimeters layer, title and color set, and `colorBy` on a status field. Opens straight from disk with a basemap, legend, search, and popups.
