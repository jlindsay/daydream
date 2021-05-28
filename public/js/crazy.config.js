/**
 * author:Joshua Lindsay
 * email:j@lindsayfilm.com
 * http://lindsayfilm.com
 * Software can be used for Good or Evil.
 * Some people die rich, some die poor, the result is the same.
 */

require.config({
    baseUrl: "./",
    paths: {
        "jquery"            : "../bower/jquery/dist/jquery",
        "EventDispatcher"   : "../js/EventDispatcher",
        "VideoManager"      : "../js/VideoManager",
        "videoplayer"       : "../js/videoplayer",
        "SearchManager"     : "../js/SearchManager",
        "AccountManager"    : "../js/AccountManager",
        "IndexManager"      : "../js/IndexManager",
        "MessageManager"    : "../js/MessageManager",
        "crazy"             : "../js/crazy",
    },
    shim: {
        'VideoManager'      : ['jquery'],
        'VideoPlayer'       : ['jquery'],
        'SearchManager'     : ['jquery'],
        'AccountManager'    : ['jquery'],
        'IndexManager'      : ['jquery'],
        'MessageManager'    : ['jquery'],
        'crazy'             : ['jquery'],

    }
});
