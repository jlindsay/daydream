/**
 * author:Joshua Lindsay
 * email:j@lindsayfilm.com
 * http://lindsayfilm.com
 * Software can be used for Good or Evil.
 * Some people die rich, some die poor, the result is the same.
 */

var express       = require('express');
var hbs           = require('express-hbs');
var json          = require('hbs-json');
    hbs.registerHelper('json', json);


//var hbsutils      = require('hbs-utils')(hbs);

var path          = require('path');
var fs            = require('fs');
//var fp            = require('path');

var favicon       = require('serve-favicon');
var logger        = require('morgan');
var cookieParser  = require('cookie-parser');
var bodyParser    = require('body-parser');
var session       = require('express-session');
//compression
var compression   = require('compression')

//passport
var config        = require('./oauth.js');
var passport      = require('passport');
//var LocalStrategy = require('passport-local').Strategy;
var routes        = require('./routes/index');
var users         = require('./routes/users');
var me            = require('./routes/me');

//var api           = require('./routes/api');
//var mobile_api    = require('./routes/mobile-api');
var search_api          = require('./routes/search-api');
var video_api           = require('./routes/video-api');
var notification_api    = require('./routes/notification-api');
var playlist_api        = require('./routes/playlist-api');
var social_api          = require('./routes/social-api');
var newsfeed_api        = require('./routes/newsfeed-api');
var video_services_api  = require('./routes/video-services-api');

//var account_api   = require('./routes/account-api');
//var video         = require('./routes/video');
//var upload        = require('./routes/upload');
//var admin         = require('./routes/admin');
var event         = require('./routes/event');
var ping          = require('./routes/ping');

//var configarator  = require('./configarator.js')

var app = express();
/*
app.use(bodyParser({
  keepExtensions: true,
  limit: 4831838208, // set 10MB limit
  defer: true
}));

app.use(express.limit(4831838208));
*/

function relative(oPath) {
  return path.join(__dirname, oPath);
}
//var viewsDir = relative('views');
app.engine('hbs', hbs.express4({
  partialsDir: [relative('views/partials')],
  defaultLayout: relative('views/layouts/default.hbs'),
  layoutsDir: relative('views/layouts')
}));

app.set('view engine', 'hbs');
app.set('views', relative('views'));
/*
// Register sync helper
hbs.registerHelper('link', function(text, options) {
  var attrs = [];
  for (var prop in options.hash) {
    attrs.push(prop + '="' + options.hash[prop] + '"');
  }
  return new hbs.SafeString('<a ' + attrs.join(' ') + '>' + text + '</a>');
});

// Register Async helpers
hbs.registerAsyncHelper('readFile', function(filename, cb) {
  fs.readFile(fp.join(viewsDir, filename), 'utf8', function(err, content) {
    if (err) console.error(err);
    cb(new hbs.SafeString(content));
  });
});
*/

app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
/*
var cors = require('cors');
var corsOptions = {
  origin: function(origin, callback){
    var originIsWhitelisted = whitelist.indexOf(origin) !== -1;
    callback(null, originIsWhitelisted);
  }
};
app.use(cors());
*/

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use(session({ secret: '1981',
                  resave: true,
                  saveUninitialized: true,
                  cookie: {
                        secure: false,
                        maxAge: 2160000000
                    } }));

app.use(passport.initialize());
app.use(passport.session());

app.use( '/', routes );
app.use( '/me', me );
app.use( '/search-api', search_api );
app.use( '/video-api', video_api );
app.use( '/newsfeed-api', newsfeed_api );
app.use( '/notification-api', notification_api );
//app.use( '/mobile-api', mobile_api );
app.use( '/playlist-api', playlist_api );
app.use( '/social-api', social_api );
app.use( '/api', video_services_api );
app.use( '/users', users );
//app.use( '/upload', upload );
app.use( '/ping', ping );
app.use( '/event', event );

app.use(function onerror(err, req, res, next) {
  // an error occurred!
  console.log("err:",err);
});

/*
app.get('/auth/facebook',
  passport.authenticate('facebook'),
  function(req, res){
  });
app.get('/auth/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/' }),
  function(req, res) {
    res.redirect('/account');
});

app.get('/auth/twitter',
  passport.authenticate('twitter'),
  function(req, res){
  });
app.get('/auth/twitter/callback',
  passport.authenticate('twitter', { failureRedirect: '/' }),
  function(req, res) {
    res.redirect('/account');
  });
app.get('/auth/github',
  passport.authenticate('github'),
  function(req, res){
  });
app.get('/auth/github/callback',
  passport.authenticate('github', { failureRedirect: '/' }),
  function(req, res) {
    res.redirect('/account');
  });
app.get('/auth/google',
  passport.authenticate('google'),
  function(req, res){
  });
app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  function(req, res) {
    res.redirect('/account');
  });
app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});
*/

// catch 404 and forward to error handler
app.use(function(req, res, next) {
/*
  var err = new Error('Not Found');
      err.status = 404;
      next(err);
*/
  res.status(404);

  // respond with html page
  if (req.accepts('html')) {
    res.render('404', { url: req.url });
    return;
  }

  // respond with json
  if (req.accepts('json')) {
    res.json( { error: 'Not found', error_code:"404" } );
    //res.send({ error: 'Not found' });
    return;
  }

  // default to plain-text. send()
  res.type('txt').send('Not found');
});




// Handle 500
app.use(function(error, req, res, next) {
    console.error(error.stack);

    if (req.accepts('html')) {
      res.render('500', { url: req.url });
      return;
    }

    // respond with json
    if (req.accepts('json')) {
      res.json( { error: 'Not found', error_code:"500" } );
      //res.send({ error: 'Not found' });
      return;
    }

    res.send('500: Internal Server Error', 500);
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


//compression
//app.use(compression());
app.use(compression({filter: function (req, res) {
  if (req.headers['x-no-compression']) {
    // don't compress responses with this request header
    return false
  }
  // fallback to standard filter function
  return compression.filter(req, res)
}}));
/*
var server = app.listen(3001, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});
*/

module.exports = app;
