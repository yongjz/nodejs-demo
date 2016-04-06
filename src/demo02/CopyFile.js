var fs = require('fs');

//异步方式，打印文件内容到控制台
function print(src) {
  //If no encoding is specified, then the raw buffer is returned.
  fs.readFile(src, 'utf8', function(err, data) {
    if (err) throw err;
    console.log(data);
  });
}

//同步方式
function printSync(src) {
  try {
    var data = fs.readFileSync(src);
    console.log(data);
  } catch (err) {
    // Deal with error.
    console.log(err);
  }
}

//文件拷贝
function copy(from, to) {
  fs.createReadStream(from).pipe(fs.createWriteStream(to));
}

function main(argv) {
  print(argv[0]);
  printSync(argv[0]);
  copy(argv[0], argv[1]);
}

//An array containing the command line arguments.
//The first element will be 'node',
//the second element will be the name of the JavaScript file.
//The next elements will be any additional command line arguments.
main(process.argv.slice(2));