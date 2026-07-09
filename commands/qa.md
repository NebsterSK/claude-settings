---
description: Code-style & static-analysis gate — run Pint, Larastan, ESLint, Prettier and fix everything. Does NOT run tests.
---

Run this project's code-style and static-analysis tools **and fix every issue they surface**. This is the pre-commit quality gate — it does **not** run the test suite (`composer test` is separate).

Run the four tools in this order — **analyze-and-fix, then format, per stack** — so each analyzer's code fixes get formatted by the following formatter (avoids re-running the formatter after fixes):

1. **`composer larastan`** — PHP static analysis (larastan level, committed). Read each reported error and **fix it in the code**; re-run until it reports **0 errors**.
2. **`composer pint`** — PHP formatter; auto-fixes style (incl. the Larastan fixes above). Reformats whole-codebase files, incl. pre-existing ones — that's expected.
3. **`npm run lint`** — ESLint (runs with `--fix`). Fix anything it can't auto-fix (e.g. unused vars, exhaustive-deps); re-run until clean.
4. **`npm run prettier`** — Prettier; formats the JS/TS tree (incl. the ESLint fixes above).

Larastan is style-agnostic, so running it before Pint is safe — its clean result still holds after formatting. Finish by confirming **`npm run types`** is clean.

Rules:
- **Fix the underlying code** — do not silence Larastan/ESLint with `@phpstan-ignore`, eslint-disable, or a baseline unless the user explicitly asks.
- Keep every fix **behavior-preserving**. If a lint/analysis fix would change behavior, stop and flag it instead of applying it.
- Follow the project's `CLAUDE.md` conventions when fixing.
- **Do not commit or push** — leave all changes in the working tree for the user to review.
- Finish with a short summary table: each tool, what it fixed, and its final status.
