# Guild Configuration Setup - Implementation Summary

## Overview

This document summarizes the complete implementation of the ZiGuild configuration system for the Ziji Bot web dashboard.

## What Was Implemented

### 1. Type Definitions (`lib/types.ts`)

Added comprehensive TypeScript interfaces for guild configuration:

- **ZiGuildConfig** - Main guild configuration interface
- **VoiceConfig** - Voice channel logging settings
- **JoinToCreateConfig** - Temporary voice channel creation
- **TempChannel** - Temporary channel metadata
- **AutoRoleConfig** - Auto role assignment settings
- **ZiGuildConfigDB** - Database representation

Plus type guard functions for runtime validation:
- `isVoiceConfig()`
- `isJoinToCreateConfig()`
- `isAutoRoleConfig()`
- `isZiGuildConfig()`

### 2. Guild API Client Library (`lib/guild-api.ts`)

Created a complete API client for guild configuration management:

**Core Functions**:
- `getGuildConfig(guildId)` - Fetch guild configuration
- `createGuildConfig(guildId, config)` - Create new guild config
- `updateGuildConfig(guildId, config)` - Update entire config
- `getOrCreateGuildConfig(guildId)` - Get existing or create default

**Feature-Specific Functions**:
- `updateVoiceConfig(guildId, voiceConfig)` - Update voice logging
- `updateJoinToCreateConfig(guildId, config)` - Update join-to-create
- `blockUserFromJoinToCreate(guildId, userId)` - Block user
- `unblockUserFromJoinToCreate(guildId, userId)` - Unblock user
- `updateAutoRoleConfig(guildId, config)` - Update auto-role settings

**Utilities**:
- `getDefaultGuildConfig(guildId)` - Get default configuration template
- `botApiRequest<T>()` - Internal API request handler

### 3. API Routes

Created four main API endpoints for guild configuration:

#### a. Main Guild Config Route (`/api/guild/config`)

**GET**: Fetch guild configuration
```
GET /api/guild/config?guildId=123456789
```

**PUT**: Update complete guild configuration
```
PUT /api/guild/config
Body: { guildId, config: ZiGuildConfig }
```

#### b. Voice Config Route (`/api/guild/voice`)

**PUT**: Update voice logging settings
```
PUT /api/guild/voice
Body: { guildId, logMode: boolean }
```

#### c. Join-to-Create Route (`/api/guild/join-to-create`)

**PUT**: Update join-to-create settings
```
PUT /api/guild/join-to-create
Body: { guildId, enabled, voiceChannelId, categoryId, defaultUserLimit }
```

**POST**: Block/unblock users
```
POST /api/guild/join-to-create
Body: { guildId, userId, action: "block" | "unblock" }
```

#### d. Auto-Role Route (`/api/guild/auto-role`)

**PUT**: Update auto-role settings
```
PUT /api/guild/auto-role
Body: { guildId, enabled, roleIds: string[] }
```

### 4. Comprehensive API Documentation (`GUILD_CONFIG_API.md`)

Complete documentation including:
- Data models and schemas
- Detailed endpoint documentation with examples
- Error handling guides
- Usage examples in TypeScript
- Integration notes with bot server
- MongoDB schema definition
- Version history

## File Structure

```
project/
├── lib/
│   ├── types.ts                    # Type definitions (updated)
│   └── guild-api.ts                # Guild API client (new)
├── app/api/guild/
│   ├── config/route.ts             # Main config endpoint (new)
│   ├── voice/route.ts              # Voice config endpoint (new)
│   ├── join-to-create/route.ts     # Join-to-create endpoint (new)
│   └── auto-role/route.ts          # Auto-role endpoint (new)
├── GUILD_CONFIG_API.md             # API documentation (new)
├── GUILD_CONFIG_SETUP.md           # This file
└── README.md                        # Main README (updated)
```

## Key Features

### ✅ Full Configuration Management
- Voice logging settings
- Join-to-create temporary channels
- User blocking/unblocking
- Auto-role assignment
- Default configuration fallbacks

### ✅ Security & Access Control
- JWT authentication required for all endpoints
- Guild owner/admin verification
- User guild access validation
- HTTP-only cookie sessions

### ✅ Error Handling
- Comprehensive error messages
- Proper HTTP status codes
- Validation for all inputs
- Fallback to default configs

### ✅ Bot Server Integration
- Communicates with bot API at `https://api.ziji.world`
- Automatic config creation if not exists
- Support for partial updates
- Consistent data synchronization

### ✅ Type Safety
- Full TypeScript support
- Runtime type guards
- Interface validation
- No `any` types in core code

## API Communication Flow

