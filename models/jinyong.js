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

function fetchMain() {
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
    }).then(function () {//爬取目录
        let rqs = [];
        books.forEach(function (item) {
            rqs.push(fetchCatalog(item.href));
        })
        return Promise.all(rqs)
    }).then(function (res) {//爬取文章
        res.forEach(function (item, i) {
            books[i].catalog = item;
        })
        let rqs = [];
        books.forEach(function (book, i) {
            createDoc(book)
        })
        // createDoc(books[0]);
    }).catch(function (e) {
        console.error(e)
    })
}

function createDoc(book) {
    // console.log(book)
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
        return writeFile(`./logs/${book.name}.json`, bookDoc)
    }).then(function (path) {
        console.log(path)
    }).catch(function(err){
        console.error(err);
    })
}

function fetchCatalog(href) {
    return new Promise(function (resolve, reject) {
        requestFunc(`${root}${href}`).then(function (res) {
            var $ = cheerio.load(res, { decodeEntities: false });
            let list = []
            $('.mlist li').each(function (j) {
                list.push({
                    name: $(this).text(),
                    href: $(this).find('a').attr('href')
                })
            })
            resolve(list);
            // console.log(JSON.stringify(books))
        }).catch(function (err) {
            reject(err)
        })
    })

}

function fetchText(href) {
    return new Promise(function (resolve, reject) {
        // console.log(href)
        requestFunc(`${root}${href}`).then(function (res) {
            var $ = cheerio.load(res, { decodeEntities: false });
            var all = $('#box').find('p'),arr = [];
            all.each(function(i){
                // console.log($(this).text())
                arr.push($(this).text());
            })
            // console.log(all.eq(0).text())
            resolve(arr.join('\n'));
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
module.exports = function () {
    fetchMain()
};