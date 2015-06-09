var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var crypto = require('crypto');

var Schema = mongoose.Schema;

var soundcloudSchema = new mongoose.Schema({
  user     : [{ type: Schema.Types.ObjectId, ref: 'User' }],
  following: { type: Array },
  favorites: { type: Array }
});


module.exports = mongoose.model('Soundcloud', soundcloudSchema);