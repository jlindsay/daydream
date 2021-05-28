/**
 * author:Joshua Lindsay
 * email:j@lindsayfilm.com
 * twitter:@jlindsay
 * https://www.lindsayfilm.com
 * Software can be used for Good or Evil.
 * Some people die rich, some die poor, the result is the same.
 */


/**
 * SearchManager, searches vidoes, but can/should beable to search people, comments, statistics, ext, while VideoManager, is specfic to videos.
 */

function SearchManager()
{
    var self        = this;
    var _vm         = require("./VideoManager");
    var _um;
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

    var _comments = [];
    var _likes  = [];
    var _total_comments = 0;

    var _limit = 20;
    var _search_resutls;

    function getVideo2Share( userid, sid, config, cb )
    {
        _vm.getVideo2Share( userid, sid, config, cb );
    }

    function getVideoEmbed(vid, config, cb)
    {
        _vm.getVideo( vid, config, cb );
    }

    function getVideo( userid, vid, config, cb )
    {
        _vm.getVideo( userid, vid, config, cb );
    }

    function getNewVideos( userid, limit, offset, config, cb )
    {
        //console.log("SearchManager:getNewVideos():userid,", userid, ", limit:", limit, "offset:", offset );

        userid      = userid ? trim( userid ) : null;
        offset      = offset ? trim( offset ) : 0;
        limit       = limit ? trim( limit ) : 20;
        //is_loggedin = config.is_loggedin || false;

        var SQL = "SELECT videos.* , \
                          videos.uid AS vid , \
                          users.uid AS userid, \
                          users.profile_url, \
                          users.first_name, \
                          users.last_name, \
                          users.level, \
                          CONCAT( users.first_name, ' ' , users.last_name ) AS full_name, \
                          ( SELECT COUNT(*) FROM followers WHERE followers.userid = users.uid ) AS total_followers ,   \
                          ( SELECT COUNT(*) FROM comments WHERE comments.vid = videos.uid ) AS total_comments, \
                          ( SELECT COUNT(*) FROM comments WHERE comments.type = 'comment' AND comments.vid = videos.uid ) AS total_replies_2_video , \
                          ( SELECT COUNT(*) FROM comments WHERE comments.type = 'reply-2-comment' AND comments.vid = videos.uid ) AS total_replies_2_comments , \
                          ( SELECT COUNT(*) FROM liked WHERE liked.vid = videos.uid AND content_type = 'video' AND liked.status = 'true'  ) AS total_likes, \
                          ( SELECT COUNT(*) FROM liked WHERE liked.vid = videos.uid AND content_type = 'video' AND liked.status = 'false' ) AS total_dislikes \
                    FROM videos \
                        JOIN users ON users.uid = videos.userid \
                            WHERE videos.is_public = 1 OR videos.userid = '{{userid}}' \
                            ORDER BY videos.date_created DESC LIMIT {{limit}} OFFSET {{offset}} ; \
                            \
            ".split("{{userid}}").join( userid )
            .split("{{limit}}").join(limit)
            .split("{{offset}}").join(offset);

            //console.log("SearchManager:getNewVideos(): ",SQL)

            _vm.queryVideos( userid, SQL, config, cb );
    }



    function getRelatedAudiobooks( userid, vid, limit, offset, config, cb )
    {
        console.log("SearchManager:getRelatedAudiobooks():userid,", userid, ", limit:", limit, "offset:", offset );

        userid  = userid ? trim(userid) : null;
    //        catagory = catagory? trim(catagory) : null;
        offset  = offset ? trim( offset ) : 0;
        limit   = limit ? trim( limit ) : 20;

        var SQL = "SELECT videos.*, \
                          videos.uid AS vid,   \
                          ( SELECT COUNT(*) FROM comments WHERE comments.vid = videos.uid ) AS total_comments, \
                          ( SELECT COUNT(*) FROM comments WHERE comments.type = 'comment' AND comments.vid = videos.uid ) AS total_replies_2_video , \
                          ( SELECT COUNT(*) FROM comments WHERE comments.type = 'reply-2-comment' AND comments.vid = videos.uid ) AS total_replies_2_comments , \
                          ( SELECT COUNT(*) FROM liked WHERE liked.vid = videos.uid AND content_type = 'video' AND liked.status = 'true' ) AS total_likes , \
                          ( SELECT COUNT(*) FROM liked WHERE liked.vid = videos.uid AND content_type = 'video' AND liked.status = 'false' ) AS total_dislikes \
                    FROM videos   \
                        WHERE videos.uid = '{{vid}}'  \
            ".split("{{vid}}").join(vid);

            //.split("{{userid}}").join(userid)
             //this query is not returning related videos
             console.log("debug:SearchManager.Audiobooks:SQL:", SQL)

            _con.query( SQL )
            .then(function(rows){
                var video = rows[0];
                if( !video ){
                  cb([{ status:'no-videos-found', message:'user does not have permission to view this video.', vid:null, userid:userid }])
                  return;
                }

                video.title = video.title || "";
                video.description = video.description || "";
                video.keywords = video.keywords || "";
                video.catagorys = video.catagorys || "";

                var keywords = "";
                    keywords += " " + video.title;
                    keywords += " " + video.description;
                    keywords += " " + video.keywords;
                    keywords += " " + video.catagorys;

                    //console.log("debug:SearchManager.getRelatedAudiobooks:keywords:", keywords );
                    //console.log("debug:SearchManager.getRelatedAudiobooks:userid:", userid )

                    //_con("")
                    return { video: video, keywords: keywords, catagorys: video.catagorys };

            }).then(function( video_data ){
                //console.log("debug: keywords:", video_data.keywords, ", catagory:" , video_data.catagorys )
                //switch
                if( video_data.keywords){
                  //config.catagorys = video_data.catagorys ?  | null;
                  //console.log("debug:SearchManager.Audiobooks:if:keywords: ", video_data.keywords, ", catagorys:", video_data.catagorys, ", limit:limit", limit, ", offset:", offset, ", userid:", userid )
    //                  searchVideos( userid, video_data.keywords, video_data.catagorys, limit, offset, config, cb );
                  searchAudiobooks( userid, video_data.keywords, limit, offset, config, cb );
                }

            })
    }

    function getRelatedMyVideos( userid, vid, limit, offset, config, cb )
    {
//        console.log("SearchManager:getRelatedMyVideos():userid,", userid, ", limit:", limit, "offset:", offset );

        userid  = userid ? trim(userid) : null;
    //        catagory = catagory? trim(catagory) : null;
        offset  = offset ? trim( offset ) : 0;
        limit   = limit ? trim( limit ) : 20;
        //console.log("SearchManager:getRelatedMyVideos:userid:", userid);

        var SQL = "SELECT videos.*, \
                          videos.uid AS vid,   \
                          CONCAT( users.first_name, ' ' , users.last_name ) AS full_name ,  \
                          ( SELECT COUNT(*) FROM followers WHERE followers.userid = users.uid ) AS total_followers ,   \
                          ( SELECT COUNT(*) FROM comments WHERE comments.vid = videos.uid ) AS total_comments, \
                          ( SELECT COUNT(*) FROM comments WHERE comments.type = 'comment' AND comments.vid = videos.uid ) AS total_replies_2_video , \
                          ( SELECT COUNT(*) FROM comments WHERE comments.type = 'reply-2-comment' AND comments.vid = videos.uid ) AS total_replies_2_comments , \
                          ( SELECT COUNT(*) FROM liked WHERE liked.vid = videos.uid AND content_type = 'video' AND liked.status = 'true' ) AS total_likes , \
                          ( SELECT COUNT(*) FROM liked WHERE liked.vid = videos.uid AND content_type = 'video' AND liked.status = 'false' ) AS total_dislikes \
                    FROM videos   \
                        JOIN users ON users.uid = videos.userid    \
                            WHERE videos.uid = '{{vid}}' AND userid='{{userid}}' \
            ".split("{{vid}}").join(vid)
             .split("{{userid}}").join(userid)

//          console.log("SQL:", SQL)

            _con.query( SQL )
            .then(function(rows){
                var video = rows[0];
                if( !video ){
                  cb([{ status:'no-videos-found', message:'user does not have permission to view this video.', vid:null, userid:userid }])
                  return;
                }

                video.title = video.title || "";
                video.description = video.description || "";
                video.keywords = video.keywords || "";
                video.catagorys = video.catagorys || "";

                var keywords = "";
                    keywords += " " + video.title;
                    keywords += " " + video.description;
                    keywords += " " + video.keywords;
                    keywords += " " + video.catagorys;

                    //console.log("debug:SearchManager.searchMyVideos:keywords:", keywords );
                    //console.log("debug:SearchManager.getRelatedVideos:userid:", userid )

                    //_con("")
                    return { video: video, keywords: video.keywords, catagorys: video.catagorys };

            }).then(function( video_data ){
                //console.log("debug: keywords:", video_data.keywords, ", catagory:" , video_data.catagorys )
                //switch
                //console.log("video_data:",video_data)
                try{


                  if( video_data.keywords ){
                    //config.catagorys = video_data.catagorys ?  | null;
                    //console.log("debug:SearchManager.getRelatedMyVideos:if:keywords: ", video_data.keywords, ", catagorys:", video_data.catagorys, ", limit:limit", limit, ", offset:", offset, ", userid:", userid )
      //                  searchVideos( userid, video_data.keywords, video_data.catagorys, limit, offset, config, cb );
                    searchMyVideos( userid, video_data.keywords, limit, offset, config, cb );
                  }
                }catch(e){
                  //keywords not defined.
                }

            })
    }

    function getRelatedTV( userid, vid, limit, offset, config, cb )
    {
        console.log("SearchManager:getRelatedTV():userid,", userid, ", limit:", limit, "offset:", offset );

        userid  = userid ? trim(userid) : null;
//        catagory = catagory? trim(catagory) : null;
        offset  = offset ? trim( offset ) : 0;
        limit   = limit ? trim( limit ) : 20;

        var SQL = "SELECT videos.*, \
                          videos.uid AS vid,   \
                          CONCAT( users.first_name, ' ' , users.last_name ) AS full_name ,  \
                          ( SELECT COUNT(*) FROM followers WHERE followers.userid = users.uid ) AS total_followers ,   \
                          ( SELECT COUNT(*) FROM comments WHERE comments.vid = videos.uid ) AS total_comments, \
                          ( SELECT COUNT(*) FROM comments WHERE comments.type = 'comment' AND comments.vid = videos.uid ) AS total_replies_2_video , \
                          ( SELECT COUNT(*) FROM comments WHERE comments.type = 'reply-2-comment' AND comments.vid = videos.uid ) AS total_replies_2_comments , \
                          ( SELECT COUNT(*) FROM liked WHERE liked.vid = videos.uid AND content_type = 'video' AND liked.status = 'true' ) AS total_likes , \
                          ( SELECT COUNT(*) FROM liked WHERE liked.vid = videos.uid AND content_type = 'video' AND liked.status = 'false' ) AS total_dislikes \
                    FROM videos   \
                          JOIN users ON users.uid = videos.userid    \
                              WHERE videos.uid = '{{vid}}'  \
            ".split("{{vid}}").join(vid);

            //.split("{{userid}}").join(userid)
             //this query is not returning related videos
             console.log("debug:SearchManager.getRelatedTV:SQL:", SQL)

            _con.query( SQL )
            .then(function(rows){
                var video = rows[0];
                if( !video ){
                  cb([{ status:'no-videos-found', message:'user does not have permission to view this video.', vid:null, userid:userid }])
                  return;
                }

                video.title = video.title || "";
                video.description = video.description || "";
                video.keywords = video.keywords || "";
                video.catagorys = video.catagorys || "";

                var keywords = "";
                    keywords += " " + video.title;
                    keywords += " " + video.description;
                    keywords += " " + video.keywords;
                    keywords += " " + video.catagorys;

                    //console.log("debug:SearchManager.getRelatedTV:keywords:", keywords );
                    //console.log("debug:SearchManager.getRelatedTV:userid:", userid )

                    //_con("")
                    return { video: video, keywords: keywords, catagorys: video.catagorys };

            }).then(function( video_data ){
                //console.log("debug: keywords:", video_data.keywords, ", catagory:" , video_data.catagorys )
                //switch
                if( video_data.keywords){
                  //config.catagorys = video_data.catagorys ?  | null;
                  //console.log("debug:SearchManager.getRelatedTV:if:keywords: ", video_data.keywords, ", catagorys:", video_data.catagorys, ", limit:limit", limit, ", offset:", offset, ", userid:", userid )
//                  searchVideos( userid, video_data.keywords, video_data.catagorys, limit, offset, config, cb );
                  searchTV( userid, video_data.keywords, limit, offset, config, cb );
                }

            })
    }


    function getRelatedMovies( userid, vid, limit, offset, config, cb )
    {
        console.log("SearchManager:getRelatedMovies():userid,", userid, ", limit:", limit, "offset:", offset );

        userid  = userid ? trim(userid) : null;
//        catagory = catagory? trim(catagory) : null;
        offset  = offset ? trim( offset ) : 0;
        limit   = limit ? trim( limit ) : 20;

        var SQL = "SELECT videos.*, \
                          videos.uid AS vid,\
                            CONCAT( users.first_name, ' ' , users.last_name ) AS full_name ,  \
                          ( SELECT COUNT(*) FROM followers WHERE followers.userid = users.uid ) AS total_followers ,   \
                          ( SELECT COUNT(*) FROM comments WHERE comments.vid = videos.uid ) AS total_comments, \
                          ( SELECT COUNT(*) FROM comments WHERE comments.type = 'comment' AND comments.vid = videos.uid ) AS total_replies_2_video , \
                          ( SELECT COUNT(*) FROM comments WHERE comments.type = 'reply-2-comment' AND comments.vid = videos.uid ) AS total_replies_2_comments , \
                          ( SELECT COUNT(*) FROM liked WHERE liked.vid = videos.uid AND content_type = 'video' AND liked.status = 'true')  AS total_likes , \
                          ( SELECT COUNT(*) FROM liked WHERE liked.vid = videos.uid AND content_type = 'video' AND liked.status = 'false') AS total_dislikes \
                    FROM videos   \
                        JOIN users ON users.uid = videos.userid    \
                            WHERE videos.uid = '{{vid}}'  \
            ;".split("{{vid}}").join(vid);

            //.split("{{userid}}").join(userid)
             //this query is not returning related videos
             //console.log("debug:SearchManager.getRelatedMovies:SQL:", SQL)

            _con.query( SQL )
            .then(function(rows){
                var video = rows[0];
                if( !video ){
                  cb([{ status:'no-videos-found', message:'user does not have permission to view this video.', vid:null, userid:userid }])
                  return;
                }

                video.title = video.title || "";
                video.description = video.description || "";
                video.keywords = video.keywords || "";
                video.catagorys = video.catagorys || "";

                var keywords = "";
                    keywords += " " + video.title;
                    keywords += " " + video.description;
                    keywords += " " + video.keywords;
                    keywords += " " + video.catagorys;

                    //console.log("debug:SearchManager.getRelatedMovies:keywords:", keywords );
                    //console.log("debug:SearchManager.getRelatedMovies:userid:", userid )

                    //_con("")
                    return { video: video, keywords: keywords, catagorys: video.catagorys };

            }).then(function( video_data ){
                //console.log("debug: keywords:", video_data.keywords, ", catagory:" , video_data.catagorys )
                //switch
                if( video_data.keywords){
                  //config.catagorys = video_data.catagorys ?  | null;
                  //console.log("debug:SearchManager.getRelatedMovies:if:keywords: ", video_data.keywords, ", catagorys:", video_data.catagorys, ", limit:limit", limit, ", offset:", offset, ", userid:", userid )
//                  searchVideos( userid, video_data.keywords, video_data.catagorys, limit, offset, config, cb );
                  searchMovies( userid, video_data.keywords, limit, offset, config, cb );
                }

            })
    }


    function getRelatedVideos( userid, vid, limit, offset, config, cb )
    {
        console.log("SearchManager:getRelatedVideos():userid,", userid, ", limit:", limit, "offset:", offset );

        userid  = userid ? trim(userid) : null;
//        catagory = catagory? trim(catagory) : null;
        offset  = offset ? trim( offset ) : 0;
        limit   = limit ? trim( limit ) : 20;

        var SQL = "SELECT videos.*, \
                          videos.uid AS vid, \
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
                          ( SELECT COUNT(*) FROM liked WHERE liked.vid = videos.uid AND content_type = 'video' AND liked.status = 'true') AS total_likes , \
                          ( SELECT COUNT(*) FROM liked WHERE liked.vid = videos.uid AND content_type = 'video' AND liked.status = 'false') AS total_dislikes \
                    FROM videos   \
                        JOIN users ON users.uid = videos.userid    \
                            WHERE videos.uid='{{vid}}'  \
            ".split("{{vid}}").join(vid);
//            console.log("SQL:", SQL)
            //.split("{{userid}}").join(userid)
             //this query is not returning related videos
//             console.log("debug:SearchManager.getRelatedVideos:SQL:", SQL)

            _con.query( SQL )
            .then(function(rows){
                var video = rows[0];
                if( !video ){
                  cb([{ status:'no-videos-found', message:'user does not have permission to view this video.', vid:null, userid:userid }])
                  return;
                }

                video.title = video.title || "";
                video.description = video.description || "";
                video.keywords = video.keywords || "";
                video.catagorys = video.catagorys || "";

                var keywords = "";
                    keywords += " " + video.title;//if we are going to description for searches we need to santize the words
                    //keywords += " " + video.description; //if we are going to description for searches we need to santize the words
                    keywords += " " + video.keywords;
                    keywords += " " + video.catagorys;

                    //console.log("debug:SearchManager.getRelatedVideos:keywords:", keywords );
                    //console.log("debug:SearchManager.getRelatedVideos:userid:", userid )

                    //_con("")
                    return { video: video, keywords: keywords, catagorys: video.catagorys };

            }).then(function( video_data ){
                //console.log("debug: keywords:", video_data.keywords, ", catagory:" , video_data.catagorys )
                //switch
                if( video_data.keywords){
                  //config.catagorys = video_data.catagorys ?  | null;
                //  console.log("debug:SearchManager.getRelatedVideos:if:keywords: ", video_data.keywords, ", catagorys:", video_data.catagorys, ", limit:limit", limit, ", offset:", offset, ", userid:", userid )
//                  searchVideos( userid, video_data.keywords, video_data.catagorys, limit, offset, config, cb );
                  searchVideos( userid, video_data.keywords, limit, offset, config, cb );
                }

            })
    }

    function getVideosAboutPerson( userid, profile_id, limit, offset, config, cb )
    {
        console.log("SearchManager:getVideosAboutPerson():userid,", userid, ", profile_id:", profile_id, ", limit:", limit, "offset:", offset );

            userid  = userid ? trim(userid) : null;
            profile_id  = profile_id ? trim(profile_id) : null;
            offset  = offset ? trim( offset ) : 0;
            limit   = limit ? trim( limit ) : 20;

        var SQL = "SELECT video_2_people.*, \
                          people.*, \
                          videos.*, \
                          videos.uid AS vid, \
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
                          ( SELECT COUNT(*) FROM liked WHERE liked.vid = videos.uid AND content_type = 'video' AND liked.status = 'true') AS total_likes , \
                          ( SELECT COUNT(*) FROM liked WHERE liked.vid = videos.uid AND content_type = 'video' AND liked.status = 'false') AS total_dislikes \
                    FROM video_2_people   \
                        JOIN people ON people.uid = video_2_people.pid   \
                        JOIN videos ON video_2_people.vid = videos.uid   \
                        JOIN users ON users.uid = videos.userid         \
                                WHERE video_2_people.pid = '{{profile_id}}'  \
                                      ORDER BY video_2_people.date_created DESC LIMIT {{limit}} OFFSET {{offset}} \
            ;".split("{{userid}}").join(userid)
            .split("{{offset}}").join(offset)
            .split("{{limit}}").join(limit)
            .split("{{profile_id}}").join(profile_id);

//            console.log("SQL:", SQL );
            queryPeople( userid, SQL, config, cb );
    }


    function getPersonByID( userid, profile_id, config, cb )
    {
        console.log("SearchManager:getPersonByID():userid,", userid, ", profile_id:", profile_id );
        userid  = userid ? trim(userid) : null;
        profile_id  = profile_id ? trim(profile_id) : null;

        var SQL = "SELECT people.*, \
                          CONCAT(people.first_name, ' ', \
                          people.last_name ) AS full_name  \
                    FROM people  \
                        WHERE people.uid = '{{profile_id}}' \
            ;".split("{{userid}}").join(userid)
            .split("{{profile_id}}").join(profile_id);

//            console.log("SQL:", SQL );
            queryPeople( userid, SQL, config, cb );
    }

    function getUserNewsFeed( userid, limit, offset, config, cb )
    {
        console.log("SearchManager:getUserNewsFeed():userid,", userid, ", limit:", limit, "offset:", offset );
            userid  = userid ? trim( userid ) : null;
            offset  = offset ? trim( offset ) : 0;
            limit   = limit ? trim( limit ) : 20;
            //is_loggedin = config.is_loggedin || false;

        var SQL = "SELECT videos.*, \
                          videos.uid AS vid, \
                          users.uid AS userid, \
                          users.profile_url, \
                          users.first_name, \
                          users.last_name, \
                          users.level, \
                          CONCAT( users.first_name, ' ' , users.last_name ) AS full_name,   \
                          ( SELECT COUNT(*) FROM followers WHERE followers.userid = users.uid ) AS total_followers ,   \
                          ( SELECT COUNT(*) FROM comments WHERE comments.vid = videos.uid ) AS total_comments, \
                          ( SELECT COUNT(*) FROM comments WHERE comments.type = 'comment' AND comments.vid = videos.uid ) AS total_replies_2_video , \
                          ( SELECT COUNT(*) FROM comments WHERE comments.type = 'reply-2-comment' AND comments.vid = videos.uid ) AS total_replies_2_comments , \
                          ( SELECT COUNT(*) FROM liked WHERE liked.vid = videos.uid AND content_type = 'video' AND liked.status = 'true') AS total_likes , \
                          ( SELECT COUNT(*) FROM liked WHERE liked.vid = videos.uid AND content_type = 'video' AND liked.status = 'false') AS total_dislikes \
                    FROM videos    \
                        JOIN users ON users.uid = videos.userid     \
                                WHERE videos.is_public = 1 OR videos.userid = '{{userid}}'   \
                                ORDER BY videos.date_created DESC LIMIT {{limit}} OFFSET {{offset}}    \
                    ;".split("{{userid}}").join(limit)
                      .split("{{limit}}").join(limit)
                      .split("{{offset}}").join(offset)
                      .split("{{limit}}").join(limit);

                    _vm.queryVideos( userid, SQL, config, cb );
    }

    function getStaffPicks( userid, limit, offset, config, cb )
    {
        console.log("SearchManager:getStaffPicks():userid,", userid, ", limit:", limit, "offset:", offset );
            userid  = userid ? trim(userid) : null;
            offset  = offset ? trim( offset ) : 0;
            limit   = limit ? trim( limit ) : 20;

        var SQL = "SELECT staff_picks.*, \
                          videos.*, \
                          videos.uid as vid , \
                          users.uid AS userid, \
                          users.profile_url, \
                          users.first_name, \
                          users.last_name, \
                          users.level, \
                          CONCAT( users.first_name, ' ' , users.last_name ) AS full_name,   \
                          ( SELECT COUNT(*) FROM followers WHERE followers.userid = users.uid ) AS total_followers ,   \
                          ( SELECT COUNT(*) FROM comments WHERE comments.vid = videos.uid ) AS total_comments, \
                          ( SELECT COUNT(*) FROM comments WHERE comments.type = 'comment' AND comments.vid = videos.uid ) AS total_replies_2_video , \
                          ( SELECT COUNT(*) FROM comments WHERE comments.type = 'reply-2-comment' AND comments.vid = videos.uid ) AS total_replies_2_comments , \
                          ( SELECT COUNT(*) FROM liked WHERE liked.vid = videos.uid AND content_type = 'video' AND liked.status = 'true') AS total_likes , \
                          ( SELECT COUNT(*) FROM liked WHERE liked.vid = videos.uid AND content_type = 'video' AND liked.status = 'false') AS total_dislikes \
                    FROM staff_picks   \
                        JOIN videos ON staff_picks.vid = videos.uid    \
                        JOIN users ON users.uid = videos.userid     \
                                WHERE users.uid = '{{userid}}'   \
                                ORDER BY videos.date_created DESC LIMIT {{limit}} OFFSET {{offset}};   \
                    ".split("{{userid}}").join(userid)
                     .split("{{limit}}").join(limit)
                     .split("{{offset}}").join(offset)

            _vm.queryVideos( userid, SQL, config, cb );

    }

    function searchPeople( userid, keywords, limit, offset, config, cb)
    {
        console.log("SearchManager:searchPeople():userid,", userid, ", keywords:", keywords, ", limit:", limit, ", offset:" , offset );

        userid  = userid ? trim(userid) : null;
        offset  = offset ? trim( offset ) : 0;
        limit   = limit ? trim( limit ) : 20;

        if( keywords == "" || !keywords ){
            return _search_resutls;
        }

        var keys = keywords.split(" ");
        var count=0;

        var SQL = "SELECT  \
                        users.uid as userid, \
                        users.profile_url, \
                        users.about_me, \
                        users.first_name, \
                        users.last_name, \
                        users.level, \
                        CONCAT(users.first_name, ' ' , users.last_name) AS full_name , \
                        users.date_joined ,  \
                        ( SELECT COUNT(*) FROM followers WHERE followers.userid = users.uid ) AS total_followers ,   \
                        ( SELECT IF(COUNT(*) > 0, 'true', 'false') FROM followers as im_following WHERE im_following.userid = '{{userid}}' AND im_following.follower_userid = users.uid  ) AS is_following_you ,  \
                        ( SELECT IF(COUNT(*) > 0, 'true', 'false') FROM followers as im_following WHERE im_following.follower_userid =  '{{userid}}' AND im_following.userid = users.uid  ) AS i_am_following ,   \
                        ( SELECT COUNT(*) FROM videos WHERE videos.userid = users.uid ) AS total_videos   \
                    FROM users  \
                        WHERE ";

        _.each( keys, function(key)
        {
            key  = trim( key );
            key = _.singularize(key);
            SQL += ( count > 0 )? " || " : "";
            count++;
            SQL += " users.first_name  LIKE '%"+key+"%' || users.last_name  LIKE '%"+key+"%'  ";
        });


        SQL += "  ORDER BY users.last_name DESC LIMIT {{limit}} OFFSET {{offset}}; "
        SQL =   SQL.split("{{userid}}").join(userid)
                .split("{{limit}}").join(limit)
                .split("{{offset}}").join(offset);

        queryPeople( userid, SQL, config, cb )
    }

    function searchUserVideos( userid, keywords, limit, offset, config, cb )
    {
        _vm.searchUserVideos( userid, keywords, limit, offset, config, cb );
    }

    function searchTV( userid, keywords, limit, offset, config, cb )
    {
        console.log("debug:SearchManager:searchTV:keywords:", keywords)
        _vm.searchTV( userid, keywords, limit, offset, config, cb );
    }

    function searchMovies( userid, keywords, limit, offset, config, cb )
    {
        console.log("debug:SearchManager:searchMovies:keywords:", keywords)
        _vm.searchMovies( userid, keywords, limit, offset, config, cb );
    }

    function searchAudiobooks( userid, keywords, limit, offset, config, cb )
    {
        console.log("debug:SearchManager:searchAudiobooks:keywords:", keywords)
        _vm.searchAudiobooks( userid, keywords, limit, offset, config, cb );
    }

    function searchMyVideos( userid, keywords, limit, offset, config, cb )
    {
        console.log("debug:SearchManager:searchMyVideos:keywords:", keywords, ", userid:", userid)
        _vm.searchMyVideos( userid, keywords, limit, offset, config, cb );
    }

    function searchVideos( userid, keywords, limit, offset, config, cb )
    {
        console.log("debug:SearchManager:searchVideos:keywords:", keywords, ", userid:", userid)
        _vm.searchVideos( userid, keywords, limit, offset, config, cb );
    }

    function getUserPublicVideos( userid, limit, offset, config, cb )
    {
        console.log("SearchManager:getUserPublicVideos():userid,", userid, ", limit:", limit, "offset:", offset );

        userid  = userid? trim(userid) : null;
        offset  = offset ? trim( offset ) : 0;
        limit   = limit ? trim( limit ) : 20;

        var SQL = "SELECT videos.*, \
                          videos.uid as vid, \
                          users.uid AS userid, \
                          users.profile_url, \
                          users.first_name, \
                          users.last_name, \
                          users.level, \
                          CONCAT( users.first_name, ' ' , users.last_name ) AS full_name, \
                          ( SELECT COUNT(*) FROM followers WHERE followers.userid = users.uid ) AS total_followers ,   \
                          ( SELECT COUNT(*) FROM comments WHERE comments.vid = videos.uid ) AS total_comments, \
                          ( SELECT COUNT(*) FROM comments WHERE comments.type = 'comment' AND comments.vid = videos.uid ) AS total_replies_2_video , \
                          ( SELECT COUNT(*) FROM comments WHERE comments.type = 'reply-2-comment' AND comments.vid = videos.uid ) AS total_replies_2_comments , \
                          ( SELECT COUNT(*) FROM liked WHERE liked.vid = videos.uid AND content_type = 'video' AND liked.status = 'true') AS total_likes , \
                          ( SELECT COUNT(*) FROM liked WHERE liked.vid = videos.uid AND content_type = 'video' AND liked.status = 'false') AS total_dislikes \
                    FROM videos \
                        JOIN users ON users.uid = videos.userid  \
                                WHERE users.uid = '{{userid}}' AND \
                                      videos.is_public > 0  \
                                      ORDER BY videos.date_created DESC LIMIT {{limit}} OFFSET {{offset}}; \
            ".split("{{limit}}").join(limit)
            .split("{{offset}}").join(offset)
            .split("{{userid}}").join(userid);

            //console.log("SQL:", SQL );

            _vm.queryVideos( userid, SQL, config, cb );

    }

    function queryPeople( userid, sql, config, cb )
    {
        console.log("queryPeople():userid:", userid, ", sql:",sql );//, "cb:",cb );

        _search_resutls = [];

        _con.query( sql )
            .then(function(rows){
                _.each(rows, function(row){
                    var person = row;
                        person.is_author     = ( person.userid == userid )? true : false;
                        person.is_admin      = _is_admin;//(false)? true : false ;
                        person.is_staff      = _is_staff;//(false)? true : false ;
                        person.moderator     = _is_moderator;//(false)? true : false ;
                        person.is_loggedin   = _is_loggedin;//( _SESSION['is_loggedin'] == "1" )? true : false;
                        //hard-coded not sure where to put this
                        person.useRTMP = true;
                        _search_resutls.push( person );
                })

                return _search_resutls;

            }).then(function(data){
                try{
                    cb( data );
                }catch(e){}

            })
    }


    function queryVideos( userid, sql, config, cb )
    {
        _vm.queryVideos( userid, sql, config, cb );
    }

    function getVideoComments( userid, vid, limit, offset, config, cb )
    {
        _vm.getVideoComments( userid, vid, limit, offset, config, cb )
    }

    function getVideoLikes( userid, vid, limit, offset, config, cb )
    {
        _vm.getVideoLikes( userid, vid, limit, offset, config, cb );
    }

    return{ getVideo                : getVideo,
            getVideoEmbed           : getVideoEmbed,
            getVideo2Share          : getVideo2Share,
            getNewVideos            : getNewVideos,
            getUserPublicVideos     : getUserPublicVideos,
            getVideoComments        : getVideoComments,
            getVideoLikes           : getVideoLikes,

            getRelatedAudiobooks    : getRelatedAudiobooks,
            getRelatedTV            : getRelatedTV,
            getRelatedMovies        : getRelatedMovies,
            getRelatedMyVideos      : getRelatedMyVideos,
            getRelatedVideos        : getRelatedVideos,

            searchTV                : searchTV,
            searchMovies            : searchMovies,
            searchAudiobooks        : searchAudiobooks,
            searchMyVideos          : searchMyVideos,

            searchVideos            : searchVideos,
            searchUserVideos        : searchUserVideos,

            searchPeople            : searchPeople,
            getPersonByID           : getPersonByID,
            getVideosAboutPerson    : getVideosAboutPerson,
            getUserNewsFeed         : getUserNewsFeed,
        }
}

module.exports = new SearchManager();
