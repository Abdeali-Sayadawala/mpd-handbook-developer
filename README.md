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
