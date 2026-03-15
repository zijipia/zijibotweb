# Migration from MongoDB to Bot API

## Overview

The web dashboard has been migrated from direct MongoDB access to communicating through the Bot Server's API endpoints. This ensures:

- **Centralized Data Management** - All data operations go through the bot server
- **Security** - Web dashboard doesn't need direct database access
- **Real-time Updates** - Bot can reload configuration immediately when dashboard changes it
- **Consistency** - Single source of truth for all configuration data

## Architecture Change

### Before (Direct MongoDB)
```
Web Dashboard
    ↓
  MongoDB ← directly accessed by web app
```

### After (Bot API)
```
Web Dashboard
    ↓
Bot Server API
    ↓
  MongoDB ← managed by bot server
```

## Files Changed

### Created Files

**`/lib/bot-api.ts`** - New client for communicating with bot server
- `getBotUserGuilds()` - Fetch user's Discord servers
- `saveBotUserSession()` - Save user session to bot
- `saveBotUserGuilds()` - Save user's guilds list
- `getBotServerConfig()` - Get server configuration
- `updateBotServerConfig()` - Update server configuration
- `getBotServerInfo()` - Get server information
- `checkBotServerAdmin()` - Check admin permissions

### Modified Files

**`/app/api/auth/callback/discord/route.ts`**
- Replaced: `saveUserSession()` and `saveUserGuilds()` (MongoDB)
- With: `saveBotUserSession()` and `saveBotUserGuilds()` (Bot API)

**`/app/api/auth/guilds/route.ts`**
- Replaced: `getUserGuilds()` (MongoDB)
- With: `getBotUserGuilds()` (Bot API)

**`/app/api/config/route.ts`**
- Replaced: `getServerConfig()` and `updateServerConfig()` (MongoDB)
- With: `getBotServerConfig()` and `updateBotServerConfig()` (Bot API)
- Replaced: Guild access check using authData.guilds
- With: `getBotUserGuilds()` and `checkBotServerAdmin()` (Bot API)

### Deprecated Files

**`/lib/mongodb.ts`** - No longer used
- Keep for reference or delete
- All MongoDB operations now handled by bot server

## Environment Variables

Make sure your `.env.local` includes:

```env
# Bot Server API Base URL
BOT_API_URL=https://api.ziji.world
```

If not set, it defaults to `https://api.ziji.world`

## Bot Server Implementation

You need to implement the following endpoints on your bot server:

```
GET  /bot/users/:userId/guilds
POST /bot/users/:userId/session
POST /bot/users/:userId/guilds
GET  /bot/users/:userId/servers/:serverId/admin
GET  /bot/servers/:serverId/config
POST /bot/servers/:serverId/config
GET  /bot/servers/:serverId/info
```

See `BOT_API_ENDPOINTS.md` for detailed specifications and example implementations.

## Testing the Migration

### 1. Verify Discord OAuth Still Works
- Go to `http://localhost:3000`
- Click "Login with Discord"
- After callback, you should be redirected to dashboard

### 2. Check Guilds Fetch
- On dashboard, verify your servers are listed
- Check browser console for any API errors

### 3. Test Config Save
- Select a server you own
- Go to Admin Panel
- Change a setting and save
- Verify it updates without errors

## Rollback (if needed)

To temporarily use local MongoDB instead of bot API:

1. Revert imports in route files from `bot-api` back to `mongodb`
2. Update function calls to use old MongoDB functions
3. Ensure local MongoDB instance is running

However, this is not recommended for production.

## Troubleshooting

### Bot API is not responding

**Error:** `Bot API error: 500` or timeout

**Solution:**
1. Check bot server is running: `echo | curl https://api.ziji.world/health`
2. Check bot server logs for errors
3. Verify BOT_API_URL env variable is correct

### User guilds not loading

**Error:** Empty guilds list or 401 Unauthorized

**Solution:**
1. Verify user session was saved in previous step
2. Check if `/bot/users/:userId/guilds` endpoint is working
3. Check bot server has user in database

### Config not saving

**Error:** "Failed to update config"

**Solution:**
1. Check user is admin: `/bot/users/:userId/servers/:serverId/admin`
2. Verify endpoint path is correct on bot server
3. Check request body format matches expected schema

## API Response Format

All bot API endpoints follow this response format:

### Success Response
```json
{
  "success": true,
  "data": { /* response data */ }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message describing what went wrong"
}
```

## Data Flow Examples

### Login Flow
```
1. User clicks "Login with Discord"
2. Discord OAuth redirects to /api/auth/callback/discord?code=...
3. Exchange code for Discord token
4. Fetch user info and guilds from Discord
5. POST to /bot/users/:userId/session (save access token)
6. POST to /bot/users/:userId/guilds (save guilds list)
7. Create JWT and set auth cookie
8. Redirect to /dashboard
```

### Config Update Flow
```
1. User selects server and goes to Admin Panel
2. Change config settings and click Save
3. POST to /api/config with { serverId, config }
4. Verify user is admin: checkBotServerAdmin()
5. POST to /bot/servers/:serverId/config (save to bot)
6. Bot server saves to MongoDB and reloads config
7. Return success response to frontend
```

## Future Improvements

- [ ] Add WebSocket support for real-time config updates
- [ ] Implement config version history/rollback
- [ ] Add audit logs for config changes
- [ ] Cache bot API responses in memory
- [ ] Add request rate limiting

## Support

If you encounter issues:

1. Check `BOT_API_ENDPOINTS.md` for endpoint specifications
2. Enable debug logging in bot server
3. Verify all environment variables are set correctly
4. Check that both web dashboard and bot server are running
