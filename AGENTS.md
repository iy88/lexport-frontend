# Repository Guidelines

## Project Structure & Module Organization

LexPort is a React 18 single-page application built with Vite and strict TypeScript. Application code lives in `src/`: route-level screens are in `pages/`, reusable layouts and feature components in `components/`, Redux state in `store/`, shared hooks in `hooks/`, API clients and helpers in `lib/`, and shared declarations in `types/`. Add shadcn/Radix primitives under `src/components/ui/`; keep page-specific composition close to its page or feature. Static files belong in `public/`, while product notes and report fixtures live in `docs/`. Use the `@/` alias for imports from `src`.

## Build, Test, and Development Commands

- `yarn install` installs the locked dependencies (Node.js 20+ recommended).
- `yarn dev` starts Vite on port `7080` and proxies `/api` to `http://localhost:6768`.
- `yarn build` creates the production bundle in `dist/`.
- `yarn lint` runs strict TypeScript checks, Biome rules, project-specific ast-grep checks, Tailwind syntax validation, and a smoke build.

Run `yarn lint` before opening a pull request. The equivalent `npm run <script>` commands also work, but do not generate a second lockfile.

## Coding Style & Naming Conventions

Write TypeScript/TSX with four-space indentation and single quotes, following the surrounding code. Use `PascalCase` for React components and page files (`LawDetailPage.tsx`), `camelCase` for functions and variables, and `use-*.ts(x)` for hooks. Keep API paths and data access in `src/lib`, not embedded across UI primitives. Prefer Tailwind utilities and the shared `cn()` helper over new global CSS. Biome formatting is disabled, so preserve local formatting and rely on `yarn lint` for enforced rules.

## Testing Guidelines

No unit-test runner or coverage threshold is currently configured. Treat `yarn lint` and `yarn build` as mandatory checks. Manually exercise affected routes, authentication/role guards, API loading and error states, and responsive layouts. If adding tests, use `*.test.ts` or `*.test.tsx` beside the tested module and add the runner command to `package.json`.

## Commit & Pull Request Guidelines

Recent history primarily follows Conventional Commit prefixes such as `feat:`, `fix:`, `refactor:`, and `chore:`. Keep subjects imperative and focused, for example `fix: prevent duplicate law requests`. Pull requests should explain the user-visible change, identify affected routes, link the relevant issue, and include screenshots for UI changes. Note API or environment assumptions and list the checks performed.

## Security & Configuration

Never commit `.env`, tokens, or production credentials. The frontend expects backend calls under `/api`; document any new environment variable and provide a safe example value rather than a secret.
