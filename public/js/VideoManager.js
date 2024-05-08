/**
 * author:Joshua Lindsay
 * email:j@lindsayfilm.com
 * http://lindsayfilm.com
 * Software can be used for Good or Evil.
 * Some people die rich, some die poor, the result is the same.
 */

function VideoManager( $config )
{
    var self = this;
    var _config= $config || {};
    var _userid="";
    var _video={};
    var _videos=[];
    var _history =[];

    var _tv =[];
    var _movies =[];
    var _audiobooks =[];

    var _watch_later = [];
    var _user_videos=[];
    var _videos_about_person=[];
    var _user_news_feed=[];
    var _user_favorite_videos=[];
    var _related_videos=[];
    var _comments=[];
    var _comment=[];
    var _likes="0";
    var _user={};
    var _users=[];
    var _uagent = navigator.userAgent.toLowerCase();
    var _isIOS = isIOS();

    var _playlists=[];
    var _playlist={};
    var _bv;

    //var _users_video_comments

    function isIOS()
    {
        if ( ( _uagent.search("iphone") > -1) ||
             ( _uagent.search("ipad") > -1) ||
             ( _uagent.search("ipod") > -1 ) ){
            return true;
        }
        return false;
    }

    function cons(key)
    {
        return { version            : "@VERSION@",
                 className          : "VideoManager",
                 FEED_URL           : "/feed/",
                 VIDEO_API_URL      : "/video-api",
                 PLAYLIST_API_URL   : "/playlist-api",
                 SEARCH_API_URL     : "/search-api",
                 PLAYLIST_URL       : "/playlist-api",
                 DEFAULT_LIMIT      : "10"
                 }[key];
    }

    function init( $config )
    {
        console.log("init()");
        _config = $config || {};
        _userid = $config.userid || null;
    }

    function focus(video)
    {
        console.log("focus(",video,")");
        _video = video;
        try{
            _config.focus(video);
        }catch(e){
            //console.log("VideoManager:foucs is not defined");
        }
    }

    function markCommentAsRead( $userid, $comment_id, $config )
    {
          console.log("VideoManager.markCommentAsRead():userid", $userid,", comment_id:", $comment_id);

          $config = $config || {};

          $.ajax({
              url: cons("NEWSFEED_API_URL"),
              dataType: 'json',
              cache: false,
              data: {
                  action        : "mark-comment-as-read",
                  userid        : $userid,
                  comment_id    : $comment_id
              },
              success: function($data){
                  console.log("VideoManager:markCommentAsRead::success:");
                  _notes = $data.data || null;
                  try{
                      $config.success(_notes);
                  }catch($e){
                      console.log("VideoManager:success:error:", $e);
                  }
              },
              error: function($e){
                  console.log("VideoManager:markCommentAsRead::error:", $e);
                  try{
                      $config.error($e);
                  }catch($e){
                      console.log("VideoManager:markCommentAsRead::error:e:",$e);
                  }

              }
          });
    }

    function markCommentAsUnread( $userid, $comment_id, $config )
    {
          console.log("VideoManager.markCommentAsUnread():userid",$userid,", comment_id:", $comment_id);

          $config = $config || {};

          $.ajax({
              url: cons("NEWSFEED_API_URL"),
              dataType: 'json',
              cache: false,
              data: {
                  action        : "mark-comment-as-unread",
                  userid        : $userid,
                  comment_id    : $comment_id
              },
              success: function($data){
                  console.log("VideoManager:markCommentAsUnread::success:");
                  _comment = $data.data || null;
                  try{
                      $config.success(_comment);
                  }catch($e){
                      console.log("VideoManager:success:error:", $e);
                  }
              },
              error: function($e){
                  console.log("VideoManager:markCommentAsUnread::error:", $e);
                  try{
                      $config.error($e);
                  }catch($e){
                      console.log("VideoManager:markCommentAsUnread::error:e:",$e);
                  }

              }
          });
    }

    function getVideo2Share($userid, $sid, $config)
    {
        console.log("VideoManager:getVideo2Share():sid:", $sid);
        $.ajax({
            url: cons("SEARCH_API_URL"),
            dataType: 'json',
            cache: false,
            data: {
                action : "get-video-2-share",
                userid:$userid,
                sid : $sid,
            },

            success: function($info){
                console.log("VideoManager:getVideo2Share::success:");
                _video = $info.data || {};
                focus($info.data);
                try{
                    $config.success($info.data);
                }catch(e){
                    //console.log("VideoManager:foucs is not defined");
                }
            },
            error: function($e){
                console.log("VideoManager:getVideo2Share:error:", $e);
                try{
                    $config.error($e);
                }catch($e){
                    //console.log("VideoManager:foucs is not defined");
                }

            }
        });
    }

    function getVideo($userid, $vid, $config)
    {
        console.log("VideoManager:getVideo():vid:", $vid);
        $.ajax({
            url: cons("SEARCH_API_URL"),
            dataType: 'json',
            cache: false,
            data: {
                action : "get-video",
                userid:$userid,
                vid : $vid,
            },

            success: function($info){
                console.log("VideoManager:getVideo::success:");
                _video = $info.data[0] || {};
                focus(_video);
                try{
                    $config.success(_video);
                }catch(e){
                    //console.log("VideoManager:foucs is not defined");
                }
            },
            error: function($e){
                console.log("VideoManager:getVideo:error:", $e);
                try{
                    $config.error($e);
                }catch($e){
                    //console.log("VideoManager:foucs is not defined");
                }

            }
        });
    }

    function getVideoInfo()
    {
        return _video;
    }

    function getVideosInfo()
    {
        return _videos;
    }
/*
    function getVideoInfoById($vid)
    {
        return findVideoById($vid);
    }
*/

    function find($vid, $list_id)
    {
        console.log("VideoManager:find("+$vid+")", _videos);
        var videos = [];
        switch($list_id){
            case "my-news-feed":
                videos = _user_news_feed;
                break;
            case "my-videos":
                videos = _user_videos;
                break;
            case "watch-history":
                videos = _history;
                break;
            case "watch-later":
                videos = _watch_later;
                break;
            case "videos":
            default:
                videos = _videos;
                break;
        }

        for(var i=0;i< videos.length;i++){
            var video = videos[i];
            console.log("vid:",$vid, ", video.uid:", video.uid );
            if( video.uid == $vid){
                return video;
            }
        }
        return;
    }

    function findVideoById($vid)
    {
        console.log("VideoManager:findVideoById("+$vid+")", _videos);

        for(var i=0;i< _videos.length;i++)
        {
            var video = _videos[i];
            console.log("vid:",$vid, ", video.uid:", video.uid, ", _videos:",_videos);
            if( video.uid == $vid){
                return video;
            }
        }
        return;
    }

    function getProfileUserVideos( $userid, $profile_id, $config)
    {
        console.log( "VideoManager:getProfileUserVideos(userid:" + $userid + ")" );
        $config     = $config || {};
        var limit      = $config.limit || cons("DEFAULT_LIMIT");
        var offset     = $config.offset || 0;
    //        var keywords   = $config.keywords || '';

        $.ajax({
             url: cons("VIDEO_API_URL"),
             dataType: 'json',
             cache: false,
             data: {
                action: "get-prfolie-user-videos",
                userid : $userid,
                profile_id: $profile_id,
                limit : limit,
                offset : offset
            },
            success: function($data)
            {
                console.log("getProfileUserVideos:success:");
                _user_videos = $data.data || [] ;
                try{
                    $config.success(_user_videos);
                }catch(e){
                    //
                }
            }
        });
    //        console.log("getProfileUserVideos:done:");
    }

    function getUserVideos( $userid, $config)
    {
        console.log( "VideoManager:getUserVideos(userid:" + $userid + ")" );
        $config     = $config || {};
        var limit      = $config.limit || cons("DEFAULT_LIMIT");
        var offset     = $config.offset || 0;
//        var keywords   = $config.keywords || '';

        $.ajax({
             url: cons("VIDEO_API_URL"),
             dataType: 'json',
             cache: false,
             data: {
                action: "get-user-videos",
                userid : $userid,
                limit : limit,
                offset : offset,
//                keywords : keywords
            },
            success: function($data)
            {
                console.log("getUserVideos:success:");
                _user_videos = $data.data || [] ;
                try{
                    $config.success(_user_videos);
                }catch(e){
                    //
                }
            }
        });
//        console.log("getUserVideos:done:");
    }

    function getVideosAboutPerson( $userid, $profile_id, $config )
    {
        console.log( "VideoManager:getVideosAboutPerson(userid:" + $userid + ")" );
        $config = $config || {};
        var limit      = $config.limit || cons("DEFAULT_LIMIT");
        var offset     = $config.offset || 0;

        $.ajax({
             url: cons("SEARCH_API_URL"),
             dataType: 'json',
             cache: false,
             data: {
                action: "get-videos-about-person",
                userid : $userid,
                profile_id : $profile_id,
                offset:offset,
                limit:limit
            },
            success: function($data)
            {
                console.log("debug:VideoManager:getVideosAboutPerson:success:");
                _videos_about_person = $data.data || [] ;
                try{
                    $config.success(_videos_about_person);
                }catch(e){
                    //
                }
            },
            error : function($data)
            {
                try{
                    $config.success();
                }catch(e){
                    //
                }

            }
        });

    }

    function getUserPublicVideos( $userid, $config)
    {
        console.log( "VideoManager:getUserPublicVideos(userid:" + $userid + ")" );
        $config = $config || {};
        var limit      = $config.limit || cons("DEFAULT_LIMIT");
        var offset     = $config.offset || 0;
        $.ajax({
             url: cons("SEARCH_API_URL"),
             dataType: 'json',
             cache: false,
             data: {
                action: "get-user-public-videos",
                userid : $userid,
                limit : limit,
                offset : offset
            },
            success: function($data)
            {
                console.log("debug:VideoManager:getUserVideos:success:");
                _user_videos = $data.data || [] ;
                try{
                    $config.success(_user_videos);
                }catch(e){
                    //
                }
            },
            error : function($data)
            {
                try{
                    $config.success();
                }catch(e){
                    //
                }

            }
        });

    }

    function getNewVideos( $userid, $config )
    {
        console.log("VideoManager:getNewVideos(userid:"+$userid+")");
//        $userid = ( $userid == '' )? null : $userid;
        $config = $config || {};
        var limit      = $config.limit || cons("DEFAULT_LIMIT");
        var offset     = $config.offset || 0;
//        $page = $config.page || 0;

        $.ajax({
             url: cons("SEARCH_API_URL"),
              dataType: 'json',
            cache: false,
             data: {
                action : "get-new-videos",
                userid : $userid,
                limit  : limit,
                offset : offset
            },
             success: function($data){
                _videos = $data.data || [] ;
                try{
                    $config.success(_videos);
                }catch(e){
                    //
                }
            },
            error : function($data)
            {
                try{
                    $config.success();
                }catch(e){
                    //
                }

            }
        });
    }

    function getVideos( $userid, $config)
    {
        console.log("VideoManager:getVideos(userid:"+$userid+")");
        $config = $config || {};
        var limit      = $config.limit || cons("DEFAULT_LIMIT");
        var offset     = $config.offset || 0;

        var is_loggedin = $config.is_loggedin;
        var controller = ( !is_loggedin )? cons("SEARCH_API_URL") : cons("VIDEO_API_URL") ;

        $.ajax({
              url: cons("SEARCH_API_URL"),
              dataType: 'json',
            cache: false,
             data: {
                action : "get-videos",
                userid : $userid,
                limit : limit,
                offset : offset
            },
             success: function($data){
                _videos = $data.data || [] ;
                try{
                    $config.success(_videos);
                }catch(e){
                    //
                }
            },
            error : function($data)
            {
                try{
                    $config.success();
                }catch(e){
                    //
                }

            }
        });
    }

    function validatePostComment(msg)
    {
        console.log("VideoManager:validatePostComment(msg:"+msg+")");
        return ;
    }

    function deleteComment( $userid, $comment_uid, $config )
    {
        console.log("VideoManager:deleteComment(userid:"+userid+", comment_uid:"+$comment_uid+")");
        $.ajax({
            url: cons("VIDEO_API_URL"),
            dataType: 'json',
            cache: false,
            data: {
                action      : "delete-comment",
                userid      : $userid,
                comment_uid : $comment_uid
            },
            success: function( $data )
            {
                _comments = $data.data || [] ;
//                console.log("comments:", $data);
                try{
                    $config.success( _comments );
                }catch(e)
                {
                    //console.log("e:",e);
                }
            },
            error : function($data)
            {
                try{
                    $config.success();
                }catch(e){
                    //
                }

            }
        });
    }

    function postComment($vid, $userid, $comment, $config)
    {
        console.log("VideoManager:postComment(vid:"+$vid+", userid:"+$userid+", comment:"+$comment+")");
        console.log("$config.metadata::", $config.metadata)
        $comment = sanitizeComment($comment);
        $config.metadata = $config.metadata || null;

        $.ajax({
            url: cons("VIDEO_API_URL"),
            dataType: 'json',
            cache: false,
            data: {
                action   : "post-comment",
                vid      : $vid,
                userid   : $userid,
                comment  : $comment,
                metadata : $config.metadata
            },
            success: function($data)
            {
                _comment = $data.data || [] ;
                console.log("comments:", $data);
                try{
                    $config.success(_comment);
                }catch(e)
                {
                    //console.log("e:",e);
                }
            },
            error : function($data)
            {
                try{
                    $config.success();
                }catch(e){
                    //
                }

            }
        });
    }

    function updateComment($userid, $comment_id, $comment, $config)
    {
        console.log("VideoManager:updateComment(comment_id:"+$comment_id+", userid:"+$userid+", comment:"+$comment+")");
        $comment = sanitizeComment($comment);
        var metadata = $config.metadata || null;

        $.ajax({
            url: cons("VIDEO_API_URL"),
            dataType: 'json',
            cache: false,
            data: {
                action  : "update-comment",
                comment_id      : $comment_id,
                userid          : $userid,
                comment         : $comment,
                metadata        : metadata
            },
            success: function($data)
            {
                _comment = $data || [] ;
                //console.log("comment:", $data);
                try{
                    $config.success(_comment);
                }catch(e)
                {
                    console.log("e:",e);
                }
            },
            error : function($data)
            {
                try{
                    $config.success();
                }catch(e){
                    //
                }

            }
        });
    }

    function reply2Comment($vid, $userid, $comment_id, $comment, $config)
    {
          console.log("VideoManager:reply2Comment(vid:", $vid, ", userid:", $userid, ", comment_id:", $comment_id, ", comment:", $comment, ")");
          $comment = sanitizeComment($comment);
      var metadata = $config.metadata || null;
          console.log("reply2Comment::metadata:", metadata);

      $.ajax({
          url: cons("VIDEO_API_URL"),
          dataType: 'json',
          cache: false,
          data: {
              action      : "reply-2-comment",
              vid         : $vid,
              userid      : $userid,
              comment_id  : $comment_id,
              comment     : $comment,
              metadata    : $config.metadata
          },
          success: function($data)
          {
              _comment = $data.data || [] ;
              //console.log("VideoManager:reply2Comment:success:", $data);
              try{
                  $config.success(_comment);
              }catch(e)
              {
                  //console.log("e:",e);
              }
          },
          error : function($data)
          {
              try{
                  $config.success();
              }catch(e){
                  //
              }

          }
      });
    }

    function getCommentReplies( $userid, $comment_id, $offset, $limit , $config )
    {
      console.log("VideoManager:getCommentReplies(comment_id:", $comment_id, ", userid:", $userid , ", offset: ", $offset, ", limit:", $limit );

      $.ajax({
          url: cons("VIDEO_API_URL"),
          dataType: 'json',
          cache: false,
          data: {
              action      : "get-comment-replies",
              userid      : $userid,
              comment_id  : $comment_id,
              offset      : $offset,
              limit       : $limit
          },
          success: function($data)
          {
              _comments = $data.data || [] ;
              console.log("VideoManager:getCommentReplies:success:", _comments);
              try{
                  $config.success(_comments);
              }catch(e)
              {
                  //console.log("e:",e);
              }
          },
          error : function($data)
          {
              try{
                  $config.success();
              }catch(e){
                  //
              }

          }
      });
    }

    function sanitizeComment($comment)
    {
        //remove url, or things that we do not think we need to save.
        return $comment;
    }

    function getFavorits($userid, $config )
    {
//        "add-video-2-favorits"
    }

    function getLikes( $vid, $config )
    {
        console.log("VideoManager:getLikes(vid:"+$vid+")");
        $config = $config || {};

        $.ajax({
             url: cons("VIDEO_API_URL"),
              dataType: 'json',
            cache: false,
             data: {
                action : "get-video-likes",
                vid : $vid,
            },
             success: function($data){
                _likes = $data.data || [] ;
                try{
                    $config.success(_likes);
                }catch(e){
                    //
                }
            },
            error : function($data)
            {
                try{
                    $config.success();
                }catch(e){
                    //
                }

            }
        });
    }


    function getChannelVideoComments($userid, $config)
    {

        console.log("VideoManager:getChannelVideoComments(userid:"+$userid+")");
        $config = $config || {};
        var limit      = $config.limit || cons("DEFAULT_LIMIT");
        var offset     = $config.offset || 0;

        $.ajax({
             url: cons("VIDEO_API_URL"),
              dataType: 'json',
            cache: false,
             data: {
                action : "get-channel-video-comments",
                userid : $userid,
                limit  : limit,
                offset : offset
            },
             success: function($data){
                console.log("VideoManager.getChannelVideoComments::success:::data:",$data)
                _comments = $data.data || [];
                try{
                    $config.success(_comments);
                }catch(e){
                    //console.log(e);
                }
            }
        });
    }

    function getUserVideoComments($userid, $config)
    {
        console.log("VideoManager:getUserVideoComments(userid:"+$userid+")");
        $config = $config || {};
        var limit      = $config.limit || cons("DEFAULT_LIMIT");
        var offset     = $config.offset || 0;

        $.ajax({
             url: cons("VIDEO_API_URL"),
              dataType: 'json',
            cache: false,
             data: {
                action : "get-user-video-comments",
                userid : $userid,
                limit  : limit,
                offset : offset
            },
             success: function($data){
                console.log("VideoManager.getUserVideoComments::success:::data:",$data)
                _comments = $data.data || [];
                try{
                    $config.success(_comments);
                }catch(e){
                    //console.log(e);
                }
            }
        });
    }

    function getComment( $userid, $comment_id, $config)
    {
        console.log("VideoManager:getComment($comment_id:"+$comment_id+")");
        $config = $config || {};
        //var limit      = $config.limit || cons("DEFAULT_LIMIT");
        //var offset     = $config.offset || 0;

        $.ajax({
              url: cons("VIDEO_API_URL"),
              dataType: 'json',
              cache: false,
              data: {
                  action        : "get-video-comment",
                  userid        : $userid,
                  comment_id    : $comment_id
              },
              success: function($data){
                  _comment = $data.data || [];
                  try{
                      $config.success(_comment);
                  }catch(e){
                      //console.log(e);
                  }
              },
              error : function($data)
              {
                  try{
                      $config.success();
                  }catch(e){
                      //
                  }

              }
        });
    }

    function getComments( $userid, $vid, $config)
    {
        console.log("VideoManager:getComments(vid:"+$vid+")");
        $config = $config || {};
        var limit      = $config.limit || cons("DEFAULT_LIMIT");
        var offset     = $config.offset || 0;

        $.ajax({
             url: cons("VIDEO_API_URL"),
              dataType: 'json',
            cache: false,
             data: {
                action : "get-video-comments",
                userid : $userid,
                vid : $vid,
                limit : limit,
                offset : offset
            },
             success: function($data){
                _comments = $data.data || [];
                try{
                    $config.success(_comments);
                }catch(e){
                    //console.log(e);
                }
            },
            error : function($data)
            {
                try{
                    $config.success();
                }catch(e){
                    //
                }

            }
        });
    }

    function getUserInfo( $uid, $config)
    {
        console.log("VideoManager:getUserInfo(uid:"+$uid+ ")" );

        $.ajax({
             url: cons("VIDEO_API_URL"),
              dataType: 'json',
            cache: false,
             data: {
                action : "get-user-info",
                uid : $uid,
            },
             success: function($data){
                _user =  $data.data || [] ;
                try{
                    $config.success(_user);
                }catch(e)
                {
                    //
                }
            },
            error : function($data)
            {
                try{
                    $config.success();
                }catch(e){
                    //
                }

            }
        });
    }

    function getRelatedTV($vid, $config)
    {
        console.log("VideoManager:getRelatedTV(vid:"+$vid+ ")" );
        $config = $config || {};
        var limit  = $config.limit  || cons('DEFAULT_LIMIT');
        var offset = $config.offset || 0;

        $.ajax({
             url: cons("SEARCH_API_URL"),
             dataType: 'json',
             cache: false,
             data: {
                action    : "get-related-tv",
                vid       : $vid,
                limit     : limit,
                offset    : offset
            },
             success: function($data){
                console.log("VideoManager:getRelatedTv:success:data:", $data);
                _related_videos = $data.data || [] ;
                try{
                    $config.success(_related_videos);
                }catch(e){
                    //console.log(e);
                }
            },
            error : function($data)
            {
                console.log("VideoManager:getRelatedTv:error");
                try{
                    $config.success();
                }catch(e){
                    //
                }

            }
        });
    }

    function getRelatedMovies($vid, $config)
    {
        console.log("VideoManager:getRelatedMovies(vid:"+$vid+ ")" );
        $config = $config || {};
        var limit  = $config.limit  || cons('DEFAULT_LIMIT');
        var offset = $config.offset || 0;

        $.ajax({
             url: cons("SEARCH_API_URL"),
             dataType: 'json',
             cache: false,
             data: {
                action    : "get-related-movies",
                vid       : $vid,
                limit     : limit,
                offset    : offset
            },
             success: function($data){
                console.log("VideoManager:getRelatedMovies:success:data:", $data);
                _related_videos = $data.data || [] ;
                try{
                    $config.success(_related_videos);
                }catch(e){
                    //console.log(e);
                }
            },
            error : function($data)
            {
                console.log("VideoManager:getRelatedMovies:error");
                try{
                    $config.success();
                }catch(e){
                    //
                }

            }
        });
    }

    function getRelatedAudiobooks($vid, $config)
    {
        console.log("VideoManager:getRelateAudiobooks(vid:"+$vid+ ")" );
        $config = $config || {};
        var limit  = $config.limit  || cons('DEFAULT_LIMIT');
        var offset = $config.offset || 0;

        $.ajax({
             url: cons("SEARCH_API_URL"),
             dataType: 'json',
             cache: false,
             data: {
                action    : "get-related-audiobooks",
                vid       : $vid,
                limit     : limit,
                offset    : offset
            },
             success: function($data){
                console.log("VideoManager:getRelatedAudiobooks:success:data:", $data);
                _related_videos = $data.data || [] ;
                try{
                    $config.success(_related_videos);
                }catch(e){
                    //console.log(e);
                }
            },
            error : function($data)
            {
                console.log("VideoManager:getRelatedAudiobooks:error");
                try{
                    $config.success();
                }catch(e){
                    //
                }

            }
        });
    }

    function getRelatedMyVideos($vid, $config)
    {
        console.log("VideoManager:getRelatedMyVideos(vid:"+$vid+ ")" );
        $config = $config || {};
        var limit  = $config.limit  || cons('DEFAULT_LIMIT');
        var offset = $config.offset || 0;

        $.ajax({
             url: cons("SEARCH_API_URL"),
             dataType: 'json',
             cache: false,
             data: {
                action    : "get-related-my-videos",
                userid    : _userid,
                vid       : $vid,
                limit     : limit,
                offset    : offset
            },
             success: function($data){
                console.log("VideoManager:getRelatedMyVideos:success:data:", $data);
                _related_videos = $data.data || [] ;
                try{
                    $config.success(_related_videos);
                }catch(e){
                    //console.log(e);
                }
            },
            error : function($data)
            {
                console.log("VideoManager:getRelatedMyVideos:error");
                try{
                    $config.success();
                }catch(e){
                    //
                }

            }
        });
    }


    function getRelatedVideos( $userid, $vid, $config)
    {
//        console.log("VideoManager:getRelatedVideos(vid:"+$vid+ ")", $config );
        var userid    = $userid;//$config.userid;
        var vid       = $vid;//$config.userid;

            $config   = $config || {};
        var limit     = $config.limit  || cons('DEFAULT_LIMIT');
        var offset    = $config.offset || 0;
        var catagory  = $config.catagory || "myvideos";
        var action    = "get-related-videos";


        switch(catagory)
        {
          case "audiobooks":
            action = "get-related-audiobooks";
            break;
          case "tv":
              action = "get-related-tv";
            break;
          case "movies":
              action = "get-related-movies";
            break;
          case "my-videos":
          case "myvideos":
            action = "get-related-my-videos";
            break;
          case "videos":
          case "related-videos":
          case "new-videos":
          case "get-related-videos":
          default:
              action = "get-related-videos";
            break;
        }


        $.ajax({
             url: cons("SEARCH_API_URL"),
             dataType: 'json',
             cache: false,
             data: {
                action    : action,
                userid   :  userid,
                vid       : vid,
                catagory  : catagory,
                limit     : limit,
                offset    : offset
            },
             success: function($data){
//                console.log("VideoManager:getRelatedVideos:success:data:", $data);
                _related_videos = $data.data || [] ;
                try{
                    $config.success(_related_videos);
                }catch(e){
                    //console.log(e);
                }
            },
            error : function($data)
            {
//                console.log("VideoManager:getRelatedVideos:error");
                try{
                    $config.success();
                }catch(e){
                    //
                }

            }
        });
    }

    function search( $userid, $keywords, $config )
    {
            console.log("VideoManager:search(keywords:"+$keywords+ "), userid:", $userid, ", config:" , $config );
            $config = $config || {};
        var limit  = $config.limit  || cons('DEFAULT_LIMIT');
        var offset = $config.offset || 0;
        var keywords = $keywords;

        $.ajax({
             url: cons("SEARCH_API_URL"),
             dataType: 'json',
             cache: false,
             data: {
                action    : "search-videos",
                keywords  : $keywords,
                userid    : $userid,
                limit     : limit,
                offset    : offset
            },
             success: function($data){
                console.log("VideoManager:search:success:data:", $data);
                //_search_results = $data.data || [] ;
                //console.log("VM:search:succes:config:",$config);
                try{
                    $config.success( $data );
                }catch(e){
                    //console.log("something is wrong");
                }
            },
            error : function($data)
            {
                console.log("VideoManager:search:error");
                try{
                    $config.success();
                }catch(e){
                    //
                }

            }
        });
    }

    function getUserFavoritVideos($userid, $config)
    {
        console.log("VideoManager:getUserFavoritVideos(userid:"+$userid+ ")" );
        $config = $config || {};
        var limit  = $config.limit  || cons('DEFAULT_LIMIT');
        var offset = $config.offset || 0;

        $.ajax({
             url: cons("VIDEO_API_URL"),
              dataType: 'json',
            cache: false,
             data: {
                action : "get-user-favorit-videos",
                userid : $userid,
                limit : limit,
                offset : offset
            },
             success: function($data){
                _user_favorite_videos = $data.data || [] ;
                try{
                    $config.success(_user_favorite_videos);
                }catch(e){
                    //console.log(e);
                }
            },
            error : function($data)
            {
                try{
                    $config.success();
                }catch(e){
                    //
                }

            }
        });
    }

    function add2WatchHistory( $userid, $vid )
    {
        console.log("VideoManager:add2WatchHistory(userid:"+$userid+ ", vid:",$vid,")" );
        $.ajax({
             url: cons("VIDEO_API_URL"),
              dataType: 'json',
            cache: false,
             data: {
                action : "add-video-2-watch-history",
                userid : $userid,
                vid : $vid
            },
             success: function($data){
//                _user = $data.data || [] ;
//                $config.success(_user);
            },
            error : function($data)
            {
                try{
                    $config.success();
                }catch(e){
                    //
                }

            }
        });
    }

    function add2favorits( $userid, $vid )
    {
        console.log("VideoManager:add2favorits(userid:"+$userid+ ")" );
        $.ajax({
             url: cons("VIDEO_API_URL"),
              dataType: 'json',
            cache: false,
             data: {
                action : "add-video-2-favorits",
                vid : $vid,
                userid : $userid,
//                favorits : $favorits
            },
             success: function($data){
//                _user = $data.data || [] ;
//                $config.success(_user);
            },
            error : function($data)
            {
                try{
                    $config.success();
                }catch(e){
                    //
                }

            }
        });
    }

    function likeVideo( $userid, $vid, $liked, $config )
    {
        console.log("VideoManager:likeVideo(userid:"+$userid+ ", vid:"+$vid+", liked:"+$liked+")" );
        $.ajax({ url: cons("VIDEO_API_URL"),
                 dataType: 'json',
                 cache: false,
                 data: {
                      action : "video-liked",
                      vid : $vid,
                      userid : $userid,
                      liked : $liked
                 },
                 success: function($data){
    //                _likes = $data.data || [] ;
                    console.log("likeVideo:success:data",$data);
                    try{
                        $config.success($data.data[0]);
                    }catch(e){
                        //console.log(e);
                    }
                },
                error : function($data)
                {
                    try{
                        $config.success();
                    }catch(e){
                        //
                    }

                }
        });
    }

    function dislikeVideo( $userid, $vid, $disliked, $config )
    {
        console.log("VideoManager:dislikeVideo(userid:"+$userid+ ", vid:"+$vid+", disliked:"+$disliked+")" );
        $.ajax({ url: cons("VIDEO_API_URL"),
                 dataType: 'json',
                 cache: false,
                 data: {
                      action  : "video-disliked",
                      vid     : $vid,
                      userid  : $userid,
                      disliked   : $disliked
                 },
                 success: function($data){
    //                _likes = $data.data || [] ;
                    console.log("dislikeVideo:success:data",$data);
                    try{
                        $config.success($data.data[0]);
                    }catch(e){
                        //console.log(e);
                    }
                },
                error : function($data)
                {
                    try{
                        $config.success();
                    }catch(e){
                        //
                    }

                }
        });
    }

    function likeVideoComment( $userid, $vid, $comment_id, $liked, $config )
    {
        //console.log("VideoManager:likeVideoComment(userid:", $userid, ", vid:", $vid, ", comment_id:", comment_id , ", liked:" , $liked , ")" );
        $.ajax({ url: cons("VIDEO_API_URL"),
                 dataType: 'json',
                 cache: false,
                 data: {
                      action : "video-comment-liked",
                      vid : $vid,
                      userid : $userid,
                      liked : $liked,
                      comment_id : $comment_id
                 },
                 success: function($data){
    //                _likes = $data.data || [] ;
                    //console.log("likeVideoComment:success:data",$data);
                    try{
                        $config.success($data.data[0]);
                    }catch(e){
                        //console.log(e);
                    }
                },
                error : function($data)
                {
                    try{
                        $config.success();
                    }catch(e){
                        //
                    }

                }
        });
    }

    function dislikeVideoComment( $userid, $vid, $comment_id, $disliked, $config )
    {
        //console.log("VideoManager:dislikeVideoComment(userid:" , $userid, ", vid:", $vid, ", $comment_id:", $comment_id , ", disliked:", $disliked, ")" );
        $.ajax({ url: cons("VIDEO_API_URL"),
                 dataType: 'json',
                 cache: false,
                 data: {
                      action      : "video-comment-disliked",
                      vid         : $vid,
                      userid      : $userid,
                      comment_id  : $comment_id,
                      disliked    : $disliked
                 },
                 success: function($data){
    //                _likes = $data.data || [] ;
                  //  console.log("dislikeVideoComment:success:data",$data);

                    try{
                        $config.success($data.data[0]);
                    }catch(e){
                        console.log(e);
                    }
                },
                error : function($data)
                {
                    try{
                        $config.success();
                    }catch(e){
                        //
                    }

                }
        });
    }

    function reply2VideoComment( $userid, $vid, $comment_id, $comment, $config )
    {
        console.log("VideoManager:reply2VideoComment(userid:" , $userid, ", vid:", $vid, ", $comment_id:", $comment_id , ", comment:", $comment, ")" );
        $.ajax({ url: cons("VIDEO_API_URL"),
                 dataType: 'json',
                 cache: false,
                 data: {
                      action      : "video-comment-reply",
                      vid         : $vid,
                      userid      : $userid,
                      comment_id  : $comment_id,
                      comment     : $comment
                 },
                 success: function($data){
    //                _likes = $data.data || [] ;
                    console.log("reply2VideoComment:success:data",$data);
                    try{
                        $config.success($data.data[0]);
                    }catch(e){
                        //console.log(e);
                    }
                },
                error : function($data)
                {
                    try{
                        $config.success();
                    }catch(e){
                        //
                    }

                }
        });
    }

    function addToFavorit( $userid, $vid )
    {
        console.log( "VideoManager:addToFavorit:userid:", $userid, ", vid:", $vid, ")");

        $.ajax({
             url: cons("VIDEO_API_URL"),
             dataType: 'json',
             cache: false,
             data: {
                action : "add-to-favorit",
                vid : $vid,
                userid : $userid,
            },
             success: function($data){
//                _user = $data.data || [];
//                $config.success(_user);
            },
            error : function($data)
            {
                try{
                    $config.success();
                }catch(e){
                    //
                }

            }
        });
    }


    function rateVideo( $userid, $vid, $rating )
    {
        console.log( "VideoManager:rateVideo:userid:", $userid, ", vid:", $vid, ", rating:", $rating );

        $.ajax({
             url: cons("VIDEO_API_URL"),
              dataType: 'json',
            cache: false,
             data: {
                action : "rate-video",
                vid : $vid,
                userid : $userid,
                rating : $rating
            },
             success: function($data){
//                _user = $data.data || [] ;
//                $config.success(_user);
            },
            error : function($data)
            {
                try{
                    $config.success();
                }catch(e){
                    //
                }

            }
        });
    }

    function getEmbedCode($vid)
    {
        return '<iframe src="'+location.protocol +"//"+ location.host+'/embed/'+$vid+'" width="100%" height="100%" frameborder="0" webkitallowfullscreen="" mozallowfullscreen="" allowfullscreen=""></iframe>';
    }

    function saveVideoMetadata($userid, $vid, $metadata, $config )
    {
        console.log( "VideoManager:saveVideoMetadata:metadata:", $metadata );
        //console.log( "userid:", $userid, ", vid:", $vid);
        $config = $config || {};

        $.ajax({
             url: cons("VIDEO_API_URL"),
             dataType: 'json',
             cache: false,
             data:{ action: "save-video-metadata",
                    vid : $vid,
                    userid : $userid,
                    metadata : $metadata
             },
             success: function($data){
                console.log("VideoManager.saveVideoMetadata():success:data:", $data);
                try{
                    $config.success($data.data[0]);
                }catch(e){
                    console.log("VideoManager.saveVideoMetadata::success::error:",e);
                }
            },
            error : function(e)
            {
                try{
                    $config.error($e);
                }catch(e){
                    console.log("VideoManager.saveVideoMetadata::error:",e);
                }

            }
        });
    }

    function deleteVideo( $userid, $vid, $config )
    {
        console.log("VideoManager:deleteVideo(vid:"+$vid+")");
        $config = $config || {};
        $.ajax({
             url: cons("VIDEO_API_URL"),
             dataType: 'json',
             cache: false,
             data: {action: "delete-video",
                    vid : $vid,
                    userid : $userid
             },
             success: function($data){
                try{
                    removeVideoFromVideos($vid);
                    $config.success($data);

                }catch(e){
                    //
                }
            },
            error:function($data){
                try{
                    $config.error($data);
                }catch(e){
                    //
                }
            }
        });
    }


    function removeVideoFromVideos($vid)
    {
        console.log("VideoManager:removeVideoFromVideos(vid:"+$vid+")");

        for( var i=0; i<_videos.length; i++)
        {
           var video = _videos[i];
            if( $vid == video.uid){
                delete _videos[i];
            }
        }
        if( _video.uid == $vid){
            _video = null;
        }

    }

    function rotateVideo($userid, $vid, $action, $config)
    {
        console.log( "VideoManager:removeVideoFromVideos.rotateVideo(userid:", $userid, ", vid:", $vid , ")" );
        $config = $config || {};
        $.ajax({
             url: cons("VIDEO_API_URL"),
             dataType: 'json',
             cache: false,
             data:{ action: $action,
                    vid : $vid,
                    userid : $userid
             },
             success: function($data){
                try{
                    //removeVideoFromVideos($vid);
                    $config.success($data);

                }catch(e){
                    //
                }
            },
            error:function($data){
                try{
                    $config.error($data);
                }catch(e){
                    //
                }
            }
        });
    }

    /**
     * watch history, and watch later
     */

    function getUserNewsFeed($userid, $config)
    {
        console.log("VideoManager:getUserNewsFeed(userid:"+$userid+")");
        $config = $config || {};
        var limit = $config.limit || cons("DEFAULT_LIMIT");
        var offset = $config.offset || 0;

        $.ajax({
             url: cons("VIDEO_API_URL"),
              dataType: 'json',
            cache: false,
             data: {
                action : "get-user-news-feed",
                userid : $userid,
                limit : limit,
                offset : offset,
            },
             success: function($data){
                _user_news_feed = $data.data || [] ;
                try{
                    $config.success(_user_news_feed);
                }catch(e){
                    //
                }
            },
            error : function($data)
            {
                try{
                    $config.success();
                }catch(e){
                    //
                }

            }
        });
    }


    function getUserWatchHistory($userid, $config)
    {
        console.log( "VideoManager:getUserWatchHistory(userid:", $userid, ")");
        $config = $config || {};
        var limit = $config.limit || cons("DEFAULT_LIMIT");
        var offset = $config.offset || 0;

        $.ajax({
             url: cons("VIDEO_API_URL"),
             dataType: 'json',
             cache: false,
             data:{ action  : "get-user-watch-history",
                    userid  : $userid,
                    limit : limit,
                    offset : offset
             },
             success: function($data){
                 console.log("VideoManager:getUserWatchHistory.success:data:",$data);
                _history = $data.data || [] ;
                try{
                    $config.success( _history );
                }catch(e){}
            },
            error:function($data){
                try{
                    $config.error($data);
                }catch(e){}
            }
        });

    }

    function getUserWatchLater($userid, $config)
    {
        console.log( "VideoManager:getUserWatchLater(userid:", $userid, ")");
        $config = $config || {};
        var limit = $config.limit || cons("DEFAULT_LIMIT");
        var offset = $config.offset || 0;

        $.ajax({
             url: cons("VIDEO_API_URL"),
             dataType: 'json',
             cache: false,
             data:{ action  : "get-user-watch-later",
                    userid  : $userid,
                    limit : limit,
                    offset : offset,
             },
             success: function($data){
                 console.log("VideoManager:getUserWatchLater.success:data:",$data);
                _watch_later = $data.data || [] ;
                try{
                    $config.success( _watch_later );
                }catch(e){}
            },
            error:function($data){
                try{
                    $config.error($data);
                }catch(e){}
            }
        });

    }

    function watchLater($userid, $vid, $config)
    {
        console.log( "VideoManager:watchLater(userid:", $userid, ")");
        $config = $config || {};
        $.ajax({
             url: cons("VIDEO_API_URL"),
             dataType: 'json',
             cache: false,
             data:{ action  : "watch-later",
                    userid  : $userid,
                    vid     : $vid,
             },
             success: function($data){
                 console.log("VideoManager:watchLater.success:data:",$data);
                _watch_later = $data.data || [] ;
                try{
                    $config.success( _watch_later );
                }catch(e){}
            },
            error:function($data){
                try{
                    $config.error($data);
                }catch(e){}
            }
        });

    }

    /**
     * playlist handlers
     */
    function getUserPlaylists($userid, $config)
    {
        console.log( "VideoManager:getUserPlaylists(userid:", $userid, ")");
        $config = $config || {};
        var limit = $config.limit || cons("DEFAULT_LIMIT");
        var offset = $config.offset || 0;
        var include_videos = $config.include_videos || true;

        $.ajax({
             url: cons("PLAYLIST_API_URL"),
             dataType: 'json',
             cache: false,
             data:{ action  : "get-user-playlists",
                    userid  : $userid,
                    limit   : limit,
                    offset  : offset,
                    include_videos : include_videos
             },
             success: function($data){
                _playlists = $data.data || [] ;
                try{
                    $config.success( _playlists );
                }catch(e){}
            },
            error:function($data){
                try{
                    $config.error($data);
                }catch(e){}
            }
        });

    }

    function getPlaylist($userid, $pid, $config)
    {
        console.log( "VideoManager:getPlaylist(userid:", $userid , ", pid:", $pid ,  ")");
            $config = $config || {};
        var limit = $config.limit || cons("DEFAULT_LIMIT");
        var offset = $config.offset || 0;

        $.ajax({
             url: cons("PLAYLIST_API_URL"),
             dataType: 'json',
             cache: false,
             data:{ action  : "get-playlist",
                    userid  : $userid,
                    pid     : $pid,
                    limit   : limit,
                    offset  : offset,
             },
             success: function($data){
                    console.log("VideoManager:getPlaylist.success:data:",$data);
                    _playlists = $data.data || [] ;
                try{
                    $config.success( _playlists );
                }catch(e){}
            },
            error:function($data){
                try{
                    $config.error($data);
                }catch(e){}
            }
        });

    }

    function getTVShows($userid, $config)
    {
        console.log( "VideoManager:getTVShows(userid:", $userid , ")");
            $config = $config || {};
        var limit = $config.limit || cons("DEFAULT_LIMIT");
        var offset = $config.offset || 0;

        $.ajax({
             url: cons("VIDEO_API_URL"),
             dataType: 'json',
             cache: false,
             data:{ action  : "get-tv-shows",
                    userid  : $userid,
                    limit   : limit,
                    offset  : offset,
             },
             success: function($data){
                    console.log("VideoManager:getTVShows.success:data:",$data);
                    _tv = $data.data || [] ;
                try{
                    $config.success( _tv );
                }catch(e){
                    console.log("VideoManager:getTVShows:error:", e);
                }
            },
            error:function($data){
                try{
                    $config.error($data);
                }catch(e){}
            }
        });

    }
    function getMovies($userid, $config)
    {
        console.log( "VideoManager:getMovies(userid:", $userid , ")");
            $config = $config || {};
        var limit = $config.limit || cons("DEFAULT_LIMIT");
        var offset = $config.offset || 0;

        $.ajax({
             url: cons("VIDEO_API_URL"),
             dataType: 'json',
             cache: false,
             data:{ action  : "get-movies",
                    userid  : $userid,
                    limit   : limit,
                    offset  : offset,
             },
             success: function($data){
                    console.log("VideoManager:getMovies.success:data:",$data);
                    _movies = $data.data || [] ;
                try{
                    $config.success( _movies );
                }catch(e){
                    console.log("VideoManager:getMovies:error:", e);
                }
            },
            error:function($data){
                try{
                    $config.error($data);
                }catch(e){}
            }
        });

    }

    function getAudiobooks($userid, $config)
    {
        console.log( "VideoManager:getAudiobooks(userid:", $userid , ")");
            $config = $config || {};
        var limit = $config.limit || cons("DEFAULT_LIMIT");
        var offset = $config.offset || 0;

        $.ajax({
             url: cons("VIDEO_API_URL"),
             dataType: 'json',
             cache: false,
             data:{ action  : "get-audiobooks",
                    userid  : $userid,
                    limit   : limit,
                    offset  : offset,
             },
             success: function($data){
                    console.log("VideoManager:getTVShows.success:data:",$data);
                    _audiobooks = $data.data || [] ;
                try{
                    $config.success( _audiobooks );
                }catch(e){
                    console.log("VideoManager:getTVShows:error:", e);
                }
            },
            error:function($data){
                try{
                    $config.error($data);
                }catch(e){}
            }
        });

    }

    function init404BG()
    {
      var photos = [{url: "https://media.lindsayfilm.com/videos/JDL007/UpwS6p/UpwS6p_0.jpg" }];
      var _r = Math.floor( Math.random()*photos.length );
      var photo = photos[_r];
        $.backstretch( photo.url );
    }

    function init404BVG()
    {
      var _videos = [ { url : "https://media.lindsayfilm.com/videos/JDL007/VNODwC/", file_name : "VNODwC" }]
      var _r = Math.floor( Math.random()*_videos.length );
      var _video = _videos[_r];
      var videobackground = new $.backgroundVideo( $('body'), {
          "align": "centerXY",
          "loop": "true",
          "width": 1280,
          "height": 720,
          "background-color": "#000",
          "position":"fixed",
          "muted": true,
          "volume" : "0",
          "path": _video.url,
          "filename": _video.file_name,
          "types": ["mp4"]
        });

          $('#video_background').prop('volume', 0)
          $('#video_background').prop('muted', true)
    }

    function initBG()
    {
      var photos = [{url: "https://media.lindsayfilm.com/videos/JDL007/UpwS6p/UpwS6p_0.jpg" }];
      var _r = Math.floor( Math.random()*photos.length );
      var photo = photos[_r];
        $.backstretch( photo.url );
        $("body").css("background-color", "#000")
        $(".backstretch").hide();
        $(".backstretch").fadeIn("medium", function(e){
          //console.log("done");
        });

    }


    function initBGV()
    {
/*
        var _videos = [ { url : "https://media.lindsayfilm.com/videos/JDL007/HhVU3a/", file_name : "HhVU3a" },
                        { url : "https://media.lindsayfilm.com/videos/JDL007/HjOvaL/", file_name : "HjOvaL" },
                        { url : "https://media.lindsayfilm.com/videos/JDL007/HjOZJh/", file_name : "HjOZJh" },
                        { url : "https://media.lindsayfilm.com/videos/JDL007/HjN2TY/", file_name : "HjN2TY" },
                        { url : "https://media.lindsayfilm.com/videos/JDL007/HjNKWJ/", file_name : "HjNKWJ" },
                        { url : "https://media.lindsayfilm.com/videos/JDL007/HkxmVb/", file_name : "HkxmVb" },
                        { url : "https://media.lindsayfilm.com/videos/JDL007/HjM11Q/", file_name : "HjM11Q" },
                        { url : "https://media.lindsayfilm.com/videos/JDL007/HkyWLI/", file_name : "HkyWLI" },
                        { url : "https://media.lindsayfilm.com/videos/JDL007/Hl15oi/", file_name : "Hl15oi" },
                        { url : "https://media.lindsayfilm.com/videos/JDL007/HhSyx7/", file_name : "HhSyx7" } ];
*/
                        //apple tv videos
        var _videos = [ { url : "https://media.lindsayfilm.com/videos/podcast/apple-tv/", file_name : "DB_D001_C001_4K_SDR_HEVC" },
                        { url : "https://media.lindsayfilm.com/videos/podcast/apple-tv/", file_name : "DB_D001_C005_4K_HDR_HEVC" },
                        { url : "https://media.lindsayfilm.com/videos/podcast/apple-tv/", file_name : "DB_D008_C010_4K_HDR_HEVC" },
                        { url : "https://media.lindsayfilm.com/videos/podcast/apple-tv/", file_name : "HK_B005_C011_4K_SDR_HEVC" },
                        { url : "https://media.lindsayfilm.com/videos/podcast/apple-tv/", file_name : "LA_A005_C009_4K_SDR_HEVC" },
                        { url : "https://media.lindsayfilm.com/videos/podcast/apple-tv/", file_name : "LA_A006_C008_4K_SDR_HEVC" },
//                        { url : "https://media.lindsayfilm.com/videos/podcast/apple-tv/", file_name : "LW_L001_C006_4K_HDR_HEVC.ios" }
                       ];

                        //"https://media.lindsayfilm.com/videos/podcast/apple-tv/DB_D001_C001_4K_SDR_HEVC"
                        //"https://media.lindsayfilm.com/videos/podcast/apple-tv/DB_D001_C005_4K_HDR_HEVC.ios.mp4"
                        //"https://media.lindsayfilm.com/videos/podcast/apple-tv/DB_D008_C010_4K_HDR_HEVC.ios.mp4"
                        //"https://media.lindsayfilm.com/videos/podcast/apple-tv/HK_B005_C011_4K_SDR_HEVC.ios.mp4"
                        //"https://media.lindsayfilm.com/videos/podcast/apple-tv/LA_A005_C009_4K_SDR_HEVC.ios.mp4"
                        //"https://media.lindsayfilm.com/videos/podcast/apple-tv/LA_A006_C008_4K_SDR_HEVC.ios.mp4"
                        //"https://media.lindsayfilm.com/videos/podcast/apple-tv/LA_A009_C009_4K_SDR_HEVC.ios.mp4"
                        //"https://media.lindsayfilm.com/videos/podcast/apple-tv/LW_L001_C006_4K_HDR_HEVC.ios.mp4"
                        //"https://media.lindsayfilm.com/videos/podcast/apple-tv/LW_L001_C006_4K_SDR_HEVC.ios.mp4"

        var _r = Math.floor( Math.random()*_videos.length );
        var _video = _videos[_r];

        var videobackground = new $.backgroundVideo( $('body'), {
            "align": "centerXY",
            "loop": "true",
            "width": 1280,
            "height": 720,
            "background-color": "#000",
            "position":"fixed",
            "muted": true,
            "volume" : "0",
            "path": _video.url,
            "filename": _video.file_name,
            "types": ["mp4"]
          });

            $('#video_background').prop('volume', 0)
            $('#video_background').prop('muted', true)
    }

    function addVideo2Playlist($userid, $pid, $vid, $config)
    {
        console.log( "VideoManager:addVideo2Playlist():userid:", $userid, ", pid:", $pid , ", vid:", $vid, ")");
        $config = $config || {};
        $.ajax({
             url: cons("PLAYLIST_API_URL"),
             dataType: 'json',
             cache: false,
             data:{ action  : "add-video-2-playlist",
                    userid  : $userid,
                    vid     : $vid,
                    pid     : $pid
             },
             success: function($data){
                 console.log("VideoManager:getUserPlayLists.success:data:",$data);
                _playlist = $data.data || [] ;
                try{
                    $config.success( _playlist );
                }catch(e){}
            },
            error:function($data){
                try{
                    $config.error($data);
                }catch(e){}
            }
        });
    }


    function createPlaylist( $userid, $metadata ,$config )
    {
        console.log("VideoManager:createPlaylist(userid:", $userid ,")");
        $config = $config || {};
        $.ajax({
             url: cons("VIDEO_API_URL"),
             dataType: 'json',
             cache: false,
             data:{ action      : "create-playlist",
                    userid      : $userid,
                    metadata    : $metadata
             },
             success: function($data){
                 console.log("VideoManager:createPlaylist.success:data:",$data);
                _playlist = $data.data || [] ;
                try{
                    $config.success( _playlist );
                }catch(e){}
            },
            error:function($data){
                try{
                    $config.error($data);
                }catch(e){}
            }
        });
    }

    function add2Youtube_dl($userid, $url, $config)
    {
        console.log( "VideoManager:add2Youtube_dl():userid:", $userid, ", url:", $url, ")");
        $config = $config || {};
        $.ajax({
             url: cons("VIDEO_API_URL"),
             dataType: 'json',
             cache: false,
             data:{ action  : "add-2-youtube_dl",
                    userid  : $userid,
                    url     : $url
             },
             success: function($data){
                 console.log("VideoManager:add2Youtube_dl:success:data:",$data);
                _playlist = $data.data || [] ;
                try{
                    $config.success( _playlist );
                }catch(e){}
            },
            error:function($data){
                try{
                    $config.error($data);
                }catch(e){}
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

    return {
        find                    : find,
        findVideoById           : findVideoById,
//        getVideoInfoById        : getVideoInfoById,
        search                  : search,
        rotateVideo             : rotateVideo,
        getVideoInfo            : getVideoInfo,
        getVideosInfo           : getVideosInfo,
        getEmbedCode            : getEmbedCode,
        getUserInfo             : getUserInfo,
        add2favorits            : add2favorits,
        getVideo                : getVideo,
        getVideo2Share          : getVideo2Share,
        getVideos               : getVideos,
        getNewVideos            : getNewVideos,
        getUserFavoritVideos    : getUserFavoritVideos,
        getRelatedVideos        : getRelatedVideos,
        getUserVideos           : getUserVideos,
        getProfileUserVideos    : getProfileUserVideos,
        getUserPublicVideos     : getUserPublicVideos,

        getTVShows              : getTVShows,
        getMovies               : getMovies,
        getAudiobooks           : getAudiobooks,

//        getTVShow             : getTVShow,
//        getMovie              : getMovie,
//        getAudiobook          : getAudiobook,

        getComment                : getComment,
        getComments               : getComments,
        getChannelVideoComments   : getChannelVideoComments,
        getUserVideoComments      : getUserVideoComments,

        markCommentAsUnread     : markCommentAsUnread,
        markCommentAsRead       : markCommentAsRead,

        getLikes                : getLikes,
        postComment             : postComment,
        updateComment           : updateComment,
        reply2Comment           : reply2Comment,
        deleteComment           : deleteComment,
        validatePostComment     : validatePostComment,

        rateVideo               : rateVideo,
        addToFavorit            : addToFavorit,
        likeVideo               : likeVideo,
        dislikeVideo            : dislikeVideo,

        dislikeVideoComment     : dislikeVideoComment,
        likeVideoComment        : likeVideoComment,
        reply2VideoComment      : reply2VideoComment,
        getCommentReplies       : getCommentReplies,

        sanitizeComment         : sanitizeComment,
        saveVideoMetadata       : saveVideoMetadata,
        deleteVideo             : deleteVideo,
        add2WatchHistory        : add2WatchHistory,
        watchLater              : watchLater,

        getUserNewsFeed         : getUserNewsFeed,
        getUserWatchHistory     : getUserWatchHistory,
        getUserWatchLater       : getUserWatchLater,

        getUserPlaylists        : getUserPlaylists,
        getPlaylist             : getPlaylist,
        addVideo2Playlist       : addVideo2Playlist,
        createPlaylist          : createPlaylist,
//        deletePlaylist          : deletePlaylist,

//        add2Youtube_dl          : add2Youtube_dl,
//        youtube_dl              : youtube_dl,

        shortenText             : shortenText ,

        getVideosAboutPerson    : getVideosAboutPerson,
        initBGV                 : initBGV,
        init404BVG              : init404BVG,
        initBG                  : initBG,
        init404BG               : init404BG,

        init                    : init,
        cons                    : cons
    }
}
