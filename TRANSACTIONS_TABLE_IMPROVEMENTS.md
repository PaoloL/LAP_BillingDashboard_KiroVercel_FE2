# Transactions Table UI Improvements

## Changes
Improved transactions table to show clearer information with Period, Description, Amount, and Info columns.

## New Table Structure

### Columns
1. **Period** - Billing period (e.g., "Feb 2026")
2. **Description** - Context-aware description based on transaction type
3. **Amount (EUR / USD)** - Transaction amount in both currencies
4. **Info** - Expandable button to show detailed breakdown

### Description Logic

**For Deposits (MANUAL transactions)**:
```
Deposit for {Customer VAT} - {Cost Center Name} (PO: {PO Number})
```
Example: `Deposit for IT1234567890 - Training (PO: PO-001)`

**For AWS Transactions**:
```
{Payer Name} ({Payer ID}) → {Usage Name} ({Usage ID})
```
Example: `Main Engineering Payer (555) → Dev Sandbox (999)`

## Implementation Details

### Frontend Changes

**File**: `/components/transactions/transactions-list.tsx`

**Added Description Generator**:
```typescript
const getDescription = () => {
  if (isDeposit) {
    // Deposit: Customer, Cost Center, PO
    const customer = transaction.details?.customerVatNumber || 'Unknown Customer'
    const costCenter = transaction.details?.costCenterName || 'Unknown Cost Center'
    const poNumber = transaction.details?.poNumber || 'N/A'
    return `Deposit for ${customer} - ${costCenter} (PO: ${poNumber})`
  } else {
    // Transaction: Payer Account and Usage Account
    const payerName = transaction.accounts?.payer?.name || 'Unknown Payer'
    const payerId = transaction.accounts?.payer?.id || 'N/A'
    const usageName = transaction.accounts?.usage?.name || 'Unknown Usage'
    const usageId = transaction.accounts?.usage?.id || 'N/A'
    return `${payerName} (${payerId}) → ${usageName} (${usageId})`
  }
}
```

**Updated Table Structure**:
- Removed separate Payer Account and Usage Account columns
- Added single Description column with context-aware text
- Moved expand/collapse button to Info column
- Removed click handler from entire row (only Info button expands)

### Type Updates

**File**: `/lib/types.ts`

Added deposit-specific fields to `TransactionDetail.details`:
```typescript
details?: {
  description?: string
  currency?: string
  value?: number
  entity?: any
  poNumber?: string              // ✅ Added
  costCenterId?: string          // ✅ Added
  costCenterName?: string        // ✅ Added
  customerVatNumber?: string     // ✅ Added
}
```

## User Experience

### Before
- Separate columns for Payer and Usage accounts
- No clear indication of deposit context
- Entire row clickable for expansion

### After
- Single Description column with meaningful context
- Deposits show customer, cost center, and PO number
- Transactions show payer → usage flow
- Dedicated Info button for expansion
- Cleaner, more readable layout

## Example Descriptions

### Deposit Transaction
```
Period: Feb 2026
Description: Deposit for IT1234567890 - Training (PO: PO-001)
Amount: +€1,500.00 / +$1,500.00
Info: [>] (expandable)
```

### AWS Transaction
```
Period: Jan 2026
Description: Main Engineering Payer (555) → Dev Sandbox (999)
Amount: -€2,450.00 / -$2,650.00
Info: [>] (expandable)
```

## Benefits

1. **Clearer Context**: Immediately understand what each transaction represents
2. **Better Readability**: Single description line instead of multiple columns
3. **Deposit Visibility**: PO numbers and cost centers visible at a glance
4. **Consistent Format**: Standardized description format for all transaction types
5. **Space Efficiency**: More room for description text

## Files Modified

**Frontend**:
- `/components/transactions/transactions-list.tsx` - Updated table structure and description logic
- `/lib/types.ts` - Added deposit-specific fields to TransactionDetail type

## Backend Data

The backend already provides all necessary fields:
- `details.customerVatNumber` - Customer VAT number
- `details.costCenterName` - Cost center name
- `details.poNumber` - Purchase order number
- `accounts.payer` - Payer account info
- `accounts.usage` - Usage account info

No backend changes required.
