# Nebster's Claude Code Plugin

A [Claude Code](https://claude.ai/code) **plugin marketplace** shipping the `nebster` plugin — specialized subagents and slash commands. Install once and Claude Code keeps them up to date from GitHub automatically.

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
| **Reviewer** | Senior code reviewer / quality gatekeeper. Audits security, bugs, tech debt, performance, testing, and accessibility before production. |
| **Fixer** | Applies a single scoped fix from a review finding — edits only the named file, makes no unrelated changes, reports back in one line. Spawned in parallel by the review command. |
| **SEO** | On-page and technical SEO — meta descriptions, keywords, structured data, Core Web Vitals. |

### Commands

Plugin commands are namespaced under the plugin name.

| Command | Purpose |
| --- | --- |
| **`/nebster:review`** | Dispatches the change set to the Reviewer subagent, relays findings, then triages them interactively one finding at a time — applying accepted fixes via background Fixer agents. |
| **`/nebster:qa`** | Code-style and static-analysis gate. Runs Larastan, Pint, ESLint, and Prettier and fixes every issue they surface. Does **not** run the test suite. |

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
- `/nebster:qa` assumes a Laravel + JS/TS project with `composer larastan`, `composer pint`, `npm run lint`, and `npm run prettier` scripts. Adjust to match your tooling.
- Validate changes before pushing with `claude plugin validate .`.
