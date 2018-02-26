const fs = require('fs');

/* log dir */
var LOG_DIR = process.env.GRAPEUI_LOG;
var CLUSTER_INFO_DIR = process.env.CLUSTER_INFO;

if (LOG_DIR == undefined || CLUSTER_INFO_DIR == undefined) {
  console.log("Error! undefined env, source grapeui.env! ");
  return;
} else {
  if (!fs.existsSync(LOG_DIR)) {
    console.log("Error! " + LOG_DIR + " No such file or directory");
    return;
  }
  if (!fs.existsSync(CLUSTER_INFO_DIR)) {
    fs.mkdirSync(CLUSTER_INFO_DIR);
  }
}

module.exports.CLUSTER_INFO_DIR = CLUSTER_INFO_DIR;
module.exports.LOG_DIR = LOG_DIR;