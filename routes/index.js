/**
 * author:Joshua Lindsay
 * email:j@lindsayfilm.com
 * twitter:@jlindsay
 * https://www.lindsayfilm.com
 * Software can be used for Good or Evil.
 * Some people die rich, some die poor, the result is the same.
 */


var path                = require("path");
var fs                  = require('fs');
var mv                  = require('mv');

var express             = require('express');
var router              = express.Router();

var multer              = require('multer');
var sanitize            = require("sanitize-filename");

var _um                 = require("../server/UserManager");
var _vm                 = require("../server/VideoManager");
var _nfm                = require("../server/NewsFeedManager");
var _sm                 = require("../server/SearchManager");
var _qm                 = require("../server/QueueManager");
var passport            = require('passport');
var LocalStrategy       = require('passport-local').Strategy;
var BearerStrategy      = require('passport-http-bearer').Strategy;
var jwt                 = require('jsonwebtoken');

var ensureLoggedIn      = require('connect-ensure-login').ensureLoggedIn;
var proxy               = require('express-http-proxy');
var md5                 = require('md5');

var oembed = require('oembed');
var ogs = require('open-graph-scraper');

passport.serializeUser(function(user, done){
    done(null, user);
});

passport.deserializeUser(function( user, done ){
    ( user )? done(null, user) : done(err, null);
});

router.get('/', function(req, res, next) {
    var user = { first_name:"Stranger" };

    if( req.session.passport.user )
    {
        user = req.session.passport.user;
    }

    res.render('index', { title       : 'Lindsay Film | Home',
                          greeting    : "Howdy",
                          first_name  : user.first_name,
                          message     : "$#@! I saw on the internet!",
                          user        : user });
});

/*
router.get('/test-index', function(req, res, next) {
    var user = { first_name:"Stranger" };
    if( req.session.passport.user )
    {
        user = req.session.passport.user;
    }
    res.render('test-index', { title: 'jlindsay',
                               greeting:"Howdy",
                               first_name:user.first_name,
                               message:"$#@! I saw on the internet!",
                               user:user });
});
*/
router.get('/login', function(req, res, next) {
    res.render('login', { title: 'Lindsay Film | Login' });
});

passport.use(new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password'
  },
  function( username, password, done) {
    _um.login( username, password, function(user){
        return done(null, user);
    }, function(data){
        return done(null, false, data );
    });
  }
));


//passport+BearerStrategy
//NOTE: need to encode/decode token, probalby with uaa
passport.use(new BearerStrategy(
  function(token, cb) {
    console.log("BearerStrategy:token:", token);
    //console.log("userid:", req.params.userid, "password:", req.params.password)
    return cb(null, {userid:'jlindsay', email:'joshdlindsay@gmail.com'});
 }));

 //curl --form "userid=jlindsay;password=12345567890"  -v -H "Authorization: bearer 123456789" http://127.0.0.1:3000/auth/mobile
 router.post('/auth/mobile',
     passport.authenticate('bearer', { session: false }),
     function(req, res){
         console.log("/auth/mobile");
         res.json( req.user )
         //res.json({ username: req.user.username, email: req.user.emails[0].value });
 });


router.post('/login',
    passport.authenticate('local', { successReturnToOrRedirect: '/',
                                     failureRedirect: '/login',
                                     failureFlash: false })
);

router.get('/logout', function(req, res){
    req.logout();
    res.redirect('/login');
});


/*
router.get('/dialog/authorize', oauth2.authorization);
router.post('/dialog/authorize/decision', oauth2.decision);
router.post('/oauth/token', oauth2.token);
*/
router.post('/signup', function(req, res){
    console.log("post:/signup", req.body.username );
    var username = req.body.username;
    var first_name = req.body.first_name;
    var last_name = req.body.last_name;
    var password = md5(req.body.password);
    var email = req.body.email;

    var config = { password : password,
                   first_name: first_name,
                   last_name: last_name,
                   email: email
                }

    _um.doesUsernameExists( username, function(b){
        console.log("post:/signup:doesUsernameExists:b:", b)
        if( b ){
          res.json({ 'status'  :"failed",
                     'username' : username,
                     'message'  : "username already exists"
                 })
      //     return;
        }else{
            console.log("post:/signup:_um.signupUser:username:", username)

            _um.signupUser( username,
                            config ,
                            function(user){
                                console.log("post:/signup::_um.signupUser.success():user:", user)

                                res.json( { status      : 'success',
                                            action      : 'signup',
                                            userid      : user.userid,
                                            username    : user.username,
                                            data        : user
                                        })

                            })
        }
    });


});

