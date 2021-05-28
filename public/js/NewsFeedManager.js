/**
 * author:Joshua Lindsay
 * email:j@lindsayfilm.com
 * http://lindsayfilm.com
 * Software can be used for Good or Evil.
 * Some people die rich, some die poor, the result is the same.
 */

function NewsFeedManager( $config )
{
    var self = this;
    var _config= $config || {};
    var _userid="";

    var _history =[];

    var _user_news_feed=[];

    var _post={};
    var _posts=[];

    var _comments=[];
    var _comment=[];
    var _likes=0;
    var _user={};
    var _users=[];

    //var DEFAULT_COMMENTS_LIMIT = 5;

    function cons(key)
    {
        return { version            : "@VERSION@",
                 className          : "NewsFeedManager",
                 FEED_URL           : "/news/",
                 NEWSFEED_API_URL   : "/newsfeed-api",
                 DEFAULT_LIMIT      : "10"
                 }[key];
    }

    function init( $config )
    {
        console.log("init()");
        _config = $config || {};
        _userid = $config.userid || null;
    }

    function focus(post)
    {
        console.log("focus(",post,")");
        _post = post;
        try{
            _config.focus(post);
        }catch(e){
            console.log("NewFeedManager:focus:e:",e);
        }
    }

    function markCommentAsRead( $userid, $comment_id, $config )
    {
          console.log("NewFeedManager.markCommentAsRead():comment_id:", $comment_id);

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
                  console.log("NewFeedManager:markCommentAsRead::success:");
                  _notes = $data.data || null;
                  try{
                      $config.success(_notes);
                  }catch($e){
                      console.log("NewFeedManager:success:error:", $e);
                  }
              },
              error: function($e){
                  console.log("NewFeedManager:markCommentAsRead::error:", $e);
                  try{
                      $config.error($e);
                  }catch($e){
                      console.log("NewFeedManager:markCommentAsRead::error:e:",$e);
                  }

              }
          });
    }

    function markCommentAsUnread( $userid, $comment_id, $config )
    {
          console.log("NewFeedManager.markCommentAsUnread():comment_id:", $comment_id);

          $config = $config || {};

          $.ajax({
              url: cons("NEWSFEED_API_URL"),
              dataType: 'json',
              cache: false,
              data: {
                  action      : "mark-comment-as-unread",
                  userid      : $userid,
                  comment_id  : $comment_id
              },
              success: function($data){
                  console.log("NewFeedManager:markCommentAsUnread::success:");
                  _comment = $data.data || null;
                  try{
                      $config.success(_comment);
                  }catch($e){
                      console.log("NewFeedManager:success:error:", $e);
                  }
              },
              error: function($e){
                  console.log("NewFeedManager:markCommentAsUnread::error:", $e);
                  try{
                      $config.error($e);
                  }catch($e){
                      console.log("NewFeedManager:markCommentAsUnread::error:e:",$e);
                  }

              }
          });
    }

    function createPost($userid, $content, $metadata, $config )
    {
        console.log("NewFeedManager.createPost($userid:", $userid, ", $content:", $content, ", metadata:", $metadata );

        $metadata                 = $metadata || {};
        $metadata.url             = $metadata.url || null;
        $metadata.title           = $metadata.title || null;
        $metadata.description     = $metadata.description || null ;
        $metadata.thumbnail_url   = $metadata.thumbnail_url || null ;
        $metadata.video_url       = $metadata.video_url || null ;
        $metadata.locale          = $metadata.locale || null ;
        $metadata.date            = $metadata.date || null ;
        $metadata.type            = $metadata.type || null ;
        $metadata.request_url     = $metadata.request_url || null ;
        $metadata.site_name       = $metadata.site_name || null ;
        $metadata.charset         = $metadata.charset || null ;

        $.ajax({
            url: cons("NEWSFEED_API_URL"),
            dataType: 'json',
            cache: false,
            data: {
                action                    : "create-post" ,
                userid                    : $userid ,
                content                   : $content ,
                metadata_url              : $metadata.url ,
                metadata_thumbnail_url    : $metadata.thumbnail_url ,
                metadata_video_url        : $metadata.video_url,
                metadata_title            : $metadata.title ,
                metadata_description      : $metadata.description,
                metadata_locale           : $metadata.locale ,
                metadata_date             : $metadata.date,
                metadata_type             : $metadata.type ,
                metadata_request_url      : $metadata.request_url ,
                metadata_site_name        : $metadata.site_name ,
                metadata_charset          : $metadata.charset

            },
            success: function( $data )
            {
                console.log("success:data:", $data);
                _posts = $data.data || [] ;
                console.log("posts:", $data);
                try{
                    $config.success( _posts );
                }catch(e)
                {
                    console.log("success:e:",e);
                }
            },
            error : function($e)
            {
                try{
                    $config.error($e);
                }catch(e){
                    console.log("error:e:",e);
                }

            }
        });
    }

    function getPost($userid, $pid, $config)
    {
        console.log("NewsFeedManager:getPost():pid:", $pid);
        $.ajax({
            url: cons("NEWSFEED_API_URL"),
            dataType: 'json',
            cache: false,
            data: {
                action : "get-post",
                userid : $userid,
                pid    : $pid,
            },

            success: function($info){
                console.log("NewsFeedManager:getPost::success:");
                _post = $info.data[0] || {};
                focus(_post);
                try{
                    $config.success(_post);
                }catch(e){
                    //console.log("NewsFeedManager:foucs is not defined");
                }
            },
            error: function($e){
                console.log("NewsFeedManager:getPost:error:", $e);
                try{
                    $config.error($e);
                }catch($e){
                    //console.log("NewsFeedManager:foucs is not defined");
                }

            }
        });
    }

    function getRelatedPosts($pid, $config)
    {
//        console.log("NewsFeedManager:getRelatedPosts(pid:"+$pid+ ")", $config );
        $config = $config || {};
        var limit  = $config.limit  || cons('DEFAULT_LIMIT');
        var offset = $config.offset || 0;
        var catagory = $config.catagory || "myposts";
        var action = "get-related-posts";
        var userid = $config.userid;

        switch(catagory){
          case "my-posts":
          case "myposts":
                action = "get-related-my-posts";
                break;
          case "posts":
          case "related-posts":
          case "new-posts":
          case "get-related-posts":
          default:
                action = "get-related-posts";
            break;
        }


        $.ajax({
             url: cons("NEWSFEED_API_URL"),
             dataType: 'json',
             cache: false,
             data: {
                action    : action,
                userid    : userid,
                catagory  : catagory,
                pid       : $pid,
                limit     : limit,
                offset    : offset
            },
             success: function($data){
//                console.log("VideoManager:getRelatedPosts:success:data:", $data);
                _related_posts = $data.data || [] ;
                try{
                    $config.success(_related_posts);
                }catch(e){
                    //console.log(e);
                }
            },
            error : function($data)
            {
//                console.log("NewsFeedManager:getRelatedPosts:error");
                try{
                    $config.success();
                }catch(e){
                    //
                }

            }
        });
    }

    function getPostInfo()
    {
        return _post;
    }

    function getPostsInfo()
    {
        return _posts;
    }

    function updateComment($userid, $comment_id, $comment, $config)
    {
        console.log("NewsFeedManager:updateComment(comment_id:"+$comment_id+", userid:"+$userid+", comment:"+$comment+")");
        $comment = sanitizeComment($comment);
        $config = $config || {};
        var metadata = $config.metadata || null;
        console.log("metadata:", metadata)
        $.ajax({
            url: cons("NEWSFEED_API_URL"),
            dataType: 'json',
            cache: false,
            data: {
                action          : "update-comment",
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

    function deleteComment( $userid, $comment_uid, $config )
    {
        console.log("NewFeedManager:deleteComment(userid:"+userid+", comment_uid:"+$comment_uid+")");
        $.ajax({
            url: cons("NEWSFEED_API_URL"),
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


    function postComment($userid, $pid, $comment, $config)
    {
        console.log("NewFeedManager:postComment(userid:"+$userid+", pid:"+$pid+", comment:"+$comment+")");
        $comment = sanitizeComment($comment);
        $config.metadata = $config.metadata || null;

        $.ajax({
            url: cons("NEWSFEED_API_URL"),
            dataType: 'json',
            cache: false,
            data: {
                    action   : "post-comment",
                    pid      : $pid,
                    userid   : $userid,
                    comment  : $comment,
                    metadata : $config.metadata
            },
            success: function($data)
            {
                _comment = $data.data || [] ;
                console.log("comment:", $data);
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


    function reply2Comment( $userid, $pid, $comment_id, $comment, $config )
    {
          console.log("NewFeedManager:reply2Comment(userid:", $userid, ", pid:", $pid, ", comment_id:", $comment_id, ", comment:", $comment, ")");
          $comment = sanitizeComment($comment);
      var metadata = $config.metadata || null;
          console.log("reply2Comment::metadata:", metadata);

      $.ajax({
          url: cons("NEWSFEED_API_URL"),
          dataType: 'json',
          cache: false,
          data: {
              action      : "reply-2-comment",
              userid      : $userid,
              pid         : $pid,
              comment_id  : $comment_id,
              comment     : $comment,
              metadata    : metadata
          },
          success: function($data)
          {
              _comment = $data.data || [] ;
              //console.log("NewFeedManager:reply2Comment:success:", $data);
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
      console.log("NewFeedManager:getCommentReplies(comment_id:", $comment_id, ", userid:", $userid , ", offset: ", $offset, ", limit:", $limit );

      $.ajax({
          url: cons("NEWSFEED_API_URL"),
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
              console.log("NewFeedManager:getCommentReplies:success:", _comments);
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

    function getLikes( $pid, $config )
    {
        console.log("NewFeedManager:getLikes(pid:"+$pid+")");
        $config = $config || {};

        $.ajax({
             url: cons("NEWSFEED_API_URL"),
              dataType: 'json',
            cache: false,
             data: {
                action : "get-post-likes",
                pid : $pid,
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


    function getUserPostComments($userid, $config)
    {
            console.log("NewFeedManager:getUserPostComments(userid:"+$userid+")");
            $config    = $config || {};
        var limit      = $config.limit || cons("DEFAULT_LIMIT");
        var offset     = $config.offset || 0;

        $.ajax({
              url: cons("NEWSFEED_API_URL"),
              dataType: 'json',
              cache: false,
              data: {
                  action : "get-user-post-comments",
                  userid : $userid,
                  limit  : limit,
                  offset : offset
             },
             success: function($data){
                console.log("NewFeedManager.getUserPostComments::success:::data:",$data)
                _comments = $data.data || [];
                try{
                    $config.success(_comments);
                }catch(e){
                    //console.log(e);
                }
            }
        });
    }


    function getComments( $userid, $pid, $config)
    {
        console.log("NewFeedManager:getComments(pid:"+$pid+")");
        $config = $config || {};
        var limit      = $config.limit || cons("DEFAULT_LIMIT");
        var offset     = $config.offset || 0;

        $.ajax({
             url: cons("NEWSFEED_API_URL"),
              dataType: 'json',
            cache: false,
             data: {
                action : "get-post-comments",
                userid : $userid,
                pid    : $pid,
                limit  : limit,
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

    function getComment( $userid, $comment_id, $config)
    {
        console.log("NewFeedManager:getComment($comment_id:"+$comment_id+")");
        $config = $config || {};
        var limit      = $config.limit || cons("DEFAULT_LIMIT");
        var offset     = $config.offset || 0;

        $.ajax({
              url: cons("NEWSFEED_API_URL"),
              dataType: 'json',
              cache: false,
              data: {
                  action        : "get-post-comment",
                  userid        : $userid,
                  comment_id   : $comment_id,
                  limit         : limit,
                  offset        : offset
              },
              success: function($data){
                  _comment = $data.data[0] || [];
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


    function getUserInfo( $uid, $config)
    {
        console.log("NewFeedManager:getUserInfo(uid:"+$uid+ ")" );

        $.ajax({
             url: cons("NEWSFEED_API_URL"),
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


    function search( $userid, $keywords, $config )
    {
            console.log("NewFeedManager:search(keywords:"+$keywords+ "), userid:", $userid, ", config:" , $config );
            $config = $config || {};
        var limit  = $config.limit  || cons('DEFAULT_LIMIT');
        var offset = $config.offset || 0;
        var keywords = $keywords;

        $.ajax({
             url: cons("SEARCH_API_URL"),
             dataType: 'json',
             cache: false,
             data: {
                action    : "search-posts",
                keywords  : $keywords,
                userid    : $userid,
                limit     : limit,
                offset    : offset
            },
             success: function($data){
                console.log("NewFeedManager:search:success:data:", $data);
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
                console.log("NewFeedManager:search:error");
                try{
                    $config.success();
                }catch(e){
                    //
                }

            }
        });
    }


    function add2PostReadHistory( $userid, $pid )
    {
        console.log("NewFeedManager:add2PostReadHistory(userid:"+$userid+ ", pid:",$pid,")" );
        $.ajax({
             url: cons("NEWSFEED_API_URL"),
              dataType: 'json',
            cache: false,
             data: {
                action : "add-post-2-read-history",
                userid : $userid,
                pid : $pid
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


    function likePost( $userid, $pid, $liked, $config )
    {
        console.log("NewsFeedManager:likePost(userid:"+$userid+ ", pid:"+$pid+", liked:"+$liked+")" );
        $.ajax({ url: cons("NEWSFEED_API_URL"),
                 dataType: 'json',
                 cache: false,
                 data: {
                      action : "post-liked",
                      pid : $pid,
                      userid : $userid,
                      liked : $liked
                 },
                 success: function($data){
    //                _likes = $data.data || [] ;
                    console.log("likePost:success:data",$data);
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

    function dislikePost( $userid, $pid, $disliked, $config )
    {
        console.log("NewsFeedManager:dislikePost(userid:"+$userid+ ", pid:"+$pid+", disliked:"+$disliked+")" );
        $.ajax({ url: cons("NEWSFEED_API_URL"),
                 dataType: 'json',
                 cache: false,
                 data: {
                      action     : "post-disliked",
                      pid        : $pid,
                      userid     : $userid,
                      disliked   : $disliked
                 },
                 success: function($data){
    //                _likes = $data.data || [] ;
                    console.log("dislikePost:success:data",$data);
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


    function likePostComment( $userid, $pid, $comment_id, $liked, $config )
    {
        console.log("NewsFeedManager:likePostComment(userid:", $userid, ", pid:", $pid, ", comment_id:", comment_id , ", liked:" , $liked , ")" );
        $.ajax({ url: cons("NEWSFEED_API_URL"),
                 dataType: 'json',
                 cache: false,
                 data: {
                      action : "post-comment-liked",
                      pid : $pid,
                      userid : $userid,
                      liked : $liked,
                      comment_id : $comment_id
                 },
                 success: function($data){
    //                _likes = $data.data || [] ;
                    //console.log("likePostComment:success:data",$data);
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

    function dislikePostComment( $userid, $pid, $comment_id, $disliked, $config )
    {
        console.log("NewFeedManager:dislikePostComment(userid:" , $userid, ", pid:", $pid, ", $comment_id:", $comment_id , ", disliked:", $disliked, ")" );
        $.ajax({ url: cons("NEWSFEED_API_URL"),
                 dataType: 'json',
                 cache: false,
                 data: {
                      action      : "post-comment-disliked",
                      pid         : $pid,
                      userid      : $userid,
                      comment_id  : $comment_id,
                      disliked    : $disliked
                 },
                 success: function($data){
    //                _likes = $data.data || [] ;
                  //  console.log("dislikePostComment:success:data",$data);

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


    function reply2PostComment( $userid, $pid, $comment_id, $comment, $config )
    {
        console.log("NewFeedManager:reply2PostComment(userid:" , $userid, ", pid:", $pid, ", $comment_id:", $comment_id , ", comment:", $comment, ")" );
        $.ajax({ url: cons("NEWSFEED_API_URL"),
                 dataType: 'json',
                 cache: false,
                 data: {
                      action      : "post-comment-reply",
                      pid         : $pid,
                      userid      : $userid,
                      comment_id  : $comment_id,
                      comment     : $comment
                 },
                 success: function($data){
    //                _likes = $data.data || [] ;
                    console.log("NewFeedManager:success:data",$data);
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

    function getEmbedCode( $pid, $post )
    {   //console.log("location.protocol:", location.protocol)
        return '<iframe src="'+location.protocol +"//"+ location.host+'/embed/p/'+$pid+'" width="100%" height="100%" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>';
        //return '<iframe id="post-content-' + $pid + '" src="' + $src + '" width="100%" height="100%" style="min-height:400px;" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>';
        //return '<iframe src="https://lindsayfilm.com/embed/'+$vid+'" width="100%" height="100%" frameborder="0" webkitallowfullscreen="" mozallowfullscreen="" allowfullscreen=""></iframe>';
    }

    function getOGSEmbedCode($pid, $post){
        return '<iframe src="'+$post.metadata_video_url+'" width="100%" height="100%" style="min-height:400px;" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>'
    }

    function getOpenEmbedCode($pid, $post){
        return '<iframe src="'+$post.metadata_video_url+'" width="100%" height="100%" style="min-height:400px;" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>'
    }



    function savePostMetadata($userid, $pid, $metadata, $config )
    {
        console.log( "NewFeedManager:savePostMetadata:userid:", $userid, ", pid:", $pid, ", metadata:", $metadata );
        //console.log( "userid:", $userid, ", pid:", $pid);
        $config = $config || {};

        $.ajax({
             url: cons("NEWSFEED_API_URL"),
             dataType: 'json',
             cache: false,
             data:{ action: "save-post-metadata",
                    pid : $pid,
                    userid : $userid,
                    metadata : $metadata
             },
             success: function($data){
                 console.log("NewFeedManager.savePostMetadata():success:data:", $data);
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

    function deletePost( $userid, $pid, $config )
    {
        console.log("NewFeedManager:deletePost(pid:" + $pid + ")");
        $config = $config || {};
        $.ajax({
             url: cons("NEWSFEED_API_URL"),
             dataType: 'json',
             cache: false,
             data: { action: "delete-post",
                     pid : $pid,
                     userid : $userid
             },
             success : function($data){
               //console.log("NewFeedManager:deletePost:success(pid:"+$pid+")");
                try{
                    $config.success($data);
                }catch($e){
                    console.log("NewFeedManager:deletePost:success:error:", $e)
                }
            },
            error : function($data){
                try{
                    $config.error($data);
                }catch($e){
                    console.log("NewFeedManager:deletePost:error:", $e)
                }
            }
        });
    }

    function getUserNewsFeed($userid, $config)
    {
            console.log("NewsFeedManager:getUserNewsFeed(userid:"+$userid+")");
            $config = $config || {};
        var limit = $config.limit || cons("DEFAULT_LIMIT");
        var offset = $config.offset || 0;

        $.ajax({
                  url: cons("NEWSFEED_API_URL"),
                  dataType: 'json',
                  cache: false,
                  data: {
                    action : "get-user-newsfeed",
                    userid : $userid,
                    limit  : limit,
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

    function getNewsFeed($userid, $config)
    {
            console.log("NewsFeedManager:getNewsFeed(userid:"+$userid+")");
            $config = $config || {};
        var limit = $config.limit || cons("DEFAULT_LIMIT");
        var offset = $config.offset || 0;

        $.ajax({
             url: cons("NEWSFEED_API_URL"),
              dataType: 'json',
            cache: false,
             data: {
                action : "get-newsfeed",
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


/*
    function getUserWatchHistory($userid, $config)
    {
        console.log( "NewFeedManager:getUserWatchHistory(userid:", $userid, ")");
        $config = $config || {};
        var limit = $config.limit || cons("DEFAULT_LIMIT");
        var offset = $config.offset || 0;

        $.ajax({
             url: cons("NEWSFEED_API_URL"),
             dataType: 'json',
             cache: false,
             data:{ action  : "get-user-watch-history",
                    userid  : $userid,
                    limit : limit,
                    offset : offset
             },
             success: function($data){
                 console.log("NewFeedManager:getUserWatchHistory.success:data:",$data);
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
*/

    function fetchURL_oembed_and_ogs( $url, $config ){
          console.log("NewFeedManager::fetchURL_oembed_and_ogs:url:", $url);

          $.ajax({
                url: '/oembed_ogs',
                dataType: 'json',
                cache: false,
                data: {
                    url : $url,
                },

                success: function($info){
                    try{
                        $config.success($info);
                    }catch($e){
                        console.log("NewFeedManager:success:error:", $e);
                    }
                },
                error: function($e){
                    console.log("NewFeedManager:success:error:", $e);
                    try{
                        $config.error($e);
                    }catch($e){
                        console.log("NewFeedManager:error:", $e);
                    }
                }
            });

    }

    function fetchURLOembed($url, $config){
          console.log("NewFeedManager::fetchURLOembed:url:", $url);

          $.ajax({
                url: '/oembed',
                dataType: 'json',
                cache: false,
                data: {
                    url : $url,
                },

                success: function($info){

                    try{
                        $config.success($info);
                    }catch(e){
                        //console.log("NewFeedManager:foucs is not defined");
                    }
                },
                error: function($e){
                    console.log(":error:", $e);
                    try{
                        $config.error($e);
                    }catch($e){
                        //console.log("NewFeedManager:foucs is not defined");
                    }

                }
            });

    }

    function fetchURLOpenGraph($url, $config){
          console.log("NewFeedManager::fetchURLOpenGraph:url:", $url);

          $.ajax({
                url: '/ogs',
                dataType: 'json',
                cache: false,
                data: {
                    url : $url,
                },

                success: function($info){

                    try{
                        $config.success($info);
                    }catch(e){
                        //console.log("NewFeedManager:foucs is not defined");
                    }
                },
                error: function($e){
                    console.log(":error:", $e);
                    try{
                        $config.error($e);
                    }catch($e){
                        //console.log("NewFeedManager:foucs is not defined");
                    }

                }
            });

    }

    function findURLs($input)
    {
       //console.log("findURLs:input:", $input);
       var words = []
           words = $input.split(" ");
           _urls = [];

       for( var i = 0; i < words.length; i++ )
       {
           var word = words[i];
           var _isURL = isURL( word );
           if( _isURL ){
              _urls.push(word)
           }
       }

       return _urls;
    }

    //move this to NewsFeedManager
    function getCardHTMLbyURL( $url, $config, $cb)
    {

            //$config.type = "post" "comment"
          fetchURL_oembed_and_ogs( $url, { success : function( $data  ){
               //console.log("fetchURL_oembed_and_ogs:success:data:", $data)
               var card_metadata = {  url           : $url, //$data.ogUrl,
                                      title         : $data.ogs.ogTitle? $data.ogs.ogTitle : null,
                                      description   : $data.ogs.ogDescription ? $data.ogs.ogDescription : null,
                                      thumbnail_url : $data.ogs.ogImage ? $data.ogs.ogImage.url : null,
                                      video_url     : $data.ogs.ogVideo ? $data.ogs.ogVideo.url : null ,
                                      locale        : $data.ogs.ogLocale? $data.ogs.ogLocale : null,
                                      date          : $data.ogs.ogDate? $data.ogs.ogDate : null ,
                                      type          : $data.ogs.ogType? $data.ogs.ogType : null,
                                      request_url   : $data.ogs.requestUrl? $data.ogs.requestUrl : null,
                                      site_name     : $data.ogs.ogSiteName? $data.ogs.ogSiteName : null,
                                      charset       : $data.ogs.charset? $data.ogs.charset : null,
                                      ogs           : $data.ogs? $data.ogs : null,
                                      oembed        : $data.oembed? $data.oembed : null
                                   }
              //TODO: return different html based on if this card is for a comment or a post, also should know if this if postcard size or regular size

               var card = createCard( card_metadata, $config );

               $cb( card, card_metadata )
          }})
    }

    //move this to NewsFeedManager
    function findCardOnKeyEvent($key, $config, $cb)
    {
              //$config.type = "post" "comment"
              var key = $key.keyCode;
              var elm = $key.target;
              var keyed = $(elm).val();

              var _urls = findURLs(keyed)

              if( _urls.length > 0 ){
                  var last_index = _urls.length-1
                  var url = _urls[last_index]
                  getCardHTMLbyURL(url, $config, $cb)
             }
    }

    function validatePostComment(msg)
    {
        console.log("NewFeedManager:validatePostComment(msg:"+msg+")");
        return ;
    }

    function isURL(str) {
        var urlRegex = '^(?!mailto:)(?:(?:http|https|ftp)://)(?:\\S+(?::\\S*)?@)?(?:(?:(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}(?:\\.(?:[0-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))|(?:(?:[a-z\\u00a1-\\uffff0-9]+-?)*[a-z\\u00a1-\\uffff0-9]+)(?:\\.(?:[a-z\\u00a1-\\uffff0-9]+-?)*[a-z\\u00a1-\\uffff0-9]+)*(?:\\.(?:[a-z\\u00a1-\\uffff]{2,})))|localhost)(?::\\d{2,5})?(?:(/|\\?|#)[^\\s]*)?$';
        var url = new RegExp(urlRegex, 'i');
        return str.length < 2083 && url.test(str);
    }

    function createCard($metadata, $config)
    {
            console.log( "createCard:$metadata:", $metadata, ", config:",$config )
            var tmpl ;
            switch( $config.type ){
              case "comment":
              case "reply-2-comment" :

                tmpl = "<div class='card mb-3 box' > \
                            <input id='title' value='${title}' type='hidden' /> \
                            <input id='title_short' value='${title_short}' type='hidden' /> \
                            <input id='description' value='${description}' type='hidden' /> \
                            <input id='description_short' value='${description_short}' type='hidden' /> \
                            <input id='thumbnail_url' value='${thumbnail_url}' type='hidden' /> \
                            <input id='url' value='${url}' type='hidden' /> \
                            <input id='date' value='${date}' type='hidden' /> \
                            <div class='row g-0'> \
                              <div class='col-md-4'> \
                                <img src='${thumbnail_url}' alt='${title}'> \
                              </div> \
                              <div class='col-md-8'> \
                                <div class='card-body'> \
                                  <h5 class='card-title' style='text-align:left;'>${title}</h5> \
                                  <!--p class='card-text'>${description}</p--> \
                                  <!--p class='card-text'><small class='text-muted'>Last updated ${last_modified} ago</small></p--> \
                                </div> \
                              </div> \
                            </div> \
                          </div>".split("${thumbnail_url}").join( $metadata.thumbnail_url )
                                 .split("${title}").join( $metadata.title )
                                 .split("${description}").join( description.title )
                                 .split("${title_short}").join( shortenText( $metadata.title, 120 ) )
                                 .split("${description_short}").join( shortenText( $metadata.description, 120 ))
                                 .split("${date}").join( $metadata.date )
                                 .split("${url}").join( $metadata.url )

                break;

            case "post":
            default:
                tmpl = "<div class='card mb-3 box' > \
                            <input id='title' value='${title}' type='hidden' /> \
                            <input id='title_short' value='${title_short}' type='hidden' /> \
                            <input id='description' value='${description}' type='hidden' /> \
                            <input id='description_short' value='${description_short}' type='hidden' /> \
                            <input id='thumbnail_url' value='${thumbnail_url}' type='hidden' /> \
                            <input id='url' value='${url}' type='hidden' /> \
                            <input id='date' value='${date}' type='hidden' /> \
                            <div class='row g-0'> \
                              <div class='col-md-4'> \
                                <img src='${thumbnail_url}' alt='${title}'> \
                              </div> \
                              <div class='col-md-8'> \
                                <div class='card-body'> \
                                  <h5 class='card-title' style='text-align:left;'>${title_short}</h5> \
                                  <p class='card-text'>${description_short}</p> \
                                  <!--p class='card-text'><small class='text-muted'>Last updated ${last_modified} ago</small></p--> \
                                </div> \
                              </div> \
                            </div> \
                          </div>".split("${thumbnail_url}").join( $metadata.thumbnail_url )
                                 .split("${title}").join( $metadata.title )
                                 .split("${description}").join( description.title )
                                 .split("${title_short}").join( shortenText( $metadata.title, 120 ) )
                                 .split("${description_short}").join( shortenText( $metadata.description, 120 ))
                                 .split("${date}").join( $metadata.date )
                                 .split("${url}").join( $metadata.url )
                break;

            }

            return tmpl;
    }


    function createNewsFeedInput()
    {
       return "<div class='container px-4'> \
                   <div class='row gx-5'> \
                     <div class='col'> \
                      <div class='p-3 border bg-light'> \
                         <div id='comment-container' class='form-floating'>  \
                             <textarea class='form-control' placeholder='Leave a comment here' style='min-height: 100px'></textarea> \
                             <label for='floatingTextarea2'>Create a Post</label> \
                         </div>  \
                         <div id='card-container' class='collapse'>  \
                               ... \
                         </div> \
                         <div id='actions-container' class='float-end'>  \
                            <button id='send-btn' type='button' class='btn btn-primary'>Send</button> \
                         </div> \
                      </div> \
                     </div> \
                   </div> \
                 </div>"
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
        init                    : init,
        cons                    : cons,
        isURL                   : isURL,

        markCommentAsUnread     : markCommentAsUnread,
        markCommentAsRead       : markCommentAsRead,

        fetchURLOpenGraph       : fetchURLOpenGraph,
        fetchURL_oembed_and_ogs : fetchURL_oembed_and_ogs,
        fetchURLOembed          : fetchURLOembed,

        createCard              : createCard,
        getUserNewsFeed         : getUserNewsFeed,
        getNewsFeed             : getNewsFeed,

        shortenText             : shortenText,
        createNewsFeedInput     : createNewsFeedInput,

        createPost              : createPost,
        getPost                 : getPost ,
        getRelatedPosts         : getRelatedPosts,
        getPostsInfo            : getPostsInfo ,
        getPostInfo             : getPostInfo ,
        deletePost              : deletePost,

        likePost                : likePost,
        dislikePost             : dislikePost,
        getLikes                : getLikes,

        savePostMetadata        : savePostMetadata,
        getEmbedCode            : getEmbedCode,
        getOGSEmbedCode         : getOGSEmbedCode,
        getOpenEmbedCode        : getOpenEmbedCode,

        reply2PostComment       : reply2PostComment,
        dislikePostComment      : dislikePostComment,
        likePostComment         : likePostComment,

        deleteComment           : deleteComment,
        postComment             : postComment,
        reply2Comment           : reply2Comment,
        getCommentReplies       : getCommentReplies,
        updateComment           : updateComment,

        getUserPostComments     : getUserPostComments,
        getComments             : getComments,
        getComment              : getComment,

        search                  : search,
        add2PostReadHistory     : add2PostReadHistory,

        findCardOnKeyEvent      : findCardOnKeyEvent,
        getCardHTMLbyURL        : getCardHTMLbyURL,
        findURLs                : findURLs
    }
}
