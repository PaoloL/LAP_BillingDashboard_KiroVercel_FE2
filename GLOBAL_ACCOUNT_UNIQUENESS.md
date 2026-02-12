# Global Usage Account Uniqueness Enforcement

## Requirement
Usage accounts can only be assigned to ONE cost center across ALL customers (global uniqueness).

## Implementation

### Frontend Changes

**1. Updated Account Assignment Check** (`customers-page-content.tsx`)
```typescript
// OLD: Only checked within current customer
const allAssignedAccountIds = manageCustomer
  ? manageCustomer.costCenters.flatMap((cc) => cc.usageAccountIds)
  : []

// NEW: Check across ALL customers (global)
const allAssignedAccountIds = customers.flatMap((customer) =>
  customer.costCenters.flatMap((cc) => cc.usageAccountIds)
)
```

**2. Enhanced Error Handling** (`customers-page-content.tsx`)
```typescript
catch (err: any) {
  if (err.message && err.message.includes('already assigned')) {
    alert('Cannot assign account: One or more accounts are already assigned to another cost center.')
  }
  throw err // Keep dialog open on error
}
```

**3. Updated Dialog Save Handler** (`associate-accounts-dialog.tsx`)
- Changed to async/await pattern
- Catches errors to prevent dialog from closing on conflict
- Badge text changed from "Other CC" to "Assigned"

### Backend Validation

**Added Conflict Detection** (`customers.py` - `update_cost_center_accounts()`)

1. **Query all customers** via GSI1
2. **Check each cost center** for overlapping account assignments
3. **Skip the cost center being updated** (allow re-saving same accounts)
4. **Return 409 Conflict** if duplicate found:
   ```json
   {
     "error": "Account already assigned",
     "message": "Account(s) 123456789012 already assigned to another cost center",
     "conflictingAccounts": ["123456789012"],
     "assignedTo": {
       "customer": "Acme Corp",
       "costCenter": "Marketing"
     }
   }
   ```

## User Experience

### Before Assignment
- Accounts already assigned to ANY cost center are **disabled** in the selection dialog
- Badge shows "Assigned" for unavailable accounts
- User cannot select disabled accounts

### During Assignment
- If user somehow bypasses frontend validation, backend returns 409 error
- Alert shows: "Cannot assign account: One or more accounts are already assigned to another cost center."
- Dialog remains open, allowing user to adjust selection

### After Assignment
- Accounts successfully assigned
- Other customers cannot assign the same accounts

## Data Model Constraint

Updated constraint in schema:
```
"uniqueAccountAssignment": "Usage account can only be assigned to one cost center globally (across all customers)"
```

## Files Modified

**Frontend:**
- `/components/customers/customers-page-content.tsx` - Global account check + error handling
- `/components/customers/associate-accounts-dialog.tsx` - Async save handler + badge text

**Backend:**
- `/src/customers/customers.py` - Added conflict detection in `update_cost_center_accounts()`

## Testing

### Test Case 1: Assign Available Account
1. Select unassigned account
2. Click Save
3. ✅ Account assigned successfully

### Test Case 2: Attempt Duplicate Assignment
1. Try to assign account already assigned to another customer
2. Account is disabled in UI
3. ✅ Cannot select

### Test Case 3: Backend Validation
1. Bypass frontend (direct API call)
2. Try to assign duplicate account
3. ✅ Returns 409 with detailed error message

## Performance Consideration

The backend validation queries all customers and their cost centers. For large datasets:
- Consider adding a GSI for account-to-cost-center lookups
- Or maintain a separate "account assignments" table
- Current implementation is acceptable for <1000 customers
