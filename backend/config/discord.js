// Discord OAuth2 Konfiguration
const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
const DISCORD_REDIRECT_URI = process.env.DISCORD_REDIRECT_URI || 'http://localhost:5000/api/auth/discord/callback';
const DISCORD_SCOPES = ['identify', 'email', 'guilds', 'guilds.members.read'];

module.exports = {
  clientID: DISCORD_CLIENT_ID,
  clientSecret: DISCORD_CLIENT_SECRET,
  callbackURL: DISCORD_REDIRECT_URI,
  scope: DISCORD_SCOPES
};