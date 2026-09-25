---
name: living-atlas
description: Find, vet, and use Esri Living Atlas layers safely for production GIS work
---

# Living Atlas

Find Esri Living Atlas content quickly, then verify that the exact item is authoritative, current, usable at the target scale, and safe to reference in production workflows.

## Intent

Use Living Atlas as the first stop for basemaps and common reference layers, but do not stop at “looks official.” Search broadly, verify the item page and service details, then choose whether to reference the live service or make a local copy.

## Inputs

- `task_description` (string)
- `theme` (string, optional: boundaries, imagery, land cover, terrain, demographics, hazards)
- `area_of_interest` (string, optional)
- `target_scale` (string, optional: 1:24k, statewide, national, web map)
- `target_spatial_reference` (string, optional)
- `intended_use` (string, optional: basemap, analysis input, reference overlay, print map, app)
- `needs_offline_copy` (bool, optional)
- `cost_sensitivity` (string, optional: low, medium, high)

## Search workflow

Search in this order:

1. Start with a plain-language subject + AOI + intended use.
2. Narrow by item type:
   - **Feature Layer** for joins, selections, clipping, and editable/tabular workflows
   - **Map Image Layer** for cartography, sublayers, and authoritative map services
   - **Imagery Layer** for raster analysis, imagery basemaps, and pixel queries
3. Prefer authoritative publishers:
   - Esri where Esri is the data steward or curator
   - official programs or agencies when the source is governmental or scientific
   - organizations clearly identified on the item page, not unknown personal accounts
4. Look for Living Atlas / curated-content signals, but still verify the actual item page and service.
5. Compare likely duplicates before choosing one.

### Search query patterns

Use query strings like these, then inspect the top 3 to 5 matches instead of taking the first hit:

1. `title:"USA Counties" AND type:"Feature Layer"`  
   Look for: clear owner, nationwide extent, stable county identifiers, update date, and whether the result is a hosted view or source layer.
2. `"census tract" AND boundaries AND type:"Feature Layer"`  
   Look for: tract GEOID-style keys, vintage/year in title or summary, authoritative steward, and scale suitability for analysis versus display only.
3. `"land cover" AND type:"Imagery Layer"`  
   Look for: resolution, classification legend, year coverage, update cadence, and whether export/pixel access is allowed.
4. `"World Imagery" AND type:"Imagery Layer"`  
   Look for: basemap intent, refresh cadence, source mosaic notes, attribution requirements, and whether the service is suitable for print/export scale needs.
5. `"hillshade" AND type:"Map Image Layer"`  
   Look for: source DEM, resolution, scale thresholds, and whether the layer is designed as reference/cartography rather than analysis input.
6. `"wildfire" AND type:"Feature Layer"`  
   Look for: incident versus perimeter data, latency/update interval, authoritative emergency program owner, and any access or rate-limit notes.

### What to prefer

- Boundaries with stable IDs (`GEOID`, FIPS, ISO, district code) when joins are likely.
- Layers whose summaries clearly state scale, intended use, or update cadence.
- Source layers over derivative views unless the view is the documented public endpoint.
- One authoritative layer with clear lineage over several duplicates with similar titles.

## Vetting checklist

Before using a candidate, verify:

1. **Authoritative source**
   - Who owns it?
   - Is the publisher Esri, an official agency, or a clearly identified program?
   - Does the summary describe source lineage?
2. **License, terms, and attribution**
   - Is use allowed for the planned workflow?
   - Are attribution or logo requirements stated?
   - Is the content premium, credit-consuming, or otherwise cost-controlled?
3. **Scale and intended use**
   - Is it meant for analysis, display, print, or basemap use only?
   - Does the stated scale/resolution fit the target product such as 1:24k?
4. **Freshness**
   - Check modified date, stated update frequency, and any vintage/year in the item.
   - Prefer layers with explicit cadence over ambiguous “recently updated” signals.
5. **Geometry and schema**
   - Confirm geometry type and required fields.
   - Check for stable join keys, coded domains, and field names that may change between vintages.
6. **Extent and spatial reference**
   - Confirm AOI coverage.
   - Confirm WKID / spatial reference and whether reprojection will be needed.
7. **Service limits**
   - Check for export/copy permissions, query limits, max record count, rate limits, and possible credit usage.

### Decision rules

