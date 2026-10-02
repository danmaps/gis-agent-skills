# Tests

Run `python tests/validate.py` to validate skill structure and catalog integrity.

Run `npm test` with Node 22+ for the optional GIS team workflow. The tests use
mock agents and a mock Copilot host; no API calls, credentials, or dependencies
are needed. They verify routing, parallel execution, handoff validation,
provenance, conditional review, partial failure, and command registration.
See `workflows/gis-agent-team/README.md` for live evaluation and its limitations.
