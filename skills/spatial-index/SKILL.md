---
name: spatial-index
description: Propose spatial indexes and query rewrites to improve spatial query performance in PostGIS or SQL Server
---

# Spatial Index

Propose spatial indexes and query rewrites to improve performance of spatial queries in PostGIS and SQL Server.

## Intent

Help users diagnose slow spatial queries and apply the right indexes, statistics, and query patterns to make them fast.

## Inputs

- `database_engine` (string) — `PostGIS` or `SQL Server`
- `query` (string, optional) — the slow SQL query to optimize
- `table_name` (string) — table to index
- `geometry_column` (string, optional) — geometry column name. Default: `geom` (PostGIS) or `Shape` (SQL Server)
- `row_count` (integer, optional) — approximate row count
- `srid` (integer, optional) — spatial reference ID
- `query_patterns` (string[], optional) — common spatial operations: `st_intersects`, `st_within`, `st_dwithin`, `nearest_neighbor`, `bbox_filter`

## Outputs

- `recommendations` (array of objects) — each contains:
  - `type` — `index`, `rewrite`, `statistics`, `configuration`
  - `engine` — which database it applies to
  - `sql` — the DDL or rewritten query
  - `rationale` — why this helps
  - `expected_impact` — estimated improvement

## Safety

- **Advisory only** — this skill produces SQL recommendations; it does not execute them
- Index creation is non-destructive but may take time on large tables — always note this
- Query rewrites should be tested on a small result set first

## PostGIS Index Guide

### Index Types

| Index | When to use | Create statement |
|-------|------------|-----------------|
| GiST (default) | General-purpose spatial queries — intersects, within, contains | `CREATE INDEX idx_name ON table USING GIST (geom);` |
| SP-GiST | Point data with non-overlapping partitioning | `CREATE INDEX idx_name ON table USING SPGIST (geom);` |
| BRIN | Very large tables with spatially sorted data | `CREATE INDEX idx_name ON table USING BRIN (geom) WITH (pages_per_range=32);` |

### When to use which

```
< 1M rows, mixed geometry types → GiST
Points only, non-overlapping → SP-GiST (often faster for kNN)
> 10M rows, spatially sorted → BRIN (tiny index, great for sequential scans)
```

### Common Query Patterns & Rewrites

**Intersects (most common)**
```sql
-- Slow: function-based filter without index hint
SELECT * FROM parcels WHERE ST_Intersects(geom, ST_GeomFromText('POLYGON(...)'));

-- Fast: identical, but ensure GiST index exists on geom
-- PostGIS uses the index automatically for ST_Intersects
CREATE INDEX IF NOT EXISTS idx_parcels_geom ON parcels USING GIST (geom);
ANALYZE parcels;
```

**Distance search (ST_DWithin vs ST_Distance)**
```sql
-- Slow: computes distance for every row
SELECT * FROM hydrants WHERE ST_Distance(geom, ST_SetSRID(ST_MakePoint(-118.2, 34.0), 4326)) < 1000;

-- Fast: use ST_DWithin — it uses the spatial index
SELECT * FROM hydrants WHERE ST_DWithin(geom, ST_SetSRID(ST_MakePoint(-118.2, 34.0), 4326), 1000);
```

**Nearest neighbor (KNN)**
```sql
-- Slow: ORDER BY distance (computes for all rows)
SELECT * FROM stations ORDER BY ST_Distance(geom, query_point) LIMIT 5;

-- Fast: use <-> operator (index-assisted KNN)
SELECT * FROM stations ORDER BY geom <-> ST_SetSRID(ST_MakePoint(-118.2, 34.0), 4326) LIMIT 5;
```

**Bbox pre-filter**
```sql
-- Use && operator for a fast bounding box check before expensive operations
SELECT * FROM parcels
WHERE geom && ST_MakeEnvelope(-118.3, 34.0, -118.1, 34.1, 4326)
  AND ST_Intersects(geom, complex_polygon);
```

### PostGIS Maintenance

```sql
-- Always ANALYZE after creating an index or bulk loading
ANALYZE table_name;

-- Check index size and usage
SELECT indexrelname, pg_size_pretty(pg_relation_size(indexrelid))
FROM pg_stat_user_indexes WHERE relname = 'table_name';

-- Check if the planner uses the index
EXPLAIN ANALYZE SELECT * FROM parcels WHERE ST_Intersects(geom, ...);
```

## SQL Server Index Guide

### Spatial Index Types

| Index Type | When to use | Notes |
|-----------|------------|-------|
| Geometry (GRID) | Projected coordinates | Uses 4-level grid tessellation |
| Geography (GRID) | Lat/lon (WGS84) | Handles curvature, uses geodetic grid |

### Create Statement

