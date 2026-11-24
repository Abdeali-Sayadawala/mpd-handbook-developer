/* MPD Engineering Handbook: behaviour. No dependencies, no build. Content that is data (modules, state machines, recipes, glossary) lives here. */
'use strict';
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (t) => String(t).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
const NS = 'http://www.w3.org/2000/svg';
function svgEl(tag, attrs = {}, text) {
  const e = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
  if (text !== undefined) e.textContent = text;
  return e;
}
/** Tabs: a row of buttons, one panel that shows the selected item's html. */
function tabs(host, items, render, start = 0) {
  host.innerHTML = '<div class="tabs" role="tablist"></div><div class="panel"></div>';
  const bar = $('.tabs', host), panel = $('.panel', host);
  items.forEach((it, i) => {
    const b = document.createElement('button');
    b.textContent = it.label; b.setAttribute('role', 'tab');
    b.onclick = () => { $$('button', bar).forEach((x, j) => x.setAttribute('aria-selected', i === j)); panel.innerHTML = render(it); };
    bar.appendChild(b);
  });
  bar.children[start].click();
}

/* ---------------------------------------------------------------- navigation */
function buildNav() {
  const side = $('#side');
  const groups = {};
  $$('main section[data-group]').forEach((s) => { (groups[s.dataset.group] ||= []).push(s); });
  let html = '<input type="search" id="navq" placeholder="Filter sections" aria-label="Filter sections">';
  for (const [g, list] of Object.entries(groups)) {
    html += `<div class="grp">${g}</div>` + list.map((s) => `<a href="#${s.id}">${esc($('h2', s).textContent)}</a>`).join('');
  }
  side.innerHTML = html;
  $('#navq').oninput = (e) => {
    const q = e.target.value.toLowerCase();
    $$('a', side).forEach((a) => { a.style.display = !q || a.textContent.toLowerCase().includes(q) ? '' : 'none'; });
  };
  const links = $$('a', side);
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) links.forEach((l) => l.classList.toggle('on', l.getAttribute('href') === '#' + e.target.id)); }), { rootMargin: '-15% 0px -75% 0px' });
  $$('main section[data-group]').forEach((s) => io.observe(s));
}

/* ------------------------------------------------- 1. the system at a glance */
const SYSTEM = {
  browser: { name: 'Browser or phone', kind: 'web', where: 'On the visitor\'s device', repo: '', port: '', text: 'Runs the HTML, CSS and JavaScript the web app sends. Holds the sign-in cookies (httpOnly, so scripts cannot read them). Uses the camera and location when the user allows it.', talks: 'The web app (:3000) and the public site.' },
  web: { name: 'Web app (Next.js)', kind: 'web', where: 'mpd-frontend', repo: 'mpd-frontend', port: '3000', text: 'The signed-in app: customer portal and staff console. Builds pages on the server, keeps the session in cookies, and calls the API on behalf of the signed-in person through server actions. It never talks to the database.', talks: 'The API over HTTP.' },
  site: { name: 'Public website (Next.js)', kind: 'web', where: 'mpd-global', repo: 'mpd-global', port: '3001 (dev)', text: 'The public marketing site. No sign-in. Its content (services, FAQs, team) comes from the API\'s public content routes, and it is refreshed when an admin saves content.', talks: 'The API\'s public routes.' },
  api: { name: 'API (NestJS)', kind: 'api', where: 'mpd-backend, src/main.ts', repo: 'mpd-backend', port: '4000', text: 'The brain. Every rule lives here: who may do what, prices, status changes, money. Answers each request with JSON. Self-describes at /docs and in openapi.json.', talks: 'PostgreSQL and file storage.' },
  worker: { name: 'Worker (NestJS)', kind: 'worker', where: 'mpd-backend, src/worker.ts', repo: 'mpd-backend', port: 'none', text: 'A second program from the same repo. It listens to nobody; it wakes on a timetable and does background jobs: sends the email outbox every minute, sweeps for reminders every 10 minutes. See the worker section.', talks: 'PostgreSQL only (the queue and the data).' },
  db: { name: 'PostgreSQL 16', kind: 'db', where: 'Docker container (dev), server container (production)', repo: 'schema in mpd-backend/prisma', port: '5433 (dev)', text: 'The permanent memory, and also the worker\'s queue (pg-boss keeps its tables in a separate schema called pgboss). The database enforces rules too: foreign keys, check constraints, partial unique indexes.', talks: 'Used by the API and the worker.' },
  files: { name: 'File storage', kind: 'db', where: 'Local folder (dev), private S3 (launch)', repo: 'src/common/storage', port: '', text: 'Photos, documents and payment proofs. Behind a Storage interface so the local folder can be swapped for S3 without changing callers. Files are opened only through links that expire in 5 minutes.', talks: 'Used by the API.' },
  mail: { name: 'Email sender', kind: 'worker', where: 'Mailer port (console today, SES later)', repo: 'src/modules/identity/mailer.ts', port: '', text: 'The worker hands each email to the Mailer. Today it prints to the console; at the AWS step an SES sender replaces it with no other code change.', talks: 'Called by the worker (and a few sign-in emails by the API).' },
};
const SYS_LAYOUT = [
  ['browser', 20, 20, 150, 54], ['web', 230, 20, 170, 54], ['site', 230, 110, 170, 54],
  ['api', 460, 65, 150, 54], ['worker', 460, 190, 150, 54], ['db', 690, 65, 150, 54], ['files', 690, 150, 150, 54], ['mail', 690, 235, 150, 54],
];
const SYS_EDGES = [['browser', 'web'], ['browser', 'site'], ['web', 'api'], ['site', 'api'], ['api', 'db'], ['api', 'files'], ['worker', 'db'], ['worker', 'mail']];
function drawSystem(host, info) {
  const svg = svgEl('svg', { viewBox: '0 0 860 310', role: 'img', 'aria-label': 'System diagram' });
  const pos = Object.fromEntries(SYS_LAYOUT.map(([k, x, y, w, h]) => [k, { x, y, w, h }]));
  const edgeEls = SYS_EDGES.map(([a, b]) => {
    const A = pos[a], B = pos[b];
    const e = svgEl('path', { class: 'edge', d: `M${A.x + A.w},${A.y + A.h / 2} C${A.x + A.w + 40},${A.y + A.h / 2} ${B.x - 40},${B.y + B.h / 2} ${B.x},${B.y + B.h / 2}` });
    svg.appendChild(e); return [a, b, e];
  });
  for (const [k, x, y, w, h] of SYS_LAYOUT) {
    const g = svgEl('g', { class: `node t-${SYSTEM[k].kind}`, tabindex: 0, role: 'button', 'aria-label': SYSTEM[k].name });
    g.appendChild(svgEl('rect', { x, y, width: w, height: h, rx: 10 }));
    g.appendChild(svgEl('text', { x: x + w / 2, y: y + h / 2 - 2, 'text-anchor': 'middle' }, SYSTEM[k].name));
    if (SYSTEM[k].port) g.appendChild(svgEl('text', { x: x + w / 2, y: y + h / 2 + 14, 'text-anchor': 'middle', class: 'small' }, 'port ' + SYSTEM[k].port));
    const pick = () => {
      $$('.node', svg).forEach((n) => n.classList.remove('on')); g.classList.add('on');
      edgeEls.forEach(([a, b, e]) => e.classList.toggle('hot', a === k || b === k));
      const s = SYSTEM[k];
      info.innerHTML = `<h4>${esc(s.name)}</h4><p>${esc(s.text)}</p><p><span class="pill">where</span> ${esc(s.where)}${s.port ? ` <span class="pill">port</span> ${esc(s.port)}` : ''}</p><p><span class="pill">talks to</span> ${esc(s.talks)}</p>`;
    };
    g.onclick = pick; g.onkeydown = (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(); } };
    svg.appendChild(g);
    if (k === 'api') setTimeout(pick, 0);
  }
  host.appendChild(svg);
}

