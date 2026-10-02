export const ROLE_NAMES = ["spatial-data", "platform-publishing", "application-delivery"];

const spatial = /\b(data|dataset|assets?|features?|records?|geometry|schema|quality|topology|crs|projection|index|scale|refresh|arcpy|geoprocessing|buffer|spatial|parcels?|postgis|geoparquet)\b/i;
const platform = /\b(arcgis online|agol|enterprise|portal|hosted|publish\w*|sharing|authentication|feature service|vector tiles?)\b/i;
const application = /\b(web map|internal map|viewer|app|application|ux|browser|dashboard|maplibre|experience builder|leaflet)\b/i;
const staticDelivery = /\b(read.only|static|vector tiles?|monthly|periodic\w*)\b/i;
const writes = /\b(publish\w*|replac\w*|overwrit\w*|delet\w*|append\w*|edit\w*|updat\w*)\b/i;
const writeTerms = "(?:publish\\w*|replac\\w*|overwrit\\w*|delet\\w*|append\\w*|edit\\w*|updat\\w*|production|sharing|authentication|change\\w*|modify\\w*|make public)";
const negatedWrites = new RegExp(
  `\\b(?:without|never|not|no|do not|don't|does not|doesn't|avoid)\\b[^.!?;\\n]{0,40}?\\b${writeTerms}\\b|\\b${writeTerms}\\b[^.!?;\\n]{0,25}\\b(?:(?:is|are|was|were)\\s+)?(?:not|required|needed|necessary|requested|intended|planned|wanted)\\b`,
  "gi",
);

function affirmativeText(problem) {
  return problem.replace(negatedWrites, " ");
}

export function validateInput(args) {
  if (!args || typeof args !== "object" || Array.isArray(args) ||
      Object.keys(args).some(key => key !== "problem") ||
      typeof args.problem !== "string" || !args.problem.trim() || args.problem.length > 20000) {
    throw new Error("Supply exactly { problem: <non-empty string, at most 20000 characters> }");
  }
  return args.problem.trim();
}

export function planRoles(problem) {
  const selected = ROLE_NAMES.filter(role => ({
    "spatial-data": spatial, "platform-publishing": platform, "application-delivery": application,
  })[role].test(problem));
  const routingAssumptions = [];
  if (!selected.length) {
    selected.push("spatial-data");
    routingAssumptions.push("No explicit platform or delivery signal; start with spatial/data triage. Clarify the GIS decision before relying on this routing.");
  }
  return {
    roles: selected.map(name => ({ name, critical: !(name === "application-delivery" &&
      /(?:optional|nice to have)[^.!?\n]*(?:viewer|app|web map)|(?:viewer|app|web map)[^.!?\n]*(?:optional|nice to have)/i.test(problem)) })),
    routing_assumptions: routingAssumptions,
  };
}

export function skillsForRole(role, problem) {
  const skills = [];
  const add = (id, condition = true) => { if (condition) skills.push(id); };
  if (role === "spatial-data") {
    add("analysis-readiness-check");
    add("schema-smells", /\b(schema|quality|fields?|nulls?|duplicates?|diagnostics?)\b/i.test(problem));
    add("data-smells-summary", /\b(quality|diagnostics?|investigat\w*|smells?)\b/i.test(problem));
    add("spatial-index", /\b(index|postgis|sql server|query|queries|performance)\b/i.test(problem));
    add("geoparquet-pack", /\b(geoparquet|parquet|partition\w*)\b/i.test(problem));
    add("arcpy-plan", /\b(arcpy|geoprocessing|buffer)\b/i.test(problem));
    add("arcpy-script", /\b(arcpy)\b/i.test(problem) && /\b(script|code|python)\b/i.test(problem));
  } else if (role === "platform-publishing") {
    add("agol-publish-checklist", /\b(publish\w*|hosted|architecture\w*|delivery|web map|internal map)\b/i.test(problem));
    add("static-map", staticDelivery.test(problem));
    add("agol-search", /\b(search|find|catalog)\b/i.test(problem));
    add("living-atlas", /living atlas/i.test(problem));
  } else if (role === "application-delivery") {
    add("gis-microapp-ux-spec");
    add("static-map", staticDelivery.test(problem));
  } else throw new Error(`Unknown role: ${role}`);
  const activeProblem = affirmativeText(problem);
  add("safety", writes.test(activeProblem) ||
    /\b(change|modify|make public)\b[^.!?\n]*\b(sharing|authentication|permissions|access)\b/i.test(activeProblem));
  return [...new Set(skills)];
}

export function requestReviewReasons(problem) {
  // Planning a production write still requires risk review when execution is
  // explicitly forbidden. Read-only analysis itself never needs approval.
  const reasons = [];
  const activeProblem = affirmativeText(problem);
  if (/\b(production|shared)\b/i.test(activeProblem) &&
      /\b(append\w*|delet\w*|overwrit\w*|replac\w*|updat\w*|edit\w*|publish\w*)\b/i.test(activeProblem)) {
    reasons.push("production-write");
  }
  if (/\b(change|modify|make public)\b[^.!?\n]*\b(sharing|authentication|permissions|access)\b/i.test(activeProblem)) {
    reasons.push("publishing-security");
  }
  return reasons;
}
