var express = require('express');
var router = express.Router();

/* GET pulg. */
router.get('/', function(req, res, next) {
  res.render('grape-plug');
});

module.exports = router;
