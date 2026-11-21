# MyPropertyDoctors (MPD): Current System Documentation

> **Scope:** This documents the **existing** Laravel application, as found in `D:\MPD\mpd`, using the git history (1,201 commits, last on 2026-09-09) and the database dump `db_mpd_20-11-2026.sql`.
> It is the baseline for the rebuild. Statements marked *(to confirm)* come from reading the code and still need confirming by the business team.
> **No secrets or personal data are reproduced here.**

---

## 1. What MPD is

MPD is a property-management platform aimed mainly at **NRIs (Non-Resident Indians) who own property in India**. An owner signs up a property. MPD then does a site visit and offers a **subscription plan** (a bundle of recurring services). It then sends its network of field staff to perform services and reports back with OTP-verified start and end steps, photos and documents.

The platform also sells one-off services: legal, valuation, design, vastu, environmental, groundwater and construction project management. It also supports **"project owners"** (builders or developers) who onboard many units and assign their buyers ("customers") to them.

### Service catalogue (from DB)
13 categories, 68 sub-categories, **293 services**. 266 of the 293 are flagged `is_legal_service = 1` *(likely misused as a generic "one-off service" flag; to confirm)*.

Categories: Site Visit · Consulting · Repairing · Legal · Property Management & Caretaking · Architectural & Structural Design · Real Estate Consultancy · Property Development · Property Valuation · Vastu · Environmental Clearance · Groundwater · Construction Project Management.

### Data volume snapshot (20-Nov-2026)
| Entity | Rows | Entity | Rows |
|---|---|---|---|
| Owners | 42 | Service purchases (jobs) | 193 |
| Customers | 31 | Transactions | 161 (129 still status 0) |
| Properties (`o_properties`) | 194 | Notifications | 198 |
| Staff users (`admins`) | 40 | Inquiries | 17 |
| Pincodes served | 183 | Service×pincode rates | 2,799 |
| Cities / Districts / States | 5,923 / 640 / 35 | Message threads | 115 (only 3 messages) |

Activity in the data runs from **Aug 2025 to Oct 2026**. Almost all owners are in India (33 of 42 have `country = India`, 9 have none). So the NRI audience is not yet reflected in live data.

---

## 2. Technology stack

| Layer | Current |
|---|---|
| Language / framework | PHP 7.3–8.0, **Laravel 8.75**: both versions are past end-of-life |
| UI | Server-rendered Blade (325 templates, ~76k lines), jQuery, Bootstrap admin theme ("Sneat" demo files in `demo/`), Laravel Mix |
| Database | MySQL 8, 70 tables, **only 9 foreign keys** |
| Auth | Laravel session guards: `admin`, `customers`, `owner`; Sanctum installed but unused |
| Roles | `spatie/laravel-permission`: 6 roles, 90 permissions |
| Payments | Razorpay **Payment Links** (`razorpay/razorpay`) |
| WhatsApp | Interakt API templates (`app/Http/Helpers/sendMessage.php`) |
| Email | Laravel Mail (11 mailables, several named `MyTestMail*`) |
| Realtime | Pusher (chat) |
| Other | mPDF (site-visit report PDF), maatwebsite/excel (pincode and rate import/export), Google reCAPTCHA |
| Scheduler | `app:notification-schedule` every minute |
| Hosting / CI | GitLab CI → SSH (port 2287) → `git pull` on test/prod servers. Staging: `mpd.isiteguru.com` |

---

## 3. User types and portals

All **staff** live in one `admins` table. Each staff user has a `user_type` / `user_type_id` and parent links (`m_f_id`, `f_id`, `s_p_id`), which form a hierarchy:

```
Admin (1)  ──►  Master Franchise (10)  ──►  Franchise (9)  ──►  Service Provider (11)  ──►  Service Worker (12)
   1 user            3 users                    5 users             13 users                   18 users
```

