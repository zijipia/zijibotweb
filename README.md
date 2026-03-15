# Ziji Bot Web Dashboard

A modern web-based dashboard for managing Discord bot configurations with Discord OAuth 2.0 authentication.

## Features

- **Discord OAuth Authentication** - Secure login with Discord accounts
- **Server Selection** - View and select Discord servers you own
- **Dashboard Interface** - Clean, modern UI built with shadcn/ui
- **User Verification** - JWT-based session management with HTTP-only cookies
- **Multi-Server Support** - Manage multiple Discord servers from one dashboard

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS v4, shadcn/ui components
- **Authentication**: Discord OAuth 2.0, JWT tokens
- **Session Management**: HTTP-only cookies
- **UI Components**: Radix UI, Lucide React icons
- **Form Handling**: React Hook Form, Zod validation
- **Utilities**: Axios, bcryptjs

## Quick Start

### Prerequisites

- Node.js 18+ (pnpm, npm, yarn, or bun)
- Discord Developer Application (OAuth2 credentials)

### 1. Clone & Install

```bash
git clone https://github.com/zijipia/zijibotweb .

git submodule update --init --recursive

pnpm install

```

Or use your preferred package manager (npm, yarn, bun).

### 2. Set Environment Variables

Create a `.env.local` file in the project root:

```env
DISCORD_CLIENT_ID=your_discord_client_id
DISCORD_CLIENT_SECRET=your_discord_client_secret
DISCORD_REDIRECT_URI=http://localhost:3000/api/auth/discord/callback
NEXTAUTH_SECRET=your_random_secret_key
BOT_API_URL=your_api-url
```

### 3. Get Discord OAuth Credentials

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application" and give it a name
3. Go to "OAuth2" → "General"
4. Copy your **Client ID** and **Client Secret**
5. Click "Add Redirect" and add: `http://localhost:3000/api/auth/discord/callback`
6. For production, also add your Vercel deployment URL redirect

### 4. Run Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Test the Application

1. Click "Login with Discord" on the home page
2. Authorize the application on Discord's OAuth screen
3. You'll be redirected to the dashboard
4. See your Discord servers you own

## Project Structure

```
app/
├── page.tsx                 # Home/login page
├── layout.tsx              # Root layout with metadata
└── dashboard/
    ├── layout.tsx          # Dashboard layout wrapper
    ├── page.tsx            # Dashboard home (server selector)
    ├── admin/
    │   └── page.tsx        # Admin panel (future)
    └── settings/
        └── page.tsx        # Settings page (future)

components/
├── dashboard/
│   ├── server-selector.tsx # Server grid selection component
│   ├── config-form.tsx     # Configuration form (future)
│   ├── custom-commands.tsx # Custom commands manager (future)
│   ├── server-status.tsx   # Server status display (future)
│   └── nav.tsx             # Navigation sidebar (future)
├── ui/                     # shadcn/ui components
│   ├── button.tsx
│   ├── card.tsx
│   ├── dialog.tsx
│   └── ... (other UI components)
└── theme-provider.tsx      # Theme provider wrapper

lib/
├── auth.ts                 # JWT verification and OAuth URL generation

public/                     # Static assets
```

## Authentication Flow

1. User clicks "Login with Discord" on home page
2. Redirected to Discord OAuth authorization screen
3. User authorizes the application
4. Discord redirects to `/api/auth/discord/callback`
5. JWT token is created and stored in HTTP-only cookie
6. User is redirected to dashboard with authenticated session

## Key Pages

### Home Page (`/`)
- Login page with Discord OAuth button
- Features showcase
- Unauthenticated users only

### Dashboard (`/dashboard`)
- Authentication check on page load
- Server selector grid showing user's Discord servers
- Click a server to select it (future: access settings)
- Displays server name, icon, and owner status

## API Endpoints

### Authentication
- `GET /api/auth/discord` - OAuth callback endpoint (receives Discord auth code)
- `GET /api/auth/check` - Verify current user is authenticated
- `GET /api/auth/guilds` - Get list of user's Discord servers
- `POST /api/auth/logout` - Clear authentication session

### Future Endpoints (In Development)
- `GET /api/config` - Get server configuration
- `PUT /api/config` - Update server configuration
- `GET /api/commands` - Get custom commands
- `POST /api/commands` - Create custom command

## Security Features

- ✅ HTTP-only cookies (prevents XSS access to tokens)
- ✅ JWT token verification
- ✅ Server-side authentication checks
- ✅ CORS protection via Next.js
- ✅ Input validation with Zod
- ✅ Secure redirect after login

## Development

### Adding a New Page

1. Create file in `app/` or `app/dashboard/`
2. Use `'use client'` for client components
3. Use authentication check in layout or page
4. Add navigation link in appropriate component

### Creating a New Component

1. Create file in `components/`
2. Use shadcn/ui components for consistency
3. Follow TypeScript interfaces for props
4. Use Tailwind CSS for styling

### Updating Environment Variables

Variables needed:
- `DISCORD_CLIENT_ID` - From Discord Developer Portal
- `DISCORD_CLIENT_SECRET` - From Discord Developer Portal (keep secure!)
- `DISCORD_REDIRECT_URI` - OAuth callback URL
- `NEXTAUTH_SECRET` - Random secret for JWT signing

## Deployment to Vercel

1. Push code to GitHub repository
2. Connect repository in [Vercel](https://vercel.com)
3. Add environment variables in Vercel project settings:
   - `DISCORD_CLIENT_ID`
   - `DISCORD_CLIENT_SECRET`
   - `DISCORD_REDIRECT_URI=https://your-vercel-domain.vercel.app/api/auth/discord/callback`
   - `NEXTAUTH_SECRET`
4. Deploy!

## Troubleshooting

### "Unauthorized" Error
- Check that `NEXTAUTH_SECRET` is set correctly
- Verify JWT token in cookies (DevTools → Application → Cookies)
- Clear cookies and try logging in again

### Discord Login Redirect Loop
- Verify `DISCORD_REDIRECT_URI` matches exactly in Discord Developer Portal
- Check environment variables are set correctly
- Ensure Client ID and Secret are correct

### 404 on API endpoints
- Verify environment variables are loaded (check `.env.local`)
- Confirm Discord OAuth credentials are valid
- Check browser console for API error messages

### "No servers found" Message
- You need to own at least one Discord server to see it
- If you're only a member (not owner), you won't see servers
- Try creating a test server for development

## Future Features

- Server configuration management
- Custom command builder
- Bot status monitoring
- Webhook integration
- Database persistence
- Admin role management
- Auto-role assignment
- Log channel configuration

## Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make your changes
3. Test locally with `pnpm dev`
4. Commit and push
5. Open a pull request

## License

MIT

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Discord Developer Portal](https://discord.com/developers)
- [shadcn/ui Components](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com)
- [React Hook Form](https://react-hook-form.com)
- [Zod Validation](https://zod.dev)

---

Built with Next.js 16, React 19, and Discord OAuth 2.0
