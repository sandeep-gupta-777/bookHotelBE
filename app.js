const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const multer = require('multer');
const appRoutes = require('./routes/app');
const passport = require('passport');
const app = express();
const session = require('express-session');


app.use(express.static(path.join(__dirname, 'public')));//this should come before app.use(require('./session')) as per this article
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));




app.use(logger('dev'));
app.use(bodyParser.json());//COMMENT THIS AND YOU WILL DIE

app.use(function(req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, PATCH, DELETE, OPTIONS');
  next();
});
const userRoutes = require('./routes/user');
app.use('/users', userRoutes);
app.use('/', appRoutes);


app.get('*', function(req, res){
    res.status(404).json({message:"resource not found"}, 404);
});


// catch 404 and forward to error handler
app.use(function(req, res, next) {
    res.render('index');
});

module.exports = app;
