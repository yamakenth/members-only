var bcrypt = require('bcryptjs');
var express = require('express');
var router = express.Router();
const { body, validationResult } = require('express-validator');
var passport = require('passport');

var User = require('../models/user');
var Message = require('../models/message');

var SECRET_PASSCODE = 'secretpasscode123';

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Members Only' });
});

router.get('/signup', function(req, res, next) {
  res.render('sign-up-form', { title: 'Signup'});
});

router.post('/signup', [
  body('first_name').trim().escape(),
  body('last_name').trim().escape(),
  body('email').isEmail().normalizeEmail(),
  body('password').escape(),
  body('password-confirmation')
    .trim()
    .escape()
    .custom(function(value, { req }) {
      if (value !== req.body.password) {
        throw new Error('Password confirmation does not match password');
      }
      return true;
    }),

  function(req, res, next) {
    var errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.render('sign-up-form', { title: 'Signup', user: req.body, errors: errors.array() });
      return;
    } 

    bcrypt.hash(req.body.password, 10, function(err, hashedPassword){
      if (err) return next(err);
      var user = new User({
        first_name: req.body.first_name.toUpperCase(),
        last_name: req.body.last_name.toUpperCase(),
        username: req.body.email.toLowerCase(),
        password: hashedPassword,
        member: false
      });
      user.save(function(err) {
        if (err) return next(err);
        res.redirect('/');
      });
    });
  }
]);

router.get('/membership', function(req, res, next) {
  res.render('member-credential', { title: 'Membership'});
});

router.post('/membership', function(req, res, next) {
  if (!req.isAuthenticated()) {
    var error = 'You need to log in first';
    res.render('member-credential', { title: 'Membership', passcode: req.body.secret_passcode, error });
  } else if (req.body.secret_passcode !== SECRET_PASSCODE) {
    var error = 'Invalid passcode';
    res.render('member-credential', { title: 'Membership', passcode: req.body.secret_passcode, error });
  } else if (req.isAuthenticated() && req.body.secret_passcode === SECRET_PASSCODE) {
    var user = new User({
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      username: req.body.username,
      password: req.body.password,
      member: true,
      _id: req.user._id
    });
    User.findByIdAndUpdate(req.user._id, user, {}, function(err, theuser) {
      if (err) return next(err);
      res.redirect('/');
    });
  }
});

router.get('/login', function(req, res, next) {
  res.render('log-in-form', { title: 'Login'});
});

router.post('/login', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login'
}));

router.get('/logout', function(req, res, next) {
  req.logout();
  res.redirect('/');
});

router.get('/new-message', function(req, res, next) {
  res.render('message-form', { title: 'New Message' });
});

router.post('/new-message', function(req, res, next) {
  var message = new Message({
    title: req.body.title,
    text: req.body.text,
    author: req.user._id,
    timestamp: Date.now()
  });
  message.save(function(err) {
    if (err) return next(err);
    res.redirect('/');
  });
});

module.exports = router;