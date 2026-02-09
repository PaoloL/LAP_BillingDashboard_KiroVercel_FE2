# Associate Accounts Dialog Display Fix

## Change
Updated the associate accounts dialog to display account information in the format:
**Account Name (Account ID)**

## Before
```
Account Name
123456789012
```

## After
```
Unnamed Account (123456789012)
AWS Production Account (987654321098)
```

## Implementation

### Display Format
```typescript
<p className="text-sm font-medium text-foreground truncate">
  {account.accountName || 'Unnamed Account'} ({account.accountId})
</p>
```

### Search Updated
Search now works on both account name and ID:
```typescript
const name = a.accountName || 'Unnamed Account'
return name.toLowerCase().includes(q) || a.accountId.includes(q)
```

## File Modified
- `/components/customers/associate-accounts-dialog.tsx`

## Benefits
1. More compact display (single line instead of two)
2. Account ID always visible in parentheses
3. Fallback for accounts without names
4. Search works on both name and ID
