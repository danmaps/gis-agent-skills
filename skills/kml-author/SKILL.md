---
name: kml-author
description: Author clean, portable KML/KMZ with deliberate structure, shared styles, links, regions, and validation
---

# KML Author

Author or refactor KML/KMZ for reliable geographic visualization. Prefer readable structure, shared styles, portable resources, and the simplest delivery pattern that fits the dataset.

## Intent

Use KML as a visualization and delivery format, not as a substitute for a full GIS database. Produce KML that is understandable to a person, valid enough to test mechanically, and portable across the intended KML clients.

## Inputs

- `task_description` (string)
- `source_data` (string, optional): layer, GeoJSON, feature class, existing KML/KMZ, or described features
- `layer_inventory` (string, optional): layers to include, their geometry types, and any grouping or folder expectations
- `output_name` (string, optional)
- `target_client` (string, optional): Google Earth web, Google Earth Pro, ArcGIS, or general KML 2.x
- `delivery_mode` (string, optional): kml, kmz, hosted_kml, network_link
- `scale_pattern` (string, optional): small/static, large/static, frequently_updated, tiled_by_region
- `style_requirements` (string, optional): desired visual outcome such as icons, colors, line weights, fills, folders, or highlight behavior
- `symbology_requirements` (string, optional): compatibility constraints, acceptable simplifications, and renderer behaviors that must survive across target clients
- `popup_requirements` (string, optional): fields, HTML, media, and what should or should not appear in descriptions
- `label_requirements` (string, optional): whether labels are required, how they should behave, and any client-specific expectations
- `interaction_requirements` (string, optional): popups, folders, time, tours, overlays, camera/view behavior
- `size_constraints` (string, optional): feature count, expected file size, packaging limits, and performance concerns
- `constraints` (string, optional)

If the target client is unknown, author conservative KML 2.x and flag client-specific extensions or behavior.

## Required alignment pass

Before authoring, refactoring, or recommending structure, align with the user through a targeted QA pass. Keep it brief, but do not skip questions that affect portability, structure, or client behavior.

Confirm or ask about:

1. which layers are included, what geometry type each layer uses, and whether they should stay separate or be grouped
2. which KML clients must work and whether Google Earth, ArcGIS, or browser viewers all need acceptable behavior
3. what the desired styling is, which symbology must survive export, what can be simplified, and whether `/symbology-compat` should be used first
4. what popup content should appear, which fields should be hidden, and whether HTML, media, or links are required
5. whether labels are required, what text should label features, and how important client-specific label behavior is
6. whether file size, feature count, responsiveness, offline use, or attachment bundling creates KML vs KMZ vs NetworkLink constraints
7. whether refresh behavior, hosting, sharing, or update cadence matters
8. any additional acceptance criteria that would change document hierarchy, styles, packaging, or validation

If those answers are missing or ambiguous, stop and ask instead of inventing requirements.

## Authoring rules

### 1. Start with the document hierarchy

Use one root `<kml>` element and normally one `<Document>` beneath it. Inside the document:
- group meaningful themes with `<Folder>`
- give user-facing features clear `<name>` values
- keep IDs stable when styles, updates, or external references depend on them
- do not create folder nesting merely to mirror a source geodatabase

Prefer a hierarchy that helps a human browse the Places panel.

### 2. Reuse styles

For repeated symbology:
- define shared `<Style id="...">` or `<StyleMap id="...">` elements once in the document
- reference them with `<styleUrl>#style-id</styleUrl>`
- use inline styles only for genuinely unique features
- keep normal/highlight pairs in a `StyleMap` when rollover or selection behavior matters

Do not duplicate identical icon, line, polygon, or label styles on every Placemark.

### 3. Author geometry deliberately

KML coordinates are longitude, latitude, and optional altitude. Preserve that ordering.

Choose geometry intentionally:
- `<Point>` for locations
- `<LineString>` for routes and linear features
- `<Polygon>` with explicit outer and inner rings for areas
- `<MultiGeometry>` only when one logical feature truly contains multiple geometries
- `<GroundOverlay>` for georeferenced raster imagery when appropriate

Specify altitude behavior only when it matters. Do not invent Z values. Be cautious with extrusion, tessellation, and client-specific altitude modes because display behavior varies by client.

### 4. Treat descriptions as UI

For `<description>` content:
- keep the popup concise and readable
- escape XML correctly or use CDATA when embedding HTML
- avoid dumping every source field into a balloon
- omit null, internal, or meaningless attributes
- prefer human labels over raw database field names

