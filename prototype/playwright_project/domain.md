# Domain Model — DESTINI.BidDay.UI.Tests.Playwright

**Escopo:** Glossário de negócio, regras de domínio e invariantes implícitas  
**Data:** 2026-05-20  
**Confiança:** 🟢 CONFIRMADO (código) | 🟡 INFERIDO (padrões)

---

## 📋 Glossário de Domínio

### Entidades Centrais

#### BidProject (Projeto de Licitação)
Agregado raiz que encapsula toda uma licitação de projetos. Contém pacotes, requisitos, taxas e configurações.

| Termo | Definição | Exemplos |
|-------|-----------|----------|
| **ProjectName** | Identificador único do projeto, atribuído pelo usuário | "Downtown Office Complex", "Bridge Renovation Phase 2" |
| **HardBid** | Booleano indicando se é licitação firme (hard) ou estimada (soft) | `true` = licitação firme; `false` = estimativa |
| **BidDueDate** | Data máxima para submissão de licitações pelos contratados | "2026-06-15" |
| **ProjectStartDate** | Data planejada de início da obra | "2026-07-01" |
| **ProjectCompletionDate** | Data planejada de conclusão | "2027-12-31" |
| **IsClosed** | Booleano read-only indicando conclusão do processo | `false` = aberto; `true` = fechado (irreversível) |

**Validações:**
- ProjectName: não vazio, comprimento máx. 255
- BidDueDate ≤ ProjectStartDate ≤ ProjectCompletionDate (ordem temporal)
- TotalBuildingArea ≤ TotalSiteArea (tamanho do site ≥ prédio)
- Zip: padrão regional (ex: EUA = 5 dígitos)

---

#### BidPackage (Pacote de Licitação)
Subdivisão de um projeto contendo itens de custo, requisitos, trades e licitantes.

| Termo | Definição | Exemplos |
|-------|-----------|----------|
| **Code** | Identificador único dentro do projeto (chave composta: ProjectId + Code) | "01.40", "A.1.1" |
| **Description** | Nome descritivo do pacote | "Structural Steel", "HVAC System" |
| **DueDate** | Data de vencimento específica do pacote (override de projeto) | Herdada de BidProject se não definida |
| **IsClosed** | Booleano indicando pacote fechado (irreversível, como projeto) | `false` = aberto; `true` = fechado |
| **LockedByUser** | Identidade do usuário que travou pessimisticamente o pacote | "john.doe@company.com" ou `null` |
| **ContingencyPercentage** | Percentual de contingência aplicado a totalizações | 0-100, 2 casas decimais |

**Validações:**
- Code: único (ProjectId, Code)
- Description: não vazio
- IsClosed: uma vez `true`, não pode reverter para `false`

**Regras de negócio:**
- 🟡 INFERIDO: Pacote fechado impede inserção/edição de itens
- 🟡 INFERIDO: Travamento pessimista (LockedByUser != null) bloqueia edições de outro usuário

---

#### LineItem (Item de Linha)
Linha individual de custo dentro de um pacote, representando uma quantidade de um serviço/material.

| Termo | Definição | Exemplos |
|-------|-----------|----------|
| **Description** | Descrição do item | "Steel Beams #10x20" |
| **Quantity** | Quantidade solicitada | 150 (precisão: 2 casas decimais) |
| **Unit** | Unidade de medida | "FT" (pé), "SQFT" (pé quadrado), "YD" (jarda), etc. |
| **UnitPrice** | Preço por unidade (moeda) | $125.50 (2 casas decimais) |
| **Extended** | Total = Quantity × UnitPrice (calculado, read-only) | 150 × $125.50 = $18,825.00 |

**Validações:**
- Quantity > 0
- UnitPrice ≥ 0
- Unit em lista permitida (vide `UnitOfMeasure`)
- DisplayOrder: sequencial (0, 1, 2...) para ordenação

---

#### Bidder (Licitante)
Empresa ou pessoa qualificada para licitar um projeto.

| Termo | Definição | Exemplos |
|-------|-----------|----------|
| **CompanyName** | Nome legal da empresa | "Turner Construction", "ABC Mechanical" |
| **ContactName** | Representante contatável | "Jane Smith" |
| **Email** | Endereço de email único (por projeto) | "contact@turner.com" |
| **PhoneNumber** | Número de contato (formato validado) | "+1-555-0123" ou "(555) 012-3456" |

**Validações:**
- Email: único dentro do projeto, formato válido (RFC 5322)
- PhoneNumber: 10-15 dígitos, permite símbolos (-, +, espaço, parênteses)

---

#### Fee (Taxa)
Encargo percentual ou valor fixo aplicável a subtotalizações de licitação.

| Termo | Definição | Exemplos |
|-------|-----------|----------|
| **Name** | Rótulo da taxa | "Admin Fee", "Handling Fee", "Sales Tax" |
| **FeeType** | Tipo de cálculo (enumeração) | "% OF BID", "% OF TOTAL", "LUMP SUM", "% OF <ref>" |
| **Amount** | Valor ou percentual | "5" (para 5% ou $5), null (para SUBTOTAL) |
| **ApplicableTo** | Lista de códigos BidPackage | ["01.40", "02.20"] ou [] (aplica a todos) |

**Regras de cálculo:**

```
FeeType = "% OF BID"        → taxa = (bid_subtotal × amount/100)
FeeType = "% OF TOTAL"      → taxa = (total_anterior × amount/100)
FeeType = "LUMP SUM"        → taxa = amount (valor fixo)
FeeType = "% OF <ref>"      → taxa = (ref_fee_value × amount/100)
FeeType = "SUBTOTAL"        → amount = null (derivado, não inserido)
```

