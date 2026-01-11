# Data Service Setup Guide

## Overview

The billing dashboard uses a data service layer that automatically switches between mock data (for v0 console) and real API calls (for local development in VS Code).

## Configuration

### Environment Variables

Create a `.env.local` file in your project root:

\`\`\`bash
# Use mock data (true) or API (false)
NEXT_PUBLIC_USE_MOCK_DATA=false

# AWS API Gateway URL (preferred)
NEXT_PUBLIC_API_GATEWAY_BASE_URL=https://qwvzcttk3b.execute-api.eu-west-1.amazonaws.com/dev

# OR use generic API base URL
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api
\`\`\`

### Automatic Detection

The system automatically detects where it's running:
- **v0 console**: Always uses mock data
- **VS Code/Local**: Uses environment variable setting

## How It Works

### 1. Configuration (`lib/config.ts`)
Determines which data source to use based on environment

### 2. Mock Data (`lib/data/mock-data.ts`)
Contains all sample data for development in v0

### 3. API Client (`lib/data/api-client.ts`)
Handles real HTTP requests to your backend API

### 4. Data Service (`lib/data/data-service.ts`)
Smart layer that switches between mock and API

## Usage in Components

\`\`\`typescript
import { dataService } from "@/lib/data/data-service"

// Automatically uses mock or API based on config
const accounts = await dataService.getPayerAccounts()
\`\`\`

## Backend API Requirements

Your backend should implement these endpoints:

### Payer Accounts
- `GET /api/payer-accounts` - List all
- `POST /api/payer-accounts` - Create new
- `PATCH /api/payer-accounts/:id` - Update

### Usage Accounts
- `GET /api/usage-accounts` - List all
- `POST /api/usage-accounts` - Create new
- `PATCH /api/usage-accounts/:id` - Update

### Transactions
- `GET /api/transactions` - List all (with query params for filtering)
- `POST /api/transactions` - Create new

## AWS API Gateway Setup

### Option 1: Using Existing API Gateway

If you already have an AWS API Gateway:

\`\`\`bash
# .env.local
NEXT_PUBLIC_USE_MOCK_DATA=false
NEXT_PUBLIC_API_GATEWAY_BASE_URL=https://your-api-id.execute-api.region.amazonaws.com/stage
\`\`\`

The application will automatically use `NEXT_PUBLIC_API_GATEWAY_BASE_URL` if it's set, falling back to `NEXT_PUBLIC_API_BASE_URL` if not.

### Option 2: Local Development

For local backend testing:

\`\`\`bash
# .env.local
NEXT_PUBLIC_USE_MOCK_DATA=false
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api
