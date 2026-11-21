# CLAUDE.md: My Property Doctors (MPD) workspace

This is the **workspace root for the new MPD** (`D:\MPDv2`). Each `mpd-*` folder is its own git repo with its own CLAUDE.md. Read this file first, then the repo's CLAUDE.md.

## Workspace map
```
D:\MPDv2
  CLAUDE.md                 this file (shared context; canonical copy in mpd-handbook-developer/workspace/)
  mpd-handbook-developer/docs/architecture/        README.md (full target spec) · MPD-Architecture-Handbook.html
  mpd-handbook-developer/docs/legacy/              README.md + handbook of the old Laravel app (reference only)
  mpd-handbook-developer/docs/seed/                legacy-service-catalogue.json (13 categories / 68 sub-categories / 293 services)
  mpd-backend/  mpd-frontend/  mpd-mobile/  mpd-global/  mpd-infra/  mpd-handbook-developer/  mpd-handbook/
  init-repos.ps1            one-time git init + first commit for all 7 repos (copy in mpd-handbook-developer/workspace/)
  New machine: mpd-handbook-developer/workspace/NEW-MACHINE.md
```
The legacy app stays in `D:\MPD\mpd` (read-only reference; never copy its code or data here).

Full legacy detail: `mpd-handbook-developer/docs/legacy/README.md`. Full target spec: `mpd-handbook-developer/docs/architecture/README.md`.

## Project
- **Goal:** Rebuild MPD, a property-management platform for NRIs who own property in India, with a new stack and architecture, a new web app and Android/iOS apps.
- **Phases:** (1) document the current system ✅ → (2) target architecture ✅ (`mpd-handbook-developer/docs/architecture/README.md`) → (3) build in milestones M0–M9 (see mpd-handbook-developer/docs/architecture/README.md §15). **Done: M0, M1, M2 (customers, vault, KYC, projects and owner registration), M3.1 pricing, M3.2 quotes, M3.3 orders with purchaser control, M3.3b admin-made plans and subscriptions, property history across owners. Next: M3.4 offline payments.** Exact status: `mpd-handbook-developer/docs/architecture/progress.md`. Backend = NestJS (owner confirmed 20-Nov-2026). Repos on GitHub.
- **Business decisions (20-Nov-2026):** the legacy app is not live with real customers. INR only. Hosting under ₹5k/month at launch. The franchise hierarchy stays (a "city partner + vendor network" proposal is documented for later). Project owners/builders pay **offline on purpose** (₹10–12 lakh): build it as audited maker-checker offline payments. The document vault is a must-have. No video calls. Legacy data (real projects used for testing) is migrated **after** the new app is built (M8).
- **User constraints:** Claude Pro plan and a 16 GB Windows laptop. Work in small phases, avoid subagents, don't re-scan the whole legacy code. Use these notes and grep for specific things.

## Legacy app location
- Code: `D:\MPD\mpd` (Laravel 8, PHP, MySQL 8, Blade + jQuery). Git history: GitLab, branches `developer` → `test` → `prod`.
- DB dump: `D:\MPD\mpd\database\db_mpd_20-11-2026.sql` (70 tables). **It contains real personal data.** Only extract the schema and counts. Never copy rows into docs, chats or new repos.
- QA issue sheet: `database/PropertyDoctor_New_Issues_With_Navigation.xlsx` (16 open issues).
- Staging: `https://mpd.isiteguru.com`.

## Mental model of the legacy system
- **Staff hierarchy** lives in one `admins` table by `user_type_id`: Admin 1 → Master Franchise 10 → Franchise 9 → Service Provider 11 → Service Worker 12 (parent links `m_f_id`, `f_id`, `s_p_id`). Territory = pincodes (`assign_pincodes`).
- **Owner → Customer:** an owner onboards (inquiry → email OTP → KYC → property → plan → site-visit fee → site visit → final price → payment link). After paying, the owner is **copied** into `customers` and jobs are created in `service_purchases`.
- **Project owner** (`owners.project_owner=1`) is a builder with multiple units who assigns customers to units. Payments skip the gateway.
- **Jobs** = `service_purchases`. The workflow screens are data-driven (`pages` + `page_inputs`, answers in `page_data` JSON). The lifecycle runs through start OTP, before/after files, extra cost (payment link), end OTP, SP completion and rating.
- **Pricing:** service × pincode × unit (`service_pincode_rates`); plan price per pincode (`pincodes.plans_price` JSON); `site_visit_charge` per pincode; `plan_discounts` by quantity.
- **Integrations:** Razorpay Payment Links, Interakt WhatsApp (+91 hard-coded), SMTP mail, Pusher chat, mPDF, Excel import/export.