| User type | Logs in at | Table / guard | What they do |
|---|---|---|---|
| **Super Admin** | `/admin/login` | `admins` / `admin` | Everything: masters, pricing, plans, onboarding, assignment, reports |
| **Master Franchise** | `/admin/login` | `admins` (type 10) | Regional partner. Owns cities and pincodes (`m__cities`, `m__pincodes`) and manages franchises |
| **Franchise** | `/admin/login` | `admins` (type 9) | Local partner under a master franchise |
| **Service Provider (SP)** | `/admin/login` (registers via `/ServicesProviderRegister`) | `admins` (type 11) | Vendor company. Gets jobs by pincode (`assign_pincodes`), accepts them and assigns workers |
| **Service Worker (SW)** | `/admin/login` | `admins` (type 12) | Field technician. Runs the job with the start OTP, photos, extras and end OTP |
| **Owner** | `/owner_index/{inquiry}` → session | `owners` / `owner` (session key `opid`) | Property owner during onboarding: registration, property, plan, site-visit payment |
| **Customer** | `/login` | `customers` / `customers` | An owner **after paying** (record copied from `owners`), or a buyer assigned by a project owner. Has the dashboard, services, agreements, chat and ratings |
| **Project Owner** | Admin creates them | `owners.project_owner = 1` | Builder or developer. Has multiple units (`o_properties.parent_property_id`) and assigns customers to units. **Their payments skip the gateway** |
| Tenant | Admin only | `tenants` | Module exists, **0 rows** (unused) |

Spatie roles in DB: `superadmin`, `franchise`, `master franchise`, `service provider`, `service worker`, `Customer`.

> The `franchises`, `m__franchises`, `service_providers`, `service_workers`, `tenants` and `users` tables are **all empty**. They are leftovers from before everything moved into `admins`.

---

## 4. Core business flows

### 4.1 Self-onboarded owner (main NRI journey)
1. **Inquiry.** A visitor fills in `/inquiry` with name, phone, email, documents and a convenient day and time → `inquiry` row. The visitor gets a WhatsApp `inquiry_template` message and an email. The admin gets a "new inquiry created" notification.
2. **Registration.** The owner opens `owner_index/{inquiry_id}`, verifies an email OTP (also sent by WhatsApp as `owner_otp`), then adds personal and KYC details (PAN, Aadhaar, ID proof, address, DOB, anniversary).
3. **Property.** At `owners/property` the owner picks a type and sub-type (Residential, Commercial, Industrial, Heritage, …). Parameters and options come from the Property Master and pincode configuration. The owner adds area, rooms, building age, occupancy, photos, videos and documents.
4. **Plan selection.** At `owners/plan` the owner sees plans priced **per pincode** (`pincodes.plans_price` JSON).
5. **Site-visit charge.** At `owners/site` → `paySiteVisitCharge` the owner pays the per-pincode `site_visit_charge` through a Razorpay payment link.
6. **Site visit.** The admin assigns an SP or worker. The worker fills in the public form at `/sitevisit/{inquiry}/{worker}/{owner}` (area-by-area condition), which generates a PDF (mPDF).
7. **Final pricing.** The admin edits the property (`admin/sitevisit`), uploads photos, videos and documents, and sets the final plan prices and first-time services.
8. **Payment link.** `send-mail/{id}/{sp_id}` sends the owner a plan payment link by WhatsApp (`customer_plan_payment_link`) and email.
9. **Activation.** After payment (`plan-payment-successfull/{id}/{plan}`) the system:
   - **copies the owner into `customers`**, including password fields
   - creates one `service_purchases` row per included service × recurrence (status `Pending`)
   - sends credentials (`customer_register` WhatsApp + `UserEmailPasswordMail`)
   - marks the inquiry and property active
10. **Customer life.** The customer logs in at `/login` and gets the dashboard, upcoming plan services, add-on services, extra-plan purchase with quantity discounts, agreements, chat per service and ratings.

