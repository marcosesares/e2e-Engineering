# Spec Impact Matrix — DESTINI.BidDay.UI.Tests.Playwright

**Escopo:** Rastreabilidade de impacto entre componentes da aplicação  
**Data:** 2026-05-20  
**Confiança:** 🟢 CONFIRMADO

---

## 🎯 Matriz de Impacto

Mostra qual componente impacta qual ao sofrer mudanças (read → depends on, write → impacts).

### Legenda

| Símbolo | Significado | Ação Necessária |
|---------|------------|-----------------|
| ✅ | Impacto direto confirmado | Testar |
| ⚠️ | Impacto potencial | Verificar |
| ❌ | Sem impacto direto | Revisar |
| 🔴 | Impacto crítico (blocking) | Urgent |

---

## 📊 Matriz Completa

```
                        ↓ Impacts →
Component              | Features | Specs | Tests | DB Queries | RBAC | Calc |
──────────────────────┼──────────┼───────┼───────┼────────────┼──────┼──────┤
BidProject (aggregate) | ✅ All   | ✅    | ✅    | ✅ All     | ✅   | ✅   |
BidPackage            | ✅ Most  | ✅    | ✅    | ✅ Pkg Qry  | ✅   | ✅   |
LineItem              | ✅ Resp  | ⚠️    | ✅    | ✅ Line Qry | ✅   | 🔴   |
Fee Calculation       | ✅ All   | ✅    | ✅    | ✅ Rollups  | ✅   | 🔴   |
RBAC Matrix           | ⚠️ Perm  | ✅    | ✅    | ✅ Users    | 🔴   | ❌   |
Permission Check      | ✅ All   | ✅    | ✅    | ✅ Roles    | 🔴   | ❌   |
Extended Amount       | ✅ Resp  | ✅    | ✅    | ✅ LineResp | ❌   | 🔴   |
Event Store           | ⚠️ Sync  | ✅    | ✅    | ✅ EventLog | ❌   | ❌   |
Query DB Sync         | ✅ Sync  | ✅    | ✅    | 🔴 All     | ❌   | ❌   |
Azure AD B2C          | ✅ Auth  | ✅    | ✅    | ✅ Users    | 🔴   | ❌   |
```

---

## 🔗 Dependências Detalhadas

### Component: **LineItem**

**Se LineItem é alterado:**

| Impactado | Tipo | Severidade | Ação | Justificativa |
|-----------|------|-----------|------|---------------|
| Extended Amount Calculation | Formula | 🔴 Critical | Re-test | Extended = Qty × Price |
| Line Item Responses | Data Model | ⚠️ High | Verify | Respostas usam LineItem ref |
| Bid Rollups | Calculation | 🔴 Critical | Re-calc | Subtotal depende de LineItems |
| LineItems Page Object | UI Automation | ✅ Medium | Update | Locators podem mudar |
| teststep_AddLineItem | Test Step | ✅ Medium | Update | Campos de entrada podem mudar |
| LineItems.cs Test Case | Test Logic | ✅ Medium | Update | Assertions baseado em LineItem |

**Exemplos de mudanças e impacto:**

1. **Adicionar campo `Notes` a LineItem**
   - ✅ UI: Add input field em LineItemsModal
   - ✅ Test: Add assertion para notes
   - ⚠️ Calculation: Verificar se não afeta Extended

2. **Mudar Quantity de decimal para int**
   - 🔴 Calculation: Extended = int × Price (truncação?)
   - ✅ Test: Testar valores fracionários
   - ✅ DB: Verificar precision/scale

---

### Component: **Fee Calculation**

**Se Fee é alterado:**

| Impactado | Tipo | Severidade | Ação | Justificativa |
|-----------|------|-----------|------|---------------|
| GrandTotal Calculation | Formula | 🔴 Critical | Re-calc | GrandTotal = Subtotal + Fees |
| BidResponse Rollups | Calculation | 🔴 Critical | Re-test | Fees aplicadas a responses |
| Fee Admin Pages | UI Automation | ✅ Medium | Update | Fee form pode mudar |
| teststep_*Fee methods | Test Step | ✅ Medium | Update | Fee entry steps |
| Fee Calculation Tests | Test Logic | 🔴 Critical | Update | 100% coverage em cálculos |
| Query DB (Fees table) | Schema | ⚠️ High | Migrate | Campos adicionados |

