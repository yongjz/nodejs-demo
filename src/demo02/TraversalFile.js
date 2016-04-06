const fs = require('fs');
const path = require('path');

function travel(dir, callback) {
  fs.readdirSync(dir).forEach(function(file) {
    var pathname = path.join(dir, file);
    if (fs.statSync(pathname).isDirectory()) {
      travel(pathname, callback);
    } else {
      callback(pathname);
    }
  });
}

function main(argv) {
  travel(argv[0], function(pathname) {
    console.log(pathname);
  });
}

main(process.argv.slice(2));
//命令行输入: node TraversalFile.js /path/to