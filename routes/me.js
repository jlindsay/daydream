/**
 * author:Joshua Lindsay
 * email:j@lindsayfilm.com
 * twitter:@jlindsay
 * https://www.lindsayfilm.com
 * Software can be used for Good or Evil.
 * Some people die rich, some die poor, the result is the same.
 */


var express = require('express');
var router = express.Router();

var passport             = require('passport');
var LocalStrategy        = require('passport-local').Strategy;
var ensureLoggedIn       = require('connect-ensure-login').ensureLoggedIn;
// ensureLoggedIn('/login')



/* GET users listing. */
router.get('/', function(req, res, next) {
	res.send('respond with a resource');
});

//User url(s)
router.get('/:id/videos', function(req, res, next) {
 	res.render('my-videos', { title: 'My Videos', id:req.params.id });
});

router.get('/:id/settings', function(req, res, next) {
 	res.render('settings', { title: 'Settings', id:req.params.id });
});

router.get('/:id', function (req, res) {
  	console.log( 'profile:id:', req.params.id );
  	res.render( 'profile', { title: 'Profile', id:req.params.id });
});
/*
router.get('/:id/upload', function(req, res, next) {
  	res.render('upload', { title: 'Upload', id:req.params.id });
});
*/
module.exports = router;
