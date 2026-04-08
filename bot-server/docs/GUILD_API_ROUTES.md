# Guild Configuration API Routes

Complete documentation for ZiGuild configuration endpoints in the bot server API.

## Overview

These routes handle guild (server) configuration management for the Ziji Discord bot. All endpoints follow RESTful conventions and use JSON for request/response bodies.

## Base URL

```
http://localhost:3001/bot
```

Or deployed:
```
https://api.ziji.world/bot
```

---

## Guild Configuration Endpoints

### 1. Get Complete Guild Config

**Endpoint:**
```
GET /guilds/:guildId/config
```

**Description:** Retrieve all configuration for a guild.

**Parameters:**
- `guildId` (string, path) - Discord guild ID

**Response:**
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
    "updatedAt": "2024-03-17T10:00:00Z"
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Database not available"
}
```

---

### 2. Update Complete Guild Config

**Endpoint:**
```
PUT /guilds/:guildId/config
```

**Description:** Update all guild configuration at once.

**Parameters:**
- `guildId` (string, path) - Discord guild ID

**Request Body:**
```json
{
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
    "roleIds": ["role1", "role2"]
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Guild configuration updated",
  "data": {
    "guildId": "123456789",
    "updatedAt": "2024-03-17T10:05:00Z"
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Missing required configuration objects"
}
```

---

### 3. Update Voice Configuration

**Endpoint:**
```
PUT /guilds/:guildId/voice
```

**Description:** Update only voice logging settings.

**Parameters:**
- `guildId` (string, path) - Discord guild ID

**Request Body:**
```json
{
  "logMode": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Voice configuration updated",
  "data": {
    "guildId": "123456789",
    "voice": {
      "logMode": true
    },
    "updatedAt": "2024-03-17T10:10:00Z"
  }
}
```

**Validation Errors:**
- `logMode` must be a boolean

---

### 4. Update Join-to-Create Configuration

**Endpoint:**
```
PUT /guilds/:guildId/join-to-create
```

**Description:** Update join-to-create feature settings.

**Parameters:**
- `guildId` (string, path) - Discord guild ID

**Request Body:**
```json
{
  "enabled": true,
  "voiceChannelId": "987654321",
  "categoryId": "111111111",
  "defaultUserLimit": 5
}
```

**Response:**
```json
{
  "success": true,
  "message": "Join-to-create configuration updated",
  "data": {
    "guildId": "123456789",
    "joinToCreate": {
      "enabled": true,
      "voiceChannelId": "987654321",
      "categoryId": "111111111",
      "defaultUserLimit": 5
    },
    "updatedAt": "2024-03-17T10:15:00Z"
  }
}
```

**Validation:**
- `enabled` must be a boolean
- `defaultUserLimit` must be a number (if provided)

---

### 5. Block User from Join-to-Create

**Endpoint:**
```
POST /guilds/:guildId/join-to-create/block-user
```

**Description:** Prevent a user from creating temporary voice channels.

**Parameters:**
- `guildId` (string, path) - Discord guild ID

**Request Body:**
```json
{
  "userId": "user123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User blocked successfully",
  "data": {
    "guildId": "123456789",
    "userId": "user123",
    "blocked": true,
    "updatedAt": "2024-03-17T10:20:00Z"
  }
}
```

**Error Responses:**
```json
{
  "success": false,
  "error": "userId is required"
}
```

```json
{
  "success": false,
  "error": "User is already blocked"
}
```

---

### 6. Unblock User from Join-to-Create

**Endpoint:**
```
DELETE /guilds/:guildId/join-to-create/unblock-user
```

**Description:** Allow a user to use join-to-create again.

**Parameters:**
- `guildId` (string, path) - Discord guild ID

**Request Body:**
```json
{
  "userId": "user123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User unblocked successfully",
  "data": {
    "guildId": "123456789",
    "userId": "user123",
    "blocked": false,
    "updatedAt": "2024-03-17T10:25:00Z"
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "userId is required"
}
```

---

### 7. Update Auto-Role Configuration

**Endpoint:**
```
PUT /guilds/:guildId/auto-role
```

**Description:** Configure automatic role assignment for new members.

**Parameters:**
- `guildId` (string, path) - Discord guild ID

**Request Body:**
```json
{
  "enabled": true,
  "roleIds": ["role1", "role2", "role3"]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Auto-role configuration updated",
  "data": {
    "guildId": "123456789",
    "autoRole": {
      "enabled": true,
      "roleIds": ["role1", "role2", "role3"]
    },
    "updatedAt": "2024-03-17T10:30:00Z"
  }
}
```

**Validation Errors:**
- `enabled` must be a boolean
- `roleIds` must be an array

---

## Data Models

### Voice Config
```typescript
{
  logMode: boolean  // Enable/disable voice channel logging
}
```

### Join-to-Create Config
```typescript
{
  enabled: boolean              // Feature enabled
  voiceChannelId: string | null // Voice channel trigger
  categoryId: string | null     // Category for temp channels
  defaultUserLimit: number      // Default user limit for temp channels
  tempChannels: [               // Active temporary channels
    {
      channelId: string
      ownerId: string
      locked: boolean
    }
  ]
  blockedUser: string[]         // Blocked user IDs
}
```

### Auto-Role Config
```typescript
{
  enabled: boolean   // Feature enabled
  roleIds: string[]  // Roles to assign automatically
}
```

### Complete Guild Config
```typescript
{
  guildId: string
  voice: VoiceConfig
  joinToCreate: JoinToCreateConfig
  autoRole: AutoRoleConfig
  updatedAt: Date
}
```

---

## Usage Examples

### JavaScript/Node.js

```javascript
const axios = require('axios');

const baseURL = 'http://localhost:3001/bot';

// Get guild config
async function getGuildConfig(guildId) {
  const response = await axios.get(`${baseURL}/guilds/${guildId}/config`);
  return response.data;
}

// Update voice logging
async function updateVoiceLogging(guildId, enabled) {
  const response = await axios.put(
    `${baseURL}/guilds/${guildId}/voice`,
    { logMode: enabled }
  );
  return response.data;
}

// Block user from join-to-create
async function blockUser(guildId, userId) {
  const response = await axios.post(
    `${baseURL}/guilds/${guildId}/join-to-create/block-user`,
    { userId }
  );
  return response.data;
}

// Update auto-role
async function updateAutoRole(guildId, enabled, roleIds) {
  const response = await axios.put(
    `${baseURL}/guilds/${guildId}/auto-role`,
    { enabled, roleIds }
  );
  return response.data;
}
```

### cURL

```bash
# Get guild config
curl http://localhost:3001/bot/guilds/123456789/config

# Update voice logging
curl -X PUT http://localhost:3001/bot/guilds/123456789/voice \
  -H "Content-Type: application/json" \
  -d '{"logMode": true}'

# Block user
curl -X POST http://localhost:3001/bot/guilds/123456789/join-to-create/block-user \
  -H "Content-Type: application/json" \
  -d '{"userId": "user123"}'

# Update auto-role
curl -X PUT http://localhost:3001/bot/guilds/123456789/auto-role \
  -H "Content-Type: application/json" \
  -d '{"enabled": true, "roleIds": ["role1", "role2"]}'
```

---

## Error Handling

All endpoints return standard error responses:

```json
{
  "success": false,
  "error": "Error message describing the problem"
}
```

### Common Errors

| Error | Status | Cause |
|-------|--------|-------|
| Database not available | 500 | MongoDB connection issue |
| Missing required configuration objects | 400 | Invalid request body |
| logMode must be a boolean | 400 | Invalid data type |
| userId is required | 400 | Missing userId in request |
| User is already blocked | 400 | User already in blocklist |

---

## Integration with Dashboard

The Next.js dashboard (`/app/api/guild/`) provides frontend endpoints that call these bot server routes:

1. Dashboard receives user request
2. Verifies user is guild admin
3. Calls bot server API endpoint
4. Returns result to frontend

---

## Database Schema

```javascript
const ZiGuild = Schema({
    guildId: { type: String, required: true },
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
    updatedAt: { type: Date },
});
```

---

## Rate Limiting

No rate limiting is currently implemented. Consider adding rate limiting for production environments.

---

## Authentication

Currently, these endpoints do not require authentication. In production, implement:
- Token verification
- Guild admin checks
- Request signing
