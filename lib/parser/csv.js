/* jshint node:true */
'use strict';

/**
 * Module dependencies.
 */
const joinRows = require('../core/join-rows');
const Handler = require('./handler');
const helper = require('../core/helper');

class Parser {
  constructor(options) {
    this._options = options || {};
    this._handler = new Handler(this._options);
    this._headers = this._options.headers || [];
    this._escape = require('../core/escape-delimiters')(
      this._options.textDelimiter,
      this._options.rowDelimiter,
      this._options.forceTextDelimiter
    );
  }

  /**
   * Generates a CSV file with optional headers based on the passed JSON,
   * with can be an Object or Array.
   *
   * @param {Object|Array} json
   * @param {Function} done(err,csv) - Callback function
   *      if error, returning error in call back.
   *      if csv is created successfully, returning csv output to callback.
   */
  parse(json, done, stream) {
    if (helper.isArray(json)) return done(null, this._parseArray(json, stream));
    else if (helper.isObject(json)) return done(null, this._parseObject(json));
    return done(new Error('Unable to parse the JSON object, its not an Array or Object.'));
  }

  get headers() {
    let headers = this._headers;

    if (this._options.rename && this._options.rename.length > 0)
      headers = headers.map((header) => this._options.rename[this._options.headers.indexOf(header)] || header);
      
    if (this._options.forceTextDelimiter) {
      headers = headers.map((header) => {
        return `${this._options.textDelimiter}${header}${this._options.textDelimiter}`;
      });
    }

    if (this._options.mapHeaders)
      headers = headers.map(this._options.mapHeaders);

    return headers.join(this._options.rowDelimiter);
  }

  _checkRows(rows) {
    let lastRow = null;
    let finalRows = [];
    let fillGaps = (col, index) => col === '' || col === undefined ? lastRow[index] : col;
    for (let row of rows) {
      let missing = this._headers.length - row.length;
      if (missing > 0) row = row.concat(Array(missing).join(".").split("."));
      if (lastRow && this._options.fillGaps) row = row.map(fillGaps);
      finalRows.push(row.join(this._options.rowDelimiter));
      lastRow = row;
    }
    return finalRows;
  }

  _parseArray(json, stream) {
    let self = this;
    this._headers = this._headers || [];
    let normalizedHeaders = []
    let fileRows = [];
    let outputFile;
    let fillRows;

    let getHeaderIndex = function(header) {
      var index = self._headers.indexOf(header);
      if (index === -1) {
        self._headers.push(header);
        index = self._headers.indexOf(header);
      }
      return index;
    };

    let getNormalizedIndex = function(header) {
      var index = normalizedHeaders.indexOf(header)
      if (index === -1) {
        normalizedHeaders.push(header)
        index = normalizedHeaders.indexOf(header)
      }
      return index
    }

    //Generate the csv output
    fillRows = function(result) {
      const rows = [];
      const fillAndPush = (row) => rows.push(row.map(col => col != null ? col : ''));
      // initialize the array with empty strings to handle 'unpopular' headers
      const newRow = () => new Array(self._headers.length).fill(null);
      const emptyRowIndexByHeader = {};
      let currentRow = newRow();
      let lastIndex = -1
      for (let element of result) {
        let elementHeaderIndex = getHeaderIndex(element.item);
        let normalizedIndex = getNormalizedIndex(element.item)
        if (
          currentRow[elementHeaderIndex] != undefined ||
          normalizedIndex < lastIndex
        ) {
          fillAndPush(currentRow);
          currentRow = newRow();
        }
        emptyRowIndexByHeader[elementHeaderIndex] = emptyRowIndexByHeader[elementHeaderIndex] || 0;
        lastIndex = normalizedIndex;
        // make sure there isn't a empty row for this header

        if (self._options.fillTopRow && emptyRowIndexByHeader[elementHeaderIndex] < rows.length) {
          rows[emptyRowIndexByHeader[elementHeaderIndex]][elementHeaderIndex] = self._escape(element.value);
          emptyRowIndexByHeader[elementHeaderIndex] += 1;
          continue;
        }
        currentRow[elementHeaderIndex] = self._escape(element.value);
        emptyRowIndexByHeader[elementHeaderIndex] += 1;
      }
      // push last row
      if (currentRow.length > 0) {
        fillAndPush(currentRow);
      }
      fileRows = fileRows.concat(self._checkRows(rows));
    };
    for (let item of json) {
      //Call checkType to list all items inside this object
      //Items are returned as a object {item: 'Prop Value, Item Name', value: 'Prop Data Value'}
      let itemResult = self._handler.check(item, self._options.mainPathItem, item, json);
      fillRows(itemResult);
    }

    if (!stream && self._options.includeHeaders) {
      //Add the headers to the first line
      fileRows.unshift(this.headers);
    }

    return joinRows(fileRows, self._options.endOfLine);
  }

  _parseObject(json) {
    let self = this;
    let fileRows = [];
    let parseResult = [];
    let outputFile;
    let fillRows;
    let horizontalRows = [
      [],
      []
    ];

    fillRows = function(result) {
      var value = result.value || result.value === 0 ? result.value.toString() : self._options.undefinedString;
      value = self._escape(value);

      //Type header;value
      if (self._options.verticalOutput) {
        var row = [result.item, value];
        fileRows.push(row.join(self._options.rowDelimiter));
      } else {
        horizontalRows[0].push(result.item);
        horizontalRows[1].push(value);
      }
    };
    for (var prop in json) {
      var prefix = "";
      if (this._options.mainPathItem)
        prefix = this._options.mainPathItem + this._options.headerPathString;
      parseResult = this._handler.check(json[prop], prefix + prop, prop, json);

      parseResult.forEach(fillRows);
    }
    if (!this._options.verticalOutput) {
      fileRows.push(horizontalRows[0].join(this._options.rowDelimiter));
      fileRows.push(horizontalRows[1].join(this._options.rowDelimiter));
    }
    return joinRows(fileRows, this._options.endOfLine);
  }
}

module.exports = Parser;
