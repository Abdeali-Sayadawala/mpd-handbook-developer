# Next.js and NestJS: what they are and why MPD uses them

Plain-language explanation for the owner, new developers and new Claude sessions. (Both names are easy to confuse: **Next.js** is for building *what people see in the browser*; **NestJS** is for building *the server that holds the rules and the data*. They are different tools that work well together because both are written in TypeScript.) Decisions: ADR 001, 010 and 011 in `README.md` §16.

## The two halves of MPD
```
 Browser / phone  ───►  FRONTEND (Next.js)  ───►  BACKEND API (NestJS)  ───►  PostgreSQL database
 what people see        pages, forms, menus       rules, prices, security       the data
 mpd-frontend, mpd-global                         mpd-backend
```
The frontend never talks to the database. It only asks the backend, and **the backend decides** what is allowed. That is why a hidden menu item is only cosmetic: the real permission check is always on the server.

## What is Next.js
Next.js is a framework on top of **React** (the most widely used library for building screens). React alone only draws components; Next.js adds everything a real website needs:
- **Pages from folders.** A file `app/admin/(console)/payments/page.tsx` automatically becomes the page `/admin/payments`. No separate routing setup.
- **Server and browser in one project.** Some code runs on the server before the page is sent (fast first load, good for search engines and for keeping secrets such as tokens away from the browser), and some runs in the browser (clicks, forms). Next.js lets one codebase do both.
- **Server actions.** A form button can call a server function directly. MPD uses this for every action (for example "Approve payment"): the browser calls a small function in `src/actions/*.ts`, which calls the backend using the signed-in user's token.
- **Good defaults:** code splitting, image handling, caching and a development server with instant reload.

**Where MPD uses it**
- `mpd-frontend`: the signed-in app. `app/(portal)/` is the customer portal; `app/admin/(console)/` is the staff console. Screens live in `src/components/`, menus per role in `src/lib/nav.ts`.
- `mpd-global`: the public marketing website. Its content comes from the backend CMS, and Next.js can rebuild a page when an admin saves a change (revalidation), so the site is fast and always current.

## What is NestJS
NestJS is a framework for building the **backend** (the API) in TypeScript on Node.js. It is opinionated about structure, which is its strength on a large project:
- **Modules.** The code is split into modules (`orders`, `jobs`, `catalogue`, `identity`...), each with controllers (the URLs), services (the rules) and DTOs (the exact shape of requests and responses). This matches our rule that **a module never reads another module's tables**; it calls the other module's service.
- **Dependency injection.** A service asks for what it needs (database, audit log, another service) and Nest supplies it. This makes the code testable: every rule is checked by an end-to-end test.
- **Guards and pipes.** Every route is protected by a guard (login and role), and incoming data is validated automatically (extra fields are refused). That is how "every route is guarded plus a policy check" is enforced everywhere, not remembered case by case.
- **Swagger/OpenAPI built in.** From our decorators Nest produces `openapi.json`, the API contract that the web, website and mobile apps generate their typed client from (`pnpm api:generate`). If the backend changes, the apps fail to compile until they are updated, instead of failing in front of a customer.
- **Background work and scheduling** fit naturally (the pg-boss worker for reminders and notifications in M6).

**Where MPD uses it:** `mpd-backend` only. With **Prisma** (the database toolkit) and **PostgreSQL**, it holds all the business rules: pricing (`PricingService`), orders and payments, the job pool, permissions, and the audit log.

## Why these, for MPD
1. **One language everywhere.** NestJS, Next.js and the Expo mobile app are all TypeScript. One team (or one Claude session) can work on any part, share types and patterns, and the compiler catches mismatches between the API and every screen.
2. **A strict, typed contract.** `openapi.json` plus generated clients means the three apps cannot drift from the API. The legacy Laravel app had no API at all and mixed rules into pages; that is exactly what we are leaving behind.
3. **Structure that survives growth.** NestJS modules, guards and tests suit a system with many roles, a franchise tree, money and audit needs. Rules live in one place on the server, never in the browser.
4. **Speed of development and hiring.** Both are mainstream, well documented and have large communities; Next.js is the standard way to build React apps, and Node/TypeScript developers are easy to find.
5. **Low running cost.** Both run on the single small server in the plan (Docker Compose behind Caddy), well under the ₹5,000 a month budget; no extra services like Redis are needed.
6. **Right tool for each job.** Next.js for pages (including a fast, searchable public website). NestJS for a rules-heavy API. A single "do everything" framework would have mixed the two concerns.

## Alternatives we considered (ADR 001 and 010)
- **Laravel again (PHP):** familiar, but a second language next to the web and mobile apps, and the old app's problems came from how it was built, not only the tool.
- **Python/Django:** strong admin and data tooling, but adds a second language next to TypeScript web and mobile.
- **A monorepo:** easier type sharing, but every session would load far more; we use separate repos linked by `openapi.json` instead.
- **Flutter for mobile:** another language; Expo (React Native) reuses our TypeScript.

## How a click travels (example: "Approve payment")
1. In the browser the staff member presses **Approve** on the Payments page (Next.js, `mpd-frontend`).
2. The button calls a server action (`src/actions/payments.ts`), which sends `POST /v1/admin/payments/:id/approve` with the user's token to the backend.
3. NestJS checks the token and the role (guard), validates the request, then `PaymentsService.approve` checks that the approver is not the person who recorded it, marks the payment approved and the order paid in **one database transaction**, starts any plan, and writes the audit entry.
4. The result goes back and the page refreshes. Tests in `mpd-backend/test/` prove each of those rules.

## Where to look in the code
| Topic | Look at |
|---|---|
| A backend module | `mpd-backend/src/modules/<name>/` (`*.controller.ts`, `*.service.ts`, `dto/`) |
| How routes are protected | `mpd-backend/src/common/auth/` and `src/common/policy/` |
| The API contract | `mpd-backend/openapi.json` |
| A customer page | `mpd-frontend/app/(portal)/<area>/page.tsx` and `src/components/<area>/` |
| A staff page | `mpd-frontend/app/admin/(console)/<area>/page.tsx` |
| Calling the backend from a page | `mpd-frontend/src/actions/<area>.ts` (generated client in `src/api/`) |
| The public website | `mpd-global/app/` |
