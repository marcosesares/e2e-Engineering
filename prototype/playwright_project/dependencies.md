# Dependências — DESTINI.BidDay.UI.Tests.Playwright

**Data:** 2026-05-20  
**Formato:** NuGet (.NET 8.0)

---

## 📦 Dependências Diretas (do .csproj)

### Testing & Automation

| Pacote | Versão | Propósito |
|--------|--------|----------|
| **Microsoft.Playwright.NUnit** | 1.51.0 | Framework de automação Playwright para .NET com suporte NUnit |
| **NUnit** | 4.4.0 | Framework de testes unitários e funcionais |
| **NUnit3TestAdapter** | 4.6.0 | Adapter para rodar testes NUnit via Test Explorer |
| **NUnit.Analyzers** | 4.4.0 | Analyzers para otimizar testes NUnit |
| **Microsoft.NET.Test.Sdk** | 17.8.0 | SDK de testes .NET (test discovery, execution) |

### Assertion & Validation

| Pacote | Versão | Propósito |
|--------|--------|----------|
| **FluentAssertions** | 6.7.0 | DSL fluente para assertions mais legíveis e com mensagens detalhadas |

### Reporting & Logging

| Pacote | Versão | Propósito |
|--------|--------|----------|
| **ExtentReports** | 5.0.2 | Geração de relatórios HTML interativos |

### Data & Configuration

| Pacote | Versão | Propósito |
|--------|--------|----------|
| **ExcelDataReader** | 3.6.0 | Leitura de arquivos Excel (.xls, .xlsx) para dados de teste |
| **ExcelDataReader.DataSet** | 3.6.0 | Extensão para mapear Excel para DataSet |
| **Microsoft.Extensions.Configuration** | 9.0.0 | API para carregar e gerenciar configurações |
| **Microsoft.Extensions.Configuration.Abstractions** | 9.0.0 | Abstrações para providers de configuração |
| **Microsoft.Extensions.Configuration.Binder** | 9.0.0 | Binding de seções de config para objects |
| **Microsoft.Extensions.Configuration.EnvironmentVariables** | 9.0.0 | Provider de variáveis de ambiente |
| **Microsoft.Extensions.Configuration.UserSecrets** | 9.0.0 | Provider de User Secrets (.NET secrets manager) |
| **Microsoft.Extensions.DependencyInjection.Abstractions** | 9.0.0 | Abstrações para DI container |
| **Microsoft.Extensions.Http** | 9.0.0 | Factory para HttpClient com DI |
| **Microsoft.Extensions.Logging.Abstractions** | 9.0.0 | Abstrações para logging |

### Database

| Pacote | Versão | Propósito |
|--------|--------|----------|
| **Microsoft.Data.SqlClient** | 5.1.5 | Driver para SQL Server / Azure SQL |
| **Npgsql** | 7.0.7 | Driver para PostgreSQL (Event Store) |

### Utilities

| Pacote | Versão | Propósito |
|--------|--------|----------|
| **TextCopy** | 6.1.0 | Copy/paste com clipboard do sistema |

---

## 📌 Dependências de Projeto

| Projeto | Tipo | Propósito |
|---------|------|----------|
| `DESTINI.BidDay.Commands` | ProjectReference | Commands da aplicação (domain commands) |
| `DESTINI.BidDay.QueryModel` | ProjectReference | Read models (query side) |
| `DESTINI.Testing.Common` | ProjectReference | Base compartilhada (TestConfigurationBase) |

---

## 🌐 Dependências Transitivas (inferred)

### Via Microsoft.Playwright.NUnit

- **Playwright** (JavaScript runtime incluído)
- **Microsoft.Playwright** (bindings para API Playwright)
- Browsers pré-compilados (Chromium, Firefox, WebKit)

### Via ExtentReports

- **Newtonsoft.Json** (JSON serialization)

### Via Microsoft.Extensions.*

- **Microsoft.Bcl.AsyncInterfaces**
- **System.Runtime.Caching**
- Suporte a configuração multi-provider

### Localizadas no build

- Arquivos de recurso para múltiplas linguagens (en, es, fr, ja, pt-BR, etc.)
- Runtimes nativos para Playwright (Windows, Linux, macOS)

---

## 🔗 Integrações Externas

### Serviços Consumidos

| Serviço | Protocolo | Autenticação | Propósito |
|---------|-----------|--------------|----------|
| **Command Service** | HTTP/REST | Azure AD B2C (ROPC flow) | Executar commands backend |
| **Azure SQL Server** | TDS | SQL Auth | Query database (read-write) |
| **PostgreSQL Event Store** | PostgreSQL protocol | Connection string | Event sourcing (read-only) |
| **Azure AD B2C** | OAuth 2.0 | ROPC (Resource Owner Password Credentials) | Autenticação de usuários |

