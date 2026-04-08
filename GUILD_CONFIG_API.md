# Guild Configuration API Documentation

This document describes the Guild Configuration API for managing ZiGuild settings in the Ziji Bot Discord bot.

## Overview

The Guild Configuration API provides endpoints to manage various guild (server) settings including:
- **Voice Configuration** - Voice channel logging settings
- **Join-to-Create** - Temporary voice channel creation settings
- **Auto Role** - Automatic role assignment for new members

All requests require authentication via JWT token in HTTP-only cookies.

## Base Information

- **Base URL**: `/api/guild/`
- **Authentication**: Required (JWT token in cookies)
- **Content-Type**: `application/json`
- **Default Bot API**: `https://api.ziji.world`

## Data Models

### ZiGuildConfig

```typescript
{
  guildId: string;              // Discord Guild ID
  voice: VoiceConfig;           // Voice logging settings
  joinToCreate: JoinToCreateConfig;  // Join-to-create settings
  autoRole: AutoRoleConfig;     // Auto-role settings
  updatedAt: Date;              // Last update timestamp
}
```

### VoiceConfig

```typescript
{
  logMode: boolean;  // Enable/disable voice channel logging
}
```

### JoinToCreateConfig

```typescript
{
  enabled: boolean;                  // Enable/disable feature
  voiceChannelId: string | null;     // Source voice channel ID
  categoryId: string | null;         // Category for temp channels
  defaultUserLimit: number;          // Default user limit (0 = unlimited)
  tempChannels: TempChannel[];       // Array of temp channels
  blockedUser: string[];             // Array of blocked user IDs
}
```

### TempChannel

```typescript
{
  channelId: string;   // Temporary channel ID
  ownerId: string;     // Owner user ID
  locked: boolean;     // Whether channel is locked
}
```

### AutoRoleConfig

```typescript
{
  enabled: boolean;      // Enable/disable feature
  roleIds: string[];     // Array of role IDs to assign
}
```

## API Endpoints

### 1. Get Guild Configuration

**Endpoint**: `GET /api/guild/config`

**Query Parameters**:
- `guildId` (required) - Discord Guild ID

**Response**:
```json
{
  "success": true,
  "data": {
    "guildId": "123456789",
    "voice": {
      "logMode": false
    },
    "joinToCreate": {
      "enabled": false,
      "voiceChannelId": null,
      "categoryId": null,
      "defaultUserLimit": 0,
      "tempChannels": [],
      "blockedUser": []
    },
    "autoRole": {
      "enabled": false,
      "roleIds": []
    },
    "updatedAt": "2024-03-15T10:30:00Z"
  }
}
```

**Error Responses**:
- `401` - Unauthorized (no valid auth token)
- `400` - Missing required `guildId` parameter
- `403` - User doesn't have access to this guild
- `500` - Internal server error

---

### 2. Update Guild Configuration

**Endpoint**: `PUT /api/guild/config`

**Request Body**:
```json
{
  "guildId": "123456789",
  "config": {
    "voice": {
      "logMode": true
    },
    "joinToCreate": {
      "enabled": true,
      "voiceChannelId": "987654321",
      "categoryId": "111111111",
      "defaultUserLimit": 5
    },
    "autoRole": {
      "enabled": true,
      "roleIds": ["222222222", "333333333"]
    }
  }
}
```

**Response**:
```json
{
  "success": true,
  "message": "Guild config updated successfully",
  "data": {
    "guildId": "123456789",
    "voice": {
      "logMode": true
    },
    "joinToCreate": {
      "enabled": true,
      "voiceChannelId": "987654321",
      "categoryId": "111111111",
      "defaultUserLimit": 5,
      "tempChannels": [],
      "blockedUser": []
    },
    "autoRole": {
      "enabled": true,
      "roleIds": ["222222222", "333333333"]
    },
    "updatedAt": "2024-03-15T10:35:00Z"
  }
}
```

**Permissions**: Guild owner/admin only

**Error Responses**:
- `401` - Unauthorized
- `400` - Missing required fields
- `403` - Not guild owner/admin
- `500` - Failed to update config

---

### 3. Update Voice Configuration

**Endpoint**: `PUT /api/guild/voice`

**Request Body**:
```json
{
  "guildId": "123456789",
  "logMode": true
}
```

**Response**:
```json
{
  "success": true,
  "message": "Voice config updated successfully",
  "data": {
    "guildId": "123456789",
    "voice": {
      "logMode": true
    },
    "joinToCreate": { ... },
    "autoRole": { ... },
    "updatedAt": "2024-03-15T10:40:00Z"
  }
}
```

**Permissions**: Guild owner/admin only

**Error Responses**:
- `401` - Unauthorized
- `400` - Invalid `logMode` value (must be boolean)
- `403` - Not guild owner/admin
- `500` - Failed to update

---

### 4. Update Join-to-Create Configuration

**Endpoint**: `PUT /api/guild/join-to-create`

**Request Body**:
```json
{
  "guildId": "123456789",
  "enabled": true,
  "voiceChannelId": "987654321",
  "categoryId": "111111111",
  "defaultUserLimit": 5
}
```

