# Register Customer Button Fix

## Issue
Runtime error when clicking "Register Customer" button:
```
setEditCustomer is not defined
```

## Root Cause
Button onClick handler referenced removed state variable `setEditCustomer`:
```typescript
onClick={() => { setEditCustomer(null); setFormOpen(true) }}
```

The `editCustomer` state was removed during the focused modals refactoring.

## Solution
Removed the unnecessary `setEditCustomer(null)` call:
```typescript
onClick={() => setFormOpen(true)}
```

The `CustomerFormDialog` already has `customer={null}` hardcoded, so it always creates a new customer.

## State Variables (Current)
- `formOpen` - Controls CustomerFormDialog (create new customer)
- `infoOpen` - Controls CustomerInfoDialog (edit existing customer)
- `ccOpen` - Controls CostCentersDialog
- `manageOpen` - Controls ManageAccountsDialog
- `detailsOpen` - Controls CustomerDetailsDialog
- `depositOpen` - Controls deposit dialog

## File Modified
- `/components/customers/customers-page-content.tsx` - Line 256

## Result
✅ Register Customer button now works correctly
