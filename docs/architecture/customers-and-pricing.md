# Customers, project registration, purchaser control and pricing

Status: **decided by the owner on 21-Nov-2026**. This document is the source of truth for these rules. The main spec (`README.md`) links here from §4.2, §4.3, §5 and §6.4, and the roadmap (§15) schedules the work.

---

## 1. Two kinds of customer

| | **Property owner** | **Project owner** |
|---|---|---|
| Who | One person or family that owns property in India (often an NRI) | A **builder, a society or an association** that manages a project made of many properties |
| How they join | Registers on the website or app by themselves, **or** is registered by a project owner (see §2) | Onboarded with ops (KYC verified). Pays **offline** (decided 20-Nov-2026), always through the maker-checker flow |
| Owns | Their own properties (zero or more) | A **project**, which contains the unit properties they manage |
| Pays | Online (from M8) or offline | Offline |

A property owner who was registered by a project owner is still a normal property owner: they sign in, see their property and can add other properties of their own. The link to the project only exists on that property.

## 2. Registering property owners through a project

```
 PROJECT OWNER                         MPD OPS                         PROPERTY OWNER
 ─────────────                         ───────                         ──────────────
 1. creates the project and
    adds the unit properties
 2. "Register an owner" for a unit:
    name, email, phone, relation
    (allottee / buyer / owner)
    + uploads PROOF documents
    (allotment letter, agreement,
    sale deed ...)  → vault
        status: PENDING_REVIEW  ───►  3. reviews the proof
                                         approve / reject (with a reason)
                                      ◄── status: APPROVED
                                      4. invitation email goes out ───►  5. opens the link, sets a password
                                         (existing account: signs in          (or confirms with an existing
                                          and confirms instead)                account), accepts the property
        status: ACTIVE  ◄─────────────────────────────────────────────  the property now has an OWNER of record
```

