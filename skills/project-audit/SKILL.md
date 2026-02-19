---
name: project-audit
description: Produce a GIS project audit checklist and report template to identify broken sources, SR mismatches, and risky configuration
---

# Project Audit

Inspect an ArcGIS Pro project and produce a structured audit report covering broken data sources, spatial reference mismatches, definition query issues, and risky configurations.

## Intent

Help users identify and fix common project health problems before they cause failures in publishing, analysis, or sharing workflows.

## Prerequisites

### Recommended: `arcgispro-cli`

Install [`arcgispro-cli`](https://pypi.org/project/arcgispro-cli/) to let the agent inspect the project directly:

```powershell
pip install arcgispro-cli
arcgispro install            # installs the ArcGIS Pro add-in
```

Click **Snapshot** in ArcGIS Pro, then the agent can run:

```bash
arcgispro layers --broken    # broken data sources
arcgispro layers --json      # all layers with full metadata
arcgispro connections        # database connections
arcgispro maps               # map list with spatial references
arcgispro context            # full project dump
```

Without `arcgispro-cli`, the agent works from descriptions and screenshots provided by the user.

## Inputs

- `project_path` (string, optional) — path to `.aprx` file
- `focus_areas` (string[], optional) — limit audit to specific categories (e.g. `["broken sources", "spatial references"]`)
- `layer_list` (string[], optional) — if no CLI, user-provided list of layer names and types

## Outputs

- `audit_report` (object) — structured report containing:
  - `summary` — overall health score and top issues
  - `findings` — array of issues, each with category, severity, layer, detail, and remediation
  - `passing_checks` — things that look good (for confidence)

## Safety

- **Read-only** — this skill never modifies the project, layers, or data sources
- Does not open or lock any data files
- Safe to run on production projects

## Audit Categories

### 1. Broken Data Sources

| Check | What to look for |
|-------|-----------------|
| Missing file paths | Source file/GDB was moved, renamed, or deleted |
| Unavailable SDE connections | Connection file missing or server unreachable |
| Stale joins/relates | Joined table no longer accessible |
| Broken raster paths | Raster catalog or mosaic dataset references invalid files |

**Detection with CLI:** `arcgispro layers --broken` returns all layers with invalid sources.

### 2. Spatial Reference Issues

| Check | What to look for |
|-------|-----------------|
| Mixed coordinate systems | Layers in different SRs within the same map |
| Unknown SR | Layer has no spatial reference defined |
| Geographic vs Projected mismatch | Mixing WGS84 (degrees) with UTM (meters) without on-the-fly projection |
| Datum mismatch | NAD27 mixed with NAD83 without a transformation |

### 3. Definition Queries & Selections

| Check | What to look for |
|-------|-----------------|
| Active definition queries | May hide features unintentionally |
| Invalid SQL syntax | Definition query references a field that no longer exists |
| Active selections | Leftover selections that affect analysis results |
| Time-based filters | Filters that may exclude current data |

### 4. Field & Schema Issues

| Check | What to look for |
|-------|-----------------|
| Fields with all nulls | Column exists but has no data |
| Duplicate field names | Fields that differ only by case |
| Overly wide text fields | `Text(4000)` when max actual length is 20 |
| Reserved field names | Fields named `date`, `table`, `index` that may conflict with SQL |

### 5. Performance & Configuration

| Check | What to look for |
|-------|-----------------|
| Large layer count | Maps with 50+ layers may be slow to draw |
| Missing indexes | Key query fields without attribute indexes |
| Unregistered data | Layers not registered with the geodatabase |
| Default symbology | Layers still using random single-symbol renderer |
| Attachment bloat | Feature classes with large attachment tables |

### 6. Joins, Relates & Connections

| Check | What to look for |
|-------|-----------------|
| Join integrity | Joined table exists and join field types match |
| Relate cardinality | One-to-many relates that may produce unexpected duplicates |
| Connection files | `.sde` files present and not expired |
| Mixed workspaces | Layers pulling from 5+ different data sources |

## Workflow

### 1. Gather project context

```bash
arcgispro project            # project metadata
arcgispro maps               # maps with spatial references
arcgispro layers --json      # all layers with schemas and sources
arcgispro layers --broken    # broken sources shortcut
arcgispro connections        # data connections
```

### 2. Run checks per category

Evaluate each layer against the checks above. Record findings as:

```markdown
| Severity | Category | Layer | Issue | Fix |
|----------|----------|-------|-------|-----|
| 🔴 High | Broken Source | Parcels_2019 | File GDB not found at D:\old_data\parcels.gdb | Update source path or remove layer |
| 🟡 Medium | SR Mismatch | Roads (NAD83) | Map is WGS84 but Roads is NAD83 StatePlane | Reproject or set geographic transformation |
| 🟢 Low | Default Symbology | Hydrants | Using default single symbol | Assign meaningful renderer |
```

### 3. Produce the report

```markdown
## Project Audit: MyProject.aprx

**Overall Health:** ⚠️ 3 issues found (1 high, 1 medium, 1 low)

### 🔴 High Priority
| Layer | Issue | Fix |
|-------|-------|-----|
| Parcels_2019 | Broken source — GDB not found | Update path or remove |

### 🟡 Medium Priority
| Layer | Issue | Fix |
|-------|-------|-----|
| Roads | SR mismatch with map frame | Reproject to WGS84 or add transformation |

### 🟢 Low Priority
| Layer | Issue | Fix |
|-------|-------|-----|
| Hydrants | Default symbology | Apply meaningful renderer |

### ✅ Passing
- All 12 other layers have valid data sources
- No active definition queries
- No stale joins or relates
```

## Example Prompts

- "Audit this ArcGIS Pro project for broken layers"
- "Check all my layers for spatial reference mismatches"
- "Run a health check on this map document"
- "List common project failures and how to check for them"
- "Which layers have broken data sources?"

## Artifacts

- `project_audit.md` — structured audit report

## Entrypoint

- `SKILL.md`

## Tips

- Run this audit before publishing, sharing, or migrating a project
- If `arcgispro-cli` is installed, the agent can detect most issues automatically
- Pair with `/agol-publish-checklist` when preparing layers for hosting
- Rerun after fixing issues to confirm a clean bill of health
