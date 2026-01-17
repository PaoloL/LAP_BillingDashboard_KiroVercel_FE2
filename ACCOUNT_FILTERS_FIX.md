# Fix: Transaction Filters Not Showing Accounts from DynamoDB

## Issue
The Payer Account and Usage Account filters in the Transactions page were not showing any accounts from DynamoDB.

## Root Cause
The `TransactionFilters` component was trying to access `.data` property on the results from `dataService.getPayerAccounts()` and `dataService.getUsageAccounts()`, but these methods already return the array directly without a wrapper object.

**Incorrect code**:
```typescript
const payerAccountsList = payerData.data || []  // ❌ .data doesn't exist
const usageAccountsList = usageData.data || []  // ❌ .data doesn't exist
```

## Data Flow
1. **API Client** (`lib/data/api-client.ts`):
   - Receives: `{ data: PayerAccount[] }`
   - Returns: `response.data` (the array)

2. **Data Service** (`lib/data/data-service.ts`):
   - Receives: `PayerAccount[]` from API client
   - Returns: `PayerAccount[]` directly

3. **Component** (was incorrectly accessing `.data` again):
   - Should receive: `PayerAccount[]`
   - Was trying: `payerData.data` ❌

## Fix Applied

**File**: `components/transaction-filters.tsx`

**Changed**:
```typescript
// Before (incorrect)
const payerAccountsList = payerData.data || []
const usageAccountsList = usageData.data || []

// After (correct)
const payerAccountsList = payerData || []
const usageAccountsList = usageData || []
```

## Result

✅ **Payer Account Filter**: Now shows all payer accounts from DynamoDB
✅ **Usage Account Filter**: Now shows all usage accounts from DynamoDB
✅ **Data Loading**: Accounts are properly loaded and displayed in dropdowns
✅ **Filtering**: Users can now filter transactions by account

The filters now correctly display all accounts stored in DynamoDB.
