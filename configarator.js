/**
 * Author: JOsH Lindsay
 * email: joshdlindsay@gmail.com
 * twitter: @jlindsay
 */

var path          = require('path');
var fs            = require('fs');
var inquirer      = require("inquirer");

var _isInit;
var _fileName     =  "crazy-config.js";

var questions = [{
      type: 'input',
      name: 'database',
      message: 'What is your database name?',
      default: 'crazyreds'
    },
    {
      type: 'input',
      name: 'password',
      message: 'What is your database password?'
    },
]

function answer( answers ) {
    console.log("answers:",answers);
    write(_fileName, ["var _database=" + answers.database ,"var _password=" + answers.password ])
}

function write(fileName, lines) {
    console.log(lines);
    fs.open(_fileName.toString(), 'a', 0666, function(err, fd){
        if (err) throw err;
        var file = fs.createWriteStream(fd);
            file.on('error', function(err) { /* error handling */ });
            lines.forEach(function(v) { file.write(v.join(', ') + '\n'); });
            file.end();
    });
}

console.log("configurator()")

try {
    _isInit = fs.lstatSync('./crazy-config.js');
}
catch (e) {
    inquirer.prompt( questions, answer );
}
