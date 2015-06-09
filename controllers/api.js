
var _             = require('lodash');
var async         = require('async');
var secrets       = require('../config/secrets');
var SoundCloudAPI = require("soundcloud-node");
var client        = new SoundCloudAPI(secrets.soundcloud.clientID, secrets.soundcloud.clientSecret, secrets.soundcloud.callbackURL);
var Soundcloud    = require('../models/soundcloud');

exports.following = function(req, res, next){
  var sc = _.findWhere(req.user.tokens, { kind: 'soundcloud' });
  client.setToken(sc.accessToken);

  client.get('/users/'+req.user.soundcloud+'/followings', function(err, result){
    if(err) {
      console.log(err);
      res.json({
        success: false, 
        code: '500',
        results: err
      });
    } else {
      console.log(result);
      res.json({
        success: true, 
        code: '200',
        results: result
      });
    }
  });

};

exports.follow = function(req, res, next){
  var sc = _.findWhere(req.user.tokens, { kind: 'soundcloud' });
  client.setToken(sc.accessToken);

  client.put('/users/'+req.user.soundcloud+'/followings' + req.body.id, function(err, result){
    if(err) {
      console.log(err);
      res.json({
        success: false, 
        code: '500',
        results: err
      });
    } else {
      console.log(result);
      res.json({
        success: true, 
        code: '200',
        results: result
      });
    }
  });

};

exports.like = function(req, res, next){
  var sc = _.findWhere(req.user.tokens, { kind: 'soundcloud' });
  client.setToken(sc.accessToken);

  client.put('/users/'+req.user.soundcloud+'/favorites' + req.body.id, function(err, result){
    if(err) {
      console.log(err);
      res.json({
        success: false, 
        code: '500',
        results: err
      });
    } else {
      console.log(result);
      res.json({
        success: true, 
        code: '200',
        results: result
      });
    }
  });

};


exports.favorites = function (req, res, next){
  var sc = _.findWhere(req.user.tokens, { kind: 'soundcloud' });
  client.setToken(sc.accessToken);

  client.get('/users/'+req.user.soundcloud+'/favorites', function(err, result){
    if(err) {
      console.log(err);
      res.json({
        success: false, 
        code: '500',
        results: err
      });
    } else {
      Soundcloud.findOne({user: req.user}, function(err, response){
        if(err){
          console.log(err);
          res.json({
            success: false, 
            code: '500',
            results: err
          });
        } else {
          if(response){
            Soundcloud.findByIdAndUpdate(response.id, {following: result}, function(err, response){
              if (err) return next(err);
              res.json({
                success: true, 
                code: '200',
                results: result
              });
            });
          } else {
            var soundcloud = new Soundcloud();
            soundcloud.user = req.user;
            soundcloud.favorites = result; 
            soundcloud.save(function(err){
              if (err) return next(err);
              res.json({
                success: true, 
                code: '200',
                results: result
              });
            });
          }
        }
      });
    }
  });

};