router.get('/signup', function(req, res){
    res.render('signup', { title: 'Lindsay Film | signup' });
});

router.get('/privacy-policy', function(req, res){
    res.render('privacy-policy', { title: 'Lindsay Film | Privacy Policy' });
});

//home
router.get('/home', ensureLoggedIn('/login') , function(req, res){
    if( req.session.passport.user ){
        user = req.session.passport.user;
    }
    res.render('home', {title:"home", user:user } );
});

//settings
router.get('/settings', ensureLoggedIn('/login') , function(req, res){
    if( req.session.passport.user ){
        user = req.session.passport.user;
    }
    res.render('settings', {title:"settings", user:user});
});


router.get('/w/:vid', function(req, res, next) {
    var vid   = req.params.vid;
    var host  = req.get('host');
    var user  = { first_name:"Stranger", last_name:"unknown", userid:null, is_admin:false};

    if( req.session.passport.user ){
        user = req.session.passport.user || { first_name:"anonymous", last_name:"unknown", userid:'anonymous', is_admin:false};
    }

    //console.log("route:catagory:req.params:", req.params , ", xxxx:req.query:", req.query );
    _vm.getVideoAbsolute(user.userid, vid, { user:user, catagory:req.query.c }, function(data){
        //console.log( "data:",  data  )
        var video = data[0];
        //0 not public
        //1 is public
        //2 is public but only if your loggedin
        video.embed_url = "https://"+host+"/embed/"+ video.uid;

        if( Boolean( video.is_author ) ||
            Boolean( Number(video.is_public) == 1 )  ||
            Boolean( Boolean( Number(video.is_public) == 2 ) && user.is_loggedin )
        ){
          //  console.log( "xxx:video.full_name:", video.full_name, ", video.profile_url:",video.profile_url );
          //console.log("video_catagory:video.catagory , catagroy: video.catagory:",video.catagory ,video.catagory)
            res.render('watch', { vid             : vid,
                                  video           : video,
                                  user            : user,
                                  host            : host,
                                  userid          : user.userid ,
                                  title           : video.title,
                                  description     : video.description,
                                  keywords        : video.keywords,
                                  video_catagory  : video.catagory,
                                  catagroy        : video.catagory,
                                  video_url       : video.video_url,
                                  embed_url       : video.embed_url,
                                  thumbnail_url   : video.thumbnail_url,
                                  profile_url     : user.profile_url,
                                  full_name       : user.full_name
                                });
        } else {
            res.render('video-not-available', { userid          : user.userid,
                                                title           : video.title,
                                                description     : video.description,
                                                keywords        : video.keywords,
                                                video_catagory  : video.catagory,
                                                thumbnail_url   : video.thumbnail_url,
                                                vid             : vid,
                                                video           : video,
                                                user            : user,
                                                host            : host,
                                                profile_url     : user.profile_url,
                                                full_name       : user.full_name
                                              });
        }
    })
});


