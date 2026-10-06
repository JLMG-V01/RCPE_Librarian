# The FAIR Librarian – RCPE Research Data Index (Pilot)

Index search for research data management. This pilot shows the intended end result: a "Google" for the RCPE data landscape that finds research data across scattered project folders, instrument storage, analytics shares, SharePoint and the secure contract vault on different server domains.

The pilot focuses on **pharmaceutical materials science and 3D printing**: FDM, HME filaments, SSE, DPE, SLS, solo APIs, API + excipient and ternary systems, polypills and stability studies. It can be extended later to more data types.

> All people, projects, partners, agreements, server names and datasets in this pilot are **fictional demo data** (placeholder names such as "Dr. Lena Muster", hosts under `example.local`). The page is marked `noindex` so search engines skip it. The index holds **metadata only**, never the research data.

## Run it

It's a static site with no build step. Use either option:

- **GitHub Pages:** *Settings → Pages → Build and deployment → Deploy from a branch*, choose the branch and the `/ (root)` folder. The app is then available at `https://<org>.github.io/<repo>/`.
- **Locally:** `python3 -m http.server 8000` in the repo folder, then open http://localhost:8000. Opening `index.html` directly also works, except for loading the import sample.

## Features

| Area | What it shows |
|---|---|
| **Search** | A Google-style search box with **autocomplete** (ontology concepts, datasets, equipment, projects, materials, people), **ontology query expansion** (synonyms, abbreviations, German terms, trade names), facets, a **Filters** panel (created and last-changed dates, owner, creator, project, equipment, technique, API, polymer, legal status, classification, domain, tag), list and table views, sorting, and CSV/JSON export |
| **Query language** | `api:` `excipient:` `technique:` `process:` `equipment:` `project:` `owner:` `creator:` `person:` `mix:` `form:` `legal:` `class:` `domain:` `format:` `tag:` `after:` `before:` `modified-after:` `modified-before:`. A repeated field means OR; different fields mean AND |
| **Open Data** | Datasets from projects **without NDA/CDA** that are legally cleared can be released by their data owner for third parties (licence choice, checklist, release log, withdraw). Each release gets a public landing page with DOI (DataCite test prefix), citation, files and schema.org metadata |
| **EHDS (simulation)** | Simulated European Health Data Space connection (Regulation (EU) 2025/327). It covers the EU dataset catalogue (HealthDCAT-AP, fictional holders across 7 countries, linked to RCPE projects), a data access application / health data request wizard (Art. 67/69, permitted purposes, prohibited-use declaration, data minimisation, pseudonymisation justification, multi-country routing via HealthData@EU), the data permit (Art. 68), a secure processing environment with access log and output checking (Art. 73), user obligations, the opt-out note (Art. 71), RCPE as data holder (HealthDCAT-AP export) and registration of approved outputs in the index |
| **Equipment** | Each instrument page lists all related data, grouped by server source and folder |
| **Projects** | Team, equipment used, and a formulation table that links the full process chain |
| **Dataset page** | All metadata except the data itself (overview, composition, parameters, provenance, storage, legal, FAIR score, relationship graph), shown **only to roles with access** |
| **Legal clearance** | NDA/CDA/consortium status, agreement reference and conditions on every dataset. Confidential compositions are masked |
| **Access workflow** | Request → legal check (automatic for cleared data) → data-owner approval → access granted (time-limited). Rejections require a reason. Includes an approvals inbox, "My requests" with status filters (open / approved / rejected / expired) and a per-user **History** tab (admins can view any user) with CSV export and an audit-trail export |
| **Roles** | Scientist, Data Owner, Administrator and Guest, switchable in the top bar. Guests (external third parties) see confidential projects not at all, internal datasets only as catalogue entries **without compositions or formulations**, and open data in full |
| **Ask the Librarian** | Turns a plain-language question (EN/DE) into the exact search query, explains each term, relaxes the query when nothing matches all aspects, and suggests alternative words |
| **Ontology** | 150+ concepts, 650+ synonyms, broader/narrower/related relations. Export as JSON, CSV, SKOS/Turtle or search-engine synonyms; import new concepts (admin) |
| **Index & Admin** | Crawled sources, a simulated incremental crawl, the permission matrix, the metadata schema, dataset import (`data/sample-import.json` adds new data types) and index export |
| **Demo tour** | A 22-step guided tour that highlights each capability while dimming the rest of the page. Auto-play is optional, and demo data is reset afterwards |

## Structure

```
index.html
assets/css/app.css        design system – RCPE corporate palette, Montserrat, dark mode by default (light mode via toggle)
assets/js/ontology.js     domain ontology (reusable in the real project)
assets/js/data.js         entities and the seeded generator (~1,200 datasets)
assets/js/search.js       index, query parser, ontology expansion, facets, autocomplete, Ask
assets/js/app.js          router, pages, roles, access-request workflow, import/export
assets/js/tour.js         spotlight demo tour
data/sample-import.json   sample records for new data types (spray drying, compaction, injection moulding)
```

Demo state (current role, requests, imports) is kept in `localStorage` and can be reset under *Index → Reset demo data*.
