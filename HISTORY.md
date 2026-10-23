---
type: history
project: 2026-10-obra-flow
updated: 2026-10-23
---

## 2026-10-23 · FluxMES shell, glass, theme, F1 dock

- App frame is now a padded page with a 20px-radius floating shell and a glass plate on `::before`
- Theme defaults to light and persists in `localStorage` (`obraflow.theme`); there is no glass toggle
- Navigation matches the F1 app: floating vertical pill dock outside the shell on tablet/desktop, bottom pill dock on phone
- Header has ⌘K search and a theme toggle; Settings has an Aparência card for tema

## 2026-10-23 · Project set up, dashboard and Sankey

- Vault project created under personal projects with local git, no remote
- App scaffold: Vite, React 18, TypeScript, CSS Modules, Dexie, d3-sankey
- Domain logic for tranche-then-equity allocation, variance (including inflated budgets) and threshold alerts
- Dashboard ships KPIs, alert banner, funding-flow Sankey, monthly balance and variance table on first-run demo data
- Funding, budget, documents, reports and settings routes are wired; parser and export sit behind interfaces
