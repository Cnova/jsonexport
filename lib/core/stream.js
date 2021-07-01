/* jshint node:true */
'use strict';

const Transform = require('stream').Transform;

class Stream extends Transform {

  constructor(parser) {
    super();
    this._parser = parser;
    this._options = parser._options;
    this._headers = this._options.headers || [];
    this._hasHeaders = false;
    this._lastError = null;
  }

  _mergeChunk(chunk) {
    let self = this;
    self._extra = self._extra || "";
    // Remove starting comma
    if (self._extra.charAt(0) == ',') self._extra = self._extra.substr(1);
    // Append extra to chunk
    chunk = self._extra + chunk.toString();
    // Clear extra memory
    if (self._extra.length > 0) self._extra = "";
    return chunk;
  }

  _transform(chunk, encoding, done) {
    let self = this;
    let json = null;
    // Append extra data to chunk data
    chunk = this._mergeChunk(chunk);    
    if (!chunk) return done(this._lastError);
    // Split chunk in objects
    let parts = chunk.split('}');
    while (json === null && parts.length > 0) {
      try {
        json = JSON.parse(chunk);
      } catch (ex) {
        this._lastError = ex;
        let extraChunk = parts.pop();
        self._extra = extraChunk + (self._extra || "");
        if (parts.length > 0) parts[parts.length - 1] += "}";
      }
    }    
    if (!json) return done();
    this._parser.parse(json, (err, csvChunk) => {
      if (err) return done(err);
      if (!self.hasHeaders) {
        self.hasHeaders = true;
        self.push(self._parser.headers);
      }
      self.push(self._options.endOfLine + csvChunk);
      done();
    }, true);
  }
}

module.exports = Stream;
