
// MODULES //

var // Expectation library:
	chai = require( 'chai' ),

	// Module to be tested:
	stream = require( './../lib/json/parse.js' );


// VARIABLES //

var expect = chai.expect,
	assert = chai.assert;


// TESTS //

describe( 'streams/json/parse', function tests() {

	it( 'should export a factory function', function test() {
		expect( stream ).to.be.a( 'function' );
	});

	// For additional tests, see https://github.com/dominictarr/JSONStream/tree/master/test

});