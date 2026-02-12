# Customer Component API Integration Fix

## Issue
The customers page was using mock data instead of fetching from DynamoDB via API Gateway.

## Root Cause
1. `api-client.ts` was missing customer-related API methods
2. `data-service.ts` customer methods were hardcoded to return mock data
3. Deposit handler in `customers-page-content.tsx` wasn't calling the API

## Changes Made

### 1. `/lib/data/api-client.ts`
Added complete customer API methods:
- `getCustomers()` - GET /customers
- `createCustomer()` - POST /customers
- `updateCustomer()` - PUT /customers/{id}
- `archiveCustomer()` - POST /customers/{id}/archive
- `restoreCustomer()` - POST /customers/{id}/restore
- `deleteCustomer()` - DELETE /customers/{id}
- `addCostCenter()` - POST /customers/{id}/cost-centers
- `removeCostCenter()` - DELETE /customers/{id}/cost-centers/{ccId}
- `updateCostCenterAccounts()` - PUT /customers/{id}/cost-centers/{ccId}/accounts
- `createDeposit()` - POST /customers/{id}/deposits

### 2. `/lib/data/data-service.ts`
Updated all customer methods to:
- Check `config.useMockData` flag
- Call `apiClient` methods when mock data is disabled
- Fall back to mock data when enabled

### 3. `/components/customers/customers-page-content.tsx`
Fixed `handleDeposit()` to call `dataService.createDeposit()` instead of just logging.

## API Endpoints Used
Base URL: `https://lq00597vce.execute-api.eu-west-1.amazonaws.com/dev`

All customer operations now correctly route through:
- Lambda: `billing-dashboard-backend-dev-customers-dev`
- DynamoDB Table: `billing-dashboard-backend-dev-accounts-dev`

## Verification
Environment configuration (`.env.local`):
```
NEXT_PUBLIC_USE_MOCK_DATA=false
NEXT_PUBLIC_API_GATEWAY_BASE_URL=https://lq00597vce.execute-api.eu-west-1.amazonaws.com/dev
```

## Testing
Run the integration test to verify end-to-end flow:
```bash
cd tests
TABLE_NAME="billing-dashboard-backend-dev-accounts-dev" \
AWS_REGION="eu-west-1" \
AWS_PROFILE="AWSAdministratorAccess-767828734903" \
node test_customer_deposit_flow.js
```

Expected: `PASS`
