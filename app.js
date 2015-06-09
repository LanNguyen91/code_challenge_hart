var _                = require('lodash');
var express          = require('express');
var cookieParser     = require('cookie-parser');
var compress         = require('compression');
var session          = require('express-session');
var bodyParser       = require('body-parser');
var methodOverride   = require('method-override');
var MongoStore       = require('connect-mongo')({ session: session });
var path             = require('path');
var mongoose         = require('mongoose');
var passport         = require('passport');

var app              = express();

var secrets          = require('./config/secrets');
var passportSettings = require('./config/passport');

var apiController    = require('./controllers/api');

mongoose.connect(secrets.db, { server : { autoReconnect: true, socketOptions: { connectTimeoutMS: 10000 } } });
mongoose.connection.on('error', function(err) {
  console.error('MONGO ERROR: Something broke!');
  console.log(err);
});


app.locals.cacheBuster = Date.now();
app.set('port', process.env.PORT || 1337);
app.use(compress());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(methodOverride());
app.use(cookieParser());
app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: secrets.sessionSecret,
  store: new MongoStore({
    url: secrets.db,
    autoReconnect: true
  })
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(function(req, res, next) {
  res.locals.user = req.user;
  next();
});

app.use(function(req, res, next) {
  if (req.method !== 'GET') return next();
  var path = req.path.split('/')[1];
  if (/(auth|login|logout|signup)$/i.test(path)) return next();
  req.session.returnTo = req.path;
  next();
});


app.get('/', function(req, res, next){
  res.json({Welcome: 'Soundcloud middle-layer API'});
});
app.get('/following', passportSettings.isAuthenticated, apiController.following);
app.get('/favorites', passportSettings.isAuthenticated, apiController.favorites);
app.get('/auth/soundcloud', passport.authenticate('soundcloud'));
app.get('/auth/soundcloud/callback', passport.authenticate('soundcloud', { failureRedirect: '/error' }), function(req, res) {
  res.json({
    success: true,
    code: 200,
    results: 'Authorized'
  });
});


app.listen(1337);









