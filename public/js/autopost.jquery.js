(function($) {

      $.fn.extend({
        autopost: function(options,arg) {
             if (options && typeof(options) == 'object') {
                 options = $.extend( {}, $.myplugin.defaults, options );
             }

             this.each(function() {
                 new $.autopost(this, options, arg );
             });
             return;
         }
      });


      $.fn.autopost = function( $userid, $config ) {
          console.log("$.fn.autopost():userid: ", $userid);
         // private variables
         var _elms = this;

         var _config      = $config ? $config : {};
         var _userid      = $userid ? $userid : null;

         var _page_count  = 0
         var _offset      = 0;
         var _limit       = 10;

         var _is_loading  = false;

         var _nfm         = new NewsFeedManager();
         //var _vm          = new VideoManager();
         var _ytm         = new YoutubeManager();


         var _ui_elm;
         var _posts_elm;

         var _ui_is_tile = true;
         var _ui_is_list = false;
         var _show_post_ui = true;

         var _state         = "yt";//"phub"
         var _q             = "";

         var DEFAULT_LIMIT  = 10;

         var _card_metadata;

         init( $userid, $config )

         function init( $userid, $config )
         {
              console.log("$autopost::init():userid:", $userid)

              _userid = $userid || _userid;
              _state  = $config.state  || _state;
              _limit  = $config.limit  || _limit;
              _offset = $config.offset || _offset;
              _q      = $config.q || _q;

              if(Boolean(_ui_is_tile)){
                initSearchUI("tile");
              }else{
                initSearchUI("list");
              }

              $(window).scroll(function (e) {

                  var bottom = $(document).height() - $(window).height() - 150
                  var scrolltop = $(window).scrollTop()

                  if(Boolean(_ui_is_list)){
                    console.log("Set List");
                    initSearchUI("list");
                  }else{
                    console.log("Set Tile");
                    initSearchUI("tile");
                  }

                  if($(window).scrollTop() >= $(document).height() - $(window).height() - 150 && !_is_loading ) {
                      _page_count++;
                      _offset = _page_count * _limit ;
//                      updateFeed( _state, _offset, _limit );
                  }

              });

              $(window).resize(function()
              {
                  _isAnimated = true;

                  if( _posts_elm ){
                      _posts_elm.masonry({
                          itemSelector: '.box',
                          columnWidth: 10,
                          isAnimated: true,
                          queue:false
                      });
                  }

              });

              focus( _state )

         }

         function focus( $state )
         {
             console.log("$autopost::focus:$state:", $state );


             switch( $state )
             {
                 case "phub":
                     _state = $state;
                     _is_loading = true;
                     renderMessage( "#title", "PHUB" );
                     cleanSearchResults();
                     initPostsUI();
                     initSearchResults();

                     break;
                 case "yt":
                  default:
                     _state = $state;
                     _is_loading = true;
                     renderMessage( "#title", "Youtube" );
                     cleanSearchResults();
                     initPostsUI();
                     initSearchResults();
                     break;
             }
         }

         function updateFeed( $state, $offset, $limit )
         {
             console.log("updateFeed():$state:", $state );
             _offset = $offset || _offset;
             _limit  = $limit || _limit;

             switch($state)
             {
                 case "yt":
                     _state = $state;
                     _is_loading = true;
                     renderMessage( "#title", "Youtube" );
                     cleanSearchResults();
                     initPostsUI();

                     _ytm.searchYT( _q, { offset  : _offset,
                                          limit   : _limit,
                                          success : initRenderYTVideos,
                                          error   : searchError });

                      break;

                 case "phub":
                     _state = $state;
                     _is_loading = true;
                     renderMessage( "#title", "Pornhub" );
                     cleanSearchResults();
                     initPostsUI();

                     _ytm.searchPHUB( _q, { offset  : _offset,
                                            limit   : _limit,
                                            success : initRenderPHUBVideos,
                                            error   : searchError });

                     break;

                 default:
                     break;
             }
         }

         function initPostsUI()
         {
             console.log("$autopost::initPostsUI()");

             _elms.empty()
                  .append( creatNewsfeedContainer() )

             _ui_elm      = _elms.find(".newsfeed-ui")
             _posts_elm   = _elms.find(".newsfeed-posts")

             _ui_elm.empty().html( createNewsFeedInput() ).show()

             $(_ui_elm).find(".actions #search-title h1").html("Search Youtube");

             $(".newsfeed-ui .actions form").submit(function(e){
                     e.preventDefault();
                 var q = $(".newsfeed-ui .actions input#search").val()
                   //console.log('search:', q);
                   search(q, {limit:50, offset:0})
             });

             $(document).on("click", ".newsfeed-ui .actions a", function(e){
                  e.preventDefault();

                  console.log("a:click()");
                  var id = $(e.target).attr("id");
                  $(".newsfeed-ui .actions a#youtube").removeClass("active")
                  $(".newsfeed-ui .actions a#pornhub").removeClass("active")

                  if( id == 'youtube'){
                      $(".newsfeed-ui .actions a#youtube").addClass("active")
                      focus( 'yt' )
                  }else{
                      $(".newsfeed-ui .actions a#pornhub").addClass("active")
                      focus( 'phub' )
                  }

             })


             _posts_elm.find(".post-content").masonry({ itemSelector : '.box',
                                                        columnWidth  : 10,
                                                        isAnimated   : true
             }).masonry('bindResize');

         }

         function initTemplates()
         {
            console.log("$autopost::initTemplates");
            cleanTemplate();
            initNewsFeedTemplates();
            initYTVideosTemplates();
            initPHUBTemplates();
         }

         function initYTVideosTemplates()
         {
           console.log("$autopost::initYTVideosTemplates()");

           $(document).on("click",".yt-item-tmpl #post-btn", function(e){
              e.preventDefault();
              //console.log("click()");
              var elm = $(e.target).closest('.yt-item-tmpl');
              var yt_url = elm.find("input#link").val();
              _nfm.fetchURL_oembed_and_ogs( yt_url, { success : function( $data  ){
                //console.log("ogs:",$data)
                //console.log("_userid:", _userid , ", yt_url:" , yt_url )

                var card_metadata = {  url           : yt_url, //$data.ogUrl,
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

                        _nfm.createPost( _userid,
                                          yt_url,
                                          card_metadata,
                                          { success: function( $results ){
                                              //console.log("#send-btn:click():_nfm.createPost():success")
                                              console.log("bang:",$results)
                                              elm.find("#post-btn").removeClass("btn-primary").addClass("btn-danger")
                                              //cleanNewsFeedPostUI()
                                              //renderNewsFeed( $results, { prepend:true })
                                          }})
              }});
           })
         }

         function initPHUBTemplates()
         {
              console.log("$autopost::initPHUBTemplates()");
              $(document).on("click",".phub-item-tmpl #post-btn", function(e){
                 e.preventDefault();

                 var elm = $(e.target).closest('.phub-item-tmpl');
                 var phub_url = elm.find("input#url").val();
                 console.log("phub_url:", phub_url)
                     _ytm.fetchURL_oembed_and_ogs( phub_url, { success : function( $data  ){

                       console.log("url:",phub_url);

                       var card_metadata = {  url           : phub_url, //$data.ogUrl,
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


                                console.log("$data:",$data);
                                console.log("card_metadata:",card_metadata);

                               _nfm.createPost( _userid,
                                                 phub_url,
                                                 card_metadata,
                                                 { success: function( $results ){
                                                     //console.log("#send-btn:click():_nfm.createPost():success")
                                                     console.log("bang:",$results)
                                                     elm.find("#post-btn").removeClass("btn-primary").addClass("btn-danger")
                                                     //.phub-item-tmpl #post-btn)
                                                     //cleanNewsFeedPostUI()
                                                     //renderNewsFeed( $results, { prepend:true })
                                                 }})
                     }});
              })
         }


         function initNewsFeedTemplates()
         {
             console.log("$autopost::initNewsFeedTemplates()");
             initSearchUI( "tile" )

             $(document).on("click", ".container #container-ui-options #tile-btn", function(e){
                    e.preventDefault();
                    console.log("tile-btn:click()");
                    initSearchUI("tile")
             });

             $(document).on("click", ".container #container-ui-options #list-btn", function(e){
                    e.preventDefault();
                    console.log("list-btn:click()");
                    initSearchUI("list")
             });
/*
             $(document).on("click", ".container #container-ui-options #pornhub-btn", function(e){
                    e.preventDefault();
                    console.log("pornhub-btn:click()");
                    $(e.target).attr("style", "color:#ff0000;")
                    //initSearchUI("list")
             });

             $(document).on("click", ".container #container-ui-options #youtube-btn", function(e){
                    e.preventDefault();
                    $(e.target).attr("style", "color:#ff0000;")
                    console.log("youtube-btn:click()");
                    //initSearchUI("list")
             });
*/
             //create post(s)
             $(document).on("click", ".container #actions-container #send-btn", function(e){
                     e.preventDefault();
                     console.log("#send-btn:click()")
                 var text = $("#comment-container textarea").val();
     //                console.log("send-btn():text:" , text );
                        _card_metadata = _card_metadata || {}
/*
                        _nfm.createPost( _userid,
                                          text,
                                          _card_metadata,
                                          { success: function( $results ){
                                              console.log("#send-btn:click():_nfm.createPost():success")
                                              cleanYTVideosPostUI()
                                              renderYTVideos( $results, { prepend:true })
                                          }})
*/
             })
         }

         function initSearchResults()
         {
           _posts = [];
           _posts_elm.empty();
         }

         function initRenderYTVideos($posts)
         {
             console.log('$autopost::initRenderYTVideos:posts:', $posts);
             _posts = [];
             _posts_elm.empty().append("<img src='/img/spinner.gif' />");

             if( $posts.length == 0 ){
               renderNoVideosMessage();
             }

             $.get('/tmpl/yt-item-tmpl.html', function($template) {
                 $('body').append($template);
                 renderYTVideos($posts);
                 initTemplates();
             });
         }

         function initRenderPHUBVideos($posts)
         {
             console.log('$autopost::initRenderPHUBVideos:posts:', $posts);
             _posts = [];
             _posts_elm.empty().append("<img src='/img/spinner.gif' />");

             if( $posts.length == 0 ){
               renderNoVideosMessage();
             }

             $.get('/tmpl/phub-item-tmpl.html', function($template) {
                 $('body').append($template);
                 renderPHUBVideos($posts);
                 initTemplates();
             });

         }

         function renderYTVideos( $videos, $config )
         {
             console.log("$autopost::renderYTVideos():$videos:",$videos);

             $config = $config ? $config : {};
             //$config.prepend = $config.prepend? $config.prepend : false;

             if( _posts.length <= 0 ){
                 _posts_elm.empty();
                 resizeSearchResults();
             }

             _posts = _posts.concat( $videos );

             $.each( $videos, function($i,$video){
               $video.thumbnail_url = $video.thumbnails.high.url
             })

             var video_elms = $('#yt-item-tmpl').tmpl($videos);
                _posts_elm.append(video_elms)

                resizeSearchResults();

                _posts_elm.masonry( 'appended', video_elms );

                _posts_elm.imagesLoaded(function(){
                     console.log("_posts_elm:imagesLoaded():_is_loading:",_is_loading);
                     _posts_elm.find(".yt-item-tmpl .yt-item-thumbnail-container .thumbnail-img").animate({opacity: 1});
                     resizeSearchResults();
                     _is_loading = false;
                });

         }


         function renderPHUBVideos( $videos, $config )
         {
             console.log("$autopost::renderPHUBVideos():$videos:", $videos);

             $config = $config ? $config : {};
             //$config.prepend = $config.prepend? $config.prepend : false;

             if( _posts.length <= 0 ){
                 _posts_elm.empty();
                 resizeSearchResults();
             }

             _posts = _posts.concat( $videos );


             $.each( $videos, function($i,$video){
              // console.log("videos:", $video)
/*
                duration: "31:18"
                thumb: "https://di.phncdn.com/videos/201810/10/186817391/original/2.jpg"
                title: "31:18\n                                                                                                                                            \n                \n                                Stepmom & step son sharing hotel room                            am_johnny"
                url: "http://pornhub.com/view_video.php?viewkey=ph5bbd881c9ebc9"
*/
               $video.thumbnail_url = $video.thumb;
             })

             //console.log("$posts:",$videos);
             var video_elms = $('#phub-item-tmpl').tmpl($videos);
                _posts_elm.append(video_elms)


                resizeSearchResults();

                _posts_elm.masonry( 'appended', video_elms );

                _posts_elm.imagesLoaded(function(){
                     console.log("_posts_elm:imagesLoaded():_is_loading:",_is_loading);
                     _posts_elm.find(".phub-item-tmpl .phub-item-thumbnail-container .thumbnail-img").animate({opacity: 1});
                     resizeSearchResults();
                     _is_loading = false;
                });

         }

         function resizeSearchResults()
         {
            console.log("$autopost::resizeSearchResults()")
            $(window).trigger('resize');

            if( _is_loading ){
                setTimeout( resizeSearchResults, 1000 );
            }
         }

         function cleanTemplate()
         {
            console.log("$autopost::cleanTemplate()");
            try{
                _posts_elm.masonry( 'destroy' );
                _posts_elm.removeData('masonry');
            }catch(e){
              console.log(e)
            }

            cleanNewsFeedTemplate()
            cleanYTVideosTemplate()
            cleanPHUBTemplate()
         }

         function cleanNewsFeedTemplate()
         {
             console.log("$autopost::cleanNewsFeedTemplate()");
             $(document).off("click", ".container #container-ui-options #list-btn")
             $(document).off("click", ".container #container-ui-options #tile-btn")
         }

         function cleanYTVideosTemplate()
         {
            console.log("$autopost::cleanYTVideosTemplate()");
            $(document).off("click",".yt-item-tmpl #post-btn")
         }

         function cleanPHUBTemplate()
         {
            console.log("$autopost::cleanPHUBTemplate()");
            $(document).off("click",".phub-item-tmpl #post-btn")
         }

         function renderMessage( $elm, $msg )
         {
             $($elm).fadeOut("fast", function(e){
                 $($elm).html($msg).fadeIn("fast");
             })
         }

         function creatNewsfeedContainer()
         {
           return "<div class='newsfeed-ui'>ui</div>  \
                   <div class='newsfeed-posts'>posts</div>"
         }

         function createNewsFeedInput()
         {
            //$(".actions #search-title h1").html();
            return '<div class="actions" style="text-align: center;margin-top:50px;margin-bottom:50px;">  \
                      <div id="search-title" style="margin-bottom:30px;">   \
                         <h1 style="color:#fff; text-shadow: 0 0 15px rgb(0 0 0 / 60%), 0 -1px 1px rgb(0 0 0 / 70%);">Search Youtube</h1>  \
                      </div>   \
                      <div class="actions" style="text-align:center;padding:15px;margin-bottom:30px;">  \
                           <a id="youtube" href="#" class="active">  \
                             <span class="material-icons">play_circle_filled</span>  \
                             Youtube  \
                           </a>  \
                           <a id="pornhub" href="#">  \
                             <span class="material-icons">play_circle_filled</span>  \
                             Pornhub  \
                           </a>  \
                       </div>  \
                      <div id="search-input">   \
                          <form action="#" style="display:inline-block;">  \
                              <span class="material-icons">search</span>  \
                              <input id="search" type="search" autocomplete="on" name="q" placeholder="Search?">  \
                          </form>  \
                     </div>   \
                </div>  \
                <div class="container px-4"> \
                    <div id="container-ui-options" class="row gx-5"> \
                       <div class="col"> \
                         <a id="tile-btn" ><span class="material-icons">dashboard</span></a>   \
                         <a id="list-btn" ><span class="material-icons">image</span></a>   \
                       </div>  \
                    </div>   \
              </div>'
         }

         function searchError()
         {
             renderMessage( "#title", "Search Error" );
             cleanSearchResults();
         }

         function cleanSearchResults()
         {
             _elms.empty().append("<img src='/img/spinner.gif' />");
         }


         function initSearchUI(state)
         {
             switch(state)
             {
                case "list":
                  change2ListUI()
                  break;
                case "tile":
                  change2TileUI()
                  break;
                default:
                  break;
             }
         }

         function toggleUI()
         {
            if(_ui_is_tile)
            {
              change2TileUI()
            }else{
              change2ListUI()
            }
         }

         function change2TileUI()
         {
            _ui_is_tile = true;
            _ui_is_list = false;

 //           $.cookie("_ui_is_tile", _ui_is_tile);
 //           $.cookie("_ui_is_list", _ui_is_list);

            $(".container #container-ui-options #tile-btn").addClass("active")
            $(".container #container-ui-options #list-btn").removeClass("active")

            _elms.find(".post-item-tmpl").addClass("postcard")
            _elms.find(".video-item-tmpl").addClass("videocard")
            _elms.find(".yt-item-tmpl").addClass("ytcard")
            _elms.find(".phub-item-tmpl").addClass("phubcard")

            $(window).trigger('resize');

         }

         function change2ListUI()
         {
            _ui_is_tile = false;
            _ui_is_list = true;

 //           $.cookie("_ui_is_tile", _ui_is_tile);
 //           $.cookie("_ui_is_list", _ui_is_list);

            $(".container #container-ui-options #tile-btn").removeClass("active")
            $(".container #container-ui-options #list-btn").addClass("active")


            _elms.find(".post-item-tmpl").removeClass("postcard")
            _elms.find(".video-item-tmpl").removeClass("videocard")
            _elms.find(".yt-item-tmpl").removeClass("ytcard")
            _elms.find(".phub-item-tmpl").removeClass("phubcard")


            $(window).trigger('resize');

         }

         function search($q,$config)
         {
           console.log("$autopost:search():q:",$q,", _state:", _state );
           switch(_state){
              case "phub":
                 searchPHUB($q,$config)
                 break;
               case "yt":
              default:
                searchYT($q,$config)
              break;
           }


         }

         function searchYT($q,$config)
         {
            console.log("$autopost:searchYT():q:",$q);
            var limit = $config.limit || 50;
            var offset = $config.offset || 0;

                _ytm.searchYT( $q, { offset  : offset,
                                     limit   : limit,
                                     success : initRenderYTVideos,
                                     error   : searchError });
         }

         function searchPHUB($q,$config)
         {
            console.log("$autopost:searchPHUB():q:",$q);
            var limit = $config.limit || 50;
            var offset = $config.offset || 0;

                _ytm.searchPHUB( $q, { offset  : offset,
                                     limit   : limit,
                                     success : initRenderPHUBVideos,
                                     error   : searchError });
         }

        return {
              search : search,
              searchYT : searchYT,
              searchPHUB : searchPHUB
          }
       }

})(jQuery);
