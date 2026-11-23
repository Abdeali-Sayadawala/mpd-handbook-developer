/* The interactive role guide. No dependencies, no build, works from file://. Content is in data.js. */
(function () {
  "use strict";
  var G = window.GUIDE;
  var $ = function (sel, root) { return (root || document).querySelector(sel); };

  function h(tag, attrs) {
    var el = document.createElement(tag);
    var kids = Array.prototype.slice.call(arguments, 2);
    Object.keys(attrs || {}).forEach(function (k) {
      var v = attrs[k];
      if (k === "class") el.className = v;
      else if (k === "text") el.textContent = v;
      else if (k.slice(0, 2) === "on" && typeof v === "function") el.addEventListener(k.slice(2), v);
      else if (v !== false && v != null) el.setAttribute(k, v === true ? "" : v);
    });
    kids.flat().forEach(function (c) {
      if (c == null || c === false) return;
      el.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
    });
    return el;
  }

  /* ------------------------------------------------------------- data helpers */
  function roleById(id) { return G.roles.filter(function (r) { return r.id === id; })[0]; }
  function menuOf(r) { return typeof r.menu === "string" ? roleById(r.menu.split(":")[1]).menu : r.menu; }
  function tasksOf(r) { return r.tasks === "HEAD_OFFICE" ? G.headOfficeTasks : r.tasks; }
  function allTasks() {
    var out = [];
    G.roles.forEach(function (r) {
      var seen = r.group === "head" && r.id === "ops"; // head office tasks are shown once, under the super admin
      if (seen) return;
      tasksOf(r).forEach(function (t) { out.push({ role: r, task: t }); });
    });
    return out;
  }

  /* ------------------------------------------------------------------- state */
  var state = { view: "roles", role: "ops", task: null, step: 0 };
  function readHash() {
    var m = (location.hash || "").replace("#", "").split("&").reduce(function (a, p) { var kv = p.split("="); if (kv[0]) a[kv[0]] = decodeURIComponent(kv[1] || ""); return a; }, {});
    if (m.view) state.view = m.view;
    if (m.role && roleById(m.role)) state.role = m.role;
    state.task = m.task || null;
  }
  function go(patch) {
    Object.keys(patch).forEach(function (k) { state[k] = patch[k]; });
    var parts = ["view=" + state.view];
    if (state.view === "roles") { parts.push("role=" + state.role); if (state.task) parts.push("task=" + encodeURIComponent(state.task)); }
    history.replaceState(null, "", "#" + parts.join("&"));
    render();
  }

  /* ---------------------------------------------------------------- the views */
  var VIEWS = [
    { id: "roles", label: "Roles and screens" },
    { id: "org", label: "Who is who" },
    { id: "journey", label: "Follow a request" },
    { id: "try", label: "Try it" },
    { id: "glossary", label: "Words" }
  ];

  function renderNav() {
    var nav = $("#views");
    nav.textContent = "";
    VIEWS.forEach(function (v) {
      nav.appendChild(h("button", { role: "tab", "aria-selected": state.view === v.id ? "true" : "false", class: "tab", onclick: function () { go({ view: v.id }); } }, v.label));
    });
  }

  /* ---- roles */
  function viewRoles() {
    var wrap = h("div", { class: "stack" });
    var picker = h("div", { class: "roles" });
    G.groups.forEach(function (g) {
      picker.appendChild(h("div", { class: "rolegroup" }, h("h3", { text: g.name }),
        h("div", { class: "chips" }, G.roles.filter(function (r) { return r.group === g.id; }).map(function (r) {
          return h("button", { class: "chip" + (state.role === r.id ? " on" : ""), "aria-pressed": state.role === r.id ? "true" : "false", onclick: function () { go({ role: r.id, task: null }); } },
            h("span", { class: "ico", "aria-hidden": "true", text: r.icon }), r.name);
        }))));
    });
    wrap.appendChild(picker);

    var r = roleById(state.role);
    wrap.appendChild(h("section", { class: "card hero" },
      h("h2", {}, r.icon + " " + r.name),
      h("p", { class: "lede", text: r.short }),
      h("p", {}, h("b", { text: "You are: " }), r.youAre),
      h("p", { class: "meta" }, h("b", { text: "You report to: " }), r.reportsTo, " ", h("b", { text: "You look after: " }), r.manages)));

    var cols = h("div", { class: "cols" });
    cols.appendChild(menuMock(r));
    cols.appendChild(tasksPanel(r));
    wrap.appendChild(cols);

    var lists = h("div", { class: "cols two" });
    lists.appendChild(h("section", { class: "card" }, h("h3", { text: "You cannot" }), h("ul", {}, r.cannot.map(function (x) { return h("li", { text: x }); }))));
    if (r.tips && r.tips.length) lists.appendChild(h("section", { class: "card" }, h("h3", { text: "Good to know" }), h("ul", {}, r.tips.map(function (x) { return h("li", { text: x }); }))));
    wrap.appendChild(lists);
    return wrap;
  }

  function menuMock(r) {
    var info = h("div", { class: "menuinfo", "aria-live": "polite" }, h("p", { class: "muted", text: "Click a menu item to see what it is for." }));
    var side = h("nav", { class: "mock", "aria-label": "The menu you will see" });
    side.appendChild(h("div", { class: "mockhead", text: "My Property Doctors" }));
    menuOf(r).forEach(function (grp) {
      side.appendChild(h("div", { class: "mockgroup", text: grp.group }));
      grp.items.forEach(function (it) {
        side.appendChild(h("button", { class: "mockitem" + (it.soon ? " soon" : ""), onclick: function (e) {
          Array.prototype.forEach.call(side.querySelectorAll(".mockitem"), function (b) { b.classList.remove("on"); });
          e.currentTarget.classList.add("on");
          info.textContent = "";
          info.appendChild(h("h4", { text: it.label }));
          info.appendChild(h("p", { text: it.what }));
          if (it.soon) info.appendChild(h("p", { class: "badge soonb", text: "Coming soon" }));
        } }, it.label, it.soon ? h("span", { class: "soonmark", text: "soon" }) : null));
      });
    });
    return h("section", { class: "card" }, h("h3", { text: "Your menu" }), h("div", { class: "menuwrap" }, side, info));
  }

  function tasksPanel(r) {
    var panel = h("section", { class: "card" }, h("h3", { text: "How do I…" }));
    tasksOf(r).forEach(function (t) {
      var open = state.task === t.id;
      var det = h("details", { class: "task", open: open, id: "task-" + t.id });
      det.appendChild(h("summary", {}, t.title, t.soon ? h("span", { class: "soonmark", text: "soon" }) : null));
      det.appendChild(h("p", { class: "where" }, h("b", { text: "Where: " }), t.where));
      det.appendChild(h("ol", { class: "steps" }, t.steps.map(function (s) { return h("li", { text: s }); })));
      if (t.tips) det.appendChild(h("ul", { class: "tips" }, t.tips.map(function (s) { return h("li", {}, h("b", { text: "Tip: " }), s); })));
      panel.appendChild(det);
    });
    if (r.id === "ops") panel.appendChild(h("p", { class: "muted", text: "Operations and the super admin use the same screens, so the tasks are the same." }));
    return panel;
  }

  /* ---- org explorer and area demo */
  function viewOrg() {
    var wrap = h("div", { class: "stack" });
    var panel = h("div", { class: "card orgpanel", "aria-live": "polite" }, h("p", { class: "muted", text: "Click anyone in the tree." }));
    var tree = h("div", { class: "tree", role: "tree" });
    G.org.forEach(function (n) {
      tree.appendChild(h("button", { class: "node level" + n.level, role: "treeitem", onclick: function (e) {
        Array.prototype.forEach.call(tree.querySelectorAll(".node"), function (b) { b.classList.remove("on"); });
        e.currentTarget.classList.add("on");
        var r = roleById(n.role);
        panel.textContent = "";
        panel.appendChild(h("h3", { text: n.name }));
        panel.appendChild(h("p", {}, h("b", { text: "How they join: " }), n.invites));
        panel.appendChild(h("p", {}, h("b", { text: "What they see: " }), n.sees));
        panel.appendChild(h("p", {}, h("b", { text: "What they do: " }), n.does));
        panel.appendChild(h("p", {}, h("button", { class: "btn", onclick: function () { go({ view: "roles", role: n.role, task: null }); } }, "Open the guide for " + r.name)));
      } }, n.name));
    });
    wrap.appendChild(h("section", { class: "card" }, h("h3", { text: "The network" }),
      h("p", { class: "muted", text: "Each level manages only its own branch. Invitations go downwards." }),
      h("div", { class: "orgcols" }, tree, panel)));
    wrap.appendChild(areaDemo());
    return wrap;
  }

  function areaDemo() {
    var pins = ["390001", "390002", "390003", "390004", "390005", "390006"];
    var owner = {}; // pincode -> "N" or "S"
    var current = "N";
    var msg = h("p", { class: "note", "aria-live": "polite", text: "Choose a franchise, then click pincodes to give them to it." });
    var chipsEl = h("div", { class: "pins" });
    var provs = h("div", { class: "pins" });
    var provState = { A: {}, B: {} };
    var provCurrent = "A";
    var provMsg = h("p", { class: "note", "aria-live": "polite", text: "Providers can pick from the pincodes of their franchise, and may overlap." });

    function paint() {
      chipsEl.textContent = "";
      pins.forEach(function (p) {
        chipsEl.appendChild(h("button", { class: "pin " + (owner[p] ? "own" + owner[p] : ""), onclick: function () {
          if (owner[p] && owner[p] !== current) {
            msg.textContent = "Refused. " + p + " already belongs to the " + (owner[p] === "N" ? "North" : "South") + " franchise. A franchise never overlaps another franchise.";
            msg.className = "note bad";
            return;
          }
          if (owner[p] === current) { delete owner[p]; for (var k in provState) delete provState[k][p]; msg.textContent = p + " released."; }
          else { owner[p] = current; msg.textContent = p + " now belongs to the " + (current === "N" ? "North" : "South") + " franchise."; }
          msg.className = "note";
          paint();
        } }, p, owner[p] ? h("small", { text: owner[p] === "N" ? "North" : "South" }) : null));
      });
      provs.textContent = "";
      pins.forEach(function (p) {
        var inNorth = owner[p] === "N";
        var holders = ["A", "B"].filter(function (k) { return provState[k][p]; });
        provs.appendChild(h("button", { class: "pin " + (holders.length ? "prov" : ""), disabled: !inNorth, onclick: function () {
          if (provState[provCurrent][p]) { delete provState[provCurrent][p]; provMsg.textContent = ""; }
          else {
            provState[provCurrent][p] = true;
            var other = provCurrent === "A" ? "B" : "A";
            provMsg.textContent = provState[other][p] ? "Allowed. Both providers cover " + p + ". Providers may overlap, so both see the same jobs there." : p + " added to provider " + provCurrent + ".";
          }
          provMsg.className = "note";
          paint();
        } }, p, h("small", { text: holders.length ? holders.map(function (k) { return "Provider " + k; }).join(" + ") : inNorth ? "free" : "not North's" })));
      });
    }
    paint();
    function tab(code, label) {
      return h("button", { class: "chip", onclick: function (e) { current = code; Array.prototype.forEach.call(e.currentTarget.parentNode.children, function (b) { b.classList.remove("on"); }); e.currentTarget.classList.add("on"); msg.textContent = "Now giving pincodes to the " + label + " franchise."; msg.className = "note"; } }, label + " franchise");
    }
    var t1 = tab("N", "North"); t1.classList.add("on");
    var pa = h("button", { class: "chip on", onclick: function (e) { provCurrent = "A"; Array.prototype.forEach.call(e.currentTarget.parentNode.children, function (b) { b.classList.remove("on"); }); e.currentTarget.classList.add("on"); } }, "Provider A");
    var pb = h("button", { class: "chip", onclick: function (e) { provCurrent = "B"; Array.prototype.forEach.call(e.currentTarget.parentNode.children, function (b) { b.classList.remove("on"); }); e.currentTarget.classList.add("on"); } }, "Provider B");
    return h("section", { class: "card" }, h("h3", { text: "Try it: areas are pincodes" }),
      h("p", { class: "muted", text: "Give pincodes to the North and South franchises. Then give some of North's pincodes to two providers." }),
      h("div", { class: "chips" }, t1, tab("S", "South")), chipsEl, msg,
      h("h4", { text: "Providers under the North franchise" }), h("div", { class: "chips" }, pa, pb), provs, provMsg);
  }

  /* ---- journey */
  function viewJourney() {
    var steps = G.journey;
    var s = steps[state.step];
    var dots = h("div", { class: "dots", role: "tablist", "aria-label": "Steps" }, steps.map(function (x, i) {
      return h("button", { class: "dot" + (i === state.step ? " on" : "") + (i < state.step ? " done" : ""), "aria-label": "Step " + (i + 1) + ": " + x.title, onclick: function () { go({ step: i }); } }, String(i + 1));
    }));
    var sees = h("ul", { class: "sees" }, Object.keys(s.sees).map(function (k) { return h("li", {}, h("b", { text: k + ": " }), s.sees[k]); }));
    return h("section", { class: "card journey" },
      h("h2", { text: "Follow one request from first inquiry to finished work" }),
      dots,
      h("div", { class: "stage" },
        h("p", { class: "actor", text: s.actor }),
        h("h3", {}, s.title, s.soon ? h("span", { class: "soonmark", text: "coming soon" }) : null),
        h("p", { class: "where" }, h("b", { text: "Screen: " }), s.screen),
        h("p", { text: s.text }),
        h("h4", { text: "What each person sees" }), sees),
      h("div", { class: "nav" },
        h("button", { class: "btn", disabled: state.step === 0, onclick: function () { go({ step: state.step - 1 }); } }, "Back"),
        h("span", { class: "muted", text: "Step " + (state.step + 1) + " of " + steps.length }),
        h("button", { class: "btn primary", disabled: state.step === steps.length - 1, onclick: function () { go({ step: state.step + 1 }); } }, "Next")));
  }

  /* ---- simulations */
  function viewTry() {
    return h("div", { class: "stack" }, poolSim(), paymentSim());
  }

  function poolSim() {
    var taken = null, declined = {};
    var provs = [
      { id: "A", name: "FixIt Services", note: "Covers the pincode and offers the service" },
      { id: "B", name: "HomeCare Co", note: "Covers the pincode and offers the service" },
      { id: "C", name: "Far Away Ltd", note: "Does not cover this pincode" }
    ];
    var out = h("div", { class: "pool" });
    var log = h("p", { class: "note", "aria-live": "polite", text: "A paid service just became a job. Two providers can take it. Click Accept for one of them." });
    function paint() {
      out.textContent = "";
      provs.forEach(function (p) {
        var eligible = p.id !== "C";
        var card = h("div", { class: "prov" + (taken === p.id ? " won" : "") + (!eligible ? " out" : "") });
        card.appendChild(h("h4", { text: p.name }));
        card.appendChild(h("p", { class: "muted", text: p.note }));
        if (!eligible) card.appendChild(h("p", { text: "This job is not in their pool." }));
        else if (declined[p.id]) card.appendChild(h("p", { text: "You turned it down. It is hidden from you, still open for others." }));
        else if (taken && taken !== p.id) card.appendChild(h("p", { class: "bad", text: "Too late. Another provider already has it." }));
        else if (taken === p.id) card.appendChild(h("div", {}, h("p", { class: "good", text: "It is yours." }), h("p", { text: "Now you can see the customer: Asha Rao, +91 98xxxxxx01, 12 Lake Road. Choose one of your workers." })));
        else {
          card.appendChild(h("p", { text: "Window cleaning · 2 BHK flat · 1,100 sq ft · Karelibagh 390018. Customer and address hidden until you accept." }));
          card.appendChild(h("div", { class: "row" },
            h("button", { class: "btn primary", onclick: function () { taken = p.id; log.textContent = p.name + " accepted first and got the job. The others lost it at that instant: only one can win."; log.className = "note good"; paint(); } }, "Accept"),
            h("button", { class: "btn", onclick: function () { declined[p.id] = true; log.textContent = p.name + " turned it down. It stays in the pool for the other provider."; log.className = "note"; paint(); } }, "Turn down")));
        }
        out.appendChild(card);
      });
    }
    paint();
    return h("section", { class: "card" }, h("h3", { text: "Try it: the job pool, first to accept wins" }), log, out,
      h("p", {}, h("button", { class: "btn", onclick: function () { taken = null; declined = {}; log.textContent = "Reset. Try again."; log.className = "note"; paint(); } }, "Start again")));
  }

  function paymentSim() {
    var who = "Priya", recorded = null, status = "none";
    var box = h("div", { class: "paysim" });
    var note = h("p", { class: "note", "aria-live": "polite", text: "You are Priya. A customer paid 12,500 rupees by bank transfer." });
    function paint() {
      box.textContent = "";
      box.appendChild(h("div", { class: "row" }, h("b", { text: "You are:" }),
        ["Priya", "Rahul"].map(function (n) { return h("button", { class: "chip" + (who === n ? " on" : ""), onclick: function () { who = n; note.textContent = "You are now " + n + "."; note.className = "note"; paint(); } }, n); })));
      if (status === "none") {
        box.appendChild(h("p", { text: "Order O-7K3M9QX2 · 12,500 rupees · waiting for payment." }));
        box.appendChild(h("button", { class: "btn primary", onclick: function () { recorded = who; status = "waiting"; note.textContent = who + " recorded the payment with the bank slip. It is not paid yet. A different person must approve it."; note.className = "note"; paint(); } }, "Record payment with proof"));
      } else if (status === "waiting") {
        box.appendChild(h("p", { text: "Payment recorded by " + recorded + ". Waiting for a second person." }));
        box.appendChild(h("div", { class: "row" },
          h("button", { class: "btn primary", onclick: function () {
            if (who === recorded) { note.textContent = "Not allowed: you recorded this payment, so a different person must approve it."; note.className = "note bad"; return; }
            status = "paid"; note.textContent = who + " checked the bank and approved. The order is paid and any plan starts."; note.className = "note good"; paint();
          } }, "Approve"),
          h("button", { class: "btn", onclick: function () {
            if (who === recorded) { note.textContent = "Not allowed: you recorded this payment, so a different person must reject it too. You can Withdraw it instead."; note.className = "note bad"; return; }
            status = "none"; recorded = null; note.textContent = who + " rejected it with a reason. The order is still unpaid."; note.className = "note"; paint();
          } }, "Reject"),
          who === recorded ? h("button", { class: "btn", onclick: function () { status = "none"; recorded = null; note.textContent = "Withdrawn. You can record it again correctly."; note.className = "note"; paint(); } }, "Withdraw (my mistake)") : null));
      } else {
        box.appendChild(h("p", { class: "good", text: "Order paid." }));
        box.appendChild(h("button", { class: "btn", onclick: function () { status = "none"; recorded = null; note.textContent = "Reset."; note.className = "note"; paint(); } }, "Start again"));
      }
    }
    paint();
    return h("section", { class: "card" }, h("h3", { text: "Try it: two people for every payment" }), note, box);
  }

  /* ---- glossary */
  function viewGlossary() {
    var list = h("dl", { class: "gloss" });
    var q = h("input", { type: "search", placeholder: "Search words", "aria-label": "Search words", class: "field", oninput: function () { paint(q.value); } });
    function paint(f) {
      list.textContent = "";
      var needle = (f || "").toLowerCase();
      G.glossary.filter(function (g) { return !needle || g.term.toLowerCase().indexOf(needle) >= 0 || g.def.toLowerCase().indexOf(needle) >= 0; }).forEach(function (g) {
        list.appendChild(h("dt", { text: g.term })); list.appendChild(h("dd", { text: g.def }));
      });
    }
    paint("");
    return h("section", { class: "card" }, h("h2", { text: "Words we use" }), q, list);
  }

  /* ---- search across tasks */
  function renderSearch() {
    var box = $("#results");
    var q = ($("#search").value || "").toLowerCase().trim();
    box.textContent = "";
    if (!q) { box.hidden = true; return; }
    var hits = allTasks().filter(function (x) {
      return (x.task.title + " " + x.task.where + " " + x.task.steps.join(" ")).toLowerCase().indexOf(q) >= 0;
    }).slice(0, 8);
    box.hidden = false;
    if (!hits.length) { box.appendChild(h("p", { class: "muted", text: "Nothing found. Try another word, for example payment, job, pincode." })); return; }
    hits.forEach(function (x) {
      var role = x.role.id === "super_admin" ? roleById("ops") : x.role;
      box.appendChild(h("button", { class: "hit", onclick: function () { $("#search").value = ""; box.hidden = true; go({ view: "roles", role: role.id, task: x.task.id }); setTimeout(function () { var el = document.getElementById("task-" + x.task.id); if (el) el.scrollIntoView({ block: "center" }); }, 30); } },
        h("b", { text: x.task.title }), h("span", { class: "muted", text: " · " + (x.role.group === "head" ? "Operations / Super admin" : x.role.name) + " · " + x.task.where })));
    });
  }

  /* ------------------------------------------------------------------ render */
  function render() {
    renderNav();
    var main = $("#main");
    main.textContent = "";
    var v = { roles: viewRoles, org: viewOrg, journey: viewJourney, try: viewTry, glossary: viewGlossary }[state.view] || viewRoles;
    main.appendChild(v());
    window.scrollTo(0, 0);
    if (state.task) setTimeout(function () { var el = document.getElementById("task-" + state.task); if (el) el.scrollIntoView({ block: "center" }); }, 30);
  }

  $("#updated").textContent = "Last reviewed " + G.updated;
  $("#search").addEventListener("input", renderSearch);
  window.addEventListener("hashchange", function () { readHash(); render(); });
  readHash();
  render();
})();
