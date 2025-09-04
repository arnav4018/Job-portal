# Google OAuth Setup Guide

## Current Status
✅ **Google OAuth is temporarily disabled** to prevent the "redirect_uri_mismatch" error.
✅ **Email/Password authentication is working** for development.

## To Enable Google OAuth (Optional)

### Step 1: Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Google+ API

### Step 2: Configure OAuth Consent Screen
1. Go to "APIs & Services" > "OAuth consent screen"
2. Choose "External" user type
3. Fill in required fields:
   - App name: "JobPortal Pro"
   - User support email: your email
   - Developer contact: your email

### Step 3: Create OAuth Credentials
1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Choose "Web application"
4. Add these Authorized redirect URIs:
   ```
   http://localhost:3001/api/auth/callback/google
   http://localhost:3000/api/auth/callback/google
   https://yourdomain.com/api/auth/callback/google
   ```

### Step 4: Update Environment Variables
1. Copy the Client ID and Client Secret
2. Update `.env` file:
   ```env
   GOOGLE_CLIENT_ID="your-actual-client-id"
   GOOGLE_CLIENT_SECRET="your-actual-client-secret"
   ```

### Step 5: Restart Server
```bash
npm run dev
```

## Alternative: Use Email/Password Only

The application works perfectly without Google OAuth using:
- ✅ Email/Password registration
- ✅ Email/Password login
- ✅ All other features functional

## Current Working Authentication Methods

1. **Email/Password Signup**: ✅ Working
   - Visit: http://localhost:3001/auth/signup
   - Create account with email and password

2. **Email/Password Signin**: ✅ Working  
   - Visit: http://localhost:3001/auth/signin
   - Login with created credentials

## Test Account (if needed)
You can create a test account or use the seeded admin account:
- Email: admin@jobportal.com
- Password: (set during signup)

The application is fully functional without Google OAuth!