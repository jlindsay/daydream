

function AnalyticsManager()
{
  var self        = this;
  var trim        = require('trim');
  var utils       = require('./Utils');
  var async       = require('async');

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

  var _query_results  = [];

  function getVideoStats(vid, date, config, cb)
  {
            console.log("getVideoViewsByDate()vid:", vid, ", date:", date , ", config:", config );

        var SQL = "SELECT \
                     COUNT( DISTINCT userid) AS uniqe_users  \
	                   COUNT(*) as total_views \
	                       FROM watch_history  \
                            WHERE  \
                              watch_history.vid = '{{vid}}' \
                                AND  \
                                    CAST(watch_history.date_created AS DATE) = '{{date}}' \
            ;".split('{{vid}}').join(vid)
              .split('{{date}}').join(date)

                query( vid, SQL, config, cb );
  }
/*
  function getVideoUniqueUsersByDate(vid, config)
  {
          console.log("getVideoUniqueUsersByDate()vid:", vid, ", config:", config );

          var SQL = "SELECT \
                       COUNT( DISTINCT userid) AS uniqe_users, \
                       COUNT(*) AS total_views \
                           FROM watch_history  \
                              WHERE  \
                                watch_history.vid = '{{vid}}' \
                          ;".split("{{vid}}");

          query( vid, SQL, config, cb );
  }
*/
/*
  function getUserVideos( userid, limit, offset, config, cb )
  {
//        console.log("VideoManager:getVideos():userid,", userid, ", vid:", vid, "limit:", limit, "offset:", offset );
          userid  = userid? trim(userid) : null;
          offset  = offset ? trim( offset ) : 0;
          limit   = limit ? trim( limit ) : 20;

      var SQL = "SELECT videos.* , \
                        videos.uid AS vid , \
                        videos.uid, \
                        users.uid AS userid, \
                        users.profile_url, \
                        users.first_name, \
                        users.last_name, \
                        users.level, \
                        CONCAT( users.first_name, ' ' , users.last_name ) AS full_name,  \
                        ( SELECT COUNT(*) FROM comments WHERE comments.vid = videos.uid ) AS total_comments, \
                        ( SELECT COUNT(*) FROM liked WHERE liked.vid = videos.uid ) AS total_likes \
                  FROM videos  \
                      JOIN users ON users.uid = videos.userid  \
                                  WHERE videos.userid = '{{userid}}'  \
                                  ORDER BY videos.date_created DESC LIMIT {{limit}} OFFSET {{offset}}; \
              ".split("{{userid}}").join(userid)
              .split("{{limit}}").join(limit)
              .split("{{offset}}").join(offset);

          queryVideos( userid, SQL, config, cb );
  }
*/

  function query( vid, sql, config, cb )
  {
          console.log("AnalyticsManager:queryVideos():vid:", vid, ", SQL:",sql );
      var _query_results = [];

      _con.query( sql )
          .then(function(rows){
              _query_results = rows;
              try{
                  cb(_query_results);
              }catch(e){
                  console.log("AnalyticsManager.query:catch:error:",e)
              }
              return _query_results;
          }).catch(function(err){
              console.log("AnalyticsManager.query.catch:err:", err);
          })
  }

  //interface
  return { getVideoViewsByDate        : getVideoViewsByDate,
           getVideoUniqueUsersByDate  : getVideoUniqueUsersByDate

  }


}
