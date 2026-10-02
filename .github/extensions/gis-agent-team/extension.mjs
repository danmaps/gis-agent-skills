import { defineWorkflow, joinSession } from "@github/copilot-sdk/extension";
import { registerExtension } from "../../../workflows/gis-agent-team/copilot.mjs";

await registerExtension({ defineWorkflow, joinSession });
