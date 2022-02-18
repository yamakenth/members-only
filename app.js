var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var bcrypt = require('bcryptjs');

var indexRouter = require('./routes/index');
var User = require('./models/user');

var app = express();

// set up mongoose connection
require('dotenv').config();
var mongoose = require('mongoose');
var mongoDB = process.env.DEV_DB_URL;
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

passport.use(
  new LocalStrategy(
    { usernameField: 'email', passwordField: 'password' },
    function(username, password, done) {
      User.findOne({ username: username }, function(err, user) {
        if (err) return done(err);

        if (!user) {
          return done(null, false, { message: 'Username not found' });
        }

        bcrypt.compare(password, user.password, function(err, res) {
          if (res) {
            return done(null, user);
          } else {
            return done(null, false, {message: 'Incorrect password' });
          }
        });
      });
    }
  )
);

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

app.use(session({ secret: process.env.SECRET, resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.urlencoded({ extended: false }));

app.use(function(req, res, next) {
  res.locals.currentUser = req.user;
  next();
});

// test 
app.use(function(req, res, next) { 
  console.log(req.session);
  console.log(req.user);
  if (req.user) {
    console.log(req.user.member);
  }
  next(); 
});
// test 

app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;