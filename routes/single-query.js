var express = require('express');
var router = express.Router();

const path = require('path');
const fs = require('fs');

var env = require('./env.js');
var LOG_DIR = env.LOG_DIR

/* GET single query page. */
router.get('/', function(req, res, next) {
  var INSTANCE_ID = req.query.instance_id;
  var QUERY_ID = req.query.query_id;
  var ROUND = req.query.round;
  if (INSTANCE_ID == undefined || QUERY_ID == undefined) {
    console.log("Error, No Query Id Or No Instance Id.");
    res.render('error');
  } else {
    var _query_dir = LOG_DIR + "/" + INSTANCE_ID;
    ReadQueryDir(path.join(_query_dir), QUERY_ID, ROUND);
    res.render('grape-single-query', {
      _rounds: ROUND,
      _step_eval_time: _step_eval_time,
      _step_comm_time: _step_comm_time,
      _step_msg_count: _step_msg_count,
      _step_msg_bytes: _step_msg_bytes,
      _step_whole_time: _step_whole_time
    });
  }
});
var _worker_num = 0;

var _step_whole_time = [],
  _step_eval_time = [],
  _step_comm_time = [],
  _step_msg_count = [],
  _step_msg_bytes = [];

function ReadQueryDir(query_dir, _query_id, round) {
  _worker_num = 0;
  _step_eval_time = [],
    _step_comm_time = [],
    _step_msg_count = [],
    _step_msg_bytes = [],
    _step_whole_time = [];

  if (_query_id == "invalid") {
    //TODO @lidongze
  } else {
    var FileList = fs.readdirSync(query_dir);
    if (FileList == "") {
      return;
    }
    for (var ele of FileList) {
      if (ele == "grape.INFO") {
        _query_file = query_dir + "/" + ele;
        var data = fs.readFileSync(query_dir + "/" + ele, 'utf-8');
        ParseFile(data, _query_id, round);

        for (var _i = 0; _i < round; _i++) {
          _step_whole_time[_i] = _step_eval_time[_i] * 1 + _step_comm_time[_i] * 1;
        }
      }
    }
  }
}

function ParseFile(data, _query_id, round) {
  var str = data.substring(data.indexOf(_query_id));
  for (var _i = 0; _i < round; _i++) {
    if (_i + 1 < round) {
      var _j = _i + 1;
      var _step_begin = "superstep " + _i;
      var _step_end = "superstep " + _j;
      var step_str = str.substring(str.indexOf(_step_begin), str.indexOf(_step_end));
    } else {
      var _step_begin = "superstep " + _i;
      var _step_end = "Get a gql";
      var step_str = str.substring(str.indexOf(_step_begin), str.indexOf(_step_end));
      console.log(step_str);
    }

    /* eval time */
    var eval_str = step_str.substring(step_str.indexOf("eval-time"), step_str.indexOf("comm-time"));
    eval_str = eval_str.substring(eval_str.indexOf("\n") + 1);
    var reg = eval("/" + "worker" + "/ig"); // match worker number
    _worker_num = eval_str.match(reg).length;
    _step_eval_time.push(ParseData(eval_str, _worker_num).toFixed(6));

    /* comm time */
    var comm_str = step_str.substring(step_str.indexOf("comm-time"), step_str.indexOf("message-count"));
    comm_str = comm_str.substring(comm_str.indexOf("\n") + 1);
    _step_comm_time.push(ParseData(comm_str, _worker_num).toFixed(6));

    /* message-count */
    var msg_count_str = step_str.substring(step_str.indexOf("message-count"), step_str.indexOf("message-bytes"));
    msg_count_str = msg_count_str.substring(msg_count_str.indexOf("\n") + 1);
    _step_msg_count.push(ParseData(msg_count_str, _worker_num));

    /* message-bytes */
    var msg_bytes_str = step_str.substring(step_str.indexOf("message-bytes"));
    msg_bytes_str = msg_bytes_str.substring(msg_bytes_str.indexOf("\n") + 1);
    _step_msg_bytes.push(ParseData(msg_bytes_str, _worker_num));
  }

}

function ParseData(str, _worker_num) {
  var _sum_data = 0;

  for (var _i = 1; _i <= _worker_num; _i++) {
    var data = str.substring(str.indexOf("\t") + 1, str.indexOf("\n"));
    _sum_data = _sum_data * 1 + data * 1;
    str = str.substring(str.indexOf("\n") + 1);
  }
  return _sum_data;
}

module.exports = router;