**Response**:
```json
{
  "success": true,
  "message": "Join-to-create config updated successfully",
  "data": {
    "guildId": "123456789",
    "joinToCreate": {
      "enabled": true,
      "voiceChannelId": "987654321",
      "categoryId": "111111111",
      "defaultUserLimit": 5,
      "tempChannels": [],
      "blockedUser": []
    },
    "updatedAt": "2024-03-15T10:45:00Z"
  }
}
```

**Permissions**: Guild owner/admin only

---

### 5. Block User from Join-to-Create

**Endpoint**: `POST /api/guild/join-to-create`

**Request Body**:
```json
{
  "guildId": "123456789",
  "userId": "user123456789",
  "action": "block"
}
```

**Response**:
```json
{
  "success": true,
  "message": "User blocked successfully",
  "data": {
    "guildId": "123456789",
    "joinToCreate": {
      "enabled": true,
      "voiceChannelId": "987654321",
      "categoryId": "111111111",
      "defaultUserLimit": 5,
      "tempChannels": [],
      "blockedUser": ["user123456789"]
    },
    "updatedAt": "2024-03-15T10:50:00Z"
  }
}
```

**Permissions**: Guild owner/admin only

**Valid Actions**:
- `block` - Add user to blocked list
- `unblock` - Remove user from blocked list

**Error Responses**:
- `401` - Unauthorized
- `400` - Missing `guildId`, `userId`, or invalid `action`
- `403` - Not guild owner/admin
- `500` - Failed to update

---

### 6. Update Auto Role Configuration

**Endpoint**: `PUT /api/guild/auto-role`

**Request Body**:
```json
{
  "guildId": "123456789",
  "enabled": true,
  "roleIds": ["222222222", "333333333", "444444444"]
}
```

**Response**:
```json
{
  "success": true,
  "message": "Auto-role config updated successfully",
  "data": {
    "guildId": "123456789",
    "autoRole": {
      "enabled": true,
      "roleIds": ["222222222", "333333333", "444444444"]
    },
    "updatedAt": "2024-03-15T10:55:00Z"
  }
}
```

**Permissions**: Guild owner/admin only

**Error Responses**:
- `401` - Unauthorized
- `400` - Invalid `roleIds` (must be array)
- `403` - Not guild owner/admin
- `500` - Failed to update

---

## Usage Examples

### JavaScript/TypeScript Example

```typescript
import { getGuildConfig, updateGuildConfig } from '@/lib/guild-api';

// Get guild configuration
const config = await getGuildConfig('123456789');

// Update entire configuration
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
    roleIds: ['222222222', '333333333']
  }
});

// Update specific config using API routes
const response = await fetch('/api/guild/config', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    guildId: '123456789',
    config: updated
  })
});

const result = await response.json();
```

### Fetch Voice Config Only

```typescript
import { updateVoiceConfig } from '@/lib/guild-api';

const config = await updateVoiceConfig('123456789', { logMode: true });
```

### Manage Blocked Users

```typescript
import {
  blockUserFromJoinToCreate,
  unblockUserFromJoinToCreate
} from '@/lib/guild-api';

// Block user
await blockUserFromJoinToCreate('123456789', 'user123456789');

// Unblock user
await unblockUserFromJoinToCreate('123456789', 'user123456789');
```

---

## Error Handling

### Common Error Responses

**Unauthorized (401)**:
```json
{
  "error": "Unauthorized"
}
```

**Forbidden (403)**:
```json
{
  "error": "You must be guild owner to modify settings"
}
```

**Bad Request (400)**:
```json
{
  "error": "guildId is required"
}
```

**Server Error (500)**:
```json
{
  "error": "Internal server error"
}
```

---

## Implementation Notes

1. **Guild Admin Check**: All modification endpoints verify the user is the guild owner or admin
2. **User Access**: Users can only access/modify guilds they belong to
3. **Default Config**: If a guild has no configuration, a default one is automatically created
4. **Bot API**: Routes communicate with bot server at `https://api.ziji.world`
5. **Authentication**: JWT tokens from Discord OAuth are required for all requests

---

## Integration with Bot Server

The web dashboard communicates with the Discord bot server at:
```
https://api.ziji.world/bot/guilds/{guildId}/config
```

The bot server endpoints should implement:
- `GET /bot/guilds/{guildId}/config` - Get guild config
- `POST /bot/guilds/{guildId}/config` - Create guild config
- `PUT /bot/guilds/{guildId}/config` - Update guild config
- `PUT /bot/guilds/{guildId}/config/voice` - Update voice config
- `PUT /bot/guilds/{guildId}/config/join-to-create` - Update join-to-create
- `POST /bot/guilds/{guildId}/config/join-to-create/block` - Block user
- `POST /bot/guilds/{guildId}/config/join-to-create/unblock` - Unblock user
- `PUT /bot/guilds/{guildId}/config/auto-role` - Update auto-role

---

## Database Schema

The ZiGuild collection in MongoDB should follow this schema:

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

---

## Version History

- **v1.0** (2024-03-15) - Initial release with voice, join-to-create, and auto-role configurations
