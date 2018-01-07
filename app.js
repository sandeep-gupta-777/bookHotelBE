const express = require('express');
const app = express();
const path = require('path');
const logger = require('morgan');
const bodyParser = require('body-parser');

const appRoutes = require('./routes/app');
const userRoutes = require('./routes/user');
const bookingRoutes = require('./routes/booking');

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

app.use('/users', userRoutes);
app.use('/bookings', bookingRoutes);
app.use('/', appRoutes);

// catch 404 and forward to error handler
app.get('*', function(req, res){
    res.status(404).json({message:"resource not found"});
});

app.use(function(req, res, next) {
    res.render('index');
});

module.exports = app;
