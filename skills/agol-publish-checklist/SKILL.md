---
name: agol-publish-checklist
description: Generate a preflight checklist for publishing hosted layers in ArcGIS Online
---

# AGOL Publish Checklist

Generate a comprehensive preflight checklist before publishing or updating hosted layers in ArcGIS Online.

## Intent

Catch common publishing mistakes — missing metadata, wrong sharing scope, PII exposure, broken renderers — before the item goes live. This skill produces a checklist, not the publish action itself.

## ⚠️ Credential Safety

**Never hard-code credentials in scripts, config files, or chat messages.**

If this checklist leads to scripted publishing via the ArcGIS REST API or `arcgis` Python package, credentials must come from environment variables. See `/agol-search` for setup instructions:

```powershell
[System.Environment]::SetEnvironmentVariable("AGOL_USERNAME", "<your-username>", "User")
[System.Environment]::SetEnvironmentVariable("AGOL_PASSWORD", "<your-password>", "User")
[System.Environment]::SetEnvironmentVariable("AGOL_PORTAL_URL", "https://your-org.maps.arcgis.com", "User")
```

## Prerequisites

### Recommended: `arcgispro-cli`

If publishing from an ArcGIS Pro project, install [`arcgispro-cli`](https://pypi.org/project/arcgispro-cli/) to let the agent inspect the layer before publishing:

```powershell
pip install arcgispro-cli
arcgispro install        # installs the ArcGIS Pro add-in
```

Click **Snapshot** in ArcGIS Pro, then the agent can verify:

```bash
arcgispro layer "MyLayer"     # renderer, source, SR, field count
arcgispro fields "MyLayer"    # field names, types, domains
arcgispro connections         # data source type (file GDB, SDE, etc.)
```

## Inputs

- `item_title` (string) — the title for the hosted item
- `layer_name` (string, optional) — source layer name in the ArcGIS Pro project
- `item_type` (string, optional) — target item type (e.g. `Feature Service`, `Vector Tile Service`, `Hosted Table`). Default: `Feature Service`
- `sharing_level` (string, optional) — intended sharing scope: `private`, `org`, `everyone`. Default: `private`
- `tags` (string[], optional) — tags to apply
- `summary` (string, optional) — item snippet/summary

## Outputs

- `checklist` (array of objects) — each item contains:
  - `category` — checklist section (Metadata, Schema, Renderer, Sharing, Sensitivity, Performance)
  - `check` — what to verify
  - `status` — `pass`, `warn`, `fail`, or `manual` (requires human judgment)
  - `detail` — explanation or remediation

## Safety

- **Read-only** — this skill inspects and reports; it never publishes or modifies items
- Flags PII / sensitivity risks prominently
- Defaults to most-restrictive sharing (`private`) unless user specifies otherwise

## Checklist Categories

### 1. Metadata

| Check | Criteria |
|-------|----------|
| Title set | Non-empty, descriptive, follows naming conventions |
| Summary / snippet | Non-empty, under 2048 characters |
| Description | Present and meaningful (not boilerplate) |
| Tags | At least 2 meaningful tags (not just "map") |
| Credits / attribution | Source attribution is present |
| Terms of use | Set if sharing beyond `private` |
| Thumbnail | Custom thumbnail uploaded (not default) |

### 2. Schema & Fields

| Check | Criteria |
|-------|----------|
| Field names | No spaces, special characters, or reserved words |
| Field aliases | Human-readable aliases set for user-facing fields |
| Field types | Appropriate types (no text fields storing numbers) |
| Domains | Coded value / range domains applied where appropriate |
| Null handling | Required fields have no nulls; nullable fields are intentional |
| ObjectID / GlobalID | Present for editing workflows |
| Editor tracking | Enabled if collaborative editing is expected |

### 3. Geometry & Spatial Reference

| Check | Criteria |
|-------|----------|
| Spatial reference | Defined and appropriate (typically WGS84 for AGOL) |
| Geometry validity | No null geometries, self-intersections, or empty features |
| Extent | Reasonable extent (not 0,0 or full globe for local data) |
| Feature count | Within expected range; not accidentally filtered |
| Z / M values | Disabled unless specifically needed (avoids compatibility issues) |

### 4. Renderer & Symbology

| Check | Criteria |
|-------|----------|
| Renderer set | Not using default single symbol unintentionally |
| Labels | Configured if the layer needs them; label expression is valid |
| Pop-ups | Configured with meaningful fields (not showing ObjectID) |
| Scale ranges | Set if layer should only appear at certain zoom levels |
| Transparency | Intentional, not accidentally set to 0% or 100% |

### 5. Sharing & Access

| Check | Criteria |
|-------|----------|
| Sharing level | Matches intended audience (`private` / `org` / `everyone`) |
| Group sharing | Added to appropriate groups if applicable |
| Editing enabled | Only if collaborative editing is needed; disabled by default |
| Delete protection | Enabled for production items |
| Export enabled | Disabled unless users need to download data |

### 6. Sensitivity & PII

| Check | Criteria |
|-------|----------|
| PII fields | No names, SSNs, phone numbers, emails, addresses in public layers |
| Sensitive coordinates | No home addresses or personal locations in `everyone` layers |
| Internal identifiers | No employee IDs, internal codes, or system fields exposed |
| Attachment content | Attachments don't contain sensitive documents or photos |
| Data classification | Item description states classification level if org policy requires it |

### 7. Performance

| Check | Criteria |
|-------|----------|
| Feature count | Under 100K for interactive feature services; consider tiling if larger |
| Field count | Remove unnecessary fields before publishing (reduces payload) |
| Index fields | Key query fields are indexed |
| Attachment size | Attachments under size limits; consider separate hosting if large |

## Workflow

### 1. Gather layer info

If `arcgispro-cli` is available:
```bash
arcgispro layer "MyLayer" --json    # full layer details
arcgispro fields "MyLayer" --json   # field schemas with domains
```

Otherwise, ask the user for: layer name, source type, field list, intended audience, and sensitivity level.

### 2. Run the checklist

Evaluate each check against the gathered info. Mark each as:
- **pass** — meets criteria
- **warn** — technically OK but could be improved
- **fail** — must fix before publishing
- **manual** — requires human judgment (e.g., "Is this data sensitive?")

### 3. Produce the report

```markdown
## Publish Checklist: Water_Mains_2025

**Target:** Feature Service | Sharing: org | Tags: water, infrastructure

### ❌ Failures (fix before publishing)
| Check | Detail |
|-------|--------|
| Summary missing | Item has no snippet — add a 1-2 sentence description |
| PII: OWNER_EMAIL field | Remove or alias this field before sharing to org |

### ⚠️ Warnings (recommended fixes)
| Check | Detail |
|-------|--------|
| Default thumbnail | Upload a custom thumbnail for discoverability |
| 47 fields | Consider removing internal/system fields to improve performance |

### ✅ Passing
| Check |
|-------|
| Title set: "Water Mains 2025" |
| Spatial reference: WGS 1984 Web Mercator |
| Feature count: 12,847 (reasonable) |
| Renderer: unique values on MATERIAL |
| Delete protection: enabled |
```

### 4. Address failures

Guide the user through fixing each failure before proceeding to publish.

## Example Prompts

- "Create a publish checklist for this hosted feature layer"
- "List checks before sharing a public AGOL item"
- "Review my layer for PII before I publish to the org"
- "What should I verify before publishing this vector tile service?"
- "Pre-flight check for updating an existing hosted feature layer"

## Artifacts

- `publish_checklist.md` — the completed checklist report

## Entrypoint

- `SKILL.md`

## Tips

- Run this skill **before every publish**, even for updates to existing services
- Pair with `/agol-search` to find and audit items already published
- The sensitivity checks are especially important for `org` and `everyone` sharing levels
- If `arcgispro-cli` is installed, the agent can auto-populate most checks from real project data
