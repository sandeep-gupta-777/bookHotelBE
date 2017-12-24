
const db = require('../db');
const mongoose = require('../db').Mongoose;

let getCartisanOrderFromDB = function (criteriaObject,skip,limit) {
    return db.cartisanOrderModel.find(criteriaObject).skip(skip).limit(limit).exec(function (err, result) {
        console.log(err);
        console.log(result);
    });
};
module.exports =  {
    getCartisanOrderFromDB
};