**Exemplos de mudanças:**

1. **Adicionar novo FeeType: "PercentageOfSubtotal"**
   - 🔴 Calculation: GrandTotal = Subtotal + (Subtotal × Percentage)
   - ✅ Test: Adicionar test case para novo tipo
   - ⚠️ DB: Add enumeração ou validação

2. **Remover FeeType "SUBTOTAL", consolidar em "Percentage"**
   - 🔴 Migration: Converter dados existentes
   - ✅ Test: Remover testes do tipo removido
   - ⚠️ Backwards compatibility: Verificar

---

### Component: **RBAC Matrix (Permissions)**

**Se Permission é alterado:**

| Impactado | Tipo | Severidade | Ação | Justificativa |
|-----------|------|-----------|------|---------------|
| Feature Visibility | UI | 🔴 Critical | Re-test | Button/field may hide |
| API Authorization | Backend | 🔴 Critical | Verify | Endpoint reject if no perm |
| Permission Check Logic | Code | ✅ High | Update | Evaluation rules mudam |
| UserPermissionsMatrix Page | UI | ✅ Medium | Update | Permission toggles mudam |
| teststep_SetUserPermission | Test Step | ✅ Medium | Update | Parâmetros de permissão |
| Permission Tests | Test Logic | 🔴 Critical | Update | 100% coverage |

**Exemplos:**

1. **Adicionar role "TeamLead"**
   - ✅ Test: Criar TestUser com TeamLead role
   - ✅ TestCase: Adicionar test para permissões de TeamLead
   - ⚠️ DB: Add nova role em ROLE_PERMISSIONS

2. **Remover CanApprove flag, usar workflow step approval**
   - 🔴 Calculation: Approval logic muda
   - ✅ Test: Testes de approval precisam de update
   - ⚠️ Breaking change: Validar dados legados

---

### Component: **Event Store Sync**

**Se Event Store ou Sync Logic é alterado:**

| Impactado | Tipo | Severidade | Ação | Justificativa |
|-----------|------|-----------|------|---------------|
| Query Database Consistency | Data | 🔴 Critical | Verify sync | Dados podem desincronizar |
| EventFallbacks Tests | Test | 🔴 Critical | Re-test | Sync verification |
| QueryDbSync Queries | Test | ✅ High | Update | SQL queries específicas |
| teststep_VerifySyncConsistency | Test Step | ✅ High | Update | Verificação de consistência |
| Migration Scripts | DB | ⚠️ High | Review | Schema changes |
| BidDayApplicationEntities Test | Test | ✅ Medium | Update | Entidades replayed |

**Exemplos:**

1. **Mudar frequency de sync de "instant" para "batched" (5 min)**
   - ⚠️ Test: Teststeps precisam Wait() para consistency
   - ✅ Timeout: Aumentar em assertions de query
   - 🔴 Test: Adicionar batch consistency test

2. **Adicionar novo evento "LineItemDeletedEvent"**
   - ✅ Event Handler: Mapear para Query model
   - ✅ Test: Adicionar DeleteLineItem test case
   - ⚠️ Sync: Atualizar lógica de fallback

---

### Component: **BidPackage State (IsClosed, LockedByUser)**

**Se state machine é alterado:**

| Impactado | Tipo | Severidade | Ação | Justificativa |
|-----------|------|-----------|------|---------------|
| Package Edit Operations | Business Logic | 🔴 Critical | Re-test | Closed package blocks edits |
| Pessimistic Lock Handling | Concurrency | 🔴 Critical | Re-test | Lock prevents other users |
| BidPackagePage UI | UI | ✅ Medium | Update | Locked state indicators |
| teststep_AddLineItem | Test Step | ✅ Medium | Verify | Fail if package closed |
| Package State Tests | Test Logic | 🔴 Critical | Add cases | Closed + locked scenarios |
| EventProcessor Logic | Sync | ⚠️ High | Review | Event processing rules |

**Exemplos:**

1. **Adicionar estado "PENDING_APPROVAL" entre OPEN e CLOSED**
   - ✅ Test: Adicionar test para fluxo OPEN→PENDING→CLOSED
   - ✅ UI: Mostrar "Awaiting Approval" status
   - 🔴 Calculation: Bloquear edits em PENDING?

