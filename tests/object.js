/* jshint node:true */
/* jshint esversion: 6 */
/* jshint -W030 */

var chai = require('chai');
var {assert, expect} = require('chai');
var jsonexport = require('../lib/index');
var os = require('os');

const isRemoteTest = process.env.APPVEYOR || process.env.TRAVIS;
if( isRemoteTest ){
  console.log('\x1b[34mRemote testing server detected on '+os.type()+' '+os.platform()+' '+os.release()+'\x1b[0m');
}

describe('Object', () => {
  it('simple', async () => {
    const csv = await jsonexport({
      lang: 'Node.js',
      module: 'jsonexport'
    }, {})
    assert.equal(csv, `lang,Node.js${os.EOL}module,jsonexport`);
  });

  it('complex', async () => {
    const csv = await jsonexport({
      cars: 12,
      roads: 5,
      traffic: 'slow',
      speed: {
        max: 123,
        avg: 20,
        min: 5
      },
      size: [10, 20],
      escaped: 'I am a "quoted" field'
    }, {})
    assert.equal(csv, `cars,12${os.EOL}roads,5${os.EOL}traffic,slow${os.EOL}speed.max,123${os.EOL}speed.avg,20${os.EOL}speed.min,5${os.EOL}size,10;20${os.EOL}escaped,"I am a ""quoted"" field"`);
  });

  it('Github #41 p1',async ()=>{
    var contacts = [{
        name: 'Bob',
        lastname: 'Smith',
        status: null,
        test: true
    },{
        name: 'James',
        lastname: 'David',
        status: 'fired',
        test: true
    }];

    const csv = await jsonexport(contacts)
    assert.equal(csv, `name,lastname,status,test${os.EOL}Bob,Smith,,true${os.EOL}James,David,fired,true`);
  });

  it('Github #41 p2',async ()=>{
    var contacts = {
      'a' : 'another field',
      'b' : '',
      'c' : 'other field'
    };

    const csv = await jsonexport(contacts)
    assert.equal(csv, `a,another field${os.EOL}b,${os.EOL}c,other field`);
  });

  it('Buffer to String - Github #48',async ()=>{
    var contacts = {
      '0' : true,
      '1' : [11,22,33],
      '2' : ()=>'bad ace',
      'a' : Buffer.from('a2b', 'utf8'),
      'b' : 'x',
      'c' : 99,
      'd' : {
        x:Buffer.from('other field', 'utf8')
      }
    };

    var options={
      typeHandlers:{
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
          if(parent===contacts){
            return 'parentless-'+index;
          }

          return value.toString();
        }
      }
    };

    const csv = await jsonexport(contacts, options)
    assert.equal(csv, `0,replaced-boolean${os.EOL}1,replaced-array${os.EOL}2,bad ace${os.EOL}a,parentless-a${os.EOL}b,replaced-string${os.EOL}c,replaced-number${os.EOL}d.x,other field`);
  });

  it('Zero, undefined, & null', async () => {
    const csv = await jsonexport([
      {
        "a": 0,
        "b": undefined,
        "c": null,
        "d": 1,
        "e": "this"
      }
    ], {})

    assert.equal(csv, `a,b,c,d,e`+ os.EOL +`0,,,1,this`)
  });
  it('Date', async () => {
    const csv = await jsonexport([
      {
        "a": 0,
        "b": undefined,
        "c": null,
        "d": 1,
        "e": "this",
        "f": new Date('10/20/2020'),
      }
    ], {})

    assert.equal(csv, `a,b,c,d,e,f\n0,,,1,this,${(new Date('10/20/2020')).toLocaleDateString()}`)
  });

  it('Date with typeHandlers.Date', async () => {
    const csv = await jsonexport([
      {
        "a": 0,
        "b": undefined,
        "c": null,
        "d": 1,
        "e": "this",
        "f": new Date('10/20/2020'),
      }
    ], {
      typeHandlers: {
        //Using "replace-date" because of problem of locale
        Date: (value, index, parent) => "replaced-date",
      }
    })

    assert.equal(csv, `a,b,c,d,e,f\n0,,,1,this,replaced-date`)
  });

  it('Date with handleDate', async () => {
    const csv = await jsonexport([
      {
        "a": 0,
        "b": undefined,
        "c": null,
        "d": 1,
        "e": "this",
        "f": new Date('10/20/2020'),
      }
    ], {
      handleDate: (element, item) => "replaced-date",
    })

    assert.equal(csv, `a,b,c,d,e,f\n0,,,1,this,replaced-date`)
  });
});