---

## 📊 Árvore de Dependências (principais)

```
DESTINI.BidDay.UI.Tests
├── Testing
│   ├── Microsoft.Playwright.NUnit (1.51.0)
│   │   └── Microsoft.Playwright
│   │       └── [Browsers binários]
│   ├── NUnit (4.4.0)
│   │   └── NUnit3TestAdapter
│   └── FluentAssertions (6.7.0)
├── Reporting
│   └── ExtentReports (5.0.2)
│       └── Newtonsoft.Json
├── Data
│   ├── ExcelDataReader (3.6.0)
│   │   └── ExcelDataReader.DataSet
│   ├── Microsoft.Data.SqlClient (5.1.5)
│   └── Npgsql (7.0.7)
├── Configuration
│   ├── Microsoft.Extensions.Configuration (9.0.0)
│   ├── Microsoft.Extensions.Configuration.UserSecrets (9.0.0)
│   ├── Microsoft.Extensions.Configuration.EnvironmentVariables (9.0.0)
│   └── Microsoft.Extensions.Configuration.Binder (9.0.0)
├── DI & HTTP
│   ├── Microsoft.Extensions.DependencyInjection.Abstractions (9.0.0)
│   └── Microsoft.Extensions.Http (9.0.0)
└── Projetos Internos
    ├── DESTINI.BidDay.Commands
    ├── DESTINI.BidDay.QueryModel
    └── DESTINI.Testing.Common
        └── [Depends on Extensions, DI, etc.]
```

---

## ⚙️ Versioning Strategy

- **.NET 8.0** — Target framework (LTS)
- **NUnit 4.4.0** — Latest stable
- **Playwright 1.51.0** — Latest stable (browser automation)
- **FluentAssertions 6.7.0** — Latest stable (assertions)
- **Microsoft.Extensions.*** (9.0.0) — Latest stable (.NET 9 compatible)
- **ExtentReports 5.0.2** — Stable reporting

---

## 🔐 Segurança & Secrets

### User Secrets (.NET Secrets Manager)

Armazenado em `%APPDATA%\Microsoft\UserSecrets\0735fed7-90ad-49df-a326-24329fe6cb14\secrets.json`

Contém:
- Azure SQL Server credentials (UserId, Password)
- Azure AD B2C credentials (ApplicationId, ROPC_Url)
- Command Service URL e scope
- Site URL

### Configuration Providers (em ordem de precedência)

1. **appsettings.json** — Base defaults
2. **appsettings.{Environment}.json** — Environment overrides (DEV, QA)
3. **Environment Variables** — System/process level
4. **User Secrets** — Local development secrets

---

## 📈 Dependência do Gerenciador de Pacotes

- **Package Manager:** NuGet (Microsoft.NET.Sdk)
- **Lock File:** Não presente (modernos .NET usa transitive closure)
- **Target Framework:** net8.0 (single TFM)

---

## 🚀 Build & Runtime

### Incluídos no Output

- Binários de testes compilados (.dll)
- Dependências NuGet (bin/Debug/net8.0/)
- Browsers Playwright pré-compilados (.playwright/node/...)
- SQL scripts embedded (Database/AzureSQL/*)
- Configuration files (appsettings.*.json)

### Não Incluídos (desenvolvimento only)

- Projeto DESTINI.BidDay.Commands (linked, não copiado)
- Projeto DESTINI.BidDay.QueryModel (linked, não copiado)
- Projeto DESTINI.Testing.Common (linked, não copiado)

---

## 🔄 Compatibilidade

| Aspecto | Compatibilidade |
|---------|-----------------|
| **.NET Versions** | 8.0 (LTS) |
| **OS** | Windows, Linux, macOS (Playwright) |
| **Browsers** | Chromium, Firefox, WebKit (via Playwright) |
| **SQL Versions** | SQL Server 2016+ (via Microsoft.Data.SqlClient) |
| **PostgreSQL** | 9.5+ (via Npgsql) |

---

## 📝 Notas

1. **Playwright Browsers:** Automaticamente instalados via NuGet (incluídos em Microsoft.Playwright.NUnit)
2. **UserSecrets:** Desenvolvedor local deve configurar via `dotnet user-secrets set`
3. **ExtentReports:** Gera relatórios HTML em `Output/TestRun/`
4. **ExcelDataReader:** Suporta .xls e .xlsx (lê-se apenas, não escreve)
5. **Npgsql:** PostgreSQL driver é read-only neste projeto (sincronização de dados)
