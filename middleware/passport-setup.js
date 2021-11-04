const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
require("dotenv").config({ path: './config/config.env' })


passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT,
    clientSecret: process.env.GOOGLE_SECRET,
    callbackURL: "https://final-project-shuttle.herokuapp.com/auth/google/callback"
  },
  function (accessToken, refreshToken, profile, cb) {
    
    return cb(null, profile);
  }
)
);


module.exports = passport