/* ------------------------------------------------------ 2. technology cards */
const TECH = [
  { id: 'node', n: 'Node.js and TypeScript', s: 'The language and the engine', what: 'Node.js runs JavaScript outside a browser, so the API, the worker and the web app server are all Node programs. TypeScript is JavaScript with types written next to the code (for example <code>amountPaise: number</code>). A compiler checks the types before the program ever runs, which catches a whole class of mistakes.', why: 'One language across backend and frontend, and the types let the compiler check that the frontend and the API agree.', where: 'Every <code>.ts</code> and <code>.tsx</code> file. <code>tsconfig.json</code> sets strict mode in each repo.', spot: 'File ends in <code>.ts</code> (plain code) or <code>.tsx</code> (code with screen markup).' },
  { id: 'next', n: 'Next.js (App Router)', s: 'The web framework', what: 'A framework built on React. You create a folder, add a <code>page.tsx</code>, and that folder is a web address. Pages are built on the server first, then sent to the browser. Layouts wrap pages (menu, top bar). It also provides server actions (functions the browser can trigger that run on the server) and middleware (a guard that runs before a page).', why: 'It gives routing, server rendering and a safe place for secrets (the server) without us wiring it ourselves.', where: '<code>mpd-frontend/app/</code> (routes), <code>src/components/</code> (screen pieces), <code>src/actions/</code> (server actions), <code>middleware.ts</code>.', spot: 'Folder names are addresses. <code>(console)</code> in brackets groups pages without changing the address.' },
  { id: 'react', n: 'React', s: 'Screens made of components', what: 'You build screens from small reusable functions called components. A component returns markup and can hold state (<code>useState</code>) and react to events. When state changes React redraws only what changed.', why: 'Complex screens (a job board with dialogs, chat, uploads) stay manageable as a tree of small pieces.', where: 'Everything in <code>src/components/</code>. Files that start with <code>\'use client\'</code> run in the browser.', spot: 'A function whose name starts with a capital letter and returns markup.' },
  { id: 'tailwind', n: 'Tailwind CSS', s: 'Styling with small classes', what: 'Instead of writing a stylesheet per component, you put short class names on the element: <code>btn btn-primary !h-12</code>. A few shared ones (<code>btn</code>, <code>card</code>, <code>field-input</code>) are defined once in <code>app/globals.css</code> with the brand colours.', why: 'Looks stay consistent and a change to a colour is one edit.', where: '<code>app/globals.css</code> and the <code>className</code> on elements.', spot: 'Long <code>className</code> strings.' },
  { id: 'nest', n: 'NestJS', s: 'The backend framework', what: 'A framework that gives every kind of backend code a fixed place. <b>Modules</b> group an area (jobs, orders). <b>Controllers</b> receive requests at addresses. <b>Services</b> hold the rules. <b>Providers</b> are anything Nest can hand to a class that asks for it ("dependency injection"). <b>DTOs</b> describe what a request must look like. <b>Guards</b> decide who may enter.', why: 'With many developers and many areas, a fixed structure stops the code becoming a tangle, and Nest generates the API description (Swagger) from the same decorators.', where: '<code>mpd-backend/src/modules/&lt;area&gt;/</code>. Each module has <code>*.module.ts</code>, <code>*.controller.ts</code>, <code>*.service.ts</code> and <code>dto/</code>.', spot: 'Lines starting with <code>@</code> (decorators) such as <code>@Controller</code>, <code>@Post</code>, <code>@Injectable</code>.' },
  { id: 'di', n: 'Dependency injection', s: 'How classes get what they need', what: 'A class lists what it needs in its constructor (<code>private readonly prisma: PrismaService</code>). Nest creates one shared instance of each service and passes it in. You never write <code>new PrismaService()</code> yourself. For this to work a module must <b>import</b> the module that provides the service, and the provider must be <b>exported</b>.', why: 'It makes classes easy to test and swap (the Mailer is a port: console today, SES later, same callers).', where: 'Every <code>constructor(...)</code> in a service, and the <code>imports</code>/<code>providers</code>/<code>exports</code> lists in each <code>*.module.ts</code>.', spot: 'The error "Nest can\'t resolve dependencies of X" means a missing import or export.' },
  { id: 'prisma', n: 'Prisma', s: 'The database toolkit', what: 'You describe tables once in <code>prisma/schema.prisma</code>. Prisma generates a typed client (<code>prisma.job.findMany({ where: ... })</code>) so queries are checked by the compiler. It also generates migrations (see below).', why: 'No hand-written SQL strings in normal code, and typos in column names become compile errors.', where: '<code>prisma/schema.prisma</code>, and <code>this.prisma.&lt;model&gt;</code> in every service.', spot: 'After changing the schema run <code>prisma generate</code> (stop the API first on Windows).' },
  { id: 'pg', n: 'PostgreSQL', s: 'The database', what: 'A relational database: data lives in tables with typed columns, linked by foreign keys. We rely on its safety features: <b>foreign keys</b> (a job must point to a real property), <b>check constraints</b> (a rating is 1 to 5), <b>partial unique indexes</b> (only one open extra-work request per job), <b>transactions</b> (several changes succeed or fail together) and <b>enums</b> (a status can only be one of a fixed list).', why: 'Rules enforced in the database cannot be bypassed by a bug in the code. They are our last line of defence for money and ownership.', where: 'Migrations in <code>prisma/migrations/</code> hold the SQL, including the hand-written constraints.', spot: 'Dev database: Docker container <code>mpd-postgres-dev</code> on port 5433.' },
  { id: 'migrations', n: 'Migrations', s: 'Changing the database safely', what: 'A migration is a numbered SQL file (<code>20261125200000_job_chat</code>) that changes the database. They run in order and each runs once, so every machine ends with the same structure. Production applies them with <code>prisma migrate deploy</code>.', why: 'The database structure is versioned in git like code.', where: '<code>prisma/migrations/</code>. We write them by hand because they hold constraints Prisma cannot express, and because auto-generated ones tried to drop our hand-made foreign keys.', spot: 'Never run <code>migrate dev</code>; read any generated SQL for <code>DROP</code> before using it.' },
  { id: 'pgboss', n: 'pg-boss (the queue)', s: 'Background jobs inside Postgres', what: 'A library that stores a job queue in Postgres tables (schema <code>pgboss</code>). A worker takes jobs from named queues; a cron timetable can add a job on a schedule. Because it uses the database we already have there is no Redis to run.', why: 'One fewer server to pay for and operate at launch.', where: '<code>src/common/queue/queue.service.ts</code> and <code>src/worker.ts</code>. See the worker section.', spot: 'Names like <code>outbox.dispatch</code> and <code>reminders.sweep</code>.' },
  { id: 'openapi', n: 'OpenAPI and the generated client', s: 'The contract between backend and frontend', what: 'The backend describes every address, input and output in one file, <code>openapi.json</code>, produced from the decorators on controllers and DTOs. The frontend runs <code>pnpm api:generate</code> to turn that file into TypeScript types (<code>src/api/schema.d.ts</code>) and a typed client.', why: 'If the backend changes a field, the frontend fails to compile instead of failing in front of a customer.', where: 'Export: <code>pnpm openapi:export</code> in the backend. Use: <code>src/api/client.ts</code> and the <code>src/actions/*.ts</code> files.', spot: 'Change order is always: backend, export, generate, fix the frontend.' },
  { id: 'zod', n: 'Validation: class-validator and Zod', s: 'Never trust input', what: 'In the backend, DTO classes carry decorators like <code>@IsString() @MaxLength(1000)</code>. A global <code>ValidationPipe</code> rejects anything else with a 400 and strips unknown fields. The environment file is checked at start-up with Zod and the app refuses to start if a setting is missing. The frontend uses Zod for form checks.', why: 'Bad input is refused at the door with a clear message, before any rule runs.', where: '<code>dto/*.ts</code>, <code>src/common/config/env.ts</code>, <code>src/lib/schemas.ts</code>.', spot: '<code>whitelist</code> and <code>forbidNonWhitelisted</code> are on: an unknown field is an error.' },
  { id: 'vitest', n: 'Vitest and supertest', s: 'Automated tests', what: 'Vitest runs the tests. supertest calls the real API in memory like a browser would. Our "end-to-end" tests start the whole app against a real test database, create their own data, call the endpoints as different roles, and check the answers and the stored rows.', why: 'They prove the rules, including every refusal, and they are the safety net when we change things.', where: '<code>mpd-backend/test/*.e2e-spec.ts</code>.', spot: '<code>pnpm test:e2e</code> runs every spec, one at a time.' },
  { id: 'pnpm', n: 'pnpm, Docker, git', s: 'Tooling', what: '<b>pnpm</b> installs packages (fast, disk-friendly). <b>Docker</b> runs Postgres in a sealed container so every machine has the same one. <b>git</b> versions the code; each of the 8 folders is its own repository.', why: 'A new machine can be set up from the docs and reach the same state.', where: '<code>docker-compose.dev.yml</code>, <code>package.json</code> scripts, <code>mpd-handbook-developer/workspace/NEW-MACHINE.md</code>.', spot: '' },
];

/* ---------------------------------------------------------- 3. request tracer */
const TRACKS = {
  action: {
    label: 'Do something (a button press)',
    title: 'The worker taps "Send for approval" on extra work',
    steps: [
      { lane: 'browser', t: 'The tap', d: 'The <code>ExtraWork</code> component (it runs in the browser) handles the click and calls the server action <code>submitExtra(jobId, extraId)</code>.', f: 'mpd-frontend/src/components/jobs/ExtraWork.tsx' },
      { lane: 'web', t: 'Middleware, then the server action', d: 'The request reaches the Next.js server. <code>middleware.ts</code> checks the sign-in cookie exists. The server action runs <b>on the server</b>: it cannot be read or changed by the visitor.', f: 'mpd-frontend/middleware.ts, src/actions/jobs.ts' },
      { lane: 'web', t: 'call() adds the pass', d: '<code>call()</code> reads the access token from the httpOnly cookie and sends the request. If the API says 401 (expired) it swaps the refresh token for a new pair once and retries.', f: 'mpd-frontend/src/lib/server-api.ts' },
      { lane: 'api', t: 'The request pipeline', d: 'Helmet adds security headers, the throttler counts requests, the global <code>AuthGuard</code> verifies the token and checks the role, and the <code>ValidationPipe</code> checks the body against the DTO.', f: 'mpd-backend/src/setup.ts, src/common/auth/auth.guard.ts' },
      { lane: 'api', t: 'The controller', d: 'It only routes: <code>POST /v1/jobs/:id/extras/:extraId/submit</code> goes to <code>JobExtrasService.submit</code>. No rules here.', f: 'mpd-backend/src/modules/jobs/job-extras.controller.ts' },
      { lane: 'api', t: 'The service applies the rules', d: 'Is this the assigned worker? Is the job in progress? Is there a photo? Is the total over half the job price (so a sign-off is needed)? Every decision is made here and nowhere else.', f: 'mpd-backend/src/modules/jobs/job-extras.service.ts' },
      { lane: 'api', t: 'The status gate', d: '<code>assertTransition</code> checks that "in progress to awaiting extra payment" is on the list of allowed moves.', f: 'mpd-backend/src/modules/jobs/job-state.ts' },
      { lane: 'db', t: 'One guarded transaction', d: 'Prisma updates the job and the request together: <code>updateMany where status = IN_PROGRESS</code>. If someone changed the job a moment ago the count is 0 and nothing changes. The database also enforces "one open request per job".', f: 'prisma/schema.prisma, migration 20261124100000_job_extras' },
      { lane: 'api', t: 'History, audit, notification', d: 'A line goes to <code>job_events</code> and the audit log; <code>notify()</code> tells the customer (or the provider) and never fails the caller.', f: 'JobsService.event, AuditService.record, NotificationsService.notify' },
      { lane: 'web', t: 'The answer returns', d: 'The API returns the updated request. The server action returns "ok with data" or "failed with a message" (never a raw error).', f: 'mpd-frontend/src/lib/server-api.ts' },
      { lane: 'browser', t: 'The screen updates', d: 'The component reloads its list; the badge changes and the worker\'s buttons go away.', f: 'ExtraWork.tsx' },
    ],
  },
  page: {
    label: 'Open a page (read data)',
    title: 'A customer opens "Service requests"',
    steps: [
      { lane: 'browser', t: 'The address', d: 'The browser asks the web app for <code>/jobs</code>.', f: 'URL /jobs' },
      { lane: 'web', t: 'Middleware', d: 'If there is no access cookie but a refresh cookie, the middleware swaps tokens once (not on prefetches, which would trip token-reuse detection) and continues. No cookies at all: redirect to login.', f: 'mpd-frontend/middleware.ts' },
      { lane: 'web', t: 'Layout and page', d: '<code>app/(portal)/layout.tsx</code> draws the shell (menu, bell). <code>app/(portal)/jobs/page.tsx</code> renders <code>MyJobs</code>, a client component, which will fetch its data.', f: 'mpd-frontend/app/(portal)/jobs/page.tsx' },
      { lane: 'browser', t: 'The component asks for data', d: '<code>MyJobs</code> calls the server action <code>loadMyJobs()</code> as soon as it appears.', f: 'mpd-frontend/src/components/jobs/MyJobs.tsx' },
      { lane: 'api', t: 'API: scope by owner', d: '<code>GET /v1/me/jobs</code>. The service finds the customer for this token and selects only jobs <b>they purchased</b>. Another customer\'s job would simply not be in the list (and asking for it by id gives a 404).', f: 'mpd-backend/src/modules/jobs/jobs.service.ts (mine)' },
      { lane: 'db', t: 'Queries', d: 'Prisma runs the selects. <code>sync()</code> first turns newly paid order lines into jobs (safe to run any number of times).', f: 'JobsService.sync, customerDtos' },
      { lane: 'api', t: 'Shape the answer', d: 'Rows become a DTO the customer may see: no internal ids of other people, first names only in chat, a plain-words "stage".', f: 'dto/jobs.dto.ts (CustomerJobDto)' },
      { lane: 'browser', t: 'Draw', d: 'The component stores the list in state and React draws the cards.', f: 'MyJobs.tsx' },
    ],
  },
};
function drawTracer(host) {
  tabs(host, Object.entries(TRACKS).map(([k, v]) => ({ label: v.label, k })), (it) => {
    const tr = TRACKS[it.k];
    return `<h4>${esc(tr.title)}</h4><div id="trace-${it.k}"></div><div style="margin-top:10px"><button class="btn" data-a="prev">Back</button> <button class="btn pri" data-a="next">Next step</button> <span class="tcount" style="margin-left:8px;color:var(--muted)"></span></div>`;
  });
  let cur = 'action', i = 0;
  const render = () => {
    const tr = TRACKS[cur];
    const box = $(`#trace-${cur}`, host);
    if (!box) return;
    box.innerHTML = tr.steps.map((s, n) => `<div class="lane" style="opacity:${n <= i ? 1 : .28}"><div class="who ${s.lane}">${{ browser: 'Browser', web: 'Web app server', api: 'API', db: 'Database' }[s.lane]}</div><div ${n === i ? 'style="border-left:4px solid var(--pri);padding-left:10px"' : ''}><b>${n + 1}. ${esc(s.t)}</b><br>${s.d}<br><span class="pill">file</span><code>${esc(s.f)}</code></div></div>`).join('');
    const c = $('.tcount', host); if (c) c.textContent = `Step ${i + 1} of ${tr.steps.length}`;
  };
  host.addEventListener('click', (e) => {
    const t = e.target;
    if (t.matches('.tabs button')) { cur = Object.keys(TRACKS)[$$('.tabs button', host).indexOf(t)]; i = 0; setTimeout(render, 0); }
    if (t.dataset.a === 'next') { i = Math.min(TRACKS[cur].steps.length - 1, i + 1); render(); }
    if (t.dataset.a === 'prev') { i = Math.max(0, i - 1); render(); }
  });
  setTimeout(render, 0);
}

