# @recranet/gulp-angular-gettext

> Extract and compile translatable strings using [angular-gettext](http://angular-gettext.rocketeer.be)

Modernized fork of [`gulp-angular-gettext`](https://github.com/gabegorelick/gulp-angular-gettext), built on [`@recranet/angular-gettext-tools`](https://github.com/recranet/angular-gettext-tools). The public API is unchanged.

## Requirements

* Node.js 22 or newer.

The gulp plumbing uses the packages recommended by the gulp plugin guidelines: `through2`, `plugin-error` and `vinyl`.

## Install

```sh
npm install --save-dev github:recranet/gulp-angular-gettext
```

## Example

```js
var gulp = require('gulp');
var gettext = require('@recranet/gulp-angular-gettext');

gulp.task('pot', function () {
    return gulp.src(['src/partials/**/*.html', 'src/scripts/**/*.js'])
        .pipe(gettext.extract('template.pot', {
            // options to pass to angular-gettext-tools...
        }))
        .pipe(gulp.dest('po/'));
});

gulp.task('translations', function () {
	return gulp.src('po/**/*.po')
		.pipe(gettext.compile({
		    // options to pass to angular-gettext-tools...
		    format: 'json'
        }))
		.pipe(gulp.dest('dist/translations/'));
});
```

## API

### `.extract([out], [options])`
* `out` - an optional String representing the name of the POT file to output. If this option is given, a single POT file
  will be generated for the entire set of input files. If this option is omitted, one POT file will be generated
  __per__ input file.
* `options` - an optional object to pass to [angular-gettext-tools](https://github.com/rubenv/angular-gettext-tools)
  `Extractor`

### `.compile([options])`
* `options` - an optional object to pass to [angular-gettext-tools](https://github.com/rubenv/angular-gettext-tools)
  `Compiler`
