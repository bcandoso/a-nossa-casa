---
title: "ObraFlow mind map"
aliases: ["ObraFlow mind map"]
type: mindmap
project: 2026-10-obra-flow
tags: [personal/obra-flow, mindmap]
created: 2026-10-23
updated: 2026-10-23
sources: [index.md]
markmap:
  colorFreezeLevel: 2
  initialExpandLevel: 2
  maxWidth: 320
---
# ObraFlow

## Goal and scope
- Track construction cash flow without an account
- Loan tranches + equity → budget categories → real expenses
- Catch overruns and budgets inflated for credit approval
- UI in European Portuguese; code in English

## Stakeholders
- Owner: Bruno Candoso
- Bank (reports only, not a user of the app)

## Architecture and stack
- React 18 + Vite + TypeScript
- CSS Modules + Coreflux DESIGN.md tokens
- Dexie IndexedDB
- d3-sankey for the funding-flow diagram
- Domain logic in pure TypeScript (cashflow, variance, alerts)
- Document parser behind an interface (PDF text, OCR fallback, mock)

## Status and milestones
- 2026-10-23 Project created, dashboard and Sankey working on demo seed
- Next: live funding editor, document validation, bank export

## Open points
- Personal GitHub remote or stay local
- Client-side OCR vs mocked backend parse

## Decisions
- No broker, no login, no splash
- CSS Modules, not Tailwind
- Git root is the project folder

## Risks
- IndexedDB is device-local; no backup yet
- OCR quality on scanned invoices will be uneven
- Demo seed must not be mistaken for a real obra

## Links
- [[02-personal/01-projects/2026-10-obra-flow/index|ObraFlow]]
- [[01-work/04-knowledge/context/system-design/DESIGN|Coreflux DESIGN.md]]
- [[01-work/02-internal/2026-09-fluxmes/index|FluxMES]]
