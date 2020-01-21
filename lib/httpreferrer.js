/*
httpreferrer
returns a 32-character hash of a URL passed as the referrer of an HTTP request header
*/

'use strict';

const
  url = require('url'),
  crypto = require('crypto');

module.exports = (req) => {

  let
    r = url.parse(req.headers.referer || ''),
    ref = r.href ? r.protocol + r.host + r.pathname : null;

  return ref ? crypto.createHash('md5').update(ref).digest('hex') : null;

};
