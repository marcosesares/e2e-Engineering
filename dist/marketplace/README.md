# e2e-engineering — Claude Code marketplace

Standalone Claude Code plugin marketplace hosting the **e2e-engineering** engineering-flow plugin.

## Install

```
/plugin marketplace add <owner>/<repo>
/plugin install e2e-engineering@e2e-engineering
```

`<owner>/<repo>` is the GitHub repo this directory is published to. The first token after `install` is the plugin name; the token after `@` is this marketplace's name (both `e2e-engineering`).

Then in any project: `/e2e-engineering`.

## Layout

```
.claude-plugin/
  marketplace.json                       # marketplace manifest; lists plugins + source paths
plugins/
  e2e-engineering/
    .claude-plugin/
      plugin.json                        # plugin manifest
    skills/
      e2e-engineering/                   # the skill (SKILL.md + sub-skills + schemas + constitution)
```

Add more plugins by dropping them under `plugins/<name>/` and appending an entry to `marketplace.json`.

## Source

The skill is generated from the canonical source at `.claude/skills/e2e-engineering/` in the [e2e-engineering](https://www.npmjs.com/package/e2e-engineering) project via `npm run build`. Do not hand-edit `skills/` here — edit canonical and rebuild.

## Other install paths

- **npm / npx** (any agent): `npx e2e-engineering init`
- **Codex / OpenCode / Cursor**: portable `AGENTS.md` variant (sequential) — see the npm package.

MIT.
