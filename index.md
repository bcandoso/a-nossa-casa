---
type: project
title: ObraFlow
aliases: ["ObraFlow"]
project: 2026-10-obra-flow
started: 2026-10-23
status: active
tags: [personal/obra-flow]
updated: 2026-10-23
---

## ObraFlow

| Field | Value |
|-------|-------|
| Started | 2026-10-23 |
| Owner | [[Bruno Candoso]] |
| GitHub | _pending_ (local git only) |
| Stack | React 18, Vite, TypeScript, Dexie, d3-sankey, CSS Modules |

Mind map: [[02-personal/01-projects/2026-10-obra-flow/mindmap|ObraFlow mind map]]

## Context

Personal construction-project financial monitor. Maps cash flow from bank loan tranches and equity (capitais próprios) into budget categories and real expenses. Local-only: no account, no splash, IndexedDB persistence. UI in European Portuguese. Visual language follows FluxMES / Coreflux DESIGN.md.

## Current Status

Dashboard, Sankey, funding, budget, documents, reports and settings all route. First-run demo seed fills IndexedDB. Verified in the browser: Portuguese labels, tranche-then-equity alerts, pending invoice review.

## Objectives

- [x] Vault project + local app scaffold
- [x] Dashboard with Sankey (funding → categories → expenses)
- [x] Tranche-then-equity cash-flow allocation
- [x] Submitted budget vs real cost, with inflated-budget flag
- [ ] Finish funding and tranche editor against live data
- [ ] PDF/invoice parse with manual validation
- [ ] CSV/PDF export for the bank
- [ ] Threshold alerts wired through settings

## Decisions

- 2026-10-23: Local-only app, no Coreflux broker. There is no backend and no login, so MQTT/LoT adds nothing.
- 2026-10-23: CSS Modules instead of Tailwind, so structure, logic and styling stay in separate files.
- 2026-10-23: Git repo is the project folder (personal-projects layout). No `code/` wrapper.

## Open Questions

- Whether a later session should add a GitHub remote on the personal account (`bcandoso`)
- Whether OCR stays client-side (tesseract.js) or becomes a mocked API only

## Key Contacts

| Name | Role | Email |
|------|------|-------|
| [[Bruno Candoso]] | Owner | |

## State

| When | State | Subject | Note |
|------|-------|---------|------|
| 2026-10-23T11:05+01:00 | in-progress | shell | FluxMES floating glass shell, theme/glass toggles, F1-style dock |
| 2026-10-23T10:45+01:00 | in-progress | app | Dashboard and Sankey verified locally on demo seed |
| 2026-10-23T10:26+01:00 | in-progress | scaffold | Vault folder and first dashboard + Sankey |
