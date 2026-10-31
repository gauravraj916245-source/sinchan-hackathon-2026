# Digital Dark Spot: Search Filtering, Database Persistence, and Brand Cleanup

Implementation plan to equip Digital Dark Spot with a real-time multi-field search engine on the dashboard, embedded persistent database storage for all research projects and findings, and clean professional branding by removing Hackathon 2026 badges and judge presentation controls.

***

## User Review & Critical Decisions

> [!IMPORTANT]
> The following architectural and UX choices have been aligned:
> - **Database Persistence**: Embedded server database with persistent JSON/SQLite backing (`data/database.sqlite` / `data/projects.json`) so all created research projects, uploaded sources, extracted claims, dark spots, and checklist states persist across server restarts.
> - **Search Filter Fields**: The dashboard search bar will dynamically filter across **Title**, **Research Question**, and **Extracted Categories & Topics** in real time, with instant empty states, clear button, and result counts.
> - **Branding & Clean UI**:
>   - Removed the `"Hackathon 2026"` pill badge from the Navbar and Landing Page.
>   - Removed the `"Judge & CSE Guide"` navigation button, modal, presentation pitch scripts, and contest-specific demo badges to present Digital Dark Spot as a clean, production-ready enterprise research platform.

***

## 1. Overview & Core Concept

- **What It Delivers**:
  1. **Instant Search & Query Filtering on Dashboard**: A prominent, accessible search bar equipped with live keyword debouncing, topic filter chips, clear button, and active result counts. Searches across project titles, research questions, and extracted topics/categories.
  2. **Embedded Database Persistence**: Replaces transient in-memory map storage with a persistent embedded database engine in `server/services/storageService.ts`, ensuring projects, sources, analysis reports, and checklist toggles are written directly to disk (`data/projects.json`).
  3. **Clean Enterprise Branding**: Strips all hackathon-specific references ("Hackathon 2026", "Judge & CSE Guide", "Demonstration Data" competition banners) to elevate Digital Dark Spot into a polished, production-grade intelligence tool.
- **Target Persona**: Researchers, students, analysts, and policy applicants evaluating complex, conflicting documentation.
- **Key Value**: Instantly locate previous investigations by topic or keyword, with complete assurance that research data is permanently saved on disk.

***

## 2. User Experience & Visual Design

### Key User Flows
1. **Search & Filter Flow**:
   - The user opens the Dashboard (`/dashboard`).
   - At the top of the projects list, a search bar with a magnifying glass icon and placeholder `"Search projects by topic, question, or category (e.g. scholarship, cutoff, renewal)..."` is displayed.
   - Typing instantly filters the project list with zero latency; matching fields are identified.
   - A clear (`✕`) button resets the search. An informative empty state appears if no projects match: *"No research projects found matching '<query>'"* with a 1-click *"Clear Search"* action.
2. **Database Persistence Flow**:
   - When a user adds new sources or runs an analysis, the backend writes the updated project to the database store on disk.
   - Checking or unchecking tasks in the Priority Checklist immediately saves state to the database.
   - Reloading the page or restarting the server preserves all projects and their latest completion status.
3. **Clean Professional Navigation**:
   - The top navigation bar displays the brand wordmark `"Digital Dark Spot"` and subtitle `"AI Information Gap Detection Platform"`, direct navigation tabs (`Dashboard`, `New Research`, `Analysis Report`, `Checklist`), and no promotional hackathon pill or judge button.

### Visual Identity & Theme
- **Theme**: Refined dark slate (`#0B0F17` background, `#111827` surface, `#1E293B` hairline borders).
- **Typography**: Clean geometric typography (`Inter`, `JetBrains Mono` for tabular metrics and cycles).
- **Zero-Pill Discipline**: Statuses and categories rendered as clean, unboxed text separated by quiet mid-dots (`·`) or subtle hairline borders; no candy-colored badges.
- **Search Bar Affordance**: Input styled with `bg-slate-900 border-slate-800 text-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500` with left search icon and right keyboard shortcut hint (`Esc` to clear).

***

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: File-Backed Persistent Database vs External Database**:
  - *Chosen Approach*: An embedded file-backed database store (`server/services/storageService.ts`) storing JSON-persisted state in `data/projects.json` with synchronous atomic file writes.
  - *Why*: Self-contained, zero-configuration, robust across restarts in containerized cloud environments, and avoids requiring external DB connection strings or separate migration services while providing 100% reliable persistence.
