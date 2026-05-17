# Relatório de Confiança — Specify CLI

> Gerado pelo Revisor em 2026-05-16
> Doc level: **completo**
> Revisão cruzada via Codex: **não realizada** (plugin não disponível nesta sessão)

---

## Resumo Geral

Estimativa agregada de afirmações classificadas nas specs (`requirements.md`, `design.md`, `tasks.md` × 9 units + globais):

| Nível | Quantidade aproximada | Percentual |
|-------|----------------------|------------|
| 🟢 CONFIRMADO | 178 | 64% |
| 🟡 INFERIDO   | 70  | 25% |
| 🔴 LACUNA     | 30  | 11% |
| **Total**     | 278 | 100% |

**Confiança geral:** **76.5%** = (178 + 70×0.5) / 278

---

## Por Unit

| Unit | 🟢 | 🟡 | 🔴 | Confiança | Observações |
|------|----|----|-----|-----------|-------------|
| `init` | 22 | 9 | 5 | 73% | Linhas de origem batem; lacunas em hooks/preset rollback |
| `extension` | 24 | 8 | 4 | 78% | LOC subestimado (2500 vs 2993 real); ConfigManager/HookExecutor confirmados |
| `preset` | 30 | 10 | 4 | 79% | Estrutura de classes 100% verificada (5/5); composição wrap sem regras claras |
| `integration` | 18 | 12 | 4 | 71% | `YamlIntegration` ausente nas specs (4ª subclass real) |
| `workflow` | 12 | 9 | 3 | 69% | Paths de step/registry **fictícios** (G-03); estrutura folder-per-step real |
| `agent` | 10 | 9 | 2 | 67% | LOC `agents.py:550-900` ultrapassa fim do arquivo (846) |
| `catalog` | 14 | 8 | 2 | 75% | Multi-catalog merge claro; WorkflowCatalog não verificada |
| `authentication` | 10 | 4 | 6 | 67% | **Nomes de classe errados** (G-01): `GitHubAuth` no código vs `GitHubAuthProvider` nas specs |
| `shared_infra` | 14 | 7 | 2 | 78% | `core_pack/` localização precisa de nuance wheel vs source (G-06) |
| Globais (architecture/domain/code-analysis/traceability/openapi/user-stories) | 24 | 4 | 8 | 73% | **OpenAPI fictício** (G-02); code-spec-matrix referencia `integrations.py` inexistente (G-04) |

---

## Lacunas Pendentes 🔴

Itens que permaneceram sem confirmação após a revisão. Detalhes em `_reversa_sdd/gaps.md` e perguntas em `_reversa_sdd/questions.md`.

### Bloqueadores (5)
- **G-01** Nomes de classes auth divergentes — `authentication/{requirements,design,tasks}.md`
- **G-02** OpenAPI sem servidor HTTP — `openapi/specify-cli.yaml`
- **G-03** Paths inexistentes em workflow specs — `workflow/{design,tasks}.md`
- **G-04** `integrations.py` arquivo único fictício — `traceability/code-spec-matrix.md`
- **G-05** Hook dispatcher CLI events não localizado — `extension/{design,tasks}.md`

### Moderados (10)
- G-06 a G-15 (ver `gaps.md`).

### Cosméticos (5)
- G-16 a G-20 (ver `gaps.md`).

---

## Histórico de Reclassificações

