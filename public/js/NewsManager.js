/**
 * author:Joshua Lindsay
 * email:j@lindsayfilm.com
 * http://lindsayfilm.com
 * Software can be used for Good or Evil.
 * Some people die rich, some die poor, the result is the same.
 */

function NewsManager()
{
    var self = this;
    var _duration=120;
    var _config={};
    var _userid=null;

    var _user_comments=[];
    var _video_comments=[];
    var _badge_count=0;
    var _autoStart = true;

    function cons(key)
    {
        return {
                 VIDEO_API_URL      : "/video-api",
                 SEARCH_API_URL     : "/search-api",
                 PLAYLIST_URL       : "/playlist-api",

                 className:"crazy",
                  DEFAULT_LIMIT : "10",
                  DEFAULT_INDEX : "0",
                }[key];
    }

    function init( $userid, $config )
    {
        _userid                     = $userid;
        _config                     = $config || {};
        _duration                   = $config.duration || _duration;
        _autoStart                  = $config.autoStart || _autoStart;
        onUnreadCommentsCount       = $config.onUnreadCommentsCount  || onUnreadCommentsCount;
        onRenderUserComments        = $config.onRenderUserComments || onRenderUserComments;
        onRenderVideoComments       = $config.onRenderVideoComments || onRenderVideoComments;

        startBadgeCount();
    }

    function searchPeople( $keywords, $config )
    {
        $config.action = "search-people";
        search( $keywords, $config );
    }

    function search( $keywords, $config )
    {
        console.log( "search( keywords:"+$keywords+")" );
            $config = $config || {};

        var action = $config.action || "search-videos" ;
            limit = $config.limit || cons('DEFAULT_LIMIT');

        var is_loggedin = $config.is_loggedin;
        var controller = ( !is_loggedin )? cons("SEARCH_API_URL") : cons("VIDEO_API_URL") ;

        $.ajax({
             url: controller,
              dataType: 'json',
            cache: false,
             data: {
                action : action,
                limit : limit,
                keywords: $keywords,
            },
             success: function($data){
                $config.success($data.data );
            }
        });
    }


    function postStatus( $userid, $status, $config )
    {
        console.log( "postStatus( userid:"+$userid+", comment:"+$status+")" );

        $.ajax({
             url: cons("VIDEO_API_URL"),
              dataType: 'json',
            cache: false,
             data: {
                action : "post-status",
                userid : $userid,
                status: $status,
            },
             success: function($data){
                $config.success($data.data );
            }
        });
    }

    function updateFeed()
    {
//        console.log("updateFeed()");
    }

    function startBadgeCount()
    {
        console.log("startBadgeCount()");
        window._userid = _userid;
        window._duration = _duration * 1000;
        window._updateBadgeCount = updateBadgeCount;
        updateBadgeCount();
//        update();
    }


    function updateBadgeCount()
    {
        console.log("updateBadgeCount()");
        setTimeout('window._updateBadgeCount(window._userid)', _duration * 1000 );
        getUnreadCommentsCount( _userid );
    }

    function getUnreadCommentsCount($userid, $config)
    {
        console.log( "badgeCount( userid:"+$userid+")" );
        $config = $config || {};
//        $limit = $config.limit || {};

        $.ajax({
             url: cons("VIDEO_API_URL"),
              dataType: 'json',
            cache: false,
             data: {
                action : "get-unread-comments-count",
                userid : $userid,
            },
             success: function($data){
//                _badge_count=0;
                _unread_comments = $data.data;
                console.log($data.data);
                onUnreadCommentsCount( $data.data );
            }
        });
    }

    function getUserComments( $userid, $config )
    {
        console.log( "getMessages( userid:"+$userid+")" );
        $config = $config || {};
//        $limit = $config.limit || cons("DEFAULT_LIMIT");

        $.ajax({
             url: cons("VIDEO_API_URL"),
              dataType: 'json',
            cache: false,
             data: {
                action : "get-user-comments",
                userid : $userid,
//                limit : $limit,
            },
             success: function($data){
                _user_comments = $data.data;
                onRenderUserComments( $data.data );
            }
        });

    }

    function getVideoComments( $vid, $config)
    {
        console.log("getVideoComments(vid:"+$vid+")");
        $config = $config || {};
        $limit = $config.limit || cons("DEFAULT_LIMIT");

        $.ajax({
             url: cons("VIDEO_API_URL"),
              dataType: 'json',
            cache: false,
             data: {
                action : "get-video-comments",
                vid : $vid,
//                limit : $limit,
            },
             success: function($data){
                _video_comments = $data.data? $data.data : [] ;
                onRenderVideoComments($data.data );
            }
        });
    }

    /**
     * eventhandler(s)
     */
    function onFeedUpdate($data){};
    function onBadgeCount($data){};
    function onRenderUserComments($data){};
    function onRenderVideoComments($data){};
//    function onRenderVideoLikes($data){};

    return { search : search,
             searchPeople : searchPeople,
             postStatus : postStatus,
             updateFeed : updateFeed,
             getUserComments : getUserComments,
             getVideoComments : getVideoComments,
             getUnreadCommentsCount : getUnreadCommentsCount,
             cons : cons,
             init:init
            }

}