If rich HTML depends on a particular client, call that out.

### 5. Choose KML versus KMZ intentionally

Use plain `.kml` when the document is small and has no bundled local resources.

Use `.kmz` when icons, images, overlays, models, or other local resources should travel with the document. For KMZ:
- keep the primary KML at the archive root, conventionally `doc.kml`
- use relative paths for bundled resources
- avoid machine-specific absolute file paths
- include only resources actually referenced by the KML
- verify filename case and paths after packaging

### 6. Use NetworkLinks for separately managed or refreshed content

Use `<NetworkLink>` when content should be loaded from another KML/KMZ resource, maintained independently, refreshed, or subdivided for delivery.

When proposing a NetworkLink:
- state the linked resource URL or relative path
- define refresh/view-refresh behavior only when needed
- avoid aggressive refresh intervals without a real operational requirement
- keep authentication and hosting constraints explicit

Do not use NetworkLinks just to make a small static file more complicated.

### 7. Use Region + LOD for large hierarchical content

For large datasets, imagery, or regionated KML, consider `<Region>` with `<LatLonAltBox>` and `<Lod>` so content activates according to view extent and screen size.

When regionating:
- define non-overlapping or intentionally overlapping geographic partitions
- choose `minLodPixels` and `maxLodPixels` based on desired visibility, not arbitrary numbers
- use parent/child NetworkLinks when progressive loading is needed
- ensure the parent hierarchy still gives the user useful context while child content is unloaded

Do not recommend regionation for a few hundred lightweight static features unless testing shows a real performance problem.

### 8. Keep extensions isolated

Prefer portable OGC KML constructs. Use Google `gx:` extensions only when the requested behavior requires them and the target client supports them.

When an extension is used, identify:
- why it is needed
- the namespace declaration
- the expected client dependency
- a portable fallback when practical

## Decision guide

Choose the simplest pattern that fits:

- **Small static dataset:** one KML document with folders and shared styles
- **Static document with icons/images/models:** KMZ with relative resources
- **Large geographic dataset:** regionated KML/KMZ with Region + LOD, often loaded through NetworkLinks
- **Frequently updated hosted content:** small entry KML containing one or more NetworkLinks
- **Client-specific experience:** conservative core KML plus explicitly isolated extensions

## Validation

Before returning a finished artifact or authoring plan, check:

1. XML is well formed.
2. The KML namespace is declared correctly.
3. Coordinates use `longitude,latitude[,altitude]` and are within plausible bounds.
4. Polygon rings are structurally valid and holes are represented as inner boundaries.
5. Every local `styleUrl` resolves to an existing style or style map.
6. Shared styles use unique IDs.
7. NetworkLink targets are resolvable in the intended deployment context.
8. Region bounds are sane and LOD values do not accidentally hide all content.
9. KMZ resources use valid relative paths and are actually present in the archive.
10. No credentials, tokens, private filesystem paths, or unintended internal attributes are embedded.
11. The result is tested in the stated target client when client behavior matters.

When tooling is available, validate against an OGC KML schema or conformance checker in addition to opening the file in a viewer.

## Output

Return the artifacts needed for the task, which may include:
- complete KML XML ready to save
- a KMZ packaging manifest and folder layout
- a refactor plan for an existing KML/KMZ
- shared style definitions
- a NetworkLink + Region/LOD hierarchy
- a concise validation report
- client-compatibility notes and any assumptions

For generated KML, prefer a complete document over disconnected XML fragments unless the user explicitly asks for a fragment.

## Example

**User:** “Build a KMZ for 20,000 inspection points. Use three status icons and keep Google Earth responsive.”

**Output:** Recommend shared status styles, geographic partitioning, child KML resources with Regions/LOD, a small root `doc.kml` containing NetworkLinks, a KMZ resource layout, and validation checks for coordinates, links, styles, and archive paths.

## Related skills

- Use `/symbology-compat` when converting ArcGIS symbology for Google Earth/KMZ delivery.
- Use `/agol-publish-checklist` when the real destination is ArcGIS Online rather than KML delivery.
- Use `/analysis-readiness-check` before authoring when geometry, CRS, nulls, or schema quality are uncertain.

## Safety

Do not invent coordinates, source attributes, URLs, credentials, refresh requirements, or client capabilities. Preserve source geometry and semantics unless the user explicitly requests transformation. Flag behavior that depends on a specific KML client.
