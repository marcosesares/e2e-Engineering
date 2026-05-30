# Gaps — andrej-karpathy-skills

> Gerado pelo Revisor em 2026-05-15
> Lacunas que permanecem sem resposta após a revisão, categorizadas por severidade.
> Atualizado após validação do usuário.

---

## Crítico

Lacunas que bloqueiam reimplementação correta ou introduzem risco de regressão.

### G-01 — Limite de perguntas de esclarecimento indefinido (`think-before-coding`)
- **Risco:** Loop de cascata de esclarecimentos impede que qualquer código seja produzido.
- **Pergunta correspondente:** `questions.md#pergunta-6`
- **Status:** 🟢 Resolvido — veja spec atualizada.

### G-02 — Escopo de orphan cleanup cross-file indefinido (`surgical-changes`)
- **Risco:** Remoção de símbolo usado em outro arquivo introduz erro de runtime em módulo não relacionado.
- **Pergunta correspondente:** `questions.md#pergunta-9`
- **Status:** 🟢 Resolvido — veja spec atualizada.

### G-03 — Condição de escape do loop de verificação ausente (`goal-driven-execution`)
- **Risco:** Loop infinito com mudanças especulativas crescentes fora do escopo original.
- **Pergunta correspondente:** `questions.md#pergunta-11`
- **Status:** 🟢 Resolvido — veja spec atualizada.

### G-04 — Checks de verificação não-executáveis sem tratamento (`goal-driven-execution`)
- **Risco:** LLM pula checks não-automatizáveis (falso sucesso) ou bloqueia aguardando resposta que nunca chega.
- **Pergunta correspondente:** `questions.md#pergunta-12`
- **Status:** 🟢 Resolvido — veja spec atualizada.

---

## Moderado

Lacunas que não bloqueiam a reimplementação mas geram inconsistência comportamental entre LLMs.

### G-05 — "Tarefa trivial" não tem definição formal (`karpathy-guidelines`)
- **Risco:** Diferentes LLMs aplicam o rigor completo a um typo fix ou ignoram-no em um refactor complexo.
- **Pergunta correspondente:** `questions.md#pergunta-1`
- **Status:** 🟢 Resolvido — veja spec atualizada.

### G-06 — Política de versionamento de regras ausente (`karpathy-guidelines`)
- **Risco:** Mudanças em BRs chegam silenciosamente a plugin users; CLAUDE.md users ficam desatualizados sem aviso.
- **Pergunta correspondente:** `questions.md#pergunta-2`
- **Status:** 🟢 Resolvido — veja spec atualizada.

### G-07 — Override "não pergunte, só implemente" não tem tratamento (`think-before-coding`)
- **Risco:** Instrução conflitante entre skill (ask first) e usuário (just go). Cada LLM resolve à sua maneira.
- **Pergunta correspondente:** `questions.md#pergunta-5`
- **Status:** 🟢 Resolvido — veja spec atualizada.

### G-08 — "Cenário impossível" não tem definição formal para BR-08 (`simplicity-first`)
- **Risco:** LLM omite error handling para estados alcançáveis ou adiciona guards desnecessários.
- **Pergunta correspondente:** `questions.md#pergunta-7`
- **Status:** 🟢 Resolvido — veja spec atualizada.

### G-09 — Como tratar helper compartilhado que afeta callers fora do request (`surgical-changes`)
- **Risco:** LLM quebra callers existentes ao modificar helper, ou recusa-se a fazer mudança necessária.
- **Pergunta correspondente:** `questions.md#pergunta-10`
- **Status:** 🟢 Resolvido — veja spec atualizada.

---

## Cosmético

Lacunas de qualidade que não afetam comportamento mas reduzem clareza da documentação.

### G-10 — Referências de linha do SKILL.md incorretas em todos os units (offset +6)
- **Causa:** YAML frontmatter (linhas 1–6) adicionado por ADR-003 não foi contabilizado pelo Writer.
- **Efeito:** Toda referência `SKILL.md:N` nos units aponta para linha errada no arquivo atual. Conteúdo correto, número errado.
- **Ação sugerida:** Atualizar todas as referências de linha adicionando 6 ao número citado (ex: `SKILL.md:8` → `SKILL.md:14`).
- **Status:** 🟡 Sem bloqueio — conteúdo das regras está correto

### G-11 — CLAUDE.md descrito como "mirror puro" do SKILL.md
- **Causa:** CLAUDE.md agora contém a seção do framework Reversa (linhas 68+) além do conteúdo do SKILL.md.
- **Efeito:** A afirmação "CLAUDE.md mirrors SKILL.md" é parcialmente imprecisa.
- **Ação sugerida:** Reclassificado para 🟡 no code-spec-matrix.md. Requisito RF-06 permanece válido para o conteúdo comportamental.
- **Status:** 🟡 Reclassificado [Revisão realizada]

### G-12 — Headings "Fluxos Alternativos" em português nos design.md (doc_language=English)
- **Causa:** Writer gerou seção em português em 5 design.md files.
- **Ação:** Corrigido para "Alternative Flows" pelo Revisor [Revisão realizada].
- **Status:** 🟢 Corrigido

### G-13 — Harness de conformidade ausente
- **Risco:** Não há como verificar que a skill produz comportamento diferente (melhor) quando instalada.
- **Pergunta correspondente:** `questions.md#pergunta-3`
- **Status:** 🟢 Resolvido — veja spec atualizada.

### G-14 — Política de sync para SKILL.zh.md ausente
- **Causa:** Tradução foi contribuição pontual sem owner ou processo de manutenção.
- **Pergunta correspondente:** `questions.md#pergunta-4`
- **Status:** 🟢 Resolvido — veja spec atualizada. (upgrade 🟡→🔴)

### G-15 — Ratio 4× do BR-09 é heurística sem threshold definido
- **Pergunta correspondente:** `questions.md#pergunta-8`
- **Status:** 🟢 Resolvido — veja spec atualizada.
