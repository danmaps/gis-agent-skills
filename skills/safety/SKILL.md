---
name: safety
description: Add a safety harness around ArcPy workflows that can write to data or production systems
---

# Safety

Wrap ArcPy automation in explicit operational safeguards before it can modify shared, sensitive, or production GIS data.

## Intent

Make write-capable GIS automation prove what it will touch, what checks passed, and who approved production execution before any irreversible step runs.

## Inputs

- `task_description` (string)
- `source_workspace` (string)
- `target_workspace` (string)
- `approved_workspace` (string, optional)
- `expected_change` (string)
- `reviewer` (string, optional)
- `environment` (string, optional: dev, test, prod)
- `current_script_path` (string, optional)

## Safety defaults

- Default to dry-run mode whenever the workflow can preview SQL, row counts, target paths, deletes, updates, appends, or overwrites without committing changes.
- Gather and restate the source, target, approved workspace, expected change, and reviewer context before enabling writes.
- If any of those are missing, stop and ask.

## Preflight checks

Require checks appropriate to the workflow, such as:
- source and target paths exist and resolve to the intended geodatabase, folder, or service
- target is inside the approved workspace boundary
- geometry type, schema, and spatial reference match expectations
- locks, permissions, and available disk space are acceptable
- overwrite/delete behavior is explicit
- backups, export snapshots, or rollback options are identified before destructive writes

## Validation requirements

Require workflow-specific validation before and after writes:
- expected row-count or extent change
- key field null/uniqueness checks
- sample record inspection or map spot-checks
- service or downstream dependency checks when publishing/updating hosted content

Hand off to `/post-run-validation` for the post-write sanity check rather than repeating that skill in full.

## Production-write boundary

Production writes require explicit user-controlled confirmation.

Rules:
- Never invent, auto-fill, paraphrase, or bypass a production confirmation phrase.
- Ask the user to provide the confirmation phrase exactly when the workflow is ready.
- Do not proceed on implied consent such as “looks good”, “go ahead”, or “same as before”.
- If organizational change control, maintenance windows, peer review, or approvals are required, make those dependencies explicit and block writes until they are satisfied.

## Run receipt

Generate or specify a JSON receipt for each run. Include at least:

```json
{
  "run_id": "uuid-or-timestamp",
  "started_at": "ISO-8601",
  "ended_at": "ISO-8601",
  "script_path": "...",
  "script_hash": "sha256:...",
  "mode": "dry-run|write",
  "environment": "dev|test|prod",
  "source_workspace": "...",
  "target_workspace": "...",
  "approved_workspace": "...",
  "expected_change": "...",
  "reviewer": "...",
  "preflight_checks": [{"name": "...", "status": "pass|fail|skip", "details": "..."}],
  "validation_checks": [{"name": "...", "status": "pass|fail|skip", "details": "..."}],
  "outcome": "blocked|dry-run|success|failure"
}
```

## Example

An existing parcel update script is being moved under `/scaffold` into `src/parcels/`.
Before enabling `Append` or `DeleteRows`, require:
1. a dry-run that reports source/target paths and expected feature delta
2. preflight checks for schema, locks, backup path, and approved workspace
3. explicit production confirmation from the user
4. a JSON receipt written with the script hash and validation results

## Output

Return:
- the missing safety inputs that must be gathered
- the dry-run plan
- the required preflight and validation checks
- the exact point where human confirmation is required
- the run receipt structure or concrete JSON fields to capture

## Source material

- Product: <https://dannymcvey.com/products/arcpy-safety-harness/>
- Repo: <https://github.com/danmaps/arcpy-safety-harness>
- Onboarding: <https://github.com/danmaps/arcpy-safety-harness/blob/main/ONBOARDING.md>

## Related skills

- Use `/arcpy-plan` to define the workflow.
- Use `/scaffold` to organize the project before adding guardrails.
- Use `/arcpy-script` to implement the guarded workflow.
- Use `/post-run-validation` after execution to confirm results.

## Safety

Do not claim approval, human review, backups, permissions, or change-control completion unless the user explicitly provides that information.
