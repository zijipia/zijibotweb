# API Flow Diagrams

## 1. Discord OAuth Login Flow

```
┌─────────────────────────────────────────────────────────────┐
│                   User on Web Dashboard                     │
└─────────────────┬───────────────────────────────────────────┘
                  │ Click "Login with Discord"
                  ▼
┌─────────────────────────────────────────────────────────────┐
│          Discord OAuth Authorization Page                   │
│      (User grants permissions to bot)                       │
└─────────────────┬───────────────────────────────────────────┘
                  │ Redirects to callback with authorization code
                  ▼
┌─────────────────────────────────────────────────────────────┐
│      /api/auth/callback/discord/route.ts                   │
│   1. Exchange auth code for Discord access token            │
│   2. Fetch user profile from Discord                        │
│   3. Fetch user guilds from Discord                         │
└──────┬──────────────────────────────────────────────┬───────┘
       │                                              │
       │ Save to Bot Server                          │
       ▼                                              ▼
┌─────────────────────────────────────────────────────────────┐
│          POST /bot/users/:userId/session                   │
│   Save Discord access token to bot server                   │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│          POST /bot/users/:userId/guilds                    │
│   Save user's Discord servers list to bot server            │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│   Create JWT token (no guilds - keep cookie small)          │
│   Set auth_token cookie                                     │
│   Redirect to /dashboard                                    │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│         User Logged In on Dashboard                         │
└─────────────────────────────────────────────────────────────┘
```

## 2. Load User's Servers Flow

```
┌─────────────────────────────────────────────────────────────┐
│           User visits /dashboard                            │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│      /app/dashboard/page.tsx (Client)                       │
│   useEffect → fetch('/api/auth/guilds')                     │
└─────────────────┬───────────────────────────────────────────┘
                  │ Include auth cookie
                  ▼
┌─────────────────────────────────────────────────────────────┐
│      /app/api/auth/guilds/route.ts                          │
│   1. Verify JWT token from cookie                           │
│   2. Call getBotUserGuilds(userId)                          │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│          GET /bot/users/:userId/guilds                     │
│          (Bot Server API)                                   │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│    Bot Server queries MongoDB collection:                   │
│    db.collection('user_guilds').findOne({ userId })         │
└─────────────────┬───────────────────────────────────────────┘
                  │ Returns guilds array
                  ▼
┌─────────────────────────────────────────────────────────────┐
│    Response: { success: true, data: [...guilds] }           │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│   Dashboard displays server list                            │
│   User can click to view/edit server config                 │
└─────────────────────────────────────────────────────────────┘
```

## 3. Load Server Configuration Flow

```
┌─────────────────────────────────────────────────────────────┐
│      User selects server and goes to Admin Panel            │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│      /app/dashboard/admin/page.tsx                          │
│   fetch(`/api/config?serverId=${serverId}`)                 │
└─────────────────┬───────────────────────────────────────────┘
                  │ Include auth cookie
                  ▼
┌─────────────────────────────────────────────────────────────┐
│      /app/api/config/route.ts (GET)                         │
│   1. Verify JWT token                                       │
│   2. Check user has access to server                        │
│      getBotUserGuilds() to verify                           │
│   3. Call getBotServerConfig(serverId)                      │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│      GET /bot/servers/:serverId/config                     │
│      (Bot Server API)                                       │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│    Bot Server queries MongoDB:                              │
│    db.collection('server_configs')                          │
│      .findOne({ serverId })                                 │
└─────────────────┬───────────────────────────────────────────┘
                  │ Returns config object
                  ▼
┌─────────────────────────────────────────────────────────────┐
│    Response: { success: true, data: { ...config } }         │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│   Admin panel displays form with current config             │
│   User can modify settings                                  │
└─────────────────────────────────────────────────────────────┘
```

## 4. Save Server Configuration Flow

```
┌─────────────────────────────────────────────────────────────┐
│      User modifies config and clicks Save                   │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│      ConfigForm component                                   │
│   fetch('/api/config', {                                    │
│     method: 'PUT',                                          │
│     body: { serverId, config }                              │
│   })                                                        │
└─────────────────┬───────────────────────────────────────────┘
                  │ Include auth cookie
                  ▼
┌─────────────────────────────────────────────────────────────┐
│      /app/api/config/route.ts (PUT)                         │
│   1. Verify JWT token                                       │
│   2. Check user is admin:                                   │
│      checkBotServerAdmin(userId, serverId)                  │
└─────────────────┬───────────────────────────────────────────┘
                  │ If admin approved
                  ▼
┌─────────────────────────────────────────────────────────────┐
│   3. Call updateBotServerConfig(serverId, config)           │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│      POST /bot/servers/:serverId/config                    │
│      (Bot Server API)                                       │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│    Bot Server updates MongoDB:                              │
│    db.collection('server_configs')                          │
│      .updateOne({ serverId }, { $set: config } )            │
└─────────────────┬───────────────────────────────────────────┘
                  │ Bot can immediately reload config
                  ▼
┌─────────────────────────────────────────────────────────────┐
│    Response: { success: true, message: "..." }              │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│   Dashboard shows success message                           │
│   Config is now active on the bot                           │
└─────────────────────────────────────────────────────────────┘
```

## 5. Admin Permission Check Flow

```
┌─────────────────────────────────────────────────────────────┐
│      System needs to verify user is admin                   │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│   checkBotServerAdmin(userId, serverId)                     │
│   in /lib/bot-api.ts                                        │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│      GET /bot/users/:userId/servers/:serverId/admin        │
│      (Bot Server API)                                       │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│    Bot Server checks:                                       │
│    1. Get user guilds from MongoDB                          │
│    2. Find guild with matching serverId                     │
│    3. Check if guild.owner === true                         │
└─────────────────┬───────────────────────────────────────────┘
                  │
          ┌───────┴────────┐
          │                │
       YES│                │NO
          ▼                ▼
      Admin            Not Admin
      ┌─────────────────────────┐
      │ Response:               │
      │ { isAdmin: true }       │
      └─────────────────────────┘
```

## 6. Bot API Response Format

All Bot Server API endpoints follow this pattern:

### Success Response
```json
{
  "success": true,
  "data": {
    /* endpoint-specific data */
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message describing what went wrong"
}
```

## 7. Data Storage in MongoDB

### user_guilds Collection
```javascript
{
  _id: ObjectId(),
  userId: "123456789",
  guilds: [
    {
      id: "987654321",
      name: "My Server",
      icon: "a_1234567890",
      owner: true,
      permissions: "8"
    }
  ],
  updatedAt: Date,
  createdAt: Date
}
```

### user_discord_sessions Collection
```javascript
{
  _id: ObjectId(),
  userId: "123456789",
  discordAccessToken: "token_here",
  userInfo: {
    username: "john_doe",
    avatar: "avatar_hash",
    email: "john@example.com"
  },
  updatedAt: Date,
  createdAt: Date
}
```

### server_configs Collection
```javascript
{
  _id: ObjectId(),
  serverId: "987654321",
  prefix: "!",
  language: "en",
  modRole: "123456789",
  logChannel: "123456789",
  autorole: true,
  autoroleIds: ["123456789"],
  customCommands: [
    {
      name: "ping",
      response: "Pong!"
    }
  ],
  updatedAt: Date,
  createdAt: Date
}
```

## Summary

The flow is:
1. **Web Dashboard** (Next.js) - UI layer
2. **Web API Routes** (/api/*) - Authentication & verification
3. **Bot Server API** (/bot/*) - Data operations
4. **MongoDB** - Persistent storage

This separation ensures clean architecture and single source of truth.