```sql
-- Geometry index — requires a bounding box
CREATE SPATIAL INDEX idx_parcels_shape ON parcels(Shape)
USING GEOMETRY_GRID
WITH (
    BOUNDING_BOX = (xmin=-118.5, ymin=33.5, xmax=-117.5, ymax=34.5),
    GRIDS = (LEVEL_1=MEDIUM, LEVEL_2=MEDIUM, LEVEL_3=MEDIUM, LEVEL_4=MEDIUM),
    CELLS_PER_OBJECT = 16
);

-- Geography index — no bounding box needed
CREATE SPATIAL INDEX idx_points_geog ON points(geog)
USING GEOGRAPHY_GRID
WITH (
    GRIDS = (LEVEL_1=MEDIUM, LEVEL_2=MEDIUM, LEVEL_3=MEDIUM, LEVEL_4=MEDIUM),
    CELLS_PER_OBJECT = 16
);
```

### Grid Density Tuning

| Grid Level | LOW | MEDIUM | HIGH |
|-----------|-----|--------|------|
| Cells | 4×4 | 8×8 | 16×16 |
| Best for | Large features (states, countries) | General-purpose | Small, dense features (points, parcels) |

**Rule of thumb:** Use MEDIUM for most cases. Use HIGH for point-heavy tables. Use LOW for large polygons.

### Common Query Patterns & Rewrites

**Intersects**
```sql
-- Ensure spatial index exists, then:
SELECT * FROM parcels WHERE Shape.STIntersects(@search_polygon) = 1;

-- Force index hint if the optimizer ignores it:
SELECT * FROM parcels WITH (INDEX(idx_parcels_shape))
WHERE Shape.STIntersects(@search_polygon) = 1;
```

**Distance search**
```sql
-- Use STDistance with a WHERE filter
SELECT * FROM hydrants WHERE Shape.STDistance(@point) < 1000;
```

**Nearest neighbor (SQL Server 2012+)**
```sql
-- Use TOP + ORDER BY STDistance
SELECT TOP 5 * FROM stations
ORDER BY Shape.STDistance(@point);
```

### SQL Server Maintenance

```sql
-- Update statistics after bulk operations
UPDATE STATISTICS parcels idx_parcels_shape;

-- Check spatial index usage
SELECT * FROM sys.dm_db_index_usage_stats
WHERE object_id = OBJECT_ID('parcels');

-- View execution plan
SET STATISTICS PROFILE ON;
SELECT * FROM parcels WHERE Shape.STIntersects(@polygon) = 1;
SET STATISTICS PROFILE OFF;
```

## Workflow

### 1. Identify the problem

- Get the slow query, table name, row count, and database engine
- Run `EXPLAIN ANALYZE` (PostGIS) or check the execution plan (SQL Server)
- Look for sequential scans or missing index usage

### 2. Recommend indexes

Match the query pattern to the right index type. Always include the exact `CREATE INDEX` statement.

### 3. Suggest query rewrites

Apply the patterns above. Common wins:
- `ST_Distance < X` → `ST_DWithin(X)` (PostGIS)
- `ORDER BY ST_Distance LIMIT N` → `ORDER BY geom <-> point LIMIT N` (PostGIS KNN)
- Missing `WITH (INDEX(...))` hint (SQL Server)

### 4. Produce the recommendation

```markdown
## Spatial Index Recommendations: parcels table (PostGIS)

**Row count:** ~2.4M | **SRID:** 4326 | **Geometry:** MultiPolygon

### Recommendations
| # | Type | SQL | Impact |
|---|------|-----|--------|
| 1 | Index | `CREATE INDEX idx_parcels_geom ON parcels USING GIST (geom);` | Enables spatial predicate pushdown |
| 2 | Maintenance | `ANALYZE parcels;` | Updates planner statistics |
| 3 | Rewrite | Replace `ST_Distance(...) < 500` with `ST_DWithin(..., 500)` | Uses index instead of full scan |

### Expected Improvement
Query time should drop from ~12s to <200ms with the GiST index and ST_DWithin rewrite.
```

## Example Prompts

- "Suggest indexes for these spatial query patterns in PostGIS"
- "Rewrite this slow spatial join query"
- "What spatial index should I use for 10M points in SQL Server?"
- "My ST_Intersects query takes 30 seconds — how do I fix it?"
- "Compare GiST vs BRIN for my large polygon table"

## Artifacts

- `spatial_index_recommendations.md` — index DDL, query rewrites, and rationale

## Entrypoint

- `SKILL.md`

## Tips

- Always run `ANALYZE` (PostGIS) or `UPDATE STATISTICS` (SQL Server) after creating an index or bulk loading data
- Use `EXPLAIN ANALYZE` to verify the index is actually being used — don't guess
- For PostGIS KNN, the `<->` operator only works with `ORDER BY ... LIMIT` — it won't help without `LIMIT`
- BRIN indexes are tiny but only effective on spatially sorted data — `CLUSTER` the table first if needed
- In SQL Server, the bounding box must cover your data — an incorrect bbox silently degrades performance
