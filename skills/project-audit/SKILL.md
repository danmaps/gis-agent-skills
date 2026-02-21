---
name: project-audit
description: Audit ArcGIS Pro projects for broken layers, schema issues, and performance risks
---

# Project Audit

Scan an ArcGIS Pro project and report actionable issues.

## Inputs

- `project_path` (string, optional)
- `scope` (string, optional: all, active_map)
- `checks` (array, optional)

## Use arcgispro-cli

If available:
- `arcgispro context`
- `arcgispro layers --json`
- `arcgispro connections`

## Output

Findings grouped by severity:
- **Critical**: broken data sources, missing workspaces
- **Warning**: field/schema mismatches, empty layers
- **Info**: heavy layers, slow render risks

Each finding should include: layer name, cause, and suggested fix.

## Example

**User:** “Audit my project for broken layers.”

**Output:** List of broken paths with suggested repair actions.