- **Reject** if the owner or source lineage is unclear.
- **Reject** if the item is deprecated, superseded, or obviously stale for the workflow.
- **Reject** if the layer scale/resolution is too coarse for the requested output.
- **Prefer another candidate** if the item is a hosted view and the underlying source layer is available and more stable.
- **Prefer a local copy** if the workflow needs repeatable analysis, offline work, heavy clipping/extracts, or protection from service changes.
- **Prefer the live service** if the value is current reference context and the service is stable, well-attributed, and low-cost.

### Common gotchas

- **Hosted view vs source layer**: views can hide fields, filters, or schema changes; inspect the relationship before using them for analysis.
- **Deprecated or superseded content**: similar titles often hide older vintages.
- **Near-duplicate items**: compare owner, modified date, summary, and URL before choosing.
- **Basemap versus analysis layer confusion**: attractive cartographic layers may not be fit for measurement or joins.
- **Premium/credit surprises**: some enrichment, imagery, or export operations may consume credits even when the item is easy to browse.

## Usage patterns

### Add to ArcGIS Pro

- Search from the portal/catalog when you want item metadata and sharing context.
- Add by service URL when you already vetted the exact endpoint and want to avoid grabbing the wrong similarly named item.
- Record the item ID and service URL in project notes or metadata when the layer matters to production work.

### Common workflows

- **Clip to AOI** when downstream tools only need a subset and repeated live queries would be wasteful.
- **Project to the target SR** before overlay or measurement workflows when the source SR differs from the project standard.
- **Join to local data** only after confirming stable keys, matching vintages, and field types.
- **Create a local copy** when you need reproducibility, offline use, version pinning, or faster repeated analysis.

### Live service vs local copy

Choose a **live service** when:
- the layer is reference context or a basemap
- currency matters more than reproducibility
- the service is stable and low-cost
- the workflow only needs visualization or light querying

Choose a **local copy** when:
- you need a fixed vintage for analysis or reporting
- the workflow is batch, repeated, or offline
- export/query limits will slow the job
- schema drift or hosted-view filters could change results

## Credit, attribution, and cost control

- Always capture the required attribution text when the item page provides it.
- Do not assume “Living Atlas” means unrestricted commercial reuse; verify terms on the item page.
- Prefer lightweight queries, AOI filtering, and local extracts for repeated analysis against large services.
- Avoid unnecessary exports or full-feature copies when a map image layer or basemap reference is enough.
- Call out premium content, credit-bearing tools, or rate-limit risks before committing the workflow.

## Agent prompt templates

1. `Find an authoritative Living Atlas boundaries layer for <AOI>. Compare the top 3 candidates, flag views vs sources, and recommend one for analysis use.`
2. `Find a land cover layer suitable for <target scale>. Explain why the chosen item is appropriate for that scale and whether it should be copied locally.`
3. `Find an imagery basemap for <AOI> and report the update cadence, attribution requirements, and any export or usage limits.`
4. `Find a hazard or incident layer for <topic>. Prioritize the most current authoritative source and note any latency or refresh caveats.`
5. `Find a reference layer for joining to local data. Verify geometry type, key fields, year/vintage, and whether the service is a hosted view.`
6. `Given this Living Atlas item URL, vet it for production use: publisher, license, scale, update cadence, SR, service limits, and copy-vs-live recommendation.`
7. `Find the safest Living Atlas layer for a printed map at <scale>. Reject any candidate that is display-only at the wrong scale or lacks clear attribution guidance.`
8. `Find a terrain or hillshade layer for <AOI>. State whether it is suitable only for visualization or also for analysis, and identify the source DEM if available.`

## Example

**User:** “Find an authoritative county boundaries layer for California and tell me whether I should use it live or make a local copy for a quarterly reporting workflow.”

**Output:** A short comparison of 2 to 3 candidates with owner, type, update date, join-key availability, attribution notes, and a clear recommendation to reference live or copy locally.

## Output

Return:
- 1 to 3 recommended items with item ID, title, owner, type, and URL
- the reasons they passed or failed the vetting checklist
- any attribution, cost, or service-limit warnings
- a clear recommendation to use the live service or create a local copy
- any follow-up ArcGIS Pro steps needed for clip, project, or join workflows

## Related skills

- Use `/agol-search` when you need a generic ArcGIS Online search workflow first.
- Use `/agol-publish-checklist` when the next step is publishing derived content back to ArcGIS Online.

## Safety

Do not claim a layer is authoritative, current, free, exportable, or production-safe unless the item details or service properties support that conclusion. Flag uncertainty, hosted-view ambiguity, premium-content risk, and missing attribution explicitly.
