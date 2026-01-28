# Fix: Usage Account Filter Now Filtered by Selected Payer Account

## Issue
When a user selected a Payer Account, the Usage Account filter showed all usage accounts instead of only showing the usage accounts attached to the selected payer account.

## Solution
Added filtering logic to show only usage accounts that belong to the selected payer account.

## Changes Made

**File**: `components/transaction-filters.tsx`

### 1. Updated State Type
Added `payerAccountId` to usage accounts state:
\`\`\`typescript
const [usageAccounts, setUsageAccounts] = useState<Array<{ 
  id: string
  accountId: string
  accountName: string
  payerAccountId?: string  // Added
}>>([])
\`\`\`

### 2. Included payerAccountId in Mapping
When loading usage accounts from API:
\`\`\`typescript
let usageAccountsList = (usageData || []).map((account) => ({
  id: account.id,
  accountId: account.accountId,
  accountName: account.customer,
  payerAccountId: account.payerAccountId,  // Added
}))
\`\`\`

### 3. Added Filtering Logic
Created filtered list based on selected payer account:
\`\`\`typescript
const filteredUsageAccounts = selectedPayerAccount
  ? usageAccounts.filter((account) => account.payerAccountId === selectedPayerAccount)
  : usageAccounts
\`\`\`

### 4. Updated Dropdown Rendering
Changed dropdown to use `filteredUsageAccounts` instead of `usageAccounts`:
\`\`\`typescript
{filteredUsageAccounts.map((account) => (
  // render account
))}
\`\`\`

## Result

✅ **Filtered by Payer**: Usage accounts now filtered by selected payer account
✅ **Shows All When No Selection**: Shows all usage accounts when no payer is selected
✅ **Dynamic Filtering**: Updates immediately when payer selection changes
✅ **Proper Relationships**: Only shows usage accounts that belong to the selected payer

Users now see only the relevant usage accounts based on their payer account selection.
