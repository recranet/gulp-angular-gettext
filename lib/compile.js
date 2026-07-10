'use strict';

const path = require('node:path');
const { Transform } = require('node:stream');
const { Compiler } = require('@recranet/angular-gettext-tools');
const PluginError = require('./plugin-error');

const pluginName = require('../package.json').name;

module.exports = function (options) {
  options = options || {};

  return new Transform({
    objectMode: true,
    transform(file, enc, cb) {
      if (file.isNull()) {
        return cb(null, file);
      }

      if (file.isStream()) {
        return cb(new PluginError(pluginName, 'Streaming not supported'));
      }

      const compiler = new Compiler(options);
      const contents = compiler.convertPo([file.contents.toString()]);
      file.contents = Buffer.from(contents);

      const dirname = path.dirname(file.path);
      const basename = path.basename(file.path, '.po');
      const extension = options.format === 'json' ? '.json' : '.js';
      file.path = path.join(dirname, basename + extension);

      cb(null, file);
    }
  });
};
