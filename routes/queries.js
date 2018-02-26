var express = require('express');
var router = express.Router();

const path = require('path');
const fs = require('fs');

var env = require('./env.js');
var LOG_DIR = env.LOG_DIR

/* GET pulg. */
router.get('/', function(req, res, next) {
  var INSTANCE_ID = req.query.instanceID;
  if (INSTANCE_ID == undefined) {
    console.log("Error, No Query Id .");
    res.render('error');
  } else {
    var _query_dir = LOG_DIR + "/" + INSTANCE_ID;
    ReadQueryDir(path.join(_query_dir));
    res.render('grape-queries', {
      _query_number: _query_number,
      _query_id: _query_id,
      _dataset: _dataset,
      _algo: _algo,
      _up_time: _up_time,
      _query_info: _query_info,
      _whole_time: _whole_time,
      _eval_time: _eval_time,
      _comm_time: _comm_time,
      _rounds: _rounds,
      _msg_bytes: _msg_bytes,
      _msg_count: _msg_count,
      _instanceID: INSTANCE_ID
    });
  }
});

var _query_number = 0;
var _query_file;

var _gql_list = [],
  _query_id = [],
  _dataset = [],
  _algo = [],
  _up_time = [],
  _query_info = [],
  _whole_time = [],
  _eval_time = [],
  _comm_time = [],
  _rounds = [],
  _msg_count = [],
  _msg_bytes = [];

function ReadQueryDir(query_dir) {
  /* clear */
  _query_number = 0;
  _gql_list = [],
    _query_id = [],
    _dataset = [],
    _algo = [],
    _up_time = [],
    _query_info = [],
    _whole_time = [],
    _eval_time = [],
    _comm_time = [],
    _rounds = [],
    _msg_count = [],
    _msg_bytes = [];
  var FileList = fs.readdirSync(query_dir);
  if (FileList == "") {
    return;
  }
  for (var ele of FileList) {
    if (ele == "grape.INFO") {
      _query_file = query_dir + "/" + ele;
      var str = fs.readFileSync(query_dir + "/" + ele, 'utf-8');
      ParseFile(str);
    }
  }
}

function ParseFile(str) {
  /* Get gql */
  _gql_list = [];
  GetGqlList(str);
  ParseGqlList();
}

function trim(str) {
  return str.replace(/\r|\n/ig, "");
}

function GetGqlList(str) {
  if (str.search("Get a gql") != -1) {
    var _new_gql = str.substring(str.indexOf('Get a gql'));
    if (trim(_new_gql.substring(11)) == "exit") {
      _gql_list.push(trim(_new_gql.substring(11)));
      return;
    } else {
      var _sub_new_gql = _new_gql.substring(0, _new_gql.indexOf("\n"));
      _new_gql = _new_gql.substring(_new_gql.indexOf("\n") + 1);
      if (_sub_new_gql.search("query") != -1) {
        var _next_line = _new_gql.substring(0, _new_gql.indexOf("\n"));
        if (_next_line.search("Job_") != -1) {
          var _job_id = _next_line.substring(_next_line.indexOf("Job_"));
          _gql_list.push(trim(_sub_new_gql) + " || " + _job_id);
        } else if (_next_line.search("invalid") != -1) {
          _gql_list.push(trim(_sub_new_gql) + " || " + "invalid");
        }
      } else {
        _gql_list.push(trim(_sub_new_gql));
      }
      GetGqlList(_new_gql);
    }
  }
}

function ParseGqlList() {
  var _tmp_dataset;
  var _app_dataset_map = new Map();

  for (var iter of _gql_list) {
    /* loadgraph */
    if (iter.search("loadgraph") != -1 && iter.search("unloadgraph") == -1) {
      var _ds = iter.substring(11, iter.indexOf("=") - 1);
      _tmp_dataset = _ds;
    }
    /* loadapp */
    if (iter.search("loadapp") != -1 && iter.search("unloadapp") == -1) {
      var _app = iter.substring(11, iter.indexOf("=") - 1);
      _app_dataset_map.set(_app, _tmp_dataset);
    }
    /* config */
    if (iter.search("config") != -1) {
      //TODO @lidongze nothing
    }
    /* query */
    if (iter.search("query") != -1) {
      _query_number++;
      var _tmp_app = iter.substring(11, iter.lastIndexOf(".query"));
      var _tmp_query_info = iter.substring(iter.lastIndexOf("(") + 1, iter.lastIndexOf(")"));
      var _map_dataset = _app_dataset_map.get(_tmp_app);
      var _flag = iter.substring(iter.indexOf("||") + 3);
      Create_Query(_tmp_app, _tmp_query_info, _map_dataset, _flag);
    }
    /* unloadgraph */
    if (iter.search("unloadgraph") != -1) {
      _tmp_dataset = undefined;
    }
    /* unloadapp */
    if (iter.search("unloadapp") != -1) {
      var _tmp_app = iter.substring(iter.indexOf("(") + 1, iter.indexOf(")"));
      _app_dataset_map.delete(_tmp_app);
    }
    /* exit */
    if (iter.search("exit") != -1) {
      return;
    }
  }
}

function Create_Query(app, query, dataset, flag) {
  /* gql example : Get a gql: sssp.query(4) */
  _query_id[_query_number] = flag;
  if (_query_file == undefined) {
    console.log("Error! queru_file not found");
    return;
  }
  if (flag == "invalid") {
    _dataset[_query_number] = dataset;
    _algo[_query_number] = app;
    _query_info[_query_number] = query;
    _up_time[_query_number] =
      _whole_time[_query_number] =
      _eval_time[_query_number] =
      _comm_time[_query_number] =
      _rounds[_query_number] =
      _msg_count[_query_number] =
      _msg_bytes[_query_number] = null;
  } else {
    var data = fs.readFileSync(_query_file, 'utf-8');
    var str = data.substring(data.indexOf(flag));
    /* dataset */
    _dataset[_query_number] = dataset;
    /* algorithm */
    _algo[_query_number] = app;
    /* uptime */
    var temp = str.substring(str.indexOf("grape_uptime"), str.indexOf("load_graph_time"));
    temp = trim(temp);
    _up_time[_query_number] = temp.substring(14, temp.indexOf("I"));
    /* query info */
    _query_info[_query_number] = query;
    /* whole time */
    temp = str.substring(str.indexOf("whole-query-time"), str.indexOf("part-eval-time"));
    temp = trim(temp);
    _whole_time[_query_number] = temp.substring(18, temp.indexOf("I"));
    /* eval time */
    temp = str.substring(str.indexOf("part-eval-time"), str.indexOf("part-comm-time"));
    temp = trim(temp);
    _eval_time[_query_number] = temp.substring(16, temp.indexOf("I"));
    /* comm time */
    temp = str.substring(str.indexOf("part-comm-time"), str.indexOf("msg-count"));
    temp = trim(temp);
    _comm_time[_query_number] = temp.substring(16, temp.indexOf("I"));
    /* msg count */
    temp = str.substring(str.indexOf("msg-count"), str.indexOf("msg-bytes"));
    temp = trim(temp);
    _msg_count[_query_number] = temp.substring(11, temp.indexOf("I"));
    /* msg bytes */
    temp = str.substring(str.indexOf("msg-bytes"), str.indexOf("rounds"));
    temp = trim(temp);
    _msg_bytes[_query_number] = temp.substring(11, temp.indexOf("I"));
    /* rounds */
    temp = str.substring(str.indexOf("rounds"), str.indexOf("==="));
    temp = trim(temp);
    _rounds[_query_number] = temp.substring(8, temp.indexOf("I"));
  }
}
module.exports = router;