/**
 * author:Joshua Lindsay
 * email:j@lindsayfilm.com
 * http://lindsayfilm.com
 * Software can be used for Good or Evil.
 * Some people die rich, some die poor, the result is the same.
 */
 
function IndexManager()
{
    console.log("IndexManaager()");
    var self = this;
    var _config = {};

    var _index = 0;
//    var _max = 10;
//    var _min = 1;
    var _list = [];

    function init( data, config)
    {
        console.log("IndexManaager.init()");
        _list = ( data )? data : [];
        _config = ( config )? config : {} ;
        self.onFocus = ( _config.onFocus )? _config.onFocus : self.onFocus;
    }

    function focus(index)
    {
        console.log("IndexManaager.focus(index:",index,")");
        _index = index;
        _index = (_index >= _list.length )? _list.length: _index;
        _index = (_index <= 0)? 0: _index;
        try{
            _config.onFoucs(_index);
        }catch(e){
            //
        }
    }

    function next()
    {
        console.log("IndexManaager.next()");
        focus(_index+1);
    }

    function prev()
    {
        console.log("IndexManaager.prev()");
        focus(_index-1);
    }

//    onFocus=function($index){}

    return {
        init:init,
        focus:focus,
        next:next,
        prev:prev
    }
}
//define( IndexManager );
