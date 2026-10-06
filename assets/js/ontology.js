/* ==========================================================================
   The FAIR Librarian – Domain Ontology (Pharmaceutical Materials Science)
   --------------------------------------------------------------------------
   Controlled vocabulary for indexing and query expansion. Each concept has a
   preferred label, alternative labels (synonyms, abbreviations, German terms,
   trade names, common misspellings), a definition, hierarchy (broader),
   associative links (related) and a canonical search query that resolves the
   concept against the index.

   Line format:  id | prefLabel | category | altLabels(;) | definition | broader | related(,) | query
   Export as JSON / CSV / SKOS-Turtle is available from the Ontology page.
   ========================================================================== */
(function () {
  const CATEGORIES = {
    PROC: { label: 'Process & Manufacturing', color: '#E6224F' },
    FORM: { label: 'Dosage Form & Formulation Type', color: '#B31C3F' },
    API: { label: 'Active Pharmaceutical Ingredient', color: '#A4A4A4' },
    EXC: { label: 'Excipient & Polymer', color: '#666CA1' },
    ROLE: { label: 'Functional Role', color: '#A4A4A4' },
    TECH: { label: 'Analytical Technique', color: '#717171' },
    PROP: { label: 'Material Property / CQA', color: '#E6224F' },
    PARAM: { label: 'Process Parameter', color: '#666CA1' },
    DATA: { label: 'Data Management & Compliance', color: '#A4A4A4' }
  };

  const RAW = `
proc.am|Additive manufacturing|PROC|3D printing;3D-Druck;three-dimensional printing;3DP;pharmaceutical 3D printing;printing|Layer-by-layer fabrication of dosage forms from a digital design.||form.printlet,proc.slicing|process:FDM process:SSE process:DPE process:SLS
proc.fdm|Fused deposition modeling|PROC|FDM;fused filament fabrication;FFF;filament printing;Schmelzschichtung;filament 3D printing|Extrusion-based printing that melts a drug-loaded thermoplastic filament through a heated nozzle.|proc.am|form.filament,proc.hme,param.nozzle,prop.printability|process:FDM
proc.sse|Semi-solid extrusion|PROC|SSE;paste printing;gel printing;syringe printing;pneumatic extrusion;Pastendruck|Room- or low-temperature extrusion of gels/pastes via syringe printheads, suited for point-of-care.|proc.am|form.gel,tech.rheo|process:SSE
proc.dpe|Direct powder extrusion|PROC|DPE;powder printing;single-screw printing;filament-free printing;direct powder 3D printing|Printing directly from powder blends with a single-screw printhead, bypassing filament production.|proc.am|form.pm,prop.flow,tech.psd|process:DPE
proc.sls|Selective laser sintering|PROC|SLS;laser sintering;laser sintered;sintered;powder bed fusion;Lasersintern|Powder-bed process in which a laser fuses polymer/drug particles layer by layer.|proc.am|exc.absorber,prop.porosity,form.odt|process:SLS
proc.hme|Hot-melt extrusion|PROC|HME;melt extrusion;Schmelzextrusion;twin-screw extrusion;TSE;extrusion|Continuous thermal processing of API/polymer blends in a twin-screw extruder to produce extrudates or filaments.||form.filament,form.asd,param.barrel,param.screw|process:HME
proc.filprod|Filament production|PROC|filament manufacturing;filament extrusion;filament spooling;Filamentherstellung;winding|HME step producing diameter-controlled filament (1.75 / 2.85 mm) for FDM printing.|proc.hme|form.filament,prop.diameter,tech.filqc|technique:HME technique:FIL-QC
proc.slicing|Print design & slicing|PROC|slicing;slicer;G-code;gcode;STL;CAD model;print file;digital design|Generation of the 3D model (STL) and machine instructions (G-code) defining geometry and infill.|proc.am|param.infill,param.layer|technique:DESIGN
proc.blend|Physical mixing|PROC|blending;mixing;physical mixture preparation;Mischen|Preparation of powder blends prior to extrusion or printing.||form.pm|form:"physical mixture"
proc.stab|Stability study|PROC|storage stability;ICH stability;stress test;accelerated stability;40/75;25/60;Stabilitätsstudie;aging|Storage of samples under ICH climate conditions with time-point analytics.||prop.physstab,tech.climate|technique:STAB
proc.pat|Process analytical technology|PROC|PAT;in-line monitoring;inline monitoring;real-time monitoring;online analytics;Prozessanalytik|In-line/on-line measurement of CQAs during HME or printing.||tech.inraman,tech.nir|process:PAT
form.printlet|Printlet|FORM|printed tablet;3D printed tablet;printed dosage form;3DP tablet;Drucktablette|Tablet-like dosage form manufactured by 3D printing.||proc.am,form.minitab|form:printlet
form.minitab|Minitablet|FORM|mini-tablet;mini tablet;Minitablette|Small (≤ 4 mm) dosage unit, typically for pediatric dosing.|form.printlet|form.pedi|form:printlet "minitablet"
form.pedi|Pediatric dosage form|FORM|pediatric;paediatric;children;kids;child-appropriate;Kinderarzneiform;age-appropriate|Formulation designed for flexible, age-appropriate dosing in children.||form.minitab,api.lev,api.hc,api.enal|project:PRINTPED
form.filament|Filament|FORM|drug-loaded filament;feedstock filament;strand|Thermoplastic strand (typically 1.75 mm) used as FDM feedstock.||proc.fdm,proc.filprod,prop.brittle|form:filament
form.extrudate|Extrudate|FORM|HME extrudate;strand;pellets;milled extrudate|Product leaving the extruder die, prior to shaping or milling.|form.filament|proc.hme|form:extrudate
form.pm|Physical mixture|FORM|PM;powder blend;blend;Pulvermischung|Non-processed powder mixture of API and excipients; reference for processed samples.||proc.blend|form:"physical mixture"
form.gel|Semi-solid formulation|FORM|gel;paste;hydrogel;gummy;Gel;Paste|Semi-solid mass used as SSE feedstock.||proc.sse|form:gel
form.polypill|Polypill|FORM|multi-drug;multi-API;fixed-dose combination;FDC;multi-compartment;Kombinationspräparat|Single dosage form containing two or more APIs, often in separate compartments.||proc.fdm|mix:"Multi-API"
form.odt|Orodispersible dosage form|FORM|ODT;orally disintegrating;fast disintegrating;Schmelztablette|Dosage form disintegrating rapidly in the mouth.||proc.sls,tech.disint|process:SLS
form.asd|Amorphous solid dispersion|FORM|ASD;solid dispersion;amorphous dispersion;molecular dispersion;feste Dispersion;glass solution|API molecularly dispersed in a polymer matrix to enhance solubility of poorly soluble drugs.||prop.amorph,proc.hme,prop.miscib|tag:amorphous
form.solo|Solo API|FORM|pure API;neat API;API alone;reference API;raw material;Reinsubstanz|Characterization of an API without excipients (reference / material library).||form.soloexc|mix:"Solo API"
form.soloexc|Solo excipient|FORM|pure excipient;neat polymer;polymer alone;raw polymer;carrier only|Characterization of an excipient or polymer without API.||form.solo|mix:"Solo excipient"
form.binary|API + excipient (binary)|FORM|binary mixture;binary system;drug-polymer;API-polymer;two-component|Formulation of one API with one carrier polymer.||form.ternary|mix:"API + excipient"
form.ternary|API + polymer + additive (ternary)|FORM|ternary;three-component;with plasticizer;API polymer plasticizer|Formulation of API, carrier polymer and a functional additive (plasticizer, filler).||role.plast|mix:"API + polymer + additive"
form.placebo|Placebo|FORM|drug-free;blank;no API;Placebo|Formulation without API, used to study printability and matrix behaviour.||form.soloexc|mix:"Placebo"
api.pcm|Paracetamol|API|acetaminophen;APAP;PCM;paracetamolum;N-acetyl-p-aminophenol|Analgesic BCS I model API; widely used model drug for printing studies.||form.binary|api:Paracetamol
api.ibu|Ibuprofen|API|IBU;ibuprofenum;isobutylphenylpropionic acid|NSAID, low Tg API with plasticizing effect on polymers (BCS II).||role.plast|api:Ibuprofen
api.theo|Theophylline|API|THEO;theophyllin;anhydrous theophylline|Bronchodilator; thermally stable high-melting model API for FDM.||api.caf|api:Theophylline
api.caf|Caffeine|API|CAF;coffein;Koffein;anhydrous caffeine|Methylxanthine model API, crystalline, high melting point.||api.theo|api:Caffeine
api.itz|Itraconazole|API|ITZ;ITRA;itraconazol|Antifungal, BCS II, very poorly water-soluble; benchmark API for ASDs.||form.asd|api:Itraconazole
api.fel|Felodipine|API|FEL;felodipin|Calcium channel blocker, BCS II; glass-forming API for ASD studies.||form.asd|api:Felodipine
api.car|Carvedilol|API|CAR;CARV;carvedilolum|Beta-blocker, BCS II, pH-dependent solubility.||form.asd|api:Carvedilol
api.hctz|Hydrochlorothiazide|API|HCTZ;HCT;hydrochlorothiazid|Diuretic, BCS IV; common partner in fixed-dose combinations.||form.polypill|api:Hydrochlorothiazide
api.met|Metformin hydrochloride|API|metformin;MET;metformin HCl;Metformin-HCl|Antidiabetic, BCS III, high-dose API.||form.polypill|api:"Metformin hydrochloride"
api.pzq|Praziquantel|API|PZQ;praziquantelum|Anthelmintic; pediatric need, bitter taste, BCS II.||form.pedi|api:Praziquantel
api.ffb|Fenofibrate|API|FFB;FEN;fenofibrat|Lipid-lowering, BCS II, low melting point.||form.asd|api:Fenofibrate
api.ind|Indomethacin|API|IND;INDO;indometacin|NSAID; polymorphic (γ/α) glass former; ASD reference compound.||prop.polymorph|api:Indomethacin
api.nap|Naproxen|API|NAP;NPX;naproxenum|NSAID, BCS II; crystallization-prone.||form.asd|api:Naproxen
api.nif|Nifedipine|API|NIF;nifedipin|Calcium channel blocker; light sensitive, poorly soluble.||form.asd|api:Nifedipine
api.efv|Efavirenz|API|EFV;efavirenzum|Antiretroviral, BCS II, low Tg.||form.asd|api:Efavirenz
api.lev|Levetiracetam|API|LEV;levetiracetamum|Antiepileptic with high pediatric relevance; freely soluble.||form.pedi|api:Levetiracetam
api.hc|Hydrocortisone|API|HC;cortisol;hydrocortisonum|Corticosteroid; low-dose pediatric replacement therapy.||form.pedi|api:Hydrocortisone
api.enal|Enalapril maleate|API|enalapril;ENA;enalaprilmaleat|ACE inhibitor; pediatric dose flexibility needed.||form.pedi|api:"Enalapril maleate"
exc.hpmcas|HPMCAS|EXC|hypromellose acetate succinate;HPMC-AS;HPMCAS-LF;HPMCAS-MF;HPMCAS-HF;AQOAT;AquaSolve|Enteric cellulose ester; leading carrier for ASDs (grades L/M/H by dissolution pH).|role.carrier|form.asd|excipient:HPMCAS
exc.hpmc|HPMC|EXC|hypromellose;hydroxypropyl methylcellulose;Affinisol;HPMC HME grade|Cellulose ether; extrudable low-viscosity grades used for controlled release.|role.carrier||excipient:HPMC
exc.hpc|HPC|EXC|hydroxypropyl cellulose;Klucel;HPC-EF;HPC-SSL;Hydroxypropylcellulose|Thermoplastic cellulose ether with good FDM printability.|role.carrier||excipient:HPC
exc.pvpva|PVP-VA 64|EXC|copovidone;Kollidon VA64;PVPVA;vinylpyrrolidone-vinyl acetate;Copovidon|Amorphous copolymer with excellent miscibility for ASDs; brittle as filament.|role.carrier|prop.brittle|excipient:"PVP-VA 64"
exc.pvp|PVP K30|EXC|povidone;polyvinylpyrrolidone;Kollidon 30;Povidon|Hydrophilic amorphous polymer; high Tg.|role.carrier||excipient:"PVP K30"
exc.pva|PVA|EXC|polyvinyl alcohol;PVOH;Parteck MXP;PVA 4-88;Polyvinylalkohol|Semi-crystalline polymer; robust, flexible filaments and immediate release.|role.carrier|prop.printability|excipient:PVA
exc.peo|PEO|EXC|polyethylene oxide;Polyox;PEO 100k;PEO 600k;polyethylene glycol high MW|Semi-crystalline polymer; low processing temperature, flexible filaments.|role.carrier|exc.peg|excipient:PEO
exc.soluplus|PVCL-PVAc-PEG graft copolymer|EXC|Soluplus;polyvinyl caprolactam-polyvinyl acetate-polyethylene glycol|Amphiphilic graft copolymer designed for HME solid solutions.|role.carrier|form.asd|excipient:"PVCL-PVAc-PEG"
exc.epo|Amino methacrylate copolymer|EXC|basic butylated methacrylate copolymer;Eudragit EPO;EPO;Eudragit E PO|Cationic methacrylate; taste masking, gastric-soluble.|role.carrier|api.pzq|excipient:"Amino methacrylate copolymer"
exc.l100|Methacrylic acid copolymer|EXC|methacrylic acid copolymer type A;Eudragit L100;enteric methacrylate;L100|Anionic enteric polymer (dissolves above pH 6).|role.carrier||excipient:"Methacrylic acid copolymer"
exc.rlpo|Ammonio methacrylate copolymer|EXC|Eudragit RL PO;RL PO;RS PO;sustained release methacrylate|Insoluble, permeable polymer for sustained release.|role.carrier||excipient:"Ammonio methacrylate copolymer"
exc.ec|Ethylcellulose|EXC|EC;ethyl cellulose;Ethocel|Water-insoluble cellulose ether for sustained release.|role.carrier||excipient:Ethylcellulose
exc.pla|PLA|EXC|polylactic acid;polylactide;PLLA|Biodegradable polyester, reference for printer calibration and implants.|role.carrier||excipient:PLA
exc.pcl|PCL|EXC|polycaprolactone;Polycaprolacton|Low-melting biodegradable polyester; implants and long-acting systems.|role.carrier||excipient:PCL
exc.eva|EVA|EXC|ethylene vinyl acetate;EVA copolymer|Flexible thermoplastic for implants and inserts.|role.carrier||excipient:EVA
exc.peg|PEG 4000|EXC|macrogol;polyethylene glycol;PEG;PEG 6000;Macrogol 4000|Low-MW PEG used as plasticizer and pore former.|role.plast|exc.peo|excipient:"PEG 4000"
exc.tec|Triethyl citrate|EXC|TEC;citroflex;triethylcitrat|Liquid plasticizer lowering processing temperatures.|role.plast||excipient:"Triethyl citrate"
exc.sorb|Sorbitol|EXC|D-sorbitol;sorbitol;Sorbit|Polyol plasticizer and sweetener.|role.plast||excipient:Sorbitol
exc.mannitol|Mannitol|EXC|D-mannitol;Pearlitol;Mannit|Crystalline polyol filler; used for SLS and ODT formulations.|role.filler||excipient:Mannitol
exc.mcc|MCC|EXC|microcrystalline cellulose;Avicel;mikrokristalline Cellulose|Filler and binder; improves powder flow and disintegration.|role.filler||excipient:MCC
exc.lactose|Lactose monohydrate|EXC|lactose;Laktose;milk sugar|Common filler for powder blends.|role.filler||excipient:"Lactose monohydrate"
exc.talc|Talc|EXC|talcum;Talkum;magnesium silicate|Inorganic filler/anti-tacking agent, improves filament stiffness.|role.filler|prop.brittle|excipient:Talc
exc.silica|Colloidal silica|EXC|colloidal silicon dioxide;Aerosil;fumed silica;SiO2|Glidant improving powder flowability in DPE and SLS.|role.glidant|prop.flow|excipient:"Colloidal silica"
exc.mgst|Magnesium stearate|EXC|MgSt;Mg stearate;Magnesiumstearat|Lubricant reducing friction in extrusion and nozzle.|role.lub||excipient:"Magnesium stearate"
exc.ccs|Croscarmellose sodium|EXC|CCS;Ac-Di-Sol;crosslinked carboxymethylcellulose|Superdisintegrant for fast-release printlets.|role.disint|tech.disint|excipient:"Croscarmellose sodium"
exc.gelatin|Gelatin|EXC|Gelatine;gelatin type A;gelatin type B|Gelling agent for SSE formulations (chewables, gummies).|role.carrier|form.gel|excipient:Gelatin
exc.absorber|Laser absorber|EXC|pearlescent pigment;Candurin;Candurin gold sheen;colorant absorber;pigment absorber|Pigment enabling energy absorption of diode lasers in SLS.|role.filler|proc.sls|excipient:"Pearlescent pigment"
role.carrier|Polymer carrier|ROLE|matrix polymer;carrier;Trägerpolymer;binder polymer|Main matrix-forming polymer of a dispersion or filament.||form.asd|
role.plast|Plasticizer|ROLE|plasticiser;Weichmacher;plasticizing agent|Additive lowering Tg and melt viscosity, enabling lower processing temperatures and flexible filaments.||prop.tg,prop.brittle|excipient:"Triethyl citrate" excipient:"PEG 4000" excipient:Sorbitol
role.filler|Filler|ROLE|diluent;Füllstoff;bulking agent|Excipient adding bulk or stiffness.|||excipient:MCC excipient:Mannitol excipient:Talc
role.glidant|Glidant|ROLE|flow aid;Fließregulierungsmittel|Excipient improving powder flow.||prop.flow|excipient:"Colloidal silica"
role.lub|Lubricant|ROLE|Schmiermittel|Excipient reducing friction.|||excipient:"Magnesium stearate"
role.disint|Disintegrant|ROLE|superdisintegrant;Sprengmittel|Excipient accelerating tablet break-up.||tech.disint|excipient:"Croscarmellose sodium"
tech.dsc|Differential scanning calorimetry|TECH|DSC;calorimetry;thermogram;heat flow;Kalorimetrie;Dynamische Differenzkalorimetrie|Measures heat flow vs. temperature: Tg, melting, crystallization, miscibility.|tech.thermal|prop.tg,prop.melt,prop.cryst|technique:DSC
tech.mdsc|Modulated DSC|TECH|mDSC;MTDSC;temperature-modulated DSC;reversing heat flow|DSC with sinusoidal modulation separating reversing (Tg) and non-reversing events.|tech.dsc|prop.tg|technique:DSC "modulated"
tech.tga|Thermogravimetric analysis|TECH|TGA;thermogravimetry;mass loss;Thermogravimetrie|Mass loss vs. temperature: degradation onset, residual solvents/moisture.|tech.thermal|prop.degrad,prop.water|technique:TGA
tech.thermal|Thermal analysis|TECH|thermoanalysis;Thermoanalytik|Family of methods measuring property changes vs. temperature.||tech.dsc,tech.tga,tech.hsm|technique:DSC technique:TGA technique:HSM
tech.xrpd|X-ray powder diffraction|TECH|XRPD;XRD;PXRD;powder diffraction;diffractogram;Röntgenpulverdiffraktometrie|Identifies crystalline phases; detects residual crystallinity in ASDs.||prop.cryst,prop.amorph,prop.polymorph|technique:XRPD
tech.raman|Raman spectroscopy|TECH|Raman;Raman spectrum;Raman-Spektroskopie|Vibrational spectroscopy for solid-state form and API distribution.|tech.spectro|tech.ramanmap,tech.inraman|technique:RAMAN technique:RAMAN-MAP
tech.ramanmap|Raman mapping|TECH|Raman imaging;chemical imaging;Raman map;API distribution map|Spatially resolved Raman imaging of API distribution and crystallinity in printlets.|tech.raman|prop.homog|technique:RAMAN-MAP
tech.inraman|In-line Raman|TECH|inline Raman;Raman probe;PAT Raman;real-time Raman|Raman probe at extruder die or print head for real-time API content.|tech.raman|proc.pat|technique:INLINE-RAMAN
tech.nir|NIR spectroscopy|TECH|NIR;near-infrared;near infrared;NIRS;Nahinfrarot|Fast non-destructive spectroscopy for content and moisture; PAT tool.|tech.spectro|proc.pat|technique:NIR
tech.ftir|FTIR spectroscopy|TECH|FTIR;FT-IR;ATR;infrared;IR spectrum;Infrarot|Identifies functional groups and API–polymer hydrogen bonding.|tech.spectro|prop.interact|technique:FTIR
tech.spectro|Vibrational spectroscopy|TECH|spectroscopy;spectra;Spektroskopie||||technique:RAMAN technique:NIR technique:FTIR
tech.hplc|HPLC|TECH|high-performance liquid chromatography;LC;UPLC;assay;chromatography;HPLC-UV|Quantifies API content and related substances / degradation products.||prop.assay,prop.impur|technique:HPLC
tech.disso|Dissolution testing|TECH|dissolution;drug release;release testing;USP II;paddle;Freisetzung;Wirkstofffreisetzung;release profile|Measures API release vs. time under compendial conditions.||prop.release|technique:DISSO
tech.disint|Disintegration testing|TECH|disintegration;Zerfall;Zerfallszeit;disintegration time|Time for a dosage form to break up in medium.||form.odt|technique:DISSO "disintegration"
tech.txa|Texture analysis|TECH|texture analyzer;3-point bend;three-point bending;mechanical testing;breaking stress;Repka-Zhang test;stiffness test;|Mechanical characterization of filaments (flexibility, stiffness) and printlets (hardness).||prop.brittle,prop.stiff,prop.printability|technique:TXA
tech.rheo|Rheology|TECH|rheometer;oscillatory rheology;melt rheology;viscosity measurement;Rheologie;complex viscosity|Determines melt/paste viscosity and viscoelasticity relevant for extrusion and printing.||prop.visc|technique:RHEO
tech.microct|Micro-computed tomography|TECH|micro-CT;µCT;microCT;X-ray tomography;CT scan;Computertomographie|3D imaging of internal structure, porosity and infill accuracy.||prop.porosity,param.infill|technique:MICROCT
tech.sem|Scanning electron microscopy|TECH|SEM;REM;electron microscopy;Rasterelektronenmikroskop|High-resolution surface and cross-section morphology imaging.||prop.surface|technique:SEM
tech.dvs|Dynamic vapor sorption|TECH|DVS;sorption isotherm;moisture sorption;water sorption|Moisture uptake vs. relative humidity; hygroscopicity.||prop.hygro|technique:DVS
tech.psd|Laser diffraction|TECH|PSD;particle size distribution;laser diffraction;d50;Partikelgrößenverteilung|Determines particle size distribution of powders.||prop.psd|technique:PSD
tech.hsm|Hot-stage microscopy|TECH|HSM;hot stage;Heiztischmikroskopie;thermomicroscopy|Visual observation of melting, dissolution of API in polymer melt.|tech.thermal|prop.miscib,prop.melt|technique:HSM
tech.kf|Karl Fischer titration|TECH|KF;Karl-Fischer;water determination;coulometric titration|Determines water content.||prop.water|technique:KF
tech.pyc|Helium pycnometry|TECH|pycnometer;true density;He pycnometry;Pyknometrie|Determines true density for porosity calculation.||prop.density|technique:PYC
tech.filqc|Filament quality control|TECH|diameter gauge;laser micrometer;ovality;filament diameter measurement;inline diameter|In-line laser measurement of filament diameter and ovality.||prop.diameter|technique:FIL-QC
tech.climate|Climate chamber storage|TECH|climate chamber;stability chamber;Klimaschrank;storage log|Controlled storage at ICH conditions with logger data.||proc.stab|technique:STAB
prop.tg|Glass transition temperature|PROP|Tg;glass transition;Glasübergang;Glasübergangstemperatur;glass temperature|Temperature at which an amorphous material transitions from glassy to rubbery state.||tech.dsc,tech.mdsc,form.asd|technique:DSC
prop.melt|Melting point|PROP|melting;Tm;melting temperature;Schmelzpunkt;fusion;melting endotherm|Temperature of crystalline-to-liquid transition.||tech.dsc,tech.hsm|technique:DSC technique:HSM
prop.cryst|Crystallinity|PROP|crystalline;residual crystallinity;crystal content;Kristallinität;crystal|Degree of long-range order; residual crystals reduce ASD performance.||tech.xrpd,tech.dsc|technique:XRPD
prop.amorph|Amorphous state|PROP|amorphous;amorphization;X-ray amorphous;amorph;non-crystalline|Absence of long-range order; target state for solubility enhancement.||form.asd,tech.xrpd|technique:XRPD tag:amorphous
prop.recryst|Recrystallization|PROP|crystallization;recrystallisation;devitrification;Rekristallisation|Conversion of amorphous API back to crystalline state during processing or storage.||prop.physstab,tech.xrpd|technique:XRPD technique:STAB
prop.polymorph|Polymorphism|PROP|polymorph;polymorphic form;crystal form;Polymorphie;form I;form II|Existence of multiple crystal forms of the same compound.||tech.xrpd,tech.raman|technique:XRPD technique:RAMAN
prop.degrad|Thermal degradation|PROP|degradation;decomposition;thermal stability;Zersetzung;Abbau;degradation onset|Chemical breakdown at elevated temperature, limiting extrusion/printing temperature.||tech.tga,tech.hplc|technique:TGA technique:HPLC
prop.impur|Related substances|PROP|impurities;degradation products;Verunreinigungen;purity;degradants|Impurity profile determined chromatographically.||tech.hplc|technique:HPLC
prop.assay|Drug content|PROP|assay;API content;content uniformity;drug loading;Gehalt;potency;dose accuracy|Measured API amount relative to label claim.||tech.hplc,tech.nir|technique:HPLC
prop.hygro|Hygroscopicity|PROP|moisture uptake;water uptake;Hygroskopie;sorption|Tendency to absorb moisture from the environment.||tech.dvs|technique:DVS
prop.water|Water content|PROP|moisture content;residual moisture;loss on drying;Wassergehalt;LOD|Amount of water present in a sample.||tech.kf,tech.tga|technique:KF technique:TGA
prop.psd|Particle size|PROP|particle size;d50;d90;granulometry;Partikelgröße;fineness|Size distribution of powder particles.||tech.psd,prop.flow|technique:PSD
prop.flow|Powder flowability|PROP|flowability;flow;Fließfähigkeit;Hausner ratio;Carr index;feedability|Ability of a powder to flow uniformly; critical for DPE and SLS feeding.||tech.psd,role.glidant|technique:PSD process:DPE
prop.visc|Melt viscosity|PROP|viscosity;complex viscosity;Viskosität;flow behaviour;shear thinning;storage modulus|Resistance to flow of a melt or paste; governs extrudability.||tech.rheo|technique:RHEO
prop.diameter|Filament diameter|PROP|diameter;ovality;diameter tolerance;filament tolerance;Durchmesser|Mean diameter and ovality of filament; target 1.75 ± 0.05 mm.||tech.filqc|technique:FIL-QC
prop.brittle|Filament brittleness|PROP|brittle;brittleness;breaks;spröde;flexibility;flexible;filament breakage;snapping|Tendency of a filament to fracture under bending during feeding.||tech.txa,role.plast|technique:TXA tag:"brittle filament"
prop.stiff|Stiffness|PROP|Young's modulus;elastic modulus;rigidity;Steifigkeit;E-modulus|Resistance to elastic deformation, required to be pushed by feeding gears.||tech.txa|technique:TXA
prop.printability|Printability|PROP|printable;feedability;printing success;Druckbarkeit;print quality;nozzle clogging|Ability of a material to be reliably fed and printed with the target geometry.||tech.txa,proc.fdm|tag:printable
prop.release|Drug release|PROP|release rate;dissolution rate;dissolution profile;immediate release;sustained release;Freisetzungsprofil;IR;SR;MDT|Rate and extent of API dissolution from the dosage form.||tech.disso|technique:DISSO
prop.porosity|Porosity|PROP|pores;void fraction;Porosität;internal structure|Fraction of void volume inside a printlet.||tech.microct,tech.pyc|technique:MICROCT technique:PYC
prop.density|Density|PROP|true density;bulk density;Dichte|Mass per volume of material.||tech.pyc|technique:PYC
prop.surface|Surface morphology|PROP|surface;morphology;surface roughness;Oberfläche;layer lines|Topography of the printlet or particle surface.||tech.sem|technique:SEM
prop.homog|API distribution|PROP|homogeneity;content uniformity map;distribution;Homogenität;mixing quality|Spatial uniformity of API in the matrix.||tech.ramanmap|technique:RAMAN-MAP
prop.miscib|Drug–polymer miscibility|PROP|miscibility;solubility in polymer;Mischbarkeit;solubility parameter;Flory-Huggins|Extent to which an API dissolves in a polymer; predicts ASD stability.||tech.dsc,tech.hsm,form.asd|technique:DSC technique:HSM
prop.interact|API–polymer interaction|PROP|hydrogen bonding;H-bond;molecular interaction;Wechselwirkung|Specific molecular interactions stabilizing amorphous API.||tech.ftir,tech.raman|technique:FTIR
prop.physstab|Physical stability|PROP|shelf life;storage stability;physical aging;Lagerstabilität|Retention of solid-state form and performance during storage.||proc.stab,prop.recryst|technique:STAB tag:"stability study"
param.nozzle|Nozzle temperature|PARAM|printing temperature;print temperature;Düsentemperatur;hotend temperature|Temperature of the FDM hot end.||proc.fdm|technique:FDM-PRINT
param.bed|Build plate temperature|PARAM|bed temperature;platform temperature;Druckbetttemperatur|Temperature of the printing bed.||proc.fdm|technique:FDM-PRINT
param.speed|Print speed|PARAM|printing speed;feed rate;Druckgeschwindigkeit|Linear speed of the print head.||proc.fdm|technique:FDM-PRINT
param.layer|Layer height|PARAM|layer thickness;resolution;Schichthöhe|Vertical thickness of each printed layer.||proc.slicing|technique:FDM-PRINT technique:DESIGN
param.infill|Infill density|PARAM|infill;infill pattern;fill density;Füllgrad;shell|Fraction of internal volume filled; controls release rate.||proc.slicing,prop.release|technique:DESIGN technique:FDM-PRINT
param.barrel|Barrel temperature|PARAM|extrusion temperature;zone temperature;temperature profile;Zylindertemperatur|Temperature profile along the extruder barrel.||proc.hme|technique:HME
param.screw|Screw configuration|PARAM|screw speed;screw design;kneading elements;Schneckenkonfiguration;rpm|Arrangement and speed of extruder screw elements.||proc.hme|technique:HME
param.laser|Laser scanning parameters|PARAM|laser power;scan speed;hatch spacing;Laserleistung|Energy input settings in SLS.||proc.sls|technique:SLS-PRINT
data.nda|Non-disclosure agreement|DATA|NDA;confidentiality agreement;Geheimhaltungsvereinbarung;Vertraulichkeitsvereinbarung;secrecy agreement|Contract restricting disclosure of partner information and derived data.||data.legal,data.cda|class:"Confidential – NDA"
data.cda|Confidential disclosure agreement|DATA|CDA;confidential disclosure;Vertraulichkeitserklärung|Agreement governing exchange of confidential materials or data, typically before collaboration.||data.legal,data.nda|class:"Confidential – CDA"
data.ca|Consortium agreement|DATA|CA;grant agreement;consortium;Konsortialvertrag|Agreement governing data rights within funded consortia (e.g., public research programmes).||data.legal|legal:"Cleared with conditions"
data.legal|Legal clearance|DATA|legal review;cleared;freigegeben;legal approval;IP clearance;publishable;can I use;Rechtsfreigabe;clearance|Confirmation by Legal & Contracts that data may be used/shared under stated conditions.||data.nda,data.cda,data.embargo|legal:Cleared
data.embargo|Embargo|DATA|publication embargo;Sperrfrist;blocked until|Time-limited restriction on publication or sharing.||data.legal|legal:"Cleared with conditions"
data.class|Data classification|DATA|classification;confidentiality level;Vertraulichkeitsstufe;sensitivity|Confidentiality level controlling who may see metadata and access data.||data.nda|
data.owner|Data owner|DATA|owner;data steward;responsible;Dateneigentümer;verantwortlich|Person accountable for a dataset and for approving access requests.||data.access|
data.access|Access request|DATA|request access;permission;Zugriffsanfrage;access rights|Workflow to obtain permission to access restricted data.||data.owner,data.legal|
data.fair|FAIR principles|DATA|FAIR;findable;accessible;interoperable;reusable;FAIR data|Guiding principles for scientific data management and stewardship.||data.pid,data.meta|
data.pid|Persistent identifier|DATA|PID;DOI;handle;identifier;persistent ID|Globally unique, resolvable identifier for a dataset.|data.fair||
data.meta|Metadata|DATA|metadata;Metadaten;data description;schema|Structured description of a dataset.|data.fair||
data.raw|Raw data|DATA|raw;instrument data;Rohdaten;primary data;native format|Unprocessed data as exported by an instrument.||data.processed|format:raw
data.processed|Processed data|DATA|evaluated;analysed;results;processed;Auswertung;report|Data derived from raw data by evaluation.||data.raw|format:xlsx format:pdf
data.ehds|European Health Data Space|DATA|EHDS;Europäischer Gesundheitsdatenraum;Regulation 2025/327;HealthData@EU;secondary use;Sekundärnutzung|EU framework (Regulation (EU) 2025/327) for primary and secondary use of electronic health data; secondary use via health data access bodies and HealthData@EU.||data.hdab,data.permit,data.spe,data.healthdcat|
data.hdab|Health data access body|DATA|HDAB;Gesundheitsdaten-Zugangsstelle;data access body;national contact point;NCP|National body that assesses data access applications and health data requests, issues data permits and provides secure processing environments.|data.ehds|data.permit|
data.permit|Data permit|DATA|EHDS permit;Datengenehmigung;data access application;health data request|Administrative decision of an HDAB allowing a named user to process specified health data for a stated purpose inside an SPE.|data.ehds|data.hdab,data.spe|
data.spe|Secure processing environment|DATA|SPE;trusted research environment;TRE;sichere Verarbeitungsumgebung;output checking|Controlled environment in which permitted data are processed; only anonymised results may leave it.|data.ehds|data.permit|
data.healthdcat|HealthDCAT-AP|DATA|health dataset catalogue;EU dataset catalogue;DCAT-AP;dataset description|Metadata profile used to describe health datasets in national catalogues and the EU dataset catalogue.|data.ehds|data.meta|
data.realworld|Real-world data|DATA|RWD;real world evidence;RWE;claims data;registry data;EHR data|Health data collected outside controlled trials, e.g. from health records, registries, claims or devices.|data.ehds|form.pedi,form.polypill|
data.eln|Electronic lab notebook|DATA|ELN;lab notebook;Laborjournal;notebook entry|System documenting experiments; datasets reference ELN entries.|||
data.lims|LIMS|DATA|laboratory information management system;sample management;sample ID|System tracking samples and analytical requests.|||
`;

  // Curated example questions (shown in "Ask the Librarian")
  const QUESTIONS = [
    'Which filaments with HPMCAS were too brittle to print?',
    'Where can I find DSC data of itraconazole amorphous solid dispersions?',
    'Do we have dissolution profiles of paracetamol printlets?',
    'Show me Raman maps of polypills with metformin',
    'What was printed on the Fabrikam printer in 2025?',
    'Which pure APIs have XRPD reference patterns?',
    'Is there legally cleared data on pediatric minitablets I can publish?',
    'Melt viscosity of PEO formulations for semi-solid or FDM printing',
    'Stability of amorphous felodipine at 40/75',
    'Who owns the micro-CT porosity data of laser sintered tablets?',
    'Kristallinität von Theophyllin Filamenten',
    'Which placebo filaments did we test for printability?'
  ];

  const concepts = RAW.trim().split('\n').map((line) => {
    const [id, label, cat, alt, def, broader, related, query] = line.split('|');
    return {
      id, label, cat,
      alt: alt ? alt.split(';').map((s) => s.trim()).filter(Boolean) : [],
      def: def || '',
      broader: broader || '',
      related: related ? related.split(',').map((s) => s.trim()).filter(Boolean) : [],
      query: (query || '').trim()
    };
  });
  const byId = Object.fromEntries(concepts.map((c) => [c.id, c]));
  // derive narrower relations
  concepts.forEach((c) => { c.narrower = concepts.filter((x) => x.broader === c.id).map((x) => x.id); });

  window.ONTOLOGY = { version: '0.9.0-pilot', namespace: 'https://example.org/fair-librarian/ontology#', CATEGORIES, concepts, byId, QUESTIONS };
})();
