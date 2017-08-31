/**
 * Module dependencies.
 */
const mongoose = require('mongoose');

const Game = mongoose.model('Game');

/**
 * Find answer by id
 */
exports.saveGameLogs = (req, res) => {
  const game = new Game(req.body);
  game.save((err) => {
    if (err) return res.status(400).json('Error...game logs not saved');
    return res.status(200).json('game logs saved successfully');
  });
};