router.get('/p/:pid', function(req, res, next) {
    var host      = req.get('host');
    var pid       = req.params.pid;
    var user      = { first_name:"Stranger", last_name:"unknown", userid:null, is_admin:false};
    var post_url  = "https://"+ host +"/p/" + pid;
    var embed_url = "https://" +host +"/embed/p/" + pid;

    if( req.session.passport.user ){
        user = req.session.passport.user || { first_name:"anonymous", last_name:"unknown", userid:'anonymous', is_admin:false};
    }


    _nfm.getPostAbsolute(user.userid, pid, { user:user, catagory:req.query.c }, function($data){

        var post = $data[0];
            post.post_url  = post_url;
            post.embed_url = embed_url;

        //if( Boolean( post.is_author ) ||
            //Boolean( Number(post.is_public) == 1 )  ||
            //Boolean( Boolean( Number(post.is_public) == 2 ) &&
             //user.is_loggedin ){

            //console.log("post:",post)
            res.render('post', { pid            : pid,
                                 post           : post,
                                 user           : user,
                                 host           : host,
                                 userid         : user.userid,

                                 title          : post.metadata_title,
                                 description    : post.metadata_description,
                                 keywords       : post.keywords,
                                 post_catagory  : post.catagory ,
                                 catagroy       : post.catagory,
                                 post_url       : post.post_url,
                                 embed_url      : post.embed_url,
                                 video_url      : post.metadata_video_url,
                                 thumbnail_url  : post.metadata_thumbnail_url,
                                 profile_url    : user.profile_url,
                                 full_name      : user.full_name
                               });
        //}else {
        /*
            res.render('post-not-available', { pid            : pid,
                                               post           : post,
                                               user           : user,
                                               host           : host,
                                               userid         : user.userid,

                                               title          : post.metadata_title,
                                               description    : post.metadata_description,
                                               keywords       : post.keywords,
                                               post_catagory  : post.catagory ,
                                               catagroy       : post.catagory,
                                               post_url       : post.post_url,
                                               embed_url      : post.embed_url,
                                               video_url      : post.metadata_video_url,
                                               thumbnail_url  : post.metadata_thumbnail_url,
                                               profile_url    : user.profile_url,
                                               full_name      : user.full_name
                                             });

        }
*/
    })
});


router.get('/embed/p/:pid', function(req, res, next) {

    var host            = req.get('host');
    var pid             = req.params.pid;
    var post_width      = req.params.width || "100%";
    var post_height     = req.params.height || "100%";
    var showplaylist    = req.params.showplaylist || false;
    var useRTMP         = req.params.userRTMP || true;
    var useRTMPT        = req.params.userRTMPT || false;
    var embed_url       = "https://"+ host +"/embed/p/" + pid ;
    var post_url        = "https://"+ host +"/p/" + pid;
    var autoplay        = req.params.autoplay || false;


    var user = req.session.passport.user || { first_name:"anonymous",
                                              last_name:"unknown",
                                              userid:'anonymous', is_admin:false};
        //console.log("userid:", user.userid)

    //if( req.session.passport.user ){
        //user = req.session.passport.user || 'anonymous';
        _nfm.add2History(user.userid, pid, {page:"embed-post"}, function(data){
            console.log("add2History:completed");
        })
    //}

    if( req.session.passport.user ){
        user = req.session.passport.user;
        //record embed data here.
    }

    _nfm.getPostEmbed( pid, {}, function($post){
        console.log("getPostEmbed:",$post)

            $post.post_url  = post_url;
            $post.embed_url = embed_url;

        res.render('post-embed', { pid              : pid,
                                   user             : user,
                                   host             : host,
                                   autoplay         : autoplay,
                                   post_width       : post_width,
                                   post_height      : post_height,

                                   title            : $post.metadata_title,
                                   description      : $post.metadata_description,
                                   keywords         : $post.keywords,
                                   post_catagory    : $post.catagory ,
                                   catagroy         : $post.catagory,
                                   post_url         : $post.post_url,
                                   embed_url        : $post.embed_url,
                                   video_url        : $post.metadata_video_url,
                                   thumbnail_url    : $post.metadata_thumbnail_url,
                                   profile_url      : user.profile_url,
                                   full_name        : user.full_name,

                                   post             : $post

                                });
    });


});


