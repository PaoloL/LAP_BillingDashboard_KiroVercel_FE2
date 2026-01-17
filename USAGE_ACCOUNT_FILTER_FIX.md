# Fix: Usage Account Filter Showing Blank Items

## Issue
The Usage Account filter dropdown appeared to have items (the dropdown showed the correct number of entries), but all items were displayed as blank/empty.

## Root Cause
The `TransactionFilters` component was expecting usage accounts to have an `accountName` property, but the API returns `UsageAccount` objects with a `customer` property instead.

**Data Structure Mismatch**:
- **Expected by UI**: `{ id, accountId, accountName }`
- **Received from API**: `{ id, accountId, customer, ... }`
- **UI was rendering**: `account.accountName` → `undefined` (blank)

## Fix Applied

**File**: `components/transaction-filters.tsx`

**Before (incorrect)**:
```typescript
let usageAccountsList = usageData || []
```

**After (correct)**:
```typescript
let usageAccountsList = (usageData || []).map((account) => ({
  id: account.id,
  accountId: account.accountId,
  accountName: account.customer, // Map customer to accountName
}))
```

## Result

✅ **Usage Account Names Visible**: Dropdown now shows customer names
✅ **Consistent Structure**: Usage accounts mapped to expected format
✅ **Filter Works**: Users can select and filter by usage account
✅ **Payer Accounts Unaffected**: Payer accounts already had correct structure

The usage account filter now correctly displays customer names in the dropdown.
