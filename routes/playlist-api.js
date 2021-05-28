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

var passport             = require('passport');
var LocalStrategy        = require('passport-local').Strategy;
var ensureLoggedIn       = require('connect-ensure-login').ensureLoggedIn;

var _vm     = require("../server/VideoManager");
var _um     = require("../server/UserManager");
var _sm     = require("../server/SearchManager");

var _plm  = require("../server/PlaylistManager");

//router.get( '/', ensureLoggedIn('/login'), function( req, res, next ){
router.get( '/', function( req, res, next )
{
        var _vid                    = req.query.vid ? trim( req.query.vid ) : null;
        var _pid                    = req.query.pid ? trim( req.query.pid ) : null;
        var _pvid                   = req.query.pvid ? trim( req.query.pvid ) : null;

        var _action                 = req.query.action ? trim( req.query.action ) : null;
        var _userid                 = req.query.userid ? trim( req.query.userid ) : null;

        var _title                  = req.query.title ? trim( req.query.title ) : null;
        var _description            = req.query.description ? trim( req.query.description ) : null;
        var _thumbnail_url          = req.query.thumbnail_url ? trim( req.query.thumbnail_url ) : null;
        var _catagory               = req.query.catagory ? trim( req.query.catagory ) : null;
        var _keywords               = req.query.keywords ? trim( req.query.keywords ) : null;


        var _q                      = req.query.q ? trim( req.query.q ) : null;
        var _limit                  = req.query.limit ? trim( req.query.limit ) : null;
        var _offset                 = req.query.offset ? trim( req.query.offset ) : null;
        var _sort_by                = req.query.sort_by ? trim( req.query.sort_by ) : "DESC";
        var _order_by               = req.query.order_by ? trim( req.query.order_by ) : "date_created";

        var _uid                    = req.query.uid? trim( req.query.uid ) : null;

        var _include_videos			= req.query.include_videos? trim( req.query.include_videos ) : null;
            _include_videos			= Boolean( _include_videos );

//        var _vid_2_pid              = req.query.vid_2_pid? trim( req.query.vid_2_pid ): null;
        var _favorit                = req.query.favorit? trim( req.query.favorit ) : null;

        var _metadata               = req.query.metadata? req.query.metadata : null;

        if( !_metadata ){
          _metadata = { title         : _title,
                        description   : _description,
                        keywords      : _keywords,
                        thumbnail_url : _thumbnail_url,
                        catagory      : _catagory }
        }


        var _results = { status: "error",
                     	 action: _action };

        var user = _um.getAnonymousUser();

         if( req.session.passport.user )
         {
         	  user = req.session.passport.user;
         }

        var config = { user : user };

        switch( String( _action ) )
        {
            case "get-user-playlists":
                //example: http://localhost:3000/playlist-api?action=get-user-playlists&userid=488635b52c0ae707&include_videos=1;
                _plm.getUserPlaylists( _userid, _include_videos, _limit, _offset, config, function(data){
                    res.json( { "status"   : "success",
                                 "userid"  : _userid,
                                 "action"  : _action,
                                "include_videos": _include_videos,
                                "limit"   : _limit,
                                "offset"  : _offset,
                                 "data"    : data
                    });
                });
                break;

            case "get-playlist":
                //example: http://localhost:3000/playlist-api?action=get-playlist&pid=K2VlO2&userid=488635b52c0ae707
                _plm.getPlaylist( _userid, _pid, _limit, _offset, config, function(data){
                    res.json( { "status"    : "success",
                                 "userid"   : _userid,
                                 "action"   : _action,
                                 "pid"      : _pid,
                                 "limit"    : _limit,
                                 "offset"   : _offset,
                                 "data"     : data
                    });
                });
                break;

            case "delete-playlist-video":
                //example: http://localhost:3000/playlist-api?action=delete-playlist-video&pid=K2VlO2&userid=488635b52c0ae707
                _plm.deletePlaylistVideo( _userid, _pvid, config, function(data){
                    res.json( { "status"   : "success",
                                "userid"   : _userid,
                                "action"   : _action,
                                "pvid"     : _pvid
                    });
                });
                break;
//            case "add-videos-2-playlist":
            case "add-video-2-playlist":
                //example: http://localhost:3000/playlist-api?action=add-video-2-playlist&pid=K2VlO2&userid=488635b52c0ae707&vid=AimmB3
                _plm.addVideo2Playlist( _userid, _vid, _pid, config, function(data){
                    //console.log("_vm.addVideo2Playlist:success");
                    res.json( { "status"   : "success",
                                "userid"   : _userid,
                                "action"   : _action,
                                "pid"      : _pid,
                                "vid"      : _vid,
                                "data"     : data
                    });
                });

                break;
            case "create-playlist":
                //example: http://localhost:3000/playlist-api?action=create-playlist&pid=K2VlO2&userid=488635b52c0ae707
                _plm.createPlaylist(_userid, config, function(data){
                    res.json( { "status"   : "success",
                                "userid"   : _userid,
                                "action"   : _action,
                                "data"     : data
                    });
                });
                break;
            case "delete-playlist":
                //example: http://localhost:3000/playlist-api?action=delete-playlist&pid=K2VlO2&userid=488635b52c0ae707
                _plm.deletePlaylist(_userid, _pid, config, function(data){
                    res.json( { "status"   : "success",
                                "userid"   : _userid,
                                "pid"      : _pid,
                                "action"   : _action
                    });
                });
                break;
            case "update-playlist-metadata":
                /**
                * example: http://localhost:3000/playlist-api?action=update-playlist-metadata&pid=K2VlO2&userid=488635b52c0ae707&metadata={title:'xyz',description:'xyz',keywords:'xyz',catagory:'xyz',thumbnail_url:'http://somedomain.com/path/to/thumbnail.jpg'}
                * OR
                * example: http://localhost:3000/playlist-api?action=update-playlist-metadata&pid=K2VlO2&userid=488635b52c0ae707&title='xyz'&description='xyz',keywords:'xyz'&catagory:'xyz'&thumbnail_url:'http://somedomain.com/path/to/thumbnail.jpg'}
                */
                _plm.updatePlaylistMetadata( _userid, _pid, _metadata, config, function(data){
                    res.json( { "status"        : "success",
                                "userid"        : _userid,
                                "action"        : _action,
                                "pid"           : _pid,
                                "metadata"      : _metadata,
                                "data"          : data
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
