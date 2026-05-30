# Inventário do Projeto — DESTINI.BidDay.UI.Tests.Playwright

**Data:** 2026-05-20  
**Escaneado em:** Scout Phase 1  
**Framework:** Playwright + NUnit  
**Linguagem principal:** C# (.NET 8.0)

---

## 📁 Estrutura de Diretórios

```
DESTINI.BidDay.UI.Tests.Playwright/
├── Helpers/                              # Utilidades reutilizáveis (5 arquivos)
│   ├── CalculationHelpers.cs
│   ├── FormatExtensions.cs
│   ├── LocatorExtensions.cs
│   ├── RandomHelpers.cs
│   └── Utilities.cs
├── Infrastructure/                       # Configuração e setup (6 arquivos)
│   ├── Configuration/
│   │   ├── TestConfiguration.cs
│   │   └── TestUser.cs
│   ├── Enums.cs
│   ├── Reporting/
│   │   └── StepScope.cs
│   └── RetryHelper.cs
├── Models/                               # Modelos de dados (10 arquivos)
│   ├── Alternate.cs
│   ├── BidPackage.cs
│   ├── BidProject.cs
│   ├── Bidder.cs
│   ├── BidderResponse.cs
│   ├── BidderTotals.cs
│   ├── Condition.cs
│   ├── Fee.cs
│   ├── LineItem.cs
│   └── Requirement.cs
├── PageObjects/                          # Automação UI (57 arquivos)
│   ├── Components/                       # Componentes reutilizáveis (21 arquivos)
│   │   ├── BaseForm.cs
│   │   ├── BaseModal.cs
│   │   ├── AddEditRow.cs
│   │   ├── BidPackageForm.cs
│   │   ├── BidResponseAmountCell.cs
│   │   ├── GridHelper.cs
│   │   ├── LineItemsModal.cs
│   │   ├── NotesModal.cs
│   │   ├── SortableRow.cs
│   │   └── ... (12 mais)
│   ├── Pages gerais (20+ arquivos)
│   │   ├── HomePage.cs
│   │   ├── SignInPage.cs
│   │   ├── AddEditProjectPage.cs
│   │   ├── BidPackagePage.cs
│   │   ├── BidSummaryPage.cs
│   │   ├── ErrorPage.cs
│   │   ├── FrozenEntitiesPage.cs
│   │   ├── UnfreezePage.cs
│   │   ├── ClientSupportPage.cs
│   │   └── ... (mais)
│   └── Settings pages (8 arquivos)
│       ├── Settings.BidPackagesPage.cs
│       ├── Settings.DirectoryPage.cs
│       ├── Settings.FeesPage.cs
│       ├── Settings.GeneralConditionsPage.cs
│       ├── Settings.GeneralRequirementsPage.cs
│       ├── Settings.PreferencesPage.cs
│       ├── Settings.UnitsOfMeasurePage.cs
│       └── Settings.UserPermissionsPage.cs
├── TestCases/                            # Casos de teste (48 arquivos)
│   ├── BidDaySettings/                   # (8 arquivos)
│   │   ├── AdminBidPackages.cs
│   │   ├── AdminFees.cs
│   │   ├── Directory.cs
│   │   ├── GeneralConditions.cs
│   │   ├── GeneralRequirements.cs
│   │   ├── Preferences.cs
│   │   ├── UnitsOfMeasure.cs
│   │   └── UserPermissions.cs
│   ├── Bidders/
│   │   └── Bidders.cs
│   ├── BidPackageNotes/
│   │   └── BidPackageNotes.cs
│   ├── BidResponses/                    # (6 arquivos)
│   │   ├── Adjustments.cs
│   │   ├── AlternateLineItems.cs
│   │   ├── GeneralRequirements.cs
│   │   ├── LineItems.cs
│   │   ├── RollUps.cs
│   │   └── TradeRequirements.cs
│   ├── BidSummaryPageEdits/
│   │   └── BidSummaryPageEdits.cs
│   ├── EnvironmentSetup/                # (3 arquivos)
│   │   ├── EnvironmentSetup.cs
│   │   ├── ResyncBidDaySystemSettings.cs
│   │   └── RunDatabaseMigration.cs
│   ├── EventFallbacks/                  # (3 arquivos)
│   │   ├── BidDayApplicationEntities.cs
│   │   ├── FrozenEntities.cs
│   │   └── QueryDbSync.cs
│   ├── LineItems/
│   │   └── LineItems.cs
│   ├── UserPermissionsMatrix/
│   │   └── UserPermissionsMatrix.cs
│   ├── AlternateLineItems.cs
│   ├── Alternates.cs
│   ├── CloseProject.cs
│   ├── ExportProject.cs
│   ├── TestBase.cs                      # Base para todos os testes
│   └── ... (mais casos soltos)
├── TestSteps/                            # Steps reutilizáveis (38 arquivos)
│   ├── TestStep.cs                      # Classe principal
│   └── TestStep.*.cs                    # Parciais por funcionalidade
│       ├── TestStep.BidPackages.cs
│       ├── TestStep.BidResponses.cs
│       ├── TestStep.BidSummary.cs
│       ├── TestStep.Bidders.cs
│       ├── TestStep.Database.cs
│       ├── TestStep.Environment.cs
│       ├── TestStep.Navigation.cs
│       ├── TestStep.Projects.cs
│       └── ... (mais)
├── Database/                             # Scripts SQL (2 arquivos)
│   ├── AzureSQL/
│   │   └── *.sql (múltiplos scripts DDL)
│   ├── PostgreSQL/
│   └── AzureSql.cs
│       └── PostgresSql.cs
├── docs/
├── TestFiles/                            # Dados de teste (Excel, CSV, etc.)
├── PipelineReview/                       # Testes de pipeline
├── appsettings.json
├── appsettings.DEV.json
├── appsettings.QA.json
└── DESTINI.BidDay.UI.Tests.csproj
```

