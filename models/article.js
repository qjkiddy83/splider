let request = require('request');
let cheerio = require('cheerio');
let fs = require("fs");
let Promise = require('bluebird');
let requestAysnc = Promise.promisify(request);
let root = 'http://www.jinyongwang.com';
let books = [];

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

function fetchText(href) {
    return new Promise(function (resolve, reject) {
        requestFunc(`${root}${href}`).then(function (res) {
            var $ = cheerio.load(res, { decodeEntities: false });
            var all = $('#box').find('p'),arr = [];
            all.each(function(i){
                // console.log($(this).text())
                arr.push($(this).text());
            })
            // console.log(all.eq(0).text())
            resolve(arr.join('/n'));
        }).catch(function (err) {
            reject(err)
        })
    })
}

module.exports = fetchText;