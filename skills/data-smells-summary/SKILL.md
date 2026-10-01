---
name: data-smells-summary
description: Turn outputs from schema-smells, project-audit, and spatial-index into a plain-language risk summary with a ranked “will bite you later” list and remediation order.
---

# Data Smells Summary

Convert raw diagnostics into operator judgment.

## Inputs

- Output from one or more of:
  - `schema-smells`
  - `project-audit`
  - `spatial-index`
- Optional: intended downstream work (publish? overlay? joins? routing?)

## Output (format)

### 1) Plain-language risk summary
- 5 to 10 sentences max.
- Emphasize *what breaks* and *what slows down*.

### 2) Ranked “most likely to bite you later” list
For each item:
- **Why it matters** (impact)
- **When it shows up** (trigger: publishing, joins, long runs, editing)
- **How to confirm** (quick check)

### 3) Suggested remediation order
- Group by dependency:
  1. correctness blockers (projection, geometry validity, IDs)
  2. reliability blockers (null spikes, inconsistent types, domains)
  3. performance blockers (indexes, geometry complexity)
- Keep the plan short and actionable.

## Heuristics

- Prefer correctness over performance.
- Prefer fixes that reduce rework (projection, ID hygiene, geometry validity).
- Call out “debt interest”: issues that compound (domainless coded values, mixed types, unindexed joins).

## Example

Input: schema-smells finds nullable IDs + mixed field types; spatial-index flags missing index on join key.

Output: A narrative summary + top 5 risks + a 1-2-3 remediation order.
