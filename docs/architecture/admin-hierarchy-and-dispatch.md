# Admin hierarchy, areas, services offered and job dispatch

Status: **described by the owner on 21-Nov-2026**. Parts marked **BUILT** exist in the code today. Parts marked **PLANNED** are scheduled (milestone shown). Parts marked **DECIDED** were confirmed by the owner on 21-Nov-2026 (answers in §9). Anything still marked **PROPOSED** waits for the owner.

---

## 1. Who is who

| Role | Who they are | What they manage | Invites |
|---|---|---|---|
| **Super admin** | The owner of the website | Everything. Sees everything | Master franchises (and ops staff) |
| **Ops** (MPD staff) | Super admin's team | Day-to-day: catalogue, pricing, KYC, owner registrations, customers | Master franchises |
| **Master franchise** (MF) | A partner who runs **one city** | The whole city. Sees everything done by the franchises, providers and workers under them | Franchises, service providers |
| **Franchise** | A partner who runs **an area inside a city**. Several franchises sit under one MF (a Vadodara MF has franchises for Alkapuri, Karelibagh, Manjalpur…) | Their area. Sees their providers and workers | Service providers |
| **Service provider** (SP) | A contractor with one or many workers | Their workers, the services they offer, the areas they work in | Service workers |
| **Service worker** | A person who does the actual work, under one provider | Nothing about areas. Chooses which of the provider's services they can do | nobody |

**Invitation chain:** Super admin / ops → Master franchise → (Franchise →) Service provider → Service worker. Nobody can invite above their own level, and everybody can only invite inside their own branch of the tree.

**BUILT (M1):** the organisation tree (MPD → Master franchise → Franchise → Service provider), staff invites by emailed single-use link, role-per-organisation rules, and "you can only see and manage your own branch". A higher role can manage a lower one in the same branch. A service worker is a `FIELD_WORKER` role inside a service provider organisation. See `mpd-backend/src/common/policy/`.

## 2. Areas: pincodes, with area names as labels

**Recommendation (PROPOSED, but it is exactly how the code works today): the unit of an area is the pincode.** An *area name* is only a label.

Why pincodes, not area names:
- The customer types a pincode. Availability, prices and provider coverage are all looked up by pincode. One key means no mapping layer to get wrong.
- Area names are not unique or stable ("Karelibagh" can be spelled four ways, and two localities can share one name). A pincode is exact.
- It is already loaded: every pincode has its area name, city and state from the legacy data, and admins can switch each one on or off.

How it is organised (**BUILT**, `territories` + `territory_pincodes`):
- A **territory** is a *named group of pincodes* owned by an organisation. Example: franchise "Alkapuri & Race Course" holds territory "Alkapuri side" = 390007, 390015.
- **Master franchise = a city.** Its territories hold the city's pincodes.
- A **franchise's** pincodes must lie inside its master franchise's pincodes. A **service provider's** must lie inside its parent's. The API refuses a pincode outside the parent's territory. So nobody can claim an area their parent does not hold.
- A pincode is **available to customers only when it is switched on AND at least one active, staffed service provider covers it** (the availability rule, **BUILT**).

**DECIDED rules on areas (owner, 21-Nov-2026):**
- A **master franchise** runs one city (a city, not a list of pincodes: `organisations.city_id`, 26-Nov-2026). One active master franchise per city (a database rule). Its area is every pincode of the city, including pincodes added later; franchises and providers below it still hold pincodes inside it.
- A **franchise** can hold **one or many pincodes and one or many areas** (several territories). Its pincodes must be inside its master franchise's.
- **A franchise can never overlap another franchise.** A pincode belongs to at most one franchise. (This is the only exclusive level.) **Enforced in code (M5.0a, 22-Nov-2026):** creating or changing a franchise territory is refused (409) if a pincode already belongs to another franchise; two master franchises cannot hold pincodes of the same city. Providers overlap freely.
- A **service provider** also holds one or many pincodes and areas, chosen from the list of pincodes of its franchise.
- **Service providers may overlap freely**, including several providers in the same pincode under the same franchise. That is what lets a request reach all of them (§5).

### How a provider adds an area (DECIDED; BUILT 23-Nov-2026)
**Built:** the provider's own admin creates, changes and deletes its territories (Organisations, map icon on its row). Only pincodes inside the area of its original franchise or of a franchise that has accepted it are allowed (`FranchiseLinksService.allowedPincodeIds`), so every pincode a provider serves is always under a franchise it is registered in, and because franchises never overlap, each pincode belongs to exactly one of them. Ending a registration removes the pincodes only that franchise covered. A franchise or master franchise or operations can still edit a provider's areas; a franchise still cannot edit its own.

1. The provider picks pincodes/areas **from the list of its franchise's pincodes**. It can then receive requests for properties in those pincodes.
2. To work in a pincode **outside its franchise**, the provider must **register under the franchise that runs that pincode** (the franchise accepts it). A provider can therefore be registered under **more than one franchise**, and it only sees and serves the pincodes covered through a franchise that has accepted it.
3. Each franchise sees only the provider's activity in its own pincodes.

