'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const Vinyl = require('vinyl');
const PO = require('pofile');

const compile = require('../').compile;
const extract = require('../').extract;

const fixturesDir = path.join(__dirname, 'fixtures');
const anotherDir = path.join(__dirname, 'another');

const createFixtureFile = function (filename, content) {
  return new Vinyl({
    cwd: __dirname,
    base: fixturesDir,
    path: path.join(fixturesDir, filename),
    contents: Buffer.from(content)
  });
};

describe('gulp-angular-gettext', function () {
  describe('extract()', function () {

    it('should work with no arguments', function (t, done) {
      const partial = createFixtureFile('partial.html', '<div translate>Hello</div><div translate>Goodbye</div>');

      const stream = extract();
      stream.on('error', done);
      stream.on('data', function (file) {
        assert.strictEqual(file.path, path.join(fixturesDir, 'partial.pot'));

        PO.load(path.join(fixturesDir, 'test.pot'), function (err, expected) {
          if (err) {
            done(err);
            return;
          }
          const actual = PO.parse(file.contents.toString());

          // clear file references that depend on absolute paths
          actual.items.forEach(function (i) {
            i.references = [];
          });
          expected.items.forEach(function (i) {
            i.references = [];
          });

          assert.deepStrictEqual(actual.items, expected.items);

          done();
        });
      });

      stream.write(partial);
      stream.end();
    });

    it('should work with just a string argument', function (t, done) {
      const partial = createFixtureFile('partial.html', '<div translate>Hello</div><div translate>Goodbye</div>');

      const stream = extract('foo.bar');
      stream.on('error', done);
      stream.on('data', function (file) {
        assert.strictEqual(file.path, path.join(fixturesDir, 'foo.bar'));

        PO.load(path.join(fixturesDir, 'test.pot'), function (err, expected) {
          if (err) {
            done(err);
            return;
          }
          const actual = PO.parse(file.contents.toString());

          // clear file references that depend on absolute paths
          actual.items.forEach(function (i) {
            i.references = [];
          });
          expected.items.forEach(function (i) {
            i.references = [];
          });

          assert.deepStrictEqual(actual.items, expected.items);

          done();
        });
      });

      stream.write(partial);
      stream.end();
    });

    it('should work with just an object argument', function (t, done) {
      const partial = createFixtureFile('partial.html', '<div translate>Hello</div><div translate>Goodbye</div>');

      const stream = extract();
      stream.on('error', done);
      stream.on('data', function (file) {
        assert.strictEqual(file.path, path.join(fixturesDir, 'partial.pot'));

        PO.load(path.join(fixturesDir, 'test.pot'), function (err, expected) {
          if (err) {
            done(err);
            return;
          }
          const actual = PO.parse(file.contents.toString());
          assert.deepStrictEqual(actual, expected);

          done();
        });
      });

      stream.write(partial);
      stream.end();
    });

    it('should output multiple POTs if no output file', function (t, done) {
      const partial1 = createFixtureFile('partial1.html', '<div translate>Hello</div>');
      const partial2 = createFixtureFile('partial2.html', '<div translate>world</div>');

      PO.load(path.join(fixturesDir, 'partial1.pot'), function (err, expected1) {
        if (err) {
          done(err);
          return;
        }

        PO.load(path.join(fixturesDir, 'partial2.pot'), function (err, expected2) {
          if (err) {
            done(err);
            return;
          }

          const stream = extract();
          stream.on('error', done);

          let callCount = 0;
          stream.on('data', function (file) {
            callCount++;
            assert.ok(callCount >= 1 && callCount <= 2);

            if (callCount === 1) {
              assert.strictEqual(file.path, path.join(fixturesDir, 'partial1.pot'));
              assert.deepStrictEqual(PO.parse(file.contents.toString()), expected1);
              return;
            }

            assert.strictEqual(file.path, path.join(fixturesDir, 'partial2.pot'));
            assert.deepStrictEqual(PO.parse(file.contents.toString()), expected2);

            done();
          });

          stream.write(partial1);
          stream.write(partial2);
          stream.end();
        });
      });
    });

    it('should work with a single input file', function (t, done) {
      const partial = createFixtureFile('partial.html', '<div translate>Hello</div><div translate>Goodbye</div>');

      const stream = extract();
      stream.on('error', done);
      stream.on('data', function (file) {
        assert.strictEqual(file.isNull(), false);

        fs.readFile(path.join(fixturesDir, 'test.pot'), {encoding: 'utf8'}, function (err, pot) {
          if (err) {
            done(err);
            return;
          }

          assert.strictEqual(file.contents.toString(), pot);

          done();
        });
      });
      stream.write(partial);
      stream.end();
    });

    it('should work with multiple input files', function (t, done) {
      const partial1 = createFixtureFile('partial1.html', '<div translate>Hello</div>');
      const partial2 = createFixtureFile('partial2.html', '<div translate>world</div>');

      const stream = extract('out.pot');
      stream.on('error', done);
      stream.on('data', function (file) {
        assert.strictEqual(file.isNull(), false);

        fs.readFile(path.join(fixturesDir, 'multiple.pot'), {encoding: 'utf8'}, function (err, pot) {
          if (err) {
            done(err);
            return;
          }

          assert.strictEqual(file.contents.toString(), pot);

          done();
        });
      });
      stream.write(partial1);
      stream.write(partial2);
      stream.end();
    });

    it('should work with no input files', function (t, done) {
      const files = [];
      const stream = extract('out.pot');
      stream.on('error', done);
      stream.on('data', function (file) {
        files.push(file);
      });
      stream.on('end', function () {
        assert.strictEqual(files.length, 0);
        done();
      });
      stream.end();
    });

    it('should support relative paths properly', function (t, done) {
      const partial1 = new Vinyl({
        cwd: __dirname,
        base: anotherDir,
        path: path.join(fixturesDir, 'partial1.html'),
        contents: Buffer.from('<div translate>Hello</div>')
      });
      const partial2 = new Vinyl({
        cwd: __dirname,
        base: anotherDir,
        path: path.join(fixturesDir, 'partial2.html'),
        contents: Buffer.from('<div translate>world</div>')
      });

      const stream = extract('out.pot');
      stream.on('error', done);
      stream.on('data', function (file) {
        assert.strictEqual(file.isNull(), false);

        fs.readFile(path.join(fixturesDir, 'relative.pot'), {encoding: 'utf8'}, function (err, pot) {
          if (err) {
            done(err);
            return;
          }

          assert.strictEqual(file.contents.toString(), pot);

          done();
        });
      });
      stream.write(partial1);
      stream.write(partial2);
      stream.end();
    });

    it('should merge duplicate strings with references', function (t, done) {
      const partial1 = createFixtureFile('partial1.html', '<div translate>Hello</div><div translate>Hello</div>');
      const partial2 = createFixtureFile('partial2.html', '<div translate>Hello</div><div translate>world</div>');

      const stream = extract('out.pot');
      stream.on('error', done);
      stream.on('data', function (file) {
        fs.readFile(path.join(fixturesDir, 'merge-duplicates.pot'), {encoding: 'utf8'}, function (err, pot) {
          if (err) {
            done(err);
            return;
          }

          assert.strictEqual(file.contents.toString(), pot);

          done();
        });
      });
      stream.write(partial1);
      stream.write(partial2);
      stream.end();
    });

    it('should extract plural strings', function (t, done) {
      const partial1 = createFixtureFile('partial1.html', '<div translate translate-n="count" translate-plural="Birds">Bird</div>');

      const stream = extract('out.pot');
      stream.on('error', done);
      stream.on('data', function (file) {
        fs.readFile(path.join(fixturesDir, 'plural.pot'), {encoding: 'utf8'}, function (err, pot) {
          if (err) {
            done(err);
            return;
          }

          assert.strictEqual(file.contents.toString(), pot);

          done();
        });
      });
      stream.write(partial1);
      stream.end();
    });

    it('should merge singular and plural strings', function (t, done) {
      const partial1 = createFixtureFile('partial1.html',
        '<div translate translate-n="count" translate-plural="Birds">Bird</div><div translate>Bird</div>');

      const stream = extract('out.pot');
      stream.on('error', done);
      stream.on('data', function (file) {
        fs.readFile(path.join(fixturesDir, 'plural.pot'), {encoding: 'utf8'}, function (err, pot) {
          if (err) {
            done(err);
            return;
          }

          assert.strictEqual(file.contents.toString(), pot);

          done();
        });
      });
      stream.write(partial1);
      stream.end();
    });
  });

  describe('compile()', function () {
    it('should match es.po', function (t, done) {
      fs.readFile(path.join(fixturesDir, 'es.po'), function (err, esPo) {
        if (err) {
          done(err);
          return;
        }
        const stream = compile({
          format: 'json'
        });
        stream.on('error', done);
        stream.on('data', function (file) {
          assert.strictEqual(file.isNull(), false);
          assert.strictEqual(path.extname(file.path), '.json');
          assert.strictEqual(file.contents.toString(), JSON.stringify({
            es: {
              'Hello world': '¡Hola, mundo',
              Goodbye: 'Adios'
            }
          }));

          done();
        });
        stream.write(createFixtureFile('es.po', esPo));
        stream.end();
      });
    });

    // I prefer JSON, but JS is angular-gettext-tool's default
    it('should default to javascript', function (t, done) {
      fs.readFile(path.join(fixturesDir, 'es.po'), function (err, esPo) {
        if (err) {
          done(err);
          return;
        }
        const stream = compile();
        stream.on('error', done);
        stream.on('data', function (file) {
          assert.strictEqual(path.extname(file.path), '.js');

          done();
        });
        stream.write(createFixtureFile('es.po', esPo));
        stream.end();
      });
    });
  });
});
