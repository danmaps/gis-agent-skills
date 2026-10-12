---
name: cartolite
description: Build standalone, single-file HTML map viewers with zero build steps, using sandbox-safe Leaflet with ArcGIS REST layers or the ArcGIS Maps SDK.
---

# CartoLite: Standalone Single-File Map Maker

Build standalone, self-contained single `.html` file map viewers that open cleanly both in **sandboxed in-app previewers (such as Microsoft Copilot / Teams artifact previews, Claude artifacts, or WebViews)** and in standard browsers with zero build steps or npm dependencies.

## ⚠️ Sandbox & Preview Environment Compatibility

In-app HTML previewers (such as Microsoft 365 Copilot artifact previews) run inside an isolated iframe with a strict security sandbox and pre-bundled libraries:
- **Pre-bundled / Supported map library**: `leaflet` and `leaflet.markercluster` are bundled and available in the environment.
- **External CDNs blocked**: In-app previewers block arbitrary external `<script>` and `<link>` CDNs (such as `js.arcgis.com`) and do not provide AMD `require()`. Attempting to load `js.arcgis.com` inside an in-app previewer produces:
  `CdnAliasUnresolved - Unresolved CDN references`
  `Runtime error: Uncaught ReferenceError: require is not defined`
- **Core Rule**:
  1. **Default to Leaflet** (`L.map`) for standalone previews and artifacts. Leaflet is pre-bundled in sandboxes and easily connects to ArcGIS Online REST endpoints (Esri tiles, FeatureServer queries, and GeoJSON).
  2. If the user specifically asks for the native ArcGIS Maps SDK (`@arcgis/core` or `js.arcgis.com`), provide the standalone HTML file for local download (`file:///` or browser launch) and explicitly state that the in-app previewer blocks external CDNs.

## Architecture with Sandbox-Safe Leaflet

- **Zero External CDN Dependencies**: Works with the bundled `leaflet` library.
- **ArcGIS REST Service Integration**:
  - **ArcGIS Feature Services**: Query features with `.../FeatureServer/0/query?where=1%3D1&outFields=*&f=geojson` and render using `L.geoJSON()`.
  - **Tile / Basemap Services**: Connect to ArcGIS World Topo, Gray Canvas, or OpenStreetMap tile endpoints directly via `L.tileLayer()`.
- **Responsive Layout**: Full viewport (`width: 100%; height: 100vh; margin: 0; padding: 0;`).
- **Overlay UI**: Floating card for title, subtitle, and legend in clean modern CSS.

## Code Sample: Complete Sandbox-Ready Map

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>California Wildfires - CartoLite</title>
  <!-- In in-app preview sandboxes (like M365 Copilot / Claude artifacts), Leaflet is already pre-bundled!
       No external <link> or <script> tags needed. For local browser execution, Leaflet CDN links can be added. -->
  <style>
    html, body, #map {
      padding: 0;
      margin: 0;
      height: 100%;
      width: 100%;
      background: #121212;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    .floating-header {
      position: absolute;
      top: 15px;
      left: 50px;
      z-index: 1000;
      background: rgba(24, 24, 27, 0.9);
      backdrop-filter: blur(8px);
      padding: 12px 18px;
      border-radius: 8px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
      max-width: 360px;
      color: #f4f4f5;
    }
    .floating-header h1 {
      font-size: 15px;
      font-weight: 600;
      margin: 0 0 4px 0;
      color: #ffffff;
    }
    .floating-header p {
      font-size: 12px;
      margin: 0;
      color: #a1a1aa;
      line-height: 1.4;
    }
    .legend-box {
      margin-top: 8px;
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 11px;
      color: #e4e4e7;
    }
    .legend-color {
      width: 14px;
      height: 14px;
      background: #ef4444;
      border: 1px solid #b91c1c;
      border-radius: 3px;
    }
  </style>
</head>
<body>
  <div class="floating-header">
    <h1>California Wildfires (Active Perimeters)</h1>
    <p>Authoritative incident data via ArcGIS REST</p>
    <div class="legend-box">
      <span class="legend-color"></span> Active Fire Perimeter
    </div>
  </div>
  <div id="map"></div>

  <script>
    document.addEventListener("DOMContentLoaded", function() {
      // 1. Initialize Leaflet Map
      const map = L.map("map", {
        zoomControl: false
      }).setView([37.0, -120.0], 6);

      L.control.zoom({ position: "top-left" }).addTo(map);

      // 2. Basemap (CartoDB Dark Matter / OSM / Esri TileLayer)
      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        attribution: "&copy; OpenStreetMap contributors &copy; CARTO",
        maxZoom: 19
      }).addTo(map);

      // 3. Query ArcGIS REST FeatureServer directly as GeoJSON
      const agolEndpoint = "https://services9.arcgis.com/RHVPKKiFTONKtxq3/arcgis/rest/services/USA_Wildfires_v1/FeatureServer/0/query?where=1%3D1&outFields=IncidentName,DailyAcres,PercentContained&f=geojson";

      fetch(agolEndpoint)
        .then(res => res.json())
        .then(data => {
          L.geoJSON(data, {
            style: {
              color: "#ef4444",
              weight: 2,
              fillColor: "#ef4444",
              fillOpacity: 0.35
            },
            onEachFeature: function(feature, layer) {
              const props = feature.properties || {};
              // Construct popup with textContent to safely prevent XSS from unescaped attribute text
              const popupContainer = document.createElement("div");
              popupContainer.style.fontFamily = "sans-serif";
              popupContainer.style.fontSize = "13px";

              const titleEl = document.createElement("strong");
              titleEl.style.fontSize = "14px";
              titleEl.style.color = "#111";
              titleEl.textContent = props.IncidentName || "Wildfire Incident";
              popupContainer.appendChild(titleEl);

              const detailsEl = document.createElement("div");
              detailsEl.style.marginTop = "6px";
              detailsEl.style.color = "#444";
              
              const acres = props.DailyAcres ? Number(props.DailyAcres).toLocaleString() : "N/A";
              const contained = props.PercentContained !== undefined ? props.PercentContained + "%" : "Unknown";
              detailsEl.textContent = `Acres: ${acres} | Containment: ${contained}`;
              popupContainer.appendChild(detailsEl);

              layer.bindPopup(popupContainer);
            }
          }).addTo(map);
        })
        .catch(err => {
          console.warn("Could not query feature service:", err);
        });
    });
  </script>
</body>
</html>
```

## Inputs

- `task_description` (string): Description of the map visualization, layers, and interactive behavior
- `data_source` (string or object): ArcGIS REST FeatureServer URL, GeoJSON, or inline features
- `title` (string, optional): Map title displayed in the header overlay
- `center` (array of numbers, optional): `[latitude, longitude]`
- `zoom` (number, optional): Initial zoom level (1–19)
- `theme` (string, optional: `dark`, `light`)

## Output

Return:
- A standalone, single-file `.html` map document compatible with in-app preview environments.
- Summary of included layers, styling, and basemap.
- Confirmation that no external unauthorized CDNs or private tokens were used.

## Example

**User:** "Create a single-file map showing active California wildfires with popup stats."
**Output:** Generates `wildfires.html` using the template above, ready to view in the in-app preview window without library or CDN errors.
