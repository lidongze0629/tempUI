var express = require('express');
var router = express.Router();

const path = require('path');
const fs = require('fs');

var env = require('./env.js');
var log_dir = path.join(env.LOG_DIR);

/* GET Grape Instance. */
router.get('/', function(req, res, next) {
  res.render('grape-instance', {
    title: 'grape-instance',
    _dir_number: _dir_number,
    _instance_number: _instance_number,
    _batch_file: _batch_file,
    _total_time: _total_time,
    _interactive_mode: _interactive_mode,
    _current_process: _current_process,
    _current_status: _interactive_mode,
    _instanceID: _instanceID,
    _creat_time: _creat_time
  });
});

/* Read Log Dir */
var _dir_number = 0,
  _instance_number = 0,
  _total_time,
  _current_process,
  _current_status;

var _instanceID = [],
  _creat_time = [],
  _batch_file = [],
  _interactive_mode = [];

function ReadLogDir(log_dir) {
  var FileList = fs.readdirSync(log_dir);
  if (FileList == "") {
    return;
  }
  for (var ele of FileList) {
    var info = fs.statSync(path.join(log_dir + "/" + ele));
    if (info.isDirectory()) {
      _dir_number++;
      //TODO @lidongze filename != grape.INFO
      _instanceID[_dir_number] = ele;
      ReadLogDir(log_dir + "/" + ele);
    } else if (info.isFile()) {
      if (ele == "grape.INFO") {
        var str = fs.readFileSync(log_dir + "/" + ele, 'utf-8');
        _instance_number++;
        ParseFile(str);
      }
    } else {
      console.log("unSupport file stat");
    }
  }
}

function ParseFile(str) {
  /* created time */
  var temp = str.substring(str.indexOf('created at'), str.indexOf('Running on machine'));
  temp = trim(temp);
  _creat_time[_instance_number] = temp.substring(12);
  // console.log(_creat_time[_instance_number]);

  /* submit batch file */
  temp = str.substring(str.indexOf('to open'), str.indexOf('Get a gql'));
  temp = trim(temp);
  _batch_file[_instance_number] = temp.substring(9, temp.indexOf('I'));
  //console.log(_batch_file[_instance_number]);

  /* total time */
  _total_time = "3.87562s";

  /* _interactive_mode  [cli] [nointeractive]*/
  _interactive_mode[_instance_number] = "nointeractive";

  /* Process */
  _current_process = 0.6;

  /* Status [Running:1] [Stop:0]*/
  _current_process = 1;
}

function trim(str) {
  return str.replace(/\r|\n/ig, "");
}

function Interval_ReadLogDir(log_dir) {
  return function() {
    _dir_number = _instance_number = 0;
    ReadLogDir(log_dir);
  }
}

setInterval(Interval_ReadLogDir(log_dir), 3000);

module.exports = router;