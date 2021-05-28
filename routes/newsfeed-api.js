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
//var _mm               = require("../server/MessageManager");
//var _am               = require("../server/AccountManager");
//var _plm              = require("../server/PlaylistManager");
//var _actm             = require("../server/AccountManager");

router.get( '/', function( req, res, next ){

        var _vid                      = req.query.vid ? trim( req.query.vid ) : null;
        var _action                   = req.query.action ? trim( req.query.action ) : null;
        var _sid             	        = req.query.sid ? trim( req.query.sid ) : null;
        var _pid                      = req.query.pid ? trim( req.query.pid ) : null;

        var _userid                   = req.query.userid ? trim( req.query.userid ) : null;
        var _profile_id               = req.query.profile_id ? trim( req.query.profile_id ) : null;
        var _friend                   = req.query.profile_id ? trim( req.query.friend ) : null;
        var _friends                  = req.query.profile_id ? trim( req.query.friends ) : null;

        var _profile_id               = req.query.profile_id ? trim( req.query.profile_id ) : null;
        var _comment                  = req.query.comment ? trim( req.query.comment ) : null;
        var _comment_uid              = req.query.comment_uid ? trim( req.query.comment_uid ) : null;
//        var _setid                  = req.query.setid ? trim( req.query.setid ) : null;

        var _liked                    = req.query.liked ? trim( req.query.liked ) : null;
        var _disliked                 = req.query.disliked ? trim( req.query.disliked ) : null;
        var _keywords                 = req.query.keywords ? trim( req.query.keywords ) : null;
        var _q                        = req.query.q ? trim( req.query.q ) : null;

        var _comment_id               = req.query.comment_id ? trim( req.query.comment_id ) : null;

        var _limit                    = req.query.limit ? trim( req.query.limit ) : null;
        var _comments_limit           = req.query.comments_limit ? trim( req.query._comments_limit ) : null;
        var _likes_limit              = req.query.likes_limit ? trim( req.query._likes_limit ) : null;

        var _offset                   = req.query.offset ? trim( req.query.offset ) : null;
        var _comments_offset          = req.query.comments_offset ? trim( req.query.comments_offset ) : null;
        var _likes_offset             = req.query.likes_offset ? trim( req.query.likes_offset ) : null;


        var _sort_by                  = req.query.sort_by ? trim( req.query.sort_by ) : "DESC";
//        var _comments_sorts_by      = req.query.comments_sort_by ? trim( req.query.comments_sort_by ) : "DESC";
//        var _likes_sorts_by         = req.query.likes_sort_by ? trim( req.query.likes_sort_by ) : "DESC";

        var _order_by                 = req.query.order_by ? trim( req.query.order_by ) : "date_created";
//        var _comments_order_by      = req.query.comments_order_by ? trim( req.query.comments_order_by ) : "date_created";
//        var _likes_order_by         = req.query.likes_order_by ? trim( req.query.likes_order_by ) : "date_created";

        var _to_userid                = req.query.to_userid? trim( req.query.to_userid ): null;
        var _from_userid              = req.query.from_userid? trim( req.query.from_userid ) : null;

        var _post                     = req.query.post? trim( req.query.post ) : null;
        var _post_thumbnail_url       = req.query.post_thumbnail_url? trim( req.query._post_thumbnail_url ) : null;


        var _message                  = req.query.message ? trim( req.query.message ) : null;
        var _message_uid              = req.query.message_uid ? trim( req.query.message_uid ): null;
        var _conversation_id          = req.query.conversation_id ? trim( req.query.conversation_id ) : null;


        var _uid                       = req.query.uid ? trim( req.query.uid ) : null;

        var _favorit                   = req.query.favorit ? trim( req.query.favorit ) : null;
//        var _favorit                 = req.query.favorit? trim( req.query.getUserFavoriteVideos ) : null;

        var _rank                      = req.query.rank ? trim( req.query.rank ): null;
        var _metadata                  = req.query.metadata ? req.query.metadata : null;
        var _follower_userid           = req.query.follower_userid ? trim( req.query.follower_userid ) : null;

        var _title                     = req.query.title ? trim( req.query.title ) : null;
        var _description               = req.query.description ? trim( req.query.description ) : null;
        var _thumbnail_url             = req.query.thumbnail_url ? trim( req.query.thumbnail_url ) : null;
        var _catagory                  = req.query.catagory ? trim( req.query.catagory ) : null;
        var _keywords                  = req.query.keywords ? trim( req.query.keywords ) : null;

        var _url                       = req.query.url ? trim( req.query.url ) : null;

        var _content                   = req.query.content ? trim( req.query.content ): null;
        var _metadata_url              = req.query.metadata_url ? trim( req.query.metadata_url ): null;
        var _metadata_title            = req.query.metadata_title ? trim( req.query.metadata_title ): null;
        var _metadata_description      = req.query.metadata_description ? trim( req.query.metadata_description ): null;
        var _metadata_thumbnail_url    = req.query.metadata_thumbnail_url ? trim( req.query.metadata_thumbnail_url ): null;
        var _metadata_video_url        = req.query.metadata_video_url ? trim( req.query.metadata_video_url )       : null;


        var _metadata_url               = req.query.metadata_url ? trim( req.query.metadata_url ): null;

        var _metadata_locale            = req.query.metadata_locale ? trim( req.query.metadata_locale ): null;
        var _metadata_date              = req.query.metadata_date ? trim( req.query.metadata_date ): null;
        var _metadata_type              = req.query.metadata_type ? trim( req.query.metadata_type ): null;
        var _metadata_request_url       = req.query.metadata_request_url ? trim( req.query.metadata_request_url ): null;
        var _metadata_site_name         = req.query.metadata_site_name ? trim( req.query.metadata_site_name ): null;
        var _metadata_charset           = req.query.metadata_charset ? trim( req.query.metadata_charset ): null;
        var _is_public                  = req.query.is_public ? trim( req.query.is_public ): null;


        if( !_metadata ){
            _metadata = { url                     : _url,
                          title                   : _title,
                          description             : _description,
                          keywords                : _keywords,

                          metadata_title          : _metadata_title,
                          metadata_description    : _metadata_description,
                          metadata_thumbnail_url  : _metadata_thumbnail_url,
                          metadata_video_url      : _metadata_video_url,
                          metadata_locale         : _metadata_locale,
                          metadata_date           : _metadata_date,
                          metadata_type           : _metadata_type,
                          metadata_request_url    : _metadata_request_url,
                          metadata_site_name      : _metadata_site_name,
                          metadata_charset        : _metadata_charset,

                          catagory                : _catagory,
                          content                 : _content,
                          is_public               : _is_public
                        }
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

            case "get-newsfeed":

                _nfm.getNewsFeed( _userid, _limit, _offset, config, function(data){
                    res.json( { "status"    : "success",
                                "userid"    : _userid,
                                "action"    : _action,
                                "limit"     : _limit,
                                "offset"    : _offset,
                                "data"      : data
                    });
                });

                break;

            case "get-user-newsfeed":
                _nfm.getUserNewsFeed( _userid, _limit, _offset, config, function(data){
                          res.json( { "status"    : "success",
                                      "userid"    : _userid,
                                      "action"    : _action,
                                      "limit"     : _limit,
                                      "offset"    : _offset,
                                      "data"      : data
                          });
                });

                break;

            case "mark-comment-as-read":
                _nfm.markCommentAsRead( _userid, _comment_id, config, function($data){
                          res.json( { "status"     : "success",
                                      "userid"     : _userid,
                                      "action"     : _action,
                                      "comment_id" : _comment_id,
                                      "data"       : $data
                          });
                });

                break;

            case "mark-comment-as-unread":
                _nfm.markCommentAsUnread( _userid, _comment_id, config, function($data){
                          res.json( { "status"     : "success",
                                      "userid"     : _userid,
                                      "action"     : _action,
                                      "comment_id" : _comment_id,
                                      "data"       : $data
                          });
                });

                break;


            case "create-post":

                _nfm.createPost( _userid, _content, _metadata, function($data){

                    _nfm.getPost( _userid, $data.pid, {}, function($post){
                          res.json( { "status"             : "success",
                                      "userid"             : _userid,
                                      "action"             : _action,
                                      "pid"                : $post.pid,
                                      "data"               : $post
                          });

                    })

                });

                break;

            case "delete-post":
                //example: http://localhost:3000/newsfeed-api?action=delete-post&userid=JDL007&pid=AimZ51
                _nfm.deletePost( _userid, _pid, config, function($data){

                      res.json( { "status"    : "success",
                                  "userid"    : _userid,
                                  "pid"       : _pid,
                                  "action"    : _action,
                                  "data"      : $data
                      });
                });
            break;

            case "save-post-metadata":
                //example: http://localhost:3000/post-api?action=save-post-metadata&userid=JDL007&pid=AimZ51
                console.log("save-post-metadata: metadata", _metadata);
                _nfm.savePostMetadata( _userid, _pid, _metadata, config, function($data){
                    res.json( { "status" : "success",
                                "action" : _action,
                                "userid" : _userid,
                                "pid"    : _pid,
                                "data"   : $data
                        });
                    });
                break;

            case "get-post":
                console.log("newsfeed-api::get-post:pid:", _pid);
                _nfm.getPost( _userid, _pid, config, function( $data ){
                    console.log("$data:", $data)
                    res.json( { "status"    : "success",
                                "userid"    : _userid,
                                "pid"       : _pid,
                                "action"    : _action,
                                "data"      : $data
                    });
                });
                break;

            case "get-posts":
                _nfm.getPosts( _userid, _pid, config, function(data){
                    res.json( { "status"    : "success",
                                "userid"    : _userid,
                                "pid"       : _pid,
                                "action"    : _action,
                                "offset"    : _offset,
                                "limit"     : _limit,
                                "data"      : data
                    });
                });
                break;

            case "post-disliked":
                  //example: http://localhost:3000/post-api?action=post-disliked&pid=AimbDb&userid=JDL007&liked=1
                  _nfm.postDisliked( _userid, _pid, _disliked, config, function(data){
                      _nfm.getPostDislikes( _userid, _pid, _limit, _offset, config, function(data){

                          res.json( { "status"            : "success",
                                       "action"           : _action,
                                       "userid"           : _userid,
                                       "pid"              : _pid,
                                       "disliked"         : _disliked,
                                       "limit"            : _limit,
                                       "offset"           : _offset,
                                       "total_likes"      :  "na",
                                       "user_liked_post"  :  "na",
                                       "data"             :  data
                          });
                      });
                  });

                  break;

            case "post-liked":

              //example: http://localhost:3000/post-api?action=post-liked&pid=AimbDb&userid=JDL007&liked=1
              _nfm.postLiked( _userid, _pid, _liked, config, function(data){
                  _nfm.getPostLikes( _userid, _pid, _limit, _offset, config, function(data){
                    
                      res.json( { "status"            : "success",
                                   "action"           : _action,
                                   "userid"           : _userid,
                                   "pid"              : _pid,
                                   "liked"            : _liked,
                                   "limit"            : _limit,
                                   "offset"           : _offset,
                                   "total_likes"      :  "na",
                                   "user_liked_post"  :  "na",
                                   "data"             :  data
                      });
                  });
              });

              break;

            case "post-total-likes":
              _nfm.getPostTotalLikes( _pid, function(total){
                  res.json( { "status"         : "success",
                               "action"        : _action,
                               "userid"        : _userid,
                               "pid"           : _pid,
                               "total_likes"   :  total
                  });
              });

              break;

            case "post-total-comments":
                  _nfm.getPostTotalComments( _pid, function(total){
                    res.json( { "status"            : "success",
                                 "action"           : _action,
                                 "userid"           : _userid,
                                 "pid"              : _pid,
                                 "total_comments"   :  total
                    });
                });

                break;

            case "post-comment-liked":

                    _nfm.postCommentLiked( _userid, _pid, _comment_id, _liked, config, function(data){

                        _nfm.getPostCommentLikes( _userid, _pid, _comment_id, _limit, _offset, config, function(data){

                            res.json( { "status"      : "success",
                                         "action"     : _action,
                                         "userid"     : _userid,
                                         "pid"        : _pid,
                                         "comment_id" : _comment_id,
                                         "liked"      : _liked,
                                         "limit"      : _limit,
                                         "offset"     : _offset,
                                         "data"       :  data
                            });
                        });

                    });

                break;

              case "post-comment-disliked":

                    _nfm.postCommentDisliked( _userid, _pid, _comment_id, _disliked, config, function(data){

                        _nfm.getPostCommentDislikes( _userid, _pid, _comment_id, _limit, _offset, config, function(data){

                            res.json( { "status"         : "success",
                                         "action"        : _action,
                                         "userid"        : _userid,
                                         "pid"           : _pid,
                                         "comment_id"    : _comment_id,
                                         "disliked"      : _disliked,
                                         "limit"         : _limit,
                                         "offset"        : _offset,
                                         "data"          :  data
                            });
                        });

                    });
                    break;

              case "get-posts":
              case "get-new-posts":
                  //example: http://localhost:3000/post-api?action=get-new-posts&userid=JDL007&offset=0&limit=50
                  _nfm.getNewPosts( _userid, _limit, _offset , config, function(data){
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

              case "get-post-likes":
                  //example: http://localhost:3000/post-api?action=get-post-likes&userid=JDL007&pid=AimbDb
                  _nfm.getPostLikes( _userid, _pid, _limit, _offset, config, function(data){
                      res.json( { "status"    : "success",
                                   "pid"      : _pid,
                                   "userid"   : _userid,
                                   "action"   : _action,
                                   "limit"    : _limit,
                                   "offset"   : _offset,
                                   "data"     : data
                      });
                  });
                  break;

              case "get-post-comments":
                  //example: http://localhost:3000/post-api?action=get-post-comments&userid=JDL007&pid=AimbDb
                  _nfm.getPostComments( _userid, _pid , _limit, _offset, config, function(data){
                      res.json( { "status"    : "success",
                                   "pid"      : _pid,
                                   "userid"   : _userid,
                                   "action"   : _action,
                                   "limit"    : _limit,
                                   "offset"   : _offset,
                                   "data"     : data
                      });
                  });
                  break;

              case "get-post-comment":
                  console.log("_comment_id:",_comment_id)
                  //example: http://localhost:3000/post-api?action=get-post-comment&userid=JDL007&comment_id=AimbDb
                  _nfm.getPostComment( _userid, _comment_id , config, function(data){
                      res.json( { "status"        : "success",
                                   "comment_id"   : _comment_id,
                                   "userid"       : _userid,
                                   "action"       : _action,
                                   "data"         : data
                      });
                  });
                  break;


                  case "add-2-read-history":
                      //example: http://localhost:3000/post-api?action=add2History&pid=AimbDb&userid=JDL007
                      _nfm.add2ReadHistory( _userid, _pid , config, function(data){
                          res.json( { "status"    : "success",
                                      "userid"    : _userid,
                                      "action"    : _action,
                                      "pid"       : _pid,
                                      "data"      : data
                          });
                      });
                  break;


                  case "post-comment":

                      _nfm.createComment(_userid, _pid, _comment, _metadata, config, function(data){
                            res.json( { "status"   : "success",
                                        "pid"      : _pid,
                                        "action"   : _action,
                                        "comment"  : _comment,
                                        "metadata" : _metadata,
                                        "userid"   : _userid,
                                        "data"     : data
                            });
                      });

                  break;

                  case "update-comment":

                      _nfm.updateComment( _userid, _comment_id, _comment, _metadata, config, function(data){
                          _nfm.getComment( _userid, _comment_id, config, function(data){
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
                      _nfm.reply2Comment( _userid, _pid, _comment_id, _comment, _metadata, config, function(data){
                              res.json( { "status"        : "success",
                                          "userid"        : _userid,
                                          "pid"           : _pid,
                                          "comment_id"    : _comment_id,
                                          "action"        : _action,
                                          "comment"       : _comment,
                                          "metadata"      : _metadata,
                                          "data"          : data
                              });
                      });

                  break;

                  case "get-comment-replies":

                      _nfm.getCommentReplies( _userid, _comment_id, _limit, _offset, config, function(data){

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

                  case "delete-comment":

                      _nfm.deleteComment( _userid, _comment_uid, config, function(data){
                              res.json( { "status"        : "success",
                                          "action"        : _action,
                                          "userid"        : _userid,
                                          "comment_uid"   : _comment_uid,
                                          "data"          :  data
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
