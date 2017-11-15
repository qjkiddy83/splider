var express = require('express');
var router = express.Router();
var jinyong = require('../models/jinyong');

/* GET home page. */
router.get('/', function(req, res, next) {
  jinyong();
  res.render('index', { title: 'Express' });
});

module.exports = router;
