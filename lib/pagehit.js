/*
page hit object
call count() method to increment counter and return total hits

Count data is stored in memory but saved to a file in the data folder every 10 seconds.
*/
const

  // modules
  fileUtil = require('./fileutil'),
  httpReferrer = require('./httpreferrer'),

  // default data folder
  path = require('path'),
  dataFolder = path.resolve('./data') + path.sep,

  // file save thottling - no more than every 10 seconds
  saveFrequency = 10 * 1000;


module.exports = class {

  // initialize
  constructor() {

    // counter storage
    this.counter = {};

    (async () => {

      // store folder available?
      this.folder = await fileUtil.folderUsable(dataFolder);
      if (!this.folder) return;

      // fetch all JSON files sorted most recent first
      this.saved = await fileUtil.folderList(this.folder.path, '.json');

      // import and merge latest data
      if (this.saved.length) {
        Object.assign(this.counter, require(this.saved[0].path));
      }

    })();

  }


  // increase URL counter
  count(req) {

    let hash = httpReferrer(req);
    if (!hash) return null;

    // define count default
    this.counter[ hash ] = this.counter[ hash ] || 0;

    // save event
    this.saveTimer = this.saveTimer || setTimeout(this.save.bind(this), saveFrequency);

    // return incremented count
    return ++this.counter[ hash ];
  }


  // store latest data
  async save() {

    // can save
    if (!this.folder) return;

    // save new file
    let fn = `${this.folder.path}hit${+ new Date()}.json`;

    if (await fileUtil.write(fn, JSON.stringify(this.counter))) {

      console.log(`page hits stored: ${fn}`);

      // delete old files
      fileUtil.unlinkMany(this.saved);

      // add current file to saved list
      this.saved = [{ path: fn }];

    }

    // reset timer
    this.saveTimer = null;

  }

};