- **Decision 2: Client-Side vs Server-Side Search**:
  - *Chosen Approach*: Reactive client-side search in `DashboardView.tsx` with normalized lowercase token matching across `title`, `researchQuestion`, and `claims/gaps categories`.
  - *Why*: Instant, zero-latency feedback on keystroke without roundtrip server lag; handles dozens of research projects effortlessly.
- **Decision 3: Complete Removal of Judge / Competition Content**:
  - *Chosen Approach*: Delete `src/components/JudgeModal.tsx`, remove its state and button in `Navbar.tsx` and `App.tsx`, and clean up "Hackathon 2026" labels across `LandingPage.tsx`, `DashboardView.tsx`, and `Navbar.tsx`.
  - *Why*: Directly satisfies user instruction and transforms the interface into a professional SaaS product.

***

## 4. Technical Architecture & Component Hierarchy

```
┌────────────────────────────────────────────────────────┐
│                   Frontend (React 19)                  │
│  Navbar (Clean Brand) • Dashboard (Search Bar + Stats) │
│  New Research • Analysis Report • Priority Checklist   │
└───────────────────────────┬────────────────────────────┘
                            │ Fetch API (REST JSON)
┌───────────────────────────▼────────────────────────────┐
│              Express.js Backend (server.ts)            │
├────────────────────────────────────────────────────────┤
│  /api/research          ──► Storage Service            │
│  /api/sources/fetch     ──► SSRF Guard & HTML Scraper  │
│  /api/analyze           ──► Gemini 3.8 Flash / NLP     │
└───────────────────────────┬────────────────────────────┘
                            │ Read / Write
┌───────────────────────────▼────────────────────────────┐
│       Persistent Database (data/projects.json)         │
│   Full project histories, sources, claims & checklists │
└────────────────────────────────────────────────────────┘
```

### Component & File Modifications
1. `server/services/storageService.ts`:
   - Initialize data folder (`data/projects.json`).
   - Load existing projects from disk upon startup; automatically seed initial sample studies if the file does not exist.
   - Write back to disk atomically on project creation, analysis completion, task toggling, and project deletion.
2. `src/components/DashboardView.tsx`:
   - Add search input bar with search icon, clear button, and result counter.
   - Filter `projects` dynamically: check if `title`, `researchQuestion`, or any category in `analysis.claims` or `analysis.gaps` includes the query string.
   - Render tailored empty search state when no items match.
   - Remove "Shinchan Hackathon 2026" text from demo cards and labels.
3. `src/components/Navbar.tsx`:
   - Remove `"Hackathon 2026"` pill badge next to the logo.
   - Remove `"Judge & CSE Guide"` button and its handler.
4. `src/App.tsx`:
   - Remove `JudgeModal` component import and render block.
   - Remove `isJudgeModalOpen` state and props.
5. `src/components/JudgeModal.tsx`:
   - Delete file as requested.
6. `src/components/LandingPage.tsx` & `src/components/AnalysisResultsView.tsx`:
   - Remove any residual "Shinchan Online Hackathon 2026" or "Judge" badge text and footers.

***

## 5. Verification Plan

1. **Compilation & Linting**:
   - Run `lint_applet` (`tsc --noEmit`) to verify zero TypeScript errors.
   - Run `compile_applet` (`vite build`) to confirm clean asset bundling.
2. **Dashboard Search Bar Verification**:
   - Verify typing `"scholarship"` filters down to the scholarship project.
   - Verify typing `"cutoff"` or `"admission"` filters to the admissions project.
   - Verify typing an unrepresented query like `"astronomy"` displays the clean empty state with a "Clear search" button.
3. **Database Persistence Verification**:
   - Create a new research project via `/new-research`.
   - Verify that data is saved in `data/projects.json`.
   - Toggle a checklist task in `/checklist` and verify the status is persisted on disk.
   - Query `curl http://localhost:3000/api/research` to ensure the updated project is served directly from the persistent file store.
4. **Brand Cleanliness Verification**:
   - Inspect Navbar: verify only "Digital Dark Spot" wordmark and clean navigation links exist (no Hackathon pill or Judge button).
