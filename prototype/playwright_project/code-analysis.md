# Code Analysis — DESTINI.BidDay.UI.Tests.Playwright

**Escopo:** 9 features de teste Playwright + NUnit para aplicação BID DAY
**Data:** 2026-05-20
**Confiança:** 🟢 CONFIRMADO (verificado em código)

---

## 📋 Índice de Features Analisadas

1. **Bidders** — Manutenção de licitantes
2. **BidDaySettings** — Configurações do sistema
3. **BidResponses** — Respostas de licitação
4. **BidPackageNotes** — Notas de pacotes
5. **BidSummaryPageEdits** — Edições em resumo
6. **EnvironmentSetup** — Setup de ambiente
7. **EventFallbacks** — Sincronização de fallback
8. **LineItems** — Itens de linha
9. **UserPermissionsMatrix** — Matriz de permissões

---

## 🏗️ Arquitetura Geral

### Padrão de Teste (por feature)

```
TestCase (herda TestBase)
  ├── Setup (BaseSetup em TestBase)
  │   ├── TestConfiguration (carrega appSettings)
  │   ├── Playwright.LaunchAsync (browser)
  │   ├── ExtentReports (inicializa relatório)
  │   └── Tracing (opcional)
  ├── [Test] → Método assíncrono com setup, ação, validação
  │   ├── TestStep.teststep_* (passos reutilizáveis)
  │   ├── PageObjects.* (interação UI)
  │   └── FluentAssertions (validação)
  └── Cleanup (BaseCleanup em TestBase)
      ├── Screenshots (falha)
      ├── Tracing (gravação)
      └── Browser.Close()
```

### Padrão de Step (reutilizável)

```
TestStep class
  ├── Constructor(TestConfiguration, TestUser, IPage)
  ├── teststep_* (métodos públicos para ações)
  │   ├── Navegação (teststep_Navigate*)
  │   ├── Entrada de dados (teststep_Enter*, teststep_Fill*)
  │   ├── Cliques (teststep_Click*)
  │   ├── Validação (teststep_Validate*)
  │   ├── Database (teststep_Query*, teststep_Execute*)
  │   └── API (teststep_CallCommandService*)
  └── Helpers privados
      ├── Retry logic (RetryHelper)
      └── Locator construction
```

### Padrão de PageObject

```
PageObject class
  ├── Constructor(IPage)
  ├── Locators (propriedades ILocator)
  ├── Métodos de ação (async Task)
  │   ├── Click, Fill, Select
  │   ├── WaitFor* (visibilidade, presença)
  │   └── GetValue (leitura)
  └── Componentes aninhados (BaseModal, BaseForm)
```

---

## 🎯 Análise por Feature

### 1. BIDDERS — Manutenção de Licitantes

**Arquivos principais:**
- `TestCases/Bidders/Bidders.cs` — 1 test case, ~50 linhas
- `PageObjects/Components/BidderModal.cs` — modal de licitante
- `TestSteps/TestStep.Bidders.cs` — steps de licitante

**Fluxo de controle:**

```
AddBidderModal_RequiredFields()
  ├── Setup: Gera projeto BID aleatório
  ├── Create project via CommandService
  ├── Sign in como Contributor
  ├── Navigate to BidPackage page
  ├── Action: Open Add Bidder modal
  └── Assert: Validar campos obrigatórios
      ├── Company Name (required)
      ├── Contact Name (required)
      ├── Email Address (required)
      └── Phone Number (required)
```

**Modelos de dados:**
- `Bidder` — nome, email, telefone, empresa
- `TestUser` — credenciais de teste (AllRoles, Contributor, etc.)
- `BidProject` — contexto do projeto

**Algoritmos:**
- **Random generation:** `RandomHelpers.RandomBoolean()`, `Guid.NewGuid()`
- **Date manipulation:** `DateTime.Now`, `DateTime.Today.AddDays(n)`
- **Validation assertion:** `FluentAssertions.Should().BeEmpty()` para campos vazios

