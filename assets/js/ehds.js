/* ==========================================================================
   The FAIR Librarian – European Health Data Space (EHDS) connector · SIMULATION
   --------------------------------------------------------------------------
   Models the secondary-use chain of Regulation (EU) 2025/327 from the point of
   view of a research organisation acting as health data USER (and, for a few
   human studies, as health data HOLDER):
     EU dataset catalogue (HealthDCAT-AP, Art. 77) → data access application
     (Art. 67) / health data request (Art. 69) → single application to the HDAB
     of the main establishment, forwarded via HealthData@EU (Art. 75) → data
     permit (Art. 68) → secure processing environment (Art. 73) → output
     checking (only anonymised results leave the SPE) → publication of results
     → registration of the output in the FAIR Librarian index.
   All HDABs, data holders, datasets, permits and figures are FICTIONAL.
   EHDS secondary use applies from 26 March 2029 – the module therefore runs in
   a projected scenario (simulation clock below).
   ========================================================================== */
(function () {
  const A = () => window.APP;
  const H = () => window.APP.h;
  const SIM = '2030-02-10';
  const ELI = 'http://data.europa.eu/eli/reg/2025/327/oj';

  const KEY_DATES = [
    ['2025-03-26', 'Regulation (EU) 2025/327 enters into force'],
    ['2027-03-26', 'Member States have designated health data access bodies (HDABs)'],
    ['2029-03-26', 'Secondary-use rules apply: data permits, HealthData@EU, dataset catalogues'],
    ['2031-03-26', 'Further data categories become available, e.g. clinical-trial data']
  ];

  const HDABS = {
    AT: { name: 'Demo HDAB Austria', ncp: 'National Contact Point AT (demo)', main: true },
    BE: { name: 'Demo HDAB Belgium', ncp: 'National Contact Point BE (demo)' },
    DE: { name: 'Demo HDAB Germany', ncp: 'National Contact Point DE (demo)' },
    DK: { name: 'Demo HDAB Denmark', ncp: 'National Contact Point DK (demo)' },
    FI: { name: 'Demo HDAB Finland', ncp: 'National Contact Point FI (demo)' },
    FR: { name: 'Demo HDAB France', ncp: 'National Contact Point FR (demo)' },
    NL: { name: 'Demo HDAB Netherlands', ncp: 'National Contact Point NL (demo)' }
  };

  const CATEGORIES = ['Electronic health records', 'Administrative & claims data', 'Health registries', 'Medical-device data', 'Wellness-application data', 'Genetic & genomic data', 'Aggregated healthcare data', 'Clinical trials & studies'];

  const PURPOSES = [
    'Scientific research related to the health or care sectors',
    'Development and innovation of medicinal products or medical devices',
    'Improvement of the delivery of care and treatment optimisation',
    'Public interest in public and occupational health',
    'Policy-making and regulatory activities in the health sector',
    'Official statistics related to the health or care sectors',
    'Education or teaching in the health or care sectors'
  ];
  const PROHIBITED = [
    'Taking decisions detrimental to a natural person or group based on their health data',
    'Decisions on insurance exclusion or premiums for individuals or groups',
    'Advertising or marketing towards health professionals or patients',
    'Developing products or services that may harm individuals or society',
    'Providing access to the data to third parties not named in the permit'
  ];

  // ---- EU dataset catalogue (HealthDCAT-AP metadata – fictional) ----
  const D = (o) => o;
  const CATALOGUE = [
    D({ id: 'EHDS-BE-0012', cc: 'BE', title: 'Paediatric antiepileptic dispensations and dose titration', holder: 'Demo Mutual Health Insurance Fund (fictional)', cat: 'Administrative & claims data', desc: 'Outpatient dispensations of antiepileptic drugs to children with dose, dosage form, pharmacy compounding flag and titration steps.', minAge: 0, maxAge: 17, records: 412000, persons: 38500, period: '2015–2028', coding: ['ATC', 'ICD-10', 'DDD'], personal: ['pseudonymised person ID', 'age group', 'sex', 'region'], access: ['permit', 'request'], formats: ['pseudonymised', 'anonymised'], label: 3, keys: ['levetiracetam', 'pediatric', 'minitablet', 'dose', 'dispensation'], projects: ['PRINTPED'], trusted: false, update: 'Quarterly' }),
    D({ id: 'EHDS-FI-0031', cc: 'FI', title: 'Paediatric adrenal insufficiency registry – hydrocortisone dosing and growth', holder: 'Nordic Demo Registry Centre (fictional)', cat: 'Health registries', desc: 'Registry of children on hydrocortisone replacement: daily dose per body surface area, formulation used, growth and adrenal-crisis events.', minAge: 0, maxAge: 18, records: 52000, persons: 3100, period: '2008–2028', coding: ['ICD-10', 'ATC', 'LOINC'], personal: ['pseudonymised person ID', 'year of birth', 'sex'], access: ['permit'], formats: ['pseudonymised'], label: 4, keys: ['hydrocortisone', 'pediatric', 'dose', 'minitablet'], projects: ['PRINTPED'], trusted: true, update: 'Yearly' }),
    D({ id: 'EHDS-DK-0044', cc: 'DK', title: 'Dysphagia and tablet modification in older adults', holder: 'Demo Regional Hospital Network (fictional)', cat: 'Electronic health records', desc: 'EHR extracts on swallowing difficulties, crushing or splitting of tablets and related medication errors in patients aged 65+.', minAge: 65, maxAge: 105, records: 960000, persons: 71000, period: '2016–2028', coding: ['ICD-10', 'ATC', 'SNOMED CT'], personal: ['pseudonymised person ID', 'age band', 'sex', 'care setting'], access: ['permit', 'request'], formats: ['pseudonymised', 'anonymised'], label: 3, keys: ['swallowability', 'elderly', 'polypharmacy', 'geriatric', 'tablet'], projects: ['EUPRINT', 'POLYPILL'], trusted: false, update: 'Monthly' }),
    D({ id: 'EHDS-NL-0019', cc: 'NL', title: 'Fixed-dose combinations and adherence in type-2 diabetes and hypertension', holder: 'Demo Pharmacy Data Foundation (fictional)', cat: 'Administrative & claims data', desc: 'Pharmacy dispensing histories for metformin, hydrochlorothiazide and enalapril, including fixed-dose combinations, refill gaps and switching.', minAge: 18, maxAge: 105, records: 5400000, persons: 410000, period: '2012–2028', coding: ['ATC', 'DDD'], personal: ['pseudonymised person ID', 'age band', 'sex', 'postcode area'], access: ['permit', 'request'], formats: ['pseudonymised', 'anonymised'], label: 4, keys: ['metformin', 'hydrochlorothiazide', 'enalapril', 'polypill', 'adherence', 'fixed-dose combination'], projects: ['POLYPILL', 'EUPRINT'], trusted: true, update: 'Monthly' }),
    D({ id: 'EHDS-DE-0102', cc: 'DE', title: 'Hospital pharmacy compounding for children', holder: 'Demo University Hospital Pharmacies (fictional)', cat: 'Electronic health records', desc: 'Extemporaneous preparations (capsules, suspensions, gels) for paediatric inpatients with API, strength, batch and administration records.', minAge: 0, maxAge: 17, records: 230000, persons: 41000, period: '2018–2028', coding: ['ATC', 'EDQM Standard Terms'], personal: ['pseudonymised person ID', 'age', 'ward'], access: ['permit'], formats: ['pseudonymised'], label: 2, keys: ['compounding', 'pediatric', 'gel', 'point-of-care', 'hydrocortisone', 'levetiracetam'], projects: ['GELPRINT', 'PRINTPED'], trusted: false, update: 'Yearly' }),
    D({ id: 'EHDS-FR-0057', cc: 'FR', title: 'Dosing errors with split or crushed tablets', holder: 'Demo Hospital Group (fictional)', cat: 'Electronic health records', desc: 'Incident reports and medication records on dose deviations from splitting, crushing or dispersing tablets in paediatric and geriatric care.', minAge: 0, maxAge: 105, records: 88000, persons: 27000, period: '2017–2028', coding: ['ICD-10', 'ATC', 'MedDRA'], personal: ['pseudonymised person ID', 'age band', 'sex'], access: ['permit', 'request'], formats: ['pseudonymised', 'anonymised'], label: 2, keys: ['dose accuracy', 'pediatric', 'elderly', 'tablet', 'split'], projects: ['PRINTPED', 'EUPRINT'], trusted: false, update: 'Yearly' }),
    D({ id: 'EHDS-AT-0007', cc: 'AT', title: 'Dispensations by age group and dosage form (statistics)', holder: 'Demo Social Insurance Statistics (fictional)', cat: 'Aggregated healthcare data', desc: 'Aggregated dispensation counts per ATC code, age group and dosage form. Available as anonymised statistics through health data requests only.', minAge: 0, maxAge: 105, records: 1200000, persons: null, period: '2019–2029', coding: ['ATC', 'EDQM Standard Terms'], personal: [], access: ['request'], formats: ['anonymised'], label: 3, keys: ['dosage form', 'pediatric', 'elderly', 'statistics', 'minitablet', 'oral'], projects: ['PRINTPED', 'EUPRINT', 'POLYPILL'], trusted: true, update: 'Quarterly' }),
    D({ id: 'EHDS-BE-0033', cc: 'BE', title: 'Therapeutic drug monitoring of azole antifungals', holder: 'Demo Academic Hospital Lab (fictional)', cat: 'Electronic health records', desc: 'Plasma trough levels of itraconazole and other azoles linked to formulation brand/type, dose and co-medication.', minAge: 0, maxAge: 105, records: 64000, persons: 9800, period: '2014–2028', coding: ['LOINC', 'ATC', 'UCUM'], personal: ['pseudonymised person ID', 'age', 'sex', 'weight'], access: ['permit'], formats: ['pseudonymised'], label: 3, keys: ['itraconazole', 'bioavailability', 'amorphous solid dispersion', 'plasma level', 'poorly soluble'], projects: ['ASD3D', 'STABIASD'], trusted: false, update: 'Yearly' }),
    D({ id: 'EHDS-DK-0050', cc: 'DK', title: 'Smart pill-dispenser intake events', holder: 'Demo Home Care Services (fictional)', cat: 'Medical-device data', desc: 'Time-stamped intake events from connected pill dispensers, with missed doses and number of daily tablets.', minAge: 50, maxAge: 105, records: 31000000, persons: 12000, period: '2021–2029', coding: ['ATC'], personal: ['pseudonymised person ID', 'age band'], access: ['permit'], formats: ['pseudonymised'], label: 2, keys: ['adherence', 'polypill', 'elderly', 'pill burden'], projects: ['POLYPILL', 'EUPRINT'], trusted: false, update: 'Daily' }),
    D({ id: 'EHDS-NL-0061', cc: 'NL', title: 'Medication-reminder app: self-reported swallowing comfort', holder: 'Demo Wellness App Provider (fictional)', cat: 'Wellness-application data', desc: 'Self-reported swallowing comfort, tablet-size complaints and reminder adherence from a medication-reminder app with user consent.', minAge: 18, maxAge: 99, records: 2700000, persons: 64000, period: '2022–2029', coding: ['ATC'], personal: ['pseudonymised user ID', 'age band'], access: ['permit', 'request'], formats: ['pseudonymised', 'anonymised'], label: 1, keys: ['swallowability', 'tablet size', 'adherence', 'elderly'], projects: ['EUPRINT'], trusted: false, update: 'Weekly' }),
    D({ id: 'EHDS-FR-0071', cc: 'FR', title: 'Pharmacogenomic cohort CYP2C9 / CYP2D6', holder: 'Demo Genomics Biobank (fictional)', cat: 'Genetic & genomic data', desc: 'Genotypes for CYP2C9/CYP2D6 linked to response and tolerability of carvedilol, ibuprofen and other substrates.', minAge: 18, maxAge: 90, records: 18000, persons: 18000, period: '2015–2027', coding: ['HGVS', 'ATC', 'ICD-10'], personal: ['pseudonymised person ID', 'genotype', 'age band', 'sex'], access: ['permit'], formats: ['pseudonymised'], label: 4, keys: ['carvedilol', 'ibuprofen', 'pharmacogenomics', 'genotype'], projects: ['ASD3D'], trusted: true, update: 'Yearly' }),
    D({ id: 'EHDS-DE-0120', cc: 'DE', title: 'Pooled bioequivalence studies of oral formulations', holder: 'Demo Clinical Research Network (fictional)', cat: 'Clinical trials & studies', desc: 'Pooled pharmacokinetic data (AUC, Cmax) from bioequivalence studies of oral immediate- and modified-release formulations.', minAge: 18, maxAge: 55, records: 9400, persons: 2100, period: '2010–2028', coding: ['CDISC SDTM', 'ATC'], personal: ['pseudonymised subject ID', 'age', 'sex'], access: ['permit'], formats: ['pseudonymised'], label: 4, keys: ['bioequivalence', 'pharmacokinetics', 'dissolution', 'release', 'sustained release'], projects: ['ASD3D', 'POLYPILL'], trusted: true, update: 'Yearly', from: '2031-03-26' }),
    D({ id: 'EHDS-AT-0014', cc: 'AT', title: 'Point-of-care printed dosage forms – hospital pilot outcomes', holder: 'Sample City Hospital (fictional)', cat: 'Electronic health records', desc: 'Outcomes of personalised, point-of-care printed dosage forms (dose accuracy, acceptance, adverse events) from a hospital pharmacy pilot.', minAge: 0, maxAge: 99, records: 4200, persons: 610, period: '2026–2029', coding: ['ATC', 'SNOMED CT'], personal: ['pseudonymised person ID', 'age', 'sex'], access: ['permit', 'request'], formats: ['pseudonymised', 'anonymised'], label: 2, keys: ['3d printing', 'printlet', 'point-of-care', 'pediatric', 'gel', 'semi-solid'], projects: ['GELPRINT', 'PRINTPED'], trusted: false, update: 'Quarterly' })
  ];
  const BY = Object.fromEntries(CATALOGUE.map((d) => [d.id, d]));

  // ---- RCPE as health data holder (fictional human studies) ----
  const HOLDINGS = [
    { id: 'RCPE-HD-001', title: 'PrintPed palatability and swallowability study in children', project: 'PRINTPED', n: 48, minAge: 4, maxAge: 11, period: '2027–2028', cat: 'Clinical trials & studies', desc: 'Acceptability of 2 mm and 4 mm printed minitablets: taste rating, swallowability score, residue in mouth.', status: 'Described in national catalogue', label: 3 },
    { id: 'RCPE-HD-002', title: 'EU-Print swallowability study in older adults', project: 'EUPRINT', n: 120, minAge: 65, maxAge: 94, period: '2027–2029', cat: 'Clinical trials & studies', desc: 'Swallowing time, perceived effort and preference for printed polypills vs. conventional tablets.', status: 'Metadata in review', label: 2 }
  ];

  // ---- state ----
  function st() {
    const S = A().state;
    if (!S.ehds) { S.ehds = seed(); A().saveState(); }
    return S.ehds;
  }
  function seed() {
    const ev = (t, actor, text) => ({ t, actor, text });
    return {
      basket: [], wizard: null, tab: 'overview', catQ: '', catCountry: '', catCat: '', catAccess: '',
      apps: [
        { id: 'EHDS-APP-AT-2029-0042', type: 'permit', title: 'Dose-flexible paediatric minitablets: real-world dosing needs for levetiracetam and hydrocortisone', project: 'PRINTPED', applicant: 'p01', datasets: ['EHDS-BE-0012', 'EHDS-FI-0031'], purpose: PURPOSES[1], format: 'pseudonymised', pseudoJust: 'Longitudinal dose titration per child must be followed across dispensations; this needs a stable pseudonym. Anonymised aggregates cannot represent individual titration paths.', variables: 'Age (months), sex, body surface area band, ATC, strength, dosage form, daily dose, titration step, compounding flag', range: '2018–2028', team: ['p01', 'p08'], ethics: 'EC-DEMO-2029-117 (fictional ethics committee)', basis: 'GDPR Art. 6(1)(e) and Art. 9(2)(j) – scientific research', safeguards: 'SPE-only processing, no linkage beyond the permit, output checking, minimum cell size 10, staff trained in statistical disclosure control', created: '2029-05-06', status: 'spe',
          events: [ev('2029-05-06', 'p01', 'Application submitted to Demo HDAB Austria (main establishment)'), ev('2029-05-08', 'hdab', 'Completeness check passed'), ev('2029-05-09', 'hdab', 'Forwarded via HealthData@EU to Demo HDAB Belgium and Demo HDAB Finland'), ev('2029-06-20', 'hdab', 'Trusted data holder (FI) recommendation: approve'), ev('2029-07-30', 'hdab', 'Data permit DP-AT-2029-00117 issued (decision in 85 days)'), ev('2029-10-15', 'hdab', 'Data made available in SPE workspace AT-SPE-07')],
          permit: { id: 'DP-AT-2029-00117', issued: '2029-07-30', until: '2034-07-29', spe: 'AT-SPE-07', fee: 4850, users: ['p01', 'p08'] },
          outputs: [
            { id: 'OUT-01', title: 'Daily dose distribution by age band (levetiracetam, 0–17 y)', kind: 'Aggregate table', minCell: 24, individual: false, status: 'approved', t: '2029-12-02', note: 'Passed: all cells ≥ 10, aggregate only' },
            { id: 'OUT-02', title: 'Titration step frequencies per region and age (months)', kind: 'Aggregate table', minCell: 3, individual: false, status: 'rejected', t: '2029-12-18', note: 'Rejected: cells below the minimum size of 10 – aggregate age into bands' }
          ],
          session: [['2030-02-05 09:12', 'p01', 'Login with MFA · R workbench started'], ['2030-02-05 11:47', 'p01', 'Query on be0012_dispensations (pseudonymised)'], ['2030-02-07 14:03', 'p08', 'Login with MFA · Jupyter started'], ['2030-02-07 15:20', 'p08', 'Output request OUT-03 drafted']],
          dueResults: '2031-08-31' },
        { id: 'EHDS-APP-AT-2029-0058', type: 'permit', title: 'Swallowability-driven design of printed polypills for older adults', project: 'EUPRINT', applicant: 'p02', datasets: ['EHDS-DK-0044', 'EHDS-NL-0061'], purpose: PURPOSES[0], format: 'anonymised', pseudoJust: '', variables: 'Age band, sex, care setting, dysphagia diagnosis, number of daily oral solid units, tablet modification events', range: '2020–2028', team: ['p02', 'p04'], ethics: 'EC-DEMO-2029-142 (fictional)', basis: 'GDPR Art. 6(1)(e) and Art. 9(2)(j)', safeguards: 'Anonymised extract, SPE only, k-anonymity ≥ 10', created: '2029-11-20', status: 'assessment',
          events: [ev('2029-11-20', 'p02', 'Application submitted to Demo HDAB Austria'), ev('2029-11-22', 'hdab', 'Completeness check passed'), ev('2029-11-25', 'hdab', 'Forwarded via HealthData@EU to Demo HDAB Denmark and Demo HDAB Netherlands'), ev('2030-01-14', 'hdab', 'Data holders consulted on feasibility and minimisation')] },
        { id: 'EHDS-REQ-AT-2029-0213', type: 'request', title: 'Oral dosage forms dispensed to children vs. older adults (statistics)', project: 'PRINTPED', applicant: 'p01', datasets: ['EHDS-AT-0007'], purpose: PURPOSES[0], format: 'anonymised', variables: 'Counts by age group × dosage form (2028)', range: '2028', team: ['p01'], ethics: '–', basis: 'Not applicable – anonymised statistical output', safeguards: 'Anonymised aggregates only', created: '2029-09-02', status: 'answered',
          events: [ev('2029-09-02', 'p01', 'Health data request submitted'), ev('2029-09-03', 'hdab', 'Completeness check passed'), ev('2029-10-21', 'hdab', 'Answer delivered: anonymised statistics (cells < 10 suppressed)')],
          answer: { cols: ['Dosage form', '0–5 y', '6–11 y', '12–17 y', '65–79 y', '80+ y'], rows: [['Tablet', '1 240', '18 600', '41 300', '2 410 000', '1 380 000'], ['Oral solution / suspension', '96 400', '52 100', '9 800', '61 200', '88 900'], ['Granules / pellets', '12 300', '8 450', '2 100', '14 800', '9 100'], ['Orodispersible tablet', '3 950', '7 200', '5 600', '38 400', '29 700'], ['Minitablets', '410', '1 980', '< 10', '< 10', '< 10']], note: 'Fictional figures. Cells < 10 suppressed by the HDAB (statistical disclosure control).' } }
      ]
    };
  }

  // ---- helpers ----
  const labelStars = (n) => `<span class="qlabel" title="Data quality & utility label (Art. 78) – level ${n} of 4 (demo scale)">${'●'.repeat(n)}${'○'.repeat(4 - n)}</span>`;
  const flag = (cc) => `<span class="cc">${cc}</span>`;
  const fmtN = (n) => (n == null ? '–' : n.toLocaleString('en'));
  const statusInfo = {
    draft: ['Draft', ''], submitted: ['Submitted', 'info'], completeness: ['Completeness check', 'info'], forwarded: ['Forwarded to HDABs', 'info'], assessment: ['In assessment', 'warn'],
    permit: ['Permit issued', 'ok'], spe: ['Processing in SPE', 'ok'], answered: ['Answered', 'ok'], rejected: ['Rejected', 'bad'], closed: ['Closed – results published', '']
  };
  const FLOW_PERMIT = ['submitted', 'completeness', 'forwarded', 'assessment', 'permit', 'spe', 'closed'];
  const FLOW_REQ = ['submitted', 'completeness', 'assessment', 'answered'];
  function stepper(app) {
    const flow = app.type === 'request' ? FLOW_REQ : FLOW_PERMIT;
    const cur = flow.indexOf(app.status);
    const lab = { submitted: 'Submitted', completeness: 'Complete', forwarded: 'Forwarded', assessment: 'Assessment', permit: 'Permit', spe: 'SPE', closed: 'Published', answered: 'Answered' };
    return `<div class="stepper">${flow.map((s, i) => `${i ? `<span class="step-line ${i <= cur ? 'done' : ''}"></span>` : ''}<span class="step ${i < cur || (i === cur && ['closed', 'answered'].includes(s)) ? 'done' : i === cur ? 'cur' : ''}"><span class="sd">${i < cur ? '✓' : i + 1}</span>${lab[s]}</span>`).join('')}</div>`;
  }
  const related = (projectIds) => CATALOGUE.filter((d) => d.projects.some((p) => projectIds.includes(p)));
  function matchQuery(q) {
    const n = H().norm(q || ''); if (n.length < 3) return [];
    const words = n.split(/\s+/).filter((w) => w.length > 3);
    return CATALOGUE.filter((d) => { const hay = H().norm(`${d.title} ${d.desc} ${d.keys.join(' ')}`); return words.some((w) => hay.includes(w.replace(/s$/, ''))); });
  }

  // ---- HealthDCAT-AP export ----
  function healthDcat(d) {
    return {
      '@context': { dcat: 'http://www.w3.org/ns/dcat#', dct: 'http://purl.org/dc/terms/', dcatap: 'http://data.europa.eu/r5r/', healthdcatap: 'http://healthdataportal.eu/ns/health#', dpv: 'https://w3id.org/dpv#', foaf: 'http://xmlns.com/foaf/0.1/' },
      '@id': `https://catalogue.example.org/dataset/${d.id}`, '@type': 'dcat:Dataset',
      'dct:identifier': d.id, 'dct:title': { '@language': 'en', '@value': d.title }, 'dct:description': { '@language': 'en', '@value': d.desc },
      'dct:publisher': { '@type': 'foaf:Agent', 'foaf:name': d.holder || 'RCPE (demo)' },
      'dcatap:applicableLegislation': { '@id': ELI },
      'healthdcatap:healthCategory': d.cat, 'dct:accessRights': d.access ? (d.access.includes('permit') ? 'restricted – data permit (Art. 68)' : 'restricted – health data request (Art. 69)') : 'restricted',
      'healthdcatap:hdab': d.cc ? HDABS[d.cc].name : HDABS.AT.name, 'dct:spatial': d.cc || 'AT', 'dct:temporal': d.period,
      'healthdcatap:minTypicalAge': d.minAge, 'healthdcatap:maxTypicalAge': d.maxAge,
      'healthdcatap:numberOfRecords': d.records || d.n, 'healthdcatap:numberOfUniqueIndividuals': d.persons || d.n || null,
      'healthdcatap:hasCodingSystem': d.coding || [], 'dpv:hasPersonalData': d.personal || ['pseudonymised participant ID', 'age', 'sex'],
      'dpv:hasPurpose': 'Secondary use under Regulation (EU) 2025/327', 'healthdcatap:qualityLabel': `Level ${d.label} (demo scale)`,
      'dct:accrualPeriodicity': d.update || 'Irregular', 'rdfs:comment': 'FICTIONAL demo record'
    };
  }

  // ---- architecture diagram ----
  function archSvg() {
    const box = (x, y, w, h, title, sub, cls = '') => `<g class="arch-box ${cls}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12"/><text x="${x + w / 2}" y="${y + h / 2 - (sub ? 6 : -4)}" text-anchor="middle" class="t">${title}</text>${sub ? `<text x="${x + w / 2}" y="${y + h / 2 + 12}" text-anchor="middle" class="s">${sub}</text>` : ''}</g>`;
    const arrow = (x1, y1, x2, y2, label) => `<g class="arch-arrow"><line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" marker-end="url(#ah)"/>${label ? `<text x="${(x1 + x2) / 2}" y="${(y1 + y2) / 2 - 6}" text-anchor="middle">${label}</text>` : ''}</g>`;
    return `<svg class="arch" viewBox="0 0 1000 330" role="img" aria-label="EHDS connection architecture">
      <defs><marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" class="ah"/></marker></defs>
      ${box(10, 120, 170, 76, 'The FAIR Librarian', 'RCPE · data user & holder', 'own')}
      ${box(250, 120, 170, 76, 'Demo HDAB Austria', 'main establishment')}
      ${box(250, 236, 170, 70, 'Secure processing env.', 'AT-SPE-07 · Art. 73')}
      ${box(490, 120, 170, 76, 'NCP Austria', 'national contact point')}
      ${box(490, 18, 200, 70, 'HealthData@EU', 'central platform · Art. 75', 'eu')}
      ${box(720, 120, 160, 76, 'NCPs / HDABs', 'BE · DE · DK · FI · FR · NL')}
      ${box(840, 236, 150, 70, 'Data holders', 'hospitals, registries')}
      ${box(10, 18, 170, 70, 'EU dataset catalogue', 'HealthDCAT-AP · Art. 77', 'eu')}
      ${arrow(180, 158, 248, 158, 'application')}
      ${arrow(335, 196, 335, 234, '')}
      ${arrow(420, 158, 488, 158, '')}
      ${arrow(575, 120, 585, 90, '')}
      ${arrow(690, 60, 790, 118, '')}<text x="760" y="78" class="arch-lbl">forwarding</text>
      ${arrow(800, 196, 900, 234, '')}
      ${arrow(840, 278, 422, 276, 'permitted data (pseudonymised / anonymised)')}
      ${arrow(490, 40, 182, 40, 'metadata harvesting')}
      ${arrow(95, 88, 95, 118, '')}<text x="103" y="108" class="arch-lbl">search</text>
      ${arrow(250, 280, 182, 190, 'anonymised outputs')}
    </svg>`;
  }

  // ---- pages ----
  function page(sub) {
    const S = st();
    if (sub && ['overview', 'catalogue', 'applications', 'spe', 'compliance', 'holder', 'apply'].includes(sub)) S.tab = sub;
    const h = H(), u = h.user();
    const guest = u.role === 'guest';
    if (guest && !['overview', 'catalogue'].includes(S.tab)) S.tab = 'catalogue';
    const tabs = [['overview', 'Overview'], ['catalogue', 'EU dataset catalogue'], ...(guest ? [] : [['applications', 'Applications & permits'], ['spe', 'Secure processing'], ['compliance', 'Obligations'], ['holder', 'As data holder']])];
    let body = '';
    if (S.tab === 'overview') body = pOverview();
    else if (S.tab === 'catalogue') body = pCatalogue();
    else if (S.tab === 'applications') body = pApplications();
    else if (S.tab === 'apply') body = pWizard();
    else if (S.tab === 'spe') body = pSpe();
    else if (S.tab === 'compliance') body = pCompliance();
    else body = pHolder();
    return `<div class="page-head"><h1>European Health Data Space</h1><span class="muted">Secondary use of health data via HealthData@EU – connected to the FAIR Librarian</span></div>
      <div class="sim-banner" id="ehds-banner">${h.ic('info')}<div><b>Simulation.</b> EHDS secondary use applies from 26 March 2029, so this module runs in a projected scenario (simulation date ${h.fmtDate(SIM)}). All health data access bodies, data holders, datasets, permits and figures are fictional. Process and legal references follow Regulation (EU) 2025/327.</div></div>
      <div class="tabs" id="ehds-tabs">${tabs.map(([k, l]) => `<button data-ehdstab="${k}" class="${S.tab === k || (S.tab === 'apply' && k === 'applications') ? 'active' : ''}">${l}${k === 'catalogue' && S.basket.length ? ` <span class="cnt">${S.basket.length} selected</span>` : ''}</button>`).join('')}</div>${body}`;
  }

  function pOverview() {
    const S = st(), h = H();
    const permits = S.apps.filter((a) => a.permit).length;
    const comps = [
      ['Organisation identity', 'Registered legal entity at the HDAB; applicants authenticate with an eIDAS-notified eID and MFA', 'Simulated'],
      ['Catalogue harvesting', 'HealthDCAT-AP (DCAT-AP extension) metadata pulled from the EU dataset catalogue and synced into the Librarian ontology', 'Simulated'],
      ['Application interface', 'Standard data access application and health data request forms submitted to the HDAB of the main establishment', 'Simulated'],
      ['Cross-border routing', 'Multi-country applications forwarded through the national contact point and HealthData@EU', 'Simulated'],
      ['Secure processing environment', 'Remote workspace with named users, MFA, access logs kept ≥ 1 year, no download of personal data', 'Simulated'],
      ['Output checking', 'Statistical disclosure control before any result leaves the SPE – only anonymised outputs', 'Simulated'],
      ['Opt-out handling', 'Persons who opted out (Art. 71) are excluded by the HDAB / data holders before data are made available', 'At HDAB'],
      ['Fees & invoicing', 'Cost-based fees charged by the HDAB for preparing and providing data', 'Simulated'],
      ['Legal & ethics', 'GDPR legal basis, DPIA, ethics approval, IP / trade secret safeguards (Art. 52), prohibited uses (Art. 54)', 'Process defined'],
      ['Result publication', 'Publish results within 18 months of completing processing and acknowledge EHDS sources', 'Tracked'],
      ['As data holder', 'Describe own human-study datasets (HealthDCAT-AP), quality label (Art. 78), respond to HDAB requests', 'Prepared']
    ];
    return `<div class="grid g4 ehds-kpis">${[[h.fmtDate(SIM), 'Simulation date'], [CATALOGUE.length, 'Datasets in EU catalogue (demo)'], [S.apps.length, 'Applications & requests'], [permits, 'Active data permits']].map(([v, l]) => `<div class="card stat"><div class="v">${v}</div><div class="l">${l}</div></div>`).join('')}</div>
      <div class="card pad" style="margin-top:16px"><div class="row"><h3>Connection architecture</h3><span class="spacer"></span><span class="pill ok">${h.ic('check')} HealthData@EU · connected (simulated)</span><span class="pill">Catalogue synced ${h.fmtDate(SIM)}</span></div>${archSvg()}</div>
      <div class="card pad" style="margin-top:16px"><h3>Regulatory timeline</h3><div class="timeline">${KEY_DATES.map(([d, l]) => `<div class="tl-item ${d <= '2026-10-06' ? 'past' : d <= SIM ? 'sim' : ''}"><span class="tl-dot"></span><b>${h.fmtDate(d)}</b><span>${l}</span></div>`).join('')}</div><p class="xs muted" style="margin-top:12px">● reached today (${h.fmtDate('2026-10-06')}) · <span style="color:var(--accent)">●</span> reached in the simulation (${h.fmtDate(SIM)}) · ○ upcoming</p></div>
      <div class="card" style="margin-top:16px;overflow:auto" id="ehds-components"><table class="tbl"><thead><tr><th>Component needed for a real connection</th><th>What it does</th><th>Pilot status</th></tr></thead><tbody>${comps.map(([a, b, c]) => `<tr><td><b>${a}</b></td><td class="small">${b}</td><td><span class="pill ${c === 'Simulated' ? 'info' : c === 'At HDAB' ? '' : 'ok'}">${c}</span></td></tr>`).join('')}</tbody></table></div>`;
  }

  function pCatalogue() {
    const S = st(), h = H();
    const q = h.norm(S.catQ);
    const list = CATALOGUE.filter((d) => (!q || h.norm(`${d.title} ${d.desc} ${d.keys.join(' ')} ${d.holder}`).includes(q)) && (!S.catCountry || d.cc === S.catCountry) && (!S.catCat || d.cat === S.catCat) && (!S.catAccess || d.access.includes(S.catAccess)));
    const sel = (id, val, opts, ph) => `<select class="input input-sm" data-ehdsf="${id}"><option value="">${ph}</option>${opts.map(([v, l]) => `<option value="${h.esc(v)}" ${v === val ? 'selected' : ''}>${h.esc(l)}</option>`).join('')}</select>`;
    const guest = h.user().role === 'guest';
    return `<div class="toolbar"><input class="input input-sm" id="ehds-q" style="min-width:260px" placeholder="Search the EU catalogue (e.g. paediatric, adherence)…" value="${h.esc(S.catQ)}">${sel('catCountry', S.catCountry, Object.keys(HDABS).map((c) => [c, c + ' · ' + HDABS[c].name]), 'All countries')}${sel('catCat', S.catCat, CATEGORIES.map((c) => [c, c]), 'All categories')}${sel('catAccess', S.catAccess, [['permit', 'Data permit (individual-level)'], ['request', 'Health data request (statistics)']], 'Any access route')}<span class="spacer"></span>${guest ? '' : `<button class="btn btn-primary btn-sm" data-ehds="start" ${S.basket.length ? '' : 'disabled'}>${h.ic('send')} Apply for ${S.basket.length || ''} selected</button>`}</div>
      <div class="ehds-list" id="ehds-catalogue">${list.map((d) => { const inB = S.basket.includes(d.id); const future = d.from && d.from > SIM; return `<article class="card ehds-ds">
        <div class="ehds-ds-main"><div class="row xs muted">${flag(d.cc)}<span>${h.esc(d.cat)}</span><span>·</span><span>${h.esc(d.holder)}</span>${d.trusted ? '<span class="pill">Trusted data holder</span>' : ''}${future ? `<span class="pill warn">Available from ${h.fmtDate(d.from)}</span>` : ''}</div>
          <h3>${h.esc(d.title)}</h3><p class="small muted">${h.esc(d.desc)}</p>
          <div class="ehds-facts"><span><b>${fmtN(d.persons)}</b> persons</span><span><b>${fmtN(d.records)}</b> records</span><span>Age ${d.minAge}–${d.maxAge}</span><span>${h.esc(d.period)}</span><span>${d.coding.join(', ')}</span><span>${labelStars(d.label)}</span></div>
          <div class="row" style="gap:6px;margin-top:8px">${d.access.map((a) => `<span class="pill ${a === 'permit' ? 'info' : ''}">${a === 'permit' ? 'Data permit · Art. 68' : 'Health data request · Art. 69'}</span>`).join('')}${d.projects.map((p) => `<a class="pill gold" href="#/project/${p}" title="Relevant to this RCPE project">${h.ic('link')} ${h.esc((h.project(p) || {}).name || p)}</a>`).join('')}</div></div>
        <div class="ehds-ds-side">${guest ? '' : `<button class="btn btn-sm ${inB ? 'btn-primary' : ''}" data-ehds="toggle" data-id="${d.id}" ${future ? 'disabled' : ''}>${inB ? h.ic('check') + ' Selected' : 'Select'}</button>`}<button class="btn btn-ghost btn-sm" data-ehds="dcat" data-id="${d.id}">${h.ic('file')} HealthDCAT-AP</button></div></article>`; }).join('') || '<div class="empty card">No datasets match.</div>'}</div>`;
  }

  function appCard(a) {
    const h = H(); const [lab, cls] = statusInfo[a.status] || [a.status, ''];
    const ds = a.datasets.map((id) => BY[id]).filter(Boolean);
    const countries = [...new Set(ds.map((d) => d.cc))];
    return `<div class="card req" data-ehds-app="${a.id}"><div class="row"><b class="mono">${a.id}</b><span class="pill ${cls}">${lab}</span><span class="pill">${a.type === 'request' ? 'Health data request · Art. 69' : 'Data access application · Art. 67'}</span><span class="spacer"></span><span class="xs muted">Submitted ${h.fmtDate(a.created)}</span></div>
      <h3 style="margin-top:8px">${h.esc(a.title)}</h3>
      <div class="row small muted" style="margin-top:4px"><span>Applicant ${h.personLink(a.applicant)}</span><span>· Project <a href="#/project/${a.project}">${h.esc((h.project(a.project) || {}).name || a.project)}</a></span><span>· ${countries.length > 1 ? `Multi-country (${countries.join(', ')}) – single application to ${HDABS.AT.name}` : `${HDABS[countries[0]] ? HDABS[countries[0]].name : ''}`}</span></div>
      ${stepper(a)}
      <div class="grid g2" style="margin-top:6px"><dl class="kv kv-tight"><dt>Datasets</dt><dd>${ds.map((d) => `${flag(d.cc)} ${h.esc(d.title)}`).join('<br>')}</dd><dt>Purpose</dt><dd>${h.esc(a.purpose)}</dd><dt>Data format</dt><dd>${a.format === 'pseudonymised' ? 'Pseudonymised – justified' : 'Anonymised'}</dd></dl>
        <dl class="kv kv-tight">${a.permit ? `<dt>Data permit</dt><dd class="mono">${a.permit.id}</dd><dt>Valid</dt><dd>${h.fmtDate(a.permit.issued)} – ${h.fmtDate(a.permit.until)}</dd><dt>Fee</dt><dd>€ ${a.permit.fee.toLocaleString('en')} (fictional)</dd>` : ''}${a.dueResults ? `<dt>Results due</dt><dd>${h.fmtDate(a.dueResults)}</dd>` : ''}<dt>Team</dt><dd>${a.team.map((p) => h.esc(h.person(p).name)).join(', ')}</dd></dl></div>
      ${a.answer ? `<div class="card" style="margin-top:12px;overflow:auto"><table class="tbl"><thead><tr>${a.answer.cols.map((c) => `<th>${c}</th>`).join('')}</tr></thead><tbody>${a.answer.rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table><p class="xs muted" style="padding:0 12px">${a.answer.note}</p></div>` : ''}
      <details style="margin-top:8px"><summary class="xs muted" style="cursor:pointer">Timeline (${a.events.length} events)</summary><ul class="hist">${a.events.map((e) => `<li>${h.fmtDate(e.t)} · <b>${e.actor === 'hdab' ? 'HDAB' : h.esc(h.person(e.actor).name)}</b>: ${h.esc(e.text)}</li>`).join('')}</ul></details>
      <div class="row" style="margin-top:10px">${a.permit ? `<button class="btn btn-sm" data-ehds="permit" data-id="${a.id}">${h.ic('file')} View data permit</button><button class="btn btn-sm" data-ehdstab="spe">${h.ic('server')} Open SPE workspace</button>` : ''}${!['spe', 'closed', 'answered', 'rejected'].includes(a.status) ? `<button class="btn btn-sm btn-ghost" data-ehds="advance" data-id="${a.id}" title="Demo: simulate the next processing step at the HDAB">${h.ic('refresh')} Simulate HDAB step</button>` : ''}</div></div>`;
  }
  function pApplications() {
    const S = st(), h = H();
    return `<div class="toolbar"><span class="small muted">One application to the HDAB of the main establishment covers all countries. Decision within 3 months (extendable by 3).</span><span class="spacer"></span><button class="btn btn-primary btn-sm" data-ehds="new">${h.ic('send')} New application</button></div>
      <div id="ehds-apps">${S.apps.slice().sort((a, b) => b.created.localeCompare(a.created)).map(appCard).join('')}</div>`;
  }

  // ---- application wizard ----
  function pWizard() {
    const S = st(), h = H(); const w = S.wizard; if (!w) { S.tab = 'applications'; return pApplications(); }
    const steps = ['Route', 'Datasets', 'Purpose', 'Data & minimisation', 'Safeguards & team', 'Review'];
    const nav = `<div class="wiz-steps">${steps.map((s, i) => `<span class="${i === w.step ? 'on' : i < w.step ? 'done' : ''}">${i + 1}. ${s}</span>`).join('')}</div>`;
    const ds = w.datasets.map((id) => BY[id]).filter(Boolean);
    const countries = [...new Set(ds.map((d) => d.cc))];
    let body = '';
    if (w.step === 0) body = `<div class="grid g2">${[['permit', 'Data access application', 'Art. 67 → data permit (Art. 68)', 'Individual-level data (anonymised, or pseudonymised with justification) processed only inside a secure processing environment.'], ['request', 'Health data request', 'Art. 69', 'Anonymised statistical answer prepared by the HDAB – no access to individual-level data.']].map(([k, t, a, d]) => `<label class="card pad choice ${w.type === k ? 'on' : ''}"><input type="radio" name="wtype" value="${k}" ${w.type === k ? 'checked' : ''} data-wiz="type"><b>${t}</b><span class="xs muted">${a}</span><p class="small">${d}</p></label>`).join('')}</div>`;
    else if (w.step === 1) body = `${ds.length ? `<div class="card" style="overflow:auto"><table class="tbl"><thead><tr><th>Dataset</th><th>Country / HDAB</th><th>Category</th><th>Routes</th><th></th></tr></thead><tbody>${ds.map((d) => `<tr><td>${h.esc(d.title)}</td><td>${flag(d.cc)} ${HDABS[d.cc].name}</td><td>${h.esc(d.cat)}</td><td class="small">${d.access.join(', ')}</td><td><button class="btn btn-ghost btn-sm" data-ehds="toggle" data-id="${d.id}">Remove</button></td></tr>`).join('')}</tbody></table></div>` : '<div class="empty card">No datasets selected.</div>'}
      ${countries.length > 1 ? `<div class="callout" style="margin-top:12px">${h.ic('globe')} Multi-country: submitted once to <b>${HDABS.AT.name}</b> (main establishment) and forwarded automatically via HealthData@EU to ${countries.filter((c) => c !== 'AT').map((c) => HDABS[c].name).join(', ')}.</div>` : ''}
      ${w.type === 'request' && ds.some((d) => !d.access.includes('request')) ? `<p class="small" style="color:var(--bad)">Some datasets are only available via data permit – switch the route or remove them.</p>` : ''}<p class="small muted" style="margin-top:10px">Add or remove datasets in the <a href="#" data-ehdstab="catalogue">EU dataset catalogue</a>.</p>`;
    else if (w.step === 2) body = `<label class="fl">Project</label><select class="input" data-wiz="project">${['PRINTPED', 'EUPRINT', 'POLYPILL', 'ASD3D', 'GELPRINT', 'STABIASD'].map((p) => `<option value="${p}" ${w.project === p ? 'selected' : ''}>${h.esc((h.project(p) || {}).name || p)} – ${h.esc((h.project(p) || {}).title || '')}</option>`).join('')}</select>
      <label class="fl" style="margin-top:12px">Title of the application</label><input class="input" data-wiz="title" value="${h.esc(w.title)}" placeholder="e.g. Real-world dosing needs for paediatric minitablets">
      <label class="fl" style="margin-top:12px">Purpose (Art. 53)</label><select class="input" data-wiz="purpose">${PURPOSES.map((p) => `<option ${w.purpose === p ? 'selected' : ''}>${p}</option>`).join('')}</select>
      <label class="fl" style="margin-top:12px">Intended use and expected benefit</label><textarea class="input" rows="3" data-wiz="benefit" placeholder="Explain how the data will be used and why it benefits patients / public health">${h.esc(w.benefit)}</textarea>
      <p class="fl" style="margin-top:14px">Declaration on prohibited uses (Art. 54)</p>${PROHIBITED.map((p, i) => `<label class="row small" style="margin:4px 0"><input type="checkbox" data-wiz="noban" data-i="${i}" ${w.noban[i] ? 'checked' : ''}> The data will not be used for: ${p.toLowerCase()}</label>`).join('')}`;
    else if (w.step === 3) body = `<div class="grid g2"><div><label class="fl">Variables requested (data minimisation)</label><textarea class="input" rows="4" data-wiz="variables">${h.esc(w.variables)}</textarea>
      <label class="fl" style="margin-top:12px">Time range</label><input class="input" data-wiz="range" value="${h.esc(w.range)}"></div>
      <div><label class="fl">Data format</label>${w.type === 'request' ? '<p class="small">Anonymised statistics prepared by the HDAB.</p>' : `<select class="input" data-wiz="format"><option value="anonymised" ${w.format === 'anonymised' ? 'selected' : ''}>Anonymised (default)</option><option value="pseudonymised" ${w.format === 'pseudonymised' ? 'selected' : ''}>Pseudonymised – requires justification</option></select>
      ${w.format === 'pseudonymised' ? `<label class="fl" style="margin-top:12px">Why anonymised data are not sufficient</label><textarea class="input" rows="4" data-wiz="pseudoJust">${h.esc(w.pseudoJust)}</textarea>` : ''}`}</div></div>`;
    else if (w.step === 4) body = `<div class="grid g2"><div><label class="fl">Authorised persons (named in the permit)</label>${['p01', 'p02', 'p04', 'p06', 'p08', 'p12'].map((p) => `<label class="row small" style="margin:4px 0"><input type="checkbox" data-wiz="team" data-p="${p}" ${w.team.includes(p) ? 'checked' : ''}> ${h.esc(h.person(p).name)} <span class="muted">– ${h.esc(h.person(p).title)}</span></label>`).join('')}</div>
      <div><label class="fl">Legal basis (GDPR)</label><select class="input" data-wiz="basis"><option>GDPR Art. 6(1)(e) and Art. 9(2)(j) – scientific research</option><option>GDPR Art. 6(1)(f) and Art. 9(2)(i) – public interest in public health</option><option>Not applicable – anonymised statistics only</option></select>
      <label class="fl" style="margin-top:12px">Ethics approval</label><input class="input" data-wiz="ethics" value="${h.esc(w.ethics)}" placeholder="Reference of the ethics committee vote">
      <label class="fl" style="margin-top:12px">Safeguards against misuse and re-identification</label><textarea class="input" rows="3" data-wiz="safeguards">${h.esc(w.safeguards)}</textarea>
      <label class="row small" style="margin-top:8px"><input type="checkbox" data-wiz="dpia" ${w.dpia ? 'checked' : ''}> Data protection impact assessment completed</label></div></div>`;
    else {
      const fee = w.type === 'request' ? 650 : 1200 + ds.length * 1450 + (w.format === 'pseudonymised' ? 900 : 0);
      body = `<div class="grid g2"><dl class="kv kv-tight"><dt>Route</dt><dd>${w.type === 'request' ? 'Health data request (Art. 69)' : 'Data access application (Art. 67)'}</dd><dt>Title</dt><dd>${h.esc(w.title || '–')}</dd><dt>Project</dt><dd>${h.esc((h.project(w.project) || {}).name || '')}</dd><dt>Datasets</dt><dd>${ds.map((d) => flag(d.cc) + ' ' + h.esc(d.title)).join('<br>')}</dd><dt>Purpose</dt><dd>${h.esc(w.purpose)}</dd><dt>Format</dt><dd>${w.type === 'request' ? 'Anonymised statistics' : w.format}</dd><dt>Team</dt><dd>${w.team.map((p) => h.esc(h.person(p).name)).join(', ')}</dd></dl>
        <div><div class="callout"><b>Submitted to ${HDABS.AT.name}</b><p class="small">${countries.length > 1 ? `Forwarded via HealthData@EU to ${countries.filter((c) => c !== 'AT').length} further HDAB(s).` : 'Single-country application.'} Expected decision by ${h.fmtDate(addDays(SIM, 90))} (3 months, extendable by 3).</p></div>
        <div class="callout" style="margin-top:10px"><b>Estimated fee: € ${fee.toLocaleString('en')}</b><p class="small">Fictional estimate – HDABs charge cost-based fees for preparing and providing the data.</p></div>
        <p class="xs muted" style="margin-top:10px">After submission the Librarian tracks the permit, SPE access, output checking and your publication deadline.</p></div></div>`;
    }
    return `<div class="card pad wizard" id="ehds-wizard"><div class="row"><h3>${w.type === 'request' ? 'New health data request' : 'New data access application'}</h3><span class="spacer"></span><button class="btn btn-ghost btn-sm" data-ehds="cancel">Cancel</button></div>${nav}<div class="wiz-body">${body}</div>
      <div class="row" style="margin-top:18px"><button class="btn" data-ehds="back" ${w.step ? '' : 'disabled'}>‹ Back</button><span class="spacer"></span>${w.step < steps.length - 1 ? `<button class="btn btn-primary" data-ehds="next">Next ›</button>` : `<button class="btn btn-primary" data-ehds="submit">${h.ic('send')} Submit to ${HDABS.AT.name}</button>`}</div></div>`;
  }
  const addDays = (d, n) => new Date(Date.parse(d) + n * 86400000).toISOString().slice(0, 10);
  function validate(w) {
    const ds = w.datasets.map((id) => BY[id]);
    if (w.step === 1) { if (!ds.length) return 'Select at least one dataset'; if (w.type === 'request' && ds.some((d) => !d.access.includes('request'))) return 'Some datasets do not support health data requests'; }
    if (w.step === 2) { if (!w.title.trim()) return 'Please add a title'; if (!w.benefit.trim()) return 'Please describe the intended use and benefit'; if (w.noban.filter(Boolean).length < PROHIBITED.length) return 'Please confirm all declarations on prohibited uses'; }
    if (w.step === 3) { if (!w.variables.trim()) return 'Please list the variables you need (data minimisation)'; if (w.type === 'permit' && w.format === 'pseudonymised' && !w.pseudoJust.trim()) return 'Justify why anonymised data are not sufficient'; }
    if (w.step === 4) { if (!w.team.length) return 'Name at least one authorised person'; if (w.type === 'permit' && !w.safeguards.trim()) return 'Describe your safeguards'; }
    return '';
  }

  // ---- SPE ----
  function pSpe() {
    const S = st(), h = H();
    const apps = S.apps.filter((a) => a.permit);
    if (!apps.length) return '<div class="empty card">No active data permit – no SPE workspace yet.</div>';
    return apps.map((a) => `<div class="grid ehds-spe" id="ehds-spe">
      <div class="card pad"><div class="row"><h3>${h.ic('server')} Workspace ${a.permit.spe}</h3><span class="spacer"></span><span class="pill ok">Session active</span></div>
        <p class="small muted">Permit <span class="mono">${a.permit.id}</span> · valid until ${h.fmtDate(a.permit.until)} · ${h.esc(a.title)}</p>
        <dl class="kv kv-tight" style="margin-top:10px"><dt>Authorised users</dt><dd>${a.permit.users.map((p) => h.esc(h.person(p).name)).join(', ')} (MFA)</dd><dt>Tools</dt><dd>R, Python / Jupyter, SQL – no internet, no clipboard</dd><dt>Data in workspace</dt><dd>${a.datasets.map((id) => `<span class="mono xs">${id.toLowerCase().replace('ehds-', '')}_${a.format === 'pseudonymised' ? 'pseudo' : 'anon'}.parquet</span>`).join('<br>')}</dd><dt>Export rule</dt><dd>Only anonymised results after output checking</dd></dl>
        <h3 style="margin-top:16px">Access log <span class="xs muted">(kept at least 1 year)</span></h3><ul class="hist">${a.session.map(([t, p, x]) => `<li>${t} · <b>${h.esc(h.person(p).name)}</b>: ${h.esc(x)}</li>`).join('')}</ul></div>
      <div class="card pad"><div class="row"><h3>Output checking</h3><span class="spacer"></span><button class="btn btn-primary btn-sm" data-ehds="output" data-id="${a.id}">${h.ic('upload')} Request output export</button></div>
        <p class="small muted">The HDAB checks every output for disclosure risk (demo rule: aggregates only, all cells ≥ 10).</p>
        <div id="ehds-outputs">${a.outputs.map((o) => `<div class="out-row"><div><b>${h.esc(o.title)}</b><div class="xs muted">${o.id} · ${h.esc(o.kind)} · smallest cell ${o.minCell} · ${h.fmtDate(o.t)}</div><div class="xs ${o.status === 'approved' ? '' : 'muted'}">${h.esc(o.note)}</div></div><div class="row" style="gap:6px">${o.status === 'approved' ? `<span class="pill ok">Approved</span>${o.registered ? `<a class="pill" href="#/dataset/${o.registered}">In index</a>` : `<button class="btn btn-sm" data-ehds="register" data-app="${a.id}" data-id="${o.id}">${h.ic('db')} Register in Librarian</button>`}` : `<span class="pill bad">Rejected</span>`}</div></div>`).join('')}</div></div></div>`).join('');
  }

  // ---- obligations ----
  function pCompliance() {
    const S = st(), h = H();
    const rows = [];
    S.apps.filter((a) => a.permit).forEach((a) => {
      rows.push([a.dueResults || addDays(a.permit.until, 0), 'Publish results within 18 months of completing processing and send them to the HDAB', a.permit.id, 'Open']);
      rows.push(['ongoing', 'Inform the HDAB of significant findings relevant to the health of persons in the data', a.permit.id, 'Ongoing']);
      rows.push(['ongoing', 'No attempt to re-identify persons; process only inside the SPE', a.permit.id, 'Ongoing']);
      rows.push([addDays(a.permit.until, -30), 'Request permit extension at least one month before expiry if needed (max. +10 years)', a.permit.id, 'Planned']);
      rows.push(['each publication', 'Acknowledge EHDS data sources and the data permit in publications', a.permit.id, 'Template ready']);
    });
    const ack = 'This work uses data made available under data permit DP-AT-2029-00117 issued by Demo HDAB Austria under Regulation (EU) 2025/327 (European Health Data Space). The data holders are not responsible for the analysis or interpretation. [Fictional demo]';
    return `<div class="grid g2"><div class="card" style="overflow:auto"><table class="tbl"><thead><tr><th>Due</th><th>Obligation as health data user</th><th>Permit</th><th>Status</th></tr></thead><tbody>${rows.map(([d, o, p, s]) => `<tr><td style="white-space:nowrap">${/^\d/.test(d) ? h.fmtDate(d) : d}</td><td class="small">${o}</td><td class="mono xs">${p}</td><td><span class="pill ${s === 'Open' ? 'warn' : ''}">${s}</span></td></tr>`).join('')}</tbody></table></div>
      <div><div class="card pad"><h3>Rights of individuals</h3><p class="small">People can opt out of secondary use at any time (Art. 71). HDABs and data holders exclude their data before it is made available. The Librarian never receives identifiable health data.</p></div>
      <div class="card pad" style="margin-top:16px"><h3>Protecting RCPE and partners</h3><p class="small">Trade secrets and IP in datasets are protected (Art. 52). Prohibited uses (Art. 54) are declared in every application. Results from the SPE are registered in the index with their permit as provenance.</p></div>
      <div class="card pad" style="margin-top:16px"><h3>Acknowledgement text</h3><p class="cite">${h.esc(ack)}</p><button class="btn btn-sm" data-copy="${h.esc(ack)}">${h.ic('copy')} Copy</button></div></div></div>`;
  }

  // ---- as holder ----
  function pHolder() {
    const h = H();
    return `<div class="callout">${h.ic('info')} RCPE's formulation and analytics data (materials, processes, instruments) is <b>not</b> electronic health data and stays outside EHDS. Only human studies in which RCPE collects health data make RCPE a health data holder. Those datasets must be described for the national catalogue, labelled for quality (Art. 78 where applicable) and provided to the HDAB on request.</div>
      <div class="grid g2" style="margin-top:16px" id="ehds-holder">${HOLDINGS.map((d) => `<div class="card pad"><div class="row xs muted"><span>${h.esc(d.cat)}</span><span class="spacer"></span><span class="pill ${d.status.startsWith('Described') ? 'ok' : 'warn'}">${h.esc(d.status)}</span></div>
        <h3 style="margin-top:6px">${h.esc(d.title)}</h3><p class="small muted">${h.esc(d.desc)}</p>
        <dl class="kv kv-tight"><dt>Project</dt><dd><a href="#/project/${d.project}">${h.esc((h.project(d.project) || {}).name || d.project)}</a></dd><dt>Participants</dt><dd>${d.n} · age ${d.minAge}–${d.maxAge}</dd><dt>Period</dt><dd>${d.period}</dd><dt>Quality label</dt><dd>${labelStars(d.label)}</dd><dt>HDAB</dt><dd>${HDABS.AT.name}</dd></dl>
        <div class="row" style="margin-top:12px"><button class="btn btn-sm" data-ehds="dcat" data-id="${d.id}">${h.ic('download')} HealthDCAT-AP record</button></div></div>`).join('')}</div>`;
  }

  // ---- search integration ----
  function searchCallout(q) {
    const m = matchQuery(q); if (!m.length) return '';
    const h = H();
    return `<a class="ehds-callout" href="#/ehds/catalogue" data-ehdsq="${h.esc(q)}">${h.ic('globe')}<span><b>${m.length} related health dataset${m.length > 1 ? 's' : ''} in the EU dataset catalogue</b> (EHDS, simulation) – e.g. ${h.esc(m[0].title)}</span>${h.ic('arrow')}</a>`;
  }

  // ---- events ----
  function newWizard(type) { const S = st(); S.wizard = { step: 0, type: type || (S.basket.every((id) => BY[id].access.includes('request')) && S.basket.length ? 'permit' : 'permit'), datasets: [...S.basket], project: (BY[S.basket[0]] && BY[S.basket[0]].projects[0]) || 'PRINTPED', title: '', purpose: PURPOSES[0], benefit: '', noban: PROHIBITED.map(() => false), variables: '', range: '2018–2028', format: 'anonymised', pseudoJust: '', team: [H().user().id].filter((p) => p !== 'g01'), basis: 'GDPR Art. 6(1)(e) and Art. 9(2)(j) – scientific research', ethics: '', safeguards: '', dpia: false }; S.tab = 'apply'; }
  function readWizard(root) {
    const w = st().wizard; if (!w) return;
    root.querySelectorAll('[data-wiz]').forEach((el) => {
      const k = el.dataset.wiz;
      if (k === 'type') { if (el.checked) w.type = el.value; }
      else if (k === 'noban') w.noban[+el.dataset.i] = el.checked;
      else if (k === 'team') { const p = el.dataset.p; w.team = w.team.filter((x) => x !== p); if (el.checked) w.team.push(p); }
      else if (k === 'dpia') w.dpia = el.checked;
      else w[k] = el.value;
    });
  }
  function onClick(e) {
    const el = e.target.closest('[data-ehds],[data-ehdstab]'); if (!el || !window.APP) return;
    const S = st(), h = H(); const root = document.getElementById('app');
    if (el.dataset.ehdstab) { e.preventDefault(); readWizard(root); S.tab = el.dataset.ehdstab; A().saveState(); return h.go('#/ehds/' + S.tab); }
    const act = el.dataset.ehds, id = el.dataset.id;
    readWizard(root);
    if (act === 'toggle') { S.basket = S.basket.includes(id) ? S.basket.filter((x) => x !== id) : [...S.basket, id]; if (S.wizard) S.wizard.datasets = [...S.basket]; }
    else if (act === 'dcat') { const d = BY[id] || HOLDINGS.find((x) => x.id === id); return h.download(`${id}.healthdcat-ap.jsonld`, JSON.stringify(healthDcat(d), null, 2), 'application/ld+json'); }
    else if (act === 'start' || act === 'new') newWizard();
    else if (act === 'cancel') { S.wizard = null; S.tab = 'applications'; }
    else if (act === 'back') S.wizard.step = Math.max(0, S.wizard.step - 1);
    else if (act === 'next') { const err = validate(S.wizard); if (err) return h.toast(err, 'info'); S.wizard.step++; }
    else if (act === 'submit') {
      const w = S.wizard; const n = 300 + S.apps.length;
      const countries = [...new Set(w.datasets.map((i) => BY[i].cc))];
      const ev = [{ t: SIM, actor: h.user().id, text: `${w.type === 'request' ? 'Health data request' : 'Application'} submitted to ${HDABS.AT.name}` }];
      S.apps.push({ id: `EHDS-${w.type === 'request' ? 'REQ' : 'APP'}-AT-2030-0${n}`, type: w.type, title: w.title, project: w.project, applicant: h.user().id, datasets: [...w.datasets], purpose: w.purpose, format: w.type === 'request' ? 'anonymised' : w.format, pseudoJust: w.pseudoJust, variables: w.variables, range: w.range, team: [...w.team], ethics: w.ethics, basis: w.basis, safeguards: w.safeguards, created: SIM, status: 'submitted', events: ev, countries });
      S.wizard = null; S.basket = []; S.tab = 'applications'; A().saveState(); h.toast('Submitted – tracking in “Applications & permits”', 'send'); return h.go('#/ehds/applications');
    }
    else if (act === 'advance') {
      const a = S.apps.find((x) => x.id === id); const flow = a.type === 'request' ? FLOW_REQ : FLOW_PERMIT; const i = flow.indexOf(a.status); const nx = flow[i + 1];
      const day = addDays(a.events[a.events.length - 1].t, a.status === 'assessment' ? 60 : 3);
      const others = [...new Set(a.datasets.map((x) => BY[x].cc))].filter((c) => c !== 'AT');
      const txt = { completeness: 'Completeness check passed', forwarded: others.length ? `Forwarded via HealthData@EU to ${others.map((c) => HDABS[c].name).join(', ')}` : 'National processing – no forwarding needed', assessment: 'Assessment started; data holders consulted', permit: 'Data permit issued', spe: 'Data made available in the secure processing environment', answered: 'Anonymised statistics delivered' }[nx];
      if (a.type === 'permit' && nx === 'forwarded' && !others.length) { a.status = 'assessment'; a.events.push({ t: day, actor: 'hdab', text: 'Completeness confirmed – national assessment' }); }
      else { a.status = nx; a.events.push({ t: day, actor: 'hdab', text: txt }); }
      if (a.status === 'permit') { a.permit = { id: `DP-AT-2030-00${180 + S.apps.length}`, issued: day, until: addDays(day, 365 * 5), spe: 'AT-SPE-11', fee: 1200 + a.datasets.length * 1450, users: a.team }; a.outputs = []; a.session = [[`${day} 10:00`, a.team[0], 'Workspace provisioned']]; a.dueResults = addDays(day, 365 * 2); }
      if (a.status === 'answered') a.answer = { cols: ['Group', 'Count'], rows: [['Total (demo)', '12 480'], ['Subgroup < 10', '< 10']], note: 'Fictional anonymised statistics – small cells suppressed.' };
      h.toast(`${a.id}: ${statusInfo[a.status][0]}`, 'refresh');
    }
    else if (act === 'permit') {
      const a = S.apps.find((x) => x.id === id), p = a.permit;
      h.modal(`${h.ic('file')} Data permit ${p.id}`, `<dl class="kv kv-tight"><dt>Issued by</dt><dd>${HDABS.AT.name}${a.datasets.some((x) => BY[x].cc !== 'AT') ? ' (jointly with the HDABs of the data holders’ countries)' : ''}</dd><dt>Health data user</dt><dd>RCPE (demo) · applicant ${h.esc(h.person(a.applicant).name)}</dd><dt>Purpose</dt><dd>${h.esc(a.purpose)}</dd><dt>Datasets</dt><dd>${a.datasets.map((x) => h.esc(BY[x].title)).join('<br>')}</dd><dt>Data format</dt><dd>${a.format}</dd><dt>Authorised persons</dt><dd>${p.users.map((x) => h.esc(h.person(x).name)).join(', ')}</dd><dt>Processing</dt><dd>Only in SPE ${p.spe}; export of anonymised outputs after checking</dd><dt>Validity</dt><dd>${h.fmtDate(p.issued)} – ${h.fmtDate(p.until)} (max. 10 years, one extension possible)</dd><dt>Fee</dt><dd>€ ${p.fee.toLocaleString('en')} (fictional)</dd><dt>Conditions</dt><dd>No re-identification · no transfer to third parties · publish results within 18 months · inform the HDAB of significant findings · acknowledge sources</dd></dl><p class="xs muted" style="margin-top:12px">Fictional permit for demonstration.</p>`, `<button class="btn" data-close>Close</button>`);
      return;
    }
    else if (act === 'output') {
      const a = S.apps.find((x) => x.id === id);
      h.modal(`${h.ic('upload')} Request output export`, `<label class="fl">Output title</label><input class="input" id="o-title" value="Mean daily dose per kg by age band and dosage form">
        <div class="grid g2" style="margin-top:12px"><div><label class="fl">Type</label><select class="input" id="o-kind"><option>Aggregate table</option><option>Figure</option><option>Model coefficients</option></select></div><div><label class="fl">Smallest cell count</label><input class="input" id="o-min" type="number" value="16"></div></div>
        <label class="row small" style="margin-top:12px"><input type="checkbox" id="o-ind"> Contains individual-level records</label>`, `<button class="btn" data-close>Cancel</button><button class="btn btn-primary" id="o-go">Submit for checking</button>`);
      document.getElementById('o-go').addEventListener('click', () => {
        const min = +document.getElementById('o-min').value, ind = document.getElementById('o-ind').checked;
        const ok = !ind && min >= 10;
        a.outputs.push({ id: 'OUT-0' + (a.outputs.length + 1), title: document.getElementById('o-title').value, kind: document.getElementById('o-kind').value, minCell: min, individual: ind, status: ok ? 'approved' : 'rejected', t: SIM, note: ok ? 'Passed: aggregate only, all cells ≥ 10' : ind ? 'Rejected: individual-level records may not leave the SPE' : 'Rejected: cells below the minimum size of 10' });
        a.session.push([`${SIM} 16:${String(10 + a.outputs.length).padStart(2, '0')}`, h.user().id === 'g01' ? a.team[0] : h.user().id, 'Output request submitted for checking']);
        A().saveState(); h.closeModal(); h.render(); h.toast(ok ? 'Output approved by the HDAB (simulated)' : 'Output rejected – see reason', ok ? 'check' : 'x');
      });
      return;
    }
    else if (act === 'register') {
      const a = S.apps.find((x) => x.id === el.dataset.app), o = a.outputs.find((x) => x.id === id);
      const dsid = `DS-EHDS-${a.permit.id.slice(-5)}-${o.id.slice(-2)}`;
      h.importDatasets([{ id: dsid, name: `${a.project}_EHDS_${o.id}_${SIM.replace(/-/g, '')}`, title: `EHDS output – ${o.title}`, technique: 'EHDS-OUTPUT', techName: 'Anonymised EHDS analysis output', process: 'Secondary use (EHDS)', project: a.project, formulation: '–', mix: 'Real-world data', form: 'aggregate table', creator: a.team[0], owner: a.applicant, created: SIM, modified: SIM, formats: ['csv', 'pdf'], files: 2, sizeMB: 0.4, summary: `${o.kind}; smallest cell ${o.minCell}; checked by the HDAB.`, description: `Anonymised output exported from secure processing environment ${a.permit.spe} under data permit ${a.permit.id} (fictional). Source datasets: ${a.datasets.join(', ')}.`, params: { 'Data permit': a.permit.id, SPE: a.permit.spe, 'Source datasets': a.datasets.join(', '), 'Output check': o.note }, cls: 'Project restricted', legal: 'Cleared with conditions', legalNote: 'EHDS output – acknowledge sources, publish results within 18 months, no re-identification', agreement: `Data permit ${a.permit.id}`, tags: ['ehds output'], path: `\\\\fs-matsci01.matsci.example.local\\Projects\\${a.project}\\05_EHDS\\${o.id}`, source: 'S1', domain: 'MATSCI.EXAMPLE.LOCAL' }]);
      o.registered = dsid; A().saveState(); h.render();
      return;
    }
    A().saveState(); h.go('#/ehds/' + S.tab);
  }
  function bind(root) {
    if (!window.APP || !root.querySelector('#ehds-tabs, [data-ehdsq]')) return;
    const S = st();
    const q = root.querySelector('#ehds-q');
    if (q) q.addEventListener('input', () => { S.catQ = q.value; const pos = q.selectionStart; H().render(); const n = document.getElementById('ehds-q'); n.focus(); n.setSelectionRange(pos, pos); });
    root.querySelectorAll('[data-ehdsf]').forEach((s) => s.addEventListener('change', () => { S[s.dataset.ehdsf] = s.value; H().render(); }));
    root.querySelectorAll('[data-wiz]').forEach((el) => el.addEventListener('change', () => { readWizard(root); if (['type', 'format'].includes(el.dataset.wiz)) H().render(); }));
    root.querySelectorAll('[data-ehdsq]').forEach((a) => a.addEventListener('click', () => { S.catQ = a.dataset.ehdsq; S.tab = 'catalogue'; }));
  }
  document.addEventListener('click', onClick);

  window.EHDS = { page, bind, searchCallout, st, CATALOGUE, SIM, newWizard, setTab: (t) => { st().tab = t; }, select: (ids) => { st().basket = [...ids]; } };
})();
