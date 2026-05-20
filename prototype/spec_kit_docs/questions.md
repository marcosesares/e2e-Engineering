# Perguntas para Validação — Specify CLI

> Gerado pelo Revisor em 2026-05-16
> Responda cada pergunta e me avise quando terminar (digite `reversa` ou "respondi as perguntas").
> Doc level: **completo**. Apenas lacunas 🔴 listadas aqui.

---

## Pergunta 1

**Contexto:** Módulo `authentication` — specs declaram classes `GitHubAuthProvider`, `AzureDevOpsAuthProvider`, `HttpBasicAuthProvider`, `GenericBearerAuthProvider`. Código real só tem `GitHubAuth` (`authentication/github.py:8`) e `AzureDevOpsAuth` (`authentication/azure_devops.py:20`). `http.py` define somente um handler de redirect (`_StripAuthOnRedirect`). Não existe arquivo `authentication/generic.py`.
**Spec afetada:** `_reversa_sdd/authentication/{requirements.md,design.md,tasks.md}`
**Pergunta:** Os nomes corretos das classes auth são `GitHubAuth` / `AzureDevOpsAuth` (sem sufixo `Provider`) e `GenericBearerAuthProvider` / `HttpBasicAuthProvider` são features planejadas mas não implementadas? Ou existem em outro arquivo que não localizei?
**Impacto:** Reclassifica de 🟢 para 🔴 vários itens em authentication. Define se Phase 3 do tasks.md (Concrete Providers) é nova implementação ou só renomeio.

**Resposta:** Confirmado. Nomes reais: `GitHubAuth` (`authentication/github.py:8`) e `AzureDevOpsAuth` (`authentication/azure_devops.py:20`). Apenas dois providers registrados em `authentication/__init__.py:41-50` via `_register_builtins()`. `GenericBearerAuthProvider` e `HttpBasicAuthProvider` **não existem** — nem como classe, nem como arquivo. `http.py` define apenas `_StripAuthOnRedirect` (redirect handler) + helpers `build_request`/`open_url`. Base abstrata = `AuthProvider` em `authentication/base.py:12`.

