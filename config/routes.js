const users = require('../app/controllers/users');
var async = require('async');
var mongoose = require('mongoose');
var Answer = mongoose.model('Answer');
var Question = mongoose.model('Question');
var authentication = require('./middlewares/authentication');
module.exports = function(app, passport, auth) {
  // User Routes
  app.get('/signin', users.signin);
  app.get('/signup', users.signup);
  app.get('/chooseavatars', users.checkAvatar);
  app.get('/signout', users.signout);

  // Setting up the users api
  app.post('/users', users.create);
  app.post('/users/avatars', users.avatars);
  // ****************** JWT Signup *****************
  app.post('/api/user/signin', users.signinJWT);
  app.post('/api/user/signup', users.signupJWT);

  // Donation Routes
  app.post('/donations', users.addDonation);

  app.post('/users/session', passport.authenticate('local', {
    failureRedirect: '/signin',
    failureFlash: 'Invalid email or password.'
  }), users.session);

  app.get('/users/me', users.me);
  app.get('/users/:userId', users.show);

  // Setting the facebook oauth routes
  app.get('/auth/facebook', passport.authenticate('facebook', {
    scope: ['email'],
    failureRedirect: '/signin'
  }), users.signin);

  app.get('/auth/facebook/callback', passport.authenticate('facebook', {
    failureRedirect: '/signin'
  }), users.authCallback);

  // Setting the github oauth routes
  app.get('/auth/github', passport.authenticate('github', {
    failureRedirect: '/signin'
  }), users.signin);

  app.get('/auth/github/callback', passport.authenticate('github', {
    failureRedirect: '/signin'
  }), users.authCallback);

  // Setting the twitter oauth routes
  app.get('/auth/twitter', passport.authenticate('twitter', {
    failureRedirect: '/signin'
  }), users.signin);

  app.get('/auth/twitter/callback', passport.authenticate('twitter', {
    failureRedirect: '/signin'
  }), users.authCallback);

  // Setting the google oauth routes
  app.get('/auth/google', passport.authenticate('google', {
    failureRedirect: '/signin',
    scope: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email'
    ]
  }), users.signin);

  app.get('/auth/google/callback', passport.authenticate('google', {
    failureRedirect: '/signin'
  }), users.authCallback);

  // Finish with setting up the userId param
  app.param('userId', users.user);

  // Answer Routes
  const answers = require('../app/controllers/answers');
  app.get('/answers', answers.all);
  app.get('/answers/:answerId', answers.show);
  // Finish with setting up the answerId param
  app.param('answerId', answers.answer);

  // Question Routes
  const questions = require('../app/controllers/questions');
  app.get('/questions', questions.all);
  app.get('/questions/:questionId', questions.show);
  // Finish with setting up the questionId param
  app.param('questionId', questions.question);

  // Avatar Routes
  const avatars = require('../app/controllers/avatars');
  app.get('/avatars', avatars.allJSON);

  // Home route
  const index = require('../app/controllers/index');
  app.get('/play', index.play);
  app.get('/', index.render);

  // Game routes
  const games = require('../app/controllers/games');
  app.get('/api/games/:id/start', games.saveGameLogs);
  // save questions routes
  app.post('/api/question', (req, res) => {
    if (req.body.id && req.body.text && req.body.numAnswers) {
      const question = new Question();
      question.id = req.body.id;
      question.text = req.body.text;
      question.numAnswers = req.body.numAnswers;
      question.official = 'true';
      question.expansion = 'Base';
      question.region = req.body.region;
      question.save((err) => {
        if (err) return res.status(400).json(err);
        return res.status(201).json(question);
      });
    } else {
      return res.status(400).json('All fields are required');
    }
  })
  // save answers routes
  app.post('/api/answer', (req, res) => {
    if (req.body.id && req.body.text) {
      const answer = new Answer();
      answer.id = req.body.id;
      answer.text = req.body.text;
      answer.official = true;
      answer.expansion = 'Base'
      answer.save((err) => {
        if (err) return res.status(400).json(err);
        return res.status(201).json(answer);
      });
    } else {
      return res.status(400).json('All fields are required');
    }
  });
};
