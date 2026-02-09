# Manage Account Associations - Flow Verification

## Current Implementation

### Flow
1. **Actions Menu** → Click "Manage Accounts"
2. **Manage Accounts Dialog** opens showing all cost centers
3. Click **"Manage"** button on a specific cost center
4. **Associate Accounts Dialog** opens with account list

### Associate Accounts Dialog Features
✅ Shows all usage accounts with checkboxes  
✅ Display format: **Account Name (Account ID)**  
✅ Example: `AWS Production Account (987654321098)`  
✅ Fallback: `Unnamed Account (123456789012)` if no name  
✅ Search functionality (by name or ID)  
✅ Shows account status badge  
✅ Prevents duplicate assignments (grayed out if assigned elsewhere)  
✅ Shows count of selected accounts  

### Data Flow
```
ManageAccountsDialog
  └─> Click "Manage" on Cost Center
      └─> Opens AssociateAccountsDialog
          └─> Shows account list with checkboxes
              └─> User selects/deselects accounts
                  └─> Click "Save"
                      └─> Updates DynamoDB
```

### Code References

**ManageAccountsDialog** (`manage-accounts-dialog.tsx`):
```tsx
<Button onClick={() => onManageAccounts(cc)}>
  <Link2 className="h-3.5 w-3.5 mr-1" /> Manage
</Button>
```

**AssociateAccountsDialog** (`associate-accounts-dialog.tsx`):
```tsx
<p className="text-sm font-medium">
  {account.accountName || 'Unnamed Account'} ({account.accountId})
</p>
```

## Verification
The "Manage" button correctly opens the account selection list with:
- ✅ Account ID
- ✅ Account Name
- ✅ Checkbox selection
- ✅ Search capability
- ✅ Save functionality

All requirements are met.
