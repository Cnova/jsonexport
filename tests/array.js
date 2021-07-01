/* jshint node:true */
/* jshint esversion: 6 */
/* jshint -W030 */

const {assert} = require('chai');
const jsonexport = require('../lib/index');
const os = require('os');

describe('Array', () => {
  it('simple', async () => {
    const csv = await jsonexport([{
      name: 'Bob',
      lastname: 'Smith'
    }, {
      name: 'James',
      lastname: 'David',
      escaped: 'I am a "quoted" field'
    }], {})
    assert.equal(csv, `name,lastname,escaped${os.EOL}Bob,Smith${os.EOL}James,David,"I am a ""quoted"" field"`);
  });
  it('complex', async () => {
    const csv = await jsonexport([{
      id: 1,
      name: 'Bob',
      lastname: 'Smith',
      family: {
        name: 'Peter',
        type: 'Father'
      }
    }, {
      id: 2,
      name: 'James',
      lastname: 'David',
      family: {
        name: 'Julie',
        type: 'Mother'
      }
    }], {})

    assert.equal(csv, `id,name,lastname,family.name,family.type${os.EOL}1,Bob,Smith,Peter,Father${os.EOL}2,James,David,Julie,Mother`);
  });
  it('with nested arrays', async () => {
    const csv = await jsonexport([{
      a: {
        b: true,
        c: [{
            d: 1
          },
          {
            d: 2
          },
          {
            d: 3
          },
          {
            d: 4
          }
        ],
        e: [{
            f: 1
          },
          {
            f: 2
          }
        ]
      }
    }], {})

    assert.equal(csv, `a.b,a.c.d,a.e.f${os.EOL}true,1,${os.EOL},2,${os.EOL},3,${os.EOL},4,1${os.EOL},,2`)
  });
  it('with nested arrays & empty strings', async () => {
    const csv = await jsonexport([
      {
        "a": "",
        "b": "b",
        "c": [
          {
            "a": "a1",
            "b": "b1"
          },
          {
            "a": "a2",
            "b": "b2"
          },
          {
            "a": "",
            "b": "b3"
          },
          {
            "a": "a4",
            "b": "b4"
          }
        ]
      }
    ], {})

    assert.equal(csv, `a,b,c.a,c.b${os.EOL},b,a1,b1${os.EOL},,a2,b2${os.EOL},,,b3${os.EOL},,a4,b4`)
  });

  it("with nested arrays & missing items in schema", async () => {
    const csv = await jsonexport([
      {
        a: {
          b: true,
          c: [
            {
              d: 1,
              h: 1,
            },
            {
              h: 2,
            },
            {
              d: 3,
              h: 3,
            },
          ],
        },
      },
    ]);

    assert.equal(
      csv,
      `a.b,a.c.d,a.c.h${os.EOL}true,1,1${os.EOL},,2${os.EOL},3,3`
    );
  });

  it("with nested arrays & out of order schema", async () => {
    const csv = await jsonexport([
      {
        a: {
          b: true,
          c: [
            {
              d: 1,
              h: 1,
            },
            {
              h: 5,
              d: 4,
            },
            {
              d: 3,
              h: 3,
            },
          ],
        },
      },
    ]);

    assert.equal(
      csv,
      `a.b,a.c.d,a.c.h${os.EOL}true,1,1${os.EOL},4,5${os.EOL},3,3`
    );
  });



  it("with nested arrays & complex json schema", async () => {
    const csv = await jsonexport([
      {
        a: {
          b: [
            {
              c: [
                {
                  d: {
                    name: "Name 1",
                    f: {
                      g: [
                        {
                          h: 1,
                          i: 2,
                          j: 3,
                        },
                        {
                          h: 4,
                          i: 5,
                          j: 6,
                        },
                        {
                          h: 7,
                          i: 8,
                          j: 9,
                        },
                        {
                          h: 10,
                          i: 11,
                          j: 12,
                        },
                      ],
                    },
                  },
                },
                {
                  d: {
                    name: "Name 2",
                    f: {
                      g: [
                        {
                          h: 13,
                          i: 14,
                          j: 15,
                        },
                      ],
                    },
                  },
                },
              ],
            },
          ],
        },
      },
    ]);
    console.log(csv)
    assert.equal(
      csv,
      `a.b.c.d.name,a.b.c.d.f.g.h,a.b.c.d.f.g.i,a.b.c.d.f.g.j${os.EOL}Name 1,1,2,3${os.EOL},4,5,6${os.EOL},7,8,9${os.EOL},10,11,12${os.EOL}Name 2,13,14,15`
    );
  })

  it("with nested arrays & complex json schema & inconsistent items", async () => {
    const csv = await jsonexport([
      {
        a: {
          b: [
            {
              c: [
                {
                  d: {
                    name: "Name 1",
                    date: "2020-03-31",
                    f: {
                      g: [
                        {
                          h: 1,
                          i: 2,
                          j: 3,
                        },
                        {
                          h: 4,
                          i: 5,
                          j: 6,
                        },
                        {
                          h: 7,
                          i: 8,
                          j: 9,
                        },
                        {
                          h: 10,
                          i: 11,
                          j: 12,
                        },
                      ],
                    },
                  },
                },
                {
                  d: {
                    date: "2020-06-30",
                    name: "Name 2",
                    f: {
                      g: [
                        {
                          h: 13,
                          i: 14,
                          j: 15,
                        },
                      ],
                    },
                  },
                },
              ],
            },
          ],
        },
      },
    ]);
    assert.equal(
      csv,
      `a.b.c.d.name,a.b.c.d.date,a.b.c.d.f.g.h,a.b.c.d.f.g.i,a.b.c.d.f.g.j${os.EOL}Name 1,2020-03-31,1,2,3${os.EOL},,4,5,6${os.EOL},,7,8,9${os.EOL},,10,11,12${os.EOL}Name 2,2020-06-30,13,14,15`
    );
  });

});
