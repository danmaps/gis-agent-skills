import { readFileSync } from "node:fs";
import { runTeam, renderResult, limits, AGENT_NAME } from "./run.mjs";
import { validateInput } from "./routing.mjs";

export const workflowMeta = {
  name: "gis-agent-team",
  description: "Read-only GIS decision workflow. args: { problem: string }. Up to three specialists, one synthesis, and conditional review; no GIS execution.",
  phases: ["Intake", "Specialists", "Synthesis", "Review", "Receipt"].map(title => ({ title })),
  argsSchema: { type: "object", required: ["problem"], properties: { problem: { type: "string" } } },
  limits,
};

export async function registerExtension({ defineWorkflow, joinSession }) {
  const workflow = defineWorkflow({ meta: workflowMeta, run: runTeam });
  const session = await joinSession({
    workflows: [workflow],
    customAgents: [{
      name: AGENT_NAME, description: "Bounded GIS advisory analysis with no tools or recursive spawning.",
      tools: [], infer: false,
      prompt: readFileSync(new URL("./advisory.md", import.meta.url), "utf8"),
    }],
    commands: [{
      name: "gis-agent-team", description: "Compare a GIS engineering problem with a small specialist team (advisory only).",
      handler: async ({ args }) => {
        let problem;
        try { problem = validateInput({ problem: args }); }
        catch { await session.log("Usage: /gis-agent-team <GIS engineering problem>"); return; }
        const run = await session.workflow.run("gis-agent-team", {
          args: { problem }, notifyOnComplete: false, logPhaseNames: true,
        });
        if (run.status === "completed") await session.log(renderResult(run.result));
        else await session.log(`gis-agent-team run ${run.runId}: ${run.status}. Inspect /workflows for details and resume options.`);
      },
    }],
  });
  return session;
}
