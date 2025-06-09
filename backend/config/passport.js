const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;
const User = require('../models/user.model');
const discordConfig = require('./discord');
const autoAdminMiddleware = require('../middleware/autoAdmin.middleware');

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

passport.use(new DiscordStrategy({
  clientID: discordConfig.clientID,
  clientSecret: discordConfig.clientSecret,
  callbackURL: discordConfig.callbackURL,
  scope: discordConfig.scope
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Benutzer in der Datenbank suchen oder erstellen
    let user = await User.findOne({ discordId: profile.id });
    
    // ✅ Auto-Admin Check: Ist das der erste User überhaupt?
    const totalUsers = await User.countDocuments({});
    const isFirstUser = totalUsers === 0;
    
    if (user) {
      // Benutzer aktualisieren
      user.username = profile.username;
      user.discriminator = profile.discriminator;
      user.avatar = profile.avatar;
      user.email = profile.email;
      user.guilds = profile.guilds;
      user.accessToken = accessToken;
      user.refreshToken = refreshToken;
      user.updatedAt = Date.now();
      
      // ✅ Auto-Admin: Falls noch kein Admin existiert und User noch keiner ist
      if (!user.roles.includes('admin')) {
        const hasAdmin = await User.findOne({ roles: { $in: ['admin'] } });
        if (!hasAdmin) {
          user.roles = ['admin', 'member'];
          user.metadata = user.metadata || {};
          user.metadata.firstAdmin = true;
          user.metadata.adminSince = new Date();
          console.log(`🎉 AUTO-ADMIN: ${user.username} promoted to admin (returning user, no admin exists)`);
        }
      }
      
      await user.save();
    } else {
      // ✅ Neuen Benutzer erstellen - mit Auto-Admin falls erster User
      const initialRoles = isFirstUser ? ['admin', 'member'] : ['member'];
      const metadata = isFirstUser ? {
        firstAdmin: true,
        adminSince: new Date(),
        firstUser: true
      } : {};
      
      user = await User.create({
        discordId: profile.id,
        username: profile.username,
        discriminator: profile.discriminator,
        avatar: profile.avatar,
        email: profile.email,
        guilds: profile.guilds,
        accessToken: accessToken,
        refreshToken: refreshToken,
        roles: initialRoles,
        metadata: metadata
      });
      
      if (isFirstUser) {
        console.log(`🎉 FIRST USER & AUTO-ADMIN: ${user.username} created as administrator!`);
      } else {
        console.log(`👤 New user created: ${user.username}`);
      }
    }
    
    return done(null, user);
  } catch (err) {
    return done(err, null);
  }
}));

module.exports = passport;