import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { loadSnapshot, runTeam, renderResult, detectConflicts, roleText, AGENT_NAME } from "../workflows/gis-agent-team/run.mjs";
import { planRoles, requestReviewReasons, validateInput } from "../workflows/gis-agent-team/routing.mjs";
import { registerExtension, workflowMeta } from "../workflows/gis-agent-team/copilot.mjs";

const fixture = async name => JSON.parse(await readFile(new URL(`../examples/gis-agent-team/${name}.json`, import.meta.url), "utf8"));
const reference = await fixture("800k-assets");

function handoff(role, overrides = {}) {
  return {
    role, summary: `Analysis by ${role}`, findings: ["Refresh is monthly."],
    constraints: ["Read-only access."], risks: [], recommendations: ["Validate the interaction contract before choosing delivery."],
    assumptions: ["Rich filtering has not been confirmed."], unknowns: ["Which attributes may be exposed?"],
    skills_used: role === "spatial-data" ? ["analysis-readiness-check"] : ["static-map"],
    confidence: "high", evidence: [{ source: "problem", claim: "Data changes monthly.", kind: "fact" }],
    decisions: [], review_flags: [], ...overrides,
  };
}
const draft = {
  recommendation: "Evaluate vector tiles for display and feature services when filtering or rich feature access is required.",
  why: ["Monthly refresh and read-only access fit a periodic delivery model."],
  tradeoffs: ["Feature services support richer queries; vector tiles simplify read-only drawing."],
  assumptions: ["Employee authentication needs confirmation."],
  unresolved_questions: ["Confirm identify, filtering, refresh mechanics, and attribute exposure."],
  disagreements: [], next_step: "Confirm the interaction and access requirements with the GIS owner.", review_flags: [],
};
const readyReview = { status: "ready-with-caveats", issues: ["Validate the decision-critical assumption."], blocking_issues: [], reconsideration_requests: [] };

function harness({ problem = reference.problem, responses = {}, snapshot, reject } = {}) {
  const calls = [], phases = [];
  let active = 0, maxActive = 0;
  const ctx = {
    args: { problem }, runId: "test-run", phase: title => phases.push(title),
    step: async (_key, producer) => snapshot ?? producer(),
    parallel: tasks => Promise.all(tasks.map(task => task())),
    agent: async (prompt, options) => {
      calls.push({ prompt, options });
      assert.equal(options.agent, AGENT_NAME);
      assert.equal(options.schema, undefined, "SDK retries must not exceed the fixed team cap");
      active++; maxActive = Math.max(maxActive, active);
      await new Promise(resolve => setImmediate(resolve));
      active--;
      if (reject === options.label) throw new Error("hard runtime failure");
      if (Object.hasOwn(responses, options.label)) return responses[options.label];
      return JSON.stringify(options.label === "synthesizer" ? draft :
        options.label === "reviewer" ? readyReview : handoff(options.label));
    },
  };
  return { ctx, calls, phases, maxActive: () => maxActive };
}

for (const name of ["800k-assets", "arcpy-automation", "data-quality"]) {
  test(`${name}: routes to relevant roles and loads existing catalog guidance`, async () => {
    const input = await fixture(name);
    const snapshot = await loadSnapshot(input.problem);
    assert.deepEqual(snapshot.roles.map(r => r.name), input.expected_roles);
    const loaded = new Set(snapshot.assignments.flatMap(a => a.skills));
    input.expected_skills.forEach(id => assert.ok(loaded.has(id), `missing ${id}`));
    if (name === "800k-assets") assert.ok(!loaded.has("safety"));
    assert.deepEqual(snapshot.unavailable_skills, []);
    assert.ok(snapshot.sources.every(s => /^[a-f0-9]{64}$/.test(s.sha256)));
    assert.ok(snapshot.assignments.every(a => a.files.every(f => f.path.endsWith(".md"))));
  });
}