### 4.2 Admin-onboarded project owner (builder flow)
`admin/owner-and-propery/*` covers: create owner → create property (multiple units) → choose legal or other services → fill the dynamic service pages → create customers per unit → site/service store. `project_owner = 1` makes every payment step **write a fake "paid" transaction and skip Razorpay** (`plink_<uniqid>`, `bypass_signature`). The project owner's dashboard (`legal-customer-dashboard/*`) lets them assign customers to units and upload customer documents.

### 4.3 Legal / one-off service flow
`legal-service` → `legal-service-page` shows dynamic form pages from the `pages` and `page_inputs` tables, such as *Parties involved, Property details, Purchase details, Rental preferences*. The customer can resume later (`legal-resume-service-page`), pays by payment link, and the system creates a service purchase. An owner-to-customer variant (`service.php → legal-service/*`) lets a project owner's customer pay.

### 4.4 Service job lifecycle (field execution)
Each job is a `service_purchases` row. Workflow screens are **data-driven**. Admins set up an ordered list of `pages` per service, such as *Start OTP → before photos → extra service → add additional services → after photos → end OTP → feedback*, with typed `page_inputs`. Answers are stored in `service_purchases.page_data` (JSON).

```
Pending ─► (SP accepts in Service Acceptance) Accepted ─► date/time assigned ─► worker assigned
   ─► OTP Requested ─► OTP Verify | Static OTP Verify ─► Service Started ─► Process (extra cost requested)
   ─► Service end OTP send ─► Service Completed By Worker ─► Completed By Service Provider ─► Service Completed
   ─► customer rating (customer_ratings, description, review_date)
```
Observed counts: Completed By Service Provider 111 · Pending 64 · Accepted 9 · Service Completed 8 · Completed By Worker 1.

- **Extra work or material on site.** The worker records extra service and material cost. A payment link is sent (`payment_for_extra_service`) and the job pauses in `Process` until it's paid or skipped (`extra_amount_skip`).
- **Suggestion services.** `suggestion_services` holds follow-up services to propose after a service, with recurrence, a delay in hours and target users.
- **Service notifications.** `service_notifications` holds reminder rules per service (hours before, which users).
- **Job types** (`service_purchases.type`): Plan Service · Add On Service · Free Service · Suggestion Service (168 rows have NULL).

### 4.5 Payments
| Purpose (`transactions.transaction_for`) | Count |
|---|---|
| Legal Service Purchase / legal services | 121 |
| Site Visit Charge | 23 |
| Additional Service / extra services | 11 |
| Added Extra Plan | 4 |
| Plan Purchase | 2 |

The flow is: create a `transactions` row (status 0) → create a Razorpay Payment Link → redirect → **`returnUrl` marks status 1 using query-string values**. A webhook (`*/waybookRazorpay`, several copies) also marks transactions paid on `payment.captured`. See §8 for the problems with this.

### 4.6 Communication
- **WhatsApp (Interakt)** templates: `inquiry_template`, `owner_otp`, `customer_register`, `customer_plan_payment_link`, `service_payment_success`, `payment_for_extra_service`. **The country code is hard-coded to +91.**
- **Email**: 11 mailables (registration, site visit, legal service, OTPs, password).
- **In-app notifications**: the `notifications` table is polymorphic through text columns `sender_table` and `receiver_table`. Events: new inquiry (75), service reminder (66), assigned service date (33), new customer (24).
- **Chat**: `message_conversations` per service purchase, with participants owner/MF/F/SP/SW, over Pusher.
- **Support tickets**: IT support and support ticket module (0 rows).

---

## 5. Admin panel modules

