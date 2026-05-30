# Architecture — DESTINI.BidDay.UI.Tests.Playwright

**Data:** 2026-05-20  
**Escopo:** Documentação arquitetural completa em nível detalhado  
**Confiança:** 🟢 CONFIRMADO | 🟡 INFERIDO | 🔴 LACUNA

---

## 📊 Visão Geral

DESTINI BidDay UI Tests é uma **suite de testes de automação Playwright + NUnit** para a aplicação web DESTINI BidDay — um sistema de gestão de licitações multi-tenant.

### Posicionamento na Arquitetura Maior

```
┌─────────────────────────────────────────────────────────┐
│         DESTINI BidDay — Arquitetura Geral             │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ┌──────────────────────────────────────────────────┐  │
│  │ React SPA Frontend (web app)                      │  │
│  └────────────────────┬─────────────────────────────┘  │
│                       │ HTTP/REST                       │
│  ┌────────────────────▼─────────────────────────────┐  │
│  │ Command Service (C# .NET 8, Event Sourcing)      │  │
│  │ - Domain aggregates: BidProject, BidPackage...   │  │
│  │ - Event Store: PostgreSQL                        │  │
│  └────────────┬──────────────────────┬──────────────┘  │
│               │ Events                │ Query DB       │
│  ┌────────────▼─────────┐  ┌─────────▼──────────────┐  │
│  │ Event Processor      │  │ Query Service (SQL)    │  │
│  │ (Azure Service Bus)  │  │ - Read models          │  │
│  │ - Sync fallback      │  │ - Azure SQL Server     │  │
│  └──────────────────────┘  └────────────────────────┘  │
│                                                           │
│  ┌──────────────────────────────────────────────────┐  │
│  │ **THIS PROJECT: UI TESTS (Playwright)**          │  │
│  │ - Automation suite (48 test cases)                │  │
│  │ - 9 major features tested                         │  │
│  │ - Integration with Command Service + Query DB    │  │
│  └──────────────────────────────────────────────────┘  │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

---

## 🏗️ Arquitetura de Testes

### Camadas

```
┌─────────────────────────────────────────────────┐
│ TestBase                                        │
│ - Browser initialization (Playwright)           │
│ - ExtentReports setup                           │
│ - Tracing (optional)                            │
│ - Context management (multi-browser)            │
└────────────┬────────────────────────────────────┘
             │
┌────────────▼────────────────────────────────────┐
│ [Test Cases] (48 files, 9 features)            │
│ - Bidders, BidDaySettings, BidResponses, etc.  │
│ - Async test methods with setup/action/assert  │
└────────────┬────────────────────────────────────┘
             │
┌────────────▼────────────────────────────────────┐
│ [TestSteps] (38 reusable step files)           │
│ - Navigation, data entry, validation            │
│ - Database queries/execution                    │
│ - Command Service API calls                     │
└────────────┬────────────────────────────────────┘
             │
┌────────────▼────────────────────────────────────┐
│ [PageObjects] (57 page/component files)        │
│ - Locators and element interaction              │
│ - Modal/form components                         │
│ - Grid/table helpers                            │
└────────────┬────────────────────────────────────┘
             │
┌────────────▼────────────────────────────────────┐
│ [Infrastructure]                                │
│ - TestConfiguration (appsettings)               │
│ - Database helpers (Azure SQL, PostgreSQL)      │
│ - Authentication (Azure AD B2C)                 │
│ - Models & Enums                                │
│ - Helpers (calculation, format, retry)          │
└────────────┬────────────────────────────────────┘
             │
┌────────────▼────────────────────────────────────┐
│ [External Services]                             │
│ - Playwright (browser automation)               │
│ - NUnit (test framework)                        │
│ - FluentAssertions (validation)                 │
│ - ExtentReports (reporting)                     │
└─────────────────────────────────────────────────┘
```

---

## 🎯 Componentes Principais

### 1. TestBase (Entry Point)
**Arquivo:** `TestCases/TestBase.cs`

```
TestBase
├── Setup
│   ├── TestConfiguration (carrega appsettings + userSecrets)
│   ├── Playwright.LaunchAsync (browser choice: Chromium/Firefox/WebKit)
│   ├── BrowserContext creation (multi-user context)
│   └── ExtentReports initialization
├── Test Methods
│   ├── [Parallelizable]
│   ├── [FunctionalArea(...)]
│   ├── [RunGroup(...)]
│   └── [RunDuring(...)]
└── Cleanup
    ├── Screenshot (se falhar)
    ├── Tracing (gravação de interações)
    └── Browser.Close()
