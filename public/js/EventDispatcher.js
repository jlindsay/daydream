/**
 * author:Joshua Lindsay
 * email:j@lindsayfilm.com
 * http://lindsayfilm.com
 * Software can be used for Good or Evil.
 * Some people die rich, some die poor, the result is the same.
 */

define("EventDispatcher", function(){
    function EventDispatcher()
    {
        _events = [];

        function addEventListener( type, callback)
        {
            var callbacks = _events[type] = _events[type] || [];
                callbacks.push( callback );
        }
/*
        function removeEventListener( type, callback )
        {
            var callbacks = _events[type];
            for( var i=0; i < callbacks.length; i++)
            {
                if( callbacks[i] === callback ){
                    delete callbacks[i];
                }
            }
        }
*/
        function dispatchEvent( type, data )
        {
            var callbacks = ( _events[type] )? _events[type] : [];
            for( var i = 0; i < callbacks.length; i++ )
            {
                console.log("dispatchEvent:type:",type, ", data:", data );
//                callbacks[i].apply( null, data );
                    callbacks[i](data);
//                callbacks[i].apply( data );
            }
        }

        function cleanEventListners(){
            _events = [];
        }
        return {    addEventListener    : addEventListener,
                    cleanEventListners  : cleanEventListners,
                    dispatchEvent       : dispatchEvent }

    }

    return EventDispatcher;
});
