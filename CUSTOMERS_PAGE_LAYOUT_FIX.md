# Customers Page Layout Fix

## Issue
Customers page had no margins and expanded to full width, unlike other pages.

## Root Cause
Missing wrapper `<main>` element with responsive padding and max-width constraints.

## Solution
Added consistent layout wrapper matching other pages:

```tsx
<main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
  <CustomersPageContent />
</main>
```

## Layout Classes
- `mx-auto` - Center horizontally
- `max-w-7xl` - Maximum width constraint (1280px)
- `px-4` - Horizontal padding (mobile)
- `py-8` - Vertical padding
- `sm:px-6` - Horizontal padding (tablet)
- `lg:px-8` - Horizontal padding (desktop)

## Consistency
Now matches layout of:
- Accounts page
- Transactions page
- Other protected pages

## File Modified
- `/app/(protected)/customers/page.tsx`
