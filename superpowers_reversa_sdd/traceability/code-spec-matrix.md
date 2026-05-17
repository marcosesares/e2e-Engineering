# Code / Spec Matrix

> Mapping between legacy files and generated SDD units. Coverage uses 🟢 for directly covered behavior, 🟡 for partial or inferred coverage, and `n/a` for files not represented as a feature unit.

## Summary

| Metric | Value | Confidence |
|--------|-------|------------|
| Spec organization | Feature folders | 🟢 |
| Feature units generated | 16 | 🟢 |
| Canonical unit artifacts generated | 48 | 🟢 |
| External API specs generated | 0; no HTTP/RPC API detected | 🟢 |
| User-story globals generated | 0; skills are process workflows rather than end-user application flows | 🟡 |
| Estimated legacy behavior coverage | ~90% of skill workflow behavior | 🟡 |

## Matrix

| Legacy file | Unit corresponding | Coverage |
|-------------|-------------------|----------|
| `skills/brainstorming/SKILL.md` | `brainstorming/` | 🟢 |
| `skills/brainstorming/spec-document-reviewer-prompt.md` | `brainstorming/` | 🟢 |
| `skills/brainstorming/visual-companion.md` | `brainstorming/` | 🟢 |
| `skills/brainstorming/scripts/frame-template.html` | `brainstorming/` | 🟡 |
| `skills/brainstorming/scripts/helper.js` | `brainstorming/` | 🟡 |
| `skills/brainstorming/scripts/server.cjs` | `brainstorming/` | 🟡 |
| `skills/brainstorming/scripts/start-server.sh` | `brainstorming/` | 🟡 |
| `skills/brainstorming/scripts/stop-server.sh` | `brainstorming/` | 🟡 |
| `skills/cavecrew/SKILL.md` | `cavecrew/` | 🟢 |
| `skills/caveman/SKILL.md` | `caveman/` | 🟢 |
| `skills/caveman-commit/SKILL.md` | `caveman/` | 🟡 |
| `skills/caveman-compress/SKILL.md` | `caveman/` | 🟡 |
| `skills/caveman-help/SKILL.md` | `caveman/` | 🟡 |
| `skills/caveman-review/SKILL.md` | `caveman/` | 🟡 |
| `skills/caveman-stats/SKILL.md` | `caveman/` | 🟡 |
| `skills/dispatching-parallel-agents/SKILL.md` | `dispatching-parallel-agents/` | 🟢 |
| `skills/executing-plans/SKILL.md` | `executing-plans/` | 🟢 |
| `skills/finishing-a-development-branch/SKILL.md` | `finishing-a-development-branch/` | 🟢 |
| `skills/receiving-code-review/SKILL.md` | `receiving-code-review/` | 🟢 |
| `skills/requesting-code-review/SKILL.md` | `requesting-code-review/` | 🟢 |
| `skills/requesting-code-review/code-reviewer.md` | `requesting-code-review/` | 🟢 |
| `skills/subagent-driven-development/SKILL.md` | `subagent-driven-development/` | 🟢 |
| `skills/subagent-driven-development/implementer-prompt.md` | `subagent-driven-development/` | 🟢 |
| `skills/subagent-driven-development/spec-reviewer-prompt.md` | `subagent-driven-development/` | 🟢 |
| `skills/subagent-driven-development/code-quality-reviewer-prompt.md` | `subagent-driven-development/` | 🟢 |
| `skills/systematic-debugging/SKILL.md` | `systematic-debugging/` | 🟢 |
| `skills/systematic-debugging/root-cause-tracing.md` | `systematic-debugging/` | 🟢 |
| `skills/systematic-debugging/defense-in-depth.md` | `systematic-debugging/` | 🟢 |
| `skills/systematic-debugging/condition-based-waiting.md` | `systematic-debugging/` | 🟢 |
| `skills/systematic-debugging/condition-based-waiting-example.ts` | `systematic-debugging/` | 🟡 |
| `skills/systematic-debugging/find-polluter.sh` | `systematic-debugging/` | 🟡 |
| `skills/systematic-debugging/CREATION-LOG.md` | `systematic-debugging/` | 🟡 |
| `skills/systematic-debugging/test-academic.md` | `systematic-debugging/` | 🟡 |
| `skills/systematic-debugging/test-pressure-1.md` | `systematic-debugging/` | 🟡 |
| `skills/systematic-debugging/test-pressure-2.md` | `systematic-debugging/` | 🟡 |
| `skills/systematic-debugging/test-pressure-3.md` | `systematic-debugging/` | 🟡 |
| `skills/test-driven-development/SKILL.md` | `test-driven-development/` | 🟢 |
| `skills/test-driven-development/testing-anti-patterns.md` | `test-driven-development/` | 🟢 |
| `skills/using-git-worktrees/SKILL.md` | `using-git-worktrees/` | 🟢 |
| `skills/using-superpowers/SKILL.md` | `using-superpowers/` | 🟢 |
| `skills/using-superpowers/references/codex-tools.md` | `using-superpowers/` | 🟡 |
| `skills/using-superpowers/references/copilot-tools.md` | `using-superpowers/` | 🟡 |
| `skills/using-superpowers/references/gemini-tools.md` | `using-superpowers/` | 🟡 |
| `skills/verification-before-completion/SKILL.md` | `verification-before-completion/` | 🟢 |
| `skills/writing-plans/SKILL.md` | `writing-plans/` | 🟢 |
| `skills/writing-plans/plan-document-reviewer-prompt.md` | `writing-plans/` | 🟢 |
| `skills/writing-skills/SKILL.md` | `writing-skills/` | 🟢 |
| `skills/writing-skills/anthropic-best-practices.md` | `writing-skills/` | 🟡 |
| `skills/writing-skills/testing-skills-with-subagents.md` | `writing-skills/` | 🟡 |
| `skills/writing-skills/persuasion-principles.md` | `writing-skills/` | 🟡 |
| `skills/writing-skills/graphviz-conventions.dot` | `writing-skills/` | 🟡 |
| `skills/writing-skills/render-graphs.js` | `writing-skills/` | 🟡 |
| `skills/writing-skills/examples/CLAUDE_MD_TESTING.md` | `writing-skills/` | 🟡 |
| `.claude-plugin/plugin.json` | Global plugin packaging | n/a |
| `.claude-plugin/marketplace.json` | Global plugin packaging | n/a |
| `.codex-plugin/plugin.json` | Global plugin packaging | n/a |
| `.cursor-plugin/plugin.json` | Global plugin packaging | n/a |
| `.opencode/config.json` | Global plugin packaging | n/a |
| `.opencode/plugins/superpowers.js` | Global OpenCode integration | n/a |
| `.opencode/INSTALL.md` | Global installation documentation | n/a |
| `gemini-extension.json` | Global Gemini integration | n/a |
| `package.json` | Global package metadata | n/a |

## Uncovered / Partially Covered Areas

- 🟡 Harness packaging files are documented in architecture and deployment artifacts, but not as feature-level SDD units because the selected organization is feature-based by skill workflow.
- 🟡 Supporting examples and scripts are mapped to their owning feature units, but detailed line-by-line reconstruction would require optional `legacy-mapping.md` artifacts per unit.
- 🟢 No database schema, HTTP endpoint layer, or OpenAPI surface was detected in the legacy project.
