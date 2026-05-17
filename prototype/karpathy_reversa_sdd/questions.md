# Perguntas para Validação — andrej-karpathy-skills

> Gerado pelo Revisor em 2026-05-15
> Consolidação de todas as lacunas 🔴 encontradas na revisão.
> Responda cada pergunta e me avise quando terminar.

---

## Pergunta 1 — O que conta como "tarefa trivial"? 🔴

**Contexto:** `SKILL.md:preamble`; `domain.md` — Glossary "Trivial task"
**Spec afetada:** [`_reversa_sdd/karpathy-guidelines/requirements.md`]
**Pergunta:** A nota de tradeoff delega o julgamento de "tarefa trivial" inteiramente ao LLM sem heurísticas. Isso significa que LLMs diferentes (ou versões diferentes do mesmo LLM) podem aplicar o rigor completo a uma correção de typo, ou ignorá-lo completamente em um refactor complexo. Deve-se adicionar uma heurística formal? Candidato: "trivial = arquivo único, ≤ 5 linhas alteradas, sem lógica condicional."
**Impacto:** Se sim, a heurística entra no preamble do SKILL.md. Isso tornaria BR-21 mais previsível entre diferentes LLMs.

**Resposta:** ✅ Respondida — veja atualização na spec correspondente.

---

## Pergunta 2 — Qual é a política de versionamento para mudanças nas regras? 🔴

**Contexto:** `code-analysis.md:L-02`; backlog de ADRs
**Spec afetada:** [`_reversa_sdd/karpathy-guidelines/tasks.md`]
**Pergunta:** Não existe política de semver. Se BR-11 for reforçado em um commit futuro, não há mecanismo para comunicar a mudança comportamental aos usuários. Deve o conteúdo da skill seguir semver? Quem decide o que constitui uma breaking change em uma regra comportamental?
**Impacto:** Se sim, um cabeçalho de versão entra no SKILL.md e uma política de contribuição precisa ser documentada. Se não, registrar explicitamente que mudanças são feitas sem aviso de versão.

**Resposta:** ✅ Respondida — veja atualização na spec correspondente.

---

## Pergunta 3 — Existe um plano para um harness de conformidade? 🔴

**Contexto:** `code-analysis.md:L-03`
**Spec afetada:** [`_reversa_sdd/karpathy-guidelines/requirements.md`]
**Pergunta:** Não há como verificar que um LLM com a skill instalada produz outputs diferentes (melhores) do que sem ela. Nenhum benchmark, eval suite ou conjunto de testes antes/depois existe. Está planejado um benchmark? Mesmo um pequeno conjunto de exemplos de "comportamento LLM ruim" e outputs corrigidos tornaria a conformidade verificável.
**Impacto:** Cria TT-03 e TT-04 como testes reais, não apenas manuais. Fecha a lacuna L-03.

**Resposta:** ✅ Respondida — veja atualização na spec correspondente.

---

## Pergunta 4 — Como SKILL.zh.md deve se manter sincronizado com SKILL.md? 🔴

**Contexto:** `code-analysis.md:L-04`; ADR-008; commit `54a3028`
**Spec afetada:** [`_reversa_sdd/karpathy-guidelines/requirements.md:RF-08`]
**Pergunta:** A tradução em chinês foi uma contribuição pontual da comunidade. Não existe processo de sincronização contínua, nenhum CI check, nenhum owner declarado. A tradução é considerada oficialmente suportada? Se sim, quem é responsável por sincronizá-la quando SKILL.md muda? Deve haver um CI check que imponha equivalência estrutural (número de princípios, número de regras por princípio)?
**Impacto:** Define se RF-08 é Must ou Should, e se TT-05 vira um teste automático ou permanece manual.

**Resposta:** ✅ Respondida — veja atualização na spec correspondente.

---

## Pergunta 5 — Como o LLM deve tratar o override "não pergunte, só implemente"? 🔴

**Contexto:** `think-before-coding/design.md:Alternative Flows`; `edge-cases.md:EC-01`
**Spec afetada:** [`_reversa_sdd/think-before-coding/design.md`]
**Pergunta:** BR-01 e BR-04 exigem perguntar antes de codar. Se o usuário diz explicitamente "não faça perguntas, implemente logo", o LLM recebe instruções conflitantes. O override deve ser: (a) honrado silenciosamente, (b) honrado com um breve reconhecimento das premissas adotadas, ou (c) ignorado (a skill prevalece)?
**Impacto:** Determina se um campo de comportamento de override precisa ser adicionado ao SKILL.md. Sem isso, diferentes LLMs se comportarão de forma inconsistente nesse cenário.

**Resposta:** ✅ Respondida — veja atualização na spec correspondente.

---

## Pergunta 6 — Deve haver um limite máximo de perguntas por interação? 🔴

**Contexto:** `think-before-coding/design.md:Design Decisions`; `edge-cases.md:EC-04`
**Spec afetada:** [`_reversa_sdd/think-before-coding/design.md`]
**Pergunta:** A skill não define um cap para perguntas de esclarecimento por interação. Isso pode gerar um loop de cascata onde cada resposta gera uma nova pergunta. Deve haver um limite (ex: máximo 3 perguntas antes de o LLM assumir as premissas mais prováveis e prosseguir)?
**Impacto:** Se sim, o número e o comportamento de fallback ("vou assumir X e prosseguir") precisam ser adicionados ao texto do SKILL.md.

**Resposta:** ✅ Respondida — veja atualização na spec correspondente.

---

## Pergunta 7 — O que conta como "cenário impossível" para BR-08? 🔴

