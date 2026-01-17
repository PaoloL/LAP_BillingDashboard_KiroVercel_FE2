# Fix: Account Registration Rebate Configuration Error

## Issue
When trying to register a new usage account, the API returned a 400 error:
```
{"error": "Invalid rebate configuration structure"}
```

## Root Cause
The frontend was sending a rebate configuration structure that didn't match the backend validation requirements:

1. **Field Name Mismatch**: Frontend used `savingsPlanNegation` but backend expected `spNegation`
2. **Extra Field**: Frontend included a generic `discount.discount` field that the backend doesn't accept

## Fixes Applied

### 1. Register Usage Dialog (`components/register-usage-dialog.tsx`)

**Changed Field Names**:
- `savingsPlanNegation` → `spNegation`

**Removed Invalid Field**:
- Removed `discount.discount` from state and UI

**Updated Structure**:
```typescript
rebateConfig: {
  savingsPlansRI: {
    discountedUsage: boolean
    spNegation: boolean  // Changed from savingsPlanNegation
  }
  discount: {
    // Removed: discount: boolean
    bundledDiscount: boolean
    credit: boolean
    privateRateDiscount: boolean
  }
  adjustment: {
    credit: boolean
    refund: boolean
  }
}
```

### 2. Edit Usage Dialog (`components/edit-usage-dialog.tsx`)

Applied the same fixes:
- Updated type definition
- Changed `savingsPlanNegation` to `spNegation`
- Removed generic `discount` field from state and UI
- Updated all UI references and event handlers

## Result

✅ **Rebate Configuration Valid**: Now matches backend validation exactly
✅ **Field Names Correct**: Uses `spNegation` instead of `savingsPlanNegation`
✅ **No Extra Fields**: Removed generic `discount` field
✅ **Registration Works**: Account registration now succeeds

## Backend Validation
The backend validates that the rebate config contains exactly:
- `savingsPlansRI`: `discountedUsage`, `spNegation`
- `discount`: `bundledDiscount`, `credit`, `privateRateDiscount`
- `adjustment`: `credit`, `refund`

Any extra fields or wrong field names will cause validation to fail.
