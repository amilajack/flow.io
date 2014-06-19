
// MODULES //

var // Expectation library:
	chai = require( 'chai' ),

	// Stream spec:
	spec = require( 'stream-spec' ),

	// Test utilities:
	utils = require( './utils' ),

	// Module to be tested:
	stream = require( './../lib/streams/transform' );


// VARIABLES //

var expect = chai.expect,
	assert = chai.assert;


// TESTS //

describe( 'streams/transform', function tests() {

	it( 'should export a factory function', function test() {
		expect( stream ).to.be.a( 'function' );
	});

	it( 'should throw an error if a transform function is not provided', function test() {
		expect( stream ).to.throw( Error );
	});

	it( 'should allow for simple pass through', function test() {
		var numData = 1000,
			expected = new Array( numData ),
			tStream,
			transform = function ( d ) {
				return d;
			},
			s;

		// Simulate some data...
		for ( var i = 0; i < numData; i++ ) {
			expected[ i ] = Math.random();
		}

		// Create a new transform stream:
		tStream = stream( transform );

		// Create the stream spec:
		s = spec( tStream )
			.through();

		// Mock reading from the stream:
		utils.readStream( tStream, onRead );

		// Validate the stream when the stream closes:
		tStream.on( 'close', s.validate );

		// Mock piping a data to the stream:
		utils.writeStream( expected, tStream );

		return;

		/**
		* FUNCTION: onRead( error, actual )
		*	Read event handler. Checks for errors and compares streamed data to expected data.
		*/
		function onRead( error, actual ) {
			expect( error ).to.not.exist;
			assert.deepEqual( actual, expected );
		} // end FUNCTION onRead()
	});

});