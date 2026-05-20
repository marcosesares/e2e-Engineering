# ADR-002: Fee Calculation Strategy (Percentage vs Fixed vs Reference)

**Status:** ✅ ADOPTADO  
**Data:** 2026-05-20  
**Contexto:** DESTINI.BidDay — Cálculo de taxas em respostas de licitação  
**Impacto:** Alto (acurácia financeira, integridade de cálculos)

---

## 📋 Questão

Como calcular taxas de forma flexível quando pode-se ter:
- Percentual do bid base (`% OF BID`)
- Percentual do total anterior (`% OF TOTAL`)
- Valor fixo (`LUMP SUM`)
- Referência a outra taxa (`% OF <fee_name>`)
- Linha sem cálculo (`SUBTOTAL`)

Sem erros de arredondamento, ambiguidade, ou cascata recursiva?

---

## ✅ Decisão Adotada

**Usar Switch/Case com Tipos Explícitos + Conversão de Percentual.**

```csharp
public class Fee
{
    public string FeeType { get; set; } // "% OF BID", "LUMP SUM", etc.
    public decimal? Percentage { get; set; }
    public decimal? FixedAmount { get; set; }
    
    public (int type, string referenceFee) GetConvertedFeeType()
    {
        return FeeType?.ToUpper() switch
        {
            "% OF BID"     => (0, null),
            "% OF TOTAL"   => (1, null),
            "SUBTOTAL"     => (3, null),
            "LUMP SUM"     => (4, null),
            _              => (2, FeeType.Replace("% of ", "")) // "% OF <ref>"
        };
    }
    
    public decimal? GetConvertedFeeAmount()
    {
        return FeeType?.ToUpper() switch
        {
            "LUMP SUM"   => FixedAmount,
            "SUBTOTAL"   => null, // Não calcula
            _            => Percentage / 100m // Converte % para decimal
        };
    }
}

// Aplicação no cálculo de resposta
public decimal CalculateFeeAmount(BidResponse bid, Fee fee)
{
    var (type, refName) = fee.GetConvertedFeeType();
    var amount = fee.GetConvertedFeeAmount() ?? 0m;
    
    return type switch
    {
        0 => bid.Subtotal * amount,           // % OF BID
        1 => bid.TotalBeforeFee * amount,     // % OF TOTAL
        2 => CalculateFeeAmount(bid, GetFeeByName(refName)) * amount,  // % OF <ref>
        3 => 0m,                              // SUBTOTAL (não calcula)
        4 => amount,                          // LUMP SUM
        _ => 0m
    };
}
```

---

## 💡 Alternativas Consideradas

### Alternativa A: Enum Typesafe + Sealed Classes (F# Style)

```csharp
public abstract record Fee
{
    public sealed record PercentageOfBid(decimal Percentage) : Fee;
    public sealed record PercentageOfTotal(decimal Percentage) : Fee;
    public sealed record LumpSum(decimal Amount) : Fee;
    public sealed record Subtotal : Fee;
    public sealed record PercentageOfFee(string ReferenceFee, decimal Percentage) : Fee;
}

// Pattern matching
public decimal Calculate(BidResponse bid, Fee fee) => fee switch
{
    Fee.PercentageOfBid f    => bid.Subtotal * (f.Percentage / 100m),
    Fee.PercentageOfTotal f  => bid.TotalBeforeFee * (f.Percentage / 100m),
    Fee.LumpSum f            => f.Amount,
    Fee.Subtotal             => 0m,
    Fee.PercentageOfFee f    => 
        Calculate(bid, GetFeeByName(f.ReferenceFee)) * (f.Percentage / 100m),
    _                        => throw new ArgumentException()
};
```

**Vantagens:**
- Typesafe (não mistura Percentage e FixedAmount)
- Compiler garante todos os casos cobertos
- Leitura mais clara (cada subtipo é obvio)

**Desvantagens:**
- Mais verboso (5 subclasses)
- Serialização/desserialização complexa (JSON precisa discriminador)
- Overhead para codebase pequeno
- 🔴 Requer C# 9+ e domínio alto de pattern matching

**Rejeição:** Overkill para DESTINI. Formato string é aceito pelo backend; bom-suficiente.

---

### Alternativa B: Magic Numbers + Bitwise Flags

```csharp
public const int FEE_PERCENT_OF_BID   = 0x01;
public const int FEE_PERCENT_OF_TOTAL = 0x02;
public const int FEE_LUMP_SUM         = 0x04;
public const int FEE_SUBTOTAL         = 0x08;

public int FeeTypeFlags { get; set; }

public decimal Calculate() =>
    (FeeTypeFlags & FEE_PERCENT_OF_BID) != 0 ? bid.Subtotal * percentage : 0m;
```

**Vantagens:**
- Compacto (inteiros, rápido)
- Possibilita múltiplos tipos de um fee (ex: "10% OF BID + $50")

**Desvantagens:**
- Ilegível (magic numbers)
- Impossível saber tipo de um fee sem documentação
- 🔴 Dificulta debugging e testes
- Erro off-by-one é silencioso

**Rejeição:** Demasiado obscuro. Prioriza performance em detrimento de clareza (prematura otimização).

---

### Alternativa C: Calculadora Plugável (Strategy Pattern)

```csharp
public interface IFeeCalculator
{
    decimal Calculate(BidResponse bid, Fee fee);
}

public class PercentageOfBidCalculator : IFeeCalculator
{
    public decimal Calculate(BidResponse bid, Fee fee) =>
        bid.Subtotal * (fee.Percentage.Value / 100m);
}

// Factory
var calculator = FeeCalculatorFactory.GetCalculator(fee.FeeType);
var amount = calculator.Calculate(bid, fee);
```