**Contexto:** `SKILL.md:19`; `domain.md:D-04`
**Spec afetada:** [`_reversa_sdd/simplicity-first/requirements.md:RF-04`]
**Pergunta:** BR-08 proíbe error handling para cenários impossíveis, mas "impossível" não está definido. O LLM deve inferir isso com base: (a) no contrato declarado da função (pré-condições que o caller garante) — determinável a partir do código local; ou (b) no estado de todo o sistema — requer conhecimento global que o LLM raramente tem?
**Impacto:** A opção (a) é segura e aplicável localmente. A opção (b) é mais poderosa mas arriscada. Clarificar isso remove a lacuna L-04 e torna BR-08 consistentemente aplicável.

**Resposta:** ✅ Respondida — veja atualização na spec correspondente.

---

## Pergunta 8 — O ratio 4× de BR-09 é um threshold rígido ou ponto de partida? 🔴

**Contexto:** `SKILL.md:20`
**Spec afetada:** [`_reversa_sdd/simplicity-first/requirements.md:RF-05`]
**Pergunta:** A regra usa "200 linhas que poderiam ser 50" como ilustração, implicando ratio 4:1. Mas não está claro se 3:1 ou 2:1 também devem acionar um rewrite. O ratio 4× é o threshold intencional, ou qualquer implementação que tenha uma solução mais simples óbvia (independente do ratio) deve ser reescrita?
**Impacto:** Esclarece RF-05 e o critério de aceitação de TT-05. Afeta consistência de aplicação entre diferentes LLMs.

**Resposta:** ✅ Respondida — veja atualização na spec correspondente.

---

## Pergunta 9 — BR-15 deve verificar uso cross-file antes de remover um símbolo? 🔴

**Contexto:** `surgical-changes/design.md:Alternative Flows`; `edge-cases.md:EC-01`
**Spec afetada:** [`_reversa_sdd/surgical-changes/requirements.md:RF-05`]
**Pergunta:** BR-15 diz remover símbolos que SUAS mudanças tornaram não-usados. Atualmente isso é interpretado como "não-usado no arquivo atual." Se o LLM remover uma função que parece não-usada localmente mas é importada por outro arquivo, introduz um erro de runtime. Deve BR-15 ser escopo "símbolos não-usados no arquivo atual E confirmados não-usados em toda a codebase"? E se o uso cross-file não puder ser confirmado, o LLM deve mencionar o potencial orphan em vez de deletar?
**Impacto:** Adiciona uma sentença ao SKILL.md e muda o critério de teste de RF-05. Sem isso, há risco real de regressão quando o orphan cleanup atravessa fronteiras de módulo.

**Resposta:** ✅ Respondida — veja atualização na spec correspondente.

---

## Pergunta 10 — Como tratar um helper compartilhado que precisa mudar e afeta callers fora do request? 🔴

**Contexto:** `surgical-changes/edge-cases.md:EC-05`
**Spec afetada:** [`_reversa_sdd/surgical-changes/design.md`]
**Pergunta:** Se uma mudança requerida afeta uma função helper compartilhada, o LLM enfrenta um dilema: BR-12 diz não tocar código fora do request, mas se a assinatura do helper mudar, todos os callers precisam ser atualizados ou quebram. Deve o LLM: (a) atualizar só o helper e notar que os callers precisam de revisão manual, (b) atualizar helper + callers que quebrariam (obrigatório, não opcional), ou (c) recusar-se a mudar o helper e sugerir que o usuário amplie o escopo do request?
**Impacto:** Define qual comportamento codificar no SKILL.md para esse edge case. Atualmente não há orientação, deixando LLMs tomarem decisões inconsistentes.

**Resposta:** ✅ Respondida — veja atualização na spec correspondente.

---

## Pergunta 11 — Qual é a condição de escape quando o loop de verificação não converge? 🔴

**Contexto:** `goal-driven-execution/design.md:Alternative Flows`; `edge-cases.md:EC-02`
**Spec afetada:** [`_reversa_sdd/goal-driven-execution/design.md`]
**Pergunta:** BR-20 diz "loop até o check passar." Não existe condição de escape. Se o LLM não consegue encontrar e corrigir a causa raiz, o loop é indefinido, gerando mudanças cada vez mais especulativas. Deve haver uma heurística de escape — ex: "após 3 tentativas de correção falhadas no mesmo check, pare, reporte a falha específica e peça orientação ao usuário"?
**Impacto:** Adicionar uma heurística de escape muda o wording de BR-20 e adiciona uma regra ao texto da skill. Sem isso, o loop pode degradar em especulação com scope creep.

**Resposta:** ✅ Respondida — veja atualização na spec correspondente.

---

## Pergunta 12 — Como o LLM deve tratar checks de verificação que não podem ser executados mecanicamente? 🔴

**Contexto:** `goal-driven-execution/design.md:Alternative Flows`; `edge-cases.md:EC-03`
**Spec afetada:** [`_reversa_sdd/goal-driven-execution/design.md`]
**Pergunta:** BR-20 exige looping até os checks passarem, mas alguns checks não são automatizáveis: "verify: a UI parece correta," "verify: o usuário aprova o resultado," "verify: o deploy tem sucesso no CI." Devem ser designados como "human-gate steps" no plano (ex: `→ verify: [human confirms X]`), com o loop pausando e o LLM informando o usuário o que verificar e como sinalizar conclusão?
**Impacto:** Adiciona uma sub-categoria de verify step ao texto da skill ("human-gate steps") e define o comportamento de pausa. Sem isso, o LLM ou pula checks não-executáveis (falso sucesso) ou aguarda indefinidamente algo que não pode acionar.

**Resposta:** ✅ Respondida — veja atualização na spec correspondente.
