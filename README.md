# Embeddable-UI

A clickable prototype for an embeddable KYC (Know Your Customer) / entity verification widget. Built with React + Vite, rendered inside a phone frame to simulate how the widget would appear when embedded in a host product.

## Purpose

This prototype exists to **visualize and iterate on flow requirements** — not to ship production code. The goal is to make the end-to-end user journey tangible so that stakeholders, designers, and product owners can walk through it, identify gaps, and refine requirements before any real integration work begins.

Because it lives in a browser and runs locally in seconds, feedback cycles are fast. Change a screen, reload, and immediately see how the flow feels.

## What it covers

The prototype walks through a 12-screen corporate entity verification flow:

| Screen | Description |
|--------|-------------|
| 1 | Welcome — select verification type (Individual / Corporate) |
| 2 | Disclaimer |
| 3 | Step overview — what the user is about to do |
| 4 | Consent |
| 5 | Entity details — name, file number, country, state |
| 6 | Review & confirm |
| 7 | Document request — what docs are needed |
| 8 | Entity document upload |
| 9 | Associated parties list |
| 10 | Add / edit an associated party |
| 11 | Verification links — send links to associated parties |
| 12 | Status — submission complete |

## Running locally

```bash
npm install
npm run dev
```

Open `http://localhost:5173`. The app renders inside a phone frame so you can preview the embedded widget experience directly in a desktop browser.

## How to use it for iteration

- **Walk the flow end-to-end** to feel the progression and spot any missing or redundant steps.
- **Jump to a specific screen** by temporarily changing the `useState(1)` initial value in `src/App.jsx` to the screen number you want to inspect.
- **Edit screen content** directly in `src/screens/Screen*.jsx` — each screen is a self-contained component.
- **Annotate with placeholder states** (disabled buttons, greyed-out options) to represent flows that are out of scope for the current iteration, as seen on the "Individual" button on Screen 1.

## Tech

- React 19 + Vite
- Plain CSS with design tokens (`src/styles/tokens.css`)
- No backend — all state lives in a `useReducer` in `App.jsx`
- Powered by [Interro](https://interro.ai)
