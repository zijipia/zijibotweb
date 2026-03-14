# Bot Configuration Dashboard - API Reference

## Base URL

**Development**: `http://localhost:3000`  
**Production**: `https://api.ziji.world`

## Authentication

All endpoints require Discord OAuth authentication except the login endpoint. Authentication is managed via JWT tokens stored in HTTP-only cookies.

### Getting Started
1. Visit the home page
2. Click "Login with Discord"
3. Authorize the application to access your Discord account and servers
4. You'll be redirected to the dashboard with an auth token

## Endpoints

### Authentication

#### `GET /api/auth/discord`
Discord OAuth callback endpoint. User is redirected here after authorizing Discord OAuth.

**Query Parameters:**
- `code` (required) - Authorization code from Discord

**Response:**
- Redirects to `/dashboard` with auth token in cookie

---

#### `GET /api/auth/check`
Check if the current user is authenticated.

**Headers:**
- Cookie with `auth_token`

**Response (200):**
```json
{
  "authenticated": true
}
```

**Response (401):**
```json
{
  "error": "Unauthorized"
}
```

---

#### `GET /api/auth/user`
Get current user information.

**Headers:**
- Cookie with `auth_token`

**Response (200):**
```json
{
  "id": "123456789",
  "username": "discord_username",
  "discriminator": "0000",
  "avatar": "avatar_hash",
  "email": "user@example.com"
}
```

**Response (401):**
```json
{
  "error": "Unauthorized"
}
```

---

#### `GET /api/auth/guilds`
Get all Discord servers the user is in and their role in each.

**Headers:**
- Cookie with `auth_token`

**Response (200):**
```json
[
  {
    "id": "123456789",
    "name": "Server Name",
    "icon": "icon_hash",
    "owner": true,
    "permissions": "8"
  }
]
```

**Response (401):**
```json
{
  "error": "Unauthorized"
}
```

---

#### `POST /api/auth/logout`
Logout the current user by clearing the auth token.

**Headers:**
- Cookie with `auth_token`

**Response (200):**
```json
{
  "success": true
}
```

---

### Configuration Management

#### `GET /api/config`
Fetch server configuration.

**Headers:**
- Cookie with `auth_token`

**Query Parameters:**
- `serverId` (required) - Discord server ID

**Response (200):**
```json
{
  "serverId": "123456789",
  "prefix": "!",
  "language": "en",
  "modRole": "987654321",
  "logChannel": "555555555",
  "autorole": true,
  "autoroleIds": ["111111111", "222222222"],
  "customCommands": [
    {
      "name": "ping",
      "response": "pong!",
      "enabled": true
    }
  ],
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-15T12:30:00Z"
}
```

**Response (400):**
```json
{
  "error": "serverId is required"
}
```

**Response (401):**
```json
{
  "error": "Unauthorized"
}
```

**Response (403):**
```json
{
  "error": "You don't have access to this server"
}
```

---

#### `PUT /api/config`
Update server configuration. Only available to server owners.

**Headers:**
- Cookie with `auth_token`
- Content-Type: `application/json`

**Request Body:**
```json
{
  "serverId": "123456789",
  "config": {
    "prefix": "!",
    "language": "en",
    "modRole": "987654321",
    "logChannel": "555555555",
    "autorole": true,
    "autoroleIds": ["111111111", "222222222"],
    "customCommands": []
  }
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Config updated successfully",
  "config": {
    "serverId": "123456789",
    "prefix": "!",
    "language": "en",
    "modRole": "987654321",
    "logChannel": "555555555",
    "autorole": true,
    "autoroleIds": ["111111111", "222222222"],
    "customCommands": []
  }
}
```

**Response (400):**
```json
{
  "error": "serverId is required"
}
```

**Response (401):**
```json
{
  "error": "Unauthorized"
}
```

**Response (403):**
```json
{
  "error": "You must be server owner to modify config"
}
```

**Response (500):**
```json
{
  "error": "Failed to update config"
}
```

---

## WebSocket API

**Connection URL**: `ws://api.ziji.world` (requires implementation)

### Message Format

All WebSocket messages follow this format:

```json
{
  "type": "event_type",
  "payload": {
    "data": "value"
  }
}
```

### Events

#### `config:updated`
Broadcast when a server configuration is updated.

**Server → Client:**
```json
{
  "type": "config:updated",
  "payload": {
    "serverId": "123456789",
    "config": {
      "prefix": "!",
      "language": "en"
    },
    "updatedBy": "user_id",
    "timestamp": "2024-01-15T12:30:00Z"
  }
}
```

#### `config:update` (Client → Server)
Request to update configuration via WebSocket.

```json
{
  "type": "config:update",
  "payload": {
    "serverId": "123456789",
    "config": {
      "prefix": "!",
      "language": "en"
    }
  }
}
```

#### `bot:status`
Broadcast bot status updates.

```json
{
  "type": "bot:status",
  "payload": {
    "serverId": "123456789",
    "status": "online",
    "uptime": 3600,
    "version": "1.0.0"
  }
}
```

---

## Error Handling

All errors follow this format:

```json
{
  "error": "Error message description"
}
```

### HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 400 | Bad Request (missing parameters) |
| 401 | Unauthorized (not logged in) |
| 403 | Forbidden (no permission) |
| 500 | Internal Server Error |

---

## Rate Limiting (TODO)

Rate limiting will be implemented:
- 60 requests per minute per user for API endpoints
- 100 connections per minute for WebSocket

---

## Code Examples

### JavaScript/TypeScript

#### Get Server Config
```typescript
const response = await fetch('/api/config?serverId=123456789', {
  method: 'GET',
  credentials: 'include',
});

const config = await response.json();
console.log(config);
```

#### Update Server Config
```typescript
const response = await fetch('/api/config', {
  method: 'PUT',
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    serverId: '123456789',
    config: {
      prefix: '!',
      language: 'en',
      modRole: null,
      logChannel: null,
      autorole: false,
      autoroleIds: [],
      customCommands: [],
    },
  }),
});

const result = await response.json();
console.log(result);
```

#### WebSocket Connection
```typescript
import { botWS } from '@/lib/ws';

// Connect
await botWS.connect();

// Listen for updates
botWS.on('config:updated', (payload) => {
  console.log('Config updated:', payload);
  // Update UI
});

// Send update
botWS.send('config:update', {
  serverId: '123456789',
  config: { prefix: '!' },
});

// Close connection
botWS.close();
```

### Python

```python
import requests
import json

# Login and get config
BASE_URL = "http://localhost:3000"
SESSION = requests.Session()

# Get server config
response = SESSION.get(
    f"{BASE_URL}/api/config",
    params={"serverId": "123456789"}
)
config = response.json()
print(config)

# Update server config
response = SESSION.put(
    f"{BASE_URL}/api/config",
    json={
        "serverId": "123456789",
        "config": {
            "prefix": "!",
            "language": "en"
        }
    }
)
result = response.json()
print(result)
```

### cURL

```bash
# Get server config
curl -b "auth_token=YOUR_TOKEN" \
  "http://localhost:3000/api/config?serverId=123456789"

# Update server config
curl -b "auth_token=YOUR_TOKEN" \
  -X PUT \
  -H "Content-Type: application/json" \
  -d '{"serverId":"123456789","config":{"prefix":"!"}}' \
  "http://localhost:3000/api/config"
```

---

## Support

For issues or questions:
1. Check the IMPLEMENTATION_GUIDE.md
2. Review error messages in browser console
3. Check MongoDB connection status
4. Verify Discord OAuth credentials

