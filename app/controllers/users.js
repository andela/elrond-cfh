/**
 * Module dependencies.
 */
require('dotenv').config();
const mongoose = require('mongoose');

const User = mongoose.model('User');
// mongoose.Promise = global.Promise;
const Validator = require('validatorjs');
const avatars = require('./avatars').all();
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const sendEmail = require('./utils/sendEmail');

/**
 * Auth callback
 */
exports.authCallback = function (req, res, next) {
  res.redirect('/chooseavatars');
};

/**
 * Show login form
 */
exports.signin = function (req, res) {
  if (!req.user) {
    res.redirect('/#!/signin?error=invalid');
  } else {
    res.redirect('/#!/app');
  }
};
exports.signinJWT = (req, res) => {
  if (req.user) {
    return res.redirect('/#!/app');
  }
  const signinRules = {
    email: 'required|email',
    password: 'required|min:6'
  };
  const validator = new Validator(req.body, signinRules);
  if (validator.fails()) {
    return res.status(400).json({ message: 'Please check your inputs and try again' });
  }
  User.findOne({ email: req.body.email.toLowerCase() })
    .then((foundUser) => {
      if (!foundUser) {
        return res.status(404).json({ message: 'User not found' });
      }
      if (!foundUser.authenticate(req.body.password)) {
        return res.status(400).json({ message: 'Incorrect password' });
      }
      // If all is well
      const encodedData = {
        id: foundUser._id,
        email: foundUser.email,
        name: foundUser.name
      };
      // Give the user token
      const token = jwt.sign(encodedData, process.env.JWT_SECRET);
      const sendData = {
        token,
        message: 'success',
        id: foundUser._id,
        email: foundUser.email,
        name: foundUser.name
      };
      return res.status(200).json(sendData);
    })
    .catch(err => res.status(400).json(err));
};
/**
 * Show sign up form
 */
exports.signup = function (req, res) {
  if (!req.user) {
    res.redirect('/#!/signup');
  } else {
    res.redirect('/#!/app');
  }
};
exports.signupJWT = (req, res) => {
  if (req.user) {
    return res.redirect('/#!/app');
  }
  const signupRules = {
    name: 'required',
    email: 'required|email',
    password: 'required|min:6'
  };
  const validator = new Validator(req.body, signupRules);
  if (validator.fails()) {
    return res.status(400).json({ message: 'Please check your inputs and try again' });
  }
  User.findOne({
    email: req.body.email.toLowerCase()
  })
    .exec((err, existingUser) => {
      if (err) {
        return res.status(400).json({ message: 'Error occurred! please try again' });
      }
      if (existingUser) {
        return res.status(400).json({ message: 'A user with this email already exists' });
      }
      // If all is well
      req.body.name = req.body.name.toLowerCase();
      req.body.email = req.body.email.toLowerCase();
      const user = new User(req.body);
      user.avatar = avatars[user.avatar];
      user.provider = 'local';
      user.save((err) => {
        if (err) return res.status(400).json({ message: 'Error occurred...try again' });
        // If all is well
        const encodedData = {
          id: user._id,
          email: user.email,
          name: user.name
        };
        // Give the user token
        const token = jwt.sign(encodedData, process.env.JWT_SECRET);
        const sendData = {
          token,
          message: 'success',
          id: user._id,
          email: user.email,
          name: user.name
        };
        return res.status(200).json(sendData);
      });
    });
};
/**
 * Logout
 */
exports.signout = function (req, res) {
  req.logout();
  res.redirect('/');
};

/**
 * Session
 */
exports.session = function (req, res) {
  res.redirect('/');
};

/**
 * Check avatar - Confirm if the user who logged in via passport
 * already has an avatar. If they don't have one, redirect them
 * to our Choose an Avatar page.
 */
exports.checkAvatar = function (req, res) {
  if (req.user && req.user.id) {
    User.findOne({
      _id: req.user.id
    })
      .exec((err, user) => {
        if (user.avatar !== undefined) {
          res.redirect('/#!/');
        } else {
          res.redirect('/#!/choose-avatar');
        }
      });
  } else {
    // If user doesn't even exist, redirect to /
    res.redirect('/');
  }
};

