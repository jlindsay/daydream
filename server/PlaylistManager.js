/**
 * author:Joshua Lindsay
 * email:j@lindsayfilm.com
 * twitter:@jlindsay
 * https://www.lindsayfilm.com
 * Software can be used for Good or Evil.
 * Some people die rich, some die poor, the result is the same.
 */
function PlaylistManager()
{
    var self        = this;
    var trim        = require('trim');
    var utils       = require('./Utils');
    var _           = require('underscore');
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

    var _vm         = require('./VideoManager.js');

	var _is_loggedin    = false;
	var _is_admin       = false;
	var _is_moderator   = false;
	var _is_staff       = false;

    function getUserPlaylists( userid, include_videos, limit, offset, config, cb )
    {
        console.log("Playlist.getUserPlaylist():userid:", userid );
        userid  = userid? trim(userid) : null;
        limit   = limit? trim(limit) : null;
        offset  = offset? trim(offset) : null;
        include_videos = include_videos? Boolean(include_videos) : false;

        var SQL = "SELECT playlists.* , playlists.uid AS pid , users.uid as userid, users.profile_url, users.first_name, users.last_name, users.level, CONCAT( users.first_name, ' ' , users.last_name) AS full_name  \
                	FROM playlists \
                            JOIN users ON users.uid = playlists.userid   \
                			WHERE playlists.userid = '{{userid}}'  \
                                ORDER BY playlists.date_created DESC LIMIT {{limit}} OFFSET {{offset}}; \
                ;".split("{{userid}}").join(userid)
                .split("{{limit}}").join(limit)
                .split("{{offset}}").join(offset)

            query( userid, SQL, config, function($playlists){
                if($playlists.length <= 0)
                {
                    cb($playlists);
//                    return $playlists;
                }

                var playlist_count = 0;

                function updateCounter( type, pid, key )
                {
//                    console.log("updateCounter:playlist_count:",playlist_count,", pid:", pid ,", key:", key , ", total:$playlists.length:", $playlists.length );
                    if( type == "playlist" ){
                        playlist_count++;
                    }

                    if( playlist_count == $playlists.length ){
                        try{
                            cb( $playlists );
                        }catch(e){
                        //  console.log("PlaylistManager:fetchPlaylistVideos:updateCounter:error:", e);
                        }
                    }
                };

                _.each( $playlists, function(playlist, pid, key ){
                    playlist.is_author     = ( playlist.userid == userid )? true : false;
                    playlist.is_admin      = config.user.is_admin || false;
                    playlist.is_staff      = config.user.is_staff || false;
                    playlist.is_moderator  = config.user.is_moderator || false;
                    playlist.is_loggedin   = config.user.is_loggedin || false;
                    playlist.videos         = [];

                    if( include_videos ){

                        getPlaylist(userid, playlist.pid, null, null, config, function($plist){
                            playlist.videos = $plist.videos;
                            _.each($plist.videos, function(video, key){
                                video.pid = playlist.pid;
                            })
                            playlist.total_videos = $plist.videos.length;
                            updateCounter( "playlist", playlist.pid, key );
                        })
                    }
                })

                if( !include_videos ){
                    cb($playlists);
                }
            });
    }

    function getPlaylist(userid, pid, limit, offset, config, cb )
    {
        console.log("Playlist.getPlaylist():userid:", userid, ", pid:", pid );
        userid  = userid? trim(userid) : null;
        pid     = pid? trim(pid) : null;

        //NOTE: going to ignore limit/offset for now...
        //limit   = limit? trim(limit) : null;
        //offset  = offset? trim(offset) : null;

        var SQL = "SELECT playlists.* , playlists.uid AS pid \
                    FROM playlists \
                        WHERE uid = '{{pid}}'; \
                    ;".split("{{userid}}").join(userid)
                      .split("{{pid}}").join(pid);

            query( userid, SQL, config, function($playlist){
                //console.log("playlist:result:", $playlist);

                SQL = "SELECT vid , videos.*, videos.uid as vid, users.uid as userid, users.profile_url, users.first_name, users.last_name, users.level, CONCAT( users.first_name, ' ' , users.last_name) AS full_name  \
                        	FROM video_2_playlist   \
                        		JOIN videos ON videos.uid = vid   \
                                JOIN users ON users.uid = videos.userid   \
                        			WHERE pid = '{{pid}}'   \
                                        ORDER BY video_2_playlist.date_created DESC; \
                      ;".split('{{pid}}').join(pid);

                var metadata = $playlist[0];

                    _vm.queryVideos(userid, SQL, config, function($videos){
                        var is_author = Boolean(metadata.userid == userid )
                        var results = { access_denied:true,  metadata:[], videos:[] };
                        if( is_author  || Boolean( metadata.is_public == "true" ) ){
                            var results = { access_denied:false, metadata: metadata, videos : $videos };
                        }
                        //console.log("_vm.queryVideos:pid:", pid);
                        cb( results );
                    });
            });

    }



    function addVideo2Playlist(userid, vid, pid, config, cb )
    {
//            console.log("Playlist.addVideo2Playlist():userid:", userid, ", vid:", vid, ", pid:", pid );
            userid  = userid? trim(userid) : null;
            pid     = pid? trim(pid) : null;
            vid     = vid? trim(vid) : null;

        var date_created = utils.DBDate();
        var uid = utils.createBase64UUID();

        var SQL = "INSERT INTO video_2_playlist  \
                    ( vid, uid, pid, date_created )   \
                    VALUES   \
                    ( '{{vid}}', '{{uid}}', '{{pid}}', '{{date_created}}' )   \
            ;".split("{{vid}}").join(vid)
              .split("{{pid}}").join(pid)
              .split("{{uid}}").join(uid)
              .split("{{date_created}}").join(date_created)

            console.log("Playlist.addVideo2Playlist:SQL:",SQL);
            query( userid, SQL, config, cb );
    }

    function deletePlaylistVideo(userid, pvid, config, cb )
    {
//        console.log("Playlist.deletePlaylistVideo():userid:", userid, ", pvid:",pvid );
            userid  = userid? trim(userid) : null;
            pvid    = pvid? trim(pvid) : null;

        var SQL     = "DELETE FROM video_2_playlist WHERE uid='{{pvid}}' ;".split("{{pvid}}").join(pvid);
            query( userid, SQL, config, cb );
    }

    function createPlaylist( userid, config, cb)
    {
        console.log("Playlist.createPlaylist():userid:", userid);
            userid       = userid? trim(userid) : null;
//            title        = title? trim(title) : null;
//            description  = description? trim(description) : null;
        var date_created = utils.DBDate();
        var uid = utils.createBase64UUID();

        var SQL = "INSERT INTO playlists  \
                    ( userid, uid, date_created )   \
                    VALUES   \
                    ( '{{userid}}', '{{uid}}', '{{date_created}}' )   \
            ;".split("{{userid}}").join(userid)
              .split("{{uid}}").join(uid)
              .split("{{date_created}}").join(date_created)

              query( userid, SQL, config, function(data){
                  //console.log("createPlaylist()");
                  var pid = uid;
                  getPlaylist(userid, pid, config, cb );
              });
    }

    function deletePlaylist(userid, pid, config, cb)
    {
            console.log("Playlist.deletePlaylist():userid:", userid, ", pid:", pid);
            userid  = userid? trim(userid) : null;
            pid     = pid? trim(pid) : null;

        var SQL     = "DELETE FROM playlists WHERE uid='{{pid}}' ;".split("{{pid}}").join(pid);
            query( userid, SQL, config, function(data){
                //cleanup the video_2_playlist table as well, before were done.
                SQL = "DELETE FROM video_2_playlist WHERE pid='{{pid}}' ;".split("{{pid}}").join(pid);
                query( userid, SQL, config, cb );
            });
    }

    function updatePlaylistMetadata(userid, pid, metadata, config, cb)
    {
        console.log("Playlist.updatePlalistMetadata():userid:", userid, ", pid:", pid, ", title:", title, ", description:", description , ", keywords:", keywords  );
        if(!metadata){
            metadata = {};
        }
            userid                = userid? trim(userid) : null;
            pid                   = pid? trim(pid) : null;
        var title                 = metadata.title? trim(metadata.title) : null;
        var description           = metadata.description? trim(metadata.description) : null;

        var thumbnail_url         = metadata.thumbnail_url? trim(metadata.thumbnail_url) : null;
        var is_public             = metadata.is_public? trim(metadata.is_public) : null;
        var catagorys             = metadata.catagorys? trim(metadata.catagorys) : null;
        var keywords              = metadata.keywords? trim(metadata.keywords) : null;

        var SQL = 'UPDATE playlists SET ';

            if( title ){
                SQL     += ' title = "' + title + '" ';
            }
            if( description ){
                SQL     += ' description = "'+ description +'" ';
            }

            if( thumbnail_url ){
                SQL     += ' thumbnail_url = "' + thumbnail_url + '" ';
            }

            if( is_public  ){
                SQL     += ' is_public = "' + is_public + '" ';
            }
            if( catagorys ){
                SQL     += ' catagorys = "'+ catagorys + '" ';
            }
            if( keywords ){
                SQL     += ' keywords = "' + keywords + '" ';
            }

            query( userid, SQL, config, function(data){
                getPlaylist(userid, pid, config, cb );
            } );
    }

/*
    function getPodcast(pid, cb)
    {
        pid = utils.addslashes( trim( pid ) );

        getByUID( pid, function(data){
          console.log("getPodcast.getByUID():data:", data );
        });

        var item_xml = '<item>   \
           <title>{{title}}</title>   \
           <link>http://{{domain}}/w/{{vid}}</link>   \
           <pubDate>{{date_created}}</pubDate>   \
           <dc:creator></dc:creator>   \
           <guid isPermaLink="false">http://{{domain}}/w/{{vid}}</guid>   \
           <description><![CDATA[{{description}}]]></description>   \
           <content:encoded><![CDATA[]]></content:encoded>   \
           <itunes:summary><![CDATA[]]></itunes:summary>   \
           <enclosure url="{{cdn_url}}" length="" type="audio/mpeg"/>   \
           <itunes:explicit>No</itunes:explicit>   \
           <itunes:duration/>   \
           <itunes:author></itunes:author>   \
           <itunes:keywords>{{keywords}}</itunes:keywords>   \
       </item>';


        var xml =  '<rss xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:wfw="http://wellformedweb.org/CommentAPI/" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:sy="http://purl.org/rss/1.0/modules/syndication/" xmlns:slash="http://purl.org/rss/1.0/modules/slash/" xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd" version="2.0">   \
            <channel>  \
                <title>{{title}}</title>  \
                <atom:link href="http://{{domain}}/podcast/{{pid}}" rel="self" type="application/rss+xml"/>  \
                <link>http://{{domain}}/podcast/{{pid}}</link>  \
                <description>{{description}}</description>  \
                <lastBuildDate>{{playlist_last_modified}}</lastBuildDate>   \
                <language>en-US</language>   \
                <copyright></copyright>   \
                <itunes:subtitle></itunes:subtitle>   \
                <itunes:author>{{author}}</itunes:author>   \
                <itunes:summary>{{description}}</itunes:summary>   \
                <itunes:owner>   \
                    <itunes:name></itunes:name>   \
                    <itunes:email></itunes:email>   \
                </itunes:owner>   \
                <itunes:explicit>No</itunes:explicit>   \
                <itunes:image href=""/>   \
                <itunes:category text="">  \
                    <itunes:category text=""/>   \
                </itunes:category>  \
                {{item}}  \
            </channel></rss>'.split("{{description}}").join(description)
            .split("{{pid}}").join(pid)
            .split("{{title}}").join(title)
            .split("{{author}}").join(author)
            .split("{{domain}}").join(domain);

        return $xml;
    }
*/
    function query( userid, sql, config, cb )
    {
    //        console.log("queryVideos():userid:", userid, ", SQL:",sql );
        var _query_results = [];

        _con.query( sql )
            .then(function(rows){
//                console.log("rows:", rows);
                _query_results = rows;
                try{
                    cb(_query_results);
                }catch(e){
                    console.log("query:catch:error:",e)
                }
                return _query_results;
            });
    }

    return {
        getUserPlaylists       : getUserPlaylists,
        getPlaylist            : getPlaylist,
        addVideo2Playlist      : addVideo2Playlist,
        deletePlaylistVideo    : deletePlaylistVideo,
        createPlaylist         : createPlaylist,
        deletePlaylist         : deletePlaylist,
        updatePlaylistMetadata  : updatePlaylistMetadata,
/*        getPodcast  : getPodcast, */
    };
}

module.exports = new PlaylistManager();
