/**
 * author:Joshua Lindsay
 * email:j@lindsayfilm.com
 * twitter:@jlindsay
 * https://www.lindsayfilm.com
 * Software can be used for Good or Evil.
 * Some people die rich, some die poor, the result is the same.
 */

function NotificationManager()
{
    var self        = this;
    var _um         = require('./UserManager');

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

    var _note = {};
    var _notes = [];

    var _limit = 20;
    var _search_resutls;


    function create_VideoComment_note( $userid, $vid, $comment_id, $config, $cb )
    {
            console.log( "NotificationManager.create_VideoComment_note():userid:", $userid , ", vid:", $vid , ", comment_id:", $comment_id , ", $config:", $config);

            $userid       = $userid         ? utils.addslashes( trim( $userid )) : null;
            $vid          = $vid            ? utils.addslashes( trim( $vid )) : null;
            $comment_id   = $comment_id     ? utils.addslashes( trim( $comment_id )) : null;

        var note    = $userid + " commented on your Video." ;
        var type    = "video-comment";

            createNote( $userid, note, type, { vid: $vid, comment_id: $comment_id }, $cb )

    }


    function create_VideoReplyComment_note( $userid, $vid, $comment_id, $config, $cb )
    {
            console.log( "NotificationManager.create_VideoReplyComment_note():userid:", $userid , ", vid:", $vid , ", comment_id:", $comment_id , ", $config:", $config);

            $userid         = $userid        ? utils.addslashes( trim( $userid )) : null;
            $vid            = $vid           ? utils.addslashes( trim( $vid )) : null;
            $comment_id     = $comment_id    ? utils.addslashes( trim( $comment_id )) : null;

        var note            = $userid + " replied to your comment." ;
        var type            = "video-reply-2-comment";

            createNote( $userid, note, type , { vid: $vid, comment_id: $comment_id }, $cb )
    }




    function create_PostReplyComment_note( $userid, $pid, $comment_id, $config, $cb )
    {
            console.log( "NotificationManager.create_PostReplyComment_note():userid:", $userid , ", pid:", $pid , ", comment_id:", $comment_id ,", $config:", $config);

            $userid         = $userid        ? utils.addslashes( trim( $userid )) : null;
            $pid            = $pid           ? utils.addslashes( trim( $pid )) : null;
            $comment_id     = $comment_id    ? utils.addslashes( trim( $comment_id )) : null;


        var note            = $userid + " replied to your comment." ;
        var type            = "post-reply-2-comment";

            createNote( $userid, note, type , { pid: $pid, comment_id: $comment_id }, $cb )
    }

    function create_PostComment_note( $userid, $pid, $comment_id, $config, $cb )
    {
            console.log( "NotificationManager.create_PostComment_note():userid:", $userid , ", pid:", $pid ,", $config:", $config);

            $userid        = $userid     ? utils.addslashes( trim( $userid )) : null;
            $pid           = $pid        ? utils.addslashes( trim( $pid )) : null;
            $comment_id    = $comment_id ? utils.addslashes( trim( $comment_id )) : null;

        var note    = $userid + " commented on your Post." ;
        var type    = "post-comment";

            createNote( $userid, note, type , { pid: $pid, comment_id: $comment_id }, $cb )

    }


    function create_PostLike_note( $userid, $pid, $config, $cb )
    {
            console.log( "NotificationManager.create_PostLike_note():userid:", $userid , ", pid:", $pid ,", $config:", $config);

            $userid = $userid ? utils.addslashes( trim( $userid )) : null;
            $pid    = $pid    ? utils.addslashes( trim( $pid )) : null;

        var note    = $userid + " liked your Post." ;
        var type    = "post-like";

            createNote( $userid, note, type, { pid: $pid }, $cb )

    }

    function create_PostCommentLike_note( $userid, $pid, $comment_id, $config, $cb )
    {
            console.log( "NotificationManager.create_PostCommentLike_note():userid:", $userid , ", pid:", $pid , ", comment_id:", $comment_id ,", $config:", $config);

            $userid      = $userid ? utils.addslashes( trim( $userid )) : null;
            $pid         = $pid    ? utils.addslashes( trim( $pid )) : null;
            $comment_id  = $comment_id    ? utils.addslashes( trim( $comment_id )) : null;

        var note    = $userid + " liked your Comment." ;
        var type    = "post-comment-like";

            createNote( $userid, note, type, { pid: $pid, comment_id:$comment_id }, $cb )

    }

    function create_VideoCommentLike_note( $userid, $vid, $comment_id, $config, $cb )
    {
            console.log( "NotificationManager.create_VideoCommentLike_note():userid:", $userid , ", vid:", $vid , ", comment_id:", $comment_id, ", $config:", $config);

            $userid      = $userid      ? utils.addslashes( trim( $userid )) : null;
            $vid         = $vid         ? utils.addslashes( trim( $vid )) : null;
            $comment_id  = $comment_id  ? utils.addslashes( trim( $comment_id )) : null;

        var note    = $userid + " liked your Comment." ;
        var type    = "video-comment-like";

            createNote( $userid, note, type, { vid: $vid, comment_id:$comment_id }, $cb )

    }

    function create_VideoLike_note( $userid, $vid, $config, $cb )
    {
            console.log( "NotificationManager.create_VideoLike_note():userid:", $userid , ", vid:", $vid , ", $config:", $config);

            $userid = $userid ? utils.addslashes( trim( $userid )) : null;
            $vid    = $vid    ? utils.addslashes( trim( $vid )) : null;

        var note = $userid + " liked your Post." ;
        var type = "post-like";
            createNote( $userid, note, type, { vid: $vid }, $cb )

    }


    function createNote( $userid, $note, $type, $config, $cb )
    {
            console.log( "NotificationManager.createNote():userid:", $userid ,
                                                          ", note:", $note,
                                                          ", type:", $type,
                                                          ", config:", $config,
                                                          ", cb:", $cb);

            $userid         = $userid  ? utils.addslashes( trim( $userid ) ) : null;
            $note           = $note    ? utils.addslashes( trim( $note ) ) : null;
            $type           = $type    ? utils.addslashes( trim( $type ) ) : null;

            pid             = $config.pid         ? utils.addslashes( trim( $config.pid ) ) : null;
            vid             = $config.vid         ? utils.addslashes( trim( $config.vid ) ) : null;
            comment_id      = $config.comment_id  ? utils.addslashes( trim( $config.comment_id ) ) : null;

        var date_created    = utils.DBDate();
        var last_modified   = date_created;
        var uid             = utils.createBase64UUID();
        var nid             = uid;

        var SQL = "INSERT INTO notifications   \
                    ( userid, uid, note, type, vid, pid, comment_id, date_created, last_modified )   \
                    VALUES   \
                    ( '{{userid}}', '{{uid}}',  '{{note}}', '{{type}}', '{{vid}}', '{{pid}}', '{{comment_id}}', '{{date_created}}', '{{last_modified}}' );   \
                    ".split("{{userid}}").join($userid)
                     .split("{{uid}}").join(uid)
                     .split("{{note}}").join($note)
                     .split("{{type}}").join($type)
                     .split("{{pid}}").join(pid)
                     .split("{{vid}}").join(vid)
                     .split("{{comment_id}}").join(comment_id)
                     .split("{{date_created}}").join(date_created)
                     .split("{{last_modified}}").join(last_modified)



            //queryPosts( $userid, SQL, {}, function($data){
            query( $userid, SQL, {}, function($data){
                console.log("queryPosts:success:")
                try{
                      $cb({
                          uid           : uid,
                          nid           : nid,
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

    function deleteNote( $userid, $nid, $config, $cb )
    {
          console.log("NotificationManager.deletePost():userid:", $userid, ", nid:", $nid )

          $nid    =  utils.addslashes( trim( $nid ) );
          $userid =  utils.addslashes( trim( $userid ) );

          var SQL     = "SELECT * FROM comments WHERE nid='"+ $nid +"' ;"
          var POST_SQL = "DELETE FROM posts WHERE uid = '" + $nid + "' ;";

              query( $userid, SQL, {}, function( $comments ){
                  //console.log("NotificationManager.deletePost::comments:",$comments)
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

                  COMMENT_SQL += " nid = '" + $nid + "' ";
                  LIKE_SQL += " nid = '" + $nid + "' ";



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




    function saveNoteMetadata( userid, nid, metadata, config, cb )
    {
            console.log("NotificationManager.saveNoteMetadata():userid:", userid, ", nid:", nid, ", metadata:", metadata);

            nid                 =  utils.addslashes( trim( nid ) );
            userid              =  utils.addslashes( trim( userid ) );
            metadata            =  metadata || [];

        var is_public           =  metadata['is_public'] ? utils.addslashes( trim( metadata['is_public'] ) ) : null;
        if( is_public ){
            is_public           =  ( is_public == 'true' )? 1 : is_public;
            is_public           =  ( is_public == 'false' )? 0 : is_public;
        }


        var type                = metadata.type          ? utils.addslashes( trim( metadata.type ) ) : null;
        var note                   = metadata.note                ? utils.addslashes( trim( metadata.note ) ) : null;

        var date_created        = utils.DBDate();
        var uid                 = utils.createBase64UUID();


        var count = 0;

        var SQL = 'UPDATE posts SET ';

            //console.log("metadata_title:",metadata_title)

            if( note ){
                SQL     += count == 0? '' : ", ";
                count++;
                SQL     += ' note = "' + note + '" ';
            }

            if( type ){
                SQL     += count == 0? '' : ", ";
                count++;
                SQL     += ' type = "' + type + '" ';
            }

            if( count == 0 ){
                cb({"status":"error", "message":"something is wrong with your metadata inputs"})
                return;//should probably rturn an error;

            }

            SQL += ' WHERE uid = "' + nid + '";';
            //console.log("SQL:", SQL)

            query( userid, SQL, config, function(data){
                getNote( userid, nid, config, cb );
            });

    }

    function markNoteAsRead( userid, nid, config, cb )
    {
            console.log("NotificationManager.markNoteAsUnread():userid:", userid, ", nid:", nid );

            nid                 =  utils.addslashes( trim( nid ) );
            userid              =  utils.addslashes( trim( userid ) );
        var SQL = 'UPDATE notifications SET status = "read" WHERE uid = "{{nid}}"'.split("{{nid}}").join(nid);
            query( userid, SQL, config, function(data){
                getNote( userid, nid, config, cb );
            });
    }

    function markNoteAsUnread( userid, nid, config, cb )
    {
            console.log("NotificationManager.markNoteAsUnread():userid:", userid, ", nid:", nid );

            nid                 =  utils.addslashes( trim( nid ) );
            userid              =  utils.addslashes( trim( userid ) );
        var SQL = 'UPDATE notifications SET status = "unread" WHERE uid = "{{nid}}"'.split("{{nid}}").join(nid);
            query( userid, SQL, config, function(data){
                getNote( userid, nid, config, cb );
            });
    }

    function getNote( $userid, $nid, $config, $cb )
    {
            console.log("NotificationManager:getNote():userid,", $userid, ", nid:", $nid );

            $userid =  $userid? utils.addslashes( trim( $userid ) ) : null;
            $nid    =  $nid? utils.addslashes( trim( $nid ) ) : null;

        var SQL = "SELECT comments.content AS comment , \
                           comments.uid AS comment_id,   \
                           notifications.status AS note_status,   \
                           notifications.type,   \
                           notifications.note,   \
                           notifications.uid AS nid,  \
                           notifications.pid AS pid,  \
                           notifications.vid AS vid,   \
                           users.uid AS userid, \
                           users.profile_url, \
                           users.first_name, \
                           users.last_name, \
                           users.level, \
                           CONCAT( users.first_name, ' ' , users.last_name) AS full_name  \
                  FROM comments   \
                    JOIN users \
                      ON users.uid = comments.userid  \
                    JOIN notifications \
                      ON notifications.comment_id = comments.uid   \
                        WHERE \
                            notifications.uid = '{{nid}}' \
            ;".split("{{nid}}").join( $nid )
              //.split("{{userid}}").join( $userid )

              query( $userid, SQL, $config, $cb );

    }

    function getUserNotes( userid, limit, offset, config, cb )
    {
            //console.log("NotificationManager:getUserNotes():userid,", userid, ", limit:", limit, "offset:", offset );

            userid  = userid ? trim( userid ) : null;
            offset  = offset ? trim( offset ) : 0;
            limit   = limit ? trim( limit ) : 20;
            congig  = config || {};

            var status = "unread"
                status = config.status || status;
            //is_loggedin = config.is_loggedin || false;

            var SQL = "SELECT comments.content AS comment , \
                               comments.uid AS comment_id,   \
                               notifications.status AS note_status,   \
                               notifications.type,   \
                               notifications.note,   \
                               notifications.uid AS nid,  \
                               notifications.pid AS pid,  \
                               notifications.vid AS vid,   \
                               users.uid AS userid, \
                               users.profile_url, \
                               users.first_name, \
                               users.last_name, \
                               users.level, \
                               CONCAT( users.first_name, ' ' , users.last_name) AS full_name  \
                      FROM comments   \
                        JOIN users \
                          ON users.uid = comments.userid  \
                        JOIN notifications \
                          ON notifications.comment_id = comments.uid   \
                          WHERE comments.userid = '{{userid}}' AND notifications.status = 'unread'  \
                                ORDER BY notifications.date_created DESC   \
                                LIMIT {{limit}} OFFSET {{offset}}  \
                  ;".split("{{userid}}").join(userid)
                  .split("{{offset}}").join(offset)
                  .split("{{limit}}").join(limit)
                  .split("{{limit}}").join(status)

                  //console.log("COMMENTS_SQL:", COMMENTS_SQL)
                  query(userid, SQL, config, function($notes){
                      cb($notes)
                  })
    }

    function getUnreadPostsCount( userid, config, cb )
    {
            console.log("NotificationManager.getUnreadPostsCount():userid:", userid );
            userid =  utils.addslashes( trim( userid ));

        var SQL = "SELECT count(*) as unread FROM notifications   \
                    JOIN users ON users.uid = notifications.userid   \
                        WHERE users.uid = '{{userid}}' AND status='unread'   \
                    ;".split("{{userid}}").join(userid);

            query( userid, SQL, config, cb );
    }

    function setNoteStatus( userid, nid, status, config, cb )
    {
          console.log("NotificationManager.setNoteStatus():userid:", userid, ", nid:", nid, ", status:", status );
            userid          = userid ? trim( userid ) : null;
            nid             = nid ? trim( nid ) : null;
            status          = status ? addslashes( trim( status ) ) : null;

        var SQL = "UPDATE notifications SET status = '{{status}}'   \
                        WHERE uid = '{{nid}' \
                        ;".split("{{status}}").join(status)
                          .split("{{nid}}").join(nid);

            query( userid, SQL, config, cb );
    }

    function query( userid, sql, config, cb )
    {
//        console.log("query():userid:", userid, ", SQL:",sql );
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
                console.log("NotificationManager.query.catch:err:", err);
            })
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


    return{
        createNote              : createNote,

        create_VideoComment_note        : create_VideoComment_note,
        create_VideoReplyComment_note   : create_VideoReplyComment_note,
        create_PostReplyComment_note    : create_PostReplyComment_note,
        create_PostComment_note         : create_PostComment_note,
        create_PostLike_note            : create_PostLike_note,
        create_VideoLike_note           : create_VideoLike_note,
        create_VideoCommentLike_note    : create_VideoCommentLike_note,
        create_PostCommentLike_note     : create_PostCommentLike_note,

        deleteNote              : deleteNote,
        saveNoteMetadata        : saveNoteMetadata,
        getNote                 : getNote,
        getUserNotes            : getUserNotes,
        setNoteStatus           : setNoteStatus,

        markNoteAsRead          : markNoteAsRead,
        markNoteAsUnread        : markNoteAsUnread,

        getUnreadPostsCount     : getUnreadPostsCount
    }
}

module.exports = new NotificationManager();
