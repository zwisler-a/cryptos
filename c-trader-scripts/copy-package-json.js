'use strict';

const fs = require('fs');

const rawdata = fs.readFileSync('./c-trader-server/package.json');
const packageJson = JSON.parse(rawdata);
delete packageJson.scripts;
delete packageJson.jest;
packageJson.scripts = {
  start: 'node main.js',
};
fs.writeFileSync('./build/package.json', JSON.stringify(packageJson, null, 2));
