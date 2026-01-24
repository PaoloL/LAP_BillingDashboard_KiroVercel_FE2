# Fix: Account Filter Issues

## Issues Fixed

### 1. Usage Account Filter by Payer Account
**Issue**: When user selects a Payer Account, the Usage Account list should show only accounts linked to that payer.

**Solution**: 
- Added `payerAccountId` to usage account state
- Implemented filtering logic: `filteredUsageAccounts = usageAccounts.filter(account => account.payerAccountId === selectedPayerAccount)`
- Usage account dropdown now uses `filteredUsageAccounts` instead of all accounts

### 2. Transactions Filter by Usage Account
**Issue**: When user selects a Usage Account, the Transactions list should show only transactions for that usage account.

**Solution**:
- TransactionsList component already receives `usageAccountId` prop
- API call already includes `usageAccountId` parameter
- Backend filters transactions by usage account ID

### 3. Clear Usage Selection on Payer Change
**Enhancement**: When payer account changes, clear the usage account selection since it may not belong to the new payer.

**Implementation**:
\`\`\`typescript
const handlePayerAccountChange = (value: string) => {
  const accountId = value === "all" ? undefined : value
  setSelectedPayerAccount(accountId)
  
  // Clear usage account selection when payer changes
  if (accountId !== selectedPayerAccount) {
    setSelectedUsageAccount(undefined)
    onUsageAccountChange?.(undefined)
  }
  
  onPayerAccountChange?.(accountId)
  setPayerPopoverOpen(false)
}
\`\`\`

## How It Works

### Filter Flow:
1. **User selects Payer Account**
   - `selectedPayerAccount` is set to the payer's accountId
   - Usage account selection is cleared
   - Usage accounts are filtered: only those with matching `payerAccountId` are shown
   - Transactions are filtered by payer account

2. **User selects Usage Account** (from filtered list)
   - `selectedUsageAccount` is set to the usage account's accountId
   - Transactions are filtered by both payer and usage account

3. **User clears Payer Account**
   - All usage accounts are shown again
   - Transactions show all (or filtered by other criteria)

## Data Structure

**Usage Account**:
\`\`\`typescript
{
  id: string
  accountId: string          // 12-digit AWS account ID
  accountName: string        // Mapped from 'customer' field
  payerAccountId: string     // Links to payer's accountId
}
\`\`\`

**Filtering Logic**:
\`\`\`typescript
const filteredUsageAccounts = selectedPayerAccount
  ? usageAccounts.filter(account => account.payerAccountId === selectedPayerAccount)
  : usageAccounts
\`\`\`

## Result

✅ **Payer → Usage Filtering**: Usage accounts filtered by selected payer
✅ **Usage → Transactions Filtering**: Transactions filtered by selected usage account
✅ **Clear on Change**: Usage selection cleared when payer changes
✅ **Proper Hierarchy**: Respects payer → usage → transaction relationship
