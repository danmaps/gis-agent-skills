# PRD: GIS Agent Skills Library
## Public Core + SCE Private Overlay (Dependency Model)

### Goal
Create a **public, vendor-neutral GIS agent skills library** and an **SCE-specific private skills library** that depends on the public repo, enabling reuse of core skills with internal overlays for policy, systems, and conventions.

The system must be:
- Installable as files or repositories
- Interpretable by any agent framework (chat, CLI, RAG, tool-based)

---

## Products
### 1. Public repo: `gis-agent-skills`
- Reusable GIS workflow skills
- No proprietary references
- Focus on planning, QA, automation, and publishing

### 2. Private repo: `sce-gis-agent-skills`
- Depends on `gis-agent-skills`
- Adds SCE policy, conventions, and internal system context
- Same skill interface as public core

---

## Dependency Model
The SCE repo includes the public repo as a dependency (git submodule preferred).
Both repos expose skill catalogs ("packs") that can be loaded by agents.

---

## Design Principles
- Framework-agnostic (Markdown + YAML)
- Explicit input/output contracts
- Conservative safety defaults
- Human-readable first
- Layered overlays (extend or override)

---

## Repository Architecture

### Public Repo
```
gis-agent-skills/
  skills/
  packs/
  schemas/
  tools/
```

### Private Repo
```
sce-gis-agent-skills/
  deps/gis-agent-skills/
  overlays/
  skills/
  packs/
```

---

## Skill Definition
Each skill includes:
- SKILL.md (instructions)
- skill.yaml (metadata)
- examples/tests (optional)

### Required Metadata
- id
- name
- version
- scope
- inputs
- outputs
- safety
- artifacts
- entrypoint

---

## Overlay Model
Overlay skills may:
- extend a public skill
- override a public skill

Resolution is handled at pack build time using priority rules.

---

## Installation
Public:
```
git clone https://github.com/<org>/gis-agent-skills
```

Private:
```
git clone git@<internal>:sce-gis-agent-skills.git
git submodule update --init --recursive
```

---

## Safety and Governance
Public repo contains no internal references.
SCE repo enforces:
- data classification checks
- redaction rules
- internal sharing policies

---

## Versioning
- Public repo uses SemVer
- SCE repo pins public dependency to a tag
- Skill IDs are stable

---

## Testing
- Schema validation
- Required section checks
- Pack integrity validation
- Internal-only leak prevention

---

## Milestones
- Foundation + schema
- Public v0.1
- SCE overlay v0.1
- Agent adapters

---

## Success Metrics
- Skills usable with no runtime
- Clear, auditable outputs
- Safe internal adoption

---
