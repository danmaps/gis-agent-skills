<h1 align="center">GIS Agent Skills</h1>

<p align="center"><b>Teach your AI coding agent to think spatially.</b><br>Practical skills for GIS analysis, ArcPy automation, data quality, and map delivery.</p>

<p align="center">
  <a href="#skills"><img src=".github/assets/badge-skills.svg" alt="19 GIS skills"></a>
  <a href="#how-it-works"><img src=".github/assets/badge-format.svg" alt="Markdown and YAML"></a>
  <a href="#requirements"><img src=".github/assets/badge-runtime.svg" alt="Core skills require no runtime"></a>
  <a href="#license"><img src=".github/assets/badge-license.svg" alt="MIT license"></a>
  <a href="https://github.com/danmaps/gis-agent-skills/actions/workflows/validate.yml"><img src="https://github.com/danmaps/gis-agent-skills/actions/workflows/validate.yml/badge.svg" alt="Validate skills"></a>
  <img src=".github/assets/badge-performative.svg" alt="badge list: performative">
</p>

<p align="center">
  <a href="#quick-start">Quick start</a> ·
  <a href="#what-it-helps-you-do">Use cases</a> ·
  <a href="#skills">Skills</a> ·
  <a href="#install">Install</a> ·
  <a href="#examples">Examples</a> ·
  <a href="#requirements">Requirements</a>
</p>

<p align="center">
  <a href="https://github.com/danmaps/gis-agent-skills/archive/refs/heads/main.zip">Download ZIP</a> ·
  <a href="https://github.com/danmaps/gis-agent-skills/issues">Issues &amp; requests</a> ·
  <a href="https://dannymcvey.com">Built by Danny McVey</a>
</p>

---

GIS work depends on details a general-purpose coding agent can miss: coordinate systems, geometry validity, spatial relationships, field schemas, and publishing constraints. These skills give an agent a repeatable way to ask the right questions, plan the work, and check the result.

The core library is a collection of readable files. Each skill defines its inputs, workflow, expected output, and safety guidance. Use one for a focused task, or combine several from planning through delivery. Your agent and GIS tools perform the work.

## Quick start

Install the skills into your current project:

```sh
npx skills add danmaps/gis-agent-skills
```

Then ask your agent:

```text
/arcpy-plan Plan a workflow to find parcels within 500 feet of schools.
Identify the required inputs, coordinate system, and validation checks.
Do not modify the source data.
```

Slash-command support depends on your agent. You can also ask it to read [`skills/arcpy-plan/SKILL.md`](skills/arcpy-plan/SKILL.md) and follow that workflow.

## What it helps you do

| Task | Start with | Expected result |
|---|---|---|
| Plan and build GIS automation | `/arcpy-plan`, `/arcpy-script` | An explicit analysis plan and ArcPy code grounded in available project context. |
| Make repeatable scripts easier to maintain | `/scaffold`, `/safety` | A proportionate project structure, dry-run defaults, preflight checks, and run receipts. |
| Decide whether data is fit for analysis | `/analysis-readiness-check`, `/schema-smells` | Blockers, schema risks, and checks tied to the intended analysis. |
| Check a result before handing it off | `/post-run-validation`, `/data-smells-summary` | Output checks and a ranked, plain-language account of remaining risks. |
| Find and prepare ArcGIS Online content | `/agol-search`, `/living-atlas`, `/agol-publish-checklist` | Filtered search results, source suitability checks, and publishing preflight guidance. |
| Choose a map delivery approach | `/static-map`, `/kml-author`, `/gis-microapp-ux-spec` | A delivery plan that accounts for interaction, compatibility, packaging, and user needs. |

## Skills

### ArcPy automation and project review

| Skill | What it does |
|---|---|
| [`/arcpy-plan`](skills/arcpy-plan/SKILL.md) | Plan an ArcPy workflow before writing code. |
| [`/arcpy-script`](skills/arcpy-script/SKILL.md) | Generate ArcPy scripts using real map, layer, and field context when available. |
| [`/scaffold`](skills/scaffold/SKILL.md) | Decide when a script needs project structure and scaffold the smallest useful layout. |
| [`/safety`](skills/safety/SKILL.md) | Add dry-run defaults, preflight checks, confirmations, and run receipts around ArcPy writes. |
| [`/project-audit`](skills/project-audit/SKILL.md) | Audit an ArcGIS Pro project for common issues. |

### Data quality and analysis validation

| Skill | What it does |
|---|---|
| [`/analysis-readiness-check`](skills/analysis-readiness-check/SKILL.md) | Assess whether data is ready for a specific analysis and identify blockers. |
| [`/schema-smells`](skills/schema-smells/SKILL.md) | Detect schema and data smells and propose constraints. |
| [`/data-smells-summary`](skills/data-smells-summary/SKILL.md) | Turn diagnostics into a ranked, plain-language risk summary. |
| [`/post-run-validation`](skills/post-run-validation/SKILL.md) | Check output counts, extents, null spikes, and other signs of unexpected results. |
| [`/sample-qa-skill`](skills/sample-qa-skill/SKILL.md) | Validate a GIS result with a simple checklist; a starting point for new skills. |

