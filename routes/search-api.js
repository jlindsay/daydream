/**
 * author:Joshua Lindsay
 * email:j@lindsayfilm.com
 * twitter:@jlindsay
 * https://www.lindsayfilm.com
 * Software can be used for Good or Evil.
 * Some people die rich, some die poor, the result is the same.
 */

//var newrelic 			       = require('newrelic');
var trim 				         = require('trim');
var path                 = require("path");
var express              = require('express');
var router  	           = express.Router();

var passport             = require('passport');
var LocalStrategy        = require('passport-local').Strategy;
var ensureLoggedIn       = require('connect-ensure-login').ensureLoggedIn;


var _vm = require("../server/VideoManager");
var _um = require("../server/UserManager");
var _sm = require("../server/SearchManager");


//router.get( '/', ensureLoggedIn('/login'), function( req, res, next ){
	router.get( '/', function( req, res, next ){
		//console.log("req.query:", req.query );
		var _vid 					        = req.query.vid ? trim( req.query.vid ) : null;
		var _tvid                 = req.query.tvid ? trim( req.query.tvid ) : null;
		var _mvid                 = req.query.mvid ? trim( req.query.mvid ) : null;
		var _avid                 = req.query.avid ? trim( req.query.avid ) : null;

		var _action 				      = req.query.action ? trim( req.query.action ) : null;

		var _userid 				      = req.query.userid ? trim( req.query.userid ) : null;
		var _profile_id				    = req.query.profile_id ? trim( req.query.profile_id ) : null;
		var _sid             		  = req.query.sid ? trim( req.query.sid ) : null;

		var _comment            	= req.query.comment ? trim( req.query.comment_uid ) : null;
		var _comment_uid        	= req.query.comment_uid ? trim( req.query.vid ) : null;
		var _setid              	= req.query.setid ? trim( req.query.setid ) : null;
		var _title              	= req.query.title ? trim( req.query.title ) : null;
		var _description        	= req.query.description ? trim( req.query.description ) : null;
		var _thumbnail_url      	= req.query.thumbnail_url ? trim( req.query.thumbnail_url ) : null;
		var _catagory           	= req.query.catagory ? trim( req.query.catagory ) : null;
		var _url                	= req.query.url ? trim( req.query.url ) : null;
		var _liked              	= req.query.liked ? trim( req.query.liked ) : null;
		var _keywords           	= req.query.keywords ? trim( req.query.keywords ) : null;
		var _q                  	= req.query.q ? trim( req.query.q ) : null;

		var _limit              	= req.query.limit ? trim( req.query.limit ) : null;
    var _comments_limit       = req.query.comments_limit ? trim( req.query._comments_limit ) : null;
    var _likes_limit          = req.query.likes_limit ? trim( req.query._likes_limit ) : null;

		var _offset             	= req.query.offset ? trim( req.query.offset ) : null;
    var _comments_offset      = req.query.comments_offset ? trim( req.query.comments_offset ) : null;
    var _likes_offset         = req.query.likes_offset ? trim( req.query.likes_offset ) : null;

		var _sort_by            	= req.query.sort_by ? trim( req.query.sort_by ) : "DESC";
//    var _comments_sorts_by    = req.query.comments_sort_by ? trim( req.query.comments_sort_by ) : "DESC";
//    var _likes_sorts_by       = req.query.likes_sort_by ? trim( req.query.likes_sort_by ) : "DESC";

		var _order_by           	= req.query.order_by ? trim( req.query.order_by ) : "date_created";
//    var _comments_order_by    = req.query.comments_order_by ? trim( req.query.comments_order_by ) : "date_created";
//    var _likes_order_by       = req.query.likes_order_by ? trim( req.query.likes_order_by ) : "date_created";


		var _results = { status: "error",
						 action: _action };

		var _search_resutls = {};



		var user = _um.getAnonymousUser();

        if( req.session.passport.user )
        {
            user = req.session.passport.user;
        }

        var config = { user : user,

                       order_by           : _order_by,
                       sort_by            : _sort_by,

                       comments_limit     : _comments_limit,
                       comments_offset    : _comments_offset,
//                       comments_order_by  : _comments_order_by,
//                       comments_sort_by   : _comments_order_by,

                       likes_limit        : _likes_limit,
                       likes_offset       : _likes_offset,
//                       likes_order_by     : _likes_order_by,
//                       likes_sort_by      : _likes_order_by,
                    };

		switch( String( _action ) )
		{
			case "get-video-embed":
              _vm.getVideoEmbed( _vid, config, function(data){
                res.json( { "status"  : "success",
                            "userid"   : _userid,
                            "vid"      : _vid,
                            "action"   : _action,
                            "data"     : data
                });
              });
              break;

			case "get-video":
				_sm.getVideo( _userid, _vid, config, function(data){
					//console.log("stuff");
					res.json( { "status"  : "success",
											"userid"   : _userid,
											"vid"      : _vid,
											"action"   : _action,
											"data"     : data
					});
				});
				break;
			case "get-video-2-share":
					//console.log("get-video-2-share:");
					_sm.getVideo2Share( _userid, _sid, config, function(data){
							res.json( { "status"    : "success",
													"userid"    : _userid,
													"sid"  			: _sid,
													"action"    : _action,
													"data"      : data
							});
					});
					break;
			case "get-videos":
			case "get-new-videos":
				_sm.getNewVideos( _userid, _limit, _offset, config, function(data){
          //console.log("_sm.getNewVideos():success")
					res.json( { "status" 	           : "success",
      								"userid" 	           : _userid,
      								"action" 	           : _action,
      								"limit" 	           : _limit,
      								"offset" 	           : _offset,
                      "order_by"           : _order_by,
                      "comments_limit"     : _comments_limit,
                      "comments_offset"    : _comments_offset,
                      "likes_limit"        : _likes_limit,
                      "likes_offset"       : _likes_offset,
//                      "comments_order_by"  : _comments_order_by,
//                      "likes_order_by"     : _likes_order_by,
      								"data" 		: data
					});
				});

				break;

			case "get-user-public-videos":
				_sm.getUserPublicVideos( _userid, _limit, _offset, config, function(data){
					res.json( { "status" 	: "success",
								"userid" 	: _userid,
								"action" 	: _action,
								"limit"		: _limit,
								"offset" 	: _offset,
                "comments_limit"     : _comments_limit,
                "comments_offset"    : _comments_offset,
                "likes_limit"        : _likes_limit,
                "likes_offset"       : _likes_offset,
//              "comments_order_by"  : _comments_order_by,
//              "likes_order_by"     : _likes_order_by,
								"data" 		: data
					});
				});
				break;

			case "get-video-likes":
				_sm.getVideoLikes( _userid, _vid, _limit, _offset, config, function(data){
					res.json( { "status" 	: "success",
    								 "vid" 		   : _vid,
    								 "userid" 	 : _userid,
    								 "action" 	 : _action,
    								 "limit" 	   : _limit,
    								 "offset" 	 : _offset,
    								 "data" 	   : data
					});
				});
				break;

			case "get-video-comments":
				_sm.getVideoComments( _userid, _vid , _limit, _offset, config, function(data){
					res.json( { "status" 	: "success",
      								 "vid" 		: _vid,
      								 "userid" 	: _userid,
      								 "action" 	: _action,
      								 "limit" 	: _limit,
      								 "offset" 	: _offset,
      								 "data" 	: data
      					});
				});
				break;

        case "get-related-audiobooks":

          _sm.getRelatedAudiobooks( _userid, _vid, _limit, _offset, config, function(data){
            //console.log("debug:search-api.js:get-related:data:", data)
            res.json( { "status" 		: "success",
                        "vid" 			: _vid,
                        "action" 		: _action,
//                        "catagory"  : _catagory,
                        "limit" 		: _limit,
                        "offset" 		: _offset,
                        "comments_limit"     : _comments_limit,
                        "comments_offset"    : _comments_offset,
                        "likes_limit"        : _likes_limit,
                        "likes_offset"       : _likes_offset,
        //              "comments_order_by"  : _comments_order_by,
        //              "likes_order_by"     : _likes_order_by,
                        "data" 			: data
                    });
            });

          break;

        case "get-related-tv":

          _sm.getRelatedTV( _userid, _vid, _limit, _offset, config, function(data){
            //console.log("debug:search-api.js:get-related:data:", data)
            res.json( { "status" 		: "success",
                        "vid" 			: _vid,
                        "action" 		: _action,
//                        "catagory"  : _catagory,
                        "limit" 		: _limit,
                        "offset" 		: _offset,
                        "comments_limit"     : _comments_limit,
                        "comments_offset"    : _comments_offset,
                        "likes_limit"        : _likes_limit,
                        "likes_offset"       : _likes_offset,
        //              "comments_order_by"  : _comments_order_by,
        //              "likes_order_by"     : _likes_order_by,
                        "data" 			: data
                    });
            });

          break;

       case "get-related-movies":
          _sm.getRelatedMovies( _userid, _vid, _limit, _offset, config, function(data){
            //console.log("debug:search-api.js:get-related:data:", data)
            res.json( { "status" 		: "success",
                        "vid" 			: _vid,
                        "action" 		: _action,
//                        "catagory"  : _catagory,
                        "limit" 		: _limit,
                        "offset" 		: _offset,
                        "comments_limit"     : _comments_limit,
                        "comments_offset"    : _comments_offset,
                        "likes_limit"        : _likes_limit,
                        "likes_offset"       : _likes_offset,
        //              "comments_order_by"  : _comments_order_by,
        //              "likes_order_by"     : _likes_order_by,
                        "data" 			: data
                    });
            });

      break;

      case "get-related-videos":
				_sm.getRelatedVideos( _userid, _vid, _limit, _offset, config, function(data){
          //console.log("debug:search-api.js:get-related:data:", data)
          res.json( { "status" 		: "success",
      								"vid" 			: _vid,
      								"action" 		: _action,
//                        "catagory"  : _catagory,
      								"limit" 		: _limit,
      								"offset" 		: _offset,
                      "comments_limit"     : _comments_limit,
                      "comments_offset"    : _comments_offset,
                      "likes_limit"        : _likes_limit,
                      "likes_offset"       : _likes_offset,
      //              "comments_order_by"  : _comments_order_by,
      //              "likes_order_by"     : _likes_order_by,
      								"data" 			: data
      						});
					});

				break;

        case "get-related-my-videos":
          //console.log("debug:search-api.js:get-related-my-videos:userid:", _userid)
  				_sm.getRelatedMyVideos( _userid, _vid, _limit, _offset, config, function(data){

            //console.log("debug:search-api.js:get-related:data:", data)
            res.json( { "status" 		: "success",
        								"vid" 			: _vid,
        								"action" 		: _action,
  //                        "catagory"  : _catagory,
        								"limit" 		: _limit,
        								"offset" 		: _offset,
                        "comments_limit"     : _comments_limit,
                        "comments_offset"    : _comments_offset,
                        "likes_limit"        : _likes_limit,
                        "likes_offset"       : _likes_offset,
        //              "comments_order_by"  : _comments_order_by,
        //              "likes_order_by"     : _likes_order_by,
        								"data" 			: data
        						});
  					});

  				break;


			case "get-user-videos":
				_vm.getUserVideos( _userid, _limit, _offset, config, function(data){
					res.json( { "status" 	: "success",
								"userid" 	: _userid,
								"action" 	: _action,
								"limit" 	: _limit,
								"offset" 	: _offset,
                "comments_limit"     : _comments_limit,
                "comments_offset"    : _comments_offset,
                "likes_limit"        : _likes_limit,
                "likes_offset"       : _likes_offset,
//              "comments_order_by"  : _comments_order_by,
//              "likes_order_by"     : _likes_order_by,
								"data" 		: data
					});
				});
				break;

			case "search-videos":
        //console.log("search-videos::_sm.searchVideos()" );
				_sm.searchVideos( _userid, _keywords, _limit, _offset, config, function(data){
          //console.log("search-videos::_sm.searchVideos:success:data:", data);
          res.json( { "status" 	  : "success",
								"userid" 	  : _userid,
								"action" 	  : _action,
								"keywords" 	: _keywords,
                "catagory"  : _catagory,
								"limit" 	  : _limit,
								"offset"	  : _offset,
                "comments_limit"     : _comments_limit,
                "comments_offset"    : _comments_offset,
                "likes_limit"        : _likes_limit,
                "likes_offset"       : _likes_offset,
//              "comments_order_by"  : _comments_order_by,
//              "likes_order_by"     : _likes_order_by,
								"data" 		  : data
					});
				});
				break;

			case "search-user-videos":
				_sm.searchUserVideos( _userid, _keywords , _limit, _offset, config, function(data){
					res.json( { "status" 	: "success",
      								"userid" 	           : _userid,
      								"action" 	           : _action,
      								"limit" 	           : _limit,
      								"keywords"           : _keywords,
      								"offset" 	           : _offset,
                      "comments_limit"     : _comments_limit,
                      "comments_offset"    : _comments_offset,
                      "likes_limit"        : _likes_limit,
                      "likes_offset"       : _likes_offset,
      //              "comments_order_by"  : _comments_order_by,
      //              "likes_order_by"     : _likes_order_by,
								"data" 		: data
					});
				});
				break;

			case "search-people":
				_sm.searchPeople( _userid, _q, _limit, _offset, config, function(data){
					res.json( { "status" 	: "success",
      								"userid" 	           : _userid,
      								"action" 	           : _action,
                      "q" 		             : _q,
      								"limit" 	           : _limit,
      								"offset" 	           : _offset,
                      "comments_limit"     : _comments_limit,
                      "comments_offset"    : _comments_offset,
                      "likes_limit"        : _likes_limit,
                      "likes_offset"       : _likes_offset,
      //              "comments_order_by"  : _comments_order_by,
      //              "likes_order_by"     : _likes_order_by,
      								"data" 		: data
					});
				});
				break;

			case "get-person-by-id":
				_sm.getPersonByID( _userid, _profile_id, config, function(data){
					res.json( { "status" 		: "success",
								"userid" 		: _userid,
								"profile_id" 	: _profile_id,
								"action" 		: _action,
								"data" 			: data
					});
				});
				break;

			case "get-videos-about-person":
				_sm.getVideosAboutPerson( _userid, _profile_id, _limit, _offset, config, function(data){
					res.json( { "status" 		         : "success",
      								"userid" 		         : _userid,
      								"profile_id" 	       : _profile_id,
      								"action" 		         : _action,
      								"limit" 		         : _limit,
      								"offset" 		         : _offset,
                      "comments_limit"     : _comments_limit,
                      "comments_offset"    : _comments_offset,
                      "likes_limit"        : _likes_limit,
                      "likes_offset"       : _likes_offset,
      //              "comments_order_by"  : _comments_order_by,
      //              "likes_order_by"     : _likes_order_by,
      								"data" 			  : data
					});
				});
				break;
/*
			case "whos-online":

				_results = { "status" 	: "success",
							"userid" 	: _userid,
							"action" 	: _action,
							"data" 	: _um.whoson.getUsersOnline() };

				break;
*/
			default:
				_results.status = "error";
				_results.error = "unknown-action";

				res.json( _results );
				break;
		}


	});



	module.exports = router;
