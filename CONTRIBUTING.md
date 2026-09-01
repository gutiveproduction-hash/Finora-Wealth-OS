# Contributing to My Networth

Thanks for considering a contribution! This is a small community/charity project, so the process
is intentionally lightweight.

## Development setup

```bash
npm install
npm run electron:dev
```

See the main [README](./README.md#getting-started-development) for prerequisites and details.

## Before opening a PR

1. Run `npm run typecheck` — please fix any type errors it reports.
2. Run `npm run build` to make sure the renderer and Electron main process both compile.
3. If you touched the database schema (`electron/db/schema.ts`), also update the raw `CREATE
   TABLE` statements in `electron/db/index.ts` (this project runs plain idempotent SQL at startup
   rather than a migration framework, to keep the offline single-user setup simple — see the
   comment at the top of that file).
4. Keep PRs focused — one feature or fix per PR is much easier to review than a large mixed change.

## Reporting bugs

Please include:

- Your OS and version (e.g. "macOS 15.1" or "Windows 11 23H2")
- Steps to reproduce
- What you expected vs. what happened
- The app version (Settings → Tentang My Networth)

## Code style

- TypeScript everywhere, `strict` mode is on — please don't add `any` casts to work around type
  errors without a good reason.
- The renderer (`src/`) never touches Node.js or Electron APIs directly — everything goes through
  `window.api`, which is defined in `electron/preload.ts` and typed in `src/types/index.ts`. If you
  need a new capability, add an IPC handler in `electron/ipc/`, expose it in `preload.ts`, and add
  its type to `MyNetworthApi` in `src/types/index.ts`.
- Tailwind utility classes are preferred over new CSS; shared button/input styles live in
  `src/index.css` under `@layer components` (`.btn-primary`, `.input`, `.card`, etc.).

## Code of conduct

Be respectful, assume good faith, and keep discussion focused on the code and the project's goals.
Anything else — treat others the way you'd want to be treated in a small open-source project run
by volunteers.
