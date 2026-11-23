# MPD Next: Target Architecture & Build Plan

> **Status:** Phase 2 draft v1 · 20-Nov-2026 · Replaces the legacy Laravel app documented in `docs/current-system/README.md`.
> **Decisions confirmed by the business:** INR only for now · hosting under ₹5,000/month at launch · franchise hierarchy stays · project owners pay offline (on purpose) · document vault is a must-have · no video calls · legacy data is migrated *after* the new app is built.
> **Companion documents:** [customers-and-pricing.md](customers-and-pricing.md) (customer types, project owners, purchaser control, pricing) · [admin-hierarchy-and-dispatch.md](admin-hierarchy-and-dispatch.md) (roles, areas, services offered, how a request reaches providers) · [progress.md](progress.md) (what is built, as of the last commit).
> **Working assumption:** the build is done by the product owner working with Claude Code in phases, so this document is written to be followed literally, module by module.

---

## 1. Goals and principles

**Product goals**
1. An NRI owner can hand over their Indian property and **see proof** of everything done (OTP-verified visits, before/after photos, reports, documents) from a phone anywhere in the world.
2. MPD operations, franchises, providers and field workers run every job from one system with clear statuses and no manual workarounds.
3. One backend serves the **web app, the Android app and the iOS app**.

**Engineering principles**
- **Security by default.** Passwords hashed, KYC private, every payment verified by the server, every route authenticated and authorised.
- **One source of truth per fact.** One `users` table, real foreign keys, money stored as integer paise, statuses as enums with an explicit state machine.
- **Boring, cheap, small.** One language (TypeScript), one database (PostgreSQL), one server at launch, no Redis or Kubernetes until revenue justifies it.
- **Audit everything that matters.** Every status change, payment, document access and admin edit writes an audit event.
- **Configurable, not hard-coded.** Keep the legacy app's best idea: services carry admin-defined forms and checklists. Make it typed and versioned.
- **NRI-ready even with INR only.** International phone numbers (E.164), user time zones, email/push that work in any country, and a currency column kept in the data model for later.

---

## 2. Tech stack

| Concern | Choice | Why |
|---|---|---|
| Repositories | **7 private GitHub repos**, under the developer's personal account until the demo, then transferred to the owner's organisation (§2.1). The API contract (`openapi.json`) is shared through a **generated API client** in each app (no package to publish) | Each Claude session opens one small repo, which suits the Pro plan. Each repo deploys on its own |
| API | **NestJS 11 (Node 22 LTS)**, REST + OpenAPI | Modules, guards and DI suit a multi-role business app. OpenAPI generates typed clients |
| Database | **PostgreSQL 16** + **Prisma** ORM | Relational integrity, JSONB where flexibility is needed, migrations in git |
| Background jobs | **pg-boss** (queue inside Postgres) | No Redis to pay for or run. Handles reminders, notifications, PDFs, webhooks |
| Web | **Next.js 15 (App Router)** + Tailwind + shadcn/ui | Two apps: `mpd-global` (public site, SEO) and `mpd-frontend` (customer portal + staff console) |
| Mobile | **React Native + Expo** (one app, role-based shells) | Android and iOS from one codebase. Cloud builds, no Mac needed |
| Validation | **Zod** in each repo; API types generated from `openapi.json` | The apps and the backend can't silently disagree on data shapes |
| Auth | Own module: **argon2id** passwords + **OTP** (email first; SMS/WhatsApp channels added in M8), JWT access token (15 min) + rotating refresh token | Works the same on web (httpOnly cookie) and mobile (secure storage) |
| Authorisation | RBAC roles + **scope checks** (territory / organisation / ownership) via a policy layer (CASL) | Fixes the legacy "any logged-in admin sees everything" problem |
| Files | **AWS S3 Mumbai (ap-south-1)**, private bucket, presigned URLs, server-side encryption | KYC never public. Data stays in India |
| Payments | **Until M8: offline/manual payments only** (recorded by ops, approved by a second admin). **M8:** an online gateway behind a `PaymentGateway` interface, provider chosen then (Razorpay is a candidate, on a new account) | Lets the whole product work end to end before any gateway exists. Nothing from the legacy payment code or keys is reused |
| WhatsApp / SMS | **Added in M8** as channel adapters behind a `MessageChannel` interface, provider chosen then | Launch channels are email, push and in-app. Nothing from the legacy WhatsApp setup (account, templates, token) is reused |
| Email | **Amazon SES** (Mumbai) | Fractions of a rupee per email |
| Push | **Expo Push** | Free |
| PDFs | Server-side HTML → PDF (Playwright/Chromium, run in the worker) | Inspection reports, invoices, site-visit reports |
| Observability | **Sentry** (free tier) for errors, **UptimeRobot** (free) for uptime, structured JSON logs | |
| CI/CD | **GitHub Actions** (reusable workflows kept in `mpd-infra`) → build Docker images → push to **GitHub Container Registry (GHCR)** → SSH deploy with `docker compose` + migrations + health check + rollback | Replaces the bare `git pull` |

### 2.1 Repositories (agreed 20-Nov-2026)
> **GitHub owner:** a personal account for now; transferred to the owner's organisation after the demo (§12.1). Workflows and image names use `github.repository_owner`, never a fixed name.

The brand name, app name and domain will be the same (**My Property Doctors**, short form **MPD**). The domain will be bought later. Every repo reads `BRAND_NAME="My Property Doctors"`, `BRAND_SHORT="MPD"` and `BRAND_DOMAIN` from config, and nothing is hard-coded.

