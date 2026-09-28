# Nebster's Claude Code Plugin

A [Claude Code](https://claude.ai/code) **plugin marketplace** shipping the `nebster` plugin — specialized subagents, skills (slash commands), and output styles (personas). Install once and — with auto-update enabled — Claude Code keeps them up to date from GitHub.

## Install

Add the marketplace and install the plugin:

```
/plugin marketplace add NebsterSK/claude-settings
/plugin install nebster@nebster-claude-settings
```

That's it — the agents, commands, and output styles are now available in every project.

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
| **Fixer** | Applies a single scoped fix from a review finding — edits only the fix's footprint, adds a covering test for behavior fixes, makes no unrelated changes, reports back in one line. Spawned in parallel by the review command. |
| **SEO** | On-page and technical SEO — meta descriptions, keywords, structured data, Core Web Vitals. |

### Skills

Skills are invoked as slash commands namespaced under the plugin name.

| Skill | Purpose |
| --- | --- |
| **`/nebster:review`** | Dispatches the change set to the Reviewer subagent and relays its findings. Fixes them interactively on your own work, or reports read-only on someone else's PR — see [Review modes](#review-modes). |
| **`/nebster:qa`** | Code-style and static-analysis gate. Runs Larastan, Pint, ESLint, and Prettier and fixes every issue they surface. Does **not** run the test suite. Runs in an isolated subagent and only when you invoke it. |

#### Review modes

`/nebster:review` tries the [`gh` CLI](https://cli.github.com/) first to read the PR behind your current branch — title, description, linked issue, and existing review comments — and hands that stated purpose to the Reviewer as a claim to verify against the diff (goal not met, scope creep, undocumented behavior change). No `gh`, or no PR? It says so and reviews the plain `git diff`.

Check the branch out yourself first — the command never runs `gh pr checkout`.

**Fix mode** — your own branch or your own PR. Findings with exactly one obvious fix that restores the code's evident intent (no product-rule, API, schema, or data decision) are auto-fixed in the background at any severity — Medium/Low immediately, Critical/High after a single confirm where you can hold some back. Everything that needs a decision is triaged one finding at a time, uncapped, with accepted fixes applied by background Fixer agents on a shared per-file queue. Closes with scoped tests and a status table.

**Report-only mode** — the PR author isn't you, or you passed `--report-only`. Nothing is edited: no fixers, no commits, no pushes. You get the full report, then an offer to post findings to the PR — you pick which ones, and the payload is shown for confirmation before anything is published. Posts as a plain review comment, never an approval or change request.

Arguments are positional: base branch first, PR second.

```
/nebster:review                       # current branch, auto-detects base and mode
/nebster:review develop               # diff against a specific base
/nebster:review 1234                  # a PR number or URL (base auto-detected)
/nebster:review develop 1234          # both
/nebster:review --report-only         # force read-only on your own work
```

The older `base=develop` / `pr=1234` forms still work.

### Output styles

Personas for the terminal reply only. Pick one with `/output-style`. Both keep Claude's coding instructions intact and stay out of everything that leaves the terminal — code, comments, commits, PR descriptions, docs, tickets. Code, paths, and error messages are never accented or translated.

| Style | Persona |
| --- | --- |
| **Comrade** | Comrade Claude Vladimirowich Claudowich, loyal servant of the Soviet Union. Heavy Russian accent, "we" not "I", bugs are imperialist saboteurs, tests are the five-year plan, git is state ceremony. |
| **Peon** | Orc peon from Warcraft 3. Broken peon English, "Work, work." / "Job's done!", bugs are Alliance scouts in the base, failing tests mean the base is under attack. |

## Repository layout

This repo is both the marketplace and the plugin:

```
claude-settings/
├── .claude-plugin/
│   ├── marketplace.json   # marketplace manifest (lists the plugin)
│   └── plugin.json        # plugin manifest (no version → always latest)
├── agents/                # reviewer, fixer, seo
├── output-styles/         # comrade.md, peon.md
└── skills/                # review/SKILL.md, qa/SKILL.md
```

## Notes

- The Reviewer targets a Laravel backend but stays **framework-agnostic on the frontend** (Vue, Livewire, React).
- PR context and posting findings need the `gh` CLI, authenticated (`gh auth login`). It's optional — without it `/nebster:review` falls back to a plain diff review.
- `/nebster:qa` assumes a Laravel + JS/TS project with `composer larastan`, `composer pint`, `npm run lint`, `npm run prettier`, and `npm run types` scripts. Adjust to match your tooling.
- Validate changes before pushing with `claude plugin validate .`.