/* -------------------------------------------------------- 4. module graph */
const MODS = {
  identity: { deps: [], tables: ['users', 'user_roles', 'otp_challenges', 'refresh_tokens'], does: 'Sign-up, sign-in, tokens, passwords (argon2id), OTP by email, user profile, the Mailer port. Many modules import it to look up users.' },
  masters: { deps: [], tables: ['states', 'districts', 'cities', 'pincodes', 'area_units', 'property_types', 'property_attributes'], does: 'Reference lists: geography, pincodes (and whether each is switched on), property types and the extra details each type asks for.' },
  'orgs-territory': { deps: ['identity', 'masters'], tables: ['organisations', 'territories', 'territory_pincodes', 'staff_invites', 'provider_franchise_links'], does: 'The organisation tree (MPD, master franchise, franchise, provider), territories as groups of pincodes, the overlap rules, staff invitations, providers linked to several franchises.' },
  'customers-properties': { deps: ['identity', 'masters', 'orgs-territory'], tables: ['customers', 'properties', 'projects', 'property_parties'], does: 'Customers (property owner or project owner), their properties, projects and units, who is the owner of a unit.' },
  catalogue: { deps: ['customers-properties', 'masters', 'orgs-territory'], tables: ['service_categories', 'service_sub_categories', 'services', 'rate_types', 'price_books', 'service_prices', 'plans', 'plan_items'], does: 'The service catalogue, price books, plans and the one place prices are computed (PricingService, including the site-visit-first gate).' },
  content: { deps: ['catalogue'], tables: ['content_blocks', 'faqs', 'testimonials', 'team_members', 'media'], does: 'Everything the public website shows, edited by admins, plus the lists the website reads. Saving triggers a refresh of the public site.' },
  vault: { deps: ['customers-properties', 'identity', 'messaging'], tables: ['folders', 'documents', 'document_versions', 'document_shares', 'document_access_logs'], does: 'The document vault: folders, versions, upload checks, 5-minute access links, shares, locked system documents (job photos), expiry reminders.' },
  kyc: { deps: ['customers-properties', 'vault'], tables: ['kyc_records'], does: 'Identity verification of customers: documents, review by operations, masked Aadhaar only.' },
  assignments: { deps: ['customers-properties', 'vault', 'identity'], tables: ['property_assignments', 'assignment_documents'], does: 'A project owner registers a property owner for a unit with proof documents; operations review; invitation; acceptance.' },
  orders: { deps: ['catalogue', 'customers-properties', 'vault', 'identity', 'masters', 'messaging'], tables: ['orders', 'order_lines', 'order_events', 'order_batches', 'subscriptions', 'entitlements', 'payments', 'site_visits'], does: 'Orders, the purchaser rule, plans and subscriptions, batches, offline payments with maker-checker, the mandatory site visit, extra-work orders.' },
  onboarding: { deps: ['customers-properties', 'identity', 'masters', 'orgs-territory', 'orders', 'catalogue'], tables: ['onboarding_cases', 'case_events', 'case_notes', 'quotations', 'quotation_lines'], does: 'From website inquiry to a paying customer: cases by area, paid site visit, a priced offer, acceptance creates the order.' },
  'provider-services': { deps: ['catalogue', 'identity', 'orgs-territory'], tables: ['provider_services', 'worker_services'], does: 'Which services a provider offers and which of those each worker can do.' },
  jobs: { deps: ['orders', 'catalogue', 'customers-properties', 'identity', 'orgs-territory', 'provider-services', 'vault', 'messaging'], tables: ['jobs', 'job_events', 'job_declines', 'job_otps', 'service_checklists', 'job_steps', 'job_evidence', 'job_extras', 'job_messages', 'job_message_reads'], does: 'The pool and first-accept-wins, assigning workers, doing the work with customer codes, checklists and photos, extra work, chat on a job.' },
  legal: { deps: ['catalogue', 'customers-properties', 'vault', 'identity', 'messaging', 'orders', 'jobs', 'orgs-territory', 'provider-services', 'masters'], tables: ['service_intake_forms', 'legal_requests', 'legal_request_documents', 'legal_offers', 'legal_request_events', 'legal_cases', 'legal_case_declines', 'legal_case_events', 'legal_case_messages', 'legal_case_reads'], does: 'Legal and professional services: the versioned form and checklist of each service, the customer\'s request (a private draft sent for review), operations\' review (ask for more, a priced offer, refuse), the order made when the customer accepts, and the legal case: a paid order waits in a pool for legal providers (first to accept wins), who work it and message the customer. Progress steps and delivery arrive in M7.4.' },
  earnings: { deps: ['jobs', 'catalogue', 'orgs-territory', 'identity', 'messaging'], tables: ['commission_rules', 'earnings', 'payouts'], does: 'Partner earnings: the share each level earns from a closed job, the earnings ledger and payouts with maker-checker. Earns by a sweep (the jobs module cannot call it).' },
  reports: { deps: ['jobs', 'orders', 'customers-properties', 'orgs-territory', 'masters', 'identity'], tables: [], does: 'Dashboards and reports, read only. Asks jobs (JobStatsService) and orders (moneyStats) for their numbers, scopes them by the asker\'s role, and exports the jobs as a spreadsheet. Owns no tables.' },
  messaging: { deps: ['identity'], tables: ['outbox', 'notifications', 'notification_preferences'], does: 'Notifications: the in-app inbox, the email outbox with retries, preferences, message templates.' },
  reminders: { deps: ['jobs', 'orders', 'vault', 'messaging'], tables: [], does: 'The scheduled sweep: asks jobs, orders, plans and the vault to remind about what each owns. Owns no tables.' },
  health: { deps: [], tables: [], does: 'A /health route for uptime checks.' },
};
function drawModules(host, info) {
  const names = Object.keys(MODS);
  // layered layout: a module sits one column right of its deepest dependency
  const depth = {};
  const d = (n) => depth[n] ??= MODS[n].deps.length ? 1 + Math.max(...MODS[n].deps.map(d)) : 0;
  names.forEach(d);
  const cols = {};
  names.forEach((n) => (cols[depth[n]] ||= []).push(n));
  const W = 150, H = 34, gx = 38, gy = 14;
  const maxRows = Math.max(...Object.values(cols).map((c) => c.length));
  const svg = svgEl('svg', { viewBox: `0 0 ${(Object.keys(cols).length) * (W + gx)} ${maxRows * (H + gy) + 10}`, role: 'img', 'aria-label': 'Module dependency graph' });
  const pos = {};
  Object.entries(cols).forEach(([c, list]) => list.forEach((n, r) => { pos[n] = { x: c * (W + gx) + 4, y: r * (H + gy) + 6 }; }));
  const edges = [];
  for (const n of names) for (const dep of MODS[n].deps) {
    const A = pos[dep], B = pos[n];
    const p = svgEl('path', { class: 'edge', d: `M${A.x + W},${A.y + H / 2} C${A.x + W + 22},${A.y + H / 2} ${B.x - 22},${B.y + H / 2} ${B.x},${B.y + H / 2}` });
    svg.appendChild(p); edges.push([dep, n, p]);
  }
  for (const n of names) {
    const g = svgEl('g', { class: 'node', tabindex: 0, role: 'button', 'aria-label': n });
    g.appendChild(svgEl('rect', { x: pos[n].x, y: pos[n].y, width: W, height: H, rx: 8 }));
    g.appendChild(svgEl('text', { x: pos[n].x + W / 2, y: pos[n].y + H / 2 + 4, 'text-anchor': 'middle' }, n));
    const pick = () => {
      $$('.node', svg).forEach((x) => x.classList.remove('on')); g.classList.add('on');
      edges.forEach(([a, b, p]) => p.classList.toggle('hot', a === n || b === n));
      const m = MODS[n];
      const users = names.filter((x) => MODS[x].deps.includes(n));
      info.innerHTML = `<h4>${esc(n)}</h4><p>${esc(m.does)}</p><p><span class="pill">imports</span> ${m.deps.length ? m.deps.map((x) => `<code>${x}</code>`).join(' ') : 'nothing'}</p><p><span class="pill">imported by</span> ${users.length ? users.map((x) => `<code>${x}</code>`).join(' ') : 'nothing'}</p><p><span class="pill db">tables</span> ${m.tables.length ? m.tables.map((x) => `<code>${x}</code>`).join(' ') : 'none'}</p>`;
    };
    g.onclick = pick; g.onkeydown = (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(); } };
    svg.appendChild(g);
    if (n === 'jobs') setTimeout(pick, 0);
  }
  host.appendChild(svg);
}