router.get('/embed/:vid', function(req, res, next) {

    var host            = req.get('host');
    var vid             = req.params.vid;
    var video_width     = req.params.width || "100%";
    var video_height    = req.params.height || "100%";
    var showplaylist    = req.params.showplaylist || false;
    var useRTMP         = req.params.userRTMP || true;
    var useRTMPT        = req.params.userRTMPT || false;
    var embed_url       = "http://" + host + "/embed/" + vid ;
    var autoplay        = req.params.autoplay || false;


    var user = req.session.passport.user || { first_name:"anonymous", last_name:"unknown", userid:'anonymous', is_admin:false};
        console.log("userid:", user.userid)

    //if( req.session.passport.user ){
        //user = req.session.passport.user || 'anonymous';
        _vm.add2History(user.userid, req.params.vid, {page:"embed"}, function(data){
            console.log("add2History:completed");
        })
    //}

    if( req.session.passport.user ){
        user = req.session.passport.user;
        //record embed data here.
    }

    _vm.getVideoEmbed( vid, {}, function($video){
        console.log("$video:", $video)
        res.render('video-embed', { title           : $video.title,
                                    thumbnail_url   : $video.thumbnail_url,
                                    description     : $video.description,
                                    vid             : vid,
                                    user            : user,
                                    host            : host,
                                    video_width     : video_width,
                                    video_height    : video_height,
                                    showplaylist    : showplaylist,
                                    autoplay        : autoplay,
                                    useRTMP         : useRTMP,
                                    useRTMPT        : useRTMPT,
                                    embed_url       : embed_url,
                                    video           : $video
                                });
    });


});


router.get('/feed/:vid', function(req, res, next) {
//    console.log("/feed/:vid:", req.params.vid );
    var host            = req.get('host');
    var vid             = req.params.vid;
    var video_width     = req.params.width || "100%";
    var video_height    = req.params.height || "100%";
    var showplaylist    = req.params.showplaylist || false;
    var useRTMP         = req.params.userRTMP || true;
    var useRTMPT        = req.params.userRTMPT || false;
    var embed_url       = "http://" + host + "/embed/" + vid ;
    var autoplay        = req.params.autoplay || false;


    var user = { first_name:"Stranger", last_name:"unknown", userid:null, is_admin:false};

    if( req.session.passport.user ){
        user = req.session.passport.user;
        //record embed data here.
    }

    _vm.getVideoEmbed( vid, {}, function(video){

        res.set('Content-Type', 'text/xml');
        res.render('video-feed-rss', { layout          : false,
                                       title           : video.title,
                                       thumbnail_url   : video.thumbnail_url,
                                       description     : video.description,
                                       video           : video,
                                       vid             : vid,
                                       user            : user,
                                       host            : host,
                                       video_width     : video_width,
                                       video_height    : video_height,
                                       showplaylist    : showplaylist,
                                       autoplay        : autoplay,
                                       useRTMP         : useRTMP,
                                       useRTMPT        : useRTMPT,
                                       embed_url       : embed_url
                                   });

    });

});


router.get('/rss/:vid', function(req, res, next) {
  var user = {name:"Stranger", userid:null, is_admin:false };

  if( req.session.passport.user ){
      user = req.session.passport.user;
  }

  _vm.getVideo( user.userid, 1, 0, user, function(video){
    var host = req.get('host');
    res.render('rss', { title: 'RSS', domain:host, vid:req.params.vid, user:user, video:video });
  });

});


router.get('/profile/:pid', function(req, res, next) {
    var host = req.get('host');

    var user = {name:"Stranger", userid:null, is_admin:false };

    if( req.session.passport.user ){
        user = req.session.passport.user;
    }

    //console.log("/profile():user:", user )

    var user_profile_id = req.params.pid;
    var profile_info = _um.getUserProfileInfo( user_profile_id, function(user_profile_info){
            console.log("user_profile_info:", user_profile_info )
            res.render('profile', { title: 'Lindsay Film | ' + user_profile_info.full_name + ' Profile',
                                    domain:host,
                                    user:user,
                                    user_profile_info: user_profile_info });
      });
});

