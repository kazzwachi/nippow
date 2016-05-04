var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');
var session = require('express-session');

var authenticate = require('./lib/authenticate');

var routes = require('./routes/index');
var users = require('./routes/users');
var admin = require('./routes/admin');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/bower_components', express.static( path.join(__dirname, '/bower_components')));
app.use(cookieParser());
app.use(session({resave: 'true', saveUninitialized: 'true' , secret: 'sword fish meguro'}));
app.use(passport.initialize());
app.use(passport.session()); 

passport.serializeUser(function(user, done) {
	done(null, user);
}); 

passport.deserializeUser(function(obj, done) {
	done(null, obj);
});         

// VCAP_SERVICES contains all the credentials of services bound to
//this application. For details of its content, please refer to
//the document or sample of each service.  
var services = JSON.parse(process.env.VCAP_SERVICES || "{}");
var ssoConfig = services.SingleSignOn[0]; 
var client_id = ssoConfig.credentials.clientId;
var client_secret = ssoConfig.credentials.secret;
var authorization_url = ssoConfig.credentials.authorizationEndpointUrl;
var token_url = ssoConfig.credentials.tokenEndpointUrl;
var issuer_id = ssoConfig.credentials.issuerIdentifier;
var callback_url = 'http://nippow.mybluemix.net/auth/sso/callback';
var OpenIDConnectStrategy = require('passport-idaas-openidconnect').IDaaSOIDCStrategy;
var Strategy = new OpenIDConnectStrategy(
	{
		authorizationURL : authorization_url,
		tokenURL : token_url,
		clientID : client_id,
		scope: 'openid',
		response_type: 'code',
		clientSecret : client_secret,
		callbackURL : callback_url,
		skipUserProfile: true,
		issuer: issuer_id
	}, 
	function(iss, sub, profile, accessToken, refreshToken, params, done)  {
		process.nextTick(function() {
			profile.accessToken = accessToken;
			profile.refreshToken = refreshToken;
			done(null, profile);
		})
	}
); 

passport.use(Strategy);

app.use('/debug',require('./routes/debug'))

app.all('*',authenticate.ensureAuthenticated);
app.get('/login', passport.authenticate('openidconnect',{})); 
app.get('/auth/sso/callback',
	passport.authenticate('openidconnect',{failureRedirect : '/login'}),
	authenticate.ssoCallback
);

//router UI
app.use('/', routes);
app.use('/users', users);
app.use('/admin', admin);

//router API
app.use('/api/roles', require('./routes/api/roles'))

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
