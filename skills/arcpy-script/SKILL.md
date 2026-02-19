---
name: arcpy-script
description: Generate production-ready ArcPy scripts for ArcGIS Pro tasks with validation, logging, and safe defaults
---

# ArcPy Script

Generate production-ready, single-file ArcPy scripts for ArcGIS Pro with built-in validation, logging, error handling, and a dry-run checklist.

## Intent

Create robust, maintainable scripts that follow ArcGIS Pro best practices. Every script should be safe to run on real data — with guards against common failures and clear logging so the user knows exactly what happened.

## Prerequisites

### Recommended: `arcgispro-cli`

Install the [`arcgispro-cli`](https://pypi.org/project/arcgispro-cli/) package so the agent can inspect the actual project before generating code:

```powershell
pip install arcgispro-cli
arcgispro install        # installs the ArcGIS Pro add-in (ProExporter)
```

Then in ArcGIS Pro, click **Snapshot** on the **CLI** ribbon tab to export project context.

With `arcgispro-cli` installed, the agent can query real layer names, field schemas, spatial references, and data connections — producing scripts that work on the first run instead of requiring trial-and-error.

```bash
arcgispro layers --json      # exact layer names and types
arcgispro fields "Parcels"   # field names, types, domains
arcgispro connections        # data source paths
arcgispro context            # full project dump for comprehensive scripts
```

## Inputs

- `task_description` (string) — what the script should do
- `project_path` (string, optional) — path to `.aprx`. If `arcgispro-cli` is available, the agent inspects it for real schema info
- `plan` (object, optional) — output from `/arcpy-plan` if a plan was produced first
- `output_workspace` (string, optional) — target GDB or folder for outputs
- `dry_run` (boolean, optional) — if true, generate script with all operations commented out for review. Default: `false`

## Outputs

- `script` (string) — complete Python script file
- `dry_run_checklist` (array of strings) — ordered list of operations the script will perform, with expected impacts

## Safety

- **Never overwrite source data** unless the user explicitly requests it
- Always write outputs to a separate workspace or use a `_output` suffix by default
- Wrap destructive operations (`Delete`, `Truncate`, `Append` with overwrite) in explicit confirmation guards
- Log every geoprocessing operation with input/output paths and feature counts
- Use `arcpy.env.overwriteOutput = True` only when explicitly needed, and log a warning when it's set

## Script Template

Every generated script should follow this structure:

```python
"""
Script: <descriptive_name>.py
Purpose: <one-line description>
Created: <date>
Requirements: ArcGIS Pro 3.x, Python 3.9+
"""

import arcpy
import os
import sys
import logging
from datetime import datetime

# ── Configuration ──────────────────────────────────────────────
INPUT_FC = r"C:\Data\Default.gdb\Parcels"       # <- user edits these
OUTPUT_GDB = r"C:\Data\Output.gdb"
# ───────────────────────────────────────────────────────────────

# ── Logging ────────────────────────────────────────────────────
log_file = os.path.join(
    OUTPUT_GDB, "..",
    f"log_{datetime.now():%Y%m%d_%H%M%S}.txt"
)
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(message)s",
    handlers=[
        logging.FileHandler(log_file),
        logging.StreamHandler(sys.stdout),
    ],
)
log = logging.getLogger(__name__)

# ── Validation ─────────────────────────────────────────────────
def validate():
    """Pre-flight checks. Raises RuntimeError on failure."""
    if not arcpy.Exists(INPUT_FC):
        raise RuntimeError(f"Input not found: {INPUT_FC}")
    if not arcpy.Exists(OUTPUT_GDB):
        raise RuntimeError(f"Output workspace not found: {OUTPUT_GDB}")

    desc = arcpy.Describe(INPUT_FC)
    required_fields = ["APN", "OWNER"]  # <- adjust per task
    existing = [f.name for f in desc.fields]
    missing = [f for f in required_fields if f not in existing]
    if missing:
        raise RuntimeError(f"Missing fields: {missing}")

    log.info(f"Input: {INPUT_FC} ({desc.shapeType}, SR: {desc.spatialReference.name})")
    log.info(f"Feature count: {arcpy.management.GetCount(INPUT_FC)[0]}")

# ── Main ───────────────────────────────────────────────────────
def main():
    validate()
    log.info("Starting processing...")

    # Step 1: <description>
    # arcpy.analysis.Buffer(...)

    log.info("Done.")

if __name__ == "__main__":
    try:
        main()
    except Exception:
        log.exception("Script failed")
        sys.exit(1)
```

## Script Conventions

### Do

- Use raw strings (`r"..."`) for all file paths
- Validate inputs exist before processing
- Log feature counts before and after operations
- Use `with arcpy.da.SearchCursor(...)` context managers for cursors
- Specify `spatial_reference` explicitly when creating outputs
- Handle empty selections gracefully (check count before proceeding)
- Clean up intermediate data in a `finally` block
- Put configurable values (paths, field names, thresholds) at the top of the script

### Don't

- Don't hard-code credentials (see `/agol-search` for credential safety)
- Don't use `arcpy.env.overwriteOutput = True` without logging a warning
- Don't suppress exceptions silently — always log them
- Don't use `del` for releasing locks — use `with` statements or explicit `arcpy.management.Delete()` for temp data
- Don't assume field names — verify with `arcpy.ListFields()` or `arcgispro fields`

## Dry-Run Checklist

Every script should be accompanied by a checklist like:

```markdown
## Dry-Run Checklist

| # | Operation | Tool | Input | Output | Destructive? |
|---|-----------|------|-------|--------|--------------|
| 1 | Select roads | SelectLayerByAttribute | Roads | (in-memory) | No |
| 2 | Buffer selected | Buffer | Selection | Buffer_500ft | No |
| 3 | Spatial select | SelectLayerByLocation | Parcels × Buffer | (in-memory) | No |
| 4 | Export results | CopyFeatures | Selection | Output.gdb\Results | No |

**Estimated impact:** Creates 1 new feature class in Output.gdb
**Source data modified:** None
```

## Workflow

### 1. Gather context

If `arcgispro-cli` is installed:
```bash
arcgispro layers --json      # real layer names
arcgispro fields "LayerName" # real field schemas
arcgispro connections        # data source paths
```

If a plan exists from `/arcpy-plan`, use it as the blueprint.

### 2. Generate the script

- Follow the template structure above
- Use real layer/field names from the project context when available
- Include inline comments explaining non-obvious logic
- Keep it to a single file — no external dependencies beyond `arcpy`

### 3. Generate the dry-run checklist

List every geoprocessing operation in order, noting which are destructive.

### 4. Review with the user

Present the dry-run checklist **before** the user runs the script. Ask them to confirm:
- Input/output paths are correct
- Destructive operations (if any) are acceptable
- Expected feature counts are reasonable

## Example Prompts

- "Write an ArcPy script to merge shapefiles and calculate area"
- "Generate a script to select features, buffer, and export"
- "Create a batch updater for feature class attributes"
- "Script to reproject all layers to NAD83 UTM Zone 11N"
- "Write a script to export each unique value in a field to separate feature classes"

## Artifacts

- `<descriptive_name>.py` — the generated script
- `dry_run_checklist.md` — operation checklist for user review

## Entrypoint

- `SKILL.md`

## Tips

- Run `/arcpy-plan` first for complex workflows — it catches issues before you write code
- If `arcgispro-cli` is installed, the agent can write scripts that reference real data instead of placeholders
- Always review the dry-run checklist before executing
- For iterative development, use `arcgispro status` to verify your project snapshot is current