Rules
- **Proof is mandatory.** An assignment cannot be submitted without at least one document. Proof is stored in the vault (project owner's *Registrations* folder) and linked to the assignment. When the owner accepts, they get **view access to the proof**, and a copy is filed in the property's *Ownership* folder.
- **Ops review is on by default** (`projects.requires_owner_review`). It can be switched off for a trusted project owner.
- A unit has **at most one active OWNER**. A new assignment for a unit that already has an owner is an *ownership change*: it supersedes the old one only after ops approval. History is kept (`property_parties.until`).
- A property owner who registered **by themselves** can **claim** a unit of a project (project code + unit). The claim goes through the same review. The project owner is told.
- **Status values:** `DRAFT → PENDING_REVIEW → APPROVED → INVITED → ACTIVE`, with `REJECTED`, `REVOKED` (ops only, with a reason) and `EXPIRED` (invitation not accepted in 14 days; can be re-sent).
- The project owner **cannot remove or replace an ACTIVE owner**. Only ops can, with a reason, and it is audited.

## 3. Purchaser control: the party that bought a service controls it

**Status (21-Nov-2026): BUILT for orders** (`PurchaserPolicy`, both directions, tested). Subscriptions, service requests and jobs will call the same policy when they are built.

> **Either side can buy for the property. Whoever bought a service is the only one who can change it.**

- **Who may buy or subscribe** for a property: its **property owner** (OWNER party) and the **project owner** of its project. Nobody else.
- Every order, subscription, service request and job records `purchased_by_customer_id` (who chose and bought it) and `payer_customer_id` (who pays, normally the same).
- **Who may change it** (cancel, pause, renew, reschedule, change quantity, add or remove services, pay or settle): **only the purchaser**. Staff (ops) can override with a reason, and it is audited.
- The other party's attempt is refused with a clear message: *"This service was arranged by the project owner. Only they can change it."* (and the reverse).
- **Both directions apply equally.** A service the property owner subscribed cannot be changed by the project owner, and a service the project owner subscribed cannot be changed by the property owner.

| Action on a service | Purchaser | The other party | Ops |
|---|---|---|---|
| See that it exists, its status and schedule | yes | yes (default, see Q1) | yes |
| See price and payment details | yes | no | yes |
| Change, cancel, pause, renew, reschedule | **yes** | **no** | yes, with a reason |
| Pay or settle it | yes (payer) | no | records offline payments |
| See the report, photos and documents the job produced | yes | yes (they concern the property) | yes |
| Buy a *different* service for the same property | yes | yes | n/a |

More rules
- **Duplicate warning.** Before buying, the system shows services already active on the property and who arranged them, so the two parties do not pay twice for the same thing.
- **A change of ownership does not move subscriptions.** They continue under the original purchaser until they end. Ops can re-assign with a reason.
- **If a project ends**, the project owner's running subscriptions finish normally or are handed to the owner by ops.
- A project owner can buy for a unit that **has no owner assigned yet** (it is their unit). When an owner is later assigned, nothing the project owner bought changes.
- **One place enforces this:** `PurchaserPolicy` in the backend. Controllers never decide it. Every module that changes a purchased thing calls it, and each rule has automated tests in both directions.

## 4. Pricing: rate types and prices by pincode

### 4.1 Rate types (admin-defined)
A **rate type** says *how a service is charged*. Admins create and edit them. Examples:

| Code | Name | Basis | Quantity comes from |
|---|---|---|---|
| `LUMP_SUM` | Lump sum | `LUMP_SUM` | nothing: the amount is the price, whatever the size |
| `PER_SQFT` | Per sq ft | `PER_AREA` (unit: sq ft) | the property's built-up area, converted to sq ft |
| `PER_SQYD` | Per sq yard | `PER_AREA` (unit: sq yd) | the built-up area converted to sq yards |
| `PER_HOUR` | Per hour | `PER_QUANTITY` (label: hour) | entered at booking (customer or ops), with minimum, maximum and step |
| `PER_DAY`, `PER_VISIT`, ... | added by admins | `PER_QUANTITY` | entered at booking |

- A rate type is `LUMP_SUM`, `PER_AREA` or `PER_QUANTITY`. The first three are seeded: lump sum, per sq ft, per hour. Admins add more without a code change.
- A rate type in use cannot be deleted, only switched off.
- Area conversions use `area_units.to_sqft`. A unit without a fixed size (bigha) cannot be used for a `PER_AREA` rate until it has a factor.

### 4.2 One rate type per service, many prices
- Each **service has exactly one rate type** (`services.rate_type_id`): either a rate basis or a lump sum, never both.
- The **amount** is set **per pincode**. A service charged per sq ft can cost ₹12 in 390002 and ₹15 in 380001. Admins add and edit these.
- A **default price** (no pincode) covers every pincode that has no specific price.
- An optional **minimum charge** protects small jobs: `total = max(minimum, quantity × rate)`.

### 4.3 Price books (versioned, dated)
Prices live in a **price book** with `valid_from` / `valid_to`. A new book can be prepared in advance (draft → published) so a price change starts on a date without editing live prices. **Orders keep a snapshot** of the price they were sold at, so later changes never alter what was agreed.

### 4.4 How a price is worked out (`PricingService`, server-side only)

**Status: BUILT** (`POST /v1/quotes`, `GET /v1/properties/:id/offers`, and orders re-price on the server).
```
input:  service, property (→ pincode, built-up area), quantity (if the rate type asks for it), date
1. service must be active, and the area must be available   (pincode switched on AND a provider present)
2. find the price in the active price book: the row for this pincode, else the default row, else NOT PRICED
3. quantity:  LUMP_SUM → 1 · PER_AREA → property area in the rate's unit (error if the area is unknown) · PER_QUANTITY → entered value
4. total = max(minimum_charge, quantity × amount)      (integer paise, no floating point)
5. return { rate type, unit label, unit price, quantity, total, price book, price row } as the quote
```
- **NOT PRICED** for a pincode means the service is not offered there. It does not show a price and cannot be ordered.
- **A service is bookable for a property only if:** the service is active · the pincode is switched on · an active provider is present · and it has a price (or default) · and the quantity can be determined.
- The client never sends a price. The order stores the whole quote as a snapshot (`order_lines`).
- **Plans** (bundles) keep `plan_prices` per pincode in the same way.

### 4.4b Plans and subscriptions (BUILT, M3.3b; pricing rule changed by the owner on 21-Nov-2026)
**A plan has no typed-in price. Its price is calculated for each property** from the services in it.

An admin makes a plan: a name, descriptions, a duration in months, an on/off switch, **a list of services**, and for each service
- **how many times it is done during the plan** (its **recurrence**, `visits`, 1 to 100) and an optional note such as "every 3 months";
- **how many units each time**, only for a service charged per hour, day, visit… (`quantity_per_visit`);
- an optional **discount percent on that service** (0 to 99.99);

plus an optional **discount percent on the whole plan**.

**Calculation** (`PricingService.quotePlan`, server-side, whole paise, every step rounded half up):
```
for each service in the plan:
    one visit  = the service's own price for this property (4.4):
                   lump sum              -> the amount
                   per area              -> the property's area, converted to the rate's unit, x the amount
                   per hour/day/visit... -> the quantity set in the plan x the amount
                 with the service's minimum charge applied to ONE visit
    gross      = one visit x visits
    discount   = gross x the service's discount %
    net        = gross - discount
subtotal       = sum of the nets
plan discount  = subtotal x the plan's discount %
TOTAL          = subtotal - plan discount
```
- A plan made **only of lump-sum services has a fixed price** everywhere. Services charged by size make the price follow the property.
- The plan is sold at a property **only if every service in it can be priced there** (a price in that pincode or a default, the property area known where a service is priced by area). A switched-off service blocks the plan until it is back on or removed. A missing property area is reported to the customer (the plan is shown with that note). A service that is "not bookable online" is allowed inside a plan, because an admin put it there on purpose.
- Admins see the result with **"Try a price"**: choose a pincode and a size and read the full breakdown (`POST /v1/admin/plans/:id/estimate`).
- **Buying:** the customer chooses a plan for a property and sees the same breakdown. The order (purpose PLAN, one plan line) keeps the **whole breakdown** as its snapshot, and a **subscription** is created that waits for payment with entitlements copied from the plan (visits per service). Later edits to the plan, a service price or a discount never change what was bought.
- **Life cycle:** PENDING_PAYMENT → ACTIVE when the order is paid (starts that day in India, ends the day before the same date `duration` months later) → EXPIRED after its last day. Cancelling the unpaid order cancels it.
- **Entitlements** (`total`, `used`) count the visits left per service. They are used up when a job is requested (M5).
- Same **purchaser rule** as orders (both directions) and a duplicate warning if the same plan already runs on the property.
- Customers can still **buy any service on demand** without a plan.
- Not built: member discounts on add-on services (the legacy quantity discounts).

### 4.5 Admin screens (M3)
- **Rate types:** list, add, edit, switch off.
- **Service pricing:** pick a service → grid of pincodes with price, filter by city, bulk-set a price for a selection, import a CSV (`pincode, amount`), copy from another service, and a coverage line ("priced in 140 of 182 available pincodes"). The default price and the minimum charge are on the same screen.
- **Price books:** create a draft, preview, publish with a start date.

### 4.6 From the legacy system
`service_pincode_rates` (service × pincode × unit) → `service_prices`; the unit becomes a `PER_AREA` rate type; `lump_sum` → `LUMP_SUM`; `pincodes.plans_price` → `plan_prices`; `pincodes.site_visit_charge` → the price of the site-visit service per pincode.

## 4.5 The site visit comes first, and many properties can be paid together (BUILT, decided by the owner 22-Nov-2026)
- **Site visit = the first, mandatory service for every property.** A person goes to the property, assesses it and **fills in or corrects the details on file** (address, pincode, type, area). Until it is done the property can buy **nothing else** (`PricingService` refuses every service that is not of kind SITE_VISIT, and every plan, with the reason `SITE_VISIT_REQUIRED`). The offers lists show only the site visit and say why.
- **How it is completed:** the customer (or a project owner) buys the site-visit service like any order and pays offline. When the order is PAID it appears in the **Site visits** queue (`GET /v1/admin/site-visits/pending`). Operations mark it done (`POST /v1/admin/properties/:id/site-visit`) with findings and corrections. That stores a `site_visits` row (what changed, before and after), sets `properties.site_visit_completed_at`, and audits it. Each site-visit order can be used once.
- **After the visit:** the owner or the project owner selects any plan or services for the property. Facts a person checked (address, pincode, type, answers, area) are **locked for the owner**; only staff correct them. Name and status stay editable. Onboarding cases catch up by themselves, and "skip the site visit" is allowed only for a property that is already verified.
- **Several properties together:** a project owner (or any owner with several properties) picks properties and **one service set or one plan** and orders them as one **batch** (`POST /v1/order-batches`, preview first). Every property is priced separately by the server; **if one cannot be ordered nothing is ordered** (for example a unit whose visit is not done). The batch is **paid with one payment** (`POST /v1/admin/order-batches/:id/payments`, same maker-checker); approving it pays every order and starts every plan subscription in one transaction. Cancelling one unpaid order changes what is owed; a payment recorded for a different total cannot be approved. Database: `order_batches`, `orders.batch_id`, `payments` has exactly one of `order_id` or `batch_id`, one waiting and one approved payment per batch.

## 5. Data model

```
customers(id, user_id, kind enum[PROPERTY_OWNER, PROJECT_OWNER], country_of_residence, kyc_status)
projects(id, owner_customer_id → customers, code unique, name, kind enum[BUILDER, SOCIETY, OTHER], address…, pincode_id,
         requires_owner_review bool default true, status)
properties(id, customer_id (who added it), project_id → projects null, name, …)            -- the unit belongs to the project
property_parties(id, property_id, customer_id, role enum[OWNER, CO_OWNER, POA_HOLDER], since, until)   -- one active OWNER per property
property_assignments(id, property_id, project_id, invitee_name, invitee_email, invitee_phone, relation enum[ALLOTTEE, BUYER, OWNER],
                     status enum[DRAFT, PENDING_REVIEW, APPROVED, INVITED, ACTIVE, REJECTED, REVOKED, EXPIRED],
                     customer_id null, reviewed_by, reviewed_at, review_note, invited_at, accepted_at)
assignment_documents(assignment_id, document_id)                                            -- the proof

rate_types(id, code unique, name, basis enum[LUMP_SUM, PER_AREA, PER_QUANTITY], unit_label, area_unit_id null,
           min_quantity, max_quantity, quantity_step, is_active, sort)
services(…, rate_type_id → rate_types)                                                      -- replaces the is_lump_sum flag
price_books(id, name, status enum[DRAFT, PUBLISHED, RETIRED], valid_from, valid_to)
service_prices(id, price_book_id, service_id, pincode_id null, amount_paise, min_charge_paise null, is_active)
              unique (price_book_id, service_id, pincode_id)

orders / subscriptions / service_requests / jobs:  purchased_by_customer_id, payer_customer_id, property_id
order_lines(order_id, service_id, rate_type_code, unit_label, unit_paise, quantity, total_paise, pincode, price_book_id, price_id)   -- snapshot
documents(…, owner_customer_id, property_id null)  ;  document_grants(document_id, customer_id, can_download, granted_by, expires_at)
```

## 6. Who can do what with a property

| Actor | See the property | Edit its details | Buy services | Change what they bought | Change what the other party bought |
|---|---|---|---|---|---|
| Property owner (OWNER) | yes | yes | yes | yes | **no** |
| Project owner of its project | yes (basic details, units of their project) | no, unless they created it and no owner is assigned | yes | yes | **no** |
| Another customer | no (404) | no | no | no | no |
| Ops / super admin | yes | yes, audited | on a customer's behalf | yes, with a reason | yes, with a reason |
| Franchise / provider | only what a job on it shows (M5) | no | no | no | no |

## 7. API sketch (built across M2 and M3)
- Projects: `POST /v1/projects` · `GET /v1/projects` · `POST /v1/projects/:id/units` · `POST /v1/projects/:id/units/:propertyId/owner` (create an assignment, with proof document ids) · `POST /v1/property-assignments/:id/submit`
- Review (ops): `GET /v1/admin/property-assignments?status=PENDING_REVIEW` · `POST /v1/admin/property-assignments/:id/approve|reject|revoke`
- Invitation (public link): `GET /v1/assignment-invitation?token=` · `POST /v1/assignment-invitation/accept`
- Claim: `POST /v1/properties/:id/claim` (project code + unit)
- Pricing (admin): `GET/POST/PATCH /v1/admin/rate-types` · `GET/PUT /v1/admin/services/:id/prices` · `POST /v1/admin/services/:id/prices/import` · price books
- Quote: `POST /v1/quotes` `{ serviceId, propertyId, quantity? }` → the quote described in §4.4
- Purchase: `POST /v1/orders` (the server prices it) · `PATCH /v1/subscriptions/:id` (purchaser only)

## 8. Open questions (defaults used until the owner decides)
1. **Visibility.** Default: both parties see *that* a service exists and its schedule and results, but **only the purchaser sees price and payment**. Should the project owner see everything the property owner buys, or nothing?
2. **Review.** Default: ops reviews every project-registered owner. Should trusted builders skip it?
3. **GST.** Prices are exclusive of tax for now. Is MPD GST-registered, and at what rate per category?
4. **Minimum charge.** Optional per price. Is it needed at launch?
5. **A different rate type in a particular pincode** is not supported (one type per service). Is that enough?
6. **Societies.** Does a society pay for common-area services separately from individual flats?
