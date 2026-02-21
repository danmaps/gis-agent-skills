---
name: arcpy-plan
description: Plan ArcPy workflows for ArcGIS Pro tasks with real project context and safe sequencing
---

# ArcPy Plan

Create a concrete, step‑by‑step ArcPy plan before writing code. Plans should be grounded in the actual ArcGIS Pro project context.

## Intent

Turn a GIS task into a deterministic sequence of ArcPy operations, with inputs, outputs, and checks defined up front.

## Inputs

- `task_description` (string)
- `project_path` (string, optional)
- `map_name` (string, optional)
- `output_workspace` (string, optional)
- `constraints` (string, optional)

## Use arcgispro-cli (preferred)

If available, gather real project context:
- `arcgispro layers --json`
- `arcgispro fields "LayerName"`
- `arcgispro connections`

Use real layer/field names and data sources in the plan.

## Output

A plan object with:
- `inputs`: layers/tables/paths
- `steps`: ordered ArcPy tools with purpose
- `outputs`: new datasets + locations
- `checks`: preflight validations and counts
- `risks`: destructive operations or performance concerns

## Example

**User:** “Find parcels within 500 ft of schools and export.”

**Plan:**
1) Validate layers: `Parcels`, `Schools` exist
2) Select schools (optional filter)
3) Buffer schools (500 ft) → `Schools_Buffer_500`
4) Select parcels by location intersecting buffer
5) Export selection to Output.gdb
6) Report counts
