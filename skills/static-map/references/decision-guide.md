# Static Map Decision Guide

## Fast classification

Ask what the map must do, not what data it contains.

| Requirement | Vector tile layer | Feature layer |
| --- | --- | --- |
| Read-only visualization | Strong fit | Works, but more capable |
| Periodic republish | Strong fit | Works |
| Pan and zoom across many features | Strong fit | May be expensive |
| Simple identify with a few fields | Possible | Strong fit |
| Editing | No | Yes |
| Live or near-real-time updates | No | Yes |
| Arbitrary queries and filters | No | Yes |
| Attachments or related records | No | Yes |
| Rich popups and charts | Limited | Yes |
| Feature-level analysis/API use | No | Yes |
| Complete geometry at arbitrary scales | No | Yes |

Any critical requirement in the right column is a reason to stop the static-map path.

## Interaction gate

1. **Display only:** package drawing, labeling, and styling inputs only.
2. **Simple identify:** retain a small, explicit popup field list and feature identity when needed.
3. **Rich interaction:** recommend a feature layer rather than trying to recreate feature-service behavior with tiles.

## Questions that change the recommendation

- Who needs to edit the data?
- How quickly can changes appear online?
- Must users run arbitrary attribute or spatial queries?
- Do selections drive downstream application behavior?
- Are attachments, related tables, or rich popups required?
- What scales are useful, and can generalization at those scales be accepted?
- Is owner, organization, group, or public sharing explicitly intended?
- Is this a new publication or an explicit replacement?

## Minimum safe default

If the request is ambiguous, prepare only. Use owner sharing, retain no popup fields, and require the user to confirm the map, target folder, and sharing level before execution.

