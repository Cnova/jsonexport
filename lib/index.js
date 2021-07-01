/* jshint node:true */
'use strict';
/**
 * Module dependencies.
 */
//const _ = require('underscore');
const Parser = require('./parser/csv');
const Stream = require('./core/stream');
const helper = require('./core/helper');
const EOL = require('./core/eol');

/**
 * Main function that converts json to csv
 *
 * @param {Object|Array} json
 * @param {Object} [options]
 * @param {Function} callback(err, csv) - Callback function
 *      if error, returning error in call back.
 *      if csv is created successfully, returning csv output to callback.
 */
module.exports = function() {
  const DEFAULT_OPTIONS = {
    headers: [], //              Array
    rename: [], //               Array
    headerPathString: '.', //    String
    rowDelimiter: ',', //        String
    textDelimiter: '"', //       String
    arrayPathString: ';', //     String
    undefinedString: '', //      String
    endOfLine: EOL || '\n', //   String
    mainPathItem: null, //       String
    booleanTrueString: null, //  String
    booleanFalseString: null, // String
    includeHeaders: true, //     Boolean
    fillGaps: false, //          Boolean
    verticalOutput: true, //     Boolean
    forceTextDelimiter: false, //Boolean
    objectMode: false, //        Boolean
  };
  // argument parsing
  let json, userOptions, callback;
  if (arguments.length === 3) {
    [json, userOptions, callback] = arguments;
  } else if (arguments.length === 2) {
    let any;
    [json, any] = arguments;
    if (typeof any === 'function') {
      callback = any;
    } else if (typeof any === 'object') {
      userOptions = any;
    }
  } else if (arguments.length === 1) {
    const [any] = arguments;
    if (typeof any === 'object') {
      const defaultKeys = Object.keys(DEFAULT_OPTIONS);
      const objectKeys = Object.keys(any);
      const isOptions = objectKeys.every((key) => defaultKeys.includes(key)); 
      if (objectKeys.length > 0 && isOptions) {
        userOptions = any;
      } else {
        json = any;
      }
    } else {
      json = any;
    }
  } else {
    return new Stream(new Parser(DEFAULT_OPTIONS));
  }
  const options = Object.assign({}, DEFAULT_OPTIONS, userOptions);
  const parser = new Parser(options);
  // if no json is provided Stream API will be used
  if (!json) {
    return new Stream(parser);
  }
  // always return an promise
  return new Promise((resolve, reject) => {
    parser.parse(json, (err, result) => {
      if (callback) return callback(err, result);
      if (err) return reject(err);
      if (reject) return resolve(result);
    });
  });
};
