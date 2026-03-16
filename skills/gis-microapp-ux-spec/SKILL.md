---
name: gis-microapp-ux-spec
description: Define and validate the UX contract for small GIS web apps and demo micro-apps. Use when designing, reviewing, or refining a GIS micro-app, example site, or fast-turn client deliverable so the output feels operational, believable, and easy to understand.
---

# GIS Micro-App UX Spec

Define the UX contract before building the app.

## Intent

Turn a vague GIS demo or client request into a concrete micro-app UX target that can guide planning, implementation, and validation.

## Apply this spec to

- standalone Leaflet or map-based demos
- “request → deliverable” example apps
- fast-turn GIS service deliverables
- Symphony missions that produce GIS micro-apps
- homepage example cards that link to demo apps

## Core rule

A good GIS micro-app should prove three things quickly:
1. what the client asked for
2. what the delivered app helps them do
3. how a user can act on the map immediately

## Required UX blocks

Every GIS micro-app should include:
- a clear title and one-sentence scenario
- an **Example request** block near the top
- a visible operator/buyer frame
- immediate access to the live map
- persistent or easy-to-find selected-feature detail
- filters/search tied to the real workflow

## Required interaction behavior

- clicking a feature should show selected-feature detail without requiring the user to hunt for it
- the selected-feature panel should be sticky, pinned, or otherwise remain obvious during use
- filters should match realistic operational states
- the app should feel useful in under 10 seconds

## Demo framing rules

When the app is an example or portfolio piece, include:
- who asked for it (fictional but believable)
- what they needed by when
- what the output provides

Use realistic requests, not marketing fluff.

## Deliverables

Produce:
- a UX spec or checklist for the micro-app
- acceptance criteria
- notes on any gaps between the current app and the target experience

## Read next

If you need the full UX contract and acceptance checklist, read:
- `references/gis-microapp-ux-spec.md`

## Inputs

List or infer the required inputs before doing work.

## Outputs

Return a concise, usable result with the key artifacts or recommendations.

## Safety

Do not invent data, credentials, or system context. Flag uncertainty and risky operations clearly.

