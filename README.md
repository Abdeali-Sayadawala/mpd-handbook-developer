# MPD Developer Handbook

Part of **My Property Doctors (MPD)**, a property-management platform for NRIs and owners of property in India.

A private HTML handbook for developers: how the 7 repos fit together, code structure, API contract (openapi.json) and generated clients, data model, state machines, deployment, runbooks and decisions (ADRs).

## Stack
Static HTML + CSS + a little JS (no build step). Optional: generated pages from openapi.json and the Prisma schema

## Structure (planned)
```
index.html                 start here (seeded from the architecture handbook)
pages/  repos.html  api-contract.html  data-model.html  state-machines.html  deployment.html  runbooks.html  adr.html
assets/
```

## Getting started
```bash
open index.html in a browser   # or: npx serve .
```

## Configuration
None. Hosted at dev-docs.<domain> behind a password (Caddy basic auth).

## Related repos
mpd-backend · mpd-frontend · mpd-mobile · mpd-global · mpd-infra · mpd-handbook-developer · mpd-handbook

## Status
Scaffold created 20-Nov-2026. Roadmap: Updated at the end of every milestone.

## Pages
- `index.html`: architecture overview (system map, modules, job states, payments, vault, franchise model, cost, roadmap).
- `status.html`: what is built today, how to run it, backend modules, flows, rules the tests enforce, screens, hierarchy and dispatch, operating the console, what is next.
Update `status.html` at the end of every milestone step, together with `docs/architecture/progress.md` and the repo CLAUDE.md files.
- `docs/`: **all project documentation, in Git**: `architecture/` (spec, customers-and-pricing, admin-hierarchy-and-dispatch, progress, interactive handbook), `legacy/` (the old app), `seed/` (the 293-service catalogue). Open `docs/view.html` to read the markdown files as web pages (needs a local server, for example `npx serve .`).
- `workspace/`: the workspace-root `CLAUDE.md` and `README.md`, `NEW-MACHINE.md` (continue from any machine) and `setup.ps1` (clones the other repos).
