# Customer Actions - Focused Modals

## Changes
Replaced the single large Edit dialog with three focused, purpose-specific modals:

## 1. Edit Button → Customer Info Dialog
**Purpose**: Edit customer information only

**Fields**:
- Legal Name (editable)
- VAT Number (read-only)
- Contact Name (editable)
- Contact Email (editable)

**File**: `/components/customers/customer-info-dialog.tsx` (new)

## 2. Add Cost Center Button → Cost Centers Dialog
**Purpose**: Manage cost centers only

**Features**:
- View all cost centers
- Add new cost center (name + description)
- Remove cost center
- Shows account count per cost center

**File**: `/components/customers/cost-centers-dialog.tsx` (new)

## 3. Manage Accounts Button → Manage Accounts Dialog
**Purpose**: Manage account associations only

**Features**:
- View all cost centers
- See linked accounts per cost center
- Click "Manage" to open associate accounts dialog
- Shows account names and IDs

**File**: `/components/customers/manage-accounts-dialog.tsx` (new)

## User Flow

### Edit Customer Info
1. Click "Edit" from Actions
2. Modal shows only customer information fields
3. Save changes

### Add/Remove Cost Centers
1. Click "Add Cost Center" from Actions
2. Modal shows cost centers list
3. Add or remove cost centers
4. Auto-closes when done

### Manage Account Associations
1. Click "Manage Accounts" from Actions
2. Modal shows all cost centers
3. Click "Manage" on specific cost center
4. Associate accounts dialog opens
5. Select/deselect accounts
6. Save

## Benefits
- ✅ Each modal has a single, clear purpose
- ✅ Faster to load (smaller modals)
- ✅ Less overwhelming for users
- ✅ Better mobile experience
- ✅ Clearer action names

## Files Created
1. `/components/customers/customer-info-dialog.tsx`
2. `/components/customers/cost-centers-dialog.tsx`
3. `/components/customers/manage-accounts-dialog.tsx`

## Files Modified
- `/components/customers/customers-page-content.tsx` - Updated to use three focused dialogs

## Files Removed
- `/components/customers/customer-edit-dialog.tsx` - No longer needed
