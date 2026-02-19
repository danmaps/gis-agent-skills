# 🌍 GIS Agent Skills

Teach your AI coding agent to think spatially.

A vendor-neutral, framework-agnostic library of GIS skills — written in Markdown and YAML so any agent can pick them up. No SDK, no runtime, no lock-in. Just files that make AI assistants dramatically better at geospatial work.

## Why?

A quick scan of popular agent skill catalogs reveals a gap: almost none are truly GIS-native. They assume tabular data, generic APIs, or frontend concerns. None of them understand projections, spatial joins, topology, geometry validity, or enterprise GIS constraints.

This repo fills that gap. 🗺️

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
| [`/geoparquet-pack`](skills/geoparquet-pack/SKILL.md) | Recommend GeoParquet layout and partitioning |
| [`/spatial-index`](skills/spatial-index/SKILL.md) | PostGIS/SQL Server index and query optimization |
| [`/sample-qa-skill`](skills/sample-qa-skill/SKILL.md) | Validate a GIS result with a simple checklist |

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

```
gis-agent-skills/
├── skills/                  # one folder per skill
│   └── <skill-name>/
│       └── SKILL.md         # the skill definition
├── packs/
│   └── public-core.yaml     # skill catalog
├── schemas/                 # JSON Schema for skills & packs
├── .github/
│   ├── prompts/             # slash commands
│   └── copilot-instructions.md
├── package.json
└── README.md
```

### What goes where

- **`skills/<name>/SKILL.md`** — Intent, inputs, outputs, safety rules, workflow, examples. This is what agents read.
- **`packs/*.yaml`** — Catalogs that group skills together.
- **`.github/prompts/*.md`** — Slash commands for chat-based agents.
- **`.github/copilot-instructions.md`** — Base context loaded by agents working in this repo.

## Contributing

- Keep skills short and directive — agents skim, they don’t study
- Prefer examples over long explanations
- One `SKILL.md` per skill folder, no extras
- **Never put credentials in skill files** — use environment variables (see [`/agol-search`](skills/agol-search/SKILL.md#%EF%B8%8F-credential-safety) for the pattern)

## License

MIT
