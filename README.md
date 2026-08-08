# Nebster's Claude Code Plugin

A [Claude Code](https://claude.ai/code) **plugin marketplace** shipping the `nebster` plugin — specialized subagents and slash commands. Install once and — with auto-update enabled — Claude Code keeps them up to date from GitHub.

## Install

Add the marketplace and install the plugin:

```
/plugin marketplace add NebsterSK/claude-settings
/plugin install nebster@nebster-claude-settings
```

That's it — the agents and commands are now available in every project.

### Keep it auto-updating

Third-party marketplaces do **not** auto-update by default. Enable it once so you get new agents/commands on startup:

- **Via UI:** run `/plugin`, open the **Marketplaces** tab, select `nebster-claude-settings`, and enable auto-update.
- **Via managed settings** (`settings.json`):

  ```json
  {
    "extraKnownMarketplaces": {
      "nebster-claude-settings": {
        "source": { "source": "github", "repo": "NebsterSK/claude-settings" },
        "autoUpdate": true
      }
    }
  }
  ```

Because the plugin ships without a pinned version, every push to this repo is treated as a new version — enabled installs pick it up automatically.

## What's inside

### Agents

| Agent | Purpose |
| --- | --- |
| **Reviewer** | Senior code reviewer / quality gatekeeper. Audits security, bugs, tech debt, performance, testing, and accessibility before production — and, on a PR, checks the diff against what the PR says it does. |
| **Fixer** | Applies a single scoped fix from a review finding — edits only the named file, makes no unrelated changes, reports back in one line. Spawned in parallel by the review command. |
| **SEO** | On-page and technical SEO — meta descriptions, keywords, structured data, Core Web Vitals. |

### Commands

Plugin commands are namespaced under the plugin name.

| Command | Purpose |
| --- | --- |
| **`/nebster:review`** | Dispatches the change set to the Reviewer subagent and relays its findings. Fixes them interactively on your own work, or reports read-only on someone else's PR — see [Review modes](#review-modes). |
| **`/nebster:qa`** | Code-style and static-analysis gate. Runs Larastan, Pint, ESLint, and Prettier and fixes every issue they surface. Does **not** run the test suite. |

#### Review modes

`/nebster:review` tries the [`gh` CLI](https://cli.github.com/) first to read the PR behind your current branch — title, description, linked issue, and existing review comments — and hands that stated purpose to the Reviewer as a claim to verify against the diff (goal not met, scope creep, undocumented behavior change). No `gh`, or no PR? It says so and reviews the plain `git diff`.

Check the branch out yourself first — the command never runs `gh pr checkout`.

**Fix mode** — your own branch or your own PR. Auto-fixes the safe Low-severity findings in the background (no sign-off), then triages the rest (Critical/High/Medium, capped at 6) one finding at a time, applying accepted fixes via background Fixer agents on a shared per-file queue. Closes with scoped tests and a status table.

**Report-only mode** — the PR author isn't you, or you passed `--report-only`. Nothing is edited: no fixers, no commits, no pushes. You get the full report, then an offer to post findings to the PR — you pick which ones, and the payload is shown for confirmation before anything is published. Posts as a plain review comment, never an approval or change request.

```
/nebster:review                  # current branch, auto-detects the mode
/nebster:review base=develop     # diff against a specific base
/nebster:review pr=1234          # a PR number, or its URL
/nebster:review --report-only    # force read-only on your own work
```

## Repository layout

This repo is both the marketplace and the plugin:

```
claude-settings/
├── .claude-plugin/
│   ├── marketplace.json   # marketplace manifest (lists the plugin)
│   └── plugin.json        # plugin manifest (no version → always latest)
├── agents/                # reviewer, fixer, seo
└── commands/              # review, qa
```

## Notes

- The Reviewer targets a Laravel backend but stays **framework-agnostic on the frontend** (Vue, Livewire, React).
- PR context and posting findings need the `gh` CLI, authenticated (`gh auth login`). It's optional — without it `/nebster:review` falls back to a plain diff review.
- `/nebster:qa` assumes a Laravel + JS/TS project with `composer larastan`, `composer pint`, `npm run lint`, `npm run prettier`, and `npm run types` scripts. Adjust to match your tooling.
- Validate changes before pushing with `claude plugin validate .`.