| Repo | Contains | Deploys to |
|---|---|---|
| **mpd-backend** | NestJS API + worker (pg-boss), Prisma schema and migrations, seeds (incl. `seed/legacy-service-catalogue.json`), legacy import tool. Exports and commits `openapi.json` (the API contract) that the other apps generate their API client from | Lightsail (Docker: `api`, `worker`) |
| **mpd-frontend** | Next.js: customer portal + staff/partner console (admin, master franchise, franchise, provider) | Lightsail (Docker: `app`) |
| **mpd-mobile** | Expo app for Android + iOS: customer shell + field-worker shell | EAS Build → Play Store / App Store |
| **mpd-global** | Public website (Next.js, server-rendered for SEO). Homepage, services, NRI services, about, blog, contact, inquiry form. **All content and services come from the backend CMS/catalogue API** | Lightsail (Docker: `site`) |
| **mpd-infra** | Terraform (Lightsail instance, static IP, S3 buckets, IAM, SES, DNS), Docker Compose + Caddy, backup and restore scripts, **shared reusable GitHub Actions workflows** that the other repos call | Run from CI with manual approval |
| **mpd-handbook-developer** | HTML handbook for developers: code structure per repo, API conventions, data model, deployment, runbooks, ADRs | Static (S3 + Caddy at `dev-docs.` subdomain, password-protected) |
| **mpd-handbook** | HTML handbook for website users and non-technical owners: features, what each role can do (admin, master franchise, franchise, provider, worker, customer), onboarding, plans, vault | Static (`help.` subdomain, public) |

**Rules that keep the repos in sync**
**How the apps talk to the API (decided 20-Nov-2026, "generated API client", no published SDK package):**
- `mpd-backend` describes every endpoint with NestJS Swagger decorators. `pnpm openapi:export` writes `openapi.json` to the repo root, and **it is committed**. CI fails if it is out of date.
- `mpd-frontend`, `mpd-global` and `mpd-mobile` each run `pnpm api:generate`. This uses **openapi-typescript** to read `../mpd-backend/openapi.json` (sibling folder in `D:\MPDv2`) and write `src/api/schema.d.ts`, and a small **openapi-fetch** client in `src/api/client.ts` adds the base URL, login token, token refresh and error handling. The generated file is committed, so CI needs no access to the backend repo.
- After any backend endpoint change: export the openapi file → regenerate in each app → fix whatever the type-check flags → merge. Breaking changes need a new `/v2` route or a deprecation window, because older mobile app versions stay on phones.
- Form validation: Zod schemas live in each app (built from the generated types). The backend validates again; the backend is the authority.
- The same CI template (from `mpd-infra`) runs in every app repo: lint → typecheck → test → build image → push to GHCR → deploy job (manual approval via a GitHub Environment on `main`, automatic on `develop` → staging).
- Each repo has its own `CLAUDE.md` (a short one: purpose, commands, conventions, link to this spec).

```
mpd-backend/
  src/modules/<module>/   controller · service · repository · policies · dto (Zod) · events
  src/common/             auth guards, policy engine, audit, outbox, pricing, state machines
  prisma/                 schema.prisma, migrations/, seed/
  tools/legacy-import/    MySQL → Postgres ETL (M8)
mpd-frontend/  app/(portal) · app/(console) · src/api (generated client) · components/ui
mpd-mobile/    app/(customer) · app/(field) · src/api (generated client)
mpd-global/    app/ (home, services/[category]/[sub]/[service], nri-services, blog, contact) · src/api (generated client)
```

---

## 3. System context

```
 NRI owner / customer ──► Mobile app ─┐
 (anywhere in the world)  Web portal ─┤
                                      ├──► API (NestJS) ──► PostgreSQL (+ pg-boss queues)
 MPD admin / ops ───────► Web console ┤          │   └──► S3 Mumbai (documents, photos)
 Franchise / MF ────────► Web console ┤          ├──► Payment gateway (M8, behind an interface)
 Service provider ──────► Web + mobile┤          ├──► SES email · Expo push · (WhatsApp/SMS in M8)
 Field worker ──────────► Mobile app ─┘          └──► Worker: reminders, PDFs, notifications
```

---

## 4. Modules (bounded contexts)

| # | Module | Owns | Key rules |
|---|---|---|---|
| 1 | **Identity & Access** | users, credentials, sessions, OTPs, roles, memberships | One person = one user, whatever their roles. A user can be an owner *and* a customer of a project owner. Login by email or phone + password, or OTP |
| 2 | **Organisations & Territory** | organisations (MPD, master franchise, franchise, service provider), org tree, territories (pincode sets), staff memberships | Data visibility follows the org tree + territory. Replaces `m_f_id/f_id/s_p_id` columns |
| 3 | **Geography & Masters** | states, districts, cities, pincodes, area units, property types/sub-types/attributes | Seeded from legacy master data |
| 4 | **Customers & Properties** | customer profiles, KYC records, **projects**, properties (units belong to a project), property parties, **property assignments** (project owner registers a property owner, with proof) | Two kinds of customer: **property owner** and **project owner**. See §4.2 and [customers-and-pricing.md](customers-and-pricing.md) |
| 5 | **Leads & Onboarding** | inquiries, onboarding cases, site visits, quotations | Inquiry → case → site visit → quotation → acceptance → subscription. A state machine with SLA timers |
| 6 | **Catalogue & Pricing** | categories, services, form templates, checklist templates, **rate types**, price books, **service prices by pincode**, plans, plan items, discounts | Prices are resolved by one `PricingService`, never in controllers. Each service has one rate type (lump sum or a rate basis). See §4.3 |
| 7 | **Subscriptions** | customer plans, entitlements (remaining visits per service), renewals | Paying a plan creates *entitlements*. Jobs are scheduled from entitlements |
| 8 | **Jobs (Work Orders)** | jobs, assignments, schedule, visits, OTP checks, checklist responses, evidence (photos/files), extras, ratings | Explicit state machine (§6). Checklist template is **snapshotted** onto the job |
| 9 | **Billing & Payments** | orders, invoices (GST-ready), payments, refunds, **offline payments** (M3), online gateway adapter + webhook inbox (M8) | Server creates orders. Only a verified webhook or verified signature marks paid. Idempotency keys everywhere |
| 10 | **Partner Earnings** | commission rules, earnings ledger, payouts | Revenue share by org level and service category. Calculated when a payment is captured |
| 11 | **Document Vault** | folders, documents, versions, tags, expiries, share links, access log | See §8 |
| 12 | **Messaging & Notifications** | conversations (per job/property), messages, notification templates, outbox, deliveries, user preferences | Every send goes through the outbox. Reminders are really sent |
| 13 | **Reports & Audit** | audit events, dashboards, exports | Revenue, response time, SLA, ratings, partner earnings |
| 14 | **Content (website CMS)** | homepage sections, pages, testimonials, FAQs, team, blog, media library, agreements library | Every block on the public site is editable, orderable and can be switched on or off. See §4.1 |

