# Customer Actions Menu Update

## Changes
Added two new actions to the customer Actions dropdown menu:
1. **Add Cost Center** - Opens Edit dialog for adding cost centers
2. **Manage Accounts** - Opens Edit dialog for managing account associations

## Actions Menu Structure

### Active Customers
```
Actions ⋮
├── Details
├── Edit
├── ─────────────
├── Add Cost Center    ← NEW
├── Manage Accounts    ← NEW
├── ─────────────
├── Make Deposit
├── ─────────────
└── Archive
```

### Archived Customers
```
Actions ⋮
├── Details
├── Restore
├── ─────────────
└── Delete
```

## Behavior

**Add Cost Center**:
- Opens Edit dialog
- User can add new cost center directly

**Manage Accounts**:
- Opens Edit dialog
- User can manage account associations for existing cost centers

Both actions open the Edit dialog where all modifications are centralized.

## File Modified
- `/components/customers/customers-page-content.tsx`

## Benefits
- Quick access to common actions
- Consistent with Edit dialog approach
- All modifications still in one place (Edit dialog)
- Better discoverability of features