```

### 2. TestSteps (Reutilização)
**Arquivo:** `TestSteps/TestStep.cs` + 38 arquivos parciais

```
TestStep.cs
├── Constructor(TestConfiguration, TestUser, IPage)
├── Navigation
│   ├── teststep_NavigateToHome()
│   ├── teststep_NavigateToBidPackagePage()
│   └── teststep_SignIn()
├── Data Entry
│   ├── teststep_EnterBidderInfo()
│   ├── teststep_FillLineItem()
│   └── teststep_SelectFee()
├── Validation
│   ├── teststep_ValidateFieldError()
│   ├── teststep_VerifyBidTotal()
│   └── teststep_AssertPermissionDenied()
├── Database
│   ├── teststep_QueryBidProject()
│   ├── teststep_ExecuteMigration()
│   └── teststep_VerifySyncConsistency()
└── API (Command Service)
    ├── teststep_CallCommandService()
    └── teststep_CreateBidProject()
```

### 3. PageObjects (UI Automation)
**Arquivos:** `PageObjects/*.cs` + `PageObjects/Components/*.cs`

```
PageObjects/
├── BidPackagePage
│   ├── Locators (ILocator properties)
│   ├── ClickAddLineItemButton()
│   ├── GetLineItemCount()
│   └── UpdateCellValue()
├── Settings.FeesPage
│   ├── ClickAddFeeButton()
│   ├── FillFeeForm(feeData)
│   └── GetFeeList()
├── Components/
│   ├── BaseModal
│   │   ├── ClickSubmitButton()
│   │   ├── GetErrorMessage()
│   │   └── Close()
│   ├── LineItemsModal
│   ├── NotesModal
│   └── BidderModal
└── ...
```

### 4. Models (Data Structures)
**Arquivo:** `Models/*.cs`

```
Models/
├── BidProject
│   ├── ProjectName: string
│   ├── BidDueDate: DateTime?
│   ├── ProjectStartDate: DateTime?
│   ├── IsClosed: bool
│   └── IncludedBidPackages: List<BidPackage>
├── BidPackage
│   ├── Code: string
│   ├── Description: string
│   ├── IsClosed: bool
│   ├── LockedByUser: string (pessimistic locking)
│   └── LineItems: List<LineItem>
├── LineItem
│   ├── Description: string
│   ├── Quantity: decimal
│   ├── Unit: string
│   ├── UnitPrice: decimal
│   └── Extended: decimal (calculated)
├── Fee
│   ├── Name: string
│   ├── FeeType: enum (Percentage | FixedAmount)
│   ├── Percentage: decimal?
│   ├── FixedAmount: decimal?
│   └── ApplicableTo: List<string>
└── ...
```

### 5. Infrastructure (Configuration & Helpers)

**TestConfiguration.cs**
```
TestConfiguration
├── Load appsettings + environment overrides
├── Azure AD B2C credentials
├── Command Service endpoint
├── Query Database connection strings
├── Event Store (PostgreSQL) connection
└── Test environment selector (DEV, QA)
```

**Database Helpers**
```
AzureSql.cs & PostgresSql.cs
├── Execute(sql, parameters)
├── Query(sql, parameters)
├── MigrateSchema()
├── BackupAndRestore()
└── VerifyConsistency()
```

---

## 📦 Containers (Nível C4-2)

### Container Diagram

```
┌──────────────────────┐
│  Browser (Chrome,    │
│  Firefox, WebKit)    │
│  [Playwright]        │
└──────────┬───────────┘
           │ WebDriver Protocol
           │
┌──────────▼────────────────────────────────────────┐
│ Playwright Test Runner (this project)            │
├────────────────────────────────────────────────────┤
│                                                     │
│  ┌──────────────────────────────────────────────┐ │
│  │ Test Execution Layer                         │ │
│  │ - TestBase, TestCases (48 files)             │ │
│  │ - NUnit framework                            │ │
│  │ - ExtentReports                              │ │
│  └──────────────────────────────────────────────┘ │
│                                                     │
│  ┌──────────────────────────────────────────────┐ │
│  │ Test Steps & Page Objects (95 files)         │ │
│  │ - TestStep (38 files, reusable steps)        │ │
│  │ - PageObjects (57 files, UI automation)      │ │
│  │ - Helpers, Models, Infrastructure           │ │
│  └────────────┬──────────────────────┬──────────┘ │
│               │                      │             │
└───────────────┼──────────────────────┼─────────────┘
                │                      │
     ┌──────────▼──────────┐   ┌──────▼────────────────┐
     │ Command Service API │   │ Query Database (SQL)  │
     │ (HTTP REST)         │   │ (Azure SQL Server)    │
     │                     │   │                       │
     │ POST /CreateProject │   │ SELECT * FROM ...     │
     │ POST /AddLineItem   │   │ SELECT * FROM Fees    │
     │ POST /SetPermission │   │ SELECT * FROM Users   │
     └─────────┬───────────┘   └──────┬────────────────┘
               │                      │
     ┌─────────▼──────────┐   ┌──────▼────────────────┐
     │ Event Store        │   │ Query Models          │
     │ (PostgreSQL)       │   │ (SQL Server)          │
     │                    │   │                       │
     │ - Events           │   │ - BidProjects         │
     │ - Aggregates       │   │ - BidPackages         │
     │ - Event sourcing   │   │ - LineItems           │
     └────────────────────┘   │ - Fees, Bidders       │
                              │ - Permissions         │
                              └───────────────────────┘
```

---

## 🎨 Padrões & Arquitetura Interna

### Padrão: TestCase → TestStep → PageObject

```csharp
// TestCase (BidResponses/LineItems.cs)
[Test]
public async Task LineItems_AddLineItem_CalculatesExtendedAmount()
{
    await teststep.teststep_CreateProject();           // Setup
    await teststep.teststep_NavigateToBidPackagePage(); // Navigate
    await teststep.teststep_AddLineItem(lineItem);    // Action
    await teststep.teststep_VerifyLineItemAdded(lineItem); // Assert
}

// TestStep (TestStep.BidResponses.cs)
public async Task teststep_AddLineItem(LineItem item)
{
    var modal = new LineItemsModal(page);
    await modal.ClickAddButton();
    await modal.FillForm(item);
    await modal.ClickSaveButton();
}

// PageObject (Components/LineItemsModal.cs)
public class LineItemsModal : BaseModal
{
    private ILocator _descriptionInput => page.Locator("input[name='description']");
    
    public async Task FillForm(LineItem item)
    {
        await _descriptionInput.FillAsync(item.Description);
        // ...
    }
}
```

### Padrão: Retry & Resilience

```csharp
// RetryHelper (infraestrutura)
public async Task<T> ExecuteWithRetry<T>(
    Func<Task<T>> action, 
    int maxAttempts = 3, 
    int delayMs = 1000)
{
    for (int i = 0; i < maxAttempts; i++)
    {
        try { return await action(); }
        catch (Exception) when (i < maxAttempts - 1)
        {
            await Task.Delay(delayMs);
        }
    }
}
```

### Padrão: Database Access

```csharp
// TestStep.Database.cs
public async Task<BidProject> QueryBidProject(int projectId)
{
    var sql = "SELECT * FROM BidProjects WHERE ProjectId = @id";
    return await azureSql.QuerySingleAsync<BidProject>(sql, new { id = projectId });
}

public async Task ExecuteMigration(string scriptPath)
{
    var sql = File.ReadAllText(scriptPath);
    await postgreSql.ExecuteAsync(sql);
}
```

---

## 🔐 Autorização & Autenticação

### Azure AD B2C Integration

```
┌──────────────────┐
│ Sign In Page     │
├──────────────────┤
│ Email/Password   │
│ [Sign In Button] │
└────────┬─────────┘
         │ Redirect to Azure AD B2C
         ▼
┌──────────────────────┐
│ Azure AD B2C         │
│ - Authenticate user  │
│ - Issue token        │
└────────┬─────────────┘
         │ Redirect back + token
         ▼
┌──────────────────────┐
│ Browser (logged in)  │
│ - Cookie/Token saved │
└──────────────────────┘
```

**Test Users (TestConfiguration.cs):**
- AllRoles (admin access)
- Contributor (limited write)
- Viewer (read-only)
- Approver (approval workflows)

### RBAC Matrix (UserPermissionsMatrix feature)

```
         | Bidders | LineItems | Fees | Settings |
─────────┼─────────┼───────────┼──────┼──────────┤
AllRoles | ✅ RWD  | ✅ RWD    | ✅ R | ✅ RWD   |
Contrib  | ✅ RW   | ✅ RWD    | ❌ N | ❌ N     |
Viewer   | ✅ R    | ✅ R      | ✅ R | ❌ N     |
Approver | ✅ R    | ✅ R      | ✅ R | ✅ W     |

Legend: R=Read, W=Write, D=Delete, N=No Access
```

---

## 📊 Estado & Máquinas de Estado

### BidProject State Machine

```
┌─────────┐
│  OPEN   │ ◀── Inicial
└────┬────┘
     │ CloseProject()
     │
┌────▼─────┐
│  CLOSED  │ ◀── Terminal (irreversível)
└──────────┘
```

**Regra:** Uma vez fechado, não pode ser reaberto.

### BidPackage State Machine

```
┌──────────┐
│  OPEN    │ ◀── Inicial, permitida edição
└────┬─────┘
     │ CloseBidPackage()
     │
┌────▼────────┐
│  CLOSED     │ ◀── Terminal, proíbe edição
└─────────────┘

Variante: Pessimistic Locking (LockedByUser != null)
  - Um usuário trava o pacote
  - Outros usuários recebem "locked" warning
  - Lock liberado ao término da edição ou timeout
```

---

## 🔄 Fluxo de Dados

### Fluxo: Criar BidProject

```
User (test)
    │
    ├─► teststep_CreateProject()
    │       │
    │       └─► CallCommandService("POST /CreateProject", data)
    │               │
    │               ▼
    │         Command Service
    │               │
    │               ├─► Create aggregate
    │               ├─► Emit ProjectCreatedEvent
    │               └─► Store in PostgreSQL Event Store
    │
    ├─► Event Processor (Azure Service Bus)
    │       │
    │       ├─► Listen for ProjectCreatedEvent
    │       ├─► Map to Query model
    │       └─► INSERT into SQL Server
    │
    └─► Query Database (SQL Server)
            │
            └─► SELECT * FROM BidProjects
```

### Fluxo: Adicionar LineItem

```
Test (PageObject.LineItemsModal)
    │
    ├─► Enter description, qty, unit, price
    │
    ├─► Click Save
    │
    ├─► teststep_AddLineItem()
    │       │
    │       └─► POST /AddLineItem { packageId, lineItem }
    │               │
    │               ▼
    │         Command Service (Domain)
    │               │
    │               ├─► Load BidPackage aggregate
    │               ├─► Validate(quantity > 0, unit allowed, ...)
    │               ├─► Emit LineItemAddedEvent { Extended = Qty × Price }
    │               └─► Save event
    │
    ├─► EventProcessor listens, maps to SQL model
    │
    └─► UI reflects total (Subtotal, Fees, GrandTotal)
        ← calculated server-side in Command Service
```

---

## 🔌 Integrações Externas

| Sistema | Protocolo | Uso | Autenticação |
|---------|-----------|-----|--------------|
| React SPA Frontend | HTTP REST | Display UI | Bearer Token (Azure AD B2C) |
| Command Service | HTTP REST | Commands (POST) | Bearer Token |
| Query Database | SqlClient | SELECT queries | SQL connection string |
| Event Store (PostgreSQL) | Npgsql | Read-only verification | Connection string |
| Azure AD B2C | OIDC/OAuth | Login workflow | ClientId/ClientSecret |
| Azure SQL Server | ODBC | Query models (multi-tenant) | Connection string per tenant |
| ExtentReports | Local file | Test reporting | Local HTML file |

---

## ⚙️ Configuração & Deployment

### Ambientes Suportados

| Ambiente | appsettings | Banco de Dados | Notas |
|----------|-------------|----------------|-------|
| DEV | appsettings.DEV.json | Local/DEV Azure SQL | Rápido, dados de teste |
| QA | appsettings.QA.json | QA Azure SQL | Staging, dados reais |
| Local | appsettings.json | Docker/Local | Desenvolvimento |

### Variáveis de Configuração

```json
{
  "TestExecution": {
    "BrowserToTest": "Chromium|Firefox|WebKit",
    "Headless": true|false,
    "RecordTestRun": true|false,
    "DoBackupAndRestore": true|false,
    "TestOutputDirectory": "TestResults/"
  },
  "Authentication": {
    "TenantId": "...",
    "ClientId": "...",
    "ClientSecret": "..."
  },
  "Database": {
    "AzureSql": "Server=...; Database=...",
    "PostgreSQL": "Host=...; Database=..."
  },
  "Api": {
    "CommandServiceUrl": "https://...",
    "QueryServiceUrl": "https://..."
  }
}
```

---

## 📈 Dívidas Técnicas & Gaps

### 🟡 INFERIDO Issues

1. **Code Duplication**
   - Métodos similar em múltiplos PageObjects (Click, Fill, Get)
   - Candidatos para BaseForm/BaseModal herança

2. **Test Data Management**
   - RandomHelpers usado em muitos testes
   - Falta de Factory pattern para criar BidProject/BidPackage padrão

3. **Error Handling**
   - Poucos testes para edge cases (invalid email, negative price, etc.)
   - Falta de exception assertion patterns

4. **Performance**
   - Tests com timeout 30s, pode ser otimizado com melhor waits
   - Parallelização poderia ser melhor aproveitada

### 🔴 LACUNAS Identificadas

1. **Falta de testes para:**
   - Workflow de aprovação (Approver role)
   - Edição de alternativas (Alternates feature)
   - Sincronização de fallback (EventFallbacks) — apenas verificação
   - Flusso de exportação (ExportProject.cs)

2. **Documentação**
   - Falta de guide de "como adicionar novo teste"
   - Falta de troubleshooting para falhas comuns
   - Falta de CI/CD pipeline documentation

3. **Monitoramento**
   - Sem métricas de cobertura (code vs. requirements)
   - Sem alertas para testes falhando repetidamente
   - Sem dashboard de execução centralizado

---

## 🎯 Princípios & Padrões

### Clean Code Principles Applied

✅ **Single Responsibility** — Cada PageObject, TestStep tem uma responsabilidade clara  
✅ **DRY (Don't Repeat Yourself)** — TestSteps e Helpers reutilizáveis  
✅ **KISS (Keep It Simple)** — Métodos curtos e diretos  
✅ **Async/Await** — Não bloqueia, melhor performance  

### Design Patterns Used

| Padrão | Onde | Exemplo |
|--------|------|---------|
| **Page Object** | PageObjects/*.cs | BidPackagePage, FeesPage |
| **Factory** | TestBase.cs | CreateTestUser, CreateBidProject |
| **Step Definition** | TestStep*.cs | teststep_* methods |
| **Dependency Injection** | TestConfiguration | Constructor injection |
| **Retry** | RetryHelper.cs | Resilience on flaky UI |
| **Builder** | Models | BidProject builder methods |

---

## 📝 Relatórios & Observabilidade

### Relatórios (ExtentReports)

```
Test Execution Report (HTML)
├── Summary
│   ├── Total Tests: 48
│   ├── Passed: 45
│   ├── Failed: 2
│   ├── Skipped: 1
│   └── Duration: 15m 32s
├── Test Details
│   ├── Test Name
│   ├── Status (Pass/Fail/Skip)
│   ├── Duration
│   ├── Steps executed
│   └── Attachments (screenshots, logs)
└── Graphs
    ├── Pass/Fail/Skip ratio
    └── Duration timeline
```

### Tracing & Debugging

```csharp
// Playwright tracing (opcional)
await context.Tracing.StartAsync(new TracingStartOptions { 
    Screenshots = true, 
    Snapshots = true 
});
// ... test actions ...
await context.Tracing.StopAsync(new TracingStopOptions { 
    Path = "trace.zip" 
});
```

---

## 🚀 Next Steps & Recommendations

1. **Adicionar testes** para workflows faltantes (Approver, Exports)
2. **Refatorar PageObjects** para eliminar duplicação
3. **Implementar Factory pattern** para data setup
4. **Adicionar code coverage** metrics
5. **Documentar troubleshooting** guide para falhas comuns
6. **Integrar CI/CD** pipeline com resultado reporting
7. **Optimizar performance** com melhor implicit/explicit waits

---

**Gerado pelo Reversa — Architect Agent**  
**Confiança:** 🟢 Artefatos confirmados em código; 🟡 Alguns padrões inferidos de convenções