/* --------------------------------------------------------- 10. state machines */
const MACHINES = {
  job: { label: 'Job', file: 'mpd-backend/src/modules/jobs/job-state.ts', note: 'The only place that says which moves are allowed. Every move is written to job_events. Once work has started a job can no longer be cancelled.',
    nodes: ['REQUESTED', 'ACCEPTED', 'ASSIGNED', 'EN_ROUTE', 'STARTED', 'IN_PROGRESS', 'AWAITING_EXTRA_PAYMENT', 'WORK_DONE', 'VERIFIED', 'CLOSED', 'CANCELLED'],
    moves: { REQUESTED: ['ACCEPTED', 'CANCELLED', 'CLOSED'], ACCEPTED: ['ASSIGNED', 'REQUESTED', 'CANCELLED', 'CLOSED'], ASSIGNED: ['ASSIGNED', 'EN_ROUTE', 'STARTED', 'ACCEPTED', 'REQUESTED', 'CANCELLED', 'CLOSED'], EN_ROUTE: ['STARTED', 'ACCEPTED', 'CANCELLED'], STARTED: ['IN_PROGRESS'], IN_PROGRESS: ['WORK_DONE', 'AWAITING_EXTRA_PAYMENT'], AWAITING_EXTRA_PAYMENT: ['IN_PROGRESS'], WORK_DONE: ['VERIFIED', 'IN_PROGRESS'], VERIFIED: ['CLOSED'], CLOSED: [], CANCELLED: [] },
    who: { REQUESTED: 'In the pool. Created when an order is paid, or a plan visit is requested.', ACCEPTED: 'A provider took it (first to accept wins), or the upline gave it to one.', ASSIGNED: 'The provider gave it to one of its workers.', EN_ROUTE: 'The worker said they are on the way.', STARTED: 'The customer\'s start code was entered. Passes straight on to IN_PROGRESS.', IN_PROGRESS: 'Work is happening: checklist, photos, extra work.', AWAITING_EXTRA_PAYMENT: 'The worker asked for more work; waiting for sign-off, approval and payment.', WORK_DONE: 'The customer\'s finish code was entered; waiting for the provider to check.', VERIFIED: 'Checked by the provider or operations; the customer can rate.', CLOSED: 'Rated or closed. Finished.', CANCELLED: 'Cancelled before work started.' } },
  extra: { label: 'Extra-work request', file: 'mpd-backend/src/modules/jobs/job-extras.service.ts', note: 'One open request per job is enforced by a partial unique index in the database. The job status changes in step with these.',
    nodes: ['DRAFT', 'PENDING_SIGNOFF', 'PENDING_APPROVAL', 'AWAITING_PAYMENT', 'PAID', 'DECLINED', 'WITHDRAWN', 'CANCELLED'],
    moves: { DRAFT: ['PENDING_SIGNOFF', 'PENDING_APPROVAL', 'WITHDRAWN', 'CANCELLED'], PENDING_SIGNOFF: ['PENDING_APPROVAL', 'WITHDRAWN', 'CANCELLED'], PENDING_APPROVAL: ['AWAITING_PAYMENT', 'DECLINED', 'WITHDRAWN', 'CANCELLED'], AWAITING_PAYMENT: ['PAID', 'CANCELLED'], PAID: [], DECLINED: [], WITHDRAWN: [], CANCELLED: [] },
    who: { DRAFT: 'The worker is writing it and adding photos.', PENDING_SIGNOFF: 'Over 50% of the job price (or no known price): a provider admin or operations check it first.', PENDING_APPROVAL: 'Waiting for the customer to approve or decline.', AWAITING_PAYMENT: 'Approved; an order exists and waits for an approved payment.', PAID: 'The order is paid; the job goes back to IN_PROGRESS.', DECLINED: 'The customer said no; work continues as first agreed.', WITHDRAWN: 'The worker took it back.', CANCELLED: 'Cancelled by provider or operations, or the customer cancelled the order.' } },
  order: { label: 'Order', file: 'mpd-backend/src/modules/orders/orders.service.ts', note: 'An order becomes PAID in exactly one way: an approved payment calls OrdersService.markPaid.',
    nodes: ['PENDING_PAYMENT', 'PAID', 'CANCELLED'], moves: { PENDING_PAYMENT: ['PAID', 'CANCELLED'], PAID: [], CANCELLED: [] }, who: { PENDING_PAYMENT: 'Placed and priced; waiting for payment.', PAID: 'An approved payment exists.', CANCELLED: 'Cancelled while unpaid (not allowed if a payment is waiting for approval).' } },
  payment: { label: 'Payment', file: 'mpd-backend/src/modules/orders/payments.service.ts', note: 'Maker-checker: the person who records a payment can never approve or reject it (service check and a database rule).',
    nodes: ['PROOF_SUBMITTED', 'APPROVED', 'REJECTED', 'WITHDRAWN'], moves: { PROOF_SUBMITTED: ['APPROVED', 'REJECTED', 'WITHDRAWN'], APPROVED: [], REJECTED: [], WITHDRAWN: [] }, who: { PROOF_SUBMITTED: 'Recorded by one admin with proof; waiting for a different admin.', APPROVED: 'Checked by someone else; marks the order(s) paid in the same transaction.', REJECTED: 'Refused with a reason; the order stays unpaid.', WITHDRAWN: 'The recorder took it back.' } },
  outbox: { label: 'Outbox message', file: 'mpd-backend/src/modules/messaging/outbox.service.ts', note: 'A failed send goes back to PENDING with a later send time (2, 4, 8, 16 minutes). After five tries it is FAILED.',
    nodes: ['PENDING', 'SENDING', 'SENT', 'FAILED'], moves: { PENDING: ['SENDING'], SENDING: ['SENT', 'PENDING', 'FAILED'], SENT: [], FAILED: [] }, who: { PENDING: 'Waiting for its send time.', SENDING: 'A worker claimed it (one guarded update, so two workers never send twice).', SENT: 'Delivered to the Mailer.', FAILED: 'Gave up after five tries; the last error is kept.' } },
  payout: { label: 'Payout', file: 'mpd-backend/src/modules/earnings/earnings.service.ts', note: 'Maker-checker again: the person who records a payout can never approve or refuse it (service check and a database CHECK). Refusing or withdrawing sends its earnings back to ACCRUED.',
    nodes: ['PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'WITHDRAWN'], moves: { PENDING_APPROVAL: ['APPROVED', 'REJECTED', 'WITHDRAWN'], APPROVED: [], REJECTED: [], WITHDRAWN: [] }, who: { PENDING_APPROVAL: 'Recorded with a bank reference; waiting for a different admin. Its earnings are IN_PAYOUT.', APPROVED: 'Checked; its earnings are PAID and the organisation is told.', REJECTED: 'Refused with a reason; the earnings are ACCRUED again.', WITHDRAWN: 'Taken back by the person who recorded it.' } },
  earning: { label: 'Earning', file: 'mpd-backend/src/modules/earnings/earnings.service.ts', note: 'One row per level per closed job (a unique index stops a second one). A database CHECK ties the status to the payout: ACCRUED has none, the others must have one.',
    nodes: ['ACCRUED', 'IN_PAYOUT', 'PAID'], moves: { ACCRUED: ['IN_PAYOUT'], IN_PAYOUT: ['PAID', 'ACCRUED'], PAID: [] }, who: { ACCRUED: 'Earned, waiting to be paid.', IN_PAYOUT: 'In a payout that waits for approval.', PAID: 'The payout was approved.' } },
  legal: { label: 'Legal request', file: 'mpd-backend/src/modules/legal/legal-requests.service.ts', note: 'A private draft until sent. Operations can ask for more (the request becomes editable again) and send a priced offer; the customer accepts (an order is made) or declines. A cancelled order closes the request.',
    nodes: ['DRAFT', 'SUBMITTED', 'NEEDS_INFO', 'QUOTED', 'ACCEPTED', 'DECLINED', 'REJECTED', 'WITHDRAWN'], moves: { DRAFT: ['SUBMITTED', 'WITHDRAWN'], SUBMITTED: ['NEEDS_INFO', 'QUOTED', 'REJECTED', 'WITHDRAWN'], NEEDS_INFO: ['SUBMITTED', 'QUOTED', 'REJECTED', 'WITHDRAWN'], QUOTED: ['QUOTED', 'NEEDS_INFO', 'ACCEPTED', 'DECLINED', 'REJECTED', 'WITHDRAWN'], ACCEPTED: ['DECLINED'], DECLINED: [], REJECTED: [], WITHDRAWN: [] },
    who: { DRAFT: 'Private to the customer; the form version is kept.', SUBMITTED: 'Sent; waiting for operations.', NEEDS_INFO: 'Operations asked for more; the customer can edit and send again.', QUOTED: 'A priced offer is open (one at a time; a new one replaces it).', ACCEPTED: 'The customer accepted; an order waits for payment.', DECLINED: 'The customer declined, or cancelled the order.', REJECTED: 'Operations cannot take it (a reason is shown).', WITHDRAWN: 'The customer withdrew it.' } },
  legalcase: { label: 'Legal case', file: 'mpd-backend/src/modules/legal/legal-cases.service.ts', note: 'Made from an accepted legal request once its order is PAID (lazily, never from the payment code). The pool works like the job pool; the provider is the organisation itself.',
    nodes: ['OPEN', 'ACCEPTED', 'IN_PROGRESS', 'CANCELLED'], moves: { OPEN: ['ACCEPTED', 'CANCELLED'], ACCEPTED: ['OPEN', 'IN_PROGRESS', 'CANCELLED'], IN_PROGRESS: ['CANCELLED'], CANCELLED: [] },
    who: { OPEN: 'In the pool: eligible providers see it without the customer. A case with no area is only handed out by operations.', ACCEPTED: 'A provider has it (the first to accept, or chosen by the upline). It can give it back.', IN_PROGRESS: 'The provider marked that work has begun (M7.4 adds progress steps and completion).', CANCELLED: 'Cancelled by operations; the chat is closed.' } },
  sub: { label: 'Subscription', file: 'mpd-backend/src/modules/orders/orders.service.ts', note: 'Starts when its order is paid; entitlements are a snapshot of the plan at the time of purchase.',
    nodes: ['PENDING_PAYMENT', 'ACTIVE', 'EXPIRED', 'CANCELLED'], moves: { PENDING_PAYMENT: ['ACTIVE', 'CANCELLED'], ACTIVE: ['EXPIRED'], EXPIRED: [], CANCELLED: [] }, who: { PENDING_PAYMENT: 'Bought; waiting for payment.', ACTIVE: 'Paid; visits can be requested until the end date.', EXPIRED: 'The end date passed.', CANCELLED: 'Cancelled before it began.' } },
};
function drawMachine(host, m) {
  const n = m.nodes, W = 168, H = 34, per = Math.min(4, Math.ceil(n.length / Math.ceil(n.length / 4)));
  const pos = {};
  n.forEach((s, i) => { pos[s] = { x: (i % per) * (W + 46) + 6, y: Math.floor(i / per) * 86 + 8 }; });
  const rows = Math.ceil(n.length / per);
  const svg = svgEl('svg', { viewBox: `0 0 ${per * (W + 46)} ${rows * 86 + 10}`, role: 'img', 'aria-label': 'State diagram' });
  const defs = svgEl('defs'); const mk = svgEl('marker', { id: 'ar', viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 7, markerHeight: 7, orient: 'auto-start-reverse' });
  mk.appendChild(svgEl('path', { d: 'M0,0 L10,5 L0,10 z', fill: 'currentColor', style: 'color:var(--muted)' })); defs.appendChild(mk); svg.appendChild(defs);
  const edges = [];
  for (const [a, list] of Object.entries(m.moves)) for (const b of list) {
    if (a === b) continue;
    const A = pos[a], B = pos[b];
    const ax = A.x + W / 2, ay = A.y + H / 2, bx = B.x + W / 2, by = B.y + H / 2;
    const dx = bx - ax, dy = by - ay, len = Math.hypot(dx, dy) || 1;
    const sx = ax + (dx / len) * Math.min(W / 2, Math.abs(dx) > 0 ? (W / 2) : H / 2), sy = ay + (dy / len) * (Math.abs(dy) > 0 ? H / 2 : 0);
    const ex = bx - (dx / len) * (Math.abs(dx) > 0 ? W / 2 : 0), ey = by - (dy / len) * (Math.abs(dy) > 0 ? H / 2 : 0);
    const bend = dy === 0 ? -18 : 0;
    const p = svgEl('path', { class: 'edge', d: `M${sx},${sy} Q${(sx + ex) / 2},${(sy + ey) / 2 + bend} ${ex},${ey}`, 'marker-end': 'url(#ar)' });
    svg.appendChild(p); edges.push([a, b, p]);
  }
  const info = document.createElement('div'); info.className = 'panel'; info.style.marginTop = '10px';
  for (const s of n) {
    const g = svgEl('g', { class: 'node', tabindex: 0, role: 'button', 'aria-label': s });
    g.appendChild(svgEl('rect', { x: pos[s].x, y: pos[s].y, width: W, height: H, rx: 8 }));
    g.appendChild(svgEl('text', { x: pos[s].x + W / 2, y: pos[s].y + H / 2 + 4, 'text-anchor': 'middle' }, s));
    const pick = () => {
      $$('.node', svg).forEach((x) => x.classList.remove('on')); g.classList.add('on');
      edges.forEach(([a, b, p]) => p.classList.toggle('hot', a === s));
      const out = m.moves[s].filter((x) => x !== s);
      info.innerHTML = `<b>${s}</b><p>${esc(m.who[s] || '')}</p><p><span class="pill">can move to</span> ${out.length ? out.map((x) => `<code>${x}</code>`).join(' ') : 'nothing (final)'}</p>`;
    };
    g.onclick = pick; g.onkeydown = (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(); } };
    svg.appendChild(g);
  }
  host.innerHTML = `<p class="lead">${esc(m.note)}</p><p><span class="pill">code</span><code>${esc(m.file)}</code></p>`;
  host.appendChild(svg); host.appendChild(info);
  info.innerHTML = '<p>Click a status to see what it means and where it can go.</p>';
}

/* ------------------------------------------------------ 7. worker simulator */
function workerSim(host) {
  host.innerHTML = `<div class="sim"><div><div class="tabs"><button class="btn" data-a="notify">1. Something happens (a job is assigned)</button><button class="btn" data-a="tick">2. Worker tick (a minute passes)</button><button class="btn" data-a="down">Mail server: <b>up</b></button><button class="btn" data-a="skip">Skip the wait</button><button class="btn" data-a="reset">Reset</button></div>
  <table><thead><tr><th>Outbox row</th><th>status</th><th>tries</th><th>send after</th></tr></thead><tbody id="sim-rows"></tbody></table><p class="small" style="color:var(--muted)">In-app notifications: <b id="sim-inapp">0</b> (made instantly, never waiting for the worker). Emails delivered: <b id="sim-sent">0</b>.</p></div><div><div class="logbox" id="sim-log"></div></div></div>`;
  let rows, clock, up, inapp, sent, n, log;
  const reset = () => { rows = []; clock = 0; up = true; inapp = 0; sent = 0; n = 0; log = ['Press 1 to create an event.']; draw(); };
  const say = (t) => { log.push(`[t+${clock}m] ${t}`); };
  const draw = () => {
    $('#sim-rows', host).innerHTML = rows.map((r) => `<tr><td>#${r.id}</td><td><span class="pill ${r.s === 'SENT' ? 'ok' : r.s === 'FAILED' ? 'bad' : r.s === 'SENDING' ? 'worker' : ''}">${r.s}</span></td><td>${r.tries}</td><td>${r.s === 'SENT' || r.s === 'FAILED' ? '-' : 't+' + r.after + 'm' + (r.after > clock ? ' (not yet)' : '')}</td></tr>`).join('') || '<tr><td colspan="4">empty</td></tr>';
    $('#sim-inapp', host).textContent = inapp; $('#sim-sent', host).textContent = sent;
    const lb = $('#sim-log', host); lb.innerHTML = log.map(esc).join('<br>'); lb.scrollTop = lb.scrollHeight;
    $('[data-a=down]', host).innerHTML = `Mail server: <b>${up ? 'up' : 'DOWN'}</b>`;
  };
  const tick = () => {
    clock += 1; say('The worker wakes (cron "* * * * *") and runs outbox.dispatch.');
    const due = rows.filter((r) => r.s === 'PENDING' && r.after <= clock);
    if (!due.length) say('Nothing is due. Goes back to sleep.');
    for (const r of due) {
      r.s = 'SENDING'; say(`Claims #${r.id} with one guarded update (status PENDING to SENDING). Another worker would get count 0 and skip it.`);
      if (up) { r.s = 'SENT'; r.tries += 1; sent += 1; say(`Mailer.send ok. #${r.id} is SENT.`); }
      else {
        r.tries += 1;
        if (r.tries >= 5) { r.s = 'FAILED'; say(`Mailer failed (try ${r.tries}). Gives up: #${r.id} is FAILED, error saved.`); }
        else { r.s = 'PENDING'; r.after = clock + 2 ** r.tries; say(`Mailer failed (try ${r.tries}). Back to PENDING, next try in ${2 ** r.tries} minutes.`); }
      }
    }
    draw();
  };
  host.addEventListener('click', (e) => {
    const a = e.target.closest('[data-a]')?.dataset.a; if (!a) return;
    if (a === 'reset') return reset();
    if (a === 'notify') { n += 1; inapp += 1; rows.push({ id: n, s: 'PENDING', tries: 0, after: clock }); say(`API: notify() writes the in-app notification now and outbox row #${n} (PENDING). The API request returns; it does not wait for email.`); }
    if (a === 'down') { up = !up; say(up ? 'The mail server is back.' : 'The mail server goes down.'); }
    if (a === 'tick') return tick();
    if (a === 'skip') { const next = rows.filter((r) => r.s === 'PENDING').map((r) => r.after); if (!next.length) say('Nothing is waiting.'); else { clock = Math.max(clock, Math.min(...next) - 1); say('Time passes...'); return tick(); } }
    draw();
  });
  reset();
}

/* ------------------------------------------------------------ 8. recipes */
const RECIPES = [
  { id: 'read', label: 'Read data (list or detail)', kind: 'Backend + frontend', intro: 'Anything that only fetches. The important part is <b>who may see which rows</b>.', steps: [
    ['Add a DTO for the answer', 'A class with <code>@ApiProperty()</code> on every field, in the module\'s <code>dto/</code> folder. The DTO is what the client gets; it is never the raw database row.', 'dto/*.dto.ts'],
    ['Write the service method', 'Find the caller\'s scope first (their customer, their organisation, their jobs) and put it in the <code>where</code>. Another person\'s record must come back as <b>404</b>, never 403, so ids cannot be probed.', '*.service.ts'],
    ['Add the controller route', '<code>@Get(\':id\')</code> with <code>@Roles(...)</code> naming which roles may call it, and <code>@ApiOkResponse({ type: Dto })</code> so Swagger and the contract are accurate.', '*.controller.ts'],
    ['Test the refusals', 'Test the role that must get 403, the other customer who must get 404, and the signed-out call that must get 401, as well as the happy path.', 'test/*.e2e-spec.ts'],
    ['Export and generate', '<code>pnpm openapi:export</code> then in the frontend <code>pnpm api:generate</code>.', 'openapi.json, src/api/schema.d.ts'],
    ['Frontend', 'A server action in <code>src/actions/</code> calling the generated client through <code>call()</code>, then a component that calls the action and shows the data (with loading and error states).', 'src/actions, src/components'],
  ], code: `// service: scope first, DTO out
async mine(userId: string): Promise<CustomerJobDto[]> {
  const c = await this.customers.ensureCustomer(userId);
  const rows = await this.prisma.job.findMany({
    where: { purchasedByCustomerId: c.id },   // the scope
    orderBy: { createdAt: 'desc' }, take: 200,
  });
  return this.customerDtos(rows, userId);     // shape what they may see
}` },
  { id: 'write', label: 'Create or change data', kind: 'Backend + frontend', intro: 'A request that saves something. Validate, check permission, save, record who did it.', steps: [
    ['Input DTO with validation', 'Decorators from class-validator: <code>@IsString() @MaxLength(300)</code>. The global pipe rejects bad or unknown fields with a 400 before your code runs.', 'dto/*.dto.ts'],
    ['Permission', 'Role on the controller; ownership or organisation checks in the service (<code>PurchaserPolicy</code> for anything bought, <code>visibleJob</code> for jobs).', '*.service.ts'],
    ['Save inside one step', 'If several rows must change together use <code>prisma.$transaction</code>. If the change depends on current state, use a guarded <code>updateMany</code> (see state-machine recipe).', '*.service.ts'],
    ['Audit', '<code>audit.record({ actorId, action, entityType, entityId, meta })</code> so there is a trail of who did what.', 'AuditService'],
    ['Return the new state', 'Return the updated DTO so the screen can redraw without a second call.', ''],
  ], code: `async rename(userId: string, id: string, dto: RenameDto, a: Actor) {
  const thing = await this.ownThing(userId, id);          // 404 if not theirs
  await this.prisma.thing.update({ where: { id }, data: { name: dto.name.trim() } });
  await this.audit.record({ actorId: a.id, ip: a.ip, action: 'thing.rename', entityType: 'thing', entityId: id });
  return this.get(userId, id);
}` },
  { id: 'state', label: 'A status change (state machine)', kind: 'Backend', intro: 'Anything with a status that moves through steps (jobs, orders, extra work). Two people can click at once, so the move must be atomic.', steps: [
    ['List the allowed moves in one place', 'A table of <code>from -> [to...]</code> and an <code>assertTransition(from, to)</code> that throws 409 for anything else.', 'jobs/job-state.ts'],
    ['Check, then guarded update', '<code>updateMany({ where: { id, status: current }, data: { status: next } })</code>. If <code>count</code> is 0 someone else moved it first: answer 409 "just changed".', '*.service.ts'],
    ['Write the history', 'Add a row to the events table (<code>job_events</code>): who, from, to, why.', 'JobsService.event'],
    ['Side effects after, not before', 'Notifications and audit come after the guarded update succeeds, and never fail the request.', ''],
    ['Test the race', 'Call the endpoint twice; exactly one must win.', 'test/*.e2e-spec.ts'],
  ], code: `assertTransition(job.status, JobStatus.ASSIGNED);            // is this move allowed?
const r = await this.prisma.job.updateMany({
  where: { id, status: job.status, providerOrgId: job.providerOrgId },  // still true?
  data: { status: JobStatus.ASSIGNED, workerUserId, assignedAt: new Date() },
});
if (r.count === 0) throw new ConflictException('This job was just changed');
await this.event(id, 'ASSIGNED_WORKER', job.status, JobStatus.ASSIGNED, userId, null);` },
  { id: 'money', label: 'Anything with money', kind: 'Backend', intro: 'Money is the most dangerous data. These rules are not optional.', steps: [
    ['Whole paise only', 'Store <code>*_paise</code> integers (Rs 1 = 100). Never floats. Show with <code>formatINR</code> in the frontend, <code>inr()</code> in messages.', 'src/lib/money.ts'],
    ['Compute on the server only', 'Prices come from <code>PricingService</code> (or the totals function for the feature). The client sends <i>what</i> it wants (service, quantity), never <i>how much</i>.', 'catalogue/pricing.service.ts'],
    ['Snapshot', 'Orders keep a copy of the quote they were sold at, so later price changes never alter an old order.', 'order_lines.quote'],
    ['Two people', 'A payment is recorded by one admin and approved by a different one. The approval marks the order paid in the same transaction.', 'orders/payments.service.ts'],
    ['The database as a backstop', 'CHECK constraints (<code>total_paise > 0</code>), foreign keys with RESTRICT on payments, partial unique indexes.', 'migrations'],
  ], code: `const total = items.reduce((n, i) => n + Math.round(i.quantity * i.unitPaise), 0);  // server decides
if (total > MAX_TOTAL_PAISE) throw new BadRequestException('The total is too large');` },
  { id: 'upload', label: 'A file upload', kind: 'Backend + frontend', intro: 'Photos, documents, payment proofs. Files are untrusted input.', steps: [
    ['Frontend sends multipart to a route, not a server action', 'Server actions are limited to about 1 MB, so the browser posts a <code>FormData</code> to a route under <code>app/api/...</code>, which forwards it to the API with the session token.', 'app/api/jobs/evidence/route.ts'],
    ['Controller accepts the file', '<code>@UseInterceptors(FileInterceptor(\'file\', { limits: { fileSize: 20 MB } }))</code>.', '*.controller.ts'],
    ['Check what it really is', 'The vault reads the first bytes (magic bytes) to know the true type, ignores the file name and the browser\'s claim, rejects duplicates, and runs the virus-scan port.', 'vault/vault.service.ts'],
    ['Store behind the Storage interface', 'Local folder now, S3 later. The database row holds metadata and a storage key, never the bytes.', 'common/storage'],
    ['Open only through short links', '<code>accessLink</code> makes a link that expires in 5 minutes and logs who opened it.', 'VaultService.accessLink'],
  ], code: `await this.vault.addSystemDocument(customerId, 'JOB_EVIDENCE', { title, category }, file, a, 'evidence of a service job', propertyId);` },
  { id: 'notify', label: 'Tell someone something', kind: 'Backend', intro: 'A notification when something happens. Never make the business action depend on it.', steps: [
    ['Add a template', 'A key like <code>extra.paid</code> with a title and body in <code>messaging/templates.ts</code>.', 'messaging/templates.ts'],
    ['Call notify after the change', '<code>notifications.notify(userIds, key, vars, { link, dedupeKey })</code>. For jobs use <code>JobsService.tell(job, \'customer\'|\'provider\'|\'worker\', key)</code>.', '*.service.ts'],
    ['Know what it does', 'It writes the in-app notification immediately, and an outbox email row unless the person switched email off. It catches its own errors.', 'messaging/notifications.service.ts'],
    ['Use a dedupe key for one-off events', 'The same key never notifies the same person twice (database unique index).', ''],
    ['Test who hears and who does not', 'Assert the right people get it, others get nothing, the sender is not told.', 'test/notifications.e2e-spec.ts'],
  ], code: `await this.jobs.tell(job, 'customer', 'job.scheduled', { when: await this.jobs.whenFor(customerUserId, start) });` },
  { id: 'schedule', label: 'Something that happens on a schedule', kind: 'Backend (worker)', intro: 'Reminders and sweeps. Runs in the worker, not in a request.', steps: [
    ['Put the logic in the module that owns the data', 'A method like <code>OrdersService.sweepUnpaid()</code>. Modules never read each other\'s tables.', '*.service.ts'],
    ['Make it safe to run again and again', 'Every message carries a dedupe key, every update is guarded, so running twice changes nothing.', ''],
    ['Call it from the orchestrator', '<code>RemindersService.sweep()</code> calls each area; one area failing does not stop the others.', 'reminders/reminders.service.ts'],
    ['Register the schedule in the worker', '<code>queue.work(name, handler)</code> then <code>queue.schedule(name, cron)</code> in <code>worker.ts</code>.', 'src/worker.ts'],
    ['Test by calling the service directly', 'Tests call <code>reminders.sweep()</code> themselves; they do not wait for the clock.', 'test/reminders.e2e-spec.ts'],
  ], code: `await this.queue.work('reminders.sweep', async () => { await this.reminders.sweep(); });
await this.queue.schedule('reminders.sweep', '*/10 * * * *');   // every 10 minutes` },
  { id: 'report', label: 'A report or dashboard number', kind: 'Backend + frontend', intro: 'Numbers that summarise many rows. They are read only, and the main risk is <b>showing the wrong person the wrong rows</b>.', steps: [
    ['Put the query in the module that owns the table', '<code>JobStatsService</code> for jobs, <code>OrdersService.moneyStats</code> for money. The <code>reports</code> module only asks; it reads no table of another module.', 'jobs/job-stats.service.ts'],
    ['Use SQL for aggregates', 'Averages, counts by group and per-day series are one raw SQL query (<code>Prisma.sql</code> with <code>$queryRaw</code>), not a loop over thousands of rows. Always pass values as parameters (<code>${value}</code>), never by joining strings.', 'job-stats.service.ts'],
    ['Decide the scope on the server', '<code>ReportsService.scopeOf</code> turns the asker\'s roles into a filter (pincodes, provider organisations, or one worker). The widest role wins. The client never sends a scope.', 'reports/reports.service.ts'],
    ['Define each number in words', 'Write what it counts ("a job belongs to the period by when it was created", "completed means work done, checked or closed") in the DTO description and in progress.md.', 'dto/reports.dto.ts'],
    ['Whole paise, India days', 'Money stays in paise; days are India-time days (<code>AT TIME ZONE \'Asia/Kolkata\'</code>); fill missing days with zero so charts are continuous.', ''],
    ['Exports are audited and safe', 'Audit the export, cap the rows, and prefix cells beginning with = + - @ so a spreadsheet cannot run them as formulas.', 'reportsService.jobsCsv'],
    ['Test with a known set of rows', 'Build a tiny world (two finished jobs rated 5 and 3, one cancelled, one late) and assert exact numbers for each role, including that another area sees nothing.', 'test/reports.e2e-spec.ts'],
  ], code: `const rows = await this.prisma.$queryRaw<Row[]>(Prisma.sql\`
  SELECT count(*) AS total, avg(rating) FILTER (WHERE rating IS NOT NULL) AS avg_rating
  FROM jobs WHERE created_at >= \${from} AND created_at < \${to} AND pincode_id = ANY(\${pincodeIds}::uuid[])\`);` },
  { id: 'sweepacc', label: 'Money that follows an event in another module', kind: 'Backend (worker)', intro: 'Earnings are created when a job closes, but the jobs module cannot call the earnings module (that would be an import cycle). The earnings module <b>looks</b> instead.', steps: [
    ['Ask the owning module for recent facts', '<code>JobsService.closedSince(date)</code> returns jobs closed recently. The earnings module reads no jobs table itself.', 'jobs/jobs.service.ts'],
    ['Skip what is done, and let the database say no to a second time', 'Check for existing rows, and also protect with a unique index (job, level): if two sweeps race, one insert fails harmlessly with a unique-violation we catch.', 'earnings.service.ts, migration 20261126100000_earnings'],
    ['Copy what you used', 'Store the percentage and the base in the new row. Later changes to the rules cannot rewrite history.', 'earnings table'],
    ['Run it on a schedule and on demand', 'The worker runs <code>earnings.accrue</code> every 5 minutes; screens call it before reading so a partner never waits.', 'src/worker.ts'],
    ['Never promise real-time', 'Tell the user in the screen: "A share appears a few minutes after a job is closed".', ''],
  ], code: `const closed = await this.jobs.closedSince(since, 500);
const done = new Set((await this.prisma.earning.findMany({ where: { jobId: { in: closed.map((j) => j.id) } }, select: { jobId: true } })).map((e) => e.jobId));
for (const job of closed.filter((j) => !done.has(j.id))) { /* work out the shares, create rows, ignore P2002 */ }` },
  { id: 'quote', label: 'A priced offer with totals the server works out', kind: 'Backend + frontend', intro: 'Any time staff price something for a customer (onboarding quotations, legal offers): the client describes the parts, the server decides the money.', steps: [
    ['The client sends lines, never a total', 'A DTO of lines (kind, label, whole paise). Unknown fields are refused, so a "total" sent by the browser is an error.', 'dto/review.dto.ts'],
    ['Validate the shape of the money', 'At least one main fee, no duplicate lines, a discount only with a reason and smaller than the whole, an upper limit on the total.', 'LegalReviewService.sendOffer'],
    ['Replace, do not edit', 'A new offer is a new row; the open one becomes SUPERSEDED in the same transaction. A partial unique index allows only one open offer.', 'legal_offers_one_open'],
    ['Accept with a claim, then act', 'Take the offer with a guarded update first (only one accept can win), then make the order; if the order fails, put the offer back.', 'LegalReviewService.accept'],
    ['Make the order from the offer, not from the request', 'The order takes its lines and discount from the stored offer, so what the customer saw is exactly what they pay.', 'OrdersService.createLegalOrder'],
    ['Expire by date, not by job', 'Compare the last day on read; no scheduled job is needed for the offer to stop being acceptable.', 'offerDto.expired'],
  ], code: `const claim = await this.prisma.legalOffer.updateMany({ where: { id: offer.id, status: 'SENT' }, data: { status: 'ACCEPTED', decidedAt: new Date() } });
if (claim.count === 0) throw new ConflictException('This offer was just changed');` },
  { id: 'lazy', label: 'Make something from a payment without the payment code knowing', kind: 'Backend', intro: 'Payments must not depend on every feature that reacts to them. Instead the feature looks for paid things that have no result yet and makes it. Used for jobs, extra work and legal cases.', steps: [
    ['Find what is paid and has no result', 'A query for the state you care about with no row yet (an accepted legal request whose order is PAID and has no case).', 'LegalCasesService.sync'],
    ['Make it once', 'A unique key (request, order) makes a second attempt fail harmlessly; catch the unique-violation code and carry on.', 'legal_cases_request_id_key'],
    ['Run it everywhere cheap', 'Call it at the start of reads of that feature and in the scheduled sweep, so it happens whether or not anyone is looking.', 'RemindersService.sweep'],
    ['Announce, never fail', 'Notifications after the insert are wrapped so a message problem never undoes the new row.', 'announce()'],
  ], code: `const waiting = await this.prisma.legalRequest.findMany({ where: { status: 'ACCEPTED', orderId: { not: null }, legalCase: null }, take: 100 });
for (const r of waiting) {
  if (briefs.get(r.orderId)?.status !== 'PAID') continue;
  await this.prisma.legalCase.create({ data: { ... } }).catch(ignoreUniqueViolation);
}` },
  { id: 'draft', label: 'A draft the customer fills in, then submits', kind: 'Backend + frontend', intro: 'Legal requests (and later other forms) start as a private draft and are <b>frozen</b> when sent. The pattern keeps the draft forgiving and the submitted record trustworthy.', steps: [
    ['Create the draft with a snapshot reference', 'Store the form version the draft started with, so later edits to the form never change it.', 'legal_requests.form_version'],
    ['Save a little at a time', 'An endpoint that takes only the answers sent, checks each against its question and ignores the rest. Make the whole save all-or-nothing: one bad value saves nothing.', 'saveAnswers'],
    ['Keep files in the vault, point to them', 'The request stores only the checklist item and the vault document id. Files are locked while the request relies on them.', 'legal_request_documents'],
    ['Submit checks completeness and freezes', 'Collect everything required that is missing and refuse with the list; otherwise a guarded update DRAFT to SUBMITTED. After that every write endpoint answers 409.', 'submit, assertDraft'],
    ['Keep drafts private', 'Staff queries filter on submitted_at not null, and a draft id answers 404 for staff.', 'listForStaff, submitted()'],
    ['Let the database agree', 'A CHECK ties the status to its timestamps, so a bug cannot leave a submitted request without a time.', 'legal_requests_state_valid'],
  ], code: `const u = await this.prisma.legalRequest.updateMany({ where: { id, status: 'DRAFT' }, data: { status: 'SUBMITTED', submittedAt: new Date() } });
if (u.count === 0) throw new ConflictException('This request was just changed');` },
  { id: 'versioned', label: 'Configuration that changes over time (versioned data)', kind: 'Backend + frontend', intro: 'Checklists and legal forms are written by operations and must never change under a piece of work that already started. We keep <b>versions</b>.', steps: [
    ['One table, one row per version', 'A unique index on (service, version). A save never edits a row; it inserts the next version number.', 'service_checklists, service_intake_forms'],
    ['Handle two saves at once', 'Read the latest version, insert version + 1; if the unique index says someone else did, take the next number and try again (a few times).', 'intake-forms.service.ts'],
    ['Copy or point, deliberately', 'A job copies its checklist when work starts (<code>jobs.checklist</code>). A legal case will store the version number it started with. Either way later edits cannot reach it.', 'JobWorkService.begin'],
    ['Validate on save, not on read', 'Refuse bad configuration with a clear message (a choice with one option, the same question twice); then every stored version is known to be good.', 'checkQuestions, checkDocuments'],
    ['Make position the key', 'Questions get keys q1, q2... by position so answers can refer to them; a new version renumbers, which is fine because answers store the version.', ''],
    ['Seed sensible first versions', 'The seed creates version 1 only when none exists, so it never overwrites what operations edited.', 'prisma/seed/legal-forms.ts'],
  ], code: `const latest = await this.prisma.serviceIntakeForm.findFirst({ where: { serviceId }, orderBy: { version: 'desc' } });
await this.prisma.serviceIntakeForm.create({ data: { serviceId, version: (latest?.version ?? 0) + 1, questions, documents, progressSteps, createdById } });` },
  { id: 'cross', label: 'Use another module\'s data', kind: 'Backend', intro: 'Modules are neighbours with locked doors. You ask politely through a service method.', steps: [
    ['Never read another module\'s table', 'Not even "just one count". Add a method to the owning module\'s service.', ''],
    ['Import its module', 'Add it to your module\'s <code>imports</code>, and make sure the owner <code>exports</code> the service.', '*.module.ts'],
    ['Avoid cycles', 'If A imports B, B cannot import A. The graph in the modules section shows the layers. When you need to go "backwards", pass the data in, or let the later module poll (jobs reads paid order lines; payments never call jobs).', ''],
    ['Prefer small, named methods', 'For example <code>CustomersService.userIdOf(customerId)</code>, <code>IdentityService.userIdsWithRole(role, orgId)</code>.', ''],
  ], code: `const user = await this.customers.userIdOf(job.purchasedByCustomerId);   // ask the owner module` },
  { id: 'screen', label: 'A new screen', kind: 'Frontend', intro: 'A page and its components.', steps: [
    ['Create the route', '<code>app/(portal)/thing/page.tsx</code> (customers) or <code>app/admin/(console)/thing/page.tsx</code> (staff). Keep the page tiny; it renders one component. Add <code>export const dynamic = \'force-dynamic\'</code>.', 'app/'],
    ['Write the component', 'A <code>\'use client\'</code> component with state, calling server actions, handling loading, empty and error states (use <code>Notice</code>).', 'src/components/'],
    ['Server actions', 'One function per API call in <code>src/actions/</code>, marked <code>\'use server\'</code>, calling the generated client inside <code>call()</code>. Return <code>{ ok, data }</code> or <code>{ ok: false, error }</code>.', 'src/actions/'],
    ['Menu entry', 'Add to <code>src/lib/nav.ts</code> with the roles that see it. This is cosmetic; the backend is the real lock.', 'src/lib/nav.ts'],
    ['Accessibility', 'A label on every input, keyboard reachable, touch targets at least 44 px (<code>!h-11</code> and up).', ''],
    ['Check', '<code>npx tsc --noEmit</code> and <code>pnpm lint</code>. Do not run <code>pnpm build</code> while the dev server runs.', ''],
  ], code: `export async function submitExtra(id: string, extraId: string) {
  return call((headers) => api.POST('/v1/jobs/{id}/extras/{extraId}/submit', { params: { path: { id, extraId } }, headers }));
}` },
];

/* ------------------------------------------------------------- 9. security matrix */
const ROLES = ['Customer', 'Field worker', 'Provider admin', 'Franchise / MF', 'Operations'];
const ACCESS = [
  ['Read a job', ['own', 'given', 'own org', 'area', 'all']],
  ['See the customer\'s name and phone', ['self', 'after accept', 'after accept', 'yes', 'yes']],
  ['Accept a job from the pool', ['n', 'n', 'y', 'n', 'n']],
  ['Pick a provider / nudge', ['n', 'n', 'n', 'y', 'y']],
  ['Start / finish work (with the customer\'s code)', ['n', 'y', 'n', 'n', 'override*']],
  ['Write in the job chat', ['y', 'y', 'y', 'read', 'y']],
  ['Ask for extra work', ['n', 'y', 'n', 'n', 'n']],
  ['Sign off large extra work', ['n', 'n', 'y', 'n', 'y']],
  ['Approve and pay extra work', ['y', 'n', 'n', 'n', 'n']],
  ['Approve a payment (not own record)', ['n', 'n', 'n', 'n', 'y']],
  ['Edit the catalogue and prices', ['n', 'n', 'n', 'n', 'y']],
];
function drawMatrix(host) {
  const cell = (v) => { const good = ['y', 'yes', 'all']; const none = ['n']; const cls = good.includes(v) ? 'y' : none.includes(v) ? 'n' : 'r'; const t = v === 'y' ? 'yes' : v === 'n' ? 'no' : v; return `<td class="${cls}">${esc(t)}</td>`; };
  host.innerHTML = `<table class="matrix"><thead><tr><th></th>${ROLES.map((r) => `<th>${r}</th>`).join('')}</tr></thead><tbody>${ACCESS.map(([a, row]) => `<tr><td>${esc(a)}</td>${row.map(cell).join('')}</tr>`).join('')}</tbody></table><p class="small" style="color:var(--muted)">*Operations can start or finish without a code only with a written reason (10+ characters); it is audited. This table is a summary: the authority is the service code and its tests.</p>`;
}

/* ---------------------------------------------------------- 12. checklist */
const CHECK = [
  'Rule decided in plain words (and where it is enforced: DTO, service, database)',
  'schema.prisma changed and a hand-written migration added (read it for DROP; add constraints and foreign keys)',
  'Service written; every status move through the state machine; guarded updates for races',
  'Controller has @Roles, Swagger responses; DTOs validate input',
  'End-to-end spec covers every role, every refusal and the race; the whole suite passes',
  'pnpm openapi:export run and openapi.json committed; frontend api:generate run',
  'Server actions and components written; tsc and lint clean',
  'progress.md, the spec, status.html, the role guide (guide/data.js) and this engineering handbook updated',
  'Public handbook updated (live features only); every touched repo\'s CLAUDE.md; root CLAUDE.md copy identical',
  'mpd-context (05-status, 99-session-log, roadmap, decisions) updated; verify.ps1 passes',
  'Committed and pushed every touched repo',
];
function drawChecklist(host) {
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem('mpd-eng-check') || '{}'); } catch { /* storage may be blocked */ }
  host.innerHTML = CHECK.map((c, i) => `<label><input type="checkbox" data-i="${i}" ${saved[i] ? 'checked' : ''}> <span>${esc(c)}</span></label>`).join('') + '<p><button class="btn" id="chkreset">Clear ticks</button></p>';
  host.addEventListener('change', (e) => { if (e.target.dataset.i === undefined) return; saved[e.target.dataset.i] = e.target.checked; try { localStorage.setItem('mpd-eng-check', JSON.stringify(saved)); } catch { /* ignore */ } });
  $('#chkreset', host).onclick = () => { saved = {}; try { localStorage.removeItem('mpd-eng-check'); } catch { /* ignore */ } $$('input', host).forEach((i) => { i.checked = false; }); };
}


