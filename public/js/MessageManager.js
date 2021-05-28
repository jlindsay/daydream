/**
 * author:Joshua Lindsay
 * email:j@lindsayfilm.com
 * http://lindsayfilm.com
 * Software can be used for Good or Evil.
 * Some people die rich, some die poor, the result is the same.
 */

function MessageManager()
{
    var self = this;
    var _duration = 120;
    var _userid = '';
    var _config = {};

    var _user = {};
    var _messages = [];
    var _comments = [];
    var _user_messages = [];
    var _user_comments = [];
    var _whoson = [];
    var _user_followers;
    var _user_following;

    function cons(key)
    {
        return { className          :"MessageManager",
                 FEED_URL           : "/feed/",
                 VIDEO_API_URL      : "/video-api",
                 SEARCH_API_URL     : "/search-api",
                 PLAYLIST_URL       : "/playlist-api",
                }[key];
    }

    function init($userid, $config)
    {
        //console.log("debug:MessageManager:init(userid:"+$userid+")");
        _userid = $userid;
        _config = $config || {};

//        _config._is_profile_page  = $config._is_profile_page || _is_profile_page;
//        _config.profile_userid  = $config.profile_userid || _profile_userid;
        onfollowUser            = $config.onfollowUser || onfollowUser;
        onUnfollowUser          = $config.onUnfollowUser || onUnfollowUser;
        onCommentDeleted        = $config.onCommentDeleted || onCommentDeleted;
        onCommentUpdated        = $config.onCommentUpdated || onCommentUpdated;
        onRenderUserMessages    = $config.onRenderUserMessages || onRenderUserMessages;
        onRenderUserComments    = $config.onRenderUserComments || onRenderUserComments;
        onRenderWhoson          = $config.onRenderWhoson || onRenderWhoson;

        onInited                = $config.onInited || onInited;
        //onInited();
    }

    function deleteMessage( $userid, $message_uid, $config )
    {
        //console.log("debug:MessageManager:deleteMessage(userid:"+$userid+", message_uid:"+$message_uid+")");
    }

    function deleteComment( $userid, $comment_uid, $config )
    {
        console.log("debug:MessageManager:deleteComment(userid:"+$userid+", comment_uid:"+$comment_uid+")");
        $config = $config || {};
        $.ajax({
             url: cons("VIDEO_API_URL"),
              dataType: 'json',
            cache: false,
             data: {
                action : "delete-comment",
                userid : $userid,
                comment_uid:$comment_uid
            },
             success: function($data){
                onCommentDeleted($data);
                try{ $config.success( $data );    }catch(e){};
            }, error: function($data)
            {
//                try{ $config.error( $data ); }catch(e){};
            }
        });
    }

    function markCommentAsRead( $userid, $comment_uid, $config )
    {
        console.log("debug:MessageManager:markCommentAsRead(userid:"+$userid+", comment_uid:"+$comment_uid+")");
        $config = $config || {};
        $.ajax({
             url: cons("VIDEO_API_URL"),
              dataType: 'json',
            cache: false,
             data: {
                action : "mark-comment-as-read",
                userid : $userid,
                comment_uid:$comment_uid
            },
             success: function($data){
                onCommentDeleted($data);
                try{ $config.success( $data );    }catch(e){};
            }, error: function($data)
            {
//                try{ $config.error( $data ); }catch(e){};
            }
        });
    }


    function getUserMessages($userid, $config)
    {
        console.log("debug:MessageManager:getUserMessages(userid:"+$userid+")");
        $config = $config || {};
        var limit      = $config.limit || cons("DEFAULT_LIMIT");
        var offset     = $config.offset || 0;

        $.ajax({
             url: cons("VIDEO_API_URL"),
              dataType: 'json',
            cache: false,
             data: {
                action : "get-user-messages",
                userid : $userid,
                limit : limit,
                offset : offset
            },
             success: function($data){
                _user_messages = $data.data || [];
                onRenderUserMessages( _user_messages );
                try{ $config.success( _user_messages );    }catch(e){};
            }, error: function($data)
            {
//                try{ $config.error( $data ); }catch(e){};
            }
        });
    }

    function getUserComments( $userid, $config)
    {
        console.log("debug:MessageManager:getUserComments(userid:"+$userid+")");
        $config = $config || {};
        var limit      = $config.limit || cons("DEFAULT_LIMIT");
        var offset     = $config.offset || 0;

        $.ajax({
             url: cons("VIDEO_API_URL"),
              dataType: 'json',
            cache: false,
             data: {
                action : "get-user-comments",
                userid : $userid,
                limit : limit,
                offset : offset
            },
             success: function($data){
                _user_comments = $data.data || [];
                try{ $config.success( _user_comments ); }catch(e){};
                onRenderUserComments( _user_comments );
            }, error: function($data)
            {
//                try{ $config.error( $data ); }catch(e){};
            }
        });
    }

    function whoson( $userid, $config)
    {
        console.log("debug:MessageManager:whoson(userid:"+$userid+")");
        $config = $config || {};
        var limit      = $config.limit || cons("DEFAULT_LIMIT");
        var offset     = $config.offset || 0;

        $.ajax({
             url: cons("VIDEO_API_URL"),
              dataType: 'json',
            cache: false,
             data: {
                action : "whos-online",
                userid : $userid,
                limit : limit,
                offset : offset,
            },
             success: function($data){
                _whoson = $data.data || [];
//                try{ $config.success( _whoson ); }catch(e){};
                onRenderWhoson( _whoson );
            }, error: function($data)
            {
//                try{ $config.error( $data ); }catch(e){};
            }
        });
    }


    function startWhoson()
    {
        console.log("debug:MessageManager:startWhoson()");
        window._userid = _userid;
        window._whos_duration = _duration * 1000;
        window._updateWhoson = updateWhoson;
        updateWhoson();
    }


    function updateWhoson()
    {
        console.log("debug:MessageManager:updateBadgeCount()");
        setTimeout('window._updateWhoson(window._userid)', _duration * 1000 );
        whoson( _userid );
    }

    /**
     *  follow methods
     */


    function getUserfollowing($userid, $config)
    {
        console.log("debug:MessageManager:getUserfollowing(userid:"+$userid+")");
        $config = $config || {};
        var limit      = $config.limit || cons("DEFAULT_LIMIT");
        var offset     = $config.offset || 0;

        $.ajax({
             url: cons("VIDEO_API_URL"),
             dataType: 'json',
             cache: false,
             data: {
                action : "get-user-following",
                userid : $userid,
                limit : limit,
                offset : offset,
            },
            success: function($data){
                _user_following = $data.data;
                onGetUserfollowing($data.data);
                try{ $config.success( $data.data ); }catch(e){};
            }, error: function($data)
            {
                try{ $config.error( $data ); }catch(e){};
            }
        });
    }

    function getUserfollowers($userid, $config)
    {
        $config = $config || {};
        var limit      = $config.limit || cons("DEFAULT_LIMIT");
        var offset     = $config.offset || 0;

        $.ajax({
             url: cons("VIDEO_API_URL"),
             dataType: 'json',
             cache: false,
             data: {
                action : "get-user-followers",
                userid : $userid,
                limit : limit,
                offset : offset,
            },
            success: function($data){
                _user_followers = $data.data;
                onGetUserfollowers($data.data);
                try{ $config.success( $data.data ); }catch(e){};
            }, error: function($data)
            {
                try{ $config.error( $data ); }catch(e){};
            }
        });
    }

    function isUserfollower( $userid, $follower_userid, $config)
    {
        $config = $config || {};

        $.ajax({
             url: cons("VIDEO_API_URL"),
             dataType: 'json',
             cache: false,
             data: {
                action : "is-user-follower",
                userid : $userid,
                follower_userid : $follower_userid
            },
            success: function($data){
//                console.log($data.is_user_follower);
                onIsUserfollower($data.is_user_follower);
                try{ $config.success( $data.is_user_follower ); }catch(e){};
            }, error: function($data)
            {
                try{ $config.error( $data ); }catch(e){};
            }
        });
    }

    function followUser($userid, $follower_userid, $config)
    {
        //followUser( $userid, $follower_userid )
        console.log("debug:MessageManager:followUser(userid:" + $userid + ", follower_userid:" + $follower_userid + ")");
        $config = $config || {};
        $limit = $config.limit || cons("DEFAULT_LIMIT");

        $.ajax({
             url: cons("VIDEO_API_URL"),
             dataType: 'json',
             cache: false,
             data: {
                action : "follow-user",
                userid : $userid,
                follower_userid : $follower_userid
            },
            success: function($data){
                onfollowUser($data);
                try{ $config.success( $data ); }catch(e){};
            }, error: function($data)
            {
                try{ $config.error( $data ); }catch(e){};
            }
        });
    }

    function unfollowUser($userid, $follower_userid, $config)
    {
        //followUser( $userid, $follower_userid )
        console.log("debug:MessageManager:unfollowUser(userid:" + $userid + ", follower_userid:" + $follower_userid + ")");
        $config = $config || {};
        $limit = $config.limit || cons("DEFAULT_LIMIT");

        $.ajax({
             url: cons("VIDEO_API_URL"),
             dataType: 'json',
             cache: false,
             data: {
                action : "unfollow-user",
                userid : $userid,
                follower_userid : $follower_userid
            },
             success: function($data){
                 onUnfollowUser($data);
                 try{ $config.success( _whoson ); }catch(e){};
            }, error: function($data)
            {
                try{ $config.error( $data ); }catch(e){};
            }
        });
    }

    function getUserfollowStats($userid, $config)
    {
        //followUser( $userid, $follower_userid )
        console.log("debug:MessageManager:getUserfollowStats(userid:" + $userid + ")");
        $config = $config || {};
        $limit = $config.limit || cons("DEFAULT_LIMIT");

        $.ajax({
             url: cons("VIDEO_API_URL"),
             dataType: 'json',
             cache: false,
             data: {
                action : "get-user-follow-stats",
                userid : $userid,
            },
             success: function($data){
                 onGetUserfollowStats($data);
                 try{ $config.success( _whoson ); }catch(e){};
            }, error: function($data)
            {
                try{ $config.error( $data ); }catch(e){};
            }
        });
    }

    function sendUserMessage($userid, $from_userid, $to_userid, $message, $config)
    {
        //followUser( $userid, $follower_userid )
        console.log("debug:MessageManager:sendUserMessage(to_userid:" + $to_userid + ", from_userid:" + $from_userid + ")");
        $config = $config || {};

        $.ajax({
             url: cons("VIDEO_API_URL"),
             dataType: 'json',
             cache: false,
             data: {
                action : "send-user-message",
                userid : $userid,
                to_userid : $to_userid,
                from_userid : $from_userid,
                message : $message
            },
            success: function($data){
                onSendUserMessage($data);
                try{ $config.success( $data ); }catch(e){};
            }, error: function($data)
            {
                try{ $config.error( $data ); }catch(e){};
            }
        });
    }

    function shortenText(text, max_char)
    {
      var tmp = text;
      if( text.length > max_char ){
          tmp = text.substring(0, max_char) + '...';
      }
      return tmp;
    }


    /**
     * eventHandler(s)
     */
    function onInited($data){}
    function onIsUserfollower($b){}
    function onfollowUser($data){}
    function onGetUserfollowers($data){}
    function onGetUserfollowing($data){}
    function onUnfollowUser($data){}
    function onGetUserfollowStats($data){}
    function onRenderUserMessages($data){}
    function onRenderUserComments($data){}
    function onRenderWhoson($data){}
    function onCommentDeleted($data){}
    function onCommentUpdated($data){}

    function onSendUserMessage($data){}

    /**
     * interface
     */

    return { onInited               : onInited,
             getUserMessages        : getUserMessages,
             getUserComments        : getUserComments,
             deleteComment          : deleteComment,
             markCommentAsRead      : markCommentAsRead,
//             deleteMessage        : deleteMessage,
             whoson                 : whoson,
             startWhoson            : startWhoson,

             isUserfollower         : isUserfollower,
             followUser             : followUser,
             unfollowUser           : unfollowUser,
             getUserfollowers       : getUserfollowers,
             getUserfollowing       : getUserfollowing,
             getUserfollowStats     : getUserfollowStats,

             sendUserMessage        : sendUserMessage,
             shortenText            : shortenText,

             init                   : init,
             cons                   : cons }
}
