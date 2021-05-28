/**
 * author:Joshua Lindsay
 * email:j@lindsayfilm.com
 * twitter:@jlindsay
 * https://www.lindsayfilm.com
 * Software can be used for Good or Evil.
 * Some people die rich, some die poor, the result is the same.
 */

var config        = require('./oauth.js');
var auth          = require('./authentication.js');

var path = require("path");
var express = require('express');
var router = express.Router();

var passport             = require('passport');
var LocalStrategy        = require('passport-local').Strategy;
var ensureLoggedIn       = require('connect-ensure-login').ensureLoggedIn;


exports.ping = function(req, res){
    res.send("pong!", 200);
};

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) { return next(); }
    res.redirect('/');
}
router.get('/account', ensureAuthenticated, function(req, res){
    User.findById(req.session.passport.user, function(err, user) {
        if(err) {
            console.log(err);
        } else {
            res.render('account', { user: user});
        }
    })
})
router.get('/logout', function(req, res){
    req.logout();
    res.redirect('/');
});

router.get('/facebook',
    passport.authenticate('facebook'),
    function(req, res){
});
router.get('/facebook/callback',
    passport.authenticate('facebook', { failureRedirect: '/' }),
    function(req, res) {
        res.redirect('/account');
});
router.get('/twitter',
    passport.authenticate('twitter'),
    function(req, res){
});
router.get('/twitter/callback',
    passport.authenticate('twitter', { failureRedirect: '/' }),
    function(req, res) {
        res.redirect('/account');
});
router.get('/github',
    passport.authenticate('github'),
    function(req, res){
});
router.get('/github/callback',
    passport.authenticate('github', { failureRedirect: '/' }),
    function(req, res) {
        res.redirect('/account');
});
router.get('/google',
    passport.authenticate('google'),
    function(req, res){
});
router.get('/google/callback',
    passport.authenticate('google', { failureRedirect: '/' }),
    function(req, res) {
        res.redirect('/account');
 });


module.exports = router;
