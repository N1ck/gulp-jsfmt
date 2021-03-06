'use strict';

var jsfmt = require('jsfmt');
var through = require('through2');
var BufferStreams = require('bufferstreams');
var util = require('./util');

require('sugar');

module.exports = function () {
  var opts = util.parseOpts(arguments);

  function fmt(buffer) {
    if (opts.patterns.length > 0) {
      var contents = buffer.toString();
      opts.patterns.each(function (p) {
        contents = jsfmt.rewrite(contents, p);
      });
      return new Buffer(contents.toString());
    }

    return buffer;
  }

  return through.obj(function (file, _, cb) {
    if (file.isBuffer()) {
      file.contents = fmt(file.contents);
    } else if (file.isStream()) {
      file.contents = file.contents.pipe(new BufferStreams(function (err, buf, cb) {
        cb(null, fmt(buf));
      }));
    }

    this.push(file);
    return cb();
  });
};
