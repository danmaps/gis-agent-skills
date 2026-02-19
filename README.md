# GIS Agent Skills Library

Vendor-neutral skills for GIS agents. Human-readable, framework-agnostic.

## Minimal layout (Copilot-friendly)
```
gis-agent-skills/
├── skills/
│   └── <skill-name>/
│       └── SKILL.md
├── .github/
│   ├── prompts/
│   └── copilot-instructions.md
├── README.md
├── package.json
```

### What goes where
- `skills/<skill-name>/SKILL.md`
  - One-line summary
  - Intent (what it helps with)
  - Example prompts / expected inputs
  - Capabilities
- `.github/prompts/*.md`
  - Slash commands for Copilot Chat/CLI
- `.github/copilot-instructions.md`
  - Base context for Copilot in this repo
- `package.json`
  - Optional metadata for `npx skills add`

## How Copilot picks it up
- Scans `skills/` for SKILL.md content
- Loads `.github/prompts/` as slash commands
- Uses `.github/copilot-instructions.md` as base context

## Install options
- Global: `npx skills add danmaps/gis-agent-skills --global`
- Per-project: `npx skills add danmaps/gis-agent-skills`

## Contributing
- Keep skills short and directive
- Prefer examples over long explanations
- Avoid extra docs inside skill folders

---

## Why GIS-native skills matter (insight)
A quick scan of popular “agent skill catalogs” shows a gap: almost none are truly GIS‑native. Most assume tabular/text data, generic APIs, or frontend/infra concerns. Very few understand projections, spatial joins, topology, rasters vs vectors, geometry validity, or enterprise GIS constraints.

