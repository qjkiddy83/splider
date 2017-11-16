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

function fetchMain(callback) {
    requestFunc(`${root}/book/`).then(function (res) {
        var $ = cheerio.load(res, { decodeEntities: false });
        $('.booklist .list').eq(0).find('li').each(function (i) {
            let title_el = $(this).find('.title a'),
                href = title_el.attr('href'),
                name = title_el.text(),
                info = $(this).find('.info').html().split('<br>')[0],
                img = $(this).find('.img img').attr('src');

            let novel = {
                name,
                info,
                img,
                href
            }
            books.push(novel);
        });
    }).then(function(res){
        callback(books);
    }).catch(function (e) {
        console.error(e)
    })
}

module.exports = function (callback) {
    fetchMain(callback)
};