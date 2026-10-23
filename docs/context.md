# ObraFlow: project context

No credentials or personal banking data. Demo seed is fictional.

## Goal and scope

Local app to watch a construction budget: loan tranches and equity feed categories, categories feed real expenses. Highlight overruns and budgets that were padded for credit approval. No account system.

## Stakeholders (roles)

- Owner (single local user)
- Bank (receives exported reports, does not use the app)

## Architecture and stack

- React 18, Vite, TypeScript (strict)
- CSS Modules, Coreflux semantic tokens
- Dexie IndexedDB
- d3-sankey
- Domain functions are pure and unit-tested (Vitest)
- DocumentParser interface: PDF text, optional OCR, mock fallback

Cash-flow rule: expenses draw from the oldest released tranche that still has funds and was released on or before the expense date. Remainder draws from equity. One expense may split across sources.

## Status and milestones

See `index.md` Current Status and `HISTORY.md`.

## Decisions

- No broker: no backend, no MQTT consumers.
- CSS Modules over Tailwind to keep styling out of JSX.
- Git root is this folder.

## Open points and risks

- No backup of IndexedDB
- OCR quality on scans
- Demo seed vs a real obra

## Where things live

See `AGENTS.md` layout table.
