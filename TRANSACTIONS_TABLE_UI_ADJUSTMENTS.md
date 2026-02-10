# Transactions Table UI Adjustments

## Changes
Updated transactions table layout with expandable icon on the left, improved descriptions, and exchange rate display.

## New Table Structure

### Columns
1. **[Icon]** - Expandable chevron button (left-most column)
2. **Period** - Billing period (e.g., "Feb 2026")
3. **Description** - Transaction description with exchange rate below
4. **Amount (EUR / USD)** - Transaction amounts
5. **Info** - Blank column (reserved for future use)

## Description Format

### Deposits
```
Deposit on <customer-name> in <cost-center>
Exchange Rate: NN.NN
```

**Example:**
```
Deposit on Recube in Training
Exchange Rate: 1.08
```

### Withdrawals (AWS Transactions)
```
Withdrawal on <usage-account> (<usage-id>)
Exchange Rate: NN.NN
```

**Example:**
```
Withdrawal on Dev Sandbox (008848054048)
Exchange Rate: 1.12
```

## Implementation

### Description Logic

**File**: `/components/transactions/transactions-list.tsx`

```typescript
const getDescription = () => {
  if (isDeposit) {
    // Deposit: "Deposit on <customer-name> in <cost-center>"
    const customerName = transaction.accounts?.payer?.name || 'Unknown Customer'
    const costCenter = transaction.details?.costCenterName || 'Unknown Cost Center'
    return `Deposit on ${customerName} in ${costCenter}`
  } else {
    // Transaction: "Withdrawal on <usage-account> (<usage-id>)"
    const usageName = transaction.accounts?.usage?.name || 'Unknown Usage'
    const usageId = transaction.accounts?.usage?.id || 'N/A'
    return `Withdrawal on ${usageName} (${usageId})`
  }
}

const exchangeRate = transaction.exchangeRate || null
```

### Table Structure

**Row Layout:**
```tsx
<tr>
  <td className="w-12">
    <Button variant="ghost" size="sm">
      {isExpanded ? <ChevronDown /> : <ChevronRight />}
    </Button>
  </td>
  <td>Period</td>
  <td>
    <div className="space-y-1">
      <div>{description}</div>
      {exchangeRate && (
        <div className="text-xs text-muted-foreground">
          Exchange Rate: {exchangeRate.toFixed(2)}
        </div>
      )}
    </div>
  </td>
  <td>Amount</td>
  <td></td> {/* Blank Info column */}
</tr>
```

**Header:**
```tsx
<thead>
  <tr>
    <th className="w-12"></th>
    <th>Period</th>
    <th>Description</th>
    <th>Amount (EUR / USD)</th>
    <th>Info</th>
  </tr>
</thead>
```

## Visual Changes

### Before
- Expandable icon in Info column (right side)
- Description: "Deposit for IT1234567890 - Training (PO: PO-001)"
- No exchange rate visible
- Info column had expand button

### After
- Expandable icon in first column (left side)
- Description: "Deposit on Recube in Training"
- Exchange rate shown below description
- Info column is blank

## User Experience

1. **Easier Expansion**: Chevron on the left is more intuitive
2. **Clearer Descriptions**: Simpler, more natural language
3. **Exchange Rate Visibility**: Important financial info at a glance
4. **Consistent Layout**: Standard table pattern with left-side expansion

## Example Table

```
[>] | Feb 2026 | Deposit on Recube in Training          | +€1,500.00 | 
    |          | Exchange Rate: 1.08                    | +$1,500.00 |
----|----------|----------------------------------------|------------|-----
[>] | Jan 2026 | Withdrawal on Dev Sandbox (008848...)  | -€2,450.00 |
    |          | Exchange Rate: 1.12                    | -$2,650.00 |
```

## Files Modified

**Frontend:**
- `/components/transactions/transactions-list.tsx` - Updated table structure, description logic, and exchange rate display

## Data Requirements

The implementation uses existing transaction data:
- `transaction.accounts.payer.name` - Customer name for deposits
- `transaction.accounts.usage.name` - Usage account name for withdrawals
- `transaction.accounts.usage.id` - Usage account ID
- `transaction.details.costCenterName` - Cost center name
- `transaction.exchangeRate` - Exchange rate (if available)

No backend changes required.
