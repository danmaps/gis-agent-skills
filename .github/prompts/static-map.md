# /static-map

Use the `static-map` skill to assess and, when explicitly requested, publish the user's ArcGIS Pro map as a hosted vector tile layer.

## Instructions

1. Read `skills/static-map/SKILL.md` and its references before acting.
2. Identify the APRX path, map, selected layers, intended interaction, useful scales, output name, portal folder, sharing level, and whether execution is requested.
3. Run the decision gate before generating publishing code.
4. If editing, live updates, arbitrary queries, complex filtering, attachments, related records, rich popups, downstream analysis, or complete arbitrary-scale geometry is required, stop the vector-tile workflow and recommend a feature layer or another suitable architecture.
5. Default to prepare mode. Do not publish, share, or replace an item without explicit intent and an authenticated ArcGIS Pro environment.
6. Report supported, approximated, and unsupported symbology. Never silently simplify important cartography.
7. Minimize retained attributes. Use ObjectID only when simple identify requires feature identity.
8. Use `CreateVectorTilePackage` followed by `SharePackage(publish_web_layer=True)` for the static-map route. Do not create an associated feature layer.
9. For replacement, require an explicit existing item ID and preserve the production identity through the ArcGIS Pro replacement workflow when supported.
10. Return a preflight report or publishing receipt, including warnings, limitations, package details, sharing, and item IDs/URLs when available.

## Invocation examples

```text
/static-map Is this map a good candidate for vector tiles?
/static-map Package this APRX for fast web display but do not publish it yet.
/static-map Publish the Wildfire Planning map as an organization-shared read-only map with simple identify.
/static-map Replace vector tile item abc123 with the current version of this map.
```

