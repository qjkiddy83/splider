let Promise = require('bluebird');
let DBTools = require('../models/db');

function findBooks(query) {
    return new Promise(function(resolve,reject){
        DBTools.connect('books').then(function (_db) {
            return DBTools.find(_db, 'book',query)
        }).then(function (docs) {
            console.log(docs)
            resolve(docs)
        }).catch(function (err) {
            reject(err)
        })
    })
    
}

module.exports = function (query) {
    return findBooks(query);
};