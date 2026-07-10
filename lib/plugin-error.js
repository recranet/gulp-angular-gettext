'use strict';

// Minimal replacement for the plugin-error package: gulp only needs an
// Error with a `plugin` property to report plugin failures.
class PluginError extends Error {
  constructor(plugin, message) {
    super(message);
    this.name = 'PluginError';
    this.plugin = plugin;
  }
}

module.exports = PluginError;
