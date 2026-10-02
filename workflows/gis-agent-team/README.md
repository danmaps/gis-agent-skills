# /gis-agent-team

An optional GitHub Copilot Dynamic Workflow for GIS engineering decisions. It
uses the existing public skill catalog and returns an advisory decision record.
It is not a GIS runtime. Core `skills/*` files need neither Copilot nor this code.

## Choose the right entrypoint

| Use | When |
| --- | --- |
| A single skill | The question is narrow and the needed expertise is known. |
| `/fleet` | Open-ended parallel work benefits from an agent choosing the decomposition. |
| `/gis-agent-team` | A repeatable GIS decision benefits from bounded specialist roles, comparable handoffs, risk review, and a receipt. |

## Run in Copilot

Use a **full checkout** of this repository. Installing only `skills/*` does not
install this optional integration. The project extension lives at
`.github/extensions/gis-agent-team/extension.mjs`; it imports the portable
contracts and orchestration helpers from `workflows/gis-agent-team/` and reads
`packs/public-core.yaml`, `schemas/`, and selected `skills/` Markdown.

Dynamic Workflows are an experimental/public-preview Copilot feature. Use a
current Copilot CLI/app supporting `defineWorkflow`, session `commands`, and
workflow-owned custom agents. Trust the checkout and enable experimental features
in CLI (`copilot --experimental` or `/experimental on`). Restart the session after
adding the extension. Ask Copilot to list workflows and verify `gis-agent-team`
is registered before running it. Copilot supplies the extension SDK; no dependency
or SDK installation is added to the portable library.

Registration does not prove Dynamic Workflow execution is available for the
session. An initial local run returned `Dynamic workflows are not available for
this session`, even with `--experimental`. A zero-agent diagnostic and a subsequent
800k-asset run succeeded with unused built-in MCP servers disabled. The live run
on Copilot CLI `1.0.90-0` used all three specialists, the expected four skills,
synthesis, and conditional review with no agent failures. For an isolated CLI
smoke test, use `--disable-builtin-mcps` as below; these agents need no MCP tools.
Do not work around host availability by falling back to unbounded agents.

```text
/gis-agent-team We need a read-only internal map for 800,000 utility assets,
updated monthly, viewed by 500 employees. We already use ArcGIS Online.
Compare architectures and recommend a path without publishing anything.
```

The command accepts the text after its name as a single problem string. A blank
or oversized input returns usage guidance. For scripts, provide exactly one input:

```json
{ "problem": "Compare delivery architectures for our read-only internal map." }
```

Save this as `workflow-input.json`, then run from the trusted checkout:

```sh
copilot --experimental --disable-builtin-mcps workflow run gis-agent-team --args @workflow-input.json
```

