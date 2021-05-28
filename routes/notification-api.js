/**
 * author:Joshua Lindsay
 * email:j@lindsayfilm.com
 * twitter:@jlindsay
 * https://www.lindsayfilm.com
 * Software can be used for Good or Evil.
 * Some people die rich, some die poor, the result is the same.
 */

var express             = require('express');
var trim                = require('trim');
var path                = require("path");
var express             = require('express');
var router  	          = express.Router();
var _um     	          = require("../server/UserManager");
var passport            = require('passport');
var LocalStrategy       = require('passport-local').Strategy;
var ensureLoggedIn      = require('connect-ensure-login').ensureLoggedIn;
// ensureLoggedIn('/login')

var _vm                 = require("../server/VideoManager");
var _um                 = require("../server/UserManager");
var _sm                 = require("../server/SearchManager");
var _nfm                = require("../server/NewsFeedManager");
var _notes              = require("../server/NotificationManager");


router.get( '/', function( req, res, next ){

        var _q                        = req.query.q ? trim( req.query.q ) : null;

        var _vid                      = req.query.vid ? trim( req.query.vid ) : null;
        var _sid             	        = req.query.sid ? trim( req.query.sid ) : null;
        var _pid                      = req.query.pid ? trim( req.query.pid ) : null;
        var _nid                      = req.query.nid ? trim( req.query.nid ) : null;
        var _userid                   = req.query.userid ? trim( req.query.userid ) : null;
        var _comment_id               = req.query.comment_id ? trim( req.query.comment_id ) : null;

        var _action                   = req.query.action ? trim( req.query.action ) : null;

        var _limit                    = req.query.limit ? trim( req.query.limit ) : null;
        var _offset                   = req.query.offset ? trim( req.query.offset ) : null;

        var _sort_by                  = req.query.sort_by ? trim( req.query.sort_by ) : "DESC";
        var _order_by                 = req.query.order_by ? trim( req.query.order_by ) : "date_created";

        var _uid                       = req.query.uid ? trim( req.query.uid ) : null;

        var _title                     = req.query.title ? trim( req.query.title ) : null;
        var _description               = req.query.description ? trim( req.query.description ) : null;
        var _type                       = req.query.type ? trim( req.query.type ) : null;
        var _note                     = req.query.note ? trim( req.query.note ) : null;

        var _results = { status: "error",
                         action: _action };


        var user = _um.getAnonymousUser();

        if( req.session.passport.user )
        {
            user = req.session.passport.user;
        }

        var config = { user : user,
                       order_by           : _order_by,
                       sort_by            : _sort_by
                    };

        switch( String( _action ) )
        {

            case "get-notes":
            case "get-user-notes":
                _notes.getUserNotes( _userid, _limit, _offset, config, function(data){
                          res.json( { "status"    : "success",
                                      "userid"    : _userid,
                                      "action"    : _action,
                                      "data"      : data
                          });
                });

                break;

            case "create-note":
                console.log("notification-api::create-note::metadata:", metadata );
                _notes.createNote( _userid, _note, _metadata, function($data){
                        //console.log("_nfm.createnote:success:");
                        var nid = $data.nid;
                        _notes.getNote( _userid, $data.nid, {}, function(note){
                              //console.log("_nfm.getNote():success:note:", $note );
                              res.json( { "status"             : "success",
                                          "userid"             : _userid,
                                          "action"             : _action,
                                          "nid"                : nid,
                                          "data"               : note
                              });

                        })

                });
                break;

            case "delete-note":
                console.log("notification-api::delete-note::" );
                //example: http://localhost:3000/notification-api?action=delete-note&userid=JDL007&nid=AimZ51
                _notes.deleteNote( _userid, _nid, config, function($data){
                  //console.log("_nfm.deleteNote:success::data:", $data);
                                res.json( { "status"    : "success",
                                            "userid"    : _userid,
                                            "nid"       : _nid,
                                            "action"    : _action,
                                            "data"      : $data
                                          });
                });
            break;

            case "save-note":
                //example: http://localhost:3000/notification-api?action=save-note-metadata&userid=JDL007&nid=AimZ51
                console.log("save-note:");
                _notes.saveNote( _userid, _nid, config, function($data){
                    res.json( { "status" : "success",
                                "action" : _action,
                                "userid" : _userid,
                                "nid"    : _nid,
                                "data"   : $data
                        });
                    });
                break;

            case "get-note":
                console.log("notification-api::get-note:nid:", _nid);
                _notes.getNote( _userid, _nid, config, function( $data ){
                          console.log("$data:", $data)
                          res.json( { "status"    : "success",
                                      "userid"    : _userid,
                                      "nid"       : _nid,
                                      "action"    : _action,
                                      "data"      : $data
                          });
                });
                break;

              case "get-new-notes":
                  //example: http://localhost:3000/notification-api?action=get-new-notes&userid=JDL007&offset=0&limit=50
                  _notes.getNewNotes( _userid, _limit, _offset , config, function(data){
                            res.json( { "status"             : "success",
                                        "userid"             : _userid,
                                        "action"             : _action,
                                        "limit"              : _limit,
                                        "offset"             : _offset,
                                        "data"               : data
                            });
                  });
                  break;

              case "mark-note-as-read":
                  //example: http://localhost:3000/notification-api?action=get-new-notes&userid=JDL007&offset=0&limit=50
                  _notes.markNoteAsRead( _userid, _nid, config, function($data){
                            res.json( { "status"             : "success",
                                        "userid"             : _userid,
                                        "nid"                : _nid,
                                        "data"               : $data
                            });
                  });
                  break;

              case "mark-note-as-unread":
                  //example: http://localhost:3000/notification-api?action=get-new-notes&userid=JDL007&offset=0&limit=50
                  _notes.markNoteAsUnread( _userid, _nid, config, function($data){
                            res.json( { "status"             : "success",
                                        "userid"             : _userid,
                                        "nid"                : _nid,
                                        "data"               : $data
                            });
                  });
                  break;

                  default:
                      _results.status = "error";
                      _results.error = "unknown-action";
                      res.json( _results );
                      break;

        }

});


module.exports = router;
