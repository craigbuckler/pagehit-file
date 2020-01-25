/*
file handler functions
*/

'use strict';

const
  fs = require('fs'),
  fsPromise = fs.promises;


// returns information about a file/folder
function info(fn) {

  const file = {
    path:   fn,
    exists: false,
    read:   false,
    write:  false,
    isFile: false,
    isDir:  false,
    time:   0
  };

  return Promise.all([
    fsPromise.access(fn, fs.constants.F_OK),
    fsPromise.access(fn, fs.constants.R_OK),
    fsPromise.access(fn, fs.constants.W_OK)
  ])
    .then(fInfo => {

      file.exists = !fInfo[0];

      if (!file.exists) return file;
      else {

        file.read  = !fInfo[1];
        file.write = !fInfo[2];

        return fsPromise.stat(fn)
          .then(fStat => {

            file.isFile = fStat.isFile();
            file.isDir  = fStat.isDirectory();
            file.time   = fStat.mtimeMs;
            return file;

          })
          .catch(() => file);

      }

    })
    .catch(() => file);

}


// return folder info object if it can be used
async function folderUsable(folder) {

  try {

    // fetch folder information
    let fInfo = await info(folder);

    // create folder if required
    if (!fInfo.isDir) {
      await fsPromise.mkdir(folder);
      fInfo = await info(folder);
    }

    // folder accessible?
    return (fInfo.isDir && fInfo.read && fInfo.write ? fInfo : false);

  }
  catch (err) {
    console.log('folderUsable error:', err);
    return false;
  }

}


// return a sorted array of info objects for all files in a folder
async function folderList(folder, ext = '', sortBy = 'time') {

  try {

    // names of all files in folder
    let filelist = await fsPromise.readdir(folder);

    // fetch file info
    filelist = await Promise.all(
      filelist.map(async f => await info(folder + f))
    );

    // remove unreadable files and sort
    return filelist
      .filter(fn => fn.isFile && fn.read && fn.path.endsWith(ext))
      .sort((f1, f2) => f2[sortBy] - f1[sortBy]);

  }
  catch (err) {
    console.log('folderList error', err);
    return false;
  }

}


// create a file, returns true or false
async function write(fn, content = '') {

  try {
    await fsPromise.writeFile(fn, content);
    return true;
  }
  catch (err) {
    console.log('write error', err);
    return false;
  }

}


// delete an array of files, return array of true/false
async function unlinkMany(fnlist) {

  return await Promise.all(

    fnlist.map(async fn => {

      try {
        await fsPromise.unlink(fn.path ? fn.path : fn);
        return true;
      }
      catch (err) {
        console.log('unlink error', err);
        return false;
      }

    })

  );

}


// public functions
module.exports = {
  info,
  folderUsable,
  folderList,
  write,
  unlinkMany
};
