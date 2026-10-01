# Vector Tile Compatibility Notes

Review these areas before packaging and classify each finding as **Supported**, **Approximated**, or **Unsupported**.

## Common review areas

- gradients and complex fills
- hatches and pattern fills
- marker effects
- markers placed along lines or polygon outlines
- symbol effects and multilayer symbol behavior
- labeling that depends on unsupported expressions or dynamic behavior
- scale ranges that are missing, contradictory, or too broad
- raster, imagery, 3D, or unsupported layer types
- popup fields that are not necessary for drawing or simple identify

## Reporting rule

Do not silently simplify cartography. For every approximation or unsupported item, identify the affected layer, the expected visual or interaction consequence, and the available choice:

1. accept the change explicitly
2. revise the source cartography
3. choose a feature or other service architecture

## Attribute minimization

Retain a field only when it is required for:

- drawing or renderer logic
- labels
- client styling
- explicitly requested simple identify
- feature identity for simple identify

Large popup field lists increase package size and do not turn a vector tile layer into a query service. Warn when the requested list is unusually large and recommend a smaller set.

