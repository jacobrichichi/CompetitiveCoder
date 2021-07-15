const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const mongoose = require("mongoose");
const User = mongoose.model("users");
const Challenge = mongoose.model("challenges");
const keys = require("../config/keys");
const opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = keys.secretOrKey;


module.exports = passport => {
  passport.use(
    "userToken",
    new JwtStrategy(opts, (jwt_payload, done) => {
      User.findById(jwt_payload.id)
        .then(user => {
          if (user) {
            return done(null, user);
          }
          return done(null, false);
        })
        .catch(err => console.log(err));
    })
  );
  passport.use(
    "challengeToken",
    new JwtStrategy(opts, (jwt_payload, done) =>{
      Challenge.findById(jwt_payload.id)
      .then(challenge =>{
        if(challenge){
          return done(null, challenge);
        }
        return done(null, false);
      })
      .catch(err => console.log(err));
    })
  );

  passport.use(
    "roomToken",
    new JwtStrategy(opts, (jwt_payload, done) => {
      console.log('passport room');
      console.log(jwt_payload.room);
      return done(null, jwt_payload.room);
  })
  );
};