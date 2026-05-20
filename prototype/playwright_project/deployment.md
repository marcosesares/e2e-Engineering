# Deployment & Infrastructure — DESTINI.BidDay.UI.Tests.Playwright

**Escopo:** Documentação de deploy, infraestrutura e configuração de ambientes  
**Data:** 2026-05-20  
**Confiança:** 🟡 INFERIDO (não há Docker/Compose, mas práticas suportadas)

---

## 📋 Infraestrutura Geral

```
┌─────────────────────────────────────────────────────────────────────┐
│                    DESTINI BidDay — Full Stack                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ Azure Subscription                                           │  │
│  │ ├─ Tenant: DESTINI.onmicrosoft.com                          │  │
│  │ └─ Regions: East US (primary), West US (secondary)          │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ Frontend (React SPA)                                          │  │
│  │ ├─ Azure App Service (Linux container)                       │  │
│  │ ├─ Azure CDN (static assets)                                 │  │
│  │ └─ Azure Storage (blobs for images)                          │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ Backend Services                                              │  │
│  │ ├─ Command Service (App Service)                             │  │
│  │ ├─ Query Service (App Service)                               │  │
│  │ ├─ Event Processor (Container Instance or App Service)       │  │
│  │ ├─ Fee Calculation Service (Microservice)                    │  │
│  │ └─ Client Maintenance (Batch Service)                        │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ **THIS PROJECT: UI Test Automation**                         │  │
│  │ ├─ Azure DevOps Pipelines (CI/CD)                            │  │
│  │ ├─ Test Agent Pools (Windows agents)                         │  │
│  │ └─ Test Results Publishing                                   │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ Data & Message Infrastructure                                │  │
│  │ ├─ PostgreSQL (Event Store) — Azure Database for PostgreSQL │  │
│  │ ├─ Azure SQL Server (Query DB — multi-tenant)               │  │
│  │ ├─ Azure Service Bus (Event messaging)                       │  │
│  │ └─ Azure Blob Storage (File/document storage)                │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ Identity & Security                                           │  │
│  │ ├─ Azure AD B2C (User authentication)                        │  │
│  │ ├─ Azure KeyVault (Secrets, certs)                           │  │
│  │ └─ Network Security Groups (firewall rules)                  │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🧪 Test Environment Architecture

### Local Development (Developer Machine)

```
┌──────────────────────────────┐
│ Developer Workstation        │
├──────────────────────────────┤
│                              │
│ ┌─────────────────────────┐  │
│ │ VS/VS Code              │  │
│ │ - C# .NET 8.0           │  │
│ │ - NUnit Test Explorer   │  │
│ │ - Playwright Inspector  │  │
│ └─────────────────────────┘  │
│           │                   │
│ ┌─────────▼─────────────────┐ │
│ │ Playwright Browser        │ │
│ │ - Chromium (headless)     │ │
│ │ - Firefox (optional)      │ │
│ │ - WebKit (optional)       │ │
│ └─────────────────────────┘ │
│           │                   │
└───────────┼───────────────────┘
            │ HTTP/HTTPS
            │
   ┌────────▼─────────────┐
   │ QA/DEV Environment   │
   │ (on-premises or cloud)
   │                      │
   ├─ React Frontend      │
   ├─ Command Service     │
   ├─ Query Service       │
   ├─ Azure SQL DB        │
   └─ PostgreSQL Event    │
      Store               │
```

**Setup:**
```bash
# Clone repo
git clone https://dev.azure.com/DESTINI/BidDay/_git/DESTINI.BidDay

# Build
cd test/DESTINI.BidDay.UI.Tests/DESTINI.BidDay.UI.Tests.Playwright
dotnet build DESTINI.BidDay.UI.Tests.csproj

# Run tests locally
dotnet test DESTINI.BidDay.UI.Tests.csproj --filter "Category=Smoke"

