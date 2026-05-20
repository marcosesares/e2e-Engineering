# ADR-001: BidProject & BidPackage Closure State Machine

**Status:** ✅ ADOPTADO  
**Data:** 2026-05-20  
**Contexto:** DESTINI.BidDay UI Tests — Fase de Interpretação  
**Impacto:** Alto (invariantes de domínio, integridade de dados)

---

## 📋 Questão

Como modelar o ciclo de vida de um BidProject e BidPackage de forma que:
1. Uma vez fechado, o projeto/pacote seja imutável (proteger auditoria e relatórios)
2. Fechamento seja irreversível (não reabrir por engano)
3. Cascata seja clara (projeto fechado implica packages fechados)

---

## ✅ Decisão Adotada

**Usar Booleano de Estado Irreversível + Máquina de Estados.**

```csharp
// BidProject
public class BidProject
{
    public bool IsClosed { get; private set; } = false;
    
    public void Close()
    {
        if (IsClosed) throw new InvalidOperationException("Already closed.");
        IsClosed = true; // Irreversível
    }
}

// BidPackage
public class BidPackage
{
    public bool IsClosed { get; private set; } = false;
    
    public void Close()
    {
        if (IsClosed) throw new InvalidOperationException("Already closed.");
        IsClosed = true; // Irreversível
    }
}
```

**Máquina de Estados Simplificada:**
- `OPEN (IsClosed=false)` → `CLOSED (IsClosed=true)` (irreversível)
- Sem estado intermediário

---

## 💡 Alternativas Consideradas

### Alternativa A: Revertibilidade com "Status" Enum

```csharp
public enum ProjectStatus { Active, Inactive, Archived, Deleted }
public ProjectStatus Status { get; set; } = ProjectStatus.Active;
```

**Vantagens:**
- Flexível: permite reverter (`Status = ProjectStatus.Active`)
- Múltiplos estados possíveis (Archived, Deleted separados de Closed)

**Desvantagens:**
- **Risco de negócio:** Acidental reopen poderia invalidar histórico de licitação
- Maior complexidade de validação (quantos estados transitórios?)
- Sem semântica clara de irreversibilidade
- 🔴 Testadores podem "brincar" e reabrir projetos no teste, mascarando bugs

**Rejeição:** Não adotado. Requisito explícito de irreversibilidade.

---

### Alternativa B: Event Sourcing (Apenas Eventos, Sem Status)

```csharp
// Não guardar IsClosed; derivar do histórico
public bool IsClosed => _events.OfType<ProjectClosedEvent>().Any();
```

**Vantagens:**
- Auditoria completa (cada fechamento é um evento)
- Impossível "desfechar" acidentalmente (apenas eventos imutáveis)
- Facilita análise de "quando foi fechado?"

**Desvantagens:**
- Mais complexo (requer replay de eventos em cada query)
- Lento para grandes históricos
- Overhead de armazenamento (PostgreSQL event store vs. SQL Server query)
- 🟡 DESTINI usa Event Sourcing no backend, mas aqui é UI Test suite (não replicar backend)

**Rejeição:** Overkill para testes Playwright. Backend pode usar ES; testes usam modelo simplificado.

---

### Alternativa C: Soft-Delete + Marker Campo

```csharp
public bool IsDeleted { get; set; } = false;
public DateTime? DeletedAt { get; set; } = null;
public string DeletedByUser { get; set; } = null;
```

**Vantagens:**
- Guarda razão e usuário da deleção
- Reversível (set IsDeleted = false, limpar timestamps)

**Desvantagens:**
- Confunde dois conceitos: "closed" (fim de licitação) vs. "deleted" (descarte)
- Mais campos = mais complexidade
- Query deve sempre filtrar `!IsDeleted` (overhead)

**Rejeição:** Projeto não usa soft-delete para BidProject (backend confirm). Desnecessário.

---

## ⚙️ Detalhes de Implementação

### Precondição de Fechamento

