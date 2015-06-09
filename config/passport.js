var _                  = require('lodash');
var passport           = require('passport');
var soundcloudStrategy = require('passport-soundcloud').Strategy;
var secrets            = require('./secrets');
var User               = require('../models/User');

exports.isAuthenticated = function(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.json({
    success: false,
    code: '200',
    results: 'Not authorized'
  });
};

exports.isAuthorized = function(req, res, next) {
  var provider = req.path.split('/').slice(-1)[0];
  if (_.findWhere(req.user.tokens, { kind: provider })) {
    next();
  } else {
    res.json({code: 401, results: 'You are not authorized'});
  }
};


passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});


passport.use(new soundcloudStrategy(secrets.soundcloud ,function(req, accessToken, refreshToken, profile, done) {
  if (req.user) {
    User.findOne({ soundcloud: profile.id }, function(err, existingUser) {
      if (existingUser) {
        done(err);
      } else {
        User.findById(req.user.id, function(err, user) {
          user.soundcloud = profile.id;
          user.tokens.push({ kind: 'soundcloud', accessToken: accessToken });
          user.save(function(err) {
            done(err, user);
          });
        });
      }
    });
  } else {
    User.findOne({ soundcloud: profile.id }, function(err, existingUser) {
      if (existingUser) return done(null, existingUser);
      var user = new User();
      user.soundcloud = profile.id;
      user.tokens.push({ kind: 'soundcloud', accessToken: accessToken });
      user.save(function(err) {
        done(err, user);
      });
    });
  }
}));