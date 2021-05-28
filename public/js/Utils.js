/**
 * author:Joshua Lindsay
 * email:j@lindsayfilm.com
 * http://lindsayfilm.com
 * Software can be used for Good or Evil.
 * Some people die rich, some die poor, the result is the same.
 */

function DateUtils()
{

    function tsToSlashDate($ts)
    {
        if(!$ts){return ""}
        var date = tsToDate($ts);
        return date.getDate() + "/" + date.getMonth() + "/" + date.getFullYear() ;
    }

    function tsToDate($ts) {
        //function parses mysql datetime string and returns javascript Date object
        //input has to be in this format: 2007-06-05 15:26:02
        if(!$ts){return}
        var regex = /^([0-9]{2,4})-([0-1][0-9])-([0-3][0-9]) (?:([0-2][0-9]):([0-5][0-9]):([0-5][0-9]))?$/;
        var parts = $ts.replace(regex,"$1 $2 $3 $4 $5 $6").split(' ');
//        return new Date(parts[0],parts[1]-1,parts[2],parts[3],parts[4],parts[5]);
        return new Date(parts[0],parts[1]-1,parts[2],parts[3],parts[4],parts[5]);
    }

    var _months = ["Jan", "Feb", "Mar", "April", "May", "June", "July", "Aug", "Sep","Oct", "Nov", "Dec"];
    var _days = ["Mon","Tue","Wed", "Thur", "Fri", "Sat","Sun"];

    return{ days:_days,
            months:_months,
            tsToDate: tsToDate,
            tsToSlashDate: tsToSlashDate
    }

}

function UUID()
{
    var className = "UUID";
    var self = this;

    function cons(key)
    {
        return { CONTROL_URL : "UUID",
                 className:"UUID"
                        }[key];
    }

    function create()
    {
        var s = [], itoh = '0123456789ABCDEF';
        // Make array of random hex digits. The UUID only has 32 digits in it, but we
        // allocate an extra items to make room for the '-'s we'll be inserting.
        for (var i = 0; i < 16; i++){
            s[i] = Math.floor(Math.random()*0x10);
        }
        // Conform to RFC-4122, section 4.4
        s[14] = 4;  // Set 4 high bits of time_high field to version
        s[19] = (s[19] & 0x3) | 0x8;  // Specify 2 high bits of clock sequence
        // Convert to hex chars
        for (var i = 0; i <36; i++) s[i] = itoh[s[i]];
        // Insert '-'s
//        s[8] = s[13] = s[18] = s[23] = '-';
        return s.join('');
    }

    function shortenText(text, max_char)
    {
      var tmp = text;
      if( text.length > max_char ){
          tmp = text.substring(0, max_char) + '...';
      }
      return tmp;
    }

    return { create : create,
             shortenText : shortenText }
}
