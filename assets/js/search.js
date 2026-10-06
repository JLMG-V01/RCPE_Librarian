/* ==========================================================================
   The FAIR Librarian – Search engine
   Index build · query language · ontology expansion · facets · autocomplete
   · "Ask the Librarian" question-to-query translation
   --------------------------------------------------------------------------
   Query language (combinable with free text):
     api:  excipient:  material:  technique:  process:  equipment:  project:
     owner:  creator:  person:  mix:  form:  legal:  class:  domain:
     format:  tag:  after:YYYY-MM-DD  before:  modified-after:  modified-before:
   Same field repeated = OR, different fields = AND. Quote multi-word values.
   ========================================================================== */
(function () {
  const D = window.DATA, O = window.ONTOLOGY;
  const norm = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[–—]/g, '-');
  const STOP = new Set('a an the of for and or to in on with by at from is are was were be been do does did can could i we you me my our show find where which what who whom whose when how any all some there here data dataset datasets have has had about please give list get need looking look want would like this that these those it its than then too very into using use used were der die das und oder mit von für fur ist sind gibt es wo welche welcher wie im in ein eine zu den dem des nach auf'.split(' '));

  const FIELD_ALIASES = { exc: 'excipient', polymer: 'excipient', mat: 'material', tech: 'technique', eq: 'equipment', proj: 'project', type: 'mix', cls: 'class', fmt: 'format' };
  const FIELDS = ['api', 'excipient', 'material', 'technique', 'process', 'equipment', 'project', 'owner', 'creator', 'person', 'mix', 'form', 'legal', 'class', 'domain', 'format', 'tag', 'after', 'before', 'modified-after', 'modified-before', 'id', 'access'];

  // equipment colloquial aliases (brand / slang → equipment id)
  const EQ_ALIASES = { fabrikam: 'EQ-FDM-01', 'fx-400': 'EQ-FDM-01', contoso: 'EQ-FDM-02', 'dx-5': 'EQ-FDM-02', 'dual nozzle': 'EQ-FDM-02', 'dual extrusion': 'EQ-FDM-02', 'pharma printer': 'EQ-FDM-03', 'gmp printer': 'EQ-FDM-03', 'sls printer': 'EQ-SLS-01', 'laser printer': 'EQ-SLS-01', 'sse printer': 'EQ-SSE-01', 'dpe printer': 'EQ-DPE-01', 'powder printer': 'EQ-DPE-01', '11 mm extruder': 'EQ-HME-11', 'small extruder': 'EQ-HME-11', '16 mm extruder': 'EQ-HME-16', 'pilot extruder': 'EQ-HME-16', 'laser gauge': 'EQ-FWD-01', 'winder': 'EQ-FWD-01', 'texture analyzer': 'EQ-TXA-01', 'climate chamber': 'EQ-STB-01' };

  // ---------- ontology lexicon ----------
  const LEX = []; // {phrase, concept}
  const LEX_MAP = new Map();
  function rebuildLexicon() {
    LEX.length = 0; LEX_MAP.clear();
    O.concepts.forEach((c) => { [c.label, ...c.alt].forEach((ph) => { const n = norm(ph).trim(); if (n.length >= 2) LEX.push({ phrase: n, words: n.split(/\s+/).length, concept: c }); }); });
    LEX.sort((a, b) => b.words - a.words || b.phrase.length - a.phrase.length);
    LEX.forEach((l) => { if (!LEX_MAP.has(l.phrase)) LEX_MAP.set(l.phrase, l.concept); });
  }
  rebuildLexicon();

  // ---------- index ----------
  let DOCS = [];
  function buildIndex() {
    DOCS = D.DATASETS.map((d) => {
      const prj = D.PRJ_BY[d.project] || { name: d.project, title: '' };
      const eqs = (d.equipment || []).map((e) => D.EQ_BY[e]).filter(Boolean);
      const ppl = [D.PEOPLE_BY[d.owner], D.PEOPLE_BY[d.creator]].filter(Boolean).map((p) => p.name).join(' ');
      const conceptText = conceptLabelsFor(d).join(' ');
      const pub = {
        name: norm(d.name), title: norm(`${d.techName} ${d.formulation}`),
        tech: norm(`${d.technique} ${d.techName} ${d.process} ${d.form}`),
        eq: norm(eqs.map((e) => `${e.id} ${e.name} ${e.model}`).join(' ')),
        proj: norm(`${prj.id} ${prj.name} ${prj.title}`), ppl: norm(ppl),
        other: norm(`${d.mix} ${d.tags.join(' ')} ${d.legal} ${d.cls} ${d.domain} ${d.formats.join(' ')} ${d.eln} ${d.id} ${d.pid}`)
      };
      const full = { ...pub, title: norm(d.title), mat: norm([...d.apis, ...d.excipients, ...d.apis.map((a) => D.MAT[a] ? D.MAT[a].abbr : ''), ...d.excipients.map((a) => D.MAT[a] ? D.MAT[a].abbr : '')].join(' ')), body: norm(`${d.description} ${d.summary} ${Object.values(d.params).join(' ')} ${conceptText}`) };
      pub.mat = ''; pub.body = norm(conceptText);
      return { d, pub, full };
    });
  }
  function conceptLabelsFor(d) {
    const ids = [];
    const techMap = { DSC: 'tech.dsc', TGA: 'tech.tga', XRPD: 'tech.xrpd', RAMAN: 'tech.raman', 'RAMAN-MAP': 'tech.ramanmap', 'INLINE-RAMAN': 'tech.inraman', NIR: 'tech.nir', FTIR: 'tech.ftir', HPLC: 'tech.hplc', DISSO: 'tech.disso', TXA: 'tech.txa', RHEO: 'tech.rheo', MICROCT: 'tech.microct', SEM: 'tech.sem', DVS: 'tech.dvs', PSD: 'tech.psd', HSM: 'tech.hsm', KF: 'tech.kf', PYC: 'tech.pyc', 'FIL-QC': 'tech.filqc', STAB: 'tech.climate', HME: 'proc.hme', DESIGN: 'proc.slicing', 'FDM-PRINT': 'proc.fdm', 'SSE-PRINT': 'proc.sse', 'DPE-PRINT': 'proc.dpe', 'SLS-PRINT': 'proc.sls' };
    if (techMap[d.technique]) ids.push(techMap[d.technique]);
    return ids.map((i) => O.byId[i] ? O.byId[i].label : '');
  }

  // ---------- access ----------
  function canAccess(user, d, grants) {
    if (!user) return false;
    if (d.public) return true; // released as open data – accessible to everyone incl. third parties
    if (user.role === 'admin') return true;
    if (grants && grants.has(user.id + '|' + d.id)) return true;
    const p = D.PRJ_BY[d.project];
    const openCleared = d.cls === 'Open (internal)' && (d.legal === 'Cleared' || d.legal === 'Not required');
    if (user.role === 'guest') return false; // external guests: only public or explicitly approved data
    if (d.owner === user.id) return true;
    if (p && p.members.includes(user.id) && d.legal !== 'Not cleared') return true;
    if (p && p.owner === user.id) return true;
    return openCleared;
  }
  // composition/description visible: always with access; internal staff also see non-confidential compositions (discovery);
  // external guests never see compositions or formulations without approved access
  function canSeeDetails(user, d, grants) { if (canAccess(user, d, grants)) return true; if (!user || user.role === 'guest') return false; return !d.sensitive; }

  // ---------- query parsing ----------
  function parseQuery(q) {
    const fields = {}; const free = [];
    const re = /([a-zA-Z-]+):(?:"([^"]+)"|(\S+))|"([^"]+)"|(\S+)/g; let m;
    while ((m = re.exec(q || ''))) {
      if (m[1]) {
        let f = m[1].toLowerCase(); f = FIELD_ALIASES[f] || f;
        const v = m[2] || m[3];
        if (FIELDS.includes(f)) (fields[f] = fields[f] || []).push(v);
        else free.push(`${m[1]}:${v}`);
      } else if (m[4]) free.push({ phrase: m[4] });
      else free.push(m[5]);
    }
    return { fields, free };
  }

  // free text → concept groups + leftover term groups
  function analyzeFree(free) {
    const groups = [];
    const phrases = free.filter((x) => typeof x === 'object').map((x) => norm(x.phrase));
    const words = free.filter((x) => typeof x === 'string').map(norm).map((w) => w.replace(/[?!.,;()]/g, '')).filter(Boolean);
    phrases.forEach((p) => { const c = LEX_MAP.get(p); groups.push(c ? { type: 'concept', concept: c, text: p } : { type: 'term', text: p }); });
    let i = 0;
    while (i < words.length) {
      let matched = false;
      for (let n = Math.min(5, words.length - i); n >= 1; n--) {
        const ph = words.slice(i, i + n).join(' ');
        if (n === 1 && STOP.has(ph)) break;
        const c = LEX_MAP.get(ph) || (ph.length > 3 && (LEX_MAP.get(ph.replace(/s$/, '')) || LEX_MAP.get(ph.replace(/e?n$/, ''))));
        if (c) { groups.push({ type: 'concept', concept: c, text: ph }); i += n; matched = true; break; }
      }
      if (!matched) { const w = words[i]; if (!STOP.has(w) && w.length > 1) groups.push({ type: 'term', text: w }); i++; }
    }
    // de-duplicate concepts
    const seen = new Set();
    return groups.filter((g) => { const k = g.type === 'concept' ? g.concept.id : 't:' + g.text; if (seen.has(k)) return false; seen.add(k); return true; });
  }

  // ---------- matching ----------
  const W = { name: 6, title: 5, mat: 4, tech: 4, eq: 4, proj: 3, ppl: 2, other: 2, body: 1 };
  function termScore(h, t) {
    let s = 0;
    for (const k in W) { const v = h[k]; if (v && v.includes(t)) s += W[k] * (new RegExp('(^|[^a-z0-9])' + t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).test(v) ? 1.5 : 1); }
    return s;
  }
  function fieldMatch(d, f, vals, ctx) {
    const any = (arr, v) => arr.some((x) => norm(x).includes(norm(v)));
    return vals.some((v) => {
      const nv = norm(v);
      switch (f) {
        case 'api': return ctx.details && any(d.apis, v);
        case 'excipient': return ctx.details && any(d.excipients, v);
        case 'material': return ctx.details && (any(d.apis, v) || any(d.excipients, v));
        case 'technique': return norm(d.technique) === nv || norm(d.techName).includes(nv);
        case 'process': return norm(d.process) === nv || (nv === 'fdm' && d.technique === 'FDM-PRINT') || (nv === 'hme' && d.technique === 'HME') || (D.PRJ_BY[d.project].proc.map(norm).includes(nv));
        case 'equipment': return d.equipment.some((e) => norm(e) === nv || norm(D.EQ_BY[e].name).includes(nv) || norm(D.EQ_BY[e].model).includes(nv));
        case 'project': { const p = D.PRJ_BY[d.project]; return norm(p.id) === nv || norm(p.name).includes(nv); }
        case 'owner': return nv === 'me' ? d.owner === ctx.userId : norm(D.PEOPLE_BY[d.owner].name).includes(nv) || d.owner === v;
        case 'creator': return nv === 'me' ? d.creator === ctx.userId : norm(D.PEOPLE_BY[d.creator].name).includes(nv) || d.creator === v;
        case 'person': return ['owner', 'creator'].some((k) => nv === 'me' ? d[k] === ctx.userId : norm(D.PEOPLE_BY[d[k]].name).includes(nv) || d[k] === v);
        case 'mix': return norm(d.mix) === nv || norm(d.mix).includes(nv);
        case 'form': return norm(d.form).includes(nv);
        case 'legal': return norm(d.legal) === nv || (nv === 'cleared' && d.legal === 'Cleared');
        case 'class': return norm(d.cls) === nv || norm(d.cls).includes(nv);
        case 'domain': return norm(d.domain).includes(nv) || norm(d.source) === nv;
        case 'format': return d.formats.map(norm).includes(nv);
        case 'tag': return d.tags.map(norm).includes(nv);
        case 'after': return d.created >= v;
        case 'before': return d.created <= v;
        case 'modified-after': return d.modified >= v;
        case 'modified-before': return d.modified <= v;
        case 'access': return nv === 'public' ? !!d.public : nv === 'mine' ? canAccess({ id: ctx.userId, role: ctx.role }, d, ctx.grants) : true;
        case 'id': return norm(d.id) === nv || norm(d.name) === nv;
        default: return true;
      }
    });
  }
  function conceptQueryMatch(d, c, ctx) {
    if (!c.query) return false;
    const { fields, free } = parseQuery(c.query);
    const okFields = Object.entries(fields).every(([f, vals]) => fieldMatch(d, f, vals, ctx));
    if (!Object.keys(fields).length) return false;
    if (free.length) { /* free words in concept query are hints only */ }
    return okFields;
  }

  /**
   * search(q, {filters, user, grants, sort})
   * filters: { field: [values] } from the filter panel (exact semantics like query fields)
   */
  function search(q, opts = {}) {
    const { fields, free } = parseQuery(q);
    const filters = opts.filters || {};
    Object.entries(filters).forEach(([f, vals]) => { if (vals && vals.length) fields[f] = [...(fields[f] || []), ...vals]; });
    const groups = analyzeFree(free);
    const user = opts.user; const grants = opts.grants;
    const results = [];
    let partial = false;
    const run = (requireAll) => {
      const out = [];
      for (const doc of DOCS) {
        const d = doc.d;
        const details = canSeeDetails(user, d, grants);
        if (user && user.role === 'guest' && d.cls.startsWith('Confidential')) continue; // guests don't see confidential entries at all
        const ctx = { details, userId: user && user.id, role: user && user.role, grants };
        if (!Object.entries(fields).every(([f, vals]) => fieldMatch(d, f, vals, ctx))) continue;
        const h = details ? doc.full : doc.pub;
        let score = 0, hits = 0;
        for (const g of groups) {
          let s = 0;
          if (g.type === 'term') s = termScore(h, g.text);
          else {
            const terms = [g.concept.label, ...g.concept.alt].map(norm);
            for (const t of terms) { if (t.length > 2) { const ts = termScore(h, t); if (ts > s) s = ts; } }
            if (conceptQueryMatch(d, g.concept, ctx)) s = Math.max(s, 6);
          }
          if (s > 0) { hits++; score += s; } else if (requireAll) { score = -1; break; }
        }
        if (score < 0) continue;
        if (groups.length && hits === 0) continue;
        score += Object.keys(fields).length * 2 + (d.modified > '2026-06-01' ? 0.5 : 0);
        out.push({ d, score, hits, access: canAccess(user, d, grants), details });
      }
      return out;
    };
    let res = run(true);
    if (!res.length && groups.length > 1) { res = run(false); partial = res.length > 0; }
    const sort = opts.sort || 'relevance';
    const cmp = {
      relevance: (a, b) => b.hits - a.hits || b.score - a.score || b.d.modified.localeCompare(a.d.modified),
      created: (a, b) => b.d.created.localeCompare(a.d.created),
      modified: (a, b) => b.d.modified.localeCompare(a.d.modified),
      name: (a, b) => a.d.name.localeCompare(b.d.name)
    }[sort];
    res.sort(cmp);
    results.push(...res);
    return { results, groups, fields, partial };
  }

  function facets(results) {
    const F = { project: {}, technique: {}, mix: {}, legal: {}, class: {}, owner: {}, equipment: {}, domain: {}, tag: {}, year: {} };
    results.forEach(({ d }) => {
      const inc = (k, v) => { F[k][v] = (F[k][v] || 0) + 1; };
      inc('project', d.project); inc('technique', d.technique); inc('mix', d.mix); inc('legal', d.legal); inc('class', d.cls); inc('owner', d.owner); inc('domain', d.domain); inc('year', d.created.slice(0, 4));
      d.equipment.forEach((e) => inc('equipment', e)); d.tags.forEach((t) => inc('tag', t));
    });
    return F;
  }

  // ---------- autocomplete ----------
  function suggest(input, user, grants) {
    const raw = input.trim(); if (raw.length < 2) return [];
    const q = norm(raw); const last = norm(raw.split(/\s+/).pop());
    const out = [];
    const wp = (txt) => (' ' + norm(txt)).replace(/[-_/(]/g, ' ').includes(' ' + q);
    const push = (type, label, sub, action, value) => out.push({ type, label, sub, action, value });
    // concepts
    const cs = []; const seen = new Set();
    for (const l of LEX) { if ((l.phrase.startsWith(q) || l.phrase.startsWith(last) && last.length > 2) && !seen.has(l.concept.id)) { seen.add(l.concept.id); cs.push(l); if (cs.length >= 4) break; } }
    cs.forEach((l) => { push('concept', l.concept.label, `${O.CATEGORIES[l.concept.cat].label}${norm(l.concept.label) !== l.phrase ? ' · synonym "' + l.phrase + '"' : ''}`, 'term', l.concept.label); out[out.length - 1].whole = l.phrase.startsWith(q); });
    // equipment
    D.EQUIPMENT.filter((e) => wp(`${e.id} ${e.name} ${e.model}`)).slice(0, 3).forEach((e) => push('equipment', e.name, `${e.id} · ${e.model}`, 'equipment', e.id));
    // projects
    D.PROJECTS.filter((p) => wp(`${p.id} ${p.name} ${p.title}`)).slice(0, 3).forEach((p) => push('project', `${p.name}`, p.title, 'project', p.id));
    // people
    D.PEOPLE.filter((p) => p.id !== 'g01' && wp(p.name)).slice(0, 2).forEach((p) => push('person', p.name, p.title, 'query', `person:${p.surname}`));
    // materials
    [...D.APIS, ...D.EXCIPIENTS].filter((m) => norm(m.name).startsWith(q) || norm(m.abbr) === q).slice(0, 3).forEach((m) => push('material', m.name, `${m.kind}${m.role ? ' · ' + m.role : ''} · ${m.abbr}`, 'query', `${m.kind === 'API' ? 'api' : 'excipient'}:"${m.name}"`));
    // datasets
    let n = 0;
    for (const doc of DOCS) {
      if (user && user.role === 'guest' && doc.d.cls.startsWith('Confidential')) continue;
      const h = canSeeDetails(user, doc.d, grants) ? doc.full : doc.pub;
      if (h.name.includes(q) || h.title.includes(q)) { push('dataset', doc.d.name, canSeeDetails(user, doc.d, grants) ? doc.d.title : doc.d.techName, 'dataset', doc.d.id); if (++n >= 5) break; }
    }
    return out;
  }

  // ---------- Ask the Librarian ----------
  function ask(question, user, grants) {
    const qn = norm(question);
    const explain = []; const clauses = [];
    // dates
    const years = [...new Set((qn.match(/\b20(2[3-7])\b/g) || []))];
    let dateClause = '';
    if (/last year|letztes jahr|vergangenes jahr/.test(qn)) years.push('2025');
    if (/this year|dieses jahr|heuer/.test(qn)) years.push('2026');
    const lm = qn.match(/last (\d+) months?/);
    if (lm) { const dt = new Date(Date.parse('2026-10-01') - (+lm[1]) * 30 * 86400000).toISOString().slice(0, 10); dateClause = `after:${dt}`; explain.push({ term: dateClause, why: `Time window "last ${lm[1]} months" → created after ${dt}` }); }
    if (years.length === 1) { dateClause = `after:${years[0]}-01-01 before:${years[0]}-12-31`; explain.push({ term: dateClause, why: `Year ${years[0]} → creation date range` }); }
    let rest = qn.replace(/\b20(2[3-7])\b/g, ' ').replace(/last year|this year|last \d+ months?/g, ' ');
    // equipment aliases
    Object.entries(EQ_ALIASES).forEach(([a, id]) => { if (rest.includes(a)) { clauses.push({ q: `equipment:${id}`, why: `"${a}" → ${D.EQ_BY[id].name} (${id})`, weight: 3 }); rest = rest.replace(a, ' '); } });
    // people
    D.PEOPLE.forEach((p) => { const sn = norm(p.surname); if (sn.length > 2 && new RegExp('\\b' + sn + '\\b').test(rest)) { clauses.push({ q: `person:${sn}`, why: `"${sn}" → person ${p.name} (owner or creator)`, weight: 2 }); rest = rest.replace(sn, ' '); } });
    if (/\b(my|mine|i created|meine?)\b/.test(rest)) clauses.push({ q: 'creator:me', why: '"my" → datasets you created', weight: 1 });
    // concepts
    const groups = analyzeFree(rest.split(/\s+/).filter(Boolean));
    const concepts = groups.filter((g) => g.type === 'concept');
    concepts.forEach((g) => {
      const c = g.concept;
      if (c.query) clauses.push({ q: c.query, why: `"${g.text}" → ${c.label} (${O.CATEGORIES[c.cat].label})`, concept: c, weight: { API: 5, EXC: 4, TECH: 4, PROP: 3, FORM: 2, PROC: 2, PARAM: 2, DATA: 2, ROLE: 1 }[c.cat] });
      else explain.push({ term: c.label, why: `"${g.text}" recognised as ${c.label} – ${c.def}`, info: true });
    });
    const leftovers = groups.filter((g) => g.type === 'term' && g.text.length > 3 && !/^(were|which|brittle|print|show)$/.test(g.text)).map((g) => g.text);
    // build and relax
    const mk = (cls) => [...new Set([...cls.map((c) => c.q), dateClause].filter(Boolean).join(' ').match(/[a-z-]+:"[^"]+"|"[^"]+"|\S+/gi) || [])].join(' ');
    let used = [...clauses];
    let query = mk(used); let r = search(query, { user, grants });
    const relaxed = [];
    while (!r.results.length && used.length > 1) {
      // try dropping each clause; keep the variant with results and the highest remaining weight
      let best = null;
      used.forEach((c, i) => { const rest2 = used.filter((_, j) => j !== i); const rr = search(mk(rest2), { user, grants }); if (rr.results.length && (!best || c.weight < best.c.weight)) best = { c, i, rr }; });
      const idx = best ? best.i : used.findIndex((c) => c.weight === Math.min(...used.map((x) => x.weight)));
      relaxed.push(used[idx]); used.splice(idx, 1);
      query = mk(used); r = best ? best.rr : search(query, { user, grants });
    }
    used.forEach((c) => explain.push({ term: c.q, why: c.why }));
    // alternatives: plain-language phrases from concept synonyms
    const alternatives = [];
    concepts.slice(0, 4).forEach((g) => { const c = g.concept; [c.label, ...c.alt.slice(0, 3)].forEach((a) => { if (!alternatives.includes(a)) alternatives.push(a); }); });
    return { query: query.trim(), explain, relaxed, results: r.results, concepts: concepts.map((g) => g.concept), leftovers, alternatives: alternatives.slice(0, 10) };
  }

  buildIndex();
  window.SEARCH = { rebuildLexicon, search, facets, suggest, ask, parseQuery, analyzeFree, canAccess, canSeeDetails, buildIndex, norm, FIELDS, EQ_ALIASES };
})();
