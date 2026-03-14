# Bot Configuration Dashboard

A modern web-based configuration management system for Discord bots with real-time updates and MongoDB integration.

## Features

- **Discord Authentication** - Secure OAuth 2.0 login
- **Server Management** - Manage bot settings for multiple Discord servers
- **Admin Panel** - Server owner-only configuration interface
- **Real-time Updates** - WebSocket support for live config changes
- **MongoDB Integration** - Persistent storage with zihooks
- **Custom Commands** - Manage bot commands from the dashboard
- **Status Monitoring** - Real-time bot status and uptime tracking

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **Authentication**: Discord OAuth 2.0, JWT
- **Database**: MongoDB
- **Real-time**: WebSocket
- **API**: REST & WebSocket

## Quick Start

### 1. Clone & Install

```bash
git clone <repository-url>
cd bot-dashboard
pnpm install
```

### 2. Set Environment Variables

Create a `.env.local` file or set in Vercel project settings:

```env
DISCORD_CLIENT_ID=your_discord_app_id
DISCORD_CLIENT_SECRET=your_discord_secret
DISCORD_REDIRECT_URI=http://localhost:3000/api/auth/discord/callback
NEXTAUTH_SECRET=$(openssl rand -base64 32)
```

### 3. Get Discord OAuth Credentials

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application
3. Go to OAuth2 → General
4. Copy Client ID and Client Secret
5. Add Redirect URL: `http://localhost:3000/api/auth/discord/callback`

### 4. Run Development Server

```bash
pnpm dev
```

Visit http://localhost:3000

### 5. Test Login

1. Click "Login with Discord"
2. Authorize the application
3. Select a Discord server you own
4. Access the admin panel to manage settings

## Project Structure

```
app/
├── page.tsx                 # Login page
├── api/
│   ├── auth/               # Authentication endpoints
│   └── config/             # Configuration CRUD
└── dashboard/
    ├── layout.tsx          # Dashboard layout
    ├── page.tsx            # Server selector
    ├── admin/page.tsx      # Admin panel
    └── settings/page.tsx   # Settings page

components/dashboard/
├── nav.tsx                 # Navigation sidebar
├── server-selector.tsx     # Server selection grid
├── config-form.tsx         # Settings form
├── custom-commands.tsx     # Command manager
└── server-status.tsx       # Status indicator

lib/
├── auth.ts                 # Authentication utilities
├── mongodb.ts              # Database helpers
└── ws.ts                   # WebSocket client

hooks/
└── use-websocket.ts        # WebSocket hooks
```

## API Reference

### Authentication
- `GET /api/auth/discord` - OAuth callback
- `GET /api/auth/check` - Verify authentication
- `GET /api/auth/user` - Get current user
- `GET /api/auth/guilds` - Get user's servers
- `POST /api/auth/logout` - Logout

### Configuration
- `GET /api/config?serverId=ID` - Get server config
- `PUT /api/config` - Update server config (owner only)

Full API documentation in [API_REFERENCE.md](./API_REFERENCE.md)

## Configuration

Each server can configure:
- **Prefix** - Command prefix (e.g., `!`, `.`)
- **Language** - Bot language
- **Moderator Role** - Role for bot moderation
- **Log Channel** - Channel for bot logs
- **Auto Role** - Automatically assign roles to new members
- **Custom Commands** - Add custom bot commands

## MongoDB Integration

The dashboard stores configurations in MongoDB collections:

```javascript
// bot_configs collection
{
  serverId: "123456789",
  prefix: "!",
  language: "en",
  modRole: null,
  logChannel: null,
  autorole: false,
  autoroleIds: [],
  customCommands: [],
  createdAt: Date,
  updatedAt: Date
}
```

See [BOT_INTEGRATION.md](./BOT_INTEGRATION.md) for bot server integration details.

## Real-time Updates

WebSocket support for real-time configuration updates and bot status:

```typescript
import { useConfigUpdates } from '@/hooks/use-websocket';

export function MyComponent() {
  useConfigUpdates('server_id', (config) => {
    console.log('Config updated:', config);
  });
}
```

## Security

- ✅ HTTP-only cookies for session tokens
- ✅ JWT token expiration (7 days)
- ✅ Server ownership verification
- ✅ Input validation and sanitization
- ✅ CORS protection
- ⚠️ Rate limiting (TODO)
- ⚠️ Audit logging (TODO)

## Development

### Adding a New Setting

1. **Update Type** - Modify `ServerConfig` interface
2. **Add Form Field** - Update `config-form.tsx`
3. **Update Database** - Modify MongoDB schema
4. **Test** - Run `pnpm dev` and test the flow

### Testing Authentication

```typescript
import { verifyAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const authData = await verifyAuth(request);
  if (!authData) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  // Your code here
}
```

### Database Queries

```typescript
import { getServerConfig, updateServerConfig } from '@/lib/mongodb';

// Get config
const config = await getServerConfig(serverId);

// Update config
await updateServerConfig(serverId, { prefix: '!' });
```

## Deployment

### Deploy to Vercel

1. Push code to GitHub
2. Connect repository in Vercel
3. Set environment variables
4. Deploy

See [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) for full deployment guide.

### Production Checklist

- [ ] Set production Discord OAuth redirect URI
- [ ] Set production environment variables
- [ ] Enable HTTPS
- [ ] Set up MongoDB in production
- [ ] Configure WebSocket server
- [ ] Set up error monitoring
- [ ] Create database backups

## Troubleshooting

### Login Not Working
- Verify Discord OAuth credentials
- Check redirect URI matches exactly
- Clear browser cookies

### Config Not Saving
- Check MongoDB connection
- Verify you're server owner
- Check browser console for errors

### WebSocket Not Connecting
- Verify WebSocket server is running
- Check `NEXT_PUBLIC_WS_URL` environment variable
- Check for firewall issues

See [QUICK_START.md](./QUICK_START.md) for more troubleshooting tips.

## Documentation

- **[QUICK_START.md](./QUICK_START.md)** - Quick setup guide
- **[IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md)** - Detailed architecture
- **[API_REFERENCE.md](./API_REFERENCE.md)** - API endpoints
- **[BOT_INTEGRATION.md](./BOT_INTEGRATION.md)** - Bot server integration
- **[PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)** - Project overview
- **[DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)** - Deployment guide

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

MIT

## Support

For issues or questions:
1. Check the documentation
2. Review [API_REFERENCE.md](./API_REFERENCE.md)
3. See [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md)

## Links

- [Discord Developer Portal](https://discord.com/developers)
- [Next.js Documentation](https://nextjs.org/docs)
- [MongoDB Atlas](https://www.mongodb.com/atlas)
- [shadcn/ui](https://ui.shadcn.com)

---

Built with ❤️ for Discord bot developers
