# Google OAuth Setup Instructions

## Step 1: Create Google Cloud Console Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API (or Google Identity API)

## Step 2: Create OAuth 2.0 Credentials

1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth 2.0 Client IDs**
3. Configure the consent screen first if prompted
4. For Application type, select **Web application**
5. Add authorized origins:
   - `http://localhost` (for development)
   - `http://localhost:3000` (if using a different port)
   - Your production domain (when deployed)
6. Add authorized redirect URIs:
   - `http://localhost/pages/sign-in.html`
   - Your production URLs (when deployed)

## Step 3: Get Your Client ID

1. Copy the **Client ID** (it will look like: `123456789-abcdefg.apps.googleusercontent.com`)
2. Update the frontend (`sign-in.html`):
   ```javascript
   const GOOGLE_CLIENT_ID = 'YOUR_ACTUAL_CLIENT_ID_HERE';
   ```
3. Update the backend (`main.py`):
   ```python
   GOOGLE_CLIENT_ID = "YOUR_ACTUAL_CLIENT_ID_HERE"
   ```

## Step 4: Test the Integration

1. Start your backend server:
   ```bash
   cd Backend
   python main.py
   ```

2. Open `sign-in.html` in your browser
3. Click the Google sign-in button
4. Complete the Google authentication flow

## Security Notes

- Never commit your actual Client ID to version control
- In production, use environment variables:
  ```python
  import os
  GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
  ```
- The Client Secret is not needed for this implementation (we're using the public client flow)

## Current Implementation Features

✅ **Frontend**: Google Sign-In button with loading states
✅ **Backend**: Google OAuth token verification
✅ **Database**: Automatic user creation for new Google users
✅ **Profiles**: Auto-created customer profiles for Google users
✅ **Security**: JWT tokens for authenticated sessions
✅ **UX**: Seamless integration with existing login flow

## What Happens When User Signs In with Google

1. User clicks Google button
2. Google popup/redirect shows up
3. User authorizes your app
4. Google returns a JWT token
5. Frontend sends token to your backend
6. Backend verifies token with Google
7. If new user: creates account automatically
8. If existing user: logs them in
9. Returns your app's JWT token
10. User is redirected to appropriate dashboard

## Next Steps

1. Replace placeholder Client IDs with real ones
2. Test the complete flow
3. Add Facebook and Apple sign-in (optional)
4. Add profile completion flow for Google users
