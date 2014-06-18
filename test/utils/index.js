/**
*
*	TEST: utils
*
*
*
*	DESCRIPTION:
*		- Provides supporting utility functions for tests.
*
*
*	API:
*		- 
*
*
*	NOTES:
*		[1] Write and Read from Dominic Tarr's through module: https://github.com/dominictarr/through
*
*
*	TODO:
*		[1] 
*
*
*	HISTORY:
*		- 2014/06/17: Created. [AReines].
*
*
*	DEPENDENCIES:
*		[1] 
*
*
*
*	AUTHOR:
*		Athan Reines. athan@nodeprime.com. 2014.
*
*/

/**
* FUNCTION: write( array, stream )
*	Mocks writing to a stream.
*
* @param {array} array - array to write
* @param {stream} stream - stream to write to
*/
function write( array, stream ) {
	array = array.slice();
	next();
	return;

	/**
	* FUNCTION: next()
	*	Mocks stream drain.
	*/
	function next() {
		while ( array.length ) {
			if ( stream.write( array.shift() ) === false ) {
				return stream.once( 'drain', next );
			}
		}
		stream.end();
	} // end FUNCTION next()
} // end FUNCTION write()

/**
* FUNCTION: read( stream, clbk )
*	Mocks reading from a stream.
*
* @param {stream} stream - stream to read from
* @param {function} clbk - callback to invoke after stream ends
*/
function read( stream, clbk ) {
	var actual = [];
	stream.on( 'data', function onData( data ) {
		actual.push( data );
	});
	stream.once( 'end', function onEnd() {
		clbk( null, actual );
	});
	stream.once( 'error', function onError( error ) {
		clbk( error );
	});
} // end FUNCTION read()


// EXPORTS //

module.exports = {
	'writeStream': write,
	'readStream': read
};