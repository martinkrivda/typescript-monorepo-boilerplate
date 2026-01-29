# Project Documentation

This document explains the project structure, development workflow, and best practices. It is intended for day‑to‑day development in this monorepo.

## Tech Stack

- **Client**: Vite + React + TypeScript
- **Server**: Hono + TypeScript + Prisma
- **UI**: shadcn/ui components + Tailwind CSS
- **State/Data**: TanStack Query, TanStack Router
- **i18n**: i18next + react-i18next
- **Monorepo**: pnpm workspaces + Turborepo
- **Shared**: `@repo/shared` (Zod schemas + shared model types)

## Repository Structure

```
.
├── apps/
│   ├── client/         # Vite + React app
│   └── server/         # Hono API + Prisma
├── packages/
│   └── shared/         # Shared types/schemas (Zod)
├── tools/              # Tooling (optional)
├── docs/               # Project documentation
└── turbo.json
```

## Client Structure (Atomic Design)

```
apps/client/src/
├── components/
│   ├── atoms/
│   ├── molecules/
│   ├── organisms/
│   └── ui/              # shadcn/ui primitives
├── pages/
│   ├── Home/
│   └── Components/
├── templates/
│   └── MainPageLayout.tsx
├── hooks/
├── i18n/
├── lib/
├── providers/
├── routes/
└── utils/
```

### Conventions

- **atoms/molecules/organisms** contain reusable UI without business logic.
- **pages** contain page-specific composition and copy.
- **templates** provide layout shells (navbar/footer + content wrapper).
- **ui** is shadcn‑style primitives and should stay minimal.

## Shared Types (Client + Server)

Use `@repo/shared` for shared models and Zod schemas:

```ts
import type { User } from '@repo/shared';
import { userSchema } from '@repo/shared';
```

This avoids duplicating model definitions across apps.

## Tailwind + shadcn/ui

- Tailwind is the primary styling mechanism.
- shadcn/ui primitives live in `components/ui` and are composed into atoms/molecules.
- Prefer **composition** over deep customization in primitives.
- Keep design tokens in `index.css` (CSS variables).

## i18n Structure

Translations are grouped by namespace and follow atomic separation:

- `common.json` → shared UI strings (navbar, labels, etc.)
- `translation.json` → page copy under `Pages.*`, component copy under `Components.*`

Example keys:

```
Pages.Home.Title
Pages.Components.Title
Components.Atoms.Primary
Components.Molecules.Confirm.Title
```

## Best Practices

- **No business logic in UI components** (atoms/molecules/organisms).
- **Prefer hooks for data fetching** (`useApi`, `useRequest`).
- **Keep layouts in templates** and pages thin.
- **Use shared types** from `@repo/shared` to avoid duplication.
- **Avoid `any`**; use `unknown` and narrow types safely.
- **Use Zod schemas** for runtime validation, infer types from them.

## Development Workflow

Common commands (run from repo root):

```bash
pnpm install
pnpm dev
pnpm build
pnpm lint
pnpm test
```

## Barrel Files

Use `index.ts` barrel files to expose public modules and keep imports clean:

```ts
import { Button } from '@/components/atoms';
```

Avoid deep imports into internal folders unless there is no barrel export.

Bad:
```ts
import Button from '@/components/atoms/Button';
```

## Linting & Formatting

- **ESLint** for code quality and common pitfalls.
- **Prettier** for consistent formatting.
- Useful scripts:
  - `pnpm lint`, `pnpm lint:fix`
  - `pnpm format`, `pnpm format:check`

Example:
```bash
pnpm lint
pnpm format
```

## Testing

- **Vitest + Testing Library** for unit tests.
- Scripts: `pnpm test`, `pnpm test:run`, `pnpm test:ui`

Example:
```bash
pnpm test:run
```

## React/JSX Style Highlights (Mostly Reasonable)

- One React component per file; prefer JSX components.
- Prefer **const arrow function** components and **PascalCase** filenames.
- Avoid `React.createClass`, mixins, and string refs.
- JSX attributes use **double quotes**, JS uses **single quotes**.
- Self-close tags without children; wrap multiline JSX in parentheses.
- Use camelCase props; omit boolean props when `true`.
- Always add `alt` to `<img>`; avoid invalid ARIA roles and `accessKey`.
- Avoid array index as `key`; use stable IDs.
- Avoid `isMounted`; use hooks and composition.

Examples:
```tsx
// good
export const Card = () => <div />;

// good - multiline JSX in parentheses
return (
  <Button variant="outline">
    Save
  </Button>
);

// bad
<img src="hero.jpg" />
```

## General JS Conventions

- Prefer `const` over `let`; avoid `var`.
- Use `===` (strict equality).
- Prefer `async/await` over callbacks.
- Name functions for easier debugging.
- Avoid side effects at module scope; keep effects inside functions.

Examples:
```ts
const value = 1;
if (value === 1) {
  // ...
}

export const loadUsers = async () => {
  const res = await fetch('/api/users');
  return res.json();
};
```

## Adding New Features

1. Add shared types in `packages/shared` if needed.
2. Create/extend hooks in `apps/client/src/hooks` for data access.
3. Build UI from atoms → molecules → organisms.
4. Add page in `pages/` and route in `routes/`.
5. Wire it into templates if a new layout is required.

## shadcn/ui Usage

- Keep primitives in `components/ui` unchanged when possible.
- Use atoms as the boundary for customizing shadcn styles.
- If new primitives are needed, add them to `components/ui` and wrap in atoms.

## Tailwind Tips

- Prefer utility classes for layout.
- Use `bg-background`, `text-foreground`, `border-border` to honor light/dark themes.
- Avoid hard-coded colors in components.

## Testing (Optional)

- Client tests with Vitest/Testing Library
- Server tests with Vitest

## Notes

- Keep `App.tsx` unused; routing is handled via TanStack Router.
- Layouts should be composed via templates for consistency.
