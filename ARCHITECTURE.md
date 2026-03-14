# Architecture Overview

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client Browser                            │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │           React 19 / Next.js 16 Frontend               │   │
│  │  ┌─────────────────────────────────────────────────┐   │   │
│  │  │  Pages:                                         │   │   │
│  │  │  - Login (page.tsx)                            │   │   │
│  │  │  - Dashboard (dashboard/page.tsx)              │   │   │
│  │  │  - Admin Panel (dashboard/admin/page.tsx)      │   │   │
│  │  │  - Settings (dashboard/settings/page.tsx)      │   │   │
│  │  └─────────────────────────────────────────────────┘   │   │
│  │  ┌─────────────────────────────────────────────────┐   │   │
│  │  │  Components:                                    │   │   │
│  │  │  - ServerSelector                              │   │   │
│  │  │  - ConfigForm                                  │   │   │
│  │  │  - CustomCommands                              │   │   │
│  │  │  - ServerStatus                                │   │   │
│  │  │  - DashboardNav                                │   │   │
│  │  └─────────────────────────────────────────────────┘   │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              │                                   │
│  HTTP-only Cookie (JWT)      │ HTTP/HTTPS                        │
└──────────────────────────────┼─────────────────────────────────┘
                               │
                     ┌─────────▼─────────┐
                     │  Authentication   │
                     │  OAuth 2.0 Flow   │
                     │                   │
                     │  User            │
                     │  ↓               │
                     │ Discord OAuth    │
                     │  ↓               │
                     │ JWT Token        │
                     └─────────┬─────────┘
                               │
                ┌──────────────┼──────────────┐
                │              │              │
        ┌───────▼────────┐  ┌──▼──────────┐  │
        │ API Routes     │  │ WebSocket   │  │
        │                │  │ Client      │  │
        │ /api/auth/*    │  │             │  │
        │ /api/config    │  │ Real-time   │  │
        │                │  │ Updates     │  │
        └────────┬────────┘  └──┬──────────┘  │
                 │              │             │
                 │        ┌─────▼────────┐    │
                 │        │ WebSocket    │    │
                 │        │ Server       │    │
                 │        │ (api.ziji.   │    │
                 │        │  world)      │    │
                 │        └─────┬────────┘    │
                 │              │             │
                 └──────────────┼─────────────┘
                                │
        ┌───────────────────────┼───────────────────────┐
        │                       │                       │
    ┌───▼───────────────┐   ┌───▼───────────────┐   ┌─▼──────────────┐
    │   Next.js API     │   │   MongoDB         │   │   Bot Server   │
    │   Routes          │   │   Database        │   │   (Node.js)    │
    │                   │   │                   │   │                │
    │ ✅ /auth/discord  │   │ Collections:      │   │ ✅ Receives    │
    │ ✅ /auth/check    │   │ - bot_configs     │   │   config       │
    │ ✅ /auth/user     │   │ - user_sessions   │   │ ✅ Updates     │
    │ ✅ /auth/guilds   │   │                   │   │   MongoDB      │
    │ ✅ /auth/logout   │   │ zihooks.get("db") │   │ ✅ Broadcasts  │
    │ ✅ /config (GET)  │   │                   │   │   status       │
    │ ✅ /config (PUT)  │   │                   │   │                │
    │                   │   │                   │   │                │
    └───────────────────┘   └───────────────────┘   └────────────────┘
```

## Data Flow

### 1. Authentication Flow

```
User
  ↓
[Login Page]
  ↓
Click "Login with Discord"
  ↓
→ Discord OAuth Authorize
  ↓
← Authorization Code
  ↓
POST /api/auth/discord
  ↓
Exchange Code for Access Token
  ↓
Fetch User Info + Guilds
  ↓
Create JWT Token
  ↓
Set HTTP-only Cookie
  ↓
Redirect to /dashboard
  ↓
[Dashboard Loaded]
```

### 2. Configuration Update Flow

```
[Admin Panel]
  ↓
User Updates Settings
  ↓
Form Submit
  ↓
PUT /api/config
  ↓
Verify Auth Token
  ↓
Check Server Ownership
  ↓
Validate Input
  ↓
Save to MongoDB
  ↓
WebSocket Broadcast (if connected)
  ↓
Bot Server Receives Update
  ↓
Reload Config
  ↓
[Success Message Displayed]
```

### 3. Real-time Status Flow

```
[Bot Server]
  ↓
Broadcast Status
  ↓
WebSocket Send
  ↓
[Dashboard]
  ↓
Receive Status Update
  ↓
Update Component State
  ↓
[Status Display Updated]
```

## Component Hierarchy

```
App
├── page.tsx (Login)
│   └── Components:
│       └── Card (shadcn)
│       └── Button (shadcn)
│
├── dashboard/
│   ├── layout.tsx
│   │   └── DashboardNav
│   │
│   ├── page.tsx (Server Selector)
│   │   └── ServerSelector
│   │       └── Card (shadcn)
│   │
│   ├── admin/page.tsx (Admin Panel)
│   │   └── ServerSelector (filtered to owners)
│   │   └── ServerConfigForm
│   │       ├── Input (shadcn)
│   │       ├── Select (shadcn)
│   │       ├── CustomCommands
│   │       └── Button (shadcn)
│   │
│   └── settings/page.tsx
│       ├── Card
│       ├── Button
│       └── Code blocks
```

## State Management

### Global State
- User authentication (JWT in cookie)
- Current user info
- User's Discord guilds

### Component State
- Selected server
- Current configuration
- Form data
- Loading/error states
- WebSocket connection status

### WebSocket Events
- `config:updated` - Configuration changed
- `bot:status` - Bot status update
- `config:update` - Request config update

## API Route Structure

```
/api/auth/
├── discord/route.ts       → POST/GET: OAuth callback
├── check/route.ts         → GET: Verify auth
├── user/route.ts          → GET: Get user info
├── guilds/route.ts        → GET: Get user's servers
└── logout/route.ts        → POST: Logout

/api/
└── config/route.ts        → GET: Get config, PUT: Update config
```

## Database Schema

### Collections

#### bot_configs
```javascript
{
  _id: ObjectId,
  serverId: String (unique index),
  prefix: String,
  language: String,
  modRole: String | null,
  logChannel: String | null,
  autorole: Boolean,
  autoroleIds: [String],
  customCommands: [{
    id: String,
    name: String,
    response: String,
    enabled: Boolean
  }],
  createdAt: Date,
  updatedAt: Date
}
```

#### user_sessions
```javascript
{
  _id: ObjectId,
  userId: String (unique),
  token: String,
  expiresAt: Date (TTL index),
  createdAt: Date
}
```

## Security Layers

```
Request
  ↓
[CORS Check]
  ↓
[JWT Verification] ← Cookie: auth_token
  ↓
[Permission Check] ← Discord guild ownership
  ↓
[Input Validation] ← React Hook Form + Server validation
  ↓
[Database Operation]
  ↓
[Response]
```

## Deployment Architecture

```
┌─────────────────────────────────┐
│      Vercel Edge Network        │
│                                 │
│  ┌───────────────────────────┐  │
│  │   Next.js App             │  │
│  │   - API Routes            │  │
│  │   - Static Assets         │  │
│  │   - Server Components     │  │
│  └────────────┬──────────────┘  │
│               │                 │
└───────────────┼─────────────────┘
                │
                │ HTTPS
                │
        ┌───────▼────────┐
        │  MongoDB Atlas  │
        │                │
        │ - bot_configs  │
        │ - user_sessions│
        └────────────────┘
                │
                │
        ┌───────▼────────────────┐
        │  Bot Server + WS       │
        │  (Your Infrastructure) │
        │                        │
        │  - Config Sync         │
        │  - Status Broadcast    │
        │  - Command Handler     │
        └────────────────────────┘
```

## Request/Response Flow

### GET /api/config

```
Request:
├── Cookie: auth_token
└── Query: ?serverId=123456789

Validation:
├── ✅ Token valid
├── ✅ User has access to server
└── ✅ ServerId provided

Response (200):
{
  "serverId": "123456789",
  "prefix": "!",
  "language": "en",
  ...
}

Error (401/403):
{ "error": "Unauthorized" }
```

### PUT /api/config

```
Request:
├── Cookie: auth_token
├── Headers: Content-Type: application/json
└── Body:
    {
      "serverId": "123456789",
      "config": { ... }
    }

Validation:
├── ✅ Token valid
├── ✅ User is server owner
├── ✅ Config fields valid
└── ✅ ServerId matches

Database:
├── Insert/Update bot_configs
└── Create/Update timestamps

WebSocket:
└── Broadcast config:updated

Response (200):
{
  "success": true,
  "message": "Config updated successfully",
  "config": { ... }
}

Error (403):
{ "error": "You must be server owner" }
```

## Performance Considerations

### Frontend
- Server-side auth verification
- Client-side form validation
- Lazy component loading
- Efficient re-renders with React keys

### Backend
- Efficient MongoDB queries with indexes
- JWT verification on each request
- Minimal database lookups
- Stateless API design

### Network
- HTTPS/WSS for security
- JSON payload compression
- Cookie-based sessions (no redundant headers)

## Monitoring & Logging

```
┌──────────────────┐
│  Error Tracking  │ (Sentry/Vercel)
│                  │
│  - API errors    │
│  - Exceptions    │
│  - Stack traces  │
└──────────────────┘

┌──────────────────┐
│  Database Logs   │ (MongoDB)
│                  │
│  - Queries       │
│  - Performance   │
│  - Slow ops      │
└──────────────────┘

┌──────────────────┐
│  API Logs        │ (Next.js)
│                  │
│  - Requests      │
│  - Responses     │
│  - Errors        │
└──────────────────┘
```

## Scaling Considerations

### Current Capacity
- Single Next.js instance on Vercel
- Auto-scaling via Vercel
- MongoDB Atlas (auto-scaling)
- WebSocket on single server (can handle ~1000 concurrent)

### Future Scaling
- Load balance WebSocket servers
- Database replication
- Caching layer (Redis)
- CDN for static assets
- API rate limiting

---

This architecture is designed for:
- ✅ Security
- ✅ Scalability
- ✅ Maintainability
- ✅ User Experience
- ✅ Developer Experience
