/* jshint node:true */
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var helper = require('../core/helper');

var Handler = function () {
  function Handler(options) {
    _classCallCheck(this, Handler);

    this._options = options;

    // an object of {typeName:(value,index,parent)=>any}
    this._options.typeHandlers = this._options.typeHandlers || {};
  }

  /**
   * Check if results needing mapping to alternate value
   *
   * @returns [{item, value}] result
   */


  _createClass(Handler, [{
    key: '_setHeaders',
    value: function _setHeaders(result, item) {
      var self = this;
      if (!item) return result;
      return result.map(function (element) {
        element.item = element.item ? item + self._options.headerPathString + element.item : item;
        return element;
      });
    }
  }, {
    key: 'castValue',
    value: function castValue(element, item, index, parent) {
      //cast by matching constructor
      var types = this._options.typeHandlers;
      for (var type in types) {
        if (isInstanceOfTypeName(element, type)) {
          element = types[type].call(types, element, index, parent);
          break; //first match we move on
        }
      }

      return element;
    }
  }, {
    key: 'checkComplex',
    value: function checkComplex(element, item) {
      //Check if element is a Date
      if (helper.isDate(element)) {
        return [{
          item: item,
          value: (this._options.handleDate || this._handleDate)(element, item)
        }];
      }
      //Check if element is an Array
      else if (helper.isArray(element)) {
          var resultArray = this._handleArray(element, item);
          return this._setHeaders(resultArray, item);
        }
        //Check if element is a Object
        else if (helper.isObject(element)) {
            var resultObject = this._handleObject(element);
            return this._setHeaders(resultObject, item);
          }

      return [{
        item: item,
        value: ''
      }];
    }

    /**
     * Check the element type of the element call the correct handle function
     *
     * @param element Element that will be checked
     * @param item Used to make the headers/path breadcrumb
     * @returns [{item, value}] result
     */

  }, {
    key: 'check',
    value: function check(element, item, index, parent) {
      element = this.castValue(element, item, index, parent);
      // try simple value by highier performance switch
      switch (typeof element === 'undefined' ? 'undefined' : _typeof(element)) {
        case 'string':
          return [{
            item: item,
            value: this._handleString(element, item)
          }];

        case 'number':
          return [{
            item: item,
            value: this._handleNumber(element, item)
          }];

        case 'boolean':
          return [{
            item: item,
            value: this._handleBoolean.bind(this)(element, item)
          }];
      }

      return this.checkComplex(element, item);
    }

    /**
     * Handle all Objects
     *
     * @param {Object} obj
     * @returns [{item, value}] result
     */

  }, {
    key: '_handleObject',
    value: function _handleObject(obj) {
      var result = [];
      //Look every object props
      for (var prop in obj) {
        var propData = obj[prop];
        //Check the propData type
        var resultCheckType = this.check(propData, prop, prop, obj);
        //Append to results aka merge results aka array-append-array
        result = result.concat(resultCheckType);
      }
      return result;
    }

    /**
     * Handle all Arrays, merges arrays with primitive types in a single value
     *
     * @param {Array} array
     * @returns [{item, value}] result
     */

  }, {
    key: '_handleArray',
    value: function _handleArray(array) {
      var self = this;
      var result = [];
      var headers = [];
      var firstElementWithoutItem;

      var getHeaderIndex = function getHeaderIndex(item) {
        var index = headers.indexOf(item);
        if (index === -1) {
          headers.push(item);
          index = headers.indexOf(item);
        }
        return index;
      };
      var sortByHeaders = function sortByHeaders(itemA, itemB) {
        return getHeaderIndex(itemA.item) - getHeaderIndex(itemB.item);
      };
      for (var aIndex = 0; aIndex < array.length; ++aIndex) {
        var element = array[aIndex];
        //Check the propData type
        var resultCheckType = self.check(element, null, aIndex, array);
        //Check for results without itens, merge all itens with the first occurrence
        if (resultCheckType.length === 0) continue;
        var firstResult = resultCheckType[0];
        if (!firstResult.item && firstElementWithoutItem !== undefined) {
          firstElementWithoutItem.value += self._options.arrayPathString + firstResult.value;
          continue;
        } else if (resultCheckType.length > 0 && !firstResult.item && firstElementWithoutItem === undefined) {
          firstElementWithoutItem = firstResult;
        }
        for (var bIndex = 0; bIndex < resultCheckType.length; bIndex++) {
          getHeaderIndex(resultCheckType[bIndex].item);
        }
        //Append to results
        var sortedResultCheckType = resultCheckType.sort(sortByHeaders);
        result = result.concat(sortedResultCheckType);
      }
      return result;
    }
    /**
     * Handle all Boolean variables, can be replaced with options.handleBoolean
     *
     * @param {Boolean} boolean
     * @returns {String} result
     */

  }, {
    key: '_handleBoolean',
    value: function _handleBoolean(boolean) {
      var result;
      //Check for booolean options
      if (boolean) {
        result = this._options.booleanTrueString || 'true';
      } else {
        result = this._options.booleanFalseString || 'false';
      }
      return result;
    }
    /**
     * Handle all String variables, can be replaced with options.handleString
     *
     * @param {String} string
     * @returns {String} string
     */

  }, {
    key: '_handleString',
    value: function _handleString(string) {
      return string;
    }
    /**
     * Handle all Number variables, can be replaced with options.handleNumber
     *
     * @param {Number} number
     * @returns {Number} number
     */

  }, {
    key: '_handleNumber',
    value: function _handleNumber(number) {
      return number;
    }
    /**
     * Handle all Date variables, can be replaced with options.handleDate
     *
     * @param {Date} number
     * @returns {string} result
     */

  }, {
    key: '_handleDate',
    value: function _handleDate(date) {
      return date.toLocaleDateString();
    }
  }]);

  return Handler;
}();

module.exports = Handler;

var globalScope = typeof window === "undefined" ? global : window;
function isInstanceOfTypeName(element, typeName) {
  if (element instanceof globalScope[typeName]) {
    return true; //Buffer and complex objects
  }

  //literals in javascript cannot be checked by instance of
  switch (typeof element === 'undefined' ? 'undefined' : _typeof(element)) {
    case 'string':
      return typeName === "String";
    case 'boolean':
      return typeName === "Boolean";
    case 'number':
      return typeName === "Number";
  }

  return false;
}