**Padrão de validação:**
```csharp
// Espera que o modal rejeite submissão sem campos obrigatórios
foreach (var field in requiredFields)
{
    await modal.ClearField(field);
    await modal.SubmitAsync();
    var errorMessage = await modal.GetErrorText();
    errorMessage.Should().NotBeEmpty();
}
```

---

### 2. BIDDAYSETTINGS — Configurações do Sistema

**Arquivos principais:**
- `TestCases/BidDaySettings/` — 8 test files (AdminBidPackages, AdminFees, Directory, GeneralConditions, GeneralRequirements, Preferences, UnitsOfMeasure, UserPermissions)
- `PageObjects/Settings.*.cs` — páginas de configuração
- `TestSteps/TestStep.BidPackagesSettings.cs`, `TestStep.Fees.cs`, etc.

**Fluxo de controle:**

```
[Settings Feature] — Multi-tenant admin configurations
  ├── AdminBidPackages.cs
  │   ├── Add/Edit bid packages
  │   ├── Validate code/description uniqueness
  │   └── Inactive state transitions
  ├── AdminFees.cs
  │   ├── Fee structure management
  │   ├── Percentage/fixed amount calculations
  │   └── Bid package associations
  ├── GeneralConditions.cs
  │   ├── Condition CRUD
  │   └── Ordering/priority management
  ├── GeneralRequirements.cs
  │   ├── Requirement CRUD
  │   └── Applicability rules
  ├── UnitsOfMeasure.cs
  │   ├── Unit definitions
  │   └── Conversion factors
  ├── UserPermissions.cs
  │   ├── RBAC (Role-Based Access Control)
  │   ├── Permission matrix per role
  │   └── Client-level isolation
  ├── Directory.cs
  │   ├── User/contact management
  │   └── Multi-tenant lookup
  └── Preferences.cs
      ├── Display preferences
      └── Client-level settings
```

**Estrutura de dados:**

```csharp
public class Fee
{
    public string Name { get; set; }           // Nome da taxa
    public decimal Percentage { get; set; }    // % ou null
    public decimal FixedAmount { get; set; }   // $ ou null
    public List<string> ApplicableTo { get; set; } // BidPackages
}

public enum Permission { Read, Write, Delete, Approve }
public class RolePermission { Role Role; List<Permission> Permissions; }
```

**Algoritmos principais:**
- **Fee calculation:** `(bidAmount * percentage) + fixedAmount`
- **Permission check:** Bitwise flags ou lookup table
- **Unit conversion:** `value * conversionFactor`

---

### 3. BIDRESPONSES — Respostas de Licitação

**Arquivos principais:**
- `TestCases/BidResponses/` — 6 test files (LineItems, Adjustments, AlternateLineItems, GeneralRequirements, TradeRequirements, RollUps)
- `PageObjects/BidPackagePage.BidResponses.cs`
- `TestSteps/TestStep.BidResponses.cs`

**Fluxo de controle:**

```
BidResponses [Feature] — Entrada de dados de licitação
  ├── LineItems
  │   ├── Enter bid amounts per line item
  │   ├── Calculate roll-up totals
  │   └── Validate min/max constraints
  ├── Adjustments
  │   ├── Apply discounts/premiums
  │   ├── Adjustment type (% or $)
  │   └── Aggregate effects
  ├── AlternateLineItems
  │   ├── Submit alternate bids
  │   ├── Per-item alternates
  │   └── Fallback to base bid
  ├── GeneralRequirements
  │   ├── Yes/No responses
  │   ├── Attachment support
  │   └── Condition dependencies
  ├── TradeRequirements
  │   ├── Trade-specific requirements
  │   ├── Multi-select options
  │   └── Cost impact calculation
  └── RollUps
      ├── Aggregate subtotals
      ├── Fee application
      └── Grand total calculation
```

**Estrutura de dados:**