## Red flags (never carry these into the new system)
- Plain-text passwords (`pass_view`). Public plan-activation URL. Payment success trusted from query string, no signature checks. A gateway bypass trait. Hard-coded master OTP. Secrets in code (Razorpay key in `Admin/HomeController.php`, Interakt token in `config/app.php`). KYC files public with unauthenticated download routes. Owner routes without auth. SQL dump and adminer committed to git.
- 9 FKs in 70 tables, varchar IDs, money stored as text, comma lists, JSON blobs for core data, free-text statuses, a scheduler that never sends reminders, no API.

## New system: MPD Next (decided in Phase 2, full spec in mpd-handbook-developer/docs/architecture/README.md)
- **GitHub owner (21-Nov-2026):** for now the repos are private under the developer's **personal GitHub account**. They move to the owner's GitHub organisation after the product demo, using GitHub "Transfer repository" (history, issues and PRs are kept, and old URLs redirect). So **never hard-code the account name**: in workflows use `${{ github.repository_owner }}`, image names `ghcr.io/${{ github.repository_owner }}/<repo>`, and keep reusable-workflow references in one place (`uses: <owner>/mpd-infra/...` is updated once at transfer). Third-party accounts (AWS, Expo, Sentry) are also created as **dev/test accounts** until the handover. Plan a handover checklist (see mpd-handbook-developer/docs/architecture/README.md §12.1).
- **Repos (GitHub, private; agreed 20-Nov-2026):** `mpd-backend` (NestJS 11 API + pg-boss worker + Prisma; commits `openapi.json`, the API contract) · `mpd-frontend` (Next.js 15: customer portal + staff/partner console) · `mpd-mobile` (Expo: customer + field shells) · `mpd-global` (Next.js public website, all content from the CMS API) · `mpd-infra` (Terraform, Compose, Caddy, backups, shared CI templates) · `mpd-handbook-developer` (private) · `mpd-handbook` (public user guide). Apps run `pnpm api:generate` (openapi-typescript + openapi-fetch) from `../mpd-backend/openapi.json` and commit `src/api/`. Change order: backend → export openapi.json → regenerate in apps → fix type errors. Each repo gets its own short CLAUDE.md.
- **Brand:** brand, app name and domain are identical: **My Property Doctors**, short **MPD** (domain to be bought later). Always read from config `BRAND_NAME` / `BRAND_DOMAIN`. Never hard-code.
- **Catalogue and website content are 100% dynamic:** category → sub-category → service, each with name, slug, descriptions, image, sort, active, show-on-homepage, featured, SEO. Inactive = hidden from site, app and new bookings (existing jobs unaffected). Homepage sections are `content_blocks`. Saving triggers `mpd-global` revalidation. Seed = `mpd-handbook-developer/docs/seed/legacy-service-catalogue.json` (copy in `mpd-backend/prisma/seed/`) (13 categories / 68 sub-categories / 293 services + extra static-page services imported inactive). Never show customer data on the public site.
- **Data:** PostgreSQL 16 + Prisma. uuid PKs, real FKs, money as `*_paise` integers + `currency`, enum statuses, `audit_events`. JSONB only for template snapshots and responses.
- **Infra:** one AWS Lightsail Mumbai 4 GB box (Docker Compose: Caddy, api, worker, web, postgres) + S3 ap-south-1 private bucket + SES + Sentry free. Queue = pg-boss (no Redis). CI: GitHub Actions (reusable workflows in `mpd-infra`) → images in GHCR → SSH `docker compose` deploy with migrations + health check + rollback.
- **Rules:** argon2id hashes, no readable passwords anywhere. Every route guarded + a policy check (role + org tree + territory + ownership). Prices are only computed server-side by `PricingService`. Payment is marked paid only after a verified signature/webhook, or an approved offline payment (maker-checker). Job status changes only through `JobStateMachine` (writes `job_events`). Every outbound message goes through `outbox`. Phone numbers in E.164. User time zones respected. Aadhaar stored masked only. Uploads: magic-byte allow-list, 20 MB, ClamAV, presigned URLs (5 min).
- **Payments and WhatsApp are deferred to milestone M8 (owner's decision, 21-Nov-2026).** Until then: offline/manual payments only (ops records, a second admin approves) and notifications by email, push and in-app only. In M8 they are added behind `PaymentGateway` and `MessageChannel` interfaces, provider chosen then. **Never copy or reuse anything Razorpay/Interakt/WhatsApp-related from the legacy app**: no code, keys, templates, webhook routes or payment-link logic. Roadmap is M0–M9 (M9 = migration & launch).
- **Module boundaries:** identity, orgs-territory, masters, customers-properties, onboarding, catalogue-pricing, subscriptions, jobs, billing, earnings, vault, messaging, reports-audit, content. No cross-module table access. Use services or domain events.
- **Customers and pricing (decided 21-Nov-2026; full detail in `mpd-handbook-developer/docs/architecture/customers-and-pricing.md`):** two customer types, **property owner** and **project owner** (builder/society, pays offline). A project owner registers a property owner for a unit **with proof documents** → ops review → invitation → owner accepts. **Purchaser control:** either side can buy for a property, **only the purchaser can change what they bought** (both directions; ops override with a reason; one `PurchaserPolicy`). Pricing: admin-defined **rate types** (lump sum, per sq ft, per hour, ...), **one per service**, **amount per pincode** in dated price books with a default and optional minimum; a service is bookable only if active + area available (pincode on AND provider present) + priced there; orders snapshot the quote.
- **Laptop (16 GB):** only Postgres runs in Docker. API and web run natively, filtered with `turbo dev --filter`. Mobile is tested on a real phone (Expo dev build). No Android emulator. iOS is built in EAS cloud.
- Never write real customer data into fixtures, docs or the handbook. Use synthetic examples.

## Doc locations
- `mpd-handbook-developer/docs/architecture/README.md`: target architecture, repos, data model, state machines, roadmap, ADRs.
- `mpd-handbook-developer/docs/architecture/customers-and-pricing.md`: customer types, project owner registration, purchaser control, rate types and pincode pricing.
- `mpd-handbook-developer/docs/architecture/admin-hierarchy-and-dispatch.md`: roles, areas (pincodes), services a provider offers, how a request reaches providers (open pool, first accept wins), what each level sees.
- `mpd-handbook-developer/docs/architecture/progress.md`: what is built today (modules, routes, rules enforced by tests, known gaps).
- `mpd-handbook-developer/docs/legacy/README.md`: the old system and its problems.
- `mpd-handbook-developer/` (private, read from GitHub or locally) and `mpd-handbook/` (public user guide, live at https://abdeali-sayadawala.github.io/mpd-handbook/ via GitHub Pages; never put internal material in it): the two HTML handbooks.

## Admin hierarchy and job dispatch (described by the owner 21-Nov-2026; full text in `mpd-handbook-developer/docs/architecture/admin-hierarchy-and-dispatch.md`)
- **Super admin** (owner) → **Master franchise** (one city) → **Franchise** (an area inside the city) → **Service provider** (contractor, one or many workers, many services, many areas) → **Service worker**. Invites: admin/ops → MF → (franchise →) provider → worker. A higher role manages only its own branch.
- **Areas are pincodes** (named groups called territories; area names are labels). A child's pincodes must lie inside its parent's. A pincode is available to customers only when it is switched on AND an active, staffed provider covers it.
- **Overlap rules (decided 21-Nov-2026):** one MF per city. A franchise holds one or many pincodes/areas but **never overlaps another franchise**. Providers hold one or many pincodes/areas, **may overlap each other**, and choose pincodes from their franchise's list; to serve a pincode outside it they **register under the franchise that runs it** (a provider can be linked to several franchises, `provider_franchise_links`, M5.0).
- **Providers choose the services they offer; workers choose the subset they can do** (M5.0, not built).
- **Dispatch (M5, not built):** a request goes to an **open pool**. Every eligible provider (covers the pincode and offers the service) sees it, plus the franchise, MF and ops above. The first provider to accept wins (one atomic update). Upline can nudge or assign directly. Acceptance limit 2 h (30 min urgent), then escalate. The provider then assigns one of its own workers who offers that service (the worker just gets it and can raise "cannot attend"). Customer details stay hidden until accepted.

## Keeping the documentation current (standing rule)
At the end of every milestone step, in the same session, update: `mpd-handbook-developer/docs/architecture/progress.md`, the relevant spec file, `mpd-handbook-developer/` (status page), `mpd-handbook/` (user guide: live features only, "coming soon" marked) and the `CLAUDE.md` of every repo touched. All documentation lives in git inside `mpd-handbook-developer/` (`docs/` and `workspace/`). Commit and push it. This root `CLAUDE.md` is a copy of `mpd-handbook-developer/workspace/CLAUDE.md`: after editing one, copy it to the other (`workspace/setup.ps1 -Sync` copies root to repo) and commit.
