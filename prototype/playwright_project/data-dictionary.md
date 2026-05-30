# Data Dictionary — DESTINI.BidDay.UI.Tests.Playwright

**Escopo:** Estruturas de dados, modelos de teste, e entidades de domínio
**Data:** 2026-05-20
**Confiança:** 🟢 CONFIRMADO (verificado em Models/)

---

## 📋 Índice

1. [Entidades de Domínio](#entidades-de-domínio)
2. [Modelos de Teste](#modelos-de-teste)
3. [Enumerações](#enumerações)
4. [Tipos Utilitários](#tipos-utilitários)

---

## Entidades de Domínio

### 1. BidProject (Projeto de Licitação)

Contexto raiz que contém packages, requisitos, taxas e configurações de licitação.

| Campo | Tipo | Obrigatoriedade | Descrição | Padrão |
|-------|------|-----------------|-----------|--------|
| ProjectName | string | ✅ Obrigatório | Nome único do projeto | Guid.NewGuid() em testes |
| HardBid | bool | ❌ Opcional | Licitação firme vs. estimada | `false` |
| Subtitle | string | ❌ Opcional | Subtítulo descritivo | "" |
| Address | string | ❌ Opcional | Endereço do projeto | "" |
| AptSuiteBldg | string | ❌ Opcional | Apt/Suite/Building | "" |
| City | string | ❌ Opcional | Cidade | "" |
| State | string | ❌ Opcional | Estado/Província | "" |
| Zip | string | ❌ Opcional | CEP/Código postal | "" (formato: 5 dígitos) |
| Country | string | ❌ Opcional | País | "" |
| BidDueDate | DateTime? | ❌ Opcional | Data de vencimento da licitação | Today + 0-30 dias |
| ProjectStartDate | DateTime? | ❌ Opcional | Data de início do projeto | BidDueDate + 10-100 dias |
| ProjectCompletionDate | DateTime? | ❌ Opcional | Data de conclusão | StartDate + 6-24 meses |
| Owner | string | ❌ Opcional | Nome do proprietário | "" |
| Architect | string | ❌ Opcional | Nome do arquiteto | "" |
| TotalBuildingArea | string | ❌ Opcional | Área total (valor) | 5,000-100,000 |
| TotalBuildingAreaUnit | string | ❌ Opcional | Unidade (IN, FT, YD, etc.) | Unitunidade aleatória |
| TotalSiteArea | string | ❌ Opcional | Área do terreno (valor) | Building + 0-100,000 |
| TotalSiteAreaUnit | string | ❌ Opcional | Unidade do terreno | Unidade aleatória |
| IsClosed | bool | ❌ Opcional | Projeto fechado (read-only) | `false` |
| ImageUri | string | ❌ Opcional | URI da imagem do projeto | "" |
| IncludedBidPackages | List<BidPackage> | ❌ Opcional | Pacotes contidos | [] |
| GeneralRequirements | List<Requirement> | ❌ Opcional | Requisitos gerais | [] |
| Alternates | List<Alternate> | ❌ Opcional | Alternativas ao projeto | [] |
| Fees | List<Fee> | ❌ Opcional | Taxas aplicáveis | [] |
| ProjectAdmins | List<string> | ❌ Opcional | Emails dos admins | [] |
| Contributors | List<string> | ❌ Opcional | Emails de contribuintes | [] |

**Relacionamentos:**
- BidProject 1:N BidPackage
- BidProject 1:N Requirement
- BidProject 1:N Alternate
- BidProject 1:N Fee

**Validações:**
- ProjectName não vazio, comprimento máximo 255
- Zip em formato válido (5 dígitos para EUA)
- BidDueDate ≤ ProjectStartDate ≤ ProjectCompletionDate
- TotalBuildingArea ≤ TotalSiteArea

---

### 2. BidPackage (Pacote de Licitação)

Grupo de itens, requisitos e trades pertencentes a um projeto.

| Campo | Tipo | Obrigatoriedade | Descrição | Padrão |
|-------|------|-----------------|-----------|--------|
| PackageId | int | ✅ PK | ID único | Auto (database) |
| ProjectId | int | ✅ FK | ID do projeto pai | |
| Code | string | ✅ Obrigatório | Código único (ex: "01.40") | Alfanumérico, comprimento 10 |
| Description | string | ✅ Obrigatório | Nome do pacote | |
| DueDate | DateTime | ❌ Opcional | Data de vencimento (override) | Herdado do projeto |
| IsClosed | bool | ❌ Opcional | Pacote fechado | `false` |
| LineItems | List<LineItem> | ❌ Opcional | Itens de linha | [] |
| Requirements | List<Requirement> | ❌ Opcional | Requisitos (herança) | [] |
| Trades | List<Trade> | ❌ Opcional | Trades associados | [] |

**Validações:**
- Code único dentro do projeto (compound PK: ProjectId + Code)
- Description não vazio
- IsClosed: uma vez true, não pode voltar a false

---

### 3. LineItem (Item de Linha de Licitação)

Item individual de custo/quantidade em um pacote.

| Campo | Tipo | Obrigatoriedade | Descrição | Padrão |
|-------|------|-----------------|-----------|--------|
| LineItemId | int | ✅ PK | ID único | Auto |
| BidPackageId | int | ✅ FK | Pacote pai | |
| Description | string | ✅ Obrigatório | Descrição do item | |
| Quantity | decimal | ✅ Obrigatório | Quantidade | Precisão: 2 casas decimais |
| Unit | string | ✅ Obrigatório | Unidade (IN, FT, YD, etc.) | Enum units |
| UnitPrice | decimal | ✅ Obrigatório | Preço unitário | Currency (2 casas decimais) |
| DisplayOrder | int | ❌ Opcional | Ordem de exibição | Sequencial (0, 1, 2...) |
| Extended | decimal | 🔄 Calculado | Quantity × UnitPrice | Read-only |

**Validações:**
- Quantity > 0
- UnitPrice ≥ 0
- Unit em lista permitida

---

### 4. Bidder (Licitante)

Empresa/pessoa licitando na project.

| Campo | Tipo | Obrigatoriedade | Descrição | Padrão |
|-------|------|-----------------|-----------|--------|
| BidderId | int | ✅ PK | ID único | Auto |
| ProjectId | int | ✅ FK | Projeto | |
| CompanyName | string | ✅ Obrigatório | Nome da empresa | Comprimento máximo 255 |
| ContactName | string | ✅ Obrigatório | Nome de contato | |
| Email | string | ✅ Obrigatório | Email | Formato válido de email |
| PhoneNumber | string | ✅ Obrigatório | Telefone | Formato válido (10-15 dígitos) |
| BidResponses | List<BidResponse> | ❌ Opcional | Respostas deste licitante | [] |

**Validações:**
- Email único dentro do projeto
- Email em formato válido (regex ou library)
- PhoneNumber contém apenas dígitos e símbolos (- , +)

---

### 5. Fee (Taxa)

Taxa aplicável a licitações (pode ser percentual ou valor fixo).

| Campo | Tipo | Obrigatoriedade | Descrição | Padrão |
|-------|------|-----------------|-----------|--------|
| FeeId | int | ✅ PK | ID único | Auto |
| ProjectId | int | ✅ FK | Projeto | |
| Name | string | ✅ Obrigatório | Nome da taxa | "Admin Fee", "Handling Fee" |
| FeeType | enum | ✅ Obrigatório | Tipo: Percentage \| FixedAmount | |
| Percentage | decimal? | ❌ Condicional | % (se FeeType = Percentage) | 0-100, 2 casas |
| FixedAmount | decimal? | ❌ Condicional | $ (se FeeType = FixedAmount) | 2 casas |
| ApplicableTo | List<string> | ❌ Opcional | Pacotes onde se aplica | [] (vazio = todos) |

**Validações:**
- (FeeType = Percentage && Percentage != null && FixedAmount = null) XOR (FeeType = FixedAmount && FixedAmount != null && Percentage = null)
- Percentage: 0-100
- FixedAmount ≥ 0

**Cálculo de fee:**
```csharp
decimal CalculateFee(decimal subtotal)
{
    return FeeType == "Percentage" 
        ? subtotal * (Percentage / 100) 
        : FixedAmount;
}
```

---

### 6. BidResponse (Resposta de Licitação)

Aggregation da licitação completa de um licitante.

| Campo | Tipo | Obrigatoriedade | Descrição | Padrão |
|-------|------|-----------------|-----------|--------|
| BidResponseId | int | ✅ PK | ID único | Auto |
| BidderId | int | ✅ FK | Licitante | |
| PackageId | int | ✅ FK | Pacote licitado | |
| Subtotal | decimal | 🔄 Calculado | Σ(LineItems) | Read-only |
| AdjustmentAmount | decimal | ❌ Opcional | Desconto/Prêmio | 2 casas |
| TotalFees | decimal | 🔄 Calculado | Σ(Fees aplicáveis) | Read-only |
| GrandTotal | decimal | 🔄 Calculado | Subtotal ± Adjustment + Fees | Read-only |
| LineItemResponses | List<LineItemResponse> | ❌ Opcional | Bids por item | [] |
| RequirementResponses | List<RequirementResponse> | ❌ Opcional | Respostas a requisitos | [] |

**Cálculos:**
```csharp
Subtotal = LineItemResponses.Sum(r => r.Amount);
TotalFees = ApplicableFees.Sum(f => f.Calculate(Subtotal));
GrandTotal = Subtotal + AdjustmentAmount + TotalFees;
```

---

### 7. Requirement (Requisito/Condição)

Requisito geral ou específico de trade.

| Campo | Tipo | Obrigatoriedade | Descrição | Padrão |
|-------|------|-----------------|-----------|--------|
| RequirementId | int | ✅ PK | ID único | Auto |
| ProjectId | int | ✅ FK | Projeto | |
| Description | string | ✅ Obrigatório | Texto do requisito | |
| RequirementType | enum | ✅ Obrigatório | General \| Trade | |
| TradeId | int? | ❌ Condicional | Trade (se Trade-specific) | |
| IsRequired | bool | ✅ Obrigatório | Obrigatório responder | `true` |
| ResponseType | enum | ✅ Obrigatório | YesNo \| TextInput \| MultiSelect | |

**Validações:**
- Se RequirementType = Trade, TradeId NOT NULL
- Description não vazio

---

## Modelos de Teste

### TestUser (Usuário de Teste)

| Campo | Tipo | Valores | Descrição |
|-------|------|--------|-----------|
| Email | string | "allroles@test.com", "contributor@test.com", etc. | Email da conta Azure AD B2C |
| Password | string | (do UserSecrets) | Senha (confidencial) |
| Name | string | "All Roles", "Contributor", "Admin", "Viewer" | Nome legível |
| Roles | string[] | ["ProjectAdmin", "Contributor"], etc. | Roles no aplicativo |

**Usuários predefinidos:**
- `TestUser.AllRoles` — Acesso total (setup/teardown)
- `TestUser.Contributor` — Entrada de dados
- `TestUser.Admin` — Configurações
- `TestUser.Viewer` — Somente leitura

---

### Configuration (TestConfiguration)

| Campo | Tipo | Fonte | Descrição |
|-------|------|--------|-----------|
| SiteUrl | string | appsettings / CONFIG | URL base da aplicação |
| Environment | string | "DEV" \| "QA" | Ambiente |
| Browser | enum | "Chromium" \| "Firefox" \| "WebKit" | Browser a usar |
| BidDayQueryDbConnectionString | string | appsettings (secrets) | Connection SQL Server |
| EventStoreConnectionString | string | appsettings (secrets) | Connection PostgreSQL |
| ApplicationId | string | Azure AD B2C | Client ID do app |
| ROPCUrl | string | Azure AD B2C | Token endpoint |
| CommandServiceUrl | string | appsettings | URL do Command Service |

---

## Enumerações

### Enums.Page

```csharp
public enum Page
{
    Home,
    SignIn,
    BidPackage,
    BidSummary,
    ErrorPage,
    FrozenEntities,
    Unfreeze,
    ClientSupport,
    SettingsBidPackages,
    SettingsDirectory,
    SettingsFees,
    SettingsGeneralConditions,
    SettingsGeneralRequirements,
    SettingsPreferences,
    SettingsUnitsOfMeasure,
    SettingsUserPermissions
}
```

### Enums.Browser

```csharp
public enum Browser { Chromium, Firefox, WebKit }
```

### Enums.RunGroup

```csharp
public enum RunGroup { Nightly, Smoke, Regression, Parallel }
```

### Enums.TestRun

```csharp
public enum TestRun { Nightly, Quick, Manual }
```

### Permission States

```csharp
public enum PermissionState
{
    Allowed,      // Explicitamente permitido
    Denied,       // Explicitamente negado
    Inherit       // Herdar do role pai
}
```

### Fee Types

```csharp
public enum FeeType
{
    Percentage,   // Taxa como percentual do subtotal
    FixedAmount   // Taxa como valor fixo
}
```

---

## Tipos Utilitários

### Alternate (Alternativa de Licitação)

| Campo | Tipo | Descrição |
|-------|------|-----------|
| AlternateId | int | ID único |
| ProjectId | int | Projeto |
| Description | string | Descrição da alternativa |
| Cost | decimal | Custo incremental ou desconto |
| IsMandatory | bool | Obrigatório incluir no bid |

---

### Condition (Condição Geral)

| Campo | Tipo | Descrição |
|-------|------|-----------|
| ConditionId | int | ID único |
| ProjectId | int | Projeto |
| Text | string | Texto da condição |
| DisplayOrder | int | Ordem de exibição |

---

### Trade (Especialidade/Categoria)

| Campo | Tipo | Descrição |
|-------|------|-----------|
| TradeId | int | ID único |
| ProjectId | int | Projeto |
| Code | string | Código (ex: "01", "02") |
| Name | string | Nome (ex: "General", "Mechanical") |

---

## Restrições e Regras de Negócio

### 1. Ciclo de Vida do Projeto

```
Draft → Open for Bidding → Closed (read-only) → Archived
```

### 2. Ciclo de Vida de Pacote

```
Active → Closed (read-only)
```

Quando um pacote é fechado:
- Sem novas respostas são aceitas
- Existing responses ficam read-only
- BidResponses.GrandTotal é imutável

### 3. Validação de Resposta

- Bidder deve responder a todos os requisitos obrigatórios
- LineItem bids devem estar dentro de [minBid, maxBid] se configurado
- Attachments devem ser PDF/DOC/DOCX com tamanho máximo 10MB

### 4. Cálculo de GrandTotal

```
GrandTotal = Subtotal + Adjustments + ApplicableFees

Where:
  Subtotal = Σ(LineItem.Extended) = Σ(Quantity × UnitPrice)
  Adjustments = Flat discounts/premiums (pode ser negativo)
  ApplicableFees = Σ(Fee.Calculate(Subtotal)) para fees aplicáveis
```

### 5. Permissão de Edição por Estado

| Campo | Draft | Open | Closed |
|-------|-------|------|--------|
| LineItem amount | ✅ Rw | ✅ Rw | ❌ RO |
| Requirement response | ✅ Rw | ✅ Rw | ❌ RO |
| Notes | ✅ Rw | ✅ Rw | ✅ Rw |
| Package metadata | ✅ Rw | ❌ RO | ❌ RO |

---

## Tamanhos de Dados Típicos

| Entidade | Quantidade Típica | Nível Crítico |
|----------|-------------------|---------------|
| Projects | 5-50 | 100+ |
| BidPackages/Project | 3-10 | 50+ |
| LineItems/Package | 10-100 | 1000+ |
| Bidders/Project | 10-50 | 200+ |
| Fees/Project | 2-10 | 50+ |
| Requirements/Project | 5-50 | 200+ |

---

## Observações

1. **Confiança:** 🟢 CONFIRMADO — Verificado direto em Models/*.cs
2. **Tipos de dados:** Precisão de 2 casas decimais para monetários; DateTime em UTC
3. **Validações:** Aplicadas tanto no client (Playwright) quanto no server (Command Service)
4. **Soft deletes:** Algumas entidades usam IsClosed ao invés de delete hard (projects, packages)
