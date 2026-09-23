---
name: scaffold
description: Turn an ArcPy script into a maintainable project structure without adding unnecessary architecture
---

# Scaffold

Help the user decide whether an ArcPy script should stay simple or grow into a small project, then scaffold only the structure the workflow actually needs.

## Intent

Keep one-off ArcPy work lightweight, but introduce structure once the script has multiple steps, shared configuration, repeated runs, or script tool / Python toolbox reuse.

## Inputs

- `task_description` (string)
- `current_script_path` (string, optional)
- `project_root` (string, optional)
- `workflow_type` (string, optional: single_script, batch, script_tool, python_toolbox)
- `constraints` (string, optional)
- `target_environment` (string, optional: ArcGIS Pro on Windows, scheduled task, toolbox)

## Decision rule

Keep the script simple if it is truly one-off, has one entrypoint, and has little reusable logic.

Recommend scaffolding when any of these are true:
- multiple ArcPy operations or repeated runs
- configuration varies by environment, map, workspace, or date
- logging/debugging is already painful
- the script will become a script tool, `.pyt`, or scheduled job
- pure Python logic can be separated and tested independently from ArcPy

## Structure guidance

Prefer incremental structure like:

```text
project/
├── src/<package_name>/
│   ├── cli.py                # script or tool entrypoint
│   ├── workflow.py           # reusable orchestration
│   ├── arcpy_ops.py          # ArcPy-only I/O and geoprocessing
│   ├── config.py             # config loading and validation
│   └── logging_utils.py      # shared logging setup
├── config/
│   └── settings.yaml         # paths, names, flags when appropriate
├── tests/
│   ├── test_workflow.py      # pure Python behavior
│   └── test_config.py
└── scripts/
    └── run_<task>.py         # optional thin launcher
```

Guidance:
- Keep ArcPy-dependent code at the edges; keep transforms, naming, and decisions in pure Python.
- Separate configuration from code. Prefer YAML for environment-specific paths, layer names, thresholds, and flags.
- Centralize logging once, then reuse it from entrypoints and workflow code.
- Keep CLI / script tool entrypoints thin; call reusable workflow functions.
- For ArcGIS Pro + Windows, account for cloned conda environments, UNC paths, drive-letter paths, toolbox execution, and `arcpy.AddMessage` / file logging needs.

## Migration pattern

Do not force a rewrite. Move an existing script in small steps:
1. Keep the current script as the entrypoint.
2. Extract config loading and logging.
3. Move reusable workflow logic into `workflow.py`.
4. Isolate ArcPy reads/writes in `arcpy_ops.py`.
5. Add tests only for pure Python pieces first.

## Testing boundaries

- Test pure Python parsing, naming, batching, validation, and decision logic with normal unit tests.
- Treat ArcPy calls as integration boundaries; mock only when it preserves behavior.
- For toolboxes or script tools, test parameter mapping separately from geoprocessing logic.

## Examples

### Single script

A 40-line buffer/export script can stay small, but if it needs reusable paths and logging, move the buffer/export steps into `workflow.py` and keep `scripts/run_buffer.py` as a thin launcher.

### Batch workflow

A nightly parcel refresh should use `config/settings.yaml` for source and target workspaces, `workflow.py` for iteration, and `arcpy_ops.py` for copy/append/update operations.

### Script tool or Python toolbox

A `.pyt` or script tool should keep ArcGIS parameter definitions in the toolbox or entry script, then call shared code in `src/<package_name>/workflow.py` so the same logic can run outside ArcGIS Pro when needed.

## Output

Return:
- whether scaffolding is warranted now
- a recommended folder tree
- the first incremental refactor steps
- testing boundaries between pure Python and ArcPy code
- any ArcGIS Pro / Windows constraints that should shape the structure

## Source material

- Product: <https://dannymcvey.com/products/arcpy-project-starter/>
- Repo: <https://github.com/danmaps/arcpy-project-starter>

## Related skills

- Use `/arcpy-plan` first to define the workflow.
- Use `/arcpy-script` after scaffolding to generate or refactor implementation code.
- Use `/safety` before enabling write operations against shared or production data.

## Safety

Do not invent project context, data sources, or deployment assumptions. Recommend the smallest structure that supports the real workflow.
