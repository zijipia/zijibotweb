# Quick Start Guide

## Prerequisites
- Node.js 18+ or pnpm
- Discord Developer Application
- MongoDB (via your bot's zihooks connection)

## 1. Setup Discord OAuth

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application"
3. Name it and go to OAuth2 → General
4. Copy **Client ID** and **Client Secret**
5. Add Redirect URLs:
   - `http://localhost:3000/api/auth/discord/callback` (dev)
   - `https://yourdomain.com/api/auth/discord/callback` (production)

## 2. Environment Variables

Click Settings → Vars in the top right and add:

```
DISCORD_CLIENT_ID=your_client_id_here
DISCORD_CLIENT_SECRET=your_client_secret_here
DISCORD_REDIRECT_URI=http://localhost:3000/api/auth/discord/callback
NEXTAUTH_SECRET=your_random_secret_here
```

To generate a random secret:
```bash
openssl rand -base64 32
```

## 3. Install & Run

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev
```

Visit `http://localhost:3000` in your browser.

## 4. Test the Flow

1. Click "Login with Discord"
2. Authorize the application
3. You should see your Discord servers
4. If you're a server owner, you can access the Admin Panel
5. Try updating bot settings

## 5. Connect MongoDB

The dashboard uses `zihooks.get("db")` to access MongoDB. This is already implemented in `/lib/mongodb.ts`.

When your bot server is running, the config API will automatically:
- Fetch configurations from MongoDB
- Save changes to MongoDB
- Display current settings in the UI

## 6. Real-time Updates (Optional)

To enable WebSocket support:

1. Set `NEXT_PUBLIC_WS_URL` environment variable:
   ```
   NEXT_PUBLIC_WS_URL=ws://api.ziji.world
   ```

2. Implement WebSocket server on your bot (see `lib/ws.ts` for client example)

3. Use in components:
   ```typescript
   import { botWS } from '@/lib/ws';
   
   await botWS.connect();
   botWS.on('config:updated', (payload) => {
     // Handle real-time updates
   });
   ```

## File Structure

```
app/
  page.tsx                    ← Login page
  dashboard/
    page.tsx                  ← Server selector
    admin/page.tsx            ← Admin panel (owners only)
    settings/page.tsx         ← Settings & docs
  api/
    auth/
      discord/route.ts        ← OAuth callback
      check/route.ts          ← Auth check
      user/route.ts           ← Get user
      guilds/route.ts         ← Get servers
      logout/route.ts         ← Logout
    config/route.ts           ← Config CRUD

lib/
  auth.ts                     ← JWT utilities
  mongodb.ts                  ← DB queries
  ws.ts                       ← WebSocket client

components/dashboard/
  nav.tsx                     ← Navigation
  server-selector.tsx         ← Server grid
  config-form.tsx             ← Settings form
```

## Common Tasks

### Add a New Setting Field

1. **Update Form** (`components/dashboard/config-form.tsx`):
   ```typescript
   <div>
     <label>New Setting</label>
     <Input {...register('newSetting')} />
   </div>
   ```

2. **Update Type** (if needed):
   ```typescript
   interface ServerConfig {
     // ... existing fields
     newSetting: string;
   }
   ```

3. **Update MongoDB** - Add field to bot_configs collection schema

### Check Authentication in API Route

```typescript
import { verifyAuth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const authData = await verifyAuth(request);
  
  if (!authData) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  // authData contains user info and guilds
  console.log(authData.username, authData.guilds);
}
```

### Query MongoDB

```typescript
import { getServerConfig, updateServerConfig } from "@/lib/mongodb";

// Get config
const config = await getServerConfig(serverId);

// Update config
await updateServerConfig(serverId, {
  prefix: "!",
  language: "en",
});
```

### Test API Endpoints

Using curl:
```bash
# Get auth status
curl -b "auth_token=YOUR_TOKEN" http://localhost:3000/api/auth/check

# Get server config
curl -b "auth_token=YOUR_TOKEN" \
  "http://localhost:3000/api/config?serverId=123456789"
```

## Debugging

### Turn on debug logs
Add `console.log("[v0] ...")` statements in code - they appear in the Preview logs panel.

### Check auth token
In browser DevTools → Application → Cookies → `auth_token`

### Verify MongoDB connection
Check `lib/mongodb.ts` - it attempts to use `zihooks.get("db")`

### API errors
- Open browser DevTools → Network tab
- Check response body for error messages
- Look for 401 (auth), 403 (permission), or 500 (server) errors

## Deployment

1. Push to GitHub
2. Connect repository in Settings → Settings
3. Deploy to production URL
4. Update Discord OAuth redirect URL
5. Update `DISCORD_REDIRECT_URI` environment variable

## Support Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Discord OAuth Docs](https://discord.com/developers/docs)
- [MongoDB Docs](https://www.mongodb.com/docs)
- See `IMPLEMENTATION_GUIDE.md` for detailed setup
- See `API_REFERENCE.md` for API endpoints

## Next Steps

1. ✅ Test login flow
2. ✅ Verify MongoDB connection
3. ✅ Add custom bot settings fields
4. ✅ Implement WebSocket for real-time updates
5. ✅ Deploy to production

Happy coding! 🚀
