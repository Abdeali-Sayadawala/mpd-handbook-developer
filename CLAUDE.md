# CLAUDE.md: mpd-handbook-developer

A private HTML handbook for developers: how the 7 repos fit together, code structure, API contract (openapi.json) and generated clients, data model, state machines, deployment, runbooks and decisions (ADRs).

## Repo-specific rules
- Update the handbook in the same week a milestone finishes: `status.html` (what is built, how to run, rules, next) and the roadmap in `index.html`. Keep it in step with `docs/architecture/progress.md`.
- No secrets, no customer data, no production URLs with tokens.

- The role guide `guide/` (`data.js` content, `app.js` behaviour, `style.css`) must be updated when a role's screens, abilities, menu or a flow changes: add or change tasks in `data.js`, add a journey step or glossary word if needed. Plain words, no internal names, no real data. Smoke-check: `node --check guide/data.js guide/app.js`. No dependencies, no build.
- The project's start-here repo is `mpd-context`: update its `05-status.md` and `99-session-log.md` after every step.

## Rules that apply in every MPD repo
- Brand: **My Property Doctors (MPD)**. Read `BRAND_NAME`, `BRAND_SHORT` and `BRAND_DOMAIN` from config. Never hard-code the name or domain.
- TypeScript strict mode, ESLint + Prettier, Conventional Commits (`feat:`, `fix:`, `chore:`).
- Branches: `develop` → staging (auto deploy), `main` → production (manual deploy). Feature branches + merge requests.
- No secrets in git. Use `.env.example` with placeholders only. No real customer data in code, fixtures, logs or docs.
- No direct backend calls (static site). Describe the API only as documented in `mpd-backend/openapi.json`.
- Full spec: `docs/architecture/README.md`. Workspace notes: `../CLAUDE.md`. **Start of a session and the after-every-step checklist: `../mpd-context/README.md` and `08-workflow.md`.**

## Commands
```bash
open index.html in a browser   # or: npx serve .
```
