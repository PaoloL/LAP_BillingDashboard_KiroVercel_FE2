# Frontend Customer API Integration Fix

## Issue
Frontend was sending `undefined` as VAT number in API requests:
```
POST /customers/undefined/cost-centers → 404 Not Found
```

## Root Cause
1. API client methods used `customerId` parameter but backend expects `vatNumber`
2. Data service passed `customer.id` instead of `customer.vatNumber`
3. Customer cache wasn't populated when using real API

## Changes Made

### 1. API Client (`lib/data/api-client.ts`)
Updated all customer methods to use `vatNumber` parameter:
```typescript
// Before
async addCostCenter(customerId: string, ...) {
  return this.request(`/customers/${customerId}/cost-centers`, ...)
}

// After
async addCostCenter(vatNumber: string, ...) {
  return this.request(`/customers/${vatNumber}/cost-centers`, ...)
}
```

Methods updated:
- `updateCustomer(vatNumber, ...)`
- `archiveCustomer(vatNumber)`
- `restoreCustomer(vatNumber)`
- `deleteCustomer(vatNumber)`
- `addCostCenter(vatNumber, ...)`
- `removeCostCenter(vatNumber, ...)`
- `updateCostCenterAccounts(vatNumber, ...)`
- `createDeposit(vatNumber, ...)`

### 2. Data Service (`lib/data/data-service.ts`)
Updated to:
1. Cache customers when fetched from API
2. Look up `vatNumber` from cached customer by `id`

```typescript
async addCostCenter(customerId: string, data: ...) {
  if (config.useMockData) {
    // Mock logic
  }
  const customer = mutableCustomers.find(c => c.id === customerId)
  if (!customer) throw new Error("Customer not found")
  return apiClient.addCostCenter(customer.vatNumber, data)
}
```

### 3. Customer Cache
```typescript
async getCustomers(): Promise<Customer[]> {
  if (config.useMockData) {
    return Promise.resolve([...mutableCustomers])
  }
  const customers = await apiClient.getCustomers()
  // Update cache for ID->VAT lookups
  mutableCustomers.length = 0
  mutableCustomers.push(...customers)
  return customers
}
```

## Why This Approach

The frontend uses `customer.id` (UUID from DynamoDB response) for UI operations, but the backend API uses `vatNumber` as the URL parameter. The data service acts as a translator:

1. UI passes `customer.id` to data service
2. Data service looks up `customer.vatNumber` from cache
3. API client calls backend with `vatNumber`

## Files Modified
- `/lib/data/api-client.ts` - Changed all customer method parameters
- `/lib/data/data-service.ts` - Added ID→VAT lookup logic and caching

## Testing
After changes, the following should work:
```
POST /customers/DE123456789/cost-centers ✅
PUT /customers/DE123456789/cost-centers/{id}/accounts ✅
POST /customers/DE123456789/deposits ✅
```
