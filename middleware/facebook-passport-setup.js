const passports = require("passport");
const FacebookStrategy = require("passport-facebook").Strategy;
require("dotenv").config({ path: "./config/config.env" });

passports.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_CLIENT,
      clientSecret: process.env.FACEBOOK_SECRET,
      callbackURL:
        "https://final-project-shuttle.herokuapp.com/auth/facebook/callback",
      profileFields: ["id", "email", "name"],
    },
    function (accessToken, refreshToken, profile, cb) {
      return cb(null, profile);
    }
  )
);

module.exports = passports;
