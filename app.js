var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const mongoose = require('mongoose');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const catalogRouter = require('./routes/catalog');
var app = express();
let mongoDB = 'mongodb+srv://AlphaMike:Ali54561ali@cluster0.vu77b.mongodb.net/albumlibrary?retryWrites=true&w=majority'
// view engine setup
mongoose.connect(mongoDB , {
  useNewUrlParser: true ,
  useUnifiedTopology: true
});
let db = mongoose.connection;
db.on('error', function (err) {
  if (err) // couldn't connect
    console.log(err)
  // hack the driver to allow re-opening after initial network error
  db.db.close();

  // retry if desired
  connect();
});app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/catalog' , catalogRouter)

// catch 404 and forward to error handler


module.exports = app;
