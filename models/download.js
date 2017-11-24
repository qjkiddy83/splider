let request = require('request');
let cheerio = require('cheerio');
let fs = require("fs");
let Promise = require('bluebird');
let requestAysnc = Promise.promisify(request);
let root = 'http://www.jinyongwang.com';
let books = [];
var DBTools = require('../models/db');
var catalog = require('./catalog');
var article = require('./article');

function requestFunc(url, callback) {
    return new Promise(function (resolve, reject) {
        requestAysnc({
            url: url,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2490.80 Safari/537.36'
            },
        }).then(function (data) {
            resolve(data.body)
        }).catch(function (err) {
            reject(err)
        })
    })
}

function fetchCatalog(href, name) {
    var book = {
        name: name,
        catalog: []
    };
    return new Promise(function (resolve, reject) {
        catalog(href).then(function (res) {
            let rqs = [];
            book.catalog = res;
            res.forEach(function (item, i) {
                rqs.push(article(item.href));
            })
            return Promise.all(rqs);
        }).then(function (res) {
            res.forEach(function (item, i) {
                book.catalog[i].text = item;
            })
            return insertToDB(book);            
        }).then(function(){
            return writeFile(`./public/docs/${book.name}.txt`, book)
        }).then(function (doc) {
            resolve(doc);
        }).catch(function (err) {
            reject(err)
        })
    })

}

function insertToDB(book) {
    return new Promise(function(resolve,reject){
        DBTools.connect('books').then(function (_db) {
            return DBTools.insert(_db, 'book',book)
        }).then(function (docs) {
            resolve(docs)
        }).catch(function (err) {
            reject(err)
        })
    })
    
}

function writeFile(path, data) {
    return new Promise(function (resolve, reject) {
        let _data = typeof data === "string" ? data : JSON.stringify(data);
        fs.writeFile(path, _data, function (err) {
            if (err) {
                reject(err)
            }
            resolve(path)
        });
    })
}

module.exports = function (path, name) {
    return fetchCatalog(path, name);
};