# Build progress: what exists today

Last updated: 21-Nov-2026 (after M3.2). Branch `develop` in every repo. Update this file at the end of every milestone step, together with the two handbooks and the repo `CLAUDE.md` files.

**Size today:** 146 API endpoints, 13 database migrations, 239 automated end-to-end tests (all passing), 0 lint errors.

## Milestones

| Step | What | Status |
|---|---|---|
| M0 Foundation | 7 repos, CI templates, Docker dev DB, auth (OTP, password, refresh), roles, audit, Sentry, health | ✅ (AWS deploy deliberately not applied until the client demo) |
| M1 Masters, orgs, catalogue CMS, website | Geography, units, property types, organisations, territories, staff invites, 293-service catalogue with admin editing, website content (blocks, FAQs, testimonials, team), public website reading from the API | ✅ |
| M2.1 Customers and properties | Customer profile, properties with type-driven questions, area units, availability per property | ✅ |
| M2.2 Document vault | Folders, uploads, versions, 5-minute links, share links, access log, expiry list | ✅ (local storage; S3 later) |
| M2.3 KYC | Masked identity records, vault-backed scans, staff review queue | ✅ |
| M2.4 Projects and owner registration | Project owners, projects, units, owner registration with proof, ops review, emailed invitation, ownership history | ✅ (claim-a-unit by an individual owner not built yet) |
| M3.1 Rate types and prices by pincode | Rate types, price books (draft, publish, retire), prices per pincode, default, minimum charge | ✅ |
| M3.2 Quotes | `PricingService` and `POST /v1/quotes` | ✅ |
| M3.3 Orders and subscriptions | Purchaser control, duplicate warning, quote snapshots | next |
| M3.4 Offline payments | Maker-checker | planned |
| M5.0 Providers and workers choose services | See [admin-hierarchy-and-dispatch.md](admin-hierarchy-and-dispatch.md) | planned |
| TOTP two-step login | Moved to **M9**, a hard gate before real data or money | deferred |

## Backend modules (`mpd-backend/src/modules/`)

| Module | What it does | Main tables |
|---|---|---|
| `identity` | Signup with email OTP, login (separate customer and staff audiences), refresh tokens, password reset, `Mailer` port (console now) | users, user_roles, otp_challenges, refresh_tokens |
| `health` | Liveness and readiness | |
| `masters` | States, cities, districts, pincodes (area names, switched on/off), area units, property types and their questions. Public and admin | states, cities, pincodes, area_units, property_types, property_attributes |
| `orgs-territory` | Organisation tree, territories (named groups of pincodes), staff invites and members, the availability rule (a pincode is available when switched on AND an active, staffed provider covers it), coverage screens | organisations, territories, territory_pincodes, staff_invites |
| `catalogue` | Categories, sub-categories, services, public catalogue, revalidation of the website; **pricing admin** (rate types, price books, prices by pincode) and **`PricingService` / quotes** | service_categories, service_sub_categories, services, rate_types, price_books, service_prices |
| `content` | Homepage blocks, FAQs, testimonials, team, with revalidation | content_blocks, faqs, testimonials, team_members |
| `customers-properties` | Customer profile and kind, properties, property parties (owner history), **projects and units**, staff customer views | customers, properties, property_parties, projects |
| `vault` | Documents (folders, versions, locks), 5-minute file links, share links, access log; `Storage` and `VirusScanner` ports | folders, documents, document_versions, document_shares, document_access_log |
| `kyc` | Identity records (masked numbers only), staff review, scan links logged under the reviewer | kyc_records |
| `assignments` | Project owner registers a property owner: proof, ops review, invitation, acceptance, revoke | property_assignments, assignment_documents |
| `common` | Auth guards, roles decorator, `PolicyService` (org tree and rank rules), audit, Prisma, queue (pg-boss), storage, dates | audit_events, media |

Not built yet: onboarding, orders, subscriptions, payments, jobs, messaging/outbox, reports, earnings.

## Frontend (`mpd-frontend`)

- **Customer portal:** `/dashboard`, `/properties` (+new, +[id]), `/documents` (vault), `/kyc`, `/projects` (+[id], +units/new, for project owners only), `/profile`. Auth: `/login`, `/signup`, `/verify`, `/forgot-password`, `/reset-password`. Public: `/owner-invite`, `/files/<token>`, `/shared/<token>`.
- **Staff console (`/admin/...`):** login, forgot/reset, accept-invite; dashboard, customers (+detail, set up as project owner), KYC review, owner registrations, catalogue, pricing (service prices, price lists, rate types), content (homepage text, team, FAQs, testimonials), organisations, staff, masters.
- Menus are filtered by role (cosmetic; the backend decides).

## Website (`mpd-global`)
Homepage sections read content blocks, catalogue, team, FAQs and testimonials from the API, refreshed when an admin saves.

## Rules that are enforced by tests today
- Another customer's property, document, KYC record or registration is **404**, never 403.
- OTPs and invite and share tokens are stored hashed; passwords are argon2id.
- Only a masked identity number is stored; a full Aadhaar number is refused.
- Uploads are checked by file contents, 20 MB limit, de-duplicated, locked while another record relies on them.
- One active owner per property (also enforced by the database).
- A price is only ever computed on the server; extra price fields in a request are rejected.
- Whole paise only; half-up rounding; draft and retired price lists never used.
- Every change is audited.

## Known gaps and notes
- Email is console-only (no real email until M6 outbox/SES).
- Virus scanner is a no-op in development; ClamAV is required before production.
- No real file storage service yet (local disk); S3 at the AWS step.
- Documentation now lives in git: `mpd-handbook-developer/docs/` (this file, the specs, legacy notes, the service seed) and `mpd-handbook-developer/workspace/` (the workspace `CLAUDE.md`, a new-machine guide and setup script).
- GitHub Actions: blocked until the `mpd-infra` repo's Actions access setting allows other repos to use its workflows.
