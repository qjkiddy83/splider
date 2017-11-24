var express = require('express');
var router = express.Router();
var book = require('../models/book');
var catalog = require('../models/catalog');
var article = require('../models/article');
var download = require('../models/download');
var dbbooks = require('../models/dbbooks');
var path = require('path');
var db = require('../models/db');

/* GET home page. */
router.get('/', function (req, res, next) {
  book(function (data) {
    res.render('index',{ books: data })
  });
});
router.get('/dbbooks', function (req, res, next) {
  dbbooks({}).then(function (data) {
    res.render('dbbooks',{books:data})
  });
});
router.get('/book', function (req, res, next) {
  catalog(req.query.path).then(function(data){
    res.render('catalog',{catalog:data})
  })
});
router.get('/book/article', function (req, res, next) {
  article(req.query.path).then(function(data){
    // res.json(data.split('/n'))
    res.render('article',{article:data.split('/n')})
  })
});

router.get('/book/download', function (req, res, next) {
  download(req.query.path,req.query.name).then(function(data){
    res.download(data,`${req.query.name}.txt`);
  }).catch(function(err){
    console.error(err)
  })
});

module.exports = router;
