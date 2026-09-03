# 🌍 GIS Agent Skills

[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/Z4L326AT14)

Teach your AI coding agent to think spatially.

A vendor-neutral, framework-agnostic library of GIS skills — written in Markdown and YAML so any agent can pick them up. No SDK, no runtime, no lock-in. Just files that make AI assistants dramatically better at geospatial work.

## Why?

A quick scan of popular agent skill catalogs reveals a gap: almost none are truly GIS-native. They assume tabular data, generic APIs, or frontend concerns. Few of them understand projections, spatial joins, topology, geometry validity, publishing constraints, or how GIS work turns into actual deliverables.

This repo fills that gap. 🗺️

## What is actually in this repo

Right now this repo contains three kinds of things:

1. **GIS workflow skills**
   - ArcGIS Online search/publish support
   - ArcPy planning and script generation
   - project QA, schema review, and indexing guidance

2. **GIS delivery / UX skills**
   - GIS micro-app UX specification for small map-based deliverables and demos

3. **Agent-facing support files**
   - pack/catalog definitions
   - validation schemas
   - GitHub prompt files
   - lightweight validation/test utilities

This is currently a **skills library**, not a GIS runtime, not a full app framework, and not a hosted service.

## Skills

| Skill | What it does |
|-------|-------------|
| [`/agol-search`](skills/agol-search/SKILL.md) | Search ArcGIS Online for items via the REST API |
| [`/agol-publish-checklist`](skills/agol-publish-checklist/SKILL.md) | Preflight checklist before publishing hosted layers |
| [`/arcpy-plan`](skills/arcpy-plan/SKILL.md) | Plan an ArcPy workflow before writing code |
| [`/arcpy-script`](skills/arcpy-script/SKILL.md) | Generate production-ready ArcPy scripts |
| [`/project-audit`](skills/project-audit/SKILL.md) | Audit an ArcGIS Pro project for common issues |
| [`/symbology-compat`](skills/symbology-compat/SKILL.md) | Check if symbology survives KMZ/Google Earth export |
| [`/schema-smells`](skills/schema-smells/SKILL.md) | Detect data smells and propose constraints |
| [`/analysis-readiness-check`](skills/analysis-readiness-check/SKILL.md) | Decide if data is ready for a specific analysis (and list blockers) |
| [`/data-smells-summary`](skills/data-smells-summary/SKILL.md) | Turn diagnostics into a ranked plain-language risk summary |
| [`/post-run-validation`](skills/post-run-validation/SKILL.md) | Validate outputs after running analysis/scripts (counts, extents, null spikes) |
| [`/geoparquet-pack`](skills/geoparquet-pack/SKILL.md) | Recommend GeoParquet layout and partitioning |
| [`/spatial-index`](skills/spatial-index/SKILL.md) | PostGIS/SQL Server index and query optimization |
| [`/sample-qa-skill`](skills/sample-qa-skill/SKILL.md) | Validate a GIS result with a simple checklist |
| [`/gis-microapp-ux-spec`](skills/gis-microapp-ux-spec/SKILL.md) | Define and validate the UX contract for GIS demo micro-apps and fast-turn map deliverables |

## Getting Started

### Install

```bash
# Per-project
npx skills add danmaps/gis-agent-skills

# Global (available in all projects)
npx skills add danmaps/gis-agent-skills --global
```

Or just clone it:

```bash
git clone https://github.com/danmaps/gis-agent-skills.git
```

### Recommended: arcgispro-cli

Several skills work best when paired with [`arcgispro-cli`](https://pypi.org/project/arcgispro-cli/) — a tool that gives AI agents eyes into ArcGIS Pro projects:

```powershell
pip install arcgispro-cli
arcgispro install            # installs the ArcGIS Pro add-in
```

Snap your project in ArcGIS Pro, then your agent can inspect real layers, fields, and connections instead of guessing.

## Repo Layout

```text
gis-agent-skills/
├── skills/                      # one folder per skill
│   └── <skill-name>/
│       ├── SKILL.md             # required skill entrypoint
│       └── references/          # optional detailed reference material
├── packs/
│   └── public-core.yaml         # public skills catalog
├── schemas/                     # JSON Schema for skills & packs
├── .github/
│   ├── prompts/                 # reusable prompt files / slash-command style helpers
│   └── copilot-instructions.md  # repo-level agent guidance
├── tests/                       # validation helpers for repo structure
├── tools/                       # repo maintenance notes/utilities
├── examples/                    # currently just a placeholder README
├── PRD.md                       # product direction for the library
├── package.json
└── README.md
```

### What goes where

- **`skills/<name>/SKILL.md`** — the actual skill definition agents read first
- **`skills/<name>/references/`** — longer supporting material loaded only when needed
- **`packs/*.yaml`** — catalogs that group skills together
- **`.github/prompts/*.md`** — reusable prompt files for chat-based agent workflows
- **`.github/copilot-instructions.md`** — base repo instructions for agents working in this repo
- **`schemas/`** — JSON schema for validating skill and pack structure
- **`tests/`** — lightweight repo validation support
- **`examples/`** — currently minimal; not yet a real gallery of worked examples

## Contributing

- Keep skills short and directive — agents skim, they don’t study
- Prefer concrete examples over long explanations
- Add `references/` only when the extra detail is genuinely useful
- Keep README claims aligned with what is actually in the repo
- **Never put credentials in skill files** — use environment variables (see [`/agol-search`](skills/agol-search/SKILL.md#%EF%B8%8F-credential-safety) for the pattern)

## License

MIT
