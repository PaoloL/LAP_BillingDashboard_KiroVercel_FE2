# Billing Dashboard System

*Automatically synced with your [v0.app](https://v0.app) deployments*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/paololatella-3835s-projects/v0-billing-dashboard-system)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.app-black?style=for-the-badge)](https://v0.app/chat/lBbrB6jknBp)

## Overview

Professional AWS Billing Dashboard with comprehensive cost tracking, multi-account management, and AWS Cognito authentication.

This repository will stay in sync with your deployed chats on [v0.app](https://v0.app).
Any changes you make to your deployed app will be automatically pushed to this repository from [v0.app](https://v0.app).

## Features

- **Authentication**: AWS Cognito user authentication with email verification
- **Dashboard**: Real-time cost tracking and financial insights
- **Accounts**: Manage payer and usage accounts with rebate configurations
- **Transactions**: Detailed transaction history with cost breakdowns
- **Settings**: Exchange rate configuration and user management
- **Exchange Rates**: Configure and apply exchange rates per billing period

## Authentication Setup

This application uses AWS Cognito for authentication. You need to configure the following environment variables:

\`\`\`bash
NEXT_PUBLIC_COGNITO_USER_POOL_ID=your-user-pool-id
NEXT_PUBLIC_COGNITO_CLIENT_ID=your-app-client-id
NEXT_PUBLIC_COGNITO_REGION=us-east-1
\`\`\`

For detailed setup instructions, see [docs/authentication-setup.md](docs/authentication-setup.md).

### Quick Start

1. Create an AWS Cognito User Pool
2. Create an App Client (without client secret)
3. Add environment variables to Vercel or `.env.local`
4. Restart your application

## Environment Variables

Required environment variables:

\`\`\`bash
# Authentication
NEXT_PUBLIC_COGNITO_USER_POOL_ID=your-user-pool-id
NEXT_PUBLIC_COGNITO_CLIENT_ID=your-app-client-id
NEXT_PUBLIC_COGNITO_REGION=us-east-1

# API Configuration
NEXT_PUBLIC_API_GATEWAY_BASE_URL=https://your-api-gateway.amazonaws.com/dev
NEXT_PUBLIC_USE_MOCK_DATA=false
\`\`\`

## Deployment

Your project is live at:

**[https://vercel.com/paololatella-3835s-projects/v0-billing-dashboard-system](https://vercel.com/paololatella-3835s-projects/v0-billing-dashboard-system)**

## Build your app

Continue building your app on:

**[https://v0.app/chat/lBbrB6jknBp](https://v0.app/chat/lBbrB6jknBp)**

## How It Works

1. Create and modify your project using [v0.app](https://v0.app)
2. Deploy your chats from the v0 interface
3. Changes are automatically pushed to this repository
4. Vercel deploys the latest version from this repository

## Local Development

\`\`\`bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
\`\`\`

## Documentation

- [Authentication Setup](docs/authentication-setup.md) - AWS Cognito configuration guide
- [Accounts API Specification](docs/accounts-api-specification.yaml) - Accounts endpoints
- [Transactions API Specification](docs/transactions-api-specification.yaml) - Transactions endpoints
- [Exchange Rate API Specification](docs/exchange-rate-api-specification.yaml) - Exchange rate endpoints

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Authentication**: AWS Cognito with amazon-cognito-identity-js
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui with Radix UI
- **Charts**: Recharts
- **Forms**: React Hook Form with Zod validation
- **State Management**: React Context API
