# Debug: Usage Account Filter Showing Empty

## Issue
When a payer account is selected, the usage account filter shows empty instead of showing usage accounts belonging to that payer.

## Debug Steps Added

Added console logging to help identify the issue:

**File**: `components/transaction-filters.tsx`

### Console Logs Added:

1. **Individual Account Filtering**:
```typescript
console.log('Filtering:', { 
  accountName: account.accountName, 
  payerAccountId: account.payerAccountId, 
  selectedPayerAccount 
})
```

2. **Filter Results Summary**:
```typescript
console.log('Filter result:', { 
  selectedPayerAccount, 
  totalUsageAccounts: usageAccounts.length, 
  filteredCount: filteredUsageAccounts.length 
})
```

## How to Debug

1. Open browser console (F12)
2. Select a payer account from the filter
3. Check the console output to see:
   - What `payerAccountId` values the usage accounts have
   - What `selectedPayerAccount` value is being used for filtering
   - How many accounts match the filter

## Expected Values

- `selectedPayerAccount`: Should be the 12-digit AWS account ID (e.g., "123456789012")
- `account.payerAccountId`: Should match the payer's accountId (e.g., "123456789012")

## Possible Issues

1. **Field Mismatch**: `payerAccountId` might be storing a different value (UUID vs accountId)
2. **Data Not Loaded**: Usage accounts might not have `payerAccountId` populated
3. **Type Mismatch**: One might be string, other might be number

## Next Steps

After checking console logs, we can:
- Adjust the comparison if fields don't match
- Fix the data mapping if `payerAccountId` is not being set correctly
- Handle any type conversion if needed
