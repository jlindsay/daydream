/**
 * author:Joshua Lindsay
 * email:j@lindsayfilm.com
 * twitter:@jlindsay
 * https://www.lindsayfilm.com
 * Software can be used for Good or Evil.
 * Some people die rich, some die poor, the result is the same.
 */


function NewsFeedManager()
{
    var self        = this;
//    var _um;      = require('./UserManager');
    var _notes      = require('./NotificationManager');

    var trim        = require('trim');

    var utils       = require('./Utils');
    var _           = require('underscore')
        _.mixin(require('underscore.inflections'));

    var mysql = require('promise-mysql');
        mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'password',
            database: 'daydream'
        }).then(function(conn){
            _con = conn;
        });


    var _is_loggedin    = false;
    var _is_admin       = false;
    var _is_moderator   = false;
    var _is_staff       = false;

    //var _post = {};
    var _posts = [];
    var _comments = [];
    var _likes  = [];
    var _total_comments = 0;

    var _limit = 20;
    var _search_resutls;

    var DEFAULT_COMMENTS_LIMIT  = 5;
    var DEFAULT_LIKES_LIMIT     = 20;
    var DEFAULT_DISLIKES_LIMIT  = 20;

    var CONTENT_SHORT_LENGTH = 120;
    var DESCRIPTION_SHORT_LENGTH = 240;

    function createPost( $userid, $content, $metadata, $cb )
    {
//            console.log( "NewsFeedManager.createPost():userid:", $userid , ", content:", $content, ", $metadata:", $metadata,);
            $userid                   = utils.addslashes( trim( $userid ));
            $content                  = utils.addslashes( trim( $content ));
        var date_created              = utils.DBDate();
        var last_modified             = date_created;
        var uid                       = utils.createBase64UUID();
        var pid                       = uid;

        var metadata_title            = $metadata.metadata_title          ? utils.addslashes( trim( $metadata.metadata_title )) : null;
        var metadata_description      = $metadata.metadata_description    ? utils.addslashes( trim( $metadata.metadata_description )) : null;
        var metadata_thumbnail_url    = $metadata.metadata_thumbnail_url  ? utils.addslashes( trim( $metadata.metadata_thumbnail_url )) : null;
        var metadata_url              = $metadata.metadata_url            ? utils.addslashes( trim( $metadata.metadata_url )) : null;
        var metadata_video_url        = $metadata.metadata_video_url      ? utils.addslashes( trim( $metadata.metadata_video_url )) : null;

        var metadata_site_name        = $metadata.metadata_site_name   ? utils.addslashes( trim( $metadata.metadata_site_name )) : null;
        var metadata_locale           = $metadata.metadata_locale      ? utils.addslashes( trim( $metadata.metadata_locale )) : null;
        var metadata_date             = $metadata.metadata_date        ? utils.addslashes( trim( $metadata.metadata_date )) : null;
        var metadata_type             = $metadata.metadata_type        ? utils.addslashes( trim( $metadata.metadata_type )) : null;

        var metadata_request_url      = $metadata.metadata_request_url ? utils.addslashes( trim( $metadata.metadata_request_url )) : null;
        var metadata_site_name        = $metadata.metadata_site_name   ? utils.addslashes( trim( $metadata.metadata_site_name )) : null;

        var metadata_charset          = $metadata.metadata_charset     ? utils.addslashes( trim( $metadata.metadata_charset )) : null;


        var SQL = "INSERT INTO posts   \
                    ( userid, uid, content, metadata_title, metadata_description, metadata_thumbnail_url,  metadata_video_url, metadata_url, metadata_date, metadata_locale, metadata_site_name, metadata_request_url, date_created, last_modified )   \
                    VALUES   \
                    ( '{{userid}}', '{{uid}}',  '{{content}}', '{{metadata_title}}', '{{metadata_description}}' , '{{metadata_thumbnail_url}}' , '{{metadata_video_url}}', '{{metadata_url}}' , '{{metadata_date}}' , '{{metadata_locale}}', '{{metadata_site_name}}', '{{metadata_request_url}}' , '{{date_created}}', '{{last_modified}}' );   \
                    ".split("{{userid}}").join($userid)
                     .split("{{uid}}").join(uid)
                     .split("{{content}}").join($content)
                     .split("{{date_created}}").join(date_created)
                     .split("{{last_modified}}").join(last_modified)
                     .split("{{metadata_url}}").join(metadata_url)
                     .split("{{metadata_title}}").join(metadata_title)
                     .split("{{metadata_description}}").join(metadata_description)
                     .split("{{metadata_thumbnail_url}}").join(metadata_thumbnail_url)
                     .split("{{metadata_video_url}}").join(metadata_video_url)
                     .split("{{metadata_locale}}").join(metadata_locale)
                     .split("{{metadata_date}}").join(metadata_date)
                     .split("{{metadata_site_name}}").join(metadata_site_name)
                     .split("{{metadata_request_url}}").join(metadata_request_url)

                      //console.log(SQL);
            //queryPosts( $userid, SQL, {}, function($data){
            query( $userid, SQL, {}, function($data){
                console.log("queryPosts:success:")
                try{
                      $cb({
                          uid           : uid,
                          pid           : pid,
                          userid        : $userid,
                          data          : $data,
                          date_created  : date_created,
                          last_modified : last_modified
                      });

                }catch($e){
                    console.log("error:", $e);
                }
            });

    }

    function deletePost( $userid, $pid, $config, $cb )
    {
        console.log("NewsFeedManager.deletePost():userid:", $userid, ", pid:", $pid, "cb:", $cb )

          $pid    =  utils.addslashes( trim( $pid ) );
          $userid =  utils.addslashes( trim( $userid ) );

          var SQL     = "SELECT * FROM comments WHERE pid='"+ $pid +"' ;"
          var POST_SQL = "DELETE FROM posts WHERE uid = '" + $pid + "' ;";

              query( $userid, SQL, {}, function( $comments ){
                  //console.log("NewsFeedManager.deletePost::comments:",$comments)
                  var COMMENT_SQL = "DELETE FROM comments  WHERE "
                  var LIKE_SQL    = "DELETE FROM liked WHERE "
                  var count = 0;


                  _.each( $comments, function( $comment ){
                      //console.log("count:",count)
                      if( count > 0 ){
                          COMMENT_SQL += " OR ";
                          LIKE_SQL += " OR ";
                      }

                      count ++;

                      COMMENT_SQL += " uid = '" + $comment.uid + "' OR parent_comment_id = '" + $comment.uid + "'  "
                      LIKE_SQL += " comment_id = '" + $comment.uid + "'  "
                  })

                  if(count>0){
                      COMMENT_SQL += "  AND   ";
                      LIKE_SQL += "  AND   ";
                  }

                  COMMENT_SQL += " pid = '" + $pid + "' ";
                  LIKE_SQL += " pid = '" + $pid + "' ";



                  console.log( "deletePost:COMMENt_SQL:", COMMENT_SQL )
                  console.log( "deletePost:LIKE_SQL:", LIKE_SQL )

                  query( $userid, COMMENT_SQL, {}, function( $results ){
                    //console.log( "COMMENT_SQL::$results:", $results );
                    query( $userid, LIKE_SQL, {}, function( $results ){
                        //console.log( "LIKE_SQL::$results:", $results );
                        query( $userid, POST_SQL, {}, function( $results ){
                          $cb( $results );
                        })
                    })
                  });
              });
    }

    function add2History( userid, pid, config, cb )
    {
        console.log("NewsFeedManager:add2History:userid:", userid, ", pid:", pid );

        pid             =  utils.addslashes( trim( pid ) );
        userid          =  ( userid )? utils.addslashes( trim( userid ) ) : null;

        var page               = trim(config.page) || "NA";
        var platform           = 'na';
        var browser            = 'na';
        var browser_version    = 'na';

        var is_mobile = false;//__SESSION['is_mobile'];
        var is_tablet = false;//__SESSION['is_tablet'];
        var is_ios = false;//__SESSION['is_ios'];
        var is_andriod = false;//__SESSION['is_android'];
        var is_pc = false;//__SESSION['is_pc'];

        var date_created = utils.DBDate();
        var uid = utils.createBase64UUID();

        //console.log("VideoManager.add2History:date_created:", date_created)

        var SQL = "INSERT INTO post_view_history   \
                    ( pid, uid, userid, page, date_created, platform, browser, browser_version, is_mobile , is_tablet, is_ios , is_andriod, is_pc )   \
                    VALUES   \
                    ( '{{pid}}', '{{uid}}', '{{userid}}', '{{page}}', '{{date_created}}' , '{{platform}}', '{{browser}}', '{{browser_version}}', '{{is_mobile}}', '{{is_tablet}}' , '{{is_ios}}', '{{is_andriod}}', '{{is_pc}}');  \
                  ".split("{{pid}}").join(pid)
                   .split("{{uid}}").join(uid)
                   .split("{{userid}}").join(userid)
                   .split("{{page}}").join(page)
                   .split("{{date_created}}").join(date_created)
                   .split("{{platform}}").join(platform)
                   .split("{{browser}}").join(browser)
                   .split("{{browser_version}}").join(browser_version)
                   .split("{{is_mobile}}").join(is_mobile)
                   .split("{{is_tablet}}").join(is_tablet)
                   .split("{{is_ios}}").join(is_ios)
                   .split("{{is_andriod}}").join(is_andriod)
                   .split("{{is_pc}}").join(is_pc)

          query( userid, SQL, config, cb );
    }


    function savePostMetadata( userid, pid, metadata, config, cb )
    {
          console.log("NewsFeedManager.savePostMetadata():userid:", userid, ", pid:", pid, ", metadata:", metadata);

            pid                 =  utils.addslashes( trim( pid ) );
            userid              =  utils.addslashes( trim( userid ) );
            metadata            =  metadata || [];

        var is_public           =  metadata['is_public'] ? utils.addslashes( trim( metadata['is_public'] ) ) : null;
        if( is_public ){
            is_public           =  ( is_public == 'true' )? 1 : is_public;
            is_public           =  ( is_public == 'false' )? 0 : is_public;
        }

        var url                       = metadata.url                    ? utils.addslashes( trim( metadata.url ) ) : null;
        var keywords                  = metadata.keywords               ? utils.addslashes( trim( metadata.keywords ) ) : null;
        var catagory                  = metadata.catagory               ? utils.addslashes( trim( metadata.catagory ) ) : null;
//        var title                   = metadata.title                  ? utils.addslashes( trim( metadata.title ) ) : null;
//        var description             = metadata.description            ? utils.addslashes( trim( metadata.description ) ) : null;
//        var content                 = metadata.content                ? utils.addslashes( trim( metadata.content ) ) : null;
        var metadata_title            = metadata.metadata_title         ? utils.addslashes( trim( metadata.metadata_title ) ) : null;
        var metadata_description      = metadata.metadata_description   ? utils.addslashes( trim( metadata.metadata_description ) ) : null;
        var metadata_thumbnail_url    = metadata.metadata_thumbnail_url ? utils.addslashes( trim( metadata.metadata_thumbnail_url ) ) : null;
        var metadata_video_url        = metadata.metadata_video_url     ? utils.addslashes( trim( metadata.metadata_video_url ) ) : null;
        var metadata_locale           = metadata.metadata_locale        ? utils.addslashes( trim( metadata.metadata_locale ) ) : null;
        var metadata_date             = metadata.metadata_date          ? utils.addslashes( trim( metadata.metadata_date ) ) : null;
        var metadata_type             = metadata.metadata_type          ? utils.addslashes( trim( metadata.metadata_type ) ) : null;
        var metadata_request_url      = metadata.metadata_request_url   ? utils.addslashes( trim( metadata.metadata_request_url ) ) : null;
        var metadata_site_name        = metadata.metadata_site_name     ? utils.addslashes( trim( metadata.metadata_site_name ) ) : null;
        var metadata_charset          = metadata.metadata_charset       ? utils.addslashes( trim( metadata.metadata_charset ) ) : null;

        var content                   = metadata.content                ? utils.addslashes( trim( metadata.content ) ) : null;

        var date_created        = utils.DBDate();
        var uid                 = utils.createBase64UUID();


/*
        if( !metadata_title && !metadata_description && !thumbnail_url ){
            return;
        }
*/
        var count = 0;

        var SQL = 'UPDATE posts SET ';
/*            if( content ){
                //SQL     += count == 0? '' : ", ";
                //count   += 1;
                SQL     += ' content = "' + content + '" ';
            }
*/
            //console.log("metadata_title:",metadata_title)
            if( content ){
                SQL     += count == 0? '' : ", ";
                count++;
                SQL     += ' content = "' + content + '" ';
            }
            if( metadata_title ){
                SQL     += count == 0? '' : ", ";
                count++;
                SQL     += ' metadata_title = "' + metadata_title + '" ';
            }
            if( metadata_description ){
                SQL     += count == 0? '' : ", ";
                count++;
                SQL     += ' metadata_description = "'+ metadata_description +'" ';
            }
            if( metadata_thumbnail_url ){
                SQL     += count == 0? '' : ", ";
                count++;
                SQL     += ' metadata_thumbnail_url = "' + metadata_thumbnail_url + '" ';
            }
            if( metadata_locale ){
                SQL     += count == 0? '' : ", ";
                count++;
                SQL     += ' metadata_locale = "' + metadata_locale + '" ';
            }

            if( metadata_date ){
                SQL     += count == 0? '' : ", ";
                count++;
                SQL     += ' metadata_date = "' + metadata_date + '" ';
            }

            if( metadata_type ){
                SQL     += count == 0? '' : ", ";
                count++;
                SQL     += ' metadata_type = "' + metadata_type + '" ';
            }
            if( metadata_request_url ){
                SQL     += count == 0? '' : ", ";
                count++;
                SQL     += ' metadata_request_url = "' + metadata_request_url + '" ';
            }
            if( metadata_site_name ){
                SQL     += count == 0? '' : ", ";
                count++;
                SQL     += ' metadata_site_name = "' + metadata_site_name + '" ';
            }
            if( metadata_charset ){
                SQL     += count == 0? '' : ", ";
                count++;
                SQL     += ' metadata_charset = "' + metadata_charset + '" ';
            }
            if( is_public  ){
                SQL     += count == 0? '' : ", ";
                count++;
                SQL     += ' is_public = "' + is_public + '" ';
            }
/*
            if( catagorys ){
                SQL     += count==0? '' : ", ";
                count   += 1;
                SQL     += ' catagorys = "'+ catagorys + '" ';
            }
            if( keywords ){
                SQL     +=  count==0? '' : ", ";
                count  += 1;
                SQL     += ' keywords = "' + keywords + '" ';
            }
*/


            if( count == 0 ){
                cb({"status":"error", "message":"something is wrong with your metadata inputs"})
                return;//should probably rturn an error;

            }

            SQL += ' WHERE uid = "' + pid + '";';
            //console.log("SQL:", SQL)
            query( userid, SQL, config, function(data){
                getPost( userid, pid, config, cb );
            });

    }


    function getPost( $userid, $pid, $config, $cb )
    {
            //console.log("NewsFeedManager:getPost():userid,", $userid, ", pid:", $pid );

            $userid =  $userid? utils.addslashes( trim( $userid ) ) : null;
            $pid    =  $pid? utils.addslashes( trim( $pid ) ) : null;

        var SQL = "SELECT posts.*, \
                          posts.uid AS pid, \
                          users.uid AS userid, \
                          users.profile_url, \
                          users.first_name, \
                          users.last_name, \
                          users.level, \
                          CONCAT( users.first_name, ' ' , users.last_name) AS full_name,  \
                          ( SELECT COUNT(*) FROM followers WHERE followers.userid = users.uid ) AS total_followers ,   \
                          ( SELECT COUNT(*) FROM comments WHERE comments.pid = posts.uid ) AS total_comments, \
                          ( SELECT COUNT(*) FROM comments WHERE comments.type = 'comment' AND comments.pid = posts.uid ) AS total_replies_2_post , \
                          ( SELECT COUNT(*) FROM comments WHERE comments.type = 'reply-2-comment' AND comments.pid = posts.uid ) AS total_replies_2_comments , \
                          ( SELECT COUNT(*) FROM liked WHERE liked.pid = posts.uid AND liked.status = 'true' ) AS total_likes , \
                          ( SELECT COUNT(*) FROM liked WHERE liked.pid = posts.uid AND liked.status = 'false' ) AS total_dislikes \
                FROM posts \
                    JOIN users ON users.uid = posts.userid  \
                        WHERE ( posts.uid = '{{pid}}' AND posts.is_public > 0 ) \
                          OR  ( posts.uid = '{{pid}}' AND userid = '{{userid}}' ) \
            ;".split("{{pid}}").join( $pid )
              .split("{{userid}}").join( $userid )

              queryPosts( $userid, SQL, $config, $cb );

    }

    function getPostAbsolute(userid, pid, config, cb )
    {
            //console.log("NewsFeedManager:getPost():userid,", userid, ", pid:", pid );
            userid = userid? trim( userid ) : null;
            pid    = pid? trim( pid ) : null;

        var SQL = "SELECT posts.*, \
                          posts.uid AS pid , \
                          users.uid AS userid, \
                          users.profile_url, \
                          users.first_name, \
                          users.last_name, \
                          users.level, \
                          CONCAT( users.first_name, ' ' , users.last_name) AS full_name, \
                          ( SELECT COUNT(*) FROM followers WHERE followers.userid = users.uid ) AS total_followers ,   \
                          ( SELECT COUNT(*) FROM comments WHERE comments.pid = posts.uid ) AS total_comments, \
                          ( SELECT COUNT(*) FROM comments WHERE comments.type = 'comment' AND comments.pid = posts.uid ) AS total_replies_2_post , \
                          ( SELECT COUNT(*) FROM comments WHERE comments.type = 'reply-2-comment' AND comments.pid = posts.uid ) AS total_replies_2_comments , \
                          ( SELECT COUNT(*) FROM liked WHERE liked.pid = posts.uid AND content_type = 'post' AND liked.status = 'true' ) AS total_likes , \
                          ( SELECT COUNT(*) FROM liked WHERE liked.pid = posts.uid AND content_type = 'post' AND liked.status = 'false' ) AS total_dislikes \
                FROM posts \
                  JOIN users ON users.uid = posts.userid  \
                        WHERE posts.uid = '{{pid}}' \
            ;".split("{{pid}}").join( pid )
            //.split("{{userid}}").join( userid )

            //console.log("SQL:", SQL)
            queryPosts( userid, SQL, config, cb );

    }


    function getPostEmbed( $pid, $config, $cb)
    {
            //console.log("VideoManager:getPostEmbed():pid:", $pid );
        var userid = null;
            $pid    = $pid? trim( $pid ) : null;

        var SQL = "SELECT posts.*, \
                          posts.uid AS pid \
                FROM posts  \
                WHERE uid = '{{pid}}'  \
            ;".split("{{pid}}").join( $pid );

            query( userid, SQL, $config, function($results){
                $cb($results[0])
            } );
    }

    function getUserNewsFeed( userid, limit, offset, config, cb )
    {
//            console.log("NewsFeedManager:getUserNewsFeed():userid,", userid, ", limit:", limit, "offset:", offset );
            userid  = userid ? trim( userid ) : null;
            offset  = offset ? trim( offset ) : 0;
            limit   = limit ? trim( limit ) : 20;
            //is_loggedin = config.is_loggedin || false;

            var SQL = "SELECT posts.* , \
                              posts.uid AS pid , \
                              users.uid AS userid, \
                              users.profile_url, \
                              users.first_name, \
                              users.last_name, \
                              users.level, \
                              CONCAT( users.first_name, ' ' , users.last_name ) AS full_name,  \
                              ( SELECT COUNT(*) FROM followers WHERE followers.userid = users.uid ) AS total_followers ,   \
                              ( SELECT COUNT(*) FROM comments WHERE comments.pid = posts.uid ) AS total_comments, \
                              ( SELECT COUNT(*) FROM comments WHERE comments.type = 'comment' AND comments.pid = posts.uid ) AS total_replies_2_post , \
                              ( SELECT COUNT(*) FROM comments WHERE comments.type = 'reply-2-comment' AND comments.pid = posts.uid ) AS total_replies_2_comments , \
                              ( SELECT COUNT(*) FROM liked WHERE liked.pid = posts.uid AND content_type = 'post' AND liked.status = 'true' ) AS total_likes , \
                              ( SELECT COUNT(*) FROM liked WHERE liked.pid = posts.uid AND content_type = 'post' AND liked.status = 'false' ) AS total_dislikes \
                        FROM posts  \
                            JOIN users ON users.uid = posts.userid  \
                                        WHERE posts.userid = '{{userid}}'  \
                                        ORDER BY posts.date_created DESC LIMIT {{limit}} OFFSET {{offset}}; \
                    ".split("{{userid}}").join(userid)
                    .split("{{limit}}").join(limit)
                    .split("{{offset}}").join(offset);

                queryPosts( userid, SQL, config, cb );//NOTE FIX ME

    }

    function getNewsFeed( userid, limit, offset, config, cb )
    {
//            console.log("NewsFeedManager:getNewsFeed():userid,", userid, ", limit:", limit, "offset:", offset );
            userid  = userid ? trim( userid ) : null;
            offset  = offset ? trim( offset ) : 0;
            limit   = limit ? trim( limit ) : 20;
            //is_loggedin = config.is_loggedin || false;

            /*
              FIXME: this should probably fetch a list of subscriptions, and or friends/contacts instead of just grabbing everything
            */
            var SQL = "SELECT posts.* , \
                              posts.uid AS pid , \
                              users.uid AS userid, \
                              users.profile_url, \
                              users.first_name, \
                              users.last_name, \
                              users.level, \
                              CONCAT( users.first_name, ' ' , users.last_name ) AS full_name,  \
                              ( SELECT COUNT(*) FROM followers WHERE followers.userid = users.uid ) AS total_followers ,   \
                              ( SELECT COUNT(*) FROM comments WHERE comments.pid = posts.uid ) AS total_comments, \
                              ( SELECT COUNT(*) FROM comments WHERE comments.type = 'comment' AND comments.pid = posts.uid ) AS total_replies_2_post , \
                              ( SELECT COUNT(*) FROM comments WHERE comments.type = 'reply-2-comment' AND comments.pid = posts.uid ) AS total_replies_2_comments , \
                              ( SELECT COUNT(*) FROM liked WHERE liked.pid = posts.uid AND content_type = 'post' AND liked.status = 'true' ) AS total_likes , \
                              ( SELECT COUNT(*) FROM liked WHERE liked.pid = posts.uid AND content_type = 'post' AND liked.status = 'false' ) AS total_dislikes \
                        FROM posts  \
                            JOIN users ON users.uid = posts.userid  \
                                        ORDER BY posts.date_created DESC LIMIT {{limit}} OFFSET {{offset}}; \
                    ".split("{{userid}}").join(userid)
                    .split("{{limit}}").join(limit)
                    .split("{{offset}}").join(offset);

                queryPosts( userid, SQL, config, cb );

    }


    function getPostStats($pid, $config, $cb)
    {
//              console.log("NewsFeedManager:getPostStats()pid:", pid );
          var SQL = "SELECT \
                       COUNT( DISTINCT userid) AS total_unique_users,  \
  	                   COUNT(*) as total_views \
  	                       FROM post_view_history  \
                              WHERE  \
                                post_view_history.pid = '{{pid}}' \
              ;".split('{{pid}}').join($pid)

                _con.query( SQL )
                .then( function( $stats ) {
                    //console.log("Post:getPostStats:", $stats[0])
                    $cb( $stats[0] );
                })
    }

    function getPostComments( userid, pid, limit, offset, config, cb )
    {
//            console.log("NewsFeedManager:getPostComments():userid,", userid, ", pid:", pid, ", limit:", limit, ", offset:", offset );

            //userid  = userid  ? trim( userid ) : null;
            pid     = pid     ? trim( pid ) : null;
            offset  = offset  ? trim( String(offset) ) : 0;
            limit   = limit   ? trim( String(limit) ) : DEFAULT_COMMENTS_LIMIT;

        var SQL = "SELECT comments.*, \
                          comments.userid AS author_id, \
                          comments.uid AS comment_uid , \
                          users.uid as userid, \
                          users.profile_url, \
                          users.first_name, \
                          users.last_name, \
                          users.level, \
                          CONCAT( users.first_name, ' ' , users.last_name ) AS full_name , \
                          ( SELECT COUNT(*) FROM followers WHERE followers.userid = users.uid ) AS total_followers ,   \
                          ( SELECT COUNT(*) FROM comments WHERE comments.pid = '{{pid}}' ) AS total_comments , \
                          ( SELECT COUNT(*) FROM comments WHERE comments.type = 'comment' AND comments.pid = '{{pid}}' ) AS total_replies_2_post , \
                          ( SELECT COUNT(*) FROM comments WHERE comments.type = 'reply-2-comment' AND comments.pid = '{{pid}}' ) AS total_replies_2_comments , \
                          ( SELECT COUNT(*) FROM liked WHERE liked.pid = comments.pid AND liked.comment_id = comments.uid AND liked.status = 'true' ) AS total_likes , \
                          ( SELECT COUNT(*) FROM liked WHERE liked.pid = comments.pid AND liked.comment_id = comments.uid AND liked.status = 'false' ) AS total_dislikes , \
                          ( SELECT COUNT(*) FROM comments as post_comments join comments AS replies ON replies.parent_comment_id = post_comments.uid WHERE replies.parent_comment_id = comments.uid ) as total_replies , \
                          DATEDIFF(NOW(), comments.date_created) AS days_old  , \
		                      DATE_FORMAT( CURDATE( ) ,  '%Y' ) - DATE_FORMAT( comments.date_created,  '%Y' ) - ( DATE_FORMAT( CURDATE( ) ,  '00-%m-%d' ) < DATE_FORMAT( comments.date_created,  '00-%m-%d' ) ) AS years_old , \
                          PERIOD_DIFF( DATE_FORMAT( CURDATE( ) ,  '%Y%m' ) , DATE_FORMAT( comments.date_created, '%Y%m' ) ) AS months_old  \
                FROM comments \
                    JOIN users ON users.uid = comments.userid \
                        WHERE \
                           comments.pid = '{{pid}}' AND \
                           comments.type = 'comment'  \
                        ORDER BY comments.date_created DESC LIMIT {{limit}} OFFSET {{offset}}; \
            ".split("{{pid}}").join( pid )
            //.split("{{userid}}").join( userid )
            .split("{{limit}}").join(limit)
            .split("{{offset}}").join(offset);

            //console.log("SQL:", SQL );

            var _comments = [];
            _con.query( SQL )
            .then( function( comments ) {

                _.each( comments, function( comment )
                {
                    var comment_id = comment.uid;
                    var comment_type = comment.type;

                    comment.is_users_comment = Boolean( userid == comment.userid );

                    comment.is_author       = ( comment.userid == userid )? true : false ;

                    comment.is_admin        = config.user.is_admin || false;
                    comment.is_staff        = config.user.is_staff || false;
                    comment.is_moderator    = config.user.is_moderator || false;
                    comment.is_loggedin     = config.user.is_loggedin || false;

                    comment.content_short = null;
                    if( comment.content &&   comment.content.length > CONTENT_SHORT_LENGTH ){
                        comment.content_short = comment.content.substring(0, CONTENT_SHORT_LENGTH) ;//+ '...';
                    }

                });

                cb( comments );
            })
    }

    function markCommentAsRead($userid, $comment_id, $config, $cb )
    {
        console.log("VideoManager.markCommentAsRead():userid:" , $userid, ", comment_id:", $comment_id );

        SQL = "UPDATE comments SET status = 'read' WHERE uid = '{{comment_id}}' \
        ;".split("{{comment_id}}").join($comment_id);

        query( $userid, SQL, $config, function($data){
            getPostComment( $userid, $comment_id, $config, $cb )
        })
    }

    function markCommentAsUnread($userid, $comment_id, $config, $cb )
    {
        console.log("VideoManager.markCommentAsRead():userid:" , $userid, ", comment_id:", $comment_id );
        SQL = "UPDATE comments SET status = 'read' WHERE uid = '{{comment_id}}' \
        ;".split("{{comment_id}}").join($comment_id);

        query( $userid, SQL, $config, function($data){
            getPostComment( $userid, $comment_id, $config, $cb )
        })
    }

    function getPostComment( $userid, $comment_id, $config, $cb )
    {
            console.log("NewsFeedManager:getPostComment():userid,", $userid, ", comment_id:", $comment_id );

            $userid          = $userid      ? trim( $userid ) : null;
            $comment_id      = $comment_id  ? trim( $comment_id ) : null;

        var SQL = "SELECT comments.*, \
                          comments.userid AS author_id, \
                          comments.uid AS comment_id , \
                          comments.uid AS comment_uid , \
                          users.uid as userid, \
                          users.profile_url, \
                          users.first_name, \
                          users.last_name, \
                          users.level, \
                          CONCAT( users.first_name, ' ' , users.last_name ) AS full_name , \
                          ( SELECT COUNT(*) FROM followers WHERE followers.userid = users.uid ) AS total_followers ,   \
                          ( SELECT COUNT(*) FROM comments WHERE comments.type = 'reply-2-comment' AND comments.parent_comment_id = '{{comment_id}}' ) AS total_replies_2_comment , \
                          ( SELECT COUNT(*) FROM liked WHERE liked.pid = comments.pid AND liked.comment_id = comments.uid AND liked.status = 'true' ) AS total_likes , \
                          ( SELECT COUNT(*) FROM liked WHERE liked.pid = comments.pid AND liked.comment_id = comments.uid AND liked.status = 'false' ) AS total_dislikes , \
                          ( SELECT COUNT(*) FROM comments as post_comments join comments AS replies ON replies.parent_comment_id = post_comments.uid WHERE replies.parent_comment_id = comments.uid ) as total_replies , \
                          DATEDIFF(NOW(), comments.date_created) AS days_old  , \
		                      DATE_FORMAT( CURDATE( ) ,  '%Y' ) - DATE_FORMAT( comments.date_created,  '%Y' ) - ( DATE_FORMAT( CURDATE( ) ,  '00-%m-%d' ) < DATE_FORMAT( comments.date_created,  '00-%m-%d' ) ) AS years_old , \
                          PERIOD_DIFF( DATE_FORMAT( CURDATE( ) ,  '%Y%m' ) , DATE_FORMAT( comments.date_created, '%Y%m' ) ) AS months_old  \
                FROM comments \
                    JOIN users ON users.uid = comments.userid \
                        WHERE \
                           comments.uid = '{{comment_id}}' ; \
            ".split("{{comment_id}}").join( $comment_id )
            //.split("{{userid}}").join( $userid )

            //console.log("SQL:", SQL );

            _con.query( SQL )
            .then( function( $comments ) {
              _.each( $comments, function( $comment )
              {
                  var comment_id = $comment.uid;
                  var comment_type = $comment.type;

                      $comment.is_users_comment = Boolean( $userid == $comment.userid );

                      $comment.is_author        = ( $comment.userid == $userid )? true : false ;

                      $comment.is_admin         = $config.user.is_admin || false;
                      $comment.is_staff         = $config.user.is_staff || false;
                      $comment.is_moderator     = $config.user.is_moderator || false;
                      $comment.is_loggedin      = $config.user.is_loggedin || false;

                      $comment.content_short    = null;
                      if( $comment.content &&
                          $comment.content.length > CONTENT_SHORT_LENGTH ){
                          $comment.content_short = $comment.content.substring(0, CONTENT_SHORT_LENGTH) ;//+ '...';
                      }
                })

                $cb( $comments[0] );
            })
    }


    function getCommentReplies( userid, comment_id, limit, offset, config, cb )
    {
          //console.log("NewsFeedManager:getCommentReplies():userid,", userid, ", comment_id:", comment_id, ", limit:", limit, ", offset:", offset );

            userid     = userid ? trim( userid ) : null;
            comment_id = userid ? trim( comment_id ) : null;
            offset     = offset ? trim( String(offset) ) : 0;
            limit      = limit  ? trim( String(limit) ) : DEFAULT_COMMENTS_LIMIT;

            var SQL = "SELECT comments.*, \
                              posts.uid,  \
                              comments.userid AS author_id, \
                              comments.uid AS comment_id , \
                              comments.uid AS comment_uid , \
                              users.uid as userid, \
                              users.profile_url, \
                              users.first_name, \
                              users.last_name, \
                              users.level, \
                              CONCAT( users.first_name, ' ' , users.last_name ) AS full_name , \
                              ( SELECT COUNT(*) FROM comments WHERE comments.pid = posts.uid ) AS total_comments , \
                              ( SELECT COUNT(*) FROM comments WHERE comments.type = 'comment' AND comments.pid = posts.uid ) AS total_replies_2_post , \
                              ( SELECT COUNT(*) FROM comments WHERE comments.type = 'reply-2-comment' AND comments.pid = posts.uid ) AS total_replies_2_comments , \
                              ( SELECT COUNT(*) FROM liked WHERE liked.pid = comments.pid AND liked.comment_id = comments.uid AND liked.status = 'true' ) AS total_likes , \
                              ( SELECT COUNT(*) FROM liked WHERE liked.pid = comments.pid AND liked.comment_id = comments.uid AND liked.status = 'false' ) AS total_dislikes , \
                              ( SELECT COUNT(*) FROM comments as post_comments join comments AS replies ON replies.parent_comment_id = post_comments.uid WHERE replies.parent_comment_id = comments.uid ) as total_replies , \
                              DATEDIFF(NOW(), comments.date_created) AS days_old  , \
    		                      DATE_FORMAT( CURDATE( ) ,  '%Y' ) - DATE_FORMAT( comments.date_created,  '%Y' ) - ( DATE_FORMAT( CURDATE( ) ,  '00-%m-%d' ) < DATE_FORMAT( comments.date_created,  '00-%m-%d' ) ) AS years_old , \
                              PERIOD_DIFF( DATE_FORMAT( CURDATE( ) ,  '%Y%m' ) , DATE_FORMAT( comments.date_created, '%Y%m' ) ) AS months_old  \
                    FROM comments \
                        JOIN users ON users.uid = comments.userid \
                        JOIN posts ON posts.uid = comments.pid \
                            WHERE \
                               comments.parent_comment_id = '{{parent_comment_id}}' AND \
                               comments.type = 'reply-2-comment'  \
                            ORDER BY comments.date_created DESC LIMIT {{limit}} OFFSET {{offset}}; \
            ;".split("{{parent_comment_id}}").join( comment_id )
            .split("{{limit}}").join(limit)
            .split("{{offset}}").join(offset);


            var _comments = [];
            _con.query( SQL )
            .then( function( comments ) {

                _.each( comments, function( comment )
                {
                    var comment_id = comment.uid;
                    var comment_type = comment.type;

                    comment.is_users_comment = Boolean( userid == comment.userid );

                    comment.is_author       = ( comment.userid == userid )? true : false ;
                    comment.is_admin        = config.user.is_admin || false;
                    comment.is_staff        = config.user.is_staff || false;
                    comment.is_moderator    = config.user.is_moderator || false;
                    comment.is_loggedin     = config.user.is_loggedin || false;

                });

                cb( comments );
            })
    }

    function getComment( userid, comment_id, config, cb )
    {
            //console.log("NewsFeedManager:getComment():userid,", userid, ", comment_id:", comment_id );

            userid     = userid ? trim( userid ) : null;
            comment_id = userid ? trim( comment_id ) : null;

            var SQL = "SELECT comments.*, \
                              comments.uid AS comment_id , \
                              comments.uid AS comment_uid , \
                              comments.userid AS author_id, \
                              comments.uid AS comment_uid , \
                              posts.uid AS pid , \
                              users.uid as userid, \
                              users.profile_url, \
                              users.first_name, \
                              users.last_name, \
                              users.level, \
                              CONCAT( users.first_name, ' ' , users.last_name ) AS full_name , \
                              ( SELECT COUNT(*) FROM comments WHERE comments.pid = posts.uid ) AS total_comments , \
                              ( SELECT COUNT(*) FROM comments WHERE comments.type = 'comment' AND comments.pid = posts.uid ) AS total_replies_2_post , \
                              ( SELECT COUNT(*) FROM comments WHERE comments.type = 'reply-2-comment' AND comments.pid = posts.uid ) AS total_replies_2_comments , \
                              ( SELECT COUNT(*) FROM liked WHERE liked.pid = comments.pid AND liked.comment_id = comments.uid AND liked.status = 'true' ) AS total_likes , \
                              ( SELECT COUNT(*) FROM liked WHERE liked.pid = comments.pid AND liked.comment_id = comments.uid AND liked.status = 'false' ) AS total_dislikes , \
                              ( SELECT COUNT(*) FROM comments as post_comments join comments AS replies ON replies.parent_comment_id = post_comments.uid WHERE replies.parent_comment_id = comments.uid ) as total_replies, \
                              DATEDIFF(NOW(), comments.date_created) AS days_old  , \
    		                      DATE_FORMAT( CURDATE( ) ,  '%Y' ) - DATE_FORMAT( comments.date_created,  '%Y' ) - ( DATE_FORMAT( CURDATE( ) ,  '00-%m-%d' ) < DATE_FORMAT( comments.date_created,  '00-%m-%d' ) ) AS years_old , \
                              PERIOD_DIFF( DATE_FORMAT( CURDATE( ) ,  '%Y%m' ) , DATE_FORMAT( comments.date_created, '%Y%m' ) ) AS months_old  \
                    FROM comments \
                        JOIN posts on posts.uid = comments.pid  \
                        JOIN users ON users.uid = comments.userid \
                            WHERE \
                               comments.uid = '{{comment_id}}' \
            ;".split("{{comment_id}}").join( comment_id )

            //console.log("getComment:SQL:", SQL )
            _con.query( SQL )
            .then( function( comments ) {

                _.each( comments, function( comment )
                {
                    var comment_id = comment.uid;
                    var comment_type = comment.type;

                    comment.is_users_comment = Boolean( userid == comment.userid );

                    comment.is_author       = ( comment.userid == userid )? true : false ;
                    comment.is_admin        = config.user.is_admin || false;
                    comment.is_staff        = config.user.is_staff || false;
                    comment.is_moderator    = config.user.is_moderator || false;
                    comment.is_loggedin     = config.user.is_loggedin || false;


                });
                //console.log("getComment:",comments);
                cb( comments[0] );
            })
    }

    function deleteComment( userid, uid, config, cb )
    {
            //console.log("NewsFeedManager.deleteComment():userid:", userid );
            userid  = userid ? trim( userid ) : null;
            uid     = uid ? trim( uid ) : null;

        var SQL     = "DELETE FROM comments WHERE uid='{{uid}}' OR parent_comment_id = '{{uid}}';\
                      ".split("{{uid}}").join(uid);

            query( userid, SQL, {}, function(data){
//                console.log( "NewsFeedManager.deleteComment():userid:cleanup delete comments from likes as well..." );
//                console.log("does comment have children? we should delete those as well...")
                //SQL = "DELETE FROM comments WHERE parent_comment_id = '{{uid}}' "
                SQL = "DELETE FROM liked WHERE comment_id='{{uid}}' ;".split("{{uid}}").join(uid);
                query( userid, SQL, config, cb );
            });

            //NOTE: We should probably delete likes/disliked comments from the liked table to reduce database size.
    }

    function setCommentStatus( userid, comment_uid, status, config, cb )
    {
//          console.log("NewsFeedManager.deleteComment():userid:", userid, ", comment_uid:", comment_uid, ", status:", status );
            userid          = userid ? trim( userid ) : null;
            comment_uid     = comment_uid ? trim( comment_uid ) : null;
            status          = status ? addslashes( trim( status ) ) : null;

        var SQL = "UPDATE comments SET status = '{{status}}'   \
                        WHERE uid = '{{comment_uid}' \
                        ;".split("{{status}}").join(status)
                          .split("{{comment_uid}}").join(comment_uid);

            query( userid, SQL, config, cb );
    }

    function getPostLikes( userid, pid, limit, offset, config, cb )
    {
//            console.log("NewsFeedManager:getPostLikes():userid,", userid, ", pid:", pid, ", limit:", limit, ", offset:", offset );
            userid = userid ? trim( userid ) : null;
            offset  = offset ? trim( String(offset) ) : 0;
            limit   = limit ? trim( String(limit) ) : DEFAULT_LIKES_LIMIT;

        var SQL = "SELECT liked.* , \
                          liked.uid as liked_uid , \
                          users.profile_url , \
                          users.first_name , \
                          users.last_name , \
                          users.level , \
                          CONCAT( users.first_name, ' ' , users.last_name ) AS full_name, \
                          ( SELECT COUNT(*) FROM liked WHERE liked.pid = '{{pid}}' AND content_type = 'post' AND liked.status = 'true') AS total_likes , \
                          ( SELECT COUNT(*) FROM liked WHERE liked.pid = '{{pid}}' AND content_type = 'post' AND liked.status = 'false' ) AS total_dislikes \
                          FROM liked \
                            JOIN users ON users.uid = liked.userid \
                              WHERE pid='{{pid}}' AND \
                                    comment_id IS NULL AND \
                                    content_type = 'post' AND \
                                    liked.status = 'true' \
                                  ORDER BY liked.date_created DESC LIMIT {{limit}} OFFSET {{offset}}; \
                ".split("{{pid}}").join(pid)
                .split("{{limit}}").join(limit)
                .split("{{offset}}").join(offset);
//                console.log(SQL)
            _con.query( SQL )
            .then(function(likes) {
//                console.log("likes:", likes)
                _.each(likes, function( like )
                {
                    like.user_liked_post = Boolean( userid == like.userid );
//                    console.log("like:",like);
                    like.is_author        = ( like.userid == userid )? true : false ;
                    like.is_admin         = config.user.is_admin || false; //(false)? true : false ;
                    like.is_staff         = config.user.is_staff || false; //(false)? true : false ;
                    like.is_moderator     = config.user.is_moderator || false; //(false)? true : false ;
                    like.is_loggedin      = config.user.is_loggedin || false; //( _SESSION['is_loggedin'] == "1" )? true : false
                })
                  cb( likes );
            });
    }

    function getPostCommentLikes(userid, pid, comment_id, limit, offset, config, cb ){
                  //console.log("NewsFeedManager:getPostCommentLikes():userid,", userid, ", pid:", pid, ", comment_id:", comment_id, ", limit:", limit, ", offset:", offset );
                  userid      = userid ? trim( userid ) : null;
                  comment_id  = comment_id ? trim( comment_id ) : null;
                  offset      = offset ? trim( String(offset) ) : 0;
                  limit       = limit ? trim( String(limit) ) : DEFAULT_LIKES_LIMIT;


              var SQL = "SELECT liked.* , \
                                liked.uid as liked_uid , \
                                users.profile_url , \
                                users.first_name , \
                                users.last_name , \
                                users.level , \
                                CONCAT( users.first_name, ' ' , users.last_name ) AS full_name, \
                                ( SELECT COUNT(*) FROM liked WHERE liked.pid = '{{pid}}' AND liked.comment_id = '{{comment_id}}' AND liked.status = 'true') AS total_likes , \
                                ( SELECT COUNT(*) FROM liked WHERE liked.pid = '{{pid}}' AND liked.comment_id = '{{comment_id}}' AND liked.status = 'false' ) AS total_dislikes \
                                FROM liked \
                                  JOIN users ON users.uid = liked.userid \
                                    WHERE pid='{{pid}}' AND \
                                          comment_id='{{comment_id}}' AND \
                                          liked.status = 'true' \
                                        ORDER BY liked.date_created DESC LIMIT {{limit}} OFFSET {{offset}}; \
                      ".split("{{pid}}").join(pid)
                      .split("{{comment_id}}").join(comment_id)
                      .split("{{limit}}").join(limit)
                      .split("{{offset}}").join(offset);
//                      console.log(SQL)
                  _con.query( SQL )
                  .then(function(likes) {
      //                console.log("likes:", likes)
                      _.each(likes, function( like )
                      {
                          like.user_liked_post = Boolean( userid == like.userid );
      //                    console.log("like:",like);
                          like.is_author        = ( like.userid == userid )? true : false ;
                          like.is_admin         = config.user.is_admin || false; //(false)? true : false ;
                          like.is_staff         = config.user.is_staff || false; //(false)? true : false ;
                          like.is_moderator     = config.user.is_moderator || false; //(false)? true : false ;
                          like.is_loggedin      = config.user.is_loggedin || false; //( _SESSION['is_loggedin'] == "1" )? true : false
                      })
                        cb( likes );
                  });
    }

    function getPostCommentDislikes( userid, pid, comment_id, limit, offset, config, cb )
    {
//            console.log("NewsFeedManager:getPostCommentDislikes():userid,", userid, ", pid:", pid , ", comment_id:", comment_id,  ", limit:", limit, ", offset:", offset );
            userid      = userid      ? trim( userid ) : null;
            comment_id  = comment_id  ? trim( comment_id ) : null;
            offset      = offset      ? trim( String(offset) ) : 0;
            limit       = limit       ? trim( String(limit) ) : DEFAULT_DISLIKES_LIMIT;

        var SQL = "SELECT liked.* , \
                          liked.uid as liked_uid , \
                          users.profile_url , \
                          users.first_name , \
                          users.last_name , \
                          users.level , \
                          CONCAT( users.first_name, ' ' , users.last_name ) AS full_name, \
                          ( SELECT COUNT(*) FROM liked WHERE liked.pid = '{{pid}}' AND liked.comment_id = '{{comment_id}}' AND liked.status = 'true' ) AS total_likes , \
                          ( SELECT COUNT(*) FROM liked WHERE liked.pid = '{{pid}}' AND liked.comment_id = '{{comment_id}}' AND liked.status = 'false' ) AS total_dislikes \
                          FROM liked \
                            JOIN users ON users.uid = liked.userid \
                              WHERE pid='{{pid}}' AND \
                                    comment_id='{{comment_id}}' AND \
                                    liked.status = 'false' \
                                  ORDER BY liked.date_created DESC LIMIT {{limit}} OFFSET {{offset}} \
                ;".split("{{pid}}").join(pid)
                .split("{{comment_id}}").join(comment_id)
                .split("{{limit}}").join(limit)
                .split("{{offset}}").join(offset);

//                console.log(SQL)

            _con.query( SQL )
            .then(function(likes) {
                _.each(likes, function( like )
                {
                    like.user_liked_post = Boolean( userid == like.userid );

                    like.is_author        = ( like.userid == userid )? true : false ;
                    like.is_admin         = config.user.is_admin || false;
                    like.is_staff         = config.user.is_staff || false;
                    like.is_moderator     = config.user.is_moderator || false;
                    like.is_loggedin      = config.user.is_loggedin || false;
                })
                  cb( likes );
            });
    }

    function getPostDislikes( userid, pid, limit, offset, config, cb )
    {
//            console.log("NewsFeedManager:getPostDislikes():userid,", userid, ", pid:", pid, ", limit:", limit, ", offset:", offset );
            userid  = userid  ? trim( userid ) : null;
            offset  = offset  ? trim( String(offset) ) : 0;
            limit   = limit   ? trim( String(limit) ) : DEFAULT_DISLIKES_LIMIT;

        var SQL = "SELECT liked.* , \
                          liked.uid as liked_uid , \
                          users.profile_url , \
                          users.first_name , \
                          users.last_name , \
                          users.level , \
                          CONCAT( users.first_name, ' ' , users.last_name ) AS full_name, \
                          ( SELECT COUNT(*) FROM liked WHERE liked.pid = '{{pid}}' AND content_type = 'post' AND liked.status = 'true' ) AS total_likes , \
                          ( SELECT COUNT(*) FROM liked WHERE liked.pid = '{{pid}}' AND content_type = 'post' AND liked.status = 'false' ) AS total_dislikes \
                          FROM liked \
                            JOIN users ON users.uid = liked.userid \
                              WHERE pid='{{pid}}' AND \
                                    comment_id IS NULL AND \
                                    content_type = 'post' AND \
                                    liked.status = 'false' \
                                  ORDER BY liked.date_created DESC LIMIT {{limit}} OFFSET {{offset}}; \
                ".split("{{pid}}").join(pid)
                .split("{{limit}}").join(limit)
                .split("{{offset}}").join(offset);

                //console.log(SQL)

            _con.query( SQL )
            .then(function(likes) {
                _.each(likes, function( like )
                {
                    like.user_liked_post = Boolean( userid == like.userid );

                    like.is_author        = ( like.userid == userid )? true : false ;
                    like.is_admin         = config.user.is_admin || false;
                    like.is_staff         = config.user.is_staff || false;
                    like.is_moderator     = config.user.is_moderator || false;
                    like.is_loggedin      = config.user.is_loggedin || false;
                })
                  cb( likes );
            });
    }

    function getPostTotalLikes( pid, cb )
    {
//            console.log("NewsFeedManager:getPostTotalLikes():pid:", pid );

            pid = pid ? trim( pid ) : null;

        var SQL = " SELECT COUNT(*) AS total FROM liked WHERE liked.pid = '{{pid}}' AND liked.comment_id IS NULL AND content_type = 'post'  \
                  ;".split("{{pid}}").join(pid);

            _con.query( SQL )
            .then(function($data) {
                  var total = $data[0].total || 0;
                  cb( total );
            });
    }

    function getPostTotalDislikes( pid, cb )
    {
//            console.log("NewsFeedManager:getPostTotalDislikes():pid:", pid );

            pid = pid ? trim( pid ) : null;

        var SQL = " SELECT COUNT(*) AS total FROM liked WHERE liked.pid = '{{pid}}'  \
                  ;".split("{{pid}}").join(pid);
            return //NOTE: DO WORK HERE

            _con.query( SQL )
            .then(function($data) {
                  var total = $data[0].total || 0;
                  cb( total );
            });
    }

    function getPostTotalComments( pid, cb )
    {
//            console.log("NewsFeedManager:getPostTotalComments():pid:", pid );
            pid = pid ? trim( pid ) : null;

        var SQL = " SELECT COUNT(*) AS total FROM comments WHERE comments.pid = '{{pid}}'  \
                  ;".split("{{pid}}").join(pid);

            _con.query( SQL )
            .then(function($data) {
                  var total = $data[0].total || 0;
                  cb( total );
            });
    }

    function formatNumberby1k(num)
    {
        if( num > 999 && num < 1000000){
            return (num/1000).toFixed(1) + 'K'; // convert to K for number from > 1000 < 1 million
        }else if(num > 1000000){
            return (num/1000000).toFixed(1) + 'M'; // convert to M for number from > 1 million
        }else if(num < 900){
            return num; // if value < 1000, nothing to do
        }
    }


    function postLiked( userid, pid, liked , config, cb )
    {
//            console.log("NewsFeedManager.postLiked():userid:", userid , "pid:", pid , ", liked:", liked );
            userid        = userid ? trim( userid ) : null;
            pid           = pid ? trim( pid ) : null;
            liked         = liked ? trim( liked ) : null;
        var status        = Boolean(liked)? "true" : "false";

        var date_created  = utils.DBDate();
        var uid           = utils.createBase64UUID();

//            var count         = 0;
        var content_type  = "post";

        var comment_id    = null;

        var SQL = "SELECT * FROM liked  \
                      WHERE userid = '{{userid}}' AND \
                            pid = '{{pid}}' AND \
                            comment_id IS NULL AND \
                            content_type = '{{content_type}}' \
                            LIMIT 1  \
                ;".split("{{userid}}").join(userid)
                  .split("{{pid}}").join(pid)
                  .split("{{content_type}}").join(content_type);


//            console.log("SQL:", SQL );
        query( userid, SQL, config, function(data){
            if( data.length > 0 ){

                    SQL = "UPDATE liked SET \
                                  status = '{{status}}' \
                                WHERE \
                                  uid = '{{uid}}' AND \
                                  comment_id IS NULL \
                            ;".split("{{status}}").join(status)
                              .split("{{uid}}").join(data[0].uid)
    //                              .split("{{count}}").join(count);
            }else{
                    SQL = "INSERT IGNORE INTO liked   \
                                ( pid, uid, userid, date_created, status, content_type )   \
                            VALUES   \
                                ( '{{pid}}', '{{uid}}','{{userid}}', '{{date_created}}', '{{liked}}', '{{content_type}}' )   \
                            ON DUPLICATE KEY UPDATE \
                                status = '{{liked}}', \
                                date_created = '{{date_created}}' \
                             ;".split("{{pid}}").join(pid)
                               .split("{{uid}}").join(uid)
                               .split("{{userid}}").join(userid)
                               .split("{{liked}}").join(liked)
                               .split("{{content_type}}").join(content_type)
                               .split("{{date_created}}").join(date_created);
            }

            //console.log("SQL:", SQL );

            _notes.create_PostLike_note( userid, pid, {}, function($data){
                query( userid, SQL, config, cb );
            })
        });

    }

    function postDisliked( userid, pid, liked , config, cb )
    {
        postLiked( userid, pid, false , config, cb )
    }

    function postCommentDisliked( userid, pid, comment_id, liked , config, cb )
    {
//        console.log("NewsFeedManager.postCommentDisliked()", "userid:", userid, ", pid:", pid, ", comment_id:", comment_id, "liked:", liked );
        postCommentLiked( userid, pid, comment_id, false , config, cb )
    }

    function postCommentLiked( userid, pid, comment_id, liked , config, cb )
    {
//          console.log("NewsFeedManager.postCommentLiked():userid:", userid , "pid:", pid , ", comment_id:", comment_id," liked:", liked );
            userid        = userid ? trim( userid ) : null;
            pid           = pid ? trim( pid ) : null;
            comment_id    = comment_id ? trim( comment_id ) : null;
            liked         = liked ? trim( liked ) : null;
        var status        = Boolean(liked)? "true" : "false";

        var date_created  = utils.DBDate();
        var uid           = utils.createBase64UUID();

//        var count         = 0;
        var content_type  = "post_comment";

        var SQL = "SELECT * FROM liked  \
                      WHERE userid = '{{userid}}' AND \
                            pid          = '{{pid}}' AND \
                            comment_id   = '{{comment_id}}' AND \
                            content_type = '{{content_type}}' \
                            LIMIT 1  \
                ;".split("{{userid}}").join(userid)
                  .split("{{pid}}").join(pid)
                  .split("{{comment_id}}").join(comment_id)
                  .split("{{content_type}}").join(content_type);


        //console.log("SQL:", SQL );
        query( userid, SQL, config, function(data){
            if( data.length > 0 ){
                    SQL = "UPDATE liked SET \
                                      status = '{{status}}' , \
                                      content_type = '{{content_type}}' \
                              WHERE \
                                      pid        = '{{pid}}' AND \
                                      comment_id = '{{comment_id}}' \
                            ;".split("{{pid}}").join(pid)
                              .split("{{comment_id}}").join(comment_id)
                              .split("{{content_type}}").join(content_type)
                              .split("{{status}}").join(status)


            }else{
                    SQL = "INSERT IGNORE INTO liked   \
                                ( pid, uid, userid, comment_id, date_created, status, content_type )   \
                            VALUES   \
                                ( '{{pid}}', '{{uid}}','{{userid}}', '{{comment_id}}' , '{{date_created}}', '{{liked}}', '{{content_type}}' )   \
                            ON DUPLICATE KEY UPDATE \
                                status = '{{liked}}', \
                                date_created = '{{date_created}}' \
                             ;".split("{{pid}}").join(pid)
                               .split("{{uid}}").join(uid)
                               .split("{{userid}}").join(userid)
                               .split("{{comment_id}}").join(comment_id)
                               .split("{{liked}}").join(liked)
                               .split("{{content_type}}").join(content_type)
                               .split("{{date_created}}").join(date_created);
            }

//                console.log("NewsFeedManager.postCommentLiked():SQL:", SQL );

                query( userid, SQL, config, function($data){
                      if(liked){
                        _notes.create_PostCommentLike_note( userid, pid, comment_id, {}, function($r){
                          cb($data)
                        })
                      }else{
                        cb($data)
                      }
                });


        });

    }

    function getUnreadCommentsCount( userid, config, cb )
    {
//          console.log("NewsFeedManager.getUnreadCommentsCount():userid:", userid );
            userid =  utils.addslashes( trim( userid ));

        var SQL = "SELECT count(*) as unread FROM comments   \
                    JOIN users ON users.uid = comments.userid   \
                        WHERE users.uid = '{{userid}}' AND status='unread'   \
                    ;".split("{{userid}}").join(userid);

            query( userid, SQL, config, cb );
    }

    function deleteComment( userid, uid, config, cb )
    {
            //console.log("NewsFeedManager.deleteComment():userid:", userid );
            userid  = userid ? trim( userid ) : null;
            uid     = uid ? trim( uid ) : null;

        var SQL     = "DELETE FROM comments WHERE uid='{{uid}}' OR parent_comment_id = '{{uid}}';\
                      ".split("{{uid}}").join(uid);

            query( userid, SQL, {}, function(data){

                SQL = "DELETE FROM liked WHERE comment_id='{{uid}}' ;".split("{{uid}}").join(uid);
                query( userid, SQL, config, function($data){
                    SQL = "DELETE FROM notifications WHERE comment_id='{{uid}}' ;".split("{{uid}}").join(uid);
                    query( userid, SQL, config, function($data){
                        cb();
                    });
                });
            });

    }


    function setCommentStatus( userid, comment_uid, status, config, cb )
    {
//          console.log("NewsFeedManager.deleteComment():userid:", userid, ", comment_uid:", comment_uid, ", status:", status );
            userid          = userid ? trim( userid ) : null;
            comment_uid     = comment_uid ? trim( comment_uid ) : null;
            status          = status ? addslashes( trim( status ) ) : null;

        var SQL = "UPDATE comments SET status = '{{status}}'   \
                        WHERE uid = '{{comment_uid}' \
                        ;".split("{{status}}").join(status)
                          .split("{{comment_uid}}").join(comment_uid);

            query( userid, SQL, config, cb );
    }

    function getChannelPostComments( userid, limit, offset, config, cb )
    {
        console.log("NewsFeedManager.getChannelPostComments():userid:", userid, ", limit:", limit, ", offset:", offset );
        userid = trim( userid );
        offset = offset ? trim(offset) : 0;
        limit  = limit ? trim(limit ) : 20;

        var SQL = "SELECT comments.*, \
                          posts.*, \
                          comments.userid AS author_id, \
                          comments.uid AS comment_id , \
                          users.uid AS userid, \
                          users.profile_url, \
                          users.first_name, \
                          users.last_name, \
                          users.level, \
                          CONCAT(users.first_name, ' ' , users.last_name) AS full_name,  \
                          ( SELECT COUNT(*) FROM comments WHERE comments.pid = posts.uid ) AS total_comments , \
                          ( SELECT COUNT(*) FROM comments WHERE comments.type = 'comment' AND comments.pid = posts.uid ) AS total_replies_2_post , \
                          ( SELECT COUNT(*) FROM comments WHERE comments.type = 'reply-2-comment' AND comments.pid = posts.uid ) AS total_replies_2_comments , \
                          ( SELECT COUNT(*) FROM liked WHERE liked.pid = comments.pid AND liked.comment_id = comments.uid AND liked.status = 'true' ) AS total_likes , \
                          ( SELECT COUNT(*) FROM liked WHERE liked.pid = comments.pid AND liked.comment_id = comments.uid AND liked.status = 'false' ) AS total_dislikes , \
                          ( SELECT COUNT(*) FROM comments as post_comments join comments AS replies ON replies.parent_comment_id = post_comments.uid WHERE replies.parent_comment_id = comments.uid ) as total_replies , \
                          DATEDIFF(NOW(), comments.date_created) AS days_old  , \
		                      DATE_FORMAT( CURDATE( ) ,  '%Y' ) - DATE_FORMAT( comments.date_created,  '%Y' ) - ( DATE_FORMAT( CURDATE( ) ,  '00-%m-%d' ) < DATE_FORMAT( comments.date_created,  '00-%m-%d' ) ) AS years_old, \
                          PERIOD_DIFF( DATE_FORMAT( CURDATE( ) ,  '%Y%m' ) , DATE_FORMAT( comments.date_created, '%Y%m' ) ) AS months_old  \
                        FROM comments     \
                            JOIN users ON users.uid = comments.userid     \
                                JOIN  posts ON posts.uid = comments.pid     \
                                    WHERE posts.userid = '{{userid}}'  AND \
                                          comments.type = 'comment'  \
                                        ORDER BY comments.date_created    \
                                        DESC LIMIT {{limit}} OFFSET {{offset}}    \
                    ;".split("{{limit}}").join( limit )
                      .split("{{offset}}").join( offset )
                      .split("{{userid}}").join( userid )

            //console.log("SQL:", SQL);

            query( userid, SQL, config, cb);
    }

    function getUserPostComments( userid, pid, limit, offset, config, cb )
    {
        console.log("NewsFeedManager.getChannelPostComments():userid:", userid, ", pid:", pid, ", limit:", limit, ", offset:", offset );
        userid = trim( userid );
        pid    = trim( pid );
        offset = offset ? trim(offset) : 0;
        limit  = limit ? trim(limit ) : 20;

        var SQL = "SELECT comments.*, \
                          posts.*, \
                          comments.userid AS author_id, \
                          comments.uid AS comment_id , \
                          users.uid AS userid, \
                          users.profile_url, \
                          users.first_name, \
                          users.last_name, \
                          users.level, \
                          CONCAT(users.first_name, ' ' , users.last_name) AS full_name,  \
                          DATEDIFF(NOW(), comments.date_created) AS days_old  , \
		                      DATE_FORMAT( CURDATE( ) ,  '%Y' ) - DATE_FORMAT( comments.date_created,  '%Y' ) - ( DATE_FORMAT( CURDATE( ) ,  '00-%m-%d' ) < DATE_FORMAT( comments.date_created,  '00-%m-%d' ) ) AS years_old, \
                          PERIOD_DIFF( DATE_FORMAT( CURDATE( ) ,  '%Y%m' ) , DATE_FORMAT( comments.date_created, '%Y%m' ) ) AS months_old  \
                        FROM comments     \
                            JOIN users ON users.uid = comments.userid     \
                                JOIN  posts ON posts.uid = comments.pid     \
                                    WHERE posts.userid = '{{userid}}' AND    \
                                        posts.uid = '{{pid}}'     \
                                        ORDER BY comments.date_created    \
                                        DESC LIMIT {{limit}} OFFSET {{offset}}    \
                    ;".split("{{limit}}").join( limit )
                      .split("{{pid}}").join( pid )
                      .split("{{offset}}").join( offset )
                      .split("{{userid}}").join( userid )

            //console.log("SQL:", SQL);

            query( userid, SQL, config, cb);
    }


    function createComment( $userid, $pid, $content, $metadata, $config, $cb )
    {
            console.log("NewsFeedManager.createComment():userid:", $userid, ", pid:", $pid, ", content:", $content );

            $userid          = trim( $userid );
            $pid             = trim( $pid );
            $content         = utils.addslashes( trim( $content ) );
            $type            = "comment";
            $metadata        = $metadata || {}

        var metadata_title           = Boolean( $metadata.metadata_title )          ? "'"+utils.addslashes( trim( $metadata.metadata_title )) +"'" : null;
        var metadata_description     = Boolean( $metadata.metadata_description )    ? "'"+utils.addslashes( trim( $metadata.metadata_description )) +"'" : null;
        var metadata_thumbnail_url   = Boolean( $metadata.metadata_thumbnail_url )  ? "'"+utils.addslashes( trim( $metadata.metadata_thumbnail_url )) +"'" : null;
        var metadata_url             = Boolean( $metadata.metadata_url    )         ? "'"+utils.addslashes( trim( $metadata.metadata_url ))+"'" : null;
        var metadata_video_url       = Boolean( $metadata.metadata_video_url  )     ? "'"+utils.addslashes( trim( $metadata.metadata_video_url )) +"'" : null;

        var metadata_site_name       = Boolean( $metadata.metadata_site_name )      ? "'"+utils.addslashes( trim( $metadata.metadata_site_name ))+"'" : null;
        var metadata_locale          = Boolean( $metadata.metadata_locale )         ? "'"+utils.addslashes( trim( $metadata.metadata_locale )) +"'" : null;
        var metadata_date            = Boolean( $metadata.metadata_date )           ? "'"+utils.addslashes( trim( $metadata.metadata_date )) +"'" : null;
        var metadata_type            = Boolean( $metadata.metadata_type )           ? "'"+utils.addslashes( trim( $metadata.metadata_type )) +"'" : null;

        var metadata_request_url     = Boolean( $metadata.metadata_request_url )    ? "'"+utils.addslashes( trim( $metadata.metadata_request_url )) +"'" : null;
        var metadata_site_name       = Boolean( $metadata.metadata_site_name )      ? "'"+utils.addslashes( trim( $metadata.metadata_site_name )) +"'" : null;

        var metadata_charset         = Boolean( $metadata.metadata_charset )        ? "'"+utils.addslashes( trim( $metadata.metadata_charset )) +"'" : null;

        var date_created    = utils.DBDate();
        var last_modified   = date_created;
        var uid             = utils.createBase64UUID();
        var pid             = uid;

        var SQL = "INSERT INTO comments    \
                        ( pid,        uid,      userid,       content,      date_created,       type,      metadata_url,       metadata_title,       metadata_description,       metadata_thumbnail_url,       metadata_video_url,       metadata_locale,       metadata_date,       metadata_site_name,       metadata_request_url )    \
                        VALUES    \
                        ( '{{pid}}', '{{uid}}', '{{userid}}', '{{content}}','{{date_created}}', 'comment', {{metadata_url}}, {{metadata_title}}, {{metadata_description}}, {{metadata_thumbnail_url}}, {{metadata_video_url}}, {{metadata_locale}}, {{metadata_date}}, {{metadata_site_name}}, {{metadata_request_url}} )     \
                        ;".split("{{pid}}").join($pid)
                          .split("{{uid}}").join(uid)
                          .split("{{userid}}").join($userid)
                          .split("{{content}}").join($content)
                          .split("{{date_created}}").join(date_created)
                          .split("{{metadata_url}}").join(metadata_url)
                          .split("{{metadata_title}}").join(metadata_title)
                          .split("{{metadata_description}}").join(metadata_description)
                          .split("{{metadata_thumbnail_url}}").join(metadata_thumbnail_url)
                          .split("{{metadata_video_url}}").join(metadata_video_url)
                          .split("{{metadata_locale}}").join(metadata_locale)
                          .split("{{metadata_date}}").join(metadata_date)
                          .split("{{metadata_site_name}}").join(metadata_site_name)
                          .split("{{metadata_request_url}}").join(metadata_request_url)

            //console.log("createComment:SQL:", SQL );

            query( $userid, SQL, $config, function($comment_data){

                getComment( $userid, uid, $config, function($comment){
                    _notes.create_PostComment_note($userid, pid, uid, {}, function($data){
                        $cb($comment)
                    } )

                } )

            });
    }



    function updateComment( $userid, $comment_id, $content, $metadata, $config, $cb )
    {
          console.log("NewsFeedManager.updateComment():userid:", $userid, ", comment_id:",$comment_id, ", content:", $content );
            $userid          = trim( $userid );
            $comment_id      = trim( $comment_id );
            $content         = utils.addslashes( trim( $content ) );
            //type            = "comment";

            var metadata_title           = $metadata.metadata_title          ? utils.addslashes( trim( $metadata.metadata_title )) : null;
            var metadata_description     = $metadata.metadata_description    ? utils.addslashes( trim( $metadata.metadata_description )) : null;
            var metadata_thumbnail_url   = $metadata.metadata_thumbnail_url  ? utils.addslashes( trim( $metadata.metadata_thumbnail_url )) : null;
            var metadata_url             = $metadata.metadata_url            ? utils.addslashes( trim( $metadata.metadata_url )) : null;
            var metadata_video_url       = $metadata.metadata_video_url      ? utils.addslashes( trim( $metadata.metadata_video_url )) : null;

            var metadata_site_name       = $metadata.metadata_site_name      ? utils.addslashes( trim( $metadata.metadata_site_name )) : null;
            var metadata_locale          = $metadata.metadata_locale         ? utils.addslashes( trim( $metadata.metadata_locale )) : null;
            var metadata_date            = $metadata.metadata_date           ? utils.addslashes( trim( $metadata.metadata_date )) : null;
            var metadata_type            = $metadata.metadata_type           ? utils.addslashes( trim( $metadata.metadata_type )) : null;

            var metadata_request_url     = $metadata.metadata_request_url    ? utils.addslashes( trim( $metadata.metadata_request_url )) : null;
            var metadata_site_name       = $metadata.metadata_site_name      ? utils.addslashes( trim( $metadata.metadata_site_name )) : null;

            var metadata_charset         = $metadata.metadata_charset        ? utils.addslashes( trim( $metadata.metadata_charset )) : null;

            var count = 0;

            var SQL = "UPDATE  comments  SET  "

            if( $content ){
                SQL     += count == 0? '' : ", ";
                count++;
                SQL     += ' content = "' + $content + '" ';
            }
            if( metadata_title ){
                SQL     += count == 0? '' : ", ";
                count++;
                SQL     += ' metadata_title = "' + metadata_title + '" ';
            }
            if( metadata_description ){
                SQL     += count == 0? '' : ", ";
                count++;
                SQL     += ' metadata_description = "'+ metadata_description +'" ';
            }
            if( metadata_thumbnail_url ){
                SQL     += count == 0? '' : ", ";
                count++;
                SQL     += ' metadata_thumbnail_url = "' + metadata_thumbnail_url + '" ';
            }
            if( metadata_locale ){
                SQL     += count == 0? '' : ", ";
                count++;
                SQL     += ' metadata_locale = "' + metadata_locale + '" ';
            }

            if( metadata_date ){
                SQL     += count == 0? '' : ", ";
                count++;
                SQL     += ' metadata_date = "' + metadata_date + '" ';
            }

            if( metadata_type ){
                SQL     += count == 0? '' : ", ";
                count++;
                SQL     += ' metadata_type = "' + metadata_type + '" ';
            }
            if( metadata_request_url ){
                SQL     += count == 0? '' : ", ";
                count++;
                SQL     += ' metadata_request_url = "' + metadata_request_url + '" ';
            }
            if( metadata_site_name ){
                SQL     += count == 0? '' : ", ";
                count++;
                SQL     += ' metadata_site_name = "' + metadata_site_name + '" ';
            }
            if( metadata_charset ){
                SQL     += count == 0? '' : ", ";
                count++;
                SQL     += ' metadata_charset = "' + metadata_charset + '" ';
            }

            SQL += ' WHERE uid = "' + $comment_id + '";';

            //console.log("updateComment:SQL:", SQL );

            query( $userid, SQL, $config, function($comment_data){
                $cb($comment_data);
            });
    }



    function reply2Comment( $userid, $pid, $parent_comment_id, $content, $metadata, $config, $cb )
    {
         console.log("NewsFeedManager.reply2Comment():pid:", $pid , ", userid:", $userid , ", parent_comment_id:" , $parent_comment_id , ", content:", $content, ", metadata:", $metadata);

                $userid              = trim( $userid );
                $pid                 = trim( $pid );
                $parent_comment_id   = trim( $parent_comment_id );
                $content             = utils.addslashes( trim( $content ) );
                $type                = "reply-2-comment";

            var date_created        = utils.DBDate();
            var last_modified       = date_created;
            var uid                 = utils.createBase64UUID();

            var metadata_title           = Boolean( $metadata.metadata_title )          ? "'"+utils.addslashes( trim( $metadata.metadata_title )) +"'" : null;
            var metadata_description     = Boolean( $metadata.metadata_description )    ? "'"+utils.addslashes( trim( $metadata.metadata_description )) +"'" : null;
            var metadata_thumbnail_url   = Boolean( $metadata.metadata_thumbnail_url )  ? "'"+utils.addslashes( trim( $metadata.metadata_thumbnail_url )) +"'" : null;
            var metadata_url             = Boolean( $metadata.metadata_url    )         ? "'"+utils.addslashes( trim( $metadata.metadata_url ))+"'" : null;
            var metadata_video_url       = Boolean( $metadata.metadata_video_url  )     ? "'"+utils.addslashes( trim( $metadata.metadata_video_url )) +"'" : null;

            var metadata_site_name       = Boolean( $metadata.metadata_site_name )      ? "'"+utils.addslashes( trim( $metadata.metadata_site_name ))+"'" : null;
            var metadata_locale          = Boolean( $metadata.metadata_locale )         ? "'"+utils.addslashes( trim( $metadata.metadata_locale )) +"'" : null;
            var metadata_date            = Boolean( $metadata.metadata_date )           ? "'"+utils.addslashes( trim( $metadata.metadata_date )) +"'" : null;
            var metadata_type            = Boolean( $metadata.metadata_type )           ? "'"+utils.addslashes( trim( $metadata.metadata_type )) +"'" : null;

            var metadata_request_url     = Boolean( $metadata.metadata_request_url )    ? "'"+utils.addslashes( trim( $metadata.metadata_request_url )) +"'" : null;
            var metadata_site_name       = Boolean( $metadata.metadata_site_name )      ? "'"+utils.addslashes( trim( $metadata.metadata_site_name )) +"'" : null;

            var metadata_charset         = Boolean( $metadata.metadata_charset )        ? "'"+utils.addslashes( trim( $metadata.metadata_charset )) +"'" : null;

            var SQL = "INSERT INTO comments    \
                            ( pid, uid,             userid,       parent_comment_id,       content,       date_created,       type,       metadata_url,       metadata_title,       metadata_description,       metadata_thumbnail_url,       metadata_video_url,       metadata_locale,       metadata_date,       metadata_site_name,       metadata_request_url )    \
                            VALUES    \
                            ( '{{pid}}', '{{uid}}','{{userid}}', '{{parent_comment_id}}', '{{content}}', '{{date_created}}', '{{type}}', {{metadata_url}}, {{metadata_title}}, {{metadata_description}}, {{metadata_thumbnail_url}}, {{metadata_video_url}}, {{metadata_locale}}, {{metadata_date}}, {{metadata_site_name}}, {{metadata_request_url}} )     \
                            ;".split("{{pid}}").join($pid)
                              .split("{{uid}}").join(uid)
                              .split("{{userid}}").join($userid)
                              .split("{{parent_comment_id}}").join($parent_comment_id)
                              .split("{{content}}").join($content)
                              .split("{{type}}").join($type)
                              .split("{{date_created}}").join(date_created)
                              .split("{{metadata_url}}").join(metadata_url)
                              .split("{{metadata_title}}").join(metadata_title)
                              .split("{{metadata_description}}").join(metadata_description)
                              .split("{{metadata_thumbnail_url}}").join(metadata_thumbnail_url)
                              .split("{{metadata_video_url}}").join(metadata_video_url)
                              .split("{{metadata_locale}}").join(metadata_locale)
                              .split("{{metadata_date}}").join(metadata_date)
                              .split("{{metadata_site_name}}").join(metadata_site_name)
                              .split("{{metadata_request_url}}").join(metadata_request_url)


                //console.log("NewsFeedManager.reply2Comment:SQL:", SQL );

                query( $userid, SQL, $config, function($comment_data){
                    getComment( $userid, uid, $config, function($comment){
                          _notes.create_PostReplyComment_note($userid, pid, uid, {}, function($data){
                              $cb($comment)
                          })
                    } )

                });
    }




    function queryPosts( $userid, $sql, $config, $cb )
    {
            //console.log("postsManager.queryposts():userid:", $userid, ", sql:",$sql, ", config:", $config, ", cb:", $cb );
            $userid  = $userid ? trim($userid) : null;

        var posts = [];

        _con.query( $sql )
            .then(function(rows){
                if( rows.length <= 0 ){
                    $cb(rows);
                    return rows;
                }

                var comments_count   = 0;
                var likes_count      = 0;
                var stats_count      = 0;
                var dislikes_count   = 0;

                var comments_limit   = $config.comments_limit       || DEFAULT_COMMENTS_LIMIT;
                var likes_limit      = $config.likes_limit          || DEFAULT_LIKES_LIMIT;
                var dislikes_limit   = $config.dislikes_limit       || DEFAULT_DISLIKES_LIMIT;

                var comments_offset  = $config.comments_offset     || 0;
                var likes_offset     = $config.likes_offset        || 0;
                var dislikes_offset  = $config.dislikes_offset     || 0;

    //                var comments_sort_by  = config.comments_sort_by || null;
    //                var likes_sort_by     = config.likes_sort_by || null;

    //                var comments_order_by  = config.comments_order_by || null;
    //                var likes_order_by     = config.likes_order_by || null;

                function updateCounter($type, $post, $post_cb )
                {
                    //console.log("updateCounter(type:", $type );
                    if( $type == "comments" ){
                        comments_count++;
                    }

                    if( $type == "likes" )
                    {
                        likes_count++
                    }

                    if( $type == "dislikes" )
                    {
                        dislikes_count++
                    }

                    if( $type == "stats" )
                    {
                        stats_count++;
                    }

                    if( comments_count == rows.length &&
                        likes_count == rows.length &&
    //                        dislikes_count == rows.length &&
                        stats_count > 0 &&
                        rows.length ){
                        try{
                            $post_cb( posts );
                        }catch(e){
                            //console.log("postsManager:queryposts:updateCounter:error:", e);
                        }
                    }
                };

                _.each( rows, function(row){
                    var post = row;

                        $config.user        = $config.user || {};

                        //post.catagory       = $config.catagory;

                        post.is_author      = post.userid ? Boolean( trim( post.userid ) == $userid ) : false;

                        //console.log("postsManager.queryposts:user:", config.user.is_admin)
                        post.is_admin       = $config.user.is_admin || false;
                        post.is_staff       = $config.user.is_staff || false;
                        post.is_moderator   = $config.user.is_moderator || false;
                        post.is_loggedin    = $config.user.is_loggedin || false;

                        post.total_views = 0;
                        post.total_unique_users = 0;

                        post.comments = [];
                        post.likes = [];
                        post.dislikes = [];
                        post.total_followers = formatNumberby1k(Number(post.total_followers));


                        post.description_short = null;// = post.description;

                        if( post.description && post.description.length > DESCRIPTION_SHORT_LENGTH ){
                            post.description_short = post.description.substring(0, DESCRIPTION_SHORT_LENGTH)// + '...';
                        }

                        //posts.date = (posts.date_created) ? _dateUtils.tsToSlashDate(val.date_created) : "NA";

                        posts.push( post );

                        getPostStats( post.pid, {date:null}, function(stats){

                            var total_views =  Number( stats.total_views );
                            var total_unique_users =  Number( stats.total_unique_users );

                            post.total_views = formatNumberby1k( total_views );
                            post.total_unique_users = formatNumberby1k( total_unique_users );
                            updateCounter("stats", post, $cb );
                        })

                        getPostComments( $userid, post.pid, comments_limit, comments_offset, $config, function(comments){
                            post.comments = comments;
                            updateCounter("comments", post, $cb );
                        });

                        getPostLikes( $userid, post.pid, likes_limit, likes_offset, $config, function(likes){
                            post.likes = likes;
                            updateCounter("likes", post, $cb );
                        });
    /*
                        getPostTotalDislikes( $userid, post.pid, dislikes_limit, dislikes_offset, $config, function(dislikes){
                            post.dislikes = dislikes;
                            updateCounter("dislikes", post, $cb );
                        });
    */
                })
            }).catch(function($error){
                console.log("NewsFeedManager.queryposts():error:" , $error);
                $cb();
            });
    }

    function query( userid, sql, config, cb )
    {
    //        console.log("query():userid:", userid, ", SQL:",sql );
        var _query_results = [];

        _con.query( sql )
            .then(function(rows){

                _query_results = rows;
                try{
                    cb(_query_results);
                }catch(e){
                    console.log("query:catch:error:",e)
                }
                return _query_results;
            }).catch(function(err){
                console.log("NewsFeedManager.query.catch:err:", err);
            })
    }


    return{
        createPost              : createPost,
//        updatePost              : updatePost,
        getPost                 : getPost,
        getPostAbsolute         : getPostAbsolute,
        getPostEmbed            : getPostEmbed,
//        getPosts                : getPosts,
        deletePost              : deletePost,
        savePostMetadata        : savePostMetadata,
        add2History             : add2History,

        getPostTotalLikes       : getPostTotalLikes,
        getPostTotalDislikes    : getPostTotalDislikes,
        getPostTotalComments    : getPostTotalComments,

        getUserNewsFeed         : getUserNewsFeed,
        getNewsFeed             : getNewsFeed,

        getPostDislikes         : getPostDislikes,
        getPostCommentDislikes  : getPostCommentDislikes,
        getPostCommentLikes     : getPostCommentLikes,
        getPostLikes            : getPostLikes,
        getComment              : getComment,
        getCommentReplies       : getCommentReplies,
        getPostComments         : getPostComments,
        getPostComment          : getPostComment,

        markCommentAsUnread     : markCommentAsUnread,
        markCommentAsRead       : markCommentAsRead,


        getPostStats            : getPostStats,
        queryPosts              : queryPosts,

        postLiked               : postLiked,
        postDisliked            : postDisliked,
        postCommentDisliked     : postCommentDisliked,
        postCommentLiked        : postCommentLiked,

        getUnreadCommentsCount  : getUnreadCommentsCount,
        deleteComment           : deleteComment,
        setCommentStatus        : setCommentStatus,
        getChannelPostComments  : getChannelPostComments,
        getUserPostComments     : getUserPostComments,
        createComment           : createComment,
        updateComment           : updateComment,
        reply2Comment           : reply2Comment,
        setCommentStatus        : setCommentStatus

    }
}

module.exports = new NewsFeedManager();
