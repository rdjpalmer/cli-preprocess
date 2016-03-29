#!/usr/bin/env node
var fs = require('fs');
var program = require('commander');
var preprocessor = require('preprocess');
var find = require('find');
var mkdirp = require('mkdirp');

function filterBlacklisted(file) {
  return file.indexOf('node_modules') < 0;
}

function filterIgnorePath(file) {
  if (!program.ignore) return true;
  return file.indexOf(program.ignore) < 0;
}

function getFileFromPath(fileWithPath) {
  const pathArr = fileWithPath.split('/');
  return pathArr[pathArr.length - 1];
}

function getFileName(fileNameWithExtension) {
  const fileNameArr = fileNameWithExtension.split('.');
  fileNameArr.splice(fileNameArr.length - 1, 1);
  return fileNameArr.join('.');
}

function getFileExtension(fileNameWithExtension) {
  const fileNameArr = fileNameWithExtension.split('.');
  return fileNameArr[fileNameArr.length - 1];
}

function processFile(file) {
  const fileWithExtension = getFileFromPath(file);
  const fileName = getFileName(fileWithExtension);
  const extension = getFileExtension(fileWithExtension);

  const outputFileLocation = `${program.output}${fileName}.${extension}`;

  mkdirp(program.output, err => {
    if (err) {
      console.error(err);
      throw err;
    } else {
      preprocessor.preprocessFile(file, outputFileLocation, process.env, err => {
        if (err) {
          console.error(err);
          throw err;
        }
      });
    }
  });  
}

program
  .arguments('<input path>')
  .option('-i, --ignore <ignore path>', 'The folders/files to ignore')
  .option('-o, --output <output folder>', 'The folder to output the processed to')
  .option('-e, --extension <file extension>', 'The syntax type of source string to preprocess: html, xml, js, javascript, jsx, c, cc, cpp, cs, csharp, java, less, sass, scss, css, php, ts, tsx, peg, pegjs, jade, styl, coffee, bash, shell, sh')
  .action((path) => {
    const regexPattern = program.extension ? `^(.*)${program.extension}$` : '^(.*).htm(l?)$';
    const regex = new RegExp(regexPattern);

    find.file(regex, path, (files) => {
      files
        .filter(filterBlacklisted)
        .filter(filterIgnorePath)
        .forEach(processFile);
    });
  })
  .parse(process.argv);