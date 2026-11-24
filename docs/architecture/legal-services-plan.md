# Legal and professional services: plan (M7)

Decided with the owner on 26-Nov-2026. The catalogue already holds **44 legal and professional services** (kind PROFESSIONAL, imported inactive from the legacy catalogue, in the category "Legal"). They cannot be bought yet. This document is the list of what is to be integrated, in waves, and the agreed way it works. Update the status column as each is built.

## How it works (the owner's answers)
1. **Buying:** the customer picks the service and fills an **intake form** for it. Our team reviews it and sends a **priced offer** (optionally with a discount and a reason). The customer accepts and pays like any other order (offline maker-checker until M8). Prices vary too much per case for a fixed price list.
2. **Who does the work:** **partner lawyers and firms join the network as providers.** After the offer is paid, the case goes to a pool of eligible legal providers (they cover the area and offer that service), the first to accept wins, and the provider works the case. The same earnings split applies (provider, franchise, master franchise, MPD keeps the rest).
3. **What the customer provides and sees:** a **per-service form** and a **document checklist** (what to upload, to the vault), and a **progress tracker** (for example: documents received, in preparation, submitted, completed). The finished documents are delivered into the customer's vault.
4. **Order of building:** all 44 services are to be built; **start with Wave 1: Property transactions and documentation.** The mechanism (forms, checklists, case progress, the legal pool) is built once and each service is then configured as data (its questions, its checklist, its steps), not code.

## Planned build steps (small phases)
| Step | What | Notes |
|---|---|---|
| M7.0 | **Built (27-Nov-2026).** Form and checklist definitions per service, edited by operations (versioned, like job checklists) | Question types: text, number, choice, date, yes/no, file; required or not; documents to collect |
| M7.1 | **Built (27-Nov-2026).** The customer's intake: choose a service, fill the form, upload documents to a checklist | Saves as a draft; submitted for review |
| M7.2 | **Built (28-Nov-2026).** Review and offer: operations review the intake, ask for missing items, and send a priced offer; acceptance makes the order | Reuses the quotation and order machinery |
| M7.3 | **Built (29-Nov-2026).** The legal case and its pool: a paid case goes to eligible legal providers; first to accept wins; the provider works the case through steps and messages the customer | A "legal provider" is an organisation that offers PROFESSIONAL services; reuses the pool, eligibility, chat and notifications |
| M7.4 | **Built (30-Nov-2026).** Progress tracker and delivery: steps the provider ticks, the customer sees, final documents delivered to the vault, rating | Per-service step lists |
| M7.5 | **Built (1-Dec-2026).** Earnings for legal cases | The existing shares apply to the case price |
| M7.6 | **Built (1-Dec-2026).** Wave 2, 3 and 4 services configured: the form, document checklist and progress steps of the 28 remaining services | Data only; most of them have no property, so see "Cases with an area and cases with no area" |
| M7.7 onwards | Activate the services in order, set prices and review the forms with real partners | Operations work, no code unless the mechanism needs it |

## Cases with an area and cases with no area (decided 1-Dec-2026)
A legal case has an **area** when the customer's request was about one of their properties: the case takes the property's **pincode**. A case has **no area** when the request was not about a property (for example drafting a will, or most company, tax and labour services). Everything below follows from that one fact.

| Step | Case with an area | Case with no area |
|---|---|---|
| Request (M7.1) | The customer picks a property; its pincode is copied to the request | No property is chosen, so no pincode |
| The pool (M7.3) | Every legal provider that is live with staff, holds that pincode and offers the service sees it; the first to accept wins | **In nobody's pool.** No provider can accept it by itself; the franchise cannot see it |
| Who hands it out | The franchise, master franchise or operations can nudge providers or give it to an eligible provider | **Only operations.** They are told when the case opens, see it under Legal cases, and give it to any live provider that offers the service (the reason is recorded). The provider then sees the customer and works it as usual |
| The 24-hour alert | Operations and the area's franchise are alerted once | Operations are alerted at once (nobody else could act) and again after 24 hours |
| Who sees the case | The provider that holds it, the area's franchise and master franchise, and operations | The provider that holds it and operations. **Not** a franchise or master franchise (there is no area to belong to) |
| Earnings (M7.5) | The provider, the franchise and the master franchise of the pincode each earn their share | **Only the provider earns.** There is no franchise or master franchise to pay, so their percentages are not paid to anyone: MPD keeps them |
| Doing the work, delivery, rating | Same | Same |

