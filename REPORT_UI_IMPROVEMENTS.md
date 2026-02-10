# Report Component UI Improvements

## Changes
Updated Report component to work with customers instead of usage accounts, showing customer information and fund balance by cost center.

## Key Improvements

### 1. Customer Selector (Top Right)
**Before**: Select usage account
**After**: Select customer

```tsx
<Select value={selectedCustomerVat} onValueChange={setSelectedCustomerVat}>
  <SelectTrigger>
    <SelectValue placeholder="Select customer" />
  </SelectTrigger>
  <SelectContent>
    {customers.map((customer) => (
      <SelectItem key={customer.vatNumber} value={customer.vatNumber}>
        {customer.legalName} ({customer.vatNumber})
      </SelectItem>
    ))}
  </SelectContent>
</Select>
```

### 2. Billing Report Header - Customer Information
**Before**: Showed Payer Account and Usage Account
**After**: Shows Customer details

**New Fields**:
- Customer name and VAT number
- Contact name
- Contact email
- Billing period
- Last updated date
- Status badge

```tsx
<ReportHeader
  customerName="Recube"
  customerVat="IT1234567890"
  contactName="John Doe"
  contactEmail="john@recube.com"
  billingPeriod="2026-02"
  generatedDate="09/02/2026, 18:00"
  status="Active"
/>
```

### 3. Fund Balance by Cost Center
**Before**: Only showed overall fund balance
**After**: Shows overall balance + breakdown by cost center

**Features**:
- Overall utilization bar
- Total deposit, cost, and available fund
- Individual cost center cards with:
  - Cost center name
  - Utilization percentage
  - Progress bar (color-coded)
  - Cost vs Deposit amounts
  - Available fund

**Example**:
```
Fund Balance
├── Overall Utilization: 45.2%
├── Total Deposit: €10,000.00
├── Total Cost: €4,520.00
├── Available Fund: €5,480.00
└── By Cost Center:
    ├── Training: 30% (€1,500 / €5,000) → €3,500
    └── R&D: 60% (€3,020 / €5,000) → €1,980
```

## Data Flow

### Report Data Structure
```typescript
interface ReportData {
  customerName: string
  customerVat: string
  contactName: string
  contactEmail: string
  billingPeriod: string
  generatedDate: string
  status: string
  totalDeposit: number
  totalCost: number
  costCenterBalances: CostCenterBalance[]
  // ... other fields
}

interface CostCenterBalance {
  costCenterId: string
  costCenterName: string
  totalDeposit: number
  totalCost: number
  availableFund: number
}
```

### Data Aggregation Logic

1. **Load Customer**: Fetch customer by VAT number
2. **Get Usage Accounts**: Extract all usage account IDs from all cost centers
3. **Filter Transactions**: Get transactions for customer's usage accounts
4. **Calculate Cost Center Balances**:
   - For each cost center:
     - Filter transactions for that cost center's usage accounts
     - Sum total cost
     - Get deposit amount (TODO: from deposits table)
     - Calculate available fund
5. **Aggregate Totals**: Sum across all cost centers

## Files Modified

**Frontend**:
- `/components/report/report-page-content.tsx` - Changed from usage accounts to customers
- `/components/report/report-header.tsx` - Updated to show customer information
- `/components/report/fund-balance-widget.tsx` - Added cost center breakdown

## UI Layout

```
┌─────────────────────────────────────────────────────────┐
│ Report                    [Select customer ▼]           │
├─────────────────────────────────────────────────────────┤
│ Billing Report                              [Active]    │
│ Customer: Recube (VAT: IT1234567890)                   │
│ Contact: John Doe                                       │
│ Email: john@recube.com                                  │
│                                  Period: 2026-02        │
│                                  Updated: 09/02/2026    │
├─────────────────────────────────────────────────────────┤
│ Fund Balance                                            │
│ Overall Utilization: 45.2% [████████░░░░░░░░░░░]       │
│ Total Deposit: €10,000.00                              │
│ Total Cost: €4,520.00                                  │
│ Available Fund: €5,480.00                              │
│                                                         │
│ By Cost Center:                                         │
│ ┌─ Training ──────────────────── 30% ─┐               │
│ │ [██████░░░░░░░░░░░░░░░░░░░░░░░░░░]  │               │
│ │ €1,500 / €5,000        €3,500       │               │
│ └─────────────────────────────────────┘               │
│ ┌─ R&D ──────────────────────── 60% ─┐               │
│ │ [████████████░░░░░░░░░░░░░░░░░░░░]  │               │
│ │ €3,020 / €5,000        €1,980       │               │
│ └─────────────────────────────────────┘               │
└─────────────────────────────────────────────────────────┘
```

## Benefits

1. **Customer-Centric**: Report focuses on customer rather than individual accounts
2. **Better Visibility**: See all cost centers at a glance
3. **Budget Tracking**: Monitor utilization per cost center
4. **Contact Information**: Quick access to customer contact details
5. **Visual Indicators**: Color-coded progress bars for quick status assessment

## TODO

- Fetch actual deposit amounts per cost center from Transactions table
- Add drill-down capability to see cost center details
- Add export functionality for customer reports
- Add date range selector for historical reports
