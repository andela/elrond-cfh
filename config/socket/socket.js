
var Game = require('./game');
var Player = require('./player');
require("console-stamp")(console, "m/dd HH:MM:ss");
var mongoose = require('mongoose');
var User = mongoose.model('User');

var avatars = require(__dirname + '/../../app/controllers/avatars.js').all();
// Valid characters to use to generate random private game IDs
var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";

module.exports = function(io) {

  let game;
  var allGames = {};
  var allPlayers = {};
  var gamesNeedingPlayers = [];
  var gameID = 0;

  io.sockets.on('connection', function (socket) {
    console.log(socket.id +  ' Connected');
    socket.emit('id', {id: socket.id});

    socket.on('pickCards', function(data) {
      console.log(socket.id,"picked",data);
      if (allGames[socket.gameID]) {
        allGames[socket.gameID].pickCards(data.cards,socket.id);
      } else {
        console.log('Received pickCard from',socket.id, 'but game does not appear to exist!');
      }
    });

    socket.on('pickWinning', function(data) {
      if (allGames[socket.gameID]) {
        allGames[socket.gameID].pickWinning(data.card,socket.id);
      } else {
        console.log('Received pickWinning from',socket.id, 'but game does not appear to exist!');
      }
    });

    socket.on('joinGame', function(data) {
      if (!allPlayers[socket.id]) {
        joinGame(socket,data);
      }
    });

    socket.on('czarCardSelected', () => {
     allGames[socket.gameID].startNext(allGames[socket.gameID]);
   });

    socket.on('joinNewGame', function(data) {
      exitGame(socket);
      joinGame(socket,data);
    });

    // Listener for Send Friend Invite on Server side
    socket.on('friendInviteSent', (payload) => {
      const { email, userId, senderName, inviteUrl,myEmail } = payload;
      // console.log(payload, 'this is a test');
      User.findOneAndUpdate({
        email: email
      }, {
          $push: {
            notifications: { senderName, inviteUrl }
          }
        },
        {
          safe: true,
          upsert: true
        }, (error) => {
          if (error) {
            console.log(error);
            res.status(500)
              .json('There was an error adding friends to friends list');
          }
            // console.log(`newNotification`, { senderName, inviteUrl })
        })
      socket.broadcast.emit(`newNotification${email}`, { senderName, inviteUrl })

    });


    socket.on('startGame', function() {
      if (allGames[socket.gameID]) {
        var thisGame = allGames[socket.gameID];
        console.log('comparing',thisGame.players[0].socket.id,'with',socket.id);
        if (thisGame.players.length >= thisGame.playerMinLimit) {
          // Remove this game from gamesNeedingPlayers so new players can't join it.
          gamesNeedingPlayers.forEach(function(game,index) {
            if (game.gameID === socket.gameID) {
              return gamesNeedingPlayers.splice(index,1);
            }
          });
          thisGame.prepareGame();
          thisGame.sendNotification('The game has begun!');
        }
      }
    });

    socket.on('leaveGame', function() {
      exitGame(socket);
    });

    socket.on('disconnect', function(){
      console.log('Rooms on Disconnect ', io.sockets.manager.rooms);
      exitGame(socket);
    });
  });

  var joinGame = function(socket,data) {
    console.log('data region', data.region);
    var player = new Player(socket);
    data = data || {};
    player.userID = data.userID || 'unauthenticated';
    if (data.userID !== 'unauthenticated') {
      User.findOne({
        _id: data.userID
      }).exec(function(err, user) {
        if (err) {
          console.log('err',err);
          return err; // Hopefully this never happens.
        }
        if (!user) {
          // If the user's ID isn't found (rare)
          player.username = 'Guest';
          player.avatar = avatars[Math.floor(Math.random()*4)+12];
          player.region = data.region;
        } else {
          player.username = user.name;
          player.premium = user.premium || 0;
          player.avatar = user.avatar || avatars[Math.floor(Math.random()*4)+12];
          player.region = data.region;
        }
        getGame(player,socket,data.room,data.createPrivate);
      });
    } else {
      // If the user isn't authenticated (guest)
      player.username = 'Guest';
      player.avatar = avatars[Math.floor(Math.random()*4)+12];
      player.region = data.region;
      getGame(player,socket,data.room,data.createPrivate);
    }
  };

  var getGame = function(player,socket,requestedGameId,createPrivate) {
    requestedGameId = requestedGameId || '';
    createPrivate = createPrivate || false;
    console.log(socket.id,'is requesting room',requestedGameId);
    if (requestedGameId.length && allGames[requestedGameId]) {
      console.log('Room',requestedGameId,'is valid');
      let game = allGames[requestedGameId];
      // Ensure that the same socket doesn't try to join the same game
      // This can happen because we rewrite the browser's URL to reflect
      // the new game ID, causing the view to reload.
      // Also checking the number of players, so node doesn't crash when
      // no one is in this custom room.
      if (game.state === 'awaiting players' && (!game.players.length ||
        game.players[0].socket.id !== socket.id)) {
        // Put player into the requested game
        console.log('Allowing player to join',requestedGameId);
        allPlayers[socket.id] = true;
        game.players.push(player);
        socket.join(game.gameID);
        socket.gameID = game.gameID;
        game.assignPlayerColors();
        game.assignGuestNames();
        game.sendUpdate();
        game.sendNotification(player.username+' has joined the game!');
        if (game.players.length >= game.playerMaxLimit) {
          gamesNeedingPlayers.shift();
          game.prepareGame();
        }
      } else {
        // TODO: Send an error message back to this user saying the game has already started
      }
    } else {
      // Put players into the general queue
      console.log('Redirecting player',socket.id,'to general queue');
      if (createPrivate) {
        createGameWithFriends(player,socket);
      } else {
        fireGame(player,socket);
      }
    }

  };

  const fireGame = (player, socket, createNew = false) => {
    var game;
    if (gamesNeedingPlayers.length <= 0 || createNew) {
      gameID += 1;
      const gameIDStr = gameID.toString();
      game = new Game(gameIDStr, io);
      allPlayers[socket.id] = true;
      game.players.push(player);
      allGames[gameID] = game;
      gamesNeedingPlayers.push(game);
      // game.setRegion(player.region);
      game.region = player.region;
      console.log('game region here', game.region);
      socket.join(game.gameID);
      socket.gameID = game.gameID;
      console.log(socket.id, 'has joined newly created game', game.gameID);
      game.assignPlayerColors();
      game.assignGuestNames();
      game.sendUpdate();
    } else {
      game = gamesNeedingPlayers[0];
      console.log('player region', player.region);
      console.log('game region', game.region);
      if (game.region !== player.region) {
        if (gamesNeedingPlayers.length > 1) {
          game = gamesNeedingPlayers[1];
        } else {
          fireGame(player, socket, true);
          return;
        }
      }
      allPlayers[socket.id] = true;
      game.players.push(player);
      console.log(socket.id, 'has joined game', game.gameID);
      socket.join(game.gameID);
      socket.gameID = game.gameID;
      game.assignPlayerColors();
      game.assignGuestNames();
      game.sendUpdate();
      game.sendNotification(`${player.username} has joined the game!`);
      if (game.players.length >= game.playerMaxLimit) {
        gamesNeedingPlayers.shift();
        game.prepareGame();
      }
    }
  };

  var createGameWithFriends = function(player,socket) {
    var isUniqueRoom = false;
    var uniqueRoom = '';
    // Generate a random 6-character game ID
    while (!isUniqueRoom) {
      uniqueRoom = '';
      for (var i = 0; i < 6; i++) {
        uniqueRoom += chars[Math.floor(Math.random()*chars.length)];
      }
      if (!allGames[uniqueRoom] && !(/^\d+$/).test(uniqueRoom)) {
        isUniqueRoom = true;
      }
    }
    console.log(socket.id,'has created unique game',uniqueRoom);
    let game = new Game(uniqueRoom,io);
    allPlayers[socket.id] = true;
    game.players.push(player);
    allGames[uniqueRoom] = game;
    socket.join(game.gameID);
    socket.gameID = game.gameID;
    game.assignPlayerColors();
    game.assignGuestNames();
    game.sendUpdate();
  };

  var exitGame = function(socket) {
    console.log(socket.id,'has disconnected');
    if (allGames[socket.gameID]) { // Make sure game exists
      let game = allGames[socket.gameID];
      console.log(socket.id,'has left game',game.gameID);
      delete allPlayers[socket.id];
      if (game.state === 'awaiting players' ||
        game.players.length-1 >= game.playerMinLimit) {
        game.removePlayer(socket.id);
      } else {
        game.stateDissolveGame();
        for (var j = 0; j < game.players.length; j++) {
          game.players[j].socket.leave(socket.gameID);
        }
        game.killGame();
        delete allGames[socket.gameID];
      }
    }
    socket.leave(socket.gameID);
  };
};