2. **Remover LockedByUser, usar database-level pessimistic lock**
   - ⚠️ Migration: Remover coluna
   - ✅ Test: Testar lock via unique constraint
   - 🔴 Concurrency: Ajustar timeout/retry logic

---

## 📈 Change Impact Assessment (CIA) Matrix

Quando uma mudança é proposta, usar esta matriz para avaliar escopo:

### Escala de Impacto

| Impacto | Testes | Specs | Código | DB | Severidade |
|---------|--------|-------|--------|----|-----------
| ✅ Low | 1-3 | Minor | 1 componente | Schema soft | 🟢 Green |
| ⚠️ Medium | 4-10 | Medium | 2-3 componentes | Add column | 🟡 Yellow |
| 🔴 High | 10+ | Major | 4+ componentes | Migrate | 🔴 Red |

### Exemplo: Adicionar novo FeeType

```
Mudança: "FeeType: 'DynamicPercentage'"
  ├─ Testes: 5-8 novos + 3 regressions = ⚠️ Medium
  ├─ Specs: Fee spec precisa atualizar = ⚠️ Medium
  ├─ Código: 2-3 componentes (Fee, Calculation, Validator) = ⚠️ Medium
  ├─ DB: Add enum value = ✅ Low
  └─ Severidade geral: 🟡 Yellow (MEDIUM)
```

---

## 🔍 Rastreabilidade Reversa

**Quem testa cada feature/component:**

| Feature | Test Cases | Test Steps | Page Objects | Status |
|---------|-----------|-----------|-------------|--------|
| **Bidders** | Bidders.cs | TestStep.Bidders.cs | BidderModal.cs | 🟢 Complete |
| **BidDaySettings** | 8 test files | 8 TestStep.*.cs | 8 Settings.*.Page.cs | 🟢 Complete |
| **BidResponses** | 6 test files | TestStep.BidResponses.cs | BidPackagePage.*.cs | 🟢 Complete |
| **BidPackageNotes** | BidPackageNotes.cs | TestStep.BidPackageNotes.cs | NotesModal.cs | 🟢 Complete |
| **BidSummaryPageEdits** | BidSummaryPageEdits.cs | TestStep.BidSummaryEdits.cs | BidSummaryPage.*.cs | 🟢 Complete |
| **EnvironmentSetup** | 3 test files | TestStep.Database.cs | N/A | 🟢 Complete |
| **EventFallbacks** | 3 test files | TestStep.Fallback.cs | FrozenEntitiesPage.cs | 🟢 Complete |
| **LineItems** | LineItems.cs | TestStep.LineItems.cs | LineItemsModal.cs | 🟢 Complete |
| **UserPermissionsMatrix** | UserPermissionsMatrix.cs | TestStep.UserPermissionMatrix.cs | Settings.UserPermissionsPage.cs | 🟢 Complete |

---

## 🚨 Critical Paths

Mudanças nestes componentes têm cascata severa:

1. **LineItem Extended Calculation** 🔴
   - Afeta: Fee, GrandTotal, Rollups, Reports
   - Testes impactados: 10+
   - Risco: Data corruption se erro

2. **RBAC Permission Evaluation** 🔴
   - Afeta: Todas as operações CRUD
   - Testes impactados: 20+
   - Risco: Security hole se erro

3. **BidPackage State Machine** 🔴
   - Afeta: All edit operations, locks
   - Testes impactados: 15+
   - Risco: Data loss se transição errada

4. **Event Store → Query DB Sync** 🔴
   - Afeta: Data consistency, reports
   - Testes impactados: 8+
   - Risco: Data mismatch across systems

---

## 📋 Change Checklist

Quando alterar um componente crítico, validar:

- [ ] Unit tests cobrindo nova lógica
- [ ] Integration tests com dependent systems
- [ ] UI tests refletindo novo comportamento
- [ ] Database migration tested
- [ ] Backwards compatibility verificada (se aplicável)
- [ ] Performance impact avaliado
- [ ] Specs atualizadas
- [ ] Documentation updated
- [ ] Rollback plan definido
- [ ] Security review completo

---

**Gerado pelo Reversa — Architect Agent**