| De | Para | Afirmação | Evidência |
|----|------|-----------|-----------|
| 🟢 | 🔴 | `GitHubAuthProvider` em `authentication/github.py` | Real: `class GitHubAuth(AuthProvider)` em `github.py:8` |
| 🟢 | 🔴 | `AzureDevOpsAuthProvider` em `azure_devops.py` | Real: `class AzureDevOpsAuth(AuthProvider)` em `azure_devops.py:20` |
| 🟢 | 🔴 | `HttpBasicAuthProvider` em `http.py` | http.py só tem `_StripAuthOnRedirect`. Classe não existe |
| 🟢 | 🔴 | `GenericBearerAuthProvider` em `generic.py` | Arquivo `authentication/generic.py` não existe |
| 🟢 | 🔴 | OpenAPI HTTP endpoints | `architecture.md §6` contradiz: "CLI-only, no HTTP APIs" |
| 🟢 | 🔴 | `workflows/registry.py` | Arquivo não existe |
| 🟢 | 🔴 | `workflows/steps/command.py` (e demais .py) | Estrutura real: folder-per-step (`steps/<name>/__init__.py`) |
| 🟢 | 🔴 | `integrations.py:1–500` em code-spec-matrix | Real: `integrations/__init__.py` (pacote, não módulo) |
| 🟢 | 🟡 | `core_pack/` em `src/specify_cli/core_pack/` | Real: wheel-only; source-checkout cai pra raiz |
| 🟢 | 🟡 | `.specify/init.json` | Real: `.specify/init-options.json` (constante `INIT_OPTIONS_FILE`) |
| 🟡 | 🟢 | `INTEGRATION_REGISTRY` populado por 30 agents | Confirmado: 30 subpastas em `integrations/` + grep direto em `__init__.py:16` |
| 🟡 | 🟢 | `DEFAULT_INIT_INTEGRATION = "copilot"` | Confirmado em `__init__.py:112` |
| 🟡 | 🟢 | `MarkdownIntegration`, `TomlIntegration`, `SkillsIntegration` existem | Confirmado em `integrations/base.py:833, 919, 1332` |
| 🟡 | 🟢 | `ConfigManager` e `HookExecutor` em extensions.py | Confirmado em `extensions.py:2206, 2405` |
| 🟢 | 🟡 | extension.py "~2500 LOC, 7 classes" | LOC real: 2993. Classes corretas. |
| 🟢 | 🟡 | `agents.py:550-900` (agent/design.md) | Arquivo só tem 846 linhas; estimativas extrapolam |

**Total reclassificado:** 16 itens. Reclassificações 🟢→🔴 dominam (8) — indica que ciclo do Writer/Architect inferiu paths e nomes sem verificar contra árvore real.

---

## Revisão Cruzada

- Engine externa consultada: **nenhuma** (Codex plugin ausente nesta sessão)
- Apontamentos recebidos: 0
- Aceitos: 0 | Rejeitados: 0 | Pendentes: 0

> Para próxima execução do Revisor, considerar habilitar plugin Codex (`/codex`) e aceitar revisão cruzada quando `doc_level=completo`. Reduz risco de erros de path/nome de classe.

---

## Recomendações

- [ ] **Authentication** (`authentication/*`) tem 6 lacunas 🔴 — priorizar G-01: validar com usuário se Provider classes são planejadas ou se specs devem usar nomes reais.
- [ ] **Workflow** specs (`workflow/{design,tasks}.md` + code-spec-matrix linhas 60–69) precisam refazer paths para estrutura folder-per-step (G-03).
- [ ] **OpenAPI** (`openapi/specify-cli.yaml`) — decidir: apagar ou converter para schema de comandos CLI (G-02).
- [ ] **code-spec-matrix.md** — após responder G-04 e G-13, refazer matrix com paths reais.
- [ ] **Concorrência** (G-11) e **escaping** (G-12) — documentar como boundaries explícitas se não houver implementação prevista.
- [ ] Em próxima re-extração, atualizar `extension/design.md` rodapé (LOC 2993, não ~2500) e `agent/design.md` line refs (cap em 846).

---

## Próximos Passos

1. Usuário responde `_reversa_sdd/questions.md` (15 perguntas, foco em G-01 a G-05).
2. Revisor processa respostas: atualiza specs in-place, reclassifica, atualiza histórico aqui.
3. Itens sem resposta permanecem em `gaps.md` para próximo ciclo.
4. Ciclo forward (`/reversa-forward`) já pode iniciar com features que NÃO toquem áreas em G-01 a G-05.
