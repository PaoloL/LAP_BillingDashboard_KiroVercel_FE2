# Amplify Environment Variables - Production

Configure these environment variables in AWS Amplify Console for the production frontend.

## Required Environment Variables

```
NEXT_PUBLIC_AWS_REGION=eu-west-1

NEXT_PUBLIC_COGNITO_USER_POOL_ID=eu-west-1_nYFKTpOAC

NEXT_PUBLIC_COGNITO_CLIENT_ID=6qqcjkgcbpc80rulnchrclf0qj

NEXT_PUBLIC_COGNITO_DOMAIN=billing-dashboard-prd-145689194037

NEXT_PUBLIC_REDIRECT_SIGN_IN=https://YOUR_AMPLIFY_DOMAIN/auth/callback

NEXT_PUBLIC_REDIRECT_SIGN_OUT=https://YOUR_AMPLIFY_DOMAIN

NEXT_PUBLIC_API_GATEWAY_BASE_URL=https://5j5apbtvgj.execute-api.eu-west-1.amazonaws.com
```

## How to Configure in Amplify

1. Go to AWS Amplify Console: https://console.aws.amazon.com/amplify/
2. Select your app
3. Go to **App settings** > **Environment variables**
4. Add each variable above
5. **Important**: Replace `YOUR_AMPLIFY_DOMAIN` with your actual Amplify domain (e.g., `https://main.d1234567890.amplifyapp.com`)
6. Click **Save**
7. Redeploy the app

## Update Cognito Redirect URLs

After you know your Amplify domain, update the Cognito redirect URLs:

```bash
AWS_PROFILE=AWSAdministratorAccess-145689194037 aws cognito-idp update-user-pool-client \
  --user-pool-id eu-west-1_nYFKTpOAC \
  --client-id 6qqcjkgcbpc80rulnchrclf0qj \
  --callback-urls "https://YOUR_AMPLIFY_DOMAIN/auth/callback" \
  --logout-urls "https://YOUR_AMPLIFY_DOMAIN" \
  --allowed-o-auth-flows "code" \
  --allowed-o-auth-scopes "email" "openid" "profile" \
  --allowed-o-auth-flows-user-pool-client \
  --supported-identity-providers "COGNITO" \
  --region eu-west-1
```

Replace `YOUR_AMPLIFY_DOMAIN` with your actual domain (without trailing slash).

## Quick Setup Commands

```bash
# 1. Get your Amplify domain
echo "Your Amplify domain: https://main.YOUR_APP_ID.amplifyapp.com"

# 2. Set environment variables in Amplify Console (manual step)

# 3. Update Cognito with your domain
AMPLIFY_DOMAIN="https://main.YOUR_APP_ID.amplifyapp.com"

AWS_PROFILE=AWSAdministratorAccess-145689194037 aws cognito-idp update-user-pool-client \
  --user-pool-id eu-west-1_nYFKTpOAC \
  --client-id 6qqcjkgcbpc80rulnchrclf0qj \
  --callback-urls "${AMPLIFY_DOMAIN}/auth/callback" \
  --logout-urls "${AMPLIFY_DOMAIN}" \
  --allowed-o-auth-flows "code" \
  --allowed-o-auth-scopes "email" "openid" "profile" \
  --allowed-o-auth-flows-user-pool-client \
  --supported-identity-providers "COGNITO" \
  --region eu-west-1
```

## Verify Configuration

After setting environment variables and redeploying:

1. Open browser console
2. Check that Cognito endpoint is `cognito-idp.eu-west-1.amazonaws.com` (not placeholder)
3. Test user registration
4. Check that OAuth redirects work correctly

## Troubleshooting

**Error: `cognito-idp.placeholder.amazonaws.com`**
- Environment variables not set in Amplify
- App not redeployed after setting variables

**Error: `redirect_mismatch`**
- Cognito callback URLs don't match Amplify domain
- Run the update command above with correct domain

**Error: Network error during registration**
- Check that all NEXT_PUBLIC_* variables are set
- Verify API Gateway URL is correct
- Check CORS configuration in backend
