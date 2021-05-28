/**
 * author:Joshua Lindsay
 * email:j@lindsayfilm.com
 * twitter:@jlindsay
 * https://www.lindsayfilm.com
 * Software can be used for Good or Evil.
 * Some people die rich, some die poor, the result is the same.
 */


function UserManager()
{
    var self        = this;
    var trim        = require('trim');
    var utils       = require('./Utils');
    var md5         = require('MD5');

    var _ = require('underscore');
        _.mixin(require('underscore.inflections'));

    var mysql = require('promise-mysql');
        mysql.createConnection({ host: 'localhost',
                                 user: 'root',
                                 password: 'password',
                                 database: 'daydream' })
        .then(function(conn){
            _con = conn;
        });

    var _query_results = [];

  	var _is_loggedin    = "false";
  	var _is_admin       = "false";
  	var _is_moderator   = "false";
  	var _is_staff       = "false";

    function login( username, password, onSuccess, onFailed )
    {
        //NOTE: were using a SQL query, instead of the other method(s) like getUserByUsername, because we need to access the password, were as those other methods, specifically ommit the password.
        //      this is a godo reason , to seaperate the password from the user table.
        var SQL = "SELECT * , users.uid AS userid, CONCAT( users.first_name, ' ' , users.last_name) AS full_name  \
                        FROM users \
                            WHERE users.username = '{{username}}' \
            ;".split("{{username}}").join( username );

            query( SQL, function(users){
                var user = users[0];
                var md5_password = md5( password );
                    user.is_loggedin    = "true";
                    user.is_admin       = "false";
                    user.is_moderator   = "false";
                    user.is_staff       = "false";

                if( username == user.username && md5_password == user.password ){
                    onSuccess( user );
                }else{
                    //console.log("err:");
                    onFailed( { status : "error", message : "The username or password do not match out records" } );
                }

            });
    }

    function doesUsernameExists( username, cb )
    {

      var username = utils.addslashes( trim( username ) );
        console.log("doesUsernameExists():username:", username)
        var SQL = "SELECT username  \
                FROM users \
                        WHERE users.username = '{{username}}' \
            ;".split("{{username}}").join( username )

            query( SQL, function(user){
                    var hasUserName = Boolean(user.length > 0);
                  //  console.log("usernameExists:user:",user, ", hasUserName:",hasUserName)
                    cb(hasUserName);
            } );
    }

    function signupUser( username, config, cb )
    {
      console.log("UserManager().signupUser()")
      var username          = utils.addslashes( trim( username ) );
      var userid            = utils.createBase64UUID();
          userid            = userid.split("_").join("");
          userid            = userid.split("-").join("");

      var first_name        = utils.addslashes( trim( config.first_name ) );
      var last_name         = utils.addslashes( trim( config.last_name ) );
      var email             = utils.addslashes( trim( config.email ) );
      var password          = utils.addslashes( trim( config.password ) );
      var is_active         = utils.addslashes( trim( '1' ) );

      var date_created      = utils.DBDate();
      var last_modified     = date_created;

      doesUsernameExists( username, function(b){
        console.log("doesUsernameExists:b:", b)
        if( b ){
          var msg = { 'status'  :"failed",
               'username' : username,
               'message'  : "username already exists"
             }
          cb( msg )

        }
        console.log("moving on")

        var SQL = "INSERT INTO users   \
                    ( username, uid, first_name, last_name, email, password, is_active, date_created, last_modified )   \
                    VALUES   \
                    ( '{{username}}', '{{userid}}','{{first_name}}',  '{{last_name}}', '{{email}}', '{{password}}', '{{is_active}}', '{{date_created}}', '{{last_modified}}' );  \
                    ".split("{{username}}").join(username)
                    .split("{{userid}}").join(userid)
                    .split("{{first_name}}").join(first_name)
                    .split("{{last_name}}").join(last_name)
                    .split("{{email}}").join(email)
                    .split("{{password}}").join(password)
                    .split("{{is_active}}").join(is_active)
                    .split("{{date_created}}").join(date_created)
                    .split("{{last_modified}}").join(last_modified)

                  console.log( "UserManager().signupUser():", SQL )

                  query( SQL, function(results){

                          getUser( userid, function(data){
                                   var user = data[0];
                                   cb({ status      : 'success',
                                        action      : 'signup',
                                        userid      : user.userid,
                                        username    : user.username,
                                        data        : user
                                    })
                          } )

                  });




      } )


    }

    function getUser( userid, cb )
    {
        getUserByUserid( userid, cb );
    }

    function getUserProfileInfo(userid, cb)
    {
      userid          = utils.addslashes( trim( userid ) );

      var SQL = "SELECT users.uid AS userid, \
                        users.username, \
                        users.profile_url, \
                        users.first_name, \
                        users.last_name, \
                        users.level, \
                        CONCAT( users.first_name, ' ' , users.last_name) AS full_name , \
                        (SELECT COUNT(*) FROM followers WHERE followers.userid = uid ) AS total_following,       \
		                    (SELECT COUNT(*) FROM followers WHERE followers.follower_userid = uid  ) AS total_followers     \
                  FROM users \
                      WHERE users.uid = '{{userid}}' \
                ;".split("{{userid}}").join( userid );

                //console.log("UM.getUserProfileInfo::SQL:",SQL)

                query( SQL, function(results){
                        var user_profile = results[0];
                        //user_profile.is_loggedin    = "true";
                        //user_profile.is_admin       = "false";
                        //user_profile.is_moderator   = "false";
                        //user_profile.is_staff       = "false";

                        cb(user_profile);
                });
    }

    function getUserByUserid( userid, cb )
    {
            console.log("UserManager:login():userid:", userid );
            userid          = utils.addslashes( trim( userid ) );

        var SQL = "SELECT users.uid AS userid, users.username, users.profile_url, users.first_name, users.last_name, users.level, CONCAT( users.first_name, ' ' , users.last_name) AS full_name  \
                FROM users \
                        WHERE users.uid = '{{userid}}' \
            ;".split("{{userid}}").join( userid );

            query( SQL, function(user){
                    user.is_loggedin    = "true";
                    user.is_admin       = "false";
                    user.is_moderator   = "false";
                    user.is_staff       = "false";
                    cb(user);
            } );
    }

    function getUserByUsername( username, cb )
    {
            console.log("UserManager:getUserByUsername():username:",username );
            username        = utils.addslashes( trim( username ) );

        var SQL = "SELECT users.uid AS userid, users.username, users.profile_url, users.first_name, users.last_name, users.level, CONCAT( users.first_name, ' ' , users.last_name) AS full_name  \
                FROM users \
                        WHERE users.username = '{{username}}' \
            ;".split("{{username}}").join( username )

            query( SQL, function(user){
                    user.is_loggedin    = "true";
                    user.is_admin       = "false";
                    user.is_moderator   = "false";
                    user.is_staff       = "false";
                    cb(user);
            } );
    }


    function addFriends( userid, friends, config, cb)
    {
      console.log("NOTE:IMPLIMENT:UserManager:addFriends:", userid, friends, config, cb );
      cb({status:"error", description:"needs to be implimented"})
    }

    function addFriend( userid, friendid, config, cb)
    {
      console.log("NOTE:IMPLIMENT:UserManager:addFriend:", userid, friendid, config, cb );
      cb({status:"error", description:"needs to be implimented"})
    }

    function removeFriend( userid, friendid, config, cb)
    {
      console.log("NOTE:IMPLIMENT:UserManager:removeFriend:", userid, friendid, config, cb );
      cb({status:"error", description:"needs to be implimented"})
    }

    function getUserContacts( userid, limit, offset, config, cb )
    {
        console.log("UserManager:getUserContacts:", userid, limit, offset, config, cb );
        userid   = trim( userid );
        limit    = trim( limit );
        offset   = trim( offset );

        var SQL = "SELECT first_name,last_name,username,friend_uid, username   \
                      FROM friends   \
                            JOIN users on friends.friend_uid = users.uid    \
                              WHERE friends.uid = '"+ userid +"' AND friends.friend_uid != '"+ userid +"';";

            console.log("SQL:", SQL )

            query( SQL, function(contacts){
                    cb(user);
            } );
    }

    function logout()
    {
        //
    }

    function getAnonymousUser()
    {
         return { first_name:"Stranger",
                  last_name:"Unknown",
                  is_loggedin:"false",
                  is_moderator:"false",
                  is_staff: "false" ,
                  is_admin:"false",
                  is_loggedin:"false" };

    }

    function query( sql, cb )
    {
//        console.log("queryVideos():userid:", userid, ", SQL:",sql );
        _query_results = [];

        _con.query( sql )
            .then(function(rows){
                _query_results = rows;
                try{
                    cb(_query_results);
                }catch(e){}
                return _query_results;
            });
    }

    return {
        signupUser          : signupUser,
        login               : login,
        logout              : logout,
        getUserByUserid     : getUserByUserid,
        getUserByUsername   : getUserByUsername,
        doesUsernameExists  : doesUsernameExists,
        getUser             : getUser,
        addFriend           : addFriend,
        addFriends          : addFriends,
        removeFriend        : removeFriend,
        getUserContacts     : getUserContacts,
        getAnonymousUser    : getAnonymousUser,
        getUserProfileInfo  : getUserProfileInfo,
        query               : query    };
}

module.exports = new UserManager();
