/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  config = require('../../config/config'),
  Schema = mongoose.Schema;

/**
 * Answer Schema
 */
var GameSchema = new Schema({
  userID: String,
  gameID: String,
  gamePlayers: [],
  gameWinner: { type: String, default: '' }
});

mongoose.model('Game', GameSchema);
