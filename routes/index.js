var express = require('express');
var router = express.Router();
const { body, validationResult } = require('express-validator');
var bcrypt = require('bcryptjs');

var User = require('../models/user');

var SECRET_PASSCODE = 'secretpasscode123';

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/sign-up', function(req, res, next) {
  res.render('sign-up-form');
});

router.post('/sign-up', [
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
      res.render('sign-up-form', { user: req.body, errors: errors.array() });
      return;
    } 

    bcrypt.hash(req.body.password, 10, function(err, hashedPassword) {
      if (err) return next(err);
      var user = new User({
        first_name: req.body.first_name.toUpperCase(),
        last_name: req.body.last_name.toUpperCase(),
        username: req.body.email.toLowerCase(),
        password: hashedPassword,
        is_member: req.body.is_member
      });
      user.save(function(err) {
        if (err) return next(err);
        res.redirect('/join-club');
      });
    });
  }
]);

router.get('/join-club', function(req, res, next) {
  res.render('join-club');
});

router.post('/join-club', function(req, res, next) {
  if (req.body.secret_passcode !== SECRET_PASSCODE) {
    var error = 'Enter the valid passcode';
    res.render('join-club', { passcode: req.body.secret_passcode, error });
    return;
  }
  res.send('NOT IMPLEMENTED: club member authentication successful');
});

router.get('/log-in', function(req, res, next) {
  res.render('log-in-form');
});

module.exports = router;