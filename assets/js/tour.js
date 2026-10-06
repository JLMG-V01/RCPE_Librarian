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
    const relDs = D.DATASETS.find((d) => d.project === 'MATLIB' && !d.public && d.owner === 'p06' && d.technique === 'DSC') || D.DATASETS.find((d) => d.project === 'FILQBD' && !d.public);
    return [
      { title: 'Welcome to The FAIR Librarian', text: 'One index over project shares, instrument storage, analytics drives, SharePoint and the secure contract vault – focused on pharmaceutical 3D printing and materials science. All names and data in this demo are fictional. Use → / ← or Auto-play.', before: async () => { A().setRole('scientist', true); A().setMode('search'); await go('#/'); } },
      { el: '#role-switch', title: 'Four roles, one index', text: 'Scientist, Data Owner, Administrator and external Guest. What you can see – and open – depends on the role. We start as Dr. Lena Muster, Senior Scientist.' },
      { el: '#searchbox', title: 'Search with autocomplete', text: 'Suggestions come from the ontology, indexed datasets, equipment, projects, materials and people. The switch above lets you ask a question in plain language instead.', before: async () => { await typeInto('#q', 'itra', 110); } },
      { el: '#understood', title: 'The ontology understands you', text: '“itraconazole dsc” is recognised as an API and an analytical technique. ITZ, calorimetry, thermogram or the German “Kalorimetrie” find the same data.', before: async () => { A().runSearch('itraconazole dsc', {}); await wait(450); } },
      { el: '#facets', title: 'Refine in one click', text: 'Facets for project, technique, formulation type, legal status and owner – plus an “Open data only” switch. The Filters button adds dates, creator, equipment, API, polymer and more.' },
      { el: '#results .res', title: 'Everything is connected', text: 'Each hit links to its project and the instrument that produced it. Badges show access and legal clearance at a glance.' },
      { el: '#ds-head', title: 'Restricted dataset', text: 'Lena is not a member of ASD-3D: she sees that the dataset exists, who owns it and its legal status – but not the details or the storage location.', before: async () => { A().setDsTab('overview'); await go('#/dataset/' + tourDs.id); } },
      { el: '.modal', title: 'Request access', text: 'One click: purpose, duration and justification – plus an NDA/CDA confirmation for confidential data.', before: async () => { A().openRequestModal(tourDs.id); await wait(300); const r = $('#rq-reason'); if (r) { r.value = ''; for (const ch of 'Benchmark of HPMCAS ASD thermal data against PrintPed formulations.') { r.value += ch; await wait(12); } } } },
      { title: 'Data Owner inbox', text: 'The request lands with the data owner, Dr. Markus Beispiel. The dataset is legally cleared, so the legal step passed automatically – NDA/CDA or uncleared data go to Legal & Contracts first.', before: async () => { if (!myReq()) { A().setRole('scientist', true); A().submitRequest(tourDs.id, { purpose: 'Comparison / benchmark', duration: '90', reason: 'Benchmark of HPMCAS ASD thermal data against PrintPed formulations.' }); } A().closeModal(); A().setReqTab('inbox'); A().setRole('owner', true); await go('#/requests', 400); }, elFn: () => document.querySelector(`[data-req-card="${myReq() && myReq().id}"]`) },
      { el: '#ds-body', title: 'Approved – details unlocked', text: 'Markus approves with a comment. Back as Lena, composition, method parameters, provenance and the server path are now visible – and the decision is kept in her request history.', before: async () => { const r = myReq(); if (r && r.status === 'owner') { A().setRole('owner', true); A().decide(r.id, true, 'Approved for benchmarking – please reference the ELN entry.'); } A().setRole('scientist', true); A().setDsTab('details'); await go('#/dataset/' + tourDs.id, 400); } },
      { el: '#access-card', title: 'Legal clearance at a glance', text: 'Every dataset carries its legal status, the agreement and its conditions. This contract-research dataset for the (fictional) Contoso Pharma is not cleared – its composition stays masked.', before: async () => { A().setDsTab('overview'); await go('#/dataset/' + legalDs.id, 400); } },
      { el: '#ds-body .graph', title: 'Visible connections', text: 'Project, equipment, owner, creator and every dataset of the same formulation along the process chain: HME → filament QC → print → DSC/XRPD → dissolution.', before: async () => { A().setDsTab('relations'); await go('#/dataset/' + tourDs.id, 400); } },
      { el: '#eq-sources', title: 'Search by equipment', text: 'Pick an instrument and the Librarian reunites everything it produced – scattered across project shares, the instrument NAS, the analytics drive and SharePoint.', before: async () => { await go('#/equipment/EQ-FDM-01', 400); const d = document.querySelector('#eq-sources details'); if (d) d.open = true; } },
      { el: '#answer', title: 'Ask the Librarian', text: 'A question in plain language is translated into the exact search query – every term is explained, with alternative words.', before: async () => { await go('#/ask', 300); await typeInto('#ask-input', 'Which filaments with HPMCAS were too brittle to print?', 20); A().askNow($('#ask-input').value); await wait(450); } },
      { el: '#concept-detail', title: 'A reusable domain ontology', text: '150+ concepts with definitions, hierarchy, synonyms and German terms – exportable as JSON, CSV, SKOS/Turtle or search-engine synonyms.', before: async () => { A().setOntTab('dictionary'); await go('#/ontology/prop.brittle', 350); } },
      { el: '.modal', title: 'Share open data with third parties', text: 'Data owners release datasets from projects without NDA/CDA that are legally cleared: choose a licence, confirm the checklist – done.', before: async () => { A().setRole('admin', true); A().setOpenTab('candidates'); await go('#/open', 350); A().openReleaseModal([relDs.id]); await wait(250); const l = $('#rel-lic'); if (l) l.value = 'CC BY 4.0'; ['#rel-c1', '#rel-c2'].forEach((s) => { const c = $(s); if (c) c.checked = true; }); } },
      { el: '#open-landing', title: 'Public landing page', text: 'Third parties get a clean page with DOI, licence, citation, files and schema.org metadata – shareable by link, no login needed.', before: async () => { if (!relDs.public) A().releaseDatasets([relDs.id], 'CC BY 4.0'); A().setRole('guest', true); await go('#/open/' + relDs.id, 400); } },
      { el: '#results', title: 'Guest view: catalogue only', text: 'Guests see confidential projects not at all, internal datasets only as catalogue entries without compositions – and open data in full.', before: async () => { A().setRole('guest', true); A().runSearch('itraconazole', {}); await wait(450); } },
      { el: '.arch', title: 'European Health Data Space connection', text: 'A simulated connection to HealthData@EU (Regulation (EU) 2025/327): the Librarian searches the EU dataset catalogue, applies to the national health data access body, works in its secure processing environment and brings anonymised results back into the index.', before: async () => { A().setRole('scientist', true); window.EHDS.setTab('overview'); await go('#/ehds/overview', 400); } },
      { el: '#ehds-catalogue .ehds-ds', title: 'EU health dataset catalogue', text: 'HealthDCAT-AP metadata from (fictional) health data holders across Europe – linked to RCPE projects such as PrintPed. Select datasets and send one application for all countries.', before: async () => { window.EHDS.select(['EHDS-DK-0044', 'EHDS-NL-0061']); await go('#/ehds/catalogue', 400); } },
      { el: '#ehds-outputs', title: 'Permit, secure processing & output checking', text: 'With a data permit, analysis happens only inside the secure processing environment. The HDAB checks every output – approved anonymised results are registered in the Librarian with the permit as provenance.', before: async () => { await go('#/ehds/spe', 400); } },
      { el: '#sources-table', title: 'Administration', text: 'Administrators monitor the crawled server landscape, run crawls, import new data types and export the index or the audit trail.', before: async () => { A().setRole('admin', true); await go('#/admin', 400); } },
      { title: 'That’s The FAIR Librarian', text: 'Findable through one index and an ontology, Accessible through a governed request workflow, Interoperable through a shared schema and vocabulary, Reusable through provenance, legal clarity and open-data releases. The demo state is now reset.' }
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
