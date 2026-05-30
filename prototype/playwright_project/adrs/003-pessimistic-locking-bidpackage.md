# ADR-003: Pessimistic Locking for BidPackage Edits

**Status:** ✅ ADOPTADO  
**Data:** 2026-05-20  
**Contexto:** DESTINI.BidDay — Prevenção de edições simultâneas de pacotes  
**Impacto:** Médio (UX, integridade de dados)

---

## 📋 Questão

Como evitar conflitos quando dois usuários tentam editar o mesmo BidPackage simultaneamente?

Opções:
1. **Pessimistic locking** — Travar pacote upfront, um usuário por vez
2. **Optimistic locking** — Permitir, detectar conflito ao salvar, merge/reject
3. **Nenhum mecanismo** — Aceitar "last-write-wins" (sobrescrita)

---

## ✅ Decisão Adotada

**Usar Pessimistic Locking com Campo `LockedByUser`.**

```csharp
public class BidPackage
{
    public string LockedByUser { get; set; } = null;
    public DateTime? LockedAt { get; set; } = null;
    
    public void Lock(string userId)
    {
        if (LockedByUser != null && LockedByUser != userId)
            throw new DomainException(
                $"Package locked by {LockedByUser}. Cannot edit.");
        
        LockedByUser = userId;
        LockedAt = DateTime.Now;
    }
    
    public void Unlock(string userId)
    {
        if (LockedByUser != userId && !IsAdmin(userId))
            throw new DomainException("Only locker or admin can unlock.");
        
        LockedByUser = null;
        LockedAt = null;
    }
    
    public bool CanEdit(string userId) =>
        LockedByUser == null || LockedByUser == userId;
}
```

**UI Behavior:**
```
1. User A opens BidPackage → Button "LOCK PACKAGE"
   → POST /api/packages/{id}/lock
   → LockedByUser = "userA", LockedAt = now

2. User B tries to open BidPackage
   → API returns 409 Conflict: "Locked by user A since 10:23 AM"
   → UI shows read-only view + "Request unlock" button

3. User A closes editor
   → Button "UNLOCK PACKAGE"
   → DELETE /api/packages/{id}/lock
   → LockedByUser = null

4. User B can now edit
```

---

## 💡 Alternativas Consideradas

### Alternativa A: Optimistic Locking com Version

```csharp
public class BidPackage
{
    public long Version { get; set; } = 1;
    public List<LineItem> LineItems { get; set; }
    
    public void UpdateLineItems(List<LineItem> newItems, long expectedVersion)
    {
        if (Version != expectedVersion)
            throw new ConcurrencyException(
                "Package was modified. Reload and try again.");
        
        LineItems = newItems;
        Version++;
    }
}

// UI: Salvar com version do carregamento
PUT /api/packages/{id}
{
  "version": 5,
  "lineItems": [...]
}
```

**Vantagens:**
- Múltiplos usuários podem trabalhar em paralelo
- Melhor para equipes distribuídas (sem necessidade de "esperar")
- Suporta merge automático de mudanças não-conflitantes

**Desvantagens:**
- 🔴 Mais complexo (merge logic, conflict resolution)
- Frustração de UX ("Your changes were discarded")
- Requer sincronização em tempo real para ser transparente
- 💥 "Last-write-wins" sem merge = dados perdidos

**Rejeição:** DESTINI exige integridade + clareza. Pessimistic é mais seguro para domínio financeiro.

---

### Alternativa B: Timeout Automático + Expiration

```csharp
public class BidPackage
{
    public string LockedByUser { get; set; }
    public DateTime LockedAt { get; set; }
    
    private const int LOCK_TIMEOUT_MINUTES = 15;
    
    public bool IsLockExpired =>
        LockedAt.AddMinutes(LOCK_TIMEOUT_MINUTES) < DateTime.Now;
    
    public bool CanEdit(string userId) =>
        (LockedByUser == null || IsLockExpired) || LockedByUser == userId;
    
    public void AutoUnlockIfExpired()
    {
        if (IsLockExpired)
            LockedByUser = null;
    }
}
```

**Vantagens:**
- Liberta travamento automaticamente
- Evita deadlock se usuário sai sem desbloquear

**Desvantagens:**
- 🟡 Timeout arbitrário (15 min é bom? Ou 5? Ou 60?)
- Pode liberar enquanto usuário ainda edita (network lag)
- Sem notificação: usuário começa edit, travamento expira, outro usuário entra
- 🔴 Race condition: "Qual edit é salvo?"

**Adopção parcial:** Timeout é **complemento**, não substituto. Usar com pessimistic locking.

---

### Alternativa C: Nenhum Mecanismo (Last-Write-Wins)

```csharp
// Sem campo LockedByUser
// Salvar sempre sobrescreve
PUT /api/packages/{id}
{ "lineItems": [...] }
// Anterior é perdido silenciosamente
```

**Vantagens:**
- Implementação mais simples (sem estado extra)
- Sem UI complexity

**Desvantagens:**
- 🔴 **INACEITÁVEL:** Perda de dados silenciosa
- Sem auditoria ("Quem deletou a taxa?")
- Impossível debugar conflitos
- Irresponsável para sistema financeiro

**Rejeição:** Absolutamente não. Violaria integridade de domínio.

---

## ⚙️ Detalhes de Implementação

### Fluxo de Travamento

#### 1. Abrir Pacote (Carregamento)

