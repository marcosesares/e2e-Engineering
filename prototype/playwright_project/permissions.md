# Permissions & RBAC — DESTINI.BidDay.UI.Tests.Playwright

**Escopo:** Role-Based Access Control (RBAC), matriz de permissões, herança de roles  
**Data:** 2026-05-20  
**Confiança:** 🟡 INFERIDO (Test Data, enums em UserRole) | 🔴 LACUNA (regras de cascata completas)

---

## 👥 Papéis de Usuário (Roles)

Extraído de `Enums.UserRole` referenciado em UserPermissions.cs:

| Role | Descrição | Escopo |
|------|-----------|--------|
| **Admin** | Administrador de sistema (superuser) | Sem restrições; acessa todos tenants |
| **ProjectAdmin** | Administrador de projeto específico | Gerencia projeto, BidPackages, Bidders, Requisitos |
| **Contributor** | Participante de licitação (licitante ou revisor interno) | Submete/edita respostas, visualiza pacotes |
| **Viewer** (🟡 Inferido) | Visualizador read-only | Visualiza projetos e relatórios, sem edição |

---

## 🗺️ Matriz de Permissões por Role

### Legenda

| Símbolo | Significado |
|---------|------------|
| ✅ | Permitido |
| ❌ | Negado |
| 🔓 | Condicional (vide notas) |

### BidProject (Projeto)

| Operação | Admin | ProjectAdmin | Contributor | Viewer |
|----------|-------|--------------|-------------|--------|
| **Criar** | ✅ | ✅ | ❌ | ❌ |
| **Editar campos** | ✅ | 🔓 (seu projeto) | ❌ | ❌ |
| **Fechar** | ✅ | 🔓 (ProjectAdmin do projeto) | ❌ | ❌ |
| **Deletar** | ✅ | ❌ | ❌ | ❌ |
| **Visualizar** | ✅ | 🔓 (seu projeto) | 🔓 (convidado) | 🔓 (shared) |
| **Gerenciar Admins** | ✅ | ❌ | ❌ | ❌ |

### BidPackage (Pacote)

| Operação | Admin | ProjectAdmin | Contributor | Viewer |
|----------|-------|--------------|-------------|--------|
| **Adicionar** | ✅ | ✅ | ❌ | ❌ |
| **Editar (aberto)** | ✅ | 🔓 (proprietário/unlock) | 🔓 (se atribuído) | ❌ |
| **Editar (fechado)** | ✅ | ❌ | ❌ | ❌ |
| **Fechar** | ✅ | ✅ | ❌ | ❌ |
| **Travar (lock)** | ✅ | ✅ | ❌ | ❌ |
| **Destravar (unlock)** | ✅ | 🔓 (desbloqueador) | 🔓 (travador original) | ❌ |
| **Deletar** | ✅ | ✅ | ❌ | ❌ |
| **Visualizar** | ✅ | ✅ | 🔓 (convidado) | 🔓 (read-only) |

### LineItem (Item de Linha)

| Operação | Admin | ProjectAdmin | Contributor | Viewer |
|----------|-------|--------------|-------------|--------|
| **Adicionar** | ✅ | ✅ | 🔓 (package aberto + atribuído) | ❌ |
| **Editar** | ✅ | ✅ | 🔓 (package aberto, não travado) | ❌ |
| **Reordenar** | ✅ | ✅ | 🔓 (idem acima) | ❌ |
| **Deletar** | ✅ | ✅ | ❌ | ❌ |
| **Visualizar** | ✅ | ✅ | ✅ | ✅ |

### Fee (Taxa)

| Operação | Admin | ProjectAdmin | Contributor | Viewer |
|----------|-------|--------------|-------------|--------|
| **Criar** | ✅ | ✅ | ❌ | ❌ |
| **Editar** | ✅ | ✅ | ❌ | ❌ |
| **Deletar** | ✅ | ✅ | ❌ | ❌ |
| **Visualizar** | ✅ | ✅ | ✅ | ✅ |

### Requirement (Requisito)

| Operação | Admin | ProjectAdmin | Contributor | Viewer |
|----------|-------|--------------|-------------|--------|
| **Criar/Editar** | ✅ | ✅ | ❌ | ❌ |
| **Deletar** | ✅ | ✅ | ❌ | ❌ |
| **Responder (Bidder)** | ✅ | 🔓 (se contributor) | ✅ | ❌ |
| **Visualizar** | ✅ | ✅ | ✅ | ✅ |

### Bidder (Licitante)

| Operação | Admin | ProjectAdmin | Contributor | Viewer |
|----------|-------|--------------|-------------|--------|
| **Adicionar** | ✅ | ✅ | ❌ | ❌ |
| **Editar** | ✅ | ✅ | 🔓 (read-only se ativo) | ❌ |
| **Deletar** | ✅ | ✅ | ❌ | ❌ |
| **Visualizar** | ✅ | ✅ | ✅ | ✅ |

### Settings (Configurações do Sistema)

| Operação | Admin | ProjectAdmin | Contributor | Viewer |
|----------|-------|--------------|-------------|--------|
| **Gerenciar Usuários** | ✅ | ❌ | ❌ | ❌ |
| **Gerenciar Permissões** | ✅ | ❌ | ❌ | ❌ |
| **Gerenciar Bid Packages** | ✅ | ✅ | ❌ | ❌ |
| **Gerenciar Taxas** | ✅ | ✅ | ❌ | ❌ |
| **Gerenciar Requisitos** | ✅ | ✅ | ❌ | ❌ |
| **Gerenciar Unidades** | ✅ | ❌ | ❌ | ❌ |
| **Visualizar Permissões** | ✅ | 🔓 (seu projeto) | ❌ | ❌ |

