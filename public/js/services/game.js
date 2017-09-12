angular.module('mean.system')
  .factory('game', ['socket', '$timeout', '$http', function (socket, $timeout, $http) {

    var game = {
      id: null, // This player's socket ID, so we know who this player is
      gameID: null,
      players: [],
      playerIndex: 0,
      winningCard: -1,
      winningCardPlayer: -1,
      gameWinner: -1,
      table: [],
      czar: null,
      playerMinLimit: 3,
      playerMaxLimit: 12,
      pointLimit: null,
      state: null,
      round: 0,
      time: 0,
      curQuestion: null,
      notification: null,
      timeLimits: {},
      joinOverride: false
    };

    var notificationQueue = [];
    var timeout = false;
    var self = this;
    var joinOverrideTimeout = 0;

    socket.on('player_limit_exceeded', function (data) {
     const myModal = $('#playerRequirement');
      myModal.find('.modal-title')
        .text('Player requirement');
      myModal.find('.modal-body')
        .text('Sorry! You are late, the room is filled up! \t Only 12 players' +
        ' allowed per room');
      myModal.modal('show');
      // console.log($location);
      // $location.$$path = '/';#!/
      // console.log('my modal', myModal);
      // console.log('my modal context', myModal.context);
      // if (!myModal.hasClass('in')) {
      // window.location.hash = '#!';
      // }
    });

    var addToNotificationQueue = function (msg) {
      notificationQueue.push(msg);
      if (!timeout) { // Start a cycle if there isn't one
        setNotification();
      }
    };
    var setNotification = function () {
      if (notificationQueue.length === 0) { // If notificationQueue is empty, stop
        clearInterval(timeout);
        timeout = false;
        game.notification = '';
      } else {
        game.notification = notificationQueue.shift(); // Show a notification and check again in a bit
        timeout = $timeout(setNotification, 1300);
      }
    };

    var timeSetViaUpdate = false;
    var decrementTime = function () {
      if (game.time > 0 && !timeSetViaUpdate) {
        game.time--;
      } else {
        timeSetViaUpdate = false;
      }
      $timeout(decrementTime, 950);
    };

    socket.on('id', function (data) {
      game.id = data.id;
    });

    socket.on('prepareGame', function (data) {
      game.playerMinLimit = data.playerMinLimit;
      game.playerMaxLimit = data.playerMaxLimit;
      game.pointLimit = data.pointLimit;
      game.timeLimits = data.timeLimits;
    });

    socket.on('gameUpdate', function (data) {

      // Update gameID field only if it changed.
      // That way, we don't trigger the $scope.$watch too often
      if (game.gameID !== data.gameID) {
        game.gameID = data.gameID;
      }

      game.joinOverride = false;
      clearTimeout(game.joinOverrideTimeout);

      var i;
      // Cache the index of the player in the players array
      for (i = 0; i < data.players.length; i++) {
        if (game.id === data.players[i].socketID) {
          game.playerIndex = i;
        }
      }

      var newState = (data.state !== game.state);

      //Handle updating game.time
      if (data.round !== game.round && data.state !== 'awaiting players' &&
        data.state !== 'game ended' && data.state !== 'game dissolved') {
        game.time = game.timeLimits.stateChoosing - 1;
        timeSetViaUpdate = true;
      } else if (newState && data.state === 'waiting for czar to decide') {
        game.time = game.timeLimits.stateJudging - 1;
        timeSetViaUpdate = true;
      } else if (newState && data.state === 'winner has been chosen') {
        game.time = game.timeLimits.stateResults - 1;
        timeSetViaUpdate = true;
      }

      // Set these properties on each update
      game.round = data.round;
      game.winningCard = data.winningCard;
      game.winningCardPlayer = data.winningCardPlayer;
      game.winnerAutopicked = data.winnerAutopicked;
      game.gameWinner = data.gameWinner;
      game.pointLimit = data.pointLimit;

      // Handle updating game.table
      if (data.table.length === 0) {
        game.table = [];
      } else {
        var added = _.difference(_.pluck(data.table, 'player'), _.pluck(game.table, 'player'));
        var removed = _.difference(_.pluck(game.table, 'player'), _.pluck(data.table, 'player'));
        for (i = 0; i < added.length; i++) {
          for (var j = 0; j < data.table.length; j++) {
            if (added[i] === data.table[j].player) {
              game.table.push(data.table[j], 1);
            }
          }
        }
        for (i = 0; i < removed.length; i++) {
          for (var k = 0; k < game.table.length; k++) {
            if (removed[i] === game.table[k].player) {
              game.table.splice(k, 1);
            }
          }
        }
      }

      if (game.state !== 'waiting for players to pick' || game.players.length !== data.players.length) {
        game.players = data.players;
      }

      if (newState || game.curQuestion !== data.curQuestion) {
        game.state = data.state;
      }

      if (data.state === 'czar pick card') {
        game.czar = data.czar
        if (game.czar === game.playerIndex) {
          addToNotificationQueue(
            `You are now a Czar,
            click black card to pop a new Question`
          );
        } else {
          addToNotificationQueue('Waiting dor Czar to pick card');
        }
      } else if (data.state === 'waiting for players to pick') {
        game.czar = data.czar;
        game.curQuestion = data.curQuestion;
        // Extending the underscore within the question
        game.curQuestion.text = data.curQuestion.text.replace(/_/g, '<u></u>');

        // Set notifications only when entering state
        if (newState) {
          if (game.czar === game.playerIndex) {
            addToNotificationQueue('You\'re the Card Czar! Please wait!');
          } else if (game.curQuestion.numAnswers === 1) {
            addToNotificationQueue('Select an answer!');
          } else {
            addToNotificationQueue('Select TWO answers!');
          }
        }
      } else if (data.state === 'waiting for czar to decide') {
        if (game.czar === game.playerIndex) {
          addToNotificationQueue("Everyone's done. Choose the winner!");
        } else {
          addToNotificationQueue("The czar is contemplating...");
        }
      } else if (data.state === 'winner has been chosen' &&
        game.curQuestion.text.indexOf('<u></u>') > -1) {
        game.curQuestion = data.curQuestion;
      } else if (data.state === 'awaiting players') {
        joinOverrideTimeout = $timeout(function () {
          game.joinOverride = true;
        }, 15000);
      } else if (data.state === 'game dissolved' || data.state === 'game ended') {
        game.players[game.playerIndex].hand = [];
        game.time = 0;
      }
    });

    socket.on('notification', function (data) {
      addToNotificationQueue(data.notification);
    });

    // Notify backend to save game logs When the game ended
    socket.on('saveGame', (data) => {
      if (game.state === 'game ended' && window.localStorage.token) {
        $http.post(`/api/games/${game.gameID}/start`, data, { headers: { authorization: window.localStorage.token } })
          .success((response) => {
            console.log(response);
          });
      }
    });
    game.joinGame = function (mode, room, createPrivate) {
      mode = mode || 'joinGame';
      room = room || '';
      createPrivate = createPrivate || false;
      var userID = !!window.user ? user._id : 'unauthenticated';
      socket.emit(mode, {userID: userID, room: room, createPrivate: createPrivate});
    };

    game.startGame = function () {
      socket.emit('startGame');
    };

    game.leaveGame = function () {
      game.players = [];
      game.time = 0;
      socket.emit('leaveGame');
    };

    game.pickCards = function (cards) {
      socket.emit('pickCards', {cards: cards});
    };

    game.pickWinning = function (card) {
      socket.emit('pickWinning', {card: card.id});
    };

    game.startNext = () => {
      socket.emit('czarCardSelected');
    };

    decrementTime();

    return game;
  }]);
