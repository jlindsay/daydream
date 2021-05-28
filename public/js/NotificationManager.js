/**
 * author:Joshua Lindsay
 * email:j@lindsayfilm.com
 * http://lindsayfilm.com
 * Software can be used for Good or Evil.
 * Some people die rich, some die poor, the result is the same.
 */

function NotificationManager( $config )
{
    var self            = this;
    var _config         = $config || {};
    var _userid         = "";

    var _history        = [];

    var _notes  = [];
    var _note   = [];

    var _user           = {};
    var _internval = 5000;
    //init( $config )

    function cons(key)
    {
        return {
                 className            : "NotificationManager",
                 FEED_URL             : "/news/",
                 NEWSFEED_API_URL     : "/newsfeed-api",
                 NOTIFICATION_API_URL : "/notification-api",
                 DEFAULT_LIMIT        : "10"
                 }[key];
    }

    function init( $config )
    {
        console.log("NotificationManager.init()");
        _config     = $config || {};
        _userid     = $config.userid || null;
        _internval  = $config.interval || _internval;
    }

    function listen($cb)
    {
        console.log("NotificationManager.listen()");
        doPoll()
        function doPoll()
        {
            getUserNotes( _userid, { success:function($notes){
                $cb( "tick", $notes )
                setTimeout(doPoll,_internval);
            }})
        }
    }

    function markNoteAsRead( $userid, $nid, $config )
    {
          console.log("NotificationManager.markNoteAsRead():nid:", $nid);

          $config = $config || {};

          $.ajax({
              url: cons("NOTIFICATION_API_URL"),
              dataType: 'json',
              cache: false,
              data: {
                  action : "mark-note-as-read",
                  userid : $userid,
                  nid    : $nid
              },
              success: function($data){
                  console.log("NotificationManager:markNoteAsRead::success:");
                  _notes = $data.data || null;
                  try{
                      $config.success(_notes);
                  }catch($e){
                      console.log("NotificationManager:success:error:", $e);
                  }
              },
              error: function($e){
                  console.log("NotificationManager:markNoteAsRead::error:", $e);
                  try{
                      $config.error($e);
                  }catch($e){
                      console.log("NotificationManager:markNoteAsRead::error:e:",$e);
                  }

              }
          });
    }

    function markNoteAsUnread( $userid, $nid, $config )
    {
          console.log("NotificationManager.markNoteAsUnread():nid:", $nid);

          $config = $config || {};

          $.ajax({
              url: cons("NOTIFICATION_API_URL"),
              dataType: 'json',
              cache: false,
              data: {
                  action : "mark-note-as-unread",
                  userid : $userid,
                  nid    : $nid
              },
              success: function($data){
                  console.log("NotificationManager:markNoteAsUnread::success:");
                  _notes = $data.data || null;
                  try{
                      $config.success(_notes);
                  }catch($e){
                      console.log("NotificationManager:success:error:", $e);
                  }
              },
              error: function($e){
                  console.log("NotificationManager:markNoteAsUnread::error:", $e);
                  try{
                      $config.error($e);
                  }catch($e){
                      console.log("NotificationManager:markNoteAsUnread::error:e:",$e);
                  }

              }
          });
    }


    function createNote($userid, note, $metadata, $config )
    {
        console.log("NotificationManager.createNote($userid:", $userid, ", note:", note, ", metadata:", $metadata );

        $metadata                 = $metadata || {};
        $metadata.type            = $metadata.type || null ;

        $.ajax({
            url: cons("NOTIFICATION_API_URL"),
            dataType: 'json',
            cache: false,
            data: {
                action                    : "create-notification" ,
                userid                    : $userid ,
                message                   : $message ,
                type                      : $type
            },
            success: function( $data )
            {
                console.log("success:data:", $data);
                _notes = $data.data || [] ;
                try{
                    $config.success( _notes );
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

    function getNote($userid, $nid, $config)
    {
        console.log("NotificationManager:getNote():nid:", $nid);
        $.ajax({
            url: cons("NOTIFICATION_API_URL"),
            dataType: 'json',
            cache: false,
            data: {
                action : "get-note",
                userid : $userid,
                nid    : $nid,
            },

            success: function($info){
                console.log("NotificationManager:getNote:success:getNote::success:");
                _note = $info.data[0] || {};
                try{
                    $config.success(_note);
                }catch($e){
                    //console.log("NotificationManager:success:error:", $e);
                }
            },
            error: function($e){
                console.log("NotificationManager:getNote:getNote::error:", $e);
                try{
                    $config.error($e);
                }catch($e){
                    //console.log("NotificationManager:error:e:",$e);
                }

            }
        });
    }

    function getUserNotes($userid, $config)
    {
            console.log("NotificationManager:getUserNotes()");
            $config = $config || {};
        var status = $config.status || "unread";

        $.ajax({
            url: cons("NOTIFICATION_API_URL"),
            dataType: 'json',
            cache: false,
            data: {
                action : "get-user-notes",
                userid : $userid,
                status : status
            },

            success: function($data){
                //console.log("NotificationManager:getUserNotes::success:");
                _notes = $data.data || null;
                try{
                    $config.success(_notes);
                }catch($e){
                    console.log("NotificationManager:success:error:", $e);
                }
            },
            error: function($e){
                console.log("NotificationManager:getUserNotes::error:", $e);
                try{
                    $config.error($e);
                }catch($e){
                    console.log("NotificationManager:getUserNotes::error:e:",$e);
                }

            }
        });
    }


    return {
        init   : init,
        cons   : cons,
        listen : listen,
        markNoteAsRead : markNoteAsRead,
        markNoteAsUnread : markNoteAsUnread

    }
}
