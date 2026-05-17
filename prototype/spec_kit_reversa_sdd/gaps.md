# Lacunas Pendentes — Specify CLI

> Gerado pelo Revisor em 2026-05-16
> Doc level: **completo** — gaps categorizados por severidade.
> Itens 🔴 sem resposta humana permanecem aqui após `questions.md`.

---

## Crítico (bloqueia reimplementação correta)

### G-01 — Nomes de classes auth divergentes
**Localização:** `authentication/{requirements,design,tasks}.md`
**Problema:** Specs citam `GitHubAuthProvider`, `AzureDevOpsAuthProvider`, `HttpBasicAuthProvider`, `GenericBearerAuthProvider`. Código tem `GitHubAuth`, `AzureDevOpsAuth`. `HttpBasic*` e `GenericBearer*` não existem.
**Pergunta:** `questions.md#1`

### G-02 — OpenAPI sem servidor HTTP
**Localização:** `_reversa_sdd/openapi/specify-cli.yaml`
**Problema:** Define endpoints HTTP mas `architecture.md §6` confirma "Specify CLI does not expose HTTP APIs". Spec fictício.
**Pergunta:** `questions.md#2`

### G-03 — Paths inexistentes em workflow specs
**Localização:** `workflow/{design,tasks}.md`, `traceability/code-spec-matrix.md`
**Problema:** Citam `workflows/registry.py`, `workflows/steps/command.py`, `steps/shell.py`, `steps/control.py`, `steps/parallel.py`. Estrutura real é folder-per-step (`steps/<name>/__init__.py`). `registry.py` não existe.
**Pergunta:** `questions.md#3`

### G-04 — code-spec-matrix referencia `integrations.py` como arquivo único
**Localização:** `_reversa_sdd/traceability/code-spec-matrix.md` (linhas 53–55)
**Problema:** Arquivo não existe. `integrations/` é pacote com 30+ subpastas e `__init__.py`, `base.py`, `manifest.py`, `catalog.py`.
**Pergunta:** `questions.md#13`

### G-05 — Hook execution dispatcher localização desconhecida
**Localização:** `extension/{design,tasks}.md`, `agent/tasks.md`, `shared_infra/design.md`
**Problema:** `HookExecutor` existe em `extensions.py:2405`, mas dispatcher de eventos CLI (post-install, pre-build) não encontrado. Specs não sabem se hooks são feature pronta ou planejada.
**Pergunta:** `questions.md#12`

---

## Moderado (afeta clareza, não bloqueia)

### G-06 — `core_pack/` sem dualidade documentada
**Localização:** `shared_infra/design.md`
**Problema:** Documento apresenta `src/specify_cli/core_pack/` como localização canônica. Real: wheel-only; source-checkout usa raiz do repo. `_assets.py:_locate_core_pack()` é o source-of-truth.
**Pergunta:** `questions.md#4`

### G-07 — `init.json` vs `init-options.json`
**Localização:** `init/{design,tasks}.md`
**Problema:** Specs citam `.specify/init.json`. Código: `INIT_OPTIONS_FILE = ".specify/init-options.json"` em `__init__.py:388`.
**Pergunta:** `questions.md#5`

### G-08 — `PresetRegistry.restore()` órfão
**Localização:** `domain.md`, `preset/design.md`
**Problema:** Método existe, caller não localizado. Dead code candidate ou API pública?
**Pergunta:** `questions.md#6`

### G-09 — `YamlIntegration` não documentado
**Localização:** `integration/{requirements,design}.md`, `code-analysis.md`
**Problema:** `base.py:1126` define `YamlIntegration` (4º subclass). Specs só citam 3 (Markdown/TOML/Skills).
**Pergunta:** `questions.md#11`

### G-10 — Composition recursion sem regra
**Localização:** `preset/design.md`, `extension/design.md`
**Problema:** Dois presets wrap-compondo mesmo template = comportamento indefinido. Sem validação no código.
**Pergunta:** `questions.md#7`

### G-11 — Concorrência indefinida
**Localização:** `preset/design.md`, `extension/design.md`, `integration/design.md`
**Problema:** Sem lock/mutex. Multi-process install pode corromper registry/cache.
**Pergunta:** `questions.md#8`

### G-12 — `{CORE_TEMPLATE}` sem escaping
**Localização:** `preset/design.md`
**Problema:** Literal no body do core seria indevidamente substituído.
**Pergunta:** `questions.md#9`

### G-13 — Coexistence validation details
**Localização:** `integration/{requirements,design,tasks}.md`
**Problema:** RF-13 declarado mas regras de coexistência não documentadas. Validação existe no código?
**Pergunta:** `questions.md#10`

### G-14 — Preset fallback chain não verificada
**Localização:** `init/{design,tasks}.md`
**Problema:** Ordem local → bundled → catalog → remote não verificada contra código.
**Pergunta:** `questions.md#15`

### G-15 — Auditoria de redação de credenciais
**Localização:** `architecture.md §10`
**Problema:** Marcado 🟡 "audit needed". Sem owner ou prazo.
**Pergunta:** `questions.md#14`

---

## Cosmético (precisão, não funcionalidade)

### G-16 — `extension/design.md` "~2500 LOC, 7 classes"
**Localização:** `extension/design.md` rodapé
**Problema:** Real: 2993 LOC. 7 classes corretas (ExtensionManifest, ExtensionRegistry, ExtensionManager, CommandRegistrar, ExtensionCatalog, ConfigManager, HookExecutor — todas verificadas).
**Pergunta:** N/A — corrigir LOC para 2993.

### G-17 — Flowcharts incompletos
**Localização:** `_reversa_sdd/flowcharts/`
**Problema:** Existem apenas 3 (`extension.md`, `init.md`, `preset.md`). Outros 6 módulos (integration, workflow, agent, catalog, authentication, shared_infra) sem flowchart.
**Pergunta:** N/A — opcional para doc_level=completo. Considerar gerar para enterprise.

### G-18 — Workflow `WorkflowCatalog` não verificada
**Localização:** `code-analysis.md` (workflow section), `catalog/requirements.md` RF-10
**Problema:** Spec menciona `WorkflowCatalog` subclass com TTL 15m. Não verifiquei se existe em código.
**Pergunta:** N/A — verificar em ciclo futuro.

### G-19 — Várias paths estimadas com "(estimated)"
**Localização:** `extension/tasks.md` T-03 a T-12, `preset/tasks.md`, outros
**Problema:** Origens marcadas como "estimated" (e.g., `extensions.py:603-1200 (estimated)`). Sem verificação direta.
**Pergunta:** N/A — refazer com line numbers reais no próximo ciclo.

### G-20 — `agent/design.md` line estimates fora do arquivo real
**Localização:** `agent/design.md` (várias)
**Problema:** Cita `agents.py:550-900` mas arquivo tem 846 LOC. Algumas linhas excedem fim do arquivo.
**Pergunta:** N/A — recalibrar com line counts reais.

---

## Resumo

| Severidade | Quantidade |
|------------|-----------|
| 🔴 Crítico | 5 (G-01 a G-05) |
| 🟡 Moderado | 10 (G-06 a G-15) |
| 🟢 Cosmético | 5 (G-16 a G-20) |
| **Total** | 20 |

**Bloqueadores de reimplementação:** G-01, G-02, G-03, G-04, G-05.
Resolver G-01 e G-03 primeiro — afetam ~30% das traceability claims.