**BidProject.Close():**
```
PRECONDITION:
  ∀ pkg ∈ IncludedBidPackages, pkg.IsClosed = true
  
EXECUÇÃO:
  IsClosed ← true
  UpdatedAt ← DateTime.Now
  LastModifiedBy ← CurrentUser
  
PÓS-CONDIÇÃO:
  IsClosed = true (invariante global)
```

**BidPackage.Close():**
```
PRECONDITION:
  IsClosed = false
  
EXECUÇÃO:
  IsClosed ← true
  UpdatedAt ← DateTime.Now
  
PÓS-CONDIÇÃO:
  IsClosed = true
  (LineItems, Fees, Requirements tornam-se read-only)
```

### Restrições Resultantes

Uma vez `IsClosed = true`:

1. **LineItem**: Não pode adicionar/editar/deletar
2. **Fee**: Não pode adicionar/editar/deletar (já calculadas)
3. **Requirement**: Não pode adicionar/editar/deletar
4. **Bidder**: Não pode adicionar/editar/deletar
5. **Visualização**: Operações read-only permitidas

```csharp
public void AddLineItem(LineItem item)
{
    if (IsClosed)
        throw new DomainException("Cannot add line item to closed package.");
    // ...
}
```

---

## 🔄 Fluxo de Teste

```gherkin
Scenario: Close BidPackage
  Given BidProject exists with 1 BidPackage
  And BidPackage is in OPEN state
  When Admin closes BidPackage
  Then BidPackage.IsClosed = true
  And LineItem.Add() throws DomainException
  And Bidder cannot submit new response

Scenario: Cannot Reopen Closed Package
  Given BidPackage.IsClosed = true
  When Admin tries to reopen
  Then Operation raises DomainException
  And IsClosed remains true
```

---

## 📊 Consequências

### ✅ Positivas

1. **Simplicidade:** Lógica booleana é fácil de testar, auditar e compreender.
2. **Performance:** Um bool é mais rápido que replay de eventos.
3. **Conformidade:** Auditoria clara: "Quando foi fechado? Check IsClosed + UpdatedAt."
4. **Segurança:** Irreversibilidade força processo bem definido para reabrir (se necessário).

### ⚠️ Negativas

1. **Sem granularidade:** Não diferencia *por quê* foi fechado (conclusão normal vs. cancelamento).
   - Mitigação: Pode-se adicionar campo `ClosureReason` enum.

2. **Sem histórico de transição:** Não sabe *quando* foi aberto/fechado, apenas estado atual.
   - Mitigação: Adicionar `ClosedAt` timestamp e `ClosedByUser`.

3. **Sem reversão:** Se fechamento foi por engano, precisa de entidade nova (não refaz a antiga).
   - Mitigação: Processo manual com aprovação de Admin antes de fechar.

### 🎯 Riscos Mitigados

| Risco | Mitigação |
|-------|-----------|
| Reopen acidental | Irreversibilidade forçada + teste de sanidade |
| Inconsistência (projeto aberto, package fechado) | Precondição explícita + invariante de cascata |
| Auditoria incompleta | Timestamp + usuário em cada fechamento |

---

## 🔗 Relacionado

- **ADR-002**: Fee Calculation Strategy
- **State Machine**: `_reversa_sdd/state-machines.md`
- **Domain Rules**: `_reversa_sdd/domain.md` → "Invariantes de Domínio"

---

## ✍️ Validação de Confiança

| Aspecto | Confiança | Notas |
|--------|-----------|-------|
| IsClosed booleano | 🟢 CONFIRMADO | Visto em Models/BidProject.cs |
| Irreversibilidade | 🟡 INFERIDO | Lógica de domínio, não explícito em testes |
| Cascata (Proj → Pkg) | 🟡 INFERIDO | Precondição lógica, não confirmada em backend |
| Bloqueio pós-Close | 🔴 LACUNA | Requer verificação em CommandService |
