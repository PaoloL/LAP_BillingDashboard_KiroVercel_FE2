# Marketplace Cost Section Added to Cost Breakdown

## Change Summary

Added a new "Marketplace" section to the Cost Breakdown display in the transactions list to show AWS Marketplace costs from `entity.awsmp`.

## Implementation

**File**: `components/transactions-list.tsx`

### 1. Added Marketplace Data Reference
```typescript
const marketplaceBreakdown = transaction.details?.customer?.entity?.awsmp || {}
```

### 2. Added Marketplace Section to UI
New section displays:
- **Total Marketplace Cost** (header with purple styling)
- **Usage** - Marketplace usage costs
- **Fee** - Marketplace fees
- **Tax** - Marketplace taxes
- **Discount** - Marketplace discounts (absolute value)
- **Adjustment** - Marketplace adjustments (absolute value)

### Visual Design
- **Color**: Purple (`text-purple-600`) to distinguish from other cost categories
- **Layout**: Consistent with existing cost sections (Usage, Fee, Discount, etc.)
- **Position**: Added after the Tax section in the grid

### Data Structure
The marketplace data is accessed from:
```
transaction.details.customer.entity.awsmp
├── totals (usd, eur)
├── usage.totals (usd, eur)
├── fee.totals (usd, eur)
├── tax.totals (usd, eur)
├── discount.totals (usd, eur)
└── adjustment.totals (usd, eur)
```

## Result

✅ **Marketplace Section Added**: New cost category visible in expanded transaction view
✅ **Complete Breakdown**: Shows all marketplace cost components
✅ **Consistent Styling**: Matches existing cost section design
✅ **Data Safety**: Uses optional chaining and fallback values

Users can now see AWS Marketplace costs separately from regular AWS costs in the transaction details.