### 4.1 Dynamic service catalogue and website content (requirement)
**Everything shown on the website and in the app comes from the database and is editable by admin.** Nothing is hard-coded in `mpd-global`, `mpd-frontend` or `mpd-mobile`.

- **Catalogue levels:** Category → Sub-category → Service (the legacy "type" grouping becomes an optional `group_label` on the service).
- **Editable on each level:** name, slug (auto, editable), short description, long description (rich text), image (upload → auto-resized to WebP thumbnail and hero sizes), icon, sort order, **Active** toggle, **Show on homepage** toggle, **Featured** toggle, SEO title and description.
- **Active / inactive:** inactive items disappear from the website, the app and new bookings straight away. Existing jobs and subscriptions for an inactive service carry on unaffected. Deactivating a category hides its sub-categories and services from the public site without changing their own flags.
- **Instant website update:** after a save, the backend calls `mpd-global`'s revalidate endpoint (signed secret), so the page refreshes within seconds without a redeploy.
- **Homepage sections** are `content_blocks` (hero, services grid, NRI helpdesk, why-trust-us, tenant verification, possession takeover, team, testimonials, FAQs, contact CTA). Each has an editable title, body, image, button, order and active toggle.
- **Privacy fix:** the legacy homepage shows the 3 latest customer properties. The new site never shows customer data publicly. A "Featured projects" block is curated manually instead.
- **Audit:** every catalogue or content edit is logged (who, before/after).
- **Seed:** `docs/new-system/seed/legacy-service-catalogue.json` holds **all 13 categories, 68 sub-categories and 293 services** from the legacy system, with descriptions, image file names, flags and `legacy_id`. Images are copied from legacy `public/assets/service*`. It also lists the services that were hard-coded on legacy static pages (Property Loan Consultant, Property Insurance Consultant, NRI Health Care, NRI Tours & Travels, Manpower Supply, Global Helpdesk). These are imported as **inactive** until the business confirms them. 13 legacy services whose category was deleted are imported into an "Unsorted" category, inactive, for review.

### 4.2 Customer types, project registration and purchaser control (requirement)
Full detail, flows, tables and rules: **[customers-and-pricing.md](customers-and-pricing.md)**. In short:
- **Property owner** (self-registered, or registered by a project owner) and **project owner** (builder, society or association with a project of many properties; pays offline).
- A project owner registers a property owner for a unit **with proof documents**. Ops reviews, the owner is invited and accepts. A unit has at most one active owner, and only ops can change it.
- **Purchaser control:** either side can buy services for the property; **only the party that bought a service can change it** (both directions). Ops can override with a reason. One `PurchaserPolicy` enforces this, with tests in both directions.

### 4.3 Pricing: rate types and prices by pincode (requirement)
- Admins define **rate types** (lump sum, per sq ft, per hour, ... and any new ones). Each service has **one** rate type.
- The **amount is set per pincode** (with an optional default and minimum charge), in dated **price books**. A service is bookable for a property only if it is active, the area is available (pincode switched on AND a provider present), and it has a price there.
- `PricingService` returns a full **quote** (rate type, quantity, unit price, total in paise), and orders keep it as a snapshot.

Each module = a NestJS module with `controller → service → repository`, its own Prisma models, Zod DTOs and policy rules. Modules talk through services or domain events (`JobCompleted`, `PaymentCaptured`), never by reaching into each other's tables.

---

## 5. Data model (core tables)

All tables: `id uuid pk`, `created_at`, `updated_at`, `created_by`. Soft delete only where legally needed (`deleted_at`). **Every relation is a real foreign key.**

