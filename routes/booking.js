const express = require('express');
const router = express.Router();
const dbHelper = require('./db');
const db = require('../db');

/*booking related will appear here*/



router.post('/getbooking',function (req,res,next) {

    // let _id = req.body._id;
    // let user_id = req.body.user_id;
    let criteriaObj = req.body;
    // helperDB.getBookingFromDB({_id:order_id,$or:[{orderAssignedBy_id:user_id},{orderAssignedTo_id:user_id}]},0,1).then((order)=>{
    dbHelper.getBookingFromDB(criteriaObj,0,1).then((order)=>{
        if(order.length===0)
        {
            res.status(404).json([{message: "either the order doesn't exists or you may not be autherised to see it" }]);
            return;
        }
        res.status(201).json(order[0]);
    });
});

router.post('/allbookings',function (req,res,next) {
    let bookingCustomer_id = req.body.bookingCustomer_id;
    dbHelper.getBookingFromDB({bookingCustomer_id:bookingCustomer_id, bookingIsSubmitted:true},0,10).then((order)=>{
        res.status(201).json(order);
    });
});

router.post('/recommendations',function (req,res,next) {

    /*Logic: Recommend user hotels which are cheaper that his average booking */

    let criteriaObj = {bookingCustomer_id: req.body.bookingCustomer_id};
    if(!req.body.bookingCustomer_id) criteriaObj = {};

    dbHelper.getHotelRecommendationsFromDB(criteriaObj,0,10)
        .exec(function (err, result) {
            console.log(err);
            if(result && result.length>0)
            dbHelper.getHotelsFromDB({hotelPrice:{$lte:result[0].average}}).then((hotels)=>{

                res.status(201).json(hotels);
            });
        });

});

router.post('/submitbooking', function (req,res,next) {

    console.log(req.body);
    let _id = req.body._id;
    let bookingCustomer_id = req.body.bookingCustomer_id;
    let criteriaObject ;
    if(_id) {//TODO: use upsert for entire if else block
        criteriaObject = {_id:_id};
        db.bookingModel.findOneAndUpdate(criteriaObject,req.body,{ upsert: true },function (err, savedBooking) {
            console.log(err);
            console.log(savedBooking);
            if(err)
                res.json({message:'Some problem with connecting with DB'});
            else {
                res.json({message:'successfully saved!',savedBooking:req.body});//TODO:
            }
        });
    }
    else {
        let tempBooking = new db.bookingModel(req.body);
        tempBooking.save(function (err, savedDoc) {
            if(err)
                res.json({message:'Some problem with connecting with DB'});
            else {
                res.json({message:'successfully saved!',savedBooking:savedDoc['_doc']});
                console.log(savedDoc);
                //    if a new booking is created save this in customer's customerBookings[] as well
                dbHelper.pushNewBookingIncustomerBookingsArray(bookingCustomer_id, savedDoc._id,false);
            }
        });
    }
});

module.exports = router;