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
- `guide/`: **the interactive role guide** for admin-side users who do not know the app: pick a role to see its menu, step-by-step tasks, a request followed from inquiry to work, and small try-it simulations (job pool, two-person payment, areas). Plain HTML, CSS and JS with no build; open `guide/index.html`. Content lives in `guide/data.js`.
- `docs/`: **all project documentation, in Git**: `architecture/` (spec, customers-and-pricing, admin-hierarchy-and-dispatch, tech-explained (what Next.js and NestJS are and why we use them), progress, interactive handbook), `legacy/` (the old app), `seed/` (the 293-service catalogue). Open `docs/view.html` to read the markdown files as web pages (needs a local server, for example `npx serve .`).
- `workspace/`: the workspace-root `CLAUDE.md` and `README.md`, `NEW-MACHINE.md` (continue from any machine) and `setup.ps1` (clones the other repos).

## Hosting
This repository is **private** (it holds specs, costs and business decisions), and GitHub Pages is not available for private repositories on the current plan, so it is read from GitHub or locally (`npx serve .`, then open `index.html`, `status.html`, `docs/view.html`). The public user guide is `mpd-handbook`, hosted at https://abdeali-sayadawala.github.io/mpd-handbook/.