```
users(id, full_name, email unique, phone_e164 unique, password_hash, timezone, locale, status, last_login_at)
user_roles(user_id → users, role enum[SUPER_ADMIN, OPS, MASTER_FRANCHISE, FRANCHISE, PROVIDER_ADMIN, FIELD_WORKER, CUSTOMER], org_id → organisations null)
otp_challenges(id, user_id/null, channel, destination, purpose, code_hash, expires_at, attempts)
refresh_tokens(id, user_id, token_hash, device, expires_at, revoked_at)

organisations(id, type enum[MPD, MASTER_FRANCHISE, FRANCHISE, SERVICE_PROVIDER], name, parent_id → organisations, gstin, bank_account_ref, status)
territories(id, org_id → organisations, name) ; territory_pincodes(territory_id, pincode_id)   -- replaces comma lists
org_services(org_id, service_id)                                                          -- what a provider can do

states, districts, cities, pincodes(id, code, city_id, district_id, state_id, serviceable bool)
area_units(id, code, name, to_sqft numeric)
property_types(id, parent_id, name) ; property_attributes(id, property_type_id, key, label, input_type, options jsonb, required)

customers(id, user_id → users, kind enum[PROPERTY_OWNER, PROJECT_OWNER], country_of_residence, kyc_status)
projects(id, owner_customer_id → customers, code unique, name, kind enum[BUILDER, SOCIETY, OTHER], address…, pincode_id, requires_owner_review, status)
kyc_records(id, customer_id, doc_type enum[PAN, AADHAAR_MASKED, PASSPORT, OCI, OTHER], number_masked, number_encrypted null, document_id → documents, verified_by, verified_at)
properties(id, customer_id → customers (who added it), project_id → projects null, name, address_line1..3, pincode_id, lat, lng, property_type_id, built_area, area_unit_id, attributes jsonb, status)
property_parties(id, property_id, customer_id, role enum[OWNER, CO_OWNER, POA_HOLDER], since, until)   -- one active OWNER per property
property_assignments(id, property_id, project_id, invitee_*, relation, status enum[DRAFT, PENDING_REVIEW, APPROVED, INVITED, ACTIVE, REJECTED, REVOKED, EXPIRED], customer_id null, reviewed_by, reviewed_at, review_note)
assignment_documents(assignment_id, document_id)   -- proof that the property belongs to the invited owner

inquiries(id, name, phone_e164, email, source, message, status, assigned_org_id)
onboarding_cases(id, ref_code, name, email, phone_e164, country, pincode_id, source, status enum, assigned_org_id, customer_id, property_id, site_visit_order_id, order_id, lost_reason, last_activity_at) ; case_events ; case_notes   -- one table for the inquiry and the case (built)
quotations(id, case_id, items jsonb snapshot, total_paise, valid_until, status)

service_categories(id, name, slug unique, short_desc, long_desc, image_media_id, icon, sort, is_active, show_on_homepage, is_featured, seo_title, seo_desc, legacy_id)
service_sub_categories(id, category_id, name, slug, short_desc, long_desc, image_media_id, sort, is_active, show_on_homepage, legacy_id)
services(id, sub_category_id, category_id, group_label, name, slug, short_desc, long_desc, image_media_id, sort, kind enum[FIELD, PROFESSIONAL, SITE_VISIT],
         requires_site_visit, can_manage_property, rate_type_id → rate_types, is_active, show_on_homepage, is_featured, bookable_in_app, seo_title, seo_desc, legacy_id)
media(id, s3_key, alt, width, height, variants jsonb) ; content_blocks(id, page, key, title, body, media_id, cta_label, cta_url, sort, is_active)
pages(id, slug, title, body, seo_title, seo_desc, is_active) ; testimonials(..., is_active) ; faqs(..., sort, is_active) ; team_members(..., sort, is_active)
form_templates(id, service_id, version, schema jsonb, published_at)        -- intake forms (legal etc.)
checklist_templates(id, service_id, version, steps jsonb, published_at)    -- field steps: OTP, photos, inputs, extras, end OTP
rate_types(id, code unique, name, basis enum[LUMP_SUM, PER_AREA, PER_QUANTITY], unit_label, area_unit_id null, min_quantity, max_quantity, quantity_step, is_active, sort)
price_books(id, name, status enum[DRAFT, PUBLISHED, RETIRED], valid_from, valid_to)
service_prices(id, price_book_id, service_id, pincode_id null = default, amount_paise, min_charge_paise null, is_active) -- unique (book, service, pincode)
plans(id, name, slug, duration_months, discount_percent, sort, is_active) ; plan_items(plan_id, service_id, visits int, quantity_per_visit null, discount_percent, frequency_note)   -- the plan price is CALCULATED per property from the services' own prices (customers-and-pricing.md §4.4b); there is no plan price table
discounts(id, scope, rule jsonb, starts_at, ends_at)

subscriptions(id, customer_id, property_id, purchased_by_customer_id, payer_customer_id, plan_id, starts_on, ends_on, status, order_id)   -- only the purchaser may change it (§4.2)
entitlements(id, subscription_id, service_id, total, used)

provider_franchise_links(provider_org_id, franchise_org_id, status enum[PENDING, ACTIVE, REMOVED])   -- a provider can be registered under several franchises (M5.0)
provider_services(id, org_id → organisations, service_id, status enum[ACTIVE, SUSPENDED], suspended_reason)   -- services a provider offers (M5.0)
worker_services(user_id, org_id, service_id)                                                                  -- the subset a worker can do (M5.0)
jobs(id, ref_code unique, property_id, customer_id, service_id, source enum[PLAN, ADD_ON, FREE, SUGGESTION, SITE_VISIT, PROFESSIONAL], entitlement_id null,
     provider_org_id, worker_user_id, scheduled_start, scheduled_end, status enum, checklist_snapshot jsonb, form_response jsonb, rating, rating_note)
job_events(id, job_id, from_status, to_status, actor_user_id, reason, at)  -- audit + timeline
job_otps(id, job_id, purpose enum[START, END], code_hash, sent_to, expires_at, verified_at, attempts)
job_steps(id, job_id, step_key, response jsonb, completed_by, completed_at)
job_evidence(id, job_id, step_key, document_id → documents, kind enum[BEFORE, AFTER, OTHER], taken_at, lat, lng)
job_extras(id, job_id, description, kind enum[SERVICE, MATERIAL], amount_paise, status enum[PROPOSED, APPROVED, PAID, DECLINED], order_id)

orders(id, customer_id, property_id, purchased_by_customer_id, payer_customer_id, purpose enum[SITE_VISIT, PLAN, ADD_ON, EXTRA, PROFESSIONAL], amount_paise, currency 'INR', status, gateway, gateway_order_id null, idempotency_key)
order_lines(order_id, description, service_id/plan_id, rate_type_code, unit_label, quantity, unit_paise, total_paise, tax_paise, pincode, price_book_id, price_id)   -- the quote, as a snapshot
payments(id, order_id, method enum[OFFLINE, ONLINE], gateway null, gateway_payment_id null, amount_paise, status, captured_at, offline_ref, offline_proof_doc_id, approved_by)
invoices(id, order_id, number unique, gst_breakup jsonb, pdf_document_id)
webhook_inbox(id, provider, event_id unique, payload jsonb, signature_ok, processed_at)   -- idempotent processing

commission_rules(id, org_type, service_category_id null, percent_bp, active_from)
earnings(id, org_id, payment_id, amount_paise, status enum[ACCRUED, APPROVED, PAID]) ; payouts(id, org_id, period, total_paise, utr, paid_at)

folders(id, owner_customer_id, property_id null, name, system_kind) ; documents(id, folder_id, owner_customer_id, property_id null, title, category, expires_on, current_version_id, created_by)
document_versions(id, document_id, version, storage_key, mime, size, sha256, scan_status, uploaded_by, created_at)
document_grants(document_id, customer_id, can_download, granted_by, expires_at)   -- e.g. proof shown to the assigned owner
document_shares(id, document_id, token_hash, expires_at, max_views) ; document_access_log(document_id, user_id/share_id, action, at, ip)

conversations(id, job_id/property_id, ...) ; messages(id, conversation_id, sender_user_id, body, attachment_document_id)
notification_templates(key, channel, locale, body, provider_template_name) ; outbox(id, user_id, template_key, payload, channel, send_after, status, attempts, last_error)
audit_events(id, actor_user_id, entity, entity_id, action, diff jsonb, at, ip)
```

