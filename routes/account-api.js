/**
 * author:Joshua Lindsay
 * email:j@lindsayfilm.com
 * twitter:@jlindsay
 * https://www.lindsayfilm.com
 * Software can be used for Good or Evil.
 * Some people die rich, some die poor, the result is the same.
 */



var express = require('express');
var trim    = require('trim');
var router  = express.Router();

var passport            = require('passport');
var LocalStrategy       = require('passport-local').Strategy;
var ensureLoggedIn      = require('connect-ensure-login').ensureLoggedIn;



var _vm     = require("../server/VideoManager");
var _um     = require("../server/UserManager");
var _sm     = require("../server/SearchManager");
//var _mm   = require("../server/MessageManager");
//var _am   = require("../server/AccountManager");
//var _plm  = require("../server/PlaylistManager");
//var _actm = require("../server/AccountManager");

router.get( '/', function( req, res, next ){
var _vid                    = req.query.vid ? trim( req.query.vid ) : null;
        var _action                 = req.query.action ? trim( req.query.action ) : null;
        var _userid                 = req.query.userid ? trim( req.query.userid ) : null;
        var _keywords               = req.query.keywords ? trim( req.query.keywords ) : null;
        var _q                      = req.query.q ? trim( req.query.q ) : null;
        var _limit                  = req.query.limit ? trim( req.query.limit ) : null;
        var _offset                 = req.query.offset ? trim( req.query.offset ) : null;
        var _sort_by                = req.query.sort_by ? trim( req.query.sort_by ) : "DESC";
        var _order_by               = req.query.order_by ? trim( req.query.order_by ) : "date_created";

        var _uid                    = req.query.uid? trim( req.query.uid ) : null;


        switch( String( _action ) )
        {
/*
        case "get-user-account-info":
            _actm.getUserByUID( _userid, function(data){
                res.json( { "status" : "success",
                                 "userid" : _userid,
                                 "action" : _action,
                                 "data" : _actm.getUserInfo()
                    });
                });
            break;

        case "set-user-email":
            $email == null ){
                return;
            }
            _actm.setUserEmail(_userid, $email, function(data){
                res.json( { "status" : "success",
                                 "userid" : _userid,
                                 "email" : $email,
                                 "action" : _action,
                                 "data" : _actm.getUserInfo()
                    });
                });
            break;

        case "set-user-name":
            if( _first_name ==  null || _last_name == null ){
                return;
            }
            _actm.setUserName(_userid, _first_name, _last_name, function(data){
                res.json( { "status" : "success",
                                 "userid" : _userid,
                                 "first_name" : _first_name,
                                 "last_name" : _last_name,
                                 "action" : _action,
                                 "data" : _actm.getUserInfo()
                    });
                });
            break;

        case "set-user-about-me":
            if( !_user_about_me){
                return;
            }
            _actm.setUserAboutMe(_userid, _user_about_me, function(data){
                res.json( { "status" : "success",
                                 "userid" : _userid,
                                 "user_about_me" : _user_about_me,
                                 "action" : _action,
                                 "data" : _actm.getUserInfo()
                    });
                });
            break;

        case "set-user-blog-url":
            if( !_user_blog_url ){
                return;
            }
            _actm.setUserBlogURL(_userid, _user_blog_url, function(data){
                res.json( { "status" : "success",
                                 "userid" : _userid,
                                 "user_blog_url" : _user_blog_url,
                                 "action" : _action,
                                 "data" : _actm.getUserInfo()
                    });
                });
            break;
*/




            default:
                _results.status = "error";
                _results.error = "unknown-action";
                res.json( _results );
                break;

        }

});


module.exports = router;
