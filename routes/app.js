const express = require('express');
const router = express.Router();
const dbHelper = require('./db');


//open routes will appear here

router.post('/hotellist',function (req,res,next) {

    let criteriaObj = {_id: req.body._id};
    if(!req.body._id) criteriaObj = {};
    // let bookingCustomer_id = req.body.bookingCustomer_id;

    // helperDB.getBookingFromDB({_id:order_id,$or:[{orderAssignedBy_id:user_id},{orderAssignedTo_id:user_id}]},0,1).then((order)=>{
    dbHelper.getHotelsFromDB(criteriaObj,0,10).then((order)=>{

        res.status(201).json(order);
    });
});

module.exports = router;