**Validações:**
- XOR: (FeeType=Percentage && Percentage!=null && FixedAmount=null) ⊕ (FeeType=FixedAmount && FixedAmount!=null && Percentage=null)
- Percentage: 0-100
- FixedAmount ≥ 0

---

### Entidades de Suporte

#### Requirement (Requisito)
Especificação de conformidade obrigatória.

| Termo | Definição |
|-------|-----------|
| **Description** | Texto do requisito | "All materials must meet ASTM standards" |
| **IsApplicable** | Booleano: aplica a pacotes específicos ou ao projeto inteiro | `true` = obrigatório; `false` = opcional |

#### Condition (Condição)
Condição geral contratual.

| Termo | Definição |
|-------|-----------|
| **Description** | Texto da condição | "Payment: Net 30 days" |
| **DisplayOrder** | Ordem de apresentação | 1, 2, 3... |

#### Trade (Especialidade)
Classificação de trabalho (ex: Elétrica, Hidráulica, Estrutural).

| Termo | Definição |
|-------|-----------|
| **Code** | Identificador da especialidade | "01.40" (CSI MasterFormat) |
| **Description** | Nome da especialidade | "Structural Steel" |

#### Alternate (Alternativa)
Opção adicional de custo não incluída na licitação-base.

| Termo | Definição |
|-------|-----------|
| **Description** | Descrição da alternativa | "Add underground parking" |
| **Amount** | Custo incremental | $50,000.00 |

#### UnitOfMeasure (Unidade de Medida)
Definição de unidade de quantidade (suporta conversão).

| Termo | Definição |
|-------|-----------|
| **Code** | Código da unidade | "FT", "YD", "SQFT" |
| **Description** | Nome | "Foot (linear)" |
| **ConversionFactor** | Fator para unidade-padrão | 1 FT = 0.333 YD |

---

## 🔄 Regras de Negócio Implícitas

### Restrições de Estado

#### Projeto Fechado
```
IF BidProject.IsClosed = true
  THEN:
    - Nenhum BidPackage pode ser adicionado/editado/deletado
    - Nenhuma Fee pode ser modificada
    - Nenhum Requirement pode ser inserido
    - Licitantes podem visualizar (read-only)
  INVARIANTE: IsClosed = true é irreversível (não pode reabrir)
```

#### Pacote Fechado
```
IF BidPackage.IsClosed = true
  THEN:
    - Nenhum LineItem pode ser adicionado/editado/deletado
    - Pacote fica read-only
  INVARIANTE: IsClosed = true é irreversível dentro do projeto
```

#### Travamento Pessimista
```
IF BidPackage.LockedByUser != null
  THEN:
    - Somente o usuário em LockedByUser pode editar
    - Outros usuários veem aviso de travamento
    - Timeout implícito libera travamento após inatividade
```

### Restrições Temporais

```
BidDueDate ≤ ProjectStartDate ≤ ProjectCompletionDate

VIOLAÇÃO DETECTADA: Erro de validação ao criar/editar projeto
```

### Integridade de Dados

#### Unicidade
- **BidProject.ProjectName**: Único (por tenant)
- **BidPackage.Code**: Único por (ProjectId, Code)
- **Bidder.Email**: Único por (ProjectId, Email)
- **LineItem.DisplayOrder**: Sequencial (gap-free) dentro de um BidPackage

#### Referencial
- Remover BidProject → Cascata delete BidPackages, Fees, Requirements
- Remover BidPackage → Cascata delete LineItems
- Remover Bidder → Remover BidResponses associadas (soft-delete possível)

---

## 🎯 Invariantes de Domínio

### Cálculo de Totalizações (RollUp)

```csharp
LineItem.Extended = Quantity × UnitPrice  // Sempre calculado, nunca armazenado
BidPackage.Subtotal = SUM(LineItem.Extended)
BidPackage.Total = Subtotal + Adjustments + SUM(ApplicableFees)
BidProject.GrandTotal = SUM(BidPackage.Total) + SUM(AlternateAmounts)
```

**Invariante:** Todas as totalizações devem ser recomputadas após qualquer alteração em LineItem, Fee ou Adjustment.

### Lógica de Alternativas

```
BidResponse.AlternateSelection:
  - Se SelectionType = "Include"  → AlternateAmount deve ser adicionada
  - Se SelectionType = "Exclude"  → AlternateAmount = $0
  - Se SelectionType = "Optional" → Licitante escolhe incluir/excluir
```

---

## 🟢 / 🟡 Confiança de Cada Termo

| Termo | Confiança | Justificativa |
|-------|-----------|---------------|
| BidProject, BidPackage, LineItem, Bidder, Fee | 🟢 | Extraído diretamente de Models/*.cs |
| IsClosed irreversível | 🟡 | Inferido de Data Dictionary, não explícito em código |
| LockedByUser comportamento | 🟡 | Presença de campo + padrão comum, não testado |
| Cascata delete | 🔴 | LACUNA — requer verif. no backend/migrations |
| Timeout travamento | 🔴 | LACUNA — requer verif. em CommandService ou eventProcessor |

---

## ❓ Lacunas Identificadas

1. **Soft-delete vs Hard-delete**: Bidders deletados têm BidResponses órfãs?
2. **Auditoria**: Quem fez quê, quando? Existe audit trail de alterações?
3. **Concorrência**: Como sistema lida com edições simultâneas de mesmo pacote?
4. **Versionamento**: BidProject/Package têm histórico de versões?
5. **Permissões por Pacote**: Quem pode editar qual pacote? (cf. UserPermissionsMatrix)
