# AWS Billing Dashboard API Guide

## Overview

This API provides comprehensive management of AWS billing accounts, transactions, and financial analytics for resellers managing customer discounts.

## Base URLs

- **Production**: `https://api.billingdashboard.example.com/v1`
- **Staging**: `https://staging-api.billingdashboard.example.com/v1`
- **Development**: `http://localhost:3000/api`

## Authentication

All API requests require authentication using Bearer tokens:

\`\`\`bash
Authorization: Bearer <your_jwt_token>
\`\`\`

## Financial Calculation Logic

The system implements a two-tier discount model:

### Cost Calculations

\`\`\`typescript
// Reseller Discount (applied to AWS usage)
netCost = usage * (1 - resellerDiscount / 100)

// Customer Discount (informational, for customer invoicing)
customerCost = usage * (1 - customerDiscount / 100)

// Final Cost (what customer actually pays)
applicableCredit = rebateEnabled ? credit : 0
finalCost = usage + fee + applicableCredit
\`\`\`

### Business Rules

1. **Customer Discount ≤ Reseller Discount**: The customer discount cannot exceed the reseller discount
2. **Rebate Credits**: Credits only apply to final cost when `rebateEnabled` is `true`
3. **Negative Credits**: Credit amounts should be entered as positive values but are stored/displayed as negative

## Common Use Cases

### 1. Register a New Customer (Payer Account)

**Scenario**: A new customer signs up for your AWS reseller services.

\`\`\`bash
POST /payer-accounts
Content-Type: application/json

{
  "accountId": "123456789012",
  "customerName": "Acme Corporation",
  "notes": "Enterprise customer - 24/7 support"
}
\`\`\`

**Response**:
\`\`\`json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "accountId": "123456789012",
    "customerName": "Acme Corporation",
    "notes": "Enterprise customer - 24/7 support",
    "usageAccountCount": 0,
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  },
  "message": "Payer account registered successfully"
}
\`\`\`

### 2. Register a Usage Account with Discounts

**Scenario**: Customer has a development environment that needs 15% reseller discount and 10% customer discount.

\`\`\`bash
POST /usage-accounts
Content-Type: application/json

{
  "accountId": "987654321098",
  "customerName": "Acme Dev Team",
  "payerAccountId": "123456789012",
  "resellerDiscount": 15.0,
  "customerDiscount": 10.0,
  "rebateEnabled": true,
  "notes": "Development environment - apply credits"
}
\`\`\`

**Response**:
\`\`\`json
{
  "data": {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "accountId": "987654321098",
    "customerName": "Acme Dev Team",
    "payerId": "550e8400-e29b-41d4-a716-446655440000",
    "payerAccountId": "123456789012",
    "payerCustomerName": "Acme Corporation",
    "resellerDiscount": 15.0,
    "customerDiscount": 10.0,
    "rebateEnabled": true,
    "notes": "Development environment - apply credits",
    "totalUsage": 0,
    "totalCredits": 0,
    "totalFees": 0,
    "createdAt": "2024-01-15T11:00:00Z",
    "updatedAt": "2024-01-15T11:00:00Z"
  },
  "message": "Usage account registered successfully"
}
\`\`\`

### 3. Record Monthly Usage

**Scenario**: Record AWS usage charges for January 2024.

\`\`\`bash
POST /transactions
Content-Type: application/json

{
  "type": "usage",
  "usageAccountId": "987654321098",
  "amount": 5000.00,
  "date": "2024-01-31",
  "notes": "January 2024 AWS usage"
}
\`\`\`

**Response**:
\`\`\`json
{
  "data": {
    "id": "770e8400-e29b-41d4-a716-446655440002",
    "type": "usage",
    "usageAccountId": "987654321098",
    "usageAccountName": "Acme Dev Team",
    "payerAccountId": "123456789012",
    "payerCustomerName": "Acme Corporation",
    "amount": 5000.00,
    "date": "2024-01-31",
    "notes": "January 2024 AWS usage",
    "resellerDiscount": 15.0,
    "customerDiscount": 10.0,
    "rebateEnabled": true,
    "netCost": 4250.00,
    "finalCost": 5000.00,
    "createdAt": "2024-02-01T09:00:00Z",
    "updatedAt": "2024-02-01T09:00:00Z"
  },
  "message": "Transaction registered successfully"
}
\`\`\`

### 4. Apply Credits

**Scenario**: Customer receives AWS promotional credits.

\`\`\`bash
POST /transactions
Content-Type: application/json

{
  "type": "credit",
  "usageAccountId": "987654321098",
  "amount": -500.00,
  "date": "2024-01-15",
  "notes": "AWS promotional credits"
}
\`\`\`

### 5. Get Dashboard Metrics

**Scenario**: View current month financial summary.

\`\`\`bash
GET /dashboard/metrics?period=current_month
\`\`\`

**Response**:
\`\`\`json
{
  "data": {
    "period": {
      "start": "2024-01-01",
      "end": "2024-01-31",
      "label": "January 2024"
    },
    "usage": {
      "total": 15000.00,
      "byPayer": [
        {
          "payerAccountId": "123456789012",
          "customerName": "Acme Corporation",
          "amount": 15000.00,
          "percentage": 100.0
        }
      ],
      "topUsageAccounts": [
        {
          "accountId": "987654321098",
          "customerName": "Acme Dev Team",
          "amount": 5000.00
        }
      ]
    },
    "discounts": {
      "totalResellerDiscount": 2250.00,
      "totalCustomerDiscount": 1500.00,
      "byPayer": [...],
      "byUsageAccount": [...]
    },
    "transactions": {
      "totalUsage": 15000.00,
      "totalCredits": -500.00,
      "totalFees": 250.00,
      "totalNetCost": 12750.00,
      "totalFinalCost": 14750.00,
      "count": 25,
      "latest": [...]
    }
  }
}
\`\`\`

### 6. Filter Transactions

**Scenario**: Get all usage transactions for a specific account in Q1 2024.

\`\`\`bash
GET /transactions?type=usage&usageAccountId=987654321098&startDate=2024-01-01&endDate=2024-03-31&sortBy=date&sortOrder=desc
\`\`\`

## Error Handling

### Common Error Codes

| Code | Description | HTTP Status |
|------|-------------|-------------|
| `VALIDATION_ERROR` | Invalid input data | 400 |
| `BUSINESS_RULE_VIOLATION` | Business logic violation | 400 |
| `NOT_FOUND` | Resource not found | 404 |
| `DUPLICATE_ACCOUNT` | Account already exists | 409 |
| `ACCOUNT_HAS_DEPENDENCIES` | Cannot delete due to dependencies | 400 |
| `INTERNAL_ERROR` | Server error | 500 |

### Example Error Response

\`\`\`json
{
  "error": {
    "code": "BUSINESS_RULE_VIOLATION",
    "message": "Customer discount cannot exceed reseller discount",
    "details": {
      "resellerDiscount": 10.0,
      "customerDiscount": 15.0
    }
  }
}
\`\`\`

## Rate Limiting

- **Rate Limit**: 1000 requests per hour per API key
- **Headers**:
  - `X-RateLimit-Limit`: Maximum requests per hour
  - `X-RateLimit-Remaining`: Remaining requests
  - `X-RateLimit-Reset`: UTC timestamp when limit resets

## Pagination

All list endpoints support pagination:

**Query Parameters**:
- `page` (default: 1)
- `limit` (default: 20, max: 100)

**Response Structure**:
\`\`\`json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8,
    "hasNext": true,
    "hasPrevious": false
  }
}
\`\`\`

## Best Practices

1. **Always validate discount configuration** before creating/updating usage accounts
2. **Use transaction dates carefully** - they affect period-based metrics
3. **Enter credits as negative amounts** for consistency
4. **Set rebateEnabled appropriately** - it affects final cost calculations
5. **Use pagination** for large datasets to optimize performance
6. **Handle errors gracefully** - check error codes and provide user feedback
7. **Cache dashboard metrics** - they're expensive to calculate in real-time

## Testing

### Postman Collection

Import the OpenAPI spec into Postman for a ready-to-use collection:

1. Open Postman
2. Import → Link → `https://api.billingdashboard.example.com/openapi.yaml`
3. Set environment variables for `baseUrl` and `token`

### Example Test Flow

\`\`\`bash
# 1. Register payer account
POST /payer-accounts {...}

# 2. Register usage account
POST /usage-accounts {...}

# 3. Create usage transaction
POST /transactions {"type": "usage", ...}

# 4. Create credit transaction
POST /transactions {"type": "credit", ...}

# 5. View dashboard
GET /dashboard/metrics?period=current_month

# 6. List transactions
GET /transactions?usageAccountId=...
\`\`\`

## Support

For API support:
- Email: support@example.com
- Documentation: https://docs.billingdashboard.example.com
- Status Page: https://status.billingdashboard.example.com
