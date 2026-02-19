---
name: arcpy-plan
description: Provide step-by-step ArcPy planning guidance before any code is written, clarifying inputs, outputs, and risks
---

# ArcPy Plan

Produce a structured plan for an ArcPy workflow **before writing any code**. The plan clarifies inputs, outputs, tool sequence, risks, and validation steps so that the subsequent script (see `/arcpy-script`) is built on solid ground.

## Intent

Help users think through their geoprocessing workflow end-to-end, surface hidden requirements, and avoid costly re-work.

## Prerequisites

### Recommended: `arcgispro-cli`

Install the [`arcgispro-cli`](https://pypi.org/project/arcgispro-cli/) package so the agent can inspect the actual project, layers, and fields before planning:

```powershell
pip install arcgispro-cli
arcgispro install        # installs the ArcGIS Pro add-in (ProExporter)
```

Then in ArcGIS Pro, click **Snapshot** on the **CLI** ribbon tab to export project context.

With `arcgispro-cli` installed, the agent can run commands like:

```
arcgispro layers             # list all layers
arcgispro layer "Parcels"    # layer details + fields
arcgispro fields "Parcels"   # field schema
arcgispro layers --broken    # broken data sources
arcgispro connections        # database connections
arcgispro context            # full project dump
```

This eliminates guesswork about layer names, field types, spatial references, and data sources.

## Inputs

- `task_description` (string) — what the user wants to accomplish
- `project_path` (string, optional) — path to `.aprx` file. If `arcgispro-cli` is available, the agent will inspect it automatically
- `constraints` (string[], optional) — any known constraints (e.g. "must preserve M values", "read-only SDE connection")

## Outputs

- `plan` (object) — structured plan containing:
  - `objective` — one-sentence summary
  - `inputs` — required data, fields, and connections
  - `steps` — ordered list of geoprocessing operations with tool names
  - `outputs` — expected deliverables with format and location
  - `risks` — potential issues and mitigations
  - `validation` — checks to run before and after execution
  - `assumptions` — things assumed to be true (flag for user review)

## Safety

- This skill produces **plans only** — it never executes geoprocessing tools
- Never modify source data or project files during planning
- Flag any destructive operations (Delete, Truncate, Overwrite) prominently in the risk section

## Workflow

### 1. Gather context

If `arcgispro-cli` is available, inspect the project:

```bash
arcgispro project            # project metadata
arcgispro layers --json      # all layers with schemas
arcgispro connections        # data sources
```

If not available, ask the user for:
- Layer names and types (feature class, table, raster)
- Field names and types for key layers
- Spatial reference / coordinate system
- Data source type (file GDB, SDE, shapefile)

### 2. Identify the tool chain

Map each logical step to a specific ArcPy tool:

| Step | Tool | Notes |
|------|------|-------|
| Select features | `arcpy.management.SelectLayerByAttribute` | Build SQL where clause |
| Buffer | `arcpy.analysis.Buffer` | Specify distance + units |
| Dissolve | `arcpy.management.Dissolve` | List dissolve fields |
| Export | `arcpy.management.CopyFeatures` | Target workspace |

### 3. Surface risks

Flag each of these when applicable:

- **Schema locks** — another user/process has the data open
- **Spatial reference mismatch** — inputs in different coordinate systems
- **Empty selections** — a query that returns zero features
- **Large datasets** — operations that may be slow or consume memory
- **Destructive operations** — anything that modifies or deletes source data
- **Field type mismatches** — joining on incompatible field types
- **Null geometry** — features with no geometry that break spatial operations
- **Network data sources** — slow I/O, potential timeout

### 4. Define validation checks

Before execution:
- [ ] All input datasets exist and are accessible
- [ ] Required fields exist with expected types
- [ ] Spatial references are compatible (or project step is included)
- [ ] Output workspace exists and is writable
- [ ] No schema locks on output targets

After execution:
- [ ] Output feature count is within expected range
- [ ] Output spatial reference matches expectation
- [ ] No features with null geometry in output
- [ ] Attribute values are within expected domains

### 5. Produce the plan document

Format as a structured markdown document:

```markdown
## Objective
Buffer all parcels within 500 feet of a selected road and export to a new feature class.

## Inputs
| Data | Type | Source | Key Fields |
|------|------|--------|------------|
| Parcels | Feature Class | Default.gdb | APN, OWNER, Shape |
| Roads | Feature Class | Default.gdb | ROAD_NAME, Shape |

## Steps
1. Select roads where ROAD_NAME = 'Main St'
2. Buffer selected roads by 500 feet
3. Select parcels that intersect the buffer
4. Copy selected parcels to output feature class

## Outputs
| Output | Format | Location |
|--------|--------|----------|
| Parcels_near_MainSt | Feature Class | Output.gdb |

## Risks
| Risk | Severity | Mitigation |
|------|----------|------------|
| Empty road selection | High | Validate selection count > 0 before proceeding |
| SR mismatch (Parcels vs Roads) | Medium | Add Project step if SRs differ |

## Validation
- Pre: Verify both layers exist, check feature counts
- Post: Output count > 0, output SR = input SR

## Assumptions
- Parcels and Roads are in the same coordinate system
- Buffer distance is planar feet (not geodesic)
```

## Example Prompts

- "Plan an ArcPy workflow to merge parcel layers and calculate area stats"
- "Outline steps to batch update fields in a file geodatabase"
- "Draft a safe plan to reproject and dissolve features"
- "What's the best approach to join a CSV to a feature class and export?"
- "Plan a workflow to find all features within 1 mile of a point"

## Artifacts

- `arcpy_plan.md` — structured plan document

## Entrypoint

- `SKILL.md`

## Tips

- Always run this skill **before** `/arcpy-script` — plans catch problems that are expensive to fix in code
- If `arcgispro-cli` is installed, the agent can build a much more accurate plan by inspecting real data
- Ask the user to confirm the plan before proceeding to script generation
- When in doubt about a field name or type, flag it as an assumption rather than guessing