# Or use VS Test Explorer (recommended for IDE integration)
```

---

### CI/CD Pipeline (Azure DevOps)

```
┌──────────────────────────────────────────────────────┐
│ Azure DevOps                                         │
├──────────────────────────────────────────────────────┤
│                                                       │
│ ┌────────────────────────────────────────────────┐  │
│ │ Git Repository (master, feature branches)      │  │
│ │ └─ Trigger: Push to feature/*, PR created    │  │
│ └────────┬───────────────────────────────────────┘  │
│          │                                           │
│ ┌────────▼───────────────────────────────────────┐  │
│ │ Build Pipeline (azure-pipelines.yml)           │  │
│ │ ├─ Checkout source                             │  │
│ │ ├─ Restore NuGet packages                       │  │
│ │ ├─ Build .NET solution                         │  │
│ │ ├─ Run unit tests (if any)                     │  │
│ │ └─ Publish artifacts                           │  │
│ └────────┬───────────────────────────────────────┘  │
│          │                                           │
│ ┌────────▼───────────────────────────────────────┐  │
│ │ Test Execution (Hosted Agents)                 │  │
│ │ ├─ Spin up Windows agent (VS2022)              │  │
│ │ ├─ Run test suite                              │  │
│ │ │  ├─ Smoke tests (5 min)                      │  │
│ │ │  ├─ Regression tests (15 min)                │  │
│ │ │  └─ Feature tests (25 min)                   │  │
│ │ ├─ Parallel execution (4+ threads)             │  │
│ │ └─ Publish results                             │  │
│ └────────┬───────────────────────────────────────┘  │
│          │                                           │
│ ┌────────▼───────────────────────────────────────┐  │
│ │ Test Results                                   │  │
│ │ ├─ NUnit results (XML)                         │  │
│ │ ├─ ExtentReports (HTML)                        │  │
│ │ ├─ Screenshots (on failure)                    │  │
│ │ ├─ Logs & trace files                          │  │
│ │ └─ Dashboard + notifications                   │  │
│ └──────────────────────────────────────────────────┘  │
│                                                       │
│ ┌────────────────────────────────────────────────┐  │
│ │ Gating (if failures)                           │  │
│ │ ├─ Block PR merge if critical tests fail       │  │
│ │ ├─ Notify team in Slack/Teams                  │  │
│ │ └─ Create bug work item (auto)                 │  │
│ └────────────────────────────────────────────────┘  │
│                                                       │
└──────────────────────────────────────────────────────┘
```

**Pipeline YAML (sketch):**
```yaml
trigger:
  branches:
    include:
    - master
    - main
    - feature/*
  paths:
    include:
    - test/DESTINI.BidDay.UI.Tests/

pr:
  branches:
    include:
    - master
    - main

pool:
  vmImage: 'windows-latest'
  demands: 
    - DotNetFramework
    - msbuild
    - visualstudio

variables:
  buildConfiguration: 'Release'
  testOutputDirectory: '$(Build.ArtifactStagingDirectory)/TestResults'

jobs:
- job: Build
  displayName: 'Build & Unit Tests'
  steps:
  - task: UseDotNet@2
    inputs:
      version: '8.0.x'
  
  - task: DotNetCoreCLI@2
    displayName: 'Restore NuGet'
    inputs:
      command: 'restore'
      projects: '**/DESTINI.BidDay.UI.Tests.csproj'
  
  - task: DotNetCoreCLI@2
    displayName: 'Build'
    inputs:
      command: 'build'
      arguments: '--configuration $(buildConfiguration)'

- job: UITests
  displayName: 'UI Automation Tests'
  dependsOn: Build
  condition: succeeded()
  strategy:
    matrix:
      Chromium:
        BROWSER: 'Chromium'
      Firefox:
        BROWSER: 'Firefox'
  steps:
  - task: DotNetCoreCLI@2
    displayName: 'Run Tests'
    inputs:
      command: 'test'
      arguments: '--configuration $(buildConfiguration) --logger "trx;LogFileName=test-$(BROWSER).trx"'
    env:
      BROWSER_TO_TEST: $(BROWSER)
      TEST_ENV: QA
  
  - task: PublishTestResults@2
    displayName: 'Publish Test Results'
    inputs:
      testResultsFormat: 'VSTest'
      testResultsFiles: '**/test-*.trx'
      mergeTestResults: true
    condition: always()
  
  - task: PublishBuildArtifacts@1
    displayName: 'Publish Artifacts'
    inputs:
      pathToPublish: '$(testOutputDirectory)'
      artifactName: 'TestResults'
    condition: always()