```
Web Dashboard
    ↓
[JWT Auth Check] ← (Validated by verifyAuth)
    ↓
[Admin Check] ← (Verified by checkBotServerAdmin)
    ↓
[Guild API Route] ← (/api/guild/*)
    ↓
[Guild API Client] ← (lib/guild-api.ts)
    ↓
[Bot Server API] ← (https://api.ziji.world/bot/guilds/*)
    ↓
[MongoDB Database] ← (ZiGuild collection)
```

## Usage Example

### Get Guild Configuration

```typescript
import { getOrCreateGuildConfig } from '@/lib/guild-api';

// Get or create config (returns default if doesn't exist)
const config = await getOrCreateGuildConfig('123456789');

// Access specific settings
console.log(config.voice.logMode);
console.log(config.joinToCreate.enabled);
console.log(config.autoRole.roleIds);
```

### Update Guild Configuration

```typescript
import { updateGuildConfig } from '@/lib/guild-api';

const updated = await updateGuildConfig('123456789', {
  voice: { logMode: true },
  joinToCreate: {
    enabled: true,
    voiceChannelId: '987654321',
    categoryId: '111111111',
    defaultUserLimit: 5
  },
  autoRole: {
    enabled: true,
    roleIds: ['222222222']
  }
});
```

### API Route Usage

```typescript
// From a component
const response = await fetch('/api/guild/config', {
  method: 'GET',
  headers: { 'Content-Type': 'application/json' },
});
const { data } = await response.json();
```

## MongoDB Schema

The bot server should implement this schema:

```javascript
const ZiGuild = Schema({
  guildId: { type: String, required: true, unique: true },
  voice: {
    logMode: { type: Boolean, default: false },
  },
  joinToCreate: {
    enabled: { type: Boolean, default: false },
    voiceChannelId: { type: String, default: null },
    categoryId: { type: String, default: null },
    defaultUserLimit: { type: Number, default: 0 },
    tempChannels: [
      {
        channelId: String,
        ownerId: String,
        locked: { type: Boolean, default: false },
      },
    ],
    blockedUser: [String],
  },
  autoRole: {
    enabled: { type: Boolean, default: false },
    roleIds: { type: [String], default: [] },
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});
```

## Bot Server Requirements

The Discord bot server at `https://api.ziji.world` must implement these endpoints:

```
GET  /bot/guilds/{guildId}/config
POST /bot/guilds/{guildId}/config
PUT  /bot/guilds/{guildId}/config
PUT  /bot/guilds/{guildId}/config/voice
PUT  /bot/guilds/{guildId}/config/join-to-create
POST /bot/guilds/{guildId}/config/join-to-create/block
POST /bot/guilds/{guildId}/config/join-to-create/unblock
PUT  /bot/guilds/{guildId}/config/auto-role
```

Each endpoint should:
1. Verify guild exists
2. Check user has permission
3. Perform operation on MongoDB
4. Return updated config or error

## Testing

### Test Guild Configuration Get
```bash
curl http://localhost:3000/api/guild/config?guildId=123456789 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test Voice Config Update
```bash
curl http://localhost:3000/api/guild/voice \
  -X PUT \
  -H "Content-Type: application/json" \
  -d '{"guildId":"123456789","logMode":true}'
```

### Test Join-to-Create Block User
```bash
curl http://localhost:3000/api/guild/join-to-create \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"guildId":"123456789","userId":"user123","action":"block"}'
```

## Environment Variables

Ensure these are set:

```env
DISCORD_CLIENT_ID=your_client_id
DISCORD_CLIENT_SECRET=your_client_secret
DISCORD_REDIRECT_URI=http://localhost:3000/api/auth/discord/callback
NEXTAUTH_SECRET=your_secret
BOT_API_URL=https://api.ziji.world
```

## Next Steps

1. **Implement Bot Server Endpoints** - Create corresponding endpoints on bot server
2. **Create UI Components** - Build React components for guild configuration forms
3. **Add Database Integration** - Set up MongoDB connection in bot server
4. **Implement Feature Logic** - Add actual voice logging, join-to-create, auto-role functionality to bot
5. **Testing** - Unit and integration tests for API routes
6. **Deployment** - Deploy web dashboard and bot server updates

## Documentation Files

- **GUILD_CONFIG_API.md** - Complete API reference with examples
- **GUILD_CONFIG_SETUP.md** - This implementation summary
- **README.md** - Main project documentation

## Support

For questions or issues with the guild configuration system:

1. Check [GUILD_CONFIG_API.md](./GUILD_CONFIG_API.md) for API details
2. Review type definitions in [lib/types.ts](./lib/types.ts)
3. Examine guild API client in [lib/guild-api.ts](./lib/guild-api.ts)
4. Check route implementations in [app/api/guild/](./app/api/guild/)

---

**Created**: 2024-03-15  
**Status**: ✅ Complete - Ready for bot server implementation
