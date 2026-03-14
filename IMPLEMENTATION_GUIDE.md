# Bot Configuration Dashboard - Implementation Guide

## Overview
This is a web-based bot configuration dashboard that allows server owners to manage bot settings through Discord OAuth authentication and MongoDB integration.

## Architecture

### Frontend
- **Framework**: Next.js 16 with App Router
- **UI Components**: shadcn/ui
- **Authentication**: Discord OAuth 2.0
- **Real-time Updates**: WebSocket support (optional)

### Backend
- **API Routes**: Next.js API routes for auth and config management
- **Database**: MongoDB via `zihooks.get("db")`
- **Session Management**: JWT tokens stored in HTTP-only cookies

## Setup Instructions

### 1. Discord OAuth Setup
1. Go to https://discord.com/developers/applications
2. Create a new application
3. In OAuth2 section, add a redirect URI: `http://localhost:3000/api/auth/discord/callback` (adjust for production)
4. Copy Client ID and Client Secret

### 2. Environment Variables
Set these in your project settings (Vars section):

```
DISCORD_CLIENT_ID=your_client_id
DISCORD_CLIENT_SECRET=your_client_secret
DISCORD_REDIRECT_URI=http://localhost:3000/api/auth/discord/callback
NEXTAUTH_SECRET=generate_with_openssl_rand_-base64_32
```

### 3. Start Development
```bash
npm run dev
# or
pnpm dev
```

Visit `http://localhost:3000` to start

## Project Structure

```
/app
  /api
    /auth
      /discord/route.ts      - OAuth callback
      /check/route.ts        - Verify auth status
      /user/route.ts         - Get current user
      /guilds/route.ts       - Get user's servers
      /logout/route.ts       - Logout
    /config/route.ts         - Get/update server config
  /dashboard
    /layout.tsx              - Dashboard layout with nav
    /page.tsx                - Server selector
    /admin/page.tsx          - Admin panel (for server owners)
    /settings/page.tsx       - Settings & API docs
  page.tsx                   - Login page
  layout.tsx                 - Root layout

/components
  /dashboard
    /nav.tsx                 - Sidebar navigation
    /server-selector.tsx     - Server selection grid
    /config-form.tsx         - Server configuration form

/lib
  /auth.ts                   - JWT verification & login URL generation
  /ws.ts                     - WebSocket client utility
```

## API Routes

### Authentication

#### GET `/api/auth/discord`
Discord OAuth callback. Redirects here from Discord with authorization code.

#### GET `/api/auth/check`
Check if user is authenticated.
```
Response: { authenticated: true }
```

#### GET `/api/auth/user`
Get current user info.
```
Response: {
  id: "user_id",
  username: "username",
  discriminator: "0000",
  avatar: "avatar_hash",
  email: "email@example.com"
}
```

#### GET `/api/auth/guilds`
Get all servers user is in.
```
Response: [
  {
    id: "guild_id",
    name: "Server Name",
    icon: "icon_hash",
    owner: true/false,
    permissions: "permission_bits"
  }
]
```

#### POST `/api/auth/logout`
Logout user (clears auth cookie).

### Configuration

#### GET `/api/config?serverId=GUILD_ID`
Get server configuration.
```
Response: {
  serverId: "guild_id",
  prefix: "!",
  language: "en",
  modRole: null,
  logChannel: null,
  autorole: false,
  autoroleIds: [],
  customCommands: []
}
```

#### PUT `/api/config`
Update server configuration (only for server owners).
```
Request: {
  serverId: "guild_id",
  config: {
    prefix: "!",
    language: "en",
    ...
  }
}

Response: {
  success: true,
  message: "Config updated successfully",
  config: { ... }
}
```

## MongoDB Integration Notes

### Using zihooks
The bot server uses `zihooks.get("db")` to access MongoDB. To implement this in the API routes:

```typescript
// In your API route
const { useHooks } = require("zihooks");
const db = useHooks.get("db");

// Example: Get config
const config = await db.collection("bot_configs").findOne({ serverId });

// Example: Update config
await db.collection("bot_configs").updateOne(
  { serverId },
  { $set: config },
  { upsert: true }
);
```

### Suggested Collections
1. **bot_configs** - Server configurations
   ```
   {
     serverId: String,
     prefix: String,
     language: String,
     modRole: String | null,
     logChannel: String | null,
     autorole: Boolean,
     autoroleIds: [String],
     customCommands: [Object],
     createdAt: Date,
     updatedAt: Date
   }
   ```

2. **user_sessions** (optional) - Track user sessions
   ```
   {
     userId: String,
     token: String,
     expiresAt: Date,
     createdAt: Date
   }
   ```

## WebSocket Implementation

The WebSocket utility is ready for real-time updates. To implement:

1. **Server-side**: Set up a WebSocket server at `api.ziji.world`
2. **Client-side**: Use the `botWS` utility:

```typescript
import { botWS } from '@/lib/ws';

// Connect
await botWS.connect();

// Listen for config updates
botWS.on('config:updated', (payload) => {
  console.log('Config updated:', payload);
  // Update UI
});

// Send message
botWS.send('config:update', {
  serverId: 'guild_id',
  config: { ... }
});
```

## Security Considerations

✅ **Implemented**
- JWT tokens in HTTP-only cookies
- Permission verification (server owner only for admin panel)
- Secure OAuth flow

⚠️ **To Implement**
- Rate limiting on API endpoints
- CSRF protection
- Input validation and sanitization
- Audit logging

## Extending the Dashboard

### Adding New Settings
1. Add fields to `ServerConfig` interface in `/app/dashboard/admin/page.tsx`
2. Update `/components/dashboard/config-form.tsx` with new form fields
3. Update `/api/config/route.ts` to handle new fields
4. Update MongoDB schema

### Adding New Admin Pages
1. Create new file in `/app/dashboard/` folder
2. Use `verifyAuth()` to check permissions
3. Check if user is server owner before showing sensitive data

### Connecting to Bot Server
1. In API routes, use `zihooks.get("db")` to access MongoDB
2. Broadcast updates to bot via API call or WebSocket
3. Implement message queue (e.g., Redis) for reliability

## Troubleshooting

### "Unauthorized" when accessing admin panel
- Make sure you're logged in
- Check if you're a server owner of the selected server

### Config not saving
- Check MongoDB connection via `zihooks.get("db")`
- Verify collections exist
- Check API response in browser console

### Discord OAuth redirect not working
- Verify redirect URI matches exactly in Discord dev portal
- Check `DISCORD_REDIRECT_URI` environment variable
- Ensure CORS is not blocking the request

## Next Steps

1. ✅ Connect to MongoDB using `zihooks.get("db")`
2. ✅ Implement config persistence in `/api/config/route.ts`
3. ✅ Add WebSocket server at `api.ziji.world` for real-time updates
4. ✅ Add input validation and error handling
5. ✅ Add audit logging for config changes
6. ✅ Deploy to production

## Resources

- Discord Developer Portal: https://discord.com/developers
- Next.js Docs: https://nextjs.org/docs
- JWT: https://jwt.io
- MongoDB: https://www.mongodb.com
- shadcn/ui: https://ui.shadcn.com
