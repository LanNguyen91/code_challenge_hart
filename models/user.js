var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var crypto = require('crypto');

var Schema = mongoose.Schema;

var userSchema = new mongoose.Schema({
  username:   { type: String, lowercase: true, unique: true},
  password:   { type: String },
  soundcloud: { type: String },
  tokens:     { type: Array  }
});

userSchema.pre('save', function(next) {
  var user = this;
  if (!user.isModified('password')) return next();
  bcrypt.genSalt(5, function(err, salt) {
    if (err) return next(err);
    bcrypt.hash(user.password, salt, null, function(err, hash) {
      if (err) return next(err);
      user.password = hash;
      next();
    });
  });
});

module.exports = mongoose.model('User', userSchema);