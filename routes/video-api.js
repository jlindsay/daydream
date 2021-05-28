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
var router              = express.Router();
var passport            = require('passport');
var LocalStrategy       = require('passport-local').Strategy;
var ensureLoggedIn      = require('connect-ensure-login').ensureLoggedIn;

var _vm                 = require("../server/VideoManager");
var _um                 = require("../server/UserManager");
var _sm                 = require("../server/SearchManager");
var _plm                = require("../server/PlaylistManager");
//var _nfm                = require("../server/NewsFeedManager");


//router.get( '/', ensureLoggedIn('/login'), function( req, res, next ){
router.get( '/', function( req, res, next ){

        var _ipaddress              = req.connection.remoteAddress;

        var _uid                    = req.query.uid ? trim( req.query.uid ) : null;
        var _vid                    = req.query.vid ? trim( req.query.vid ) : null;
        var _pid                    = req.query.pid ? trim( req.query.pid ) : null;
        var _tvid                   = req.query.tvid ? trim( req.query.tvid ) : null;
        var _mvid                   = req.query.mvid ? trim( req.query.mvid ) : null;
        var _avid                   = req.query.avid ? trim( req.query.avid ) : null;

        var _sid                    = req.query.sid ? trim( req.query.sid ) : null;
        var _pid                    = req.query.pid ? trim( req.query.pid ) : null;
        var _pvid                   = req.query.pvid ? trim( req.query.pvid ) : null;
        var _action                 = req.query.action ? trim( req.query.action ) : null;

        var _userid                 = req.query.userid ? trim( req.query.userid ) : null;
        var _profile_id             = req.query.profile_id ? trim( req.query.profile_id ) : null;
        var _comment                = req.query.comment ? trim( req.query.comment ) : null;
        var _comment_uid            = req.query.comment_uid ? trim( req.query.comment_uid ) : null;
        var _setid                  = req.query.setid ? trim( req.query.setid ) : null;

        var _title                  = req.query.title ? trim( req.query.title ) : null;
        var _description            = req.query.description ? trim( req.query.description ) : null;
        var _thumbnail_url          = req.query.thumbnail_url ? trim( req.query.thumbnail_url ) : null;
        var _catagory               = req.query.catagory ? trim( req.query.catagory ) : null;
        var _keywords               = req.query.keywords ? trim( req.query.keywords ) : null;

        var _url                    = req.query.url ? trim( req.query.url ) : null;
        var _liked                  = req.query.liked ? trim( req.query.liked ) : null;
        var _disliked               = req.query.disliked ? trim( req.query.disliked ) : null;
        var _q                      = req.query.q ? trim( req.query.q ) : null;

        var _comment_id             = req.query.comment_id ? trim( req.query.comment_id ) : null;

        var _limit                  = req.query.limit ? trim( req.query.limit ) : null;
        var _comments_limit         = req.query.comments_limit ? trim( req.query._comments_limit ) : null;
        var _likes_limit            = req.query.likes_limit ? trim( req.query._likes_limit ) : null;

        var _offset                 = req.query.offset ? trim( req.query.offset ) : null;
        var _comments_offset        = req.query.comments_offset ? trim( req.query.comments_offset ) : null;
        var _likes_offset           = req.query.likes_offset ? trim( req.query.likes_offset ) : null;

        var _sort_by                = req.query.sort_by ? trim( req.query.sort_by ) : "DESC";
//        var _comments_sorts_by    = req.query.comments_sort_by ? trim( req.query.comments_sort_by ) : "DESC";
//        var _likes_sorts_by       = req.query.likes_sort_by ? trim( req.query.likes_sort_by ) : "DESC";

        var _order_by               = req.query.order_by ? trim( req.query.order_by ) : "date_created";
//        var _comments_order_by    = req.query.comments_order_by ? trim( req.query.comments_order_by ) : "date_created";
//        var _likes_order_by       = req.query.likes_order_by ? trim( req.query.likes_order_by ) : "date_created";

        var _to_userid              = req.query.to_userid? trim( req.query.to_userid ): null;
        var _from_userid            = req.query.from_userid? trim( req.query.from_userid ) : null;


        var _favorit                = req.query.favorit? trim( req.query.favorit ) : null;

        var _rank                   = req.query.rank? trim( req.query.rank ): null;
        var _metadata               = req.query.metadata? req.query.metadata : null;
        var _is_public               = req.query.is_public? req.query.is_public : null;

        if( !_metadata ){
            _metadata = { title         : _title,
                          description   : _description,
                          keywords      : _keywords,
                          thumbnail_url : _thumbnail_url,
                          catagory      : _catagory,
                          is_public     : _is_public }

        }

        var _results = { status: "error",
                         action: _action };

        var _search_resutls = {};

        var user = _um.getAnonymousUser();

        if( req.session.passport.user )
        {
            user = req.session.passport.user;
        }

        var config = { user : user,

                       order_by           : _order_by,
                       sort_by            : _sort_by,

                       comments_limit     : _comments_limit,
                       comments_offset    : _comments_offset,
//                       comments_order_by  : _comments_order_by,
//                       comments_sort_by   : _comments_order_by,

                       likes_limit        : _likes_limit,
                       likes_offset       : _likes_offset,
//                       likes_order_by     : _likes_order_by,
//                       likes_sort_by      : _likes_order_by,
                    };

        switch( String( _action ) )
        {

            case "get-tv-shows":
                  //example: http://localhost:3000/video-api?action=get-tv-shows&userid=JDL007
                  _vm.getTVShows( _userid, _limit, _offset, config, function(data){
                      res.json( { "status"          : "success",
                                  "userid"          : _userid,
                                  "action"          : _action,
                                  "limit"           : _limit,
                                  "offset"          : _offset,
                                  "comments_limit"  : _comments_limit,
                                  "comments_offset" : _comments_offset,
                                  "likes_limit"     : _likes_limit,
                                  "likes_offset"    : _likes_offset,
                                  "data"            : data
                              });
                  });
                break;

            case "get-movies":
                  //example: http://localhost:3000/video-api?action=get-movies&userid=JDL007&tvid=AimZ51
                  _vm.getMovies( _userid, _limit, _offset, config, function(data){
                      res.json( { "status"             : "success",
                                  "userid"             : _userid,
                                  "action"             : _action,
                                  "limit"              : _limit,
                                  "offset"             : _offset,
                                  "comments_limit"     : _comments_limit,
                                  "comments_offset"    : _comments_offset,
                                  "likes_limit"        : _likes_limit,
                                  "likes_offset"       : _likes_offset,
                                  "data"               : data
                              });
                  });
                break;

            case "get-audiobooks":
                  //example: http://localhost:3000/video-api?action=get-audiobooks&userid=JDL007
                  _vm.getAudiobooks( _userid, _limit, _offset, config, function(data){
                      res.json( { "status"             : "success",
                                  "userid"             : _userid,
                                  "action"             : _action,
                                  "comments_limit"     : _comments_limit,
                                  "comments_offset"    : _comments_offset,
                                  "likes_limit"        : _likes_limit,
                                  "likes_offset"       : _likes_offset,
                                  "data"               : data
                              });
                  });
                break;

            case "get-video":
                //example: http://localhost:3000/video-api?action=get-video&userid=JDL007&vid=AimZ51
                _vm.getVideo( _userid, _vid, config, function(data){
                    res.json( { "status"             : "success",
                                "userid"             : _userid,
                                "vid"                : _vid,
                                "action"             : _action,
                                "comments_limit"     : _comments_limit,
                                "comments_offset"    : _comments_offset,
                                "likes_limit"        : _likes_limit,
                                "likes_offset"       : _likes_offset,
                                "data"               : data
                            });
                });
              break;

            case "get-video-2-share":
                //example: http://localhost:3000/video-api?action=get-video-2-share&userid=JDL007&sid=AimZ51
              _vm.getVideo2Share( _userid, _sid, config, function(data){
                  res.json( { "status"    : "success",
                              "userid"    : _userid,
                              "sid"       : _sid,
                              "action"    : _action,
                              "data"      : data
                  });
              });
              break;

            case "watch-later":
                //example: http://localhost:3000/video-api?action=watch-later&userid=JDL007&vid=AimZ51
                _vm.add2WatchLater( _userid, _vid, config, function(data){
                    _vm.getUserWatchLater( _userid, _limit, _offset, config, function(data){
                        res.json( { "status" : "success",
                                     "userid" : _userid,
                                     "vid"    : _vid,
                                     "action" : _action,
                                     "data"   : data
                        });
                    });
                });

                break;

            case "get-user-watch-later":
                //example: http://localhost:3000/video-api?action=get-user-watch-later&userid=JDL007
                _vm.getUserWatchLater( _userid, _limit , _offset, config, function(data){
                    res.json( { "status"              : "success",
                                 "userid"             : _userid,
                                 "action"             : _action,
                                 "limit"              : _limit,
                                 "offset"             : _offset,
                                 "comments_limit"     : _comments_limit,
                                 "comments_offset"    : _comments_offset,
                                 "likes_limit"        : _likes_limit,
                                 "likes_offset"       : _likes_offset,
                                 "data"               : data
                    });
                });

                break;

            case "get-user-watch-history":
                //example: http://localhost:3000/video-api?action=get-user-watch-history&userid=JDL007
                _vm.getUserWatchHistory( _userid , _limit , _offset, config, function(data){
                    res.json( { "status"            : "success",
                                 "userid"           : _userid,
                                 "action"           : _action,
                                 "limit"            : _limit,
                                 "offset"           : _offset,
                                 "comments_limit"   : _comments_limit,
                                 "comments_offset"  : _comments_offset,
                                 "likes_limit"      : _likes_limit,
                                 "likes_offset"     : _likes_offset,
                                 "data"             : data
                        });
                    });
                break;

            case "search-videos":
                //example: http://localhost:3000/video-api?action=search-videos&q=keyword&userid=JDL007&offset=0&limit=50
                _vm.searchVideos( _userid, _keywords , _catagory, _limit , _offset, config, function(data){
                    res.json( { "status"              : "success",
                                 "userid"             : _userid,
                                 "action"             : _action,
                                 "keywords"           : _keywords,
                                 "catagory"           : _catagory,
                                 "limit"              : _limit,
                                 "offset"             : _offset,
                                 "comments_limit"     : _comments_limit,
                                 "comments_offset"    : _comments_offset,
                                 "likes_limit"        : _likes_limit,
                                 "likes_offset"       : _likes_offset,
                                 "data"               : data
                    });
                });
                break;

            case "add-video-2-favorits":
                //example: http://localhost:3000/video-api?action=add-video-2-favorits&vid=AimbDb&userid=JDL007
                _vm.add2favorits( _userid, _vid, config, function(data){
                    res.json( { "status" : "success",
                                 "action" : _action,
                                 "userid" : _userid,
                                 "vid"    : _vid,
                                 "data" :  data
                        });
                    });
                break;

              case "video-disliked":
                    //example: http://localhost:3000/video-api?action=video-disliked&vid=AimbDb&userid=JDL007&liked=1
                    _vm.videoDisliked( _userid, _vid, _disliked, config, function(data){
                        _vm.getVideoDislikes( _userid, _vid, _limit, _offset, config, function(data){

                            res.json( { "status"            : "success",
                                         "action"           : _action,
                                         "userid"           : _userid,
                                         "vid"              : _vid,
                                         "disliked"         : _disliked,
                                         "limit"            : _limit,
                                         "offset"           : _offset,
                                         "total_likes"      :  "na",
                                         "user_liked_video" :  "na",
                                         "data"             :  data
                            });
                        });
                    });
                    break;
            case "video-liked":
                //example: http://localhost:3000/video-api?action=video-liked&vid=AimbDb&userid=JDL007&liked=1
                _vm.videoLiked( _userid, _vid, _liked, config, function(data){
                    _vm.getVideoLikes( _userid, _vid, _limit, _offset, config, function(data){
                        res.json( { "status"            : "success",
                                     "action"           : _action,
                                     "userid"           : _userid,
                                     "vid"              : _vid,
                                     "liked"            : _liked,
                                     "limit"            : _limit,
                                     "offset"           : _offset,
                                     "total_likes"      :  "na",
                                     "user_liked_video" :  "na",
                                     "data"             :  data
                        });
                    });
                });
                break;

            case "video-total-likes":
                _vm.getVideoTotalLikes( _vid, function(total){
                    res.json( { "status"         : "success",
                                 "action"        : _action,
                                 "userid"        : _userid,
                                 "vid"           : _vid,
                                 "total_likes"   :  total
                    });
                });
                break;

            case "video-total-comments":
                    _vm.getVideoTotalComments( _vid, function(total){
                      res.json( { "status"            : "success",
                                   "action"           : _action,
                                   "userid"           : _userid,
                                   "vid"              : _vid,
                                   "total_comments"   :  total
                      });
                  });
                  break;

            case "mark-comment-as-read":
                _vm.markCommentAsRead( _userid, _comment_id, config, function($data){
                          res.json( { "status"     : "success",
                                      "userid"     : _userid,
                                      "action"     : _action,
                                      "comment_id" : _comment_id,
                                      "data"       : $data
                          });
                });

                break;

            case "mark-comment-as-unread":
                _vm.markCommentAsUnread( _userid, _comment_id, config, function($data){
                          res.json( { "status"     : "success",
                                      "userid"     : _userid,
                                      "action"     : _action,
                                      "comment_id" : _comment_id,
                                      "data"       : $data
                          });
                });

                break;

            case "video-comment-liked":
                  _vm.videoCommentLiked( _userid, _vid, _comment_id, _liked, config, function(data){

                      _vm.getVideoCommentLikes( _userid, _vid, _comment_id, _limit, _offset, config, function(data){

                          res.json( { "status"      : "success",
                                       "action"     : _action,
                                       "userid"     : _userid,
                                       "vid"        : _vid,
                                       "comment_id" : _comment_id,
                                       "liked"      : _liked,
                                       "limit"      : _limit,
                                       "offset"     : _offset,
                                       "data" :  data
                          });
                      });

                  });
                  break;

                  case "video-comment-disliked":
                        _vm.videoCommentDisliked( _userid, _vid, _comment_id, _disliked, config, function(data){

                            _vm.getVideoCommentDislikes( _userid, _vid, _comment_id, _limit, _offset, config, function(data){
                                res.json( { "status"           : "success",
                                             "action"          : _action,
                                             "userid"          : _userid,
                                             "vid"             : _vid,
                                             "comment_id"      : _comment_id,
                                             "disliked"        : _disliked,
                                             "limit"           : _limit,
                                             "offset"          : _offset,
                                             "data"           :  data
                                });
                            });

                        });
                        break;

                  case "video-comment-reply":

                        _vm.postReply2VideoComment( _userid, _vid, _comment, config, function(data){
                            console.log( "video-comment-reply:_vm.postReply2VideoComment():success:data:", data );
/*
                            _vm.getVideoCommentDislikes( _userid, _vid, _limit, _offset, config, function(data){
                                //console.log("data:", data);
                                res.json( { "status"   : "success",
                                             "action"   : _action,
                                             "userid"   : _userid,
                                             "vid"      : _vid,
                                             "liked"    : _disliked,
                                             "limit"    : _limit,
                                             "offset"   : _offset,
                                             "total_likes"      :  "na",
                                             "user_liked_video" :  "na",
                                             //"total_likes"      :  _vm.total_likes,
                                             //"user_liked_video" :  _vm.user_liked_video,
                                             "data" :  data
                                });
                            });
*/
                        });

                        break;

            case "add2History":
              //example: http://localhost:3000/video-api?action=add2History&vid=AimbDb&userid=JDL007
              _vm.add2History( _userid, _vid , config, function(data){
                  res.json( { "status"    : "success",
                              "userid"    : _userid,
                              "action"    : _action,
                              "vid"       : _vid,
                              "data"      : data
                  });
              });
              break;

            case "get-videos":
            case "get-new-videos":
                //example: http://localhost:3000/video-api?action=get-new-videos&userid=JDL007&offset=0&limit=50
                _sm.getNewVideos( _userid, _limit, _offset , config, function(data){
                    res.json( { "status"             : "success",
                                "userid"             : _userid,
                                "action"             : _action,
                                "limit"              : _limit,
                                "offset"             : _offset,
                                "comments_limit"     : _comments_limit,
                                "comments_offset"    : _comments_offset,
                                "likes_limit"        : _likes_limit,
                                "likes_offset"       : _likes_offset,
                                "data"               : data
                    });
                });
                break;

            case "get-video-likes":
                //example: http://localhost:3000/video-api?action=get-video-likes&userid=JDL007&vid=AimbDb
                _sm.getVideoLikes( _userid, _vid, _limit, _offset, config, function(data){
                    res.json( { "status"    : "success",
                                 "vid"      : _vid,
                                 "userid"   : _userid,
                                 "action"   : _action,
                                 "limit"    : _limit,
                                 "offset"   : _offset,
                                 "data"     : data
                    });
                });
                break;

            case "get-video-comments":
                //example: http://localhost:3000/video-api?action=get-video-comments&userid=JDL007&vid=AimbDb
                _sm.getVideoComments( _userid, _vid , _limit, _offset, config, function(data){
                    res.json( { "status"    : "success",
                                 "vid"      : _vid,
                                 "userid"   : _userid,
                                 "action"   : _action,
                                 "limit"    : _limit,
                                 "offset"   : _offset,
                                 "data"     : data
                    });
                });
                break;

            case "get-video-comment":
                //example: http://localhost:3000/post-api?action=get-post-comment&userid=JDL007&comment_id=AimbDb
                _vm.getComment( _userid, _comment_id , config, function(data){
                        res.json( { "status"       : "success",
                                    "comment_id"   : _comment_id,
                                    "userid"       : _userid,
                                    "action"       : _action,
                                    "data"         : data
                        });
                });
                break;

            case "get-user-favorit-videos":
                //example: http://localhost:3000/video-api?action=get-user-favorit-videos&userid=JDL007&vid=AimbDb
                _vm.getUserFavoritVideos( _userid , _limit, _offset, config, function(data){
                    res.json( { "status"    : "success",
                                "userid"    : _userid,
                                "action"    : _action,
                                "limit"     : _limit,
                                "offset"    : _offset,
                                "data"      : data
                    });
                });
                break;

                case "get-related-Audiobooks":

                  _sm.getRelatedAudiobooks( _userid, _vid, _limit, _offset, config, function(data){
                      res.json( { "status"             : "success",
                                  "vid"                : _vid,
                                  "action"             : _action,
                                  "limit"              : _limit,
                                  "offset"             : _offset,
                                  "comments_limit"     : _comments_limit,
                                  "comments_offset"    : _comments_offset,
                                  "likes_limit"        : _likes_limit,
                                  "likes_offset"       : _likes_offset,
                                  "data"               : data
                        });
                    });

                  break;

                case "get-related-tv":
                  _sm.getRelatedTv( _userid, _vid, _limit, _offset, config, function(data){
                    res.json( { "status"       : "success",
                          "vid"                : _vid,
                          "action"             : _action,
                          "limit"              : _limit,
                          "offset"             : _offset,
                          "comments_limit"     : _comments_limit,
                          "comments_offset"    : _comments_offset,
                          "likes_limit"        : _likes_limit,
                          "likes_offset"       : _likes_offset,
                          "data"               : data
                      });
                    });

                  break;

                case "get-related-movies":

                  _sm.getRelatedMovies( _userid, _vid, _limit, _offset, config, function(data){
                      res.json( { "status"       : "success",
                            "vid"                : _vid,
                            "action"             : _action,
                            "limit"              : _limit,
                            "offset"             : _offset,
                            "comments_limit"     : _comments_limit,
                            "comments_offset"    : _comments_offset,
                            "likes_limit"        : _likes_limit,
                            "likes_offset"       : _likes_offset,
                            "data"               : data
                        });
                    });

                break;

            case "get-related-my-videos":

              _sm.getRelatedMyVideos( _userid, _vid, _limit, _offset, config, function(data){
                //console.log("debug:search-api.js:get-related:data:", data)
                res.json( { "status"             : "success",
                            "vid"                : _vid,
                            "action"             : _action,
                            "limit"              : _limit,
                            "offset"             : _offset,
                            "comments_limit"     : _comments_limit,
                            "comments_offset"    : _comments_offset,
                            "likes_limit"        : _likes_limit,
                            "likes_offset"       : _likes_offset,
                            "data"               : data
                  });
                });

            break;

            case "get-related-videos":
                //example: http://localhost:3000/video-api?action=get-related-videos&userid=JDL007&vid=AimbDb
                _sm.getRelatedVideos( _userid, _vid, _limit, _offset, config, function(data){
                    res.json( { "status"             : "success",
                                "vid"                : _vid,
                                "action"             : _action,
                                "limit"              : _limit,
                                "offset"             : _offset,
                                "comments_limit"     : _comments_limit,
                                "comments_offset"    : _comments_offset,
                                "likes_limit"        : _likes_limit,
                                "likes_offset"       : _likes_offset,
                                "data"               : data
                    });
                });
                break;
            case "get-prfolie-user-videos":
                //example: http://localhost:3000/video-api?action=get-user-proflie-videos&userid=JDL007&profile_id=HOME01&offset=0&limit=50
                _vm.getProfileUserVideos( _userid, _profile_id, _limit, _offset, config, function(data){
                    res.json( { "status"             : "success",
                                "userid"             : _userid,
                                "profile_id"         : _profile_id,
                                "action"             : _action,
                                "limit"              : _limit,
                                "offset"             : _offset,
                                "comments_limit"     : _comments_limit,
                                "comments_offset"    : _comments_offset,
                                "likes_limit"        : _likes_limit,
                                "likes_offset"       : _likes_offset,
                                "data"               : data
                    });
                });
                break;


            case "get-user-videos":
                //example: http://localhost:3000/video-api?action=get-user-videos&userid=JDL007&offset=0&limit=50
                _vm.getUserVideos( _userid, _limit, _offset, config, function(data){
                    res.json( { "status"             : "success",
                                "userid"             : _userid,
                                "action"             : _action,
                                "limit"              : _limit,
                                "offset"             : _offset,
                                "comments_limit"     : _comments_limit,
                                "comments_offset"    : _comments_offset,
                                "likes_limit"        : _likes_limit,
                                "likes_offset"       : _likes_offset,
                                "data"               : data
                    });
                });
                break;

            case "get-user-public-videos":
                //example: http://localhost:3000/video-api?action=get-user-public-videos&userid=JDL007&offset=0&limit=50
                _sm.getUserPublicVideos( _userid, _limit, _offset, config, function(data){
                    res.json( { "status"             : "success",
                                "userid"             : _userid,
                                "action"             : _action,
                                "limit"              : _limit,
                                "offset"             : _offset,
                                "comments_limit"     : _comments_limit,
                                "comments_offset"    : _comments_offset,
                                "likes_limit"        : _likes_limit,
                                "likes_offset"       : _likes_offset,
                                "data"               : data
                    });
                });
                break;

            case "get-staff-picks":
                //example: http://localhost:3000/video-api?action=get-staff-picks&userid=JDL007&offset=0&limit=50
                _sm.getStaffPicks( _userid, _limit , _offset, config, function(data){
                    res.json( { "status"             : "success",
                                "userid"             : _userid,
                                "action"             : _action,
                                "limit"              : _limit,
                                "offset"             : _offset,
                                "comments_limit"     : _comments_limit,
                                "comments_offset"    : _comments_offset,
                                "likes_limit"        : _likes_limit,
                                "likes_offset"       : _likes_offset,
                                "data"               : data
                    });
                });
            break;

            case "delete-video":
                //example: http://localhost:3000/video-api?action=delete-video&userid=JDL007&vid=AimZ51
                _vm.deleteVideo( _userid, _vid, config, function(data){
                res.json( { "status"    : "success",
                            "userid"    : _userid,
                            "action"    : _action,
                            "data"      : data
                    });
                });
            break;

            case "save-video-metadata":
                //example: http://localhost:3000/video-api?action=save-video-metadata&userid=JDL007&vid=AimZ51
                _vm.saveVideoMetadata( _userid, _vid, _metadata, config, function(data){
                    res.json( { "status" : "success",
                                "action" : _action,
                                "userid" : _userid,
                                "vid"    : _vid,
                                "data"   : data
                        });
                    });
                break;

            case "get-unread-comments-count":
                //example: http://localhost:3000/video-api?action=get-unread-comments-count&userid=JDL007
                _vm.getUnreadCommentsCount( _userid, config, function(data){
                    res.json( { "status"   : "success",
                                "action"   : _action,
                                "userid"   : _userid,
                                "total_unred_comments"   : "na",
                                "data"     : data
                            });
                    });
                break;

            case "delete-comment":
                _vm.deleteComment( _userid, _comment_uid, config, function(data){
                    res.json( { "status"        : "success",
                                "action"        : _action,
                                "userid"        : _userid,
                                "comment_uid"   : _comment_uid,
                                "data"          :  data
                    });
                });
                break;

            case "mark-comment-as-read":
                _vm.setCommentStatus( _userid, _comment_uid, "read", config, function(data){
                    res.json( { "status" : "success",
                                "action" : _action,
                                "userid" : _userid,
                                "comment_uid" : _comment_uid,
                                "data" :  data
                        });
                    });
                break;

            case "get-user-video-comments":

                break;
            case "get-channel-video-comments":
                _vm.getChannelVideoComments( _userid , _limit, _offset, config, function(data){
                            res.json( { "status"   : "success",
                                        "action"   : _action,
                                        "userid"   : _userid,
                                        "limit"    : _limit,
                                        "offset"   : _offset,
                                        "data"     : data
                                });
                    });
                break;

            case "post-comment":
                _vm.createComment(_vid, _userid, _comment, _metadata, config, function(data){
                        res.json( { "status"   : "success",
                                    "vid"      : _vid,
                                    "action"   : _action,
                                    "comment"  : _comment,
                                    "metadata" : _metadata,
                                    "userid"   : _userid,
                                    "data"     : data
                        });
                });
            break;

            case "update-comment":
                _vm.updateComment( _userid, _comment_id, _comment, _metadata, config, function(data){
                    _vm.getVideoComments( _userid, _vid, _offset, _limit, config, function(data){
                        res.json( { "status"      : "success",
                                    "action"      : _action,
                                    "comment_id"  : _comment_id,
                                    "comment"     : _comment,
                                    "userid"      : _userid,
                                    "data"        : data
                        });
                    });
                });
            break;

            case "reply-2-comment":
                _vm.reply2Comment( _vid, _userid, _comment_id, _comment, _metadata, config, function(data){
                        res.json( { "status"        : "success",
                                    "userid"        : _userid,
                                    "vid"           : _vid,
                                    "comment_id"    : _comment_id,
                                    "action"        : _action,
                                    "comment"       : _comment,
                                    "metadata"      : _metadata,
                                    "data"          : data
                        });
                });
            break;

            case "get-comment-replies":
                _vm.getCommentReplies( _userid, _comment_id, _limit, _offset, config, function(data){
                        res.json( { "status"        : "success",
                                    "action"        : _action,
                                    "userid"        : _userid,
                                    "comment_id"    : _comment_id,
                                    "limit"         : _limit,
                                    "offset"        : _offset,
                                    "data"          : data
                        });
                });
            break;


            case "get-video-embed":
                //example: http://localhost:3000/video-api?action=get-video-embed&userid=JDL007&vid=AimZ51
                _vm.getVideoEmbed( _vid, config, function(data){
                        res.json( { "status"  : "success",
                                    "userid"   : _userid,
                                    "vid"      : _vid,
                                    "action"   : _action,
                                    "data"     : data
                        });
                  });
                  break;


            case "get-user-news-feed":
                _sm.getUserNewsFeed( _userid, _limit , _offset, config, function(data){
                    res.json( { "status" : "success",
                                "action" : _action,
                                "userid" : _userid,
                                "limit"  : _limit,
                                "offset" : _offset,
                                "data"   : data
                        });
                    });
                break;

            case "search-people":
                _sm.searchPeople( _userid, _q, _limit, _offset, config, function(data){
                    res.json( { "status"    : "success",
                                "userid"    : _userid,
                                "action"    : _action,
                                "limit"     : _limit,
                                "offset"    : _offset,
                                "q"         : _q,
                                "data"      : data
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
