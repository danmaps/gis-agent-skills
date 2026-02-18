# Skill: /arcpy-plan

## Purpose
Given a task, produce a step-by-step ArcPy plan with risks and required inputs, without writing code.

## Inputs
- task (string)
- constraints (optional)
- data_context (optional)

## Outputs
- plan_steps (list)
- required_inputs (list)
- risks (list)

## Safety
- Read-only planning. No changes to data.

## Entrypoint
- skill.yaml
