#!/usr/bin/env node
 let fs = require('fs');
 function count(path) {
    return fs.readdirSync(path).length;
 }
 
 console.log(process.argv)
 let pathname = process.argv.slice(2)[0];
 console.log(pathname+'目录下有'+count(pathname)+'个文件及文件夹');
