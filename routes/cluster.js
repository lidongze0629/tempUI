var express = require('express');
var xmlreader = require('xmlreader');
var router = express.Router();

const path = require('path');
const fs = require('fs');

var env = require('./env.js');
var ClusterInfoDir = env.CLUSTER_INFO_DIR;

/* GET Cluster Info. */
router.get('/', function(req, res, next) {
  res.render('grape-cluster');
});

var _cluster_num = 0;

var _disk = [],
  _cpu = [],
  _mem = [],
  _bytes_in = [],
  _bytes_out = [];

function ReadClusterDir(cluster_dir) {
  _cluster_num = 0;
  _disk = [], _cpu = [], _mem = [], _bytes_in = [], _bytes_out = [];

  var FileList = fs.readdirSync(cluster_dir);
  if (FileList == "") {
    console.log("No Cluster Info! ");
    return;
  }
  for (var ele of FileList) {
    var info = fs.statSync(path.join(cluster_dir + "/" + ele));
    if (info.isFile()) {
      if (ele == "cluster") {
        var str = fs.readFileSync(cluster_dir + "/" + ele, 'utf-8');
        ParseFile(RemoveNotXml(str));
      }
    }
  }
}

function RemoveNotXml(str) {
  return str.substring(str.indexOf('<?xml'));
}

function ParseFile(str) {
  xmlreader.read(str, function(err, res) {
    if (err) return console.log(err);

    for (var _host_num = 0; _host_num < res.GANGLIA_XML.GRID.CLUSTER.HOST.count() - 1; _host_num++) {
      var _temp_disk_free = _temp_disk_total =
        _temp_cpu =
        _temp_bytes_out = _temp_bytes_in =
        _temp_mem_free = _temp_mem_total = 0;
      for (var _metric_num = 0; _metric_num < res.GANGLIA_XML.GRID.CLUSTER.HOST.at(_host_num).METRIC.count(); _metric_num++) {
        /* disk */
        if (res.GANGLIA_XML.GRID.CLUSTER.HOST.at(_host_num).METRIC.at(_metric_num).attributes().NAME == "disk_free") {
          _temp_disk_free = res.GANGLIA_XML.GRID.CLUSTER.HOST.at(_host_num).METRIC.at(_metric_num).attributes().VAL;
        }
        if (res.GANGLIA_XML.GRID.CLUSTER.HOST.at(_host_num).METRIC.at(_metric_num).attributes().NAME == "disk_total") {
          _temp_disk_total = res.GANGLIA_XML.GRID.CLUSTER.HOST.at(_host_num).METRIC.at(_metric_num).attributes().VAL;
        }
        /* mem */
        if (res.GANGLIA_XML.GRID.CLUSTER.HOST.at(_host_num).METRIC.at(_metric_num).attributes().NAME == "mem_free") {
          _temp_mem_free = res.GANGLIA_XML.GRID.CLUSTER.HOST.at(_host_num).METRIC.at(_metric_num).attributes().VAL;
        }
        if (res.GANGLIA_XML.GRID.CLUSTER.HOST.at(_host_num).METRIC.at(_metric_num).attributes().NAME == "mem_total") {
          _temp_mem_total = res.GANGLIA_XML.GRID.CLUSTER.HOST.at(_host_num).METRIC.at(_metric_num).attributes().VAL;
        }
        /* Traffic IO */
        if (res.GANGLIA_XML.GRID.CLUSTER.HOST.at(_host_num).METRIC.at(_metric_num).attributes().NAME == "bytes_out") {
          _temp_bytes_out = res.GANGLIA_XML.GRID.CLUSTER.HOST.at(_host_num).METRIC.at(_metric_num).attributes().VAL;
        }
        if (res.GANGLIA_XML.GRID.CLUSTER.HOST.at(_host_num).METRIC.at(_metric_num).attributes().NAME == "bytes_in") {
          _temp_bytes_in = res.GANGLIA_XML.GRID.CLUSTER.HOST.at(_host_num).METRIC.at(_metric_num).attributes().VAL;
        }
        /* cpu */
        if (res.GANGLIA_XML.GRID.CLUSTER.HOST.at(_host_num).METRIC.at(_metric_num).attributes().NAME == "cpu_idle") {
          _temp_cpu = res.GANGLIA_XML.GRID.CLUSTER.HOST.at(_host_num).METRIC.at(_metric_num).attributes().VAL;
        }
      }
      if (_temp_disk_free == 0 || _temp_disk_total == 0 || _temp_mem_free == 0 || _temp_mem_total == 0 || _temp_cpu == 0 || _temp_bytes_in == 0 || _temp_bytes_out == 0) {
        console.log("Error in parse xml file. Some attributes are zero.");
        return;
      } else {
        _cluster_num++;
        _cpu.push(_temp_cpu);
        _mem.push(((_temp_mem_free * 1) / (_temp_mem_total * 1)).toFixed(2));
        _disk.push(((_temp_disk_free * 1) / (_temp_disk_total * 1)).toFixed(2))
        _bytes_in.push(_temp_bytes_in);
        _bytes_out.push(_temp_bytes_out);
      }
    }
  });
}

ReadClusterDir(ClusterInfoDir);

function Interval_ReadClusterDir(ClusterInfoDir) {
  return function() {
    ReadClusterDir(ClusterInfoDir);
  }
}

setInterval(Interval_ReadClusterDir(ClusterInfoDir), 4000);

module.exports = router;