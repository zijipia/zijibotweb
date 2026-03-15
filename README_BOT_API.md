# Web Dashboard + Bot Server API Integration

## 🎯 Overview

This web dashboard has been integrated with the Ziji-bot-discord server via REST API. The dashboard no longer accesses MongoDB directly - all data flows through the bot server.

**Architecture:** Web Dashboard → Bot Server API → MongoDB

## 📚 Documentation Structure

### Start Here ⭐

**`BOT_API_COMPLETE.md`** - Complete overview
- What's been done
- Architecture diagram  
- 7 required endpoints
- 5-step quick setup
- Key improvements

### Setup & Implementation

**`BOT_API_SETUP_SUMMARY.md`** - Quick start guide
- Environment setup
- File locations
- MongoDB collections needed
- Testing checklist

**`BOT_SERVER_EXAMPLE.js`** - Ready-to-use code
- All 7 endpoints implemented
- Copy-paste ready
- Full error handling
- Uses `useHooks.get('db')`

### Detailed Documentation

**`BOT_API_ENDPOINTS.md`** - Complete API reference
- All endpoint specifications
- Request/response examples
- Error codes
- MongoDB query examples
- Implementation patterns

**`MIGRATION_TO_BOT_API.md`** - Migration guide
- Before/after architecture
- Files changed and why
- Troubleshooting guide
- Testing procedures

**`API_FLOW_DIAGRAMS.md`** - Visual flows
- Login flow diagram
- Load servers flow
- Update config flow
- Admin check flow
- MongoDB schema examples

**`IMPLEMENTATION_CHECKLIST.md`** - Step-by-step checklist
- 5 implementation phases
- 50+ checklist items
- Curl test commands
- Troubleshooting scenarios

## 📂 Code Changes

### New Files Created

- **`lib/bot-api.ts`** - Bot server client library with 7 main functions

### Files Modified

- **`app/api/auth/callback/discord/route.ts`** - Uses bot API instead of MongoDB
- **`app/api/auth/guilds/route.ts`** - Uses bot API instead of MongoDB  
- **`app/api/config/route.ts`** - Uses bot API instead of MongoDB

### Files Deprecated

- **`lib/mongodb.ts`** - No longer used (kept for reference)

## 🚀 Quick Start

### 1. Verify Web Dashboard Setup
```bash
npm run build  # Should succeed
npm run dev    # Should start without errors
```

### 2. Copy Bot Server Routes
Copy `BOT_SERVER_EXAMPLE.js` to your bot server:
```javascript
const apiRoutes = require('./routes/api.js');
app.use('/bot', apiRoutes);
```

### 3. Ensure MongoDB Collections Exist
- `user_guilds`
- `user_discord_sessions`  
- `server_configs`

### 4. Test Bot API
```bash
curl https://api.ziji.world/bot/users/123456789/guilds
```

### 5. Test Web Dashboard
- Visit http://localhost:3000
- Click "Login with Discord"
- Verify guilds load
- Try editing a server config

## 🔑 7 Required Endpoints

```
GET  /bot/users/:userId/guilds
POST /bot/users/:userId/session
POST /bot/users/:userId/guilds
GET  /bot/users/:userId/servers/:serverId/admin
GET  /bot/servers/:serverId/config
POST /bot/servers/:serverId/config
GET  /bot/servers/:serverId/info
```

All implemented in `BOT_SERVER_EXAMPLE.js`

## 💡 Key Concepts

### Data Flow
```
Web Dashboard
    ↓
API Routes (/api/auth/*, /api/config)
    ↓
Bot API Client (lib/bot-api.ts)
    ↓
Bot Server API Endpoints (/bot/*)
    ↓
MongoDB Collections
```

### Request Format
All bot API calls include:
- Content-Type: application/json
- HTTP methods: GET, POST

### Response Format
All bot API responses:
```json
{
  "success": true/false,
  "data": {...},
  "error": "string on failure"
}
```

## 🧪 Testing

### Quick Verification
1. Build web dashboard: `npm run build`
2. Test bot API endpoint: `curl https://api.ziji.world/...`
3. Test web dashboard: Try Discord login

### Full Testing
See `IMPLEMENTATION_CHECKLIST.md` for:
- Unit tests
- Integration tests
- Curl test commands
- Troubleshooting scenarios

## 📖 Reference by Use Case

**"I need to understand the architecture"**
→ Read `BOT_API_COMPLETE.md` and `API_FLOW_DIAGRAMS.md`

**"I need to implement the bot server endpoints"**
→ Copy `BOT_SERVER_EXAMPLE.js` and follow `BOT_API_SETUP_SUMMARY.md`

**"I need detailed API documentation"**
→ Read `BOT_API_ENDPOINTS.md`

**"I need to troubleshoot an issue"**
→ Check `IMPLEMENTATION_CHECKLIST.md` troubleshooting section

**"I need to understand what changed"**
→ Read `MIGRATION_TO_BOT_API.md`

**"I need to set up everything step-by-step"**
→ Follow `IMPLEMENTATION_CHECKLIST.md`

## ✅ Implementation Checklist

- [ ] Read `BOT_API_COMPLETE.md` for overview
- [ ] Review `BOT_SERVER_EXAMPLE.js` code
- [ ] Create MongoDB collections
- [ ] Implement bot server endpoints
- [ ] Test endpoints with curl
- [ ] Test web dashboard login
- [ ] Test server config save
- [ ] Deploy bot server
- [ ] Deploy web dashboard
- [ ] Monitor logs

## 🔗 Files Summary

| File | Type | Purpose |
|------|------|---------|
| `BOT_API_COMPLETE.md` | Guide | Complete overview & summary |
| `BOT_API_SETUP_SUMMARY.md` | Guide | Quick start setup |
| `BOT_API_ENDPOINTS.md` | Reference | API documentation |
| `BOT_SERVER_EXAMPLE.js` | Code | Ready-to-use endpoints |
| `MIGRATION_TO_BOT_API.md` | Guide | Migration details |
| `API_FLOW_DIAGRAMS.md` | Visual | Flow diagrams |
| `IMPLEMENTATION_CHECKLIST.md` | Checklist | Step-by-step setup |
| `lib/bot-api.ts` | Code | Client library |
| `app/api/*/route.ts` | Code | Modified routes |

## 🎯 Next Actions

1. **For Setup:** Start with `BOT_API_SETUP_SUMMARY.md`
2. **For Implementation:** Copy `BOT_SERVER_EXAMPLE.js`
3. **For Details:** Check `BOT_API_ENDPOINTS.md`
4. **For Troubleshooting:** See `IMPLEMENTATION_CHECKLIST.md`

## 📞 Support

All documentation is self-contained. Check the right file for your needs:
- **What changed?** → `MIGRATION_TO_BOT_API.md`
- **How do I set up?** → `BOT_API_SETUP_SUMMARY.md`
- **How do I implement?** → `BOT_SERVER_EXAMPLE.js`
- **What's the API?** → `BOT_API_ENDPOINTS.md`
- **Visual overview?** → `API_FLOW_DIAGRAMS.md`
- **Step-by-step?** → `IMPLEMENTATION_CHECKLIST.md`

---

**Status:** ✅ Web dashboard fully migrated to bot API  
**Next:** Implement bot server endpoints using `BOT_SERVER_EXAMPLE.js`