### Content discovery and map delivery

| Skill | What it does |
|---|---|
| [`/agol-search`](skills/agol-search/SKILL.md) | Search ArcGIS Online items through the REST API with filtered results and safe defaults. |
| [`/living-atlas`](skills/living-atlas/SKILL.md) | Find, vet, and use Esri Living Atlas layers for production GIS work. |
| [`/agol-publish-checklist`](skills/agol-publish-checklist/SKILL.md) | Run a preflight checklist before publishing hosted layers. |
| [`/static-map`](skills/static-map/SKILL.md) | Assess hosted vector tiles for relatively static, read-only maps and prepare or publish when appropriate. |
| [`/symbology-compat`](skills/symbology-compat/SKILL.md) | Check whether symbology survives KMZ and Google Earth export. |
| [`/kml-author`](skills/kml-author/SKILL.md) | Author and validate KML/KMZ with shared styles, NetworkLinks, Regions/LOD, and packaging. |
| [`/gis-microapp-ux-spec`](skills/gis-microapp-ux-spec/SKILL.md) | Define and validate the UX contract for small GIS apps and map deliverables. |
| [`/arcgis-single-file-map`](skills/arcgis-single-file-map/SKILL.md) | Build standalone single-file HTML map viewers for in-app sandboxes and browsers with zero build steps. |

### Storage and query performance

| Skill | What it does |
|---|---|
| [`/geoparquet-pack`](skills/geoparquet-pack/SKILL.md) | Recommend GeoParquet layout and partitioning. |
| [`/spatial-index`](skills/spatial-index/SKILL.md) | Recommend spatial indexing and query optimization for PostGIS and SQL Server. |

The [public-core catalog](packs/public-core.yaml) lists every skill in the library.

### GitHub Copilot

The combined ArcGIS Online and Living Atlas search skill is available at
`.github/skills/agol-search/SKILL.md`, which Copilot can discover from the repository.
To add it to another repository, copy the `agol-search` skill folder into that
repository's `.github/skills/` directory. For personal use, copy it to
`~/.copilot/skills/agol-search/`.

## Install

| Scope | Command | Use it when |
|---|---|---|
| **Current project** | `npx skills add danmaps/gis-agent-skills` | A project or team needs a selected set of GIS skills. |
| **Global** | `npx skills add danmaps/gis-agent-skills --global` | You want the skills available across projects. |
| **Full checkout** | `git clone https://github.com/danmaps/gis-agent-skills.git` | You want to inspect, contribute, or use the optional GIS team workflow. |

<details>
<summary><b>Manual setup or download without Git</b></summary>