```csharp
public class BidResponse
{
    public string BidderName { get; set; }
    public List<LineItemResponse> LineItems { get; set; }
    public List<AdjustmentResponse> Adjustments { get; set; }
    public decimal Subtotal { get; set; }      // sum of line items
    public decimal TotalFees { get; set; }     // Σ(fees)
    public decimal GrandTotal { get; set; }    // subtotal + fees
}

public class LineItemResponse
{
    public int LineItemId { get; set; }
    public decimal BidAmount { get; set; }
    public decimal? AlternateAmount { get; set; }
}
```

**Algoritmos principais:**
- **Roll-up calculation:**
  ```csharp
  decimal subtotal = lineItems.Sum(li => li.BidAmount);
  decimal adjustments = adjustments.Sum(a => 
      a.Type == "%" ? subtotal * a.Value / 100 : a.Value);
  decimal totalFees = fees.Sum(f => 
      f.Type == "%" ? subtotal * f.Percentage / 100 : f.FixedAmount);
  decimal grandTotal = subtotal + adjustments + totalFees;
  ```
- **Alternate selection logic:** IF user selected alternate THEN use alternate amount ELSE use base bid
- **Constraint validation:** Bid amount in [minBid, maxBid]

---

### 4. BIDPACKAGENOTES — Notas de Pacotes

**Arquivos principais:**
- `TestCases/BidPackageNotes/BidPackageNotes.cs` — 1 test case
- `PageObjects/Components/NotesModal.cs`
- `TestSteps/TestStep.BidPackageNotes.cs`

**Fluxo de controle:**

```
BidPackageNotes
  ├── Open bid package page
  ├── Navigate to Notes section
  ├── Action: Add/Edit/Delete note
  ├── Validation:
  │   ├── Rich text formatting preserved
  │   ├── User attribution (who edited)
  │   ├── Timestamp logged
  │   └── Audit trail populated
  └── Database: Note persisted to QueryDb via Event Handler
```

**Estrutura de dados:**

```csharp
public class BidPackageNote
{
    public int BidPackageId { get; set; }
    public string Content { get; set; }         // Rich text HTML
    public string CreatedBy { get; set; }       // User email
    public DateTime CreatedAt { get; set; }
    public string LastModifiedBy { get; set; }
    public DateTime LastModifiedAt { get; set; }
}
```

---

### 5. BIDSUMMARYPAGE EDITS — Edições em Resumo

**Arquivos principais:**
- `TestCases/BidSummaryPageEdits/BidSummaryPageEdits.cs`
- `PageObjects/BidSummaryPage.cs`, `BidSummaryPage.SummaryGrid.cs`
- `TestSteps/TestStep.BidSummaryEdits.cs`

**Fluxo de controle:**

```
BidSummary [In-line Editing]
  ├── Navigate to bid summary view
  ├── Click on editable cell (inline edit mode)
  ├── Action: Modify value
  ├── Blur/Tab: Trigger save
  ├── Validation:
  │   ├── Value updated in grid
  │   ├── Persisted to database
  │   └── Dependent calculations recalculated
  └── Rollback: ESC to cancel edit
```

**Padrão de edição inline:**
```csharp
// Grid cell becomes input on click
await summaryGrid.ClickCell(rowIndex, columnName);
var inputField = summaryGrid.GetEditingInput();
await inputField.FillAsync(newValue);
await inputField.PressAsync("Tab"); // Trigger blur
var savedValue = await summaryGrid.GetCellValue(rowIndex, columnName);
savedValue.Should().Be(newValue);
```

---

### 6. ENVIRONMENTSETUP — Setup de Ambiente

**Arquivos principais:**
- `TestCases/EnvironmentSetup/EnvironmentSetup.cs`, `ResyncBidDaySystemSettings.cs`, `RunDatabaseMigration.cs`
- `TestSteps/TestStep.Database.cs`, `TestStep.Database.CommandService.cs`

**Fluxo de controle:**

```
EnvironmentSetup [One-time initialization]
  ├── RunDatabaseMigration
  │   ├── Execute migration scripts (AzureSQL)
  │   └── Verify schema changes
  ├── ResyncBidDaySystemSettings
  │   ├── Call sync fallback API
  │   ├── Resync domain → query database
  │   └── Verify consistency
  └── EnvironmentSetup
      ├── Create test client records
      ├── Set up test users (AllRoles, Contributor, Admin)
      ├── Initialize default settings per client
      └── Pre-populate static data (units, conditions)
```

