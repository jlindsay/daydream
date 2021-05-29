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
       var _users;
       //var _username;
       var _connected = false;
       var _is_typing = false;
       var _lastTypingTime;

       var _ui;
       var $messages;
       var $inputMessage;
       var $card;
       var _card_metadata;

       var _nfm = new NewsFeedManager();

       var TYPING_TIMER_LENGTH = 400;

           init( $userid, $config )


      function init( $userid, $config )
      {
          console.log("$.fn.chat::userid: ", $userid, ", config:", $config);
          _config      = $config ? $config : {};
          _userid      = $userid ? $userid : null;

          //_userid = 'JACK01'
          _user   = lookupUser(_userid)

          _socket.emit('add-user', _user );

          initUI()

          //sample conversation...
/*
          log( _userid, "chat-message", "Hello Locke", $config)
          log( _userid, "client-new-day", "Today", $config)

          log( 'L0CK01', "chat-message", "Hello Jack", $config)
          log( _userid, "chat-message", "Well good to hear from you, lets talk soon.",  $config)
*/
      }

      function initUI()
      {
          _elm.empty().html( createUI() )

          _ui_elm        = _elm.find('#chat-container')
          $inputMessage  = _ui_elm.find("input.publisher-input")
          //$input.empty();

          $card = _ui_elm.find(".card-preview")

          $messages = _ui_elm.find("#chat-content")
          $messages.empty()
          $('.user-avatar').attr('src', _user.profile_url )

          // Keyboard events
          var _card_loading;
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
        //var message = $inputMessage.val();
        // Prevent markup from being injected into the message
            //message = cleanInput(message);
        // if there is a non-empty message and a _socket connection

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
          log( data.user.userid, "user-joined", data.user.username +" joined", {} );
          //addParticipantsMessage(data);
      });

      // Whenever the server emits 'user left', log it in the chat body
      _socket.on('user-left', function(data)
      {
           console.log("$.fn.chat::user-left():data:", data)
           log(_userid, "stop-typing", data.user.username + " stopped typing")
           log(_userid, "user-left", data.user.username + " has left")
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

      function chatMessage( $userid, $msg, $config)
      {
          console.log("chatMessage:msg:", $msg, ", config:", $config )
          var user = lookupUser($userid)

          var html = "<div class='media media-chat'>   \
                        <img class='avatar' src='" + user.profile_url + "' alt='"+ user.first_name +"'>   \
                        <div class='media-body'>"

                html +=   "<p>"+$msg+"</p>"

                if( $config && $config.card ){

                    html +=  "<p class='card-message'> \
                                  <img src='${thumbnail_url}' />   \
                                  <span class='title'>${title}</span>   \
                                </p>".split("${title}").join($config.card.title)
                                      .split("${thumbnail_url}").join($config.card.thumbnail_url)

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
                                      <input class='publisher-input' type='text' placeholder='Write something'>  \
                                      <span class='publisher-btn file-group'>  \
                                        <i class='fa fa-paperclip file-browser'></i>  \
                                        <input type='file'> </span>  \
                                        <a class='publisher-btn' href='#' data-abc='true'>  \
                                          <i class='fa fa-smile'></i></a>  \
                                          <a class='publisher-btn text-info' href='#' data-abc='true'>  \
                                            <i class='fa fa-paper-plane'></i>  \
                                          </a>  \
                                    </div>  \
                              </div>  \
                          </div>  \
                      </div>  \
                  </div>  \
                </div>  \
              "
      }

/*
      // Sets the client's username
      function setUsername()
      {
          _username = cleanInput( $usernameInput.val().trim() );

        // If the username is valid
        if( _username ) {
            $loginPage.fadeOut();
            $chatPage.show();
            $loginPage.off('click');
            $currentInput = $inputMessage.focus();

            // Tell the server your username
            _socket.emit('add-user', _username);
        }
      }

      // Prevents input from having injected markup
      function cleanInput(input)
      {
          return $('<div/>').text(input).html();
      }
*/
//      var $currentInput = $usernameInput.focus();
/*
      function addParticipantsMessage(data)
      {
        var message = '';
        if (data.numUsers === 1) {
            message += `there's 1 participant`;
        } else {
            message += `there are ${data.numUsers} participants`;
        }
        log(message);
      }
*/


/*
      // Sends a chat message
      function sendMessage (){
        var message = $inputMessage.val();
        // Prevent markup from being injected into the message
            message = cleanInput(message);
        // if there is a non-empty message and a _socket connection
        if( message && connected ){
            $inputMessage.val('');
            addChatMessage({ _username, message });
            // tell server to execute 'new message' and send along one parameter
            _socket.emit('new-message', message);
        }
      }


       // Log a message
       function log (message, options)
       {
         var $el = $('<li>').addClass('log').text(message);
         addMessageElement($el, options);
       }

       // Adds the visual chat message to the message list
       function addChatMessage(data, options)
       {
           console.log("$.fn.chat::addChatMessage: ", data, ", options:", options);
           // Don't fade the message in if there is an 'X was typing'
           var  $typingMessages = getTypingMessages(data);\

           if ($typingMessages.length !== 0) {
             options.fade = false;
             $typingMessages.remove();
           }

           var $usernameDiv = $('<span class="username"/>')
               .text(data.username)
               .css('color', getUsernameColor(data.username));

           var $messageBodyDiv = $('<span class="messageBody">')
              .text(data.message);

           var typingClass = data.typing ? 'typing' : '';
           var $messageDiv = $('<li class="message"/>')
               .data('username', data.username)
               .addClass(typingClass)
               .append($usernameDiv, $messageBodyDiv);

               addMessageElement($messageDiv, options);
       }

       // Adds the visual chat typing message
       function addChatTyping(data)
       {
         console.log("$.fn.chat::addChatTyping: ", data);
         data.typing = true;
         data.message = 'is typing';
         addChatMessage(data);
       }

       // Removes the visual chat typing message
       function removeChatTyping(data)
       {
           getTypingMessages(data).fadeOut(function () {
              $(this).remove();
           });
       }

       function addMessageElement(el, options)
       {
           console.log("$.fn.chat::addMessageElement:el:", el, ", options:", options);
           var $el = $(el);
           // Setup default options
           if (!options) {
             options = {};
           }
           if (typeof options.fade === 'undefined') {
             options.fade = true;
           }
           if (typeof options.prepend === 'undefined') {
             options.prepend = false;
           }

           // Apply options
           if (options.fade) {
             $el.hide().fadeIn(FADE_TIME);
           }
           if (options.prepend) {
             $messages.prepend($el);
           } else {
             $messages.append($el);
           }

           $messages[0].scrollTop = $messages[0].scrollHeight;
       }

       // Updates the typing event
       function updateTyping()
       {
            console.log("$.fn.chat::updateTyping:el:", el, ", options:", options);
            if (connected) {
               if (!typing) {
                   typing = true;
                   _socket.emit('typing');
               }
               lastTypingTime = (new Date()).getTime();

               setTimeout( function(){
                   var typingTimer = ( new Date()).getTime();
                   var timeDiff = typingTimer - lastTypingTime;

                   if (timeDiff >= TYPING_TIMER_LENGTH && typing) {
                     _socket.emit('stop-typing');
                     typing = false;
                   }

               }, TYPING_TIMER_LENGTH);

            }
       }

       // Gets the 'X is typing' messages of a user
       function getTypingMessages(data)
       {
         console.log("$.fn.chat::getTypingMessages:data:", data);
         return $('.typing.message').filter(function (i) {
           return $(this).data('username') === data.username;
         });
       }

       // Gets the color of a username through our hash function
       function getUsernameColor($username)
       {
          console.log("$.fn.chat::getUsernameColor:username:", $username);
          // Compute hash code
          var hash = 7;
          for (var i = 0; i < $username.length; i++) {
            hash = $username.charCodeAt(i) + (hash << 5) - hash;
          }
          // Calculate color
          var index = Math.abs(hash % COLORS.length);
          return COLORS[index];
       }

       // Keyboard events

       $(window).keydown(function(e)
       {
         console.log("$.fn.chat::keydown:");
         // Auto-focus the current input when a key is typed
         if (!(e.ctrlKey || e.metaKey || e.altKey)) {
           $('currentInput').focus();
         }
         // When the client hits ENTER on their keyboard
         if (e.which === 13) {
           if (_username) {
             sendMessage();
             _socket.emit('stop-typing');
             typing = false;
           } else {
             setUsername();
           }
         }
       });

       $('inputMessage').on('input', function(e) {
          console.log("$.fn.chat::input:");
          updateTyping();
       });

       // Click events

       // Focus input when clicking anywhere on login page
       $('loginPage').click( function(e){
          console.log("$.fn.chat::loginPage:click()");
          $('currentInput').focus();
       });

       // Focus input when clicking on the message input's border
       $('inputMessage').click(function(e) {
          console.log("$.fn.chat::inputMessage:click()");
          $('inputMessage').focus();
       });
*/
       // _socket events

       // Whenever the server emits 'login', log the login message



       function lookupUser($userid){

           _users = { "JDL007" : { userid       : "JDL007",
                                   username     : "jlindsay",
                                   first_name   : "Joshua",
                                   last_name    : "Lindsay",
                                   full_name    : "Joshua Lindsay",
                                   profile_url  : 'https://media.lindsayfilm.com/content/jlindsay/josh_lindsay.jpg' },

                      "JACK01" : { userid       : "JACK01",
                                   username     : "jack",
                                   first_name   : "Jack",
                                   last_name    : "Shephard",
                                   full_name    : "Jack Shephard",
                                   profile_url  : 'https://media.lindsayfilm.com/content/jlindsay/jack-sheapard.png' },

                      "L0CK01" : { userid       : "L0CK01",
                                   username     : "locke",
                                   first_name   : "John",
                                   last_name    : "Locke",
                                   full_name    : "John Locke",
                                   profile_url  : 'https://media.lindsayfilm.com/content/jlindsay/john-locke.png' } }

           return _users[$userid]
       }

   }
});