| Menu | Routes (prefix `/admin`) | Notes |
|---|---|---|
| Dashboard and Notifications | `/`, `/notification` | |
| User Master | `usermaster` | Creates any staff type |
| Role Management | `roles` | Spatie roles and permissions |
| Admin Management | `admins` | |
| Master Franchise / Franchise | `masterfranchise`, `franchise`, `document-contract*` | Partner KYC and contract approve/reject |
| Services Management | `services-category`, `services-subcategory`, `services`, `service-pincode-rates/{id}`, `service/notification/{id}`, `service/suggestion/{id}`, `service/page/{id}` | Catalogue, **rates per pincode × unit** (Excel import), reminders, suggestions, **dynamic workflow page builder** |
| Service Provider / Worker | `serviceprovider`, `serviceworker`, `changestatus` | Bank details, police verification, agreement upload |
| Service Purchase | `service-purchase*`, `assign-worker`, `assign-service_provider`, `start-service`, … | Job board and execution screens |
| Service Acceptance | `service-acceptance` | SP accepts jobs |
| Site Visit | `sitevisit`, `send-mail`, `sitevisited` | Pre-onboarding inspection and pricing |
| Customers | `customers/*` | View, properties, calendar, documents |
| Property Owner Management | `property-owner`, `owner-and-propery/*`, `proowner/*` | Admin-side onboarding (project owners) |
| Tenant Management | `tenant` | Unused |
| City / Pincode Master | `pincode`, `pincode-import`, `pincodeexport` | Pincodes carry plan prices and site-visit charge |
| Property Master | `propertymaster`, `propertymaster/mapping`, `propertyconfiguration` | Types → sub-types → parameters → options, per-pincode config (4,370 option rows) |
| Units | `unit` | sq ft, sq m, guntha, acre, bigha, … |
| Subscription Plans | `plan`, `plan/service/*`, `free-plan-service/*`, `plan-discount-*` | Plans → included services (recurrence), free services, quantity discounts |
| Coupons | `coupon` | 0 rows |
| Agreements | `agreement*` | Upload agreements and assign them up or down the hierarchy |
| Inquiry / Contact / Get-in-touch / Newsletter | `inquiry`, `contact`, `get-in-touch`, `newslatter` | Leads |
| Messages | `messages`, `openchat/{id}` | |
| Reports | `revenue-sharing`, `response-time`, `service-rating` | |
| Testimonials | `testimonial` | 0 rows |
| IT Support / Support tickets | `itsupport`, `itticket`, `supportticket` | |

Public marketing site: about, services, NRI services, projects, blogs, events, gallery, careers, FAQs, terms, privacy and contact. These are mostly static Blade pages.

---

## 6. Data model (grouped)

| Domain | Tables |
|---|---|
| Identity | `admins` (all staff), `owners`, `customers`, `tenants`, legacy empty: `users`, `franchises`, `m__franchises`, `service_providers`, `service_workers` |
| Access control | `roles`, `permissions`, `model_has_roles`, `role_has_permissions`, `model_has_permissions` |
| Geography | `state`, `district`, `cities`, `pincodes` (+ `plans_price` JSON, `site_visit_charge`), `assign_pincodes` (staff ↔ pincodes as text lists), `m__cities`, `m__pincodes` |
| Property | `o_properties` (45 columns incl. JSON `dynamicoptions`, `plans_price`, `first_time_services`, `plan_details`), `o_property_images`, `o_property_videos`, `property_masters`, `property_type_mapping`, `property_parameters`, `parameter_options`, `pincode_configration`, `pincode_configration_options`, `units` |
| Catalogue and pricing | `service_categories`, `service_sub_categories`, `services`, `service_pincode_rates`, `s_p_sevices` (SP ↔ service), `plans`, `plan_services`, `plan_discounts`, `customer_plans`, `coupons`, `coupon_plans`, `plan_features`, `p_features` |
| Workflow engine | `pages`, `page_inputs`, `service_notifications`, `suggestion_services`, `service_dates` (empty) |
| Jobs | `service_purchases` (~50 columns: OTPs, timestamps, extras, files, rating, `page_data`) |
| Money | `transactions` (text columns for amount, date and reference; polymorphic by table-name strings), `payment_details`, `webhook_responses` |
| Comms | `notifications`, `messages`, `message_conversations`, `support_tickets`, `inquiry`, `get_in_touches`, `newslatters` |
| Content | `agreements`, `agreement_assigns`, `testimonials`, `franchise_documents`, `m__franchise_documents` |

---

