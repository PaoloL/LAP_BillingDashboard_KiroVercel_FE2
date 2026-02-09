# Deposit Button Consolidation

## Change
Removed "Register Deposit" button from Transactions page. Deposits are now only created via "Make Deposit" button in Customers page.

## Rationale
- Deposits are customer-specific and linked to cost centers
- Better UX to create deposits in the context of a customer
- Avoids confusion about which customer/cost center to associate with deposit

## Changes Made

### Removed from Transactions Page
**File**: `/components/transactions/transactions-page-content.tsx`

**Removed:**
1. Import statements:
   - `RegisterDepositDialog` component
   - `Button` component
   - `Plus` icon

2. State variables:
   - `depositDialogOpen` state
   - `handleDepositSuccess` function

3. UI elements:
   - "Register Deposit" button in header
   - `<RegisterDepositDialog>` component

### Kept in Customers Page
**File**: `/components/customers/customers-page-content.tsx`

**Existing functionality:**
- "Make Deposit" action in customer actions menu
- Opens `CustomerDepositDialog` with customer context
- Automatically links deposit to selected customer and cost center

## User Flow

### Before
1. **Transactions Page**: Click "Register Deposit" → Select customer → Select cost center
2. **Customers Page**: Click "Make Deposit" → Customer pre-selected → Select cost center

### After
1. **Customers Page Only**: Click "Make Deposit" → Customer pre-selected → Select cost center

## Benefits
- Single source of truth for deposit creation
- Clearer user flow (deposits are customer operations)
- Reduced code duplication
- Better data integrity (customer context always present)

## Files Modified
- `/components/transactions/transactions-page-content.tsx` - Removed deposit button and dialog
