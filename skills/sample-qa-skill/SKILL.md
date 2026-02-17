# Skill: Sample QA Check

## Purpose
Validate a GIS result using a simple checklist.

## Inputs
- `artifact_path` (string) — path to a generated map or output
- `task_summary` (string) — what was supposed to happen

## Outputs
- `status` (ok|warn|fail)
- `notes` (string)

## Safety
- Never alter source data
- Only read files from provided paths

## Artifacts
- `qa_report.md`

## Entrypoint
- `skill.yaml`
