const mongoose = require('mongoose');
const users = require('../app/controllers/users');
const authenticate = require('./middlewares/authentication');
const games = require('../app/controllers/games');
const answers = require('../app/controllers/answers');
const questions = require('../app/controllers/questions');
const index = require('../app/controllers/index');
const avatars = require('../app/controllers/avatars');

const Answer = mongoose.model('Answer');
const Question = mongoose.model('Question');

module.exports = (app, passport) => {
  // User Routes
  app.get('/signin', users.signin);
  app.get('/signup', users.signup);
  app.get('/chooseavatars', users.checkAvatar);
  app.get('/signout', users.signout);

  // Setting up the users api
  app.post('/users', users.create);
  app.post('/users/avatars', users.avatars);
  // ****************** JWT authentication *****************
  app.post('/api/user/signin', users.signinJWT);
  app.post('/api/user/signup', users.signupJWT);

  // Donation Routes
  app.post('/donations', authenticate, users.addDonation);
  app.get('/api/donations', authenticate, users.getDonations);

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
  app.get('/answers', answers.all);
  app.get('/answers/:answerId', answers.show);
  // Finish with setting up the answerId param
  app.param('answerId', answers.answer);

  // Question Routes
  app.get('/questions', questions.all);
  app.get('/questions/:questionId', questions.show);
  // Finish with setting up the questionId param
  app.param('questionId', questions.question);

  // Avatar Routes
  app.get('/avatars', avatars.allJSON);

  // Home route
  app.get('/play', index.play);
  app.get('/', index.render);

  // Search Routes
  app.get('/api/users/search', authenticate, users.searchedUsers);
  app.post('/api/users/sendInvites', authenticate, users.sendEmailInvite);
  // Game routes
  app.post('/api/games/:id/start', authenticate, games.saveGameLog);
  app.get('/api/games/history', authenticate, games.getUserGameLog);
  app.get('/api/games/leaderboard', authenticate, games.getAllGameLog);
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
  });
  // save answers routes
  app.post('/api/answer', (req, res) => {
    if (req.body.id && req.body.text) {
      const answer = new Answer();
      answer.id = req.body.id;
      answer.text = req.body.text;
      answer.official = true;
      answer.expansion = 'Base';
      answer.save((err) => {
        if (err) return res.status(400).json(err);
        return res.status(201).json(answer);
      });
    } else {
      return res.status(400).json('All fields are required');
    }
  });
};

