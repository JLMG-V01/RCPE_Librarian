/* ==========================================================================
   The FAIR Librarian – Guided demo tour
   Spotlight overlay that walks through all capabilities in sequence.
   The demo state is snapshotted before and restored after the tour.
   ========================================================================== */
(function () {
  const $ = (s) => document.querySelector(s);
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const D = window.DATA, A = () => window.APP;
  let steps = [], idx = 0, snap = null, auto = false, timer = null, els = {}, busy = false, runId = 0;

  async function typeInto(sel, text, speed = 45) {
    const el = $(sel); if (!el) return;
    el.focus(); el.value = '';
    for (const ch of text) { el.value += ch; el.dispatchEvent(new Event('input', { bubbles: true })); await wait(speed); }
  }
  const go = async (hash, ms = 350) => { A().go(hash); await wait(ms); };

  function buildSteps() {
    const tourDs = D.DATASETS.find((d) => d.project === 'ASD3D' && d.owner === 'p02' && d.legal === 'Cleared' && d.technique === 'DSC' && d.excipients.includes('HPMCAS')) || D.DATASETS.find((d) => d.project === 'ASD3D' && d.owner === 'p02' && d.legal === 'Cleared' && d.technique === 'DSC') || D.DATASETS[0];
    const legalDs = D.DATASETS.find((d) => d.project === 'CTR-HME-A' && d.legal === 'Not cleared') || D.DATASETS.find((d) => d.sensitive);
    const myReq = () => A().state.requests.find((r) => r.ds === tourDs.id && r.requester === 'p01');
    return [
      { title: 'Welcome to The FAIR Librarian', text: 'A "Google" for the RCPE data landscape: one index over project shares, instrument NAS, analytics drives, SharePoint and the secure contract vault – focused on pharmaceutical 3D printing & materials science. This tour runs through every capability. Use → / ← or the buttons, or press Auto-play.', before: async () => { A().setRole('scientist', true); await go('#/'); } },
      { el: '#role-switch', title: 'Four roles, one index', text: 'Switch between Scientist, Data Owner, Administrator and Guest. What you can see – and open – changes with the role. We start as Dr. Lena Muster, Senior Scientist in 3D printing.' },
      { el: '#searchbox', title: 'Clear search with autocomplete', text: 'Autocomplete suggests ontology concepts, indexed datasets, equipment, projects, materials and people while you type.', before: async () => { await typeInto('#q', 'itra', 110); } },
      { el: '#understood', title: 'The ontology understands you', text: '“itraconazole dsc” is recognised as an API and an analytical technique. Synonyms such as ITZ, calorimetry, thermogram or the German “Kalorimetrie” would find the same data.', before: async () => { A().runSearch('itraconazole dsc', {}); await wait(450); } },
      { el: '#facets', title: 'Refine with facets', text: 'Every result set can be narrowed by project, technique, formulation type (solo API, API + excipient, ternary, multi-API), legal status, equipment, owner, server domain and tags.' },
      { el: '#filter-panel', title: 'Advanced filters', text: 'The Filters button adds structured criteria: created / last-changed date ranges, owner, creator, project, equipment, technique, API, polymer, classification and legal clearance.', before: async () => { A().UI.showFilters = true; A().render(); await wait(300); } },
      { el: '#results .res', title: 'Everything is hyperlinked', text: 'Each hit links to its project, the equipment that produced it and the responsible people. Badges show legal clearance, data classification and whether you already have access.', before: async () => { A().UI.showFilters = false; A().runSearch('itraconazole dsc', {}); await wait(400); } },
      { el: '#ds-head', title: 'Dataset page – restricted', text: 'Lena Muster is not a member of ASD-3D. She sees that the dataset exists, its owner, dates, classification and legal status – but not the details or the storage location.', before: async () => { A().setDsTab('overview'); await go('#/dataset/' + tourDs.id); } },
      { el: '#locked-panel', title: 'Details only for authorised roles', text: 'Composition, method parameters, results summary and the server path are hidden until access is granted. The research data themselves never live in the index.', before: async () => { A().setDsTab('composition'); A().render(); await wait(250); } },
      { el: '.modal', title: 'Request access', text: 'One click opens the request form: purpose, duration, justification – plus an NDA/CDA confirmation for confidential data.', before: async () => { A().openRequestModal(tourDs.id); await wait(300); const r = $('#rq-reason'); if (r) { r.value = ''; for (const ch of 'Benchmark of HPMCAS ASD thermal data against PrintPed formulations.') { r.value += ch; await wait(14); } } } },
      { el: '#req-list', title: 'Data Owner inbox', text: 'The request lands with the data owner, Dr. Markus Beispiel. Because the dataset is legally cleared, the legal step was passed automatically. Uncleared or NDA/CDA data are routed to Legal & Contracts first.', before: async () => { if (!myReq()) { A().setRole('scientist', true); A().submitRequest(tourDs.id, { purpose: 'Comparison / benchmark', duration: '90', reason: 'Benchmark of HPMCAS ASD thermal data against PrintPed formulations.' }); } A().closeModal(); A().setReqTab('inbox'); A().setRole('owner', true); await go('#/requests', 400); const c = document.querySelector(`[data-req-card="${myReq().id}"]`); if (c) c.id = 'tour-req'; } , elFn: () => document.querySelector(`[data-req-card="${myReq() && myReq().id}"]`) || $('#req-list') },
      { el: '#ds-head', title: 'Approved – access granted', text: 'Markus approves. Back as Lena, the dataset is now unlocked: “Open data location” points straight to the folder on the server, and the full metadata is visible.', before: async () => { const r = myReq(); if (r && r.status === 'owner') { A().setRole('owner', true); A().decide(r.id, true, 'Approved for benchmarking – please reference the ELN entry.'); } A().setRole('scientist', true); A().setDsTab('composition'); await go('#/dataset/' + tourDs.id, 400); } },
      { el: '#ds-body', title: 'Composition & parameters', text: 'API, polymer and plasticizer with function and w/w %, plus all method parameters – everything you need to judge reusability, without copying any data.' },
      { el: '#legal-banner', title: 'Legal clearance at a glance', text: 'Much of our data is covered by NDAs or CDAs. Every dataset carries its legal status, the agreement reference and the conditions. This contract-research dataset is not cleared, and its composition is masked for non-members.', before: async () => { A().setDsTab('legal'); await go('#/dataset/' + legalDs.id, 400); } },
      { el: '#ds-body .graph', title: 'Visible connections', text: 'The relationship graph links the dataset to its project, equipment, owner, creator and all datasets of the same formulation along the process chain: HME → filament QC → print → DSC/XRPD → dissolution.', before: async () => { A().setDsTab('relations'); await go('#/dataset/' + tourDs.id, 400); } },
      { el: '#eq-sources', title: 'Search by equipment', text: 'Pick an instrument and the Librarian reunites everything it ever produced – scattered across project shares, the instrument NAS, the analytics drive and SharePoint.', before: async () => { await go('#/equipment/EQ-FDM-01', 400); const d = document.querySelector('#eq-sources details'); if (d) d.open = true; } },
      { el: '#answer', title: 'Ask the Librarian', text: 'Type a question in plain language. The ontology translates it into the exact search query, explains each term and suggests alternative words.', before: async () => { await go('#/ask', 300); await typeInto('#ask-input', 'Which filaments with HPMCAS were too brittle to print?', 22); A().askNow($('#ask-input').value); await wait(450); } },
      { el: '#concept-detail', title: 'A domain ontology you can reuse', text: '150+ concepts with definitions, broader/narrower relations, synonyms, German terms and trade names. Export it as JSON, CSV, SKOS/Turtle or search-engine synonyms for the production system.', before: async () => { A().setOntTab('dictionary'); await go('#/ontology/prop.brittle', 350); } },
      { el: '#results', title: 'Guest view', text: 'As a guest, confidential projects disappear entirely and only openly classified, legally cleared data can be opened.', before: async () => { A().setRole('guest', true); A().runSearch('itraconazole', {}); await wait(450); } },
      { el: '#sources-table', title: 'Administrator: index & sources', text: 'Administrators monitor the crawled server landscape across domains, run incremental crawls, import new data types (e.g. spray drying, tableting) and export the index or the audit trail.', before: async () => { A().setRole('admin', true); await go('#/index', 400); } },
      { el: '#perm-matrix', title: 'Transparent permission model', text: 'Who may see what is explicit, auditable and aligned with data classification and legal clearance.' },
      { title: 'That’s The FAIR Librarian', text: 'Findable through one index and an ontology, Accessible through a governed request workflow, Interoperable through a shared schema and vocabulary, Reusable through provenance and legal clarity. The demo state is now reset – explore on your own!' }
    ];
  }

  function ui() {
    els.block = Object.assign(document.createElement('div'), { className: 'tour-block' });
    els.spot = Object.assign(document.createElement('div'), { className: 'tour-spot' });
    els.card = Object.assign(document.createElement('div'), { className: 'tour-card' });
    els.card.setAttribute('role', 'dialog');
    document.body.append(els.block, els.spot, els.card);
    els.card.addEventListener('click', (e) => {
      const b = e.target.closest('button'); if (!b) return;
      if (b.dataset.t === 'next') next(); else if (b.dataset.t === 'prev') prev(); else if (b.dataset.t === 'close') stop(); else if (b.dataset.t === 'auto') { auto = !auto; drawCard(); if (auto) schedule(); else clearTimeout(timer); }
    });
  }
  function drawCard(loading) {
    const s = steps[idx];
    els.card.innerHTML = `<div class="tprog"><i style="width:${((idx + 1) / steps.length) * 100}%"></i></div>
      <div class="row"><span class="tstep">Step ${idx + 1} / ${steps.length}</span><span class="spacer"></span><button class="btn btn-sm btn-ghost" data-t="close" title="End tour (Esc)">✕</button></div>
      <h3>${s.title}</h3><p>${loading ? '…' : s.text}</p>
      <div class="row"><button class="btn btn-sm" data-t="auto">${auto ? '❚❚ Pause' : '▶ Auto-play'}</button><span class="spacer"></span>${idx ? '<button class="btn btn-sm" data-t="prev">‹ Back</button>' : ''}<button class="btn btn-sm btn-primary" data-t="next">${idx === steps.length - 1 ? 'Finish' : 'Next ›'}</button></div>`;
  }
  function target() { const s = steps[idx]; return (s.elFn && s.elFn()) || (s.el ? $(s.el) : null); }
  function place() {
    const el = target(); const pad = 8; const vw = innerWidth, vh = innerHeight;
    let r;
    if (el) { const b = el.getBoundingClientRect(); r = { x: b.left - pad, y: Math.max(4, b.top - pad), w: b.width + pad * 2, h: Math.min(b.height + pad * 2, vh - 8) }; }
    else r = { x: vw / 2, y: vh / 2, w: 0, h: 0 };
    Object.assign(els.spot.style, { left: r.x + 'px', top: r.y + 'px', width: r.w + 'px', height: r.h + 'px' });
    const cw = els.card.offsetWidth, ch = els.card.offsetHeight; let left, top;
    if (!el) { left = (vw - cw) / 2; top = (vh - ch) / 2; }
    else if (r.y + r.h + ch + 16 < vh) { top = r.y + r.h + 12; left = r.x; }
    else if (r.y - ch - 16 > 0) { top = r.y - ch - 12; left = r.x; }
    else if (r.x + r.w + cw + 16 < vw) { left = r.x + r.w + 12; top = Math.max(12, r.y); }
    else { left = vw - cw - 16; top = vh - ch - 16; }
    els.card.style.left = Math.max(12, Math.min(left, vw - cw - 12)) + 'px';
    els.card.style.top = Math.max(12, Math.min(top, vh - ch - 12)) + 'px';
  }
  async function show(n) {
    clearTimeout(timer); busy = true; const my = ++runId;
    idx = Math.max(0, Math.min(n, steps.length - 1));
    drawCard(true);
    try { if (steps[idx].before) await steps[idx].before(); } catch (e) { console.warn('tour step', e); }
    if (my !== runId || !els.card) return;
    await wait(120);
    const el = target();
    if (el) { const b = el.getBoundingClientRect(); if (b.top < 70 || b.bottom > innerHeight - 40) { el.scrollIntoView({ block: b.height > innerHeight * 0.6 ? 'start' : 'center' }); window.scrollBy(0, b.height > innerHeight * 0.6 ? -80 : 0); await wait(200); } }
    drawCard(); place(); busy = false;
    if (auto) schedule();
  }
  function schedule() { clearTimeout(timer); timer = setTimeout(() => { if (idx < steps.length - 1) next(); else stop(); }, 7000); }
  function next() { if (idx >= steps.length - 1) return stop(); show(idx + 1); }
  function prev() { show(idx - 1); }
  function onKey(e) { if (!els.card) return; if (e.key === 'ArrowRight') next(); else if (e.key === 'ArrowLeft') prev(); else if (e.key === 'Escape') stop(); }
  const onResize = () => { if (els.card && !busy) place(); };

  function start() {
    if (els.card) return;
    snap = A().snapshot(); window.__tourActive = true; auto = false;
    steps = buildSteps(); ui();
    document.addEventListener('keydown', onKey, true); addEventListener('resize', onResize); addEventListener('scroll', onResize, true);
    show(0);
  }
  function stop() {
    clearTimeout(timer); runId++;
    Object.values(els).forEach((e) => e && e.remove()); els = {};
    document.removeEventListener('keydown', onKey, true); removeEventListener('resize', onResize); removeEventListener('scroll', onResize, true);
    window.__tourActive = false;
    A().UI.showFilters = false; A().closeModal();
    if (snap) A().restore(snap);
    A().setDsTab('overview');
    A().go('#/');
  }
  window.TOUR = { start, stop };
})();
