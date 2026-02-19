---
name: schema-smells
description: Identify GIS data schema smells and propose constraints and validation tests to detect risky patterns early
---

# Schema Smells

Identify data schema smells — suspicious patterns in field definitions, domains, geometry, and attribute values — and propose constraints, tests, and cleanup steps.

## Intent

Help users catch data quality problems at the schema level before they cascade into broken analyses, bad maps, or failed publishes.

## Prerequisites

### Recommended: `arcgispro-cli`

Install [`arcgispro-cli`](https://pypi.org/project/arcgispro-cli/) to inspect field schemas directly:

```powershell
pip install arcgispro-cli
arcgispro install
```

```bash
arcgispro fields "Parcels" --json   # field names, types, domains
arcgispro layer "Parcels" --json    # full layer details
```

### Alternative: ArcPy inspection

```python
import arcpy
for field in arcpy.ListFields(r"C:\Data\Default.gdb\Parcels"):
    print(f"{field.name}  {field.type}  {field.length}  domain={field.domain}")
```

## Inputs

- `layer_name` (string) — layer or feature class to inspect
- `field_list` (array, optional) — if no CLI, user-provided field definitions (name, type, length, domain)
- `sample_values` (object, optional) — example values for key fields to help detect value-level smells

## Outputs

- `smells` (array of objects) — each smell contains:
  - `category` — smell category
  - `severity` — `high`, `medium`, `low`
  - `field` — affected field name (or `geometry` / `schema`)
  - `description` — what's wrong
  - `test` — proposed validation query or constraint
  - `fix` — recommended remediation

## Safety

- **Read-only** — this skill inspects schemas and values; it never modifies data
- Proposed fixes are suggestions that require user review and execution
- Safe to run on production data

## Smell Catalog

### 1. Geometry Smells

| Smell | What it means | Test |
|-------|--------------|------|
| Null geometry | Features with no shape — break spatial operations | `SELECT * WHERE Shape IS NULL` |
| Empty geometry | Shape exists but has no coordinates | `SELECT * WHERE Shape.STIsEmpty() = 1` (SQL Server) |
| Self-intersecting polygons | Topology errors that cause overlay failures | `arcpy.management.CheckGeometry()` |
| Null island (0,0) | Coordinates at 0°N 0°E — usually geocoding failures | `SELECT * WHERE Shape.STX BETWEEN -0.01 AND 0.01 AND Shape.STY BETWEEN -0.01 AND 0.01` |
| Extreme coordinates | Values outside expected extent | Compare against layer's expected geographic bounds |
| Mixed geometry types | Points mixed with polygons in the same class | Check `shapeType` consistency |
| Tiny slivers | Polygons with area near zero — artifacts of overlay | `SELECT * WHERE Shape_Area < {threshold}` |

### 2. Field Definition Smells

| Smell | What it means | Test |
|-------|--------------|------|
| Overly wide text | `Text(4000)` when max actual value is 15 chars | `SELECT MAX(LEN(field_name))` and compare to field length |
| All-null field | Column exists but has no data | `SELECT COUNT(*) WHERE field IS NOT NULL` = 0 |
| Misleading field name | Field named `DATE` but type is `Text` | Cross-check name against type |
| Duplicate names (case) | `Status` and `STATUS` in the same table | List fields, check for case-insensitive duplicates |
| Reserved words | Fields named `date`, `table`, `user`, `index` | Compare against SQL reserved word list |
| No domain on coded field | A field with obvious categories but no coded value domain | Check distinct values — if < 20 unique values, suggest domain |
| Missing alias | Field alias is the same as the raw name | Check `field.aliasName != field.name` |

### 3. Value Smells

| Smell | What it means | Test |
|-------|--------------|------|
| Mixed units | Feet and meters in the same field | Look for bimodal distributions or unit suffixes in text |
| Inconsistent casing | "Active", "ACTIVE", "active" for the same concept | `SELECT DISTINCT field` and compare |
| Placeholder values | `-999`, `9999`, `N/A`, `TBD`, `unknown` used instead of NULL | `SELECT * WHERE field IN (-999, 9999, 'N/A', 'TBD')` |
| Encoded values without domain | Numeric codes (1, 2, 3) with no coded value domain | Flag if distinct values are small integers with no domain |
| Dates as text | `"2024-01-15"` stored in a text field instead of date type | Check for date-like patterns in text fields |
| Leading/trailing spaces | Invisible whitespace causing failed joins | `SELECT * WHERE field != TRIM(field)` |
| Outlier values | Numeric values orders of magnitude from the median | Calculate min/max/stddev and flag extremes |

### 4. Schema-Level Smells

| Smell | What it means | Test |
|-------|--------------|------|
| Too many fields | 50+ fields — likely includes unnecessary system or internal columns | Count fields; flag if > 40 |
| No ObjectID / GlobalID | Missing for editing and replication workflows | Check for OID and GlobalID fields |
| No editor tracking | Collaborative data with no audit trail | Check `editorTrackingEnabled` |
| Missing spatial index | Large dataset without a spatial index — slow spatial queries | `arcpy.Describe(fc).hasSpatialIndex` |
| Mixed spatial references | Related tables/joins from different coordinate systems | Compare SR across joined sources |

## Workflow

### 1. Gather schema info

```bash
arcgispro fields "Parcels" --json
arcgispro layer "Parcels" --json
```

Or via ArcPy:
```python
desc = arcpy.Describe(fc)
fields = arcpy.ListFields(fc)
```

### 2. Scan for smells

Check each field and the geometry against the smell catalog. For each smell found, record the category, severity, and a concrete test the user can run.

### 3. Produce the report

```markdown
## Schema Smells: Parcels

**Found:** 4 smells (1 high, 2 medium, 1 low)

### 🔴 High
| Field | Smell | Test | Fix |
|-------|-------|------|-----|
| Shape | 12 null geometries | `SELECT * WHERE Shape IS NULL` | Delete or flag for review |

### 🟡 Medium
| Field | Smell | Test | Fix |
|-------|-------|------|-----|
| OWNER_NAME | Leading/trailing spaces in 43 rows | `WHERE OWNER_NAME != TRIM(OWNER_NAME)` | `TRIM()` update |
| STATUS | No domain — 5 distinct values | `SELECT DISTINCT STATUS` | Create coded value domain |

### 🟢 Low
| Field | Smell | Test | Fix |
|-------|-------|------|-----|
| NOTES | Text(4000) but max actual length is 87 | `SELECT MAX(LEN(NOTES))` | Reduce to Text(255) |

### ✅ Clean
- ObjectID and GlobalID present
- Spatial reference defined (WGS 1984)
- Editor tracking enabled
```

## Example Prompts

- "Find schema smells in this feature class"
- "Propose constraints and validation tests for this dataset"
- "Check for null island coordinates in my points layer"
- "Are there any fields that should have domains but don't?"
- "Audit the schema of this layer before I publish it"

## Artifacts

- `schema_smells_report.md` — smell report with tests and fixes

## Entrypoint

- `SKILL.md`

## Tips

- Run this skill early in a project, not just before publishing — smells compound over time
- Pair with `/agol-publish-checklist` to catch schema issues before hosting
- If `arcgispro-cli` is installed, the agent can inspect real field schemas automatically
- The proposed SQL tests can be run directly in ArcGIS Pro's Select By Attributes or Python window