---

## 6. State machines

### 6.1 Job
```
DRAFT ─► REQUESTED (in the pool of eligible providers) ─► ACCEPTED (one provider accepts, first wins) ─► SCHEDULED ─► ASSIGNED (provider picks a worker) ─► EN_ROUTE ─► STARTED (start OTP verified)
   STARTED ─► IN_PROGRESS ─► AWAITING_EXTRA_PAYMENT ⇄ IN_PROGRESS
   IN_PROGRESS ─► WORK_DONE (end OTP verified) ─► VERIFIED (provider/ops review) ─► CLOSED (rating optional)
   any pre-START ─► CANCELLED · REQUESTED/ACCEPTED ─► DECLINED (back to pool)
   STARTED without OTP ─► only via ops "override" with a reason + photo + geo, audited (replaces the master OTP)
```
How a request reaches providers, who may nudge or assign, and what each level can see: [admin-hierarchy-and-dispatch.md](admin-hierarchy-and-dispatch.md) §5.

**BUILT (M5.2a, 23-Nov-2026): doing the work.** `ASSIGNED -> EN_ROUTE -> STARTED (start code) -> IN_PROGRESS -> WORK_DONE (finish code) -> VERIFIED -> CLOSED`, all through `assertTransition` (`jobs/job-state.ts`) and `job_events`. **The customer holds the codes**: they open their request and press *Show my start/finish code* (`POST /v1/me/jobs/:id/code`): a 6-digit code, stored only as an HMAC hash, valid 10 minutes, 5 wrong tries kill it, a new code replaces the old one, at most 5 codes per job and purpose per hour. The worker enters it (`POST /v1/jobs/:id/start`, `/finish`). The provider or ops set the visit time (`/schedule`, customer sees it), the assigned worker says *on the way* or *cannot attend* (job returns to the provider, who picks another worker), the provider or ops check the work (`/verify`) or send it back with a reason (`/send-back`, the worker finishes again with a new code), and `/close`; the customer rates a checked job once (1 to 5), which closes it. **Operations override** a missing code (`/override`, reason of 10+ characters, audited). Once work has started a job can no longer be cancelled, released or given back. A **site visit job** is finished by the worker with the property corrections (the same `SiteVisitsService.complete`, which verifies the property); operations can still complete it from Site visits, and cannot override the end of a site visit that has not been recorded. Not yet (M5.2b/c): checklist/form snapshot, before/after photo evidence, extra work needing the customer's approval and payment (`AWAITING_EXTRA_PAYMENT` exists in the enum), geo on override.

Transitions live in one `JobStateMachine` class with guards (who may move it, which checks must pass). Every move writes `job_events` and emits a domain event that triggers notifications.

### 6.2 Onboarding case (BUILT, M4)
A prospect's journey to a paying customer is one `onboarding_case` (the website form, a phone call or a referral all start the same case).
```
NEW_INQUIRY ─► CONTACTED ─► REGISTERED ─► PROPERTY_ADDED ─┬─► SITE_VISIT_PAID ─► SITE_VISIT_DONE ─┐
   │ (or straight to REGISTERED if they         (a paid site visit is optional:                  ├─► QUOTED ─► ACCEPTED ─► ACTIVE
   │  already have an account)                   ops can skip it with a reason) ─────────────────┘      (customer      (order PAID)
   any open state ─► LOST (with a reason) ─► CONTACTED (reopened)                                         accepts)
   ACCEPTED ─► QUOTED if the order is cancelled (a new offer can be made)
```
- **Intake:** `POST /v1/public/inquiries` (no sign-in, rate limited, a hidden field traps robots, always the same answer). The same email asking again within 30 days is one case plus a note. A captcha (Turnstile) is still to be added before launch.
- **Area:** the case goes to the **franchise (else master franchise) whose territory holds the pincode**. Operations and super admin see every case and run it; a franchise or master franchise sees the cases of its own area, can read them, add notes and mark the first contact, and nothing else.
- **Account:** when the prospect signs up with the same (verified) email and opens "Getting started", the case is linked to them. Staff can also link a customer by hand.
- **Site visit (optional):** operations charge for it as an order for a service of kind SITE_VISIT; when the order is paid the case moves to SITE_VISIT_PAID by itself; operations mark it done with a note. Or skip it with a reason.
- **Quotation:** services (with quantities where charged per hour, day, visit) **or exactly one plan**, **priced by the server** (`PricingService`), plus an optional discount percent with a required reason, valid 1 to 60 days (default 14). Sending a new one withdraws the open one (database rule: one open offer per case). The customer sees how it was made and accepts or declines.
- **Acceptance creates the order** at the price quoted, with the discount (`orders.discount_paise`); a plan offer also creates the subscription. The order then follows the normal payment flow (7.1); when it is paid the case becomes ACTIVE by itself.
- **Staying in step with orders:** the case module never reads orders directly; it asks the orders module and catches up when a case is read (paid site visit, paid or cancelled accepted order).
- **Needs attention:** a new inquiry older than a day, or an open case with no activity for 3 days (reminders arrive with the outbox in M6).
- Every move is a `case_events` row; every action is audited. Internal notes are never shown to the customer.

### 6.3 Order / payment
Offline (**BUILT, M3.4**): the order is `PENDING_PAYMENT → PAID | CANCELLED`; a payment goes `PROOF_SUBMITTED → APPROVED (a different admin) | REJECTED | WITHDRAWN`, and only APPROVED marks the order PAID · online (M8): `CREATED → PENDING → PAID | FAILED | EXPIRED`.

