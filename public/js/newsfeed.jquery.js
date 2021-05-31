(function($) {

      $.fn.extend({
        newsfeed: function(options,arg) {
             if (options && typeof(options) == 'object') {
                 options = $.extend( {}, $.myplugin.defaults, options );
             }

             this.each(function() {
                 new $.newsfeed(this, options, arg );
             });
             return;
         }
      });

      $.fn.newsfeed = function( $userid, $config ) {
          console.log("$.fn.newsfeed():userid, ", $userid);
         // private variables
         var _elms = this;

         var _config      = $config ? $config : {};
         var _userid      = $userid ? $userid : null;

         //FIXME: this code can't tell the difference between the userid and the profile id meaning, it doesn't know who's looking at this v who posts does this belong to,
         // var _profile_id  =  $profile_id ? $profile_id : null;

         var _vid;
         var _pid;

         var _is_loading  = false;
         var _dateUtils   = new DateUtils();
         var _isAnimated  = false ;
         var _page_count  = 0;
         var _limit       = 10;
         var _offset      = 0;
         var _state       = 'news-feed';
         var _q;

         var _allowAds = false;
         var _show_house_ads = false;

         var _ui_is_tile = true;
         var _ui_is_list = false;
         var _show_post_ui = true;
         var _show_video_ui = true;
         var _show_comments_ui = true;

         var _nfui_elm;
         var _nfposts_elm;

         var _video_ui_elm;
         var _video_posts_elm;

         var _delete_video_modal;
         var _edit_video_metadata_modal;
         var _video_overlay_modal;

         var _comments_ui_elm;
         var _comments_elm;
         var _search_elms;

         var _comments = [];
         var _videos = [];
         var _posts = [];
         var _card_metadata;

         var _delete_post_modal;
         var _edit_post_metadata_modal;
         var _post_overlay_modal;

         var _nfm     = new NewsFeedManager();
         var _vm      = new VideoManager();
         var _notes   = new NotificationManager();

         var NEWSFEED_API_URL  = "/newsfeed-api";
         var VIDEO_API_URL     = "/video-api";
         var SOCIAL_API_URL    = "/social-api";
         var DEFAULT_LIMIT     = 10;

         var _interval = 30000;
         function _onNotes($notes){}

         init($userid, $config)

         function init($userid, $config)
         {
            console.log("$.newsfeed.init()")
            _userid = $userid;
            _state  = $config.state  || _state;
            _limit  = $config.limit  || _limit;
            _offset = $config.offset || _offset;
            _pid    = $config.pid    || _pid;
            _vid    = $config.vid    || _vid;

            _allowAds       = $config.allowAds || _allowAds;
            _show_house_ads = $config.show_house_ads || _show_house_ads;

            _interval       = $config.interval || _interval;
            _onNotes        = $config.onNotes || null;

            _notes.init({ userid:_userid,
                          interval:_interval,
                        })

            if( _onNotes ){
               _notes.listen( _onNotes )
            }


/*
            _ui_is_tile = Boolean( $.cookie("_ui_is_tile") );
            _ui_is_list != _ui_is_tile;
            _ui_is_tile = Boolean( $.cookie("_ui_is_tile"), _ui_is_tile );
            //_ui_is_list = Boolean( $.cookie("_ui_is_list") );
*/

            _show_video_ui  =  ( $config.show_video_ui ) != undefined ? Boolean( $config.show_video_ui ) : Boolean( _show_video_ui );
            _show_post_ui   =  ( $config.show_post_ui ) != undefined ? Boolean( $config.show_post_ui ) : Boolean( _show_post_ui );
            _ui_is_tile     =  ( $config.show_tile_ui ) != undefined ? Boolean( $config.show_tile_ui ) : Boolean( _ui_is_tile );
            _ui_is_list     != _ui_is_tile

            updateUIbyState();

            $(window).scroll(function (e) {

                var bottom = $(document).height() - $(window).height() - 150
                var scrolltop = $(window).scrollTop()

                updateUIbyState();

                if($(window).scrollTop() >= $(document).height() - $(window).height() - 150 && !_is_loading ) {
                    _page_count++;
                    _offset = _page_count * _limit ;
                    updateFeed( _state, _offset, _limit );
                }

            });

            $(window).resize(function()
            {
                _isAnimated = true;

                if( _video_posts_elm){
                    _video_posts_elm.masonry({
                        itemSelector: '.box',
                        columnWidth: 10,
                        isAnimated: true,
                        queue:false
                    });
                }


                if( _nfposts_elm ){
                    _nfposts_elm.masonry({
                        itemSelector: '.box',
                        columnWidth: 10,
                        isAnimated: true,
                        queue:false
                    });
                }

                if( _comments_elm){
                    _comments_elm.masonry({
                        itemSelector: '.box',
                        columnWidth: 10,
                        isAnimated: true,
                        queue:false
                    });
                }

            });

            focus( _state );

         }

         function focus( state, offset, limit )
         {
             console.log("focus:state:", state );
             _offset  = offset || 0;
             _limit   = limit || 10;

             switch( state )
             {
                 case "get-video":
                    _state = state;
                    _is_loading = true;
                    renderMessage( "#title", "Video" );
                    initVideoUI();
                    cleanSearchResults();
                    _vm.getVideo( _userid, _vid,{ success  : initRenderVideo,
                                                   error   : searchError });
                    break;
                 case "get-post":
                    _state = state;
                    _is_loading = true;
                    renderMessage( "#title", "Post" );
                    initPostsUI();
                    cleanSearchResults();
                    _nfm.getPost( _userid, _pid,{ success : initRenderPost,
                                                  error   : searchError });
                    break;
                 case "news-feed":
                     _state = state;
                     _is_loading = true;
                     renderMessage( "#title", "NewsFeed" );
                     cleanSearchResults();
                     initPostsUI();
                     _nfm.getNewsFeed( _userid, { offset  : _offset,
                                                  limit   : _limit,
                                                  success : initRenderNewsFeed,
                                                  error   : searchError });
                   break;

               case "my-news-feed":
                     _state = state;
                     _is_loading = true;
                     renderMessage( "#title", "My NewsFeed Posts" );
                     cleanSearchResults();
                     initPostsUI();
                     _nfm.getUserNewsFeed( _userid, { offset  : _offset,
                                                      limit   : _limit,
                                                      success : initRenderNewsFeed,
                                                      error   : searchError });
                 break;

               case "related-posts":
                     _state = state;
                     _is_loading = true;
                     renderMessage( "#title", "Related Posts" );
                     cleanSearchResults();
                     initPostsUI();
                     _nfm.getRelatedPosts( _userid, { offset  : _offset,
                                                      limit   : _limit,
                                                      success : initRenderNewsFeed,
                                                      error   : searchError });

                   break;

                 case "my-videos":

                     _state = state;
                     _is_loading = true;
                     renderMessage( "#title", "My Videos" );
                     cleanSearchResults();
                     initVideoUI();
                     _vm.getUserVideos( _userid, { offset  : _offset,
                                                   limit   : _limit,
                                                   success : initRenderVideos,
                                                   error   : searchError  });
                    break;

                 case "new-videos":
                     _state = state;
                     _is_loading = true;
                     renderMessage( "#title", "New Videos" );
                     cleanSearchResults();
                     initVideoUI();
                     _vm.getNewVideos( _userid, { offset  : _offset,
                                                  limit   : _limit,
                                                  success : initRenderVideos,
                                                  error   : searchError });

                     break;
                 case "related-videos":
                     _state = state;
                     _is_loading = true;
                     renderMessage( "#title", "Related Videos" );
                     cleanSearchResults();
                     initVideoUI();
                     _vm.getRelatedVideos( _userid, _vid, { offset  : _offset,
                                                            limit   : _limit,
                                                            success : initRenderVideos,
                                                            error   : searchError });

                     break;

                 case "history":
                     _state = state;
                     _is_loading = true;
                     renderMessage( "#title", "My History" );
                     cleanSearchResults();
                     initVideoUI();
                     _vm.getUserWatchHistory( _userid, { offset : _offset,
                                                         limit  : _limit,
                                                         success: initRenderVideos,
                                                         error : searchError  });

                     break;
                 case "tv":
                     _state = state;
                     _is_loading = true;
                     renderMessage( "#title", "TV" );
                     cleanSearchResults();
                     initVideoUI();
                     _vm.getTVShows( _userid, { offset   : _offset,
                                                limit    : _limit,
                                                success  : initRenderVideos,
                                                error    : searchError  });

                     break;

                 case "movies":
                     _state = state;
                     _is_loading = true;
                     renderMessage( "#title", "Movies" );
                     cleanSearchResults();
                     initVideoUI();
                     _vm.getMovies( _userid, { offset   : _offset,
                                               limit    : _limit,
                                               success  : initRenderVideos,
                                               error    : searchError  });

                     break;

                 case "audiobooks":
                     _state = state;
                     _is_loading = true;
                     renderMessage( "#title", "Audio Books" );
                     cleanSearchResults();
                     initVideoUI();
                     _vm.getAudiobooks( _userid, { offset   : _offset,
                                                   limit    : _limit,
                                                   success  : initRenderVideos,
                                                   error    : searchError  });

                     break;

                 case "channel-comments":
                     _state = state;
                     _is_loading = true;
                     renderMessage( "#title", "Channel Comments" );
                     cleanSearchResults();
                     initCommentsUI();
                     _vm.getChannelVideoComments( _userid, { offset   : _offset,
                                                             limit    : _limit,
                                                             success  : initRenderChannelVideoComments,
                                                             error    : searchError  });

                     break;
                 case "search":
                   _state = state;
                   _is_loading = true;
                   renderMessage( "#title", "Search" );
                   cleanSearchResults();
                   initVideoUI();
                   _vm.search( _userid, _q, { offset  : _offset,
                                              limit   : _limit,
                                              success : initSearchRenderVideos,
                                              error   : searchError });

                   break;

                 case "upload":
                     //probably open a modal window for uploading.
                     break;

                 default:
                     break;
             }
         }



         function initCommentsUI()
         {
             console.log("$.newsfeed::initCommentsUI()");

             _elms.empty()
                   .append( createCommentsContainer() )

             _comments_ui_elm = _elms.find(".comments-ui")

             _comments_ui_elm.empty().html( createCommentsInput() ).show()
             _comments_ui_elm.find("#posts-btn").addClass("active");

             initCommentsInputUI(_show_comments_ui)


             _comments_elm  = _elms.find(".comments-posts")
             _comments_elm.empty()
             _comments_elm.masonry({ itemSelector : '.box',
                                      columnWidth  : 10,
                                      isAnimated   : true
             }).masonry('bindResize');

         }

         function initVideoUI()
         {
             console.log("$.newsfeed::initVideoUI()");

             _elms.empty()
                   .append( createVideoDeleteModal() )
                   .append( createVideoOverlayModal() )
                   .append( createVideoEditMetadataModals() )
                   .append( createVideoContainer() )


             _video_ui_elm      = _elms.find(".video-ui")
             _video_posts_elm   = _elms.find(".video-posts")

             _delete_video_modal         = $("#delete-video-modal")
             _edit_video_metadata_modal  = $("#edit-video-metadata-modal")
             _video_overlay_modal        = $("#view-video-modal")

             _video_ui_elm.empty().html( createVideosInput() ).show()

             initVideoMetadataModal()

             initVideoInputUI(_show_video_ui)

             _video_posts_elm.masonry({ itemSelector : '.box',
                                        columnWidth  : 10,
                                        isAnimated   : true
             }).masonry('bindResize');
         }

         function initPostsUI()
         {
             console.log("$.newsfeed::initPostsUI()");

             _elms.empty()
                  .append( createPostDeleteModal() )
                  .append( createPostOverlayModal() )
                  .append( createPostEditMetadataModals() )
                  .append( creatNewsfeedContainer() )

             _nfui_elm                  = _elms.find(".newsfeed-ui")
             _nfposts_elm               = _elms.find(".newsfeed-posts")

             _delete_post_modal         = $("#delete-post-modal")
             _edit_post_metadata_modal  = $("#edit-post-metadata-modal")
             _post_overlay_modal        = $("#view-post-modal")

             _nfui_elm.empty().html( createNewsFeedInput() ).show()

             initPostMetadataModal()
             initNewsFeedInputUI(_show_post_ui)


             _nfposts_elm.find(".newsfeed-content").masonry({ itemSelector : '.box',
                                                              columnWidth  : 10,
                                                              isAnimated   : true
             }).masonry('bindResize');

         }

         function initRenderVideo(video)
         {
             console.log('$.newsfeed::initRenderVideo:video:', video);
             _video = video;
            //_elm.empty().append("<img src='/img/spinner.gif' />");
             if( !video ){
                //renderNoVideosMessage();
             }

             $.get('/tmpl/video-and-comments-item-tmpl.html', function($template) {
                 $('body').append($template);
                 renderVideo(video);
                 initTemplates();
             });
         }

         function initRenderPost($post)
         {
             console.log('$.newsfeed::initRenderPost:post:', $post);
             _post = $post;
             _nfposts_elm.empty().append("<img src='/img/spinner.gif' />");
             if( !$post ){
                //renderNoVideosMessage();
             }

             $.get('/tmpl/post-and-comments-item-tmpl.html', function($template) {
                 $('body').append($template);
                 renderPost($post);
                 initTemplates();
             });
         }

         function initRenderNewsFeed($posts)
         {
             console.log('$.newsfeed::initRenderNewsFeed:posts:', $posts);
             _posts = [];
             _nfposts_elm.empty().append("<img src='/img/spinner.gif' />");
             if( $posts.length == 0 ){
               //renderNoVideosMessage();
             }

             $.get('/tmpl/post-and-comments-item-tmpl.html', function($template) {
                 $('body').append($template);
                 renderNewsFeed($posts);
                 initTemplates();
             });
         }

         function initRenderVideos($results)
         {
             console.log("$.newsfeed::initRenderVideos():results:",$results);
             _videos = [];

             _video_posts_elm.empty().append("<img src='/img/spinner.gif' />");

             if( $results.length == 0 ){
                 renderNoVideosMessage();
             }

             $.get('/tmpl/video-and-comments-item-tmpl.html', function(template) {
                 $('body').append(template);
                 renderVideos($results);
                 initTemplates();
             });
         }

         function initRenderChannelVideoComments($results)
         {
             console.log("$.newsfeed::initRenderChannelVideoComments():results:",$results);
             _comments = [];

             _comments_elm.empty().append("<img src='/img/spinner.gif' />");
             if( $results.length == 0 ){
                renderNoCommentsMessage();
             }

             $.get('/tmpl/comment-item-tmpl.html', function(template) {
                 $('body').append(template);
                 renderChannelVideoComments($results);
                 initTemplates();
             });
         }

         function renderVideo($video, $config)
         {
             console.log("$.newsfeed::renderVideo():$video:",$video);

             $config          = $config ? $config : {};
             $config.prepend  = $config.prepend? $config.prepend : false;

             _elms.empty();

             $video.allow_embed_code = true;
             _video = $video;

             var video_elms = $('#video-and-comments-item-tmpl').tmpl([_video]);
                 console.log("$.newsfeed::video_elms:",video_elms);
                 video_elms.find(".video-item-comment").addClass("video-comment")

                _elms.append(video_elms)
                _elms.find(".videocard").removeClass("videocard")

            var thumb = _elms.find(".video-item-thumbnail-container")

                injectVideoIframe( thumb, _vid, _video )

                 _elms.imagesLoaded(function(){
                     console.log("_elm:imagesLoaded():_is_loading:",_is_loading);
                     _elms.find(".video-item-tmpl .video-item-thumbnail-container .thumbnail-img").animate({opacity: 1});
                     _is_loading = false;
                 });

         }

         //renderPost
         function renderPost($post, $config)
         {
             console.log("$.newsfeed::renderPost():$post:",$post);

             $config          = $config ? $config : {};
             $config.prepend  = $config.prepend? $config.prepend : false;

             //if( _post = undefined ){
             _elms.empty();
//                 resizeSearchResults();
             //}
             $post.allow_embed_code=true;
             _post = $post;//_post.concat( $posts );

             //$.each( $posts, function($i,$val){
/*
                var comments = _post.comments;
                $.each( comments, function($j, $comment){

                    if( $comment.content && $comment.content.length > 120 ){
                        $comment.content = $comment.content.substring(0, 120) + '...';
                    }
                 })
*/
/*
                 if( _post.metadata_description && _post.metadata_description.length > 240 ){
                     _post.metadata_description = _post.metadata_description.substring(0, 240) + '...';
                 }
                     _post.date = (_post.date_created) ? _dateUtils.tsToSlashDate( _post.date_created ) : "NA";
*/
             //});

             var post_elms = $('#post-and-comments-item-tmpl').tmpl([_post]);
                 console.log("$.newsfeed::post_elms:",post_elms);
                 post_elms.find(".post-item-comment").addClass("post-comment")

             // a = post_elms.find(".postcard").removeClass("postcard")
                     //console.log('a::', a )
                _elms.append(post_elms)



                _elms.find(".postcard").removeClass("postcard")
                var thumb = _elms.find(".post-item-thumbnail-container")
                injectPostIframe( thumb, _pid, _post )
                 //resizeSearchResults();

                 //_elm.masonry( 'appended', post_elms );

                 _elms.imagesLoaded(function(){
                     //console.log("_nfposts_elm:imagesLoaded():_is_loading:",_is_loading);
                     _elms.find(".post-item-tmpl .post-item-thumbnail-container .thumbnail-img").animate({opacity: 1});
//                     resizeSearchResults();

                      if( _allowAds ){
                          _elms.append( NewsfeedAds() )
                      }

                     _is_loading = false;
                 });

         }

         function injectVideoIframe( $elm, $vid, $video )
         {
             console.log("injectVideoIframe():video:", $video, ", vid:", $vid);

             //var src = $post.metadata_video_url ? $post.metadata_video_url : null
             var embed_code = _vm.getEmbedCode( $vid, $video);
                 $($elm).html(embed_code);
                 $elm.attr("style","width:100%;")
                 $elm.find("iframe").attr("style","min-height:400px;width:100%;")
                 $elm.animate({opacity: 1});
                 //$(".big-post-item-tmpl .embed-wrapper textarea").html(embed_code);
         }


         function injectPostIframe( $elm, $pid, $post )
         {
             console.log("injectPostIframe():post:", $post, ", pid:", $pid);

             //var src = $post.metadata_video_url ? $post.metadata_video_url : null
             var embed_code = _nfm.getEmbedCode( $pid, $post);
                 $($elm).html(embed_code);
                 $elm.attr("style","width:100%;")
                 $elm.find("iframe").attr("style","min-height:400px;width:100%;")
                 $elm.animate({opacity: 1});
                 //$(".big-post-item-tmpl .embed-wrapper textarea").html(embed_code);
         }


         function renderNewsFeed($posts,$config)
         {
             console.log("$.newsfeed::renderNewsFeed():$posts:",$posts);

             $config = $config ? $config : {};
             $config.prepend = $config.prepend? $config.prepend : false;

             //var html = _nfm.createNewsFeedInput();
             //$(_video_posts_elm).html('asdf')
             if( _posts.length <= 0 ){
                 //$("#search-ui").empty().html(html).show()
                 _nfposts_elm.empty();
                 resizeSearchResults();
             }

             _posts = _posts.concat( $posts );

             $.each( $posts, function($i,$val){

                var comments = $val.comments;
                $.each( comments, function($j, $comment){

                    if( $comment.content && $comment.content.length > 120 ){
                        $comment.content = $comment.content.substring(0, 120) + '...';
                    }
                 })

                 if( $val.metadata_description && $val.metadata_description.length > 240 ){
                     $val.metadata_description = $val.metadata_description.substring(0, 240) + '...';
                 }
                     $val.date = ($val.date_created) ? _dateUtils.tsToSlashDate( $val.date_created ) : "NA";

             });

             var post_elms = $('#post-and-comments-item-tmpl').tmpl($posts);
                 post_elms.find(".post-item-comment").addClass("post-comment")

                 if( $config.prepend ){
                     _nfposts_elm.prepend(post_elms).masonry( 'reloadItems' );
                 }else{
                     _nfposts_elm.append(post_elms)//.masonry( 'reloadItems' );
                 }

                 resizeSearchResults();
/*
                 if( _isFiltered ){
                    filterVideos( $("#filterVideos").val() );
                 }
*/
                 _nfposts_elm.masonry( 'appended', post_elms );

                 _nfposts_elm.imagesLoaded(function(){
                     console.log("_nfposts_elm:imagesLoaded():_is_loading:",_is_loading);
                     _nfposts_elm.find(".post-item-tmpl .post-item-thumbnail-container .thumbnail-img").animate({opacity: 1});
                     resizeSearchResults();
                     _is_loading = false;
                 });

         }

         function renderVideos($results, $config)
         {
             console.log("$.newsfeed::renderVideos():resutls:",$results);
     //        cleanTemplate();
             console.log("renderVideos:",_video_posts_elm)
             $config = $config ? $config : {};
             $config.prepend = $config.prepend? $config.prepend : false;

             if( _videos.length <= 0 ){
                 $(_video_posts_elm).empty();
             }
             _videos = _videos.concat( $results );

             $.each( $results, function(i,val){
                 val['catagory'] = _state;

                 var comments = val.comments;
                 $.each( comments, function(i,comment){
                     if(comment.content){
                       comment.content = shortenText(comment.content, 120);
                     }
                 })
                 if(val.description){
                    val.description = shortenText(val.description, 240);
                 }


                 val.date = (val.date_created) ? _dateUtils.tsToSlashDate(val.date_created) : "NA";
             });

             var elms = $('#video-and-comments-item-tmpl').tmpl($results);
                 //NOTE: this is to make it easyer to find top level comment(s)
                 $(elms).find(".video-item-comment").addClass("video-comment")

                 if( $config.prepend )
                 {
                    _video_posts_elm.prepend(elms).masonry( 'reloadItems' );
                 }else{
                    _video_posts_elm.append(elms);

                 }


                 resizeSearchResults();

/*
                 if( _isFiltered ){
                    filterVideos( $("#filterVideos").val() );
                 }
*/
                 _video_posts_elm.masonry( 'appended', elms );

                 _video_posts_elm.imagesLoaded(function(){
                     //console.log("_elms:imagesLoaded():_is_loading:",_is_loading);
                     _video_posts_elm.find(".video-item-tmpl .video-item-thumbnail-container .thumbnail-img").animate({opacity: 1});

                     if( _allowAds ){
                         _elms.append( NewsfeedAds() )
                     }

                     resizeSearchResults();
                     _is_loading = false;
                 });
         }


         function renderChannelVideoComments($results)
         {
           console.log("$.newsfeed::renderChannelVideoComments:", $results);
           if( _comments.length <= 0 ){
               _comments_elm.empty();
           }

           _comments = _comments.concat( $results );
           var elms = $('#comment-item-tmpl').tmpl($results);

               _comments_elm.append(elms);

               resizeSearchResults();

               _comments_elm.masonry( 'appended', elms );

               _comments_elm.imagesLoaded(function(){
               _comments_elm.find(".msg-author-img").animate({opacity: 1});
                   resizeSearchResults();
                   _is_loading = false;
               });
         }


         function initSearchResultsVideos($results)
         {
             renderVideos($results.data)
         }


         function initTemplates()
         {
            console.log("$newsfeed:initTemplates");
            cleanTemplate();
            initNewsfeedTemplates();
            initVideoTemplates();
            initCommentsTemplates();
            updateUIbyState()
         }

         function initNewsfeedTemplates()
         {

             console.log("initNewsfeedTemplates()");

             initSearchUI( "tile" )

             $(document).on('keyup','#comment-container textarea', function($e){
                  _nfm.findCardOnKeyEvent( $e, {type:"post"},function($card, $metadata){
                      _card_metadata = $metadata;

                      $('#card-container').empty().prepend($card)

                      $("#card-container").imagesLoaded(function(){
                          $("#card-container").slideDown()
                      })
                  })
             })

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

             //create post(s)
             $(document).on("click", ".container #actions-container #send-btn", function(e){
                     e.preventDefault();
                     console.log("#send-btn:click()")
                 var text = $("#comment-container textarea").val();
     //                console.log("send-btn():text:" , text );
                        _card_metadata = _card_metadata || {}
                        _nfm.createPost( _userid,
                                          text,
                                          _card_metadata,
                                          { success: function( $results ){
                                              console.log("#send-btn:click():_nfm.createPost():success")
                                              cleanNewsFeedPostUI()
                                              renderNewsFeed( $results, { prepend:true })
                                          }})
             })




             //actions:
             $(document).on("click", ".post-item-tmpl .post-item-actions .likes-btn-wrapper", function(e){
     //            console.log("likes-btn-wrapper()e:,",e);
                 e.preventDefault();

                 var elm = e.target;
                 var pid = $(elm).closest(".post-item-tmpl").find("input#pid").val();
                 var likes_count = $(elm).closest(".post-item-actions").find("#comment-likes-"+pid+".likes-btn-wrapper .count");
                 var dislikes_count = $(elm).closest(".post-item-actions").find("#comment-dislikes-"+pid+".dislikes-btn-wrapper .count");

                     _nfm.likePost( _userid, pid, true, { success:function($data){
                            $(likes_count).html( $data.total_likes );
                            $(dislikes_count).html( $data.total_dislikes );
                     }});

             });


             $(document).on("click", ".post-item-tmpl .post-item-actions .dislikes-btn-wrapper", function(e){
//                 console.log("dislikes-btn-wrapper()e:",e);
                 e.preventDefault();

                 var elm = e.target;
                 var pid = $(elm).closest(".post-item-tmpl").find("input#pid").val();
                 var likes_count = $(elm).closest(".post-item-actions").find("#comment-likes-"+pid+".likes-btn-wrapper .count");
                 var dislikes_count = $(elm).closest(".post-item-actions").find("#comment-dislikes-"+pid+".dislikes-btn-wrapper .count");

                     _nfm.dislikePost( _userid, pid, true, { success:function($data){
                           $(likes_count).html( $data.total_likes );
                           $(dislikes_count).html( $data.total_dislikes );
                     }} );
             });


             $(document).on("click",".post-item-tmpl .message-btn-wrapper", function(e){
//                 console.log( "message-btn-wrapper:click:", e.target.closest(".video-item-tmpl") );
                 $(window).delay(190).queue(function( nxt ) {
                     $(window).trigger('resize');
                     nxt();
                 });
             });


             $(document).on('keyup','.post-item-tmpl .post-item-actions .comment-wrapper textarea',function($e)
             {
//                     console.log("keyup:()");
                 var key = ( $e.keyCode );
                 var elm = $($e.target);
                 //var keyed = elm.val();
                 var comment = elm.val();
                 var post_elm = elm.closest(".post-item-tmpl")
                 var pid = post_elm.find("input#pid").val();
//                   _vm.validatePostComment( comment );
                var urls_container = post_elm.find(".post-item-actions .comment-wrapper .urls")
                    urls_container.empty();
                    $(window).trigger('resize');

                var metatdata;
                    _nfm.findCardOnKeyEvent( $e, {type:"comment"} , function($card, $metadata){
                        metadata = $metadata;
                        urls_container.empty().prepend($card)

                        $(window).trigger('resize');

                        urls_container.imagesLoaded(function(){
                            urls_container.show()
                            $(window).trigger('resize');
                        })
                    })


                 switch(String(key))
                 {
                     case "13":
                         //reformate metadata for serverside processing
                         var m = {};
                         try{
                           if(metadata){
                              m = {   metadata_url           : metadata.url, //$data.ogUrl,
                                      metadata_title         : metadata.title,
                                      metadata_description   : metadata.description,
                                      metadata_thumbnail_url : metadata.thumbnail_url,
                                      metadata_video_url     : metadata.video_url,
                                      metadata_locale        : metadata.locale,
                                      metadata_date          : metadata.date,
                                      metadata_type          : metadata.type,
                                      metadata_request_url   : metadata.request_url,
                                      metadata_site_name     : metadata.site_name,
                                      metadata_charset       : metadata.charset,
                                      //metadata_ogs           : metadata.ogs,
                                      //metadata_oembed        : metadata.oembed
                                 }
                            }
                        }catch(e){
                          console.log("e:", e);
                        }

                         _nfm.postComment( _userid, pid, comment, { metadata: m,
                                                                    success:function($data){
                                 console.log( "_nfm:postComment:success:data:", $data );
                             var count_elm = $(elm).closest(".video-item-tmpl").find(".message-btn-wrapper").find(".count");
                             var count = Number($(count_elm).html());

                                 $(count_elm).html(String(count+=1));
                                 $(elm).closest(".post-item-tmpl").find(".comment-wrapper").collapse("hide");
                                 $(elm).val("");

                             var comments_elm = $(elm).closest(".post-item-tmpl").find(".post-item-comments");

                                 $("#post-item-comment-tmpl").tmpl( $data ).prependTo( comments_elm );

                                 $(window).delay(190).queue(function( nxt ) {
                                     $(window).trigger('resize');
                                     nxt();
                                 });

                         }});

                         break;

                     default:
                         break;
                 }
             });

             //comments action(s)
             $(document).on("click",".post-item-tmpl .post-item-comment .reply-btn-wrapper", function(e){
//                     console.log("reply-btn-wrapper.click()")
                     e.preventDefault();
                 var offset = 0;
                 var limit  = 10;
                 var elm = $(e.target).closest(".post-item-comment");
                 var comment_id = $(e.target).closest(".post-item-comment").find("#comment_id").val()

                 $(window).delay(190).queue(function( nxt ) {
                     $(window).trigger('resize');
                     nxt();
                 });

             });

             $(document).on("click", ".post-item-tmpl .post-item-comment-actions .likes-btn-wrapper", function(e){
//                 console.log("likes-btn-wrapper()");
                 e.preventDefault();
                 var elm = e.target;

                 var comment_id = $(elm).closest(".post-item-comment").find("input#comment_id").val();
                 var pid = $(elm).closest(".post-item-comment").find("input#pid").val();

                 var likes_count = $(elm).closest(".post-item-comment-actions").find("#comment-likes-"+comment_id+".likes-btn-wrapper .count");
                 var dislikes_count = $(elm).closest(".post-item-comment-actions").find("#comment-dislikes-"+comment_id+".dislikes-btn-wrapper .count");

                     _nfm.likePostComment( _userid, pid, comment_id ,true, { success:function($data){
                         $(likes_count).html( $data.total_likes );
                         $(dislikes_count).html( $data.total_dislikes );
                     }} );

             });

             $(document).on("click",".post-item-tmpl .post-item-comment-actions .dislikes-btn-wrapper", function(e){
//                 console.log("dislikes-btn-wrapper():e:", e);
                 e.preventDefault();
                 var elm = e.target;
                 var comment_id = $(elm).closest(".post-item-comment").find("input#comment_id").val();
                 var pid = $(elm).closest(".post-item-comment").find("input#pid").val();
                 var likes_count = $(elm).closest(".post-item-comment-actions").find("#comment-likes-"+comment_id+".likes-btn-wrapper .count");
                 var dislikes_count = $(elm).closest(".post-item-comment-actions").find("#comment-dislikes-"+comment_id+".dislikes-btn-wrapper .count");

                     _nfm.dislikePostComment( _userid, pid, comment_id, true, { success:function($data){
                           $(likes_count).html( $data.total_likes );
                           $(dislikes_count).html( $data.total_dislikes );
                     }} );
             });

             $(document).on('click','.post-item-tmpl .post-item-comment-actions .replies-wrapper',function(e)
             {
//                       console.log("post-item-tmpl .post-item-comment-actions .replies-wrapper()");
                       e.preventDefault();
                   var elm = e.target;

                   var comment_elm = $(elm).closest('.post-item-comment');
                   var comment_id = $(comment_elm).find("input#comment_id").val();
                   var total_replies = Number( $(comment_elm).find("input#total_replies").val() )
                   var replies_wrapper = $(comment_elm).find('.replies-wrapper');
                   var replies_container = $("#comment-replies-"+comment_id)
                       $(replies_container).show();

                   var offset = $(replies_container)[0].children.length;
                   var limit  = 5;

                   _nfm.getCommentReplies( _userid, comment_id , offset, limit, { success: function($data){
                           console.log("$data:",$data.length );

                       var replies = $("#post-item-comment-tmpl").tmpl( $data ).addClass("reply-2-post-comment")
                           $(replies).find(".reply-btn-wrapper").remove()
                           $(replies).find(".reply-comments-wrapper").remove()

                           $("#comment-" +comment_id+ " .reply-comments-wrapper").append( replies );

                             if( offset+limit >= total_replies ){
                                 $(replies_wrapper).hide();
                             }

                             $(window).delay(190).queue(function( nxt ) {
                                 $(window).trigger('resize');
                                 nxt();
                             });

                     }
                 })

             })

             var comments_cache = {}
             var reply2Comment_metadata ;


             $(document).on('keyup','.post-item-tmpl .post-item-comment-actions .comment-wrapper textarea',function($e)
             {
                 var key                 = $e.keyCode ;
                 var elm                 = $($e.target);
                 var keyed               = elm.val();
                 var comment             = elm.val();

                 var comment_elm         = elm.closest('.post-item-comment');
                 var comment_id          = comment_elm.find("input#comment_id").val();
                 var pid                 = comment_elm.find("input#pid").val();
                 var replies_wrapper     = comment_elm.find('.replies-wrapper');

                 var replies_container   = $("#comment-replies-" + comment_id)
                     replies_container.show();

                 var reply_container = $("#comment-reply-" + comment_id)
                 var urls_container  = reply_container.find(".urls")
                     urls_container.empty();
                     $(window).trigger('resize');

                 //comments_cache[comment_id].metadata;
                 var metadata = reply2Comment_metadata ;
                     _nfm.findCardOnKeyEvent( $e, {type:"reply-2-comment"} , function($card, $metadata){

                         metadata = reply2Comment_metadata = $metadata || metadata;

                         urls_container.empty().prepend($card)

                         $(window).trigger('resize');

                         urls_container.imagesLoaded(function(){
                             urls_container.show()
                             $(window).trigger('resize');
                         })
                     })


                 switch(String(key))
                 {
                     case "13":
                         //console.log( "_userid:",_userid, ", pid:", pid, ", comment_id:", comment_id ,", comment:", comment, ", metadata:",metadata );
                         var m = {};
                         try{
                           if(metadata){
                              m = {   metadata_url           : metadata.url, //$data.ogUrl,
                                      metadata_title         : metadata.title,
                                      metadata_description   : metadata.description,
                                      metadata_thumbnail_url : metadata.thumbnail_url,
                                      metadata_video_url     : metadata.video_url,
                                      metadata_locale        : metadata.locale,
                                      metadata_date          : metadata.type,
                                      metadata_request_url   : metadata.request_url,
                                      metadata_site_name     : metadata.site_name,
                                      metadata_charset       : metadata.charset,
                                      //metadata_ogs           : reply2Comment_metadata.ogs,
                                      //metadata_oembed        : reply2Comment_metadata.oembed
                                  }
                            }
                        }catch(e){
                          console.log("e:", e);
                        }

                        //console.log("m:" ,m , ", :metadata:", m )
                        _nfm.reply2Comment( _userid, pid,  comment_id, comment, { metadata: m,
                                                                                  success:function($data){
                                //console.log( "_nfm:reply2Comment:success:data:", $data );

                             $(elm).closest(".post-item-comment").find(".comment-wrapper").collapse("hide");
                             $(elm).val("");

                         var replies = $("#post-item-comment-tmpl").tmpl( $data ).addClass("reply-2-post-comment")
                             $(replies).find(".reply-btn-wrapper").remove()
                             $(replies).find(".reply-comments-wrapper").remove()

                             $("#comment-" +comment_id+ " .reply-comments-wrapper").prepend( replies );


                             $(window).delay(190).queue(function( nxt ) {
                                 $(window).trigger('resize');
                                 nxt();
                             });

                         }});

                         break;

                     default:
                         break;
                 }
             });

             $(document).on("click", ".post-item-tmpl .comments-actions .action-more", function(e){
                   console.log("show more comments()");
                   e.preventDefault();

                   var elm = $(e.target).closest('.post-item-tmpl')

                   var comments_elm = $(elm).find(".post-item-comments");


                   var total_comments_elm = $(comments_elm).find(".post-comment");

                   var pid = $(elm).find('input#pid').val();
                   var total_replies_2_video = $(elm).find('input#total_replies_2_post').val();
                   var offset = $(total_comments_elm).length;
                   var limit  = 10;

                   _nfm.getComments( _userid, pid, { offset : offset,
                                                    limit : limit,
                                                    success:function($data){
                                                         $("#post-item-comment-tmpl").tmpl( $data ).addClass("post-comment").appendTo( comments_elm );

                                                         var total_loaded_comments = $(comments_elm).find(".post-comment").length;

                                                         if( total_loaded_comments >= total_replies_2_video ){
                                                             $(elm).find(".action-more").hide();
                                                         }

                                                         $(window).delay(190).queue(function( nxt ) {
                                                             $(window).trigger('resize');
                                                             nxt();
                                                         });
                                                     }, error:function($e){
                                                         console.log("error:",$e)
                                                   }})
             })

/*
             $(document).on("click",".video-item-tmpl .edit-dropdown-menu a", function(e){
                     e.preventDefault();

                 var elm = $(e.target);
                 var action = elm.attr("href").split("#").join("");

                 var video_elm = $(elm).closest(".video-item-tmpl");
                 var vid = $(video_elm).find("input#vid").val();

                 switch( action )
                 {
                     case "action-edit-video-metadata":
                         //console.log("action-edit-video-metadata()")
                         showVideoMetadataModal(vid);
                         break;

                     case "action-delete-video":
                         //console.log("action-delete-video()")
                         $("#delete-video-modal").modal("show");
                         break;

                     default:
                         break;
                 }
             });
*/

             $(document).on("click",".post-item-tmpl  .edit-dropdown-menu a", function(e){
                     e.preventDefault();

                 var elm = $(e.target);
                 var action = elm.attr("href").split("#").join("");

                 var post_elm = elm.closest(".post-item-tmpl");
                 var pid      = post_elm.find("input#pid").val();
                 console.log("pid:", pid);
                 switch( action )
                 {
                     case "action-edit-post-metadata":
                         console.log("action-edit-post-metadata()");
                         showPostMetadataModal(pid);
                         break;

                     case "action-delete-post":
                         console.log("action-delete-post()");
                         showDeletePostModal(pid);
                         break;

                     case "action-edit-title":
                         console.log("action-edit-title()*")
                         var title_elm = elm.closest(".post-item-title")
                         var title = title_elm.find("a.post-item-title");

                         var text = title.html()
                             title.replaceWith(function(){
                                  return '<div id="edit-content-title"> \
                                              <textarea id="edit-title-'+pid+'" class="action-edit-title" rows="10" >' + text + '</textarea>  \
                                              <div id="actions-container" class="float-end" style="margin-bottom:10px;">   \
                                                <button id="cancel-btn" type="button" class="btn btn-primary">Cancel</button>    \
                                                <button id="save-btn" type="button" class="btn btn-primary">Save</button>    \
                                              </div>  \
                                          </div>';
                             })

                             $(window).trigger('resize');

                         break;

                      case "action-edit-description":
                          console.log("action-edit-description()")
                          var description_elm = elm.closest(".post-item-description")
                          var description = $(description_elm).find("pre");
                          var text = post_elm.find("input#description").val();

                              $(description).replaceWith(function(){
                                    return '<div id="edit-content-description"> \
                                              <textarea id="edit-description-'+pid+'" class="action-edit-description" rows="10" >' + text + '</textarea>  \
                                              <div id="actions-container" class="float-end" style="margin-bottom:10px;">   \
                                                <button id="cancel-btn" type="button" class="btn btn-primary">Cancel</button>    \
                                                <button id="save-btn" type="button" class="btn btn-primary">Save</button>    \
                                              </div>  \
                                            </div>';
                              })
                              $(window).trigger('resize');

                          break;


                     case "action-edit-post":
                          console.log("action-edit-post()")
                          var content_elm = $(elm).closest(".post-item-content")

                          var content = $(content_elm).find("pre");
                          //console.log( "content:", $(content).html() )
                          var text = $(content).html()
                          //console.log("text:", text)
                          $(content).replaceWith(function(){
                              return '<div id="edit-content-container"> \
                                          <textarea id="edit-content-'+pid+'" class="action-edit-post-content" rows="10" >' + text + '</textarea>  \
                                          <div id="actions-container" class="float-end" style="margin-bottom:10px;">   \
                                            <button id="cancel-btn" type="button" class="btn btn-primary">Cancel</button>    \
                                            <button id="save-btn" type="button" class="btn btn-primary">Save</button>    \
                                          </div>  \
                                      </div>';
                          })
                          $(window).trigger('resize');

                         break;

                     case "action-delete-comment":
                         var comment_elm = $(elm).closest(".post-item-comment")
                         var comment_id = $(comment_elm).find("input#comment_id").val();

                         _nfm.deleteComment( _userid, comment_id, { success:function( $data ){
     //                            console.log("debug::_nfm.deleteComment(_userid, comment_id:success:data:", $data)
                             var comment_total_elm = $(post_elm).find(".message-btn-wrapper").find(".count");
                             var total_comments = Number( $(comment_total_elm).html() ) - 1;
                                 $(comment_total_elm).html( total_comments );

                                 $(comment_elm).slideUp("fast", function(){
                                     $(this).remove();
                                      $(window).trigger('resize');
                                 } )
                         }} );
                         break;

                     case "action-edit-comment":

                           var comment_elm = $(elm).closest(".post-item-comment")
                           var comment_id = $(comment_elm).find("input#comment_id").val();
                           //console.log("action-edit-comment::comment_id:",comment_id);

                           var comment = $(comment_elm).find("#comment-container-"+comment_id+" pre");
                           //console.log( "comment:", $(comment).html() )
                           var text = $(comment).html()
                           $(comment).replaceWith(function(){
                                return '<div id="edit-comment-container"> \
                                            <textarea id="edit-comment-'+comment_id+'" class="action-edit-post-comment" rows="10" >' + text + '</textarea>  \
                                            <div id="actions-container" class="float-end" style="margin-bottom:10px;">   \
                                              <button id="cancel-btn" type="button" class="btn btn-primary">Cancel</button>    \
                                              <button id="save-btn" type="button" class="btn btn-primary">Save</button>    \
                                            </div>  \
                                        </div>';

                                //'<textarea id="edit-comment-'+comment_id+'" class="action-edit-comment" rows="10" >' + text + '</textarea>';
                           })
                           $(window).trigger('resize');
                       break;

                     default:
                         break;
                 }
             });


            //action-edit-title
            //action-edit-description
            //action-edit-post-content
            //action-edit-comment

            $(document).on('click', '.post-item-comment #edit-comment-container #actions-container #cancel-btn', function(e){
                console.log("NFM :: Cancel:Click()");
                var elm = $(e.target)
                var comment_elm = elm.closest(".post-item-comment")
                var comment_id  = comment_elm.find("input#comment_id").val()
                var pid         = comment_elm.find("input#pid").val()

                //console.log("pid:", pid ,"comment_id:", comment_id);
                _nfm.getComment( _userid, comment_id, { success:function($data){
                    //console.log("$data:",$data);
                    var comment = comment_elm.find("#edit-comment-container")
                    $(comment).replaceWith(function(){
                         return '<pre style="word-break: break-word;">'+$data.content+'</pre>'
                    })
                    //FIXME: reset card??  or rerender the comment???
                }})
            });

            $(document).on('click', '.post-item-comment #edit-comment-container #actions-container #save-btn', function(e){
                console.log("NFM :: Save:Click()");
                var elm = $(e.target)
                var comment_elm = elm.closest(".post-item-comment")
                var comment_id  = comment_elm.find("input#comment_id").val()
                var comment     = comment_elm.find("#edit-comment-"+comment_id).val()
                var pid         = comment_elm.find("input#pid").val()

                    //console.log("comment_id:", comment_id, ", comment:", comment );

                var metadata = {
                                  metadata_title           : comment_elm.find("input#title").val(),
                                  metadata_description     : comment_elm.find("input#description").val(),
                                  metadata_thumbnail_url   : comment_elm.find("input#thumbnail_url").val(),
                                  metadata_video_url       : comment_elm.find("input#metadata_video_url").val(),
                                  metadata_url             : comment_elm.find("input#metadata_url").val(),
                                  metadata_request_url     : comment_elm.find("input#metadata_request_url").val(),
                                  metadata_site_name       : comment_elm.find("input#metadata_site_name").val(),
                                  metadata_type            : comment_elm.find("input#metadata_type").val(),
                                  metadata_locale          : comment_elm.find("input#metadata_locale").val(),
                                  metadata_date            : comment_elm.find("input#metadata_date").val(),
                                  metadata_charset         : comment_elm.find("input#metadata_charset").val(),
                                  content                  : comment
                            };

                _nfm.updateComment( _userid, comment_id, comment, { metadata: metadata,
                                                                    success:function($data){
                    console.log("NFM :: $data:",$data);
                    comment_elm.find("input#content").val($data.comment)
                    comment_elm.find("input#title").val($data.title)
                    comment_elm.find("input#description").val($data.description)
                    comment_elm.find("input#thumbnail_url").val($data.thumbnail_url)
                    comment_elm.find("input#metadata_url").val($data.metadata_url)
                    comment_elm.find("input#metadata_video_url").val($data.metadata_video_url)
                    comment_elm.find("input#metadata_locale").val($data.metadata_locale)
                    comment_elm.find("input#metadata_date").val($data.metadata_date)
                    comment_elm.find("input#metadata_request_url").val($data.metadata_request_url)
                    comment_elm.find("input#metadata_site_name").val($data.metadata_site_name)
                    comment_elm.find("input#content").val($data.comment)

                    comment_elm.find("#edit-comment-"+comment_id).closest("#edit-comment-container").replaceWith(function(){
                         return '<pre style="word-break: break-word;">'+ $data.comment +'</pre>'
                    })
                }})
            });


            $(document).on('keyup','.post-item-comment #edit-comment-container textarea.action-edit-post-comment',function(e)
            {
                console.log("NFM :: keyup::textarea.action-edit-post-comment()");
                var elm = $(e.target).closest(".post-item-comment")
                var comment_id = elm.find("input#comment_id").val();
                var pid        = elm.find("input#pid").val();

                _nfm.findCardOnKeyEvent( e, {type:"post"},function($card, $metadata){
                    //    console.log("$metadata:", $metadata)

                        elm.find("input#title").val($metadata.title );
                        elm.find("input#description").val($metadata.description );
                        elm.find("input#thumbnail_url").val($metadata.thumbnail_url );
                        elm.find("input#metadata_video_url").val($metadata.video_url );
                        elm.find("input#metadata_url").val($metadata.url );
                        elm.find("input#metadata_request_url").val($metadata.request_url );
                        elm.find("input#metadata_site_name").val($metadata.site_name );
                        elm.find("input#metadata_type").val($metadata.type );
                        elm.find("input#metadata_locale").val($metadata.locale );
                        elm.find("input#metadata_date").val($metadata.date );
                        elm.find("input#metadata_charset").val($metadata.charset );

                    var thumb_elm = elm.find("#comment-card-" + comment_id + " .card img")
                        thumb_elm.attr("src", $metadata.thumbnail_url )

                    var title_elm = elm.find("#comment-card-"+comment_id+" .card .card-title")
                        title_elm.html($metadata.title);

                    var description = elm.find("#comment-card-"+comment_id+" .card .card-text")
                        description.html($metadata.description);

                        $(window).trigger('resize');
                })

            });

            //wire up the editing button/ui
            //$(document).on('click', '.post-item-description #actions-container #cancel-btn', function(e){
            $(document).on('click', '.post-item-description #actions-container #cancel-btn', function(e){
                //console.log("NFM :: Cancel:Click()");
                var elm = $(e.target).closest(".post-item-tmpl")
                var pid = elm.find("input#pid").val();

                    _nfm.getPost( _userid, pid, { success: function($data){
                         resetPostCardUI(elm, $data)
                    }})
            })


            //$(document).on('click', '.post-item-tmpl #edit-content-container #actions-container #save-btn', function(e){
            $(document).on('click', '#edit-content-container #actions-container #save-btn', function(e){
                //console.log("NFM :: Save.Click()");
                var elm = $(e.target).closest(".post-item-tmpl")
                var pid = elm.find("input#pid").val();

                var metadata = {
                                  metadata_title           : elm.find("input#title").val(),
                                  metadata_description     : elm.find("input#description").val(),
                                  metadata_thumbnail_url   : elm.find("input#thumbnail_url").val(),
                                  metadata_video_url       : elm.find("input#metadata_video_url").val(),
                                  metadata_url             : elm.find("input#metadata_url").val(),
                                  metadata_request_url     : elm.find("input#metadata_request_url").val(),
                                  metadata_site_name       : elm.find("input#metadata_site_name").val(),
                                  metadata_type            : elm.find("input#metadata_type").val(),
                                  metadata_locale          : elm.find("input#metadata_locale").val(),
                                  metadata_date            : elm.find("input#metadata_date").val(),
                                  metadata_charset         : elm.find("input#metadata_charset").val(),
                                  content                  : elm.find("textarea.action-edit-post-content").val()
                            };

                      //console.log("metadata.content:",metadata.content)
                     _nfm.savePostMetadata(_userid, pid, metadata, {success: function($data){
                          console.log("_nfm:savePostMetadata(data):",$data);
                          resetPostCardUI(elm, $data)
                     }});

            })

            //$(document).on('click', '.post-item-tmpl #edit-content-container #actions-container #cancel-btn', function(e){
            $(document).on('click', '#edit-content-container #actions-container #cancel-btn', function(e){
                console.log("NFM :: Cancel.Click()");
                var elm = $(e.target).closest(".post-item-tmpl")
                var pid = elm.find("input#pid").val();
                    //DEBUG:JOSH
                    _nfm.getPost( _userid, pid, { success: function($data){
                        console.log("getPost():success:data:",$data)
                         //resetPostCardUI(elm, $data)
                         elm.find("input#thumbnail_url").val($data.metadata_thumbnail_url );
                         elm.find("input#title").val($data.metadata_title );
                         elm.find("input#description").val($data.metadata_description );
                         //elm.find("input#metadata_title").val($data.metadata_title );
                         //elm.find("input#metadata_description").val($data.metadata_description );
                         elm.find("input#metadata_url").val($data.metadata_url );
                         elm.find("input#metadata_request_url").val($data.metadata_request_url );
                         elm.find("input#metadata_site_name").val($data.metadata_site_name );
                         elm.find("input#metadata_video_url").val($data.metadata_video_url );
                         elm.find("input#metadata_type").val($data.metadata_type );
                         elm.find("input#metadata_locale").val($data.metadata_locale );
                         elm.find("input#metadata_date").val($data.metadata_date );
                         elm.find("input#metadata_charset").val($data.metadata_charset );

                     var thumb_elm = elm.find(".post-item-thumbnail-container img.thumbnail-img")
                         thumb_elm.attr("src", $data.metadata_thumbnail_url )

                     var title_elm = elm.find(".post-item-title a.post-item-title")
                         title_elm.html($data.metadata_title);

                     var description = elm.find(".post-item-description pre")
                         description.html($data.metadata_description);



                         elm.find( "#edit-content-container" ).replaceWith(function(){
                            return "<pre style='word-break: break-word;'>" + $data.content + "</pre>"
                         })

                         $(window).trigger('resize');

                    }})
            })

            //post metadatatitle
            $(document).on("click", ".post-item-tmpl #edit-content-title #save-btn", function(e){
                    e.preventDefault();
                    var elm = $(e.target).closest(".post-item-tmpl")
                    var pid = elm.find("input#pid").val();

                    var title_elm = elm.find("#edit-content-title")
                    var text      = elm.find("textarea.action-edit-title").val();

                        _nfm.savePostMetadata(_userid, pid, { metadata_title : text }, {success: function($data){
                            $( title_elm ).replaceWith(function(){
                                 return "<a href='/p/mqqsOsXJJ' class='post-item-title'>"+$data.metadata_title+"</a>"
                            })
                        }});
            })

            $(document).on("click", ".post-item-tmpl #edit-content-title #cancel-btn", function(e){
                        e.preventDefault();
                    var elm = $(e.target).closest(".post-item-tmpl")
                    var title_elm = elm.find("#edit-content-title")
                    var text      = elm.find("input#title").val();

                        $( title_elm ).replaceWith(function(){
                             return "<a href='/p/mqqsOsXJJ' class='post-item-title'>"+text+"</a>"
                        })

            })


            //post metadata description
            $(document).on("click", ".post-item-tmpl #edit-content-description #save-btn", function(e){
                    e.preventDefault();
                    var elm = $(e.target).closest(".post-item-tmpl")
                    var pid = elm.find("input#pid").val();

                    var description_elm = elm.find("#edit-content-description")
                    var text            = elm.find("textarea.action-edit-description").val();

                    _nfm.savePostMetadata(_userid, pid, { metadata_description : text }, {success: function($data){

                        $( description_elm ).replaceWith(function(){
                             return "<pre style='word-break: break-word;'>" + $data.metadata_description + "</pre>"
                        })
                    }});
            })

            $(document).on("click", ".post-item-tmpl #edit-content-description #cancel-btn", function(e){
                        e.preventDefault();
                    var elm = $(e.target).closest(".post-item-tmpl")
                    var description_elm = elm.find("#edit-content-description")
                    var text      = elm.find("input#description").val();

                        $( description_elm ).replaceWith(function(){
                             return "<pre style='word-break: break-word;'>" + description + "</pre>"
                        })

            })

            $(document).on('keyup','.post-item-tmpl textarea.action-edit-post-content',function(e)
            {
                console.log("keyup::textarea.action-edit-post-content()");
                var elm = $(e.target).closest(".post-item-tmpl")
                var pid = elm.find("input#pid").val();
                console.log("pid:", pid);

                _nfm.findCardOnKeyEvent( e, {type:"post"},function($card, $metadata){
                        console.log("$metadata:", $metadata)

                        elm.find("input#thumbnail_url").val($metadata.thumbnail_url );
                        elm.find("input#title").val($metadata.title );
                        elm.find("input#description").val($metadata.description );
                        //elm.find("input#metadata_title").val($metadata.title );
                        //elm.find("input#metadata_description").val($metadata.description );
                        elm.find("input#metadata_url").val($metadata.url );
                        elm.find("input#metadata_request_url").val($metadata.request_url );
                        elm.find("input#metadata_site_name").val($metadata.site_name );
                        elm.find("input#metadata_video_url").val($metadata.video_url );
                        elm.find("input#metadata_type").val($metadata.type );
                        elm.find("input#metadata_locale").val($metadata.locale );
                        elm.find("input#metadata_date").val($metadata.date );
                        elm.find("input#metadata_charset").val($metadata.charset );

                    var thumb_elm = elm.find(".post-item-thumbnail-container img.thumbnail-img")
                        thumb_elm.attr("src", $metadata.thumbnail_url )

                    var title_elm = elm.find(".post-item-title a.post-item-title")
                        title_elm.html($metadata.title);

                    var description = elm.find(".post-item-description pre")
                        description.html($metadata.description);

                        $(window).trigger('resize');
                })

            });


             $(document).on('keyup','.post-item-tmpl .post-item-comment .comment-container textarea',function(e)
             {
                 var key                 = ( e.keyCode );
                 var elm                 = e.target;
                 var keyed               = $(elm).val();
                 var comment             = $(elm).val();

                 var comment_elm         = $(elm).closest('.post-item-comment');
                 var comment_id          = $(comment_elm).find("input#comment_id").val();

                 switch(String(key))
                 {
                     case "13":

                        _nfm.updateComment(  _userid, comment_id, comment, { success:function($data){

                           var comment = $(comment_elm).find("#edit-comment-"+comment_id)

                           $(comment).replaceWith(function(){
                                return '<pre>' + $data.comment + '</pre>';
                           })

                           $(window).trigger('resize');

                         }});

                         break;

                     default:
                         break;
                 }
             });

//////////////////////thumbnail dropdown////////////////////

             $(document).on("mouseover",".post-item-tmpl .post-item-thumbnail-container .icon-white-edit", function(e){
                     e.preventDefault();
                 var elm =  $( e.target ).closest(".post-item-thumbnail-container");
                 var target_y = $(e.target).position().top + 28;
                 var menu = elm.find(".edit-dropdown-menu");
                     menu.css({top : target_y });
                     menu.show();
                     menu.addClass("is-open");

                     resizeSearchResults();
             }).mouseout(function(e){
                 var elm =  $( e.target ).closest(".post-item-thumbnail-container");
                 var menu = $(elm).find(".edit-dropdown-menu")
                     if( menu.hasClass("is-open") )
                     {
                         menu.removeClass("is-open");
                         menu.hide();
                     }
             });

             $(document).on("mouseover",".post-item-tmpl .post-item-thumbnail-container .edit-dropdown-menu", function(e){
                     e.preventDefault();
                 var elm =  $( e.target ).closest(".post-item-thumbnail-container");
                     elm.find(".edit-dropdown-menu").show();
             }).mouseout(function(e){
                     e.preventDefault();
                 var elm =  $( e.target ).closest(".post-item-thumbnail-container");
                 var menu = $(elm).find(".edit-dropdown-menu");
                     menu.removeClass("is-open");
                     menu.hide();
             });

//////////////////////title dropdown////////////////////


              $(document).on("mouseover",".post-item-tmpl .post-item-title .icon-edit", function(e){
                      e.preventDefault();
                      var elm  = $( e.target ).closest(".post-item-tmpl");
                      var pid  = $( elm ).find("input#pid").val();
                      var menu = elm.find("#post-title-edit-dropdown-menu-" + pid )
                      var target_y = $(e.target).position().top + 28;

                      menu.css({top : target_y });
                      menu.show();
                      menu.addClass("is-open");

              }).mouseout(function(e){
                  var elm  = $( e.target ).closest(".post-item-tmpl");
                  var pid  = $( elm ).find("input#pid").val();
                  var menu = elm.find("#post-title-edit-dropdown-menu-" + pid )
                      menu.removeClass("is-open");
                      menu.hide();
              });


              $(document).on("mouseover",".post-item-tmpl .post-item-title .edit-dropdown-menu", function(e){
                      e.preventDefault();
                  //var elm =  $( e.target ).closest(".post-item-title");
                  var elm  = $( e.target ).closest(".post-item-tmpl");
                  var pid  = $( elm ).find("input#pid").val();
                  var menu = elm.find("#post-title-edit-dropdown-menu-" + pid )
                      menu.show()
                      //elm.find(".edit-dropdown-menu").show();
              }).mouseout(function(e){
                      e.preventDefault();
                  var elm  = $( e.target ).closest(".post-item-tmpl");
                  var pid  = $( elm ).find("input#pid").val();
                  var menu = elm.find("#post-title-edit-dropdown-menu-" + pid )
                      menu.removeClass("is-open");
                      menu.hide();
              });

//////////////////////content dropdown////////////////////

              $(document).on("mouseover",".post-item-tmpl .post-item-content .icon-edit", function(e){
                      e.preventDefault();

                      var elm  = $( e.target ).closest(".post-item-tmpl");
                      var pid  = $( elm ).find("input#pid").val();
                      var menu = elm.find("#post-content-edit-dropdown-menu-" + pid )
                      var target_y = $(e.target).position().top + 28;

                          menu.css({top : target_y });
                          menu.show();
                          menu.addClass("is-open");

              }).mouseout(function(e){
                      var elm  = $( e.target ).closest(".post-item-tmpl");
                      var pid  = $( elm ).find("input#pid").val();
                      var menu = elm.find("#post-content-edit-dropdown-menu-" + pid )
                          menu.removeClass("is-open");
                          menu.hide();
              });


              $(document).on("mouseover",".post-item-tmpl .post-item-content .edit-dropdown-menu", function(e){
                      e.preventDefault();
                  //var elm =  $( e.target ).closest(".post-item-title");
                  var elm  = $( e.target ).closest(".post-item-tmpl");
                  var pid  = $( elm ).find("input#pid").val();
                  var menu = elm.find("#post-content-edit-dropdown-menu-" + pid )
                      menu.show()
                      //elm.find(".edit-dropdown-menu").show();
              }).mouseout(function(e){
                      e.preventDefault();
                  var elm  = $( e.target ).closest(".post-item-tmpl");
                  var pid  = $( elm ).find("input#pid").val();
                  var menu = elm.find("#post-title-edit-dropdown-menu-" + pid )
                      menu.removeClass("is-open");
                      menu.hide();
              });

//////////////////////description dropdown////////////////////

              $(document).on("mouseover",".post-item-tmpl .post-item-description .icon-edit", function(e){
                      e.preventDefault();
                      var elm  = $( e.target ).closest(".post-item-tmpl");
                      var pid  = $( elm ).find("input#pid").val();
                      var menu = elm.find("#post-description-edit-dropdown-menu-" + pid )
                      var target_y = $(e.target).position().top + 28;

                          menu.css({top : target_y });
                          menu.show();
                          menu.addClass("is-open");

              }).mouseout(function(e){
                  var elm  = $( e.target ).closest(".post-item-tmpl");
                  var pid  = $( elm ).find("input#pid").val();
                  var menu = elm.find("#post-description-edit-dropdown-menu-" + pid )
                      menu.removeClass("is-open");
                      menu.hide();
              });


              $(document).on("mouseover",".post-item-tmpl .post-item-description .edit-dropdown-menu", function(e){
                      e.preventDefault();
                  //var elm =  $( e.target ).closest(".post-item-title");
                  var elm  = $( e.target ).closest(".post-item-tmpl");
                  var pid  = $( elm ).find("input#pid").val();
                  var menu = elm.find("#post-description-edit-dropdown-menu-" + pid )
                      menu.show()
                      //elm.find(".edit-dropdown-menu").show();
              }).mouseout(function(e){
                      e.preventDefault();
                  var elm  = $( e.target ).closest(".post-item-tmpl");
                  var pid  = $( elm ).find("input#pid").val();
                  var menu = elm.find("#post-description-edit-dropdown-menu-" + pid )
                      menu.removeClass("is-open");
                      menu.hide();
              });
///////////////////////////////////comment///////////////////////////////////


             $(document).on("mouseover",".post-item-tmpl .post-item-comment-text .icon-edit", function(e){
                     e.preventDefault();
                 var elm         =  $( e.target ).closest(".post-item-comment");
                 var comment_id  = elm.find("input#comment_id").val() ;
                 var menu        = elm.find("#edit-dropdown-menu-"+comment_id )

                 var target_y    = $(e.target).position().top + 28;
                     menu.css({top : target_y });
                     menu.show();
                     menu.addClass("is-open");

             }).mouseout(function(e){
                 var elm   =  $( e.target ).closest(".post-item-comment");
                 var menu  = $(elm).find(".edit-dropdown-menu")
                 if( menu.hasClass("is-open") )
                 {
                     menu.removeClass("is-open");
                     menu.hide();
                 }
             });


             $(document).on("mouseover",".post-item-tmpl .post-item-comment .post-item-comment-text .edit-dropdown-menu", function(e){
     //                console.log("debug:mouseover::post-item-tmpl .post-item-comment .edit-dropdown-menu()");
                     e.preventDefault();
                 var elm =  $( e.target ).closest(".post-item-comment");
                 var comment_id = elm.find("input#comment_id").val() ;
                 var menu = elm.find("#edit-dropdown-menu-"+comment_id )
                     menu.show();
             }).mouseout(function(e){
                     e.preventDefault();
                 var elm         =  $( e.target ).closest(".post-item-comment");
                 var comment_id  = elm.find("input#comment_id").val() ;
                 var menu        = elm.find("#edit-dropdown-menu-" + comment_id )
                     menu.removeClass("is-open");
                     menu.hide();
             });
///////////////////////////////////comment///////////////////////////////////


             $(document).on("click","#delete-post-modal-cancel-btn", function(e){
     //            console.log("#delete-post-modal-cancel-btn()")
                 var elm = $(e.target).closest('.modal')
                     $(elm).find('input#pid').val('');
                     $("#edit-post-metadata-modal").modal("hide");
             })


             $(document).on("click","#delete-post-modal-submit-btn", function(e){
                 console.log("#delete-post-modal-submit-btn()")

                 var elm = $(e.target).closest('.modal')
                 var pid = $(elm).find('input#pid').val();

                 _nfm.deletePost( _userid, pid, { success:function($data){
                     //console.log("_nfm.deletePost():success():data:", $data);
                     _nfposts_elm.find("#post-" + pid ).remove()
                     //$("#search-results #post-" + pid ).remove()
                     $(window).trigger('resize');
                 }, error:function($e){
                     //console.log("_nfm.deletePost():error():e:", $e);
                 }})
             })


  /*
             $(document).on("click",".post-item-tmpl .post-item-thumbnail-container img", function(e){
                 console.log("post-item-thumbnail-container()");
                 e.preventDefault();
                 var elm = $(e.target).closest(".post-item-tmpl") ;
                 var metadata = {
                                   pid : $(elm).find("input#pid").val() ,
                                   title : $(elm).find("input#title").val() ,
                                   description : $(elm).find("input#description").val() ,
                                   thumbnail_url : $(elm).find("input#thumbnail_url").val() ,
                                   metadata_url : $(elm).find("input#metadata_url").val() ,
                                   metadata_video_url : $(elm).find("input#metadata_video_url").val() ,
                                   metadata_request_url : $(elm).find("input#metadata_request_url").val() ,
                                   metadata_date : $(elm).find("input#metadata_date").val() ,
                                   metadata_site_name : $(elm).find("input#metadata_site_name").val() ,
                                   metadata_locale : $(elm).find("input#metadata_locale").val() ,
                                   content : $(elm).find("input#content").val()
                               }

                 showPostModal(metadata)
             });
*/
             $(document).on("click","#view-post-modal #view-post-modal-close-btn", function(e){
                 //e.preventDefault();
                 $("#view-post-modal").find("iframe").attr("src", '')
             });


         }

         function initVideoTemplates()
         {
             console.log("$.newsfeed::initVideoTemplates()");

             $(document).on("click",".video-item-tmpl .message-btn-wrapper", function(e){
                 //console.log( "message-btn-wrapper:click:", e.target.closest(".video-item-tmpl") );
                 $(window).delay(190).queue(function( nxt ) {
                     $(window).trigger('resize');
                     nxt();
                 });
             });

             $(document).on("click",".video-item-tmpl .edit-dropdown-menu a", function(e){
                     e.preventDefault();

                 var elm = $(e.target);
                 var action = elm.attr("href").split("#").join("");

                 var video_elm = $(elm).closest(".video-item-tmpl");
                 var vid = $(video_elm).find("input#vid").val();

                 switch( action )
                 {

                     case "action-edit-title":
                          console.log("action-edit-title()")
                          var title_elm = elm.closest(".video-item-title")
                          var title = title_elm.find("a.video-item-title");

                          var text = title.html()
                              title.replaceWith(function(){
                                   return '<div id="edit-content-title"> \
                                               <textarea id="edit-title-'+vid+'" class="action-edit-title" rows="10" >' + text + '</textarea>  \
                                               <div id="actions-container" class="float-end" style="margin-bottom:10px;">   \
                                                 <button id="cancel-btn" type="button" class="btn btn-primary">Cancel</button>    \
                                                 <button id="save-btn" type="button" class="btn btn-primary">Save</button>    \
                                               </div>  \
                                           </div>';
                              })

                              $(window).trigger('resize');
                          break;
                     case "action-edit-description":
                         console.log("action-edit-description()")
                         var description_elm = elm.closest(".video-item-description")
                         var description = $(description_elm).find("pre");
                         var text = video_elm.find("input#description").val();

                             $(description).replaceWith(function(){
                                   return '<div id="edit-content-description"> \
                                             <textarea id="edit-description-'+vid+'" class="action-edit-description" rows="10" >' + text + '</textarea>  \
                                             <div id="actions-container" class="float-end" style="margin-bottom:10px;">   \
                                               <button id="cancel-btn" type="button" class="btn btn-primary">Cancel</button>    \
                                               <button id="save-btn" type="button" class="btn btn-primary">Save</button>    \
                                             </div>  \
                                           </div>';
                             })
                             $(window).trigger('resize');
                         break;
                     case "action-edit-video-metadata":
                         //console.log("action-edit-video-metadata()")
                         showVideoMetadataModal(vid);
                         break;

                     case "action-delete-video":
                         //console.log("action-delete-video()")
                         $("#delete-video-modal").modal("show");
                         break;

                     case "action-delete-comment":
                         var comment_elm = $(elm).closest(".video-item-comment")
                         var comment_id = $(comment_elm).find("input#comment_id").val();

                         _vm.deleteComment(_userid, comment_id, { success:function($data){
                             var comment_total_elm = $(video_elm).find(".message-btn-wrapper").find(".count");
                             var total_comments = Number( $(comment_total_elm).html() ) - 1;
                                 $(comment_total_elm).html( total_comments );

                                 $(comment_elm).slideUp("fast", function(){
                                     $(this).remove();
                                      $(window).trigger('resize');
                                 } )
                         }} );
                         break;

                     case "action-edit-comment":

                       var comment_elm = $(elm).closest(".video-item-comment")
                       var comment_id = $(comment_elm).find("input#comment_id").val();
                       //console.log("action-edit-comment::comment_id:",comment_id);

                           var comment = $(comment_elm).find(".comment-container pre");
                           //console.log( "comment:", $(comment).html() )
                           var text = $(comment).html()
                           $(comment).replaceWith(function(){

                             return '<div id="edit-comment-container"> \
                                         <textarea id="edit-comment-'+comment_id+'" class="action-edit-post-comment" rows="10" >' + text + '</textarea>  \
                                         <div id="actions-container" class="float-end" style="margin-bottom:10px;">   \
                                           <button id="cancel-btn" type="button" class="btn btn-primary">Cancel</button>    \
                                           <button id="save-btn" type="button" class="btn btn-primary">Save</button>    \
                                         </div>  \
                                     </div>';
                           })
                           $(window).trigger('resize');
                       break;

                     default:
                         break;
                 }
             });


             //post metadatatitle
             $(document).on("click", ".video-item-tmpl #edit-content-title #save-btn", function(e){
                     e.preventDefault();
                     var elm = $(e.target).closest(".video-item-tmpl")
                     var vid = elm.find("input#vid").val();

                     var title_elm = elm.find("#edit-content-title")
                     var text      = elm.find("textarea.action-edit-title").val();

                         _vm.saveVideoMetadata(_userid, vid, { title : text }, {success: function($data){
                              console.log($data)
                             $( title_elm ).replaceWith(function(){
                                  return "<a href='/w/'"+vid+" class='video-item-title'>"+$data.title+"</a>"
                             })
                         }});
             })

             $(document).on("click", ".video-item-tmpl #edit-content-title #cancel-btn", function(e){
                         e.preventDefault();
                        // console.log("cancel-btn.click()");
                     var elm       = $(e.target).closest(".video-item-tmpl")
                     var title_elm = elm.find("#edit-content-title")
                     var text      = elm.find("input#title").val();
                     console.log("text:",text);
                     console.log("title_elm:",title_elm)
                         $( title_elm ).replaceWith(function(){
                              return "<a href='/w/'"+vid+" class='video-item-title'>"+text+"</a>"
                         })

             })


             //post metadata description
             $(document).on("click", ".video-item-tmpl #edit-content-description #save-btn", function(e){
                     e.preventDefault();
                     var elm = $(e.target).closest(".video-item-tmpl")
                     var vid = elm.find("input#vid").val();

                     var description_elm = elm.find("#edit-content-description")
                     var text            = elm.find("textarea.action-edit-description").val();

                     _vm.saveVideoMetadata(_userid, vid, { description : text }, {success: function($data){

                         $( description_elm ).replaceWith(function(){
                              return "<pre style='word-break: break-word;'>" + $data.description + "</pre>"
                         })
                     }});
             })

             $(document).on("click", ".video-item-tmpl #edit-content-description #cancel-btn", function(e){
                         e.preventDefault();
                     var elm = $(e.target).closest(".video-item-tmpl")
                     var description_elm = elm.find("#edit-content-description")
                     var text      = elm.find("input#description").val();

                         $( description_elm ).replaceWith(function(){
                              return "<pre style='word-break: break-word;'>" + text + "</pre>"
                         })

             })


             $(document).on('click', '.video-item-comment #edit-comment-container #actions-container #cancel-btn', function(e){
                 console.log("VM :: Cancel:Click()");
                 var elm = $(e.target)
                 var comment_elm = elm.closest(".video-item-comment")
                 var comment_id  = comment_elm.find("input#comment_id").val()
                 var vid         = comment_elm.find("input#vid").val()

                 //console.log("vid:", vid ,"comment_id:", comment_id);
                 _vm.getComment( _userid, comment_id, { success:function($data){
                     //console.log("$data:",$data);
                     var comment = comment_elm.find("#edit-comment-container")
                     $(comment).replaceWith(function(){
                          return '<pre style="word-break: break-word;">'+$data.content+'</pre>'
                     })

                 }})
             });

             $(document).on('click', '.video-item-comment #edit-comment-container #actions-container #save-btn', function(e){
                 console.log("VM :: Save:Click()");
                 var elm = $(e.target)
                 var comment_elm = elm.closest(".video-item-comment")
                 var comment_id  = comment_elm.find("input#comment_id").val()
                 var comment     = comment_elm.find("#edit-comment-"+comment_id).val()
                 var vid         = comment_elm.find("input#vid").val()

                     //console.log("comment_id:", comment_id, ", comment:", comment );

                 var metadata = {
                                   metadata_title           : comment_elm.find("input#title").val(),
                                   metadata_description     : comment_elm.find("input#description").val(),
                                   metadata_thumbnail_url   : comment_elm.find("input#thumbnail_url").val(),
                                   metadata_video_url       : comment_elm.find("input#metadata_video_url").val(),
                                   metadata_url             : comment_elm.find("input#metadata_url").val(),
                                   metadata_request_url     : comment_elm.find("input#metadata_request_url").val(),
                                   metadata_site_name       : comment_elm.find("input#metadata_site_name").val(),
                                   metadata_type            : comment_elm.find("input#metadata_type").val(),
                                   metadata_locale          : comment_elm.find("input#metadata_locale").val(),
                                   metadata_date            : comment_elm.find("input#metadata_date").val(),
                                   metadata_charset         : comment_elm.find("input#metadata_charset").val(),
                                   content                  : comment
                             };

                 _vm.updateComment( _userid, comment_id, comment, { metadata: metadata,
                                                                    success:function($data){
                     console.log("VM :: $data:",$data);
                     comment_elm.find("input#content").val($data.comment)
                     comment_elm.find("input#title").val($data.title)
                     comment_elm.find("input#description").val($data.description)
                     comment_elm.find("input#thumbnail_url").val($data.thumbnail_url)
                     comment_elm.find("input#metadata_url").val($data.metadata_url)
                     comment_elm.find("input#metadata_video_url").val($data.metadata_video_url)
                     comment_elm.find("input#metadata_locale").val($data.metadata_locale)
                     comment_elm.find("input#metadata_date").val($data.metadata_date)
                     comment_elm.find("input#metadata_request_url").val($data.metadata_request_url)
                     comment_elm.find("input#metadata_site_name").val($data.metadata_site_name)
                     comment_elm.find("input#content").val($data.comment)

                     comment_elm.find("#edit-comment-"+comment_id).closest("#edit-comment-container").replaceWith(function(){
                          return '<pre style="word-break: break-word;">'+ $data.comment +'</pre>'
                     })
                 }})
             });


             $(document).on('keyup','.video-item-comment #edit-comment-container textarea.action-edit-post-comment',function(e)
             {
                 console.log("VM :: keyup::textarea.action-edit-video-comment()");
                 var elm = $(e.target).closest(".video-item-comment")
                 var comment_id = elm.find("input#comment_id").val();
                 var vid        = elm.find("input#vid").val();

                 _nfm.findCardOnKeyEvent( e, {type:"post"},function($card, $metadata){
                         console.log("$metadata:", $metadata)

                         elm.find("input#title").val($metadata.title );
                         elm.find("input#description").val($metadata.description );
                         elm.find("input#thumbnail_url").val($metadata.thumbnail_url );
                         elm.find("input#metadata_video_url").val($metadata.video_url );
                         elm.find("input#metadata_url").val($metadata.url );
                         elm.find("input#metadata_request_url").val($metadata.request_url );
                         elm.find("input#metadata_site_name").val($metadata.site_name );
                         elm.find("input#metadata_type").val($metadata.type );
                         elm.find("input#metadata_locale").val($metadata.locale );
                         elm.find("input#metadata_date").val($metadata.date );
                         elm.find("input#metadata_charset").val($metadata.charset );

                     var thumb_elm = elm.find("#comment-card-" + comment_id + " .card img")
                         thumb_elm.attr("src", $metadata.thumbnail_url )

                     var title_elm = elm.find("#comment-card-"+comment_id+" .card .card-title")
                         title_elm.html($metadata.title);

                     var description = elm.find("#comment-card-"+comment_id+" .card .card-text")
                         description.html($metadata.description);

                         $(window).trigger('resize');
                 })

             });


            //editing comments

            $(document).on('click', '.video-item-comment #edit-comment-container #actions-container #cancel-btn', function(e){
                console.log("VM :: Cancel-BTN:Click()::video-item-comment :: edit-comment");

                var elm         = $(e.target)
                var comment_elm = elm.closest(".video-item-comment")
                var comment_id  = comment_elm.find("input#comment_id").val()
                var vid         = comment_elm.find("input#vid").val()

                console.log("vid:", vid ,"comment_id:", comment_id);

                _vm.getComment( _userid, comment_id, { success:function($data){

                    var comment = comment_elm.find("#edit-comment-container")
                    $(comment).replaceWith(function(){
                         return '<pre style="word-break: break-word;">'+$data.content+'</pre>'
                    })

                }})

            });

            $(document).on('click', '.video-item-comment #edit-comment-container #actions-container #save-btn', function(e){
                console.log("VM :: Save:Click()");
                var elm = $(e.target)
                var comment_elm = elm.closest(".video-item-comment")
                var comment_id  = comment_elm.find("input#comment_id").val()
                var comment     = comment_elm.find("#edit-comment-"+comment_id).val()
                var vid         = comment_elm.find("input#vid").val()

                    console.log("VM :: comment_id:", comment_id, ", comment:", comment );

                var metadata = {
                                  metadata_title           : comment_elm.find("input#title").val(),
                                  metadata_description     : comment_elm.find("input#description").val(),
                                  metadata_thumbnail_url   : comment_elm.find("input#thumbnail_url").val(),
                                  metadata_video_url       : comment_elm.find("input#metadata_video_url").val(),
                                  metadata_url             : comment_elm.find("input#metadata_url").val(),
                                  metadata_request_url     : comment_elm.find("input#metadata_request_url").val(),
                                  metadata_site_name       : comment_elm.find("input#metadata_site_name").val(),
                                  metadata_type            : comment_elm.find("input#metadata_type").val(),
                                  metadata_locale          : comment_elm.find("input#metadata_locale").val(),
                                  metadata_date            : comment_elm.find("input#metadata_date").val(),
                                  metadata_charset         : comment_elm.find("input#metadata_charset").val(),
                                  content                  : comment
                            };

                _vm.updateComment( _userid, comment_id, comment, { metadata: metadata,
                                                                    success:function($data){
                    console.log("VM :: $data:",$data);
                    comment_elm.find("input#content").val($data.comment)
                    comment_elm.find("input#title").val($data.title)
                    comment_elm.find("input#description").val($data.description)
                    comment_elm.find("input#thumbnail_url").val($data.thumbnail_url)
                    comment_elm.find("input#metadata_url").val($data.metadata_url)
                    comment_elm.find("input#metadata_video_url").val($data.metadata_video_url)
                    comment_elm.find("input#metadata_locale").val($data.metadata_locale)
                    comment_elm.find("input#metadata_date").val($data.metadata_date)
                    comment_elm.find("input#metadata_request_url").val($data.metadata_request_url)
                    comment_elm.find("input#metadata_site_name").val($data.metadata_site_name)
                    comment_elm.find("input#content").val($data.comment)

                    comment_elm.find("#edit-comment-"+comment_id).closest("#edit-comment-container").replaceWith(function(){
                         return '<pre style="word-break: break-word;">'+ $data.comment +'</pre>'
                    })
                }})
            });


            $(document).on('keyup','.video-item-comment #edit-comment-container textarea.action-edit-post-comment',function(e)
            {
                console.log("keyup::textarea.action-edit-post-comment()");
                var elm = $(e.target).closest(".video-item-comment")
                var comment_id = elm.find("input#comment_id").val();
                var vid        = elm.find("input#vid").val();

                _nfm.findCardOnKeyEvent( e, {type:"post"},function($card, $metadata){
                        console.log("$metadata:", $metadata)

                        elm.find("input#title").val($metadata.title );
                        elm.find("input#description").val($metadata.description );
                        elm.find("input#thumbnail_url").val($metadata.thumbnail_url );
                        elm.find("input#metadata_video_url").val($metadata.video_url );
                        elm.find("input#metadata_url").val($metadata.url );
                        elm.find("input#metadata_request_url").val($metadata.request_url );
                        elm.find("input#metadata_site_name").val($metadata.site_name );
                        elm.find("input#metadata_type").val($metadata.type );
                        elm.find("input#metadata_locale").val($metadata.locale );
                        elm.find("input#metadata_date").val($metadata.date );
                        elm.find("input#metadata_charset").val($metadata.charset );

                    var thumb_elm = elm.find("#comment-card-" + comment_id + " .card img")
                        thumb_elm.attr("src", $metadata.thumbnail_url )

                    var title_elm = elm.find("#comment-card-"+comment_id+" .card .card-title")
                        title_elm.html($metadata.title);

                    var description = elm.find("#comment-card-"+comment_id+" .card .card-text")
                        description.html($metadata.description);

                        $(window).trigger('resize');
                })

            });


            ///

             $(document).on('keyup','.video-item-tmpl .video-item-comment .comment-container textarea',function(e)
             {
                 var key                 = ( e.keyCode );
                 var elm                 = e.target;
                 var keyed               = $(elm).val();
                 var comment             = $(elm).val();

                 var comment_elm         = $(elm).closest('.video-item-comment');
                 var comment_id          = $(comment_elm).find("input#comment_id").val();

                 switch(String(key))
                 {
                     case "13":


                        _vm.updateComment(  _userid, comment_id, comment, { success:function($data){

                           var comment = $(comment_elm).find("#edit-comment-"+comment_id)

                           $(comment).replaceWith(function(){
                                return '<pre>' + $data.comment + '</pre>';
                           })

                           $(window).trigger('resize');

                         }});

                         break;

                     default:
                         break;
                 }
             });

             //wireup the video settings icon
             $(document).on("mouseover",".video-item-tmpl .video-item-thumbnail-container .icon-white-edit", function(e){
         //                console.log(".icon-white-edit .mouseover:");
                     e.preventDefault();
                 var elm =  $( e.target ).closest(".video-item-thumbnail-container");
                 var target_y = $(e.target).position().top + 28;
                 var menu = elm.find(".edit-dropdown-menu");
                     menu.css({top : target_y });

                     menu.show();
                     menu.addClass("is-open");
             }).mouseout(function(e){
                 var elm =  $( e.target ).closest(".video-item-thumbnail-container");
                 var menu = $(elm).find(".edit-dropdown-menu")
                     if( menu.hasClass("is-open") )
                     {
                         menu.removeClass("is-open");
                         menu.hide();
                     }
             });

             $(document).on("mouseover",".video-item-tmpl .video-item-thumbnail-container .edit-dropdown-menu", function(e){
                     e.preventDefault();
                 var elm =  $( e.target ).closest(".video-item-thumbnail-container");
                     elm.find(".edit-dropdown-menu").show();
             }).mouseout(function(e){
                     e.preventDefault();
                 var elm =  $( e.target ).closest(".video-item-thumbnail-container");
                 var menu = elm.find(".edit-dropdown-menu");
                     menu.removeClass("is-open");
                     menu.hide();
             });


             $(document).on("mouseover",".video-item-tmpl .video-item-title .icon-edit", function(e){
                         console.log(".icon-edit .mouseover:");
                     e.preventDefault();
                 var elm =  $( e.target ).closest(".video-item-title");
                 var target_y = $(e.target).position().top + 28;
                 var menu = elm.find(".edit-dropdown-menu");
                     menu.css({top : target_y });

                     menu.show();
                     menu.addClass("is-open");
             }).mouseout(function(e){
                 var elm =  $( e.target ).closest(".video-item-title");
                 var menu = $(elm).find(".edit-dropdown-menu")
                     if( menu.hasClass("is-open") )
                     {
                         menu.removeClass("is-open");
                         menu.hide();
                     }
             });


             $(document).on("mouseover",".video-item-tmpl .video-item-title .edit-dropdown-menu", function(e){
                    //console.log(".video-item-title .edit-dropdown-menu()");
                     e.preventDefault();
                 var elm =  $( e.target ).closest(".video-item-title");
                     elm.find(".edit-dropdown-menu").show();
             }).mouseout(function(e){
                     e.preventDefault();
                 var elm =  $( e.target ).closest(".video-item-title");
                 var menu = elm.find(".edit-dropdown-menu");
                     menu.removeClass("is-open");
                     menu.hide();
             });


             $(document).on("mouseover",".video-item-tmpl .video-item-description .icon-edit", function(e){
                         //console.log(".icon-edit .mouseover:");
                     e.preventDefault();
                 var elm =  $( e.target ).closest(".video-item-description");
                 var target_y = $(e.target).position().top + 28;
                 var menu = elm.find(".edit-dropdown-menu");
                     menu.css({top : target_y });

                     menu.show();
                     menu.addClass("is-open");
             }).mouseout(function(e){
                 var elm =  $( e.target ).closest(".video-item-description");
                 var menu = $(elm).find(".edit-dropdown-menu")
                     if( menu.hasClass("is-open") )
                     {
                         menu.removeClass("is-open");
                         menu.hide();
                     }
             });


             $(document).on("mouseover",".video-item-tmpl .video-item-description .edit-dropdown-menu", function(e){
                    //console.log(".video-item-title .edit-dropdown-menu()");
                     e.preventDefault();
                 var elm =  $( e.target ).closest(".video-item-description");
                     elm.find(".edit-dropdown-menu").show();
             }).mouseout(function(e){
                     e.preventDefault();
                 var elm =  $( e.target ).closest(".video-item-description");
                 var menu = elm.find(".edit-dropdown-menu");
                     menu.removeClass("is-open");
                     menu.hide();
             });

             ///comments
             $(document).on("mouseover",".video-item-tmpl .video-item-comment-text .icon-edit", function(e){
                     //console.log("icon-edit:mouseover:e:",e);
                     e.preventDefault();
                 var elm =  $( e.target ).closest(".video-item-comment");
                 var comment_id = elm.find("input#comment_id").val();
                 var menu = elm.find("#edit-dropdown-menu-" + comment_id )
                 var target_y = $(e.target).position().top + 28;
                     menu.css({top : target_y });
                     menu.show();
                     menu.addClass("is-open");

             }).mouseout(function(e){
                 var elm =  $( e.target ).closest(".video-item-comment");
                 var comment_id = elm.find("input#comment_id").val();
                 var menu = elm.find("#edit-dropdown-menu-"+comment_id)
                 if( menu.hasClass("is-open") )
                 {
                     menu.removeClass("is-open");
                     menu.hide();
                 }
             });

             $(document).on("mouseover",".video-item-tmpl .video-item-comment .video-item-comment-text .edit-dropdown-menu", function(e){
                     e.preventDefault();
                 var elm =  $( e.target ).closest(".video-item-comment");
                 var comment_id = elm.find("input#comment_id").val()
                 var menu = $("#edit-dropdown-menu-"+comment_id)
                     menu.show();
             }).mouseout(function(e){
                     e.preventDefault();
                 var elm =  $( e.target ).closest(".video-item-comment");
                 var comment_id = elm.find("input#comment_id").val()
                 var menu = $("#edit-dropdown-menu-"+comment_id)
                 //var menu = $(elm).find(".edit-dropdown-menu");
                     menu.removeClass("is-open");
                     menu.hide();
             });

             $(document).on("click",".video-item-tmpl .video-item-comment .reply-btn-wrapper", function(e){
                     console.log("reply-btn-wrapper.click()")
                     e.preventDefault();
                 var offset = 0;
                 var limit  = 10;
                 var elm = $(e.target).closest(".video-item-comment");
                 var comment_id = $(e.target).closest(".video-item-comment").find("#comment_id").val()

                 $(window).delay(190).queue(function( nxt ) {
                     $(window).trigger('resize');
                     nxt();
                 });

             });

             $(document).on("click", ".video-item-tmpl .comments-actions .action-more", function(e){
                   console.log("show more comments()");
                   e.preventDefault();

                   var elm = $(e.target).closest('.video-item-tmpl')
                   var comments_elm = $(elm).find(".video-item-comments");


                   var total_comments_elm = $(comments_elm).find(".video-comment");

                   var vid = $(elm).find('input#vid').val();
                   var total_replies_2_video = $(elm).find('input#total_replies_2_video').val();
                   var offset = $(total_comments_elm).length;
                   var limit  = 10;

                   _vm.getComments( _userid, vid, { offset : offset,
                                                    limit : limit,
                                                    success:function($data){
                                                         $("#video-item-comment-tmpl").tmpl( $data ).addClass("video-comment").appendTo( comments_elm );

                                                         var total_loaded_comments = $(comments_elm).find(".video-comment").length;

                                                         if( total_loaded_comments >= total_replies_2_video ){
                                                             $(elm).find(".action-more").hide();
                                                         }

                                                         $(window).delay(190).queue(function( nxt ) {
                                                             $(window).trigger('resize');
                                                             nxt();
                                                         });
                                                     }, error:function($e){
                                                         console.log("error:",$e)
                                                   }})
             })

             //video
             $(document).on("click", ".video-item-tmpl .video-item-actions .likes-btn-wrapper", function(e){
                 console.log("likes-btn-wrapper()e:,",e);
                 e.preventDefault();

                 var elm = e.target;
                 var vid = $(elm).closest(".video-item-tmpl").find("input#vid").val();
                 var likes_count = $(elm).closest(".video-item-actions").find("#comment-likes-"+vid+".likes-btn-wrapper .count");
                 var dislikes_count = $(elm).closest(".video-item-actions").find("#comment-dislikes-"+vid+".dislikes-btn-wrapper .count");
                 var vid = $(elm).closest(".video-item-tmpl").find("input#vid").val();

                     _vm.likeVideo( _userid, vid, true, { success:function($data){
                            $(likes_count).html( $data.total_likes );
                            $(dislikes_count).html( $data.total_dislikes );
                     }});
             });


             $(document).on("click", ".video-item-tmpl .video-item-actions .dislikes-btn-wrapper", function(e){
                 console.log("dislikes-btn-wrapper()e:",e);
                 e.preventDefault();

                 var elm = e.target;
                 var vid = $(elm).closest(".video-item-tmpl").find("input#vid").val();
                 var likes_count = $(elm).closest(".video-item-actions").find("#comment-likes-"+vid+".likes-btn-wrapper .count");
                 var dislikes_count = $(elm).closest(".video-item-actions").find("#comment-dislikes-"+vid+".dislikes-btn-wrapper .count");
                 var vid = $(elm).closest(".video-item-tmpl").find("input#vid").val();

                     _vm.dislikeVideo( _userid, vid, true, { success:function($data){
                           $(likes_count).html( $data.total_likes );
                           $(dislikes_count).html( $data.total_dislikes );
                     }} );
             });


             //NOTE: Comment(s) reply to video-comment
             $(document).on("click", ".video-item-tmpl .video-item-comment-actions .likes-btn-wrapper", function(e){
                 console.log("likes-btn-wrapper()");
                 e.preventDefault();
                 var elm = e.target;

                 var comment_id = $(elm).closest(".video-item-comment").find("input#comment_id").val();
                 var vid = $(elm).closest(".video-item-comment").find("input#vid").val();

                 var likes_count = $(elm).closest(".video-item-comment-actions").find("#comment-likes-"+comment_id+".likes-btn-wrapper .count");
                 var dislikes_count = $(elm).closest(".video-item-comment-actions").find("#comment-dislikes-"+comment_id+".dislikes-btn-wrapper .count");

                     _vm.likeVideoComment( _userid, vid, comment_id ,true, { success:function($data){
                         $(likes_count).html( $data.total_likes );
                         $(dislikes_count).html( $data.total_dislikes );
                     }} );

             });

             $(document).on("click",".video-item-tmpl .video-item-comment-actions .dislikes-btn-wrapper", function(e){
                 console.log("dislikes-btn-wrapper():e:", e);
                 e.preventDefault();
                 var elm = e.target;
                 var comment_id = $(elm).closest(".video-item-comment").find("input#comment_id").val();
                 var vid = $(elm).closest(".video-item-comment").find("input#vid").val();
                 var likes_count = $(elm).closest(".video-item-comment-actions").find("#comment-likes-"+comment_id+".likes-btn-wrapper .count");
                 var dislikes_count = $(elm).closest(".video-item-comment-actions").find("#comment-dislikes-"+comment_id+".dislikes-btn-wrapper .count");

                 var vid = $(elm).closest(".video-item-comment").find("input#vid").val();
                     _vm.dislikeVideoComment( _userid, vid, comment_id, true, { success:function($data){
                           $(likes_count).html( $data.total_likes );
                           $(dislikes_count).html( $data.total_dislikes );
                     }} );
             });

             $(document).on('click','.video-item-tmpl .video-item-comment-actions .replies-wrapper',function(e)
             {
                   e.preventDefault();
                   var elm = e.target;

                   var comment_elm = $(elm).closest('.video-item-comment');
                   var comment_id = $(comment_elm).find("input#comment_id").val();
                   var total_replies = Number( $(comment_elm).find("input#total_replies").val() )
                   var replies_wrapper = $(comment_elm).find('.replies-wrapper');
                   var replies_container = $("#comment-replies-"+comment_id)
                       $(replies_container).show();

                   var offset = $(replies_container)[0].children.length;
                   var limit  = 5;

                   _vm.getCommentReplies( _userid, comment_id , offset, limit, { success: function($data){
                           console.log("$data:",$data.length );

                       var replies = $("#video-item-comment-tmpl").tmpl( $data ).addClass("reply-2-video-comment")
                           $(replies).find(".reply-btn-wrapper").remove()
                           $(replies).find(".reply-comments-wrapper").remove()

                           $("#comment-" +comment_id+ " .reply-comments-wrapper").append( replies );

                             if( offset+limit >= total_replies ){
                                 $(replies_wrapper).hide();
                             }

                             $(window).delay(190).queue(function( nxt ) {
                                 $(window).trigger('resize');
                                 nxt();
                             });

                     }
                 })

             })

             var comments_cache = {}
             var reply2Comment_metadata ;

             $(document).on('keyup','.video-item-tmpl .video-item-comment-actions .comment-wrapper textarea',function($e)
             {
                 var key                 = ( $e.keyCode );
                 var elm                 = $($e.target);
                 var keyed               = elm.val();
                 var comment             = elm.val();

                 var comment_elm         = elm.closest('.video-item-comment');
                 var comment_id          = comment_elm.find("input#comment_id").val();
                 var vid                 = comment_elm.find("input#vid").val();
                 var replies_wrapper     = comment_elm.find('.replies-wrapper');
                 var replies_container   = $("#comment-replies-" + comment_id)
                     $(replies_container).show();

                 var reply_container = $("#comment-reply-" + comment_id)
                 var urls_container = reply_container.find(".urls")
                     urls_container.empty();
                     $(window).trigger('resize');
                     //console.log("urls_container:",urls_container)
                 var metatdata = reply2Comment_metadata;
                     _nfm.findCardOnKeyEvent( $e, {type:"comment"} , function($card, $metadata){
                          metadata = reply2Comment_metadata = $metadata || metadata;

                         urls_container.empty().prepend($card)

                         $(window).trigger('resize');

                         urls_container.imagesLoaded(function(){
                             urls_container.show()
                             $(window).trigger('resize');
                         })
                     })

                 switch(String(key))
                 {
                     case "13":
                         console.log("send:",comment);

                         var m = {};
                         try{
                           if(metadata){
                              m = {   metadata_url           : metadata.url, //$data.ogUrl,
                                      metadata_title         : metadata.title,
                                      metadata_description   : metadata.description,
                                      metadata_thumbnail_url : metadata.thumbnail_url,
                                      metadata_video_url     : metadata.video_url,
                                      metadata_locale        : metadata.locale,
                                      metadata_date          : metadata.date,
                                      metadata_type          : metadata.type,
                                      metadata_request_url   : metadata.request_url,
                                      metadata_site_name     : metadata.site_name,
                                      metadata_charset       : metadata.charset,
                                      //metadata_ogs           : metadata.ogs,
                                      //metadata_oembed        : metadata.oembed
                                 }
                            }
                        }catch(e){
                          console.log("e:", e);
                        }

                        _vm.reply2Comment( vid, _userid, comment_id, comment, { metadata : m,
                                                                                success:function($data){

                             console.log( "_vm:reply2Comment:success:data:", $data );

                             $(elm).closest(".video-item-comment").find(".comment-wrapper").collapse("hide");
                             $(elm).val("");

                         var replies = $("#video-item-comment-tmpl").tmpl( $data ).addClass("reply-2-video-comment")
                             $(replies).find(".reply-btn-wrapper").remove()
                             $(replies).find(".reply-comments-wrapper").remove()
                             //
                             $("#comment-" +comment_id+ " .reply-comments-wrapper").prepend( replies );

                             $(window).delay(190).queue(function( nxt ) {
                                 $(window).trigger('resize');
                                 nxt();
                             });

                         }});

                         break;

                     default:
                         break;
                 }
             });



             $(document).on('keyup','.video-item-tmpl .video-item-actions .comment-wrapper textarea',function($e)
             {

                 var key = ( $e.keyCode );
                 var elm = $e.target;
                 var keyed = $(elm).val();

                 var comment = $(elm).val();
                 var video_elm = elm.closest(".video-item-tmpl")
                 var vid = $(video_elm).find("input#vid").val();
//                     _vm.validatePostComment( comment );

                 var urls_container = $(video_elm).find(".video-item-actions .comment-wrapper .urls")
                     urls_container.empty();
                     $(window).trigger('resize');

                 var metatdata;
                     _nfm.findCardOnKeyEvent( $e, {type:"comment"} , function($card, $metadata){
                         metadata = $metadata;
                         urls_container.empty().prepend($card)

                         $(window).trigger('resize');

                         urls_container.imagesLoaded(function(){
                             urls_container.show()
                             $(window).trigger('resize');
                         })
                     })


                 switch(String(key))
                 {
                     case "13":

                         var m = {};
                         try{
                           if(metadata){
                              m = {   metadata_url           : metadata.url, //$data.ogUrl,
                                      metadata_title         : metadata.title,
                                      metadata_description   : metadata.description,
                                      metadata_thumbnail_url : metadata.thumbnail_url,
                                      metadata_video_url     : metadata.video_url,
                                      metadata_locale        : metadata.locale,
                                      metadata_date          : metadata.date,
                                      metadata_type          : metadata.type,
                                      metadata_request_url   : metadata.request_url,
                                      metadata_site_name     : metadata.site_name,
                                      metadata_charset       : metadata.charset,
                                      //metadata_ogs           : metadata.ogs,
                                      //metadata_oembed        : metadata.oembed
                                 }
                            }
                        }catch(e){
                          console.log("e:", e);
                        }

                         _vm.postComment( vid, _userid, comment, { metadata : m,
                                                                   success:function($data){
                                 console.log( "_vm:postComment:success:data:", $data );
                             var count_elm = $(elm).closest(".video-item-tmpl").find(".message-btn-wrapper").find(".count");
                             var count = Number($(count_elm).html());
                                 $(count_elm).html(String(count+=1));
                                 $(elm).closest(".video-item-tmpl").find(".comment-wrapper").collapse("hide");
                                 $(elm).val("");

                             var comments_elm = $(elm).closest(".video-item-tmpl").find(".video-item-comments");

                                 $("#video-item-comment-tmpl").tmpl( $data ).prependTo( comments_elm );

                                 $(window).delay(190).queue(function( nxt ) {
                                     $(window).trigger('resize');
                                     nxt();
                                 });

                         }});

                         break;

                     default:
                         break;
                 }
             });

         }


         function initCommentsTemplates()
         {
             console.log("initCommentsTemplates()");

             $(document).on("click", ".container #container-ui-options #posts-btn", function(e){
                    e.preventDefault();
                    console.log("posts-btn:click()");
                    //initSearchUI("tile")
             });

             $(document).on("click", ".container #container-ui-options #videos-btn", function(e){
                    e.preventDefault();
                    console.log("videos-btn:click()");
                    //initSearchUI("list")
             });

             $(document).on("click",".comment-item .edit-dropdown-menu a", function(e){
                     e.preventDefault();
                     console.log("action click");
                 var elm = $(e.target);
                 var action = $(elm).attr("href").split("#").join("");

                 var video_elm = $(elm).closest(".video-item-tmpl");
                 var vid = $(video_elm).find("input#vid").val();

                 switch( action )
                 {
                     case "action-delete-comment":
                         var comment_elm = $(elm).closest(".comment-item")
                         var comment_id = $(comment_elm).find("input#comment_id").val();
                         console.log( "delete:comment_id:", comment_id );

                         _vm.deleteComment(_userid, comment_id, { success:function($data){
                             var comment_total_elm = $(video_elm).find(".message-btn-wrapper").find(".count");
                             var total_comments = Number( $(comment_total_elm).html() ) - 1;
                                 $(comment_total_elm).html( total_comments );

                                 $(comment_elm).slideUp("fast", function(){
                                     $(this).remove();
                                     $(window).trigger('resize');
                                 } )
                                 var show_more = $(comment_elm).find("#comment-replies-wrapper-"+comment_id+".replies-wrapper .count").html()
                                 console.log( "show_more:", show_more )

                         }} );

                         break;

                     case "action-mark-as-read":
                         var comment_elm = $(elm).closest(".comment-item")
                         var comment_id = $(comment_elm).find("input#comment_id").val();
                         console.log( "action-mark-as-read::comment_id:", comment_id );

                         _nfm.markCommentAsRead(_userid, comment_id, {success:function($data){
                              console.log("_nfm.markCommentAsRead:success:data:", $data);
                         }})
                         break;

                     case "action-mark-as-unread":
                         var comment_elm = $(elm).closest(".comment-item")
                         var comment_id = $(comment_elm).find("input#comment_id").val();
                         console.log( "action-mark-as-unread::comment_id:", comment_id );

                         _nfm.markCommentAsUnread(_userid, comment_id, {success:function($data){
                              console.log("_nfm.markCommentAsUnread:success:data:", $data);
                         }})
                         break;

                     case "action-edit-comment":
                         var comment_elm = $(elm).closest(".comment-item")

                         var comment_id = comment_elm.find("input#comment_id").val();
                         console.log( "action-mark-as-unread::comment_id:", comment_id );

                         var container = comment_elm.find("#comment-"+comment_id+" pre")
                         var text = container.html()
                         //console.log("comment_elm:", comment_elm);
                         //console.log("container:", container);

                             container.replaceWith(function(){
                               console.log("comment_id:",comment_id);
                                  return '<div id="edit-comment-text-'+comment_id+'"> \
                                              <textarea class="edit-comment-text" rows="5" >' + text + '</textarea>  \
                                              <div id="actions-container" class="float-end" style="margin-bottom:10px;">   \
                                                <button id="cancel-btn" type="button" class="btn btn-primary">Cancel</button>    \
                                                <button id="save-btn" type="button" class="btn btn-primary">Save</button>    \
                                              </div>  \
                                          </div>';
                                 //return '<pre style="word-break: break-word;">'+$data.content+'</pre>';
                             })
                             $(window).trigger('resize');

                         break;

                     default:
                         break;
                 }
             });

             $(document).on("click",".comment-item .comment-content #cancel-btn", function(e){
                      e.preventDefault();
                      var elm = $(e.target)
                      var comment_elm = elm.closest(".comment-item")
                      var comment_id = comment_elm.find("input#comment_id").val();
                      var container = comment_elm.find("#comment-"+comment_id)
                      var text = comment_elm.find("input#comment").val()

                      container.empty().html('<pre style="word-break: break-word;">'+text+'</pre>')
                      $(window).trigger('resize');

             })

             $(document).on("click",".comment-item .comment-content #save-btn", function(e){
                      e.preventDefault();
                      var elm = $(e.target)
                      var comment_elm = elm.closest(".comment-item")
                      var comment_id = comment_elm.find("input#comment_id").val();
                      var container = comment_elm.find("#comment-"+comment_id)
                      var comment = container.find("textarea").val()

                      _nfm.updateComment( _userid, comment_id, comment, { success:function($data){
                          container.empty().html('<pre style="word-break: break-word;">'+$data.comment+'</pre>')
                          $(window).trigger('resize');
                      }})
             })


             $(document).on("mouseover",".comment-item .icon-edit", function(e){
                   //  console.log("icon-edit:mouseover:e:",e);
                     e.preventDefault();
                 var elm          =  $( e.target ).closest(".comment-item");
                 var comment_id   = $( elm ).find("input#comment_id").val();
                 var menu         = $(elm).find("#edit-dropdown-menu-"+comment_id)
                 var target_y     = $(e.target).position().top + 28;
                     menu.css({top : target_y });
                     menu.show();
                     menu.addClass("is-open");

             }).mouseout(function(e){
                 var elm          = $( e.target ).closest(".comment-item");
                 var comment_id   = $( elm ).find("input#comment_id").val();
                 var menu         = $(elm).find("#edit-dropdown-menu-"+comment_id)
                 if( menu.hasClass("is-open") )
                 {
                       menu.removeClass("is-open");
                       menu.hide();
                 }
             });

             $(document).on("mouseover",".comment-item .edit-dropdown-menu", function(e){
                     e.preventDefault();
                 var elm          =  $( e.target ).closest(".comment-item");
                 var comment_id   = $( elm ).find("input#comment_id").val();
                 var menu = $(elm).find("#edit-dropdown-menu-"+comment_id);
                     menu.show();
                     menu.addClass("is-open");
             }).mouseout(function(e){
                     e.preventDefault();
                 var elm =  $( e.target ).closest(".comment-item");
                 var comment_id   = $( elm ).find("input#comment_id").val();
                 var menu = $(elm).find("#edit-dropdown-menu-"+comment_id);
                     menu.removeClass("is-open");
                     menu.hide();
             });


             $(document).on("click", ".comment-item .comment-item-actions .reply-btn-wrapper", function(e){
                 console.log("reply-btn-wrapper()");
                 e.preventDefault();
                 var elm = e.target;

                 $(window).delay(190).queue(function( nxt ) {
                     $(window).trigger('resize');
                     nxt();
                 });
             })

             $(document).on("click", ".comment-item .comment-item-actions .message-btn-wrapper", function(e){
                 console.log("message-btn-wrapper()");
                 e.preventDefault();


                 var elm = $(e.target).closest('.comment-item')
                 //var comment_elm = $(elm).closest(".comment-item")
                 var comment_id = $(elm).find("input#comment_id").val();
                 var total_replies = $(elm).find("input#total_replies").val();

                 var vid                   = $(elm).find('input#vid').val();
                 var total_replies_2_video = $(elm).find('input#total_replies_2_video').val();
                 var total_comments_elm    = $(elm).find("#comment-replies-"+comment_id );

                 var offset                = $(total_comments_elm).children().length;
                 var limit                 = 10;

//                console.log("comment_id:", comment_id, " vid:", vid, ", total_replies_2_video:", total_replies_2_video, ", limit:", limit, ", offset:", offset )
                 var replies_wrapper = $(elm).find('.replies-wrapper');

                     if(offset > total_replies){
                       $(replies_wrapper).hide();
                       return
                     }

                 //var replies_wrapper = $(elm).find('.replies-wrapper');
                 var replies_container = $("#comment-replies-"+comment_id)
                     $(replies_container).show();

                   _vm.getCommentReplies( _userid, comment_id , offset, limit, { success: function($data){
                           console.log("$data:",$data.length );

                           var replies = $("#comment-item-tmpl").tmpl( $data ).addClass("reply-2-video-comment")
                               $(replies).find(".reply-btn-wrapper").remove()
                               $(replies).find(".reply-comments-wrapper").remove()
                               $(replies).find(".video-content-wrapper").remove()
                               //console.log("replies:", replies);
                               //console.log($(replies_container) )
                               $(replies_container ).append( replies );

                                 if( offset+limit >= total_replies ){
                                     $(replies_wrapper).hide();
                                 }

                                 $(window).delay(190).queue(function( nxt ) {
                                     $(window).trigger('resize');
                                     nxt();
                                 });

                         }
                   })

                   $(window).delay(190).queue(function( nxt ) {
                       $(window).trigger('resize');
                       nxt();
                   });

             });

             $(document).on("click", ".comment-item .replies-wrapper .show-more", function(e){
                   console.log("show more comments()");
                   e.preventDefault();

                   var elm = $(e.target).closest('.comment-item')
                   //var comments_elm = $(elm).find(".video-item-comments");
                   var comment_id = $(elm).find("input#comment_id").val();
                   var total_replies = $(elm).find("input#total_replies").val();

                   //var total_comments_elm    = $(elm).find("comment-replies-"+comment_id + ".reply-comments-wrapper");


                   var vid = $(elm).find('input#vid').val();

                   var total_replies_2_video = $(elm).find('input#total_replies_2_video').val();

                   var total_comments_elm    = $(elm).find("#comment-replies-"+comment_id );

                   var offset                = $(total_comments_elm).children().length;
                   var limit                 = 10;

                       if(offset > total_replies){
                         return
                       }


                   var replies_container = $("#comment-replies-"+comment_id)
                   var replies_wrapper = $(elm).find('.replies-wrapper');

                   _vm.getCommentReplies( _userid, comment_id , offset, limit, { success: function($data){
                           console.log("$data:",$data );

                           var replies = $("#comment-item-tmpl").tmpl( $data ).addClass("reply-2-video-comment")
                               $(replies).find(".reply-btn-wrapper").remove()
                               $(replies).find(".reply-comments-wrapper").remove()
                               $(replies).find(".video-content-wrapper").remove()

                               $(replies_container ).append( replies );
                               $(replies_container).show()

                                 if( offset+limit >= total_replies ){
                                     $(replies_wrapper).hide();
                                 }

                                 $(window).delay(190).queue(function( nxt ) {
                                     $(window).trigger('resize');
                                     nxt();
                                 });
                         }
                   })
             })

             $(document).on("click", ".comment-item .comment-item-actions .likes-btn-wrapper", function(e){
                 //console.log("likes-btn-wrapper()");
                 e.preventDefault();
                 var elm = e.target;

                 var comment_elm = $(elm).closest(".comment-item")
                 var comment_id = $(comment_elm).find("input#comment_id").val();

                 var vid = $(comment_elm).find("input#vid").val();

                 var likes_count = $(comment_elm).find(".comment-item-actions #comment-likes-"+comment_id+".likes-btn-wrapper .count");
                 var dislikes_count = $(comment_elm).find(".comment-item-actions #comment-dislikes-"+comment_id+".dislikes-btn-wrapper .count");

                     _vm.likeVideoComment( _userid, vid, comment_id ,true, { success:function($data){
                         $(likes_count).html( $data.total_likes );
                         $(dislikes_count).html( $data.total_dislikes );
                     }} );
             });

             $(document).on("click",".comment-item .comment-item-actions .dislikes-btn-wrapper", function(e){
                 //console.log("dislikes-btn-wrapper():e:", e);
                 e.preventDefault();
                 var elm = e.target;

                 var comment_elm = $(elm).closest(".comment-item")
                 var comment_id = $(comment_elm).find("input#comment_id").val();

                 var vid = $(comment_elm).find("input#vid").val();

                 var likes_count = $(comment_elm).find(".comment-item-actions #comment-likes-"+comment_id+".likes-btn-wrapper .count");
                 var dislikes_count = $(comment_elm).find(".comment-item-actions #comment-dislikes-"+comment_id+".dislikes-btn-wrapper .count");


                     _vm.dislikeVideoComment( _userid, vid, comment_id, true, { success:function($data){
                           $(likes_count).html( $data.total_likes );
                           $(dislikes_count).html( $data.total_dislikes );
                     }} );

             });


             $(document).on("keyup",".comment-item .comment-item-actions .comment-wrapper textarea",function(e)
             {
                 var key = ( e.keyCode );
                 var elm = e.target;
                 //console.log("id:", e.target)
                 var keyed = $(elm).val();
                 var comment = $(elm).val();

                 var comment_elm = $(elm).closest(".comment-item")
                 var comment_id = $(comment_elm).find("input#comment_id").val();

                 var vid = $(comment_elm).find("input#vid").val();

                 var replies_container = $("#comment-replies-"+comment_id)
                     $(replies_container).show();

                 switch(String(key))
                 {
                     case "13":


                         _vm.reply2Comment( vid, _userid, comment_id, comment, { success:function($data){

                                 //console.log( "debug:_vm:reply2Comment:success:data:", $data );
                             var count_elm = $(comment_elm).find(".message-btn-wrapper").find(".count");
                             var count = Number($(count_elm).html());
                                 $(count_elm).html(String(count+=1));

                                 $(comment_elm).find(".comment-wrapper").collapse("hide");
                                 $(elm).val("");


                                 var replies = $("#comment-item-tmpl").tmpl( $data ).addClass("reply-2-video-comment")

                                     $(replies).find(".reply-btn-wrapper").remove()
                                     $(replies).find(".reply-comments-wrapper").remove()
                                     $(replies).find(".video-content-wrapper").remove()
                                     $(replies_container ).prepend( replies );
                                     $(replies_container).show()

     /*
                                 if( offset+limit >= total_replies ){
                                     $(replies_wrapper).hide();
                                 }
     */
                                 $(window).delay(190).queue(function( nxt ) {
                                     $(window).trigger('resize');
                                     nxt();
                                 });

                         }});

                         break;

                     default:
                         break;
                 }
             });

         }

         function updateUIbyState()
         {
           if(_state != "get-post" && _state != "get-video"){
             if( Boolean(_ui_is_list) ){
               //console.log("Set List");
               initSearchUI("list");
             }else{
               //console.log("Set Tile");
               initSearchUI("tile");
             }
           }else{
               removeTile();
           }
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

           removeTile()

           $(window).trigger('resize');

         }



         function removeTile()
         {
           //_ui_is_tile = false;
           //_ui_is_list = true;
             _elms.find(".post-item-tmpl").removeClass("postcard")
             _elms.find(".video-item-tmpl").removeClass("videocard")
             _elms.find(".yt-item-tmpl").removeClass("ytcard")
             $(window).trigger('resize');
         }

         function resetPostCardUI($elm, $data)
         {
               console.log("resetPostCardUI():elm",$elm, ", data:", $data );

               $elm.find("input#thumbnail_url").val($data.metadata_thumbnail_url );
               $elm.find("input#title").val($data.metadata_title );
               $elm.find("input#description").val($data.metadata_description );
               //elm.find("input#metadata_title").val($data.title );
               //elm.find("input#metadata_description").val($data.description );
               $elm.find("input#metadata_url").val($data.metadata_url );
               $elm.find("input#metadata_request_url").val($data.metadata_request_url );
               $elm.find("input#metadata_site_name").val($data.metadata_site_name );
               $elm.find("input#metadata_video_url").val($data.metadata_video_url );
               $elm.find("input#metadata_type").val($data.metadata_type );
               $elm.find("input#metadata_locale").val($data.metadata_locale );
               $elm.find("input#metadata_date").val($data.metadata_date );
               $elm.find("input#metadata_charset").val($data.cmetadata_harset );

               var container = $($elm).find("#edit-content-container")
               console.log("container:", container)

                 container.replaceWith(function(){
                     return '<pre style="word-break: break-word;">'+$data.content+'</pre>';
                 })
                 console.log("$data.content:",$data)
               $($elm).find(".post-item-content pre").html($data.content)


               var thumb_elm = $elm.find(".post-item-thumbnail-container img.thumbnail-img")
                   thumb_elm.attr("src", $data.metadata_thumbnail_url )

               var title_elm = $elm.find(".post-item-title a.post-item-title")
                   title_elm.html($data.metadata_title);

               var description = $elm.find(".post-item-description pre")
                   description.html($data.metadata_description);

               $(window).trigger('resize');

         }

         function resizeSearchResults()
         {
            //console.log("$newsfeed:resizeSearchResults()")
            $(window).trigger('resize');

            if( _is_loading ){
                setTimeout( resizeSearchResults, 1000 );
            }
         }


         function updateFeed(action, offset, limit)
         {
             console.log("updateFeed():action:", action );
             _offset  = offset || 0;
             _limit   = limit || 10;

             switch(action)
             {
                 case "news-feed":
                     _is_loading = true;
                     renderMessage( "#title", "NewsFeed" );
                     _nfm.getNewsFeed( _userid, { offset  : _offset,
                                                  limit   : _limit,
                                                  success : renderNewsFeed });
                     break;

                 case "my-news-feed":
                     _is_loading = true;
                     renderMessage( "#title", "My News Feed Posts" );
                     _nfm.getUserNewsFeed( _userid, { offset : _offset,
                                                      limit  : _limit,
                                                      success: renderNewsFeed });
                      break;
                case "related-posts":
                    _is_loading = true;
                    renderMessage( "#title", "Related Posts" );
                    _nfm.getRelatedPosts( _userid, { offset : _offset,
                                                     limit  : _limit,
                                                     success: renderNewsFeed });
                     break;

                 case "my-videos":
                     _is_loading = true;
                     renderMessage( "#title", "My Videos" );
                     _vm.getUserVideos( _userid, { offset : _offset,
                                                   limit  : _limit,
                                                   success: renderVideos });
                     break;

                 case "new-videos":
                     _is_loading = true;
                     renderMessage( "#title", "New Videos" );
                     _vm.getNewVideos( _userid, { offset : _offset,
                                                  limit  : _limit,
                                                  success: renderVideos });
                     break;
                 case "related-videos":
                     _is_loading = true;
                     renderMessage( "#title", "Related Videos" );
                     _vm.getRelatedVideos( _userid, _vid, { offset : _offset,
                                                            limit  : _limit,
                                                            success: renderVideos });
                     break;

                 case "history":
                     _is_loading = true;
                     renderMessage( "#title", "My History" );
                     _vm.getUserWatchHistory( _userid, { offset : _offset,
                                                         limit  : _limit,
                                                         success: renderVideos });
                     break;

                 case "tv":
                     _is_loading = true;
                     renderMessage( "#title", "TV" );
                     _vm.getTVShows( _userid, { offset   : _offset,
                                                limit    : _limit,
                                                success  : renderVideos,
                                                error    : searchError  });

                     break;

                 case "movies":
                     _is_loading = true;
                     renderMessage( "#title", "Movies" );
                     _vm.getMovies( _userid, { offset   : _offset,
                                               limit    : _limit,
                                               success  : renderVideos,
                                               error    : searchError  });

                     break;

                 case "audiobooks":
                     _is_loading = true;
                     renderMessage( "#title", "Audio Books" );
                     _vm.getAudiobooks( _userid, { offset   : _offset,
                                                   limit    : _limit,
                                                   success  : renderVideos,
                                                   error    : searchError  });
                     break;

                 case "channel-comments":
                     _is_loading = true;
                     renderMessage( "#title", "Channel Comments" );
                     _vm.getChannelVideoComments( _userid, { offset   : _offset,
                                                             limit    : _limit,
                                                             success  : renderChannelVideoComments,
                                                             error    : searchError  });
                     break;
/*
                 case "video-comments":
                     _is_loading = true;
                     renderMessage( "#title", "Video Comments" );
                     _vm.getUserVideoComments( _userid, { offset   : _offset,
                                                           limit    : _limit,
                                                           success  : renderUserVideoComments,
                                                           error    : searchError  });
                     break;

                 case "search":
                     _is_loading = true;
                     renderMessage( "#title", "Search Results" );
                    _vm.search( _userid,
                                _q,
                                { offset :_offset,
                                  limit  : _limit,
                                  success: renderVideos,
                                  error  : searchError });
                   break;
*/
                 default:
                     break;
             }
         }

         function showVideoMetadataModal($vid)
         {
           console.log("$.newsfeed::showVideoMetadataModal():vid:", $vid);
           cleanVideoMetadataModal();

           _vm.getVideo( _userid, $vid, { success : function($video){
               console.log("$.newsfeed::showVideoMetadataModal:success:getVideo():$results:",$video);
               updateVideoMetadataModal($video);
               $("#edit-video-metadata-modal").modal("show");
           } , error: function(e){
               console.log("$.newsfeed::showVideoMetadataModal:error:getVideo():e:",e);
               //renderNotAvailableMessage(e);
           }} );

         }

         function saveVideoMetadata($vid)
         {
             console.log("$.newsfeed::saveVideoMetadata():vid:", $vid);

             var metadata = {
                          title           : $("#edit-video-metadata-modal").find("#title-input").val(),
                          description     : $("#edit-video-metadata-modal").find("#description-input").val(),
                          keywords        : $("#edit-video-metadata-modal").find("#keywords-input").val(),
                          thumbnail_url   : $("#edit-video-metadata-modal").find("#thumbnail-img").attr('src'),
                          is_public       : $("#edit-video-metadata-modal").find("#is_public").is(":checked")
             }

             console.log("saveVideoMetadata:vid:", $vid,", metadata:",metadata)

             _vm.saveVideoMetadata(_userid, $vid, metadata, {success: function($e){
                 console.log("$.newsfeed::_vm:saveVideoMetadata(e):",$e);
                 //cleanVideoMetadataModal()
                 updateVideoItemMetadata($vid, metadata)
             }});
         }

         function cleanVideoMetadataModal()
         {
             console.log("$.newsfeed::cleanVideoMetadataModal()");
             $("#edit-video-metadata-modal").find("#title-input").val('');
             $("#edit-video-metadata-modal").find("#description-input").val('');
             $("#edit-video-metadata-modal").find("#keywords-input").val('');
             $("#edit-video-metadata-modal").find("#thumbnail-img").attr('src','');
             //$("#edit-video-metadata-modal").find("#is-public-input").val('asdf');
         }

         function updateVideoItemMetadata($vid, $metadata)
         {
             console.log("$.newsfeed::updateVideoItemMetadata():$vid:",$vid, ", $metadata:",$metadata);
             var video_elm = $("#video-"+$vid);
             //console.log("video_elm:",video_elm);
                 video_elm.find("input#title").val($metadata.title);
                 video_elm.find("input#description").val($metadata.description);
                 video_elm.find("input#keywords").val($metadata.keywords);
                 video_elm.find("input#thumbnail_url").val($metadata.thumbnail_url);

             var title = video_elm.find(".video-item-title").html()
                 //console.log("title:", title);
                 video_elm.find(".video-item-metadata .video-item-summary .video-item-title").html($metadata.title);

                 video_elm.find(".video-item-metadata .video-item-summary .video-item-description pre").html( shortenText( $metadata.description, 240) );
                 $("#edit-video-metadata-modal").find("#thumbnail-img").attr('src',$metadata.thumbnail_url);
                 //$("video-"+$vid).find("input#description").val();
         }

         function updateVideoMetadataModal($video)
         {
             console.log("$.newsfeed::updateVideoMetadataModal:video:", $video);
             $("#edit-video-metadata-modal").find("#title-input").val($video.title);
             $("#edit-video-metadata-modal").find("#description-input").val($video.description);
             $("#edit-video-metadata-modal").find("#keywords-input").val($video.keywords);
             $("#edit-video-metadata-modal").find("#thumbnail-img").attr('src',$video.thumbnail_url);
             $("#edit-video-metadata-modal").find("#vid").val($video.vid);
             $("#edit-video-metadata-modal").find("#is-public-input").prop('checked', Boolean($video.is_public));
         }

         function initSearchRenderVideos($results)
         {
             initRenderVideos($results.data);
         }

         function renderMessage( $elm, $msg )
         {
             $($elm).fadeOut("fast", function(e){
                 $($elm).html($msg).fadeIn("fast");
             })
         }

         function renderNoVideosMessage()
         {
             _nfposts_elm.html("Sorry, there are no videos.");
         }

         function renderNoCommentsMessage()
         {
             _nfposts_elm.html("Sorry, there are no comments.");
         }

         function validatePostComment(msg)
         {
             console.log("$.newsfeed::validatePostComment(msg:"+msg+")");
             return ;
         }

         function isURL(str) {
             var urlRegex = '^(?!mailto:)(?:(?:http|https|ftp)://)(?:\\S+(?::\\S*)?@)?(?:(?:(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}(?:\\.(?:[0-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))|(?:(?:[a-z\\u00a1-\\uffff0-9]+-?)*[a-z\\u00a1-\\uffff0-9]+)(?:\\.(?:[a-z\\u00a1-\\uffff0-9]+-?)*[a-z\\u00a1-\\uffff0-9]+)*(?:\\.(?:[a-z\\u00a1-\\uffff]{2,})))|localhost)(?::\\d{2,5})?(?:(/|\\?|#)[^\\s]*)?$';
             var url = new RegExp(urlRegex, 'i');
             return str.length < 2083 && url.test(str);
         }

         function initVideoInputUI(show_video_ui)
         {
             console.log("$.newsfeed::initVideoInputUI():", show_video_ui);

             if( show_video_ui ){
                _video_ui_elm.show();
             }else{
                _video_ui_elm.hide();
             }

         }

         function initCommentsInputUI(show_comments_ui)
         {
             console.log("$.newsfeed::initCommentsInputUI():", show_comments_ui);

             if( show_comments_ui ){
                _comments_ui_elm.show();
             }else{
                _comments_ui_elm.hide();
             }

         }


         function initNewsFeedInputUI(show_post_ui)
         {
             console.log("$.newsfeed::initNewsFeedInputUI():",show_post_ui);
             //_show_post_ui

             if( show_post_ui ){
                _nfui_elm.show();
             }else{
               _nfui_elm.hide();
             }

/*
             $(document).on("click", '#edit-post-metadata-modal-cancel-btn', function(e){
                 cleanPostMetadataModal();
             })
*/
         }

         function cleanTemplate()
         {
            console.log("$.newsfeed::cleanTemplate()");
            try{
                _elms.masonry( 'destroy' );
                _elms.removeData('masonry');
            }catch(e){
              console.log(e)
            }

            cleanVideoTemplate()
            cleanCommentTempalte()
            cleanNewsFeedTemplate()
         }

         function cleanCommentTempalte()
         {
             console.log("$.newsfeed::cleanCommentTempalte()");
             $(document).off("click",".comment-item .comment-item-actions .reply-btn-wrapper")
             $(document).off("click",".comment-item .comment-item-actions .message-btn-wrapper")
             $(document).off("click",".comment-item .comment-item-actions .likes-btn-wrapper")
             $(document).off("click",".comment-item .comment-item-actions .dislikes-btn-wrapper")
             $(document).off("keyup",".comment-item .comment-item-actions .comment-wrapper textarea")
             $(document).off("click",".comment-item .replies-wrapper .show-more")

             $(document).off("click",".comment-item .edit-dropdown-menu a")
             $(document).off("click",".comment-item .comment-content #save-btn")
             $(document).off("click",".comment-item .comment-content #cancel-btn")
         }

         function cleanVideoTemplate()
         {
             console.log("$.newsfeed::cleanVideoTemplate()");
             $(document).off("click",".video-item-tmpl .edit-dropdown-menu a")
             $(document).off("click",".video-item-tmpl .message-btn-wrapper")
             $(document).off('keyup','.video-item-tmpl .video-item-comment .comment-container textarea')

             $(document).off("mouseover",".video-item-tmpl .video-item-comment .video-item-comment-text .edit-dropdown-menu")
             $(document).off("mouseout",".video-item-tmpl .video-item-comment .video-item-comment-text .edit-dropdown-menu")

             $(document).off("click", ".video-item-tmpl .comments-actions .action-more")
             $(document).off('click','.video-item-tmpl .video-item-comment-actions .replies-wrapper')

             //$(document).off('click' for any event handlres attached to documeent
             $(document).off('click', '.video-item-tmpl .video-item-actions .likes-btn-wrapper');
             $(document).off('click', '.video-item-tmpl .video-item-actions .dislikes-btn-wrapper')
             $(document).off('click', '.video-item-tmpl .video-item-comment-actions .likes-btn-wrapper')
             $(document).off('click', '.video-item-tmpl .video-item-comment-actions .dislikes-btn-wrapper')

             $(document).off('click', '.video-item-tmpl .video-item-comment-actions .comment-wrapper textarea')
             $(document).off('click', '.video-item-tmpl .video-item-actions .comment-wrapper textarea')
             $(document).off('click', '.video-item-tmpl .video-item-comment .reply-btn-wrapper')
             $(document).off('click', '.video-item-tmpl .message-btn-wrapper')
             $(document).off('click', '.video-item-tmpl .comment-wrapper textarea')

             $(document).off('keyup','.video-item-tmpl .video-item-comment-actions .comment-wrapper textarea' )
             $(document).off('keyup','.video-item-tmpl .video-item-actions .comment-wrapper textarea' )

             $(document).off("mouseover", ".video-item-tmpl .video-item-comment .video-item-comment-text .edit-dropdown-menu")
             $(document).off("mouseover", ".video-item-tmpl .video-item-comment-text .icon-edit")

             //clean comments edits
             $(document).off('click', '.video-item-comment #edit-comment-container #actions-container #cancel-btn')//$(document).off('click', '#edit-comment-container #actions-container #cancel-btn')
             $(document).off('click', '.video-item-comment #edit-comment-container #actions-container #save-btn')//$(document).off('click', '#edit-comment-container #actions-container #save-btn')
             $(document).off('keyup', '.video-item-comment #edit-comment-container textarea.action-edit-post-comment')//$(document).off('keyup', '#edit-comment-container textarea.action-edit-post-comment')

             $(document).off("click","#delete-video-modal-cancel-btn")
             $(document).off("click","#delete-video-modal-submit-btn")


             $(document).off("click", ".video-item-tmpl #edit-content-description #cancel-btn")
             $(document).off("click", ".video-item-tmpl #edit-content-description #save-btn")
             $(document).off("click", ".video-item-tmpl #edit-content-title #cancel-btn")
             $(document).off("click", ".video-item-tmpl #edit-content-title #save-btn")


         }

         function cleanNewsFeedTemplate()
         {
            console.log("$.newsfeed::cleanNewsFeedTemplate()");
            $(document).off("mouseover",".post-item-tmpl .post-item-thumbnail-container .edit-dropdown-menu")
            $(document).off("mouseover",".post-item-tmpl .post-item-thumbnail-container .icon-white-edit")

            $(document).off('keyup', ".post-item-tmpl .post-item-actions .comment-wrapper textarea")
            $(document).off("click", ".post-item-tmpl .message-btn-wrapper")
            $(document).off("click", ".post-item-tmpl .post-item-actions .dislikes-btn-wrapper")
            $(document).off("click", ".post-item-tmpl .post-item-actions .likes-btn-wrapper")

            $(document).off("click", ".container #actions-container #send-btn")
            $(document).off("keyup", "#comment-container textarea")

            $(document).off("click","#delete-post-modal-cancel-btn")
            $(document).off("click","#delete-post-modal-submit-btn")

            $(document).off("click", "#view-post-modal #view-post-modal-close-btn")
            $(document).off("click", ".post-item-tmpl .post-item-thumbnail-container")
            $(document).off("click", ".post-item-tmpl .post-item-comment-actions .replies-wrapper")
            $(document).off("keyup", ".post-item-tmpl .post-item-comment-actions .comment-wrapper textarea")

            $(document).off("mouseover", ".post-item-tmpl .post-item-comment .post-item-comment-text .edit-dropdown-menu")
            $(document).off("mouseover", ".post-item-tmpl .post-item-comment-text .icon-edit")

            $(document).off("click", ".post-item-tmpl #edit-content-description #cancel-btn")//$(document).off("click", "#edit-content-description #cancel-btn")
            $(document).off("click", ".post-item-tmpl #edit-content-description #save-btn")//$(document).off("click", "#edit-content-description #save-btn")
            $(document).off("click", ".post-item-tmpl #edit-content-title #cancel-btn")//$(document).off("click", "#edit-content-title #cancel-btn")
            $(document).off("click", ".post-item-tmpl #edit-content-title #save-btn")//$(document).off("click", "#edit-content-title #save-btn")

            $(document).off('click', '.post-item-comment #edit-comment-container #actions-container #cancel-btn')//$(document).off('click', '#edit-comment-container #actions-container #cancel-btn')
            $(document).off('click', '.post-item-comment #edit-comment-container #actions-container #save-btn')//$(document).off('click', '#edit-comment-container #actions-container #save-btn')
            $(document).off('keyup', '.post-item-comment #edit-comment-container textarea.action-edit-post-comment')//$(document).off('keyup', '#edit-comment-container textarea.action-edit-post-comment')

//            $(document).off('click', '.post-item-tmpl #edit-content-container #actions-container #cancel-btn')
//            $(document).off('click', '.post-item-tmpl #edit-content-container #actions-container #save-btn')
//            $(document).off('click', '.post-item-tmpl #actions-container #cancel-btn')

            $(document).off("click", ".container #container-ui-options #list-btn")
            $(document).off("click", ".container #container-ui-options #tile-btn")
         }

         function cleanNewsFeedPostUI()
         {
             console.log("$.newsfeed::cleanNewsFeedPostUI()");
             $("#comment-container textarea").val('');
             //$("#search-ui").empty()
             $('#card-container').slideUp( "fast", function(){
                 $('#card-container').empty();
             })

         }


         function initVideoMetadataModal()
         {
             console.log("$.newsfeed::initVideoMetadataModal()");

             $(document).on("click", '#edit-video-metadata-modal-cancel-btn', function(e){
                 //cleanPostMetadataModal();
             })

             $(document).on("click",'#edit-video-metadata-modal-save-btn', function(e){
                 var pid = $("#edit-video-metadata-modal").find("input#vid").val()
                 console.log("$.newsfeed::click():vid:", vid);
                 saveVideoMetadata(vid);
             })

         }

         function initPostMetadataModal()
         {
             console.log("$.newsfeed::initPostMetadataModal()");
             $(document).on("click", '#edit-post-metadata-modal-cancel-btn', function(e){
                 //cleanPostMetadataModal();
             })

             $(document).on("click",'#edit-post-metadata-modal-save-btn', function(e){
                 var pid = $("#edit-post-metadata-modal").find("input#pid").val()
                 //console.log("$.newsfeed::click():pid:", pid);
                 savePostMetadata(pid);
             })

         }

         function showPostMetadataModal($pid)
         {
           console.log("$.newsfeed::showPostMetadataModal():pid:", $pid );
           cleanPostMetadataModal();

           _nfm.getPost( _userid, $pid, { success : function( $post ){
               console.log("$.newsfeed::showPostMetadataModal:success:getPost():$results:", $post );
               updatePostMetadataModal($post);
           } , error: function(e){
               console.log("showPostMetadataModal:error:getPost():e:",e);
               //renderNotAvailableMessage(e);
           }} );

           $("#edit-post-metadata-modal").modal("show");
         }

         function updatePostItemMetadata($pid, $metadata)
         {
             console.log("$.newsfeed::updatePostItemMetadata():$vid:",$pid, ", $metadata:",$metadata);
             var post_elm = $("#post-"+$pid);
             //console.log("post_elm:",post_elm);
             post_elm.find("input#title").val($metadata.metadata_title);
             post_elm.find("input#description").val($metadata.metadata_description);
             post_elm.find("input#keywords").val($metadata.keywords);
             post_elm.find("input#thumbnail_url").val($metadata.metadata_thumbnail_url);
             //post_elm.find("input#video_url").val($metadata.video_url);
             var title = post_elm.find(".post-item-title").html()
             //console.log("title:", title);
             post_elm.find(".post-item-metadata .post-item-summary .post-item-title").html($metadata.metadata_title);

             post_elm.find(".post-item-metadata .post-item-summary .post-item-description pre").html( shortenText( $metadata.metadata_description, 240) );
             $("#edit-post-metadata-modal").find("#thumbnail-img").attr('src',$metadata.metadata_thumbnail_url);
             //$("post-"+$pid).find("input#description").val();
         }

         function updatePostMetadataModal($post)
         {
             console.log("$.newsfeed::updatePostMetadataModal()$:post:", $post)
             $("#edit-post-metadata-modal").find("#content-input").val($post.content);
             $("#edit-post-metadata-modal").find("#title-input").val($post.metadata_title);
             $("#edit-post-metadata-modal").find("#description-input").val($post.metadata_description);
             $("#edit-post-metadata-modal").find("#keywords-input").val($post.metadata_keywords);
             $("#edit-post-metadata-modal").find("#thumbnail-img").attr('src',$post.metadata_thumbnail_url);
             //$("#edit-post-metadata-modal").find("#thumbnail-img").attr('src',$post.metadata_video_url);
             //$("#edit-post-metadata-modal").find("#thumbnail-img").attr('src',$post.metadata_local);
             //$("#edit-post-metadata-modal").find("#thumbnail-img").attr('src',$post.metadata_site_name);
             //$("#edit-post-metadata-modal").find("#thumbnail-img").attr('src',$post.metadata_data);
               //$("#edit-post-metadata-modal").find("#thumbnail-img").attr('src',$post.metadata_request_url);
             $("#edit-post-metadata-modal").find("#pid").val($post.pid);
             $("#edit-post-metadata-modal").find("#is-public-input").prop('checked', Boolean($post.is_public));
         }

         function showDeletePostModal($pid)
         {
             $("#delete-post-modal").find("input#pid").val($pid);
             $("#delete-post-modal").modal("show");
         }

         function savePostMetadata($pid)
         {
             console.log("$.newsfeed::savePostMetadata():pid:", $pid);

             var metadata = { metadata_title           : $("#edit-post-metadata-modal").find("#title-input").val(),
                              metadata_description     : $("#edit-post-metadata-modal").find("#description-input").val(),
                              metadata_keywords        : $("#edit-post-metadata-modal").find("#keywords-input").val(),
                              metadata_thumbnail_url   : $("#edit-post-metadata-modal").find("#thumbnail-img").attr('src'),
                              //metadata_video_url       : $("#edit-post-metadata-modal").find("#video").attr('src'),
                              is_public       : $("#edit-post-metadata-modal").find("#is_public").is(":checked")
             }

             console.log("savePostMetadata:pid:", $pid,", metadata:",metadata)

             _nfm.savePostMetadata(_userid, $pid, metadata, {success: function($e){
                 console.log("$.newsfeed::_nfm:savePostMetadata(e):",$e);
                 //cleanPostMetadataModal()
                 updatePostItemMetadata($pid, metadata)
             }});
         }

         function cleanPostMetadataModal()
         {
             console.log("$.newsfeed::cleanPostMetadataModal()");
             $("#edit-post-metadata-modal").find("#title-input").val('');
             $("#edit-post-metadata-modal").find("#description-input").val('');
             $("#edit-post-metadata-modal").find("#keywords-input").val('');
             $("#edit-post-metadata-modal").find("#thumbnail-img").attr('src','');
             //$("#edit-post-metadata-modal").find("#is-public-input").val('asdf');
         }

         function createCommentsContainer()
         {
           console.log("$.newsfeed::createCommentsContainer()");
           return "<div class='comments-ui'>ui</div><div class='comments-posts'>comments</div>"
         }

         function createVideoContainer()
         {
           console.log("$.newsfeed::createVideoContainer()");
           return "<div class='video-ui'>ui</div><div class='video-posts'>videos</div>"
         }

         function creatNewsfeedContainer()
         {
           console.log("$.newsfeed::creatNewsfeedContainer()");
           return "<div class='newsfeed-ui'>ui</div><div class='newsfeed-posts'>posts</div>"
         }

         function createPostDeleteModal()
         {
                console.log("$.newsfeed::createPostDeleteModal()");

                return '<div id="delete-post-modal" class="modal fade" >   \
                               <div class="modal-dialog">   \
                                 <div class="modal-content">   \
                                   <div class="modal-header">   \
                                     <h5 class="modal-title">Delete Post</h5>   \
                                     <button type="button" class="btn btn-close btn-light" class="close" data-bs-dismiss="modal" aria-label="Close">   \
                                       <span aria-hidden="true"></span>   \
                                     </button>   \
                                   </div>   \
                                   <div class="dashboard-blocks">   \
                                       <div class="block block-1"></div>   \
                                       <div class="block block-2"></div>   \
                                       <div class="block block-3"></div>   \
                                       <div class="block block-4"></div>   \
                                       <div class="block block-5"></div>   \
                                   </div>   \
                                   <div class="modal-body">   \
                                     <input id="pid" type="hidden" class="form-control" value="" >   \
                                     <div class="form-group">   \
                                         Are you sure you want to delete this Post?   \
                                     </div>   \
                                   <div class="modal-footer">   \
                                     <button id="delete-post-modal-cancel-btn" type="button" class="btn btn-light" data-bs-dismiss="modal">Cancel</button>   \
                                     <button id="delete-post-modal-submit-btn" type="button" class="btn btn-primary" data-bs-dismiss="modal">Delete</button>   \
                                   </div>   \
                                 </div>   \
                               </div>   \
                             </div>   \
                             '
         }

         function createPostOverlayModal()
         {
             console.log("$.newsfeed::createPostOverlayModal()");
             return '<div id="view-post-modal" class="modal fade" tabindex="-1">   \
                             <div class="modal-dialog modal-xl modal-dialog-centered" >   \
                               <div class="modal-content">   \
                                 <div class="modal-header">   \
                                   <h5 class="modal-title">View</h5>   \
                                   <button type="button" class="btn btn-close btn-light" class="close" data-bs-dismiss="modal" aria-label="Close">   \
                                     <span aria-hidden="true"></span>   \
                                   </button>   \
                                 </div>   \
                                 <div class="dashboard-blocks">   \
                                     <div class="block block-1"></div>   \
                                     <div class="block block-2"></div>   \
                                     <div class="block block-3"></div>   \
                                     <div class="block block-4"></div>   \
                                     <div class="block block-5"></div>   \
                                 </div>   \
                                 <div class="modal-body">   \
                                   <input id="pid" type="hidden" class="form-control" value="" >   \
                                   <div class="iframe-container">   \
                                   <button id="view-post-modal-close-btn" type="button" class="btn btn-primary" data-bs-dismiss="modal">Close</button>   \
                                 </div>   \
                               </div>   \
                             </div>   \
                           </div>'
         }

         function createVideoDeleteModal()
         {
            console.log("$.newsfeed::createVideoDeleteModal()")
            return  '<div id="delete-video-modal" class="modal fade" >   \
                           <div class="modal-dialog">   \
                             <div class="modal-content">   \
                               <div class="modal-header">   \
                                 <h5 class="modal-title">Delete Video</h5>   \
                                 <button type="button" class="btn btn-close btn-light" class="close" data-bs-dismiss="modal" aria-label="Close">   \
                                   <span aria-hidden="true"></span>   \
                                 </button>   \
                               </div>   \
                               <div class="dashboard-blocks">   \
                                   <div class="block block-1"></div>   \
                                   <div class="block block-2"></div>   \
                                   <div class="block block-3"></div>   \
                                   <div class="block block-4"></div>   \
                                   <div class="block block-5"></div>   \
                               </div>   \
                               <div class="modal-body">   \
                                 <input id="vid" type="hidden" class="form-control" value="" >   \
                                 <div class="form-group">   \
                                     Are you sure you want to delete this Video?   \
                                 </div>   \
                               <div class="modal-footer">   \
                                 <button id="delete-video-modal-cancel-btn" type="button" class="btn btn-light" data-bs-dismiss="modal">Cancel</button>   \
                                 <button id="delete-video-modal-submit-btn" type="button" class="btn btn-primary" data-bs-dismiss="modal">Delete</button>   \
                               </div>   \
                             </div>   \
                           </div>   \
                         </div>   \
                         '
         }

         function createVideoOverlayModal()
         {
            console.log("$.newsfeed::createVideoOverlayModal()")

            return '<div id="view-video-modal" class="modal fade" tabindex="-1">   \
                            <div class="modal-dialog modal-xl modal-dialog-centered" >   \
                              <div class="modal-content">   \
                                <div class="modal-header">   \
                                  <h5 class="modal-title">View</h5>   \
                                  <button type="button" class="btn btn-close btn-light" class="close" data-bs-dismiss="modal" aria-label="Close">   \
                                    <span aria-hidden="true"></span>   \
                                  </button>   \
                                </div>   \
                                <div class="dashboard-blocks">   \
                                    <div class="block block-1"></div>   \
                                    <div class="block block-2"></div>   \
                                    <div class="block block-3"></div>   \
                                    <div class="block block-4"></div>   \
                                    <div class="block block-5"></div>   \
                                </div>   \
                                <div class="modal-body">   \
                                  <input id="vid" type="hidden" class="form-control" value="" >   \
                                  <div class="iframe-container">   \
                                  <button id="view-video-modal-close-btn" type="button" class="btn btn-primary" data-bs-dismiss="modal">Close</button>   \
                                </div>   \
                              </div>   \
                            </div>   \
                          </div>'
         }

         function createVideoEditMetadataModals()
         {
            console.log("$.newsfeed::createVideoEditMetadataModals()")

            return '<div id="edit-video-metadata-modal" class="modal fade" >   \
              <div class="modal-dialog modal-xl modal-dialog-centered">   \
                <div class="modal-content">   \
                  <div class="modal-header">   \
                    <h5 class="modal-title">Edit</h5>   \
                    <button type="button" class="btn btn-close btn-light" class="close" data-bs-dismiss="modal" aria-label="Close"><span aria-hidden="true"></span></button>   \
                  </div>   \
                  <div class="dashboard-blocks">   \
                      <div class="block block-1"></div>   \
                      <div class="block block-2"></div>   \
                      <div class="block block-3"></div>   \
                      <div class="block block-4"></div>   \
                      <div class="block block-5"></div>   \
                  </div>   \
                  <div class="modal-body">   \
                    <input id="vid" type="hidden" class="form-control" value="" >   \
                    <div class="form-group">   \
                      <label id="title" for="title-input">Title</label>   \
                      <input id="title-input" type="text" class="form-control" placeholder="title..." style="width: 100%" >   \
                    </div>   \
                    <div class="form-group">   \
                        <label for="description-input">Description</label>   \
                        <textarea id="description-input" class="form-control" placeholder="Description..."  rows="7" style=";"></textarea>   \
                    </div>   \
                    <div class="form-group">   \
                      <label id="keywords" for="keywords-input">Keywords</label>   \
                      <input id="keywords-input" type="text" class="form-control" placeholder="keywords..." >   \
                    </div>   \
                    <div class="form-group">   \
                      <label id="is_public" for="is-public-input">Public</label>   \
                      <input id="is-public-input" type="checkbox" class="form-control" placeholder="keywords..." >   \
                    </div>   \
                    <div class="form-group">   \
                      <label id="thumbnail" for="thumbnail-img">thumbnail</label><br/>   \
                      <img id="thumbnail-img" src="" style="max-width:150px; max-height:150px;" />   \
                    </div>   \
                  </div>   \
                  <div class="modal-footer">   \
                    <button id="edit-video-metadata-modal-cancel-btn" type="button" class="btn btn-light" data-bs-dismiss="modal">Cancel</button>   \
                    <button id="edit-video-metadata-modal-save-btn" type="button" class="btn btn-primary" data-bs-dismiss="modal">Save</button>   \
                  </div>   \
                </div>   \
              </div>   \
            </div>'
         }


        function createPostEditMetadataModals()
        {
            console.log("createPostEditMetadataModals()");
            var html = '<div id="edit-post-metadata-modal" class="modal fade" >   \
                  <div class="modal-dialog modal-xl modal-dialog-centered">   \
                    <div class="modal-content">   \
                      <div class="modal-header">   \
                        <h5 class="modal-title">Edit</h5>   \
                        <button type="button" class="btn btn-close btn-light" class="close" data-bs-dismiss="modal" aria-label="Close"><span aria-hidden="true"></span></button>   \
                      </div>   \
                      <div class="dashboard-blocks">   \
                          <div class="block block-1"></div>   \
                          <div class="block block-2"></div>   \
                          <div class="block block-3"></div>   \
                          <div class="block block-4"></div>   \
                          <div class="block block-5"></div>   \
                      </div>   \
                      <div class="modal-body">   \
                        <input id="pid" type="hidden" class="form-control" value="" >   \
                        <input id="title" type="hidden" class="form-control" value="" >   \
                        <input id="description" type="hidden" class="form-control" value="" >   \
                        <input id="thumbnail" type="hidden" class="form-control" value="" >   \
                        <input id="content" type="hidden" class="form-control" value="" >   \
                        <div class="form-group">   \
                          <label id="content" for="title-input">Post</label>   \
                          <input id="content-input" type="text" class="form-control" placeholder="post..." style="width: 100%" >   \
                        </div>   \
                        <div class="form-group">   \
                          <label id="title" for="title-input">Title</label>   \
                          <input id="title-input" type="text" class="form-control" placeholder="title..." style="width: 100%" >   \
                        </div>   \
                        <div class="form-group">   \
                            <label for="description-input">Description</label>   \
                            <textarea id="description-input" class="form-control" placeholder="Description..."  rows="7" style=";"></textarea>   \
                        </div>   \
                        <div class="form-group">   \
                          <label id="keywords" for="keywords-input">Keywords</label>   \
                          <input id="keywords-input" type="text" class="form-control" placeholder="keywords..." >   \
                        </div>   \
                        <!--div class="form-group">   \
                          <label id="is_public" for="is-public-input">Public</label>   \
                          <input id="is-public-input" type="checkbox" class="form-control" placeholder="keywords..." >   \
                        </div-->   \
                        <div class="form-group">   \
                          <label id="thumbnail" for="thumbnail-img">thumbnail</label><br/>   \
                          <img id="thumbnail-img" src="" style="max-width:150px; max-height:150px;" />   \
                        </div>   \
                      </div>   \
                      <div class="modal-footer">   \
                        <button id="edit-post-metadata-modal-cancel-btn" type="button" class="btn btn-light" data-bs-dismiss="modal">Cancel</button>   \
                        <button id="edit-post-metadata-modal-save-btn" type="button" class="btn btn-primary" data-bs-dismiss="modal">Save</button>   \
                      </div>   \
                    </div>   \
                  </div>   \
                </div>'

                return html;
        }

        function createCommentsInput()
        {
           return "<div class='container px-4'>   \
                         <div id='container-ui-options' class='row gx-5'> \
                            <div class='col'>   \
                              <a id='posts-btn' ><span class='material-icons'>chat</span></a>   \
                              <a id='videos-btn' ><span class='material-icons'>smart_display</span></a>    \
                            </div>    \
                         </div>    \
                     </div>"
        }

        function createVideosInput()
        {
           return "<div class='container px-4'>   \
                         <div id='container-ui-options' class='row gx-5'> \
                            <div class='col'>   \
                              <a id='tile-btn' ><span class='material-icons'>dashboard</span></a>   \
                              <a id='list-btn' ><span class='material-icons'>image</span></a>    \
                            </div>    \
                         </div>    \
                         <!--div class='row gx-5'>   \
                             <div class='col'>    \
                                <div class='p-3 border bg-light'>   \
                                     <div id='comment-container' class='form-floating'>    \
                                         <textarea class='form-control' placeholder='Leave a comment here' style='min-height: 100px'></textarea>   \
                                         <label for='floatingTextarea2'>Create a Post</label>   \
                                     </div>   \
                                     <div id='card-container' class='collapse'>   \
                                           ...  \
                                     </div>  \
                                     <div id='actions-container' class='float-end'>   \
                                        <button id='send-btn' type='button' class='btn btn-primary'>Send</button>   \
                                     </div>   \
                                </div>   \
                             </div>   \
                         </div-->   \
                     </div>"
        }

        function createNewsFeedInput()
        {
           return "<div class='container px-4'> \
                         <div id='container-ui-options' class='row gx-5'> \
                            <div class='col'> \
                              <a id='tile-btn' ><span class='material-icons'>dashboard</span></a>   \
                              <a id='list-btn' ><span class='material-icons'>image</span></a>   \
                            </div>  \
                         </div>  \
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

        function searchError()
        {
            renderMessage( "#title", "Search Error" );
            cleanSearchResults();
        }

        function cleanSearchResults()
        {
            _elms.empty().append("<img src='/img/spinner.gif' />");
        }

        function shortenText(text, max_char)
        {
            var tmp = text;
            if( text.length > max_char ){
                tmp = text.substring(0, max_char) + '...';
            }
            return tmp;
        }

        function markNoteAsRead($userid, $nid, $config, $cb)
        {
            console.log("$.newsfeed::markNoteAsRead():userid:",userid,", nid:", $nid)
            _notes.markNoteAsRead($userid, $nid, $config )
        }

        function markNoteAsUnread($userid, $nid, $config, $cb)
        {
            console.log("$.newsfeed::markNoteAsUnread():userid:",userid,", nid:", $nid)
            _notes.markNoteAsUnread($userid, $nid, $config )
        }

        function NewsfeedAds()
        {

          if( _show_house_ads ){
            return HouseNewsfeedAd()
          }

          return GoogleInNewsfeedAd()
        }

        //just show a image or something
        function HouseNewsfeedAd(){

            var ads = [ ad_url  : "https://video.lindsayfilm.com/w/PC0142?ref=ads-newsfeed",
                        img_url : "https://media.lindsayfilm.com/videos/podcast/ads/houseAds/Ads_just_kidding.png",
                        ad_url  : "https://video.lindsayfilm.com/w/PC0001?ref=ads-newsfeed",
                        img_url : "https://media.lindsayfilm.com/videos/podcast/ads/houseAds/Ads_mind_control.png",
                        ad_url  : "https://video.lindsayfilm.com/w/PC0134?ref=ads-newsfeed",
                        img_url : "https://media.lindsayfilm.com/videos/podcast/ads/houseAds/Ads_pied_piperl.png"]

            var r = Math.floor( Math.random() s* ads.length );
            var ad = ads[r]

            return '<div class="box postcard videocard">  \
                        <a hre="${ad_url}"><img src="${img_url}" /></a>  \
                    </div>'.split("${img_url}").join(ad.ad_url)
                           .split("${ad_url}").join(ad_url)
        }

        //this is being placed in the newsfeeds
        function GoogleInNewsfeedAd()
        {
          return '<div class="box postcard videocard">  \
                    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script>  \
                      <ins class="adsbygoogle"  \
                           style="display:block"  \
                           data-ad-format="fluid"  \
                           data-ad-layout-key="-5p+cg-g-6j+kl"  \
                           data-ad-client="ca-pub-1385994184650855"  \
                           data-ad-slot="3522369812"></ins>  \
                      <script>  \
                           (adsbygoogle = window.adsbygoogle || []).push({});  \
                      </script>  \
                  </div>'
        }

        //we may want to place this in the video description
        function GoogleInArticalAd()
        {
          return '<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script>  \
                    <ins class="adsbygoogle"  \
                         style="display:block; text-align:center;"  \
                         data-ad-layout="in-article"  \
                         data-ad-format="fluid"  \
                         data-ad-client="ca-pub-1385994184650855"  \
                         data-ad-slot="2122777796"></ins>  \
                    <script>  \
                         (adsbygoogle = window.adsbygoogle || []).push({});  \
                    </script>'
        }

        function GoogleSearchAd()
        {
          return '<script async src="https://cse.google.com/cse.js?cx=e331d49f1e2e30ed1"></script>  \
                  <div class="gcse-search"></div>'
        }


        return {
              focus:focus,
              updateFeed : updateFeed,
              markNoteAsRead : markNoteAsRead,
              markNoteAsUnread : markNoteAsUnread

          }
       }

})(jQuery);