The CLI returns the structured result, including full contracts and evidence.
The slash command renders its decision record, evidence source paths, and a
compact receipt in the session timeline. Copilot also exposes phase progress
and run state via `/workflows`. An interrupted/paused/limit-stopped run must be
inspected there; it is never presented as a completed GIS recommendation.
Receipts are returned in the response only. Saving one is a separate user action
(the CLI's `--result-file` option can overwrite an existing file).

## Small explicit team

The deterministic router selects from three roles. Data/geometry/schema/scale/
refresh/ArcPy signals select `spatial-data`; Online/Enterprise/publishing/sharing
signals select `platform-publishing`; web map/viewer/app/UX signals select
`application-delivery`. Clear narrow requests use one specialist. An ambiguous
problem starts with spatial/data triage, records the routing assumption, and
requires review. This English keyword router is intentionally an MVP: inspect
`roles_selected` for unsupported phrasing or languages and clarify the problem.

Selected roles are decision-critical by default. An explicitly optional or
nice-to-have viewer/app makes only the application role non-critical. These
classifications are reported in the receipt. The router and role-to-skill mapping
are in `routing.mjs`; portable role responsibilities are in `roles.md`.

Each specialist receives its role, the problem, and only the selected skills'
entrypoints and Markdown references. Executable helpers are never loaded or run.
The catalog must list a skill before it can be loaded. A receipt distinguishes
loaded guidance (paths + SHA-256) from skills the specialist says materially
influenced its result. Evidence must reference the problem or a supplied file.
This verifies provenance references, not the truth of an agent's interpretation.

The planning sequence follows #21's intent-to-skill-plan concept: infer relevant
roles, choose existing skills, expose missing inputs/stop conditions. That skill
does not yet exist in the catalog; this workflow neither claims to invoke it nor
implements a general planner.

## Contracts, synthesis, and review

`schemas/gis-team-handoff.schema.json` defines the common handoff. It contains the
issue's core fields plus typed evidence, comparable decision keys, and review
flags. Confidence describes completeness given the available evidence, not a
numerical probability. `contracts.mjs` validates required fields, types, enums,
non-empty strings, extra keys, and duplicate items; role/skill/source provenance
is checked separately.

Specialists run in parallel. A single synthesizer receives the original problem
and validated contracts, never raw transcripts or specialist prompts. It compares
alternatives and preserves assumptions and dissent. Final assembly unions the
specialists' assumptions, unknowns, risks, and detected conflicts so synthesis
cannot silently remove them.

One reviewer runs only for:

- Different normalized choices for the same decision key, explicit material
  conflict flags, or semantic disagreement found by the synthesizer.
- Unresolved publishing/security concerns, proposed production writes, or
  critical unverified assumptions flagged in a handoff or synthesis.
- Low specialist confidence (conservatively treated as decision-critical).
- Ambiguous fallback routing, planned writes to production/shared resources, or
  requested changes to sharing/authentication identified by deterministic rules.

The reviewer returns `ready`, `ready-with-caveats`, or `blocked`. Non-empty
`blocking_issues` deterministically force `blocked`, even if its status disagrees.
Majority-vote conflict resolution and hidden critical uncertainty must block.
Review issues
and targeted reconsideration requests remain visible. The MVP does not rerun
specialists: resolve blockers with a human and start another advisory run.

## Failure handling and limits

- A missing/invalid specialist response is recorded by role. Successful contracts
  are retained. A critical missing role blocks synthesis; a non-critical missing
  role permits caveated synthesis with its gap passed to the synthesizer.
- A skill load failure is reported as unavailable. Its guidance cannot be claimed
  as used. Recommendations must expose the gap and any consequent uncertainty.
- Invalid/missing synthesis or required review blocks the result and preserves
  available evidence. Cancellation and hard SDK failures propagate to Copilot's
  run envelope rather than being converted to success.
- Maximum concurrency is three; total agents are three specialists, one
  synthesizer, and one reviewer. No recursive spawning and no retries. Local JSON
  validation avoids the SDK's automatic schema retry, which could add agents.
- The intake snapshot is journaled under a versioned key for resume consistency;
  Copilot owns its ordinary run history. No persistent agent memory is added.
- No guessed credit/time limits are imposed. Users can configure Copilot budgets;
  a limit-stopped run needs inspection and an explicitly raised limit to resume.

## Read-only boundary

All calls use the registered `gis-team-advisory` custom agent with `tools: []`.
Agents cannot run scripts, write files, invoke MCP tools, or spawn other agents.
The extension itself only reads the known repository guidance and logs/returns
results. It requests no sensitive environment variables and no GIS credentials.
No other session agent's tool permissions are changed.

Every receipt declares `execution_enabled: false` and lists the approval boundary
for publishing/replacement, shared data edits, overwrites, sharing/authentication
changes, production geoprocessing, and external resources. Analysis and advice
run autonomously. Consequential execution remains outside this MVP, requires
separate explicit human approval, and must preserve `/safety` and organizational
classification, change control, and permissions. A resume is not GIS approval.

## Evaluation

Run `npm test` with Node 22+ and `python tests/validate.py`. The workflow tests use
a mock Copilot context and mock agents: they exercise routing, guidance loading,
parallel execution, strict contracts/provenance, review triggers, partial failure,
receipt assembly, and extension/command registration. They do not verify live
Copilot registration, model quality, or the correctness of a GIS architecture.

Three fixtures live in `examples/gis-agent-team/`: the 800k-asset map, ArcPy
production automation, and local data-quality investigation. Each includes expected
role/skill coverage and semantic `live_assertions`. For a live smoke test, pass
only its `problem` field as workflow input, inspect roles/skills and the assertions,
and verify no GIS action occurred. Accept several defensible architectures;
do not assert a fixed feature-service or vector-tile answer. Include a conflicting
interaction requirement to test review and a narrow request to verify one-agent
routing. Live evaluation consumes the user's normal Copilot credits.

The adapter follows the preview APIs documented in GitHub's
[workflow authoring guide](https://github.com/github/copilot-sdk/blob/main/nodejs/docs/workflows.md),
[extension API](https://github.com/github/copilot-sdk/blob/main/nodejs/src/extension.ts),
[command/custom-agent types](https://github.com/github/copilot-sdk/blob/main/nodejs/src/types.ts),
and [workflow usage guide](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/use-dynamic-workflows),
checked October 1, 2026. Recheck these before changing the adapter as the preview
format evolves. There is no fallback that silently enables agent tools.
