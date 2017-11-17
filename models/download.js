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

// function fetchMain(callback) {
//     requestFunc(`${root}/book/`).then(function (res) {
//         var $ = cheerio.load(res, { decodeEntities: false });
//         $('.booklist .list').eq(0).find('li').each(function (i) {
//             let title_el = $(this).find('.title a'),
//                 href = title_el.attr('href'),
//                 name = title_el.text(),
//                 info = $(this).find('.info').html().split('<br>')[0],
//                 img = $(this).find('.img img').attr('src');

//             let novel = {
//                 name,
//                 info,
//                 img,
//                 href
//             }
//             books.push(novel);
//         });
//     }).then(function () {//爬取目录
//         let rqs = [];
//         books.forEach(function (item) {
//             rqs.push(fetchCatalog(item.href));
//         })
//         return Promise.all(rqs)
//     }).then(function (res) {//爬取文章
//         res.forEach(function (item, i) {
//             books[i].catalog = item;
//         })
//         let rqs = [];
//         books.forEach(function (book, i) {
//             rqs.push(createDoc(book))
//         })
//         return Promise.all(rqs);
//         // createDoc(books[0]);
//     }).then(function(res){
//         callback(res);
//     }).catch(function (e) {
//         callback(e)
//     })
// }

function createDoc(book) {
    return new Promise(function(resolve,reject){
        let bookDoc = {
            name : book.name,
            catalog:book.catalog
        };
        let rqs = [];
        book.catalog.forEach(function (cata) {
            rqs.push(fetchText(cata.href));
        })
        Promise.all(rqs).then(function (res) {
            res.forEach(function(txt,i){
                bookDoc.catalog[i].txt = txt;
            })
        }).then(function () {
            return writeFile(`./public/docs/${book.name}.txt`, bookDoc)
        }).then(function (path) {
            resolve(path)
        }).catch(function(err){
            reject(err);
        })
    })
}

function fetchCatalog(href) {
    var book = {
        name : "飞狐外传小说",
        catalog:[]
    };
    return new Promise(function (resolve, reject) {
        requestFunc(`${root}${href}`).then(function (res) {
            var $ = cheerio.load(res, { decodeEntities: false });
            $('.mlist li').each(function (j) {
                book.catalog.push({
                    name: $(this).text(),
                    href: $(this).find('a').attr('href')
                })
            })
            return book.catalog;
        }).then(function(res){
            let rqs = [];
            res.forEach(function (item, i) {
                rqs.push(fetchText(item.href));
            })
            return Promise.all(rqs);
        }).then(function(res){
            res.forEach(function(item,i){
                book.catalog[i].text = item;
            })
            return writeFile(`./public/docs/${book.name}.txt`, book)
        }).then(function(doc){
            resolve(doc);
        }).catch(function (err) {
            reject(err)
        })
    })

}

function fetchText(_href) {
    let href = decodeURIComponent(_href);
    return new Promise(function (resolve, reject) {
        requestFunc(`${root}${href}`).then(function (res) {
            var $ = cheerio.load(res, { decodeEntities: false });
            var all = $('#box').find('p'),arr = [];
            all.each(function(i){
                arr.push($(this).text());
            })
            // writeFile(`./docs/aaa.txt`, arr.join('\n'));
            return arr.join('\n');
        }).then(function(path){
            resolve(path)
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

module.exports = function (path,type) {
    if(type == "article"){
        return fetchText(path)
    }else{
        return fetchCatalog(path);
    }
};