/* -------------------------------------------------- business journey (who does what, in which code) */
const JOURNEY = [
  { actor: 'Visitor', t: 'Sends an inquiry on the public website', ep: 'POST /v1/onboarding/inquiries (public)', mod: 'onboarding', tables: 'onboarding_cases', note: 'No sign-in. Rate limited. A case is created and handed to the franchise that covers the pincode.' },
  { actor: 'Customer', t: 'Signs up, verifies email, adds KYC and a property', ep: 'POST /v1/auth/signup, /v1/customers/properties, /v1/kyc/...', mod: 'identity, customers-properties, kyc, vault', tables: 'users, customers, properties, kyc_records, documents', note: 'Aadhaar stored masked only. KYC documents are locked in the vault.' },
  { actor: 'Customer', t: 'Buys the mandatory site visit', ep: 'POST /v1/orders', mod: 'orders, catalogue', tables: 'orders, order_lines', note: 'PricingService refuses everything but the site visit until it is done (SITE_VISIT_REQUIRED).' },
  { actor: 'Operations', t: 'Records the payment; a second admin approves', ep: 'POST /v1/admin/orders/:id/payments, /admin/payments/:id/approve', mod: 'orders', tables: 'payments, orders, order_events', note: 'Maker-checker. Approval marks the order paid in one transaction.' },
  { actor: 'System', t: 'A paid line becomes a job in the pool', ep: 'JobsService.sync() (runs on reads)', mod: 'jobs', tables: 'jobs, job_events', note: 'Payments never call jobs. Providers that could take it are notified (messaging).' },
  { actor: 'Provider admin', t: 'Accepts the job (first wins), then assigns a worker', ep: 'POST /v1/jobs/:id/accept, /assign-worker', mod: 'jobs, provider-services', tables: 'jobs', note: 'One guarded update. The customer\'s name stays hidden until accepted.' },
  { actor: 'Worker', t: 'On the way; the customer shows a start code; work starts', ep: 'POST /v1/jobs/:id/on-the-way, /start', mod: 'jobs', tables: 'jobs, job_otps', note: 'The code is hashed, 10 minutes, 5 tries. The job copies its checklist now.' },
  { actor: 'Worker', t: 'Follows the checklist, takes photos', ep: 'PUT /v1/jobs/:id/steps/:key, POST /v1/jobs/:id/evidence', mod: 'jobs, vault', tables: 'job_steps, job_evidence, documents', note: 'Photos live in the customer\'s vault, locked.' },
  { actor: 'Worker', t: 'Finds more work: asks for extra work', ep: 'POST /v1/jobs/:id/extras, /photos, /submit', mod: 'jobs', tables: 'job_extras', note: 'Job becomes AWAITING_EXTRA_PAYMENT. Over 50% of the price needs a provider sign-off.' },
  { actor: 'Customer', t: 'Approves and pays the extra work', ep: 'POST /v1/me/jobs/:id/extras/:xid/approve', mod: 'jobs, orders', tables: 'job_extras, orders', note: 'An order of purpose EXTRA is made; when its payment is approved the job returns to IN_PROGRESS.' },
  { actor: 'Customer, worker, provider', t: 'Talk about the job', ep: 'GET/POST /v1/jobs/:id/messages', mod: 'jobs', tables: 'job_messages, job_message_reads', note: 'One notification at a time until read.' },
  { actor: 'Worker', t: 'Finishes with the customer\'s finish code', ep: 'POST /v1/jobs/:id/finish', mod: 'jobs', tables: 'jobs', note: 'Refused until every required checklist step and photo is done.' },
  { actor: 'Provider admin', t: 'Checks the work or sends it back', ep: 'POST /v1/jobs/:id/verify, /send-back', mod: 'jobs', tables: 'jobs, job_events', note: '' },
  { actor: 'Customer', t: 'Rates 1 to 5; the job closes', ep: 'POST /v1/me/jobs/:id/rate', mod: 'jobs', tables: 'jobs', note: 'CLOSED. The worker task list and reports are built from these rows.' },
  { actor: 'Operations, franchise, provider admin, worker', t: 'Look at the numbers', ep: 'GET /v1/reports/overview, /v1/reports/jobs.csv', mod: 'reports, jobs, orders', tables: 'read only: jobs, order_events, orders', note: 'Scoped by role on the server: everything, an area, an organisation, or your own jobs. Money only for operations and franchises.' },
  { actor: 'Customer', t: 'Asks for a legal service: answers, documents, sends it', ep: 'POST /v1/me/legal-requests, PUT .../answers, POST .../documents/:item, POST .../submit', mod: 'legal, vault', tables: 'legal_requests, legal_request_documents, documents', note: 'A private draft that keeps the form version it started with; documents are filed and locked in the vault; operations see it only once sent.' },
  { actor: 'Operations', t: 'Sets up the form and documents of a legal service', ep: 'PUT /v1/admin/services/:id/intake', mod: 'legal', tables: 'service_intake_forms', note: 'Every save is a new version; a case keeps the version it started with. Customers read the latest of an active service.' },
  { actor: 'Operations', t: 'Sets the shares; later records a payout, another admin approves it', ep: 'PUT /v1/admin/commission-rules, POST /v1/admin/payouts, /approve', mod: 'earnings', tables: 'commission_rules, earnings, payouts', note: 'A closed job earns its provider, franchise and master franchise a percentage of what was paid, rounded down. Worker job earnings.accrue makes the rows every 5 minutes.' },
  { actor: 'Worker (background)', t: 'Reminders and emails go out', ep: 'outbox.dispatch every minute, reminders.sweep every 10 minutes', mod: 'messaging, reminders', tables: 'outbox, notifications', note: 'See the worker section.' },
];
function drawJourney(host) {
  const actors = ['All', ...new Set(JOURNEY.map((j) => j.actor))];
  host.innerHTML = '<div class="tabs" id="jf"></div><ol class="steps" id="jl"></ol>';
  const draw = (a) => { $('#jl', host).innerHTML = JOURNEY.filter((j) => a === 'All' || j.actor === a).map((j) => `<li><b>${esc(j.t)}</b> <span class="pill">${esc(j.actor)}</span><br><span class="pill api">API</span><code>${esc(j.ep)}</code><br><span class="pill">module</span>${esc(j.mod)} <span class="pill db">tables</span>${esc(j.tables)}${j.note ? `<br><i>${esc(j.note)}</i>` : ''}</li>`).join(''); };
  actors.forEach((a, i) => { const b = document.createElement('button'); b.textContent = a; b.onclick = () => { $$('#jf button', host).forEach((x, k) => x.setAttribute('aria-selected', i === k)); draw(a); }; $('#jf', host).appendChild(b); });
  $('#jf', host).children[0].click();
}

