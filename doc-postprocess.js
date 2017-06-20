'use strict';

// typedoc is kinda stupid and inserts local paths when it encounters a package,
// this replaces the paths and redacts local files.


const { sync } = require('glob');
const { readFileSync, writeFileSync } = require('fs');

function escapeRegExp(str) {
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
}

const pwd = process.cwd();
const regExp = new RegExp(`Defined in ${escapeRegExp(pwd)}.+node_modules/(.+)`, 'gi');
sync('docs/**/*.html')
.forEach(path => {
    const contents = readFileSync(path, 'utf8');
    writeFileSync(path, contents.replace(regExp, 'Defined in external package $1'));
});
