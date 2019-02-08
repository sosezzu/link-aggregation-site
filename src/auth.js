const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const User = mongoose.model('User');

function register(username, email, password, errorCallback, successCallback) {
  if (username.length < 8 || password.length < 8) {
    console.log('USERNAME PASSWORD TOO SHORT');
    errorCallback({ 'message': 'USERNAME PASSWORD TOO SHORT' });
  }
  User.findOne({ username: username }, (err, result) => {
    if (result) {
      errorCallback({ 'message': 'USERNAME ALREADY EXISTS' });
    }
    else {
      bcrypt.hash(password, 10, function (err, hash) {
        const user = new User({
            username: username,
            email: email,
            password: hash
          });
        user.save(function (err, users) {
          if (err) {
            console.log(err);
            errorCallback({ 'message': 'DOCUMENT SAVE ERROR' });
          }
          else {
            console.log(users);
            successCallback(user);
          }
        });
      });
    }
  });
}

function login(username, password, errorCallback, successCallback) {
  User.findOne({ username: username }, (err, user) => {
    if (user) {
      bcrypt.compare(password, user.password, (err, passwordMatch) => {
        if (passwordMatch) {
          successCallback(user);
        }
        else {
          console.log('PASSWORDS DO NOT MATCH');
          errorCallback({ 'message': 'PASSWORDS DO NOT MATCH' });
        }
      });
    }
    else {
      console.log('USER NOT FOUND');
      errorCallback({ 'message': 'USER NOT FOUND' });
    }
  });
}

function startAuthenticatedSession(req, user, callback) {
  req.session.regenerate((err) => {
    if (!err) {
      req.session.user = user;
      callback(req.session.user);
    }
    else {
      console.log(err);
      callback(err);
    }
  });
}

module.exports =
  {
    startAuthenticatedSession: startAuthenticatedSession,
    register: register,
    login: login
  };
