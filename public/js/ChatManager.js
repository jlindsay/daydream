/**
 * author:Joshua Lindsay
 * email:j@lindsayfilm.com
 * http://lindsayfilm.com
 * Software can be used for Good or Evil.
 * Some people die rich, some die poor, the result is the same.
 */

function ChatManager( $config )
{
    var self = this;
    var _config = $config || {};

    var _userid = "";

    var _post = {};
    var _posts = [];

    var _user = {};
    var _users = [];
    var _frineds = [];
    var _frined = {};
    var _followers = [];
    var _following = [];

    //init( $config )

    function init( $config )
    {
        console.log("ChatManager:init()");
        _config = $config || {};
        _userid = $config.userid || null;
    }

    function followUser( $userid, $frined_id, $config)
    {
            console.log("ChatManager:followUser:userid:", $userid, $frined_id  );
            $config = $config || {};

        var limit  = $config.limit  || cons('DEFAULT_LIMIT');
        var offset = $config.offset || 0;

        $.ajax({
             url: cons("SOCIAL_API_URL"),
             dataType: 'json',
             cache: false,
             data: {
                action      : "follow-user",
                userid      : $userid,
                frined_id  : $frined_id,
                limit       : limit,
                offset      : offset
            },
            success: function($data){
//                console.log("ChatManager:followUser:success:data:", $data);

                try{
                    $config.success(_frined);
                }catch(e){
                    console.log(e);
                }
            },
            error : function($error)
            {
//                console.log("ChatManager:followUser:error:", $error);
                try{
                    $config.error($error);
                }catch(e){
                   console.log("ChatManager:followUser:error:e:", e);
                }

            }
        });
    }

    function unFollowUser( $userid, $frined_id, $config)
    {
            console.log("ChatManager:unFollowUser:userid:", $userid, $frined_id  );
            $config = $config || {};

        var limit  = $config.limit  || cons('DEFAULT_LIMIT');
        var offset = $config.offset || 0;

        $.ajax({
             url: cons("SOCIAL_API_URL"),
             dataType: 'json',
             cache: false,
             data: {
                action      : "unfollow-user",
                userid      : $userid,
                frined_id   : $frined_id,
                limit       : limit,
                offset      : offset
            },
            success: function($data){
//                console.log("ChatManager:unFollowUser:success:data:", $data);

                try{
                    $config.success(_frined);
                }catch(e){
                    console.log(e);
                }
            },
            error : function($error)
            {
//                console.log("ChatManager:unFollowUser:error:", $error);
                try{
                    $config.error($error);
                }catch(e){
                   console.log("ChatManager:unFollowUser:error:e:", e);
                }

            }
        });
    }

    function getUserFollowers( $userid, $config)
    {
            console.log("ChatManager:getUserFollowers:userid:", $userid  );
            $config = $config || {};
        var limit  = $config.limit  || cons('DEFAULT_LIMIT');
        var offset = $config.offset || 0;

        $.ajax({
             url: cons("SOCIAL_API_URL"),
             dataType: 'json',
             cache: false,
             data: {
                action      : "get-user-followers",
                userid      : $userid,
                limit       : limit,
                offset      : offset
            },
            success: function($data){
    //                console.log("ChatManager:getUserFollowers:success:data:", $data);
                _followers = $data.data || [] ;
                try{
                    $config.success(_followers);
                }catch(e){
                    console.log(e);
                }
            },
            error : function($error)
            {
    //                console.log("ChatManager:getUserFollowers:error:", $error);
                try{
                    $config.error($error);
                }catch(e){
                   console.log("ChatManager:getUserFollowers:error:e:", e);
                }

            }
        });
    }

    function getUserFollowing( $userid, $config)
    {
            console.log("ChatManager:getUserFollowing:userid:", $userid  );
            $config = $config || {};
        var limit  = $config.limit  || cons('DEFAULT_LIMIT');
        var offset = $config.offset || 0;

        $.ajax({
             url: cons("SOCIAL_API_URL"),
             dataType: 'json',
             cache: false,
             data: {
                action      : "get-user-following",
                userid      : $userid,
                limit       : limit,
                offset      : offset
            },
            success: function($data){
    //                console.log("ChatManager:getUserFollowing:success:data:", $data);
                _following = $data.data || [] ;
                try{
                    $config.success(_following);
                }catch(e){
                    console.log(e);
                }
            },
            error : function($error)
            {
    //                console.log("ChatManager:getUserFollowing:error:", $error);
                try{
                    $config.error($error);
                }catch(e){
                   console.log("ChatManager:getUserFollowing:error:e:", e);
                }

            }
        });
    }

    function addFrined( $userid, $frined_id, $config)
    {
            console.log("ChatManager:addFrined(userid:", $userid , ", frined_id:", $frined_id );
            $config = $config || {};

        $.ajax({
             url: cons("SOCIAL_API_URL"),
             dataType: 'json',
             cache: false,
             data: {
                action      : "create-frined",
                userid      : $userid,
                frined_id   : $frined_id
            },
            success: function($data){
//                console.log("ChatManager:addFrined:success:data:", $data);
                _frined = $data.data || [] ;
                try{
                    $config.success(_frined);
                }catch(e){
                    console.log(e);
                }
            },
            error : function($error)
            {
//                console.log("ChatManager:addFrined:error:", $error);
                try{
                    $config.error($error);
                }catch(e){
                   console.log("ChatManager:addFrined:error:e:", e);
                }

            }
        });
    }

    function removeFrined( $userid, $frined_id, $config)
    {
            console.log("ChatManager:removeFrined(userid:", $userid , ", frined_id:", $frined_id );
            $config = $config || {};
        var limit  = $config.limit  || cons('DEFAULT_LIMIT');
        var offset = $config.offset || 0;

        $.ajax({
             url: cons("SOCIAL_API_URL"),
             dataType: 'json',
             cache: false,
             data: {
                action      : "remove-frined",
                userid      : $userid,
                frined_id   : $frined_id,
                limit       : limit,
                offset      : offset
            },
            success: function($data){
    //                console.log("ChatManager:removeFrined:success:data:", $data);
                //_frined = $data.data || [] ;
                try{
                    $config.success(_frined);
                }catch(e){
                    console.log(e);
                }
            },
            error : function($error)
            {
    //                console.log("ChatManager:removeFrined:error:", $error);
                try{
                    $config.error($error);
                }catch(e){
    //                console.log("ChatManager:removeFrined:e:", e);
                }

            }
        });
    }

    function getUserFrined( $userid, $frined_id, $config)
    {
        console.log("ChatManager:getUserFrined(userid:"+$userid+ ", ", ", frined_id:", $frined_id, $config );
            $config = $config || {};

        $.ajax({
             url: cons("SOCIAL_API_URL"),
             dataType: 'json',
             cache: false,
             data: {
                action      : "get-frined",
                userid      : $userid,
                frined_id   : $frined_id
            },
            success: function($data){
//                console.log("ChatManager:getUserFrined:success:data:", $data);
                _frined = $data.data || [] ;
                try{
                    $config.success(_frined);
                }catch(e){
                    console.log(e);
                }
            },
            error : function($error)
            {
//                console.log("ChatManager:getUserFrined:error:", $error);
                try{
                    $config.error($error);
                }catch(e){
//                console.log("ChatManager:getUserFrined:e:", e);
                }

            }
        });
    }

    function getUserFrineds($userid, $config)
    {
//        console.log("ChatManager:getUserFrineds(userid:"+$userid+ ")", $config );
            $config = $config || {};
        var limit  = $config.limit  || cons('DEFAULT_LIMIT');
        var offset = $config.offset || 0;

        $.ajax({
             url: cons("SOCIAL_API_URL"),
             dataType: 'json',
             cache: false,
             data: {
                action    : "get-frineds",
                userid    : $userid,
                limit     : limit,
                offset    : offset
            },
            success: function($data){
//                console.log("ChatManager:getUserFrineds:success:data:", $data);
                _frineds = $data.data || [] ;
                try{
                    $config.success(_frineds);
                }catch(e){
                    console.log(e);
                }
            },
            error : function($error)
            {
//                console.log("ChatManager:getUserFrineds:error:", $error);
                try{
                    $config.error($error);
                }catch(e){
//                console.log("ChatManager:getUserFrineds:e:", e);
                }

            }
        });
    }

    function getUserInfo($userid, $config)
    {
        console.log("ChatManager:getUserInfo()::userid:",$userid);
            $config = $config || {};

        $.ajax({
             url: cons("SOCIAL_API_URL"),
             dataType: 'json',
             cache: false,
             data: {
                action    : "get-user-info",
                userid    : $userid
            },
            success: function($data){
                console.log("ChatManager:getUserInfo:success:data:", $data);
                _user = $data.data || [] ;
                try{
                    $config.success(_user);
                }catch(e){
                    console.log(e);
                }
            },
            error : function($error)
            {
                console.log("ChatManager:getUserInfo:error:", $error);
                try{
                    $config.error($error);
                }catch(e){
//                console.log("ChatManager:getUserInfo:e:", e);
                }

            }
        });
    }

    function cons(key)
    {
        return { version            : "@VERSION@",
                 className          : "ChatManager",
                 SOCIAL_API_URL     : "/social-api/",
                 DEFAULT_LIMIT      : 10
                 }[key];
    }

    return {
        init                : init,
        cons                : cons,

        followUser          : followUser,
        unFollowUser        : unFollowUser,
        getUserFollowers    : getUserFollowers,
        getUserFollowing    : getUserFollowing,

        getUserInfo         : getUserInfo,

        addFrined           : addFrined,
        removeFrined        : removeFrined,
        getUserFrined       : getUserFrined,
        getUserFrineds      : getUserFrineds
    }
}
