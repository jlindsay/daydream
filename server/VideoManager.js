/**
 * author:Joshua Lindsay
 * email:j@lindsayfilm.com
 * twitter:@jlindsay
 * https://www.lindsayfilm.com
 * Software can be used for Good or Evil.
 * Some people die rich, some die poor, the result is the same.
 */


/**
 * VideoManager, video c.r.u.d
 */

var path                = require("path");

function VideoManager()
{
    var self        = this;
    var trim        = require('trim');
    var utils       = require('./Utils');
    var async       = require('async');

//    var _um;      = require('./UserManager');
    var _notes      = require('./NotificationManager');

    var _ = require('underscore');
        _.mixin(require('underscore.inflections'));

    var mysql = require('promise-mysql');
        mysql.createConnection({
            host    : 'localhost',
            user    : 'root',
            password: 'password',
            database: 'daydream'
        }).then(function(conn){
            _con = conn;
        });

    var _is_loggedin    = false
    var _is_admin       = false
    var _is_moderator   = false
    var _is_staff       = false

    var _videos         = [];
    var _favorites      = [];
    var _history        = [];
    var _query_results  = [];

    var DEFAULT_COMMENTS_LIMIT  = 5;
    var DEFAULT_LIKES_LIMIT     = 20;
    var DEFAULT_DISLIKES_LIMIT  = 20;

    var CONTENT_SHORT_LENGTH = 120;
    var DESCRIPTION_SHORT_LENGTH = 240;

    function getTVShows(userid, limit, offset, config, cb)
    {
        console.log("VideoManager:getTVShows():userid,", userid );

        userid = userid? trim( userid ) : null;
        offset  = offset ? trim( offset ) : 0;
        limit   = limit ? trim( limit ) : 20;

        var SQL = "SELECT video_2_tv.* , \
                          videos.*, \
                          videos.uid as vid, \
                          users.uid AS userid, \
                          users.profile_url, \
                          users.first_name, \
                          users.last_name, \
                          users.level, \
                          CONCAT( users.first_name, ' ' , users.last_name) AS full_name,  \
                          ( SELECT COUNT(*) FROM followers WHERE followers.userid = users.uid ) AS total_followers ,   \
                          ( SELECT COUNT(*) FROM comments WHERE comments.vid = videos.uid ) AS total_comments, \
                          ( SELECT COUNT(*) FROM comments WHERE comments.type = 'comment' AND comments.vid = videos.uid ) AS total_replies_2_video , \
                          ( SELECT COUNT(*) FROM comments WHERE comments.type = 'reply-2-comment' AND comments.vid = videos.uid ) AS total_replies_2_comments , \
                          ( SELECT COUNT(*) FROM liked WHERE liked.vid = videos.uid AND content_type = 'video' AND liked.status = 'true' ) AS total_likes , \
                          ( SELECT COUNT(*) FROM liked WHERE liked.vid = videos.uid AND content_type = 'video' AND liked.status = 'false' ) AS total_dislikes \
                       FROM video_2_tv    \
                          JOIN videos ON video_2_tv.vid = videos.uid   \
                                JOIN users ON users.uid = videos.userid  \
                                    WHERE videos.catagorys = 'tv'   \
                                        ORDER BY video_2_tv.date_created DESC LIMIT {{limit}} OFFSET {{offset}}   \
            ;".split("{{limit}}").join(limit)
            .split("{{offset}}").join(offset);

            queryVideos( userid, SQL, config, cb );
    }


    function getTVShow(userid, tvid, config, cb)
    {
        console.log("VideoManager:getTVShow():userid,", userid, ", tvid:", tvid );
        userid = userid? trim( userid ) : null;
        tvid   = tvid? trim( tvid ) : null;

        var SQL = "SELECT video_2_tv.* , \
                          videos.*, \
                          videos.uid as vid, \
                          users.uid AS userid, \
                          users.profile_url, \
                          users.first_name, \
                          users.last_name, \
                          users.level, \
                          CONCAT( users.first_name, ' ' , users.last_name) AS full_name,  \
                          ( SELECT COUNT(*) FROM followers WHERE followers.userid = users.uid ) AS total_followers ,   \
                          ( SELECT COUNT(*) FROM comments WHERE comments.vid = videos.uid ) AS total_comments, \
                          ( SELECT COUNT(*) FROM comments WHERE comments.type = 'comment' AND comments.vid = videos.uid ) AS total_replies_2_video , \
                          ( SELECT COUNT(*) FROM comments WHERE comments.type = 'reply-2-comment' AND comments.vid = videos.uid ) AS total_replies_2_comments , \
                          ( SELECT COUNT(*) FROM liked WHERE liked.vid = videos.uid AND content_type = 'video' AND liked.status = 'true') AS total_likes , \
                          ( SELECT COUNT(*) FROM liked WHERE liked.vid = videos.uid AND content_type = 'video' AND liked.status = 'false' ) AS total_dislikes \
        	           FROM video_2_tv    \
                            JOIN users ON users.uid = videos.userid  \
        	                   JOIN videos ON video_2_tv.vid = videos.uid   \
        		                     WHERE tvid = '{{tvid}}'    \
            ".split("{{tvid}}").join(tvid)

            queryVideos( userid, SQL, config, cb );
    }

    function getTVShowBySeason(userid, tvid, season_id, config, cb )
    {
        console.log("VideoManager:getTVShow():userid,", userid, ", tvid:", tvid );
        userid = userid? trim( userid ) : null;
        tvid   = tvid? trim( tvid ) : null;
/*
        var SQL = "SELECT video_2_tv.* , videos.*   \
        	           FROM video_2_tv    \
        	              JOIN videos ON video_2_tv.vid = videos.uid   \
        		                WHERE tvid = '{{tvid}}';    \
            ".split("{{tvid}}").join(tvid)

            queryVideos( userid, SQL, config, cb );
*/
    }


    function getMovie(userid, mvid, config, cb)
    {
        console.log("VideoManager:getMovie():userid,", userid, ", mvid:", mvid );
        userid = userid? trim( userid ) : null;
        mvid    = mvid? trim( mvid ) : null;
/*
        var SQL = "SELECT * , videos.*, videos.uid as videos.vid   \
                       FROM video_2_tv    \
                          JOIN videos ON video_2_tv.vid = videos.uid   \
                                WEHRE tvid = '{{tvid}}';    \
            ".split("{{tvid}}").join(tvid)
             .split("{{userid}}").join(userid);

             queryVideos( userid, SQL, config, cb );
*/
    }

    function getMovies(userid, limit, offset, config, cb)
    {
        //console.log("VideoManager:getMovies():userid,", userid );
        userid = userid? trim( userid ) : null;
        offset  = offset ? trim( offset ) : 0;
        limit   = limit ? trim( limit ) : 20;

        var SQL = "SELECT * , \
                          videos.uid as vid, \
                          users.uid AS userid, \
                          users.profile_url, \
                          users.first_name, \
                          users.last_name, \
                          users.level, \
                          CONCAT( users.first_name, ' ' , users.last_name) AS full_name,  \
                          ( SELECT COUNT(*) FROM followers WHERE followers.userid = users.uid ) AS total_followers ,   \
                          ( SELECT COUNT(*) FROM comments WHERE comments.vid = videos.uid ) AS total_comments, \
                          ( SELECT COUNT(*) FROM comments WHERE comments.type = 'comment' AND comments.vid = videos.uid ) AS total_replies_2_video , \
                          ( SELECT COUNT(*) FROM comments WHERE comments.type = 'reply-2-comment' AND comments.vid = videos.uid ) AS total_replies_2_comments , \
                          ( SELECT COUNT(*) FROM liked WHERE liked.vid = videos.uid AND content_type = 'video' AND liked.status = 'true' ) AS total_likes , \
                          ( SELECT COUNT(*) FROM liked WHERE liked.vid = videos.uid AND content_type = 'video' AND liked.status = 'false' ) AS total_dislikes \
                       FROM videos    \
                            JOIN users ON users.uid = videos.userid  \
                                WHERE videos.catagorys = 'movie'   \
                                    ORDER BY videos.date_created DESC LIMIT {{limit}} OFFSET {{offset}}; \
            ;".split("{{limit}}").join(limit)
            .split("{{offset}}").join(offset);

            //console.log("getMovies:SQL:",SQL)

             queryVideos( userid, SQL, config, cb );
    }

    function getAudiobook(userid, avid, config, cb)
    {
        //console.log("VideoManager:getAudiobook():userid,", userid, ", avid:", avid );
/*
        userid = userid? trim( userid ) : null;
        avid    = avid? trim( avid ) : null;

        var SQL = "SELECT * , \
                          videos.uid as videos.vid   \
                          ( SELECT COUNT(*) FROM comments WHERE comments.vid = videos.uid ) AS total_comments, \
                          ( SELECT COUNT(*) FROM comments WHERE comments.type = 'comment' AND comments.vid = videos.uid ) AS total_replies_2_video , \
                          ( SELECT COUNT(*) FROM comments WHERE comments.type = 'reply-2-comment' AND comments.vid = videos.uid ) AS total_replies_2_comments , \
                          ( SELECT COUNT(*) FROM liked WHERE liked.vid = videos.uid AND content_type = 'video' AND liked.status = 'true' ) AS total_likes , \
                          ( SELECT COUNT(*) FROM liked WHERE liked.vid = videos.uid AND content_type = 'video' AND liked.status = 'false' ) AS total_dislikes \
                       FROM video_2_tv    \
                          JOIN videos ON video_2_tv.vid = videos.uid   \
                                WEHRE tvid = '{{tvid}}';    \
            ".split("{{tvid}}").join(tvid)
             .split("{{userid}}").join(userid);

             queryVideos( userid, SQL, config, cb );
*/
    }

    function getAudiobooks(userid, limit, offset, config, cb)
    {
        //console.log("VideoManager:getAudiobooks():userid,", userid );
        userid = userid? trim( userid ) : null;
        offset  = offset ? trim( offset ) : 0;
        limit   = limit ? trim( limit ) : 20;

        var SQL = "SELECT * , \
                          videos.uid as vid, \
                          users.uid AS userid, \
                          users.profile_url, \
                          users.first_name, \
                          users.last_name, \
                          users.level, \
                          CONCAT( users.first_name, ' ' , users.last_name) AS full_name,   \
                          ( SELECT COUNT(*) FROM followers WHERE followers.userid = users.uid ) AS total_followers ,   \
                          ( SELECT COUNT(*) FROM comments WHERE comments.vid = videos.uid ) AS total_comments, \
                          ( SELECT COUNT(*) FROM comments WHERE comments.type = 'comment' AND comments.vid = videos.uid ) AS total_replies_2_video , \
                          ( SELECT COUNT(*) FROM comments WHERE comments.type = 'reply-2-comment' AND comments.vid = videos.uid ) AS total_replies_2_comments , \
                          ( SELECT COUNT(*) FROM liked WHERE liked.vid = videos.uid AND content_type = 'video' AND liked.status = 'true' ) AS total_likes , \
                          ( SELECT COUNT(*) FROM liked WHERE liked.vid = videos.uid AND content_type = 'video' AND liked.status = 'false' ) AS total_dislikes \
                       FROM videos    \
                            JOIN users ON users.uid = videos.userid  \
                                WHERE videos.catagorys = 'audiobook'   \
                                    ORDER BY videos.date_created DESC LIMIT {{limit}} OFFSET {{offset}}   \
        ;".split("{{limit}}").join(limit)
            .split("{{offset}}").join(offset);

             queryVideos( userid, SQL, config, cb );
    }

    function getVideo( userid, vid, config, cb )
    {
            console.log("VideoManager:getVideo():userid,", userid, ", vid:", vid );
            userid = userid ? trim( userid ) : null;
            vid    = vid ? trim( vid ) : null;

        var SQL = "SELECT videos.*, \
                          videos.uid AS vid, \
                          users.uid AS userid, \
                          users.profile_url, \
                          users.first_name, \
                          users.last_name, \
                          users.level, \
                          CONCAT( users.first_name, ' ' , users.last_name) AS full_name,  \
                          ( SELECT COUNT(*) FROM followers WHERE followers.userid = users.uid ) AS total_followers ,   \
                          ( SELECT COUNT(*) FROM comments WHERE comments.vid = videos.uid ) AS total_comments, \
                          ( SELECT COUNT(*) FROM comments WHERE comments.type = 'comment' AND comments.vid = videos.uid ) AS total_replies_2_video , \
                          ( SELECT COUNT(*) FROM comments WHERE comments.type = 'reply-2-comment' AND comments.vid = videos.uid ) AS total_replies_2_comments , \
                          ( SELECT COUNT(*) FROM liked WHERE liked.vid = videos.uid AND liked.status = 'true' ) AS total_likes , \
                          ( SELECT COUNT(*) FROM liked WHERE liked.vid = videos.uid AND liked.status = 'false' ) AS total_dislikes \
                FROM videos \
                    JOIN users ON users.uid = videos.userid  \
                        WHERE ( videos.uid = '{{vid}}' AND videos.is_public > 0 ) \
                        OR ( videos.uid = '{{vid}}' AND videos.userid = '{{userid}}' ) \
            ;".split("{{vid}}").join( vid )
            .split("{{userid}}").join( userid )

            //console.log("SQL:",SQL)

            queryVideos( userid, SQL, config, cb );
    }

    function getVideoAbsolute(userid, vid, config, cb )
    {
            console.log("VideoManager:getVideo():userid,", userid, ", vid:", vid );
            userid = userid? trim( userid ) : null;
            vid    = vid? trim( vid ) : null;

        var SQL = "SELECT videos.*, \
                          videos.uid AS vid , \
                          users.uid AS userid, \
                          users.profile_url, \
                          users.first_name, \
                          users.last_name, \
                          users.level, \
                          CONCAT( users.first_name, ' ' , users.last_name) AS full_name, \
                          ( SELECT COUNT(*) FROM followers WHERE followers.userid = users.uid ) AS total_followers ,   \
                          ( SELECT COUNT(*) FROM comments WHERE comments.vid = videos.uid ) AS total_comments, \
                          ( SELECT COUNT(*) FROM comments WHERE comments.type = 'comment' AND comments.vid = videos.uid ) AS total_replies_2_video , \
                          ( SELECT COUNT(*) FROM comments WHERE comments.type = 'reply-2-comment' AND comments.vid = videos.uid ) AS total_replies_2_comments , \
                          ( SELECT COUNT(*) FROM liked WHERE liked.vid = videos.uid AND content_type = 'video' AND liked.status = 'true' ) AS total_likes , \
                          ( SELECT COUNT(*) FROM liked WHERE liked.vid = videos.uid AND content_type = 'video' AND liked.status = 'false' ) AS total_dislikes \
                FROM videos \
                  JOIN users ON users.uid = videos.userid  \
                        WHERE videos.uid = '{{vid}}' \
            ;".split("{{vid}}").join( vid )
            //.split("{{userid}}").join( userid )

            //console.log("SQL:", SQL)
            queryVideos( userid, SQL, config, cb );

    }


    function getVideo2Share( userid, sid, config, cb )
    {
            console.log("VideoManager:getVideo2Share():userid,", userid, ", sid:", sid );

            userid    = userid? trim(userid) : null;
            sid       = sid? trim(sid) : null;

        var SQL = "SELECT share_videos.*, \
                          share_videos.uid AS sid , \
                          videos.*   \
	                   FROM share_videos   \
		                    JOIN videos ON videos.uid = share_videos.vid   \
			                      WHERE share_videos.uid = '{{sid}}'    \
                                  AND ( videos.is_sharing = '1' OR videos.userid = '{{userid}}' )     \
                                  AND videos.is_deleted = '0'    \
                                  AND ( share_videos.userid = '{{userid}}' OR videos.userid = '{{userid}}' )   \
                                  LIMIT 1   \
                            ;".split("{{userid}}").join( userid )
                              .split("{{sid}}").join( sid );

            query( userid, SQL, config, function($rows){
              var video = $rows[0];
              //NOTE: this is hacky way of error handling
              if(!video)
              {
                cb([{ status:'permission-denied', message:'user does not have permission to view this video.', sid:sid, vid:null, userid:userid }])
              }else{

                  video.comments = [];
                  video.total_comments = [];

                  video.likes = [];
                  video.total_likes = 0;

                  video.is_author     = ( video.userid == userid )? true : false
                  video.is_admin      = config.user.is_admin || false;
                  video.is_staff      = config.user.is_staff || false;
                  video.is_moderator  = config.user.is_moderator || false;
                  video.is_loggedin   = config.user.is_loggedin || false;

//                  video.useRTMP = true;

                  video.comments = [];
                  video.likes = [];
                  cb($rows);
              }
            });

    }

    function getProfileUserVideos( userid, profile_id, limit, offset, config, cb )
    {
                  console.log("VideoManager:getProfileUserVideos():userid,", userid, "limit:", limit, "offset:", offset );
                  userid  = userid? trim(userid) : null;
                  profile_id  = profile_id? trim(profile_id) : null;
                  offset  = offset ? trim( offset ) : 0;
                  limit   = limit ? trim( limit ) : 20;

              var SQL = "SELECT videos.* , \
                                videos.uid AS vid , \
                                users.uid AS userid, \
                                users.profile_url, \
                                users.first_name, \
                                users.last_name, \
                                users.level, \
                                CONCAT( users.first_name, ' ' , users.last_name ) AS full_name,  \
                                ( SELECT COUNT(*) FROM followers WHERE followers.userid = users.uid ) AS total_followers ,   \
                                ( SELECT COUNT(*) FROM comments WHERE comments.vid = videos.uid ) AS total_comments, \
                                ( SELECT COUNT(*) FROM comments WHERE comments.type = 'comment' AND comments.vid = videos.uid ) AS total_replies_2_video , \
                                ( SELECT COUNT(*) FROM comments WHERE comments.type = 'reply-2-comment' AND comments.vid = videos.uid ) AS total_replies_2_comments , \
                                ( SELECT COUNT(*) FROM liked WHERE liked.vid = videos.uid AND content_type = 'video' AND liked.status = 'true' ) AS total_likes , \
                                ( SELECT COUNT(*) FROM liked WHERE liked.vid = videos.uid AND content_type = 'video' AND liked.status = 'false' ) AS total_dislikes \
                          FROM videos  \
                              JOIN users ON users.uid = videos.userid  \
                                          WHERE videos.userid = '{{userid}}'  \
                                          ORDER BY videos.date_created DESC LIMIT {{limit}} OFFSET {{offset}}; \
                      ".split("{{userid}}").join(profile_id)
                      .split("{{limit}}").join(limit)
                      .split("{{offset}}").join(offset);

                      console.log("VideoManager:getProfileUserVideos:SQL:",SQL)

                  queryVideos( userid, SQL, config, cb );
    }

    function getUserVideos( userid, limit, offset, config, cb )
    {
//            console.log("VideoManager:getVideos():userid,", userid, "limit:", limit, "offset:", offset );
            userid  = userid? trim(userid) : null;
            offset  = offset ? trim( offset ) : 0;
            limit   = limit ? trim( limit ) : 20;

        var SQL = "SELECT videos.* , \
                          videos.uid AS vid , \
                          users.uid AS userid, \
                          users.profile_url, \
                          users.first_name, \
                          users.last_name, \
                          users.level, \
                          CONCAT( users.first_name, ' ' , users.last_name ) AS full_name,  \
                          ( SELECT COUNT(*) FROM followers WHERE followers.userid = users.uid ) AS total_followers ,   \
                          ( SELECT COUNT(*) FROM comments WHERE comments.vid = videos.uid ) AS total_comments, \
                          ( SELECT COUNT(*) FROM comments WHERE comments.type = 'comment' AND comments.vid = videos.uid ) AS total_replies_2_video , \
                          ( SELECT COUNT(*) FROM comments WHERE comments.type = 'reply-2-comment' AND comments.vid = videos.uid ) AS total_replies_2_comments , \
                          ( SELECT COUNT(*) FROM liked WHERE liked.vid = videos.uid AND content_type = 'video' AND liked.status = 'true' ) AS total_likes , \
                          ( SELECT COUNT(*) FROM liked WHERE liked.vid = videos.uid AND content_type = 'video' AND liked.status = 'false' ) AS total_dislikes \
                    FROM videos  \
                        JOIN users ON users.uid = videos.userid  \
                                    WHERE videos.userid = '{{userid}}'  \
                                    ORDER BY videos.date_created DESC LIMIT {{limit}} OFFSET {{offset}}; \
                ".split("{{userid}}").join(userid)
                .split("{{limit}}").join(limit)
                .split("{{offset}}").join(offset);

//                console.log(SQL)

            queryVideos( userid, SQL, config, cb );
    }


    function getUserFavoritVideos( userid , limit, offset , config, cb )
    {
        console.log("VideoManager.getUserFavoritVideos():userid:", userid, ", limit:", limit, "offset:", offset );

            userid  = userid? trim(userid) : null;
            offset  = offset ? trim( offset ) : 0;
            limit   = limit ? trim( limit ) : 20;

        var SQL = "SELECT videos.* , \
                          videos.uid AS vid , \
                          users.uid AS userid, \
                          users.profile_url, \
                          users.first_name, \
                          users.last_name, \
                          users.level, \
                          CONCAT( users.first_name, ' ' , users.last_name ) AS full_name,  \
                          ( SELECT COUNT(*) FROM followers WHERE followers.userid = users.uid ) AS total_followers ,   \
                          ( SELECT COUNT(*) FROM comments WHERE comments.vid = videos.uid ) AS total_comments, \
                          ( SELECT COUNT(*) FROM comments WHERE comments.type = 'comment' AND comments.vid = videos.uid ) AS total_replies_2_video , \
                          ( SELECT COUNT(*) FROM comments WHERE comments.type = 'reply-2-comment' AND comments.vid = videos.uid ) AS total_replies_2_comments , \
                          ( SELECT COUNT(*) FROM liked WHERE liked.vid = videos.uid AND content_type = 'video' AND liked.status = 'true' ) AS total_likes , \
                          ( SELECT COUNT(*) FROM liked WHERE liked.vid = videos.uid AND content_type = 'video' AND liked.status = 'false' ) AS total_dislikes \
                    FROM videos  \
                        JOIN users ON users.uid = videos.userid  \
                            JOIN favorits favs ON favs.vid = videos.uid WHERE favs.userid = '{{userid}}' \
                            ORDER BY videos.date_created DESC LIMIT {{limit}} OFFSET {{offset}}; \
                ".split("{{userid}}").join(userid)
                .split("{{limit}}").join(limit)
                .split("{{offset}}").join(offset);

            queryVideos( userid, SQL, config, cb );
    }

    function searchUserVideos( userid, keywords, limit, offset, config, cb )
    {
            console.log("VideoManager.searchUserVideos():userid:", userid, ", keywords:", keywords, ", limit:", limit, "offset:", offset );

            userid  = userid ? trim(userid) : null;
            offset  = offset ? trim( offset ) : 0;
            limit   = limit ? trim( limit ) : 20;

        if( keywords == "" ){
            return _search_resutls;
        }

        var keys = keywords.split(" ");
        var count = 0;

        var SQL = "SELECT SQL_CALC_FOUND_ROWS *, \
                          uid as vid \
                      FROM videos WHERE userid='{{userid}}' AND " ;

        _.each( keys, function(key)
        {
            key  = trim( key );
            //NOTE, using the singular form of a word, ie words == word in search
            key = _.singularize(key);
            SQL += ( count > 0 )? " || " : "";
            count++;
            SQL += " title  LIKE '%"+key+"%' || description LIKE '%"+key+"%' || keywords LIKE '%"+key+"%' ";
        });

            SQL += " ORDER BY videos.date_created DESC LIMIT {{limit}} OFFSET {{offset}} ; \
            ".split("{{userid}}").join(userid)
            .split("{{offset}}").join(offset)
            .split("{{limit}}").join(limit);

            queryVideos( userid, SQL, config, cb );
    }

    function searchTV( userid, keywords, limit, offset, config, cb )
    {
        console.log("debug:VideoManager:searchTV:keywords:", keywords )
        //console.log("debug:VideoManager:searchTV:keywords:", keywords)
            userid    = userid ? trim(userid) : null;
            catagory  = "tv"
            offset    = offset ? trim( offset ) : 0;
            limit     = limit ? trim( limit ) : 20;

        var keyword_keys = keywords.split(" ");
        var count=0;

        var SQL = "SELECT videos.*, \
                          videos.uid AS vid , \
                          users.uid AS userid, \
                          users.profile_url, \
                          users.first_name, \
                          users.last_name, \
                          users.level, \
                          CONCAT( users.first_name, ' ' , users.last_name )  AS full_name,  \
                          ( SELECT COUNT(*) FROM followers WHERE followers.userid = users.uid ) AS total_followers ,   \
                          ( SELECT COUNT(*) FROM comments WHERE comments.vid = videos.uid ) AS total_comments, \
                          ( SELECT COUNT(*) FROM comments WHERE comments.type = 'comment' AND comments.vid = videos.uid ) AS total_replies_2_video , \
                          ( SELECT COUNT(*) FROM comments WHERE comments.type = 'reply-2-comment' AND comments.vid = videos.uid ) AS total_replies_2_comments , \
                          ( SELECT COUNT(*) FROM liked WHERE liked.vid = videos.uid AND content_type = 'video' AND liked.status = 'true') AS total_likes , \
                          ( SELECT COUNT(*) FROM liked WHERE liked.vid = videos.uid AND content_type = 'video' AND liked.status = 'false' ) AS total_dislikes \
                    FROM videos  \
                        JOIN users  \
                            ON users.uid = videos.userid  \
                                \
                                WHERE ";

        _.each( keyword_keys, function(key)
        {
            key  = trim( key );
            //NOTE, using the singular form of a word, ie words == word in search
            key = _.singularize(key);
            SQL += ( count > 0 )? " || " : "";
            count++;
            SQL += " title  LIKE '%"+key+"%' || description LIKE '%"+key+"%' || keywords LIKE '%"+key+"%' ";
        });

        SQL += "AND videos.catagorys ='" +  trim(catagory) + "'";

        SQL += " AND videos.is_public > 0  ORDER BY videos.date_created DESC LIMIT {{limit}} OFFSET {{offset}} ; \
        ".split("{{userid}}").join(userid)
        .split("{{offset}}").join(offset)
        .split("{{limit}}").join(limit);

        queryVideos( userid, SQL, config, cb );
    }

    function searchMovies( userid, keywords, limit, offset, config, cb )
    {
            console.log("debug:VideoManager:searchMovies:keywords:", keywords )

            userid    = userid ? trim(userid) : null;
            catagory  = "movie"
            offset    = offset ? trim( offset ) : 0;
            limit     = limit ? trim( limit ) : 20;

        var keyword_keys = keywords.split(" ");
        var count=0;

        var SQL = "SELECT videos.*, \
                          videos.uid AS vid , \
                          users.uid AS userid, \
                          users.profile_url, \
                          users.first_name, \
                          users.last_name, \
                          users.level, \
                          CONCAT( users.first_name, ' ' , users.last_name )  AS full_name , \
                          ( SELECT COUNT(*) FROM followers WHERE followers.userid = users.uid ) AS total_followers ,   \
                          ( SELECT COUNT(*) FROM comments WHERE comments.vid = videos.uid ) AS total_comments, \
                          ( SELECT COUNT(*) FROM comments WHERE comments.type = 'comment' AND comments.vid = videos.uid ) AS total_replies_2_video , \
                          ( SELECT COUNT(*) FROM comments WHERE comments.type = 'reply-2-comment' AND comments.vid = videos.uid ) AS total_replies_2_comments , \
                          ( SELECT COUNT(*) FROM liked WHERE liked.vid = videos.uid AND content_type = 'video' AND liked.status = 'true' ) AS total_likes , \
                          ( SELECT COUNT(*) FROM liked WHERE liked.vid = videos.uid AND content_type = 'video' AND liked.status = 'false' ) AS total_dislikes \
                    FROM videos  \
                        JOIN users  \
                            ON users.uid = videos.userid  \
                                \
                                WHERE ";

            _.each( keyword_keys, function(key)
            {
                key  = trim( key );
                //NOTE, using the singular form of a word, ie words == word in search
                key = _.singularize(key);
                SQL += ( count > 0 )? " || " : "";
                count++;
                SQL += " title  LIKE '%"+key+"%' || description LIKE '%"+key+"%' || keywords LIKE '%"+key+"%' ";
            });
        SQL += "AND videos.catagorys ='" +  trim(catagory) + "'";

        SQL += " AND videos.is_public > 0  ORDER BY videos.date_created DESC LIMIT {{limit}} OFFSET {{offset}} ; \
        ".split("{{userid}}").join(userid)
        .split("{{offset}}").join(offset)
        .split("{{limit}}").join(limit);

        //console.log('searchMovies:', SQL)

        queryVideos( userid, SQL, config, cb );
    }

    function searchAudiobooks( userid, keywords, limit, offset, config, cb )
    {
            console.log("debug:VideoManager:searchAudiobooks:keywords:", keywords )

            userid    = userid ? trim(userid) : null;
            catagory  = "audiobook"
            offset    = offset ? trim( offset ) : 0;
            limit     = limit ? trim( limit ) : 20;

        var keyword_keys = keywords.split(" ");
        var count=0;

        var SQL = "SELECT videos.*, \
                          videos.uid AS vid , \
                          users.uid AS userid, \
                          users.profile_url, \
                          users.first_name, \
                          users.last_name, \
                          users.level, \
                          CONCAT( users.first_name, ' ' , users.last_name )  AS full_name , \
                          ( SELECT COUNT(*) FROM followers WHERE followers.userid = users.uid ) AS total_followers ,   \
                          ( SELECT COUNT(*) FROM comments WHERE comments.vid = videos.uid ) AS total_comments, \
                          ( SELECT COUNT(*) FROM comments WHERE comments.type = 'comment' AND comments.vid = videos.uid ) AS total_replies_2_video , \
                          ( SELECT COUNT(*) FROM comments WHERE comments.type = 'reply-2-comment' AND comments.vid = videos.uid ) AS total_replies_2_comments , \
                          ( SELECT COUNT(*) FROM liked WHERE liked.vid = videos.uid AND content_type = 'video' AND liked.status = 'true' ) AS total_likes , \
                          ( SELECT COUNT(*) FROM liked WHERE liked.vid = videos.uid AND content_type = 'video' AND liked.status = 'false' ) AS total_dislikes \
                    FROM videos  \
                        JOIN users  \
                            ON users.uid = videos.userid  \
                                \
                                WHERE ";

            _.each( keyword_keys, function(key)
            {
                key  = trim( key );
                //NOTE, using the singular form of a word, ie words == word in search
                key = _.singularize(key);
                SQL += ( count > 0 )? " || " : "";
                count++;
                SQL += " title  LIKE '%"+key+"%' || description LIKE '%"+key+"%' || keywords LIKE '%"+key+"%' ";
            });
        SQL += "AND videos.catagorys ='" +  trim(catagory) + "'";

        SQL += " AND videos.is_public > 0  ORDER BY videos.date_created DESC LIMIT {{limit}} OFFSET {{offset}} ; \
        ".split("{{userid}}").join(userid)
        .split("{{offset}}").join(offset)
        .split("{{limit}}").join(limit);

        queryVideos( userid, SQL, config, cb );
    }

    function searchMyVideos( userid, keywords, limit, offset, config, cb )
    {
            console.log("debug:VideoManager:searchMyVideos:keywords:", keywords )

            userid    = userid ? trim(userid) : null;
            catagory  = ''
            offset    = offset ? trim( offset ) : 0;
            limit     = limit ? trim( limit ) : 20;

        var keyword_keys = keywords.split(" ");
        var count=0;

        var SQL = "SELECT videos.*, \
                          videos.uid AS vid , \
                          users.uid AS userid, \
                          users.profile_url, \
                          users.first_name, \
                          users.last_name, \
                          users.level, \
                          CONCAT( users.first_name, ' ' , users.last_name )  AS full_name  ,  \
                          ( SELECT COUNT(*) FROM followers WHERE followers.userid = users.uid ) AS total_followers ,   \
                          ( SELECT COUNT(*) FROM comments WHERE comments.vid = videos.uid ) AS total_comments, \
                          ( SELECT COUNT(*) FROM comments WHERE comments.type = 'comment' AND comments.vid = videos.uid ) AS total_replies_2_video , \
                          ( SELECT COUNT(*) FROM comments WHERE comments.type = 'reply-2-comment' AND comments.vid = videos.uid ) AS total_replies_2_comments , \
                          ( SELECT COUNT(*) FROM liked WHERE liked.vid = videos.uid AND content_type = 'video' AND liked.status = 'true' ) AS total_likes , \
                          ( SELECT COUNT(*) FROM liked WHERE liked.vid = videos.uid AND content_type = 'video' AND liked.status = 'false' ) AS total_dislikes \
                    FROM videos  \
                        JOIN users  \
                            ON users.uid = videos.userid  \
                                \
                                WHERE ";

            _.each( keyword_keys, function(key)
            {
                key  = trim( key );
                //NOTE, using the singular form of a word, ie words == word in search
                key = _.singularize(key);
                SQL += ( count > 0 )? " || " : "";
                count++;
                SQL += " title  LIKE '%"+key+"%' || description LIKE '%"+key+"%' || keywords LIKE '%"+key+"%' ";
            });
        //SQL += " videos.catagorys ='" +  trim(catagory) + "'";
        SQL += "AND videos.userid ='" +  trim(userid) + "'";

        SQL += " AND videos.is_public > 0  ORDER BY videos.date_created DESC LIMIT {{limit}} OFFSET {{offset}} ; \
        ".split("{{userid}}").join(userid)
        .split("{{offset}}").join(offset)
        .split("{{limit}}").join(limit);

        queryVideos( userid, SQL, config, cb );
    }


    function searchVideos( userid, keywords, limit, offset, config, cb )
    {
        console.log("VideoManager.searchVideos():userid:", userid, ", keywords:" , keywords , ", limit:", limit , "offset:", offset );
            userid    = userid ? trim(userid) : null;

            offset    = offset ? trim( offset ) : 0;
            limit     = limit ? trim( limit ) : 20;

        var keyword_keys = keywords.split(" ");

        var count=0;

        var SQL = "SELECT videos.*, \
                          videos.uid AS vid , \
                          users.uid AS userid, \
                          users.profile_url, \
                          users.first_name, \
                          users.last_name, \
                          users.level, \
                          CONCAT( users.first_name, ' ' , users.last_name )  AS full_name  ,  \
                          ( SELECT COUNT(*) FROM followers WHERE followers.userid = users.uid ) AS total_followers ,   \
                          ( SELECT COUNT(*) FROM comments WHERE comments.vid = videos.uid ) AS total_comments , \
                          ( SELECT COUNT(*) FROM comments WHERE comments.type = 'comment' AND comments.vid = videos.uid ) AS total_replies_2_video , \
                          ( SELECT COUNT(*) FROM comments WHERE comments.type = 'reply-2-comment' AND comments.vid = videos.uid ) AS total_replies_2_comments , \
                          ( SELECT COUNT(*) FROM liked WHERE liked.vid = videos.uid AND content_type = 'video' AND liked.status = 'true') AS total_likes , \
                          ( SELECT COUNT(*) FROM liked WHERE liked.vid = videos.uid AND content_type = 'video' AND liked.status = 'false' ) AS total_dislikes \
                    FROM videos  \
                        JOIN users  \
                            ON users.uid = videos.userid  \
                                \
                        WHERE ";

        _.each( keyword_keys, function(key)
        {
            key  = trim( key );
            //NOTE, using the singular form of a word, ie words == word in search
            key = _.singularize(key);
            SQL += ( count > 0 )? " || " : "";
            count++;
            SQL += " title  LIKE '%"+key+"%' || description LIKE '%"+key+"%' || keywords LIKE '%"+key+"%' ";
            //SQL.split("{{key}}").join(key);
        });

        SQL += " AND videos.is_public > 0  ORDER BY videos.date_created DESC LIMIT {{limit}} OFFSET {{offset}} ; \
        ".split("{{userid}}").join(userid)
        .split("{{offset}}").join(offset)
        .split("{{limit}}").join(limit);

        queryVideos( userid, SQL, config, cb );

    }

    function getVideoEmbed( vid, config, cb)
    {
            console.log("VideoManager:getVideoEmbed():vid:", vid );
        var userid = null;
            vid    = vid? trim( vid ) : null;

        var SQL = "SELECT videos.*, \
                          videos.uid AS vid \
                FROM videos  \
                WHERE uid = '{{vid}}'  \
            ;".split("{{vid}}").join( vid );

            query( userid, SQL, config, function(results){
                cb(results[0])
            } );
    }

    function queryVideos( userid, sql, config, cb )
    {
            //console.log("VideoManager.queryVideos():userid:", userid, ", sql:",sql );
            userid  = userid ? trim(userid) : null;

        var videos = [];

        _con.query( sql )
            .then(function(rows){
                if(rows.length <= 0 ){
                    cb(rows);
                    return rows;
                }

                var comments_count  = 0;
                var likes_count     = 0;
                var stats_count     = 0;
                var dislikes_count  = 0;

                var comments_limit  = config.comments_limit       || DEFAULT_COMMENTS_LIMIT;
                var likes_limit     = config.likes_limit          || DEFAULT_LIKES_LIMIT;
                var dislikes_limit  = config.dislikes_limit       || DEFAULT_DISLIKES_LIMIT;

                var comments_offset  = config.comments_offset     || 0;
                var likes_offset     = config.likes_offset        || 0;
                var dislikes_offset  = config.dislikes_offset     || 0;

//                var comments_sort_by  = config.comments_sort_by || null;
//                var likes_sort_by     = config.likes_sort_by || null;

//                var comments_order_by  = config.comments_order_by || null;
//                var likes_order_by     = config.likes_order_by || null;

                function updateCounter(type, video, video_cb )
                {
                    //console.log("updateCounter(type:", type );
                    if( type == "comments" ){
                        comments_count++;
                    }

                    if( type == "likes" )
                    {
                        likes_count++
                    }

                    if( type == "dislikes" )
                    {
//                        dislikes_count++
                    }

                    if( type == "stats" )
                    {
                        stats_count++;
                    }
                    //console.log("VideoManager:queryVideos:updateCounter():vid:", video.vid );
                    if( comments_count == rows.length &&
                        likes_count == rows.length &&
//                        dislikes_count == rows.length &&
                        rows.length &&
                        stats_count > 0 ){
                        try{
                            //console.log("VideoManager:queryVideos:updateCounter:comments_count:", comments_count, ", likes_count:", likes_count, "rows.length", rows.length  );
                            video_cb( videos );
                        }catch(e){
                            //console.log("VideoManager:queryVideos:updateCounter:error:", e);
                        }
                    }
                };

                _.each( rows, function(row){
                    var video = row;

                        config.user         = config.user || {};

                        video.catagory      = config.catagory;

                        video.is_author     = ( trim( video.userid ) == userid );

                        //console.log("VideoManager.queryVideos:user:", config.user.is_admin)
                        video.is_admin      = config.user.is_admin || false; //_is_admin;//(false)? true : false ;
                        video.is_staff      = config.user.is_staff || false; //_is_staff;//(false)? true : false ;
                        video.is_moderator  = config.user.is_moderator || false; //_is_moderator;//(false)? true : false ;
                        video.is_loggedin   = config.user.is_loggedin || false; //_is_loggedin;//( _SESSION['is_loggedin'] == "1" )? true : false

                        video.total_views = 0;
                        video.total_unique_users = 0;

                        video.comments = [];
                        video.likes = [];
                        video.dislikes = [];
                        video.total_followers = formatNumberby1k(Number(video.total_followers));


                        video.description_short = null;// = video.description;

                        if( video.description && video.description.length > DESCRIPTION_SHORT_LENGTH ){
                            video.description_short = video.description.substring(0, DESCRIPTION_SHORT_LENGTH)// + '...';
                        }

                        //video.date = (video.date_created) ? _dateUtils.tsToSlashDate(val.date_created) : "NA";


                        videos.push( video );

                        getVideoStats( video.vid, {date:null}, function(stats){
                            //console.log("queryVideos:getVideoStats:success:vid:", video.vid , ", stats", stats );
                            var total_views =  Number( stats.total_views );
                            var total_unique_users =  Number( stats.total_unique_users );

                            video.total_views = formatNumberby1k( total_views );
                            video.total_unique_users = formatNumberby1k( total_unique_users );
                            updateCounter("stats", video, cb );
                        })

                        getVideoComments( userid, video.vid, comments_limit, comments_offset, config, function(comments){
                            video.comments = comments;
                            updateCounter("comments", video, cb );
                        });

                        getVideoLikes( userid, video.vid, likes_limit, likes_offset, config, function(data){
                            video.likes = data;
                            updateCounter("likes", video, cb );
                        });
/*
                        getVideoTotalDislikes( userid, video.vid, dislikes_limit, dislikes_offset, config, function(data){
                            video.dislikes = data;
                            updateCounter("dislikes", video, cb );
                        });
*/
                })
            }).catch(function(error){
                console.log("VideoManager.queryVideos():error:" , error);
                cb();
            });
    }


    function markCommentAsRead($userid, $comment_id, $config, $cb )
    {
        console.log("VideoManager.markCommentAsRead():userid:" , $userid, ", comment_id:", comment_id );

        SQL = "UPDATE comments SET status = 'read' WHERE uid = '{{comment_id}}' \
        ;".split("{{comment_id}}").join(comment_id);

        query( $userid, SQL, $config, function($data){
            getPostComment( $userid, $comment_id, $config, $cb )
        })
    }

    function markCommentAsUnread($userid, $comment_id, $config, $cb )
    {
        console.log("VideoManager.markCommentAsRead():userid:" , $userid, ", comment_id:", comment_id );
        SQL = "UPDATE comments SET status = 'read' WHERE uid = '{{comment_id}}' \
        ;".split("{{comment_id}}").join(comment_id);

        query( $userid, SQL, $config, function($data){
            getPostComment( $userid, $comment_id, $config, $cb )
        })
    }


    function queryComments(userid, sql, config, cb )
    {
        userid  = userid ? trim(userid) : null;
        var comments = [];
/*
        _con.query( sql )
            .then(function(rows){
                if(rows.length <= 0 ){
                    cb(rows);
                    return rows;
                }
              })
        }).catch(function(error){
            console.log("VideoManager.queryVideos():error:" , error);
            cb();
        });
*/
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

    function query( userid, sql, config, cb )
    {
//        console.log("queryVideos():userid:", userid, ", SQL:",sql );
        var _query_results = [];

        _con.query( sql )
            .then(function(rows){
                //console.log("rows:", rows);
                _query_results = rows;
                try{
                    cb(_query_results);
                }catch(e){
                    console.log("query:catch:error:",e)
                }
                return _query_results;
            }).catch(function(err){
                console.log("VideoManager.query.catch:err:", err);
            })
    }


    function getVideoStats(vid, config, cb)
    {
//              console.log("VideoManager:getVideoStats()vid:", vid );
          var SQL = "SELECT \
                       COUNT( DISTINCT userid) AS total_unique_users,  \
  	                   COUNT(*) as total_views \
  	                       FROM watch_history  \
                              WHERE  \
                                watch_history.vid = '{{vid}}' \
              ;".split('{{vid}}').join(vid)

                _con.query( SQL )
                .then( function( stats ) {
                    //console.log("Video:getVideoStats:", stats[0])
                    cb( stats[0] );
                })
    }

    function getVideoComments( userid, vid, limit, offset, config, cb )
    {
            //console.log("VideoManager:getVideoComments():userid,", userid, ", vid:", vid, ", limit:", limit, ", offset:", offset );

            userid  = userid ? trim( userid ) : null;
            offset  = offset ? trim( String(offset) ) : 0;
            limit   = limit ? trim( String(limit) ) : DEFAULT_COMMENTS_LIMIT;

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
                          ( SELECT COUNT(*) FROM comments WHERE comments.vid = '{{vid}}' ) AS total_comments , \
                          ( SELECT COUNT(*) FROM comments WHERE comments.type = 'comment' AND comments.vid = '{{vid}}' ) AS total_replies_2_video , \
                          ( SELECT COUNT(*) FROM comments WHERE comments.type = 'reply-2-comment' AND comments.vid = '{{vid}}' ) AS total_replies_2_comments , \
                          ( SELECT COUNT(*) FROM liked WHERE liked.vid = comments.vid AND liked.comment_id = comments.uid AND liked.status = 'true' ) AS total_likes , \
                          ( SELECT COUNT(*) FROM liked WHERE liked.vid = comments.vid AND liked.comment_id = comments.uid AND liked.status = 'false' ) AS total_dislikes , \
                          ( SELECT COUNT(*) FROM comments as video_comments join comments AS replies ON replies.parent_comment_id = video_comments.uid WHERE replies.parent_comment_id = comments.uid ) as total_replies , \
                          DATEDIFF(NOW(), comments.date_created) AS days_old  , \
		                      DATE_FORMAT( CURDATE( ) ,  '%Y' ) - DATE_FORMAT( comments.date_created,  '%Y' ) - ( DATE_FORMAT( CURDATE( ) ,  '00-%m-%d' ) < DATE_FORMAT( comments.date_created,  '00-%m-%d' ) ) AS years_old , \
                          PERIOD_DIFF( DATE_FORMAT( CURDATE( ) ,  '%Y%m' ) , DATE_FORMAT( comments.date_created, '%Y%m' ) ) AS months_old  \
                FROM comments \
                    JOIN users ON users.uid = comments.userid \
                        WHERE \
                           comments.vid = '{{vid}}' AND \
                           comments.type = 'comment'  \
                        ORDER BY comments.date_created DESC LIMIT {{limit}} OFFSET {{offset}}; \
            ".split("{{vid}}").join( vid )
            .split("{{limit}}").join(limit)
            .split("{{offset}}").join(offset);

          //  console.log("SQL:", SQL );

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


    function getCommentReplies( userid, comment_id, limit, offset, config, cb )
    {
          //console.log("VideoManager:getCommentReplies():userid,", userid, ", comment_id:", comment_id, ", limit:", limit, ", offset:", offset );

            userid     = userid ? trim( userid ) : null;
            comment_id = userid ? trim( comment_id ) : null;
            offset     = offset ? trim( String(offset) ) : 0;
            limit      = limit  ? trim( String(limit) ) : DEFAULT_COMMENTS_LIMIT;

            var SQL = "SELECT comments.*, \
                              videos.uid ,  \
                              videos.thumbnail_url ,  \
                              videos.title ,  \
                              comments.userid AS author_id, \
                              comments.uid AS comment_id , \
                              comments.uid AS comment_uid , \
                              users.uid as userid, \
                              users.profile_url, \
                              users.first_name, \
                              users.last_name, \
                              users.level, \
                              CONCAT( users.first_name, ' ' , users.last_name ) AS full_name , \
                              ( SELECT COUNT(*) FROM comments WHERE comments.vid = videos.uid ) AS total_comments , \
                              ( SELECT COUNT(*) FROM comments WHERE comments.type = 'comment' AND comments.vid = videos.uid ) AS total_replies_2_video , \
                              ( SELECT COUNT(*) FROM comments WHERE comments.type = 'reply-2-comment' AND comments.vid = videos.uid ) AS total_replies_2_comments , \
                              ( SELECT COUNT(*) FROM liked WHERE liked.vid = comments.vid AND liked.comment_id = comments.uid AND liked.status = 'true' ) AS total_likes , \
                              ( SELECT COUNT(*) FROM liked WHERE liked.vid = comments.vid AND liked.comment_id = comments.uid AND liked.status = 'false' ) AS total_dislikes , \
                              ( SELECT COUNT(*) FROM comments as video_comments join comments AS replies ON replies.parent_comment_id = video_comments.uid WHERE replies.parent_comment_id = comments.uid ) as total_replies , \
                              DATEDIFF(NOW(), comments.date_created) AS days_old  , \
    		                      DATE_FORMAT( CURDATE( ) ,  '%Y' ) - DATE_FORMAT( comments.date_created,  '%Y' ) - ( DATE_FORMAT( CURDATE( ) ,  '00-%m-%d' ) < DATE_FORMAT( comments.date_created,  '00-%m-%d' ) ) AS years_old , \
                              PERIOD_DIFF( DATE_FORMAT( CURDATE( ) ,  '%Y%m' ) , DATE_FORMAT( comments.date_created, '%Y%m' ) ) AS months_old  \
                    FROM comments \
                        JOIN users ON users.uid = comments.userid \
                        JOIN videos ON videos.uid = comments.vid \
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
            //console.log("VideoManager:getComment():userid,", userid, ", comment_id:", comment_id );

            userid     = userid ? trim( userid ) : null;
            comment_id = userid ? trim( comment_id ) : null;

            var SQL = "SELECT comments.*, \
                              comments.uid AS comment_id , \
                              comments.uid AS comment_uid , \
                              comments.userid AS author_id, \
                              comments.uid AS comment_uid , \
                              videos.uid AS vid , \
                              users.uid as userid, \
                              users.profile_url, \
                              users.first_name, \
                              users.last_name, \
                              users.level, \
                              CONCAT( users.first_name, ' ' , users.last_name ) AS full_name , \
                              ( SELECT COUNT(*) FROM comments WHERE comments.vid = videos.uid ) AS total_comments , \
                              ( SELECT COUNT(*) FROM comments WHERE comments.type = 'comment' AND comments.vid = videos.uid ) AS total_replies_2_video , \
                              ( SELECT COUNT(*) FROM comments WHERE comments.type = 'reply-2-comment' AND comments.vid = videos.uid ) AS total_replies_2_comments , \
                              ( SELECT COUNT(*) FROM liked WHERE liked.vid = comments.vid AND liked.comment_id = comments.uid AND liked.status = 'true' ) AS total_likes , \
                              ( SELECT COUNT(*) FROM liked WHERE liked.vid = comments.vid AND liked.comment_id = comments.uid AND liked.status = 'false' ) AS total_dislikes , \
                              ( SELECT COUNT(*) FROM comments as video_comments join comments AS replies ON replies.parent_comment_id = video_comments.uid WHERE replies.parent_comment_id = comments.uid ) as total_replies, \
                              DATEDIFF(NOW(), comments.date_created) AS days_old  , \
    		                      DATE_FORMAT( CURDATE( ) ,  '%Y' ) - DATE_FORMAT( comments.date_created,  '%Y' ) - ( DATE_FORMAT( CURDATE( ) ,  '00-%m-%d' ) < DATE_FORMAT( comments.date_created,  '00-%m-%d' ) ) AS years_old , \
                              PERIOD_DIFF( DATE_FORMAT( CURDATE( ) ,  '%Y%m' ) , DATE_FORMAT( comments.date_created, '%Y%m' ) ) AS months_old  \
                    FROM comments \
                        JOIN videos on videos.uid = comments.vid  \
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

    function getVideoLikes( userid, vid, limit, offset, config, cb )
    {
//            console.log("VideoManager:getVideoLikes():userid,", userid, ", vid:", vid, ", limit:", limit, ", offset:", offset );
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
                          ( SELECT COUNT(*) FROM liked WHERE liked.vid = '{{vid}}' AND content_type = 'video' AND liked.status = 'true') AS total_likes , \
                          ( SELECT COUNT(*) FROM liked WHERE liked.vid = '{{vid}}' AND content_type = 'video' AND liked.status = 'false' ) AS total_dislikes \
                          FROM liked \
                            JOIN users ON users.uid = liked.userid \
                              WHERE vid='{{vid}}' AND \
                                    comment_id IS NULL AND \
                                    content_type = 'video' AND \
                                    liked.status = 'true' \
                                  ORDER BY liked.date_created DESC LIMIT {{limit}} OFFSET {{offset}}; \
                ".split("{{vid}}").join(vid)
                .split("{{limit}}").join(limit)
                .split("{{offset}}").join(offset);
//                console.log(SQL)
            _con.query( SQL )
            .then(function(likes) {
//                console.log("likes:", likes)
                _.each(likes, function( like )
                {
                    like.user_liked_video = Boolean( userid == like.userid );
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

    function getVideoCommentLikes(userid, vid, comment_id, limit, offset, config, cb ){
                  //console.log("VideoManager:getVideoCommentLikes():userid,", userid, ", vid:", vid, ", comment_id:", comment_id, ", limit:", limit, ", offset:", offset );
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
                                ( SELECT COUNT(*) FROM liked WHERE liked.vid = '{{vid}}' AND liked.comment_id = '{{comment_id}}' AND liked.status = 'true') AS total_likes , \
                                ( SELECT COUNT(*) FROM liked WHERE liked.vid = '{{vid}}' AND liked.comment_id = '{{comment_id}}' AND liked.status = 'false' ) AS total_dislikes \
                                FROM liked \
                                  JOIN users ON users.uid = liked.userid \
                                    WHERE vid='{{vid}}' AND \
                                          comment_id='{{comment_id}}' AND \
                                          liked.status = 'true' \
                                        ORDER BY liked.date_created DESC LIMIT {{limit}} OFFSET {{offset}}; \
                      ".split("{{vid}}").join(vid)
                      .split("{{comment_id}}").join(comment_id)
                      .split("{{limit}}").join(limit)
                      .split("{{offset}}").join(offset);
//                      console.log(SQL)
                  _con.query( SQL )
                  .then(function(likes) {
      //                console.log("likes:", likes)
                      _.each(likes, function( like )
                      {
                          like.user_liked_video = Boolean( userid == like.userid );
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

    function getVideoCommentDislikes( userid, vid, comment_id, limit, offset, config, cb )
    {
//            console.log("VideoManager:getVideoCommentDislikes():userid,", userid, ", vid:", vid , ", comment_id:", comment_id,  ", limit:", limit, ", offset:", offset );
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
                          ( SELECT COUNT(*) FROM liked WHERE liked.vid = '{{vid}}' AND liked.comment_id = '{{comment_id}}' AND liked.status = 'true' ) AS total_likes , \
                          ( SELECT COUNT(*) FROM liked WHERE liked.vid = '{{vid}}' AND liked.comment_id = '{{comment_id}}' AND liked.status = 'false' ) AS total_dislikes \
                          FROM liked \
                            JOIN users ON users.uid = liked.userid \
                              WHERE vid='{{vid}}' AND \
                                    comment_id='{{comment_id}}' AND \
                                    liked.status = 'false' \
                                  ORDER BY liked.date_created DESC LIMIT {{limit}} OFFSET {{offset}} \
                ;".split("{{vid}}").join(vid)
                .split("{{comment_id}}").join(comment_id)
                .split("{{limit}}").join(limit)
                .split("{{offset}}").join(offset);

//                console.log(SQL)

            _con.query( SQL )
            .then(function(likes) {
                _.each(likes, function( like )
                {
                    like.user_liked_video = Boolean( userid == like.userid );

                    like.is_author        = ( like.userid == userid )? true : false ;
                    like.is_admin         = config.user.is_admin || false;
                    like.is_staff         = config.user.is_staff || false;
                    like.is_moderator     = config.user.is_moderator || false;
                    like.is_loggedin      = config.user.is_loggedin || false;
                })
                  cb( likes );
            });
    }

    function getVideoDislikes( userid, vid, limit, offset, config, cb )
    {
//            console.log("VideoManager:getVideoDislikes():userid,", userid, ", vid:", vid, ", limit:", limit, ", offset:", offset );
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
                          ( SELECT COUNT(*) FROM liked WHERE liked.vid = '{{vid}}' AND content_type = 'video' AND liked.status = 'true' ) AS total_likes , \
                          ( SELECT COUNT(*) FROM liked WHERE liked.vid = '{{vid}}' AND content_type = 'video' AND liked.status = 'false' ) AS total_dislikes \
                          FROM liked \
                            JOIN users ON users.uid = liked.userid \
                              WHERE vid='{{vid}}' AND \
                                    comment_id IS NULL AND \
                                    content_type = 'video' AND \
                                    liked.status = 'false' \
                                  ORDER BY liked.date_created DESC LIMIT {{limit}} OFFSET {{offset}}; \
                ".split("{{vid}}").join(vid)
                .split("{{limit}}").join(limit)
                .split("{{offset}}").join(offset);

                //console.log(SQL)

            _con.query( SQL )
            .then(function(likes) {
                _.each(likes, function( like )
                {
                    like.user_liked_video = Boolean( userid == like.userid );

                    like.is_author        = ( like.userid == userid )? true : false ;
                    like.is_admin         = config.user.is_admin || false;
                    like.is_staff         = config.user.is_staff || false;
                    like.is_moderator     = config.user.is_moderator || false;
                    like.is_loggedin      = config.user.is_loggedin || false;
                })
                  cb( likes );
            });
    }

    function getVideoTotalLikes( vid, cb )
    {
//            console.log("VideoManager:getVideoTotalLikes():vid:", vid );

            vid = vid ? trim( vid ) : null;

        var SQL = " SELECT COUNT(*) AS total FROM liked WHERE liked.vid = '{{vid}}' AND liked.comment_id IS NULL AND content_type = 'video'  \
                  ;".split("{{vid}}").join(vid);

            _con.query( SQL )
            .then(function($data) {
                  var total = $data[0].total || 0;
                  cb( total );
            });
    }

    function getVideoTotalDislikes( vid, cb )
    {
//            console.log("VideoManager:getVideoTotalDislikes():vid:", vid );

            vid = vid ? trim( vid ) : null;

        var SQL = " SELECT COUNT(*) AS total FROM liked WHERE liked.vid = '{{vid}}'  \
                  ;".split("{{vid}}").join(vid);
            return //NOTE: DO WORK HERE

            _con.query( SQL )
            .then(function($data) {
                  var total = $data[0].total || 0;
                  cb( total );
            });
    }

    function getVideoTotalComments( vid, cb )
    {
//            console.log("VideoManager:getVideoTotalComments():vid:", vid );
            vid = vid ? trim( vid ) : null;

        var SQL = " SELECT COUNT(*) AS total FROM comments WHERE comments.vid = '{{vid}}'  \
                  ;".split("{{vid}}").join(vid);

            _con.query( SQL )
            .then(function($data) {
                  var total = $data[0].total || 0;
                  cb( total );
            });
    }

    function add2WatchLater( userid, vid, config, cb )
    {
          //console.log("VideoManager.add2WatchLater():userid:", userid , ", vid:", vid );
            vid         = utils.addslashes( trim( vid ) );
            userid      = utils.addslashes( trim( userid ) );
//            page        = trim(config.page) || "NA";
//          date_default_timezone_set('UTC');

        var date_created = utils.DBDate();

        var uid = utils.createBase64UUID();

//            console.log( "uid:", uid , ", date_created:",date_created );
        var SQL = "INSERT INTO watch_later  \
                    ( vid, uid, userid, page, date_created )   \
                    VALUES   \
                    ( '{{vid}}', '{{uid}}', '{{userid}}', '{{page}}','{{date_created}}' )   \
            ;".split("{{userid}}").join(userid)
              .split("{{vid}}").join(vid)
              .split("{{uid}}").join(uid)
              .split("{{date_created}}").join(date_created)

            query( userid, SQL, cb );
    }

    function getUserWatchLater( userid, limit , offset, config, cb )
    {
//        console.log("VideoManager.getUserWatchLater():userid:", userid );
        userid = trim(userid);
        offset = offset ? trim( offset ) : 0;
        limit  = limit ? trim( limit ) : 20;

        var SQL = "SELECT watch_later.* , \
                          videos.* , \
                          users.uid as userid, \
                          users.profile_url, \
                          users.first_name, \
                          users.last_name, \
                          users.level, \
                          CONCAT( users.first_name, ' ' , users.last_name) AS full_name ,  \
                          ( SELECT COUNT(*) FROM followers WHERE followers.userid = users.uid ) AS total_followers ,   \
                          ( SELECT COUNT(*) FROM comments WHERE comments.vid = videos.uid ) AS total_comments, \
                          ( SELECT COUNT(*) FROM comments WHERE comments.type = 'comment' AND comments.vid = videos.uid ) AS total_replies_2_video , \
                          ( SELECT COUNT(*) FROM comments WHERE comments.type = 'reply-2-comment' AND comments.vid = videos.uid ) AS total_replies_2_comments , \
                          ( SELECT COUNT(*) FROM liked WHERE liked.vid = videos.uid AND content_type = 'video' AND liked.status = 'true' ) AS total_likes , \
                          ( SELECT COUNT(*) FROM liked WHERE liked.vid = videos.uid AND content_type = 'video' AND liked.status = 'false' ) AS total_dislikes \
                    FROM watch_later   \
                      JOIN videos ON videos.uid = watch_later.vid   \
                      JOIN users ON users.uid = videos.userid   \
                          WHERE watch_later.userid='{{userid}}'   \
                          ORDER BY watch_later.date_created DESC LIMIT {{limit}} OFFSET {{offset}}; \
            ;".split("{{userid}}").join(userid)
            .split("{{limit}}").join(limit)
            .split("{{offset}}").join(offset);

            queryVideos( userid, SQL, config, cb );
    }


    function add2SearchHistory( userid, keywords, config, cb )
    {
//          console.log("VideoManager:add2SearchHistory():userid", userid, ", keywords:", keywords )
              keywords           =  utils.addslashes( trim( keywords ) );
              userid             =  utils.addslashes( trim( userid ) );
          var platform           = 'na';
          var browser            = 'na';
          var browser_version    = 'na';

          var is_mobile = false;//__SESSION['is_mobile'];
          var is_tablet = false;//__SESSION['is_tablet'];
          var is_ios = false;//__SESSION['is_ios'];
          var is_andriod = false;//__SESSION['is_android'];
          var is_pc = false;//__SESSION['is_pc'];

          var date_created = utils.DBDate();
          //console.log("VideoManager.add2SearchHistory:data_created:",data_created)
          var uid = utils.createBase64UUID();

          var SQL = "INSERT INTO search_history   \
                      ( keywords, uid, userid, date_created, platform, browser, browser_version, is_mobile , is_tablet, is_ios , is_andriod, is_pc )   \
                      VALUES   \
                      ( '{{keywords}}', '{{uid}}', '{{userid}}', '{{date_created}}' , '{{platform}}', '{{browser}}', '{{browser_version}}', '{{is_mobile}}', '{{is_tablet}}' , '{{is_ios}}', '{{is_andriod}}', '{{is_pc}}');  \
                    ".split("{{keywords}}").join(keywords)
                     .split("{{uid}}").join(uid)
                     .split("{{userid}}").join(userid)
                     .split("{{date_created}}").join(date_created)
                     .split("{{platform}}").join(platform)
                     .split("{{browser}}").join(browser)
                     .split("{{browser_version}}").join(browser_version)
                     .split("{{is_mobile}}").join(is_mobile)
                     .split("{{is_tablet}}").join(is_tablet)
                     .split("{{is_ios}}").join(is_ios)
                     .split("{{is_andriod}}").join(is_andriod)
                     .split("{{is_pc}}").join(is_pc)

          //  console.log("VideoManager:add2SearchHistory:SQL", SQL );


            query( userid, SQL, config, cb );
    }

    function add2History( userid, vid, config, cb )
    {
//        console.log("VideoManager:add2History:userid:", userid, ", vid:", vid );

        vid             =  utils.addslashes( trim( vid ) );
        userid          =  utils.addslashes( trim( userid ) );

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

        var SQL = "INSERT INTO watch_history   \
                    ( vid, uid, userid, page, date_created, platform, browser, browser_version, is_mobile , is_tablet, is_ios , is_andriod, is_pc )   \
                    VALUES   \
                    ( '{{vid}}', '{{uid}}', '{{userid}}', '{{page}}', '{{date_created}}' , '{{platform}}', '{{browser}}', '{{browser_version}}', '{{is_mobile}}', '{{is_tablet}}' , '{{is_ios}}', '{{is_andriod}}', '{{is_pc}}');  \
                  ".split("{{vid}}").join(vid)
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

    function getUserWatchHistory( userid, limit, offset, config, cb )
    {
//          console.log("VideoManager.getUserWatchHistory():userid:", userid , ", limit:", limit, ", offset:", offset );
            userid = userid ? trim( userid ) : null;
            offset  = offset ? trim( offset ) : 0;
            limit   = limit ? trim( limit ) : 20;

            /**
             * get total views, and total uniqe_users

            SELECT COUNT( DISTINCT userid) AS uniqe_users,
            	   COUNT(*) AS total_views
            	 FROM watch_history
            		WHERE vid = 'PC0305';
            */

        var SQL = "SELECT DISTINCT watch_history.* , \
                          watch_history.userid  AS watch_history_userid, \
                          videos.*, \
                          videos.userid AS userid, \
                          users.profile_url, \
                          users.first_name, \
                          users.last_name, \
                          users.level, \
                          CONCAT( users.first_name, ' ' , users.last_name ) AS full_name , \
                          ( SELECT COUNT(*) FROM followers WHERE followers.userid = users.uid ) AS total_followers ,   \
                          ( SELECT COUNT(*) FROM comments WHERE comments.vid = videos.uid ) AS total_comments, \
                          ( SELECT COUNT(*) FROM comments WHERE comments.type = 'comment' AND comments.vid = videos.uid ) AS total_replies_2_video , \
                          ( SELECT COUNT(*) FROM comments WHERE comments.type = 'reply-2-comment' AND comments.vid = videos.uid ) AS total_replies_2_comments , \
                          ( SELECT COUNT(*) FROM liked WHERE liked.vid = videos.uid AND content_type = 'video' AND liked.status = 'true' ) AS total_likes , \
                          ( SELECT COUNT(*) FROM liked WHERE liked.vid = videos.uid AND content_type = 'video' AND liked.status = 'false' ) AS total_dislikes \
                    FROM watch_history   \
                        JOIN videos ON videos.uid = watch_history.vid   \
                            JOIN users ON users.uid = videos.userid  \
                                WHERE watch_history.userid = '{{userid}}'   \
                                    ORDER BY watch_history.date_created DESC LIMIT {{limit}} OFFSET {{offset}} \
            ;".split("{{userid}}").join(userid)
            .split("{{limit}}").join(limit)
            .split("{{offset}}").join(offset);

            //console.log("VideoManager.searchHistory():SQL:", SQL );

            queryVideos( userid, SQL, config, cb );
    }

    function getUserFavoriteVideos( userid, limit, offset, config, cb )
    {
//          console.log("VideoManager.getUserFavoriteVideos():userid:", userid , ", limit:", limit, ", offset:", offset );
            userid  = userid ? trim( userid ) : null;
            offset  = offset ? trim( offset ) : 0;
            limit   = limit ? trim( limit ) : 20;

        var SQL = "SELECT favs.*, \
                          videos.*, \
                          videos.uid as vid , \
                          users.uid AS userid, \
                          users.profile_url, \
                          users.first_name, \
                          users.last_name, \
                          users.level, \
                          CONCAT( users.first_name, ' ' , users.last_name ) AS full_name ,  \
                          ( SELECT COUNT(*) FROM followers WHERE followers.userid = users.uid ) AS total_followers ,   \
                          ( SELECT COUNT(*) FROM comments WHERE comments.vid = videos.uid ) AS total_comments, \
                          ( SELECT COUNT(*) FROM comments WHERE comments.type = 'comment' AND comments.vid = videos.uid ) AS total_replies_2_video , \
                          ( SELECT COUNT(*) FROM comments WHERE comments.type = 'reply-2-comment' AND comments.vid = videos.uid ) AS total_replies_2_comments , \
                          ( SELECT COUNT(*) FROM liked WHERE liked.vid = videos.uid AND content_type = 'video' AND liked.status = 'true' ) AS total_likes , \
                          ( SELECT COUNT(*) FROM liked WHERE liked.vid = videos.uid AND content_type = 'video' AND liked.status = 'false' ) AS total_dislikes \
                    FROM videos   \
                        JOIN users ON users.uid = videos.userid    \
                            JOIN favorits favs ON favs.vid = videos.uid    \
                                WHERE favs.userid = '{{userid}}'   \
                                    ORDER BY videos.date_created DESC LIMIT {{limit}} OFFSET {{offset}}   \
            ;".split("{{userid}}").join(userid)
            .split("{{limit}}").join(limit)
            .split("{{offset}}").join(offset);

            queryVideos( userid, SQL, config, cb );
    }


    function add2favorits( userid, vid, config, cb )
    {
//          console.log("VideoManager.add2favorits():userid:", userid , "vid:", vid , ", limit:", limit, ", offset:", offset );
            userid          = userid ? trim( userid ) : null;
            vid             = vid ? trim( vid ) : null;

        var date_created = utils.DBDate();
        var uid = utils.createBase64UUID();

        var SQL = "SELECT * FROM favorits  \
                WHERE userid = '{{userid}}' AND vid = '{{vid}}' LIMIT 1 \
                ;".split("{{userid}}").join(userid)
                  .split("{{vid}}").join(vid);

            query( userid, SQL, function(data){

                if( data.length > 0 )
                {
                    var uid = data[0].uid;
                    var count = data[0].count;

                        SQL = "UPDATE favorits SET count = count+1 WHERE uid = '{{uid}}' \
                        ;".split("{{count}}").join(count)
                        .split("{{uid}}").join(uid);
                }else{
                        SQL = "INSERT IGNORE INTO favorits  \
                            ( vid, uid, userid, date_created )  \
                            VALUES  \
                            ( '{{vid}}', '{{uid}}','{{userid}}', '{{date_created}}' )  \
                             ON DUPLICATE KEY UPDATE count = count+1 , date_created = '{{date_created}}' \
                             ;".split("{{vid}}").join(vid)
                               .split("{{uid}}").join(uid)
                               .split("{{userid}}").join(userid)
                               .split("{{date_created}}").join(date_created);
                }
                query( userid, SQL, config, cb );
            });
    }


    function videoLiked( userid, vid, liked , config, cb )
    {
//          console.log("VideoManager.videoLiked():userid:", userid , "vid:", vid , ", liked:", liked );
            userid        = userid ? trim( userid ) : null;
            vid           = vid ? trim( vid ) : null;
            liked         = liked ? trim( liked ) : null;
        var status        = Boolean(liked)? "true" : "false";

        var date_created  = utils.DBDate();
        var uid           = utils.createBase64UUID();

//        var count         = 0;
        var content_type  = "video";

        //console.log("status:", status)
        var comment_id    = null;//config.comment_id ? trim( config.comment_id ) : null;

        var SQL = "SELECT * FROM liked  \
                      WHERE userid = '{{userid}}' AND \
                            vid = '{{vid}}' AND \
                            comment_id IS NULL AND \
                            content_type = '{{content_type}}' \
                            LIMIT 1  \
                ;".split("{{userid}}").join(userid)
                  .split("{{vid}}").join(vid)
                  .split("{{content_type}}").join(content_type);


//        console.log("SQL:", SQL );
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
                                ( vid, uid, userid, date_created, status, content_type )   \
                            VALUES   \
                                ( '{{vid}}', '{{uid}}','{{userid}}', '{{date_created}}', '{{liked}}', '{{content_type}}' )   \
                            ON DUPLICATE KEY UPDATE \
                                status = '{{liked}}', \
                                date_created = '{{date_created}}' \
                             ;".split("{{vid}}").join(vid)
                               .split("{{uid}}").join(uid)
                               .split("{{userid}}").join(userid)
                               .split("{{liked}}").join(liked)
                               .split("{{content_type}}").join(content_type)
                               .split("{{date_created}}").join(date_created);
            }

            //console.log("SQL:", SQL );

            query( userid, SQL, config, function($data){
                  _notes.create_VideoLike_note( userid, vid, uid, {}, function($r){
                    cb($data)
                  })
            });


        });

    }


    function videoDisliked( userid, vid, liked , config, cb )
    {
        videoLiked( userid, vid, false , config, cb )
    }

    function videoCommentDisliked( userid, vid, comment_id, liked , config, cb )
    {
        //console.log("VideoManager.videoCommentDisliked()", "userid:", userid, ", vid:", vid, ", comment_id:", comment_id, "liked:", liked );
        videoCommentLiked( userid, vid, comment_id, false , config, cb )
    }

    function videoCommentLiked( userid, vid, comment_id, liked , config, cb )
    {
//          console.log("VideoManager.videoCommentLiked():userid:", userid , "vid:", vid , ", comment_id:", comment_id," liked:", liked );
            userid        = userid ? trim( userid ) : null;
            vid           = vid ? trim( vid ) : null;
            comment_id    = comment_id ? trim( comment_id ) : null;
            liked         = liked ? trim( liked ) : null;
        var status        = Boolean(liked)? "true" : "false";

        var date_created  = utils.DBDate();
        var uid           = utils.createBase64UUID();

//        var count         = 0;
        var content_type  = "video_comment";

        var SQL = "SELECT * FROM liked  \
                      WHERE userid = '{{userid}}' AND \
                            vid          = '{{vid}}' AND \
                            comment_id   = '{{comment_id}}' AND \
                            content_type = '{{content_type}}' \
                            LIMIT 1  \
                ;".split("{{userid}}").join(userid)
                  .split("{{vid}}").join(vid)
                  .split("{{comment_id}}").join(comment_id)
                  .split("{{content_type}}").join(content_type);


      //  console.log("SQL:", SQL );
        query( userid, SQL, config, function(data){
            if( data.length > 0 ){
                    SQL = "UPDATE liked SET \
                                      status = '{{status}}' , \
                                      content_type = '{{content_type}}' \
                              WHERE \
                                      vid        = '{{vid}}' AND \
                                      comment_id = '{{comment_id}}' \
                            ;".split("{{vid}}").join(vid)
                              .split("{{comment_id}}").join(comment_id)
                              .split("{{content_type}}").join(content_type)
                              .split("{{status}}").join(status)


            }else{
                    SQL = "INSERT IGNORE INTO liked   \
                                ( vid, uid, userid, comment_id, date_created, status, content_type )   \
                            VALUES   \
                                ( '{{vid}}', '{{uid}}','{{userid}}', '{{comment_id}}' , '{{date_created}}', '{{liked}}', '{{content_type}}' )   \
                            ON DUPLICATE KEY UPDATE \
                                status = '{{liked}}', \
                                date_created = '{{date_created}}' \
                             ;".split("{{vid}}").join(vid)
                               .split("{{uid}}").join(uid)
                               .split("{{userid}}").join(userid)
                               .split("{{comment_id}}").join(comment_id)
                               .split("{{liked}}").join(liked)
                               .split("{{content_type}}").join(content_type)
                               .split("{{date_created}}").join(date_created);
            }

//            console.log("VideoManager.videoCommentLiked():SQL:", SQL );

              query( userid, SQL, config, function($data){
                      if(liked){
                        _notes.create_VideoCommentLike_note( userid, vid, comment_id, {}, function($r){
                          cb($data)
                        })
                      }else{
                        cb($data)
                      }
              });
        });

    }




    function create( userid, file, cb )
    {
//            console.log( "VideoManager.create():userid:", userid, " ,video_src:", video_src );
            userid          = utils.addslashes( trim( userid ));

        var video_src       = file.path;
        var video_name      = file.name;
        var video_type      = file.extension;
        var filesize        = file.size;
        var file_abs        = path.join( __dirname + "/../" , file.path );
        //console.log("file_abs:", file_abs );

        var org_video_file  = file_abs ;//+ "/" + file.name;
        //console.log("org_video_file:", org_video_file );

        var date_created    = utils.DBDate();
        var last_modified   = date_created;
        var uid             = utils.createBase64UUID();

        var title           = file.name;

        var SQL = "INSERT INTO videos   \
                    ( userid, uid, org_video_file, title, video_type, filesize, date_created, last_modified )   \
                    VALUES   \
                    ( '{{userid}}', '{{uid}}','{{org_video_file}}',  '{{title}}', '{{video_type}}', '{{filesize}}' ,'{{date_created}}', '{{last_modified}}' );   \
                    ".split("{{userid}}").join(userid)
                    .split("{{uid}}").join(uid)
                    .split("{{org_video_file}}").join(org_video_file)
                    .split("{{filesize}}").join(filesize)
                    .split("{{title}}").join(title)
                    .split("{{date_created}}").join(date_created)
                    .split("{{video_type}}").join(video_type)
                    .split("{{last_modified}}").join(last_modified)


            query( userid, SQL, {}, function(data){
                cb({
                    uid : uid,
                    vid : uid,
                    userid : userid,
                    date_created : date_created,
                    last_modified : last_modified,
                    title   : title,
                    org_video_file : org_video_file,
                });
            });

    }

    function rotateVideo( userid, vid, action, cb )
    {
/*
        if( getByUID(vid) ){
            return videoQueueManager.add2queue( userid, vid, _action  );
        }
*/
    }

    function deleteVideo( userid, vid, cb )
    {
/*
        vid            =  addslashes( trim( vid ) );
        userid         =  addslashes( trim( userid ) );

        vidEOSQL            = "DELETE FROM videos WHERE uid='{ vid }'";
        vidEO_QUEUESQL  = "DELETE FROM video_queue WHERE uid='{ vid }'";


        _isRemovedfromVideoQueue = ( connect(vidEO_QUEUESQL) );
        _isRemovedfromVideos = ( connect(vidEOSQL)  );
        return( _isRemovedfromVideoQueue && _isRemovedfromVideos );
*/
    }

    function updateOrgVideoFile(userid, vid, org_video_file, config, cb )
    {
            vid                 =  utils.addslashes( trim( vid ) );
            userid              =  utils.addslashes( trim( userid ) );
            org_video_file      =  utils.addslashes( trim( org_video_file ) );
        var SQL = 'UPDATE videos SET ';
            SQL += ' org_video_file = "' + org_video_file + '" ';
            query( userid, SQL, config, function(data){
                getVideo( userid, vid, config, cb );
            });
    }

    function saveVideoMetadata( userid, vid, metadata, config, cb )
    {
//          console.log("VideoManager.saveVideoMetadata():userid:", userid, ", vid:", vid, ", metadata:", metadata);

            vid                 =  utils.addslashes( trim( vid ) );
            userid              =  utils.addslashes( trim( userid ) );
            metadata            =  metadata || [];

        var is_public           =  metadata['is_public'] ? utils.addslashes( trim( metadata['is_public'] ) ) : null;
        if( is_public ){
            is_public           =  ( is_public == 'true' )? 1 : is_public;
            is_public           =  ( is_public == 'false' )? 0 : is_public;
        }


        var title               =  metadata['title'] ? utils.addslashes( trim( metadata['title'] ) ) : null;
        var description         =  metadata['description'] ? utils.addslashes( trim( metadata['description'] ) ) : null;
        var thumbnail_url       =  metadata['thumbnail_url'] ? utils.addslashes( trim( metadata['thumbnail_url'] ) ) : null;
        var keywords            =  metadata['keywords'] ? utils.addslashes( trim( metadata['keywords'] ) ) : null;
        var catagorys           =  metadata['catagorys'] ? utils.addslashes( trim( metadata['catagorys'] ) ) : null;

        var date_created        = utils.DBDate();
        var uid                 = utils.createBase64UUID();



        if( !title && description && thumbnail_url ){
            return;
        }

        var count = 0;

        var SQL = 'UPDATE videos SET ';

            if( title ){
                SQL     += count == 0? '' : ", ";
                count   += 1;
                SQL     += ' title = "' + title + '" ';
            }
            if( description ){
                SQL     +=  count==0 ? '' : ", ";
                count   +=1;
                SQL     += ' description = "'+ description +'" ';
            }
            if( thumbnail_url ){
                SQL     +=  count==0? '' : ", ";
                count   +=1;
                SQL     += ' thumbnail_url = "' + thumbnail_url + '" ';
            }
            if( is_public  ){
                SQL     += count==0? '' : ", ";
                count   +=1;
                SQL     += ' is_public = "' + is_public + '" ';
            }
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

            if( count == 0 ){
                return;
            }

            SQL += ' WHERE uid = "' + vid + '";';

            query( userid, SQL, config, function(data){
                getVideo( userid, vid, config, cb );
            });
    }

    function updateMetadataByUID( userid, vid, title, description, thumbnail_url )
    {
//          console.log("VideoManager.updateMetadataByUID():userid:", userid, ", vid:", vid, ", title:", title, ", description:", description, ", thumbnail_url:",thumbnail_url );
/*
        if( getByUID(uid) )
        {
            return video.setMetadataByUID( uid, title, description, thumbnail_url );
        }
*/
    }

    function getUnreadCommentsCount( userid, config, cb )
    {
//          console.log("VideoManager.getUnreadCommentsCount():userid:", userid );
            userid =  utils.addslashes( trim( userid ));

        var SQL = "SELECT count(*) as unread FROM comments   \
                    JOIN users ON users.uid = comments.userid   \
                        WHERE users.uid = '{{userid}}' AND status='unread'   \
                    ;".split("{{userid}}").join(userid);

            query( userid, SQL, config, cb );
    }

    function deleteComment( userid, uid, config, cb )
    {
            //console.log("VideoManager.deleteComment():userid:", userid );
            userid  = userid ? trim( userid ) : null;
            uid     = uid ? trim( uid ) : null;

        var SQL     = "DELETE FROM comments WHERE uid='{{uid}}' OR parent_comment_id = '{{uid}}';\
                      ".split("{{uid}}").join(uid);

            query( userid, SQL, {}, function(data){

                SQL = "DELETE FROM liked WHERE comment_id='{{uid}}' ;".split("{{uid}}").join(uid);
                query( userid, SQL, config, function($results){
                    SQL = "DELETE FROM notifications WHERE comment_id='{{uid}}' ;".split("{{uid}}").join(uid);
                    query( userid, SQL, config, function($data){
                      cb();
                    })
                });
            });

            //NOTE: We should probably delete likes/disliked comments from the liked table to reduce database size.
    }

    function setCommentStatus( userid, comment_uid, status, config, cb )
    {
//          console.log("VideoManager.deleteComment():userid:", userid, ", comment_uid:", comment_uid, ", status:", status );
            userid          = userid ? trim( userid ) : null;
            comment_uid     = comment_uid ? trim( comment_uid ) : null;
            status          = status ? addslashes( trim( status ) ) : null;

        var SQL = "UPDATE comments SET status = '{{status}}'   \
                        WHERE uid = '{{comment_uid}' \
                        ;".split("{{status}}").join(status)
                          .split("{{comment_uid}}").join(comment_uid);

            query( userid, SQL, config, cb );
    }

    function getChannelVideoComments( userid, limit, offset, config, cb )
    {
//        console.log("VideoManager.getChannelVideoComments():userid:", userid, ", limit:", limit, ", offset:", offset );
        userid = trim( userid );
        offset = offset ? trim(offset) : 0;
        limit  = limit ? trim(limit ) : 20;

        var SQL = "SELECT comments.*, \
                          videos.*, \
                          comments.userid AS author_id, \
                          comments.uid AS comment_id , \
                          users.uid AS userid, \
                          users.profile_url, \
                          users.first_name, \
                          users.last_name, \
                          users.level, \
                          CONCAT(users.first_name, ' ' , users.last_name) AS full_name,  \
                          ( SELECT COUNT(*) FROM comments WHERE comments.vid = videos.uid ) AS total_comments , \
                          ( SELECT COUNT(*) FROM comments WHERE comments.type = 'comment' AND comments.vid = videos.uid ) AS total_replies_2_video , \
                          ( SELECT COUNT(*) FROM comments WHERE comments.type = 'reply-2-comment' AND comments.vid = videos.uid ) AS total_replies_2_comments , \
                          ( SELECT COUNT(*) FROM liked WHERE liked.vid = comments.vid AND liked.comment_id = comments.uid AND liked.status = 'true' ) AS total_likes , \
                          ( SELECT COUNT(*) FROM liked WHERE liked.vid = comments.vid AND liked.comment_id = comments.uid AND liked.status = 'false' ) AS total_dislikes , \
                          ( SELECT COUNT(*) FROM comments as video_comments join comments AS replies ON replies.parent_comment_id = video_comments.uid WHERE replies.parent_comment_id = comments.uid ) as total_replies , \
                          DATEDIFF(NOW(), comments.date_created) AS days_old  , \
		                      DATE_FORMAT( CURDATE( ) ,  '%Y' ) - DATE_FORMAT( comments.date_created,  '%Y' ) - ( DATE_FORMAT( CURDATE( ) ,  '00-%m-%d' ) < DATE_FORMAT( comments.date_created,  '00-%m-%d' ) ) AS years_old, \
                          PERIOD_DIFF( DATE_FORMAT( CURDATE( ) ,  '%Y%m' ) , DATE_FORMAT( comments.date_created, '%Y%m' ) ) AS months_old  \
                        FROM comments     \
                            JOIN users ON users.uid = comments.userid     \
                                JOIN  videos ON videos.uid = comments.vid     \
                                    WHERE videos.userid = '{{userid}}'  AND \
                                          comments.type = 'comment'  \
                                        ORDER BY comments.date_created    \
                                        DESC LIMIT {{limit}} OFFSET {{offset}}    \
                    ;".split("{{limit}}").join( limit )
                      .split("{{offset}}").join( offset )
                      .split("{{userid}}").join( userid )

            //console.log("SQL:", SQL);

            //query( userid, SQL, config, cb);
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

    function getUserVideoComments( userid, vid, limit, offset, config, cb )
    {
        console.log("VideoManager.getChannelVideoComments():userid:", userid, ", vid:", vid, ", limit:", limit, ", offset:", offset );
        userid = trim( userid );
        vid    = trim( vid );
        offset = offset ? trim(offset) : 0;
        limit  = limit ? trim(limit ) : 20;

        var SQL = "SELECT comments.*, \
                          videos.*, \
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
                                JOIN  videos ON videos.uid = comments.vid     \
                                    WHERE videos.userid = '{{userid}}' AND    \
                                        videos.uid = '{{vid}}'     \
                                        ORDER BY comments.date_created    \
                                        DESC LIMIT {{limit}} OFFSET {{offset}}    \
                    ;".split("{{limit}}").join( limit )
                      .split("{{vid}}").join( vid )
                      .split("{{offset}}").join( offset )
                      .split("{{userid}}").join( userid )

            //console.log("SQL:", SQL);

            query( userid, SQL, config, cb);
    }


    function createComment( $vid, $userid, $content, $metadata, $config, $cb )
    {
            console.log("VideoManager.createComment():userid:", $userid, ", vid:", $vid, ", content:", $content );
            //console.log("VideoManager::$metadata:", $metadata )
            $userid          = trim( $userid );
            $vid             = trim( $vid );
            $content         = utils.addslashes( trim( $content ) );
            type             = "comment";
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
        //console.log("$metadata:", $metadata);

        var date_created    = utils.DBDate();
        var last_modified   = date_created;
        var uid             = utils.createBase64UUID();


        var SQL = "INSERT INTO comments    \
                        ( vid,        uid,        userid,      content,      date_created,      type ,     metadata_url,     metadata_title,     metadata_description,     metadata_thumbnail_url,     metadata_video_url,       metadata_locale,       metadata_date,       metadata_site_name,       metadata_request_url )    \
                        VALUES    \
                        ( '{{vid}}', '{{uid}}', '{{userid}}', '{{content}}','{{date_created}}', 'comment', {{metadata_url}}, {{metadata_title}}, {{metadata_description}}, {{metadata_thumbnail_url}}, {{metadata_video_url}}, {{metadata_locale}}, {{metadata_date}}, {{metadata_site_name}}, {{metadata_request_url}} )     \
                        ;".split("{{vid}}").join($vid)
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
                //console.log("query:completed:comment_data:", comment_data );
                getComment( $userid, uid, $config, function($comment){
                      //console.log("NewsFeedManager.reply2Comment:getComment:data:",data[0])
                      _notes.create_VideoComment_note($userid, $vid, uid, {}, function($data){
                          $cb($comment)
                      })
                } )
                //$cb($comment_data);

            });
    }

    function updateComment( $userid, $comment_id, $content, $metadata, $config, $cb )
    {
              console.log("VideoManager.updateComment():userid:", $userid, ", comment_id:", $comment_id, ", content:", $content );

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
/*                        content = '{{content}}'  \
                        WHERE uid = '{{comment_id}}' AND  \
                              userid = '{{userid}}' \
                        ;".split("{{comment_id}}").join(comment_id)
                          .split("{{userid}}").join(userid)
                          .split("{{content}}").join(content)
*/
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
                //console.log("query:completed:comment_data:", comment_data );
                $cb($comment_data);

            });
    }



    function reply2Comment( $vid, $userid, $parent_comment_id, $content, $metadata, $config, $cb )
    {         // console.log("VideoManager.reply2Comment():vid:", $vid , ", userid:", $userid , ", parent_comment_id:" , $parent_comment_id , ", content:", $content);

                $userid              = trim( $userid );
                $vid                 = trim( $vid );
                $parent_comment_id   = trim( $parent_comment_id );
                $content             = utils.addslashes( trim( $content ) );
                type                = "reply-2-comment";

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
                            ( vid,        uid,        userid,       parent_comment_id,      content,        date_created,       type,      metadata_url,     metadata_title,     metadata_description,     metadata_thumbnail_url,     metadata_video_url,     metadata_locale,    metadata_date,      metadata_site_name,     metadata_request_url )      \
                            VALUES    \
                            ( '{{vid}}', '{{uid}}','{{userid}}', '{{parent_comment_id}}', '{{content}}', '{{date_created}}', '{{type}}', {{metadata_url}}, {{metadata_title}}, {{metadata_description}}, {{metadata_thumbnail_url}}, {{metadata_video_url}}, {{metadata_locale}}, {{metadata_date}}, {{metadata_site_name}}, {{metadata_request_url}} )     \
                            ;".split("{{vid}}").join($vid)
                              .split("{{uid}}").join(uid)
                              .split("{{userid}}").join($userid)
                              .split("{{parent_comment_id}}").join($parent_comment_id)
                              .split("{{content}}").join($content)
                              .split("{{type}}").join(type)
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

                //console.log("VideoManager.reply2Comment:SQL:", SQL );

                query( $userid, SQL, $config, function($comment_data){

                    getComment( $userid, uid, $config, function($comment){
                          //console.log("VideoManager.reply2Comment:getComment:data:",data[0])
                          _notes.create_VideoReplyComment_note($userid, $vid, uid, {}, function($data){
                              $cb($comment)
                          })
                    } )


                    //console.log("query:completed:comment_data:", comment_data );
                    //cb(comment_data);
                });
    }

/*
    function addNotification(userid, type, message, config, cb )
    {
              console.log("VideoManager.addNotification():userid:", userid, ", type:", type, ", message:", message );

              userid          = trim( userid );
              message         = utils.addslashes( trim( message ) );
              type            = trim( type );
              //config          = config;

          var date_created    = utils.DBDate();
          var last_modified   = date_created;
          var uid             = utils.createBase64UUID();

          var SQL = "INSERT INTO notifications    \
                          ( uid, userid, message, type, date_created )    \
                          VALUES    \
                          ( {{uid}}','{{userid}}', '{{message}}', '{{type}}', '{{date_created}}' )     \
                          ;".split("{{uid}}").join(uid)
                            .split("{{userid}}").join(userid)
                            .split("{{message}}").join(message)
                            .split("{{type}}").join(type)
                            .split("{{date_created}}").join(date_created)

              query( userid, SQL, config, function(data){
                  console.log("VideoManager.addNotification():query:completed:data:", data );
                  cb(data);
              });

    }
*/
/*
    function getVideoStats( userid, vid, config, cb )
    {
        var SQL = "SELECT * FROM video_summary WHERE vid = '{{vid}}  \
        ;'".split("{{vid}}").join(vid);

        query( userid, SQL, config, cb );
    }
*/
    function sanitized_filename(filename)
    {
        return filename.split(" ").join("-")
                            .split("&").join("and")
                            .split("$").join("S")
                            .split(",").join("_")
                            .split("!").join("_")
                            .split("@").join("_")
                            .split("#").join("_")
                            .split("^").join("_")
                            .split("(").join("_")
                            .split(")").join("_")
                            .split("+").join("_")
                            .split("=").join("_")
                            .split("[").join("_")
                            .split("]").join("_")
                            .split("{").join("_")
                            .split("}").join("_")
    }

    return { getVideo               : getVideo,
             getVideoAbsolute       : getVideoAbsolute,
             getVideoEmbed          : getVideoEmbed,
             getVideo2Share         : getVideo2Share,
             getVideoLikes          : getVideoLikes,
             getVideoTotalLikes     : getVideoTotalLikes,
             getVideoTotalDislikes  : getVideoTotalDislikes,

             getVideoTotalComments  : getVideoTotalComments,
             getVideoComments       : getVideoComments,
             getCommentReplies      : getCommentReplies,

             getUserVideos          : getUserVideos,
             getProfileUserVideos   : getProfileUserVideos,
             getUserFavoritVideos   : getUserFavoritVideos,

             searchTV               : searchTV,
             searchMovies           : searchMovies,
             searchAudiobooks       : searchAudiobooks,

             searchVideos           : searchVideos,
             add2SearchHistory      : add2SearchHistory,
             searchUserVideos       : searchUserVideos,
             searchMyVideos         : searchMyVideos,

             query                  : query,
             queryVideos            : queryVideos,
             queryComments          : queryComments,

             add2WatchLater         : add2WatchLater,
             getUserWatchLater      : getUserWatchLater,

             add2History            : add2History,
             getUserWatchHistory    : getUserWatchHistory,

             add2favorits           : add2favorits,
             getUserFavoriteVideos  : getUserFavoriteVideos,

             getTVShow              : getTVShow,
             getTVShows             : getTVShows,
//           getTVShowBySeason      : getTVShowBySeason,

             getMovies              : getMovies,
             getMovie               : getMovie,

             getAudiobooks          : getAudiobooks,
             getAudiobook           : getAudiobook,


             videoLiked             : videoLiked,
             videoDisliked          : videoDisliked,
             getVideoDislikes       : getVideoDislikes,

             videoCommentLiked        : videoCommentLiked,
             videoCommentDisliked     : videoCommentDisliked,
             getVideoCommentLikes     : getVideoCommentLikes,
             getVideoCommentDislikes  : getVideoCommentDislikes,

             getUnreadCommentsCount   : getUnreadCommentsCount,
             deleteComment            : deleteComment,
             setCommentStatus         : setCommentStatus,
             getChannelVideoComments  : getChannelVideoComments,
             getUserVideoComments     : getUserVideoComments,


             createComment            : createComment,
             updateComment            : updateComment,
             getComment               : getComment,
             reply2Comment            : reply2Comment,

             markCommentAsRead        : markCommentAsRead,
             markCommentAsUnread      : markCommentAsUnread,

             updateMetadataByUID      : updateMetadataByUID,
             saveVideoMetadata        : saveVideoMetadata,

             deleteVideo              : deleteVideo,
             rotateVideo              : rotateVideo,
             create                   : create,
             sanitized_filename       : sanitized_filename,
             getVideoStats            : getVideoStats,

             updateOrgVideoFile       : updateOrgVideoFile
        }

}


module.exports = new VideoManager();
