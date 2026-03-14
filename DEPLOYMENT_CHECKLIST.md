# Deployment Checklist

Complete this checklist before deploying to production.

## Pre-Deployment Setup

### Discord OAuth Configuration
- [ ] Create Discord application at https://discord.com/developers
- [ ] Copy Client ID
- [ ] Copy Client Secret
- [ ] Add production redirect URI: `https://yourdomain.com/api/auth/discord/callback`
- [ ] Enable "Require OAuth2 Code Grant"

### Environment Variables
- [ ] Set `DISCORD_CLIENT_ID` (from Discord Developer Portal)
- [ ] Set `DISCORD_CLIENT_SECRET` (from Discord Developer Portal)
- [ ] Set `DISCORD_REDIRECT_URI` (your production URL)
- [ ] Generate and set `NEXTAUTH_SECRET` (use: `openssl rand -base64 32`)
- [ ] Set `NODE_ENV=production`
- [ ] (Optional) Set `NEXT_PUBLIC_WS_URL` (your WebSocket URL)

### Database Configuration
- [ ] Verify MongoDB connection string works
- [ ] Create indexes on `bot_configs.serverId` collection
- [ ] Test `zihooks.get("db")` connection from your bot server
- [ ] Backup MongoDB data

### Security Review
- [ ] Verify CORS settings
- [ ] Check rate limiting configuration (implement before production)
- [ ] Review Discord OAuth scopes (`identify guilds`)
- [ ] Verify HTTP-only cookie settings
- [ ] Check JWT expiration settings (7 days)
- [ ] Enable HTTPS for all endpoints
- [ ] Enable WSS for WebSocket (if using)

## Code Review

### API Routes
- [ ] Verify all endpoints require authentication
- [ ] Check permission validation in `PUT /api/config`
- [ ] Validate all user input
- [ ] Handle errors gracefully
- [ ] Log security-relevant events

### Components
- [ ] Check for console errors
- [ ] Verify all forms validate input
- [ ] Test error messages display correctly
- [ ] Check responsive design on mobile
- [ ] Verify accessibility (keyboard navigation, screen readers)

### Environment Variables
- [ ] All secrets are in environment variables (not hardcoded)
- [ ] No sensitive data in version control
- [ ] `.env.local` is in `.gitignore`

## Testing Checklist

### Authentication Flow
- [ ] Login with Discord works
- [ ] Server list loads correctly
- [ ] User can see only their servers
- [ ] Logout clears auth token
- [ ] Can't access dashboard without auth token

### Configuration Management
- [ ] Server owner can view admin panel
- [ ] Non-owner can't access admin panel
- [ ] Can update all config fields
- [ ] Can add/delete custom commands
- [ ] Changes persist after refresh
- [ ] Error messages display on save failure

### Real-time Features (if WebSocket enabled)
- [ ] WebSocket connects successfully
- [ ] Config updates broadcast correctly
- [ ] Bot status displays in real-time
- [ ] Reconnects on connection drop

### Edge Cases
- [ ] Expired auth token redirects to login
- [ ] Invalid server ID returns error
- [ ] Missing required fields returns validation error
- [ ] Concurrent config updates handled correctly
- [ ] Network disconnection handled gracefully

## Performance Optimization

- [ ] Implement caching for config fetches
- [ ] Optimize images/assets
- [ ] Enable gzip compression
- [ ] Monitor API response times
- [ ] Set up database indexes
- [ ] Consider implementing rate limiting

## Deployment Steps

### GitHub & Vercel Setup
- [ ] Push code to GitHub repository
- [ ] Connect GitHub repository to Vercel project
- [ ] Set environment variables in Vercel project settings
- [ ] Configure production domain
- [ ] Enable automatic deployments from main branch

### MongoDB Setup
- [ ] Create MongoDB Atlas cluster (if not already done)
- [ ] Create indexes:
  ```javascript
  db.bot_configs.createIndex({ serverId: 1 })
  db.user_sessions.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 })
  ```
- [ ] Whitelist Vercel IP addresses in MongoDB
- [ ] Set up automated backups

### Bot Server Integration
- [ ] Set up WebSocket server (if needed)
- [ ] Implement config sync in bot server
- [ ] Set API_SECRET environment variable in bot
- [ ] Test API calls from bot to dashboard
- [ ] Test WebSocket communication
- [ ] Implement config reload commands

### Domain & SSL
- [ ] Configure custom domain in Vercel
- [ ] SSL certificate automatically provisioned
- [ ] Verify HTTPS working on all endpoints
- [ ] Update Discord OAuth redirect URI if domain changed
- [ ] Test in incognito/private mode

## Post-Deployment

### Monitoring & Logging
- [ ] Set up error tracking (e.g., Sentry, Vercel Analytics)
- [ ] Monitor API response times
- [ ] Set up alerts for errors
- [ ] Monitor database performance
- [ ] Check WebSocket connection stability

### User Testing
- [ ] Send invites to beta testers
- [ ] Gather feedback on UX
- [ ] Test with multiple Discord servers
- [ ] Test on different browsers/devices
- [ ] Test on slow network connections

### Documentation
- [ ] Update README with production URL
- [ ] Document API endpoints for bot developers
- [ ] Create user guide for server owners
- [ ] Document any custom MongoDB schemas
- [ ] Create troubleshooting guide

### Backup & Recovery
- [ ] Test MongoDB backup restoration
- [ ] Document backup/restore procedures
- [ ] Set up automated backups
- [ ] Test disaster recovery plan

## Maintenance Plan

### Regular Tasks
- [ ] Review security logs weekly
- [ ] Monitor API performance weekly
- [ ] Review user feedback monthly
- [ ] Update dependencies monthly
- [ ] Backup database daily

### Update Schedule
- [ ] Plan security updates immediately
- [ ] Plan feature updates monthly
- [ ] Plan major releases quarterly
- [ ] Schedule maintenance windows

## Rollback Plan

If issues occur after deployment:

1. [ ] Keep previous version deployed on staging
2. [ ] Monitor error logs for 24 hours
3. [ ] Have database backups ready
4. [ ] Document any breaking changes
5. [ ] Have rollback command prepared

To rollback:
```bash
# Revert to previous deployment
vercel rollback

# Or redeploy previous commit
git revert <commit>
git push
```

## Launch Announcement

- [ ] Prepare announcement for users
- [ ] Share API documentation
- [ ] Share bot integration guide
- [ ] Set up support channel
- [ ] Monitor for issues first week

## Sign-Off

- [ ] All checklist items completed
- [ ] Code reviewed and approved
- [ ] Security review passed
- [ ] Performance review passed
- [ ] Ready for production deployment

---

**Deployment Date**: _______________

**Deployed By**: _______________

**Version**: _______________

**Notes**:
```
_________________________________
_________________________________
_________________________________
```

## Quick Rollback Commands

```bash
# View deployments
vercel list

# Rollback to previous
vercel rollback

# Check logs
vercel logs

# Connect to production database
# (Be careful with production data!)
```

## Support Contacts

- **Discord Support**: https://discord.com/developers
- **Vercel Support**: https://vercel.com/support
- **MongoDB Support**: https://www.mongodb.com/support
- **Your Bot Server Admin**: [contact info]
