---
name: arcgis-single-file-map
description: Build a standalone single-file HTML map for SharePoint/Copilot HTML embeds and plain browsers, using the dynamically loaded ArcGIS Maps SDK 5.x with a Leaflet fallback and ArcGIS REST data.
---

# ArcGIS Single-File Map

Produce one self-contained `.html` file, no build step, that works in:

1. **SharePoint / Microsoft 365 HTML embeds** (and Copilot-generated previews where the host allows it)
2. **Any browser**

Use `references/single-file-template.html`. Edit only its `CONFIG` block.

## SDK version (important)

- **Prefer the latest ArcGIS Maps SDK 5.x** (template pins `SDK_VERSION = "5.1"`, the latest stable; `5.2` currently serves a pre-release build whose modules fail to load). 4.34 still works but logs deprecation errors for every widget (Search, Home, ScaleBar, Legend, Expand) and is the last AMD release; do not use it.
- 5.x is **ES-module only: there is no `require()`**. Load `https://js.arcgis.com/5.x/` as `type="module"`, then use the `$arcgis` global: `await $arcgis.import(["@arcgis/core/Map.js", ...])`.
- Never mix a module-type SDK tag with `require([...])` or use 4.x-style `esri/Map` module ids.
- The template injects the module script at runtime (`script.type = "module"`), waits for `onload`, then calls `$arcgis.import`. This is the pattern that survives SharePoint HTML embeds.
- **Avoid deprecated widgets** (`Search`, `Home`, `ScaleBar`, `Legend`, `Expand`). Use the `<arcgis-search>`, `<arcgis-legend>`, etc. components if UI is needed (they need the map-components script from the same CDN), or keep the UI to the built-in zoom control and the HTML legend card.
- Leaflet as a pre-bundled global fails in SharePoint (`This preview blocks the map library`), so it is only a fallback.
## Rules

- **SDK first, Leaflet second, built-in offline map last.** SharePoint/Copilot embeds run in an `about:srcdoc` iframe with an enforced CSP (`script-src 'unsafe-inline'`, `style-src 'unsafe-inline'`, `img-src data: blob:` plus a few hosts), so script CDNs, external CSS and tile images are all blocked. The built-in fallback needs no network: it draws the embedded `references/basemap-offline.json` (world + US state outlines) and `inlineGeoJSON` as SVG with pan/zoom/popups. **For embed targets, always embed an `inlineGeoJSON` snapshot and paste the contents of `basemap-offline.json` over `const OFFLINE_BASEMAP = null;`** (~50 KB).
- **Time out** script loads (15 s SDK, 8 s Leaflet) so failure is visible.
- **Size to the frame**: `html, body { height: 100% }` and an absolutely positioned `#map`; avoid `100vh`.
- **Public data only.** Never embed tokens, API keys, or credentials; do not point at secured or internal services.
- **Passive page.** No `window.top`/`parent` access, `alert`, popups, `target="_blank"`, or form posts.
- **Safe popups.** The SDK popup template and Leaflet fallback never inject attribute values with `innerHTML`.
- **Snapshot for resilience.** For small results, also embed `inlineGeoJSON` so the Leaflet fallback and blocked-network cases still show data.
- **Compact UI.** One title card, one legend row, `pointer-events: none` on the card.
- Hosts differ by tenant CSP. State that the result was validated against the user's host only if it was; otherwise ask them to test in the target page.

## ArcGIS data patterns

- `featureUrl`: public FeatureServer layer URL (e.g. `.../FeatureServer/0`); the SDK uses `FeatureLayer` directly and zooms to the data.
- The Leaflet fallback queries `<layer>/query?where=1%3D1&outFields=*&resultRecordCount=2000&f=geojson`. Check `exceededTransferLimit` and tell the user if truncated.
- Change `basemap` to any ArcGIS basemap id (`topo-vector`, `streets-vector`, `gray-vector`, `satellite`).

## Workflow

1. Copy `references/single-file-template.html`.
2. Edit `CONFIG`: title, subtitle, `center` (`[lon, lat]`), zoom, `featureUrl`, color, `popupFields`, optional `inlineGeoJSON`.
3. Save as `output_path` (default `map.html`).
4. Tell the user how to embed it (SharePoint HTML/Embed web part, or upload and open) and what to check.

## Inputs

- `task_description` (string): Map, layers, and interactions wanted
- `data_source` (string or object): Public ArcGIS REST FeatureServer URL, GeoJSON, or inline features
- `title` (string, optional)
- `center` (array, optional): `[longitude, latitude]`
- `zoom` (number, optional)
- `output_path` (string, optional): default `map.html`

## Output

- The standalone `.html` file.
- Short summary of layers, symbology, and basemap.
- Which rendering path was verified (SDK, Leaflet fallback, offline map, or none) and any truncation.
- Confirmation that no credentials were used.

## Example

**User:** "Make a map of active California wildfires for our SharePoint page."
**Result:** `wildfires.html` from the template with `featureUrl` set to the public perimeters layer; renders via the ArcGIS SDK, falls back to Leaflet if blocked.