Ações:
- Renomear nas specs: `GitHubAuthProvider` → `GitHubAuth`, `AzureDevOpsAuthProvider` → `AzureDevOpsAuth`.
- Marcar `GenericBearerAuthProvider` / `HttpBasicAuthProvider` como **planejados / não implementados** (Won't ou Future). Não há código associado.
- Phase 3 (Concrete Providers) do tasks.md = mix: GitHub/AzureDevOps são apenas renomeio + verificação; os outros dois são feature nova (se quiser implementar).
- Notar que `AzureDevOpsAuth` já suporta 4 schemes (`basic-pat`, `bearer`, `azure-cli`, `azure-ad`) — o caso "basic-PAT" do Azure cobre parcialmente o que seria `HttpBasicAuthProvider`.

---

## Pergunta 2

**Contexto:** `_reversa_sdd/openapi/specify-cli.yaml` declara endpoints HTTP (`/commands/init`, `/commands/extension`, etc.) com servidor `http://localhost:8000`. Mas `architecture.md §6` afirma "Specify CLI does not expose HTTP APIs. It's CLI-only." Não há servidor HTTP no código.
**Spec afetada:** `_reversa_sdd/openapi/specify-cli.yaml`
**Pergunta:** O OpenAPI foi gerado por engano (não há HTTP API)? Apagar o arquivo, ou repurposá-lo como schema dos comandos CLI (input/output shapes)?
**Impacto:** Se apagar, remove user story implícita de HTTP server. Se repurposar, vira contrato canônico dos comandos CLI.

**Resposta:** Foi gerado por engano. Não existe servidor HTTP no código — `specify_cli` é CLI puro (Typer + click). Nenhum `Flask`, `FastAPI`, `uvicorn`, `aiohttp`, `wsgi` ou `localhost:8000` referenciado.

Recomendação: **repurposar** (não apagar). Manter o arquivo mas reescrever como CLI command contract:
- Trocar `paths:` HTTP por seção custom `commands:` (ou usar OpenAPI 3.1 com `x-cli-command` extensions).
- Cada comando vira um schema com `inputs` (flags/args) + `outputs` (stdout/exit code/files written) + `side_effects` (.specify/init-options.json etc.).
- Apagar campo `servers:` e qualquer referência a `http://`.
- Renomear arquivo para `specify-cli-commands.yaml` ou `cli-contract.yaml` para evitar leitura errada.

Razão: contrato máquina-legível dos comandos tem valor real (gera docs, valida testes, ajuda reimplementação). HTTP API não tem caminho de implementação aprovado no `architecture.md §6`.

---

## Pergunta 3

**Contexto:** `workflow/tasks.md` cita arquivos como `src/specify_cli/workflows/steps/command.py:1–100`, `steps/shell.py`, `steps/prompt.py`, `steps/control.py`, `steps/parallel.py`, `workflows/registry.py`. Estrutura real: `workflows/steps/<step>/__init__.py` (pasta por tipo: command, shell, prompt, gate, if_then, switch, while_loop, do_while, fan_out, fan_in). Não existe `workflows/registry.py`.
**Spec afetada:** `_reversa_sdd/workflow/{design.md,tasks.md}`, `_reversa_sdd/traceability/code-spec-matrix.md`
**Pergunta:** Atualizo as paths para refletir a estrutura folder-per-step real? Onde fica o registro de step types (engine.py? `__init__.py` de workflows/steps)?
**Impacto:** code-spec-matrix fica honesto. Tasks ganham origin corretos.

**Resposta:** Sim, atualizar paths para estrutura real folder-per-step. Mapeamento correto:

- `steps/command.py` → `workflows/steps/command/__init__.py`
- `steps/shell.py` → `workflows/steps/shell/__init__.py`
- `steps/prompt.py` → `workflows/steps/prompt/__init__.py`
- `steps/control.py` → **não existe** (separado em `gate/`, `if_then/`, `switch/`, `while_loop/`, `do_while/`)
- `steps/parallel.py` → **não existe** (separado em `fan_out/`, `fan_in/`)
- `workflows/registry.py` → **não existe**

Registry real:
- `STEP_REGISTRY: dict[str, StepBase]` definido em `workflows/__init__.py:20`
- Registro feito por `_register_step()` (`workflows/__init__.py:23-33`) chamado dentro de `_register_builtin_steps()` (`workflows/__init__.py:43-66`) — auto-executa na import.
- Lookup público via `get_step_type(type_key)` em `workflows/__init__.py:36-38`.
- Consumido pelo engine via `from . import STEP_REGISTRY` (`workflows/engine.py:92,198,229,434,469,515,527`).
- `workflows/steps/__init__.py` é **stub vazio** (só docstring "Auto-discovery for built-in step types") — toda registração mora no parent `workflows/__init__.py`.

Type keys registrados (10): `command`, `shell`, `prompt`, `gate`, `if`, `switch`, `while`, `do-while`, `fan-out`, `fan-in` (ver `engine.py:95-98` para fallback).

---

## Pergunta 4

**Contexto:** `shared_infra/design.md` afirma "Bundled Core Pack Location: src/specify_cli/core_pack/...". Real: `_assets.py:_locate_core_pack()` informa que core_pack só existe em wheel installs; em source-checkout cai pra `templates/`, `scripts/`, `extensions/` na raiz do repo.
**Spec afetada:** `_reversa_sdd/shared_infra/design.md`
**Pergunta:** Documento a dualidade (wheel vs source-checkout) explicitamente ou só corrijo para citar `_assets.py:_locate_core_pack()` como source-of-truth?
**Impacto:** Reimplementação de shared_infra precisa saber dos dois modos.

**Resposta:** Documentar a dualidade explicitamente. Fonte canônica: `_assets.py` (linhas 13-101).

Modo dual real:
1. **Wheel install:** `_locate_core_pack()` (`_assets.py:13-27`) retorna `Path(__file__).parent / "core_pack"`. Bundle copiado por hatchling force-include no build (ver `pyproject.toml`).
2. **Source-checkout / editable install:** retorna `None`. Cada helper de localização (`_locate_bundled_extension` linha 35, `_locate_bundled_workflow` linha 58, `_locate_bundled_preset` linha 81) faz fallback para `_repo_root() / <tipo> / <id>` onde `_repo_root() = Path(__file__).parent.parent.parent` (`_assets.py:30-32`).

Layout esperado em ambos os modos:
- Wheel: `specify_cli/core_pack/{extensions,workflows,presets}/<id>/`
- Source: `<repo_root>/{extensions,workflows,presets}/<id>/` (também `templates/`, `scripts/`)

Cada helper valida marker file (`extension.yml`, `workflow.yml`, `preset.yml`) antes de retornar — sem marker, retorna `None`.

Atualizar `shared_infra/design.md`:
- Trocar "Bundled Core Pack Location: src/specify_cli/core_pack/..." por "Bundled assets locator: `_assets.py`. Resolve em dois modos (wheel/source) — ver tabela abaixo".
- Adicionar tabela dos 3 helpers (`_locate_bundled_extension|workflow|preset`) com path wheel vs path source.
- Citar `get_speckit_version()` (`_assets.py:104`) como fonte de versão (tenta `importlib.metadata`, fallback `pyproject.toml`).

---

## Pergunta 5

**Contexto:** Specs `init/design.md` e `init/tasks.md` referenciam `.specify/init.json`. Código real: `INIT_OPTIONS_FILE = ".specify/init-options.json"` em `__init__.py:388`. Nome diferente.
**Spec afetada:** `_reversa_sdd/init/{design.md,tasks.md}`
**Pergunta:** Corrijo specs para `init-options.json`, ou existe outro `init.json` que persiste algo separado?
**Impacto:** Trivial mas afeta paths em tasks de implementação.

**Resposta:** Corrigir specs para `init-options.json`. Não existe `init.json` separado.

Fonte canônica: `__init__.py:388` → `INIT_OPTIONS_FILE = ".specify/init-options.json"`. Helpers em `__init__.py:394-410`:
- `save_init_options(project_path, opts)` — escreve `.specify/init-options.json`
- `load_init_options(project_path)` — lê o mesmo path

Referências cruzadas (todas batem no nome novo):
- `extensions.py:807, 977` (HookExecutor reading skill mode)
- `presets.py:1100`
- `__init__.py:1336, 1373, 1379, 1576, 1772, 1939, 2221` (CLI flag fallback)

Conteúdo persistido (ver `__init__.py:911-927`): `ai`, `integration`, `branch_numbering`, `context_file`, `here`, `script`, `speckit_version`, opcional `ai_skills`.

Ação: `sed`-like rename `init.json` → `init-options.json` em `init/design.md`, `init/tasks.md` e qualquer outro lugar.

---

## Pergunta 6

**Contexto:** `domain.md` lista lacuna: "Preset rollback semantics — `PresetRegistry.restore()` exists but caller not found in codebase". Confirmei `restore()` existe em `presets.py`. Mas não localizei chamador.
**Spec afetada:** `_reversa_sdd/domain.md`, `_reversa_sdd/preset/design.md`
**Pergunta:** `restore()` é API pública pra rollback (chamada externamente) ou ficou órfã? Devo marcar como dead code candidate?
**Resposta:** `PresetRegistry.restore()` (`presets.py:417`) está **órfã** no momento — sem chamadores em todo o `src/`. Os únicos `.restore()` callers (`__init__.py:4364, 4495`) usam `manager.registry.restore(...)` onde `manager = ExtensionManager` e `manager.registry = ExtensionRegistry` (`extensions.py:366`), **não** `PresetRegistry`.

Estado real:
- `ExtensionRegistry.restore` → usado para rollback automático em try/except do update flow (`__init__.py:4350-4364` recurring path; `4480-4495` rollback path).
- `PresetRegistry.restore` (`presets.py:417`) → API pública pareada (mesma assinatura/intent) mas **sem caller atual**. Dead code candidato OU API simetricamente exposta para rollback futuro de presets.

Recomendação:
- Marcar `PresetRegistry.restore()` como **API pública, sem caller interno (dead-code candidate)**. Manter (consistência com Extension counterpart), documentar como ponto de extensão para rollback de presets, e abrir issue para implementar rollback automático em `install_from_zip` / `install_from_directory` se desejado.
- Rollback automático de **extensão** já existe (try/except restaura backup + chama `registry.restore`).
- Rollback automático de **preset**: não implementado — `PresetManager.install_*` não tem backup/rollback flow equivalente. Lacuna real.

Atualizar `domain.md` + `preset/design.md`: mover de "lacuna não-explicada" para "design intentional gap: rollback de preset não automatizado; `restore()` exposto para uso programático".

---

## Pergunta 7

**Contexto:** `domain.md`, `preset/design.md`, `extension/design.md` e `tasks.md` flagam lacuna comum: "Composition recursion: se preset A wrap-compõe T, e preset B também wrap-compõe T, qual prevalece? Sem validação no código".
**Spec afetada:** `_reversa_sdd/preset/design.md`, `_reversa_sdd/extension/design.md`
**Pergunta:** Qual é o comportamento esperado? First wrap wins, last wins, ou error?
**Resposta:** Comportamento real (não documentado): **wrap mais alto-prioridade aplica por último → "outer wrap wins" / "highest-priority wrap is outermost"**.

Evidência (`presets.py:2960-3052`):
- `layers` está ordenado **highest-priority first** (`layers[0]` = top).
- `_compose_template` busca a `replace` base de cima pra baixo (`presets.py:2961-2968`) e descarta tudo abaixo dela.
- Acima da base, itera via `reversed_layers[start_idx:]` (`presets.py:3018`) — ou seja, **bottom-up**: layer mais baixa-prioridade primeiro, mais alta-prioridade por último.
- Cada `wrap` substitui `{CORE_TEMPLATE}` no layer atual pelo conteúdo acumulado (`presets.py:3040-3052`).

Implicação: se preset A (priority 10, wrap) e preset B (priority 20, wrap) compõem o mesmo template T, B aplica por último → B é o **wrapper externo**, A é interno, core fica no centro. Não há "ganha um, perde o outro" — **ambos coexistem aninhados**.

Regra para specs (preset/design.md, extension/design.md):
- "Múltiplos wraps compostos no mesmo template aninham por prioridade: maior prioridade fica como wrapper mais externo. Não há conflito; todos são aplicados. Não há detecção de wrap loops (placeholder ausente em layer wrap dispara `PresetValidationError` em `presets.py:3046`)."
- Se quiser comportamento diferente (e.g. error em wrap duplicado), é feature **nova**, não está implementada.

Garantia colateral: `{CORE_TEMPLATE}` ausente no body de um layer `wrap` levanta `PresetValidationError` na hora — não silenciosa.

---

## Pergunta 8

**Contexto:** Lacuna em quase todas as units: "Parallel install race condition — dois processos simultâneos podem corromper registry/cache. Sem lock/mutex no código".
**Spec afetada:** `_reversa_sdd/{preset,extension,integration}/design.md`
**Pergunta:** Concorrência simultânea de processos é cenário suportado? Se sim, precisa de lock (filelock/portalocker). Se não, documentar como "single-process tool, comportamento indefinido sob paralelismo".
**Resposta:** Tratar como **single-process tool, comportamento indefinido sob paralelismo**. Não há lock/mutex.

Evidência: grep por `filelock|portalocker|FileLock|fcntl|threading.Lock` em todo `src/specify_cli/` → zero matches relevantes a registry/cache. As 5 ocorrências de "lock" são em nomes de variáveis não relacionados (e.g. `block.github.io` URL, "lock" em comentários).

Implicações:
- `extensions.yml`, `init-options.json`, `auth.json` lidos/escritos sem coordenação.
- `PresetRegistry._save`, `ExtensionRegistry.update/restore`, `HookExecutor.save_project_config` todos usam `open(..., "w")` direto.
- Cache de `auth.json` em `http.py:24` é **per-process** (`_config_cache`), não compartilhado.

Recomendação para specs:
- **Documentar como boundary explícita**, não tarefa de implementação:
  - "Specify CLI assume execução single-process. Invocações simultâneas (e.g. dois `specify init` no mesmo projeto) podem corromper `extensions.yml`/`init-options.json`. Usuários devem serializar invocações."
- Se quiser suportar concorrência: **feature nova, T-shirt M/L** (adicionar `filelock` em PyPI deps, wrap em `_save`/`install_*`/`update_*`, decidir behavior em lock contention — fail vs wait).
- Marcar todas as ocorrências da lacuna em `preset/extension/integration/design.md` como "Design boundary: single-process. Race documented, not fixed."

---

## Pergunta 9

**Contexto:** `preset/design.md` e `tasks.md` listam: "{CORE_TEMPLATE} escaping — se body do core contém literal `{CORE_TEMPLATE}`, será indevidamente substituído. Sem escaping."
**Spec afetada:** `_reversa_sdd/preset/design.md`
**Pergunta:** Comportamento aceito (não há escaping) ou bug a corrigir? Caso aceito, documento como warning "não use `{CORE_TEMPLATE}` literal em conteúdo".
**Resposta:** Comportamento aceito **de facto**, não há escaping. Tratar como **doc warning + edge case conhecido**, não bug a corrigir (a menos que apareça caso real).

Evidência:
- `_substitute_core_template` (`presets.py:33-83`) usa `body.replace("{CORE_TEMPLATE}", core_body)` — substitui **todas** ocorrências, sem escape sequence.
- `_compose_template` (`presets.py:3052`) usa `layer_content.replace(placeholder, content)` — idem.
- Nenhum mecanismo de escape (`\{CORE_TEMPLATE\}`, `{{CORE_TEMPLATE}}`, `<!-- noescape -->`) implementado.

Risco real: baixo. `{CORE_TEMPLATE}` é placeholder com convenção forte (curly braces + uppercase + underscore) — improvável aparecer literalmente em prosa de comando. Mas se aparecer (docs sobre o próprio sistema de presets, por exemplo), substitui silenciosamente.

Recomendação para specs:
- **`preset/design.md`:** adicionar nota "`{CORE_TEMPLATE}` é palavra reservada nos bodies de presets. Não escapável. Conteúdo legítimo contendo o literal será indevidamente substituído. Para documentar o placeholder em prosa, usar workaround textual (e.g. `{ CORE_TEMPLATE }` com espaços, ou code fence)."
- **Reimplementação:** se quiser robustez, adicionar `{{CORE_TEMPLATE}}` (double-brace) como escape → renderiza para `{CORE_TEMPLATE}` literal. Custo baixo, breaking change zero (nenhum body atual usa double-brace).
- Não tratar como bug bloqueante. Severity: LOW.

---

## Pergunta 10

**Contexto:** `integration/design.md` lista lacuna: "Coexistence validation details — quais condições bloqueiam multi-install? Resource locks? Env var namespace?"
**Spec afetada:** `_reversa_sdd/integration/{requirements.md,design.md,tasks.md}`
**Pergunta:** Existe validação de coexistência de integrations em runtime? Se sim, onde no código? Se não, RF-13 (validate multi-integration coexistence) é feature planejada vs implementada?
**Resposta:** **Não existe validação runtime de coexistência entre integrations no código atual.** Reclassificar RF-13 para **Won't (não implementado) / Future**.

Evidência:
- Grep por `coexist|conflict|prevent.*multi|same.*folder` nos módulos relevantes (`integrations/`, `integration_runtime.py`, `integration_state.py`) → único hit é `integrations/catalog.py:223` que documenta "On conflicts, the first catalog in that list wins" — refere-se a resolução de **catalog entries**, não a coexistência de integrations instaladas.
- `integration_state.py` mantém `default_integration_key` (uma integração ativa por vez) mas não bloqueia múltiplas instaladas em paralelo. Cada integração escreve em sua própria pasta declarada (`.claude/`, `.goose/`, `.codex/`, etc.) — não há detecção de overlap de folder, env var, ou resource lock.
- `IntegrationBase` (`integrations/base.py`) não tem método `check_coexistence`, `validate_against_installed`, ou similar.

Cenários potenciais não cobertos:
- Duas integrations declarando mesmo `folder` (e.g. ambas escrevem `.specify/agent.md`).
- Conflito de env var (e.g. duas integrations exigindo `MODEL_NAME` com valores diferentes).
- Hooks da extensão A acionando comando da integração B em modo skill quando B não está ativa.

Recomendação:
- **RF-13 → Won't (current scope) / Could (future).** Documentar como gap conhecido.
- Atualizar `integration/requirements.md` reclassificando RF-13.
- Atualizar `integration/design.md` removendo "coexistence validation" da seção de comportamento e adicionando à seção "Out of scope".
- Atualizar `integration/tasks.md` removendo tarefa associada OU mover para "Future enhancements".
- Se quiser implementar: adicionar `_validate_no_conflict(self, installed_keys)` em `IntegrationBase`, chamado em `_apply_integration` antes da instalação. Custo: M.

---

## Pergunta 11

**Contexto:** `integration/design.md` cita 3 subclasses: Markdown/TOML/Skills. Código real em `integrations/base.py` define 4: MarkdownIntegration (linha 833), TomlIntegration (919), YamlIntegration (1126), SkillsIntegration (1332). `YamlIntegration` não está documentada.
**Spec afetada:** `_reversa_sdd/integration/{requirements.md,design.md}`, `_reversa_sdd/code-analysis.md`
**Pergunta:** Adiciono `YamlIntegration` às specs? Quais agentes a usam?
**Resposta:** Sim, adicionar `YamlIntegration` às specs — está implementada e em uso.

Confirmado:
- 4 subclasses concretas em `integrations/base.py`:
  - `MarkdownIntegration` (linha 833)
  - `TomlIntegration` (linha 919)
  - `YamlIntegration` (linha 1126) — comentário precedente: "YamlIntegration — YAML-format agents (Goose)"
  - `SkillsIntegration` (linha 1332)

- Único agente que usa `YamlIntegration` hoje: **Goose**:
  - `integrations/goose/__init__.py:3` → `from ..base import YamlIntegration`
  - `integrations/goose/__init__.py:6` → `class GooseIntegration(YamlIntegration)`
  - `integrations/goose/__init__.py:10` → `folder=".goose/"`, recipes em `.goose/recipes`
  - Registrada no fan-in geral: `integrations/__init__.py:63` → `from .goose import GooseIntegration`

Nenhuma outra integração herda `YamlIntegration` (todas as demais herdam de `MarkdownIntegration` / `TomlIntegration` / `SkillsIntegration`).

Ações para specs:
- `integration/requirements.md` + `integration/design.md`: adicionar `YamlIntegration` à enumeração de format subclasses (passa de 3 para 4). Reclassificar entry de 🟢 para 🟡 → 🟢 após edit.
- `code-analysis.md`: idem.
- Anotar que `YamlIntegration` é o ponto de extensão para qualquer agente futuro que use config YAML (e.g. potencial integração com outros frameworks YAML-driven).

---

## Pergunta 12

**Contexto:** `extension/tasks.md` T-12 marca como 🔴 "hook execution context not visible in this module; depends on shared_infra". `agent/tasks.md` T-13 também marca hook como 🟡. Não localizei `hook_dispatcher` em extensions.py nem em shared_infra.py.
**Spec afetada:** `_reversa_sdd/extension/{design.md,tasks.md}`, `_reversa_sdd/shared_infra/design.md`
**Pergunta:** Onde os hooks são realmente executados? `HookExecutor` existe em `extensions.py:2405` (eu vi), mas o dispatcher de eventos CLI (post-install, pre-build, etc.) está implementado? Se sim, onde?
**Resposta:** Hooks são **feature pronta**, com dispatcher implementado dentro do próprio `HookExecutor` (não em arquivo `hook_dispatcher.py` separado). Não existe módulo `hook_dispatcher` — design escolheu colocar dispatch + execução na mesma classe.

Anatomia real (`extensions.py:2405-...`):
- **Classe:** `HookExecutor` (linha 2405) — manages hook lifecycle.
- **Lookup por evento:** `get_hooks_for_event(event_name)` (linha 2734) — lê `extensions.yml` e retorna lista de hook dicts cujo `event` corresponde.
- **Filtro:** `should_execute_hook(hook)` (linha 2749) — checa `enabled`, condições, etc.
- **Dispatch loop:** linha 2904 → itera `hooks = self.get_hooks_for_event(event_name)`, filtra com `should_execute_hook`, e chama `execute_hook`.
- **Execução individual:** `execute_hook(hook)` (linha 2932) — roda o comando real.
- **Render:** `_render_hook_invocation(command)` (linha 2442) — adapta o comando ao agente ativo (skill mode vs slash command vs `$` prefix do Codex), lendo `init-options.json` para decidir.

Pontos de invocação (call sites do dispatcher):
- `extensions.py:1194` e `extensions.py:1338` — `HookExecutor` instanciado no install/uninstall flow de extensões.
- `__init__.py:4110, 4208, 4528, 4532, 4567, 4571` — CLI commands (update, install, etc.) instanciam HookExecutor e disparam eventos do ciclo de vida.

Eventos cobertos (declaráveis em `extensions.yml`): chave `hooks: {<event_name>: [...]}`. Eventos canônicos não estão hard-coded — são strings que extensões registram livremente; a CLI emite eventos específicos (e.g. post-install) quando chama `get_hooks_for_event("post-install")`. Confirmar lista exata de eventos emitidos é trabalho de auditoria adicional.

Ações para specs:
- **`extension/tasks.md` T-12:** reclassificar de 🔴 → 🟢. Hook execution context **é** visível, mora em `extensions.py:2405-2932+`.
- **`agent/tasks.md` T-13:** reclassificar de 🟡 → 🟢. Hooks dispatchados via `HookExecutor`.
- **`extension/design.md`:** adicionar seção "Hook lifecycle" descrevendo `HookExecutor` como dispatcher único.
- **`shared_infra/design.md`:** NÃO documentar hooks aqui — vivem em `extensions.py`, não em `shared_infra.py`. Remover referência se houver.
- **Pendência menor:** enumerar quais eventos a CLI realmente emite (varrer chamadas a `get_hooks_for_event`). Trabalho leve, pode virar T-shirt S.

---

## Pergunta 13

**Contexto:** `code-spec-matrix.md` referencia `src/specify_cli/integrations.py:1–500` como arquivo único. Real: `integrations/` é pasta com 30+ subpastas e `__init__.py`, `base.py`, `manifest.py`, `catalog.py`. Não há arquivo `integrations.py`.
**Spec afetada:** `_reversa_sdd/traceability/code-spec-matrix.md`
**Pergunta:** Apenas refazer as paths para apontar pra estrutura real?
**Resposta:** Sim, refazer paths para estrutura real. Não há arquivo `integrations.py` (só pasta `integrations/`).

Mapeamento correto:
- `src/specify_cli/integrations.py:1-500` (referência inválida) →
  - **`integrations/base.py`** — classes base (`IntegrationBase`) + subclasses de format (`MarkdownIntegration` linha 833, `TomlIntegration` linha 919, `YamlIntegration` linha 1126, `SkillsIntegration` linha 1332).
  - **`integrations/__init__.py`** — registry + fan-in das integrações concretas.
  - **`integrations/manifest.py`** — parsing/validação de manifests.
  - **`integrations/catalog.py`** — catalog de integrações (conflict resolution declarada na linha 223).
  - **`integrations/<agent>/__init__.py`** — uma pasta por integração concreta (claude, copilot, codex, goose, gemini, cursor_agent, windsurf, etc. — 30+ subpastas).

Arquivos auxiliares relacionados (raiz `specify_cli/`):
- `integration_runtime.py` — runtime helpers.
- `integration_state.py` — estado persistido (default integration key etc.).

Ação: regenerar a tabela `code-spec-matrix.md` com os paths acima, dividindo entries por subarquivo. Para subclasses concretas, apontar entries específicos para `integrations/<agent>/__init__.py:<linha>`. Confiança: 🟢 (estrutura verificada via `Glob src/specify_cli/**/*.py`).

---

## Pergunta 14 ✅

**Contexto:** `architecture.md §10` lista "Credentials in logs: 🟡 Partial (audit needed)". Não encontrei auditoria documentada.
**Spec afetada:** `_reversa_sdd/architecture.md`, `_reversa_sdd/authentication/design.md`
**Pergunta:** Há trabalho de auditoria de redação de credenciais ainda pendente? Quem é o owner? Quando programado?
**Resposta:** **Reclassificar de 🟡 para 🔴 (gap real).** Não há auditoria documentada nem mecanismo de redaction implementado.

Evidência (grep em `src/specify_cli/`):
- Zero hits para `redact|REDACTED|scrub`.
- Único `sanitize` aplicado a logs = `__init__.py:837, 862, 902` mas só substitui `\n` por espaço e trunca em 120 chars (defesa contra log injection / multilinha, **não** redação de credenciais).
- Único caso onde "token" aparece em `console.print` = `__init__.py:1733, 1744` — referem-se a **CLI option tokens** (`'integration option'`), não tokens de auth.
- Em `authentication/*.py`: tokens manipulados via `entry.token`, `entry.token_env`, `os.environ.get(...)`. Nenhum log de aviso/debug imprime token. **Bom: tokens não vazam em logs hoje.**
- Em `azure_devops.py` (acquisição via `az account get-access-token` e OAuth2 client credentials): exceptions capturadas amplamente, retornam `None` em falha — token nunca aparece em traceback (cuidado bom, mas não documentado).

Risco real:
- Se um `urllib.error.HTTPError` propagar para cima sem ser capturado em `http.py:141-145`, o repr pode incluir URL com query params — pequeno (config não usa tokens em query string).
- Se debug futuro logar `Request.headers`, vazaria `Authorization: Bearer <token>`. Não acontece hoje.

Recomendação:
- **Marcar como 🔴 gap.** Não há auditoria de redaction nem owner designado.
- Abrir issue: "Audit credential redaction across CLI". Sem owner atribuído — usuário (mantenedor do spec-kit) precisa apontar.
- Mitigação mínima sugerida (baixo custo): adicionar utility `_redact_headers(headers)` em `_console.py` para qualquer futuro debug logging.
- Atualizar `architecture.md §10`: trocar "🟡 Partial (audit needed)" por "🔴 Not audited. Tokens currently not logged (verified by grep), but no defensive redaction layer. Owner: TBD."

**Ações Tomadas**:
- ✅ `architecture.md§10` reclassificado 🟡→🔴 com achados detalhados + gap expanded
- ✅ `authentication/design.md` — adicionada seção "Security: Credential Redaction Status" com status current, risk, mitigation
- ✅ `questions.md` marcado como ✅ integrado

---

## Pergunta 15

**Contexto:** `init/tasks.md` T-22 (preset install fallback chain: local → bundled → catalog → remote) lista origem `__init__.py:944–982` com confiança 🟡. Não verifiquei se a ordem de fallback corresponde ao código.
**Spec afetada:** `_reversa_sdd/init/{design.md,tasks.md}`
**Pergunta:** A ordem de fallback declarada (local → bundled → catalog → remote) está correta? Há algum fallback adicional ou diferente?
**Resposta:** Ordem real **bate parcialmente** com o declarado, com nuance: "remote" não é etapa separada, é parte do passo "catalog".

Evidência exata (`__init__.py:929-973`):

```
if preset:
    # Try local directory first, then bundled, then catalog
    local_path = Path(preset).resolve()
    if local_path.is_dir() and (local_path / "preset.yml").exists():
        preset_manager.install_from_directory(local_path, ...)        # [1] LOCAL
    else:
        bundled_path = _locate_bundled_preset(preset)
        if bundled_path:
            preset_manager.install_from_directory(bundled_path, ...)  # [2] BUNDLED
        else:
            preset_catalog = PresetCatalog(project_path)
            pack_info = preset_catalog.get_pack_info(preset)          # [3] CATALOG lookup
            if not pack_info:
                warn "not found in catalog. Skipping."                # END (não tenta remote direto)
            elif pack_info.get("bundled") and not pack_info.get("download_url"):
                warn "bundled but not found locally"                  # END
            else:
                zip_path = preset_catalog.download_pack(preset)       # [4] REMOTE (download via catalog)
                preset_manager.install_from_zip(zip_path, ...)
```

Reconciliação com spec:
- ✅ `local → bundled → catalog` está correto como **lookup order**.
- ⚠️ "remote" **não é um fallback paralelo a catalog** — é o **passo de download dentro de catalog**. Só acontece quando catalog tem `download_url` válido.
- ⚠️ Não há fallback de "URL direta remota fora do catalog" (e.g. `specify init --preset https://example.com/x.zip` não está implementado neste branch).

Ordem real (corrigida para spec):
1. `local` (path local com `preset.yml`)
2. `bundled` (`_locate_bundled_preset` — wheel core_pack ou source-checkout)
3. `catalog lookup` (`PresetCatalog.get_pack_info`)
4. Se entry catalog é bundled-only sem `download_url` → falha com warning
5. Se entry catalog tem `download_url` → `download_pack` (rede) → `install_from_zip`

Confiança: 🟢 (verificado).

Ações:
- `init/design.md` + `init/tasks.md` T-22: trocar "local → bundled → catalog → remote" por "local → bundled → catalog (com download embutido)".
- Clarificar: catalog é a tabela de pacotes; "remote" só rola via `download_url` do catalog entry.
- Reclassificar T-22 de 🟡 para 🟢 após edit.
