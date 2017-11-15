var express = require('express');
var router = express.Router();
var book = require('../models/book');

/* GET home page. */
router.get('/', function (req, res, next) {
  book(function (data) {
    res.send('index', { books: data });
  });
});

module.exports = router;