/* ------------------------------------------------------------- glossary */
const GLOSS = [
  ['Access token', 'A signed pass (a JWT) valid for a short time. Sent with every API call.'], ['Audit event', 'A row recording who did what, when, from which address.'],
  ['Boundary', 'A line the code is not allowed to cross, such as one module reading another module\'s tables.'], ['Controller', 'The NestJS class that receives a request at an address and hands it to a service.'],
  ['CORS', 'A browser rule about which websites may call the API. We allow only our own origins.'], ['Cron', 'A timetable written as five fields, such as */10 * * * * for every 10 minutes.'],
  ['DTO', 'Data transfer object: a class that describes exactly what a request or answer contains.'], ['Decorator', 'A line starting with @ that adds meaning to the class or method below it.'],
  ['Dependency injection', 'Nest passing the services a class asks for in its constructor.'], ['Dedupe key', 'A text key that makes the same notification impossible to create twice for the same person.'],
  ['Enum', 'A column or type that can only hold one of a fixed list of values, like a status.'], ['End-to-end test', 'A test that drives the whole API against a real database, like a user would.'],
  ['Foreign key', 'A database rule that a column must point to a real row in another table.'], ['Guard', 'Code that decides whether a request may continue (is the token valid, is the role allowed).'],
  ['Guarded update', 'An update that says "only if it is still in this state", so two simultaneous changes cannot both win.'], ['Idempotent', 'Safe to run again: the second run changes nothing.'],
  ['JWT', 'JSON Web Token: a signed text that carries who you are and your roles.'], ['Layout', 'A Next.js file that wraps pages with shared pieces like the menu.'],
  ['Maker-checker', 'One person records, a different person approves.'], ['Middleware', 'Code that runs before a page or request, for example to send strangers to login.'],
  ['Migration', 'A numbered SQL file that changes the database once, in order.'], ['Module', 'A NestJS folder for one business area, with its controllers, services and imports.'],
  ['OpenAPI', 'A machine-readable description of every API address, input and output.'], ['Outbox', 'A table of messages waiting to be sent, written in the same step as the business change.'],
  ['Paise', 'Hundredths of a rupee. All money is stored as whole paise.'], ['pg-boss', 'A queue library that keeps its tables in Postgres.'],
  ['Pipe', 'Code that checks or converts input before it reaches the controller (our ValidationPipe).'], ['Port', 'An interface the code depends on (Mailer, Storage) so the real thing can be swapped.'],
  ['Provider (Nest)', 'Anything Nest can inject: services, ports. Not to be confused with a service provider business.'], ['Queue', 'A list of jobs waiting for a worker.'],
  ['Refresh token', 'A longer-lived key used only to get a new access token. Replaced each time it is used.'], ['Route', 'An address. In Next.js a folder under app/ is a route.'],
  ['Server action', 'A function that runs on the Next.js server when a component calls it.'], ['Server component / client component', 'A server component is drawn on the server; a client component (\'use client\') runs in the browser and can hold state.'],
  ['Service (Nest)', 'The class that holds the rules for an area.'], ['SLA', 'The time a job may wait for a provider before the upline is alerted.'],
  ['Snapshot', 'A copy kept so later changes do not alter history (order quotes, checklists).'], ['State machine', 'A fixed list of statuses and the only moves allowed between them.'],
  ['Sweep', 'A scheduled pass that looks for things needing attention and handles each once.'], ['Transaction', 'Several database changes that all succeed or all fail.'],
  ['Worker', 'A separate long-running program that does background jobs on a schedule or from a queue.'],
];
function drawGloss(host) {
  host.innerHTML = '<input type="search" id="gq" placeholder="Search a word" aria-label="Search glossary" style="width:100%;padding:10px;border:1px solid var(--line);border-radius:10px;background:var(--card);color:var(--fg);font:inherit"><div id="gl"></div>';
  const draw = () => { const q = $('#gq', host).value.trim().toLowerCase(); $('#gl', host).innerHTML = GLOSS.filter(([a, b]) => !q || a.toLowerCase().includes(q) || b.toLowerCase().includes(q)).map(([a, b]) => `<details><summary>${esc(a)}</summary><p>${esc(b)}</p></details>`).join('') || '<p>No match.</p>'; };
  $('#gq', host).oninput = draw; draw();
}