**BUILT (M5.0c, 22-Nov-2026):** `provider_franchise_links(provider_org_id, franchise_org_id, status PENDING|ACTIVE|REMOVED, reason)`. A new provider is registered under the franchise it is created below (a permanent ACTIVE link; existing providers were back-filled). The provider, or anyone above it, asks another franchise (`POST /v1/orgs/:providerId/franchise-links`); that franchise, or anyone above it, accepts or rejects with a reason (`/v1/franchise-links/:id/accept|reject`); either side can end it (`/end`, a reason is needed for an active one), which **takes the pincodes only that franchise covered off the provider**. A provider can hold only pincodes inside the area of its own franchise or of a franchise that accepted it. `GET /v1/franchises/directory` lists franchise names to choose from. Console: Organisations → **Franchises** (provider) and **Providers** (franchise). Franchises still do not see a linked provider's people; what they see of its work comes with the job pool (by pincode). Original design notes:

**What this changes in the data model (was PLANNED):** today an organisation has a single parent, so a provider sits under one franchise. We add `provider_franchise_links(provider_org_id, franchise_org_id, status[PENDING, ACTIVE, REMOVED])`. The provider keeps its original parent (the franchise that first invited it). Coverage rows get the franchise they are covered through, and the existing rule becomes "every provider pincode must be inside the territory of a franchise that has an ACTIVE link". The availability rule, invitations and visibility use the links.

## 3. Services a provider offers (BUILT, M5.0b, 22-Nov-2026)

- A **service provider chooses its pincodes/areas** (§2) **and then the services it offers** from the catalogue (one or many). What it offers is *services × its areas*. (**DECIDED:** simple on purpose. If a provider needs "service A in area 1 only", we can add a per-area exception later without changing the rest.)
- A **service worker chooses which of the provider's services they can do** (a subset). A worker never sees services the provider does not offer.
- An upline (franchise, master franchise, ops) can switch a provider's service off with a reason (audited), for example when a provider failed quality checks.
- **Built:** `provider_services(org_id, service_id, status ACTIVE|SUSPENDED, suspended_reason)` and `worker_services(user_id, org_id, service_id)`; a composite foreign key makes a worker service impossible unless the provider offers it, and removing a service from the provider removes it from its workers. API: `GET/PUT /v1/orgs/:orgId/services`, `POST .../:serviceId/suspend|resume`, `GET/PUT /v1/workers/:userId/services`. Who may change: the provider's own admin or anyone above it (admins anywhere); switching one off is the upline only, never the provider itself; a worker reads and changes only their own list (their provider and the upline too); only services switched on in the catalogue can be added. Console: Organisations → a provider's **Services**, and People → a worker's **Services**. Still planned: provider-franchise links (M5.0c) and using these tables to decide which providers see a request (job pool).

## 4. Which providers are "eligible" for a request

A provider is eligible for a job when **all** are true:
1. Its organisation and every organisation above it are active, and it has active staff (**BUILT**, same as the availability rule).
2. Its territories include the **pincode of the property**.
3. It has **selected the service** (§3).
4. (Later) it is not suspended and has capacity.

## 5. How a request reaches people and gets accepted (pool BUILT, M5.1; field work PLANNED)

**BUILT (M5.1, 22-Nov-2026):** `jobs`, `job_events`, `job_declines`. A job is made for every PAID service line (`order_lines`, one job each; a paid site visit is a SITE_VISIT job) and for every visit a plan owner requests (`POST /v1/me/jobs/request-visit`, one entitlement visit used atomically, given back if the job is cancelled; urgent = 30 minutes). Jobs are made by `JobsService.sync()` when jobs are read, so a payment never needs to know about jobs. **Eligible** = organisation live with staff, holds the pincode, offers the service (not suspended), and has not turned the job down. `GET /v1/jobs/pool`, `POST /v1/jobs/:id/accept` (one guarded update: exactly one provider wins, the others get 409), `/decline`, `/release` (back to the pool, not for that provider), `/assign-worker` (own active worker who can do the service; changeable until work starts), `/assign-provider` and `/nudge` (franchise, master franchise or operations; the reason is recorded; a nudge only a record until messaging, at most one per 15 minutes), `/cancel` (operations). Privacy: in the pool no customer, no name, no full address; after accept the provider, its workers and the upline see them. Visibility: operations all, franchise and master franchise the jobs whose pincode is in their territories, a provider its own jobs, a worker theirs. Status changes only through `assertTransition` (`job-state.ts`); the field steps (EN_ROUTE to VERIFIED) are listed but have no transitions yet (M5.2). Until the field app exists, completing a site visit on the property (operations) closes its job. Overdue (still in the pool after the SLA) is a flag; alerts need messaging (M6). Console: **Jobs board**; customers: **Service requests**.


