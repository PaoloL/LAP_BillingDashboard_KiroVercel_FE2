# Duplicate Function Definitions Fix

## Issue
Runtime error: `editCustomer is not defined` when adding cost center.

## Root Cause
Duplicate function definitions in `customers-page-content.tsx`:
- Lines 140-165: Correct functions using `ccCustomer`, `manageCustomer`
- Lines 216-244: Old duplicate functions still referencing `editCustomer` (removed variable)

## Solution
Deleted the duplicate old function definitions (lines 216-244):
- `handleAddCostCenter` (duplicate)
- `handleRemoveCostCenter` (duplicate)
- `handleManageAccounts` (duplicate)

## Correct Functions (Retained)
```typescript
// Line 140
async function handleAddCostCenter(data: ...) {
  if (!ccCustomer) return  // ✅ Correct reference
  const updated = await dataService.addCostCenter(ccCustomer.id, data)
  setCcCustomer(updated)
  ...
}

// Line 151
async function handleRemoveCostCenter(costCenterId: string) {
  if (!ccCustomer) return  // ✅ Correct reference
  const updated = await dataService.removeCostCenter(ccCustomer.id, costCenterId)
  setCcCustomer(updated)
  ...
}

// Line 162
function handleManageAccounts(cc: CostCenter) {
  if (!manageCustomer) return  // ✅ Correct reference
  setAssociateCustomerId(manageCustomer.id)
  ...
}
```

## File Modified
- `/components/customers/customers-page-content.tsx` - Removed duplicate functions

## Result
✅ Error resolved - functions now reference correct state variables
