# Bot Server Integration Guide

This guide explains how to integrate your bot server with the configuration dashboard using WebSocket for real-time updates.

## Overview

The dashboard communicates with your bot server through:
1. **REST API** - for fetching and updating configurations
2. **WebSocket** - for real-time status updates and config broadcasts

## Setup Instructions

### 1. Connect Dashboard API to Bot Server

In your bot server code, add these functions:

```javascript
const axios = require('axios');

const DASHBOARD_API = 'https://api.ziji.world'; // or your dashboard URL
const API_SECRET = process.env.API_SECRET; // Add a secret token for verification

// Get server configuration
async function getServerConfig(serverId) {
  try {
    const response = await axios.get(
      `${DASHBOARD_API}/api/config?serverId=${serverId}`,
      {
        headers: {
          'Authorization': `Bearer ${API_SECRET}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('[Bot] Error getting config:', error.message);
    return null;
  }
}

// Update configuration in dashboard (for syncing)
async function syncConfigToDashboard(serverId, config) {
  try {
    const response = await axios.put(
      `${DASHBOARD_API}/api/config`,
      {
        serverId,
        config,
      },
      {
        headers: {
          'Authorization': `Bearer ${API_SECRET}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('[Bot] Error syncing config:', error.message);
  }
}

// Listen to config changes from dashboard
async function loadConfigFromDashboard(serverId) {
  const config = await getServerConfig(serverId);
  if (config) {
    // Update bot settings
    bot.serverConfigs.set(serverId, config);
    console.log(`[Bot] Loaded config for server ${serverId}`, config);
  }
}

module.exports = {
  getServerConfig,
  syncConfigToDashboard,
  loadConfigFromDashboard,
};
```

### 2. Setup WebSocket Server

Create a WebSocket server on `api.ziji.world` to handle real-time updates:

```javascript
const WebSocket = require('ws');
const express = require('express');
const http = require('http');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Store active connections
const connections = new Map();

wss.on('connection', (ws) => {
  console.log('[WS] Client connected');

  ws.on('message', (message) => {
    try {
      const { type, payload } = JSON.parse(message);

      switch (type) {
        case 'config:update':
          handleConfigUpdate(payload);
          break;
        case 'subscribe':
          handleSubscribe(ws, payload);
          break;
        case 'unsubscribe':
          handleUnsubscribe(ws, payload);
          break;
      }
    } catch (error) {
      console.error('[WS] Message error:', error);
    }
  });

  ws.on('close', () => {
    console.log('[WS] Client disconnected');
    // Clean up connections
    for (const [key, client] of connections) {
      if (client === ws) {
        connections.delete(key);
      }
    }
  });
});

function handleSubscribe(ws, { serverId }) {
  const key = `server:${serverId}`;
  connections.set(key, ws);
}

function handleUnsubscribe(ws, { serverId }) {
  const key = `server:${serverId}`;
  connections.delete(key);
}

function handleConfigUpdate(payload) {
  const { serverId, config } = payload;
  
  // Broadcast to all subscribed clients
  const key = `server:${serverId}`;
  const client = connections.get(key);
  
  if (client && client.readyState === WebSocket.OPEN) {
    client.send(JSON.stringify({
      type: 'config:updated',
      payload: {
        serverId,
        config,
        timestamp: new Date().toISOString(),
      },
    }));
  }
}

// Send bot status
function broadcastBotStatus(serverId, status) {
  const key = `server:${serverId}`;
  const client = connections.get(key);
  
  if (client && client.readyState === WebSocket.OPEN) {
    client.send(JSON.stringify({
      type: 'bot:status',
      payload: {
        serverId,
        status: status.status || 'offline',
        uptime: Date.now() - (status.startTime || Date.now()),
        version: status.version || '1.0.0',
        lastUpdate: new Date().toISOString(),
      },
    }));
  }
}

server.listen(3001, () => {
  console.log('[WS] Server running on port 3001');
});

module.exports = { wss, broadcastBotStatus };
```

### 3. Bot Command Handler Integration

Update your bot's command handler to reload config from dashboard:

```javascript
const { getServerConfig, loadConfigFromDashboard } = require('./dashboard-api');

// When bot starts
async function onBotReady() {
  console.log('[Bot] Bot is ready');
  
  // Optionally sync all server configs
  // for (const [serverId, config] of bot.serverConfigs) {
  //   await loadConfigFromDashboard(serverId);
  // }
}

// When joining a new server
async function onGuildCreate(guild) {
  console.log(`[Bot] Joined guild: ${guild.id}`);
  
  // Load config from dashboard
  await loadConfigFromDashboard(guild.id);
}

// Periodically sync status with dashboard
setInterval(() => {
  for (const [serverId, guildData] of bot.serverConfigs) {
    broadcastBotStatus(serverId, {
      status: bot.isRunning ? 'online' : 'offline',
      startTime: bot.startTime,
      version: bot.version,
    });
  }
}, 30000); // Every 30 seconds
```

### 4. React to Config Changes

Add a command to reload config from dashboard:

```javascript
bot.command('reload-config', async (message, args) => {
  const serverId = message.guild.id;
  await loadConfigFromDashboard(serverId);
  message.reply('Configuration reloaded from dashboard!');
});

// Auto-reload on dashboard update (via webhook)
app.post('/api/webhook/config-updated', express.json(), (req, res) => {
  const { serverId, config } = req.body;
  
  // Update bot config
  bot.serverConfigs.set(serverId, config);
  
  // Broadcast via WebSocket
  broadcastBotStatus(serverId, {
    status: 'online',
    startTime: bot.startTime,
    version: bot.version,
  });
  
  res.json({ success: true });
});
```

## MongoDB Synchronization

Your dashboard uses MongoDB collections:

```javascript
// bot_configs collection structure
{
  _id: ObjectId,
  serverId: "123456789",
  prefix: "!",
  language: "en",
  modRole: "987654321",
  logChannel: "555555555",
  autorole: true,
  autoroleIds: ["111111111", "222222222"],
  customCommands: [
    {
      id: "cmd1",
      name: "ping",
      response: "pong!",
      enabled: true
    }
  ],
  createdAt: ISODate("2024-01-01T00:00:00Z"),
  updatedAt: ISODate("2024-01-15T12:30:00Z")
}
```

### Connect MongoDB to Bot

```javascript
const { MongoClient } = require('mongodb');

const client = new MongoClient(process.env.MONGODB_URI);
const db = client.db('bot_dashboard');

// Export for use in zihooks
module.exports = {
  get: (key) => {
    if (key === 'db') {
      return {
        collection: (name) => db.collection(name),
      };
    }
  },
};
```

## Event Flow

### Configuration Update Flow

1. **User updates config** in dashboard
2. **PUT /api/config** called
3. **MongoDB** updated via `updateServerConfig()`
4. **WebSocket** broadcasts `config:updated` event
5. **Bot receives** event and reloads configuration
6. **User sees** confirmation in UI

```
Dashboard UI → API Route → MongoDB → WebSocket → Bot
   ↓           ↓           ↓         ↓          ↓
Click Save   Verify Auth  Save     Broadcast  Reload
```

### Bot Status Flow

1. **Bot** periodically broadcasts status
2. **WebSocket** receives status update
3. **Dashboard** displays real-time status
4. **User sees** bot status, uptime, version

```
Bot → WebSocket → Dashboard UI
 ↓      ↓         ↓
Status  Queue    Render
```

## API Verification

Add authentication to prevent unauthorized config changes:

```javascript
// In API route
import { verifyAuth } from "@/lib/auth";

export async function PUT(request: NextRequest) {
  const authData = await verifyAuth(request);
  
  // Check if user is server owner
  const serverGuild = authData.guilds.find(g => g.id === serverId);
  if (!serverGuild || !serverGuild.owner) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 403 }
    );
  }
  
  // Process config update
  // ...
}
```

## Testing Integration

### Test Configuration Update

```bash
# Get current config
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "https://api.ziji.world/api/config?serverId=123456789"

# Update config
curl -X PUT \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"serverId":"123456789","config":{"prefix":"!"}}' \
  "https://api.ziji.world/api/config"
```

### Test WebSocket Connection

```javascript
const ws = new WebSocket('ws://api.ziji.world');

ws.onopen = () => {
  console.log('Connected');
  
  // Subscribe to server updates
  ws.send(JSON.stringify({
    type: 'subscribe',
    payload: { serverId: '123456789' }
  }));
};

ws.onmessage = (event) => {
  const { type, payload } = JSON.parse(event.data);
  console.log('Update:', type, payload);
};
```

## Best Practices

1. **Always verify permissions** - Check server ownership before allowing config changes
2. **Validate input** - Sanitize all configuration values
3. **Log changes** - Keep audit trail of who changed what and when
4. **Rate limit** - Prevent abuse of config update endpoints
5. **Cache configs** - Store configs in bot memory for quick access
6. **Error handling** - Gracefully handle connection failures
7. **Reconnect strategy** - Implement exponential backoff for WebSocket reconnects

## Troubleshooting

### Config not updating in bot
- Check if WebSocket is connected
- Verify MongoDB connection in bot
- Check API logs for errors
- Ensure config change was saved to DB

### WebSocket connection failing
- Check firewall rules
- Verify WebSocket server is running
- Check for CORS issues
- Verify token authentication

### Bot not sending status
- Check if `broadcastBotStatus()` is being called
- Verify WebSocket connection from bot side
- Check for errors in bot logs

## Security Considerations

1. Use HTTPS for API, WSS for WebSocket in production
2. Implement rate limiting on API endpoints
3. Use strong API tokens/secrets
4. Validate all user input
5. Implement CORS properly
6. Use environment variables for secrets
7. Audit log all configuration changes
8. Implement request signing for webhook verification

## Next Steps

1. ✅ Set up WebSocket server
2. ✅ Implement MongoDB sync in bot
3. ✅ Add config reload commands
4. ✅ Test real-time updates
5. ✅ Deploy to production
6. ✅ Monitor and debug
