/**
 * author:Joshua Lindsay
 * email:j@lindsayfilm.com
 * twitter:@jlindsay
 * https://www.lindsayfilm.com
 * Software can be used for Good or Evil.
 * Some people die rich, some die poor, the result is the same.
 */

 var path                = require("path");
 var express             = require('express');
 var router  	           = express.Router();
 var _um     	           = require("../server/UserManager");
 var passport            = require('passport');
 var LocalStrategy       = require('passport-local').Strategy;
 var ensureLoggedIn      = require('connect-ensure-login').ensureLoggedIn;

 var _um                 = require("../server/UserManager");


// ensureLoggedIn('/login')

//User url(s)

router.get('/profile/:id', function (req, res) {
 	  //console.log( 'profile:id:', req.params.id );v
    //var user_profile_id = req.params.id;
    //var user = _um.getUserProfileInfo( user_profile_id, function(user){console.log("user:", user )} );

  	 res.render( 'profile', { title: 'Profile', id:user_profile_id, user:{} });
});

router.get('/profile/:id/videos', function(req, res, next) {
  //
  res.render('my-videos', { title: 'My Videos' });
});

router.get('/profile/:id/upload', function(req, res, next) {
  	res.render('user-upload', { title: 'Upload', id:req.params.id });
});

router.get('/settings/:id', function(req, res, next) {
  	res.render('settings', { title: 'Settings', id:req.params.id });
});

module.exports = router;
