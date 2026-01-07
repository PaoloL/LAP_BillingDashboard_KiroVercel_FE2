# Data Service Setup Guide

## Overview

The billing dashboard uses a data service layer that automatically switches between mock data (for v0 console) and real API calls (for local development in VS Code).

## Configuration

### Environment Variables

Create a `.env.local` file in your project root:

```bash
# Use mock data (true) or API (false)
NEXT_PUBLIC_USE_MOCK_DATA=false

# API base URL for real backend
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api
```

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

```typescript
import { dataService } from "@/lib/data/data-service"

// Automatically uses mock or API based on config
const accounts = await dataService.getPayerAccounts()
```

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

## Testing

### In v0 Console
Mock data loads automatically - no setup needed

### In VS Code
1. Set `NEXT_PUBLIC_USE_MOCK_DATA=false`
2. Start your backend API
3. Run `npm run dev`
4. App connects to real API
