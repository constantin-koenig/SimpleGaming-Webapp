// Passport Konfiguration für Discord OAuth
const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;
const User = require('../models/user.model');
const discordConfig = require('./discord');

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
      await user.save();
    } else {
      // Neuen Benutzer erstellen
      user = await User.create({
        discordId: profile.id,
        username: profile.username,
        discriminator: profile.discriminator,
        avatar: profile.avatar,
        email: profile.email,
        guilds: profile.guilds,
        accessToken: accessToken,
        refreshToken: refreshToken
      });
    }
    
    return done(null, user);
  } catch (err) {
    return done(err, null);
  }
}));

module.exports = passport;