**Padrão de setup:**
```csharp
[SetUp]
public async Task Setup()
{
    var testConfig = new TestConfiguration();
    // 1. Connect to Azure SQL and PostgreSQL
    var queryDb = new SqlConnection(testConfig.BidDayQueryDbConnectionString);
    var eventStore = new NpgsqlConnection(eventStoreConnStr);
    
    // 2. Run migrations
    var migrationRunner = new MigrationRunner(queryDb);
    await migrationRunner.RunAsync("Database/AzureSQL/*.sql");
    
    // 3. Resync via Fallback
    var syncService = new SyncFromDomainEntity(queryDb, eventStore);
    await syncService.ResyncAllAsync();
    
    // 4. Verify
    var entityCount = await queryDb.QueryScalarAsync<int>(
        "SELECT COUNT(*) FROM BidPackages");
    entityCount.Should().BeGreaterThan(0);
}
```

---

### 7. EVENTFALLBACKS — Sincronização de Fallback

**Arquivos principais:**
- `TestCases/EventFallbacks/BidDayApplicationEntities.cs`, `FrozenEntities.cs`, `QueryDbSync.cs`
- `TestSteps/TestStep.Fallback.cs`

**Fluxo de controle:**

```
EventFallbacks [Resiliência]
  ├── BidDayApplicationEntities
  │   ├── Verify domain events persisted to event store (PostgreSQL)
  │   ├── Check snapshot entity state
  │   └── Ensure aggregate consistency
  ├── FrozenEntities
  │   ├── Closed/frozen entity state
  │   ├── Read-only transitions
  │   └── Prevent state mutations on frozen entities
  └── QueryDbSync
      ├── Disable event bus (simulate failure)
      ├── Trigger query DB resync manually
      ├── Verify all domain → query mappings consistent
      └── Event handlers re-process all events
```

**Padrão de fallback:**
```csharp
// Normal flow (event → bus → handler → query db)
// Fallback (on bus timeout/failure):
// Resync all domain entities → query database directly

public async Task SyncFallback()
{
    var domainEntities = await eventStore.GetAllAggregatesAsync();
    foreach (var aggregate in domainEntities)
    {
        var mapper = GetMapperFor(aggregate.Type);
        var queryEntity = mapper.Map(aggregate);
        await queryDb.UpsertAsync(queryEntity);
    }
}
```

---

### 8. LINEITEMS — Itens de Linha

**Arquivos principais:**
- `TestCases/LineItems/LineItems.cs`
- `PageObjects/Components/LineItemsModal.cs`, `LineItemRow.cs`
- `TestSteps/TestStep.LineItems.cs`

**Fluxo de controle:**

```
LineItems [CRUD]
  ├── Add line item
  │   ├── Open modal
  │   ├── Enter description, quantity, unit price
  │   ├── Calculate extended (qty × unit price)
  │   └── Save → persisted to bid package
  ├── Edit line item
  │   ├── Update values
  │   ├── Recalculate totals
  │   └── Save changes
  ├── Delete line item
  │   ├── Confirmation dialog
  │   └── Remove from package
  └── Sort/Reorder
      ├── Drag-drop or arrow buttons
      └── Persist order
```

**Estrutura de dados:**

```csharp
public class LineItem
{
    public int LineItemId { get; set; }
    public string Description { get; set; }
    public decimal Quantity { get; set; }
    public string Unit { get; set; }           // inch, foot, yard, etc.
    public decimal UnitPrice { get; set; }
    public decimal Extended => Quantity * UnitPrice; // Calculated
    public int DisplayOrder { get; set; }
}
```

**Algoritmos:**
- **Extended amount:** `Quantity * UnitPrice` (client + server validation)
- **Unit conversion:** Normalize units before calculation
- **Sort key:** `DisplayOrder` (integer for ordering)

---

### 9. USERPERMISSIONSMATRIX — Matriz de Permissões