### 6.4 Property assignment (project owner registers a property owner)
`DRAFT → PENDING_REVIEW (proof attached) → APPROVED (ops) → INVITED → ACTIVE (owner accepted)` · `REJECTED` (with reason) · `REVOKED` (ops only) · `EXPIRED` (invitation not accepted in 14 days, can be re-sent). Details in [customers-and-pricing.md](customers-and-pricing.md) §2.

---

## 7. Payments (INR)
**Rule for every phase:** the server works out every amount through `PricingService`; the client never sends a price. Amounts are integer paise. An order becomes PAID only through one of the two paths below, and both emit the same `PaymentCaptured` event (→ invoice → activate subscription / unlock job → accrue partner earnings → notify).

**7.1 Offline payments (BUILT in M3.4, used until M8, and kept for builders permanently)**
1. Ops creates the order (same pricing rules), or the customer's order shows "Pay by bank transfer" with MPD's bank details.
2. Ops records the payment: amount, UTR / cheque number, date, and a proof document (stored in the vault).
3. **A second admin approves it (maker-checker).** The person who records a payment can never approve it.
4. Approval → `PaymentCaptured`. Everything is in `audit_events`.

This lets the full product (onboarding → plan → jobs) work and be demonstrated without any payment gateway.

**7.2 Online payments (M8, provider chosen then)**
- Built behind a `PaymentGateway` interface (`createOrder`, `verifyClientResult`, `parseWebhook`, `fetchPayments` for reconciliation), so the rest of the code doesn't change.
- Required behaviour, whichever provider is chosen: server-side order creation with an idempotency key; signature verification of the client result; a signed webhook stored in `webhook_inbox` (unique event id) as the **final source of truth**; auto-expiry of unpaid orders; a nightly reconciliation job.
- A new merchant account in the business name. **No code, keys, webhook routes or payment-link logic from the legacy app are reused.**

## 8. Document vault (must-have)
- **Structure:** each customer gets system folders per property: *Ownership (sale deed, title, mutation)*, *Tax & utilities (property tax, electricity, water)*, *Legal & agreements (POA, rent/lease)*, *KYC*, *Inspection reports*, *Job evidence*, plus custom folders.
- **Who can see what:** the customer sees their own documents. Ops sees all. Partners see only documents attached to jobs assigned to them. KYC is visible to ops only.
- **Upload safety:** allow-list of types (PDF, JPG, PNG, HEIC, DOCX) checked by magic bytes, not the file extension. Size limit 20 MB. ClamAV scan in the worker before a file becomes viewable. SHA-256 de-duplication.
- **Access:** short-lived presigned URLs (5 min). Every view and download is logged. Share links with expiry and a view limit, so an NRI can share a sale deed with a lawyer or bank.
- **Versions and expiry:** new upload = new version. `expires_on` triggers reminders (rent agreement ending, insurance renewal, property-tax due date).
- **Auto-filed:** inspection-report PDFs, invoices and job before/after photos land in the vault automatically.
- **Compliance:** follow India's **DPDP Act 2023** (consent at signup, purpose-limited use, export and delete on request). For Aadhaar, **store only the masked number (last 4 digits) and a masked copy** unless legal advice says otherwise.

---

## 9. Notifications
- Every message is an `outbox` row created inside the same DB transaction as the business change. pg-boss workers send it with retries and backoff, and each attempt is logged in `deliveries`.
- **Launch channels:** email (SES), push (Expo), in-app. Users choose preferences. OTPs go by email at launch.
- **M8:** WhatsApp and SMS are added as `MessageChannel` adapters (provider chosen then, on a new account with new templates). Templates are keyed by event, so adding a channel is only configuration. Nothing from the legacy WhatsApp setup is reused.
- **Time zones:** stored per user. Reminders are scheduled for the customer's local time (e.g. 9 am in Dubai), and job times are shown in both IST and local time.
- **Built-in triggers:** inquiry received, OTP, quotation ready, payment due, payment received, job scheduled/assigned/started/completed, extra cost approval, report ready, document expiring, plan renewal (30/7/1 days), SLA breach (ops).

---

## 10. Security checklist (non-negotiable)
- argon2id password hashes. **No password is ever stored or emailed in readable form.** First login is by OTP + set password.
- Rate limits on login, OTP and public forms. OTPs hashed, 5 attempts, 10-minute expiry. reCAPTCHA/Turnstile on the public forms.
- Every endpoint has a guard. Authorisation is tested per role (automated tests).
- Secrets only in environment variables or the server's secret file, **never in git**. CI blocks commits that contain secrets (gitleaks).
- No personal data in the repo, seeds or logs. Fixtures use synthetic data.
- HTTPS everywhere (Caddy auto TLS), HSTS, secure cookies, CORS allow-list, Helmet headers.
- Daily encrypted Postgres backups to S3, 30-day retention. A monthly restore test.
- The admin console requires 2-step verification (TOTP) for SUPER_ADMIN and OPS.

---

## 11. Franchise model
**Keep now (as asked):** MPD → Master Franchise (a city) → Franchise (an area in the city) → Service Provider → Field Worker, modelled as an **organisation tree + territories (named groups of pincodes)**, so the hierarchy is data, not code. Full description: [admin-hierarchy-and-dispatch.md](admin-hierarchy-and-dispatch.md). Commission percentages per level are set in `commission_rules`, and earnings are calculated automatically from captured payments.

**Proposal to pitch later: "City partner + open vendor network"**
| | Current (5 levels) | Proposed |
|---|---|---|
| Levels | MF → F → SP → SW | **City Partner** (owns a territory, sells, does quality checks) + **Verified Vendors** (any vendor in the territory, per-service) + workers |
| Job routing | **Open pool (decided 21-Nov-2026):** every eligible provider (covers the pincode and offers the service) sees the request, the first to accept gets it; the franchise, master franchise and ops see it too and can nudge or assign | Auto-offer to the best-rated available vendor in the pincode, with an acceptance SLA |
| Revenue | Fixed shares through 3 layers | Platform fee + partner override + vendor payout per job, shown transparently |
| Why | Simple to explain | Fewer layers taking a margin → lower prices for NRIs. Vendors compete on rating. Faster response. Easier to expand city by city |

