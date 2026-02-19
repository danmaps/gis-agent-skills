---
name: geoparquet-pack
description: Recommend GeoParquet layouts, partitioning strategies, and encoding options based on access patterns
---

# GeoParquet Pack

Recommend an optimal GeoParquet file layout — partitioning strategy, column types, geometry encoding, row group sizing, and statistics — based on the dataset and how it will be queried.

## Intent

Help users move from shapefile/FGDB/GeoJSON to GeoParquet with a layout that's fast to query, efficient to store, and compatible with modern tools (DuckDB, GDAL, GeoPandas, BigQuery, etc.).

## Inputs

- `dataset_description` (string) — what the data represents (e.g. "3M global building footprints")
- `geometry_type` (string) — `Point`, `LineString`, `Polygon`, `MultiPolygon`, etc.
- `row_count` (integer, optional) — approximate feature count
- `column_count` (integer, optional) — number of attribute columns
- `primary_access_pattern` (string, optional) — how the data will be queried: `spatial_filter`, `attribute_filter`, `full_scan`, `time_series`, `tile_serving`
- `file_size_target` (string, optional) — e.g. `< 1 GB per file`, `cloud-optimized`
- `tool_ecosystem` (string[], optional) — target tools (e.g. `DuckDB`, `GeoPandas`, `GDAL`, `BigQuery`, `Spark`)

## Outputs

- `layout_recommendation` (object) — containing:
  - `partitioning` — partitioning strategy with rationale
  - `geometry_encoding` — WKB vs. native encoding choice
  - `row_group_size` — recommended rows per group
  - `compression` — codec recommendation (Snappy, ZSTD, etc.)
  - `column_types` — type recommendations for key columns
  - `bbox_columns` — whether to include bounding box columns
  - `statistics` — which column stats to store
  - `file_organization` — single file, hive-partitioned directory, etc.

## Safety

- **Advisory only** — this skill produces recommendations, not files
- Does not read, write, or transform any data
- Recommendations should be validated with a small sample before applying to the full dataset

## Partitioning Strategies

| Strategy | Best for | How it works |
|----------|----------|-------------|
| **No partition** (single file) | < 1M rows, simple sharing | One `.parquet` file, simplest to consume |
| **Spatial (S2 / H3 / geohash)** | Spatial filtering on large datasets | Partition by spatial cell ID for fast bbox/point-in-polygon queries |
| **Administrative boundary** | Country/state/region-scoped access | `country=US/state=CA/data.parquet` — intuitive, cloud-friendly |
| **Temporal** | Time-series or append-heavy data | `year=2024/month=06/data.parquet` — efficient range scans |
| **Spatial + Temporal** | Large spatiotemporal datasets | Two-level partitioning: spatial cell → time bucket |
| **Row-count based** | Even file sizes for parallel processing | Split into N files of ~100K–500K rows each |

### Spatial Partitioning Detail

| Method | Resolution | Pros | Cons |
|--------|-----------|------|------|
| S2 cells (level 10–12) | ~1–10 km² | Google ecosystem, good for points | Less intuitive than geohash |
| H3 hexagons (res 4–6) | ~1–100 km² | Uniform area, great for analytics | Requires H3 library |
| Geohash (4–6 chars) | ~1–100 km² | Simple string prefix queries | Rectangular, edge effects |
| Hilbert curve | Configurable | Optimal locality, used by GeoParquet spec | Requires computation |
| Admin boundaries | Variable | Human-readable | Uneven partition sizes |

## Geometry Encoding

| Encoding | Support | Size | Notes |
|----------|---------|------|-------|
| WKB (ISO) | Universal | Larger | Default, works everywhere |
| GeoArrow (native) | Growing | Smaller, faster | DuckDB, newer GDAL; not yet universal |
| Separated coords | Experimental | Smallest for points | Point-only, maximum performance |

**Recommendation:** Use WKB for maximum compatibility. Use GeoArrow if your tool ecosystem fully supports it.

## Row Group Sizing

| Dataset Size | Recommended Row Group | Rationale |
|-------------|----------------------|-----------|
| < 100K rows | Single group | No benefit from splitting |
| 100K – 10M | 50K – 100K rows | Good balance of predicate pushdown and read efficiency |
| > 10M | 100K – 500K rows | Enables efficient spatial filtering with row group stats |

## Compression

| Codec | Ratio | Speed | Best for |
|-------|-------|-------|----------|
| Snappy | Low | Fast | Interactive queries, low latency |
| ZSTD (level 3) | High | Medium | Storage-optimized, cloud storage |
| ZSTD (level 9+) | Highest | Slow | Archival, infrequent access |
| None | 1:1 | Fastest | When storage is free and speed is critical |

**Recommendation:** ZSTD level 3 as default — best tradeoff for most GIS workloads.

## Workflow

### 1. Assess the dataset

Gather: row count, column count, geometry type, file size, and expected query patterns.

### 2. Choose partitioning

Match the primary access pattern to a strategy:

```
Spatial filtering → Spatial partitioning (Hilbert or H3)
Attribute filtering → Hive partitioning on filter column
Full scan analytics → No partitioning, optimize row groups
Time series → Temporal partitioning
Tile serving → Spatial partitioning at tile-aligned resolution
```

### 3. Produce the recommendation

```markdown
## GeoParquet Layout: Global Building Footprints (3M rows)

### Summary
| Setting | Recommendation |
|---------|---------------|
| Partitioning | Hilbert curve (resolution 12) |
| Geometry encoding | WKB |
| Row group size | 100,000 rows |
| Compression | ZSTD level 3 |
| Bbox columns | Yes (xmin, ymin, xmax, ymax) |
| File organization | Single file with spatial sorting |

### Rationale
- Hilbert partitioning provides excellent spatial locality for bbox queries
- WKB encoding for compatibility with DuckDB, GeoPandas, and GDAL
- ZSTD-3 reduces file size ~60% with minimal query overhead
- Bbox columns enable predicate pushdown without decoding geometry

### Conversion Example
```python
import geopandas as gpd

gdf = gpd.read_file("buildings.gpkg")
gdf.to_parquet(
    "buildings.parquet",
    compression="zstd",
    write_covering_bbox=True,
    geometry_encoding="WKB",
    row_group_size=100_000,
)
```

### Validation
- [ ] Query a spatial bbox and confirm row group pruning in DuckDB
- [ ] Verify file size is within target
- [ ] Confirm all target tools can read the output
```

## Example Prompts

- "Recommend a GeoParquet layout for read-heavy analytics on 50M points"
- "Suggest partitioning for a global polygon dataset queried by country"
- "What's the best compression for GeoParquet served from S3?"
- "How should I convert a 2GB shapefile to cloud-optimized GeoParquet?"
- "Compare H3 vs geohash partitioning for my point dataset"

## Artifacts

- `geoparquet_layout.md` — layout recommendation with rationale and conversion example

## Entrypoint

- `SKILL.md`

## Tips

- Always include `write_covering_bbox=True` — it's the single biggest performance win for spatial queries
- Sort data spatially (Hilbert curve) before writing, even without partitioning — improves row group stats dramatically
- Test with DuckDB's `EXPLAIN ANALYZE` to verify predicate pushdown is working
- For datasets under 1M rows, a single well-sorted file usually outperforms partitioned directories
