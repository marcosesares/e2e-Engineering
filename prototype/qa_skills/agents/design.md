# Agents, Design Técnico

---

## Interface

| Agent | Input | Output | Tools (frontmatter) | Model |
|-------|-------|--------|---------------------|-------|
| **qa-investigate** | Jira brief path, task description, output path | investigation.md (written via `Bash` → `Out-File`/`Set-Content`, since `Write` is **not** in frontmatter) | `Read, Glob, Grep, Bash` | Sonnet |
| **qa-implement** | Plan path, investigation path, Jira brief path | Summary of changes | `Read, Write, Edit, Glob, Grep, Bash` | Sonnet |

**Read-only enforcement for `qa-investigate` (two layers):**

1. **Tool-whitelist (hard):** frontmatter omits `Write`, `Edit`, `NotebookEdit` — those tools are not callable.
2. **Prompt policy (soft):** SKILL.md body says *"Read-only. You MUST NOT edit, write, or delete any project files."*

**Escape hatch:** `Bash` is granted, so the agent can theoretically mutate files via shell redirects (`echo >`, `Out-File`, `cp`, `rm`). The investigation-brief output is itself written through `Bash`. Read-only is therefore **not enforceable** by tool granting alone; it relies on the prompt policy + the orchestrator's expectation that only `investigation.md` is touched.

**Known defect (`agents/edge-cases.md` will capture):** `qa-investigate.md` body cites "the Write tool" although Write is not in the tools frontmatter — a wording inconsistency. The output mechanism is `Bash`-based file write.

---

## Fluxo Principal

### qa-investigate

1. Load repo-context (naming conventions, helpers, structure)
2. Read Jira brief (issue type, summary, description)
3. Locate relevant files (Glob, Grep by patterns)
4. Read and trace execution flow
5. Identify issue (bug root cause or story context)
6. Check git history (recent commits)
7. Write investigation.md to output path
8. Return summary

**Key constraint:** Read-only; write only investigation.md.

### qa-implement

1. Read approved plan
2. Read investigation brief
3. Read Jira brief
4. Locate target files
5. Execute code changes (respecting scope)
6. Run tests if plan includes it
7. Return summary (files changed, tests results)

**Key constraint:** Edit only files in approved plan.

---

## Dependências

- repo-context Skill (project conventions)
- principles Skill (QA automation rules)
- Bash tool (run tests, git commands)

---

## Riscos e Lacunas

- 🔴 Performance on large codebases (>10k files) not measured
- 🟡 Error handling if investigation finds no relevant files
- 🟡 What happens if qa-implement detects unrelated code violations?