test("800k scenario: independent specialists run concurrently, synthesis gets contracts, receipt is grounded", async () => {
  const h = harness();
  const result = await runTeam(h.ctx);
  assert.equal(h.maxActive(), 3);
  assert.equal(h.calls.length, 4);
  assert.deepEqual(h.calls.map(c => c.options.label), [...reference.expected_roles, "synthesizer"]);
  assert.match(h.calls[1].prompt, /skills\/static-map\/references\/decision-guide.md/);
  assert.match(h.calls[3].prompt, /"specialists":\[/);
  assert.doesNotMatch(h.calls[3].prompt, /skill_files/);
  assert.equal(result.receipt.reviewer_triggered, false);
  assert.equal(result.receipt.checkpoint.execution_enabled, false);
  assert.ok(result.receipt.evidence.length);
  assert.ok(result.receipt.skills_used.includes("static-map"));
  assert.match(renderResult(result), /feature services/);
  assert.match(renderResult(result), /Workflow receipt/);
});

test("conflicting recommendations trigger exactly one reviewer and preserve both positions", async () => {
  const h = harness({ responses: {
    "spatial-data": JSON.stringify(handoff("spatial-data", { decisions: [{ key: "delivery", choice: "feature-service", reason: "Queries may be needed." }] })),
    "platform-publishing": JSON.stringify(handoff("platform-publishing", { decisions: [{ key: "delivery", choice: "vector-tiles", reason: "Display-only drawing." }] })),
  } });
  const result = await runTeam(h.ctx);
  assert.equal(h.calls.length, 5);
  assert.equal(result.receipt.reviewer_triggered, true);
  assert.deepEqual(result.receipt.review_reasons, ["material-conflict"]);
  assert.equal(result.conflicts[0].positions.length, 2);
  assert.match(renderResult(result), /spatial-data recommends feature-service/);
  assert.match(renderResult(result), /platform-publishing recommends vector-tiles/);
});

test("low confidence and risk flags trigger review even when the synthesizer omits them", async () => {
  const h = harness({ responses: { "spatial-data": JSON.stringify(handoff("spatial-data", {
    confidence: "low", review_flags: ["production-write", "publishing-security", "critical-assumption"],
  })) } });
  const result = await runTeam(h.ctx);
  assert.equal(result.receipt.reviewer_triggered, true);
  for (const flag of ["production-write", "publishing-security", "critical-assumption", "decision-critical-low-confidence"]) {
    assert.ok(result.receipt.review_reasons.includes(flag));
  }
});

test("synthesis-detected semantic disagreement also triggers review", async () => {
  const h = harness({ responses: { synthesizer: JSON.stringify({ ...draft, disagreements: ["Two suggestions require incompatible refresh mechanics."] }) } });
  assert.equal((await runTeam(h.ctx)).receipt.reviewer_triggered, true);
});

test("ArcPy production plan triggers review from the request even if agents omit flags", async () => {
  const input = await fixture("arcpy-automation");
  const h = harness({ problem: input.problem });
  const result = await runTeam(h.ctx);
  assert.deepEqual(h.calls.map(c => c.options.label), ["spatial-data", "synthesizer", "reviewer"]);
  assert.deepEqual(result.receipt.review_reasons, ["production-write"]);
});

test("negated read-only write mentions do not load safety guidance or trigger review", async () => {
  const problem = "Review the read-only production dataset; editing is not required and without publishing anything.";
  const snapshot = await loadSnapshot(problem);
  assert.ok(snapshot.assignments.every(assignment => !assignment.skills.includes("safety")));
  assert.deepEqual(requestReviewReasons(problem), []);
});

for (const raw of [null, "not JSON", JSON.stringify({ role: "spatial-data" }),
  JSON.stringify(handoff("platform-publishing")),
  JSON.stringify(handoff("spatial-data", { skills_used: ["imaginary-skill"] })),
  JSON.stringify(handoff("spatial-data", { summary: " " })),
  JSON.stringify(handoff("spatial-data", { surprise: "not part of contract" })),
  JSON.stringify(handoff("spatial-data", { evidence: [{ source: "https://invented.test", claim: "Made up inspection", kind: "fact" }] })),
]) {
  test(`invalid critical handoff blocks synthesis: ${String(raw).slice(0, 55)}`, async () => {
    const h = harness({ responses: { "spatial-data": raw } });
    const result = await runTeam(h.ctx);
    assert.equal(result.status, "blocked");
    assert.equal(result.specialists.length, 2, "retain successful specialists");
    assert.equal(result.receipt.failures[0].role, "spatial-data");
    assert.equal(h.calls.length, 3, "do not synthesize without critical analysis");
  });
}

test("optional specialist failure allows caveated synthesis and exposes missing role", async () => {
  const snapshot = await loadSnapshot(reference.problem + " A viewer is optional.");
  assert.equal(snapshot.roles.find(r => r.name === "application-delivery").critical, false);
  const h = harness({ snapshot, responses: { "application-delivery": null } });
  const result = await runTeam(h.ctx);
  assert.equal(result.status, "ready-with-caveats");
  assert.equal(result.receipt.synthesizer_ran, true);
  assert.equal(result.receipt.failures[0].critical, false);
  assert.match(h.calls[3].prompt, /"missing_roles":\[\{"role":"application-delivery"/);
});

test("missing skill is reported and cannot be claimed as used", async () => {
  const snapshot = await loadSnapshot(reference.problem);
  snapshot.unavailable_skills.push({ skill: "static-map", reason: "entrypoint could not be read" });
  for (const assignment of snapshot.assignments) {
    assignment.skills = assignment.skills.filter(s => s !== "static-map");
    assignment.files = assignment.files.filter(f => !f.path.startsWith("skills/static-map/"));
  }
  const responses = Object.fromEntries(reference.expected_roles.map(role => [role, JSON.stringify(handoff(role, { skills_used: [] }))]));
  const h = harness({ snapshot, responses });
  const result = await runTeam(h.ctx);
  assert.equal(result.status, "ready-with-caveats");
  assert.equal(result.receipt.unavailable_skills[0].skill, "static-map");
  assert.ok(!result.receipt.skills_used.includes("static-map"));
});

test("failed synthesis and failed required review produce blocked receipts", async () => {
  const badSynthesis = harness({ responses: { synthesizer: null } });
  assert.equal((await runTeam(badSynthesis.ctx)).receipt.failures[0].role, "synthesizer");
  const badReview = harness({ responses: {
    synthesizer: JSON.stringify({ ...draft, review_flags: ["critical-assumption"] }), reviewer: null,
  } });
  const result = await runTeam(badReview.ctx);
  assert.equal(result.status, "blocked");
  assert.equal(result.receipt.failures[0].role, "reviewer");
  assert.equal(result.recommendation, draft.recommendation);
});

test("reviewer can block without rewriting or erasing the recommendation", async () => {
  const h = harness({ responses: {
    synthesizer: JSON.stringify({ ...draft, review_flags: ["critical-assumption"] }),
    reviewer: JSON.stringify({ status: "blocked", issues: ["No approved attribute exposure."], blocking_issues: ["No approved attribute exposure."], reconsideration_requests: ["Ask the data owner about classification."] }),
  } });
  const result = await runTeam(h.ctx);
  assert.equal(result.status, "blocked");
  assert.equal(result.recommendation, draft.recommendation);
  assert.ok(result.unresolved_questions.includes("Ask the data owner about classification."));
});

test("hard runtime/cancellation errors propagate rather than becoming success-shaped receipts", async () => {
  const h = harness({ reject: "synthesizer" });
  await assert.rejects(runTeam(h.ctx), /hard runtime failure/);
});

test("blocking review issues override an inconsistent ready status", async () => {
  const h = harness({ responses: {
    synthesizer: JSON.stringify({ ...draft, review_flags: ["material-conflict"] }),
    reviewer: JSON.stringify({ ...readyReview, status: "ready", blocking_issues: ["Synthesis resolved dissent by majority vote."] }),
  } });
  const result = await runTeam(h.ctx);
  assert.equal(result.status, "blocked");
  assert.equal(result.review.status, "blocked");
  assert.match(renderResult(result), /majority vote/);
});

test("routing fallback is explicit; invalid inputs start no agents", async () => {
  assert.equal(planRoles("Help with a GIS decision").roles.length, 1);
  assert.equal(planRoles("Help with a GIS decision").routing_assumptions.length, 1);
  for (const input of [null, {}, { problem: " " }, { problem: 3 }, { problem: "x", execute: true }, { problem: "x".repeat(20001) }]) {
    assert.throws(() => validateInput(input));
  }
});

test("conflict matching normalizes case and whitespace", () => {
  assert.deepEqual(detectConflicts([
    handoff("spatial-data", { decisions: [{ key: "delivery", choice: " VECTOR-TILES ", reason: "a" }] }),
    handoff("platform-publishing", { decisions: [{ key: "delivery", choice: "vector-tiles", reason: "b" }] }),
  ]), []);
});

test("portable role contracts load on Windows with CRLF checkouts", async () => {
  const document = await readFile(new URL("../workflows/gis-agent-team/roles.md", import.meta.url), "utf8");
  for (const role of [...reference.expected_roles, "synthesizer", "reviewer"]) {
    assert.equal(roleText(document.replace(/\r?\n/g, "\r\n"), role), roleText(document, role));
  }
});

test("Copilot registers the real slash command, bounded workflow, and a tool-free agent", async () => {
  let config, registered;
  const logs = [], runs = [];
  const session = {
    log: async message => logs.push(message),
    workflow: { run: async (name, options) => {
      runs.push({ name, options });
      return { status: "paused", runId: "paused-run" };
    } },
  };
  await registerExtension({ defineWorkflow: definition => { registered = definition; return definition; },
    joinSession: async options => { config = options; return session; } });
  assert.equal(registered.meta.name, "gis-agent-team");
  assert.deepEqual(workflowMeta.limits, { maxConcurrentSubagents: 3, maxTotalSubagents: 5 });
  assert.deepEqual(config.customAgents[0].tools, []);
  assert.equal(config.customAgents[0].name, AGENT_NAME);
  assert.equal(config.customAgents[0].infer, false);
  assert.equal(config.commands[0].name, "gis-agent-team");
  await config.commands[0].handler({ args: " " });
  assert.equal(runs.length, 0);
  await config.commands[0].handler({ args: reference.problem });
  assert.deepEqual(runs[0].options.args, { problem: reference.problem });
  assert.match(logs.at(-1), /paused-run: paused/);
});
