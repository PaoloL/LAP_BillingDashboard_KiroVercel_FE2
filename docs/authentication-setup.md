# AWS Cognito Authentication Setup

This application uses AWS Cognito for user authentication. Follow these steps to configure authentication for your deployment.

## Prerequisites

- AWS Account
- AWS Cognito User Pool created
- User Pool Client (App Client) created

## Environment Variables

Add the following environment variables to your project:

### Required Variables

```bash
# AWS Cognito Configuration
NEXT_PUBLIC_COGNITO_USER_POOL_ID=your-user-pool-id
NEXT_PUBLIC_COGNITO_CLIENT_ID=your-app-client-id
NEXT_PUBLIC_COGNITO_REGION=us-east-1  # or your AWS region
```

### Where to Find These Values

1. **User Pool ID**:
   - Go to AWS Console → Cognito → User Pools
   - Select your user pool
   - Find "User pool ID" on the overview page
   - Format: `us-east-1_XXXXXXXXX`

2. **Client ID**:
   - In your User Pool, go to "App integration" tab
   - Under "App clients and analytics", select your app client
   - Copy the "Client ID"
   - Format: `xxxxxxxxxxxxxxxxxxxxxxxxxxxx`

3. **Region**:
   - The AWS region where your User Pool is deployed
   - Examples: `us-east-1`, `eu-west-1`, `ap-southeast-1`

## Creating a Cognito User Pool

If you don't have a User Pool yet, follow these steps:

### 1. Create User Pool

1. Go to AWS Cognito Console
2. Click "Create user pool"
3. Configure sign-in options:
   - Select "Email" as sign-in option
   - Enable email verification

### 2. Configure Security

1. Password policy: Use Cognito defaults or customize
2. MFA: Optional (recommended for production)
3. User account recovery: Email only

### 3. Configure Message Delivery

1. Choose "Send email with Cognito" for development
2. For production, configure SES for better deliverability

### 4. Create App Client

1. App client name: `billing-dashboard-client`
2. Authentication flows:
   - ✅ Enable `ALLOW_USER_PASSWORD_AUTH`
   - ✅ Enable `ALLOW_REFRESH_TOKEN_AUTH`
3. **Important**: Do NOT use a client secret (public clients don't support secrets)

### 5. Complete Setup

1. Review your configuration
2. Click "Create user pool"
3. Copy the User Pool ID and Client ID

## Deployment

### Local Development

1. Create `.env.local` file in project root:
```bash
NEXT_PUBLIC_COGNITO_USER_POOL_ID=us-east-1_XXXXXXXXX
NEXT_PUBLIC_COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_COGNITO_REGION=us-east-1
```

2. Restart your development server:
```bash
npm run dev
```

### Vercel Deployment

1. Go to your Vercel project settings
2. Navigate to "Environment Variables"
3. Add the three Cognito variables
4. Redeploy your application

## Authentication Flow

### User Registration

1. User fills out registration form at `/auth/register`
2. Cognito sends verification email
3. User enters code at `/auth/verify`
4. Account is activated

### User Login

1. User enters credentials at `/auth/login`
2. Cognito validates credentials
3. Session token is stored in browser
4. User is redirected to `/dashboard`

### Password Reset

1. User clicks "Forgot password?" at `/auth/login`
2. Enters email at `/auth/forgot-password`
3. Receives reset code via email
4. Enters code and new password
5. Password is updated

## Protected Routes

All application routes are protected by authentication:
- `/dashboard` - Dashboard overview
- `/accounts` - Account management
- `/transactions` - Transaction history
- `/settings` - Application settings

Unauthenticated users are automatically redirected to `/auth/login`.

## Testing

### Test User Creation

You can create test users directly in AWS Cognito Console:

1. Go to your User Pool
2. Click "Users" tab
3. Click "Create user"
4. Fill in email and temporary password
5. User will need to change password on first login

### Mock Authentication (Development)

For development in v0.app, placeholder values are used automatically. The application will show authentication UI but won't connect to a real Cognito backend until you deploy with valid credentials.

## Security Best Practices

1. **Never commit credentials**: Keep `.env.local` in `.gitignore`
2. **Use different pools**: Separate User Pools for dev/staging/production
3. **Enable MFA**: For production environments
4. **Password policy**: Enforce strong passwords
5. **Token refresh**: Implemented automatically by `amazon-cognito-identity-js`
6. **Session timeout**: Tokens expire after 1 hour by default

## Troubleshooting

### "User is not confirmed" Error

- User needs to verify email with the code sent during registration
- Resend verification code from `/auth/verify` page

### "Incorrect username or password" Error

- Check credentials are correct
- Ensure user account is confirmed
- Check User Pool allows password authentication flow

### "Invalid session" Error

- Session token expired (default 1 hour)
- User needs to log in again
- Check token refresh is working properly

### Connection Issues

- Verify environment variables are set correctly
- Check User Pool ID and Client ID match
- Ensure AWS region is correct
- Check App Client has password auth enabled

## API Reference

The application uses these Cognito SDK functions:

- `signUp()` - Register new user
- `signIn()` - Authenticate user
- `signOut()` - End user session
- `verifyEmail()` - Confirm email with code
- `forgotPassword()` - Initiate password reset
- `confirmPassword()` - Complete password reset
- `getCurrentUser()` - Get authenticated user
- `getSession()` - Get current session token

All functions are wrapped in promises and include error handling.

## Support

For issues specific to AWS Cognito, refer to:
- [AWS Cognito Documentation](https://docs.aws.amazon.com/cognito/)
- [amazon-cognito-identity-js Documentation](https://github.com/aws-amplify/amplify-js/tree/main/packages/amazon-cognito-identity-js)