- job: ResultsGate
  displayName: 'Results & Gating'
  dependsOn: UITests
  condition: failed()
  steps:
  - script: echo "Tests failed - blocking merge"
  - task: PostBuildCleanup@3
```

---

## 🌍 Environment Configurations

### DEV Environment
```
Endpoint: https://bidday-dev.destini.com
Database: Azure SQL (DEV instance)
EventStore: PostgreSQL (DEV instance)
AD B2C: DEV tenant
Test Users: dev-user@test.destini.com (pre-seeded)
Data Reset: Automatic nightly
Performance SLA: None (testing only)
```

**appsettings.DEV.json:**
```json
{
  "TestExecution": {
    "BrowserToTest": "Chromium",
    "Headless": true
  },
  "Authentication": {
    "TenantId": "dev-tenant-id",
    "ClientId": "dev-client-id",
    "BaseUrl": "https://bidday-dev.destini.com"
  },
  "Database": {
    "AzureSql": "Server=bidday-dev.database.windows.net;Database=BidDay_DEV;..."
  }
}
```

### QA Environment
```
Endpoint: https://bidday-qa.destini.com
Database: Azure SQL (QA instance, closer to prod schema)
EventStore: PostgreSQL (QA instance)
AD B2C: QA tenant
Test Users: qa-user@test.destini.com (managed by QA)
Data Reset: On-demand by QA team
Performance SLA: Monitored
```

**appsettings.QA.json:**
```json
{
  "TestExecution": {
    "BrowserToTest": "Chromium",
    "Headless": true,
    "RecordTestRun": true
  },
  "Authentication": {
    "TenantId": "qa-tenant-id",
    "ClientId": "qa-client-id",
    "BaseUrl": "https://bidday-qa.destini.com"
  },
  "Database": {
    "AzureSql": "Server=bidday-qa.database.windows.net;Database=BidDay_QA;..."
  }
}
```

---

## 📊 Test Data Management

### Data Setup Strategy

```
┌────────────────────────────────────────────┐
│ Test Execution Starts                      │
├────────────────────────────────────────────┤
│                                            │
│ 1. Backup production database              │
│    └─ AzureSql.BackupAsync("QA_DB")       │
│                                            │
│ 2. Restore from baseline                   │
│    └─ AzureSql.RestoreAsync("BidDay_QA")  │
│                                            │
│ 3. Run migration scripts                   │
│    └─ teststep_RunDatabaseMigration()     │
│                                            │
│ 4. Seed test users (via Azure AD B2C)     │
│    └─ TestConfiguration.LoadTestUsers()   │
│                                            │
│ 5. Create test data (per-test)             │
│    └─ teststep_CreateProject()            │
│                                            │
│ 6. Run test                                │
│                                            │
│ 7. Cleanup (optional)                      │
│    └─ Delete created project/data         │
│                                            │
└────────────────────────────────────────────┘
```

### Data Isolation

```
Test 1                    Test 2
├─ ProjectId: 1001        ├─ ProjectId: 2001
├─ BidderId: 101          ├─ BidderId: 201
└─ LineItemId: 1001       └─ LineItemId: 2001

Multi-tenant isolation:
├─ Tenant A (Client A data only)
├─ Tenant B (Client B data only)
└─ Tenant C (Test data — isolated)
```

---

## 🔒 Security & Secrets Management

### Azure KeyVault

```
KeyVault: destini-bidday-kv

Secrets stored:
├─ azure-sql-password
├─ postgres-password
├─ ad-b2c-client-secret
├─ command-service-api-key
└─ azure-storage-connection-string

Access:
├─ Test agents (managed identity)
├─ Developers (VPN + MFA)
└─ CI/CD (service principal)
```

### Local Development (User Secrets)

```bash
# Initialize user secrets (per developer)
dotnet user-secrets init --project DESTINI.BidDay.UI.Tests.csproj

# Set secrets locally (encrypted)
dotnet user-secrets set "Authentication:TenantId" "dev-id"
dotnet user-secrets set "Database:AzureSql" "Server=...;Password=***"