## 7. Codebase map

```
app/
  Http/Controllers/
    Admin/        44 controllers (largest: ServicePurchaseController 1,508 lines, HomeController 957, UserMasterController 883)
    Frontend/     owner and customer portals (ProfilePageController 1,124, PropertyController 705, UserPropertyController 640)
    Frontend/Customer/LegalCustomerDashboardController.php
    Frontend/OwnerToCustomer/LegalOwnerToCustomerController.php
    OwnerToCustomer/OwnerToCustomerController.php
  Http/Helpers/   helpers.php (uploads, getUserType…), sendMessage.php (Interakt)
  Traits/         PaymentLinkTrait (gateway bypass), WebhookHandlerTrait, PageDataMergeTrait, EmailResolverTrait
  Console/Commands/NotificationScheduler.php
  Models/         61 Eloquent models
routes/           web.php → frontend, auth, customer, owner, service, fetch, admin (701 lines total)
resources/views/  325 Blade files (admin, frontend, serviceprovider, serviceworker, emails…)
database/         migrations (47, out of sync with live schema), new_migrations/, SQL dumps, issue sheet
public/           assets, + uploaded files (beforedocumentuploads/, afterdocumentuploads/, assets/…)
demo/, unused/, CustomIndex.html, adminer.php, Abstract-sheet.pdf   ← leftovers
tests/            7 feature + 12 unit tests (scaffold level)
```
~22,000 lines of controller code.

---

## 8. Known problems

