# Agents, Casos Extremos

- **Case 1:** qa-investigate finds no relevant files → error or default guidance? 🔴
- **Case 2:** Large codebase (>10k files) → performance not measured 🔴
- **Case 3:** qa-implement detects code pattern violations → what does it do? 🟡
- **Case 4:** Plan scope and actual files don't match → does agent error or guess? 🟡
- **Case 5:** Read-only enforcement contradiction in `qa-investigate.md`: frontmatter `tools: Read, Glob, Grep, Bash` omits `Write`, yet body prose says *"Write tool is ONLY for writing your investigation brief to the output file."* The Write tool is not granted; the brief is actually written via `Bash` (`Out-File` / `Set-Content`). 🟢 (defect documented; behavior consistent in practice). Recommendation: update SKILL.md body to reference Bash file write, not the Write tool. |
