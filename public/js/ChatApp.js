/**
 * author:Joshua Lindsay
 * email:j@lindsayfilm.com
 * http://lindsayfilm.com
 * Software can be used for Good or Evil.
 * Some people die rich, some die poor, the result is the same.
 */

define('ChatApp',  ['jquery', 'EventDispatcher', 'ChatClient', 'jquery.tmpl.min' ] , function( $, EventDispatcher, ChatClient ){
//    _chatApp = new ChatApp();
//    _chatApp.init({ url : "http://127.0.0.1:8081" });

    function ChatApp()
    {
        var _conversations = [];
        var _chatClient;
//      var _isGameMenuOpen = false;
        var _currentGameUID = null;
        var _socket_url = "http://127.0.0.1:8081";

        var _isConnected;
        var _remeberMe;
        var _password;
        var _session_id;

        function init( $config )
        {
            console.log( "debug:ChatApp:init()" );
            $config = $config || {};

            _remeberMe = $config.remeberMe || _remeberMe;
            _password = $config.password || _password;

            _socket_url = $config.socket_url || _socket_url;
            _session_id  = $config.session_id || _session_id;

            console.log("_socket_url:",_socket_url );

            _chatClient = new ChatClient();
            _chatClient.init( {socket_url:_socket_url} );

            _chatClient.on("connect", function(){
                console.log("debug:ChatApp:connected:");
                _isConnected = true;
                login();
//            $('#connection-status')[0].innerHTML = "Connected";
            } );

            _chatClient.on("update-contacts", renderContacts );
            _chatClient.on("update-contact-info", updateContactInfo );
            _chatClient.on("loggedin", onLoggedin );

            _chatClient.on("private-message", renderPrivateMessage );

/*
            if( _remeberMe ){
                login();
            }
*/
        }


        function login($config)
        {
            console.log( "debug:ChatApp:login()" );
/*
            var userid  = $.trim( $("#login-status .userid").val() );
            var pwd     = $.trim( $("#login-status .user-pwd").val() );
*/
/*
            if(_userid && $config.password ){
                _chatClient.login( userid,  $config.password );
            }
            if(_userid && _session_id ){
                _chatClient.login( userid,  $config.password );
            }
*/
        }

        function onLoggedin( data )
        {
            console.log("debug:ChatApp:onLoggedin:data:", data );
/*
            if( data.status == "success" )
            {
                $("#login-status").addClass("hidden");
                $("#chat-menu").removeClass("hidden");
                $("#game-menu").removeClass("hidden");
                $("#user_name")[0].innerHTML = String( _chatClient.userInfo().first_name + " " + _chatClient.userInfo().last_name );
                getGames();
            }else{
                $("#login-status .status-error-message").removeClass("hidden");
                $("#login-status .status-login-message").addClass("hidden");
            }
*/
        }



        function updateContactInfo(contactInfo)
        {
            console.log( "debug:ChatApp:updateContactInfo:contactInfo:" , contactInfo );
/*
            updateContactOnlineStatus( contactInfo.friend_uid, contactInfo.isOnline );
*/
        }

        function renderContacts( contacts )
        {
            console.log( "debug:ChatApp:renderContacts()", contacts);
/*
            var html = "";
            for(var i=0; i< contacts.length; i++)
            {
                var contact = contacts[i];
                var onlineClass = (contact.isOnline)? "online": "offline";
                    html += "<a id='contact-" + contact.friend_uid + "' class='contact "+onlineClass+"'>" + contact.first_name + " " + contact.last_name + "</a>";
            }

            $("#chat-menu .contacts .contacts-body")[0].innerHTML = html;

            $("#chat-menu .contacts .contacts-body .contact").click( function(e){
                    e.preventDefault();
                var uid = String(e.target.id).split("contact-").join("");
                    openPrivateMessage( uid );
            });
*/
        }

        function renderPrivateMessage(data)
        {
            console.log( "debug:ChatApp:renderPrivateMessage:data:", data );
/*
            var contact = _chatClient.findContact( data.from_uid );
                openPrivateMessage( contact.friend_uid );
                addPrivateMessage( contact.friend_uid, { from: contact.first_name , message : data.message } );
*/
        }

        function openPrivateMessage( friend_uid )
        {
            console.log( "debug:ChatApp:openPrivateMessage:friend_uid:", friend_uid );
/*
            var contact = _chatClient.findContact( friend_uid );

            if( contact.isOnline ){
                if( !_conversations[contact.friend_uid] )
                {
                    createWindow( contact );
                    addPreviousMessages(contact.friend_uid);
                }else{
                    console.log("conversation with "+ contact.first_name +" already in progress.");
                }
            }else{
                alert(contact.first_name + " is currently not online.");
            }
*/
        }

        function addPreviousMessages(friend_uid)
        {
            console.log("debug:ChatApp:addPreviousMessages()friend_uid:", friend_uid );
/*
            var contact = _chatClient.findContact( friend_uid );
                contact.messages = (contact.messages)? contact.messages: [];
            var total_messages = ( contact.messages ).length;//addPrivateMessage updates the array, which will mess with the loop
            for(var i=0; i < total_messages; i++ ){
                var messageInfo = contact.messages[i];
                    addPrivateMessage( friend_uid , messageInfo );
                }
*/
    }

        function addPrivateMessage( friend_uid, info )
        {
            console.log("debug:ChatApp:addPrivateMessage()", friend_uid );
/*
            var contact = _chatClient.findContact( friend_uid );
                contact.messages = (contact.messages)? contact.messages: [];//garding against an null array
                contact.messages.push(info);

            var name = '#private-chat-' + friend_uid + ' .window-body .incomingChatMessages';
            var elm = $( name );
                elm.append($('<li></li>').text( info.from + " :" + info.message ));
*/
        }


        return {    init: init,
                    login : login
        }
    }

        return ChatApp;
    });