Why: franchises and master franchises exist to run an **area** (they are paid for managing the providers and customers in their pincodes). A case that belongs to no pincode has no one to manage it, so MPD operations take that role, and MPD keeps the area owners' share.

Known consequence: **Waves 2 to 4 (M7.6) are mostly not about a property** (GST, income tax, licences, labour law, contracts, arbitration), so most of those cases will have no area and will be handed out by operations one by one. This works at launch volumes. If volumes grow, the options are: ask the customer for the pincode of the place of business (then the normal pool and franchise shares apply); or let a provider pick up no-area cases from a shared pool (then decide who earns the franchise share). Not built; decide with the owner when the volume is visible.

## Open details to settle with the owner while building
- Legal providers: the same organisation type (service provider) offering professional services, or a separate "legal provider" type? (Default: the same type, with the service offering as the filter.)
- Do legal cases need a site visit first? (Default: no; the property site-visit gate applies to field services only. Property facts can be asked in the intake form.)
- Who may see a customer's documents on a case: only the accepting provider and operations. (Default.)
- Service level: a time limit for providers to accept and for each step. (Default: the same acceptance limit as jobs, step times later.)
- Government fees and stamp duty: shown as separate lines in the offer, paid by the customer through MPD. (Default: yes.)

## The services to integrate (44)
Status: planned until built. Waves group them by sub-category.

### Wave 1: Property Transactions & Documentation (16 services)

| # | Service (as in the catalogue) | Form questions | Document checklist | Status |
|---|---|---|---|---|
| 1 | Sale & Purchase(Drafting Sale Deed) | defined (seed v1) | defined (seed v1) | M7.0 form set up |
| 2 | Sale & Purchase(Title Verification) | defined (seed v1) | defined (seed v1) | M7.0 form set up |
| 3 | Sale & Purchase(Agreement to Sell) | defined (seed v1) | defined (seed v1) | M7.0 form set up |
| 4 | Sale & Purchase(Gift Deed) | defined (seed v1) | defined (seed v1) | M7.0 form set up |
| 5 | Sale & Purchase(Lease & Rental Agreements) | defined (seed v1) | defined (seed v1) | M7.0 form set up |
| 6 | Registration & Documentation(Mutation of Property) | defined (seed v1) | defined (seed v1) | M7.0 form set up |
| 7 | Registration & Documentation(Property Registration) | defined (seed v1) | defined (seed v1) | M7.0 form set up |
| 8 | Registration & Documentation(Power of Attorney (PoA)) | defined (seed v1) | defined (seed v1) | M7.0 form set up |
| 9 | Registration & Documentation(Partition Deed) | defined (seed v1) | defined (seed v1) | M7.0 form set up |
| 10 | Registration & Documentation(Will & Probate) | defined (seed v1) | defined (seed v1) | M7.0 form set up |
| 11 | Due Diligence & Verification(Property verification / Title Search) | defined (seed v1) | defined (seed v1) | M7.0 form set up |
| 12 | Due Diligence & Verification(Encumbrance Certificate) | defined (seed v1) | defined (seed v1) | M7.0 form set up |
| 13 | Due Diligence & Verification(Land Use Verification) | defined (seed v1) | defined (seed v1) | M7.0 form set up |
| 14 | Due Diligence & Verification(Litigation Check) | defined (seed v1) | defined (seed v1) | M7.0 form set up |
| 15 | Land Conversion(Agricultural to non-agricultural) | defined (seed v1) | defined (seed v1) | M7.0 form set up |
| 16 | Advisory & Recommendations(Investment or Sale Guidance) | defined (seed v1) | defined (seed v1) | M7.0 form set up |

### Wave 2: Disputes & Legal Drafting (4 services)

| # | Service (as in the catalogue) | Form questions | Document checklist | Status |
|---|---|---|---|---|
| 17 | Arbitration(Dispute resolution) | defined (seed v1) | defined (seed v1) | M7.6 form set up |
| 18 | Legal Notices(Drafting & Response) | defined (seed v1) | defined (seed v1) | M7.6 form set up |
| 19 | Contracts(Drafting & Vetting) | defined (seed v1) | defined (seed v1) | M7.6 form set up |
| 20 | Litigation Support(Civil & Corporate matters) | defined (seed v1) | defined (seed v1) | M7.6 form set up |

