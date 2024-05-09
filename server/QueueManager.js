/**
 * author:Joshua Lindsay
 * email:j@lindsayfilm.com
 * twitter:@jlindsay
 * https://www.lindsayfilm.com
 * Software can be used for Good or Evil.
 * Some people die rich, some die poor, the result is the same.
 */

var utils = require("./Utils");

function QueueManager()
{
	var self        = this;
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

    function add2queue( userid, vid, config, cb )
    {
            console.log("QueueManager.add2queue()userid:", userid, ", vid:", vid );
            userid          = utils.addslashes( trim( userid ));
            vid             = utils.addslashes( trim( vid ));
        var action          = "default";
        var date_created    = utils.DBDate();
        var uid             = utils.createBase64UUID();


        var SQL = "INSERT INTO video_queue    \
                        ( uid, userid, vid, action, date_created )    \
                        VALUES    \
                        ( '{{uid}}', '{{userid}}', '{{vid}}', '{{action}}' ,'{{date_created}}' )    \
                        ;".split("{{uid}}").join(uid)
                        .split("{{userid}}").join(userid)
                        .split("{{vid}}").join(vid)
                        .split("{{action}}").join(action)
                        .split("{{date_created}}").join(date_created)


            query( userid, SQL, config, function(data){
                //console.log("QueueManager.query:complete()");
                cb( { userid: userid, vid:vid , date_created:date_created, uid:uid, action:action, status:'success' } );
            } );
    }

    function query( userid, sql, config, cb )
    {
//        console.log("queryVideos():userid:", userid, ", SQL:",sql );
        _query_results = [];

        _con.query( sql )
            .then(function(rows){
                _query_results = rows;
                try{
                    cb(_query_results);
                }catch(e){}
                return _query_results;
            });
    }


    function processVideo()
    {
        console.log("processVideo()")
        var SQL = "SELECT * FROM video_queue \
                    JOIN videos ON videos.uid = video_queue.vid  \
                      WHERE video_queue.status ='0' \
                          ORDER BY videos.date_created DESC LIMIT 1 ; ";
        var results = [];

            _con.query( SQL )
                .then(function(rows){
                    results = rows;
                });

        console.log("processVideo:results:.org_video_file::", results.org_video_file )
        console.log("processVideo:results:.video_dir::", results.video_dir )
        console.log("processVideo:results:.video_src::", results.video_src )
        console.log("processVideo:results:.video_url::", results.video_url )
        //var command = "ffmpeg -i "+ressults.video_file+" -c:v libx264 -c:a aac -vf format=yuv420p -movflags +faststart output.mp4"
/*
        $SQL = "SELECT * FROM video_queue WHERE status ='0' LIMIT 1;";

        if( $this->connect($SQL) )
        {
            while( $row = mysql_fetch_object( $this->db_results ) ){
//                echo "id:".$row->id ."</br>";
//                echo "uid:".$row->uid ."</br>";
//                echo "status:".$row->status ."</br>";
//                echo "video_src:".$row->video_src ."</br>";
//                echo "userid:" . $row->userid ."</br>";
                $cmd =  "ffmpeg -y -i ".$row->video_src."  -r 30000/1001 -b 2M -bt 4M -vcodec libx264 -pass 1 -vpre fastfirstpass -an ".$row->video_src.".mp4
                ffmpeg -y -i ".$row->video_src."  -r 30000/1001 -b 2M -bt 4M -vcodec libx264 -pass 2 -vpre hq -acodec libfaac -ac 2 -ar 48000 -ab 192k %".$row->video_src.".mp4
                ffmpeg  -itsoffset -4  -i %s -vcodec mjpeg -vframes 1 -an -f rawvideo -s 320x240 %".$row->video_src.".jpg";

                $output = "";

                  $pid = exec( $cmd, $output );
//                echo "pid:" . $pid . ", output:". $output . "</br>";

                return $this->db_results;
            }
        }
*/
    }

    function removeFromQueue( userid, vid, video_src )
    {
        //
    }


    return {
        add2queue       : add2queue,
        query           : query,
        processVideo    : processVideo
    }

}


module.exports = new QueueManager();
