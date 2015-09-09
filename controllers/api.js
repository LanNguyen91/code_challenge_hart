
var _             = require('lodash');
var async         = require('async');
var secrets       = require('../config/secrets');
var SoundCloudAPI = require("soundcloud-node");
var client        = new SoundCloudAPI(secrets.soundcloud.clientID, secrets.soundcloud.clientSecret, secrets.soundcloud.callbackURL);
var Soundcloud    = require('../models/soundcloud');
var async         = require('async');




exports.download = function(req, res, next){
  var sc = _.findWhere(req.user.tokens, { kind: 'soundcloud' });
  client.setToken(sc.accessToken);
  console.log(secrets.soundcloud.clientID);
  
  client.get('/users/'+req.user.soundcloud+'/favorites', function(err, result){
    if(err){
      res.json({
        success: false, 
        code: '500',
        results: err
      })
    }else{
      var html = "";
      //send html code as response
      //priority download link if avalaible, if not use stream link
      //if even stream link if unavailable, then use direct link to soundcloud
      //exposing soundcloud clientID as a embedded response is highly insecure, 
      //but will work for the code challenge
      for(var i = 0; i < result.length; i++){
        var track = result[i];
        if(track.downloadable)
          html += "<a href='"+ track.download_url + "?client_id="+ secrets.soundcloud.clientID+"'/> CLICK ME to listen to " + track.title + "</a><br>";
        else if(track.stream_url)
          html += "<a href='"+ track.stream_url + "?client_id="+ secrets.soundcloud.clientID+"'/> CLICK ME to listen to " + track.title + "</a><br>";
        else
          html += "<a href='"+ track.permalink_url + "?client_id="+ secrets.soundcloud.clientID+"'/> CLICK ME to listen to " + track.title + "</a><br>";
      }
      res.send(html);
    }
  })

}

exports.topfive = function(req,res, next){
  var sc = _.findWhere(req.user.tokens, { kind: 'soundcloud' });
  client.setToken(sc.accessToken);
  
  client.get('/users/'+req.user.soundcloud+'/favorites', function(err, result){
    if(err){
      res.json({
        success: false, 
        code: '500',
        results: err
      })
    }else{

      var artistCounter = {};

      //get artist base on songs that they like and keep the count 
      for(var i = 0; i < result.length; i++){
        var artistName = result[i].user.username;
        if(artistCounter[artistName]){
          artistCounter[artistName]++
        }
        else{
          artistCounter[artistName] = 1;
        }
      }

      var sortable = _.keys(artistCounter);

      //sort as descending order
      var sortedArray = sortable.sort(function(a,b){
        return artistCounter[b]-artistCounter[a];
      })

      //if the sorted final list is bigger than 5, return the top 5 
      if(sortedArray.length > 5) sortedArray = sortedArray.slice(0,5)
      res.json({
        results : sortedArray
      })
    }
  })
}


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

  var scOnUserFound, successResponse, error;

  //async series for data dependency, whenever error occur
  //immediately perform a callback and handle the error
  async.series([

    // get client info
    function(cb){
      client.get('/users/'+req.user.soundcloud+'/favorites', function(err, result){
        if(err) {
          error = err;
          cb();
        }else{
          successResponse = result;
          cb();
        }
      })
    },

    // find in database user information
    function(cb){
      if(error) cb();
      else{
        Soundcloud.findOne({user: req.user}, function(err, response){
          if(err){
            error = err;
            scOnUserFound = response;
            cb();
          } else cb();
        })
      }
    },

    //update user favorites list
    function(cb){
      if(error) cb();
      if(scOnUserFound){
        Soundcloud.findByIdAndUpdate(response.id, {following: successResponse}, function(err, response){
          if (err) error = err;
          cb();
        });
      }else cb();
    },

    // if user doesn't exist then create new sound cloud array and save user favorites list
    function(cb){
      if(error) cb();
      if(!scOnUserFound){
        var soundcloud = new Soundcloud();
        soundcloud.user = req.user;
        soundcloud.favorites = successResponse; 
        soundcloud.save(function(err){
          if (err) error = err;
          cb();
        });
      }
    }
  ], function(err){
      //handling error occur during the look up
      if(err) {
        res.json({
          success : false,
          code: 500,
          results: err
        })
      }
      //handling error occur return by the look up
      else if(error){
        res.json({
          success : false,
          code: 500,
          results: error
        })
      }
      //handling success when all the look up are success
      else{
        res.json({
          success : true,
          code: 200,
          results: successResponse
        })
      }

    }
  )
}

