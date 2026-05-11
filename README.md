# Embeddable-UI

A clickable prototype for an embeddable KYC (Know Your Customer) / entity verification widget. Built with React + Vite.

This repository contains **two versions** of the app:

## `app-demo/`

The standalone prototype with demo/dev tools — phone-frame preview, screen-jump controls, and other affordances for stakeholder walk-throughs and flow iteration. Use this to demo the flow end-to-end or to iterate on requirements.

```bash
cd app-demo
npm install
npm run dev
```

## `app-embedded/`

The integration-ready version, prepared for embedding inside a host product (e.g. the Delio / WPM platform demo) as an iframe. Includes the `EMBED_READY` handshake, postMessage prefill, and the cleanups made during integration. No demo overlays.

```bash
cd app-embedded
npm install
npm run dev
```

## Which one to use?

- **Demoing or iterating on the flow** → `app-demo/`
- **Integrating into a host product** → `app-embedded/`

## What the flow covers

A 12-screen corporate entity verification flow:

| Screen | Description |
|--------|-------------|
| 1 | Welcome — select verification type (Individual / Corporate) |
| 2 | Disclaimer |
| 3 | Step overview |
| 4 | Consent |
| 5 | Entity details |
| 6 | Review & confirm |
| 7 | Document request |
| 8 | Entity document upload |
| 9 | Associated parties list |
| 10 | Add / edit an associated party |
| 11 | Verification links |
| 12 | Status |

## Tech

- React 19 + Vite
- Plain CSS with design tokens
- No backend — state lives in a `useReducer` in `App.jsx`
- Powered by [Interro](https://interro.ai)
