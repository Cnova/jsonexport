# jsonexport {} → 📄 

[![Travis](https://travis-ci.org/kauegimenes/jsonexport.svg)](https://travis-ci.org/kauegimenes/jsonexport)
[![Known Vulnerabilities](https://snyk.io/test/npm/jsonexport/badge.svg)](https://snyk.io/test/npm/jsonexport)
[![NPM Version](http://img.shields.io/npm/v/jsonexport.svg?style=flat)](https://www.npmjs.org/package/jsonexport)
[![NPM Downloads](https://img.shields.io/npm/dm/jsonexport.svg?style=flat)](https://www.npmjs.org/package/jsonexport)
[![NPM Downloads](https://img.shields.io/npm/dt/jsonexport.svg?style=flat)](https://www.npmjs.org/package/jsonexport)
[![NPM License](https://img.shields.io/npm/l/jsonexport.svg?style=flat)](https://www.npmjs.org/package/jsonexport)
[![GitHub stars](https://img.shields.io/github/stars/kauegimenes/jsonexport.svg)](https://github.com/kaue/jsonexport/stargazers)
[![Try jsonexport on RunKit](https://badge.runkitcdn.com/jsonexport.svg)](https://npm.runkit.com/jsonexport)
![npm bundle size](https://img.shields.io/bundlephobia/minzip/jsonexport)

✔ **easy to use** 👌 (should work as expected without much customization)️

✔ **extendable** 🕺 (many options to customize the output)

✔️ **tiny** 🐜 (0 dependencies) 

✔ **scalable** 💪 (works with big files using Streams)

✔ **fast** ⚡ 

[Project Page](https://kaue.github.io/jsonexport/)

[Online Demo Page](https://kaue.github.io/jsonexport/demo/)

<details>
  <summary><b>Table of Contents</b></summary>

- [Usage](#usage)
- [CLI](#cli)
- [Browser](#browser)
  - [Browser Import Examples](#browser-import-examples)
- [Stream](#stream)
- [Promise](#promise)
- [JSON Array Example](#json-array-example)
  - [Simple Array](#simple-array)
  - [JSON Object Example](#json-object-example)
- [Options](#options)
  - [typeHandlers](#typehandlers)
- [Contributors](#contributors)

</details>


# Usage

Installation command is `npm install jsonexport`.

Run tests with `npm test`.

```javascript
const jsonexport = require('jsonexport');

jsonexport({lang: 'Node.js', module: 'jsonexport'}, {rowDelimiter: '|'}, function(err, csv){
    if (err) return console.error(err);
    console.log(csv);
});
```

## CLI

Global installation command is `npm install -g jsonexport`.

Convert JSON to CSV using `cat data.json | jsonexport` or `jsonexport data.json`

Usage: `jsonexport <JSON filename> <CSV filename>`

## Browser
Use the code in the folder named **dist** to run jsonexport in the browser

### Browser Import Examples

Webpack
```javascript
const jsonexport = require("jsonexport/dist")
```

Typescript
```javascript
import * as jsonexport from "jsonexport/dist"
```

## Stream

```javascript
const jsonexport = require('jsonexport');
const fs = require('fs');

const reader = fs.createReadStream('data.json');
const writer = fs.createWriteStream('out.csv');

reader.pipe(jsonexport()).pipe(writer);
```

## Promise

```javascript
const jsonexport = require('jsonexport')
try {
    const csv = await jsonexport({lang: 'Node.js', module: 'jsonexport'}, {rowDelimiter: '|'});
} catch (err) {
    console.error(err);
}
```

## JSON Array Example

### Simple Array

#### Code

```javascript
const jsonexport = require('jsonexport');

const contacts = [{
    name: 'Bob',
    lastname: 'Smith'
},{
    name: 'James',
    lastname: 'David'
},{
    name: 'Robert',
    lastname: 'Miller'
},{
    name: 'David',
    lastname: 'Martin'
}];

jsonexport(contacts, function(err, csv){
    if (err) return console.error(err);
    console.log(csv);
});
```

#### Result

```
name,lastname
Bob,Smith
James,David
Robert,Miller
David,Martin
```

### Complex Array

#### Code

```javascript
const jsonexport = require('jsonexport');

const contacts = [{
   name: 'Bob',
   lastname: 'Smith',
   family: {
       name: 'Peter',
       type: 'Father'
   }
},{
   name: 'James',
   lastname: 'David',
   family:{
       name: 'Julie',
       type: 'Mother'
   }
},{
   name: 'Robert',
   lastname: 'Miller',
   family: null,
   location: [1231,3214,4214]
},{
   name: 'David',
   lastname: 'Martin',
   nickname: 'dmartin'
}];

jsonexport(contacts, function(err, csv){
    if (err) return console.error(err);
    console.log(csv);
});
```

#### Result

```
name,lastname,family.name,family.type,family,location,nickname
Bob,Smith,Peter,Father
James,David,Julie,Mother
Robert,Miller,,,,1231;3214;4214
David,Martin,,,,,dmartin
```

## JSON Object Example

### Simple Object

#### Code

```javascript
const jsonexport = require('jsonexport');

const stats = {
    cars: 12,
    roads: 5,
    traffic: 'slow'
};

jsonexport(stats, function(err, csv){
    if(err) return console.error(err);
    console.log(csv);
});
```

#### Result

```
cars,12
roads,5
traffic,slow
```

### Complex Object

#### Code

```javascript
const jsonexport = require('jsonexport');

const stats = {
    cars: 12,
    roads: 5,
    traffic: 'slow',
    speed: {
        max: 123,
        avg: 20,
        min: 5
    },
    size: [10,20]
};

jsonexport(stats, function(err, csv){
    if(err) return console.error(err);
    console.log(csv);
});
```

#### Result

```
cars,12
roads,5
traffic,slow
speed.max,123
speed.avg,20
speed.min,5
size,10;20
```

### Complex JSON Array

#### Code (fillGaps, fillTopRow = true)

```javascript
const jsonexport = require('jsonexport');

const stats = [{
                  manufacturer: 'BMW',
                  country: 'USA',
                  inventory: {
                    profile: ['public'],
                    cars: [
                      {
                        model: '3-series',
                        price: '34850'
                      },
                      {
                        model: '5-series',
                        price: '55000'
                      },
                      {
                        model: '7-series',
                        price: '72000'
                      }
                    ]
                  },
                  category: [
                    {
                      sedan: [
                        {
                          seats: 4,
                          doors: 4,
                          sunroof: true
                        }
                      ]
                    }
                  ],
                  location: {
                    address: [
                      {
                        city: 'Raleigh',
                        state: 'NC',
                        dealer: 'Raleigh Motors'
                      },
                      {
                        city: 'Durham',
                        state: 'NC',
                        dealer: 'Durham BMW'
                      }
                    ]
                  }
                },
                {
                  manufacturer: 'Audi',
                  country: 'USA',
                  inventory: {
                    profile: ['public'],
                    cars: [
                      {
                        model: 'Q3',
                        price: '36700'
                      },
                      {
                        model: 'Q5',
                        price: '48900'
                      },
                      {
                        model: 'Q7',
                        price: '91350'
                      }
                    ]
                  },
                  category: [
                    {
                      sedan: [
                        {
                          seats: 7,
                          doors: 4,
                          sunroof: true,
                          heatedSeats: 'front'
                        }
                      ]
                    }
                  ],
                  location: {
                    address: [
                      {
                        city: 'Greensboro',
                        state: 'NC',
                        dealer: 'Audi Greensboro'
                      },
                      {
                        city: 'Asheville',
                        state: 'NC',
                        dealer: 'Asheville Audi Motors'
                      }
                    ]
                  }
                }
              ];

jsonexport(stats, {fillGaps: true, fillTopRow: true}, 
    function(err, csv){
    if(err) return console.error(err);
    console.log(csv);
});
```

#### Result

```
manufacturer,country,inventory.profile,inventory.cars.model,inventory.cars.price,category.sedan.seats,category.sedan.doors,category.sedan.sunroof,location.address.city,location.address.state,location.address.dealer,category.sedan.heatedSeats
BMW,USA,public,3-series,34850,4,4,true,Raleigh,NC,Raleigh Motors
BMW,USA,public,5-series,55000,4,4,true,Durham,NC,Durham BMW
BMW,USA,public,7-series,72000,4,4,true,Durham,NC,Durham BMW
Audi,USA,public,Q3,36700,7,4,true,Greensboro,NC,Audi Greensboro,front
Audi,USA,public,Q5,48900,7,4,true,Asheville,NC,Asheville Audi Motors,front
Audi,USA,public,Q7,91350,7,4,true,Asheville,NC,Asheville Audi Motors,front
```

## Options

In order to get the most of out of this module, you can customize many parameters and functions.

- `headerPathString` - `String` Used to create the propriety path, defaults to `.` example `contact: {name: 'example}` = `contact.name`
- `fillGaps` - `Boolean` Set this option if don't want to have empty cells in case of an object with multiple nested items (array prop), defaults to `false` [Issue #22](https://github.com/kaue/jsonexport/issues/22)
- `fillTopRow` - `Boolean` try filling top rows first for unpopular colums, defaults to `false`
- `headers` - `Array` Used to set a custom header order, defaults to `[]` example `['lastname', 'name']`
- `rename` - `Array` Used to set a custom header text, defaults to `[]` example `['Last Name', 'Name']`
- `mapHeaders` - `Function` Post-process headers after they are calculated with delimiters, example `mapHeaders: (header) => header.replace(/foo\./, '')`
- `rowDelimiter` - `String` Change the file row delimiter
    - Defaults to `,` (**cvs format**).
    - Use `\t` for **xls format**.
    - Use `;` for (**windows excel .csv format**).
- `textDelimiter` - `String` The character used to escape the text content if needed (default to `"`)
- `forceTextDelimiter` - `Boolean` Set this option to true to wrap every data item and header in the textDelimiter. Defaults to `false`
- `endOfLine` - `String` Replace the OS default EOL.
- `mainPathItem` - `String` Every header will have the `mainPathItem` as the base.
- `arrayPathString` - `String` This is used to output primitive arrays in a single column, defaults to `;`
- `booleanTrueString` - `String` Will be used instead of `true`.
- `booleanFalseString` - `String` Will be used instead of `false`.
- `includeHeaders` - `Boolean` Set this option to false to hide the CSV headers.
- `undefinedString` - `String` If you want to display a custom value for undefined strings, use this option. Defaults to ` `.
- `verticalOutput` - `Boolean` Set this option to false to create a horizontal output for JSON Objects, headers in the first row, values in the second.
- `typeHandlers` - `{typeName:(value, index, parent)=>any` A key map of constructors used to match by instance to create a value using the defined function ([see example](#typehandlers))

#### typeHandlers
Define types by constructors and what function to run when that type is matched

```javascript
const jsonexport = require('jsonexport');

//data
const contacts = {
  'a' : Buffer.from('a2b', 'utf8'),
  'b' : Buffer.from('other field', 'utf8'),
  'x' : 22,
  'z' : function(){return 'bad ace'}
};

const options = {
  //definitions to type cast
  typeHandlers: {
    Array:function(value,index,parent){
      return 'replaced-array';
    },
    Boolean:function(value,index,parent){
      return 'replaced-boolean';
    },
    Function:function(value,index,parent){
      return value();
    },
    Number:function(value,index,parent){
      return 'replaced-number';
    },
    String:function(value,index,parent){
      return 'replaced-string';
    },
    Buffer:function(value,index,parent){
      return value.toString();
    }
  }
};

jsonexport(contacts, options, function(err, csv) {
  if (err) return console.error(err);
  console.log(csv);
});
```

The output would be:
```
a,a2b
b,other field
x,replaced-number
z,bad ace
```

Date typeHandler?

```javascript
var date = new Date();
jsonexport({
    a: date,
    b: true
}, {
    typeHandlers: {
        Object: (value, name) => {
            if (value instanceof Date) return date.toLocaleString();
            return value;
        }
    }
}, (err, csv) => {
    if (err) return console.error(err);
    console.log(csv);
});
```

When using **typeHandlers**, Do NOT do this

```javascript
const options = {
  typeHandlers: {
    Object:function(value, index, parent){
      return 'EVERYTHING IS AN OBJECT';
    }
  }
};
```
> It is NOT an error, however the recursive result becomes illegable functionality strings

## Contributors
- [Kauê Gimenes](https://github.com/kaue)
- [Pierre Guillaume](https://github.com/papswell)
- [Acker Apple](https://github.com/AckerApple) [![hire me](https://ackerapple.github.io/resume/assets/images/hire-me-badge.svg)](https://ackerapple.github.io/resume/)
- [Victor Hahn](https://github.com/rv-vhahn)
- [Jason Macgowan](https://github.com/jasonmacgowan)
- [And many more...](https://github.com/kaue/jsonexport/graphs/contributors)