The data model above supports both, so switching later is a configuration change plus a migration of org types, not a rebuild.

---

## 12. Hosting under ₹5,000/month

| Item | Choice | Approx. monthly |
|---|---|---|
| App server | AWS **Lightsail Mumbai**, 4 GB RAM / 2 vCPU (IPv4 bundle) running Docker Compose: Caddy, api, worker, app (frontend), site (global), Postgres. Expected use is about 2–2.5 GB | ~US$24 ≈ ₹2,100 |
| Files + backups | S3 ap-south-1 (tens of GB at launch) | ₹100–300 |
| Email | Amazon SES | < ₹100 |
| Domain + DNS | existing domain, Cloudflare DNS (free) | ~₹100 |
| Errors / uptime | Sentry free, UptimeRobot free | ₹0 |
| Mobile builds | Expo EAS free tier (15 Android + 15 iOS builds a month) | ₹0 |
| **Total infrastructure** | | **≈ ₹2,500–2,800** |

Usage-based costs that start in M8: payment-gateway transaction fees, WhatsApp/SMS message fees.
One-time costs: Google Play developer account US$25, Apple Developer Program US$99 per year.
**Staging:** a 2 GB Lightsail instance (~US$12) turned on only during release weeks, or a second Compose project on the same box before launch.
**When to grow:** move Postgres to a managed database, add a second app server, and add Redis only when there's real load. Revenue pays for each step.
> Note: Lightsail's Mumbai bundles include half the data-transfer allowance of US regions. Keep photos on S3 (served by presigned URL) so the transfer limit isn't used up.

---

