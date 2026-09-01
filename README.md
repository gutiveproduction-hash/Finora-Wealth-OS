# My Networth 💰

**My Networth** is a free, open-source personal finance & investment portfolio tracker. It's a
desktop app for macOS and Windows that runs **100% offline** — your financial data never leaves
your computer, because there is no server, no account, and no telemetry. Everything is stored in a
local SQLite database on your own machine.

This project started as a small charity/community effort to give people a private, no-strings
alternative to subscription finance apps. Contributions are welcome — see [Contributing](#contributing).

> ⚠️ **Disclaimer**: My Networth is a bookkeeping tool, not financial or investment advice. Exchange
> rates and asset prices are entered manually (there is no live market data feed, by design — see
> [Offline by design](#offline-by-design)). Always verify important numbers yourself.

## Features

- **Cash flow & budgeting** — track income/expense transactions across bank accounts, e-wallets,
  and cash; categorize spending; set monthly budgets per category and see actual vs. budget.
- **Investment portfolio** — track holdings across stocks, mutual funds (reksadana), crypto,
  bonds, and property. See cost basis, market value, and gain/loss per asset.
- **Net worth tracker** — combines your cash accounts, investments, and liabilities (loans, credit
  cards, mortgages) into a single net worth number, with historical snapshots charted over time.
- **Multi-currency**, with IDR (Rupiah) as the default base currency and manually-editable
  exchange rates to any other currency.
- **CSV import** for transactions, with a column-mapping step so it works with exports from most
  banks/spreadsheets.
- **Dark mode**, with light / dark / system options.
- **Local backup & restore** — export all your data to a single JSON file at any time, and import
  it back (e.g. after reinstalling, or to move to another computer).
- **Cross-platform installers** for macOS (.dmg) and Windows (.exe installer + portable .exe).

## Offline by design

My Networth deliberately has **no network calls**. There's no live stock/crypto price feed and no
automatic exchange-rate updates — you enter and update prices and rates yourself in-app (see
Investments → "Update Harga" and Settings → Kurs Konversi). This is a conscious trade-off: it
means your portfolio and spending data can never be sent anywhere, at the cost of prices not
updating themselves. If you want live pricing, that's a good area to contribute a
(clearly-labeled, opt-in) integration — see [Contributing](#contributing).

## Tech stack

- [Electron](https://www.electronjs.org/) + [React](https://react.dev/) + TypeScript
- [Vite](https://vitejs.dev/) for the renderer bundle
- [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) + [drizzle-orm](https://orm.drizzle.team/)
  for the local database
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Recharts](https://recharts.org/) for charts
- [electron-builder](https://www.electron.build/) for packaging (.dmg / .exe)

## Project structure

```
my-networth/
├─ electron/              # Main process (Node.js) — never bundled by Vite
│  ├─ main.ts             # Window creation, app lifecycle
│  ├─ preload.ts          # contextBridge — the only surface the renderer can call
│  ├─ db/
│  │  ├─ schema.ts        # drizzle-orm table definitions
│  │  └─ index.ts         # sqlite connection, schema init, default seed data
│  ├─ ipc/                # One file per domain (accounts, transactions, investments, ...)
│  └─ utils/
├─ src/                   # Renderer (React) — sandboxed, no Node access
│  ├─ pages/              # One file per route (Dashboard, Transactions, ...)
│  ├─ components/         # layout/, ui/, charts/
│  ├─ hooks/              # Data-fetching hooks per domain, wrapping window.api
│  ├─ store/              # zustand store (theme, base currency, exchange rates)
│  ├─ lib/                # formatting & currency conversion helpers
│  └─ types/              # Shared TypeScript types + window.api typing
├─ build/icon.png         # Source app icon (electron-builder generates .icns/.ico from this)
├─ electron-builder.yml   # Packaging config for mac/win/linux targets
└─ .github/workflows/build.yml   # CI: builds installers on macOS + Windows runners
```

## Getting started (development)

Requirements: [Node.js](https://nodejs.org/) 20+ and npm. `better-sqlite3` is a native module, so
on first install it will compile against your Node/Electron version — this needs a working C++
toolchain (Xcode Command Line Tools on macOS, or Visual Studio Build Tools + Python on Windows;
usually already present, `npm install` will tell you if not).

```bash
git clone https://github.com/<your-username>/my-networth.git
cd my-networth
npm install
npm run electron:dev
```

This starts the Vite dev server and launches Electron pointed at it, with hot reload for the
renderer.

Useful scripts:

| Script                | What it does                                              |
| --------------------- | ---------------------------------------------------------- |
| `npm run electron:dev`| Run the app in development mode with hot reload             |
| `npm run preview`     | Quick look in an ordinary browser tab, no Electron — see below |
| `npm run typecheck`   | Type-check both the renderer and the Electron main process  |
| `npm run build`       | Build the renderer (Vite) + compile the Electron main process |
| `npm run dist:mac`    | Build + package a macOS installer (.dmg/.zip) — run on macOS |
| `npm run dist:win`    | Build + package a Windows installer (.exe) — run on Windows  |
| `npm run dist:dir`    | Build + package an unpacked app (fastest, for local testing) |

## Quick preview in a browser (no Electron)

My Networth is a desktop app, but you can take a quick look at the UI in an ordinary browser tab
without installing it, using sample data:

```bash
npm install
npm run build
npm run preview
```

This opens `http://localhost:4173` with an amber "Mode Pratinjau Browser" banner. In this mode the
app runs entirely against a small in-memory/`localStorage`-backed stand-in for the real database
(see `src/lib/mockApi.ts`), seeded with sample accounts, transactions, and a portfolio — nothing is
saved to disk, CSV import and file-based backup are disabled with an explanatory message, and
whatever you enter only sticks around in that browser's local storage. It's for kicking the tires
on the UI, not for real use — run `npm run electron:dev` (or a built installer) for the real thing
with a persistent local SQLite database.

> **Why can't I just double-click `dist/index.html`?** Chrome (and most modern browsers) refuse to
> load `<script type="module">` from a `file://` URL — the page gets an opaque origin and every
> script/asset request is blocked by CORS, so you'd see a blank white page and a console full of
> "blocked by CORS policy" errors. This is a browser security restriction, not a bug specific to
> this project; it's why `npm run preview` spins up a real (if tiny) local HTTP server instead.
> Electron itself isn't affected by this — it loads local files differently than a regular browser
> tab does, which is why the desktop app works fine without any of this.

## Building installers

electron-builder can cross-compile Linux→Linux and, with some setup, Linux→Windows, but **macOS
targets (.dmg) can only be built on macOS** (an Apple restriction on the packaging tools, not this
project). The recommended way to get both installers is:

- **On a Mac**: `npm install && npm run dist:mac` → produces `release/My Networth-<version>.dmg`
- **On Windows**: `npm install && npm run dist:win` → produces `release/My Networth Setup <version>.exe`
  (installer) and a portable `.exe`

The included GitHub Actions workflow (`.github/workflows/build.yml`) does exactly this automatically
on `macos-latest` and `windows-latest` runners — push a tag like `v1.0.0` and it will build both and
attach them as a draft GitHub Release.

The apps are **unsigned** by default (no Apple Developer / Windows code-signing certificate is
wired up), so:

- On macOS, first launch requires right-click → Open (or allowing it in System Settings →
  Privacy & Security) since it's from an unidentified developer.
- On Windows, SmartScreen will show a warning ("Windows protected your PC") — click "More info" →
  "Run anyway".

If you have your own signing certificates, add them as GitHub Actions secrets and set the
corresponding `CSC_LINK` / `CSC_KEY_PASSWORD` (mac) or `WIN_CSC_LINK` / `WIN_CSC_KEY_PASSWORD`
(Windows) environment variables — electron-builder picks these up automatically.

## Data & privacy

Your data lives in a single SQLite file on your own machine:

- macOS: `~/Library/Application Support/My Networth/my-networth.sqlite3`
- Windows: `%APPDATA%\My Networth\my-networth.sqlite3`

You can find the exact path any time in **Settings → Buka Lokasi File Database**, and back up your
data anytime with **Settings → Ekspor Data (JSON)**.

## Contributing

Issues and pull requests are very welcome — this is a community project. A few ideas if you're
looking for something to build:

- An opt-in, clearly-labeled live price integration (stocks/crypto) that respects the offline-first
  default (off unless the user turns it on).
- More chart types on the Dashboard / Net Worth pages.
- CSV export (in addition to the existing JSON backup).
- i18n (the UI is currently Indonesian-first).
- Automated tests (there are currently none — a good first contribution!).

Please open an issue to discuss larger changes before submitting a PR. See
[CONTRIBUTING.md](./CONTRIBUTING.md) for the development workflow.

## License

[MIT](./LICENSE) — do whatever you like with it, including forking it for your own use case. If
you build something useful on top of it, a link back is appreciated but not required.
