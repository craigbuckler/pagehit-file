/*
file handler functions
*/
const
  util = require('util'),
  fs = require('fs'),

  // promisify common fs functions
  // all return undefined when successful
  stat      = util.promisify(fs.stat),
  access    = util.promisify(fs.access),
  mkdir     = util.promisify(fs.mkdir),
  readdir   = util.promisify(fs.readdir),
  writefile = util.promisify(fs.writeFile),
  unlink    = util.promisify(fs.unlink);


// Promise returns information about a file/folder
function info(fn) {

  const file = {
    path: fn,
    exists: false,
    read: false,
    write: false,
    isFile: false,
    isDir: false,
    time: 0
  };

  return Promise.all([
    access(fn, fs.constants.F_OK),
    access(fn, fs.constants.R_OK),
    access(fn, fs.constants.W_OK)
  ])
    .then(fInfo => {

      file.exists = !fInfo[0];

      if (!file.exists) return file;
      else {

        file.read = !fInfo[1];
        file.write = !fInfo[2];

        return stat(fn)
          .then(fStat => {

            file.isFile = fStat.isFile();
            file.isDir = fStat.isDirectory();
            file.time = fStat.mtimeMs;
            return file;

          })
          .catch(() => file);

      }

    })
    .catch(() => file);

}


// return folder info object if it can be used
async function folderUsable(folder) {

  let fInfo = await info(folder);

  // create folder if required
  if (!fInfo.isDir) {
    if (!await mkdir(folder, { recursive: true })) {
      fInfo = await info(folder);
    }
  }

  // folder accessible?
  return (fInfo.isDir && fInfo.read && fInfo.write ? fInfo : false);

}


// return a sorted array of info objects for all files in a folder
async function folderList(folder, ext = '', sortBy = 'time') {

  // names of all files in folder
  let filelist = await readdir(folder);

  // fetch file info
  filelist = await Promise.all(
    filelist.map(async f => await info(folder + f))
  );

  // remove unreadable files and sort
  return filelist
    .filter(fn => fn.isFile && fn.read && (!ext || fn.path.endsWith('.' + ext)))
    .sort((f1, f2) => f2[sortBy] - f1[sortBy]);

}


// create a file, returns true on success
async function write(fn, content = '') {

  try {
    return !(await writefile(fn, content));
  }
  catch(err) {
    console.log('write error', err);
    return false;
  }

}


// delete an array of files
async function unlinkMany(fnlist) {

  return await Promise.all(
    fnlist.map(async fn => {

      try {
        return !(await unlink(fn.path ? fn.path : fn));
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
  stat,
  access,
  mkdir,
  readdir,
  writefile,
  unlink,
  info,
  folderUsable,
  folderList,
  write,
  unlinkMany
};