router.use('/upload/video', ensureLoggedIn('/login'),
            multer({ dest: './uploads/',
            limits: {
              fileSize: 4831838208
                        },
                        rename: function ( fieldname, filename ) {
                            console.log("rename():fieldname:", fieldname, ", filename:",filename);
                            var name = sanitize(filename )//+ Date.now();
                                name = name.split("'").join("")
                                name = name.split(" ").join("_");
                            return name;
                        },
                        onFileUploadStart: function (file, req, res) {
                            console.log( "onFileUploadStart():", file.originalname + ' is starting ...' )
                        },
                        changeDest: function(dest, req, res) {
                            console.log("changeDest():dest:", dest );
                            return dest;
                        },
                        onFileSizeLimit: function (file) {
                            console.log("upload.js:onFileSizeLimit:file:", file);
                            fs.unlink( './' + file.path ) // delete the partially written file
                        },
                        onFilesLimit: function () {
                            console.log('upload.js:onFilesLimit:Crossed file limit!')
                        },
                        onError: function (err, next) {
                            console.log("upload.js:onError:",err)
                            next(err);
                        },
                        onFileUploadComplete: function (file, req, res) {
                            //console.log("upload.js:onFileUploadComplete:cb:",cb);
                            console.log( "upload.js:onFileUploadComplete:userid:", req.session.passport.user.userid );
                            var user = req.session.passport.user;
                            var userid = user.userid;
                            var dir = path.join( __dirname ,  "./../uploads/" + userid )

                                fs.existsSync( dir ) || fs.mkdirSync( dir );
                                _vm.create( userid, file, function(video){
                                    var dest = dir + "/" + video.uid ;//+ "/" + file.name ;

                                        fs.existsSync( dest ) || fs.mkdirSync( dest );
                                    var file_dest = String(dest + "/" + file.name );
                                        mv( file.path, file_dest , function(err) {
                                            //console.log("err moving file to the destiation folder");
                                        });

                                        _vm.updateOrgVideoFile( userid, video.uid, file_dest, {user:user}, function(data){
                                            _qm.add2queue( userid, video.vid, video , function(data){
                                                _vm.getVideo( userid, video.vid, {user:user}, function(data){
                                                    res.json( { status : 'success',
                                      			    						    action : 'upload-file',
                                      			    						    userid : userid,
                                                                                vid    : data.uid,
                                      			    						    data   : data  } );
                                                })
                                            })
                                      })

                                  });

                        }

                }), function(req,res, next){
                    //console.log("post:/video/upload/:status:ok")
                //res.sendStatus(200);
                //next();
            });

//Open Graph Search(OGS) Route
router.get('/oembed_ogs', function(req, res, next) {

      var url = req.query.url;
      var options = { url : url  };
      var _oembed_data;
      var _ogs_data;

      var count = 0;
      var count_total = 2;

      function updateCount( $type, $error, $data )
      {
          //console.log("updateCount():$type:", $type );

          if( $error ){
              console.log("$type:", $type, ", error:",$error)
           }

          if( $type == "ogs" ){
            _ogs_data = $data || $error;
          }

          if( $type == "oembed" ){
            _oembed_data = $data || $error;
          }

          count++

          if( count >= count_total ){

              res.json({ status : 'success',
                         action : 'get-oembed-ogs',
                         url    : url,
                         ogs    : _ogs_data,
                         oembed : _oembed_data
              });
          }
      }


      ogs( options, function($error, $results, $response){
          updateCount("ogs", $error, $results )
      })

      oembed.fetch(url, { maxwidth: 1920 }, function($error, $results) {
          updateCount( "oembed", $error, $results )
      });


});

//OEmbed Route
router.get('/oembed', function(req, res, next) {
    var url = req.query.url;

        oembed.fetch(url, { maxwidth: 1920 }, function(error, result) {
            if( error ){
                console.error("oEmbed:error:",error);
                res.json({ status : 'error',
                           error  : error
                        });
            }else{
                console.log("oEmbed:success:", result);
                res.json({ status : 'success',
                           action : 'oembed',
                           url    : url,
                           oembed : result
                        });
            }
        });

});

//OEmbed Route
router.get('/ogs', function(req, res, next) {

      var url = req.query.url;
      var options = { url : url  };

          ogs( options, function($error, $results, $response){
              if( $error ){
                console.error("osg:error:",$error);
                res.json({ status : 'error',
                           error  : $error
                        });
              }else{
                  console.error("osg:success:",$results);
                  res.json({ status : 'success',
                           action : 'ogs',
                           url    : url,
                           ogs    : $results
                        });
              }
          });

});


//OEmbed Route
router.get('/chat', ensureLoggedIn('/login'), function(req, res, next) {
      var user  = { first_name:"Stranger", last_name:"unknown", userid:null, is_admin:false};

      if( req.session.passport.user ){
          user = req.session.passport.user || { first_name:"anonymous", last_name:"unknown", userid:'anonymous', is_admin:false};
      }

      res.render('chat-bootstrap', { title  : 'Chat.io',
                                     user   : user });

});


module.exports = router;