### Wave 2: Special Property Matters (4 services)

| # | Service (as in the catalogue) | Form questions | Document checklist | Status |
|---|---|---|---|---|
| 21 | Agricultural / Industrial Lands(Land Conversion / Advisory) | defined (seed v1) | defined (seed v1) | M7.6 form set up |
| 22 | Redevelopment / Slum Rehabilitation(Documentation & Agreements) | defined (seed v1) | defined (seed v1) | M7.6 form set up |
| 23 | NRI Property Advisory(Transactions & FEMA compliance) | defined (seed v1) | defined (seed v1) | M7.6 form set up |
| 24 | Succession & Inheritance(Succession Certificates) | defined (seed v1) | defined (seed v1) | M7.6 form set up |

### Wave 3: Government Approvals & Statutory Compliance (5 services)

| # | Service (as in the catalogue) | Form questions | Document checklist | Status |
|---|---|---|---|---|
| 25 | RERA Compliance(Project registration & monitoring) | defined (seed v1) | defined (seed v1) | M7.6 form set up |
| 26 | CGWA Approvals(Groundwater abstraction NOC) | defined (seed v1) | defined (seed v1) | M7.6 form set up |
| 27 | Pollution Control Board (PCB)(Consent to Establish / Operate) | defined (seed v1) | defined (seed v1) | M7.6 form set up |
| 28 | Building Permissions(Local municipal approvals) | defined (seed v1) | defined (seed v1) | M7.6 form set up |
| 29 | Fire & Safety Approvals(Fire NOC) | defined (seed v1) | defined (seed v1) | M7.6 form set up |

### Wave 3: Licenses & Permits (3 services)

| # | Service (as in the catalogue) | Form questions | Document checklist | Status |
|---|---|---|---|---|
| 30 | Factory License(Registration / Amendment / Renewal) | defined (seed v1) | defined (seed v1) | M7.6 form set up |
| 31 | FSSAI License(Food safety license) | defined (seed v1) | defined (seed v1) | M7.6 form set up |
| 32 | Shop & Establishment(Trade license) | defined (seed v1) | defined (seed v1) | M7.6 form set up |

### Wave 4: Finance & Taxation (7 services)

| # | Service (as in the catalogue) | Form questions | Document checklist | Status |
|---|---|---|---|---|
| 33 | GST(Registration & Returns) | defined (seed v1) | defined (seed v1) | M7.6 form set up |
| 34 | TDS(Deduction & Filing) | defined (seed v1) | defined (seed v1) | M7.6 form set up |
| 35 | Income Tax(Corporate & individual returns) | defined (seed v1) | defined (seed v1) | M7.6 form set up |
| 36 | ROC / MCA Filings(Annual returns & compliance) | defined (seed v1) | defined (seed v1) | M7.6 form set up |
| 37 | Property Tax(Assessment & Filing) | defined (seed v1) | defined (seed v1) | M7.6 form set up |
| 38 | Capital Gains Tax(Advisory) | defined (seed v1) | defined (seed v1) | M7.6 form set up |
| 39 | Home Loan Documentation(Vetting) | defined (seed v1) | defined (seed v1) | M7.6 form set up |

### Wave 4: Insurance & Claims (2 services)

| # | Service (as in the catalogue) | Form questions | Document checklist | Status |
|---|---|---|---|---|
| 40 | Insurance Advisory(Policy selection) | defined (seed v1) | defined (seed v1) | M7.6 form set up |
| 41 | Claims Management(Documentation & Settlement) | defined (seed v1) | defined (seed v1) | M7.6 form set up |

### Wave 4: Labour Law Compliance (3 services)

| # | Service (as in the catalogue) | Form questions | Document checklist | Status |
|---|---|---|---|---|
| 42 | Registrations(PF, ESIC, Professional Tax) | defined (seed v1) | defined (seed v1) | M7.6 form set up |
| 43 | Compliance Filings(Monthly / Annual returns) | defined (seed v1) | defined (seed v1) | M7.6 form set up |
| 44 | Advisory(Labour disputes) | defined (seed v1) | defined (seed v1) | M7.6 form set up |
