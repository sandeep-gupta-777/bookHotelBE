const express = require('express');
const router = express.Router();
const multer = require('multer');
const helperDB  =  require('./db');
const helper = require('../helper');
const userRoutes = require('./user');
const aws = require('./aws');
// console.log("in app.js file");

// set the directory for the uploads to the uploaded to
let DIR = './uploads/';
//define the type of upload multer would be doing and pass in its destination, in our case, its a single file with the name photo
let upload = multer({dest: DIR}).single('photo');

//get Order
router.get('/getorder',function (req,res,next) {

    let order_id = req.query.order_id;
    let user_id = req.query.user_id;

    //for remainder 0 we need to make it public, else make it private
    helperDB.getCartisanOrderFromDB({_id:order_id,$or:[{orderAssignedBy_id:user_id},{orderAssignedTo_id:user_id}]},0,1).then((order)=>{
        if(order.length===0)
        {
            res.status(404).json([{message: "either the order doesn't exists or you may not be autherised to see it" }]);
            return;
        }
        res.status(201).json(order[0]);
    });
});

//get ALL Order
router.get('/getallorders',function (req,res,next) {

    let user_id = req.query.user_id;
    let keyword = req.query.keyword;

    if(!user_id){
        res.status(401).json({message:'Unautherized access'});
    }
    let criteriaObj = {};
    //when keyword is "" show recent orders, otherwise perform full text search
    if(!keyword ||keyword===""){
        criteriaObj={};
        //TODO: sort by date
    }
    else {
        criteriaObj = {
            $text:{
            $search:keyword,
            $caseSensitive:false
        }}
    }
    criteriaObj = {...criteriaObj,$or:[{orderAssignedBy_id:user_id},{orderAssignedTo_id:user_id}]};
    helperDB.getCartisanOrderFromDB(criteriaObj,0,10).then((order)=>{
        res.status(201).json(order);
    });
});
//our file upload function.
router.post('/upload', function (req, res, next) {
    let temppathOfUploadedFile = '';
    let rString = helper.randomString(24, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');

    upload(req, res, function (err) {
        if (err) {
            // An error occurred when uploading
            return res.status(422).send("an Error occured");
        }
        //when No error occurs.
        temppathOfUploadedFile = req.file.path;
        rString = rString+ (req.file.originalname).replace(/ /g,'');//remove all white space
        aws(temppathOfUploadedFile, rString, res);//DO NOT DELETE
    });

});

module.exports = router;
