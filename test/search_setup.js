var ES = require('../lib/index');
var fs = require('fs');
var chalk = require('chalk');
var fixtures = __dirname + '/fixtures'; // should be esta/test/fixtures
var test = require('tape');
// start timer
var start = new Date().getTime();
var count = 0;
var filecount = 0

function processFile(filename, callback) {
  fs.readFile(filename, function(err, data) {
    if(err){
      return console.log('Error obtaining data.', err);
    }
    var str = data.toString();
    try {
      JSON.parse(str);
    } catch (e) {
      console.log("ERROR: "+e)
      console.log("BAD FILE >>>>> "+filename);
      return false;
    }
    var record = JSON.parse(str);
    for(var key in record) { // delete emtpy proprties
      if(record.hasOwnProperty(key) && record[key] === null) {
        delete record[key];
      }
    }
    if(!record.text) {
      console.log(" >>>>> "+filename);
    }
    ES.CREATE(record, function(res) {
      count++;
      if(filecount === count+1){
        var end  = new Date().getTime();
        var elapsed = (end-start)/1000;
        var writerate = Math.round((filecount / elapsed), -1);
        var log = chalk.white.bgGreen.bold(' WRITE PERFORMANCE >>>> ') + chalk.cyan(' ' + filecount) + chalk.green(' Records Inserted in ');
        log = log + chalk.cyan(elapsed) + chalk.green(' seconds ') + chalk.yellow(' ~ ');
        log = log + chalk.cyan(writerate) + chalk.green(' records per second');
        console.log(log);
        return callback();
      }
    });
  });
}

function loadFixtures(callback){
  fs.readdir(fixtures, function(err, files) {
    filecount = files.length;
    // console.log(' >> '+filecount);
    for(var i in files) {
      var file = fixtures +'/' +files[i];
      processFile(file, callback);
    }
  });
}

module.exports = loadFixtures;

// console.log(' - - - - LOADING DATA - - - - -');
// loadFixtures(function() {
//     console.log('done loading');
// });

process.on('uncaughtException', function(err) {
  console.log('FAILED TO LOAD FIXTURE DATA ... ' + err);
  console.log('Tip: Remember to start the Vagrant VM and Elasticsearch DB!')
});