---

## 📊 Estatísticas

| Métrica | Valor |
|---------|-------|
| **Arquivos C#** | 166 |
| **TestCases** | 48 |
| **PageObjects** | 57 |
| **TestSteps** | 38 |
| **Models** | 10 |
| **Infrastructure** | 6 |
| **Helpers** | 5 |
| **Linguagem** | C# (.NET 8.0) |
| **Test Framework** | NUnit 4.4.0 |
| **Automation** | Playwright 1.51.0 |

---

## 🎯 Features Identificadas

1. **Bidders** — Manutenção de licitantes (adicionar, editar, validar campos)
2. **BidDaySettings** — Configurações do sistema Bid Day
   - Bid Packages
   - Fees (Taxas)
   - General Conditions
   - General Requirements
   - Units of Measure
   - User Permissions
   - Directory
   - Preferences
3. **BidResponses** — Respostas de licitantes
   - Adjustments
   - Alternate Line Items
   - General Requirements
   - Line Items
   - Roll Ups
   - Trade Requirements
4. **BidPackageNotes** — Notas de pacotes de licitação
5. **BidSummaryPageEdits** — Edições na página de resumo
6. **LineItems** — Itens de linha
7. **UserPermissionsMatrix** — Matriz de permissões
8. **EnvironmentSetup** — Setup de ambiente
9. **EventFallbacks** — Fallback de eventos (sincronização de dados)
   - Application Entities
   - Frozen Entities
   - Query DB Sync

---

## 🔧 Tecnologias e Dependências

### Core
- **.NET Framework:** 8.0
- **Language:** C#
- **Test Framework:** NUnit 4.4.0
- **Automation:** Microsoft.Playwright.NUnit 1.51.0
- **SDK:** Microsoft.NET.Test.Sdk 17.8.0

### Assertion & Validation
- **FluentAssertions** 6.7.0

### Reporting
- **ExtentReports** 5.0.2 (HTML relatórios)

