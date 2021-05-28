/**
 * author:Joshua Lindsay
 * email:j@lindsayfilm.com
 * http://lindsayfilm.com
 * Software can be used for Good or Evil.
 * Some people die rich, some die poor, the result is the same.
 */

function FileUplaoder()
{
    var self = this;
    var _config = config;
    var _files;

    function cons(key)
    {
        return { className : "FileUploader"
            }[key];
    }

    function init(config)
    {
        _config = config || {};
//        onProgress = config.progress : onProgress;
    }

    function upload()
    {
//
    }

    function addFiles(files)
    {
        _files = files;
    }

//    function onProgress(){}

    return {    cons         : cons,
                upload         : upload,
                addFiles    : addFiles,
    }
}
