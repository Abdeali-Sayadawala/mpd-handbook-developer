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
| M7.0 | Form and checklist definitions per service, edited by operations (versioned, like job checklists) | Question types: text, number, choice, date, yes/no, file; required or not; documents to collect |
| M7.1 | The customer's intake: choose a service, fill the form, upload documents to a checklist | Saves as a draft; submitted for review |
| M7.2 | Review and offer: operations review the intake, ask for missing items, and send a priced offer; acceptance makes the order | Reuses the quotation and order machinery |
| M7.3 | The legal case and its pool: a paid case goes to eligible legal providers; first to accept wins; the provider works the case through steps and messages the customer | A "legal provider" is an organisation that offers PROFESSIONAL services; reuses the pool, eligibility, chat and notifications |
| M7.4 | Progress tracker and delivery: steps the provider ticks, the customer sees, final documents delivered to the vault, rating | Per-service step lists |
| M7.5 | Earnings for legal cases | The existing shares apply to the case price |
| M7.6 onwards | Wave 2, 3 and 4 services configured | Data only, if the mechanism is right |

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
| 1 | Sale & Purchase(Drafting Sale Deed) | to define | to define | planned |
| 2 | Sale & Purchase(Title Verification) | to define | to define | planned |
| 3 | Sale & Purchase(Agreement to Sell) | to define | to define | planned |
| 4 | Sale & Purchase(Gift Deed) | to define | to define | planned |
| 5 | Sale & Purchase(Lease & Rental Agreements) | to define | to define | planned |
| 6 | Registration & Documentation(Mutation of Property) | to define | to define | planned |
| 7 | Registration & Documentation(Property Registration) | to define | to define | planned |
| 8 | Registration & Documentation(Power of Attorney (PoA)) | to define | to define | planned |
| 9 | Registration & Documentation(Partition Deed) | to define | to define | planned |
| 10 | Registration & Documentation(Will & Probate) | to define | to define | planned |
| 11 | Due Diligence & Verification(Property verification / Title Search) | to define | to define | planned |
| 12 | Due Diligence & Verification(Encumbrance Certificate) | to define | to define | planned |
| 13 | Due Diligence & Verification(Land Use Verification) | to define | to define | planned |
| 14 | Due Diligence & Verification(Litigation Check) | to define | to define | planned |
| 15 | Land Conversion(Agricultural to non-agricultural) | to define | to define | planned |
| 16 | Advisory & Recommendations(Investment or Sale Guidance) | to define | to define | planned |

### Wave 2: Disputes & Legal Drafting (4 services)

| # | Service (as in the catalogue) | Form questions | Document checklist | Status |
|---|---|---|---|---|
| 17 | Arbitration(Dispute resolution) | to define | to define | planned |
| 18 | Legal Notices(Drafting & Response) | to define | to define | planned |
| 19 | Contracts(Drafting & Vetting) | to define | to define | planned |
| 20 | Litigation Support(Civil & Corporate matters) | to define | to define | planned |

### Wave 2: Special Property Matters (4 services)

| # | Service (as in the catalogue) | Form questions | Document checklist | Status |
|---|---|---|---|---|
| 21 | Agricultural / Industrial Lands(Land Conversion / Advisory) | to define | to define | planned |
| 22 | Redevelopment / Slum Rehabilitation(Documentation & Agreements) | to define | to define | planned |
| 23 | NRI Property Advisory(Transactions & FEMA compliance) | to define | to define | planned |
| 24 | Succession & Inheritance(Succession Certificates) | to define | to define | planned |

### Wave 3: Government Approvals & Statutory Compliance (5 services)

| # | Service (as in the catalogue) | Form questions | Document checklist | Status |
|---|---|---|---|---|
| 25 | RERA Compliance(Project registration & monitoring) | to define | to define | planned |
| 26 | CGWA Approvals(Groundwater abstraction NOC) | to define | to define | planned |
| 27 | Pollution Control Board (PCB)(Consent to Establish / Operate) | to define | to define | planned |
| 28 | Building Permissions(Local municipal approvals) | to define | to define | planned |
| 29 | Fire & Safety Approvals(Fire NOC) | to define | to define | planned |

### Wave 3: Licenses & Permits (3 services)

| # | Service (as in the catalogue) | Form questions | Document checklist | Status |
|---|---|---|---|---|
| 30 | Factory License(Registration / Amendment / Renewal) | to define | to define | planned |
| 31 | FSSAI License(Food safety license) | to define | to define | planned |
| 32 | Shop & Establishment(Trade license) | to define | to define | planned |

### Wave 4: Finance & Taxation (7 services)

| # | Service (as in the catalogue) | Form questions | Document checklist | Status |
|---|---|---|---|---|
| 33 | GST(Registration & Returns) | to define | to define | planned |
| 34 | TDS(Deduction & Filing) | to define | to define | planned |
| 35 | Income Tax(Corporate & individual returns) | to define | to define | planned |
| 36 | ROC / MCA Filings(Annual returns & compliance) | to define | to define | planned |
| 37 | Property Tax(Assessment & Filing) | to define | to define | planned |
| 38 | Capital Gains Tax(Advisory) | to define | to define | planned |
| 39 | Home Loan Documentation(Vetting) | to define | to define | planned |

### Wave 4: Insurance & Claims (2 services)

| # | Service (as in the catalogue) | Form questions | Document checklist | Status |
|---|---|---|---|---|
| 40 | Insurance Advisory(Policy selection) | to define | to define | planned |
| 41 | Claims Management(Documentation & Settlement) | to define | to define | planned |

### Wave 4: Labour Law Compliance (3 services)

| # | Service (as in the catalogue) | Form questions | Document checklist | Status |
|---|---|---|---|---|
| 42 | Registrations(PF, ESIC, Professional Tax) | to define | to define | planned |
| 43 | Compliance Filings(Monthly / Annual returns) | to define | to define | planned |
| 44 | Advisory(Labour disputes) | to define | to define | planned |
