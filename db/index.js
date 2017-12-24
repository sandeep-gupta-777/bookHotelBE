'use strict';
const config = require('../config');
const Mongoose = require('mongoose').connect(config.dbURL);

Mongoose.connection.on('error', error => {
    // logger.log('error', 'Mongoose connection error: ' + error);
});

// Create a Schema that defines the structure for storing user data
const cartisanUserSchema = new Mongoose.Schema( {

        userCustomID: String,
        userPassword: String,
        userFullName: String,
        userEmail: String,
        userMobileNumber: String,
        userRole: String

        // userProfileID?: string,  userProfilePicURL?: string,  userVotes?: string[], userComments?: { comment: string; image: string }[],
        // userUploaded?: string[],   userDateOfSignup?: Date,   userLastLogin?: Date
});

const cartisanOrderSchema = new Mongoose.Schema({
        orderSerialNumber: String,
        orderDate: Number,
        orderTitle: String,
        orderHTML:String,
        orderModelName:String,
        orderText:String,
        orderAssignedBy_id:String,//TODO: make it embedded
        orderAssignedBy_fullName:String,//TODO: make it embedded
        orderAssignedTo_id:String,//TODO: make it embedded
        orderAssignedTo_fullName:String,//TODO: make it embedded
        orderEstimaterPrice:String,
        orderPriceEstimationMode:Number,
        orderAddress:String,
        orderTotalPrice:Number,
    orderImageContainersArray:[]//TODO: string wont work. String[] wont work. FIND OUT WHY.
    }
);

//following are the models for respective schema
const cartisanUserModel = Mongoose.model('cartisanUser',cartisanUserSchema);
const cartisanOrderModel = Mongoose.model('cartisanOrder',cartisanOrderSchema);



module.exports = {
    Mongoose,
    cartisanUserModel,
    cartisanOrderModel

};

