# Ledger — Student Finance Tracker

A vanilla HTML/CSS/JavaScript finance tracker built for the *Building Responsive UI*
summative assignment. No frameworks, no backend — all data lives in the browser's
`localStorage`.

**Theme:** Student Finance Tracker
**Live demo:** `<add your GitHub Pages URL here>`
**Repo:** `<add your repo URL here>`

---

## Features

- **About / Dashboard / Records / Add-Edit Form / Settings** — five sections on one
  page, linked via an in-page nav with a mobile hamburger menu.
- **Add, edit, delete** transactions with inline regex-validated forms.
- **Live regex search** across description, category, date, and amount, with safe
  compilation (a malformed pattern never throws — the search just falls back to
  showing all records and reports the issue).
- **Match highlighting** using `<mark>`, applied to escaped text so user input can
  never inject raw HTML.
- **Sortable table** by date, description (A↕Z), and amount (↑↓).
- **Stats dashboard**: total records, total spent, top category, last-7-days total,
  a 7-day bar trend, and a spending cap with an ARIA-live status message that
  switches tone (polite/under cap vs. assertive/over cap).
- **Currency settings**: base currency RWF with manual USD/EUR rates (no external
  API, as required).
- **Persistence**: every change auto-saves to `localStorage`.
- **Import/export**: export all records as a JSON file; import validates the
  array shape (every record needs `id`, `description`, `category`, `date` as
  strings and a numeric `amount`) before it touches app state, with a clear error
  message if validation fails.
- **Responsive**: table becomes stacked cards under ~680px; nav collapses into a
  full-height drawer; tested at ~360px, 768px, and 1024px+ breakpoints.
- **Accessible by default**: skip link, semantic landmarks, labeled inputs, visible
  focus rings, `aria-live` regions for search results/form status/cap warnings,
  a native `<dialog>` for delete confirmation, and `prefers-reduced-motion` support.

---

## Regex catalog

All patterns live in `app.js` under the `Validators` and `Search` sections.

| Purpose | Pattern | Notes |
|---|---|---|
| Description format | `/^\S(?:.*\S)?$/` | Rejects leading/trailing spaces. Combined with a separate `/\s{2,}/` check to catch doubled internal spaces. |
| Amount format | `/^(0|[1-9]\d*)(\.\d{1,2})?$/` | Positive numbers, up to 2 decimal places, no leading zeros (other than `0` itself). |
| Date format | `/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/` | `YYYY-MM-DD`. A follow-up `Date` object check catches calendar-impossible dates like `2026-02-31` that the regex alone would let through. |
| Category format | `/^[A-Za-z]+(?:[ -][A-Za-z]+)*$/` | Letters, spaces, and hyphens only. |
| **Advanced — back-reference** | `/\b(\w+)\s+\1\b/i` | Flags an accidentally repeated word in the description, e.g. `"Chemistry chemistry book"`. Used both as a form-level warning and exercised directly in `tests.html`. |
| Search — cents present | `/\.\d{2}\b/` | Example query: finds amounts with exact cents. |
| Search — beverage keyword | `/(coffee|tea)/i` | Example query: case-insensitive keyword match. |
| Safe regex compiler | `new RegExp(input, flags)` wrapped in try/catch | Never throws; returns `null` on invalid input so the UI can degrade gracefully instead of crashing. |

Try these in the search box on the **Records** page:

```
coffee|tea
\.\d{2}\b
^Tuition
```

---

## Keyboard map

| Key | Action |
|---|---|
| `Tab` / `Shift+Tab` | Move focus forward/backward through all interactive elements |
| `Enter` (on skip link) | Jump straight to `<main>`, bypassing the header/nav |
| `Enter` / `Space` (on nav toggle) | Open/close the mobile navigation drawer |
| `Enter` (in any sort button) | Sort the table by that column; press again to reverse direction |
| `Enter` (on Edit) | Load that record into the form and move focus to the description field |
| `Enter` (on Delete) | Open the confirm dialog (focus moves inside the dialog automatically) |
| `Esc` (with dialog open) | Cancel the delete, closing the dialog without changes |
| `Enter` (on Save transaction) | Submit the form; validation errors are announced via `role="alert"` next to each field |

All interactive elements have a visible focus outline (`:focus-visible`) and the
entire app — including the delete dialog and the mobile nav — is operable without
a mouse.

---

## Accessibility notes

- Landmarks: `header`, `nav`, `main`, five `section`s with `aria-labelledby`, and
  `footer`.
- Every form input has a bound `<label>` plus an `aria-describedby` pointing to its
  hint and error text.
- Search result counts and "invalid pattern" states are announced through a
  `role="status"` live region (visually hidden, screen-reader only).
- The spending-cap message switches `aria-live="polite"` → `aria-live="assertive"`
  when spending crosses the cap, so it interrupts only when it matters.
- Delete uses a native `<dialog>` element (built-in focus trapping and `Esc`
  handling) instead of a custom modal.
- Color choices were checked for contrast: body text `#1B2A4A` on `#FAF6EE`
  background, and status colors (`#2D6A4F` green / `#A4452E` brick) all meet
  WCAG AA for normal text at the sizes used.
- `prefers-reduced-motion: reduce` collapses all transition/animation durations.

---

## How to run

No build step or server required:

1. Clone the repo.
2. Open `index.html` directly in a browser (or serve the folder with any static
   server, e.g. `npx serve .`).
3. The app starts empty. Go to **Settings → Import JSON** and select `seed.json`
   to load 12 sample transactions (includes edge cases: a year-end date, a very
   small amount, a very large amount, and a duplicate-word description).

## How to run the tests

Open `tests.html` directly in a browser. It loads `app.js`, exposes its internal
modules via `window.LedgerApp`, and runs 31 plain-JavaScript assertions against
the validators, the regex search compiler, the highlight function, and the JSON
import validator. Results are rendered on the page and logged to the console —
no test framework or build step needed.

---

## File structure

```
index.html      semantic HTML + all CSS (inline <style>)
app.js          all JavaScript, organized into commented sections:
                  1. Storage    — localStorage + import/export validation
                  2. Validators — regex rules for the form
                  3. Search     — safe regex compiler + <mark> highlighter
                  4. State      — in-memory records, sort/filter, derived stats
                  5. UI         — all DOM rendering
                  6. Events     — wires the DOM to State/UI
seed.json       12 sample transactions with edge-case data
tests.html      standalone assertion-based test runner for app.js
README.md       this file
```

---

## Academic integrity note

This project's UI and logic were written by hand as a learning exercise. AI
assistance was used only for this README and for generating `seed.json` sample
data, consistent with the assignment's policy that AI use is permitted for
documentation and seed data but not for application code.
