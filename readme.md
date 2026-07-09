# Global Settings & Agents for Claude

Reusable [Claude Code](https://claude.ai/code) configuration — specialized subagents and custom slash commands meant to be copied into your home directory.

## What's inside

Everything lives under `USER_NAME/.claude/` (replace `USER_NAME` with your real system username when installing).

### Agents (`.claude/agents/`)

| Agent | Purpose |
| --- | --- |
| **Reviewer** | Senior code reviewer / quality gatekeeper. Audits security, bugs, tech debt, performance, testing, and accessibility before production. |
| **Fixer** | Applies a single scoped fix from a review finding — edits only the named file, makes no unrelated changes, and reports back in one line. Spawned in parallel by `/review`. |
| **SEO** | On-page and technical SEO — meta descriptions, keywords, structured data, Core Web Vitals. |

### Commands (`.claude/commands/`)

| Command | Purpose |
| --- | --- |
| **`/review`** | Overrides the built-in `/review`. Dispatches the change set to the Reviewer subagent, relays findings, then triages them interactively one finding at a time — applying accepted fixes via background Fixer agents. |
| **`/qa`** | Code-style and static-analysis gate. Runs Larastan, Pint, ESLint, and Prettier and fixes every issue they surface. Does **not** run the test suite. |

## Installation

1. Copy the contents of `USER_NAME/` into your home directory (so agents land in `~/.claude/agents/` and commands in `~/.claude/commands/`).
2. Replace `USER_NAME` in the path with your actual system username.

Once copied, the agents and slash commands are available in every project Claude Code runs in.

## Notes

- The Reviewer targets a Laravel backend but stays **framework-agnostic on the frontend** (Vue, Livewire, React) — no stack-specific assumptions in its checklist.
- `/qa` assumes a Laravel + JS/TS project with `composer larastan`, `composer pint`, `npm run lint`, and `npm run prettier` scripts. Adjust the command to match your project's tooling.
