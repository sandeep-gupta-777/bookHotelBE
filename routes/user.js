const express=  require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcryptjs');
const db = require('../db');
const dbHelper = require('./db');

const jwt = require('jsonwebtoken');
const helper = require('../helper');

// require('')

router.post('/saveorder', function (req,res,next) {

    console.log(req.body);
    let _id = req.body._id;

    let criteriaObject ;
    if(_id) {//TODO: use upsert for entire if else block
        criteriaObject = {_id:_id};
        db.cartisanOrderModel.update(criteriaObject,req.body,{ upsert: true },function (err, numAffected) {
            console.log(err);
            console.log(numAffected);
            if(err)
                res.json({message:'Some problem with connecting with DB'});
            else {
                res.json({message:'successfully saved!'});
            }
        });
    }
    else {
        criteriaObject = {};
        // db.blogPostModel.insert( req.body);//TODO: This code gives error. check out why?
        req.body = helper.assignOrderToWorkShopAdmin(req.body);
        let tempOrder = new db.cartisanOrderModel(req.body);
        tempOrder.save(function (err, savedDoc) {
            if(err)
                res.json({message:'Some problem with connecting with DB'});
            else {
                res.json({message:'successfully saved!',_id:savedDoc['_doc']['_id']});

                console.log(savedDoc);
            }
        });
    }


});

router.post('/signup', function (req,res,next) {

    console.log(req.body);
    //check if we already have a user with this email address
    db.cartisanUserModel.findOne({userEmail:req.body.userEmail}, function (err,user) {
        if(err){
            console.log(err);
        }
        //TODO: ALSO CHECK FOR UNIQUE USERNAME
        if(user){
            // if(user.userName===req.body.userName)
            // res.json({problem_message:'Username is already taken'});
            // else
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
   db.cartisanUserModel.findOne({userEmail:req.body.userEmail}, function (err,user) {
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
       else if(!bcrypt.compareSync(req.body.userPassword, user.userPassword))
       {
           statusCode = 500;
           bodyObject.message=  "Wrong password";
       }
       else {
           //password is correct; create jwt
           let token = jwt.sign({user:user},'secret',{expiresIn:7200});

           bodyObject.message=  "successfully logged in";
           bodyObject.problem=  false;
           bodyObject.token = token;
           statusCode=200;

       }
       let temp = {...bodyObject,user};
       res.status(statusCode).json(temp);


   });
});

module.exports = router;





