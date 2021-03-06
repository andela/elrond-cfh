/**
 * Module dependencies.
 */
const mongoose = require('mongoose');

const Game = mongoose.model('Game');

/**
 * Saves game when it ended
 */
exports.saveGameLog = (req, res) => {
  // save game if is an authenticated user else do nothing
  if (req.user && req.params.id) {
    const game = new Game(req.body);
    game.userID = req.user.id;
    game.gameID = req.params.id;
    game.save((err) => {
      if (err) return res.status(400).json('Error...game logs not saved');
      return res.status(200).json('game logs saved successfully');
    });
  }
};
exports.getUserGameLog = (req, res) => {
  if (req.user) {
    Game.find({ userID: req.user.id }, (error, allUserGames) => {
      if (error) {
        return res.status(500).json({ error });
      }
      return res.status(200).json(allUserGames);
    });
  }
};
exports.getAllGameLog = (req, res) => {
  if (req.user) {
    Game.find({ }, (error, allUserGames) => {
      if (error) {
        return res.status(500).json({ error });
      }
      return res.status(200).json(allUserGames);
    });
  }
};