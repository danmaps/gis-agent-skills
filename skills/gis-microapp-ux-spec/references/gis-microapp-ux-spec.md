# GIS Micro-App UX Specification

## Purpose

This spec defines what a strong GIS micro-app should look like when it is used as:
- a fast-turn client deliverable
- a portfolio/demo example
- a Symphony mission output
- a proof that a rough GIS request can be transformed into a polished operational app

The goal is not just to show a map. The goal is to show:
- **input request** -> **structured deliverable** -> **immediate operational value**

---

## 1. Product framing

Every example app should answer these questions immediately:

1. What kind of project is this?
2. Who is it for?
3. What were they asking for?
4. What can they do with this app right now?

If a user cannot answer those in about 10 seconds, the app is under-framed.

---

## 2. Required top-of-page structure

Each micro-app should have a top section containing:

### A. Eyebrow / category
Examples:
- Construction Site Review
- Environmental Monitoring Example
- Inspection Workflow

### B. Title
A believable project/app name.
Examples:
- Jefferson Corridor Streetlight Tie-In
- Pine Creek Stormwater Watch

### C. One-sentence summary
A short sentence describing the operational scenario.

### D. Example request block
This should be near the top, not buried below the map.

Format:

**Example request**
> We need a quick web map for our field superintendent showing active work zones, utility conflicts, and which parcels are affected along the corridor. We need something shareable by tomorrow.

Guidelines:
- fictional is fine
- believable is required
- make it sound like an actual client email or Slack message
- include urgency or context when helpful
- do not over-write it; one short paragraph is enough

### E. Delivery metadata
A small strip showing 3-5 useful facts, such as:
- operator or buyer
- phase or reporting cycle
- project window
- contractor / client / lead
- current focus or status

---

## 3. Core layout rules

### Desktop
Preferred layout:
- top framing/header area
- split workspace below
  - left: controls, filters, list, metrics
  - right: map and selected-feature context

### Mobile/small screens
- preserve order of importance
- map should remain easy to reach
- selected-feature detail must remain visible or easy to reopen

### Key principle
The app should not force the user to scroll around to reconnect:
- what they clicked
- why it matters
- what details belong to that selection

---

## 4. Selected-feature behavior

This is a hard requirement.

When a feature is clicked:
- the selected state should be obvious on the map
- the related detail should appear immediately
- the detail should remain easy to see without hunting

### Acceptable patterns
- sticky sidebar detail panel
- pinned inspector panel
- bottom drawer that stays open
- split panel with selected object summary

### Avoid
- details appearing far below the fold
- details only inside temporary popups when richer info exists elsewhere
- requiring the user to scroll significantly to find the selected item information

---

## 5. Search and filters

Search and filters should reflect the real workflow, not generic map UI.

### Good examples
- work zone status
- inspection due / complete / failed
- monitoring exceedance state
- parcel ID / asset ID / address lookup
- crew assignment / current action / issue type

### Bad examples
- arbitrary technical fields with no operator meaning
- huge raw filter lists that look like database dumps

Rules:
- keep statuses human-readable
- default filters should make the app understandable quickly
- search should target the identifiers users actually recognize

---

## 6. Example-card rules for the homepage

If the micro-app is featured on a landing page, every example should have a real card.

Each card should include:
- title
- one-sentence description
- small tag set
- a clear action button

### Card action rules
If the example is live:
- provide a direct **Open live demo** link

If the example is not live yet:
- still use a real card
- clearly mark it as in progress / coming next
- point to a meaningful next action (request form, roadmap, or implementation status)

Avoid dead placeholder cards with no story and no action.

---

## 7. Fictional request writing guide

Use requests that sound like a real ask from a real operator.

Template:
> We need a quick web map for our [role] showing [key operational needs]. We need something [shareable / field-ready / easy to use] by [timeframe].

### Construction example pattern
- role: field superintendent
- needs: work zones, utility conflicts, affected parcels, inspections
- urgency: by tomorrow / by morning briefing

### Environmental example pattern
- role: environmental field lead
- needs: monitoring stations, exceedances, corrective actions, sensitive areas
- urgency: before next site walk / this week’s reporting cycle

### Inspection example pattern
- role: municipal operations lead / facilities manager
- needs: assets due, failed inspections, follow-up work, assignment areas
- urgency: this week / before crew dispatch

---

## 8. Visual and interaction tone

These apps should feel:
- operational
- calm
- precise
- lightweight
- shareable

They should not feel:
- like a dashboard template dump
- like a flashy data-viz toy
- like a marketing landing page pretending to be a tool

---

## 9. Minimum acceptance checklist

A GIS micro-app passes this spec if:

- [ ] title and scenario are clear immediately
- [ ] an Example request block is visible near the top
- [ ] the buyer/operator is obvious
- [ ] map interaction is real and useful
- [ ] selected-feature detail stays visible or easy to find
- [ ] search/filter states match the workflow
- [ ] the app feels understandable in under 10 seconds
- [ ] the app is iframe-safe / shareable
- [ ] homepage/demo card has a real action link

---

## 10. How Symphony should use this spec

When Symphony is generating or evaluating a GIS demo mission:

### Melody / planner
Use this spec to define:
- the buyer story
- the Example request
- the required interaction contract
- the acceptance criteria

### Composition / app builder
Use this spec to implement:
- the header structure
- the request framing block
- the selected-feature detail pattern
- the card/action structure

### Resonance / validator
Validate against the acceptance checklist above.

---

## 11. How the maps site should use this spec

For every example on the site:
- give it a real card
- give it a live or meaningful action
- keep the fictional request visible in the demo
- prefer sticky visible detail over scroll-hunting

---

## 12. Suggested next extensions

Future supporting skills could include:
- `gis-example-request-writer`
- `leaflet-microapp-layout`
- `gis-demo-validator`
- `inspection-demo-builder`
- `environmental-demo-builder`
- `construction-demo-builder`
