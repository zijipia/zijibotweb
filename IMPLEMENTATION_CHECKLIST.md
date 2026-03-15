# Bot API Implementation Checklist

Complete this checklist to fully integrate the bot server API with the web dashboard.

## Phase 1: Web Dashboard Setup

- [ ] Verify `lib/bot-api.ts` exists with all client functions
- [ ] Check environment variable `BOT_API_URL` is set (or defaults to `https://api.ziji.world`)
- [ ] Verify all API routes use bot API instead of MongoDB:
  - [ ] `/app/api/auth/callback/discord/route.ts` - Uses `saveBotUserSession()` and `saveBotUserGuilds()`
  - [ ] `/app/api/auth/guilds/route.ts` - Uses `getBotUserGuilds()`
  - [ ] `/app/api/config/route.ts` - Uses `getBotServerConfig()`, `updateBotServerConfig()`, `checkBotServerAdmin()`
- [ ] Test web dashboard builds without errors: `npm run build`
- [ ] Web dashboard starts without errors: `npm run dev`

## Phase 2: Bot Server Preparation

### Database Collections

Ensure these MongoDB collections exist in your bot server:

- [ ] `user_guilds` - Stores user Discord servers
  ```javascript
  {
    userId: String,
    guilds: Array,
    updatedAt: Date,
    createdAt: Date
  }
  ```

- [ ] `user_discord_sessions` - Stores user access tokens
  ```javascript
  {
    userId: String,
    discordAccessToken: String,
    userInfo: Object,
    updatedAt: Date,
    createdAt: Date
  }
  ```

- [ ] `server_configs` - Stores bot configurations
  ```javascript
  {
    serverId: String,
    prefix: String,
    language: String,
    modRole: String,
    logChannel: String,
    autorole: Boolean,
    autoroleIds: Array,
    customCommands: Array,
    updatedAt: Date,
    createdAt: Date
  }
  ```

### Express Routes

- [ ] Copy `BOT_SERVER_EXAMPLE.js` to bot server codebase
- [ ] Register routes in main bot server file:
  ```javascript
  const apiRoutes = require('./routes/api.js');
  app.use('/bot', apiRoutes);
  ```

- [ ] Implement these endpoints:
  - [ ] `GET /bot/users/:userId/guilds`
  - [ ] `POST /bot/users/:userId/session`
  - [ ] `POST /bot/users/:userId/guilds`
  - [ ] `GET /bot/users/:userId/servers/:serverId/admin`
  - [ ] `GET /bot/servers/:serverId/config`
  - [ ] `POST /bot/servers/:serverId/config`
  - [ ] `GET /bot/servers/:serverId/info`

- [ ] Verify routes use `useHooks.get('db')` for MongoDB access
- [ ] Error handling returns proper response format: `{ success: false, error: "..." }`
- [ ] Success responses follow format: `{ success: true, data: {...} }`

## Phase 3: Testing

### Unit Tests

- [ ] Test each bot API endpoint independently
- [ ] Mock MongoDB responses
- [ ] Verify error handling

### Integration Tests

- [ ] Test Discord OAuth flow end-to-end
  - [ ] User clicks login
  - [ ] Redirects to Discord
  - [ ] Returns with auth code
  - [ ] Token is created and cookie is set
  - [ ] User is redirected to dashboard

- [ ] Test loading servers
  - [ ] Dashboard calls `/api/auth/guilds`
  - [ ] Receives list of user's servers
  - [ ] Servers display correctly in UI

- [ ] Test loading config
  - [ ] User selects a server they own
  - [ ] Goes to Admin Panel
  - [ ] Config loads from bot server
  - [ ] Current values display in form

- [ ] Test saving config
  - [ ] User modifies config settings
  - [ ] Clicks Save
  - [ ] PUT request sent to `/api/config`
  - [ ] Bot server saves to MongoDB
  - [ ] Success message displays
  - [ ] Config reflects changes

### Curl Tests

Test endpoints directly with curl:

```bash
# Test user guilds endpoint
curl -X GET https://api.ziji.world/bot/users/123456789/guilds

# Test save session endpoint
curl -X POST https://api.ziji.world/bot/users/123456789/session \
  -H "Content-Type: application/json" \
  -d '{
    "discordAccessToken": "token_here",
    "userInfo": {
      "username": "john_doe",
      "avatar": "avatar_hash",
      "email": "john@example.com"
    }
  }'

# Test save guilds endpoint
curl -X POST https://api.ziji.world/bot/users/123456789/guilds \
  -H "Content-Type: application/json" \
  -d '{
    "guilds": [
      {
        "id": "987654321",
        "name": "My Server",
        "icon": "icon_hash",
        "owner": true,
        "permissions": "8"
      }
    ]
  }'

# Test admin check endpoint
curl -X GET https://api.ziji.world/bot/users/123456789/servers/987654321/admin

# Test get config endpoint
curl -X GET https://api.ziji.world/bot/servers/987654321/config

# Test save config endpoint
curl -X POST https://api.ziji.world/bot/servers/987654321/config \
  -H "Content-Type: application/json" \
  -d '{
    "prefix": "!",
    "language": "en",
    "modRole": "123456789",
    "logChannel": "123456789",
    "autorole": true,
    "autoroleIds": ["123456789"],
    "customCommands": []
  }'
```

## Phase 4: Deployment

### Pre-deployment

- [ ] All tests passing
- [ ] No console errors in development
- [ ] Environment variables configured
- [ ] Bot server endpoints verified working
- [ ] MongoDB collections created

### Deployment Steps

Web Dashboard:
- [ ] Set `BOT_API_URL` environment variable
- [ ] Build: `npm run build`
- [ ] Deploy to Vercel/hosting service
- [ ] Verify deployment successful

Bot Server:
- [ ] Push code changes
- [ ] Deploy bot server
- [ ] Verify API endpoints accessible
- [ ] Check MongoDB connection works

### Post-deployment

- [ ] Test Discord OAuth on production domain
- [ ] Verify user can login
- [ ] Verify servers load
- [ ] Verify config can be saved
- [ ] Check bot server logs for errors
- [ ] Monitor error rates

## Phase 5: Monitoring

### Logging

- [ ] Enable detailed logging in bot server API
- [ ] Log all API calls with request/response
- [ ] Log database operations
- [ ] Log errors with full stack traces

### Metrics

- [ ] Monitor API response times
- [ ] Track error rates per endpoint
- [ ] Monitor MongoDB query performance
- [ ] Track user login success rate

### Alerts

- [ ] Alert if bot API becomes unavailable
- [ ] Alert if MongoDB connection fails
- [ ] Alert if error rate exceeds threshold
- [ ] Alert on unusually slow responses

## Troubleshooting Guide

If something doesn't work:

### Web Dashboard won't build

1. [ ] Check syntax errors: `npm run lint`
2. [ ] Clear cache: `rm -rf .next node_modules && npm install`
3. [ ] Check imports are correct in modified files
4. [ ] Verify `lib/bot-api.ts` exists and has no syntax errors

### OAuth login fails

1. [ ] Check Discord client ID and secret are correct
2. [ ] Verify redirect URI matches in Discord app settings
3. [ ] Check browser console for errors
4. [ ] Verify bot server is running

### Guilds don't load

1. [ ] Check bot API endpoint is working: `curl https://api.ziji.world/bot/users/ID/guilds`
2. [ ] Verify user session was saved in previous step
3. [ ] Check MongoDB `user_guilds` collection has data
4. [ ] Look at bot server logs for errors

### Config won't save

1. [ ] Verify user is admin/owner of server
2. [ ] Check bot API endpoint: `curl -X POST https://api.ziji.world/bot/servers/ID/config`
3. [ ] Verify request body format is correct
4. [ ] Check MongoDB `server_configs` collection exists
5. [ ] Look at bot server logs for database errors

### CORS errors

1. [ ] Check `CORS_ORIGIN` environment variable in bot server
2. [ ] Ensure web dashboard domain is in allowed origins
3. [ ] Verify bot server has CORS enabled: `cors({ origin: allowed, credentials: true })`

## Final Sign-off

- [ ] Web dashboard fully functional
- [ ] Bot server API fully implemented
- [ ] All endpoints tested and working
- [ ] Error handling in place
- [ ] Monitoring configured
- [ ] Documentation reviewed
- [ ] Team trained on new system
- [ ] Ready for production

## Documentation Files

Reference these files for details:

- **BOT_API_SETUP_SUMMARY.md** - Quick setup guide
- **BOT_API_ENDPOINTS.md** - Complete API documentation
- **BOT_SERVER_EXAMPLE.js** - Example implementations
- **MIGRATION_TO_BOT_API.md** - Migration details
- **API_FLOW_DIAGRAMS.md** - Visual flow diagrams
- **lib/bot-api.ts** - Client implementation

## Support Contacts

- Bot Server Issues: [Your bot server repo]
- Web Dashboard Issues: [This repo]
- MongoDB Issues: [Your database admin]