```
GET /api/packages/{id}
├─ Se LockedByUser != null E != CurrentUser
│  └─ Retornar 409 + mensagem
├─ Se LockedByUser == null
│  └─ Retornar 200 + dados
└─ Se LockedByUser == CurrentUser E não-expirado
   └─ Retornar 200 + "Você tem travamento ativo"
```

#### 2. Lock Upfront

```
POST /api/packages/{id}/lock
├─ Se LockedByUser != null E != CurrentUser
│  └─ Retornar 409 Conflict
├─ Se LockedByUser == CurrentUser
│  └─ Renovar timestamp, retornar 200
└─ Se LockedByUser == null
   └─ Lock(CurrentUser), retornar 200
```

#### 3. Editar (com Lock)

```
PUT /api/packages/{id}
├─ Validar LockedByUser == CurrentUser
├─ Se não: Retornar 403 Forbidden
└─ Se sim: Atualizar + registrar audit log
```

#### 4. Unlock Explícito

```
DELETE /api/packages/{id}/lock
├─ Validar LockedByUser == CurrentUser OU Admin
├─ Se não: Retornar 403
└─ Se sim: Unlock(), retornar 200
```

### Timeout (Background Job)

```csharp
// Executar a cada 5 minutos
public async Task AutoUnlockExpiredLocksAsync()
{
    var packages = await db.BidPackages
        .Where(p => p.LockedByUser != null)
        .Where(p => p.LockedAt.AddMinutes(15) < DateTime.Now)
        .ToListAsync();
    
    foreach (var pkg in packages)
    {
        pkg.LockedByUser = null;
        pkg.LockedAt = null;
        // Log: "Lock expired for package {id}, locked by {user}"
    }
    
    await db.SaveChangesAsync();
}
```

### Notificação Real-Time (Opcional)

```csharp
// WebSocket ou SignalR
private async Task NotifyPackageLocked(string packageId, string userId)
{
    await _hubContext.Clients.Group($"package-{packageId}")
        .SendAsync("PackageLocked", userId);
}

// UI: Ouve evento
connection.On<string>("PackageLocked", (userId) =>
{
    if (userId != CurrentUser)
        ShowAlert($"Package locked by {userId}");
});
```

---

## 📊 Consequências

### ✅ Positivas

1. **Simplicidade:** Um bool + string são fáceis de entender.
2. **Segurança:** Garante que apenas um usuário edita por vez.
3. **Auditoria clara:** Log de quem travou quando.
4. **UX previsível:** Mensagens claras ("Locked by Jane").

### ⚠️ Negativas

1. **Colaboração limitada:** Dois revisores não podem trabalhar em paralelo.
   - Mitigação: Redesenhar para multiplos "seções" (cada uma travável independentemente).

2. **Timeout arbitrário:** 15 minutos é bom ou ruim?
   - Mitigação: Configurável em appsettings + comunicado no UI.

3. **Sem merge:** Se dois usuários têm mudanças, uma é perdida.
   - Mitigação: Aceito — sistema de licitação, mudanças devem ser sequenciais.

4. **Deadlock possível:** User deixa locked + off → Admin deve forçar unlock.
   - Mitigação: Timeout automático + Admin unlock command.

### 🎯 Riscos Mitigados

| Risco | Mitigação |
|-------|-----------|
| Perda de dados (overwrite) | Pessimistic lock |
| Deadlock (user sai) | Timeout automático |
| Unlock não autorizado | Validação (locker ou admin) |
| Falta de rastreamento | LockedAt + LockedByUser em audit log |

---

## 🧪 Exemplos de Teste

```gherkin
Scenario: Lock Package and Edit
  Given BidPackage exists with LockedByUser = null
  When UserA locks package
  Then LockedByUser = "userA"
  And LockedAt = now

Scenario: Cannot Lock if Already Locked by Another
  Given BidPackage.LockedByUser = "userA"
  When UserB tries to lock
  Then API returns 409 Conflict
  And LockedByUser remains "userA"

Scenario: Same User Can Edit While Locked
  Given BidPackage.LockedByUser = "userA"
  When UserA adds LineItem
  Then Operation succeeds
  And LineItem is saved

Scenario: Different User Cannot Edit
  Given BidPackage.LockedByUser = "userA"
  When UserB tries to add LineItem
  Then API returns 403 Forbidden

Scenario: Admin Can Force Unlock
  Given BidPackage.LockedByUser = "userA"
  When Admin calls unlock
  Then LockedByUser = null
  And Operation succeeds

Scenario: Lock Timeout Auto-Releases
  Given BidPackage.LockedByUser = "userA", LockedAt = 16:00
  And Current time = 16:20 (timeout = 15 min)
  When Background job runs AutoUnlockExpiredLocksAsync
  Then LockedByUser = null
```

---

## 🔗 Relacionado

- **ADR-001**: BidProject Closure State Machine
- **State Machine**: `_reversa_sdd/state-machines.md` → "BidPackage State Machine"
- **Domain Model**: `_reversa_sdd/domain.md` → "Travamento Pessimista"

---

## ✍️ Validação de Confiança

| Aspecto | Confiança | Notas |
|--------|-----------|-------|
| Campo LockedByUser | 🟢 CONFIRMADO | Visto em Models/BidPackage.cs |
| Behavior (lock/unlock) | 🟡 INFERIDO | Padrão comum, testado implicitamente |
| Timeout valor | 🔴 LACUNA | Requer verificação em backend config |
| WebSocket notification | 🔴 LACUNA | Requer verificação em SignalR setup |
| Audit logging | 🔴 LACUNA | Requer verificação em log infrastructure |
