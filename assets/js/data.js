/* ==========================================================================
   The FAIR Librarian – Pilot Index Data
   --------------------------------------------------------------------------
   Reference entities (people, projects, equipment, materials, index sources)
   plus a deterministic (seeded) generator that produces a realistic metadata
   index of ~1,000 research datasets from pharmaceutical 3D printing and
   materials science. All persons, partners and agreements are fictional.
   ========================================================================== */
(function () {
  // ---------- deterministic PRNG ----------
  let seed = 20251005;
  const rng = () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const pick = (a) => a[Math.floor(rng() * a.length)];
  const rint = (a, b) => a + Math.floor(rng() * (b - a + 1));
  const rfl = (a, b, d = 1) => +(a + rng() * (b - a)).toFixed(d);
  const chance = (p) => rng() < p;
  const sample = (a, n) => { const c = [...a]; const out = []; while (out.length < n && c.length) out.push(c.splice(Math.floor(rng() * c.length), 1)[0]); return out; };
  const pad = (n, l = 3) => String(n).padStart(l, '0');
  const DAY = 86400000;
  const iso = (t) => new Date(t).toISOString().slice(0, 10);
  const NOW = Date.parse('2026-10-01');

  // ---------- people (fictional) ----------
  const PEOPLE = [
    { id: 'p01', name: 'Dr. Lena Muster', title: 'Senior Scientist', group: 'Advanced Products · Pharmaceutical 3D Printing', initials: 'LM', color: '#0f766e' },
    { id: 'p02', name: 'Dr. Markus Beispiel', title: 'Area Lead Materials Science', group: 'Advanced Products', initials: 'MB', color: '#7c3aed' },
    { id: 'p03', name: 'Ing. Sabine Platzhalter', title: 'Research Data Steward / IT Administrator', group: 'Digital Infrastructure', initials: 'SP', color: '#b45309' },
    { id: 'p04', name: 'Dr. Tobias Exempel', title: 'Scientist – Hot-Melt Extrusion', group: 'Advanced Products · Melt Processing', initials: 'TE', color: '#2563eb' },
    { id: 'p05', name: 'Anna Probe, MSc', title: 'PhD Researcher – Semi-Solid Printing', group: 'Advanced Products · Pharmaceutical 3D Printing', initials: 'AP', color: '#db2777' },
    { id: 'p06', name: 'Dr. Julia Fiktiv', title: 'Team Lead Solid-State Analytics', group: 'Analytics & Characterization', initials: 'JF', color: '#0891b2' },
    { id: 'p07', name: 'DI Florian Modell', title: 'Process Engineer / Lab Lead Printing', group: 'Advanced Products · Pharmaceutical 3D Printing', initials: 'FM', color: '#65a30d' },
    { id: 'p08', name: 'Dr. Katharina Vorlage', title: 'Scientist – Biopharmaceutics & Dissolution', group: 'Analytics & Characterization', initials: 'KV', color: '#ea580c' },
    { id: 'p09', name: 'David Entwurf, MSc', title: 'PhD Researcher – Direct Powder Extrusion', group: 'Advanced Products · Melt Processing', initials: 'DE', color: '#4f46e5' },
    { id: 'p10', name: 'Dr. Elena Simul', title: 'Postdoc – Laser Sintering', group: 'Advanced Products · Pharmaceutical 3D Printing', initials: 'ES', color: '#dc2626' },
    { id: 'p11', name: 'Mag. Clara Annahme', title: 'Legal & Contracts', group: 'Legal Office', initials: 'CA', color: '#475569' },
    { id: 'p12', name: 'Dr. Stefan Szenario', title: 'Scientist – PAT & Spectroscopy', group: 'Analytics & Characterization', initials: 'SS', color: '#0d9488' },
    { id: 'g01', name: 'Guest (external partner)', title: 'External third-party account', group: 'Example Partner University', initials: 'G', color: '#64748b' }
  ];

  PEOPLE.forEach((p) => { p.surname = p.id === 'g01' ? '' : p.name.replace(/,.*$/, '').split(' ').pop(); });

  const ROLES = {
    scientist: { label: 'Scientist', user: 'p01', icon: 'flask', desc: 'Searches and reuses data. Full access to own projects and openly classified data; requests access for everything else.' },
    owner: { label: 'Data Owner', user: 'p02', icon: 'shield', desc: 'Accountable for datasets of owned projects; approves or rejects access requests.' },
    admin: { label: 'Administrator', user: 'p03', icon: 'key', desc: 'Data steward & legal gatekeeper. Sees everything, manages the index, approves legal checks and all requests.' },
    guest: { label: 'Guest', user: 'g01', icon: 'user', desc: 'External visitor. Only sees openly classified, legally cleared data; confidential details are masked.' }
  };

  // ---------- materials ----------
  const APIS = [
    // name, abbr, Tm, Tg, BCS
    ['Paracetamol', 'PCM', 169, 24, 'I'], ['Ibuprofen', 'IBU', 76, -45, 'II'], ['Theophylline', 'THEO', 273, null, 'I'],
    ['Caffeine', 'CAF', 236, null, 'I'], ['Itraconazole', 'ITZ', 166, 59, 'II'], ['Felodipine', 'FEL', 145, 45, 'II'],
    ['Carvedilol', 'CAR', 115, 38, 'II'], ['Hydrochlorothiazide', 'HCTZ', 273, null, 'IV'], ['Metformin hydrochloride', 'MET', 224, null, 'III'],
    ['Praziquantel', 'PZQ', 138, 38, 'II'], ['Fenofibrate', 'FFB', 81, -20, 'II'], ['Indomethacin', 'IND', 161, 42, 'II'],
    ['Naproxen', 'NAP', 156, 5, 'II'], ['Nifedipine', 'NIF', 173, 45, 'II'], ['Efavirenz', 'EFV', 139, 35, 'II'],
    ['Levetiracetam', 'LEV', 118, null, 'I'], ['Hydrocortisone', 'HC', 220, null, 'II'], ['Enalapril maleate', 'ENA', 144, null, 'III']
  ].map(([name, abbr, tm, tg, bcs]) => ({ name, abbr, tm, tg, bcs, kind: 'API' }));

  const EXCIPIENTS = [
    ['HPMCAS', 'HPMCAS', 'Polymer carrier', 120, true], ['HPMC', 'HPMC', 'Polymer carrier', 115, false], ['HPC', 'HPC', 'Polymer carrier', 5, false],
    ['PVP-VA 64', 'PVPVA', 'Polymer carrier', 106, true], ['PVP K30', 'PVP', 'Polymer carrier', 163, true], ['PVA', 'PVA', 'Polymer carrier', 45, false],
    ['PEO', 'PEO', 'Polymer carrier', -60, false], ['PVCL-PVAc-PEG', 'PVCL', 'Polymer carrier', 70, true], ['Amino methacrylate copolymer', 'AMMA', 'Polymer carrier', 48, true],
    ['Methacrylic acid copolymer', 'MAA', 'Polymer carrier', 150, true], ['Ammonio methacrylate copolymer', 'AMC', 'Polymer carrier', 63, false], ['Ethylcellulose', 'EC', 'Polymer carrier', 130, false],
    ['PLA', 'PLA', 'Polymer carrier', 60, false], ['PCL', 'PCL', 'Polymer carrier', -60, false], ['EVA', 'EVA', 'Polymer carrier', -30, false],
    ['Gelatin', 'GEL', 'Polymer carrier', null, false], ['Triethyl citrate', 'TEC', 'Plasticizer'], ['PEG 4000', 'PEG', 'Plasticizer'],
    ['Sorbitol', 'SOR', 'Plasticizer'], ['Mannitol', 'MAN', 'Filler'], ['MCC', 'MCC', 'Filler'], ['Lactose monohydrate', 'LAC', 'Filler'],
    ['Talc', 'TALC', 'Filler'], ['Colloidal silica', 'SiO2', 'Glidant'], ['Magnesium stearate', 'MgSt', 'Lubricant'],
    ['Croscarmellose sodium', 'CCS', 'Disintegrant'], ['Pearlescent pigment', 'PIG', 'Laser absorber']
  ].map(([name, abbr, role, tg, brittle]) => ({ name, abbr, role, tg, brittle: !!brittle, kind: 'Excipient' }));
  const MAT = Object.fromEntries([...APIS, ...EXCIPIENTS].map((m) => [m.name, m]));

  // ---------- index sources (server landscape) ----------
  const SOURCES = [
    { id: 'S1', name: 'Projects share – Materials Science', host: 'fs-matsci01.matsci.example.local', domain: 'MATSCI.EXAMPLE.LOCAL', type: 'SMB file share', root: '\\\\fs-matsci01.matsci.example.local\\Projects', crawl: '2026-10-01 02:00', status: 'OK' },
    { id: 'S2', name: 'Instrument raw-data NAS', host: 'nas-lab02.lab.example.local', domain: 'LAB.EXAMPLE.LOCAL', type: 'NAS (SMB/NFS)', root: '\\\\nas-lab02.lab.example.local\\Instruments', crawl: '2026-10-01 02:40', status: 'OK' },
    { id: 'S3', name: 'Analytics share', host: 'fs-ana01.analytics.example.local', domain: 'ANALYTICS.EXAMPLE.LOCAL', type: 'SMB file share', root: '\\\\fs-ana01.analytics.example.local\\Results', crawl: '2026-10-01 03:15', status: 'OK' },
    { id: 'S4', name: 'Collaboration SharePoint', host: 'sp.example.local', domain: 'COLLAB (SharePoint)', type: 'SharePoint / Graph API', root: 'https://sp.example.local/sites', crawl: '2026-09-30 23:00', status: 'Warning: 12 items throttled' },
    { id: 'S5', name: 'Secure contract-research vault', host: 'vault01.secure.example.local', domain: 'SECURE.EXAMPLE.LOCAL', type: 'Encrypted SMB (metadata-only crawl)', root: '\\\\vault01.secure.example.local\\Contracts', crawl: '2026-10-01 04:00', status: 'OK' },
    { id: 'S6', name: 'Electronic Lab Notebook', host: 'eln.example.local', domain: 'ELN', type: 'REST API (link enrichment)', root: 'https://eln.example.local/experiments', crawl: '2026-10-01 01:30', status: 'OK' }
  ];

  // ---------- equipment ----------
  const EQ = [
    ['EQ-FDM-01', 'FDM Printer A', '3D Printing', 'Fabrikam FX-400 · 0.4 mm hardened steel nozzle · enclosure', 'Lab 2.14 – Printing Lab', 'p07', ['FDM-PRINT']],
    ['EQ-FDM-02', 'FDM Printer B (dual extrusion)', '3D Printing', 'Contoso DX-5 Dual · dual print core · HEPA air manager', 'Lab 2.14 – Printing Lab', 'p07', ['FDM-PRINT']],
    ['EQ-FDM-03', 'Pharma FDM System', '3D Printing', 'Enclosed pharma-grade FDM printer · HEPA · in-process weight check', 'Lab 2.16 – GMP-like Suite', 'p01', ['FDM-PRINT']],
    ['EQ-SSE-01', 'Semi-Solid Extrusion Printer', '3D Printing', 'Pneumatic 3-printhead SSE system · temperature-controlled syringes (4–65 °C)', 'Lab 2.14 – Printing Lab', 'p05', ['SSE-PRINT']],
    ['EQ-DPE-01', 'Direct Powder Extrusion Printer', '3D Printing', 'Single-screw powder printhead · 0.8 mm nozzle · max 230 °C', 'Lab 2.15 – Melt Processing', 'p09', ['DPE-PRINT']],
    ['EQ-SLS-01', 'Selective Laser Sintering Printer', '3D Printing', 'Desktop SLS · 2.3 W blue diode laser (445 nm) · N₂ atmosphere', 'Lab 2.17 – Powder Lab', 'p10', ['SLS-PRINT']],
    ['EQ-HME-11', 'Twin-Screw Extruder 11 mm', 'Melt Processing', 'Co-rotating twin-screw extruder · 11 mm · 40 L/D · gravimetric feeder', 'Lab 2.15 – Melt Processing', 'p04', ['HME']],
    ['EQ-HME-16', 'Twin-Screw Extruder 16 mm', 'Melt Processing', 'Co-rotating twin-screw extruder · 16 mm · 40 L/D · side feeder & vent', 'Pilot Hall 1', 'p04', ['HME']],
    ['EQ-FWD-01', 'Filament Line (winder + laser gauge)', 'Melt Processing', 'Conveyor belt · dual-axis laser micrometer · automated spooler', 'Lab 2.15 – Melt Processing', 'p04', ['FIL-QC']],
    ['EQ-TXA-01', 'Texture Analyzer', 'Mechanical Testing', 'Universal texture analyzer · 3-point bend rig · 50 N load cell', 'Lab 3.02 – Physical Testing', 'p07', ['TXA']],
    ['EQ-RHE-01', 'Rotational Rheometer', 'Mechanical Testing', 'Oscillatory rheometer · 25 mm plate-plate · Peltier & convection oven', 'Lab 3.02 – Physical Testing', 'p04', ['RHEO']],
    ['EQ-DSC-01', 'Differential Scanning Calorimeter', 'Thermal Analysis', 'Heat-flux DSC · MDSC capable · 54-position autosampler', 'Lab 3.05 – Solid-State Analytics', 'p06', ['DSC']],
    ['EQ-TGA-01', 'Thermogravimetric Analyzer', 'Thermal Analysis', 'TGA · 25–1000 °C · N₂/air purge', 'Lab 3.05 – Solid-State Analytics', 'p06', ['TGA']],
    ['EQ-HSM-01', 'Hot-Stage Microscope', 'Thermal Analysis', 'Polarized light microscope with hot stage (–40 to 350 °C)', 'Lab 3.05 – Solid-State Analytics', 'p06', ['HSM']],
    ['EQ-XRD-01', 'X-ray Powder Diffractometer', 'Solid-State Analytics', 'Cu Kα · transmission/reflection · 1D detector', 'Lab 3.06 – X-ray Lab', 'p06', ['XRPD']],
    ['EQ-RAM-01', 'Confocal Raman Microscope', 'Spectroscopy', '785 / 532 nm · automated XYZ mapping stage', 'Lab 3.07 – Spectroscopy', 'p12', ['RAMAN', 'RAMAN-MAP']],
    ['EQ-RAM-02', 'In-line Raman Probe System', 'Spectroscopy / PAT', '785 nm process analyzer · immersion probe at die / print head', 'Lab 2.15 – Melt Processing', 'p12', ['INLINE-RAMAN']],
    ['EQ-NIR-01', 'NIR Process Spectrometer', 'Spectroscopy / PAT', 'Fiber-coupled NIR (1100–2200 nm) · reflectance probe', 'Lab 2.15 – Melt Processing', 'p12', ['NIR']],
    ['EQ-FTIR-01', 'FTIR-ATR Spectrometer', 'Spectroscopy', 'Diamond ATR · 4000–400 cm⁻¹', 'Lab 3.07 – Spectroscopy', 'p06', ['FTIR']],
    ['EQ-HPLC-01', 'HPLC-DAD System', 'Chromatography', 'UHPLC · DAD detector · column oven · 120-vial sampler', 'Lab 3.10 – Wet Analytics', 'p08', ['HPLC']],
    ['EQ-DIS-01', 'Dissolution Tester USP II', 'Biopharmaceutics', '8-vessel paddle apparatus · in-situ fiber-optic UV', 'Lab 3.10 – Wet Analytics', 'p08', ['DISSO']],
    ['EQ-CT-01', 'Micro-CT Scanner', 'Imaging', 'Desktop micro-CT · 5 µm voxel · 3D reconstruction', 'Lab 3.08 – Imaging', 'p06', ['MICROCT']],
    ['EQ-SEM-01', 'Scanning Electron Microscope', 'Imaging', 'Tabletop SEM · BSE/SE · sputter coater', 'Lab 3.08 – Imaging', 'p06', ['SEM']],
    ['EQ-DVS-01', 'Dynamic Vapor Sorption', 'Solid-State Analytics', 'Gravimetric DVS · 0–95 % RH · 25 °C / 40 °C', 'Lab 3.05 – Solid-State Analytics', 'p06', ['DVS']],
    ['EQ-PSD-01', 'Laser Diffraction Analyzer', 'Particle Characterization', 'Dry dispersion unit · 0.1–3500 µm', 'Lab 2.17 – Powder Lab', 'p09', ['PSD']],
    ['EQ-KF-01', 'Karl Fischer Titrator', 'Wet Analytics', 'Coulometric KF with oven sampler', 'Lab 3.10 – Wet Analytics', 'p08', ['KF']],
    ['EQ-PYC-01', 'Helium Pycnometer', 'Particle Characterization', 'Gas pycnometer · 1 / 10 cm³ cells', 'Lab 2.17 – Powder Lab', 'p09', ['PYC']],
    ['EQ-STB-01', 'ICH Climate Chambers', 'Stability', '25 °C/60 % RH · 30 °C/65 % RH · 40 °C/75 % RH with data loggers', 'Basement B.03 – Stability', 'p06', ['STAB']]
  ].map(([id, name, category, model, location, responsible, techniques]) => ({
    id, name, category, model, location, responsible, techniques,
    status: id === 'EQ-SLS-01' ? 'In maintenance' : 'Operational',
    calibrated: iso(Date.parse('2026-01-15') + rint(0, 240) * DAY),
    inventory: 'INV-' + rint(10000, 99999)
  }));
  const EQ_BY = Object.fromEntries(EQ.map((e) => [e.id, e]));

  // ---------- techniques ----------
  const T = (name, eq, process, formats, folder) => ({ name, eq, process, formats, folder });
  const TECH = {
    HME: T('Hot-melt extrusion run', ['EQ-HME-11', 'EQ-HME-16'], 'HME', ['csv', 'xlsx', 'pdf'], '01_Extrusion'),
    'FIL-QC': T('Filament diameter QC', ['EQ-FWD-01'], 'HME', ['csv', 'png'], '01_Extrusion'),
    TXA: T('Mechanical test (3-point bend)', ['EQ-TXA-01'], 'Characterization', ['csv', 'xlsx'], '04_Mechanics'),
    DESIGN: T('Print design (STL / G-code)', [], 'Design', ['stl', 'gcode', '3mf'], '02_Design'),
    'FDM-PRINT': T('FDM print job', ['EQ-FDM-01', 'EQ-FDM-02', 'EQ-FDM-03'], 'FDM', ['gcode', 'log', 'jpg', 'xlsx'], '03_Printing'),
    'SSE-PRINT': T('Semi-solid extrusion print job', ['EQ-SSE-01'], 'SSE', ['gcode', 'log', 'jpg'], '03_Printing'),
    'DPE-PRINT': T('Direct powder extrusion print job', ['EQ-DPE-01'], 'DPE', ['gcode', 'log', 'jpg'], '03_Printing'),
    'SLS-PRINT': T('Laser sintering build job', ['EQ-SLS-01'], 'SLS', ['stl', 'log', 'jpg'], '03_Printing'),
    DSC: T('DSC thermogram', ['EQ-DSC-01'], 'Characterization', ['raw', 'txt', 'pdf'], '05_Thermal'),
    TGA: T('TGA mass-loss curve', ['EQ-TGA-01'], 'Characterization', ['raw', 'txt', 'pdf'], '05_Thermal'),
    HSM: T('Hot-stage microscopy series', ['EQ-HSM-01'], 'Characterization', ['avi', 'jpg', 'pdf'], '05_Thermal'),
    XRPD: T('X-ray powder diffractogram', ['EQ-XRD-01'], 'Characterization', ['raw', 'xy', 'pdf'], '06_SolidState'),
    RAMAN: T('Raman spectra', ['EQ-RAM-01'], 'Characterization', ['spc', 'csv'], '07_Spectroscopy'),
    'RAMAN-MAP': T('Raman chemical map', ['EQ-RAM-01'], 'Characterization', ['wdf', 'tif', 'csv'], '07_Spectroscopy'),
    'INLINE-RAMAN': T('In-line Raman monitoring', ['EQ-RAM-02'], 'PAT', ['spc', 'csv', 'mat'], '08_PAT'),
    NIR: T('NIR process spectra', ['EQ-NIR-01'], 'PAT', ['spc', 'csv'], '08_PAT'),
    FTIR: T('FTIR-ATR spectra', ['EQ-FTIR-01'], 'Characterization', ['spa', 'csv'], '07_Spectroscopy'),
    HPLC: T('HPLC assay & related substances', ['EQ-HPLC-01'], 'Characterization', ['cdf', 'pdf', 'xlsx'], '09_Analytics'),
    DISSO: T('Dissolution profile', ['EQ-DIS-01', 'EQ-HPLC-01'], 'Characterization', ['csv', 'xlsx', 'pdf'], '10_Dissolution'),
    RHEO: T('Rheology (oscillatory)', ['EQ-RHE-01'], 'Characterization', ['csv', 'rhe'], '04_Mechanics'),
    MICROCT: T('Micro-CT scan & reconstruction', ['EQ-CT-01'], 'Characterization', ['tif', 'vol', 'pdf'], '11_Imaging'),
    SEM: T('SEM micrographs', ['EQ-SEM-01'], 'Characterization', ['tif', 'jpg'], '11_Imaging'),
    DVS: T('DVS sorption isotherm', ['EQ-DVS-01'], 'Characterization', ['xlsx', 'raw'], '06_SolidState'),
    PSD: T('Particle size distribution', ['EQ-PSD-01'], 'Characterization', ['csv', 'pdf'], '12_Powder'),
    KF: T('Karl Fischer water content', ['EQ-KF-01'], 'Characterization', ['pdf', 'csv'], '09_Analytics'),
    PYC: T('True density (He pycnometry)', ['EQ-PYC-01'], 'Characterization', ['csv', 'pdf'], '12_Powder'),
    STAB: T('Stability storage & pull log', ['EQ-STB-01'], 'Stability', ['xlsx', 'csv'], '13_Stability')
  };

  // ---------- projects ----------
  const P = (o) => o;
  const PROJECTS = [
    P({ id: 'PRINTPED', name: 'PrintPed', title: 'Patient-centric FDM printing of pediatric minitablets', pi: 'p01', owner: 'p02', members: ['p01', 'p05', 'p07', 'p08', 'p06'], funding: 'Demo Research Fund – Programme "Advanced Products"', partner: 'Example Medical University (fictional)', cls: 'Project restricted', legal: ['Cleared', 'Cleared', 'Under legal review'], start: '2024-01-08', end: '2026-12-31', status: 'Active', proc: ['FDM'], apis: ['Levetiracetam', 'Hydrocortisone', 'Enalapril maleate', 'Praziquantel', 'Paracetamol'], carriers: ['HPC', 'PVA', 'PEO', 'Amino methacrylate copolymer', 'HPMC'], nForm: 14, mix: [['API + excipient', 0.35], ['API + polymer + additive', 0.5], ['Placebo', 0.15]], desc: 'Development of dose-flexible minitablets (2–4 mm) for pediatric populations using FDM printing of drug-loaded filaments; focus on taste masking and dose accuracy.' }),
    P({ id: 'ASD3D', name: 'ASD-3D', title: 'Printed amorphous solid dispersions for poorly soluble APIs', pi: 'p04', owner: 'p02', members: ['p04', 'p06', 'p08', 'p12'], funding: 'Demo Research Fund – Programme "Advanced Products"', partner: 'Tailspin Biosciences (fictional)', cls: 'Project restricted', legal: ['Cleared', 'Cleared with conditions', 'Under legal review'], start: '2023-09-01', end: '2026-08-31', status: 'Reporting', proc: ['HME', 'FDM'], apis: ['Itraconazole', 'Felodipine', 'Carvedilol', 'Indomethacin', 'Efavirenz', 'Nifedipine'], carriers: ['HPMCAS', 'PVP-VA 64', 'PVCL-PVAc-PEG', 'Methacrylic acid copolymer', 'HPC'], nForm: 16, mix: [['API + excipient', 0.55], ['API + polymer + additive', 0.4], ['Placebo', 0.05]], desc: 'HME of ASDs and subsequent FDM printing; investigates the impact of thermal re-processing on amorphous state, miscibility and dissolution performance.' }),
    P({ id: 'FILQBD', name: 'FilaQbD', title: 'Quality-by-Design for pharmaceutical-grade filaments', pi: 'p07', owner: 'p01', members: ['p07', 'p01', 'p04', 'p12'], funding: 'Demo Innovation Agency – Bridge Call', partner: 'Example University of Technology (fictional)', cls: 'Open (internal)', legal: ['Cleared', 'Not required'], start: '2024-04-01', end: '2027-03-31', status: 'Active', proc: ['FDM'], apis: ['Theophylline', 'Caffeine', 'Paracetamol', 'Ibuprofen'], carriers: ['HPC', 'PVA', 'PEO', 'Ammonio methacrylate copolymer', 'Ethylcellulose', 'PVP-VA 64', 'PLA'], nForm: 14, mix: [['API + excipient', 0.4], ['API + polymer + additive', 0.35], ['Placebo', 0.25]], desc: 'Design space for filament diameter, mechanical properties and printability; correlation of 3-point bend results with feeding success.' }),
    P({ id: 'DIRECTPRINT', name: 'DirectPrint', title: 'Direct powder extrusion printing without filament step', pi: 'p09', owner: 'p02', members: ['p09', 'p04', 'p06'], funding: 'Demo Research Fund – Programme "Advanced Products"', partner: '–', cls: 'Project restricted', legal: ['Cleared', 'Cleared'], start: '2024-10-01', end: '2027-09-30', status: 'Active', proc: ['DPE'], apis: ['Itraconazole', 'Paracetamol', 'Naproxen', 'Praziquantel'], carriers: ['HPMCAS', 'PVCL-PVAc-PEG', 'PEO', 'HPC', 'Amino methacrylate copolymer'], nForm: 11, mix: [['API + excipient', 0.5], ['API + polymer + additive', 0.4], ['Placebo', 0.1]], desc: 'Single-screw DPE printing from powder blends; powder flow, feeding and in-situ amorphization.' }),
    P({ id: 'GELPRINT', name: 'GelPrint POC', title: 'Semi-solid extrusion for point-of-care compounding', pi: 'p05', owner: 'p01', members: ['p05', 'p01', 'p08'], funding: 'Sample City Hospital – collaboration agreement', partner: 'Sample City Hospital Pharmacy (fictional)', cls: 'Project restricted', legal: ['Cleared', 'Under legal review'], start: '2025-02-01', end: '2027-01-31', status: 'Active', proc: ['SSE'], apis: ['Levetiracetam', 'Hydrocortisone', 'Paracetamol', 'Ibuprofen'], carriers: ['Gelatin', 'HPMC', 'PEO'], nForm: 10, mix: [['API + excipient', 0.45], ['API + polymer + additive', 0.45], ['Placebo', 0.1]], desc: 'Gummy-like chewable and gel-based dosage forms printed by SSE close to the patient.' }),
    P({ id: 'POLYPILL', name: 'PolyPill-3D', title: 'Multi-compartment polypills by dual-nozzle FDM', pi: 'p01', owner: 'p01', members: ['p01', 'p07', 'p08', 'p12'], funding: 'Demo Innovation Agency – Base Call', partner: '–', cls: 'Open (internal)', legal: ['Cleared', 'Cleared'], start: '2024-06-01', end: '2026-11-30', status: 'Active', proc: ['FDM'], apis: ['Metformin hydrochloride', 'Hydrochlorothiazide', 'Caffeine', 'Enalapril maleate', 'Paracetamol'], carriers: ['PVA', 'HPC', 'Ammonio methacrylate copolymer', 'Ethylcellulose'], nForm: 10, mix: [['Multi-API', 0.6], ['API + polymer + additive', 0.4]], desc: 'Fixed-dose combinations with separate compartments and individually tuned release kinetics.' }),
    P({ id: 'LASERTAB', name: 'LaserTab', title: 'Selective laser sintering of orodispersible printlets', pi: 'p10', owner: 'p02', members: ['p10', 'p06', 'p08'], funding: 'Demo Fellowship Programme', partner: '–', cls: 'Open (internal)', legal: ['Cleared', 'Cleared', 'Not required'], start: '2024-09-01', end: '2026-08-31', status: 'Completed', proc: ['SLS'], apis: ['Paracetamol', 'Ibuprofen', 'Caffeine', 'Levetiracetam'], carriers: ['PVP-VA 64', 'HPMC', 'Methacrylic acid copolymer', 'PEO'], nForm: 10, mix: [['API + polymer + additive', 0.8], ['Placebo', 0.2]], desc: 'Porous, fast-disintegrating SLS printlets; laser energy input vs. porosity and disintegration.' }),
    P({ id: 'PRINTPAT', name: 'PrintPAT', title: 'In-line Raman/NIR monitoring of extrusion and printing', pi: 'p12', owner: 'p02', members: ['p12', 'p04', 'p07'], funding: 'Demo Research Fund – Programme "Process Analytics"', partner: 'Fabrikam Instruments (fictional)', cls: 'Confidential – CDA', legal: ['Cleared with conditions', 'Under legal review'], agreement: 'CDA-2024-014 (Fabrikam Instruments)', start: '2024-03-01', end: '2026-12-31', status: 'Active', proc: ['PAT'], apis: ['Theophylline', 'Paracetamol', 'Itraconazole', 'Carvedilol'], carriers: ['HPC', 'HPMCAS', 'PVP-VA 64', 'PVA'], nForm: 9, mix: [['API + excipient', 0.6], ['API + polymer + additive', 0.4]], desc: 'Chemometric models for real-time API content and solid state during HME and FDM.' }),
    P({ id: 'STABIASD', name: 'StabiASD', title: 'Physical stability of printed amorphous dosage forms', pi: 'p06', owner: 'p02', members: ['p06', 'p04', 'p08'], funding: 'Demo Research Fund – Programme "Advanced Products"', partner: 'Tailspin Biosciences (fictional)', cls: 'Project restricted', legal: ['Cleared', 'Cleared with conditions'], start: '2024-02-01', end: '2026-10-31', status: 'Active', proc: ['STAB'], apis: ['Itraconazole', 'Felodipine', 'Indomethacin', 'Naproxen', 'Efavirenz'], carriers: ['HPMCAS', 'PVP-VA 64', 'PVCL-PVAc-PEG', 'HPC'], nForm: 8, mix: [['API + excipient', 0.7], ['API + polymer + additive', 0.3]], desc: 'ICH storage (25/60, 40/75) of printed ASDs; recrystallization kinetics and dissolution changes.' }),
    P({ id: 'MATLIB', name: 'MatLib', title: 'API & excipient reference characterization library', pi: 'p06', owner: 'p06', members: ['p06', 'p01', 'p02', 'p04', 'p05', 'p07', 'p08', 'p09', 'p10', 'p12'], funding: 'Internal infrastructure', partner: '–', cls: 'Open (internal)', legal: ['Not required'], start: '2023-01-10', end: '2027-12-31', status: 'Active', proc: ['SOLO'], apis: APIS.map((a) => a.name), carriers: EXCIPIENTS.filter((e) => e.role === 'Polymer carrier').map((e) => e.name), nForm: 30, mix: [['Solo API', 0.55], ['Solo excipient', 0.45]], desc: 'Curated reference data (thermal, solid-state, spectroscopic, powder) of incoming APIs and excipients – the single source of truth for raw material properties.' }),
    P({ id: 'CTR-HME-A', name: 'Contract HME-A', title: 'Contract research: extrudability screening for Contoso Pharma', pi: 'p04', owner: 'p02', members: ['p04', 'p06'], funding: 'Contract research', partner: 'Contoso Pharma (fictional)', cls: 'Confidential – CDA', legal: ['Not cleared', 'Under legal review'], agreement: 'CDA-2025-003 (Contoso Pharma)', start: '2025-03-01', end: '2026-06-30', status: 'Completed', proc: ['HME'], apis: ['Carvedilol', 'Fenofibrate', 'Nifedipine'], carriers: ['PVCL-PVAc-PEG', 'HPMCAS', 'PVP-VA 64', 'Amino methacrylate copolymer'], nForm: 8, mix: [['API + excipient', 0.6], ['API + polymer + additive', 0.4]], desc: 'Confidential screening of partner API candidates (coded) for HME feasibility.', sensitive: true }),
    P({ id: 'CTR-PRINT-B', name: 'Contract Print-B', title: 'Contract research: personalized dosing feasibility for Northwind Therapeutics', pi: 'p01', owner: 'p02', members: ['p01', 'p07'], funding: 'Contract research', partner: 'Northwind Therapeutics (fictional)', cls: 'Confidential – NDA', legal: ['Not cleared', 'Cleared with conditions'], agreement: 'NDA-2025-021 (Northwind Therapeutics)', start: '2025-05-15', end: '2026-12-31', status: 'Active', proc: ['FDM'], apis: ['Hydrocortisone', 'Felodipine', 'Ibuprofen'], carriers: ['HPC', 'PVA', 'PEO'], nForm: 7, mix: [['API + excipient', 0.5], ['API + polymer + additive', 0.5]], desc: 'Feasibility of on-demand FDM dosing with partner formulation know-how.', sensitive: true }),
    P({ id: 'EUPRINT', name: 'EU-Print', title: 'EU consortium: personalised printed medicines for elderly patients', pi: 'p02', owner: 'p02', members: ['p02', 'p01', 'p04', 'p07', 'p08', 'p10'], funding: 'Demo Framework Programme (collaborative project)', partner: 'EU-Print consortium – 9 fictional partners', cls: 'Confidential – NDA', legal: ['Cleared with conditions', 'Cleared', 'Under legal review'], agreement: 'Consortium Agreement EU-Print v2.1', start: '2025-01-01', end: '2028-12-31', status: 'Active', proc: ['FDM', 'SSE'], apis: ['Metformin hydrochloride', 'Hydrochlorothiazide', 'Enalapril maleate', 'Carvedilol'], carriers: ['HPC', 'PVA', 'Amino methacrylate copolymer', 'HPMC', 'Gelatin'], nForm: 10, mix: [['API + excipient', 0.3], ['API + polymer + additive', 0.4], ['Multi-API', 0.3]], desc: 'Swallowability-optimised, multi-drug printed dosage forms for geriatric polypharmacy.' })
  ];
  PROJECTS.forEach((p) => { p.agreement = p.agreement || (p.cls.startsWith('Confidential') ? 'Agreement on file' : ''); });
  const PRJ_BY = Object.fromEntries(PROJECTS.map((p) => [p.id, p]));

  // ---------- process chains ----------
  const CHAINS = {
    FDM: { core: ['HME', 'FIL-QC', 'DESIGN', 'FDM-PRINT'], opt: { TXA: 0.75, DSC: 0.8, XRPD: 0.7, HPLC: 0.75, DISSO: 0.7, 'RAMAN-MAP': 0.25, MICROCT: 0.2, SEM: 0.2, TGA: 0.35, RHEO: 0.35, FTIR: 0.2 } },
    HME: { core: ['HME'], opt: { 'FIL-QC': 0.3, DSC: 0.9, XRPD: 0.85, FTIR: 0.5, DISSO: 0.6, HPLC: 0.6, RHEO: 0.4, HSM: 0.3, DVS: 0.2, RAMAN: 0.3, TGA: 0.4 } },
    SSE: { core: ['RHEO', 'DESIGN', 'SSE-PRINT'], opt: { HPLC: 0.8, DISSO: 0.7, TXA: 0.4, DSC: 0.3, XRPD: 0.3, SEM: 0.2, KF: 0.4 } },
    DPE: { core: ['PSD', 'DESIGN', 'DPE-PRINT'], opt: { DSC: 0.8, XRPD: 0.8, HPLC: 0.6, DISSO: 0.7, TGA: 0.4, MICROCT: 0.25, 'RAMAN-MAP': 0.3 } },
    SLS: { core: ['PSD', 'DESIGN', 'SLS-PRINT'], opt: { MICROCT: 0.75, DISSO: 0.8, XRPD: 0.6, SEM: 0.5, PYC: 0.5, DSC: 0.5, HPLC: 0.5 } },
    PAT: { core: ['HME', 'INLINE-RAMAN'], opt: { NIR: 0.6, 'FDM-PRINT': 0.6, HPLC: 0.8, 'RAMAN-MAP': 0.3 } },
    STAB: { core: ['HME', 'FDM-PRINT'], opt: { DSC: 1, XRPD: 1 }, stab: true },
    SOLO: { core: [], opt: { DSC: 0.95, TGA: 0.8, XRPD: 0.85, FTIR: 0.7, RAMAN: 0.5, DVS: 0.5, PSD: 0.6, HSM: 0.3, KF: 0.5, PYC: 0.4 } }
  };

  // ---------- generator ----------
  const DATASETS = [];
  let dsCounter = 0;
  const chooseWeighted = (pairs) => { let r = rng(), acc = 0; for (const [v, w] of pairs) { acc += w; if (r <= acc) return v; } return pairs[pairs.length - 1][0]; };
  const plasticizers = ['Triethyl citrate', 'PEG 4000', 'Sorbitol'];

  function makeFormulation(p, idx) {
    const mix = chooseWeighted(p.mix);
    const code = `F${pad(idx + 1)}`;
    let comps = [];
    const api = pick(p.apis), carrier = pick(p.carriers);
    const procs = p.proc;
    if (mix === 'Solo API') comps = [{ name: p.apis[idx % p.apis.length], role: 'API', pct: 100 }];
    else if (mix === 'Solo excipient') comps = [{ name: p.carriers[idx % p.carriers.length], role: 'Polymer carrier', pct: 100 }];
    else if (mix === 'Placebo') {
      const pl = pick(plasticizers); const pp = rint(5, 15);
      comps = [{ name: carrier, role: 'Polymer carrier', pct: 100 - pp }, { name: pl, role: 'Plasticizer', pct: pp }];
    } else if (mix === 'API + excipient') {
      const dl = p.id === 'PRINTPED' ? rint(5, 20) : rint(10, 40);
      comps = [{ name: api, role: 'API', pct: dl }, { name: carrier, role: 'Polymer carrier', pct: 100 - dl }];
    } else if (mix === 'API + polymer + additive') {
      const dl = rint(5, 30);
      const addPool = procs.includes('SLS') ? ['Pearlescent pigment', 'Mannitol', 'Colloidal silica'] : procs.includes('DPE') ? ['Colloidal silica', 'Magnesium stearate', 'Triethyl citrate'] : procs.includes('SSE') ? ['Sorbitol', 'PEG 4000', 'Croscarmellose sodium'] : ['Triethyl citrate', 'PEG 4000', 'Sorbitol', 'Talc', 'MCC', 'Magnesium stearate'];
      const add = pick(addPool); const ap = add === 'Pearlescent pigment' || add === 'Colloidal silica' || add === 'Magnesium stearate' ? rint(1, 3) : rint(5, 15);
      comps = [{ name: api, role: 'API', pct: dl }, { name: carrier, role: 'Polymer carrier', pct: 100 - dl - ap }, { name: add, role: MAT[add].role, pct: ap }];
    } else { // Multi-API
      const a2 = pick(p.apis.filter((a) => a !== api)); const d1 = rint(5, 20), d2 = rint(5, 20);
      comps = [{ name: api, role: 'API', pct: d1 }, { name: a2, role: 'API', pct: d2 }, { name: carrier, role: 'Polymer carrier', pct: 100 - d1 - d2 }];
    }
    const apiComps = comps.filter((c) => c.role === 'API');
    const carr = comps.find((c) => c.role === 'Polymer carrier');
    const hasPlast = comps.some((c) => c.role === 'Plasticizer');
    // physics-flavoured outcomes
    const asdPolymer = carr && MAT[carr.name].brittle;
    const dlTot = apiComps.reduce((s, c) => s + c.pct, 0);
    const amorphous = apiComps.length > 0 && asdPolymer && dlTot <= 30 && chance(0.85);
    const brittle = carr && MAT[carr.name].brittle && !hasPlast && chance(0.7);
    const label = comps.map((c) => `${MAT[c.name].abbr} ${c.pct}`).join(' / ');
    return { code, mix, comps, apis: apiComps.map((c) => c.name), excipients: comps.filter((c) => c.role !== 'API').map((c) => c.name), amorphous, brittle, label, carrier: carr ? carr.name : null };
  }

  function params(tech, f, eqId) {
    const api = f.apis[0] ? MAT[f.apis[0]] : null;
    const procT = api && api.tm ? Math.min(Math.max(api.tm - rint(5, 40), 110), 200) : rint(130, 185);
    switch (tech) {
      case 'HME': return { 'Barrel temperature profile': `${procT - 40}/${procT - 15}/${procT}/${procT}/${procT - 5} °C`, 'Screw speed': `${pick([50, 100, 150, 200, 300])} rpm`, 'Feed rate': `${pick([0.2, 0.3, 0.5, 1.0])} kg/h`, 'Die diameter': pick(['1.75 mm', '2.0 mm', '2.85 mm']), 'Screw configuration': pick(['SC-2 (2 kneading zones)', 'SC-1 (conveying + 1 KB 30°)', 'SC-3 (90° kneading, distributive)']) };
      case 'FIL-QC': return { 'Target diameter': '1.75 mm', 'Line speed': `${rfl(1.5, 4.5)} m/min`, 'Sampling rate': '10 Hz', 'Length measured': `${rint(8, 60)} m` };
      case 'TXA': return { Test: pick(['3-point bend (Repka-Zhang)', 'Tensile', 'Stiffness (cantilever)']), Span: '25 mm', 'Test speed': '10 mm/min', Specimens: `n = ${rint(6, 12)}`, Conditioning: '24 h, 25 °C / 30 % RH' };
      case 'DESIGN': return { Geometry: pick(['Cylinder Ø10 × 3.6 mm', 'Minitablet Ø4 × 2 mm', 'Caplet 16 × 8 × 5 mm', 'Gyroid lattice Ø12 mm', 'Two-compartment core/shell', 'Torus (donut) Ø12 mm']), 'Infill density': `${pick([15, 25, 50, 75, 100])} %`, 'Infill pattern': pick(['Rectilinear', 'Grid', 'Gyroid', 'Concentric']), 'Layer height': `${pick([0.1, 0.15, 0.2, 0.25])} mm`, Slicer: pick(['SliceLab 3.2', 'LayerForge 5.1', 'PrintPath Studio 2']) };
      case 'FDM-PRINT': return { 'Nozzle temperature': `${procT + rint(0, 25)} °C`, 'Bed temperature': `${pick([40, 50, 60, 70, 80])} °C`, 'Print speed': `${pick([10, 15, 20, 30, 40])} mm/s`, 'Layer height': `${pick([0.1, 0.15, 0.2])} mm`, 'Nozzle diameter': pick(['0.4 mm', '0.6 mm']), 'Units printed': `${rint(10, 120)}` };
      case 'SSE-PRINT': return { 'Syringe temperature': `${rint(30, 60)} °C`, Pressure: `${rfl(1.5, 4.5)} bar`, 'Needle gauge': pick(['18G', '20G', '22G']), 'Print speed': `${rint(5, 15)} mm/s`, 'Units printed': `${rint(10, 60)}` };
      case 'DPE-PRINT': return { 'Printhead temperature': `${procT} °C`, 'Screw speed': `${rint(10, 40)} rpm`, 'Nozzle diameter': '0.8 mm', 'Layer height': '0.3 mm', 'Units printed': `${rint(8, 40)}` };
      case 'SLS-PRINT': return { 'Laser power': `${rfl(1.2, 2.3)} W`, 'Scan speed': `${pick([60, 80, 100, 120, 160])} mm/s`, 'Chamber temperature': `${rint(80, 120)} °C`, 'Hatch spacing': '0.1 mm', 'Layer thickness': '0.1 mm' };
      case 'DSC': return { Method: pick(['Heat–cool–heat', 'Single heating', 'MDSC ±0.5 K/60 s']), 'Heating rate': `${pick([2, 5, 10, 20])} K/min`, Range: `-20 to ${api && api.tm ? api.tm + 30 : 220} °C`, Pan: pick(['Tzero hermetic (pinhole)', 'Aluminium crimped']), Purge: 'N₂ 50 mL/min' };
      case 'TGA': return { 'Heating rate': '10 K/min', Range: '25 to 500 °C', Atmosphere: pick(['N₂', 'Air']), 'Sample mass': `${rfl(5, 15)} mg` };
      case 'HSM': return { 'Heating rate': '10 K/min', Magnification: pick(['10×', '20×']), Polarization: 'Crossed polarizers' };
      case 'XRPD': return { Radiation: 'Cu Kα (1.5406 Å)', Range: '2θ 5–40°', 'Step size': '0.013°', Mode: pick(['Transmission', 'Reflection']), 'Time/step': `${pick([40, 60, 100])} s` };
      case 'RAMAN': case 'RAMAN-MAP': return { Laser: pick(['785 nm', '532 nm']), Objective: pick(['20×', '50× LWD']), 'Spectral range': '200–1800 cm⁻¹', ...(tech === 'RAMAN-MAP' ? { 'Map size': `${pick([2, 4, 8])} × ${pick([2, 4, 8])} mm`, 'Step size': `${pick([20, 50, 100])} µm` } : { Accumulations: `${rint(3, 10)}` }) };
      case 'INLINE-RAMAN': return { 'Probe position': pick(['Extruder die', 'Print head (nozzle)']), 'Integration time': `${pick([1, 2, 5])} s`, 'Chemometric model': pick(['PLS v3 (5 LV)', 'PLS v4 (4 LV)', 'MCR-ALS']), Duration: `${rint(20, 180)} min` };
      case 'NIR': return { Range: '1100–2200 nm', Probe: 'Diffuse reflectance', 'Spectra/min': `${rint(6, 30)}` };
      case 'FTIR': return { Mode: 'ATR (diamond)', Range: '4000–400 cm⁻¹', Resolution: '4 cm⁻¹', Scans: `${pick([16, 32, 64])}` };
      case 'HPLC': return { Column: pick(['C18 150 × 4.6 mm, 3.5 µm', 'C8 100 × 3 mm, 2.7 µm']), 'Mobile phase': pick(['ACN / 0.1 % H₃PO₄ gradient', 'MeOH / phosphate buffer pH 3.0']), Detection: `UV ${rint(220, 320)} nm`, Method: `AM-${rint(100, 199)}-v${rint(1, 4)}` };
      case 'DISSO': return { Apparatus: 'USP II (paddle)', Medium: pick(['0.1 N HCl', 'Phosphate buffer pH 6.8', 'FaSSIF', 'pH shift 1.2 → 6.8']), Volume: pick(['900 mL', '500 mL']), Speed: pick(['50 rpm', '75 rpm']), Temperature: '37 ± 0.5 °C', Vessels: 'n = 6' };
      case 'RHEO': return { Geometry: '25 mm plate-plate', Mode: pick(['Frequency sweep', 'Temperature sweep', 'Amplitude sweep']), Temperature: `${procT} °C`, 'Frequency range': '0.1–100 rad/s' };
      case 'MICROCT': return { Voxel: `${pick([5, 8, 10])} µm`, Voltage: `${pick([50, 70, 90])} kV`, Projections: `${pick([900, 1200, 1800])}`, Reconstruction: 'FDK, ring-artefact correction' };
      case 'SEM': return { Mode: pick(['SE', 'BSE']), Voltage: `${pick([5, 10, 15])} kV`, Coating: pick(['Au 10 nm', 'none (low vacuum)']), Magnifications: '50× – 2000×' };
      case 'DVS': return { Temperature: pick(['25 °C', '40 °C']), Program: '0–90–0 % RH, 10 % steps', Equilibrium: 'dm/dt < 0.002 %/min' };
      case 'PSD': return { Dispersion: 'Dry, 2 bar', Model: 'Mie / Fraunhofer', Replicates: 'n = 3' };
      case 'KF': return { Method: 'Coulometric, oven 120 °C', Replicates: 'n = 3' };
      case 'PYC': return { Gas: 'Helium', Purges: '10', Cell: '1 cm³' };
      default: return {};
    }
  }

  function summary(tech, f, ctx) {
    const api = f.apis[0] ? MAT[f.apis[0]] : null;
    const exc = f.carrier ? MAT[f.carrier] : null;
    switch (tech) {
      case 'HME': return `Stable process; torque ${rint(25, 75)} %, die pressure ${rint(10, 80)} bar; ${rint(20, 250)} m filament / extrudate collected.`;
      case 'FIL-QC': return `Mean Ø ${rfl(1.70, 1.80, 3)} mm ± ${rfl(0.01, 0.06, 3)} mm; ovality ${rfl(0.005, 0.04, 3)}; ${chance(0.8) ? 'within' : 'outside'} ±0.05 mm specification.`;
      case 'TXA': return f.brittle ? `Breaking stress ${rfl(8, 25)} MPa, distance at break ${rfl(0.3, 0.9)} mm – brittle, fails feeding criterion.` : `Breaking stress ${rfl(25, 60)} MPa, distance at break ${rfl(1.2, 4.0)} mm – flexible, feedable.`;
      case 'DESIGN': return `Parametric design file and sliced G-code; target dose ${rint(5, 250)} mg.`;
      case 'FDM-PRINT': case 'DPE-PRINT': case 'SSE-PRINT': case 'SLS-PRINT': return ctx.printFail ? `Print aborted: ${pick(['filament breakage in feeder', 'nozzle clogging', 'poor bed adhesion', 'under-extrusion'])}.` : `${rint(10, 96)} units, mass ${rint(40, 600)} ± ${rfl(0.8, 4.5)} % ; print time ${rint(2, 25)} min/unit; success rate ${rint(85, 100)} %.`;
      case 'DSC': return f.mix.startsWith('Solo excipient') ? `Tg ${exc && exc.tg != null ? exc.tg + rfl(-3, 3) : rint(40, 160)} °C (midpoint).` : f.amorphous ? `Single Tg at ${rint(45, 120)} °C; no melting endotherm – amorphous, miscible.` : api && api.tm ? `Melting endotherm at ${api.tm + rfl(-6, 1)} °C (ΔH ${rfl(10, 140)} J/g)${f.mix === 'Solo API' ? '.' : ' – residual crystalline API.'}` : `Tg ${rint(40, 120)} °C.`;
      case 'TGA': return `Mass loss < ${rfl(0.5, 3)} % up to ${rint(150, 220)} °C; degradation onset ${rint(190, 320)} °C.`;
      case 'HSM': return `${api ? api.name : 'Sample'} ${chance(0.5) ? 'fully dissolved in polymer melt' : 'melted'} at ${rint(110, 220)} °C; no recrystallization on cooling.`;
      case 'XRPD': return f.amorphous ? 'Diffuse halo – X-ray amorphous.' : f.mix === 'Solo excipient' ? (chance(0.5) ? 'Amorphous halo (polymer).' : 'Semi-crystalline pattern.') : `Bragg reflections of ${api ? api.name : 'crystalline phase'} ${pick(['form I', 'form II', 'stable polymorph'])} detected.`;
      case 'RAMAN': return `Spectral fingerprint ${f.amorphous ? 'shows peak broadening consistent with amorphous API' : 'matches reference crystalline form'}.`;
      case 'RAMAN-MAP': return `API distribution RSD ${rfl(2, 15)} % across map; ${f.amorphous ? 'no crystalline domains' : 'isolated crystalline clusters'} detected.`;
      case 'INLINE-RAMAN': return `Predicted API content ${rfl(95, 104)} % LC (RMSEP ${rfl(0.4, 1.5)} %); ${rint(1, 3)} transients detected.`;
      case 'NIR': return `Content model R² ${rfl(0.95, 0.995, 3)}; moisture trend stable.`;
      case 'FTIR': return f.amorphous ? `Carbonyl shift of ${rint(4, 15)} cm⁻¹ indicating API–polymer H-bonding.` : 'Spectrum matches reference; no specific interactions.';
      case 'HPLC': return `Assay ${rfl(95, 102)} % LC; total impurities ${rfl(0.05, 0.9, 2)} %.`;
      case 'DISSO': return chance(0.5) ? `${rint(60, 100)} % released at 30 min (immediate release).` : `t80 % = ${rfl(2, 16)} h (sustained release); f2 vs reference ${rint(40, 80)}.`;
      case 'RHEO': return `|η*| = ${rint(200, 15000)} Pa·s at 1 rad/s; shear-thinning; crossover at ${rfl(1, 60)} rad/s.`;
      case 'MICROCT': return `Porosity ${rfl(2, 45)} %; infill deviation ${rfl(0.5, 8)} % from design.`;
      case 'SEM': return pick(['Visible layer lines, fused strands', 'Porous sintered particle network', 'Smooth surface, no API crystals', 'Surface crystals observed']) + '.';
      case 'DVS': return `Moisture uptake ${rfl(0.5, 25)} % at 90 % RH; ${chance(0.3) ? 'hysteresis observed' : 'reversible'}.`;
      case 'PSD': return `d10 ${rint(5, 40)} µm, d50 ${rint(40, 180)} µm, d90 ${rint(180, 500)} µm.`;
      case 'KF': return `Water content ${rfl(0.2, 6)} % (w/w).`;
      case 'PYC': return `True density ${rfl(1.15, 1.55, 3)} g/cm³.`;
      case 'STAB': return `Condition ${ctx.cond}; pulls at ${ctx.tps.join(', ')}; logger deviation < 2 % RH.`;
      default: return '';
    }
  }

  const ownersOf = (p) => p.owner;
  const creatorFor = (tech, p) => {
    const analysts = { DSC: 'p06', TGA: 'p06', XRPD: 'p06', HSM: 'p06', DVS: 'p06', MICROCT: 'p06', SEM: 'p06', HPLC: 'p08', DISSO: 'p08', KF: 'p08', RAMAN: 'p12', 'RAMAN-MAP': 'p12', 'INLINE-RAMAN': 'p12', NIR: 'p12', FTIR: 'p06' };
    if (analysts[tech] && chance(0.6)) return analysts[tech];
    return pick(p.members);
  };

  function locate(p, tech, eqId, name, year) {
    if (p.cls.startsWith('Confidential')) return { src: 'S5', path: `\\\\vault01.secure.example.local\\Contracts\\${p.id}\\${TECH[tech].folder}\\${name}` };
    const r = rng();
    if (r < 0.5) return { src: 'S1', path: `\\\\fs-matsci01.matsci.example.local\\Projects\\${p.id}\\03_Data\\${TECH[tech].folder}\\${name}` };
    if (r < 0.78 && eqId) return { src: 'S2', path: `\\\\nas-lab02.lab.example.local\\Instruments\\${eqId}\\${year}\\${name}` };
    if (r < 0.9) return { src: 'S3', path: `\\\\fs-ana01.analytics.example.local\\Results\\${year}\\${p.id}\\${name}` };
    return { src: 'S4', path: `https://sp.example.local/sites/${p.id}/Shared Documents/Data/${TECH[tech].folder}/${name}` };
  }

  function addDataset(p, f, tech, t, extra = {}) {
    const tDef = TECH[tech];
    const eqId = tDef.eq.length ? (tech === 'FDM-PRINT' && f.mix === 'Multi-API' ? 'EQ-FDM-02' : pick(tDef.eq)) : null;
    const eqIds = eqId ? [eqId] : [];
    if (tech === 'DISSO' && chance(0.5)) eqIds.push('EQ-HPLC-01');
    if (tech === 'STAB') { /* chamber only */ }
    const created = Math.min(t, NOW - rint(1, 20) * DAY);
    const modified = Math.min(created + (chance(0.35) ? 0 : rint(1, 160)) * DAY, NOW);
    const y = new Date(created).getFullYear();
    const dstr = iso(created).replace(/-/g, '');
    dsCounter++;
    const suffix = extra.suffix ? `_${extra.suffix}` : '';
    const name = `${p.id}_${f.code}_${tech}_${dstr}${suffix}_R${rint(1, 3)}`;
    const loc = locate(p, tech, eqId, name, y);
    const creator = creatorFor(tech, p);
    const legal = pick(p.legal);
    const form = { HME: 'filament', 'FIL-QC': 'filament', TXA: 'filament', DESIGN: 'digital design', RHEO: f.excipients.includes('Gelatin') ? 'gel' : 'melt', PSD: 'physical mixture', 'INLINE-RAMAN': 'extrudate', NIR: 'extrudate' }[tech] || (f.mix.startsWith('Solo') ? 'raw material' : p.proc.includes('SSE') ? 'gel' : 'printlet');
    const ctx = { printFail: f.brittle && tech === 'FDM-PRINT' && chance(0.7), ...extra };
    const tags = [];
    if (f.mix.startsWith('Solo')) tags.push('reference material');
    if (f.amorphous && ['DSC', 'XRPD', 'RAMAN-MAP', 'FTIR', 'HME'].includes(tech)) tags.push('amorphous');
    if (f.brittle && ['TXA', 'FIL-QC', 'FDM-PRINT'].includes(tech)) tags.push('brittle filament');
    if (!f.brittle && ['FDM-PRINT', 'TXA'].includes(tech) && !ctx.printFail) tags.push('printable');
    if (p.proc.includes('STAB') && (extra.suffix || tech === 'STAB')) tags.push('stability study');
    if (p.sensitive) tags.push('partner material');
    if ((legal === 'Cleared') && chance(0.12)) tags.push('published');
    const comps = p.sensitive ? f.comps.map((c) => ({ ...c, name: c.role === 'API' ? `${MAT[c.name].abbr}-coded (${c.name})` : c.name })) : f.comps;
    const files = rint(1, tech === 'MICROCT' ? 1200 : tech === 'RAMAN-MAP' ? 40 : 12);
    const ds = {
      id: `DS-${pad(dsCounter, 5)}`,
      pid: `rcpe:ds:${y}.${pad(dsCounter, 5)}`,
      name,
      title: `${tDef.name} – ${f.mix.startsWith('Solo') ? f.comps[0].name : f.label}${extra.suffix ? ' · ' + extra.suffix.replace(/_/g, ' ') : ''}`,
      technique: tech, techName: tDef.name, process: tDef.process === 'Characterization' || tDef.process === 'Design' ? (p.proc[0] === 'SOLO' ? 'Characterization' : tDef.process) : tDef.process,
      project: p.id, formulation: `${p.id}-${f.code}`, formLabel: f.label, form, mix: f.mix,
      apis: f.apis, excipients: f.excipients, components: comps,
      equipment: eqIds, creator, owner: chance(0.85) ? ownersOf(p) : (creator === 'g01' ? p.owner : creator),
      created: iso(created), modified: iso(modified),
      source: loc.src, path: loc.path, domain: SOURCES.find((s) => s.id === loc.src).domain,
      formats: tDef.formats, files, sizeMB: +(files * rfl(0.05, tech === 'MICROCT' ? 12 : 3, 2)).toFixed(1),
      params: params(tech, f, eqId), summary: summary(tech, f, ctx),
      tags: [...new Set(tags)].slice(0, 3),
      cls: p.cls, legal, agreement: p.agreement,
      legalNote: legal === 'Cleared with conditions' ? pick(['Internal use only – no publication before 2027-06-30', 'Sharing with consortium partners only', 'Publication requires partner sign-off (30 days notice)']) : legal === 'Not cleared' ? 'Partner-owned results – no internal reuse outside contract scope' : legal === 'Under legal review' ? `Review ticket LEG-${rint(2025000, 2026999)} opened` : legal === 'Cleared' ? 'Free for internal reuse and publication' : 'Internal raw-material data – no contractual restrictions',
      eln: `ELN-${y}-${pad(rint(1, 2400), 4)}`,
      samples: [`S-${y}-${pad(rint(1, 9999), 5)}`],
      version: chance(0.2) ? 'v2' : 'v1',
      license: legal.startsWith('Cleared') || legal === 'Not required' ? 'RCPE-Internal-Reuse-1.0' : 'Restricted (contract)',
      fair: { F: rint(80, 100), A: p.cls.startsWith('Confidential') ? rint(30, 60) : rint(60, 95), I: rint(55, 95), R: legal === 'Cleared' || legal === 'Not required' ? rint(70, 95) : rint(30, 70) },
      checksum: 'sha256:' + Array.from({ length: 16 }, () => '0123456789abcdef'[rint(0, 15)]).join('') + '…',
      sensitive: !!p.sensitive
    };
    ds.description = `${tDef.name} of ${f.mix === 'Solo API' || f.mix === 'Solo excipient' ? 'neat ' + f.comps[0].name : `formulation ${ds.formulation} (${f.mix}; ${f.comps.map((c) => `${c.name} ${c.pct} %`).join(', ')})`} within project ${p.name}. ${eqIds.length ? 'Acquired on ' + eqIds.map((e) => EQ_BY[e].name).join(' and ') + '.' : 'Digital design file.'}`;
    DATASETS.push(ds);
    return ds;
  }

  PROJECTS.forEach((p) => {
    const start = Date.parse(p.start), end = Math.min(Date.parse(p.end), NOW);
    for (let i = 0; i < p.nForm; i++) {
      const f = makeFormulation(p, i);
      let t = start + rng() * (end - start) * 0.8;
      const procKey = p.proc[i % p.proc.length];
      const ch = CHAINS[procKey];
      const steps = [...ch.core];
      Object.entries(ch.opt).forEach(([k, pr]) => { if (chance(pr)) steps.push(k); });
      if (f.mix.startsWith('Solo') && f.mix === 'Solo excipient' && chance(0.6)) steps.push('RHEO');
      if (f.brittle && steps.includes('FDM-PRINT') && !steps.includes('TXA')) steps.splice(steps.indexOf('FDM-PRINT'), 0, 'TXA');
      const fdsIds = [];
      steps.forEach((tech) => { t += rint(1, 9) * DAY; fdsIds.push(addDataset(p, f, tech, t).id); });
      if (ch.stab) {
        const cond = pick(['40 °C / 75 % RH', '25 °C / 60 % RH']);
        const tps = ['T0', '1M', '3M', '6M'];
        fdsIds.push(addDataset(p, f, 'STAB', t + DAY, { cond, tps }).id);
        tps.forEach((tp, k) => {
          const tt = t + [0, 30, 91, 182][k] * DAY;
          if (tt > NOW) return;
          ['XRPD', 'DSC'].forEach((tech) => {
            const fx = k >= 2 && f.amorphous && cond.startsWith('40') && chance(0.5) ? { ...f, amorphous: false } : f;
            fdsIds.push(addDataset(p, fx, tech, tt + rint(1, 4) * DAY, { suffix: `${tp}_${cond.startsWith('40') ? '40-75' : '25-60'}` }).id);
          });
        });
      }
      fdsIds.forEach((id) => { const d = DATASETS.find((x) => x.id === id); d.related = fdsIds.filter((x) => x !== id); });
    }
  });

  window.DATA = { PEOPLE, ROLES, APIS, EXCIPIENTS, MAT, SOURCES, EQUIPMENT: EQ, EQ_BY, TECH, PROJECTS, PRJ_BY, DATASETS, PEOPLE_BY: Object.fromEntries(PEOPLE.map((p) => [p.id, p])) };
})();
