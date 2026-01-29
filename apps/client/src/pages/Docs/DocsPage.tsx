import { MainPageLayout } from '@/templates';
import { PageHeader, SectionCard } from '@/components/organisms';

const sections = [
  {
    title: 'Tech Stack',
    items: [
      'Client: Vite + React + TypeScript',
      'Server: Hono + TypeScript + Prisma',
      'UI: shadcn/ui components + Tailwind CSS',
      'State/Data: TanStack Query, TanStack Router',
      'i18n: i18next + react-i18next',
      'Monorepo: pnpm workspaces + Turborepo',
      'Shared: @repo/shared (Zod schemas + shared model types)',
    ],
  },
  {
    title: 'Repository Structure',
    code: `.
├── apps/
│   ├── client/         # Vite + React app
│   └── server/         # Hono API + Prisma
├── packages/
│   └── shared/         # Shared types/schemas (Zod)
├── tools/              # Tooling (optional)
├── docs/               # Project documentation
└── turbo.json`,
  },
  {
    title: 'Client Structure (Atomic Design)',
    code: `apps/client/src/
├── components/
│   ├── atoms/
│   ├── molecules/
│   ├── organisms/
│   └── ui/              # shadcn/ui primitives
├── pages/
│   ├── Auth/
│   ├── Home/
│   └── Components/
├── templates/
│   ├── MainPageLayout.tsx
│   └── AuthPageLayout.tsx
├── hooks/
├── i18n/
├── lib/
├── providers/
├── routes/
└── utils/`,
  },
  {
    title: 'Best Practices',
    items: [
      'No business logic in UI components (atoms/molecules/organisms).',
      'Prefer hooks for data access (useApi, useRequest).',
      'Keep layouts in templates and pages thin.',
      'Use shared types from @repo/shared to avoid duplication.',
      'Avoid any; use unknown and narrow safely.',
      'Use Zod schemas for runtime validation and infer types.',
    ],
  },
  {
    title: 'Tailwind + shadcn/ui',
    items: [
      'Tailwind is the primary styling mechanism.',
      'shadcn/ui primitives live in components/ui.',
      'Use atoms as the boundary for styling primitives.',
      'Prefer design tokens (bg-background, text-foreground, border-border).',
    ],
  },
  {
    title: 'i18n Structure',
    items: [
      'common.json → shared UI strings (navbar, labels, etc.)',
      'translation.json → page copy under Pages.*, component copy under Components.*',
    ],
    code: `Pages.Home.Title
Pages.Components.Title
Components.Atoms.Primary
Components.Molecules.Confirm.Title`,
  },
  {
    title: 'Development Workflow',
    code: `pnpm install
pnpm dev
pnpm build
pnpm lint
pnpm test`,
  },
  {
    title: 'Barrel Files',
    items: [
      'Use index.ts files to export public modules for cleaner imports.',
      'Avoid deep imports into feature folders; prefer public barrels.',
      'Example: import { Button } from "@/components/atoms" instead of a deep path.',
    ],
    code: `// good
import { Button } from '@/components/atoms';

// bad
import Button from '@/components/atoms/Button';`,
  },
  {
    title: 'Pathnames & Endpoints',
    items: [
      'Centralize internal routes in lib/paths/pathnames.ts.',
      'Centralize API endpoints in lib/api/endpoints.ts.',
      'Use PATHNAMES in Link/router to avoid hardcoded strings.',
      'Use endpoints helpers for REST calls to keep URL changes in one place.',
    ],
    code: `// routes
import { PATHNAMES } from '@/lib/paths/pathnames';
<Link {...PATHNAMES.signIn()} />

// API
import { API_ENDPOINTS } from '@/lib/api/endpoints';
fetch(API_ENDPOINTS.signIn())`,
  },
  {
    title: 'Linting & Formatting',
    items: [
      'ESLint checks code quality and common mistakes.',
      'Prettier handles formatting (keep output consistent).',
      'Scripts: pnpm lint, pnpm lint:fix, pnpm format, pnpm format:check.',
    ],
    code: `pnpm lint
pnpm format`,
  },
  {
    title: 'File Size & Structure',
    items: [
      'Max line length: 100 characters (readability + diff quality).',
      'Max file size: 500–800 lines; split larger files into modules.',
      'Functions should be ~< 50 lines (max 100) and single-purpose.',
      'If a class/module exceeds ~800–1000 lines, split into focused components.',
      'Prefer feature folders (components/hooks/utils) over huge monolith files.',
    ],
    code: `# .editorconfig
root = true
[*]
charset = utf-8
end_of_line = lf
indent_style = space
indent_size = 2
insert_final_newline = true
max_line_length = 100
trim_trailing_whitespace = true`,
  },
  {
    title: 'Testing',
    items: [
      'Unit tests: Vitest + Testing Library.',
      'Run: pnpm test, pnpm test:run, pnpm test:ui.',
    ],
    code: `pnpm test:run`,
  },
  {
    title: 'Security (OWASP & Best Practices)',
    items: [
      'Follow OWASP Top 10 and OWASP Secure Coding Practices.',
      'Validate and sanitize ALL inputs on the server; never trust the client.',
      'Use proven password hashing (Argon2, bcrypt, scrypt).',
      'Protect against XSS/CSRF; use framework protections and CSRF tokens for forms.',
      'Set security headers (CSP, HSTS, X-Frame-Options, etc.).',
      'Separate authentication (identity) from authorization (permissions).',
      'Do not commit secrets (.env); use secret managers (e.g., Vault) + audit.',
      'Log security-relevant events; never log sensitive data.',
      'Encrypt sensitive data (TLS in transit, AES-256 at rest).',
      'Prevent SQL injection via parameterized queries/ORMs (Prisma/Knex).',
    ],
    code: `OWASP Top 10
OWASP Secure Coding Practices`,
  },
  {
    title: 'Containerization & Twelve-Factor App',
    items: [
      'Ship optimized Dockerfiles (prefer multi-stage builds).',
      'Maintain .dockerignore to keep builds fast and images small.',
      'Define ENTRYPOINT/CMD clearly; one process = one container.',
      'Run as non-root user inside containers.',
      'Keep logs/config/state out of the image; use volumes or external services.',
      'Define HEALTHCHECK for liveness/readiness.',
      'Use slim/alpine/distroless base images where possible.',
      'Configure via environment variables; avoid hardcoded config.',
      'Align with Twelve-Factor principles (config, logs, disposability).',
      'Do not share files between services via filesystem; use object storage or dedicated services (containers are ephemeral).',
    ],
    code: `Dockerfile
.dockerignore
HEALTHCHECK
USER app
ENV`,
  },
  {
    title: 'Versioning (SemVer)',
    items: [
      'Version is defined in the root package.json (single source of truth).',
      'We use SemVer: MAJOR.MINOR.PATCH.',
      'Product owner decides the target version.',
      'Keep a simple manual bump process; no automation required.',
    ],
    code: `# Where version lives
package.json (root)

# How to bump
pnpm version patch
pnpm version minor
pnpm version major`,
  },
  {
    title: 'Auth Pages & Layout',
    items: [
      'Auth pages use AuthPageLayout for consistent header, language and theme controls.',
      'Pages are UI-only (no business logic) and can be wired later.',
      'Routes live under /auth/* and use PATHNAMES helpers.',
    ],
    code: `// layout usage
import { AuthPageLayout } from '@/templates';

export const SignInPage = () => (
  <AuthPageLayout t={t}>
    <Card>...</Card>
  </AuthPageLayout>
);

// routes
/auth/signin
/auth/signup
/auth/forgot-password
/auth/reset-password/:token`,
  },
  {
    title: 'Conventional Commits + Versioned Header',
    items: [
      'All commits must include version + author initials + Jira ticket in the header.',
      'Use Conventional Commits in the message body.',
      'Format: first line = version + initials, second line = Jira + conventional commit.',
    ],
    code: `# example
git commit -m "v3.22.10 MK" \\
  -m "ISSODN-940 - chore: PHP8 tweaks, removing dompdf from repo"`,
  },
  {
    title: 'React/JSX Style (Most Reasonable Highlights)',
    items: [
      'One React component per file; JSX-only components.',
      'Prefer const arrow function components and PascalCase filenames.',
      'Avoid React.createClass, mixins, and string refs.',
      'Double quotes in JSX attributes, single quotes in JS.',
      'Self-close tags without children; wrap multiline JSX in parentheses.',
      'CamelCase props; omit boolean props when true.',
      'Always provide meaningful img alt text; avoid invalid ARIA roles.',
      'Avoid array index as key; use stable IDs.',
      'Avoid mixins and isMounted; prefer hooks and composition.',
    ],
    code: `// good
export const Card = () => <div />;

// good
return (
  <Button variant="outline">
    Save
  </Button>
);

// bad
<img src="hero.jpg" />`,
  },
  {
    title: 'General JS Conventions',
    items: [
      'Prefer const over let; avoid var.',
      'Use strict equality (===).',
      'Prefer async/await over callbacks.',
      'Name functions for easier debugging.',
      'Avoid side effects at module scope.',
    ],
    code: `const value = 1;
if (value === 1) {
  // ...
}

export const loadUsers = async () => {
  const res = await fetch('/api/users');
  return res.json();
};`,
  },
  {
    title: 'Adding New Features',
    items: [
      'Add shared types in packages/shared when needed.',
      'Create/extend hooks in apps/client/src/hooks for data access.',
      'Build UI from atoms → molecules → organisms.',
      'Add page in pages/ and route in routes/.',
      'Use templates for layout shells.',
    ],
  },
];

export const DocsPage = () => (
  <MainPageLayout>
    <div className="space-y-8">
      <PageHeader
        title="Project Documentation"
        description="Structure, workflow, and best practices for this monorepo."
      />

      <div className="space-y-6">
        {sections.map(section => (
          <SectionCard
            key={section.title}
            title={section.title}
            description={undefined}
          >
            {section.items ? (
              <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-2">
                {section.items.map(item => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : null}
            {section.code ? (
              <pre className="mt-4 rounded-md border bg-muted/40 p-4 text-xs text-foreground overflow-x-auto">
                <code>{section.code}</code>
              </pre>
            ) : null}
          </SectionCard>
        ))}
      </div>
    </div>
  </MainPageLayout>
);
