const express=  require('express');
const router = express.Router();

const db = require('../db');
const dbHelper = require('./db');
const helper = require('../helper');



router.post('/signup', function (req,res,next) {

    //check if we already have a user with this email address
    db.cartisanUserModel.findOne({userEmail:req.body.userEmail}, function (err,user) {
        if(err){
            console.log(err);
        }
        //TODO: ALSO CHECK FOR UNIQUE USERNAME
        if(user){

            if (user.userEmail===req.body.userEmail){
                res.status(500).json({message:'Email is already taken'});
            }
            else {
                res.status(500).json({message:'Username or email is already taken'});
            }
        }
        else if(err){
            res.status(500).json({message:'We are experiencing server issue. Please try again later.'});
        }
        else {
            let user = new db.cartisanUserModel({
                userCustomID: req.body.userCustomID,
                userFullName:req.body.userFullName,
                userEmail:req.body.userEmail,
                userRole:req.body.userRole,
                userMobileNumber:req.body.userMobileNumber,
                userPassword:bcrypt.hashSync(req.body.userPassword,10)//salt = 10 how strong this encryption is
            });
            console.log(user);
            user.save(function (err, result) {
                if(err){
                    return res.status(500).json({message:'database error occurred'});
                }
                res.status(201).json({message:'user created',obj:result});
            });
        }
    });
});

router.post('/login',function (req,res,next) {

    //TODO: use user name for sign in as well
    console.log(req.body);
    db.customerModel.findOne({customerEmail:req.body.customerEmail, customerPassword:req.body.customerPassword}, function (err,user) {
        let bodyObject = {problem:true};
        let statusCode;
        if(err){
            statusCode = 500;//TODO
            bodyObject.message=  "DB error occurred";
        }
        else if(!user){
            bodyObject.message=  "No user found";
            statusCode = 500;
        }
        res.json(user);

    });
});
module.exports = router;





