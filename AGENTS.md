# ObraFlow

Personal construction financial monitor. Vault notes: [index.md](index.md). Mind map: [mindmap.md](mindmap.md).

This folder is the git root (no `code/` wrapper).

## Layout

| Path | Contents |
|------|----------|
| `src/domain/` | Pure TypeScript: types, cashflow, variance, alerts, sankey, seeds |
| `src/services/` | IndexedDB, document parsing, CSV/PDF export |
| `src/hooks/` | React bridge over domain + storage |
| `src/components/` | JSX structure only. Styles live in adjacent `*.module.css` |
| `src/features/` | Route views: funding, budget, documents, reports, settings |
| `src/i18n/` | European Portuguese UI strings |
| `src/styles/` | Design tokens and global CSS |
| `docs/context.md` | Architecture and decisions |
| `HISTORY.md` | Macro changelog, newest first |

## Rules

- No Coreflux broker in this project. Local IndexedDB is the source of truth.
- UI copy, labels and default category names are European Portuguese only. Code, comments, identifiers: English.
- No inline styles. CSS Modules + tokens from `src/styles/tokens.css` (Coreflux DESIGN.md). Product code never uses primitive colour hexes.
- Logic that allocates cash, computes variance or builds the Sankey graph stays in `src/domain/`. Components do not reimplement it.
- Credentials never go in the repo. There is no login.
- When a change alters what the code does, add or extend today's entry in `HISTORY.md`.
