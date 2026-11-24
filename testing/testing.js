/* MPD Tester Handbook: behaviour. No dependencies, no build. The scenarios live in scenarios-*.js (they add themselves to window.MPD_TESTS). */
'use strict';
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (t) => String(t ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const KEY = 'mpd-tester-results-v1';

/** Helper the scenario files use: T(id, title, roles, steps, expect, { pre, tags, note }) */
window.MPD_TESTS = window.MPD_TESTS || { chapters: [] };
window.chapter = (id, name, intro, scenarios) => window.MPD_TESTS.chapters.push({ id, name, intro, scenarios });
window.T = (id, title, roles, steps, expect, o = {}) => ({ id, title, roles, steps, expect, pre: o.pre || [], tags: o.tags || [], note: o.note || '' });

let results = {};
try { results = JSON.parse(localStorage.getItem(KEY) || '{}'); } catch { results = {}; }
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(results)); } catch { /* storage may be blocked: results then last only until the page closes */ } };
const STATUS = { pass: 'Passed', fail: 'Failed', blocked: 'Blocked', skip: 'Skipped' };

const state = { q: '', status: 'all', role: 'all', tag: 'all', chapter: 'all' };
let all = [];

function flatten() {
  all = [];
  for (const c of window.MPD_TESTS.chapters) for (const s of c.scenarios) all.push({ ...s, chapter: c.id, chapterName: c.name });
}

function counts(list) {
  const c = { total: list.length, pass: 0, fail: 0, blocked: 0, skip: 0, todo: 0 };
  for (const s of list) { const r = results[s.id]?.status; if (r) c[r] += 1; else c.todo += 1; }
  return c;
}

function matches(s) {
  const r = results[s.id]?.status || 'todo';
  if (state.status !== 'all' && r !== state.status) return false;
  if (state.role !== 'all' && !s.roles.includes(state.role)) return false;
  if (state.tag !== 'all' && !s.tags.includes(state.tag)) return false;
  if (state.chapter !== 'all' && s.chapter !== state.chapter) return false;
  const q = state.q.trim().toLowerCase();
  if (q && !(`${s.id} ${s.title} ${s.steps.join(' ')} ${s.expect.join(' ')}`.toLowerCase().includes(q))) return false;
  return true;
}

function bar(c) {
  const pct = (n) => (c.total ? (n / c.total) * 100 : 0);
  return `<div class="bar" role="img" aria-label="${c.pass} passed, ${c.fail} failed, ${c.blocked} blocked, ${c.skip} skipped, ${c.todo} not yet tested"><span class="b-pass" style="width:${pct(c.pass)}%"></span><span class="b-fail" style="width:${pct(c.fail)}%"></span><span class="b-blocked" style="width:${pct(c.blocked)}%"></span><span class="b-skip" style="width:${pct(c.skip)}%"></span></div>`;
}

function renderSummary() {
  const c = counts(all);
  $('#summary').innerHTML = `<div class="sumrow"><b>${c.pass + c.fail + c.blocked + c.skip}</b> of <b>${c.total}</b> scenarios recorded &nbsp;·&nbsp; <span class="st pass">${c.pass} passed</span> <span class="st fail">${c.fail} failed</span> <span class="st blocked">${c.blocked} blocked</span> <span class="st skip">${c.skip} skipped</span> <span class="st todo">${c.todo} to do</span></div>${bar(c)}`;
  $$('#chapnav a').forEach((a) => {
    const id = a.dataset.id; if (id === 'all') return; const cc = counts(all.filter((s) => s.chapter === id));
    $('.cnt', a).textContent = `${cc.pass + cc.fail + cc.blocked + cc.skip}/${cc.total}`;
    a.classList.toggle('done', cc.total > 0 && cc.todo === 0 && cc.fail === 0 && cc.blocked === 0);
    a.classList.toggle('bad', cc.fail > 0);
  });
}

function scenarioHtml(s) {
  const r = results[s.id] || {};
  return `<article class="sc ${r.status || 'todo'}" id="${s.id}" data-id="${s.id}">
    <header><span class="sid">${esc(s.id)}</span><h4>${esc(s.title)}</h4><span class="tags">${s.roles.map((x) => `<span class="pill role">${esc(x)}</span>`).join('')}${s.tags.map((t) => `<span class="pill tag-${t}">${esc(t)}</span>`).join('')}</span></header>
    ${s.pre.length ? `<p class="lbl">Before you start</p><ul class="pre">${s.pre.map((x) => `<li>${x}</li>`).join('')}</ul>` : ''}
    <p class="lbl">Steps</p><ol>${s.steps.map((x) => `<li>${x}</li>`).join('')}</ol>
    <p class="lbl">What you should see</p><ul class="ex">${s.expect.map((x) => `<li>${x}</li>`).join('')}</ul>
    ${s.note ? `<p class="note">${s.note}</p>` : ''}
    <footer>${['pass', 'fail', 'blocked', 'skip'].map((k) => `<button class="res ${k} ${r.status === k ? 'on' : ''}" data-k="${k}">${STATUS[k]}</button>`).join('')}
      <input class="notes" placeholder="Notes: what you saw, ticket number, date" value="${esc(r.note || '')}" aria-label="Notes for ${esc(s.id)}">
      ${r.at ? `<span class="when">${esc(r.at)}</span>` : ''}</footer></article>`;
}