Download the [ZIP](https://github.com/danmaps/gis-agent-skills/archive/refs/heads/main.zip) and unpack it, or clone the repository. Each folder under `skills/` contains a `SKILL.md` entrypoint. Copy the folders you need into your agent's supported skills directory, following that agent's setup instructions.

For an agent without skill discovery, provide the relevant `SKILL.md` directly. Keep its supporting `references/` and other files available so relative links still resolve.

Cloning the repository alone does not register the skills with every agent.

</details>

## Examples

These are prompts to try with your own data. The repository's [evaluation fixtures](examples/README.md) cover the optional GIS team workflow.

### Plan, build, and validate an ArcPy workflow

Use the skills in this order:

**[`/arcpy-plan`](skills/arcpy-plan/SKILL.md) → [`/scaffold`](skills/scaffold/SKILL.md) → [`/arcpy-script`](skills/arcpy-script/SKILL.md) → [`/safety`](skills/safety/SKILL.md) → [`/post-run-validation`](skills/post-run-validation/SKILL.md)**

```text
/arcpy-plan Plan a parcel update workflow that buffers schools and identifies
changed parcels for append into a shared geodatabase. List schema, coordinate
system, lock, and backup checks. Keep this stage read-only.
```

Once the plan is reviewed, use `/scaffold` to decide whether a single file is sufficient or reusable logic needs a small project. Use `/arcpy-script` to generate the code, then `/safety` to add dry-run defaults and an explicit write boundary. After an approved run, use `/post-run-validation` to check counts, extents, and field values.

### Assess a read-only map for vector tiles

```text
/static-map Assess the County Boundaries map in my ArcGIS Pro project for
hosted vector tile delivery. Users need pan, zoom, and county names.
Report compatibility warnings and prepare packaging steps. Do not publish.
```

The skill checks whether vector tiles fit the interaction requirements before recommending packaging. Requirements such as arbitrary queries or full attribute access can change the recommendation.

### Check whether data is ready for analysis

```text
/analysis-readiness-check Assess these parcels and school locations for a
500-foot proximity analysis. Identify coordinate system, geometry, coverage,
and schema blockers. Separate required fixes from optional improvements.
```

Give the agent the actual schemas, metadata, and permitted data access. Specific inputs make the assessment more useful.

## How it works

1. **Select a skill.** Use its command if your agent supports one, or ask it to read the entrypoint directly.
2. **Supply the context.** Provide the task, relevant data or metadata, tools available, and intended deliverable.
3. **Follow the workflow.** The agent uses the skill's inputs, reference material, and output guidance to structure the work.
4. **Review the result.** Check assumptions and validation evidence before approving consequential changes.

Skill discovery and invocation are handled by the host agent. The library does not include a general-purpose GIS execution engine. Some skills include executable helpers; running those still requires the appropriate environment and authorization.

<details>
<summary><b>Repository guide</b></summary>

| Path | Purpose |
|---|---|
| [`skills/`](skills) | Skill entrypoints, optional references, metadata, and helpers. |
| [`packs/`](packs) | Catalogs that group available skills. |
| [`schemas/`](schemas) | JSON schemas for skills, packs, and GIS team handoffs. |
| [`.github/prompts/`](.github/prompts) | Reusable agent prompt files. |
| [`.github/copilot-instructions.md`](.github/copilot-instructions.md) | Repository-level agent guidance. |
| [`.github/extensions/`](.github/extensions) | Optional Copilot Dynamic Workflow registration. |
| [`workflows/gis-agent-team/`](workflows/gis-agent-team) | Role contracts, orchestration, and adapter documentation. |
| [`examples/`](examples) | GIS team workflow evaluation fixtures. |
| [`tests/`](tests) | Catalog validation and optional workflow tests. |
| [`tools/`](tools) | Repository maintenance notes. |
| [`PRD.md`](PRD.md) | Product direction for the library. |

</details>

## Requirements

| Component | Needed for | Notes |
|---|---|---|
| **AI agent** | Applying the skills | An agent that can read Markdown; installation and slash-command support vary by host. |
| **GIS tools and data access** | Executing a workflow | Use the environment the task requires: ArcGIS Pro/ArcPy, ArcGIS REST access, a spatial database, or other relevant tools. |
| **Credentials and permissions** | Protected content or publishing | Supply through your approved authentication setup or environment variables. Keep credentials out of skill files. |
| **Node.js and npm** | The `npx` installation route | Manual setup does not require them. |
| **Python and Node.js 22+** | Repository validation | Run `python tests/validate.py` and `npm test` from a checkout. |
| **Copilot with Dynamic Workflows support** | The optional GIS team workflow | Requires a full checkout and experimental workflows enabled; see the integration guide below. |

<details>
<summary><b>Optional: give the agent real ArcGIS Pro context</b></summary>

Several ArcGIS Pro skills can use [`arcgispro-cli`](https://pypi.org/project/arcgispro-cli/) to inspect actual layers, fields, and connections. It is a companion tool rather than a dependency of the core library.

For setup, follow the companion tool's installation instructions. When available, ask the agent to use captured project context instead of guessing layer names or field schemas. See [`/arcpy-script`](skills/arcpy-script/SKILL.md) for the context it can use.

</details>

## Optional GIS team workflow

For a repeatable GIS engineering decision, the [GIS team workflow](workflows/gis-agent-team/README.md) adds a Copilot Dynamic Workflow over the existing catalog. It selects up to three specialists, uses structured handoffs, runs conditional review, and returns a decision record with a workflow receipt.

```text
/gis-agent-team Compare sensible architectures for a read-only internal map
of 800,000 utility assets, refreshed monthly for 500 employees in ArcGIS Online.
Do not publish anything.
```

Use a full checkout with a Copilot CLI/app that supports experimental Dynamic Workflows. Ordinary skill installation is independent of this integration. See the [integration guide](workflows/gis-agent-team/README.md) for registration, host availability, evaluation, and failure handling.

The team workflow is advisory: its agents have no execution tools. It can return a blocked recommendation when evidence or review is insufficient.

## Limits and safety

- **Guidance needs context.** Skills cannot establish facts about data, schemas, permissions, or environments they cannot inspect. Surface unknowns before relying on an output.
- **Results need validation.** A generated script or completed checklist still needs review against the actual GIS data and intended use.
- **Execution needs the right environment.** Installing these files does not install ArcGIS Pro, grant licenses, or provide service credentials.
- **Safety guidance depends on the host.** Dry runs, confirmations, and receipts must be implemented by the agent and tools doing the work. Markdown instructions alone do not enforce permissions.
- **Publishing and shared-data writes need explicit approval.** Use [`/safety`](skills/safety/SKILL.md), inspect the target and intended changes, and follow organizational change control.

## Contributing

[Issues](https://github.com/danmaps/gis-agent-skills/issues) and pull requests are welcome. Share a concrete GIS problem, the inputs an agent would have, and what a useful result should contain.

When adding or updating a skill:

- Keep the entrypoint short and directive, with concrete examples.
- Include inputs, expected outputs, and safety guidance.
- Add `references/` when supporting detail is useful.
- Register the skill in the [public-core catalog](packs/public-core.yaml).
- Keep README claims aligned with implemented behavior.
- Keep credentials out of repository files.

Run the repository checks before submitting:

```sh
python tests/validate.py
npm test
```

## License

MIT.

<p align="center"><sub>Built by <a href="https://dannymcvey.com">Danny McVey</a> · <a href="https://ko-fi.com/Z4L326AT14">Support the project</a></sub></p>
