/**
 * author:Joshua Lindsay
 * email:j@lindsayfilm.com
 * http://lindsayfilm.com
 * Software can be used for Good or Evil.
 * Some people die rich, some die poor, the result is the same.
 */

function YoutubeManager( $config )
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

    init($config)

    function cons(key)
    {
        return { className          : "YoutubeManager",
                 NEWSFEED_API_URL   : "/newsfeed-api",
                 YOUTUBE_API_URL    : "/api/yt",
                 PHUB_API_URL       : "/api/phub",
                 DEFAULT_LIMIT      : 10
                 }[key];
    }

    function init( $config )
    {
        console.log("Youtube:init()");
        _config = $config || {};
        //_userid = $config.userid || null;
    }

    function searchYT( $q, $config )
    {
          console.log("Youtube:searchYT()");
          $.ajax({
               url: cons("YOUTUBE_API_URL"),
               dataType: 'json',
               cache: false,
               data: {
                  action    : "search-yt",
                         q  : $q
              },
               success: function($results){
                  console.log("Youtube:searchYT:success:$results:", $results);
                  try{
                      $config.success( $results.videos );
                  }catch(e){
                      console.log("Youtube:searchYT:: something is wrong...", e);
                  }
              },
              error : function($data)
              {
                  console.log("Youtube:searchYT:error");
                  try{
                      $config.success();
                  }catch(e){
                      console.log("Youtube:searchYT:error:",e)
                  }

              }
          });
    }

    function searchPHUB( $q, $config )
    {
          console.log("Youtube:searchPHUB()");
          $.ajax({
               url: cons("PHUB_API_URL"),
               dataType: 'json',
               cache: false,
               data: {
                  action    : "search-yt",
                         q  : $q
              },
               success: function($results){
                  console.log("Youtube:searchPHUB:success:data:", $results);
                  try{
                      $config.success( $results.videos );
                  }catch(e){
                      console.log("Youtube:searchPHUB:: something is wrong...");
                  }
              },
              error : function($data)
              {
                  console.log("Youtube:searchPHUB:error");
                  try{
                      $config.success();
                  }catch(e){
                      console.log("Youtube:searchPHUB:error:",e)
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

    function fetchURL_oembed_and_ogs( $url, $config ){
          console.log("YoutubeManager::fetchURL_oembed_and_ogs:url:", $url);

          $.ajax({
                url: '/oembed_ogs',
                dataType: 'json',
                cache: false,
                data: {
                    url : $url,
                },
                success: function($data){
                    console.log("YoutubeManager:success:data:", $data)
                    try{
                        $config.success($data);
                    }catch($e){
                        console.log("YoutubeManager:success:error:", $e);
                    }
                },
                error: function($e){
                    console.log(":error:", $e);
                    try{
                        $config.error($e);
                    }catch($e){
                        console.log("YoutubeManager:error:",$e);
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

        searchPHUB              : searchPHUB,
        searchYT                : searchYT,

        shortenText             : shortenText,
        createNewsFeedInput     : createNewsFeedInput,
        createCard              : createCard,
        isURL                   : isURL,
        findCardOnKeyEvent      : findCardOnKeyEvent,
        getCardHTMLbyURL        : getCardHTMLbyURL,
        findURLs                : findURLs,
        fetchURLOpenGraph       : fetchURLOpenGraph,
        fetchURLOembed          : fetchURLOembed,
        fetchURL_oembed_and_ogs : fetchURL_oembed_and_ogs,
        getOpenEmbedCode        : getOpenEmbedCode,
        getOGSEmbedCode         : getOGSEmbedCode,
        getEmbedCode            : getEmbedCode

    }
}