/* ------------------------------------------------------------------- boot */
document.addEventListener('DOMContentLoaded', () => {
  buildNav();
  const sysInfo = $('#sys-info'); if (sysInfo) drawSystem($('#sys-diagram'), sysInfo);
  const techHost = $('#tech');
  if (techHost) {
    techHost.innerHTML = '<div class="cards"></div><div class="panel" id="tech-info">Pick a technology.</div>';
    const cards = $('.cards', techHost);
    TECH.forEach((t) => { const b = document.createElement('button'); b.className = 'card'; b.innerHTML = `<b>${esc(t.n)}</b><span>${esc(t.s)}</span>`; b.onclick = () => { $$('.card', cards).forEach((c) => c.classList.remove('on')); b.classList.add('on'); $('#tech-info').innerHTML = `<h4>${esc(t.n)}</h4><p>${t.what}</p><p><span class="pill">why we use it</span> ${t.why}</p><p><span class="pill">where in our code</span> ${t.where}</p>${t.spot ? `<p><span class="pill">how to recognise it</span> ${t.spot}</p>` : ''}`; }; cards.appendChild(b); });
    cards.children[0].click();
  }
  const tr = $('#tracer'); if (tr) drawTracer(tr);
  const mg = $('#mod-graph'); if (mg) drawModules(mg, $('#mod-info'));
  const sm = $('#machines'); if (sm) {
    tabs(sm, Object.entries(MACHINES).map(([k, v]) => ({ label: v.label, k })), (it) => `<div id="mach-${it.k}"></div>`);
    sm.addEventListener('click', (e) => { if (e.target.matches('.tabs button')) setTimeout(() => { const i = $$('.tabs button', sm).indexOf(e.target); const k = Object.keys(MACHINES)[i]; drawMachine($(`#mach-${k}`, sm), MACHINES[k]); }, 0); });
    setTimeout(() => drawMachine($('#mach-job', sm), MACHINES.job), 0);
  }
  const ws = $('#worker-sim'); if (ws) workerSim(ws);
  const rc = $('#recipes-host'); if (rc) tabs(rc, RECIPES.map((r) => ({ label: r.label, r })), (it) => { const r = it.r; return `<p><span class="pill">${esc(r.kind)}</span> ${r.intro}</p><ol class="steps">${r.steps.map(([t, d, f]) => `<li><b>${esc(t)}.</b> ${d}${f ? ` <span class="pill">where</span><code>${esc(f)}</code>` : ''}</li>`).join('')}</ol><pre><code>${esc(r.code)}</code></pre>`; });
  const mx = $('#matrix'); if (mx) drawMatrix(mx);
  const ck = $('#checklist'); if (ck) drawChecklist(ck);
  const jr = $('#journey-host'); if (jr) drawJourney(jr);
  const gl = $('#glossary-host'); if (gl) drawGloss(gl);
});