### 12.1 Before the demo, and handover to the owner
**Until the demo:** keep costs close to zero. Develop locally. No payment gateway or WhatsApp account is needed before M8. Use an Expo free account, Sentry free, and an AWS account on free or low tiers. Bring up the Lightsail staging server only when there is something to show (it's billed by the hour, so destroy it with Terraform after the demo if needed).

**Handover checklist (after the owner approves):**
1. The owner creates a GitHub organisation. Transfer all 7 repos (Settings → Transfer). Update the `uses: <owner>/mpd-infra/...` references, re-add secrets to the GitHub Environments, and re-enable workflow access on `mpd-infra`.
2. Move or recreate the AWS account in the owner's name (or transfer the Lightsail instance and S3 data with a snapshot). Re-run Terraform with the owner's state bucket.
3. The owner opens live accounts: payment gateway (KYC in the business name) and WhatsApp Business / SMS provider (owner's number, new templates), when M8 starts; Amazon SES (verified domain), Apple Developer and Google Play (in the business name, needed for store listing), Expo organisation.
4. Buy the domain (My Property Doctors), point DNS, and set `BRAND_DOMAIN`.
5. Rotate every secret. No dev or test key goes live.

## 13. Development on a 16 GB laptop
- Run **only Postgres in Docker** (`infra/docker-compose.dev.yml`, ~300 MB). Run the API, worker and web natively with `pnpm dev --filter`.
- Mobile: use the **Expo dev build on a real Android phone over Wi-Fi**. Avoid the Android emulator (it uses 3–4 GB). iOS builds run in EAS cloud and are tested through TestFlight.
- Start only the app you're working on (`turbo dev --filter=api`). Keep Chrome tabs low while Metro is running.

---

## 14. Legacy data migration (late in Phase 3)
1. Restore the legacy MySQL dump into a local MySQL (Docker) on the developer machine **only**.
2. `tools/legacy-import` (TypeScript) reads MySQL and writes Postgres through the same domain services, so all validation applies. A `legacy_map(entity, legacy_id, new_id)` table keeps it re-runnable.
3. Mapping: `admins` → users + organisations by `user_type_id` · `owners`+`customers` → merged into one user + customer (dedupe by email/phone) · `o_properties` → properties (JSON blobs unpacked into attributes) · `service_purchases` → jobs (status mapped to the new enum, history kept as `job_events`) · `transactions` → orders/payments (only `status=1`, marked `legacy`) · files → re-uploaded to S3 vault folders.
4. **Passwords are not migrated.** Users get a "set your password" OTP link on first login.
5. Master data (pincodes, cities, catalogue, units, property types, rates) is imported first and early, as seed data, after cleaning out the test rows.

---

## 15. Build roadmap (Phase 3)
| Milestone | Scope | Done when |
|---|---|---|
| **M0 Foundation** | Create the 7 repos, shared CI templates + Terraform (mpd-infra), API client generation (openapi.json → apps), Docker dev DB, Prisma schema v1, auth (OTP + password + refresh), roles, audit, Sentry, deploy to Lightsail | A user can sign up, log in on web and mobile, and the deploy pipeline works |
| **M1 Masters, orgs, catalogue CMS, website** | Geography, units, property types, organisations + territories, staff invites, master-data import, **full service catalogue seeded from legacy (293 services) with admin editing (name, photo, active/inactive, homepage)**, content blocks, **mpd-global homepage live on staging** | Ops can set up a territory and a provider. Admin switches a service off and it disappears from the website within seconds |
| **M2 Customers, properties, vault** | **M2.1** customer profiles + properties ✅ · **M2.2** document vault ✅ (local storage first, S3 later) · **M2.3** KYC ✅ (masked, documents in the vault) · **M2.4** ✅ projects, units and **property-owner registration with proof, ops review and invitation** (§4.2) | An NRI can add a property and upload documents from the phone. A builder can register an owner for a unit and the owner accepts it |
| **M3 Catalogue, pricing, orders** | **M3.1 ✅ / M3.2 ✅ / M3.3 ✅ / M3.3b ✅ / M3.4 ✅** rate types, price books and prices by pincode (§4.3)**, `PricingService` quotes, plans, discounts, orders and subscriptions with the **purchaser-control rule (§4.2)**, **offline payments (maker-checker)**, invoices | Paying for a plan creates a subscription + entitlements |
| **M4 Onboarding ✅** | Inquiry → case → site visit → quotation → payment → activation | The full NRI journey works end to end |
| **M5 Jobs & field app** | **M5.0 providers and workers choose their services, area overlap rules**, then the job pool (eligible providers see a request, first accept wins, upline can nudge/assign, provider assigns a worker; [admin-hierarchy-and-dispatch.md](admin-hierarchy-and-dispatch.md)), scheduling, assignment, checklist engine, OTPs, evidence, extras, ratings, inspection PDF | A worker completes a job on mobile and the customer sees the report |
| **M6 Comms & reports** | Outbox + all triggers, chat, reminders, dashboards, SLA, partner earnings & payouts | Reminders arrive, and partners see their earnings |
| **M7 Legal/professional services** | Intake form builder, document checklists, professional job flow | Legal services can be bought and delivered |
| **M8 Online payments & WhatsApp** | Choose providers; `PaymentGateway` adapter (orders, client verification, webhook inbox, reconciliation, expiry); online pay buttons in web + mobile; WhatsApp/SMS `MessageChannel` adapters, templates, OTP over WhatsApp/SMS | A customer pays online and gets WhatsApp updates. Offline payments still work for builders |
| **M9 Migration & launch** | **TOTP two-step login, required for SUPER_ADMIN and OPS, with backup codes and a recovery path (moved here from the start of M3 on 21-Nov-2026; a hard gate: no real customer data or real money before it is done)**, legacy import (M9), UAT, store submission, go-live runbook | Apps in the stores, legacy switched off |

Each milestone gets its own Claude session(s). Start every session by reading `CLAUDE.md` and the milestone's section.

---

## 16. Decisions log (ADR summary)
| # | Decision | Alternatives considered |
|---|---|---|
| 001 | TypeScript everywhere (NestJS + Next.js + Expo) in **7 GitHub repos** linked by `openapi.json` + generated API clients | Monorepo (easier type sharing, but every session loads more). Laravel 11 rewrite. Flutter |
| 009 | All website and app catalogue content comes from the backend CMS, with active toggles | Hard-coded pages (legacy) |
| 010 | Backend in **NestJS** (confirmed by the owner 20-Nov-2026) | Python/Django: strong admin and data tooling, but adds a second language next to the TypeScript web and mobile apps |
| 011 | Apps generate their API client from the committed `openapi.json` (openapi-typescript + openapi-fetch). No published SDK package | Hand-written API calls (drift, as in legacy). A versioned SDK package (extra publishing and token setup a small team doesn't need yet) |
| 002 | PostgreSQL + Prisma | MySQL (weaker JSON/constraints), MongoDB (bad fit for money and relations) |
| 003 | pg-boss instead of Redis/BullMQ | Redis costs RAM and money at launch |
| 004 | One mobile app with role-based shells | Separate customer and partner apps (twice the store work). Can be split later |
| 005 | Single Lightsail box + S3 Mumbai | Managed DB + containers (above budget). Hetzner (no India region) |
| 006 | Offline maker-checker payments first; online gateway + WhatsApp only in M8, behind interfaces, with nothing reused from legacy | Legacy Razorpay/Interakt code and accounts (insecure, see docs/legacy) |
| 007 | Versioned form/checklist templates snapshotted on jobs | Legacy live `pages` (edits changed jobs already in progress) |
| 008 | Organisation tree + territories + commission rules | Legacy fixed columns per level |
| 012 | **Purchaser control:** either the property owner or the project owner may buy for a property, and only the purchaser can change what they bought (both directions; ops can override with a reason) | Project owner controls everything; owner controls everything; shared control (conflicts) |
| 013 | **One rate type per service** (lump sum or a rate basis), amount set **per pincode** in dated price books, optional default and minimum charge; admins add rate types | Fixed units in code (legacy); several rate types per service at once; a price per (service, unit, pincode) with no versioning |
| 014 | **Two customer types** (property owner, project owner). A project owner registers an owner for a unit **with proof documents**, ops reviews, the owner accepts. The unit belongs to a project; ownership is a dated `property_parties` row | A parent/child customer tree (legacy copy of owners into customers); ownership stored on the property row |
| 016 | **Open job pool.** A request is visible to every eligible service provider (covers the pincode, offers the service) and to the franchise, master franchise and ops above them; the first provider to accept gets it (one atomic update); the provider then assigns one of its own workers who offers that service. Areas are **pincodes** (named groups), an MF is a city, a franchise never overlaps another franchise, providers may overlap and can register under several franchises | Fixed provider per pincode (legacy); auto-offer to the best-rated provider only (kept as a later option) |
| 017 | **TOTP two-step login moved to M9**, as a hard gate before real data or money | First task of M3 (decided earlier the same day) |
| 015 | Local-disk file storage behind a `Storage` interface for development (S3 adapter added at the AWS step); presigned-style 5-minute tokens either way | S3 from day one (needs an AWS account before the demo) |

---

## 17. Open questions
0. **Hierarchy and dispatch:** all decided on 21-Nov-2026, see [admin-hierarchy-and-dispatch.md](admin-hierarchy-and-dispatch.md) §9.
1. Brand and app names for the stores, and the production domain.
2. Is GST invoicing needed at launch (is MPD GST-registered)? What are the HSN/SAC codes per category?
3. Default commission percentages per franchise level and category.
4. SLA targets: provider acceptance time, visit window, report delivery time.
5. Which legal/professional services launch first (top 10 of the 293)?
3. **Visibility between project owner and property owner** (default: both see that a service exists and its results; only the purchaser sees price and payment), **ops review of project-registered owners** (default: always), **GST**, **minimum charge**, and **society common-area services**: see [customers-and-pricing.md](customers-and-pricing.md) §8.
