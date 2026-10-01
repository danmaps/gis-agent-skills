# Static Map Publishing Patterns

## Prepare-first pattern

1. Inspect the APRX and selected map.
2. Decide whether the requirements fit vector tiles.
3. Report layer and symbology warnings.
4. Confirm output path, scale range, sharing, and replacement intent.
5. Generate a reviewable ArcPy script.
6. Execute only after explicit approval in an authenticated ArcGIS Pro environment.

## Package-and-publish pattern

Use ArcGIS Pro's `CreateVectorTilePackage` to create a `.vtpk`, then use `SharePackage` with `publish_web_layer=True`. This expresses the desired artifact and avoids creating an unnecessary associated feature layer.

## Replacement pattern

When an existing item ID is supplied with explicit replacement intent:

1. create and inspect a new `.vtpk`
2. publish or stage the replacement package
3. use the ArcGIS Pro replacement workflow
4. preserve the production item identity when supported
5. report the archive/new-item behavior and receipt

Never infer replacement from a matching output name.

## Receipt

Include:

```text
STATIC MAP PUBLISHED
Source
------
Project: <project>
Map: <map>
Layers: <count>
Architecture
------------
Hosted Vector Tile Layer
Associated Feature Layer: none
Editing: unavailable
Query service: unavailable
Package
-------
<path>
Size: <size>
Popup fields retained: <fields>
ArcGIS Online
-------------
Vector tile item: <id/url>
Sharing: <level>
Folder: <folder>
Warnings
--------
<numbered warnings>
Why vector tiles
----------------
<requirements-based explanation>
Republish
---------
Run /static-map and reference this item ID to replace the published map.
```

