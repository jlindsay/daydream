/**
 * author:Joshua Lindsay
 * email:j@lindsayfilm.com
 * twitter:@jlindsay
 * https://www.lindsayfilm.com
 * Software can be used for Good or Evil.
 * Some people die rich, some die poor, the result is the same.
 */

function Utils()
{
	var self 	= this;
	var base64 	= require('base-64');
	var uuid 	= require('uuid');
	//data utility
	var moment 	= require('moment');
//		moment().format();
	var shortid = require('shortid');


	var _monthNames = [
        "January", "February", "March",
        "April", "May", "June", "July",
        "August", "September", "October",
        "November", "December"
    ];


	function db_datetime_format()
	{
		return 'Y-m-d H:i:s';
	}

	function DBDate()
	{
    //oringal moment use...
    var now = moment.utc().format().split("T").join(" ").split("+")[0];
    var _now = now.split("Z")[0];//for some reason moment.js adding Z to address something about time zone offset, I couldn't get this be removed, so I'm splicing it out so it does not ruin my SQL insertions,
    //refer to this url for more information https://github.com/moment/moment/issues/2788
    //console.log('Utils.DBDaten:ow:', now, ", _now:", _now )
		return _now;//moment.utc().format().split("T").join(" ").split("+")[0];

	}

	function addslashes(str) {
		return str.replace(/\\/g, '\\\\').replace(/\u0008/g, '\\b').replace(/\t/g, '\\t').replace(/\n/g, '\\n').replace(/\f/g, '\\f').replace(/\r/g, '\\r').replace(/'/g, '\\\'').replace(/"/g, '\\"');
	}

	function createBase64UUID()
	{
		//console.log(shortid.generate());
    var _shortid = shortid.generate();
        _shortid = _shortid.split("_").join("A")
        _shortid = _shortid.split("-").join("B")
    //var _uuid   = uuid.v1()
    //var _base64  = base64.encode( _uuid );
    //console.log("createBase64UUID(): _shortid:", _shortid)

    return _shortid;
//
		//return base64.encode( uuid.v1() );
	}

	return { db_datetime_format : db_datetime_format,
			 DBDate 			      : DBDate,
		   createBase64UUID 	: createBase64UUID,
			 addslashes 		    : addslashes
	}
}


module.exports = new Utils();
