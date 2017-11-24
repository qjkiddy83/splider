var mongojs = require('mongojs')
var Promise = require('bluebird');

module.exports = {
    connect : function(dbname){
        return new Promise(function(resolve,reject){
            var db = mongojs(dbname);
            db.on('error', function (err) {
                reject(err)
            })
            resolve(db);
        })
    },
    find : function(db,collection,query){
        let _query = query?query:{};
        return new Promise(function(resolve,reject){
            db[collection].find(_query,function (err, docs) {
                db.close();
                if(err){
                    reject(err);
                    return ;
                }
                resolve(docs)
            })
        })
    },
    insert:function(db,collection,docs){
        return new Promise(function(resolve,reject){
            db[collection].insert(docs,function (err, docs) {
                db.close();
                if(err){
                    reject(err);
                    return ;
                }
                resolve(docs)
            })
        }) 
    }
}
