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
    features/
      home/core/      → Home-page feature library
      layout/core/    → Header / layout components
    shared/
      assets/         → Icons, i18n translations
      components/     → Shared standalone components
  assets/i18n/        → Global translation files (de.json)
docs/                 → Build output (deployed to GitHub Pages)
  browser/            → Pre-rendered static HTML + JS bundles
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
    * USAGE:
        * Component: `provide: TRANSLOCO_SCOPE, useValue: 'featureName'`
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
