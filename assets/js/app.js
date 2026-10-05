/* ==========================================================================
   The FAIR Librarian – Application (router, pages, roles, access workflow)
   ========================================================================== */
(function () {
  const D = window.DATA, O = window.ONTOLOGY, X = window.SEARCH;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const enc = encodeURIComponent;
  const fmtDate = (s) => s ? new Date(s + 'T00:00:00').toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '–';
  const TODAY = '2026-10-05';

  // ---------- icons ----------
  const ICONS = {
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>', filter: '<path d="M3 5h18l-7 8v6l-4 2v-8z"/>',
    lock: '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>', unlock: '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 7.5-2"/>',
    flask: '<path d="M9 3h6M10 3v6L4.5 19a1.5 1.5 0 0 0 1.3 2h12.4a1.5 1.5 0 0 0 1.3-2L14 9V3"/><path d="M7 15h10"/>', shield: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="m9 12 2 2 4-4"/>',
    key: '<circle cx="8" cy="15" r="4"/><path d="m11 12 9-9M17 6l3 3M15 8l2 2"/>', user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 4-6 8-6s7 2 8 6"/>',
    download: '<path d="M12 3v12m0 0-4-4m4 4 4-4M4 21h16"/>', upload: '<path d="M12 15V3m0 0L8 7m4-4 4 4M4 21h16"/>', play: '<path d="M7 4v16l13-8z"/>',
    moon: '<path d="M20 14.5A8 8 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5z"/>', sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>', link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
    folder: '<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>', db: '<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/>',
    cpu: '<rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4"/>', project: '<path d="M3 7h18v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
    book: '<path d="M4 4h6a3 3 0 0 1 3 3v14a2 2 0 0 0-2-2H4z"/><path d="M20 4h-6a3 3 0 0 0-3 3v14a2 2 0 0 1 2-2h7z"/>', check: '<path d="m5 12 5 5L20 7"/>', x: '<path d="M6 6l12 12M18 6 6 18"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>', scale: '<path d="M12 3v18M7 21h10M5 7h14M5 7l-3 7a3 3 0 0 0 6 0zM19 7l-3 7a3 3 0 0 0 6 0z"/>',
    sparkle: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/>', copy: '<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/>',
    list: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>', table: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18M9 4v16"/>',
    graph: '<circle cx="6" cy="6" r="3"/><circle cx="18" cy="6" r="3"/><circle cx="12" cy="18" r="3"/><path d="M8 8l3 7M16 8l-3 7M9 6h6"/>', server: '<rect x="3" y="4" width="18" height="7" rx="2"/><rect x="3" y="13" width="18" height="7" rx="2"/><path d="M7 7.5h.01M7 16.5h.01"/>',
    refresh: '<path d="M20 11a8 8 0 0 0-14.9-4M4 4v4h4M4 13a8 8 0 0 0 14.9 4M20 20v-4h-4"/>', arrow: '<path d="M5 12h14m-6-6 6 6-6 6"/>', info: '<circle cx="12" cy="12" r="9"/><path d="M12 8h.01M11 12h1v5h1"/>',
    send: '<path d="M22 2 11 13M22 2l-7 20-4-9-9-4z"/>', chat: '<path d="M21 12a8 8 0 0 1-11.6 7.1L3 21l1.9-6.4A8 8 0 1 1 21 12z"/>', layers: '<path d="m12 3 9 5-9 5-9-5z"/><path d="m3 13 9 5 9-5"/>',
    printer: '<path d="M6 9V3h12v6M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="7"/>', tag: '<path d="M3 12V3h9l9 9-9 9z"/><circle cx="7.5" cy="7.5" r="1.5"/>',
    beaker: '<path d="M5 3h14M6 3v15a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3V3M6 12h12"/>', thermo: '<path d="M14 14.8V4a2 2 0 0 0-4 0v10.8a4 4 0 1 0 4 0z"/>', drop: '<path d="M12 3s7 7.5 7 12a7 7 0 0 1-14 0c0-4.5 7-12 7-12z"/>', box: '<path d="m12 3 9 4.5v9L12 21l-9-4.5v-9z"/><path d="m3 7.5 9 4.5 9-4.5M12 12v9"/>'
  };
  const ic = (n) => `<svg class="ic" viewBox="0 0 24 24" aria-hidden="true">${ICONS[n] || ''}</svg>`;
  const hydrateIcons = (root = document) => $$('[data-icon]', root).forEach((el) => { el.innerHTML = ic(el.dataset.icon); });

  const TV = { HME: ['HME', '#2563eb'], 'FIL-QC': ['QC', '#3b82f6'], TXA: ['TXA', '#65a30d'], RHEO: ['RHE', '#4d7c0f'], DESIGN: ['CAD', '#a16207'], 'FDM-PRINT': ['FDM', '#d97706'], 'SSE-PRINT': ['SSE', '#ea580c'], 'DPE-PRINT': ['DPE', '#c2410c'], 'SLS-PRINT': ['SLS', '#b45309'], DSC: ['DSC', '#dc2626'], TGA: ['TGA', '#b91c1c'], HSM: ['HSM', '#e11d48'], XRPD: ['XRD', '#7c3aed'], DVS: ['DVS', '#6d28d9'], RAMAN: ['RAM', '#0d9488'], 'RAMAN-MAP': ['MAP', '#0f766e'], 'INLINE-RAMAN': ['PAT', '#0891b2'], NIR: ['NIR', '#0e7490'], FTIR: ['IR', '#14b8a6'], HPLC: ['LC', '#1d4ed8'], DISSO: ['DIS', '#1e40af'], KF: ['KF', '#3730a3'], MICROCT: ['µCT', '#475569'], SEM: ['SEM', '#334155'], PSD: ['PSD', '#9333ea'], PYC: ['PYC', '#a855f7'], STAB: ['STB', '#92400e'] };
  const tv = (t) => TV[t] || [String(t || 'DAT').slice(0, 3).toUpperCase(), '#64748b'];

  // ---------- persistent state ----------
  const LS = 'fairlib.state.v2';
  const loadState = () => { try { return JSON.parse(localStorage.getItem(LS)); } catch (e) { return null; } };
  let ST = loadState() || {};
  ST.role = ST.role || 'scientist';
  ST.requests = ST.requests || null;
  ST.imported = ST.imported || [];
  ST.concepts = ST.concepts || [];
  const save = () => { try { localStorage.setItem(LS, JSON.stringify(ST)); } catch (e) { /* storage unavailable */ } };

  const UI = { q: '', filters: {}, sort: 'relevance', view: 'list', page: 1, showFilters: false, entity: 'datasets', reqTab: null, ontTab: 'dictionary', concept: 'tech.dsc', ontCat: '', ontQ: '', dsTab: 'overview', askQ: '' };

  const person = (id) => D.PEOPLE_BY[id] || { name: id, initials: '?', color: '#64748b', surname: id };
  const user = () => { const r = D.ROLES[ST.role]; return { ...person(r.user), role: ST.role, roleLabel: r.label }; };
  const grants = () => new Set((ST.requests || []).filter((r) => r.status === 'granted' && (!r.expires || r.expires >= TODAY)).map((r) => r.requester + '|' + r.ds));
  const dsById = (id) => D.DATASETS.find((d) => d.id === id);
  const hasAccess = (d) => X.canAccess(user(), d, grants());
  const seeDetails = (d) => X.canSeeDetails(user(), d, grants());
  const visibleToGuest = (d) => !(ST.role === 'guest' && d.cls.startsWith('Confidential'));
  const legalOk = (d) => d.legal === 'Cleared' || d.legal === 'Not required';

  // ---------- seed demo requests ----------
  function seedRequests() {
    const find = (fn) => D.DATASETS.find(fn);
    const a = find((d) => d.project === 'ASD3D' && d.owner === 'p02' && d.legal === 'Cleared' && d.technique === 'XRPD');
    const b = find((d) => d.project === 'PRINTPED' && d.owner === 'p02' && d.legal === 'Cleared' && d.technique === 'DISSO');
    const c = find((d) => d.project === 'CTR-HME-A' && d.technique === 'HME');
    const e = find((d) => d.project === 'PRINTPAT' && d.technique === 'INLINE-RAMAN');
    const f = find((d) => d.project === 'EUPRINT' && d.legal === 'Under legal review');
    const g = find((d) => d.project === 'STABIASD' && d.owner === 'p02' && d.legal === 'Cleared' && d.technique === 'XRPD');
    const H = (t, who, action, comment) => ({ t, who, action, comment });
    const list = [];
    if (a) list.push({ id: 'R-1001', ds: a.id, requester: 'p01', purpose: 'Comparison / benchmark', reason: 'Benchmark of HPMCAS ASD crystallinity against PrintPed minitablet formulations.', duration: '90', created: '2026-09-28', status: 'owner', history: [H('2026-09-28', 'p01', 'Request submitted'), H('2026-09-28', 'system', 'Legal check passed automatically (dataset cleared)')] });
    if (b) list.push({ id: 'R-1002', ds: b.id, requester: 'g01', purpose: 'Joint publication', reason: 'Visiting researcher – comparison with university dissolution set-up.', duration: '30', created: '2026-09-30', status: 'owner', history: [H('2026-09-30', 'g01', 'Request submitted'), H('2026-09-30', 'system', 'Legal check passed automatically (dataset cleared)')] });
    if (c) list.push({ id: 'R-0998', ds: c.id, requester: 'p01', purpose: 'Reuse for new study', reason: 'Extrusion window of Soluplus systems for PrintPed.', duration: '180', created: '2026-08-12', status: 'rejected', history: [H('2026-08-12', 'p01', 'Request submitted'), H('2026-08-14', 'p03', 'Legal check rejected', 'CDA-2025-003: partner-owned results, reuse outside contract scope not permitted.')] });
    if (e) list.push({ id: 'R-0995', ds: e.id, requester: 'p01', purpose: 'Reuse for new study', reason: 'Raman PLS model transfer to pharma FDM system.', duration: '180', created: '2026-07-02', status: 'granted', expires: '2026-12-29', history: [H('2026-07-02', 'p01', 'Request submitted'), H('2026-07-04', 'p03', 'Legal clearance confirmed', 'Internal use only per CDA-2024-014 §4.2'), H('2026-07-07', 'p02', 'Approved by data owner', 'Granted for 180 days.')] });
    if (f) list.push({ id: 'R-1003', ds: f.id, requester: 'p04', purpose: 'Joint publication', reason: 'Joint paper with consortium WP3 on swallowability.', duration: '90', created: '2026-10-01', status: 'legal', history: [H('2026-10-01', 'p04', 'Request submitted'), H('2026-10-01', 'system', 'Routed to Legal & Contracts (dataset under legal review)')] });
    if (g) list.push({ id: 'R-1004', ds: g.id, requester: 'p09', purpose: 'Reuse for new study', reason: 'Reference XRPD patterns for DPE amorphization study.', duration: '90', created: '2026-10-02', status: 'owner', history: [H('2026-10-02', 'p09', 'Request submitted'), H('2026-10-02', 'system', 'Legal check passed automatically (dataset cleared)')] });

    const used = new Set(list.map((r) => r.ds));
    const pick2 = (fn) => D.DATASETS.find((d) => !used.has(d.id) && fn(d));
    const hx = pick2((d) => d.project === 'STABIASD' && d.owner === 'p02' && d.legal === 'Cleared' && d.technique === 'DSC');
    const ix = pick2((d) => d.project === 'ASD3D' && d.owner === 'p02' && d.legal === 'Cleared' && d.technique === 'DSC');
    const jx = pick2((d) => d.project === 'GELPRINT' && d.owner === 'p01' && d.legal === 'Cleared' && d.technique === 'HPLC');
    const kx = pick2((d) => d.project === 'GELPRINT' && d.owner === 'p01' && d.technique === 'RHEO');
    const lx = pick2((d) => d.project === 'PRINTPED' && d.owner === 'p02' && d.legal === 'Cleared' && d.technique === 'DSC');
    if (hx) list.push({ id: 'R-0980', ds: hx.id, requester: 'p01', purpose: 'Comparison / benchmark', reason: 'Tg reference values of aged ASDs for PrintPed stability protocol.', duration: '90', created: '2026-04-08', status: 'granted', expires: '2026-07-08', history: [H('2026-04-08', 'p01', 'Request submitted'), H('2026-04-08', 'system', 'Legal check passed automatically (dataset cleared)'), H('2026-04-10', 'p02', 'Approved by data owner', 'Approved for 90 days – please cite the StabiASD ELN entry.')] });
    if (ix) list.push({ id: 'R-0985', ds: ix.id, requester: 'g01', purpose: 'Joint publication', reason: 'Comparison with university ASD screening data.', duration: '30', created: '2026-06-15', status: 'rejected', history: [H('2026-06-15', 'g01', 'Request submitted'), H('2026-06-15', 'system', 'Legal check passed automatically (dataset cleared)'), H('2026-06-17', 'p02', 'Rejected by data owner', 'External sharing requires a signed CDA between RCPE and your institute – please contact Legal & Contracts.')] });
    if (jx) list.push({ id: 'R-0990', ds: jx.id, requester: 'p09', purpose: 'Reuse for new study', reason: 'Assay method transfer for DPE gummies.', duration: '90', created: '2026-08-20', status: 'rejected', history: [H('2026-08-20', 'p09', 'Request submitted'), H('2026-08-20', 'system', 'Legal check passed automatically (dataset cleared)'), H('2026-08-22', 'p01', 'Rejected by data owner', 'Formulations are still being optimised – please re-request once the v2 data are released (planned Nov 2026).')] });
    if (kx) list.push({ id: 'R-0992', ds: kx.id, requester: 'p04', purpose: 'Comparison / benchmark', reason: 'Benchmark of gel rheology against HME melt rheology.', duration: '180', created: '2026-09-02', status: 'granted', expires: '2027-03-01', history: [H('2026-09-02', 'p04', 'Request submitted'), H(kx.legal === 'Cleared' || kx.legal === 'Not required' ? '2026-09-02' : '2026-09-03', kx.legal === 'Cleared' || kx.legal === 'Not required' ? 'system' : 'p03', kx.legal === 'Cleared' || kx.legal === 'Not required' ? 'Legal check passed automatically (dataset cleared)' : 'Legal clearance confirmed', kx.legal === 'Cleared' || kx.legal === 'Not required' ? '' : 'Internal reuse permitted.'), H('2026-09-04', 'p01', 'Approved by data owner', 'Approved – please share your rheology comparison with the GelPrint team.')] });
    if (lx) list.push({ id: 'R-0994', ds: lx.id, requester: 'g01', purpose: 'Teaching / training', reason: 'Example thermogram for a guest lecture on pediatric formulations.', duration: '30', created: '2026-09-10', status: 'granted', expires: '2026-10-10', history: [H('2026-09-10', 'g01', 'Request submitted'), H('2026-09-10', 'system', 'Legal check passed automatically (dataset cleared)'), H('2026-09-11', 'p02', 'Approved by data owner', 'Approved for 30 days for teaching purposes only.')] });
    return list;
  }

  // ---------- imports (persisted) ----------
  function normalizeImport(o, i) {
    const id = o.id || `DS-IMP-${String(D.DATASETS.length + i + 1).padStart(4, '0')}`;
    const created = o.created || TODAY;
    return {
      id, pid: o.pid || `rcpe:ds:imp.${id}`, name: o.name || id, title: o.title || o.name || id, technique: o.technique || 'OTHER', techName: o.techName || o.technique || 'Dataset',
      process: o.process || 'Characterization', project: D.PRJ_BY[o.project] ? o.project : 'MATLIB', formulation: o.formulation || '–', formLabel: o.formLabel || '', form: o.form || 'sample', mix: o.mix || 'Solo API',
      apis: o.apis || [], excipients: o.excipients || [], components: o.components || [], equipment: (o.equipment || []).filter((e) => D.EQ_BY[e]),
      creator: D.PEOPLE_BY[o.creator] ? o.creator : 'p03', owner: D.PEOPLE_BY[o.owner] ? o.owner : 'p03', created, modified: o.modified || created,
      source: o.source || 'S1', path: o.path || '\\\\fs-matsci01.matsci.example.local\\Imports\\' + id, domain: o.domain || 'MATSCI.EXAMPLE.LOCAL', formats: o.formats || ['csv'], files: o.files || 1, sizeMB: o.sizeMB || 1,
      params: o.params || {}, summary: o.summary || '', tags: (o.tags || []).slice(0, 3), cls: o.cls || 'Open (internal)', legal: o.legal || 'Not required', agreement: o.agreement || '', legalNote: o.legalNote || 'Imported record',
      eln: o.eln || '–', samples: o.samples || [], version: o.version || 'v1', license: o.license || 'RCPE-Internal-Reuse-1.0', fair: o.fair || { F: 85, A: 80, I: 70, R: 75 }, checksum: o.checksum || '–', sensitive: !!o.sensitive,
      description: o.description || '', related: o.related || [], imported: true
    };
  }
  function applyImports() {
    ST.imported.forEach((o) => { if (!dsById(o.id)) D.DATASETS.push(o); });
    ST.concepts.forEach((c) => { if (!O.byId[c.id]) { O.concepts.push(c); O.byId[c.id] = c; } });
    X.rebuildLexicon(); X.buildIndex();
  }

  // ---------- small UI helpers ----------
  function toast(msg, icon = 'check') { const t = document.createElement('div'); t.className = 'toast'; t.innerHTML = `${ic(icon)}<span>${msg}</span>`; $('#toast-root').appendChild(t); setTimeout(() => t.remove(), 3800); }
  function download(name, content, mime = 'application/json') { const b = new Blob([content], { type: mime }); const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 200); }
  const csvCell = (v) => { const s = Array.isArray(v) ? v.join('; ') : String(v ?? ''); return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
  const toCSV = (rows, cols) => [cols.join(','), ...rows.map((r) => cols.map((c) => csvCell(r[c])).join(','))].join('\n');
  function copy(text, label = 'Copied to clipboard') { (navigator.clipboard ? navigator.clipboard.writeText(text) : Promise.reject()).then(() => toast(label, 'copy')).catch(() => toast(label, 'copy')); }
  function modal(title, body, footer = '', wide = false) {
    const root = $('#modal-root');
    root.innerHTML = `<div class="modal-back" id="mback"><div class="modal ${wide ? 'wide' : ''}" role="dialog" aria-modal="true"><div class="modal-h"><h2>${title}</h2><button class="btn btn-ghost btn-sm" data-close>${ic('x')}</button></div><div class="modal-b">${body}</div>${footer ? `<div class="modal-f">${footer}</div>` : ''}</div></div>`;
    $('#mback').addEventListener('click', (e) => { if (e.target.id === 'mback' || e.target.closest('[data-close]')) closeModal(); });
    return $('#mback');
  }
  const closeModal = () => { $('#modal-root').innerHTML = ''; };

  const legalPill = (l) => { const m = { Cleared: ['ok', 'check', 'Legally cleared'], 'Not required': ['info', 'check', 'No restriction'], 'Cleared with conditions': ['gold', 'scale', 'Cleared w/ conditions'], 'Under legal review': ['warn', 'clock', 'Under legal review'], 'Not cleared': ['bad', 'x', 'Not cleared'] }[l] || ['', 'info', l]; return `<span class="pill ${m[0]}" title="Legal status: ${esc(l)}">${ic(m[1])}${m[2]}</span>`; };
  const clsPill = (c) => `<span class="pill ${c.startsWith('Confidential') ? 'bad' : c === 'Open (internal)' ? 'info' : ''}" title="Data classification">${ic(c.startsWith('Confidential') ? 'shield' : 'layers')}${esc(c)}</span>`;
  const accessPill = (d) => hasAccess(d) ? `<span class="pill ok">${ic('unlock')}Access</span>` : `<span class="pill warn">${ic('lock')}Restricted</span>`;
  const personLink = (id) => { const p = person(id); return `<a href="#/search?q=${enc('person:' + p.surname)}" title="${esc(p.title || '')}">${esc(p.name)}</a>`; };
  const avatar = (id, sm) => { const p = person(id); return `<span class="avatar ${sm ? 'sm' : ''}" title="${esc(p.name)}">${esc(p.initials)}</span>`; };
  const eqLink = (id) => D.EQ_BY[id] ? `<a href="#/equipment/${id}">${esc(D.EQ_BY[id].name)}</a>` : esc(id);
  const prjLink = (id) => D.PRJ_BY[id] ? `<a href="#/project/${id}">${esc(D.PRJ_BY[id].name)}</a>` : esc(id);
  const tagBtn = (t) => `<button class="tag" data-q="tag:&quot;${esc(t)}&quot;">${esc(t)}</button>`;
  const dsTitle = (d) => seeDetails(d) ? d.title : `${d.techName} – ${d.formulation} (confidential composition)`;
  const ticon = (t) => `<div class="ticon" title="${esc(t)}">${tv(t)[0]}</div>`;

  // ---------- routing ----------
  function parseHash() { const h = location.hash.slice(1) || '/'; const [path, qs] = h.split('?'); const params = new URLSearchParams(qs || ''); return { parts: path.split('/').filter(Boolean), params }; }
  function go(hash) { if (location.hash === hash) render(); else location.hash = hash; }
  function searchHash(q, filters = UI.filters) { const f = Object.keys(filters).length ? '&f=' + enc(JSON.stringify(filters)) : ''; return `#/search?q=${enc(q || '')}${f}`; }
  function runSearch(q, filters) { UI.q = q; if (filters) UI.filters = filters; UI.page = 1; UI.entity = 'datasets'; go(searchHash(q)); }

  function setActiveNav(key) { $$('#mainnav a').forEach((a) => a.classList.toggle('active', a.dataset.nav === key)); }

  function render() {
    const { parts, params } = parseHash();
    const app = $('#app');
    const r = parts[0] || '';
    closeModal();
    if (r === '' || r === 'search') {
      UI.q = params.get('q') || '';
      try { UI.filters = params.get('f') ? JSON.parse(params.get('f')) : {}; } catch (e) { UI.filters = {}; }
      setActiveNav('search');
      app.innerHTML = (UI.q || Object.keys(UI.filters).length) ? pageResults() : pageHome();
    } else if (r === 'dataset') { setActiveNav('search'); if (UI.lastDs !== parts[1] && !window.__tourActive) UI.dsTab = 'overview'; UI.lastDs = parts[1]; app.innerHTML = pageDataset(parts[1]); }
    else if (r === 'equipment') { setActiveNav('equipment'); app.innerHTML = parts[1] ? pageEquipment(parts[1]) : pageEquipmentList(); }
    else if (r === 'projects' || r === 'project') { setActiveNav('projects'); app.innerHTML = parts[1] ? pageProject(parts[1]) : pageProjectList(); }
    else if (r === 'ask') { setActiveNav('ask'); if (params.get('q')) UI.askQ = params.get('q'); app.innerHTML = pageAsk(); }
    else if (r === 'ontology') { setActiveNav('ontology'); if (parts[1]) { UI.concept = parts[1]; UI.ontTab = 'dictionary'; } app.innerHTML = pageOntology(); }
    else if (r === 'requests') { setActiveNav('requests'); app.innerHTML = pageRequests(); }
    else if (r === 'index') { setActiveNav('index'); app.innerHTML = pageIndex(); }
    else app.innerHTML = `<div class="empty card"><h2>Page not found</h2><p><a href="#/">Back to search</a></p></div>`;
    bindPage(app);
    updateChrome();
    if (!window.__tourActive) window.scrollTo({ top: 0 });
  }

  // ---------- chrome: role switcher, badge, theme ----------
  function updateChrome() {
    const u = user();
    $('#role-btn').innerHTML = `${avatar(u.id)}<span class="who"><b>${esc(u.name)}</b><small>${esc(u.title)}</small></span><span class="role-chip">${esc(u.roleLabel)}</span>`;
    $('#role-menu').innerHTML = `<div class="rm-head">Switch role (demo personas)</div>` + Object.entries(D.ROLES).map(([k, r]) => { const p = person(r.user); return `<button class="role-opt ${k === ST.role ? 'current' : ''}" data-role="${k}">${avatar(p.id)}<span><b>${r.label}</b> · <span class="muted small">${esc(p.name)}</span><p>${esc(r.desc)}</p></span></button>`; }).join('');
    const n = actionable().length;
    const b = $('#req-badge'); b.hidden = !n; b.textContent = n;
    const dark = document.documentElement.dataset.theme !== 'light'; $('#btn-theme').innerHTML = ic(dark ? 'sun' : 'moon'); $('#btn-theme').title = dark ? 'Switch to light mode' : 'Switch to dark mode';
    const idx = $('#mainnav a[data-nav="index"]'); idx.innerHTML = ST.role === 'admin' ? 'Index & Admin' : 'Index';
  }
  function setRole(role, quiet) { ST.role = role; save(); $('#role-menu').classList.remove('open'); render(); if (!quiet) toast(`Now viewing as <b>${D.ROLES[role].label}</b> – ${esc(person(D.ROLES[role].user).name)}`, D.ROLES[role].icon === 'flask' ? 'flask' : D.ROLES[role].icon); }

  // ---------- search box ----------
  function searchBox(compact) {
    const nf = Object.values(UI.filters).reduce((s, v) => s + (v && v.length ? 1 : 0), 0);
    return `<div class="searchbox ${compact ? 'compact' : ''}" id="searchbox">
      <div class="sb-inner">${ic('search')}
        <input class="sb-input" id="q" type="search" autocomplete="off" spellcheck="false" placeholder="Search equipment, datasets, APIs, polymers, projects, people…  e.g. itraconazole DSC" value="${esc(UI.q)}" aria-label="Search the index" />
        <button class="btn" id="btn-filters" title="Add filters">${ic('filter')}Filters${nf ? ` <span class="pill info">${nf}</span>` : ''}</button>
        <button class="btn btn-primary" id="btn-search">${ic('search')}<span class="hide-sm">Search</span></button>
      </div>
      <div class="ac" id="ac" hidden></div>
    </div>
    <div id="filter-panel-wrap">${UI.showFilters ? filterPanel() : ''}</div>`;
  }
  function filterPanel() {
    const f = UI.filters; const v = (k) => (f[k] && f[k][0]) || '';
    const opt = (arr, cur) => `<option value="">Any</option>` + arr.map(([val, lab]) => `<option value="${esc(val)}" ${val === cur ? 'selected' : ''}>${esc(lab)}</option>`).join('');
    const people = D.PEOPLE.filter((p) => p.id !== 'g01').map((p) => [p.surname, p.name]);
    const uniq = (k) => [...new Set(D.DATASETS.map((d) => d[k]))].sort().map((x) => [x, x]);
    return `<div class="card filter-panel" id="filter-panel">
      <div class="row" style="margin-bottom:12px"><h3>${ic('filter')} Filters</h3><span class="muted small">Combine with any search term – filters are AND-combined.</span><span class="spacer"></span><button class="btn btn-sm btn-ghost" id="f-reset">Reset</button><button class="btn btn-sm btn-primary" id="f-apply">Apply filters</button></div>
      <div class="filter-grid">
        <div><label class="fl">Created from</label><input class="input" type="date" data-f="after" value="${v('after')}"></div>
        <div><label class="fl">Created until</label><input class="input" type="date" data-f="before" value="${v('before')}"></div>
        <div><label class="fl">Last changed from</label><input class="input" type="date" data-f="modified-after" value="${v('modified-after')}"></div>
        <div><label class="fl">Last changed until</label><input class="input" type="date" data-f="modified-before" value="${v('modified-before')}"></div>
        <div><label class="fl">Owner</label><select class="input" data-f="owner">${opt(people, v('owner'))}</select></div>
        <div><label class="fl">Creator</label><select class="input" data-f="creator">${opt(people, v('creator'))}</select></div>
        <div><label class="fl">Project</label><select class="input" data-f="project">${opt(D.PROJECTS.map((p) => [p.id, `${p.name} – ${p.title}`]), v('project'))}</select></div>
        <div><label class="fl">Equipment</label><select class="input" data-f="equipment">${opt(D.EQUIPMENT.map((e) => [e.id, `${e.name} (${e.id})`]), v('equipment'))}</select></div>
        <div><label class="fl">Technique</label><select class="input" data-f="technique">${opt(Object.entries(D.TECH).map(([k, t]) => [k, `${t.name} (${k})`]), v('technique'))}</select></div>
        <div><label class="fl">Formulation type</label><select class="input" data-f="mix">${opt(uniq('mix'), v('mix'))}</select></div>
        <div><label class="fl">Legal clearance</label><select class="input" data-f="legal">${opt(uniq('legal'), v('legal'))}</select></div>
        <div><label class="fl">Classification</label><select class="input" data-f="class">${opt(uniq('cls'), v('class'))}</select></div>
        <div><label class="fl">Server domain</label><select class="input" data-f="domain">${opt(uniq('domain'), v('domain'))}</select></div>
        <div><label class="fl">API</label><select class="input" data-f="api">${opt(D.APIS.map((a) => [a.name, a.name]), v('api'))}</select></div>
        <div><label class="fl">Excipient / polymer</label><select class="input" data-f="excipient">${opt(D.EXCIPIENTS.map((a) => [a.name, a.name]), v('excipient'))}</select></div>
        <div><label class="fl">Tag</label><select class="input" data-f="tag">${opt([...new Set(D.DATASETS.flatMap((d) => d.tags))].sort().map((t) => [t, t]), v('tag'))}</select></div>
      </div></div>`;
  }
  function bindSearchBox(root) {
    const inp = $('#q', root); if (!inp) return;
    const ac = $('#ac', root); let items = [], sel = -1;
    const ORDER = ['concept', 'dataset', 'equipment', 'project', 'material', 'person'];
    const LABEL = { concept: 'Ontology concepts – search expands to synonyms', dataset: 'Datasets', equipment: 'Equipment', project: 'Projects', material: 'Materials', person: 'People' };
    const ICN = { concept: 'book', dataset: 'db', equipment: 'cpu', project: 'project', material: 'beaker', person: 'user' };
    const draw = () => {
      items = X.suggest(inp.value, user(), grants());
      items.sort((a, b) => ORDER.indexOf(a.type) - ORDER.indexOf(b.type));
      if (!items.length) { ac.hidden = true; return; }
      let html = '', last = '';
      items.forEach((it, i) => { if (it.type !== last) { html += `<div class="ac-group">${LABEL[it.type]}</div>`; last = it.type; } html += `<div class="ac-item ${i === sel ? 'sel' : ''}" data-i="${i}"><span class="ac-ic">${ic(ICN[it.type])}</span><span style="min-width:0"><b>${esc(it.label)}</b><small>${esc(it.sub || '')}</small></span></div>`; });
      ac.innerHTML = html + `<div class="ac-foot">↑↓ to navigate · Enter to select · Tip: use <code>owner:</code> <code>equipment:</code> <code>after:2025-01-01</code></div>`;
      ac.hidden = false;
    };
    const choose = (it) => {
      ac.hidden = true;
      const toks = inp.value.trim().split(/\s+/); toks.pop();
      const replaced = (val) => (it.whole ? val : [...toks, val].join(' ')).trim();
      if (it.action === 'dataset') go(`#/dataset/${it.value}`);
      else if (it.action === 'equipment') go(`#/equipment/${it.value}`);
      else if (it.action === 'project') go(`#/project/${it.value}`);
      else runSearch(replaced(it.value));
    };
    inp.addEventListener('input', () => { sel = -1; draw(); });
    inp.addEventListener('focus', () => { if (inp.value.length > 1) draw(); });
    inp.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') { e.preventDefault(); sel = Math.min(items.length - 1, sel + 1); draw(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); sel = Math.max(-1, sel - 1); draw(); }
      else if (e.key === 'Enter') { e.preventDefault(); if (sel >= 0 && items[sel] && !ac.hidden) choose(items[sel]); else runSearch(inp.value.trim()); }
      else if (e.key === 'Escape') ac.hidden = true;
    });
    inp.addEventListener('blur', () => setTimeout(() => { ac.hidden = true; }, 180));
    ac.addEventListener('mousedown', (e) => { const el = e.target.closest('.ac-item'); if (el) { e.preventDefault(); choose(items[+el.dataset.i]); } });
    $('#btn-search', root).addEventListener('click', () => runSearch(inp.value.trim()));
    $('#btn-filters', root).addEventListener('click', () => { UI.showFilters = !UI.showFilters; $('#filter-panel-wrap', root).innerHTML = UI.showFilters ? filterPanel() : ''; bindFilterPanel(root); });
    bindFilterPanel(root);
  }
  function bindFilterPanel(root) {
    const p = $('#filter-panel', root); if (!p) return;
    $('#f-apply', p).addEventListener('click', () => {
      const f = {}; $$('[data-f]', p).forEach((el) => { if (el.value) f[el.dataset.f] = [el.value]; });
      UI.showFilters = false; runSearch($('#q', root).value.trim(), f);
    });
    $('#f-reset', p).addEventListener('click', () => { $$('[data-f]', p).forEach((el) => { el.value = ''; }); });
  }

  // ---------- HOME ----------
  function pageHome() {
    const nVisible = D.DATASETS.filter(visibleToGuest).length;
    const recent = D.DATASETS.filter(visibleToGuest).slice().sort((a, b) => b.modified.localeCompare(a.modified)).slice(0, 6);
    const browse = [
      ['FDM printing', 'process:FDM', 'printer', '#d97706'], ['Hot-melt extrusion', 'process:HME', 'thermo', '#2563eb'], ['Semi-solid extrusion', 'process:SSE', 'drop', '#ea580c'],
      ['Direct powder extrusion', 'process:DPE', 'box', '#c2410c'], ['Laser sintering', 'process:SLS', 'sparkle', '#b45309'], ['Solo API references', 'mix:"Solo API"', 'beaker', '#dc2626'],
      ['API + excipient', 'mix:"API + excipient"', 'layers', '#7c3aed'], ['Ternary systems', 'mix:"API + polymer + additive"', 'layers', '#6d28d9'], ['Polypills (multi-API)', 'mix:"Multi-API"', 'graph', '#0f766e'], ['Stability studies', 'tag:"stability study"', 'clock', '#92400e']
    ];
    return `<section class="hero" id="hero">
      <span class="eyebrow">RCPE Research Data Index</span>
      <h1>The <em>FAIR</em> Librarian</h1>
      <p class="lead">One search across every project share, instrument storage and collaboration site – findable, accessible, interoperable and reusable research data for pharmaceutical materials science.</p>
      ${searchBox(false)}
      <div class="hero-links">Not sure what to type? <a href="#/ask">${ic('chat')} Ask the Librarian</a> · <a href="#/ontology">${ic('book')} Browse the ontology</a></div>
    </section>
    <div class="stats" id="stats">
      ${[[nVisible.toLocaleString('en'), 'Indexed datasets', 'db'], [D.EQUIPMENT.length, 'Equipment items', 'cpu'], [D.PROJECTS.length, 'Projects', 'project'], [D.SOURCES.length, 'Server sources / domains', 'server'], [O.concepts.length, 'Ontology concepts', 'book'], [O.concepts.reduce((s, c) => s + c.alt.length, 0), 'Synonyms & translations', 'chat']].map(([v, l, i]) => `<div class="card stat"><div class="v">${v}</div><div class="l">${ic(i)} ${l}</div></div>`).join('')}
    </div>
    <div class="section-title"><h2>Browse the landscape</h2><span class="muted small">Focus: pharmaceutical 3D printing & materials science</span></div>
    <div class="browse">${browse.map(([l, q, i, c]) => { const n = X.search(q, { user: user(), grants: grants() }).results.length; return `<a href="${searchHash(q, {})}"><span class="bi">${ic(i)}</span><b>${l}</b><small>${n} datasets</small></a>`; }).join('')}</div>
    <div class="section-title"><h2>Recently changed</h2><span class="spacer"></span><a href="${searchHash('', { 'modified-after': ['2026-09-01'] })}" class="small">Show all changed since Sept 2026 ${ic('arrow')}</a></div>
    <div>${recent.map((d) => resultCard({ d, access: hasAccess(d), details: seeDetails(d) })).join('')}</div>`;
  }

  // ---------- RESULTS ----------
  const PAGE = 20;
  let lastResults = [];
  function pageResults() {
    const res = X.search(UI.q, { filters: UI.filters, user: user(), grants: grants(), sort: UI.sort });
    lastResults = res.results;
    const F = X.facets(res.results);
    const qn = X.norm(UI.q);
    const eqMatches = qn ? D.EQUIPMENT.filter((e) => X.norm(`${e.id} ${e.name} ${e.model} ${e.category}`).includes(qn) || res.groups.some((g) => g.type === 'term' && X.norm(`${e.name} ${e.model}`).includes(g.text))) : [];
    const prMatches = qn ? D.PROJECTS.filter((p) => X.norm(`${p.id} ${p.name} ${p.title} ${p.desc}`).includes(qn)) : [];
    const understood = res.groups.map((g) => g.type === 'concept' ? `<span class="chip" title="${esc(g.concept.def)}"><span class="dot" style="background:${O.CATEGORIES[g.concept.cat].color}"></span><b>${esc(g.concept.label)}</b> <span class="faint xs">${esc(O.CATEGORIES[g.concept.cat].label)}${X.norm(g.concept.label) !== g.text ? ' · from "' + esc(g.text) + '"' : ''}</span> <a href="#/ontology/${g.concept.id}" title="Open in ontology">${ic('book')}</a></span>` : `<span class="chip"><span class="dot" style="background:#94a3b8"></span>"${esc(g.text)}" <span class="faint xs">free text</span></span>`).join('');
    const fchips = Object.entries(res.fields).flatMap(([k, vals]) => vals.map((v) => `<span class="chip"><span class="faint xs">${esc(k)}:</span> <b>${esc(v)}</b> ${UI.filters[k] && UI.filters[k].includes(v) ? `<button data-unfilter="${esc(k)}" data-val="${esc(v)}" title="Remove filter">×</button>` : ''}</span>`)).join('');
    const pages = Math.max(1, Math.ceil(res.results.length / PAGE));
    UI.page = Math.min(UI.page, pages);
    const slice = res.results.slice((UI.page - 1) * PAGE, UI.page * PAGE);
    const tabs = `<div class="tabs" id="entity-tabs">
      <button data-entity="datasets" class="${UI.entity === 'datasets' ? 'active' : ''}">${ic('db')} Datasets <span class="pill">${res.results.length}</span></button>
      <button data-entity="equipment" class="${UI.entity === 'equipment' ? 'active' : ''}">${ic('cpu')} Equipment <span class="pill">${eqMatches.length}</span></button>
      <button data-entity="projects" class="${UI.entity === 'projects' ? 'active' : ''}">${ic('project')} Projects <span class="pill">${prMatches.length}</span></button></div>`;
    let main = '';
    if (UI.entity === 'equipment') main = eqMatches.length ? `<div class="grid g2">${eqMatches.map(eqCard).join('')}</div>` : `<div class="empty card">No equipment matches "${esc(UI.q)}".</div>`;
    else if (UI.entity === 'projects') main = prMatches.length ? `<div class="grid g2">${prMatches.map(projectCard).join('')}</div>` : `<div class="empty card">No projects match "${esc(UI.q)}".</div>`;
    else {
      main = `<div class="toolbar" id="res-toolbar"><span class="count">${res.results.length.toLocaleString('en')} datasets</span>${res.partial ? `<span class="pill warn" title="No dataset matched all terms">${ic('info')}Partial matches</span>` : ''}<span class="spacer"></span>
        <select class="input" id="sort"><option value="relevance">Sort: relevance</option><option value="created">Newest created</option><option value="modified">Last changed</option><option value="name">Name A–Z</option></select>
        <span class="seg" id="viewseg"><button data-view="list" class="${UI.view === 'list' ? 'on' : ''}">${ic('list')}List</button><button data-view="table" class="${UI.view === 'table' ? 'on' : ''}">${ic('table')}Table</button></span>
        <button class="btn btn-sm" id="exp-csv">${ic('download')}CSV</button><button class="btn btn-sm" id="exp-json">${ic('download')}JSON</button></div>`;
      if (!res.results.length) main += `<div class="empty card"><h3>No datasets found</h3><p>Try fewer terms, remove filters, or <a href="#/ask?q=${enc(UI.q)}">ask the Librarian</a> to translate your question.</p></div>`;
      else if (UI.view === 'table') main += resultTable(slice);
      else main += slice.map(resultCard).join('');
      if (pages > 1) main += `<div class="pager">${UI.page > 1 ? `<button class="btn btn-sm" data-page="${UI.page - 1}">‹ Prev</button>` : ''}<span class="muted small" style="align-self:center">Page ${UI.page} of ${pages}</span>${UI.page < pages ? `<button class="btn btn-sm" data-page="${UI.page + 1}">Next ›</button>` : ''}</div>`;
    }
    return `${searchBox(true)}
      ${(understood || fchips) ? `<div class="understood" id="understood">${ic('sparkle')} <span>Understood as:</span> ${understood} ${fchips}</div>` : ''}
      <div class="results-layout"><aside class="card facets" id="facets">${facetsHtml(F)}</aside><section id="results">${tabs}${main}</section></div>`;
  }
  function facetsHtml(F) {
    const block = (title, key, field, label = (x) => x, limit = 8) => {
      const entries = Object.entries(F[key]).sort((a, b) => b[1] - a[1]).slice(0, limit);
      if (!entries.length) return '';
      return `<div class="facet"><h4>${title}</h4>${entries.map(([v, n]) => { const on = (UI.filters[field] || []).includes(v); return `<button class="${on ? 'on' : ''}" data-facet="${field}" data-val="${esc(v)}"><span>${esc(label(v))}</span><span>${n}</span></button>`; }).join('')}</div>`;
    };
    return `<div class="row"><h3>Refine</h3><span class="spacer"></span>${Object.keys(UI.filters).length ? '<button class="btn btn-sm btn-ghost" id="clear-filters">Clear all</button>' : ''}</div>` +
      block('Project', 'project', 'project', (v) => D.PRJ_BY[v] ? D.PRJ_BY[v].name : v) +
      block('Technique', 'technique', 'technique', (v) => D.TECH[v] ? D.TECH[v].name : v) +
      block('Formulation type', 'mix', 'mix') +
      block('Legal clearance', 'legal', 'legal') +
      block('Classification', 'class', 'class') +
      block('Equipment', 'equipment', 'equipment', (v) => D.EQ_BY[v] ? D.EQ_BY[v].name : v, 6) +
      block('Owner', 'owner', 'owner', (v) => person(v).name, 6) +
      block('Server domain', 'domain', 'domain') +
      block('Tag', 'tag', 'tag');
  }
  function resultCard(r) {
    const d = r.d; const det = r.details !== undefined ? r.details : seeDetails(d); const acc = r.access !== undefined ? r.access : hasAccess(d);
    return `<article class="card res" data-ds="${d.id}">
      ${ticon(d.technique)}
      <div style="min-width:0">
        <h3><a href="#/dataset/${d.id}">${esc(det ? d.title : dsTitle(d))}</a></h3>
        <div class="nm">${esc(d.name)}</div>
        <div class="meta">
          <span>${ic('project')} ${prjLink(d.project)}</span>
          ${d.equipment.length ? `<span>${ic('cpu')} ${d.equipment.map(eqLink).join(', ')}</span>` : ''}
          <span>${ic('user')} ${personLink(d.owner)} <span class="faint">(owner)</span></span>
          <span title="Created / last changed">${ic('clock')} ${fmtDate(d.created)} · changed ${fmtDate(d.modified)}</span>
          <span>${ic('server')} ${esc(d.domain)}</span>
        </div>
        ${det && acc && d.summary ? `<div class="sum">${esc(d.summary)}</div>` : ''}
        ${!acc ? `<div class="lockline">${ic('lock')} Metadata preview only – data access requires approval.</div>` : ''}
        ${d.tags.length ? `<div class="row" style="margin-top:6px;gap:6px">${d.tags.map(tagBtn).join('')}</div>` : ''}
      </div>
      <div class="side">${legalPill(d.legal)}${clsPill(d.cls)}${accessPill(d)}</div>
    </article>`;
  }
  function resultTable(rows) {
    return `<div class="card" style="overflow:auto"><table class="tbl"><thead><tr><th>Dataset</th><th>Technique</th><th>Project</th><th>Equipment</th><th>Owner</th><th>Creator</th><th>Created</th><th>Changed</th><th>Legal</th><th>Access</th></tr></thead><tbody>
      ${rows.map(({ d }) => `<tr><td><a href="#/dataset/${d.id}">${esc(d.name)}</a><div class="xs muted">${esc(dsTitle(d))}</div></td><td>${esc(d.technique)}</td><td>${prjLink(d.project)}</td><td>${d.equipment.map(eqLink).join('<br>') || '–'}</td><td>${personLink(d.owner)}</td><td>${personLink(d.creator)}</td><td>${d.created}</td><td>${d.modified}</td><td>${legalPill(d.legal)}</td><td>${accessPill(d)}</td></tr>`).join('')}
    </tbody></table></div>`;
  }
  function exportRows(rows) {
    return rows.map(({ d }) => { const det = seeDetails(d), acc = hasAccess(d); return { id: d.id, pid: d.pid, name: d.name, title: dsTitle(d), technique: d.technique, project: d.project, formulation: d.formulation, composition: det ? d.components.map((c) => `${c.name} ${c.pct}%`).join(' / ') : 'confidential', equipment: d.equipment.join('; '), owner: person(d.owner).name, creator: person(d.creator).name, created: d.created, modified: d.modified, classification: d.cls, legal: d.legal, domain: d.domain, path: acc ? d.path : '(restricted)', tags: d.tags.join('; ') }; });
  }

  // ---------- equipment ----------
  function eqStats(e) { const ds = D.DATASETS.filter((d) => d.equipment.includes(e.id) && visibleToGuest(d)); return { ds, projects: [...new Set(ds.map((d) => d.project))], sources: [...new Set(ds.map((d) => d.source))] }; }
  function eqCard(e) {
    const s = eqStats(e);
    return `<div class="card ecard"><div class="row"><span class="eq-ic">${ic('cpu')}</span><div style="flex:1;min-width:0"><h3><a href="#/equipment/${e.id}">${esc(e.name)}</a></h3><div class="xs muted mono">${e.id} · ${esc(e.category)}</div></div><span class="pill ${e.status === 'Operational' ? 'ok' : 'warn'}">${esc(e.status)}</span></div>
      <div class="small muted">${esc(e.model)}</div>
      <div class="row small"><span><b>${s.ds.length}</b> datasets</span><span><b>${s.projects.length}</b> projects</span><span><b>${s.sources.length}</b> server locations</span><span class="spacer"></span><a href="${searchHash('equipment:' + e.id, {})}">All data ${ic('arrow')}</a></div></div>`;
  }
  function pageEquipmentList() {
    const cats = [...new Set(D.EQUIPMENT.map((e) => e.category))];
    return `<div class="page-head"><h1>Equipment</h1><span class="muted">${D.EQUIPMENT.length} indexed instruments – every dataset is linked to the equipment that produced it</span><span class="spacer"></span><input class="input" style="max-width:280px" id="eq-filter" placeholder="Filter equipment…"></div>
      ${cats.map((c) => `<div class="section-title eq-cat"><h2>${esc(c)}</h2></div><div class="grid g3 eq-grid">${D.EQUIPMENT.filter((e) => e.category === c).map((e) => `<div class="eq-wrap" data-txt="${esc(X.norm(e.name + ' ' + e.model + ' ' + e.id))}">${eqCard(e)}</div>`).join('')}</div>`).join('')}`;
  }
  function pageEquipment(id) {
    const e = D.EQ_BY[id]; if (!e) return `<div class="empty card">Equipment ${esc(id)} not found.</div>`;
    const s = eqStats(e);
    const bySource = {};
    s.ds.forEach((d) => { const folder = d.path.replace(/[\\/][^\\/]+$/, ''); ((bySource[d.source] = bySource[d.source] || {})[folder] = bySource[d.source][folder] || []).push(d); });
    return `<div class="crumbs"><a href="#/equipment">Equipment</a> › ${esc(e.category)}</div>
      <div class="card ds-head"><div><div class="row"><span class="eq-ic">${ic('cpu')}</span><span class="pill ${e.status === 'Operational' ? 'ok' : 'warn'}">${esc(e.status)}</span><span class="pill">${esc(e.category)}</span></div>
        <h1>${esc(e.name)}</h1><div class="mono small muted">${e.id} · ${esc(e.inventory)}</div><p class="muted">${esc(e.model)}</p>
        <dl class="kv" style="max-width:640px"><dt>Location</dt><dd>${esc(e.location)}</dd><dt>Responsible</dt><dd>${personLink(e.responsible)}</dd><dt>Last calibration</dt><dd>${fmtDate(e.calibrated)}</dd><dt>Techniques</dt><dd>${e.techniques.map((t) => `<a href="${searchHash('technique:' + t, {})}">${esc(D.TECH[t].name)}</a>`).join(', ')}</dd></dl></div>
        <div class="ds-actions"><a class="btn btn-primary" href="${searchHash('equipment:' + e.id, {})}">${ic('search')} Search all ${s.ds.length} datasets</a><button class="btn" data-copy="${esc(e.id)}">${ic('copy')} Copy equipment ID</button></div></div>
      <div class="grid g4" style="margin-top:16px">${[[s.ds.length, 'Linked datasets'], [s.projects.length, 'Projects'], [s.sources.length, 'Server sources'], [Object.values(bySource).reduce((n, f) => n + Object.keys(f).length, 0), 'Distinct folders']].map(([v, l]) => `<div class="card stat"><div class="v">${v}</div><div class="l">${l}</div></div>`).join('')}</div>
      <div class="section-title"><h2>Data scattered across the server landscape</h2><span class="muted small">The index reunites everything this instrument produced – wherever it was saved.</span></div>
      <div id="eq-sources">${Object.entries(bySource).map(([src, folders]) => { const S = D.SOURCES.find((x) => x.id === src); return `<div class="card pad" style="margin-bottom:12px"><div class="row"><span class="eq-ic">${ic('server')}</span><div><h3>${esc(S.name)}</h3><div class="xs muted mono">${esc(S.domain)} · ${esc(S.host)}</div></div><span class="spacer"></span><span class="pill">${Object.values(folders).flat().length} datasets in ${Object.keys(folders).length} folders</span></div>
        <details style="margin-top:10px"><summary class="small" style="cursor:pointer">Show folders & datasets</summary>${Object.entries(folders).slice(0, 25).map(([f, list]) => `<div style="margin-top:10px"><div class="path">${ic('folder')} ${esc(f)}</div><ul class="small" style="margin:6px 0 0 4px;padding-left:18px">${list.slice(0, 8).map((d) => `<li><a href="#/dataset/${d.id}">${esc(d.name)}</a> <span class="faint">· ${prjLink(d.project)} · ${d.created}</span> ${hasAccess(d) ? '' : ic('lock')}</li>`).join('')}${list.length > 8 ? `<li class="faint">+ ${list.length - 8} more</li>` : ''}</ul></div>`).join('')}</details></div>`; }).join('') || '<div class="empty card">No datasets yet.</div>'}</div>
      <div class="section-title"><h2>Projects using this equipment</h2></div>
      <div class="grid g3">${s.projects.map((p) => projectCard(D.PRJ_BY[p])).join('')}</div>`;
  }

  // ---------- projects ----------
  function projectCard(p) {
    const n = D.DATASETS.filter((d) => d.project === p.id && visibleToGuest(d)).length;
    return `<div class="card ecard"><div class="row"><span class="eq-ic">${ic('project')}</span><div style="flex:1;min-width:0"><h3><a href="#/project/${p.id}">${esc(p.name)}</a></h3><div class="xs muted">${esc(p.funding)}</div></div><span class="pill ${p.status === 'Active' ? 'ok' : ''}">${esc(p.status)}</span></div>
      <div class="small">${esc(p.title)}</div><div class="row">${clsPill(p.cls)}<span class="pill">${n} datasets</span></div>
      <div class="row small muted"><span>PI ${personLink(p.pi)}</span><span>· Data owner ${personLink(p.owner)}</span></div></div>`;
  }
  function pageProjectList() {
    const vis = D.PROJECTS.filter((p) => !(ST.role === 'guest' && p.cls.startsWith('Confidential')));
    return `<div class="page-head"><h1>Projects</h1><span class="muted">${vis.length} projects in the index</span></div><div class="grid g3" style="margin-top:16px">${vis.map(projectCard).join('')}</div>`;
  }
  function pageProject(id) {
    const p = D.PRJ_BY[id]; if (!p) return `<div class="empty card">Project not found.</div>`;
    if (ST.role === 'guest' && p.cls.startsWith('Confidential')) return `<div class="locked card">${ic('lock')}<div><h3>Confidential project</h3><p>This project is not visible for guest accounts.</p></div></div>`;
    const ds = D.DATASETS.filter((d) => d.project === id);
    const forms = {}; ds.forEach((d) => { (forms[d.formulation] = forms[d.formulation] || []).push(d); });
    const eqs = [...new Set(ds.flatMap((d) => d.equipment))];
    const member = p.members.includes(user().id) || ST.role === 'admin';
    return `<div class="crumbs"><a href="#/projects">Projects</a> › ${esc(p.name)}</div>
      <div class="card ds-head"><div><div class="row">${clsPill(p.cls)}<span class="pill ${p.status === 'Active' ? 'ok' : ''}">${esc(p.status)}</span>${member ? `<span class="pill ok">${ic('check')}You are a member</span>` : ''}</div>
        <h1>${esc(p.name)} <span class="muted" style="font-size:1rem">${esc(p.id)}</span></h1><p style="margin:4px 0 12px;font-size:1.05rem">${esc(p.title)}</p><p class="muted">${esc(p.desc)}</p>
        <dl class="kv" style="max-width:720px"><dt>Funding</dt><dd>${esc(p.funding)}</dd><dt>Partner</dt><dd>${esc(p.partner)}</dd><dt>Runtime</dt><dd>${fmtDate(p.start)} – ${fmtDate(p.end)}</dd><dt>Agreement</dt><dd>${esc(p.agreement || '–')}</dd><dt>Processes</dt><dd>${p.proc.map((x) => `<a href="${searchHash('process:' + x + ' project:' + p.id, {})}">${x === 'SOLO' ? 'Raw-material characterization' : x}</a>`).join(', ')}</dd><dt>Data owner</dt><dd>${personLink(p.owner)}</dd></dl></div>
        <div class="ds-actions"><a class="btn btn-primary" href="${searchHash('project:' + p.id, {})}">${ic('search')} Search ${ds.length} datasets</a><button class="btn" id="exp-project" data-id="${p.id}">${ic('download')} Export metadata</button></div></div>
      <div class="grid g2" style="margin-top:16px">
        <div class="card pad"><h3>Team</h3><div style="margin-top:10px">${p.members.map((m) => `<div class="row" style="margin-bottom:8px">${avatar(m)}<div>${personLink(m)}<div class="xs muted">${esc(person(m).title)}${m === p.pi ? ' · <b>PI</b>' : ''}</div></div></div>`).join('')}</div></div>
        <div class="card pad"><h3>Equipment used</h3><div style="margin-top:10px" class="row">${eqs.map((e) => `<a class="pill info" href="#/equipment/${e}">${ic('cpu')}${esc(D.EQ_BY[e].name)}</a>`).join('')}</div></div>
      </div>
      <div class="section-title"><h2>Formulations & sample sets</h2><span class="muted small">${Object.keys(forms).length} formulations – each links all datasets generated along the process chain</span></div>
      <div class="card" style="overflow:auto"><table class="tbl"><thead><tr><th>Formulation</th><th>Composition (w/w %)</th><th>Type</th><th>Datasets</th><th>Process chain</th></tr></thead><tbody>
      ${Object.entries(forms).map(([f, list]) => { const d0 = list[0]; const det = seeDetails(d0); return `<tr><td class="mono">${esc(f)}</td><td>${det ? esc(d0.components.map((c) => `${c.name} ${c.pct}`).join(' / ')) : '<span class="mask">confidential composition</span>'}</td><td>${esc(d0.mix)}</td><td><a href="${searchHash('project:' + p.id + ' "' + f.split('-').pop() + '"', {})}">${list.length}</a></td><td>${list.map((d) => `<a href="#/dataset/${d.id}" title="${esc(d.techName)}" class="pill" style="margin:1px">${esc(d.technique)}</a>`).join('')}</td></tr>`; }).join('')}
      </tbody></table></div>`;
  }

  // ---------- dataset ----------
  function graphSvg(d) {
    const W = 760, H = 330, cx = W / 2, cy = H / 2;
    const nodes = [], links = [];
    const add = (x, y, label, sub, href, color) => { nodes.push({ x, y, label, sub, href, color }); links.push([cx, cy, x, y]); };
    const p = D.PRJ_BY[d.project];
    add(110, cy, p.name, 'Project', `#/project/${p.id}`, 'var(--ink)');
    d.equipment.forEach((e, i) => add(cx - 60 + (i - (d.equipment.length - 1) / 2) * 190, 42, D.EQ_BY[e].name, 'Equipment', `#/equipment/${e}`, '#666CA1'));
    add(cx - 170, H - 40, person(d.owner).name, 'Owner', `#/search?q=${enc('person:' + person(d.owner).surname)}`, 'var(--muted)');
    if (d.creator !== d.owner) add(cx + 15, H - 40, person(d.creator).name, 'Creator', `#/search?q=${enc('person:' + person(d.creator).surname)}`, 'var(--muted)');
    const rel = (d.related || []).map(dsById).filter(Boolean).filter(visibleToGuest).slice(0, 6);
    rel.forEach((r, i) => add(W - 95, 30 + i * ((H - 60) / Math.max(1, rel.length - 1 || 1)) + (rel.length === 1 ? (H - 60) / 2 : 0), r.technique, r.techName, `#/dataset/${r.id}`, 'var(--faint)'));
    const box = (n, w = 150) => `<a href="${n.href}" class="node"><g><rect x="${n.x - w / 2}" y="${n.y - 19}" width="${w}" height="38" rx="9" style="fill:var(--surface-2);stroke:${n.color}" stroke-width="1.4"/><text x="${n.x}" y="${n.y - 3}" text-anchor="middle" font-weight="600">${esc(n.label.length > 22 ? n.label.slice(0, 21) + '…' : n.label)}</text><text x="${n.x}" y="${n.y + 11}" text-anchor="middle" fill="var(--muted)" style="fill:var(--muted);font-size:9.5px">${esc(n.sub.length > 26 ? n.sub.slice(0, 25) + '…' : n.sub)}</text></g></a>`;
    return `<svg class="graph" viewBox="0 0 ${W} ${H}" role="img" aria-label="Relationship graph">${links.map(([a, b, c, e]) => `<line x1="${a}" y1="${b}" x2="${c}" y2="${e}"/>`).join('')}${nodes.map((n) => box(n)).join('')}
      <g><rect x="${cx - 95}" y="${cy - 24}" width="190" height="48" rx="12" fill="#E6224F" /><text x="${cx}" y="${cy - 4}" text-anchor="middle" style="fill:#fff;font-weight:700">${esc(d.technique)}</text><text x="${cx}" y="${cy + 12}" text-anchor="middle" style="fill:#fff;font-size:10px">${esc(d.formulation)}</text></g></svg>`;
  }
  function myRequestFor(d) { const u = user(); return (ST.requests || []).filter((r) => r.ds === d.id && r.requester === u.id).sort((a, b) => b.id.localeCompare(a.id))[0]; }
  function pageDataset(id) {
    const d = dsById(id);
    if (!d || !visibleToGuest(d)) return `<div class="empty card"><h2>Dataset not available</h2><p>The dataset does not exist or is not visible for your role.</p><a href="#/">Back to search</a></div>`;
    const acc = hasAccess(d), det = seeDetails(d), p = D.PRJ_BY[d.project];
    const req = myRequestFor(d);
    const reqState = req ? { legal: 'Waiting for legal clearance', owner: 'Waiting for data-owner approval', granted: 'Access granted', rejected: 'Request rejected' }[req.status] : '';
    const actions = acc
      ? `<button class="btn btn-primary" id="open-loc" data-path="${esc(d.path)}">${ic('folder')} Open data location</button><button class="btn" data-copy="${esc(d.path)}">${ic('copy')} Copy path</button>`
      : (req && req.status !== 'rejected' ? `<a class="btn btn-gold" href="#/requests">${ic('clock')} ${reqState}</a>` : `<button class="btn btn-gold" id="req-access" data-id="${d.id}">${ic('key')} Request access</button>${req ? `<span class="xs muted">Previous request rejected</span>` : ''}`);
    const lb = legalOk(d) ? 'ok' : d.legal === 'Not cleared' ? 'bad' : 'warn';
    const legalBanner = `<div class="legal-banner ${lb}" id="legal-banner">${ic(lb === 'ok' ? 'check' : lb === 'bad' ? 'x' : 'scale')}<div><b>${esc(d.legal)}</b>${d.agreement ? ` · ${esc(d.agreement)}` : ''}<p>${esc(d.legalNote)}</p></div></div>`;
    const tabs = [['overview', 'Overview', 'info'], ['composition', 'Composition & parameters', 'beaker'], ['provenance', 'Provenance & storage', 'server'], ['legal', 'Legal & access', 'scale'], ['relations', 'Relations', 'graph']];
    const locked = `<div class="locked" id="locked-panel">${ic('lock')}<div style="flex:1"><h3>Detailed metadata & data location are restricted</h3><p class="small">You can see that this dataset exists and who owns it – details such as ${d.sensitive ? 'composition, ' : ''}process parameters, results summary and storage path are shown once access is approved by the ${legalOk(d) ? 'data owner' : 'legal office and the data owner'}.</p><div class="row">${req && req.status !== 'rejected' ? `<a class="btn btn-sm" href="#/requests">${ic('clock')} ${reqState}</a>` : `<button class="btn btn-gold btn-sm" data-req="${d.id}">${ic('key')} Request access</button>`}</div></div></div>`;
    let body = '';
    const t = UI.dsTab;
    if (t === 'overview') {
      body = `<div class="grid g2"><div class="card pad"><h3>Description</h3><p>${det ? esc(d.description) : `<span class="muted">${esc(d.techName)} within project ${esc(p.name)} – composition confidential.</span>`}</p>
        ${acc && d.summary ? `<h3 style="margin-top:14px">Result summary (metadata)</h3><p>${esc(d.summary)}</p>` : ''}
        ${d.tags.length ? `<div class="row" style="gap:6px">${d.tags.map(tagBtn).join('')}</div>` : ''}</div>
        <div class="card pad"><h3>Key facts</h3><dl class="kv" style="margin-top:10px"><dt>Technique</dt><dd><a href="${searchHash('technique:' + d.technique, {})}">${esc(d.techName)}</a></dd><dt>Process</dt><dd>${esc(d.process)}</dd><dt>Project</dt><dd>${prjLink(d.project)}</dd><dt>Formulation</dt><dd class="mono">${esc(d.formulation)}</dd><dt>Formulation type</dt><dd>${esc(d.mix)}</dd><dt>Sample form</dt><dd>${esc(d.form)}</dd><dt>Equipment</dt><dd>${d.equipment.map(eqLink).join(', ') || '–'}</dd><dt>Owner</dt><dd>${personLink(d.owner)}</dd><dt>Creator</dt><dd>${personLink(d.creator)}</dd><dt>Created</dt><dd>${fmtDate(d.created)}</dd><dt>Last changed</dt><dd>${fmtDate(d.modified)}</dd></dl></div></div>
        <div class="card pad" style="margin-top:16px"><h3>FAIR assessment</h3><div class="fair" style="margin-top:10px">${Object.entries({ F: 'Findable', A: 'Accessible', I: 'Interoperable', R: 'Reusable' }).map(([k, l]) => `<div class="f"><div class="xs muted">${l}</div><b>${d.fair[k]}</b><span class="muted">/100</span><div class="bar"><i style="width:${d.fair[k]}%"></i></div></div>`).join('')}</div></div>`;
    } else if (t === 'composition') {
      body = !acc ? locked : `<div class="grid g2"><div class="card pad"><h3>Composition</h3>${d.components.length ? `<table class="tbl" style="margin-top:8px"><thead><tr><th>Component</th><th>Function</th><th>w/w %</th></tr></thead><tbody>${d.components.map((c) => `<tr><td>${D.MAT[c.name] ? `<a href="${searchHash((D.MAT[c.name].kind === 'API' ? 'api:' : 'excipient:') + '"' + c.name + '"', {})}">${esc(c.name)}</a>` : esc(c.name)}</td><td>${esc(c.role)}</td><td>${c.pct}</td></tr>`).join('')}</tbody></table>` : '<p class="muted">–</p>'}</div>
        <div class="card pad"><h3>Method / process parameters</h3><dl class="kv" style="margin-top:10px">${Object.entries(d.params).map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('') || '<dd class="muted">–</dd>'}</dl></div></div>`;
    } else if (t === 'provenance') {
      body = !acc ? locked : `<div class="grid g2"><div class="card pad"><h3>Provenance</h3><dl class="kv" style="margin-top:10px"><dt>Persistent ID</dt><dd class="mono">${esc(d.pid)}</dd><dt>Version</dt><dd>${esc(d.version)}</dd><dt>ELN entry</dt><dd class="mono">${esc(d.eln)}</dd><dt>Sample IDs (LIMS)</dt><dd class="mono">${esc(d.samples.join(', '))}</dd><dt>Instrument</dt><dd>${d.equipment.map(eqLink).join(', ') || 'Digital'}</dd><dt>Created by</dt><dd>${personLink(d.creator)} · ${fmtDate(d.created)}</dd><dt>Last changed</dt><dd>${fmtDate(d.modified)}</dd></dl></div>
        <div class="card pad"><h3>Storage location</h3><dl class="kv" style="margin-top:10px"><dt>Source</dt><dd>${esc(D.SOURCES.find((s) => s.id === d.source).name)}</dd><dt>Domain</dt><dd>${esc(d.domain)}</dd><dt>Files</dt><dd>${d.files} files · ${d.sizeMB} MB</dd><dt>Formats</dt><dd>${d.formats.map((f) => `<span class="pill">.${esc(f)}</span>`).join(' ')}</dd><dt>Checksum</dt><dd class="mono">${esc(d.checksum)}</dd></dl><div class="path" style="margin-top:12px">${ic('folder')} ${esc(d.path)}</div><p class="xs muted">The Librarian indexes metadata only – the data stay at their original location under existing file-system permissions.</p></div></div>`;
    } else if (t === 'legal') {
      body = `${legalBanner}<div class="grid g2" style="margin-top:16px"><div class="card pad"><h3>Compliance</h3><dl class="kv" style="margin-top:10px"><dt>Classification</dt><dd>${clsPill(d.cls)}</dd><dt>Legal status</dt><dd>${legalPill(d.legal)}</dd><dt>Agreement</dt><dd>${esc(d.agreement || 'None (no third-party rights)')}</dd><dt>Conditions</dt><dd>${esc(d.legalNote)}</dd><dt>Licence</dt><dd>${esc(d.license)}</dd><dt>Partner</dt><dd>${esc(p.partner)}</dd></dl></div>
        <div class="card pad"><h3>Your access</h3><p>${acc ? `${ic('unlock')} You have access as <b>${esc(user().roleLabel)}</b>${grants().has(user().id + '|' + d.id) ? ' (approved request)' : ''}.` : `${ic('lock')} No access yet.`}</p>${req ? requestCard(req, true) : ''}${!acc && (!req || req.status === 'rejected') ? `<button class="btn btn-gold" data-req="${d.id}">${ic('key')} Request access</button>` : ''}</div></div>`;
    } else {
      body = `<div class="card pad"><h3>Relationship graph</h3><p class="small muted">Click any node – equipment, project, people and datasets of the same formulation are hyperlinked.</p>${graphSvg(d)}</div>
        <div class="section-title"><h2>Same formulation – full process chain</h2></div>${(d.related || []).map(dsById).filter(Boolean).filter(visibleToGuest).map((r) => resultCard({ d: r })).join('') || '<div class="empty card">No related datasets.</div>'}`;
    }
    return `<div class="crumbs"><a href="#/">Search</a> › ${prjLink(d.project)} › <span class="mono">${esc(d.formulation)}</span></div>
      <div class="card ds-head" id="ds-head"><div style="min-width:0"><div class="row">${ticon(d.technique)}${legalPill(d.legal)}${clsPill(d.cls)}${accessPill(d)}${d.imported ? '<span class="pill gold">Imported</span>' : ''}</div>
        <h1>${esc(dsTitle(d))}</h1><div class="row"><span class="mono small muted">${esc(d.name)}</span><button class="btn btn-sm btn-ghost" data-copy="${esc(d.name)}" title="Copy name">${ic('copy')}</button></div>
        <div class="row small muted" style="margin-top:6px"><span>${ic('user')} Owner ${personLink(d.owner)}</span><span>${ic('flask')} Creator ${personLink(d.creator)}</span><span>${ic('clock')} Created ${fmtDate(d.created)} · changed ${fmtDate(d.modified)}</span></div></div>
        <div class="ds-actions" id="ds-actions">${actions}<button class="btn" id="exp-ds" data-id="${d.id}">${ic('download')} Export metadata (JSON)</button><button class="btn btn-ghost btn-sm" data-copy="${esc(d.pid)}">${ic('link')} Copy PID</button></div></div>
      <div class="tabs" id="ds-tabs" style="margin-top:16px">${tabs.map(([k, l, i]) => `<button data-dstab="${k}" class="${t === k ? 'active' : ''}">${ic(i)}${l}${(!acc && (k === 'composition' || k === 'provenance')) ? ' ' + ic('lock') : ''}</button>`).join('')}</div>
      <div id="ds-body">${body}</div>`;
  }

  // ---------- access request workflow ----------
  function openRequestModal(id) {
    const d = dsById(id); if (!d) return;
    const conf = d.cls.startsWith('Confidential');
    modal(`${ic('key')} Request access`, `<p class="small muted">Dataset</p><p><b>${esc(dsTitle(d))}</b><br><span class="mono xs">${esc(d.name)}</span></p>
      ${legalOk(d) ? `<div class="legal-banner ok">${ic('check')}<div><b>Legally cleared</b><p>Your request goes directly to the data owner ${esc(person(d.owner).name)}.</p></div></div>` : `<div class="legal-banner warn">${ic('scale')}<div><b>${esc(d.legal)}</b>${d.agreement ? ' · ' + esc(d.agreement) : ''}<p>Your request is first checked by Legal & Contracts, then approved by the data owner ${esc(person(d.owner).name)}.</p></div></div>`}
      <div class="grid g2" style="margin-top:14px"><div><label class="fl">Purpose</label><select class="input" id="rq-purpose"><option>Reuse for new study</option><option>Comparison / benchmark</option><option>Joint publication</option><option>Regulatory / quality documentation</option><option>Teaching / training</option></select></div>
      <div><label class="fl">Access duration</label><select class="input" id="rq-dur"><option value="30">30 days</option><option value="90" selected>90 days</option><option value="180">180 days</option><option value="">Unlimited (project lifetime)</option></select></div></div>
      <div style="margin-top:12px"><label class="fl">Justification</label><textarea class="input" id="rq-reason" rows="3" placeholder="Briefly describe how you will use the data…"></textarea></div>
      ${conf ? `<label class="row small" style="margin-top:12px"><input type="checkbox" id="rq-nda"> I confirm that I have read and will comply with ${esc(d.agreement || 'the confidentiality agreement')}.</label>` : ''}`,
    `<button class="btn" data-close>Cancel</button><button class="btn btn-primary" id="rq-submit">${ic('send')} Submit request</button>`);
    $('#rq-submit').addEventListener('click', () => {
      const reason = $('#rq-reason').value.trim();
      if (!reason) { $('#rq-reason').focus(); toast('Please add a short justification', 'info'); return; }
      if (conf && !$('#rq-nda').checked) { toast('Please confirm the confidentiality terms', 'info'); return; }
      submitRequest(id, { purpose: $('#rq-purpose').value, duration: $('#rq-dur').value, reason });
    });
  }
  function submitRequest(id, { purpose, duration, reason }) {
    const d = dsById(id); const u = user();
    const n = 1000 + (ST.requests || []).reduce((m, r) => Math.max(m, +r.id.slice(2) - 1000), 0) + 1;
    const H = (who, action, comment) => ({ t: TODAY, who, action, comment });
    const r = { id: `R-${n}`, ds: id, requester: u.id, purpose, reason, duration, created: TODAY, status: legalOk(d) ? 'owner' : 'legal', history: [H(u.id, 'Request submitted')] };
    r.history.push(legalOk(d) ? H('system', 'Legal check passed automatically (dataset cleared)') : H('system', `Routed to Legal & Contracts (${d.legal})`));
    ST.requests.push(r); save(); closeModal(); render();
    toast(`Request ${r.id} submitted – ${legalOk(d) ? 'waiting for data owner' : 'waiting for legal clearance'}`, 'send');
    return r;
  }
  function canAct(r) {
    const u = user(); const d = dsById(r.ds); if (!d) return false;
    if (r.status === 'legal') return u.role === 'admin';
    if (r.status === 'owner') return u.role === 'admin' || (d.owner === u.id && u.role !== 'guest');
    return false;
  }
  const actionable = () => (ST.requests || []).filter(canAct);
  function decide(reqId, approve, comment) {
    const r = ST.requests.find((x) => x.id === reqId); if (!r || !canAct(r)) return;
    if (!approve && !comment) { toast('Please enter a reason – rejections are documented for the requester', 'info'); const c = $('#cm-' + reqId); if (c) c.focus(); return; }
    const u = user();
    if (r.status === 'legal') {
      r.history.push({ t: TODAY, who: u.id, action: approve ? 'Legal clearance confirmed' : 'Legal check rejected', comment });
      r.status = approve ? 'owner' : 'rejected';
    } else if (r.status === 'owner') {
      r.history.push({ t: TODAY, who: u.id, action: approve ? 'Approved by data owner' : 'Rejected by data owner', comment });
      r.status = approve ? 'granted' : 'rejected';
      if (approve && r.duration) r.expires = new Date(Date.parse(TODAY) + (+r.duration) * 86400000).toISOString().slice(0, 10);
    }
    save(); render();
    toast(`${r.id}: ${approve ? (r.status === 'granted' ? 'access granted' : 'forwarded to data owner') : 'rejected – reason sent to requester'}`, approve ? 'check' : 'x');
  }
  const isExpired = (r) => r.status === 'granted' && r.expires && r.expires < TODAY;
  const reqKey = (r) => r.status === 'rejected' ? 'rejected' : isExpired(r) ? 'expired' : r.status === 'granted' ? 'approved' : 'open';
  const lastDecision = (r) => [...r.history].reverse().find((h) => h.who !== 'system' && /Approved|Rejected|rejected/.test(h.action));
  function requestCard(r, compact) {
    const d = dsById(r.ds); if (!d) return '';
    const steps = [['Submitted', 'submitted'], ['Legal check', 'legal'], ['Owner approval', 'owner'], ['Access granted', 'granted']];
    const order = { legal: 1, owner: 2, granted: 4, rejected: -1 };
    let rejAt = -1; if (r.status === 'rejected') { rejAt = r.history.some((h) => /Legal check rejected/.test(h.action)) ? 1 : 2; }
    const cur = r.status === 'rejected' ? rejAt : order[r.status];
    const stepper = steps.map(([l], i) => { const cls = r.status === 'rejected' ? (i < rejAt ? 'done' : i === rejAt ? 'rej' : '') : (i < cur ? 'done' : i === cur ? 'cur' : ''); return `${i ? `<span class="step-line ${i <= (r.status === 'rejected' ? rejAt - 1 : cur - 1) || (r.status === 'granted') ? 'done' : ''}"></span>` : ''}<span class="step ${r.status === 'granted' ? 'done' : cls}"><span class="sd">${(r.status === 'granted' || cls === 'done') ? '✓' : cls === 'rej' ? '✕' : i + 1}</span>${l}</span>`; }).join('');
    const k = reqKey(r);
    const statusPill = { open: r.status === 'legal' ? '<span class="pill warn">Legal check</span>' : '<span class="pill info">Owner approval</span>', approved: '<span class="pill ok">Approved</span>', expired: '<span class="pill">Expired</span>', rejected: '<span class="pill bad">Rejected</span>' }[k];
    const dec = lastDecision(r);
    let outcome = '';
    if (dec && k !== 'open') {
      const by = `<b>${esc(person(dec.who).name)}</b> (${/Legal/.test(dec.action) ? 'Legal & Contracts' : 'data owner'}) on ${fmtDate(dec.t)}`;
      if (k === 'rejected') outcome = `<div class="outcome bad">${ic('x')}<div>Rejected by ${by}.<br><b>Reason:</b> ${esc(dec.comment || 'No reason recorded')}</div></div>`;
      else outcome = `<div class="outcome ${k === 'expired' ? 'exp' : 'ok'}">${ic(k === 'expired' ? 'clock' : 'check')}<div>Approved by ${by}${r.expires ? ` · access ${k === 'expired' ? 'expired' : 'valid until'} ${fmtDate(r.expires)}` : ' · unlimited access'}.${dec.comment ? `<br><b>Comment:</b> ${esc(dec.comment)}` : ''}${k === 'expired' ? ' <a href="#" data-req="' + d.id + '">Request again</a>' : ''}</div></div>`;
    }
    const act = canAct(r) ? `<div class="row" style="margin-top:12px"><input class="input" style="flex:1;min-width:200px" placeholder="Comment (required when rejecting)" id="cm-${r.id}"><button class="btn btn-ok btn-sm" data-decide="${r.id}" data-ok="1">${ic('check')} ${r.status === 'legal' ? 'Confirm legal clearance' : 'Approve access'}</button><button class="btn btn-danger btn-sm" data-decide="${r.id}" data-ok="0">${ic('x')} Reject</button></div>` : '';
    return `<div class="card req" data-req-card="${r.id}"><div class="row"><b class="mono">${r.id}</b>${statusPill}<span class="spacer"></span><span class="xs muted">Submitted ${fmtDate(r.created)}</span></div>
      ${compact ? '' : `<div style="margin-top:6px"><a href="#/dataset/${d.id}"><b>${esc(dsTitle(d))}</b></a> <span class="mono xs muted">${esc(d.name)}</span></div><div class="row small muted" style="margin-top:4px"><span>Requester ${personLink(r.requester)}</span><span>· Owner ${personLink(d.owner)}</span><span>· ${legalPill(d.legal)}</span></div>`}
      <div class="stepper">${stepper}</div>
      <div class="small"><b>${esc(r.purpose)}</b> – ${esc(r.reason)} <span class="muted">(${r.duration ? r.duration + ' days' : 'unlimited'})</span></div>
      ${outcome}
      <details style="margin-top:8px"><summary class="xs muted" style="cursor:pointer">Full history (${r.history.length} events)</summary><ul class="hist">${r.history.map((h) => `<li>${fmtDate(h.t)} · <b>${h.who === 'system' ? 'System' : esc(person(h.who).name)}</b>: ${esc(h.action)}${h.comment ? ` – <i>${esc(h.comment)}</i>` : ''}</li>`).join('')}</ul></details>${act}</div>`;
  }
  function userHistory(uid) {
    const rows = [];
    (ST.requests || []).forEach((r) => {
      const d = dsById(r.ds); if (!d) return;
      r.history.forEach((h) => {
        const asReq = r.requester === uid, asActor = h.who === uid;
        if (!asReq && !asActor) return;
        rows.push({ date: h.t, request: r.id, ds: d, as: asActor && !asReq ? (/Legal/.test(h.action) ? 'Legal reviewer' : 'Data owner') : 'Requester', actor: h.who === 'system' ? 'System' : person(h.who).name, event: h.action, comment: h.comment || '', status: reqKey(r) });
      });
    });
    return rows.sort((a, b) => b.date.localeCompare(a.date) || b.request.localeCompare(a.request));
  }
  function pageRequests() {
    const u = user(); const all = (ST.requests || []).slice().sort((a, b) => b.created.localeCompare(a.created) || b.id.localeCompare(a.id));
    const inbox = all.filter(canAct); const mine = all.filter((r) => r.requester === u.id);
    const isApprover = u.role === 'admin' || u.role === 'owner' || D.DATASETS.some((d) => d.owner === u.id);
    if (!UI.reqTab || (UI.reqTab === 'inbox' && !isApprover) || (UI.reqTab === 'all' && u.role !== 'admin')) UI.reqTab = isApprover && inbox.length ? 'inbox' : 'mine';
    const LBL = { all: 'All', open: 'Open', approved: 'Approved', rejected: 'Rejected', expired: 'Expired' };
    const fchips = (list) => `<div class="filters-inline" id="req-filter">${Object.keys(LBL).map((k) => `<button data-reqfilter="${k}" class="${(UI.reqFilter || 'all') === k ? 'on' : ''}">${LBL[k]} · ${k === 'all' ? list.length : list.filter((r) => reqKey(r) === k).length}</button>`).join('')}</div>`;
    const filt = (list) => list.filter((r) => !UI.reqFilter || UI.reqFilter === 'all' || reqKey(r) === UI.reqFilter);
    const empty = (msg) => `<div class="empty card">${msg}</div>`;
    let body = '';
    if (UI.reqTab === 'inbox') body = inbox.map((r) => requestCard(r)).join('') || empty('Nothing to approve – inbox zero.');
    else if (UI.reqTab === 'mine') body = fchips(mine) + (filt(mine).map((r) => requestCard(r)).join('') || empty('No requests in this category. Open a restricted dataset and click “Request access”.'));
    else if (UI.reqTab === 'all') body = fchips(all) + (filt(all).map((r) => requestCard(r)).join('') || empty('No requests in this category.'));
    else {
      const uid = u.role === 'admin' ? (UI.histUser || u.id) : u.id;
      const rows = userHistory(uid);
      const reqs = all.filter((r) => r.requester === uid);
      const decisions = rows.filter((x) => x.as !== 'Requester').length;
      const stat = (v, l) => `<div class="card stat"><div class="v">${v}</div><div class="l">${l}</div></div>`;
      body = `<div class="row" style="margin-bottom:14px">${u.role === 'admin' ? `<label class="fl" style="margin:0">User</label><select class="input" id="hist-user" style="max-width:320px">${D.PEOPLE.map((p) => `<option value="${p.id}" ${p.id === uid ? 'selected' : ''}>${esc(p.name)} – ${esc(p.title)}</option>`).join('')}</select>` : `<span class="muted small">Your complete access history – requests you made and decisions you took.</span>`}<span class="spacer"></span><button class="btn btn-sm" id="exp-hist" data-uid="${uid}">${ic('download')} Export history (CSV)</button></div>
        <div class="hstats">${stat(reqs.length, 'Requests made')}${stat(reqs.filter((r) => reqKey(r) === 'approved').length, 'Approved & active')}${stat(reqs.filter((r) => reqKey(r) === 'rejected').length, 'Rejected')}${stat(reqs.filter((r) => reqKey(r) === 'open').length, 'Open')}${stat(decisions, 'Decisions taken as approver')}</div>
        ${rows.length ? `<div class="card" style="overflow:auto"><table class="tbl"><thead><tr><th>Date</th><th>Request</th><th>Dataset</th><th>Role</th><th>Event</th><th>By</th><th>Comment / reason</th><th>Outcome</th></tr></thead><tbody>${rows.map((x) => `<tr><td style="white-space:nowrap">${fmtDate(x.date)}</td><td class="mono">${x.request}</td><td><a href="#/dataset/${x.ds.id}">${esc(x.ds.name)}</a></td><td>${x.as}</td><td>${esc(x.event)}</td><td>${esc(x.actor)}</td><td class="small">${esc(x.comment) || '<span class="faint">–</span>'}</td><td>${{ open: '<span class="pill info">Open</span>', approved: '<span class="pill ok">Approved</span>', rejected: '<span class="pill bad">Rejected</span>', expired: '<span class="pill">Expired</span>' }[x.status]}</td></tr>`).join('')}</tbody></table></div>` : empty('No access history for this user yet.')}`;
    }
    return `<div class="page-head"><h1>Access requests</h1><span class="muted">Request → legal check (NDA/CDA or uncleared data) → data-owner approval → access</span><span class="spacer"></span>${u.role === 'admin' ? `<button class="btn btn-sm" id="exp-audit">${ic('download')} Export audit trail (CSV)</button>` : ''}</div>
      <div class="tabs" id="req-tabs" style="margin-top:16px">${isApprover ? `<button data-reqtab="inbox" class="${UI.reqTab === 'inbox' ? 'active' : ''}">${ic('shield')} Approvals inbox <span class="pill ${inbox.length ? 'gold' : ''}">${inbox.length}</span></button>` : ''}<button data-reqtab="mine" class="${UI.reqTab === 'mine' ? 'active' : ''}">${ic('send')} My requests <span class="pill">${mine.length}</span></button><button data-reqtab="history" class="${UI.reqTab === 'history' ? 'active' : ''}">${ic('clock')} History</button>${u.role === 'admin' ? `<button data-reqtab="all" class="${UI.reqTab === 'all' ? 'active' : ''}">${ic('list')} All requests <span class="pill">${all.length}</span></button>` : ''}</div>
      <div id="req-list">${body}</div>`;
  }

  // ---------- ask ----------
  function pageAsk() {
    let ans = '';
    if (UI.askQ) {
      const a = X.ask(UI.askQ, user(), grants());
      ans = `<div class="card answer" id="answer"><div class="row"><h3>${ic('sparkle')} Here is how to find it</h3><span class="spacer"></span><span class="pill ${a.results.length ? 'ok' : 'warn'}">${a.results.length} matching datasets</span></div>
        <p class="small muted">Search the index with this query:</p>
        <div class="qbox" id="ask-query"><code>${esc(a.query || '(no indexed terms recognised)')}</code><span class="row"><button class="btn btn-sm btn-gold" data-run="${esc(a.query)}">${ic('search')} Run search</button><button class="btn btn-sm" data-copy="${esc(a.query)}">${ic('copy')}</button></span></div>
        ${a.explain.length ? `<ul class="explain">${a.explain.map((e) => `<li><code>${esc(e.term)}</code><span>${esc(e.why)}</span></li>`).join('')}</ul>` : ''}
        ${a.relaxed.length ? `<p class="small" style="margin-top:10px">${ic('info')} No dataset matched every aspect – relaxed: ${a.relaxed.map((r) => `<code>${esc(r.q)}</code>`).join(', ')}. <a href="${searchHash(a.relaxed.map((r) => r.q).concat(a.query).join(' '), {})}">Try strict query</a></p>` : ''}
        ${a.leftovers.length ? `<p class="small muted">Not in the ontology yet: ${a.leftovers.map((l) => `<code>${esc(l)}</code>`).join(', ')} – suggest them to the data steward.</p>` : ''}
        ${a.alternatives.length ? `<p class="small muted" style="margin:12px 0 6px">Other words that find the same data:</p><div class="row" style="gap:6px">${a.alternatives.map((t) => `<button class="tag plain" data-q="&quot;${esc(t)}&quot;">${esc(t)}</button>`).join('')}</div>` : ''}
        ${a.results.length ? `<h3 style="margin:18px 0 8px">Top results</h3>${a.results.slice(0, 4).map(resultCard).join('')}<a href="${searchHash(a.query, {})}">Show all ${a.results.length} results ${ic('arrow')}</a>` : ''}</div>`;
    }
    return `<div class="ask-box"><div style="text-align:center;margin:10px 0 18px"><h1 style="font-size:2.1rem">Ask the Librarian</h1><p class="muted">Type a question in plain English or German. The ontology maps your words – synonyms, abbreviations, trade names – onto the indexed terms and tells you exactly how to search.</p></div>
      <div class="card pad" id="ask-card"><textarea class="input" id="ask-input" placeholder="e.g. Which filaments with HPMCAS were too brittle to print?">${esc(UI.askQ)}</textarea>
        <div class="row" style="margin-top:10px"><span class="muted small">Try:</span><span class="spacer"></span><button class="btn btn-primary" id="ask-go">${ic('sparkle')} Ask</button></div>
        <div class="row" style="gap:6px;margin-top:8px" id="ask-examples">${O.QUESTIONS.map((q) => `<button class="tag plain" data-ask="${esc(q)}">${esc(q)}</button>`).join('')}</div></div>${ans}</div>`;
  }

  // ---------- ontology ----------
  function conceptCount(c) { return c.query ? X.search(c.query, { user: user(), grants: grants() }).results.length : 0; }
  function pageOntology() {
    const t = UI.ontTab;
    const tabs = `<div class="tabs" id="ont-tabs"><button data-onttab="dictionary" class="${t === 'dictionary' ? 'active' : ''}">${ic('book')} Dictionary</button><button data-onttab="matrix" class="${t === 'matrix' ? 'active' : ''}">${ic('table')} Synonym table</button><button data-onttab="io" class="${t === 'io' ? 'active' : ''}">${ic('download')} Export / import</button></div>`;
    let body = '';
    if (t === 'dictionary') {
      const q = X.norm(UI.ontQ);
      const list = O.concepts.filter((c) => (!UI.ontCat || c.cat === UI.ontCat) && (!q || X.norm([c.label, ...c.alt, c.def].join(' ')).includes(q)));
      const c = O.byId[UI.concept] || list[0];
      const cnt = c ? conceptCount(c) : 0;
      const rel = (ids) => ids.map((i) => O.byId[i]).filter(Boolean).map((x) => `<a class="pill" href="#/ontology/${x.id}"><span class="cat-dot" style="background:${O.CATEGORIES[x.cat].color}"></span>${esc(x.label)}</a>`).join(' ') || '<span class="faint">–</span>';
      body = `<div class="grid" style="grid-template-columns:minmax(260px,340px) minmax(0,1fr)">
        <div class="card" style="overflow:hidden"><div class="pad" style="padding-bottom:10px"><input class="input" id="ont-q" placeholder="Filter ${O.concepts.length} concepts…" value="${esc(UI.ontQ)}"><select class="input" id="ont-cat" style="margin-top:8px"><option value="">All categories</option>${Object.entries(O.CATEGORIES).map(([k, v]) => `<option value="${k}" ${UI.ontCat === k ? 'selected' : ''}>${v.label} (${O.concepts.filter((x) => x.cat === k).length})</option>`).join('')}</select></div>
          <div class="concept-list" id="concept-list">${list.map((x) => `<button class="concept-item ${c && x.id === c.id ? 'on' : ''}" data-concept="${x.id}"><span class="cat-dot" style="background:${O.CATEGORIES[x.cat].color}"></span><b>${esc(x.label)}</b><small>${esc(x.alt.slice(0, 5).join(' · '))}</small></button>`).join('') || '<div class="empty">No concepts</div>'}</div></div>
        <div>${c ? `<div class="card pad" id="concept-detail"><div class="row"><span class="pill" style="background:${O.CATEGORIES[c.cat].color}22;color:${O.CATEGORIES[c.cat].color}">${esc(O.CATEGORIES[c.cat].label)}</span><span class="mono xs faint">${esc(O.namespace)}${esc(c.id)}</span></div>
          <h1 style="font-size:1.8rem;margin:8px 0">${esc(c.label)}</h1><p>${esc(c.def)}</p>
          <h3 style="margin-top:16px">Alternative labels <span class="muted small">(synonyms, abbreviations, German, trade names)</span></h3><div class="syn" style="margin-top:8px">${c.alt.map((a) => `<span>${esc(a)}</span>`).join('') || '<span class="faint">–</span>'}</div>
          <dl class="kv" style="margin-top:16px"><dt>Broader</dt><dd>${rel(c.broader ? [c.broader] : [])}</dd><dt>Narrower</dt><dd>${rel(c.narrower)}</dd><dt>Related</dt><dd>${rel(c.related)}</dd></dl>
          <h3 style="margin-top:16px">Search with this concept</h3><div class="qbox" style="margin-top:8px"><code>${esc(c.query || c.label)}</code><span class="row"><span class="pill gold">${cnt} datasets</span><button class="btn btn-sm btn-gold" data-run="${esc(c.query || '"' + c.label + '"')}">${ic('search')} Run</button></span></div>
          <p class="small muted" style="margin-top:8px">Typing any of the labels above in the search bar automatically expands to this concept.</p></div>` : ''}</div></div>`;
    } else if (t === 'matrix') {
      body = `<div class="card" style="overflow:auto;max-height:70vh"><table class="tbl"><thead><tr><th>Concept</th><th>Category</th><th>Alternative labels</th><th>Search query</th></tr></thead><tbody>${O.concepts.map((c) => `<tr><td><a href="#/ontology/${c.id}"><b>${esc(c.label)}</b></a></td><td><span class="cat-dot" style="background:${O.CATEGORIES[c.cat].color}"></span>${esc(O.CATEGORIES[c.cat].label)}</td><td class="small">${esc(c.alt.join(' · '))}</td><td class="mono xs">${esc(c.query)}</td></tr>`).join('')}</tbody></table></div>`;
    } else {
      body = `<div class="grid g2"><div class="card pad"><h3>${ic('download')} Export ontology</h3><p class="small muted">Version ${esc(O.version)} · ${O.concepts.length} concepts · ${O.concepts.reduce((s, c) => s + c.alt.length, 0)} alternative labels. Use the files directly in the production index (Elasticsearch/OpenSearch synonym sets, SKOS-aware vocab servers, or the ELN).</p>
        <div class="row"><button class="btn" data-ontexp="json">${ic('download')} JSON</button><button class="btn" data-ontexp="csv">${ic('download')} CSV</button><button class="btn" data-ontexp="ttl">${ic('download')} SKOS (Turtle)</button><button class="btn" data-ontexp="syn">${ic('download')} Search-engine synonyms</button></div></div>
        <div class="card pad"><h3>${ic('upload')} Import / extend concepts</h3><p class="small muted">Upload a JSON array of concepts <code>{id,label,cat,alt[],def,broader,related[],query}</code>. Imported concepts become active in search & Ask immediately.</p>
        <input type="file" id="ont-import" accept=".json,application/json" class="input" ${ST.role === 'admin' ? '' : 'disabled'}>${ST.role === 'admin' ? '' : '<p class="xs muted">Only Administrators can import concepts.</p>'}${ST.concepts.length ? `<p class="small">${ST.concepts.length} imported concept(s) active.</p>` : ''}</div></div>`;
    }
    return `<div class="page-head"><h1>Ontology</h1><span class="muted">The controlled vocabulary behind search, autocomplete and Ask – built for pharmaceutical materials science & 3D printing</span></div><div style="margin-top:14px">${tabs}${body}</div>`;
  }
  function exportOntology(fmt) {
    const C = O.concepts;
    if (fmt === 'json') return download('fair-librarian-ontology.json', JSON.stringify({ name: 'The FAIR Librarian – Pharmaceutical Materials Science Ontology', version: O.version, namespace: O.namespace, categories: O.CATEGORIES, concepts: C.map(({ id, label, cat, alt, def, broader, narrower, related, query }) => ({ id, label, cat, alt, def, broader, narrower, related, query })) }, null, 2));
    if (fmt === 'csv') return download('fair-librarian-ontology.csv', toCSV(C.map((c) => ({ ...c, category: O.CATEGORIES[c.cat].label, alt: c.alt.join(' | '), related: c.related.join(' | '), narrower: c.narrower.join(' | ') })), ['id', 'label', 'category', 'alt', 'def', 'broader', 'narrower', 'related', 'query']), 'text/csv');
    if (fmt === 'syn') return download('synonyms.txt', C.filter((c) => c.alt.length).map((c) => [c.label, ...c.alt].map((x) => x.toLowerCase().replace(/,/g, ' ')).join(', ')).join('\n'), 'text/plain');
    const t = (s) => '"' + String(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"';
    const id = (x) => 'fl:' + x.replace(/\./g, '_');
    let ttl = `@prefix skos: <http://www.w3.org/2004/02/skos/core#> .\n@prefix fl: <${O.namespace}> .\n@prefix dct: <http://purl.org/dc/terms/> .\n\nfl:scheme a skos:ConceptScheme ; dct:title "The FAIR Librarian Ontology"@en ; dct:hasVersion ${t(O.version)} .\n\n`;
    Object.entries(O.CATEGORIES).forEach(([k, v]) => { ttl += `fl:cat_${k} a skos:Collection ; skos:prefLabel ${t(v.label)}@en ; skos:member ${C.filter((c) => c.cat === k).map((c) => id(c.id)).join(', ')} .\n`; });
    C.forEach((c) => { ttl += `\n${id(c.id)} a skos:Concept ; skos:inScheme fl:scheme ;\n  skos:prefLabel ${t(c.label)}@en ;\n${c.alt.map((a) => `  skos:altLabel ${t(a)} ;\n`).join('')}  skos:definition ${t(c.def)}@en${c.broader ? ` ;\n  skos:broader ${id(c.broader)}` : ''}${c.related.length ? ` ;\n  skos:related ${c.related.map(id).join(', ')}` : ''}${c.query ? ` ;\n  skos:note ${t('search: ' + c.query)}` : ''} .\n`; });
    download('fair-librarian-ontology.ttl', ttl, 'text/turtle');
  }

  // ---------- index / admin ----------
  function pageIndex() {
    const admin = ST.role === 'admin';
    const per = (k) => D.DATASETS.reduce((m, d) => (m[d[k]] = (m[d[k]] || 0) + 1, m), {});
    const bySrc = per('source');
    const roles = [['Search & see dataset exists', '✓', '✓', '✓', 'open data only'], ['See full metadata of own / project data', '✓', '✓', '✓', '–'], ['See composition of NDA/CDA data', 'after approval', 'own projects', '✓', '–'], ['Open data location', 'after approval', 'own projects', '✓', 'open & cleared'], ['Request access', '✓', '✓', '–', '✓'], ['Approve data-owner step', 'own datasets', '✓', '✓', '–'], ['Confirm legal clearance', '–', '–', '✓ (data steward / legal)', '–'], ['Import datasets & concepts, re-index', '–', '–', '✓', '–']];
    const schema = [['id / pid', 'Internal ID and persistent identifier'], ['name', 'Dataset name following convention PROJECT_FORMULATION_TECHNIQUE_YYYYMMDD_Rn'], ['title / description', 'Human-readable title and description'], ['technique / process', 'Measurement technique (controlled list) and manufacturing process'], ['project / formulation', 'Project ID and formulation/sample-set code'], ['components', 'API / excipient composition with function and w/w %'], ['mix / form', 'Formulation type (Solo API, API + excipient, …) and sample form'], ['equipment', 'Equipment IDs (inventory-linked)'], ['owner / creator', 'Accountable data owner and creating scientist'], ['created / modified', 'ISO dates harvested from the file system / ELN'], ['source / domain / path', 'Server source, AD domain and UNC/URL location'], ['params / summary', 'Method parameters and result summary (metadata, not data)'], ['cls / legal / agreement', 'Classification, legal clearance status, NDA/CDA reference & conditions'], ['tags', 'Max. 3 controlled tags (amorphous, printable, brittle filament, …)'], ['fair', 'Automated FAIR maturity score (F/A/I/R)']];
    return `<div class="page-head"><h1>Index & sources</h1><span class="muted">Crawled server landscape, schema and permission model</span><span class="spacer"></span>${admin ? '' : `<span class="pill warn">${ic('lock')} Admin actions require the Administrator role</span>`}</div>
      <div class="stats" style="grid-template-columns:repeat(5,1fr)">${[[D.DATASETS.length.toLocaleString('en'), 'Datasets in index'], [D.DATASETS.reduce((s, d) => s + d.files, 0).toLocaleString('en'), 'Files referenced'], [(D.DATASETS.reduce((s, d) => s + d.sizeMB, 0) / 1024).toFixed(1) + ' GB', 'Data volume referenced'], [Object.keys(per('domain')).length, 'AD / server domains'], [ST.imported.length, 'Imported records']].map(([v, l]) => `<div class="card stat"><div class="v">${v}</div><div class="l">${l}</div></div>`).join('')}</div>
      <div class="section-title"><h2>Crawled sources</h2><span class="spacer"></span><button class="btn btn-primary btn-sm" id="crawl" ${admin ? '' : 'disabled'}>${ic('refresh')} Run incremental crawl</button></div>
      <div class="card" style="overflow:auto" id="sources-table"><table class="tbl"><thead><tr><th>Source</th><th>Domain</th><th>Type</th><th>Root</th><th>Datasets</th><th>Last crawl</th><th>Status</th></tr></thead><tbody>${D.SOURCES.map((s) => `<tr><td><b>${esc(s.name)}</b><div class="xs muted mono">${esc(s.host)}</div></td><td>${esc(s.domain)}</td><td>${esc(s.type)}</td><td class="mono xs">${esc(s.root)}</td><td>${bySrc[s.id] || (s.id === 'S6' ? 'links' : 0)}</td><td class="crawl-t">${esc(s.crawl)}</td><td><span class="pill ${s.status === 'OK' ? 'ok' : 'warn'}">${esc(s.status)}</span><div class="progress" style="margin-top:6px" hidden><i></i></div></td></tr>`).join('')}</tbody></table></div>
      <div class="grid g2" style="margin-top:18px">
        <div class="card pad" id="import-card"><h3>${ic('upload')} Import datasets</h3><p class="small muted">Add records from other systems (e.g. new data types such as spray drying, tableting, injection moulding). JSON array following the metadata schema below.</p>
          <div class="row"><input type="file" id="ds-import" accept=".json,application/json" class="input" style="max-width:300px" ${admin ? '' : 'disabled'}><button class="btn" id="ds-sample" ${admin ? '' : 'disabled'}>${ic('upload')} Load sample (new data types)</button></div>
          ${ST.imported.length ? `<p class="small" style="margin-top:8px">${ST.imported.length} imported record(s) – <a href="${searchHash('', {})}" id="show-imported">search</a> · <button class="btn btn-sm btn-ghost" id="clear-imported" ${admin ? '' : 'disabled'}>Remove imports</button></p>` : ''}</div>
        <div class="card pad"><h3>${ic('download')} Export</h3><p class="small muted">Full metadata index (respecting your role's visibility) and access-request audit trail.</p><div class="row"><button class="btn" id="exp-index-json">${ic('download')} Index JSON</button><button class="btn" id="exp-index-csv">${ic('download')} Index CSV</button><button class="btn" id="exp-ont">${ic('book')} Ontology</button></div>
          <p class="small muted" style="margin-top:14px">Demo state (role, requests, imports) is stored in your browser.</p><button class="btn btn-danger btn-sm" id="reset-demo">${ic('refresh')} Reset demo data</button></div></div>
      <div class="section-title"><h2>Role & permission model</h2></div>
      <div class="card" style="overflow:auto" id="perm-matrix"><table class="tbl"><thead><tr><th>Capability</th><th>Scientist</th><th>Data Owner</th><th>Administrator</th><th>Guest</th></tr></thead><tbody>${roles.map((r) => `<tr>${r.map((c, i) => `<td>${i ? esc(c) : `<b>${esc(c)}</b>`}</td>`).join('')}</tr>`).join('')}</tbody></table></div>
      <div class="section-title"><h2>Metadata schema (v0.9)</h2></div>
      <div class="card" style="overflow:auto"><table class="tbl"><thead><tr><th>Field</th><th>Description</th></tr></thead><tbody>${schema.map(([a, b]) => `<tr><td class="mono">${a}</td><td>${b}</td></tr>`).join('')}</tbody></table></div>`;
  }
  function importDatasets(arr) {
    if (!Array.isArray(arr)) throw new Error('Expected a JSON array');
    const recs = arr.map(normalizeImport).filter((r) => !dsById(r.id));
    ST.imported.push(...recs); recs.forEach((r) => D.DATASETS.push(r)); X.buildIndex(); save(); render();
    toast(`${recs.length} dataset(s) imported and indexed`, 'upload');
  }

  // ---------- page bindings (event delegation) ----------
  function bindPage(app) {
    hydrateIcons(app);
    bindSearchBox(app);
    const f = $('#eq-filter', app); if (f) f.addEventListener('input', () => { const q = X.norm(f.value); $$('.eq-wrap', app).forEach((w) => { w.hidden = q && !w.dataset.txt.includes(q); }); });
    const s = $('#sort', app); if (s) { s.value = UI.sort; s.addEventListener('change', () => { UI.sort = s.value; render(); }); }
    const oq = $('#ont-q', app); if (oq) { oq.addEventListener('input', () => { UI.ontQ = oq.value; const pos = oq.selectionStart; render(); const n = $('#ont-q'); n.focus(); n.setSelectionRange(pos, pos); }); }
    const hu = $('#hist-user', app); if (hu) hu.addEventListener('change', () => { UI.histUser = hu.value; render(); });
    const oc = $('#ont-cat', app); if (oc) oc.addEventListener('change', () => { UI.ontCat = oc.value; render(); });
    const ai = $('#ask-input', app); if (ai) ai.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); askNow(ai.value); } });
    const fi = $('#ds-import', app); if (fi) fi.addEventListener('change', () => readJSON(fi.files[0], importDatasets));
    const oi = $('#ont-import', app); if (oi) oi.addEventListener('change', () => readJSON(oi.files[0], (arr) => { if (!Array.isArray(arr)) throw new Error('Expected array'); const add = arr.filter((c) => c.id && c.label && !O.byId[c.id]).map((c) => ({ id: c.id, label: c.label, cat: O.CATEGORIES[c.cat] ? c.cat : 'DATA', alt: c.alt || [], def: c.def || '', broader: c.broader || '', related: c.related || [], narrower: [], query: c.query || '' })); ST.concepts.push(...add); add.forEach((c) => { O.concepts.push(c); O.byId[c.id] = c; }); X.rebuildLexicon(); save(); render(); toast(`${add.length} concept(s) imported`, 'book'); }));
  }
  function readJSON(file, fn) { if (!file) return; const r = new FileReader(); r.onload = () => { try { fn(JSON.parse(r.result)); } catch (e) { toast('Import failed: ' + esc(e.message), 'x'); } }; r.readAsText(file); }
  function askNow(q) { UI.askQ = q.trim(); go(`#/ask?q=${enc(UI.askQ)}`); }

  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-q],[data-run],[data-facet],[data-unfilter],[data-entity],[data-view],[data-page],[data-dstab],[data-req],[data-decide],[data-reqtab],[data-reqfilter],[data-onttab],[data-concept],[data-ontexp],[data-ask],[data-copy],[data-role],button[id]');
    if (!el) { if (!e.target.closest('#role-switch')) $('#role-menu').classList.remove('open'); return; }
    const ds = el.dataset;
    if (ds.q !== undefined) return runSearch(ds.q, {});
    if (ds.run !== undefined) return runSearch(ds.run, {});
    if (ds.facet) { const cur = UI.filters[ds.facet] || []; const nf = { ...UI.filters }; nf[ds.facet] = cur.includes(ds.val) ? cur.filter((v) => v !== ds.val) : [...cur, ds.val]; if (!nf[ds.facet].length) delete nf[ds.facet]; return runSearch(UI.q, nf); }
    if (ds.unfilter) { const nf = { ...UI.filters }; nf[ds.unfilter] = (nf[ds.unfilter] || []).filter((v) => v !== ds.val); if (!nf[ds.unfilter].length) delete nf[ds.unfilter]; return runSearch(UI.q, nf); }
    if (ds.entity) { UI.entity = ds.entity; return render(); }
    if (ds.view) { UI.view = ds.view; return render(); }
    if (ds.page) { UI.page = +ds.page; render(); return window.scrollTo({ top: 0 }); }
    if (ds.dstab) { UI.dsTab = ds.dstab; return render(); }
    if (ds.req) { e.preventDefault(); return openRequestModal(ds.req); }
    if (ds.decide) { const c = $('#cm-' + ds.decide); return decide(ds.decide, ds.ok === '1', c ? c.value.trim() : ''); }
    if (ds.reqtab) { UI.reqTab = ds.reqtab; UI.reqFilter = 'all'; return render(); }
    if (ds.reqfilter) { UI.reqFilter = ds.reqfilter; return render(); }
    if (ds.onttab) { UI.ontTab = ds.onttab; return render(); }
    if (ds.concept) { UI.concept = ds.concept; return go(`#/ontology/${ds.concept}`); }
    if (ds.ontexp) return exportOntology(ds.ontexp);
    if (ds.ask) { const ai = $('#ask-input'); if (ai) ai.value = ds.ask; return askNow(ds.ask); }
    if (ds.copy !== undefined) return copy(ds.copy);
    if (ds.role) return setRole(ds.role);
    switch (el.id) {
      case 'role-btn': { const m = $('#role-menu'); m.classList.toggle('open'); $('#role-btn').setAttribute('aria-expanded', m.classList.contains('open')); return; }
      case 'btn-theme': { ST.theme = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light'; document.documentElement.dataset.theme = ST.theme; save(); updateChrome(); return; }
      case 'clear-filters': return runSearch(UI.q, {});
      case 'exp-csv': return download(`fair-librarian-results-${TODAY}.csv`, toCSV(exportRows(lastResults), Object.keys(exportRows([{ d: D.DATASETS[0] }])[0])), 'text/csv');
      case 'exp-json': return download(`fair-librarian-results-${TODAY}.json`, JSON.stringify({ query: UI.q, filters: UI.filters, exported: TODAY, role: ST.role, results: exportRows(lastResults) }, null, 2));
      case 'exp-ds': { const d = dsById(el.dataset.id); const out = hasAccess(d) ? { ...d } : { id: d.id, pid: d.pid, name: d.name, technique: d.technique, project: d.project, owner: d.owner, created: d.created, modified: d.modified, cls: d.cls, legal: d.legal, note: 'restricted – full metadata after access approval' }; return download(`${d.name}.metadata.json`, JSON.stringify(out, null, 2)); }
      case 'exp-project': { const id = el.dataset.id; return download(`${id}-datasets.csv`, toCSV(exportRows(D.DATASETS.filter((d) => d.project === id).map((d) => ({ d }))), Object.keys(exportRows([{ d: D.DATASETS[0] }])[0])), 'text/csv'); }
      case 'open-loc': copy(el.dataset.path, 'Path copied – opens in Explorer when connected to the RCPE network'); return;
      case 'req-access': return openRequestModal(el.dataset.id);
      case 'ask-go': return askNow($('#ask-input').value);
      case 'exp-audit': return download(`access-audit-${TODAY}.csv`, toCSV(ST.requests.flatMap((r) => r.history.map((h) => ({ request: r.id, dataset: r.ds, requester: person(r.requester).name, status: r.status, date: h.t, actor: h.who === 'system' ? 'System' : person(h.who).name, action: h.action, comment: h.comment || '' }))), ['request', 'dataset', 'requester', 'status', 'date', 'actor', 'action', 'comment']), 'text/csv');
      case 'exp-hist': { const uid = el.dataset.uid; return download(`access-history-${person(uid).surname || uid}-${TODAY}.csv`, toCSV(userHistory(uid).map((x) => ({ date: x.date, request: x.request, dataset: x.ds.name, role: x.as, event: x.event, by: x.actor, comment: x.comment, outcome: x.status })), ['date', 'request', 'dataset', 'role', 'event', 'by', 'comment', 'outcome']), 'text/csv'); }
      case 'exp-index-json': return download(`fair-librarian-index-${TODAY}.json`, JSON.stringify(D.DATASETS.filter(visibleToGuest).map((d) => hasAccess(d) ? d : { id: d.id, name: d.name, technique: d.technique, project: d.project, owner: d.owner, created: d.created, modified: d.modified, cls: d.cls, legal: d.legal, restricted: true }), null, 1));
      case 'exp-index-csv': return download(`fair-librarian-index-${TODAY}.csv`, toCSV(exportRows(D.DATASETS.filter(visibleToGuest).map((d) => ({ d }))), Object.keys(exportRows([{ d: D.DATASETS[0] }])[0])), 'text/csv');
      case 'exp-ont': return exportOntology('json');
      case 'ds-sample': return fetch('data/sample-import.json').then((r) => r.json()).then(importDatasets).catch(() => toast('Could not load sample file (serve via http / GitHub Pages)', 'x'));
      case 'clear-imported': { const ids = new Set(ST.imported.map((x) => x.id)); ST.imported = []; for (let i = D.DATASETS.length - 1; i >= 0; i--) if (ids.has(D.DATASETS[i].id)) D.DATASETS.splice(i, 1); X.buildIndex(); save(); render(); return toast('Imported records removed', 'refresh'); }
      case 'show-imported': e.preventDefault(); return runSearch('Imported');
      case 'reset-demo': if (confirm('Reset demo data (role, requests, imports, concepts)?')) { try { localStorage.removeItem(LS); } catch (er) { /* ignore */ } location.hash = '#/'; location.reload(); } return;
      case 'crawl': return simulateCrawl();
      case 'btn-tour': return window.TOUR && window.TOUR.start();
      default:
    }
  });
  function simulateCrawl() {
    const rows = $$('#sources-table tbody tr'); let i = 0;
    $('#crawl').disabled = true;
    const next = () => {
      if (i >= rows.length) { $('#crawl').disabled = false; toast(`Incremental crawl finished – ${Math.floor(Math.random() * 20) + 4} new / changed files detected, index up to date`, 'refresh'); return; }
      const row = rows[i]; const bar = $('.progress', row); bar.hidden = false; let p = 0;
      const tick = setInterval(() => { p += 12 + Math.random() * 18; $('i', bar).style.width = Math.min(100, p) + '%'; if (p >= 100) { clearInterval(tick); $('.crawl-t', row).textContent = TODAY + ' ' + new Date().toTimeString().slice(0, 5); i++; next(); } }, 90);
    };
    next();
  }
  document.addEventListener('keydown', (e) => { if (e.key === '/' && !/input|textarea|select/i.test(document.activeElement.tagName)) { const q = $('#q'); if (q) { e.preventDefault(); q.focus(); } } if (e.key === 'Escape') { closeModal(); $('#role-menu').classList.remove('open'); } });

  // ---------- boot ----------
  document.documentElement.dataset.theme = ST.theme || 'dark';
  if (!ST.requests) { ST.requests = seedRequests(); save(); }
  applyImports();
  hydrateIcons(document);
  window.addEventListener('hashchange', render);
  render();

  // public API for the demo tour
  window.APP = {
    go, render, setRole, runSearch, openRequestModal, submitRequest, decide, UI, closeModal, dsById, askNow,
    get state() { return ST; }, set state(v) { ST = v; save(); },
    snapshot: () => JSON.stringify(ST), restore: (s) => { ST = JSON.parse(s); save(); render(); },
    setDsTab: (t) => { UI.dsTab = t; }, setReqTab: (t) => { UI.reqTab = t; }, setOntTab: (t) => { UI.ontTab = t; }, setFilters: (f) => { UI.filters = f; }, setEntity: (x) => { UI.entity = x; }
  };
})();
