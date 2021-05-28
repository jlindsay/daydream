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
//var _nfm                = require("../server/NewsFeedManager");
//var _mm               = require("../server/MessageManager");
//var _am               = require("../server/AccountManager");
//var _plm              = require("../server/PlaylistManager");
//var _actm             = require("../server/AccountManager");

//router.get( '/', ensureLoggedIn('/login'), function( req, res, next ){
router.get( '/', function( req, res, next ){

        var _vid                    = req.query.vid ? trim( req.query.vid ) : null;
        var _action                 = req.query.action ? trim( req.query.action ) : null;
        var _sid             	      = req.query.sid ? trim( req.query.sid ) : null;
        var _pid                    = req.query.pid ? trim( req.query.pid ) : null;

        var _userid                 = req.query.userid ? trim( req.query.userid ) : null;
        var _profile_id             = req.query.profile_id ? trim( req.query.profile_id ) : null;
        var _friend                 = req.query.profile_id ? trim( req.query.friend ) : null;
        var _friends                = req.query.profile_id ? trim( req.query.friends ) : null;

//        var _comment                = req.query.comment ? trim( req.query.comment_uid ) : null;
//        var _comment_uid            = req.query.comment_uid ? trim( req.query.vid ) : null;
//        var _setid                  = req.query.setid ? trim( req.query.setid ) : null;

        var _liked                  = req.query.liked ? trim( req.query.liked ) : null;
        var _keywords               = req.query.keywords ? trim( req.query.keywords ) : null;
        var _q                      = req.query.q ? trim( req.query.q ) : null;

        var _limit                  = req.query.limit ? trim( req.query.limit ) : null;
        var _comments_limit       = req.query.comments_limit ? trim( req.query._comments_limit ) : null;
        var _likes_limit          = req.query.likes_limit ? trim( req.query._likes_limit ) : null;

        var _offset                 = req.query.offset ? trim( req.query.offset ) : null;
        var _comments_offset        = req.query.comments_offset ? trim( req.query.comments_offset ) : null;
        var _likes_offset           = req.query.likes_offset ? trim( req.query.likes_offset ) : null;

        var _sort_by                = req.query.sort_by ? trim( req.query.sort_by ) : "DESC";
//        var _comments_sorts_by      = req.query.comments_sort_by ? trim( req.query.comments_sort_by ) : "DESC";
//        var _likes_sorts_by         = req.query.likes_sort_by ? trim( req.query.likes_sort_by ) : "DESC";

        var _order_by               = req.query.order_by ? trim( req.query.order_by ) : "date_created";
//        var _comments_order_by    = req.query.comments_order_by ? trim( req.query.comments_order_by ) : "date_created";
//        var _likes_order_by       = req.query.likes_order_by ? trim( req.query.likes_order_by ) : "date_created";

        var _to_userid              = req.query.to_userid? trim( req.query.to_userid ): null;
        var _from_userid            = req.query.from_userid? trim( req.query.from_userid ) : null;



        var _message                = req.query.message? trim( req.query.message ) : null;
        var _message_uid            = req.query.message_uid? trim( req.query.message_uid ): null;
        var _conversation_id        = req.query.conversation_id? trim( req.query.conversation_id ) : null;


        var _uid                    = req.query.uid? trim( req.query.uid ) : null;

        var _favorit                = req.query.favorit? trim( req.query.favorit ) : null;
//        var _favorit              = req.query.favorit? trim( req.query.getUserFavoriteVideos ) : null;

        var _rank                   = req.query.rank? trim( req.query.rank ): null;
        var _metadata               = req.query.metadata? trim( req.query.metadata ) : null;
        var _follower_userid        = req.query.follower_userid? trim( req.query.follower_userid ) : null;


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
            case "get-contacts":
                _um.getUserContacts( _userid, _limit, _offset, _config, function($data){
                    console.log("get-contacts:success:data:", $data );
                    res.json( { "status" : "success",
                                "action" : _action,
                                "userid" : _userid,
                                "limit"  : _limit,
                                "offset" : _offset,
                                "data"   : $data
                        });

                });
                break;

            case "remove-friend":
                _um.removeFriend( _userid, _friend, config, function($data){
                    console.log("remove-friend:success:data:", $data );
                    res.json( { "status" : "success",
                                "action" : _action,
                                "userid" : _userid,
                                "friend" : _friend,
                                "data"   : $data
                        });

                });
                break;
            case "add-friend":
                _um.addFriend( _userid, _friend, config, function($data){
                    console.log("add-friend:success:data:", $data );
                    res.json( { "status" : "success",
                                "action" : _action,
                                "userid" : _userid,
                                "friend" : _friend,
                                "data"   : $data
                        });

                });
                break;
            case "add-friends":
                _um.addFriends( _userid, _friends, config, function($data){
                    console.log("add-friends:success:data:", $data );
                    res.json( { "status" : "success",
                                "action" : _action,
                                "userid" : _userid,
                                "friends": _friends,
                                "data"   : $data
                        });

                });
                break;
/*




            // User messages

        case "send-user-message":
//            echo "send-user-message:userid:" . _userid . ", from_userid:". $from_userid . " ,to_userid:".  $to_userid . ", message:". $message ;
            //$conversation_id
            _mm.sendUserMesages( $from_userid, $to_userid, $message, function(data){
                res.json( { "status" : "success",
                                 "action" : _action,
                                 "userid" : _userid,
                                 "from_userid" : $from_userid,
                                 "to_userid" : $to_userid,
                                 "data"   : data
                    });
                });
            break;

        case "get-sent-to-user-messages":
//            echo "send-user-message:userid:" . _userid . ", from_userid:". $from_userid . " ,to_userid:".  $to_userid . ", message:". $message ;
            _mm.getUserSentToMessages( $from_userid, $to_userid, function(data){
                res.json( { "status" : "success",
                                 "action" : _action,
                                 "userid" : _userid,
                                 "from_userid" : $from_userid,
                                 "to_userid" : $to_userid,
                                 "limit" : _limit,
                                 "offset" : _offset,

                                 "data"   : data
                    });
                });
            break;
            // follower(s)/following commands

        case "get-user-following":
            _mm.getUserfollowing( _userid, function(data){
                res.json( { "status" : "success",
                                 "action" : _action,
                                 "userid" : _userid,
                                 "limit" : _limit,
                                 "offset" : _offset,
                                 "data"   : data
                    });
                });
            break;

        case "get-user-followers":
            _mm.getUserfollowers( _userid, function(data){
                res.json( { "status" : "success",
                                 "action" : _action,
                                 "userid" : _userid,
                                 "limit" : _limit,
                                 "offset" : _offset,
                                 "data"   : data
                    });
                });
            break;

        case "get-user-follow-stats":
            _mm.getUsersfollowStats(_userid), function(data){
                res.json( { "status" : "success",
                                 "action" : _action,
                                 "userid" : _userid,
                                 "data"   : array( 'total_followers': _mm.total_followers,
                                                    'total_following': _mm.total_following )
                    });
                });
            break;

        case "is-user-follower":
            // isUserfollower(_userid, _follower_userid);
            _mm.isUserfollower( _userid, _follower_userid, function(data){
                res.json( { "status" : "success",
                                 "action" : _action,
                                 "userid" : _userid,
                                 "follower_userid" : _follower_userid,
                                 "is_user_follower" : _mm.is_user_follower,
                                 "data"   : data
                    });
                });
            break;

         case "unfollow-user":
            _mm.unfollowUser( _userid, _follower_userid, function(data){
                res.json( { "status" : "success",
                                 "action" : _action,
                                 "userid" : _userid,
                                 "follower_userid" : _follower_userid,
                                 "data"   : data
                    });
                });
            break;

         case "follow-user":
            _mm.followUser( _userid, _follower_userid, function(data){
                res.json( { "status" : "success",
                                 "action" : _action,
                                 "userid" : _userid,
                                 "follower_userid" : _follower_userid,
                                 "data"   : data
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
