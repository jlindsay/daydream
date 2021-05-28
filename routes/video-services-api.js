var express = require('express');
var router = express.Router();

var passport            = require('passport');
var LocalStrategy       = require('passport-local').Strategy;
var BearerStrategy      = require('passport-http-bearer').Strategy;
var jwt                 = require('jsonwebtoken');

var ensureLoggedIn      = require('connect-ensure-login').ensureLoggedIn;

var oembed = require('oembed');
const ogs = require('open-graph-scraper');

var yt_search = require('youtube-search');
var _youtube_api_key = 'AIzaSyBAKyhAIH7RQe2YCnqYPLKTWmJd8LQbhv0';
//var _max_results = 50;
var _offset = 0
var _limit  = 50;

//https://www.npmjs.com/package/pornsearch
//var Pornhub = require("pornhub-api")
var Pornsearch = require('pornsearch');

var _ = require("underscore")

//https://developers.google.com/youtube/v3/docs/search/list
router.get('/yt', ensureLoggedIn('/login') ,function(req, res, next) {
      var user = { first_name:"Stranger" };

      if( req.session.passport.user )
      {
          user = req.session.passport.user;
      }

      var q       = req.query.q;
      //var offset  = req.query.offset || 0;

      var page              = req.query.page || 0;
      var type              = req.query.type || "video";//channel, playlist, video
      var relatedToVideoId  = req.query.relatedToVideoId || '';
      var topicId           = req.query.topicId || '';
      var channelId         = req.query.channelId || '';
      var limit             = req.query.limit || _limit;
      //var topicId = req.query.topicId || null;
      //var relatedToVideoId: relatedToVideoId
      //var forMine: retrieve videos owned by the authenticated user
      //var forDeveloper:
      //var forContentOwner

      //optional parameters
      //var channelId:
      //var channelType: any, show
      //var eventType: completed, live, upcoming
      //var location
      //var onBehalfOfContentOwner:
      //var maxResults: 0-50
      //var locationRadius
      //var order:: date, rating, relevance, title, videoCount, viewCount
      //var pageToken: "The pageToken parameter identifies a specific page in the result set that should be returned. In an API response, the nextPageToken and prevPageToken properties identify other pages that could be retrieved."
      //var publishedAfter: datetime RFC 3339 formatted date-time value (1970-01-01T00:00:00Z)
      //var publishedBefore: datetime RFC 3339 formatted date-time value (1970-01-01T00:00:00Z)
      //var safeSearch: moderate, none, strict
      //var relevanceLanguage:
      //var regionCode:
      //var videoCaption:
      //var videoCategoryId: https://developers.google.com/youtube/v3/docs/videoCategories
      //var videoDefinition: any, high, standard
      //var videoDimension: any, high, standard
      //var videoDuration: any, short, medium, long
      //var videoEmbeddable: any, true
      //var videoLicense: any, creativeCommon, youtube
      //var videoSyndicated: any, true
      //var videoType: any,episode,movie


      //https://developers.google.com/youtube/v3/docs/search/list
      //pageInfo.totalResults
      yt_search( q, {
        maxResults        : limit,
        page              : page,
        type              : type,
        //relatedToVideoId  : relatedToVideoId,
        key               : _youtube_api_key
      }, function(e, results) {
            if(e) {
                  res.json({ status : 'error',
                             q: q,
                             page   : page,
                             type   : type,
                             limit  : limit,
                             error :  e
                  });
            }else{
                  console.log("pageInfo:", results.pageInfo)
                  //console.log("results.length::",results.length)
                  res.json({ status : 'success',
                             q      : q,
                             page   : page,
                             type   : type,
                             limit  : limit,
                             videos :  results
                  });
            }

      });
})


router.get('/auto', ensureLoggedIn('/login') , function(req, res, next) {
      var user = { first_name:"Stranger" };

      if( req.session.passport.user )
      {
          user = req.session.passport.user;
      }
      console.log("/auto::user:", user)
      res.render('auto-post', {user:user});
})



router.get('/phub', ensureLoggedIn('/login') ,function(req, res, next) {
      var q = req.query.q;
      var Search = new Pornsearch(q);

      var user = { first_name:"Stranger" };

      if( req.session.passport.user )
      {
          user = req.session.passport.user;
      }

      Search.videos()
              .then( function($videos){
                  res.json({ status : 'success',
                             q: q,
                             videos :  $videos
                  });
              })
})



module.exports = router;
