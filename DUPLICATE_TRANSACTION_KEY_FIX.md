# Duplicate Transaction Key Fix

## Issue
React warning: "Encountered two children with the same key"

Multiple deposit transactions had the same `id` because one deposit creates multiple transaction records (one per usage account).

## Root Cause
When creating a deposit, the backend creates one transaction per usage account in the cost center, all with the same `depositId`:

```python
deposit_id = f"DEPOSIT-{uuid.uuid4()}"

for usage_account_id in usage_account_ids:
    deposit = {
        'id': deposit_id,  # ❌ Same ID for all
        'PK': f'ORG#DEFAULT#PAYER#{payer_id}#USAGE#{usage_account_id}',
        ...
    }
```

## Solution
Make React key unique by combining deposit ID with usage account ID:

```tsx
{currentTransactions.map((transaction, index) => (
  <TransactionRow 
    key={`${transaction.id}-${transaction.accounts?.usage?.id || index}`} 
    transaction={transaction} 
  />
))}
```

## Key Format
- **Deposits**: `DEPOSIT-{uuid}-{usageAccountId}`
- **Transactions**: `{transactionId}-{usageAccountId}`
- **Fallback**: `{transactionId}-{index}` (if no usage account)

## Example Keys
```
DEPOSIT-e502ad84-d96c-4ec7-8dc7-d15d1740d153-008848054048
DEPOSIT-e502ad84-d96c-4ec7-8dc7-d15d1740d153-098997734309
```

## File Modified
- `/components/transactions/transactions-list.tsx` - Updated map key to include usage account ID

## Result
✅ Unique keys for all transactions
✅ No React warnings
✅ Proper component identity maintained