/**
 * Create user
 */
exports.create = function (req, res) {
  if (req.body.name && req.body.password && req.body.email) {
    User.findOne({
      email: req.body.email
    }).exec((err, existingUser) => {
      if (!existingUser) {
        var user = new User(req.body);
        // Switch the user's avatar index to an actual avatar url
        user.avatar = avatars[user.avatar];
        user.provider = 'local';
        user.save(function (err) {
          if (err) {
            return res.render('/#!/signup?error=unknown', {
              errors: err.errors,
              user: user
            });
          }
          req.logIn(user, function (err) {
            if (err) return next(err);
            return res.redirect('/#!/');
          });
        });
      } else {
        return res.redirect('/#!/signup?error=existinguser');
      }
    });
  } else {
    return res.redirect('/#!/signup?error=incomplete');
  }
};

/**
 * Assign avatar to user
 */
exports.avatars = function (req, res) {
  // Update the current user's profile to include the avatar choice they've made
  if (req.user && req.user._id && req.body.avatar !== undefined &&
    /\d/.test(req.body.avatar) && avatars[req.body.avatar]) {
    User.findOne({
      _id: req.user._id
    })
      .exec((err, user) => {
        user.avatar = avatars[req.body.avatar];
        user.save();
      });
  }
  return res.redirect('/#!/app');
};

exports.addDonation = function (req, res) {
  if (req.body && req.user && req.user.id) {
    // Verify that the object contains crowdrise data
    if (req.body.amount && req.body.crowdrise_donation_id && req.body.donor_name) {
      User.findOne({
        _id: req.user.id
      })
        .exec((err, user) => {
          // Confirm that this object hasn't already been entered
          var duplicate = false;
          for (var i = 0; i < user.donations.length; i++) {
            if (user.donations[i].crowdrise_donation_id === req.body.crowdrise_donation_id) {
              duplicate = true;
            }
          }
          if (!duplicate) {
            console.log('Validated donation');
            user.donations.push(req.body);
            user.premium = 1;
            user.save();
          }
        });
    }
  }
  res.send();
};
exports.getDonations = (req, res) => {
  if (req.user) {
    User.findById(req.user.id)
      .select('donations')
      .exec((error, allDonations) => {
        if (error) {
          return res.status(500).send({ error });
        }
        return res.status(200).json(allDonations);
      });
  }
};
/**
 *  Show profile
 */
exports.show = function (req, res) {
  let user = req.profile;

  res.render('users/show', {
    title: user.name,
    user
  });
};

/**
 * Send User
 */
exports.me = function (req, res) {
  res.jsonp(req.user || null);
};

/**
 * Find user by id
 */
exports.user = function (req, res, next, id) {
  User
    .findOne({
      _id: id
    })
    .exec((err, user) => {
      if (err) return next(err);
      if (!user) return next(new Error('Failed to load User ' + id));
      req.profile = user;
      next();
    });
};
/**
   * Find Users Like Search...
   * @param {*} req
   * @param {*} res
   * @return {array}  array of Users 
   */
exports.searchedUsers = (req, res) => {
  const searchQuery = req.query.name;
  User.find({ name: { $regex: `.*${searchQuery}.*` } })
    .select('name email')
    .then((allUsers) => {
      res.status(200)
        .json(allUsers);
    }).catch((error) => {
      res.status(500)
        .json({ message: 'An error Occured', error });
    });
};
exports.sendEmailInvite = (req, res) => {
  if (req.user) {
    const url = decodeURIComponent(req.body.gameUrl);
    const guestUser = req.body.userEmail;

    if (guestUser !== null && url !== null) {
      sendEmail(guestUser, url);
      res.status(200)
        .json(guestUser);
    } else {
      res.status(400)
        .send('Bad Request !');
    }
  } else {
    res.status(401)
      .send('Hey Kindly Login first!');
  }
};

exports.allUsers = (req, res) => {
  if (req.user) {
    User.find({ $ne: { email: req.user.email } })
      .select('name email').then((allUsers) => {
        return res.status(200)
          .json(allUsers);
      });
  }
};