---

## 🔐 Herança de Permissões

### Cascata de Roles

```
Admin (superuser)
  ├─ ProjectAdmin [per-project]
  │   ├─ Contributor [per-project]
  │   └─ Viewer [per-project]
  └─ Contributor [global]
      └─ Viewer [global]
```

**Regra de herança:** Um usuário com role X herda todas as permissões de role Y onde Y < X na hierarquia.

Exemplo:
- ProjectAdmin **não** herda permissões de Admin (Admin é superuser, ProjectAdmin é escopo-específico)
- Contributor herda de Viewer (pode fazer tudo que Viewer faz + mais)

### Multi-Tenant Isolation

```
User[email] ∈ Project[id]
  IF Role(User, Project) = ProjectAdmin
    THEN acesso limitado a esse Project
  IF Role(User, *) = Admin
    THEN acesso a todos os Projects
```

**Invariante:** Um ProjectAdmin de Projeto A **não pode** acessar Projeto B (exceto se Admin).

---

## 📍 Restrições por Localidade

**Inferido de UserPermissions.cs:** Usuários têm uma `Location` atribuída.

```csharp
new User("email@company.com", "Arlington", Enums.UserRole.Contributor)
```

| Localidade | Exemplos |
|-----------|----------|
| Arlington | HQ principal |
| Kansas City | Escritório regional |
| Midlothian | Filial |
| Dallas | Filial |

🟡 **INFERIDO:** Localidade pode afetar permissões (Ex: ProjectAdmin de Arlington gerencia projetos locais; permissão cross-location pode estar restrita).

🔴 **LACUNA:** Exato mecanismo de filtragem por localidade não confirmado.

---

## 🔓 Permissões Condicionais (Detalhadas)

### BidPackage.Edit (Aberto)

```
PERMITIDO SE:
  (Role = Admin) OR
  (Role = ProjectAdmin ∧ Project.Admin(User) = true) OR
  (Role = Contributor ∧ BidPackage.AssignedTo = User ∧ BidPackage.LockedByUser = null)
```

### BidPackage.Unlock

```
PERMITIDO SE:
  (Role = Admin) OR
  (Role = ProjectAdmin ∧ Project.Admin(User) = true) OR
  (Role = Contributor ∧ BidPackage.LockedByUser = User.Id)
```

### LineItem.Edit (Package Aberto)

```
PERMITIDO SE:
  (Role = Admin) OR
  (Role = ProjectAdmin ∧ Project.Admin(User) = true) OR
  (Role = Contributor ∧ 
    BidPackage.AssignedTo = User ∧ 
    BidPackage.LockedByUser = null ∧
    BidPackage.IsClosed = false
  )
```

### Requirement.Respond (Bidder)

```
PERMITIDO SE:
  (Role = Contributor ∧ User ∈ BidProject.Bidders) OR
  (Role = ProjectAdmin ∧ Project.Admin(User) = true) OR
  (Role = Admin)
```

---

## 🟡 Permissões Implícitas (Não Documentadas)

1. **View BidProject**: Quem o vê? Apenas Admins do projeto ou também licitantes convidados?
   🟡 INFERIDO: Bidders convidados veem seu próprio projeto.

2. **Edit Own Comments**: Um Contributor pode editar apenas seus próprios comentários?
   🔴 LACUNA: BidPackageNotes.Edit — quem pode editar?

3. **Visualizar Respostas de Outros Licitantes**: Um Bidder vê apenas suas respostas ou as de todos?
   🟡 INFERIDO: Apenas suas próprias (confidencialidade).

4. **Deletar Projeto**: Admin pode deletar um projeto fechado? Soft ou hard delete?
   🔴 LACUNA: Comportamento de deleção não documentado.

---

## 🔐 Aplicação de Permissões (Mecanismo)

### Onde Validar

```
┌─────────────────────────────────────────┐
│ Frontend (React) — informativo          │
│ ├─ Desabilita botões/campos             │
│ └─ Não é barreira segura                │
├─────────────────────────────────────────┤
│ API (CommandService) — enforcement      │
│ ├─ Valida role + permissão              │
│ ├─ Retorna 403 Forbidden se negado      │
│ └─ Log de tentativa negada              │
└─────────────────────────────────────────┘
```

🟢 **Esperado:** Ambas camadas devem validar (defesa em profundidade).

---

## ❓ Lacunas e Pontos a Validar

1. **Herança de role para Contributor global:** Um Contributor que não é ProjectAdmin de nenhum projeto consegue editar LineItems?

2. **Permissões de projeto herdadas:** Se User é ProjectAdmin de Projeto A, consegue editar uma Fee global (aplica a A + B)?

3. **Deletar entidades com histórico:** Deletar Bidder que tem BidResponses — soft ou hard delete?

4. **Permissão "Fechar projeto":** Quem pode fechar? Apenas ProjectAdmin do projeto ou qualquer ProjectAdmin?

5. **Auditoria de negação:** Tentativas de acesso negado são logadas com severity/email?

6. **Expiração de sessão:** Após quanto tempo de inatividade o usuário é desconectado? Afeta travamento (lock)?

---

## 🗂️ Mapeamento para Código

| Artefato | Arquivo Esperado | Status |
|----------|------------------|--------|
| User roles enum | `Enums/UserRole.cs` | 🟢 Encontrado em Tests |
| Permission rules | `Services/Authorization/*` | 🔴 LACUNA — backend não analisado |
| Role inheritance | `Domain/ValueObjects/Role.cs` | 🔴 LACUNA |
| Permission cache | `Infrastructure/PermissionCache.cs` | 🔴 LACUNA |
| Audit logs | `Infrastructure/Audit/*` | 🔴 LACUNA |