**Vantagens:**
- Extensível (fácil adicionar novo tipo de taxa)
- Testável (mock calculadoras)
- Segue Open/Closed Principle

**Desvantagens:**
- Mais classes = mais complexidade
- Difícil de debugar (saltos entre calculadoras)
- Overkill se tipos são fixos

**Rejeição:** Sistema está fechado (tipos de taxa não variam). Complexidade desnecessária.

---

## ⚙️ Detalhes de Implementação

### Precondução de Validação

Antes de salvar uma Fee, validar:

```csharp
public void ValidateFee(Fee fee)
{
    // Exatamente UM entre Percentage ou FixedAmount é não-null
    var percentageSet = fee.Percentage.HasValue && fee.Percentage.Value > 0;
    var fixedSet = fee.FixedAmount.HasValue && fee.FixedAmount.Value > 0;
    
    if (percentageSet && fixedSet)
        throw new DomainException("Cannot set both percentage and fixed amount.");
    if (!percentageSet && !fixedSet && fee.FeeType != "SUBTOTAL")
        throw new DomainException("Must set either percentage or amount.");
    
    // Validar intervalo
    if (percentageSet && (fee.Percentage.Value < 0 || fee.Percentage.Value > 100))
        throw new DomainException("Percentage must be 0-100.");
    if (fixedSet && fee.FixedAmount.Value < 0)
        throw new DomainException("Fixed amount cannot be negative.");
}
```

### Cascata (PercentageOfFee)

Prevenir ciclo infinito:

```csharp
private HashSet<string> _visited = new();

public decimal CalculateFeeAmount(Fee fee)
{
    var (type, refName) = fee.GetConvertedFeeType();
    
    if (type == 2) // "% OF <ref>"
    {
        if (_visited.Contains(refName))
            throw new DomainException($"Circular fee reference: {refName}");
        
        _visited.Add(refName);
        var refFee = GetFeeByName(refName);
        var result = CalculateFeeAmount(refFee) * (fee.Percentage.Value / 100m);
        _visited.Remove(refName);
        return result;
    }
    
    // ... outros tipos
}
```

### Arredondamento

Usar `decimal` (2 casas) para precisão moeda:

```csharp
public decimal CalculateTotal(List<Fee> fees, decimal subtotal)
{
    decimal total = subtotal;
    
    foreach (var fee in fees)
    {
        var feeAmount = CalculateFeeAmount(fee, subtotal);
        total += Math.Round(feeAmount, 2, MidpointRounding.AwayFromZero);
    }
    
    return Math.Round(total, 2);
}
```

---

## 📊 Consequências

### ✅ Positivas

1. **Flexibilidade:** Suporta 5 tipos diferentes de taxa sem mudar cerne.
2. **Clareza:** String `FeeType` é legível ("% OF BID" é obvio).
3. **Manutenibilidade:** Adicionar novo tipo = novo case no switch.
4. **Compatibilidade:** Backend usa mesmo formato; UI sincroniza.

### ⚠️ Negativas

1. **Sem Type Safety:** String `FeeType` pode ter typo ("% OF BIID"); sem compilação error.
   - Mitigação: Validação em entrada + testes de regex.

2. **Conversão de Percentual:** Division por 100 em múltiplos lugares = duplicação.
   - Mitigação: Centralizar em `GetConvertedFeeAmount()`.

3. **Cascata Recursiva:** `% OF <ref>` pode causar ciclo.
   - Mitigação: Detectar em validação pre-save (vide acima).

### 🎯 Riscos Mitigados

| Risco | Mitigação |
|-------|-----------|
| Cálculo incorreto (% vs $) | Validação XOR de Percentage/FixedAmount |
| Arredondamento financeiro | Usar `decimal`, MidpointRounding.AwayFromZero |
| Ciclo infinito (ref → ref) | Visited set + exception |
| Typo em FeeType | Testes de valores permitidos, regex validation |

---

## 🧪 Exemplos de Teste

```gherkin
Scenario: Calculate 5% of Bid
  Given Fee { FeeType: "% OF BID", Percentage: 5 }
  And Bid Subtotal = $10,000
  When Calculate fee amount
  Then Result = $500

Scenario: Calculate Lump Sum
  Given Fee { FeeType: "LUMP SUM", FixedAmount: 750 }
  When Calculate fee amount
  Then Result = $750

Scenario: Calculate % of Another Fee
  Given Fee1 { FeeType: "% OF BID", Percentage: 5, Name: "Admin" }  → $500
  And Fee2 { FeeType: "% OF Admin", Percentage: 10 }
  When Calculate Fee2
  Then Result = $50 (10% of $500)

Scenario: Reject Circular Reference
  Given Fee1 { Name: "A", FeeType: "% OF B", ... }
  And Fee2 { Name: "B", FeeType: "% OF A", ... }
  When Save Fee2
  Then Exception: Circular fee reference
```

---

## 🔗 Relacionado

- **ADR-001**: BidProject Closure State Machine
- **Domain Model**: `_reversa_sdd/domain.md` → "Fee (Taxa)"
- **Code Analysis**: `_reversa_sdd/code-analysis.md` → "Fee Calculation"

---

## ✍️ Validação de Confiança

| Aspecto | Confiança | Notas |
|--------|-----------|-------|
| FeeType string switch | 🟢 CONFIRMADO | Visto em Models/Fee.cs |
| Cálculo XOR | 🟡 INFERIDO | Lógica de domínio, testada implicitamente |
| Validação circular | 🔴 LACUNA | Requer verificação no backend |
| Arredondamento (moeda) | 🟡 INFERIDO | Padrão financeiro, não explícito |
