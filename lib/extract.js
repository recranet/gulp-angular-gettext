'use strict';

const path = require('node:path');
const { objectTransform } = require('through2');
const PluginError = require('plugin-error');
const Vinyl = require('vinyl');
const { Extractor } = require('@recranet/angular-gettext-tools');

const pluginName = require('../package.json').name;

module.exports = function (out, config) {
  if (arguments.length === 1 && typeof out !== 'string') {
    // out is optional
    config = out;
    out = null;
  }

  if (!out) {
    // return a standard gulp stream
    return objectTransform(function (file, enc, cb) {
      if (file.isNull()) {
        return cb(null, file);
      }

      if (file.isStream()) {
        return cb(new PluginError(pluginName, 'Streaming not supported'));
      }

      const extractor = new Extractor(config);
      extractor.parse(file.relative, file.contents.toString());
      file.contents = Buffer.from(extractor.toString());

      const extension = path.extname(file.path);
      const extIndex = file.path.lastIndexOf(extension);
      file.path = file.path.substring(0, extIndex) + '.pot';

      cb(null, file);
    });
  }

  // concatenate output, inspired by gulp-concat
  const extractor = new Extractor(config);
  let firstFile = null;

  return objectTransform(function (file, enc, cb) {
    if (file.isNull()) {
      return cb(); // ignore
    }

    if (file.isStream()) {
      return cb(new PluginError(pluginName, 'Streaming not supported'));
    }

    if (!firstFile) {
      firstFile = file;
    }

    extractor.parse(file.relative, file.contents.toString());

    cb();
  }, function (cb) {
    if (firstFile) {
      this.push(new Vinyl({
        // if you don't want to use the first file for the base directory, you can use gulp-rename to change it
        cwd: firstFile.cwd,
        base: firstFile.base,
        path: path.join(firstFile.base, out),
        contents: Buffer.from(extractor.toString())
      }));
    }

    cb();
  });
};
