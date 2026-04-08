# Cloudflare Bypass - Client-Side Authentication

## Problem
Server-side requests to bot API (https://api.ziji.world) were blocked by Cloudflare's bot protection, causing `/api/auth/guilds` to return empty arrays.

## Solution
Moved API calls from server to client-side browser, where Cloudflare allows normal traffic. Uses JWT token-based authentication.

## How It Works

### 1. Token Generation (Server)
- User logs in → JWT cookie set (existing flow)
- Client requests `/api/auth/token` endpoint
- Server returns a new short-lived JWT token
- Token includes userId and is signed with NEXTAUTH_SECRET

### 2. Client-Side API Calls (Browser)
- Client uses `useBot` hook to make authenticated requests
- Hook automatically fetches and includes Bearer token
- Requests go directly from browser to bot API (bypassing server)
- Cloudflare allows this normal browser traffic

### 3. Bot Server Verification (Backend)
- Bot API receives request with `Authorization: Bearer <token>`
- Bot server verifies JWT token using NEXTAUTH_SECRET
- Extracts userId from decoded token
- Returns user's guilds/config data

## Flow Diagram

```
Client Browser
    ↓
[Login with Discord] → Web Dashboard (config.ziji.world)
    ↓
Web Dashboard
    ↓
Request /api/auth/token (has auth cookie)
    ↓ (includes JWT token)
[useBot Hook]
    ↓
fetch('https://api.ziji.world/bot/users/me/guilds', {
  headers: { Authorization: 'Bearer <token>' }
})
    ↓ (normal browser request - Cloudflare allows this)
Bot Server (api.ziji.world)
    ↓
Verify JWT token with NEXTAUTH_SECRET
    ↓
Extract userId from token
    ↓
Query MongoDB for user.guilds
    ↓
Return 200 OK + guilds JSON
```

## Implementation Details

### Web Dashboard Changes

1. **New Endpoint**: `/api/auth/token`
   - Requires valid auth cookie
   - Returns JWT token valid for 1 hour
   - Token includes userId

2. **New Hook**: `useBot`
   - Client-side hook for authenticated bot API requests
   - Automatically fetches token on first use
   - Includes token in Authorization header

3. **Updated Components**
   - `ServerSelector` now uses `useBot` hook
   - Makes direct requests to `https://api.ziji.world/bot/users/me/guilds`

### Bot Server Changes

1. **New Middleware**: `verifyToken`
   - Extracts Bearer token from Authorization header
   - Verifies JWT using NEXTAUTH_SECRET
   - Adds userId to request object

2. **New Endpoint**: `GET /bot/users/me/guilds`
   - Protected with verifyToken middleware
   - Returns authenticated user's guilds
   - Uses userId from decoded token

## Environment Variables

Ensure NEXTAUTH_SECRET is set on both web and bot server:
- Web Dashboard: Uses for creating JWT tokens
- Bot Server: Uses for verifying tokens

## Security Considerations

1. **Token Expiration**: 1 hour - short-lived token
2. **Authorization Header**: Token sent in standard Authorization header
3. **NEXTAUTH_SECRET**: Shared secret between web and bot
4. **Client-Side**: No tokens stored in localStorage, only used for requests

## Testing

1. Login to web dashboard
2. Open browser Network tab
3. Navigate to guilds page
4. Should see request to `https://api.ziji.world/bot/users/me/guilds`
5. Request should include `Authorization: Bearer ...` header
6. Response should return 60+ guilds

## Migration Checklist

- [x] Web Dashboard: Add `/api/auth/token` endpoint
- [x] Web Dashboard: Create `useBot` hook
- [x] Web Dashboard: Update `ServerSelector` to use `useBot`
- [ ] Bot Server: Add `verifyToken` middleware
- [ ] Bot Server: Add `GET /bot/users/me/guilds` endpoint
- [ ] Test: Verify guild list loads in dashboard
- [ ] Deploy: Push changes to both web and bot servers
