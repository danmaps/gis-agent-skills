---
name: agol-search
description: Search ArcGIS Online and Living Atlas, vet candidate items, and recommend a safe fit for the intended GIS workflow
---

# ArcGIS Online and Living Atlas Search

Find relevant ArcGIS Online content, then verify that each candidate is authoritative, current, suitable for the intended use, and safe to reference. Use Living Atlas as a first stop for basemaps and common reference layers, but verify the exact item rather than assuming curated content is automatically suitable.

## Inputs

- `query` or `task_description` (string): subject, area of interest (AOI), and intended use
- `item_types` (array, optional): for example Feature Layer, Map Image Layer, or Imagery Layer
- `owner` (string, optional)
- `org_only` (bool, optional)
- `sort` (string, optional: relevance, modified, title)
- `limit` (int, optional, default 10)
- `target_scale` and `target_spatial_reference` (optional)
- `intended_use` (optional: basemap, analysis input, reference overlay, print map, or app)
- `needs_offline_copy` (bool, optional)

## Search workflow

1. Search broadly using the subject, AOI, and intended use; prefer exact title matches when a title is provided.
2. Narrow results by item type, owner, or organization when needed. For common reference data and basemaps, check Living Atlas candidates first.
3. Compare the best 3 to 5 candidates. Do not select the first result solely by rank or title.
4. Inspect the item details and service properties for publisher, source lineage, modified date or stated vintage, terms and attribution, geometry, schema, extent, spatial reference, scale/resolution, and query/export limits.
5. Recommend a live service or local copy based on the workflow:
   - Prefer a live service for current reference context when it is stable, appropriately licensed, and low-cost.
   - Prefer a local copy for repeatable, offline, heavy, or version-pinned analysis, after confirming export permission and limits.

## Vetting rules

- Prefer authoritative publishers and clear source lineage. Reject candidates with unclear ownership, deprecated content, stale vintages, or unsuitable scale/resolution.
- Prefer source layers over derivative views when the source is available and appropriate; inspect views for filters or hidden fields before analysis.
- Confirm stable join keys, geometry type, AOI coverage, spatial reference, and service limits when relevant to the requested use.
- Verify license, attribution, premium status, credit use, and export permissions from item details. Never infer these from a Living Atlas label.
- Keep searches lightweight; avoid unnecessary full-service exports or copies.
- Do not expose credentials or tokens. Do not claim an item is authoritative, current, free, exportable, or production-safe unless the item details support that conclusion.

## Output

Return 1 to 3 recommended items, each with:
- title, item ID, item type, owner, modified date, and URL
- why it fits or does not fit the requested workflow, including relevant schema, scale, extent, and freshness details
- attribution, license, cost, and service-limit warnings
- a clear live-service versus local-copy recommendation

If the details needed to vet an item are unavailable, state what is unknown and avoid making unsupported claims.

## Example

**User:** “Find an authoritative county boundaries layer for California for a quarterly reporting workflow. Compare the best candidates and tell me whether to use one live or make a local copy.”

**Output:** A concise comparison of 1 to 3 candidates, including owner, type, item ID, URL, update/vintage, join-key availability, attribution and usage warnings, and a clear recommendation with reasons.
