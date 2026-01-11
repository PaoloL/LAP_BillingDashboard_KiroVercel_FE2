# AWS Billing Dashboard - v7 Implementation Summary

## Overview
The v7 specification introduces precise financial calculation formulas for determining Net Cost and Final Cost in the AWS billing system.

## Key Financial Formulas

### 1. Total Cost (Net Cost / Origin Cost)
\`\`\`typescript
totalCost = totalUsage + totalFee + (rebateCreditsEnabled ? totalCredit : 0)
\`\`\`

**Important:** If "Rebate Credits" is OFF for the account, the credit value is ignored (treated as 0).

### 2. Discounted Cost (Final Cost)
\`\`\`typescript
discountedCost = totalCost - (totalCost * customerDiscount / 100)
\`\`\`

**Note:** Only the Customer Discount is used for this client-facing calculation. Reseller Discount is an internal metric.

## Implementation Details

### Type Definitions (`lib/types.ts`)
- Added `calculateCosts` helper function
- Updated `UsageAccount` interface with:
  - `resellerDiscount: number` - Internal discount percentage
  - `customerDiscount: number` - Client-facing discount percentage
  - `rebateCredits: boolean` - Toggle for credit application

### Cost Calculator Utility (`lib/cost-calculator.ts`)
Comprehensive helper function with documentation:
\`\`\`typescript
calculateAccountCosts(usage, fee, credit, customerDiscountPercent, rebateCreditsEnabled)
\`\`\`

Returns:
- `totalCost` - Net Cost before discount
- `discountedCost` - Final Cost after customer discount
- `savings` - Amount saved through discount
- `creditApplied` - Credit amount included in calculation
- `creditIgnored` - Credit amount excluded (if rebate disabled)

### Updated Components

#### Transactions List (`components/transactions-list.tsx`)
- Changed from card-based to table-based layout
- Added columns:
  - **Customer** - Customer name and period
  - **Account** - Usage account ID
  - **Line Items** - Color-coded badges for Usage, Credit, Fee, Deposit
  - **Net Cost** - Total cost before discount (calculated)
  - **Final Cost** - Discounted cost (calculated with customer discount)
- Shows note when credit is not applied due to rebate being disabled

#### Usage Details Dialog (`components/usage-details-dialog.tsx`)
- Updated transaction display to use `calculateCosts` helper
- Shows breakdown of usage, fee, and credit amounts
- Displays both Net Cost and Final Cost
- Shows savings calculation

#### Accounts Grid (`components/accounts-grid.tsx`)
- Updated card display to show "Customer Discount" label
- Discount value represents the customer discount percentage

### Register Usage Account Modal (`components/register-usage-dialog.tsx`)
- Separate fields for Reseller Discount and Customer Discount
- Real-time validation: Customer Discount ≤ Reseller Discount
- Rebate Credits toggle switch
- Descriptive help text explaining credit handling

## Color Palette (Strict Adherence)
| Element | Color | Hex Code |
|---------|-------|----------|
| Usage / Cost | Orange | `#EC9400` |
| Credit / Deposit / Discount | Teal | `#026172` |
| Fee / Primary | Navy | `#00243E` |
| Warning / Alerts | Muted Orange | `#EBB700` |
| Background | White | `#FFFFFF` |

## Data Flow Example

### Scenario: Acme Corporation - January 2025
\`\`\`typescript
Input:
- Usage: €12,345.67
- Fee: €100.00
- Credit: €1,234.56
- Customer Discount: 10%
- Rebate Credits: Enabled

Calculation:
1. Applicable Credit = 1,234.56 (rebate enabled)
2. Total Cost = 12,345.67 + 100.00 + 1,234.56 = €13,680.23
3. Discounted Cost = 13,680.23 - (13,680.23 × 0.10) = €12,312.21
4. Savings = 13,680.23 - 12,312.21 = €1,368.02

Display:
- Net Cost: €13,680.23
- Final Cost: €12,312.21
- Customer Discount Applied: -10%
\`\`\`

## European Number Formatting
All currency values use European format via `lib/format.ts`:
- Format: `1.234,56 €`
- Implementation: `Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' })`

## Validation Rules
1. Customer Discount must be ≤ Reseller Discount
2. Both discount percentages must be between 0-100
3. Error messages displayed in Warning Orange (`#EBB700`)

## Next Steps for Integration
1. Connect to backend API for real transaction data
2. Implement data persistence for registered accounts
3. Add filtering and sorting to transactions table
4. Export functionality for reports
5. Add time-based filtering for cost calculations
