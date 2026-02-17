# GIS Agent Skills

A portable, framework-agnostic library of **agent skills for GIS work**.

This project combines **over a decade of hands-on GIS experience** with **several years of trial and error working with AI prompting and agent-based tools**.

The goal is simple: encode good GIS judgment into reusable, inspectable instructions that make AI genuinely useful without sacrificing rigor.

---

## Motivation

GIS workflows are full of nuance:
- projections that quietly break analysis
- schemas that hide problems until production
- symbology that fails when exported
- requests that sound simple but carry many assumptions

Over time, I learned that strong GIS outcomes come from process:
- planning before coding
- making assumptions explicit
- validating results
- being conservative with destructive edits
- leaving an audit trail

When large language models arrived, the same lessons applied.

AI is powerful, but without structure it can confidently produce incorrect or unsafe results. Treating an agent like a junior analyst, one that needs clear instructions, checks, and guardrails, turned out to be far more effective.

This repository captures those patterns.

---

## What This Is

- A library of GIS-specific agent skills
- Written as clear, auditable instructions
- Framework-agnostic (Markdown + YAML)
- Focused on planning, QA, automation, and publishing
- Designed to be extended by organizations

## What This Is Not

- An agent runtime
- A replacement for GIS expertise
- Vendor-specific tooling
- Prompt hacks

---

## Design Philosophy

### Contracts Over Vibes
Every skill defines:
- inputs
- outputs
- assumptions
- validation checks
- risks and rollback guidance

### Conservative by Default
Copy-on-write beats overwrite.
No destructive actions without explicit permission.

### Human-Readable First
Markdown is the source of truth.
Machines can parse metadata, but humans should review the logic.

### Portable Everywhere
If an agent can read YAML and Markdown, it can use these skills.

---

## Structure

- `skills/` — individual GIS skills
- `packs/` — curated skill sets
- `schemas/` — validation schemas
- `tools/` — lightweight helpers

Each skill includes:
- `SKILL.md`
- `skill.yaml`
- examples/tests where appropriate

---

## Public Core and Private Overlays

This repo is intentionally public and vendor-neutral.

Organizations can build private overlays that:
- depend on this repo
- add policy, conventions, and internal system knowledge
- extend or override core skills safely

---

## Who This Is For

- GIS analysts using AI cautiously
- GIS developers scaffolding workflows
- Data engineers working with spatial data
- Teams experimenting with agentic GIS
- Anyone who wants AI help without losing trust in the results

---

## Status

This is an evolving project.
Expect iteration and refinement.

The long-term goal is to make AI-assisted GIS work feel less like prompt engineering and more like professional practice.

---

## License

Open source.
Use it, fork it, adapt it.

If it helps you ship better GIS work with fewer surprises, that’s the point.