```
 customer buys a service for a property  ─►  a job is created: REQUESTED, in the POOL for that pincode + service

 WHO CAN SEE IT (read-only unless noted)
   • every ELIGIBLE service provider            ◄── can ACCEPT (the first to accept gets it)
   • the franchise whose area holds the pincode
   • the master franchise of that city
   • ops and super admin
   (a service worker sees only jobs assigned to them)

 ACCEPT      The service provider admin taps Accept. One atomic step, so only ONE provider can win.
             Everyone else's copy disappears from their pool. State: REQUESTED → ACCEPTED.
 NUDGE       Franchise / master franchise / ops can "ask the providers to take it" (push + in-app, M6).
             (As described: "go and tell a service provider to accept".)
 ASSIGN      DECIDED: franchise / master franchise / ops can also pick an eligible provider directly.
             The job is then ACCEPTED by that provider, with the person and reason in the log.
 DECLINE     A provider can decline. The request stays in the pool for the others.
 ESCALATE    If nobody accepts within the SLA (**DECIDED:** 2 hours normally, 30 minutes for urgent, configurable), the franchise, master franchise
             and ops are alerted.

 ASSIGN A WORKER   The provider admin picks one of their own workers who is active AND has selected this
             service. State: ACCEPTED → ASSIGNED. The worker may be changed until the visit starts.
 DO THE WORK       ASSIGNED → EN_ROUTE → STARTED (start OTP) → IN_PROGRESS → WORK_DONE (end OTP) → VERIFIED → CLOSED
                   (the full job state machine is in README §6.1; every move is written to `job_events`)
```

**Privacy in the pool (DECIDED):** before a provider accepts, they see the service, the area (locality and pincode), the property type and size, and the preferred time. They do **not** see the customer's name, phone or full address. Those appear after accept. This stops providers calling customers directly to take the job off the platform.

**Who sees what afterwards (hierarchy visibility, BUILT for people, PLANNED for jobs):** everything done by a provider and its workers is visible to that provider, its franchise, its master franchise and ops. A franchise sees its area, a master franchise sees the whole city, super admin and ops see all. A worker sees only what is assigned to them.

**Money follows the tree:** earnings for a job are split along the chain by the commission rules (M6). Nothing in this document changes that.

## 6. Data model additions (PLANNED)

```
provider_services(id, org_id → organisations, service_id → services, status enum[ACTIVE, SUSPENDED], suspended_reason, created_at)   unique (org_id, service_id)
worker_services(user_id → users, org_id, service_id → services)                                                                     unique (user_id, service_id)
jobs.provider_org_id, jobs.worker_user_id           -- already planned (README §5). provider_org_id stays NULL while the job is in the pool
job_events(...)                                      -- gains actions: OFFERED, NUDGED, ACCEPTED, DECLINED, ASSIGNED_PROVIDER, ASSIGNED_WORKER, ESCALATED
job_pool view / query                                -- jobs in REQUESTED, joined to eligible providers by (pincode, service)
```
Accepting is a single guarded update (`UPDATE jobs SET provider_org_id = :org, status = 'ACCEPTED' WHERE id = :id AND status = 'REQUESTED' AND provider_org_id IS NULL`). If it affects zero rows, someone else got there first, and the user is told so.

## 7. Where it fits in the roadmap

| Step | What | Milestone |
|---|---|---|
| Hierarchy, invites, territories, availability | **BUILT** | M1 |
| Area rules: one MF per city, a franchise never overlaps another franchise | **BUILT** | M5.0a |
| Providers registered under more than one franchise (`provider_franchise_links`) | **BUILT** | M5.0c |
| Providers and workers choose their services; upline can switch off | **BUILT** | M5.0b |
| Job pool, accept, decline, nudge, assign provider, assign worker | PLANNED | M5 |
| Notifications to providers and upline, escalation timers | PLANNED | M6 |
| Orders and subscriptions (what creates the job) | in progress | M3.3 |

## 8. What changes in the main spec

- README §11 "Job routing": was *fixed to the provider mapped to the pincode*. Now **an open pool**: every eligible provider sees it and the first to accept gets it (ADR 016).
- README §6.1: `REQUESTED → ACCEPTED` is now "a provider accepts from the pool"; `ASSIGNED` is "the provider assigns a worker".
- The "city partner + open vendor network" proposal in §11 is largely this model already; the difference that remains is the number of layers.

## 9. Decisions (owner, 21-Nov-2026)

1. **Area unit = pincode**, with area names as labels. *(my recommendation, accepted)*
2. **Overlaps.** One master franchise per city (it runs the whole city, so its area needs no pincode list). A franchise holds one or many pincodes and areas but **never overlaps another franchise**. Providers hold one or many pincodes and areas and **may overlap each other**, also within one franchise. To serve a pincode outside its franchise a provider must register under the franchise that runs it.
3. **Provider offers.** A provider selects pincodes/areas from its franchise's list, then the services it provides. Offers = its services in all its chosen areas. No per-area exceptions at first.
4. **Upline powers.** Both: nudge, and assign a request directly to an eligible provider.
5. **Privacy.** Customer name, phone and address stay hidden until a provider accepts.
6. **Acceptance time limit.** 2 hours normally, 30 minutes for urgent, configurable, then alert the franchise, master franchise and ops.
7. **Worker acceptance.** The worker just gets the job and can raise "cannot attend" for reassignment.
