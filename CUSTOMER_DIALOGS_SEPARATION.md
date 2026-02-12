# Customer Dialogs Separation

## Changes
Split customer management into two separate dialogs:
1. **Details Dialog** - Read-only view
2. **Edit Dialog** - All modifications

## Details Dialog (Read-Only)
**Purpose**: View customer information and cost centers

**Features**:
- ✅ Display customer info (legal name, VAT, contact)
- ✅ Show cost centers with expandable sections
- ✅ List linked accounts per cost center
- ❌ No edit capabilities
- ❌ No add/remove buttons

**File**: `/components/customers/customer-details-dialog.tsx`

## Edit Dialog (All Modifications)
**Purpose**: Manage all customer modifications

**Features**:
- ✅ Edit customer information (legal name, contact name, contact email)
- ✅ VAT number displayed but disabled (immutable)
- ✅ Add cost centers
- ✅ Remove cost centers
- ✅ Manage accounts (opens associate accounts dialog)
- ✅ View linked accounts per cost center

**File**: `/components/customers/customer-edit-dialog.tsx` (new)

## User Flow

### View Details
1. Click "Details" from dropdown
2. See read-only information
3. Close dialog

### Edit Customer
1. Click "Edit" from dropdown
2. Modify customer info
3. Add/remove cost centers
4. Manage account associations
5. Save changes

## Component Structure

```
customers-page-content.tsx
├── CustomerFormDialog (create new customer)
├── CustomerDetailsDialog (read-only view)
├── CustomerEditDialog (all modifications)
│   └── Opens AssociateAccountsDialog
├── CustomerDepositDialog
└── AssociateAccountsDialog
```

## Files Modified
1. `/components/customers/customer-details-dialog.tsx` - Removed all edit capabilities
2. `/components/customers/customer-edit-dialog.tsx` - New file with all edit features
3. `/components/customers/customers-page-content.tsx` - Updated to use both dialogs

## Benefits
- Clear separation of concerns (view vs edit)
- Simpler read-only experience
- All modifications in one place
- Better UX - users know when they're editing
