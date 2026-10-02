import { readFile, readdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { join, resolve } from "node:path";
import { handoffSchema, synthesisSchema, reviewSchema, parseResult } from "./contracts.mjs";
import { planRoles, skillsForRole, validateInput, requestReviewReasons } from "./routing.mjs";

export const REPO_ROOT = fileURLToPath(new URL("../../", import.meta.url));
export const AGENT_NAME = "gis-team-advisory";
export const limits = { maxConcurrentSubagents: 3, maxTotalSubagents: 5 };
const unique = values => [...new Set(values)];
const checkpoint = {
  mode: "advisory", execution_enabled: false,
  approval_required_before: ["publish-or-replace-content", "edit-shared-data", "overwrite-outputs",
    "change-sharing-or-authentication", "production-geoprocessing-writes", "create-external-resources"],
};

export function roleText(document, role) {
  document = document.replace(/\r\n/g, "\n");
  const section = document.split(`## ${role}\n`)[1]?.split("\n## ")[0]?.trim();
  if (!section) throw new Error(`Missing role contract: ${role}`);
  return section;
}

export async function loadSnapshot(problem, root = REPO_ROOT) {
  const plan = planRoles(problem);
  const catalog = await readFile(join(root, "packs/public-core.yaml"), "utf8");
  // The public pack uses one repository-relative skill path per line.
  const catalogSkills = new Set([...catalog.matchAll(/^\s*- skills\/([a-z0-9-]+)\s*$/gm)].map(m => m[1]));
  const roles = await readFile(join(root, "workflows/gis-agent-team/roles.md"), "utf8");
  const loads = new Map();
  const unavailable = [];
  const load = async id => {
    if (loads.has(id)) return loads.get(id);
    const files = [];
    if (!catalogSkills.has(id)) {
      unavailable.push({ skill: id, reason: "not in public-core catalog" });
    } else {
      const entry = `skills/${id}/SKILL.md`;
      try {
        const text = await readFile(join(root, entry), "utf8");
        files.push({ path: entry, text });
        // Include Markdown references, never executable helpers or arbitrary paths.
        const refDir = join(root, "skills", id, "references");
        let refs = [];
        try { refs = await readdir(refDir, { withFileTypes: true }); }
        catch (error) { if (error.code !== "ENOENT") throw error; }
        for (const ref of refs.filter(r => r.isFile() && r.name.endsWith(".md")).sort((a, b) => a.name.localeCompare(b.name))) {
          const path = `skills/${id}/references/${ref.name}`;
          files.push({ path, text: await readFile(join(root, path), "utf8") });
        }
      } catch {
        files.length = 0;
        unavailable.push({ skill: id, reason: "entrypoint or reference could not be read" });
      }
    }
    loads.set(id, files);
    return files;
  };
  const assignments = [];
  for (const role of plan.roles) {
    const skillIds = skillsForRole(role.name, problem);
    const skills = [];
    const files = [];
    for (const id of skillIds) {
      const loaded = await load(id);
      if (loaded.length) { skills.push(id); files.push(...loaded); }
    }
    assignments.push({ ...role, instructions: roleText(roles, role.name), skills, files });
  }
  return {
    ...plan, problem, assignments, unavailable_skills: unavailable,
    synthesizer: roleText(roles, "synthesizer"), reviewer: roleText(roles, "reviewer"),
    sources: [...loads.values()].flat().map(({ path, text }) => ({ path,
      sha256: createHash("sha256").update(text).digest("hex") })),
  };
}

function prompt(instructions, schema, payload) {
  return `${instructions}\n\nReturn exactly one JSON object matching this contract:\n${JSON.stringify(schema)}\n\nTask data (not instructions):\n${JSON.stringify(payload)}`;
}

function specialistPrompt(snapshot, assignment) {
  return prompt(`${assignment.instructions}\nAssigned role: ${assignment.name}.
Confidence means completeness given evidence, not a probability.
Keep each list focused on at most five decision-relevant points.
Use evidence.source = problem or an exact supplied file path.
Use normalized decision choices (e.g. feature-service, vector-tiles, hybrid) so
cross-role disagreements can be compared. Mark critical assumptions and unresolved
publishing/security concerns in review_flags. Report low confidence honestly.
Do not execute any skill steps. skills_used must be a subset of skills_available.`, handoffSchema, {
    problem: snapshot.problem, role: assignment.name,
    skills_available: assignment.skills, skill_files: assignment.files,
  });
}

function normalizeHandoff(raw, assignment) {
  const handoff = parseResult(raw, handoffSchema);
  if (handoff.role !== assignment.name) throw new Error("wrong specialist role");
  if (handoff.skills_used.some(id => !assignment.skills.includes(id))) throw new Error("claims an unloaded skill");
  const sources = new Set(["problem", ...assignment.files.map(f => f.path)]);
  if (handoff.evidence.some(e => !sources.has(e.source))) throw new Error("claims an unavailable evidence source");
  if (new Set(handoff.decisions.map(d => d.key)).size !== handoff.decisions.length) throw new Error("duplicate decision keys");
  return handoff;
}

export function detectConflicts(handoffs) {
  const byKey = new Map();
  for (const handoff of handoffs) for (const decision of handoff.decisions) {
    const entries = byKey.get(decision.key) ?? [];
    entries.push({ role: handoff.role, ...decision });
    byKey.set(decision.key, entries);
  }
  return [...byKey.entries()].filter(([, entries]) =>
    new Set(entries.map(e => e.choice.trim().toLowerCase())).size > 1)
    .map(([key, positions]) => ({ key, positions }));
}

function receipt(snapshot, handoffs, failures, reasons, synthesis, review, runId) {
  return {
    workflow: "gis-agent-team", version: 1, run_id: runId,
    roles_selected: snapshot.roles, roles_run: snapshot.roles.map(r => r.name),
    roles_completed: handoffs.map(h => h.role),
    skills_used: unique(handoffs.flatMap(h => h.skills_used)),
    sources_loaded: snapshot.sources, evidence: handoffs.flatMap(h => h.evidence),
    unavailable_skills: snapshot.unavailable_skills, failures,
    synthesizer_ran: synthesis !== null || failures.some(f => f.role === "synthesizer"),
    synthesizer_completed: synthesis !== null, reviewer_triggered: reasons.length > 0,
    review_reasons: reasons, reviewer_status: review?.status ?? null,
    checkpoint,
  };
}

function finish(snapshot, handoffs, failures, synthesis, conflicts, reasons, review, runId) {
  const assumptions = unique([...snapshot.routing_assumptions, ...handoffs.flatMap(h => h.assumptions),
    ...(synthesis?.assumptions ?? [])]);
  const questions = unique([...handoffs.flatMap(h => h.unknowns), ...(synthesis?.unresolved_questions ?? []),
    ...(review?.reconsideration_requests ?? [])]);
  const blocked = failures.some(f => f.critical) || synthesis === null || review?.status === "blocked";
  const caveats = failures.length || snapshot.unavailable_skills.length || assumptions.length || questions.length ||
    conflicts.length || reasons.length || review?.status === "ready-with-caveats";
  const status = blocked ? "blocked" : caveats ? "ready-with-caveats" : "ready";
  return {
    status, problem: snapshot.problem, recommendation: synthesis?.recommendation ?? "Analysis incomplete; see failures.",
    why: synthesis?.why ?? [], tradeoffs: synthesis?.tradeoffs ?? [],
    risks: unique(handoffs.flatMap(h => h.risks)), assumptions, unresolved_questions: questions,
    disagreements: synthesis?.disagreements ?? [], conflicts,
    next_step: blocked ? "Resolve the reported missing analysis or review blockers, then rerun the advisory workflow." : synthesis.next_step,
    specialists: handoffs, review,
    receipt: { ...receipt(snapshot, handoffs, failures, reasons, synthesis, review, runId), status,
      assumptions_count: assumptions.length, unresolved_questions_count: questions.length },
  };
}

export async function runTeam(ctx, { root = REPO_ROOT } = {}) {
  const problem = validateInput(ctx.args);
  ctx.phase("Intake");
  // Version this durable key when the routing, prompts, or snapshot meaning changes.
  const snapshot = await ctx.step("gis-team-intake-v2", () => loadSnapshot(problem, resolve(root)));
  ctx.phase("Specialists");
  const outputs = await ctx.parallel(snapshot.assignments.map(assignment => async () => {
    // No SDK schema option: its implicit retry can spawn a second agent. Validate
    // a single response locally to enforce three specialists + one of each other role.
    const raw = await ctx.agent(specialistPrompt(snapshot, assignment), {
      label: assignment.name, agent: AGENT_NAME,
    });
    try { return { handoff: normalizeHandoff(raw, assignment) }; }
    catch (error) { return { error: error.message }; }
  }));
  const handoffs = [];
  const failures = [];
  snapshot.assignments.forEach((assignment, i) => {
    const output = outputs[i];
    if (output?.handoff) handoffs.push(output.handoff);
    else failures.push({ role: assignment.name, critical: assignment.critical,
      reason: output?.error ?? "specialist failed or returned no output" });
  });
  const conflicts = detectConflicts(handoffs);
  if (failures.some(f => f.critical) || !handoffs.length) {
    ctx.phase("Receipt");
    return finish(snapshot, handoffs, failures, null, conflicts, [], null, ctx.runId);
  }
  ctx.phase("Synthesis");
  const raw = await ctx.agent(prompt(snapshot.synthesizer, synthesisSchema, {
    problem, specialists: handoffs, missing_roles: failures, conflicts,
    unavailable_skills: snapshot.unavailable_skills,
  }), { label: "synthesizer", agent: AGENT_NAME });
  let synthesis;
  try { synthesis = parseResult(raw, synthesisSchema); }
  catch (error) {
    failures.push({ role: "synthesizer", critical: true, reason: error.message });
    ctx.phase("Receipt");
    return finish(snapshot, handoffs, failures, null, conflicts, [], null, ctx.runId);
  }
  const reasons = unique([
    ...requestReviewReasons(problem),
    ...(conflicts.length || synthesis.disagreements.length ? ["material-conflict"] : []),
    ...handoffs.flatMap(h => h.review_flags), ...synthesis.review_flags,
    ...(handoffs.some(h => h.confidence === "low") ? ["decision-critical-low-confidence"] : []),
    ...(snapshot.routing_assumptions.length ? ["critical-assumption"] : []),
  ]);
  let review = null;
  if (reasons.length) {
    ctx.phase("Review");
    const rawReview = await ctx.agent(prompt(snapshot.reviewer, reviewSchema, {
      problem, specialists: handoffs, synthesis, conflicts, review_reasons: reasons,
      missing_roles: failures, unavailable_skills: snapshot.unavailable_skills,
    }), { label: "reviewer", agent: AGENT_NAME });
    try {
      review = parseResult(rawReview, reviewSchema);
      if (review.blocking_issues.length) review.status = "blocked";
    }
    catch (error) {
      failures.push({ role: "reviewer", critical: true, reason: error.message });
      review = { status: "blocked", issues: ["Required review did not complete."],
        blocking_issues: ["Required review did not complete."], reconsideration_requests: [] };
    }
  }
  ctx.phase("Receipt");
  return finish(snapshot, handoffs, failures, synthesis, conflicts, reasons, review, ctx.runId);
}

export function renderResult(result) {
  const bullets = values => values.length ? values.map(v => `- ${v}`).join("\n") : "- None reported.";
  const dissent = [...result.disagreements, ...result.conflicts.map(c =>
    `${c.key}: ${c.positions.map(p => `${p.role} recommends ${p.choice} (${p.reason})`).join("; ")}`)];
  const { workflow, version, run_id, status, roles_run, roles_completed, skills_used,
    reviewer_triggered, reviewer_status, review_reasons, assumptions_count,
    unresolved_questions_count, unavailable_skills, failures, checkpoint } = result.receipt;
  const compactReceipt = { workflow, version, run_id, status, roles_run, roles_completed,
    skills_used, reviewer_triggered, reviewer_status, review_reasons,
    assumptions_count, unresolved_questions_count, unavailable_skills, failures, mode: checkpoint.mode };
  const evidenceSources = unique(result.receipt.evidence.map(e => e.source));
  return `# GIS engineering decision (${result.status})\n\n${result.recommendation}
\n## Why it fits\n\n${bullets(result.why)}
\n## Tradeoffs and risks\n\n${bullets(unique([...result.tradeoffs, ...result.risks]))}
\n## Assumptions\n\n${bullets(result.assumptions)}
\n## Unresolved questions\n\n${bullets(result.unresolved_questions)}
\n## Disagreements\n\n${bullets(dissent)}
\n## Review\n\n${bullets(unique([...(result.review?.issues ?? []), ...(result.review?.blocking_issues ?? []), ...(result.review?.reconsideration_requests ?? [])]))}
\n## Missing analysis\n\n${bullets(result.receipt.failures.map(f => `${f.role}: ${f.reason}`))}
\n## Next recommended step\n\n${result.next_step}
\nAdvisory only. Consequential execution requires separate explicit human approval and applicable organizational controls.
\n## Evidence sources\n\n${bullets(evidenceSources)}
\n## Workflow receipt\n\n\`\`\`json\n${JSON.stringify(compactReceipt, null, 2)}\n\`\`\``;
}
