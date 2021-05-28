/**
 * author:Joshua Lindsay
 * email:j@lindsayfilm.com
 * http://lindsayfilm.com
 * Software can be used for Good or Evil.
 * Some people die rich, some die poor, the result is the same.
 */

function VideoPlayer($config)
{
    var self = this;
    var _forceHTML5;
    var _uagent = navigator.userAgent.toLowerCase();
    var _isIOS = isIOS();
    var _userRTMP = false;
    var _userHLS = false;

    var _host = "video.lindsayfilm.com";
    var _port = "";
    var _protocol = "http"

    var _cdn_player_url = "";
    var _config = { "host" : String( window.location.hostname + ":" + window.location.port ) };
    var _isInIframe;


    function Main($config)
    {
        _config = ( $config  )? $config : _config;
        _host   = ( _config.host ) ? _config.host  : _host;
    }

    function create( $vid, $data )
    {
//        console.log("VideoPlayer:create:vid:", $vid, ", data:", $data )
        $data = ($data)? $data:{};
        $data['vid'] = $vid;

        getVideo($vid, { userid:$data.userid, success:function($video){
          console.log("embed:", $video)
          var html = getHTML( $vid, { width:'100%', height:'100%',
                                       userid:$data.userid,
                                       //video_src:$video[0].ios_url,
                                       video_src:$video.video_url,
                                       thumbnail_url:$video.thumbnail_url } )
              //append HTML to contents of the document.
              document.write( html );

        }, error:function(e){
          console.log("error:", e);
        }})

    }

    function getVideo($vid, $config)
    {
//        console.log("VideoPlayer.getVideo:$vid:", $vid, ", config:", $config )
        $.ajax({
          url: "/search-api?",
          dataType: 'json',
          cache: false,
          data: {
              action : "get-video",
              vid : $vid,
              userid : $config.userid,
              type:"json",
          },
          success: function($data){
              _video = $data.data[0] || {};

              try{
                  $config.success(_video);
              }catch(e){
//                  console.log("VideoPlayer.getVideo:error:e:",e);
                  $config.error(e);
              }
          },
          error: function(e){
//              console.log("VideoPlayer.getVideo($vid, $config):error:e:", e );
              try{
                  $config.error(e);
              }catch(e){

              }
          }
        })

    }

    function getEmbedCode($vid,$config)
    {
//        console.log("VideoPlayerLgetEmebedCode:", $vid, ", config:", $config);
            $config     = $config? $config : {};
        var autoplay    = $config.autoplay;
        var width       = $config.width || "100%";
        var height      = $config.height || "100%";
        var autoplay    = $config.autoplay || "false";
        var useRTMP     = $config.useRTMP || "false";
        var useHLS      = $config.useRTMP || "false";
        var useFlash    = $config.useFlash || "true";
        var host        = $config.host || _host;
        var protocol    = $config.protocol || _protocol;

        return '<iframe src="'+protocol+'//' + host + '/embed/' + $vid + '?autoplay=' + autoplay +'" style="width:' + width + '; height:' + height + '"  frameborder="0" marginwidth="0" marginheight="0" ></iframe>';
    }

    function getHTML($vid, $config)
    {
//        console.log("VideoPlayer:getHTML():vid:", $vid, ", config:", $config );
          var html = "<video class='video-player' id='vid-"+$vid+"' width='"+$config.width+"' height='"+$config.height+"' \
                             src='"+$config.video_src+"' \
                             poster='"+$config.thumbnail_url+"' \
                             preload controls style='background-color:#000;outline:none;'>\
                             <source id='vid-src-"+$vid+"' src='"+$config.video_src+"' type='video/x-mp4'></source> \
                     </video>";

         return html;
    }

    var cons = function(name)
    {
        var constants = { PROTOCALL             : "https://",
                          HOST                  : _host,
                          DEFAULT_WIDTH         : '600',
                          DEFAULT_HEIGHT        : '400' ,
                          FEED_URL              : "/feed/",
                          SEARCH_API_URL        : "/search-api/",
                          VIDEO_API_URL         : "/video-api",
                        }

        return constants[name];
    }

    function isIOS() {
        if ( ( _uagent.search("iphone") > -1) ||
             ( _uagent.search("ipad") > -1) ||
             ( _uagent.search("ipod") > -1 ) ){
            return true;
        }
        return false;
    }

/*
        function getParentUrl()
        {
            _isInIframe = (parent !== window),
            _parentUrl = null;

            if( _isInIframe ) {
                _parentUrl = document.referrer;
            }

            return _parentUrl;
        }
*/

    /**
      * public interface
      */
    Main($config);

    return {    cons            : cons,
                create          : create,
                getHTML         : getHTML,
                getEmbedCode    : getEmbedCode,
                isIOS           : isIOS
            }
}