### Data & Configuration
- **ExcelDataReader** 3.6.0
- **ExcelDataReader.DataSet** 3.6.0
- **Microsoft.Extensions.Configuration** 9.0.0
- **Microsoft.Extensions.Configuration.Binder** 9.0.0
- **Microsoft.Extensions.Configuration.EnvironmentVariables** 9.0.0
- **Microsoft.Extensions.Configuration.UserSecrets** 9.0.0
- **Microsoft.Extensions.DependencyInjection.Abstractions** 9.0.0
- **Microsoft.Extensions.Logging.Abstractions** 9.0.0

### Database
- **Microsoft.Data.SqlClient** 5.1.5 (Azure SQL Server — Query DB)
- **Npgsql** 7.0.7 (PostgreSQL — Event Store, read-only)

### HTTP & Utilities
- **Microsoft.Extensions.Http** 9.0.0
- **TextCopy** 6.1.0

### Testing Adapters
- **NUnit3TestAdapter** 4.6.0
- **NUnit.Analyzers** 4.4.0

---

## 📌 Entry Points

1. **TestBase.cs** — Base class para todos os testes
   - Inicialização Playwright
   - Setup de browser contexts
   - Gerenciamento de ExtentReports
   - Rastreamento (tracing)

2. **TestStep.cs** — Classe principal para steps reutilizáveis
   - Abstração de ações comuns
   - Reutilização entre testes

3. **TestConfiguration.cs** — Gestão de configuração
   - URLs
   - Credenciais (via UserSecrets)
   - Connection strings
   - Azure AD B2C
   - Ambientes (DEV, QA)

---

## 🔐 Autenticação & Integração

- **Azure AD B2C** — Autenticação de usuários
- **Command Service** — API backend para ações
- **Query Database** — Azure SQL Server (multi-tenant por cliente)
- **Event Store** — PostgreSQL (read-only, sincronização)

---

## 🗄️ Banco de Dados

### Suportados
- **Azure SQL Server** — Query models (read-write) para múltiplos clientes
  - Baseline DB
  - New Client DB
- **PostgreSQL** — Event Store (read-only para sincronização)

### Scripts
- Embedded SQL scripts em `Database/AzureSQL/`
- Migrações preparadas

---

## 🧪 Cobertura de Testes

- **Arquivos de teste:** 48 TestCases
- **Padrão:** Um arquivo por feature principal
- **Estrutura:** Métodos parallelizáveis com atributos NUnit
- **Atributos:** `[Parallelizable]`, `[RunGroup]`, `[FunctionalArea]`, `[RunDuring]`

---

## 📝 Configuração

### Ambientes Suportados
- **DEV** — `appsettings.DEV.json`
- **QA** — `appsettings.QA.json`
- **Default** — `appsettings.json`

### Variáveis de Configuração
- `BROWSER_TO_TEST` — Chromium (padrão), Firefox, WebKit
- `TEST_OUTPUT_DIRECTORY` — Saída de relatórios
- `RecordTestRun` — Ativar gravação de vídeo
- `DO_BACKUP_AND_RESTORE` — Backup/restore de dados
- Conexões Azure AD, Command Service, SQL Server, PostgreSQL

---

## 🚀 CI/CD & Relatórios

- **Teste em paralelo** com NUnit
- **Relatórios** gerados via ExtentReports (HTML)
- **Rastreamento Playwright** (trace files para replay)
- **Suporte a múltiplos navegadores** (Chrome, Firefox, WebKit)

---

## 🔗 Dependências Externas

### Projetos Relacionados
- `DESTINI.BidDay.Commands` — Commands da aplicação
- `DESTINI.BidDay.QueryModel` — Read models
- `DESTINI.Testing.Common` — Utilitários compartilhados

### Serviços
- Command Service (HTTP)
- Azure SQL Server
- PostgreSQL Event Store
- Azure AD B2C

---

## 📋 Notas Importantes

1. **Multi-tenant:** Suporta testes em múltiplos clientes via configuration
2. **Multi-browser:** Testes rodam em Chrome, Firefox e WebKit
3. **Multi-user:** Suporta contextos de navegador simultâneos (para testes multi-usuário)
4. **Resiliência:** Tests implementam fallbacks de sincronização (EventFallbacks)
5. **Modularidade:** Forte separação entre Page Objects, Test Steps e Test Cases