**Arquivos principais:**
- `TestCases/UserPermissionsMatrix/UserPermissionsMatrix.cs`
- `PageObjects/Settings.UserPermissionsPage.cs`
- `TestSteps/TestStep.UserPermissionMatrix.cs`

**Fluxo de controle:**

```
UserPermissionsMatrix [RBAC]
  ├── Load permission matrix (rows=features, cols=roles)
  ├── Permission states: Allowed | Denied | Inherit
  ├── Edit permissions
  │   ├── Toggle permission per feature×role
  │   ├── Cascade to child roles (inheritance)
  │   └── Validate role hierarchy constraints
  ├── Persist to database
  └── Verify enforcement
      ├── User without permission → Feature hidden/disabled
      ├── User with permission → Feature available
      └── Audit log updated
```

**Estrutura de dados:**

```csharp
public class RolePermissionMatrix
{
    public string Role { get; set; }          // Contributor, Admin, ProjectAdmin
    public Dictionary<string, Permission> Features; // feature → {Read, Write, Delete}
}

public enum Permission { Allowed, Denied, Inherit }
```

**Algoritmo de validão:**
```csharp
// Evaluate permission with inheritance chain
private Permission EvaluatePermission(string role, string feature)
{
    var matrix = LoadMatrix(role);
    if (matrix[feature] != Permission.Inherit)
        return matrix[feature];  // Explicit decision
    
    var parentRole = GetParentRole(role);
    return parentRole != null ? 
        EvaluatePermission(parentRole, feature) : // Recurse
        Permission.Denied;  // Default deny
}
```

---

## 📊 Estruturas de Dados Comuns

### TestUser (Múltiplos papéis)

```csharp
public class TestUser
{
    public static TestUser AllRoles { get; }      // Acesso total (setup/teardown)
    public static TestUser Contributor { get; }   // Entrada de dados
    public static TestUser Admin { get; }         // Configurações
    public static TestUser Viewer { get; }        // Somente leitura
    
    public string Email { get; set; }
    public string Password { get; set; }
    public string Name { get; set; }
    public string[] Roles { get; set; }           // ["Contributor", "ProjectAdmin"]
}
```

### BidPackage (Contexto de licitação)

```csharp
public class BidPackage
{
    public string Code { get; set; }              // "01.40"
    public string Description { get; set; }
    public DateTime DueDate { get; set; }
    public List<LineItem> LineItems { get; set; }
    public List<Requirement> Requirements { get; set; }
    public List<Trade> Trades { get; set; }
    public bool IsClosed { get; set; }
}
```

---

## 🔄 Fluxos Transversais

### 1. Command Service API Call

```csharp
public async Task teststep_CreateProject_CommandService(BidProject project)
{
    var commandService = new CommandServiceAPI(_config);
    var createCommand = new CreateBidProjectCommand(project);
    var response = await commandService.InvokeAsync(createCommand);
    response.Status.Should().Be("Success");
    response.ProjectId.Should().NotBeEmpty();
}
```

**Padrão de autenticação:**
- Azure AD B2C → ROPC flow (username/password)
- Token → HTTP Bearer header
- Scope: Command Service URL

### 2. Database Read (Query)

```csharp
public async Task<BidPackage> GetBidPackageAsync(int packageId)
{
    var queryDb = new SqlConnection(_config.BidDayQueryDbConnectionString);
    var result = await queryDb.QueryFirstAsync<BidPackage>(
        "SELECT * FROM BidPackages WHERE Id = @Id",
        new { Id = packageId }
    );
    return result;
}
```

### 3. Event Store Read (PostgreSQL)

```csharp
public async Task<List<Event>> GetEventsAsync(string aggregateId)
{
    var eventStore = new NpgsqlConnection(_config.EventStoreConnectionString);
    var events = await eventStore.QueryAsync<Event>(
        "SELECT * FROM Events WHERE AggregateId = @Id ORDER BY Version",
        new { Id = aggregateId }
    );
    return events.ToList();
}
```

---

## 🎨 Padrões de Implementação

### Pattern 1: Page Object with Async/Await

