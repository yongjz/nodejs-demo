const path = require('path');

console.log(path.basename('/foo/bar/baz/asdf/index.html'));
// returns 'quux.html'

console.log(path.basename('/foo/bar/baz/asdf/index.html', '.html'));
// returns 'quux'

console.log(path.sep);
'foo/bar/baz'.split(path.sep);
// returns ['foo', 'bar', 'baz']

console.log(process.env.PATH);
// '/usr/bin:/bin:/usr/sbin:/sbin:/usr/local/bin'

console.log(path.delimiter);
console.log(process.env.PATH.split(path.delimiter));
// returns ['/usr/bin', '/bin', '/usr/sbin', '/sbin', '/usr/local/bin']

path.extname('index.html')
	// returns '.html'

console.log(path.format({
	root: "/",
	dir: "/home/user/dir",
	base: "file.txt",
	ext: ".txt",
	name: "file"
}));
// returns '/home/user/dir/file.txt'
console.log(path.parse('/home/user/dir/file.txt'));

//taking care of '..' and '.' parts.
console.log(path.join('/foo', 'bar', 'baz/asdf', '..', 'quux', '.'));
// returns '/foo/bar/baz/quux'

console.log(path.normalize('/foo/bar//baz/asdf/quux/..'));
// returns '/foo/bar/baz/asdf'