### 8.1 Critical: security and money (fix or contain now, even before the rebuild)
| # | Problem | Where |
|---|---|---|
| S1 | **Passwords stored in plain text** in `pass_view` for all 42 owners and 39 of 40 staff, and copied into `customers` | `owners`, `admins`, `customers`, `SiteVisitController@paymentSuccessfullPlan` |
| S2 | **Unauthenticated URL activates a plan.** `GET /plan-payment-successfull/{id}/{plan}` (and `/testing/{id}/{plan}`) creates the customer, creates jobs and writes a "paid" transaction without checking any payment | `routes/service.php`, `SiteVisitController` |
| S3 | **Payment confirmation trusts the browser.** `returnUrl` handlers mark a transaction paid from query parameters. Razorpay signatures are never verified on return or webhook | `WebhookHandlerTrait`, ~8 controllers |
| S4 | **Extra-service and service payments never reach the gateway.** `PaymentLinkTrait` is used by `service-purchase/payment/{id}` (public). It marks any transaction ID paid and redirects | `PaymentLinkTrait`, `ServicePurchaseController`, `ServiceStartController` |
| S5 | **Hard-coded master OTP** lets a job start without the customer's OTP ("Static OTP Verify") | `ServiceStartController@service_start_verify_otp` |
| S6 | **Secrets in source.** A Razorpay key pair in `Admin/HomeController.php` (line 27) and an Interakt token in `config/app.php` (line 243). **Rotate both** | |
| S7 | **Personal data in git.** `database/db_mpd (4).sql` is committed. `adminer.php` (DB admin tool) is committed at the repo root | |
| S8 | **KYC documents are publicly downloadable.** All `f-*/o-*/sp-*/t-*-document-view/download/{file}` routes have no auth middleware. Uploads (PAN, Aadhaar, police verification) are stored under `public/` | `routes/fetch.php`, `FetchController` |
| S9 | **Owner routes have no auth middleware.** They rely on a session ID (`opid`). `Route::resource('owner')` is fully public | `routes/owner.php` |
| S10 | **Debug leftovers.** `/fue` flushes the session, `/testing/*` exists, and stack traces show in production (issue sheet #3, #12) | |
| S11 | **No upload validation.** Executables and any file type are accepted (issue sheet #7, 9, 10, 11, 14) | |

### 8.2 Architecture gaps
1. **Identity is fragmented.** 3 login systems and 5 legacy user tables. An owner is *duplicated* into `customers` on payment, so the two records drift apart.
2. **The relational model is weak.** 9 FKs across 70 tables. IDs are often `varchar` (`o_id`, `plan_id`, `c_id`). Lists are stored as comma text (`assign_pincodes.pincode_id`). Money is stored as text (`transactions.amount`). Core data is hidden in JSON blobs (`plans_price`, `dynamicoptions`, `first_time_services`, `page_data`).
3. **There is no state machine.** `service_status` is free text with near-duplicates (`Service Completed` vs `Completed By Service Provider`). Transitions happen in many controllers.
4. **Fat controllers with copy-paste.** The payment and onboarding logic exists in ~8 near-identical copies. There is no service layer, no form requests and no policies.
5. **Reminders don't send.** `NotificationScheduler` only flips `triggred = yes`. It never sends WhatsApp, email or push.
6. **Not ready for NRIs.** WhatsApp is fixed to +91, prices are INR only, the UI has no time-zone handling, and there's no foreign card or UPI-international path beyond Razorpay defaults.
7. **No API.** `routes/api.php` only has the default Sanctum `/user`, so a mobile app needs a new backend.
8. **No reconciliation.** 129 of 161 transactions are stuck at status 0 and there's no expiry or retry. `webhook_responses` is empty.
9. **Unsafe deployments.** CI only runs `git pull`. There's no `composer install`, no migrations, no build, no rollback and no secrets management. Migrations don't match the live schema (`new_migrations/` was hand-managed).
10. **Weak validation.** 18 of 61 controllers never call `validate()`. The QA sheet lists 16 open validation and UX issues.
11. **Dead code.** `demo/`, `unused/`, `backend/` views, `CustomIndex.html`, empty legacy tables, unused modules (tenants, coupons, testimonials, plan features, service_dates).
12. **Schema typos carried throughout:** `frist_name`, `refrence_id`, `configration`, `alternet`, `marrage`, `newslatter`, `s_p_sevices`, `waybook` (webhook).
13. **Test plans in production data:** "Anuj Test Plan" and "Anuj Property Type". "Premium Plan" is priced below Plan A *(to confirm)*.

### 8.3 Open QA issues (from `PropertyDoctor_New_Issues_With_Navigation.xlsx`, all "Pending (New)")
| ID | Module | Issue | Sev |
|---|---|---|---|
| 1 | Agreement | Upline dropdown shows "no user role found" | High |
| 2 | Service Purchase | No back navigation on detail page | Med |
| 3 | Messages | 404 page shows backend stack trace | High |
| 4 | Service Category | Duplicate names allowed | Med |
| 5 | Sub Category | Empty mandatory fields refresh the page silently | High |
| 6 | Add Service | Description "mandatory" but empty allowed | Med |
| 7 | Add Service | Any file type accepted for images | High |
| 8 | Franchise edit | Weak input and file validation, .exe allowed | Med |
| 9 | Master Franchise | Any document type accepted | High |
| 10 | Service Provider | Executables accepted | High |
| 11 | Tenant | No validation (PAN/Aadhaar, uploads) | High |
| 12 | Customer → Calendar | Backend code exposed | High |
| 13 | Service Worker | Backend error on create | High |
| 14 | Property Owner | Can submit without images, any file type | High |
| 15 | IT Support | Bank details validation wrong | Med |
| 16 | Testimonials | Empty mandatory fields accepted | Med |

---

## 9. What's worth keeping in the rebuild
- The **data-driven service workflow** (pages + inputs per service). This is a real strength. Rebuild it as a typed, versioned form or workflow engine.
- **Pincode-based pricing and partner territories**: service × pincode × unit rates, plan price per pincode, site-visit charge.
- **OTP-verified start and end of a job with before/after evidence.** This is the core trust feature for owners who live abroad.
- **Plans with recurrence, free services, quantity discounts, and suggestion services** for upselling.
- The **service catalogue** (293 services) and the property-type master data can be migrated as seed data.

---
*Generated 20-Nov-2026 as Phase 1 of the MPD modernisation. Next: Phase 2, the target architecture.*
