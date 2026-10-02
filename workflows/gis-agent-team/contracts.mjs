import { readFileSync } from "node:fs";

export const handoffSchema = JSON.parse(readFileSync(
  new URL("../../schemas/gis-team-handoff.schema.json", import.meta.url), "utf8"));
const strings = { type: "array", items: { type: "string", minLength: 1 } };

export const synthesisSchema = {
  type: "object", additionalProperties: false,
  required: ["recommendation", "why", "tradeoffs", "assumptions", "unresolved_questions", "disagreements", "next_step", "review_flags"],
  properties: {
    recommendation: { type: "string", minLength: 1 },
    why: strings, tradeoffs: strings, assumptions: strings,
    unresolved_questions: strings, disagreements: strings,
    next_step: { type: "string", minLength: 1 },
    review_flags: handoffSchema.properties.review_flags,
  },
};

export const reviewSchema = {
  type: "object", additionalProperties: false,
  required: ["status", "issues", "blocking_issues", "reconsideration_requests"],
  properties: {
    status: { type: "string", enum: ["ready", "ready-with-caveats", "blocked"] },
    issues: strings, blocking_issues: strings, reconsideration_requests: strings,
  },
};

// Deliberately implement only the vocabulary used by these local contracts.
// Full validation happens here, not in Copilot's narrower schema subset.
export function validate(value, schema, path = "result") {
  const fail = (message) => { throw new Error(`${path}: ${message}`); };
  if (schema.type === "object") {
    if (!value || typeof value !== "object" || Array.isArray(value)) fail("expected object");
    for (const key of schema.required ?? []) if (!Object.hasOwn(value, key)) fail(`missing ${key}`);
    for (const key of Object.keys(value)) {
      if (!Object.hasOwn(schema.properties, key)) {
        if (schema.additionalProperties === false) fail(`unexpected ${key}`);
      } else validate(value[key], schema.properties[key], `${path}.${key}`);
    }
  } else if (schema.type === "array") {
    if (!Array.isArray(value)) fail("expected array");
    value.forEach((item, i) => validate(item, schema.items, `${path}[${i}]`));
    if (schema.uniqueItems && new Set(value.map(v => JSON.stringify(v))).size !== value.length) fail("duplicate items");
  } else if (schema.type === "string") {
    if (typeof value !== "string") fail("expected string");
    if (schema.minLength && value.trim().length < schema.minLength) fail("empty string");
    if (schema.enum && !schema.enum.includes(value)) fail("unknown value");
  } else fail("unsupported contract type");
  return value;
}

export function parseResult(raw, schema) {
  if (typeof raw !== "string") throw new Error("missing agent response");
  // Accept a single fenced JSON object; reject surrounding prose or transcripts.
  const text = raw.trim().replace(/^```(?:json)?\s*\n([\s\S]*?)\n```$/, "$1");
  return validate(JSON.parse(text), schema);
}
