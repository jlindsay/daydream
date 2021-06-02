$(function() {

  $.fn.extend({
      chat: function(options,arg) {
           if (options && typeof(options) == 'object') {
               options = $.extend( {}, $.myplugin.defaults, options );
           }

           this.each(function() {
               new $.autopost(this, options, arg );
           });
           return;
       }
  });


  $.fn.chat = function( $userid, $config ) {

       var _elm = this;

       var _socket = io();

       var _config      = $config ? $config : {};
       var _userid      = $userid ? $userid : null;
       var _friends   = []
       var _freinds = []
       var _friends_hash = {}
       var _whosOnline={};

       //var _username;
       var _connected = false;
       var _is_typing = false;
       var _lastTypingTime;

       var _ui;
       var $chat;
       var $friends;
       var $messages;
       var $inputMessage;
       var $userAvatar;

       var $card;
       var _card_metadata;

       var _nfm = new NewsFeedManager();
       var _chat = new ChatManager();

       var TYPING_TIMER_LENGTH = 400;
       var DEFAULT_LIMIT = 10;

           init( $userid, $config )
/*
      function login()
      {
        console.log("login():fix me: login needs to be implimented...")
      }
*/
      function init( $userid, $config )
      {
          console.log("$.fn.chat::userid: ", $userid, ", config:", $config);
          _config      = $config ? $config : {};
          _userid      = $userid ? $userid : null;

          initUI()

          getUserInfo( _userid, function($userInfo){
              console.log("$.fn.chat::getUserInfo:success:userInfo:", $userInfo);
              _user = $userInfo;
              $userAvatar.attr('src', _user.profile_url )
              console.log("$userAvatar:",$userAvatar, ", profile_url:", _user.profile_url )
              _socket.emit('add-user', _user );
              try{
                  _config.onGetUserInfo(_user);
              }catch(e){}

              getUserFrineds(_userid, function($friends){
                  console.log("$.fn.chat::getUserFrineds:success:friends:", $friends);
                  _friends = $friends;
                  _friends_hash = convert2hash($friends)
                  try{
                      _config.onGetUserFrineds(_friends);
                  }catch(e){}
                  renderFriends()

                  ready();
              })
          })

/*
          _user   = lookupUser( _userid )
          _socket.emit('add-user', _user );

          initUI()
*/
          //sample conversation...
/*
          log( _userid, "chat-message", "Hello Locke", $config)
          log( _userid, "client-new-day", "Today", $config)

          log( 'L0CK01', "chat-message", "Hello Jack", $config)
          log( _userid, "chat-message", "Well good to hear from you, lets talk soon.",  $config)
*/
      }

      function renderFriends()
      {
          console.log("$.fn.chat::renderFriends()");
          var html = '';
          for( var i=0; i< _friends.length;  i++ )
          {
              var friend = _friends[i]
                  html += "<div class='contact' >\
                              <a href='#'>\
                              <img class='avatar avatar-xs user-avatar' src='${profile_url}' />\
                              <span>${full_name}</span>\
                              </a>\
                           </div>".split("${profile_url}").join(friend.profile_url )
                                  .split("${full_name}").join(friend.full_name )
          }

          $friends.find('#contacts-content').html(html)
      }

      function initUI()
      {
          console.log("$.fn.chat::initUI()");

          _elm.empty()
              .append( createContactsUI() )
              .append( createUI() )

          $friends       = _elm.find('#friends-container')
          $chat          = _elm.find('#chat-container')

          $inputMessage  = $chat.find("input.publisher-input")

          $card = $chat.find(".card-preview")

          $messages = $chat.find("#chat-content")
          $messages.empty()

          $userAvatar = $chat.find(".user-avatar")
/*
          $('.user-avatar').attr('src', _user.profile_url )
*/
          var _card_loading;

          $chat.find("a.publisher-btn").click(function(e){
                  e.preventDefault();
              var elm = $(e.target)
              var msg = $inputMessage.val();
              //var elm.closest(".publisher").find()
              console.log("click():msg:", msg)
              sendMessage( msg , _card_metadata );
          })

          // Keyboard events

          $(window).keydown(function($e)
          {
              //console.log("$.fn.chat::keydown:");
              // Auto-focus the current input when a key is typed
              if (!($e.ctrlKey || $e.metaKey || $e.altKey)) {
                  $('currentInput').focus();
              }

              _nfm.findCardOnKeyEvent( $e, {type:"post"}, function($_card, $metadata){
                  _card_metadata = $metadata;
                  //console.log("findCardOnKeyEvent:", $metadata)
                  $card.find("img").attr( "src", _card_metadata.thumbnail_url )
                  $card.find("span.title").html( _nfm.shortenText( _card_metadata.title, 25 ) )
                  $card.addClass("is-open")
                  $card.fadeIn();
              })

              // When the client hits ENTER on their keyboard
              if ($e.which === 13) {
                  if( _user ){
                      var msg = $inputMessage.val();
                          $inputMessage.val('');
                          sendMessage( msg , _card_metadata );
                          _socket.emit('stop-typing');
                          _typing = false;

                      //if( $card.hasClass("is-open")){
                          $card.hide();
                          $card.removeClass("is-open")
                          _card_metadata = null
                      //}

                  } else {
                      //setUsername();
                  }
              }
          });

          $inputMessage.on('input', function(e) {
               //console.log("$.fn.chat::input:");
               updateTyping();
          });

          // Focus input when clicking on the message input's border
          $inputMessage.click(function(e) {
               //console.log("$.fn.chat::inputMessage:click()");
               $inputMessage.focus();
          });
      }

      // Updates the typing event
      function updateTyping()
      {
           //console.log("$.fn.chat::updateTyping:");
           if( _connected ) {
              if(!_is_typing) {
                  _is_typing = true;
                  _socket.emit('typing');
              }

              _lastTypingTime = (new Date()).getTime();

              setTimeout( function(){
                  var typingTimer = ( new Date()).getTime();
                  var timeDiff = typingTimer - _lastTypingTime;

                  if( timeDiff >= TYPING_TIMER_LENGTH && _is_typing ){
                    _socket.emit('stop-typing');
                    _is_typing = false;
                  }

              }, TYPING_TIMER_LENGTH);

           }
      }

      function sendMessage($msg, $metadata)
      {

        if( $msg && _connected ){
            $inputMessage.val('');

            log( _userid, "chat-message",  $msg, { card : $metadata} );
            // tell server to execute 'new message' and send along one parameter
            _socket.emit('new-message', { user:_user, message: $msg, card : $metadata });
        }
      }

      function log( $userid, $type, $msg, $data )
      {
          var html = "";
          switch( $type ){
//            case "new-message":
            case "typing":
              html = "<div class='media media-meta-day is-typing'>"+$msg+"</div>";
              break;
            case "stop-typing":
              //html = "<div class='media media-meta-day is-typing'>"+$msg+"</div>";\
              $messages.find(".is-typing").remove()
              break;
            case "user-joined":
            case "user-left":
            case "disconnect":
            case "reconnect":
            case "reconnect_error":
            case "login":
            case "client-message":
                html = "<div class='media media-meta-day'>"+$msg+"</div>";
              break;
            case "client-new-day":
                html = "<div class='media media-meta-day'>Today</div>";
              break;
            case "new-message":
            case "chat-message":
            default:
                html = chatMessage( $userid, $msg, $data);
              break;
          }

          $messages.append( html )

          $messages.scrollTop($messages[0].scrollHeight);

          try{
              _config.onChatMessage($userid, $type, $msg, $data)
          }catch(e){}

      }

      function addParticipantsMessage( $data, $config)
      {
          console.log("$.fn.chat::addParticipantsMessage:data:",$data)
          var message = '';
          if( $data.numUsers === 1 ) {
              message += `there's 1 participant`;
          } else {
              message += "there are "+ $data.numUsers +" participants";
          }

          log( _userid, "client-message" , message, $config);
      }

      //listen to the socket messages
      _socket.on('login', function(data)
      {
           console.log("$.fn.chat::login():data:", data)
           _connected = true;
           // Display the welcome message
           log( _userid, "login", 'Welcome Back '+ data.user.first_name );
           addParticipantsMessage(data);
      });

      // Whenever the server emits 'new message', update the chat body
      _socket.on('new-message', function(data)
      {
          console.log("$.fn.chat::new-message():data:", data)
          //addChatMessage(data);
          log( data.user.userid, "new-message", data.message, data)
      });

      // Whenever the server emits 'user joined', log it in the chat body
      _socket.on('user-joined', function(data)
      {
          console.log("$.fn.chat::new-message():data:", data)
          updateWhosOnline( data.user.userid )

          if( isUserFriend(data.user.userid) ){
            //update contact/friend list status
            //alert user contact/friend is online
          }
          
          log( data.user.userid, "user-joined", data.user.username +" joined", {} );
          //addParticipantsMessage(data);
      });

      // Whenever the server emits 'user left', log it in the chat body
      _socket.on('user-left', function(data)
      {
           console.log("$.fn.chat::user-left():data:", data)
           log( _userid, "stop-typing", data.user.username + " stopped typing")
           log( _userid, "user-left", data.user.username + " has left")
      });

      // Whenever the server emits 'typing', show the typing message
      _socket.on('typing', function(data)
      {
           console.log("$.fn.chat::user-typing():data:", data)
           log(_userid, "typing", data.user.username + " is typing")
      });

      // Whenever the server emits 'stop typing', kill the typing message
      _socket.on('stop-typing', function(data)
      {
           console.log("$.fn.chat::user-stop-typing():data:", data)
           log( _userid, "stop-typing", data.user.username + " stopped is typing")
      });

      _socket.on('disconnect', function()
      {
           console.log("$.fn.chat::user-disconnect():")
           log( _userid, "disconnect",'you have been disconnected');
      });

      _socket.on('reconnect', function(){
           console.log("$.fn.chat::user-reconnect():")

           log('you have been reconnected');
           if( _user ) {
               _socket.emit('add-user', _user);
           }
      });

      _socket.on('reconnect_error', function(e)
      {
           console.log("$.fn.chat::user-reconnect-error:(e):e:",e)
           log( _userid, "reconnect_error" ,'attempt to reconnect has failed' );
      });

      function whosOnline()
      {
          return _whosOnline;
      }


      function updateWhosOnline($userid)
      {
          _whosOnline[$userid]
      }

      function isUserFriend($userid, $data)
      {
           console.log( "$.fn.chat::isUserFriend:():userid:", $userid )
           return Boolean( _friends_hash[$userid] )
      }

      function chatMessage( $userid, $msg, $config)
      {
          console.log("$.fn.chat::chatMessage::userid:", $userid, ", msg:", $msg, ", config:", $config )
          var user = lookupUser($userid)
          console.log(user)

          var html = "<div class='media media-chat'>   \
                        <img class='avatar' src='" + user.profile_url + "' alt='"+ user.first_name +"'>   \
                        <div class='media-body'>"

                html +=   "<p>"+$msg+"</p>"

                if( $config && $config.card ){

                    html +=  "<p class='card-message'> \
                                  <a href='${request_url}'><img src='${thumbnail_url}' /></a>   \
                                  <span class='title'>${title}</span>   \
                                </p>".split("${title}").join($config.card.title)
                                      .split("${thumbnail_url}").join($config.card.thumbnail_url)
                                      .split("${request_url}").join($config.card.request_url)

                }

                if($config && $config.time_stamp){
                   html += "<p><time datetime='2018'>1:58pm</time></p>"
                }

              html += "</div></div>"

          if( user.userid != _userid ){
              html = $(html).addClass("media-chat-reverse").prop('outerHTML');
          }

          return html;
      }


      function createUI()
      {
          return "  \
                <div id='chat-container' class='page-content page-container' >  \
                  <div class='padding'>  \
                      <div class='row container d-flex justify-content-center'>  \
                          <div class='col-md-6'>  \
                              <div class='card card-bordered'>  \
                                  <div class='card-header'>  \
                                      <h4 class='card-title'><strong>Chat</strong></h4>  \
                                      <!--a class='btn btn-xs btn-secondary' href='#' data-abc='true'>Let's Chat App</a-->  \
                                  </div>  \
                                  <div id='chat-content' class='ps-container ps-theme-default ps-active-y' style='overflow-y: scroll !important; height:400px !important;'>  \
                                              <span>...</span>\
                                  </div>  \
                                  <div class='card-preview collapse'> \
                                    <img src='' />   \
                                    <span class='title'></span>   \
                                  </div> \
                                  <div class='publisher bt-1 border-light'>  \
                                      <img class='avatar avatar-xs user-avatar' src='https://img.icons8.com/color/36/000000/administrator-male.png' alt='...'>  \
                                      <input class='publisher-input' type='text' style='border-radius: 4px;border:solid 1px #eee;background-color:#fff' placeholder='Whats up?'>  \
                                      <a class='publisher-btn' href='#' data-abc='true'>  \
                                        <span class='material-icons'>send</span>   \
                                      </a>  \
                                    </div>  \
                              </div>  \
                          </div>  \
                      </div>  \
                  </div>  \
                </div>  \
              "
       }

       function createContactsUI()
       {
           return "  \
                 <div id='friends-container' class='page-content page-container' >  \
                   <div class='padding'>  \
                       <div class='row container d-flex justify-content-center'>  \
                           <div class='col-md-6'>  \
                               <div class='card card-bordered'>  \
                                   <div class='card-header'>  \
                                       <h4 class='card-title'><strong>Friends</strong></h4>  \
                                       <!--a class='btn btn-xs btn-secondary' href='#' data-abc='true'>Let's Chat App</a-->  \
                                   </div>  \
                                   <div id='contacts-content' class='ps-container ps-theme-default ps-active-y' style='overflow-y: scroll !important; height:400px !important;'>  \
                                               <span>...</span>\
                                   </div>  \
                                   <div class='publisher bt-1 border-light'>  \
                                   </div>  \
                               </div>  \
                           </div>  \
                       </div>  \
                   </div>  \
                 </div>  \
               "
        }

       function lookupUser($userid)
       {
           if( _userid == $userid ){
             return _user;
           }

           return _friends_hash[$userid]
       }

       function getUserInfo($userid, $cb)
       {
             console.log("$.fn.chat::getUserInfo():userid:", $userid);
             $config = $config || {};
         var limit  = $config.limit  || DEFAULT_LIMIT;
         var offset = $config.offset || 0;
             _chat.getUserInfo($userid, { success: $cb })
       }

       function getUserFrineds($userid, $cb)
       {
               console.log("$.fn.chat::getFrineds():userid:", $userid);
               $config = $config || {};
           var limit  = $config.limit  || DEFAULT_LIMIT;
           var offset = $config.offset || 0;
               _chat.getUserFrineds($userid, { limit:limit,
                                                 offset: offset,
                                                 success: $cb})
       }

       function ready()
       {
           try{
               _config.onReady();
           }catch(e){
               console.log("ready.error:", e);
           }
       }

       function convert2hash($friends)
       {
           var hash = {};
           for(var i=0;i<$friends.length;i++){
               var friend = $friends[i]
               hash[friend.userid] = friend;
           }
           return hash;
       }

       return {
//            login           : login,
            lookupUser      : lookupUser,
            getUserFrineds  : getUserFrineds
         }

   }
});
