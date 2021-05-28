/**
 * author:Joshua Lindsay
 * email:j@lindsayfilm.com
 * twitter:@jlindsay
 * https://www.lindsayfilm.com
 * Software can be used for Good or Evil.
 * Some people die rich, some die poor, the result is the same.
 */


var express = require('express');
var router  = express.Router();

var passport             = require('passport');
var LocalStrategy        = require('passport-local').Strategy;
var ensureLoggedIn       = require('connect-ensure-login').ensureLoggedIn;

router.get('/', function(req, res, next) {
 	res.send("event recorded!", 200);
});


module.exports = router;
