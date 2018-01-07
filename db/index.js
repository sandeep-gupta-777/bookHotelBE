'use strict';
const config = require('../config');
const Mongoose = require('mongoose').connect(config.dbURL);

Mongoose.connection.on('error', error => {
    // logger.log('error', 'Mongoose connection error: ' + error);
});


const customerSchema = new Mongoose.Schema({
    customerEmail: String,
    customerPassword: String,
    customerFullName: String,
    customerBookings: []//{hotel_id:string, isSubmitted:boolean}
});


const bookingSchema = new Mongoose.Schema({

        bookingCustomerFullName: String,
        bookingCustomer_id: String,
        bookingHotel_id: String,
        bookingHotel_Name: String,
        bookingCheckInDate: String,
        bookingCheckOutdate: String,
        bookingAdultsCount: Number,
        bookingChildrenCount: Number,
        bookingOtherDetails: String,//TODO: make it embedded
        bookingTotalPrice: Number,
        bookingIsSubmitted: Boolean

    }
);

const hotelSchema = new Mongoose.Schema({

        hotelName: String,
        hotelImageUrl: String,
        hotelCity: String,
        hotelAddress: Number,
        hotelState: Number,
        hotelPrice: Number,
    }
);

//following is for booking hotels
const bookingModel = Mongoose.model('booking', bookingSchema);
const customerModel = Mongoose.model('customer', customerSchema);
const hotelModel = Mongoose.model('hotel', hotelSchema);

module.exports = {
    Mongoose,

    bookingModel,
    customerModel,
    hotelModel

};