# Stored at: %APPDATA%\Microsoft\UserSecrets\[id]\secrets.json (encrypted)
```

---

## 📈 Monitoring & Observability

### Test Execution Metrics

```
┌─────────────────────────────────────────┐
│ Azure DevOps Test Results Dashboard      │
├─────────────────────────────────────────┤
│                                          │
│ Metrics:                                │
│ ├─ Total tests: 48                      │
│ ├─ Pass rate: 95.8% (46/48)             │
│ ├─ Avg duration: 32 seconds             │
│ ├─ Longest test: LineItems RollUp (5s)  │
│ ├─ Most flaky: EventFallbacks.cs (2%)   │
│ └─ Trend: ↑ +2.5% (1 week)             │
│                                          │
│ Failures:                               │
│ ├─ BidDaySettings.AdminFees             │
│ │  └─ Error: "Timeout waiting for Fee"  │
│ └─ BidResponses.RollUps                 │
│    └─ Error: "SQL connection timeout"   │
│                                          │
│ Performance:                            │
│ ├─ Browser launch: 3.2s                 │
│ ├─ Sign in: 4.1s                        │
│ ├─ Test setup: 2.5s per test (avg)      │
│ └─ Cleanup: 1.2s per test               │
│                                          │
└─────────────────────────────────────────┘
```

### Application Insights (Optional)

```csharp
// Instrument test execution
var telemetryClient = new TelemetryClient();

[SetUp]
public async Task BaseSetup()
{
    var operation = telemetryClient.StartOperation<RequestTelemetry>(
        TestContext.CurrentContext.Test.Name);
    
    // ... test setup ...
    
    telemetryClient.StopOperation(operation);
}
```

---

## 🚀 Deployment Checklist

**Antes de rodar testes em novo ambiente:**

- [ ] .NET 8.0 SDK instalado
- [ ] Playwright browsers instalado (`pwsh bin/Install-PlaywrightBrowsers.ps1`)
- [ ] appsettings.json configurado
- [ ] User secrets configurado (local)
- [ ] Azure KeyVault acesso autorizado (CI/CD)
- [ ] Database migration testado
- [ ] Conectividade com backends verificada
- [ ] Azure AD B2C tenant acessível
- [ ] Proxy/firewall rules permitindo saída (se applicable)
- [ ] Test data seeded
- [ ] ExtentReports output directory existe

---

## 📋 Troubleshooting Deployment Issues

| Problema | Causa | Solução |
|----------|-------|---------|
| `Timeout waiting for Playwright` | Browser não launch | Verificar se `bin/` existe, instalar browsers |
| `SQL Connection timeout` | DB não acessível | Verificar connection string, firewall rules |
| `Azure AD login failed` | Credenciais inválidas | Verificar user secrets, token refresh |
| `Test data creation fails` | DB em estado inconsistente | Fazer restore de backup |
| `ExtentReports error` | Diretório não existe | Criar diretório TestResults/ |
| `Port already in use` | Conflito com outra instância | Matar processo anterior ou mudar port |

---

## 🔄 Backup & Recovery

### Automated Backups

```
Daily @ 2 AM UTC:
└─ Azure SQL automated backup (7-day retention)
└─ PostgreSQL automated backup (35-day retention)
└─ Test results archived to Azure Blob Storage
```

### Manual Recovery

```bash
# Restore to point-in-time (PITR)
az sql db restore --resource-group destini-rg \
  --server bidday-qa \
  --name BidDay_QA \
  --restore-point-in-time "2026-05-20T12:00:00Z"

# Verify restored database
SELECT COUNT(*) FROM BidProjects; -- should match checkpoint
```

---

## ✅ Production Readiness

**Before shipping tests to production:**

- [ ] All flaky tests fixed (retry logic, waits)
- [ ] Performance baselines established
- [ ] Security review passed (no hardcoded secrets)
- [ ] Documentation complete
- [ ] Team trained on running tests
- [ ] CI/CD pipeline validated (dry run on prod-like env)
- [ ] Runbook created for common issues
- [ ] Monitoring alerts configured
- [ ] Backup/recovery tested
- [ ] Capacity planning done (agents, storage, quotas)

---

**Gerado pelo Reversa — Architect Agent**
