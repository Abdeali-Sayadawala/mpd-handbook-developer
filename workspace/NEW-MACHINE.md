# Continue from any machine

Everything needed to continue this project is in Git. Nothing important lives only on one laptop.

| What | Where it lives |
|---|---|
| Code, 7 repos | GitHub, private, under the developer's account: `mpd-backend`, `mpd-frontend`, `mpd-mobile`, `mpd-global`, `mpd-infra`, `mpd-handbook-developer`, `mpd-handbook` |
| Specs, decisions, progress, legacy notes, the service seed | `mpd-handbook-developer/docs/` |
| Workspace instructions for Claude Code (`CLAUDE.md`) and the folder README | `mpd-handbook-developer/workspace/` (copy this `CLAUDE.md` to the workspace root, see below) |
| Per-repo instructions | `CLAUDE.md` in each repo |
| What is built today | `mpd-handbook-developer/docs/architecture/progress.md` and `status.html` |

**Not in Git on purpose:** `.env` files (secrets), `mpd-backend/.storage/` (uploaded test files), the local database, and Claude's personal memory notes. The legacy database dump contains real personal data and must never be put in Git. To rebuild the local database run the migrations and the seed.

## Set up a new machine

Needs: Git, Node 22, pnpm, Docker Desktop, the GitHub CLI (`gh auth login`), and Claude Code.

```powershell
# 1. a workspace folder, then clone the developer handbook first
mkdir D:\MPDv2; cd D:\MPDv2
gh repo clone mpd-handbook-developer

# 2. let the script clone the other six repos and put CLAUDE.md in the workspace root
.\mpd-handbook-developer\workspace\setup.ps1

# 3. backend: environment, database, migrations, seed
cd mpd-backend
copy .env.example .env          # then edit the values
docker compose -f docker-compose.dev.yml up -d
pnpm install
pnpm prisma migrate deploy
pnpm db:seed
pnpm dev                        # API on http://localhost:4000, docs at /docs

# 4. in two more terminals
cd ..\mpd-frontend; copy .env.example .env.local; pnpm install; pnpm dev        # http://localhost:3000
cd ..\mpd-global;   pnpm install; pnpm dev -p 3001                               # http://localhost:3001
```

Then open Claude Code in `D:\MPDv2`. It reads `CLAUDE.md` in the workspace root and the repo's own `CLAUDE.md`. Ask it to read `mpd-handbook-developer/docs/architecture/progress.md` to see where the work stands.

## Keep the copies in step
`CLAUDE.md` and `README.md` at the workspace root are copies of `workspace/CLAUDE.md` and `workspace/README.md`. After changing the root copy, copy it back into `workspace/` and commit. `setup.ps1 -Sync` does that copy for you.