```csharp
public class BidPackagePage
{
    private readonly IPage _page;
    private readonly ILocator _addLineItemButton;
    
    public BidPackagePage(IPage page)
    {
        _page = page;
        _addLineItemButton = _page.Locator("button:has-text('Add Line Item')");
    }
    
    public async Task ClickAddLineItemAsync()
    {
        await _addLineItemButton.ClickAsync();
    }
}
```

### Pattern 2: Test Step with Reusability

```csharp
public class TestStep
{
    public async Task teststep_NavigateToPageAsync(
        Enums.Page page, 
        string projectName, 
        string packageCode,
        string packageName)
    {
        // Navigate using app-specific URL structure
        var url = $"{SiteUrl}/projects/{projectName}/packages/{packageCode}";
        await _page.GotoAsync(url);
        await _page.WaitForLoadStateAsync(LoadState.NetworkIdle);
    }
}
```

### Pattern 3: Retry Mechanism

```csharp
public async Task<T> ExecuteWithRetryAsync<T>(Func<Task<T>> action)
{
    var maxRetries = 3;
    var delay = TimeSpan.FromMilliseconds(500);
    
    for (int attempt = 1; attempt <= maxRetries; attempt++)
    {
        try
        {
            return await action();
        }
        catch (Exception ex) when (attempt < maxRetries)
        {
            await Task.Delay(delay);
            delay = TimeSpan.FromMilliseconds(delay.TotalMilliseconds * 1.5);
        }
    }
}
```

---

## 🔍 Validação & Assertions

### Pattern 1: FluentAssertions

```csharp
// Single assertion
result.Should().NotBeNullOrEmpty();
bidAmount.Should().BeGreaterThanOrEqualTo(0);
status.Should().Be("Active");

// Collection assertions
lineItems.Should().HaveCount(5);
lineItems.Should().AllSatisfy(li => li.Quantity.Should().BePositive());
lineItems.Select(li => li.Description).Should().NotContainNulls();
```

### Pattern 2: Custom Validators

```csharp
private async Task ValidateLineTotalAsync(LineItem li, decimal expectedTotal)
{
    var calculated = li.Quantity * li.UnitPrice;
    calculated.Should().Be(expectedTotal, 
        because: "line extended amount should be qty × unit price");
}
```

---

## ⚡ Considerações de Performance

1. **Parallelização:** Tests marcados com `[Parallelizable(ParallelScope.Self)]`
2. **Reuso de browser context:** Multi-user tests usam contextos diferentes
3. **Lazy initialization:** Browsers/databases inicializam sob demanda
4. **Tracing seletivo:** Habilitado apenas em modo debug ou falha
5. **Data cleanup:** Fallback para drop/recreate ao invés de update em caso de testes falhados

---

## 🛡️ Estratégias de Teste

### Coverage por feature:

| Feature | Padrão | Coverage |
|---------|--------|----------|
| Bidders | CRUD + Validação | Obrigatório, Email, Telefone |
| Settings | CRUD + Permissions | Cada setor, por role |
| Bid Responses | Entrada + Calculations | LineItems, Adjustments, RollUps |
| Notes | Add/Edit/Delete | Rich text, User attribution |
| Summary | Inline edit | In-line validation, Rollback |
| Setup | Environment | Schema, Resync, Default data |
| Fallbacks | Resilience | Event store consistency |
| LineItems | CRUD + Sort | Add, Update, Delete, Reorder |
| Permissions | RBAC | Role matrix, Enforcement |

---

## 📝 Notas de Implementação

1. **Async/await:** Todos os métodos Playwright são assíncronos (navegação, clique, etc.)
2. **Timeouts:** Playwright timeout padrão 30s; customizável por ação
3. **Multi-tentativa:** Retry helpers para ações flaky (rede, UI lenta)
4. **Isolation:** Cada teste roda com seu próprio browser context para evitar state leakage
5. **Reporting:** ExtentReports gera HTML com screenshots, logs, duração
6. **CI/CD:** Parallelização via NUnit (seguro dentro de contextos isolados)

