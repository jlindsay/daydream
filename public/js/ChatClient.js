/**
 * author:Joshua Lindsay
 * email:j@lindsayfilm.com
 * http://lindsayfilm.com
 * Software can be used for Good or Evil.
 * Some people die rich, some die poor, the result is the same.
 */

define('ChatClient',  ["EventDispatcher", "socket.io"] , function( EventDispatcher, io ){

    function ChatClient()
    {
        var self                = this,
            _config             = {},
            _userInfo           = null,
            _isLoggedin         = false,
            _contacts           = [],
            _games              = [],
            _iosocket           = null,
            _socket_url         = "http://chat.crazyreds.com",
//            _socket_url         = "http://localhost:8080",
//            _socket_url         = "http://10.1.10.72:8080",
            _eventDispatcher    = new EventDispatcher();

        function init($config)
        {
            _config = $config || {};
            _socket_url = $config.socket_url || _socket_url;
            initSocket( _socket_url );
        }

        function initSocket( socket_url )
        {
            _iosocket = io.connect( socket_url );

            _iosocket.on("connect", function(){

                _iosocket.on( "disconnect", function(e){
                    _eventDispatcher.dispatchEvent("disconnect");
                } );

                _iosocket.on( "online", function(data) {
                    updateContactInfo( data.username, { isOnline:true } );
                });

                _iosocket.on( "offline", function(data) {
                    updateContactInfo( data.username, { isOnline:false } );
                });

                _iosocket.on( "loggedin", function(data){
                    console.log("loggedin:data:",data);
                    if(data.status == "success"){
                        initUser( data.user );
                    }else{
                        //failed
                    }
                    _eventDispatcher.dispatchEvent( "loggedin", data );
                } );


                _iosocket.on( "game-created", function(data){
                    console.log("game-created:data", data );
                    _eventDispatcher.dispatchEvent( "game-created", data );
                } );

                _iosocket.on( "update-contacts" , updateContacts );
                _iosocket.on( "update-games", updateGames );


                _iosocket.on( "private-message" , function( data ){
                    data.contact = findContactByUID( data.from_uid );
                    _eventDispatcher.dispatchEvent( "private-message", data );
                } );

                _iosocket.on( "player-joined-game" , function( data ){
//                    console.log("ChatClient.event:player-joined-game:", data );
                    _eventDispatcher.dispatchEvent( "player-joined-game", data );
                });

                _iosocket.on( "player-left-game" , function( data ){
//                    console.log("ChatClient.event:player-joined-game:", data );
                    _eventDispatcher.dispatchEvent( "player-left-game", data );
                });

                _eventDispatcher.dispatchEvent( "connect", null );

            });
        }

        function closeChat(friend_uid)
        {
//            console.log("closeChat():friend_uid:"+friend_uid);
/*            _iosocket.emit( "close-private-chat", { 'username' : username,
                                       'user_pwd' : pwd
            });
*/
        }

        function send(type, config)
        {
            config.from_uid = _userInfo.uid;
            _iosocket.emit( type, config );
        }

        function initUser( info ){
            _isLoggedin = true;
            _userInfo = info;
        }

        function isLoggedin(){
            return _isLoggedIn;
        }

        function userInfo(){
            return _userInfo;
        }

        function login( username, pwd ){
            _iosocket.emit( "login", { 'username' : username,
                                       'user_pwd' : pwd
            });
        }

        function getGames()
        {
            send( "get-games", { uid: _userInfo.uid } );
        }

        function joinGame( game_uid )
        {
            console.log( "ChatClient.joinGame:game_uid:" , game_uid );
            send("join-game", { game_uid:game_uid } );
        }

        function leaveGame( game_uid )
        {
            console.log("ChatClient.leaveGame:game_uid:", game_uid );
            send("leave-game", { game_uid:game_uid } );
        }

        function updateGames(data)
        {
            console.log("ChatClient.updateGames:data:", data);
            _games = ( data.status == "success" )? data.games : null;
//            onContacts( _contacts );
            _eventDispatcher.dispatchEvent('update-games',_games);
        }

        function findGameByUID(game_uid)
        {
            return _games[game_uid];
        }

        function updateContacts(data)
        {
            console.log("ChatClient.updateContacts:data:", data);
            _contacts = ( data.status == "success" )? data.contacts : null;
//            onContacts( _contacts );
            _eventDispatcher.dispatchEvent('update-contacts',_contacts);
        }

        function updateContactInfo( uid, config )
        {
            console.log("updateContactInfo():uid:"+uid + "config:", config);
            for( var i=0; i < _contacts.length; i++ )
            {
                var contact = _contacts[i];
                if( contact.friend_uid == uid )
                {
                    for( var prop in config ){
                         contact[prop] = config[prop];
                    }
                    _contacts[i] = contact;
                    _eventDispatcher.dispatchEvent("update-contact-info", contact );
                    return;
                }
            }
        }

        function findContactByUID( uid )
        {
            for( var i=0; i < _contacts.length; i++ )
            {
                var contact = _contacts[i];
                if( contact.friend_uid == uid )
                {
                    return contact;
                }
            }
            return;
        }

        function findContact( friend_id )
        {
            for( var i=0 ; i < _contacts.length; i++ )
            {
                var contact = _contacts[i];
                if( contact.friend_uid == friend_id ){
                    return contact;
                }
            }
            return null;
        }

        function newGame(username, config)
        {
            console.log("userInfo.uid:",_userInfo.uid );
            send( "new-game", { uid: _userInfo.uid } );
        }

        return{
                init                : init ,
                initUser            : initUser,
                send                : send,
                login               : login,
                userInfo            : userInfo,
                newGame             : newGame,
                joinGame            : joinGame,
                leaveGame           : leaveGame,
                getGames            : getGames,
                findGameByUID       : findGameByUID,
                findContactByUID    : findContactByUID,
                findContact         : findContact,
                isLoggedin          : isLoggedin,
                on                  : _eventDispatcher.addEventListener,
                cleanEventListners  : _eventDispatcher.clearEventListeners
        }

    }

   return ChatClient;

});