function renderList() {
  const host = $('#list');
  const shown = all.filter(matches);
  let html = '', last = '';
  for (const s of shown) {
    if (s.chapter !== last) {
      last = s.chapter;
      const ch = window.MPD_TESTS.chapters.find((c) => c.id === s.chapter);
      html += `<h3 class="chead" id="ch-${ch.id}">${esc(ch.name)}</h3>${ch.intro ? `<div class="intro">${ch.intro}</div>` : ''}`;
    }
    html += scenarioHtml(s);
  }
  host.innerHTML = html || '<p class="empty">No scenarios match these filters.</p>';
  $('#shown').textContent = `${shown.length} shown`;
}

function buildNav() {
  $('#chapnav').innerHTML = `<a href="#top" data-id="all">Start: how to use</a>` + window.MPD_TESTS.chapters.map((c) => `<a href="#ch-${c.id}" data-id="${c.id}">${esc(c.name)} <span class="cnt"></span></a>`).join('');
  const roles = [...new Set(all.flatMap((s) => s.roles))].sort();
  const tags = [...new Set(all.flatMap((s) => s.tags))].sort();
  $('#f-role').innerHTML = '<option value="all">Every role</option>' + roles.map((r) => `<option>${esc(r)}</option>`).join('');
  $('#f-tag').innerHTML = '<option value="all">Every kind</option>' + tags.map((r) => `<option>${esc(r)}</option>`).join('');
  $('#f-chapter').innerHTML = '<option value="all">Every area</option>' + window.MPD_TESTS.chapters.map((c) => `<option value="${c.id}">${esc(c.name)}</option>`).join('');
}

function refresh() { renderSummary(); renderList(); }

function exportText(kind) {
  const rows = all.map((s) => ({ id: s.id, chapter: s.chapterName, title: s.title, status: results[s.id]?.status || 'todo', note: results[s.id]?.note || '', at: results[s.id]?.at || '' }));
  if (kind === 'json') return JSON.stringify(rows, null, 2);
  const cell = (v) => { let t = String(v ?? ''); if (/^[=+\-@]/.test(t)) t = `'${t}`; return /[",\n]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t; };
  return ['ID,Area,Scenario,Result,Notes,When', ...rows.map((r) => [r.id, r.chapter, r.title, r.status, r.note, r.at].map(cell).join(','))].join('\r\n');
}
function download(name, text, type) { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type })); a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000); }

document.addEventListener('DOMContentLoaded', () => {
  flatten(); buildNav();
  $('#total-count').textContent = String(all.length);
  $('#f-q').oninput = (e) => { state.q = e.target.value; renderList(); };
  $('#f-status').onchange = (e) => { state.status = e.target.value; renderList(); };
  $('#f-role').onchange = (e) => { state.role = e.target.value; renderList(); };
  $('#f-tag').onchange = (e) => { state.tag = e.target.value; renderList(); };
  $('#f-chapter').onchange = (e) => { state.chapter = e.target.value; renderList(); };
  $('#clear').onclick = () => { Object.assign(state, { q: '', status: 'all', role: 'all', tag: 'all', chapter: 'all' }); $('#f-q').value = ''; for (const id of ['status', 'role', 'tag', 'chapter']) $(`#f-${id}`).value = 'all'; renderList(); };
  $('#next').onclick = () => { const s = all.find((x) => !results[x.id]); if (!s) return alert('Every scenario has a result. Well done.'); Object.assign(state, { q: '', status: 'all', role: 'all', tag: 'all', chapter: 'all' }); refresh(); $(`#${s.id}`)?.scrollIntoView({ block: 'start' }); };
  $('#dl-csv').onclick = () => download('mpd-test-results.csv', exportText('csv'), 'text/csv');
  $('#dl-json').onclick = () => download('mpd-test-results.json', exportText('json'), 'application/json');
  $('#reset').onclick = () => { if (confirm('Clear every recorded result in this browser? This cannot be undone.')) { results = {}; save(); refresh(); } };
  $('#list').addEventListener('click', (e) => {
    const b = e.target.closest('.res'); if (!b) return;
    const id = b.closest('.sc').dataset.id, k = b.dataset.k;
    if (results[id]?.status === k) delete results[id]; else results[id] = { ...(results[id] || {}), status: k, at: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) };
    save(); refresh();
  });
  $('#list').addEventListener('change', (e) => {
    if (!e.target.classList.contains('notes')) return;
    const id = e.target.closest('.sc').dataset.id;
    results[id] = { ...(results[id] || {}), note: e.target.value.trim() };
    if (!results[id].note && !results[id].status) delete results[id];
    save();
  });
  refresh();
});
