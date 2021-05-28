/**
 * author:Joshua Lindsay
 * email:j@lindsayfilm.com
 * http://lindsayfilm.com
 * Software can be used for Good or Evil.
 * Some people die rich, some die poor, the result is the same.
 */
 
function AccountManager()
{
    var self = this;
    var _user = {};
    var _account_settings = {};

    function cons(key)
    {
        return { CONTROL_URL : "/control",
                 className:"crazy"
                        }[key];
    }

    function init($userid, $config)
    {
        _userid = $userid;
        _config = $config || {};
        onSetUserEmail     = $config.onSetUserEmail || onSetUserEmail;
        onGetUserInfo     = $config.onGetUserInfo || onGetUserInfo;
    }

    function getUserInfo($userid , $config )
    {
        console.log("getUserInfo(userid:"+$userid+")");

        $.ajax({
             url: cons("CONTROL_URL"),
              dataType: 'json',
            cache: false,
             data: {
                action     : "get-user-account-info",
                userid     : $userid
            },
             success: function($data){
                onGetUserInfo($data.data);
                try{
                    $config.success($data.data);
                }catch(e){}
            }
        });
    }

    function connectFacebook($userid, $facebook_id )
    {
        //
    }

    function connectTwitter($userid, $twitter_id )
    {
        //
    }

    function connectGoogle($userid, $google_id )
    {
        //
    }

    function setUserName($userid, $first_name, $last_name, $config)
    {
        console.log("setUserName(userid:"+$userid+", first_name:"+$first_name+", last_name:"+$last_name+")");

        $.ajax({
             url: cons("CONTROL_URL"),
              dataType: 'json',
            cache: false,
             data: {
                action         : "set-user-name",
                userid         : $userid,
                first_name     : $first_name,
                last_name    : $last_name
            },
             success: function($data){
                _user = $data[0];
                onSetUserName($data.data);
                try{
                    $config.success($data.data);
                }catch(e){}
            }
        });

    }

    function setUserPhoneNumber($userid, $phone_number, $config)
    {
        console.log("setUserPhoneNumber(userid:"+$userid+", phone_number:"+$phone_number+")");

        $.ajax({
             url: cons("CONTROL_URL"),
              dataType: 'json',
            cache: false,
             data: {
                action             : "set-user-phone-number",
                userid             : $userid,
                phone_number     : $phone_number
            },
             success: function($data){
                _user = $data[0];
                onSetUserPhoneNumber($data.data);
                try{
                    $config.success($data.data);
                }catch(e){}
            }
        });

    }

    function isValidEmailAddress($email)
    {
        var pattern = new RegExp(/^(("[\w-+\s]+")|([\w-+]+(?:\.[\w-+]+)*)|("[\w-+\s]+")([\w-+]+(?:\.[\w-+]+)*))(@((?:[\w-+]+\.)*\w[\w-+]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$)|(@\[?((25[0-5]\.|2[0-4][\d]\.|1[\d]{2}\.|[\d]{1,2}\.))((25[0-5]|2[0-4][\d]|1[\d]{2}|[\d]{1,2})\.){2}(25[0-5]|2[0-4][\d]|1[\d]{2}|[\d]{1,2})\]?$)/i);
        return pattern.test($email);
    };

    function setUserEmail($userid, $email, $config)
    {
        console.log("setUserEmail(userid:"+$userid+", email:"+$email+")");

        $.ajax({
             url: cons("CONTROL_URL"),
              dataType: 'json',
            cache: false,
             data: {
                action     : "set-user-email",
                userid     : $userid,
                email     : $email
            },
             success: function($data){
                _user = $data[0];
                onSetUserEmail($data.data);
                try{
                    $config.success($data.data);
                }catch(e){}
            }
        });

    }

    function setUserPassword($userid, $pwd, $config)
    {
        console.log("setUserEmail(userid:"+$userid+", pwd:"+$pwd+")");
        //should probably get the hash of pwd

        $.ajax({
             url: cons("CONTROL_URL"),
              dataType: 'json',
            cache: false,
             data: {
                action             : "set-user-password",
                userid             : $userid,
                user_password     : $pwd
            },
             success: function($data){
                _user = $data[0];
                onSetUserPassword($data.data);
                try{
                    $config.success($data.data);
                }catch(e){}
            }
        });

    }


    /**
     * eventHandler(s)
     */
    function onSetUserPassword($data){}
    function onSetUserPhoneNumber($data){}
    function onSetUserName($data){}
    function onSetUserEmail($data){}
    function onGetUserInfo($data){}
    /**
     * interface
     */
    return { getUserInfo         : getUserInfo,
             setUserEmail         : setUserEmail,
             setUserName         : setUserName,
             setUserPhoneNumber : setUserPhoneNumber,
             setUserPassword     : setUserPassword,
             isValidEmailAddress : isValidEmailAddress,
             init                 : init,
             cons                 : cons }
}
