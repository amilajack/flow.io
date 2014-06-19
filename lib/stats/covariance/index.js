/**
*
*	STREAM: covariance
*
*
*
*	DESCRIPTION:
*		- 
*
*
*	API:
*		- 
*
*
*	NOTES:
*		[1] 
*
*
*	TODO:
*		[1] 
*
*
*	HISTORY:
*		- 2014/06/16: Created. [AReines].
*
*
*	DEPENDENCIES:
*		[1] 
*
*
*	LICENSE:
*		MIT
*
*	Copyright (c) 2014. Athan Reines.
*
*
*	AUTHOR:
*		Athan Reines. athan@nodeprime.com. 2014.
*
*/

(function() {
	'use strict';

	// MODULES //

	var // Module to combine streams:
		pipeline = require( 'stream-combiner' ),

		// Stream transform:
		transformer = require( './../../transform' ),

		// Stream reduce:
		reducer = require( './../../reduce' );


	// FUNCTIONS //

	/**
	* FUNCTION: stringify()
	*	Returns a transform function to stringify streamed data.
	*
	* @private
	* @returns {function} transform function
	*/
	function stringify() {
		/**
		* FUNCTION: transform( data )
		*	Defines the data transformation.
		*
		* @param {array} data - streamed data
		* @returns {string} stringified data
		*/
		return function transform( data ) {
			return JSON.stringify( data );
		}; // end FUNCTION transform()
	} // end FUNCTION stringify()


	// STREAM //

	/**
	* FUNCTION: Stream()
	*	Stream constructor.
	*
	* @returns {object} Stream instance
	*/
	function Stream() {
		// Default accumulator values:
		this._cov = [
			[ 0, 0 ],
			[ 0, 0 ]
		];
		this._means = [ 0, 0 ];
		this._N = 0;

		// ACCESSORS //
		this.accessors = {};

		return this;
	} // end FUNCTION stream()

	/**
	* METHOD: matrix( arr )
	*	Setter and getter for initial convariance matrix from which to begin accumulation. If an array is provided, sets the initial accumulation matrix. If no array is provided, returns the accumulation matrix.
	*
	* @param {array} arr - initial covariance matrix
	* @returns {object|array} instance object or initial matrix
	*/
	Stream.prototype.matrix = function( arr ) {
		var cov = this._cov,
			dims = cov.length,
			matrix;
		if ( !arguments.length ) {
			matrix = new Array( dims );
			for ( var i = 0; i < dims; i++ ) {
				matrix[ i ] = new Array( dims );
				for ( var j = 0; j < dims; j++ ) {
					matrix[ i ][ j ] = cov[ i ][ j ];
				}
			}
			return matrix;
		}
		this._cov = arr;
		return this;
	}; // end METHOD matrix()

	/**
	* METHOD: means( arr )
	*	Setter and getter for initial mean values used during accumulation. If an array is provided, sets the initial mean values. If no array is provided, returns the mean values.
	*
	* @param {array} arr - initial mean values
	* @returns {object|array} instance object or initial values
	*/
	Stream.prototype.means = function( arr ) {
		var means = this._means,
			numMeans = means.length;
		if ( !arguments.length ) {
			arr = new Array( numMeans );
			for ( var i = 0; i < numMeans; i++ ) {
				arr[ i ] = means[ i ];
			}
			return arr;
		}
		this._means = arr;
		return this;
	}; // end METHOD means()

	/**
	* METHOD: numValues( value )
	*	Setter and getter for the total number of values the initial value for accumulation represents. If a value is provided, sets the number of values. If no value is provided, returns the number of values.
	*
	* @param {number} value - initial value number
	* @returns {object|number} instance object or initial value number
	*/
	Stream.prototype.numValues = function( value ) {
		if ( !arguments.length ) {
			return this._N;
		}
		this._N = value;
		return this;
	}; // end METHOD numValues()

	/**
	* METHOD: accessors( name, fcn )
	*	Value accessor setter and getter. If an accessor name and function are supplied, sets the value accessor. If no function is supplied, returns the value accessor. If neither a name or function are supplied, returns all accessors.
	*
	* @example Setting an accessor.
	* myStream.accessors( 'x', function(d){return d;});
	*
	* @param {string} name - accessor name
	* @param {function} fcn - value accessor
	* @returns {object|function|object} instance object, value accessor, or accessors
	*/
	Stream.prototype.accessors = function( name, fcn ) {
		var names = Object.keys( this._accessors ),
			accessors = {};

		if ( !arguments.length ) {
			for ( var i = 0; i < names.length; i++ ) {
				accessors[ names[ i ] ] = this._accessors[ names[ i ] ];
			}
			return accessors;
		}
		if ( arguments.length === 1 ) {
			return this._accessors[ name ];
		}
		this._accessors[ name ] = fcn;
		return this;
	}; // end METHOD accessors()

	/**
	* METHOD: reduce()
	*	Returns a data reduction function.
	*
	* @returns {function} data reduction function
	*/
	Stream.prototype.reduce = function() {
		var dims = this._cov.length,
			numMeans = this._means.length,
			accessors = this._accessors,
			names = Object.keys( accessors ),
			deltas;

		// Check!!!
		if ( numMeans !== dims ) {
			throw new Error( 'covariance()::unable to initialize stream. Number of means ('+ numMeans + ') does not equal the covariance matrix dimensionality (' + dims + ').');
		}
		if ( numMeans !== names.length) {
			throw new Error( 'covariance()::unable to initialize stream. Number of accessors ('+ names.length + ') does not equal the covariance matrix dimensionality (' + numMeans + ').');
		}

		deltas = new Array( numMeans );
		for ( var i = 0; i < numMeans; i++ ) {
			deltas[ i ] = 0;
		}

		/**
		* FUNCTION: reduce( acc, data )
		*	Defines the data reduction.
		*
		* @param {object} acc - accumulation object containing three properties: N, means, cov. 'N' is the observation number accumulator; 'means' are the mean accumulators; 'cov' is the covariance matrix accumulator
		* @param {object|array} data - stream data
		* @returns {object} accumulation object
		*/
		return function reduce( acc, data ) {
			var i, j, A, B;

			// [0] Increment the number of values:
			acc.N += 1;

			// [1] Compute the deltas where a delta is the difference between a new value and the corresponding dataset's current mean value...
			for ( i = 0; i < numMeans; i++ ) {
				deltas[ i ] = accessor( data ) - acc.means[ i ];
			}

			// [2] Update the covariance matrix...
			for ( i = 0; i < numMeans; j++ ) {
				for ( j = 0; j < numMeans; j++ ) {
					A = acc.cov[i][j] * (acc.N-1);
					B = (acc.N-1) / acc.N * deltas[i] * deltas[j];
					acc.cov[i][j] = ( A + B ) / acc.N;
				}
			}

			// [3] Update the means to incorporate the new values...
			for ( i = 0; i < numMeans; i++ ) {
				acc.means[ i ] += deltas[ i ] / acc.N;
			}

			return acc;
		};
	}; // end METHOD reduce()

	/**
	* METHOD: transform()
	*	Returns a data transformation function to return the covariance.
	*
	* @returns {function} data transformation function
	*/
	Stream.prototype.transform = function() {
		/**
		* FUNCTION: transform( data )
		*	Defines the data transformation.
		*
		* @param {object} data - stream data
		* @returns {value} transformed data
		*/
		return function transform( data ) {
			return data.cov;
		};
	}; // end METHOD transform()

	/**
	* METHOD: stream()
	*	Returns a JSON data reduction stream for calculating the statistic.
	*/
	Stream.prototype.stream = function() {
		var rStream, pStream;

		// Get the reduction stream:
		rStream = reducer( this.reduce(), {
			'N': this._N,
			'means': this._means,
			'cov': this._cov
		});

		// Create a stream pipeline:
		pStream = pipeline(
			rStream,
			transformer( this.transform() ),
			transformer( stringify() )
		);

		// Return the pipeline:
		return pStream;
	}; // end METHOD stream()


	// EXPORTS //

	module.exports = function createStream() {
		return new Stream();
	};

})();