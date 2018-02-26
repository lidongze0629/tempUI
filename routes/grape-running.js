var express = require('express');
var router = express.Router();

/* GET running page. */
var ugcalgosname = []

router.get('/', function(req, res, next) {
  res.render('grape-running', {ugcalgosname: ugcalgosname, if_waiting: 0});
});

module.exports = router;
