# My Property Doctors (MPD): new platform workspace

Property management for NRIs and owners of property in India: web app, Android and iOS apps, and the public website.

| Folder | What it is |
|---|---|
| `mpd-context` | **Start here.** The map and memory of the project: what it is, the repos, what is done and next, decisions, the after-every-step checklist |
| `mpd-handbook-developer/guide/` | Interactive guide that explains each role (super admin to worker) to people who do not know the app. Open `guide/index.html` |
| `mpd-handbook-developer/docs/architecture/` | The full plan for the new system (start here). Open `MPD-Architecture-Handbook.html` in a browser for the interactive version |
| `mpd-handbook-developer/docs/legacy/` | Documentation of the old Laravel app, for reference |
| `mpd-handbook-developer/docs/seed/` | All 293 services from the old system, ready to load into the new one |
| `mpd-backend` | API, database and background jobs. Commits `openapi.json`, the API contract the apps generate their API code from |
| `mpd-frontend` | Customer portal + staff and partner console |
| `mpd-mobile` | Android + iOS app |
| `mpd-global` | Public website (all content editable from the admin console) |
| `mpd-infra` | Servers, deployment, backups, shared CI |
| `mpd-handbook-developer` | Developer handbook (private) |
| `mpd-handbook` | User guide for owners, partners and staff (public) |

**First-time setup:** in PowerShell, run `.\init-repos.ps1` from this folder. It creates the 8 private repos under your personal GitHub account and pushes them (needs the GitHub CLI `gh`, logged in). They move to the owner's organisation after the demo.
