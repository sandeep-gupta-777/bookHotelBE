
const db = require('../db');

/*In this file all the dirty database work will be done*/

let getCartisanOrderFromDB = function (criteriaObject,skip,limit) {
    return db.cartisanOrderModel.find(criteriaObject).skip(skip).limit(limit).exec(function (err, result) {
        console.log(err);
        console.log(result);
    });
};
let getBookingFromDB = function (criteriaObject,skip,limit) {
    return db.bookingModel.find(criteriaObject).skip(skip).limit(limit).exec(function (err, result) {
        console.log(err);
        console.log(result);
    });
};
let pushNewBookingIncustomerBookingsArray = function (user_id, booking_id, isBookingSubmitted) {
    // return db.customerModel.updateOne({_id:user_id}, {});
};

let getHotelsFromDB = function (criteriaObj) {
    // criteriaObj ={};
    return db.hotelModel.find(criteriaObj).exec(function (err, result) {
        console.log(err);
        console.log(result);
    });
};

let getHotelRecommendationsFromDB = function (criteriaObj) {
    //find average booking price by the customer in Booking model
    //show all the hotels where price of booking is less than the average

    let pipeline = [
        // {"$match": {_id:"5a51c8f85716db27a4431dea"}},
        {"$match": criteriaObj},
        {
            "$group": {
                "_id": "$bookingCustomer_id",
                "average": { "$avg": "$bookingTotalPrice" }
            }
        }
    ];

    return db.bookingModel.aggregate(pipeline)

};
module.exports =  {
    getCartisanOrderFromDB,
    getBookingFromDB,
    pushNewBookingIncustomerBookingsArray,
    getHotelsFromDB,
    getHotelRecommendationsFromDB
};

