//The Buffer class is a global within Node.js,
//making it unlikely that one would need to ever use require('buffer').


//The Buffer class was introduced as part of the Node.js API
//to make it possible to interact with octet streams
//in the context of things like TCP streams and file system operations.

//buffer可以操作二进制数

//new Buffer(array)
const buf1 = new Buffer([0x62,0x75,0x66,0x66,0x65,0x72]);
const str = buf1.toString('utf-8');
console.log(buf1);
console.log(str);

//new Buffer(str[, encoding])
const buf2 = new Buffer('buffer');
console.log(buf2);
const buf22 = new Buffer('7468697320697320612074c3a97374', 'hex');
console.log(buf22.toString());

//new Buffer(size)
const buf3 = new Buffer(5);
buf3.fill(0);
console.log(buf3);