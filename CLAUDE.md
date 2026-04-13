# CLAUDE.md

## Security Rules – Non-Negotiable

**These rules override everything. No exceptions. No workarounds. No "just for testing."**

### Secrets & API Keys
* NEVER put API keys, passwords, tokens, secrets, or credentials in code files – not even as placeholders, not even in comments
* ALWAYS use environment variables (`.env`) for ALL sensitive data
* ALWAYS create a `.env.example` file with placeholder names (no real values) so other devs know what's needed
* ALWAYS add `.env` to `.gitignore` BEFORE the first commit – not after
* NEVER commit `.env` files to version control under any circumstance
* If you see exposed secrets anywhere in the codebase, STOP immediately and warn me

### Code Safety
* NEVER hardcode database connection strings, webhook URLs, or third-party service endpoints in source files – use env vars
* NEVER log sensitive data (tokens, passwords, user PII) to the console, even in development
* NEVER disable authentication or security middleware "temporarily" – if it needs to be off, flag it and explain why
* ALWAYS validate and sanitize user input before using it in queries, APIs, or rendered output
* ALWAYS use parameterized queries – never concatenate user input into SQL strings

### Git & Deployment
* NEVER push to develop, production, main or master branch
* ALWAYS check for exposed secrets before any commit: `git diff --cached | grep -iE "(api_key|secret|password|token)"`
* If a secret is accidentally committed, consider it compromised – rotate it immediately, don't just delete the line

## Project File Structure
```
src/
  app/
    core/
      graphql.provider.ts   → Apollo/GraphQL setup
    features/
      <feature>/
        core/               → UI components, templates, styles, i18n assets
          assets/i18n/      → Feature-scoped translation files (de.json)
          src/lib/components/pages/
            <page>/         → page component (.ts / .html / .css)
            <sub-component>/→ child components (.ts / .html / .css) – inside pages/
        states/             → All GraphQL-related code for this feature
          <feature>Models.ts      → TypeScript interfaces / types
          <feature>Queries.ts     → gql query documents
          <feature>Mutations.ts   → gql mutation documents
          <feature>Effects.ts     → Side effects (e.g. localStorage, routing)
          <feature>Facade.ts      → Injectable service – orchestrates Apollo + effects
      home/core/            → Home-page feature
      layout/core/          → Header / layout components
      auth/
        core/               → Login UI
        states/             → authMutations, authEffects, authFacade
      servers/
        core/               → Servers UI
        states/             → serversModels, serversQueries, serversMutations, serversFacade
      services/
        core/               → Services status UI (admin only)
          assets/i18n/de.json
          src/lib/components/pages/
            services-page/  → page component
            service-card/   → card sub-component
        states/             → servicesModels, servicesQueries, servicesFacade
    shared/
      assets/               → Icons, global i18n translations
      interactive-background/ → Animated CSS background component
      snackbar/             → Snackbar component + service
  assets/i18n/              → Global translation files (de.json)
docs/                       → Build output (deployed to GitHub Pages)
  browser/                  → Pre-rendered static HTML + JS bundles
```

## Project Tech Stack
* **Framework**: Angular 20 (Standalone Components)
* **Language**: TypeScript ~5.9
* **Monorepo**: Nx 22.6 with feature libraries
* **Build**: Angular CLI + esbuild (Vite-based)
* **Rendering**: SSG – pre-rendered static site
* **i18n**: @jsverse/transloco (language: de)
    * ALWAYS use transloco for ALL UI strings
    * Feature-specific translations in `features/<feature>/core/assets/i18n/de.json`
    * ALWAYS add an asset mapping in `angular.json` for each feature scope:
        ```json
        { "glob": "**/*", "input": "src/app/features/<feature>/core/assets/i18n", "output": "i18n/<feature>" }
        ```
    * de.json structure: do NOT repeat the scope name as a top-level key — transloco auto-prefixes it
        * ✅ `{ "page": { "title": "..." } }` with scope `'myFeature'` → key = `myFeature.page.title`
        * ❌ `{ "myFeature": { "page": { "title": "..." } } }` → breaks (double prefix)
    * USAGE:
        * Component: `providers: [{ provide: TRANSLOCO_SCOPE, useValue: 'featureName' }]`
        * Template: `*transloco="let t"` and use full path `t('featureName.key')`
        * TS: `this.transloco.translate('featureName.key')`
        * AVOID: `read` property in `*transloco` (deprecated)
* **Server/Edge**: Hono (lightweight handler)
* **Testing**: Jasmine + Karma
* **Linting/Formatting**: ESLint, Prettier, Husky
* **Hosting**: GitHub Pages (`sergejsaenko.github.io`)
* **No database** – fully static

## My Coding Style
* ES modules (`import/export`), not CommonJS (`require`)
* async/await where possible
* Descriptive variable names (no single letters except loop counters)
* Comment WHY, not WHAT – skip obvious comments
* Error handling that fails with useful messages
* NEVER put styles inline in `.ts` — always separate `.css` file (`styleUrl`)
* NEVER put templates inline in `.ts` for non-trivial components — always separate `.html` file (`templateUrl`)

## Auth & Roles
* `AuthService` (in `auth/states/authFacade.ts`) exposes:
    * `isLoggedIn()` → signal, true if JWT present
    * `isGuest()` → computed, `!isLoggedIn()`
    * `isAdmin()` → computed, `isLoggedIn && role === 'admin'`
* Role decoded from JWT payload on login and restored from localStorage on app start
* No route guards — do inline checks in `ngOnInit`:
    ```typescript
    if (!this.auth.isLoggedIn()) { this.router.navigate(['/login']); return; }
    if (!this.auth.isAdmin())    { this.router.navigate(['/']);      return; }
    ```
* Header nav links for role-restricted pages: wrap with `@if (auth.isAdmin())`

## How I Want You to Work
* Read existing code before changing anything
* Make small, focused changes – not big rewrites
* Run tests/typecheck after changes before saying "done"
* Flag concerns in one line, then proceed unless it's destructive
* Don't add dependencies without asking first

## Communication
* If unsure, say so – don't guess
* Talk like a colleague, not a teacher
* Remove filler words (the, a, an, is, are, etc. where possible)
* No politeness (no "sure", "happy to help", "of course")
* No long explanations unless asked
* When asked explain the "why" not just the "what"
* Use symbols where clear: `→`, `=`, `vs`
* Output in english

## Don't Do This
* Don't over-engineer when simple works
* Don't change code style without a reason
* Don't give long explanations when short ones work
* Don't generate flashy demos that break in production
* Don't assume I need hand-holding – but do explain what's happening
