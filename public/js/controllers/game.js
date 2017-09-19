angular.module('mean.system')
    .controller('GameController', ['$scope', '$firebaseArray', 'game', '$timeout', '$location', 'MakeAWishFactsService', '$dialog', 'Users', 'dashboard',
        function GameController($scope, $firebaseArray, game, $timeout,
            $location, MakeAWishFactsService, $dialog, Users, dashboard) {
            $scope.hasPickedCards = false;
            $scope.winningCardPicked = false;
            $scope.showTable = false;
            $scope.$ = $;
            $scope.showInviteButton = false;
            $scope.game = game;
            $scope.gameChat = '';
            $scope.usersInvited = Users.usersInvited || [];
            $scope.sendInviteButton = true;
            $scope.pickedCards = [];
            $scope.foundUsers =[];
            $scope.notificationCount=1;
            var makeAWishFacts = MakeAWishFactsService.getMakeAWishFacts();
            $scope.makeAWishFact = makeAWishFacts.pop();
            if (window.localStorage.email !== undefined) {
                $scope.currentUserEmail = window.localStorage.email;
                $scope.showInviteButton = true;
            }
            $scope.pickCard = function(card) {
                if (!$scope.hasPickedCards) {
                    if ($scope.pickedCards.indexOf(card.id) < 0) {
                        $scope.pickedCards.push(card.id);
                        if (game.curQuestion.numAnswers === 1) {
                            $scope.sendPickedCards();
                            $scope.hasPickedCards = true;
                        } else if (game.curQuestion.numAnswers === 2 &&
                            $scope.pickedCards.length === 2) {
                            // delay and send
                            $scope.hasPickedCards = true;
                            $timeout($scope.sendPickedCards, 300);
                        }
                    } else {
                        $scope.pickedCards.pop();
                    }
                }
            };

            $scope.pointerCursorStyle = function() {
                if ($scope.isCzar() && $scope.game.state === 'waiting for czar to decide') {
                    return { 'cursor': 'pointer' };
                } else {
                    return {};
                }
            };

            $scope.$watch('game.gameID', () => {
                if (game.gameID !== null) {
                  const chatRef = new Firebase(`https://elrond-cfh.firebaseio.com/messages/${game.gameID}`);
                  $scope.gameChats = $firebaseArray(chatRef);
                  $scope.gameChats.$watch((event) => {
                    const insertedRecord = $scope.gameChats.$getRecord(event.key);
                    if (insertedRecord !== null) {
                      if (insertedRecord.postedBy !== game.players[game.playerIndex].username) {
                        $scope.notificationCount = 1;
                      }
                    }
                  });
                }
            });

            $(() => {
                $("#example1").emojioneArea({
                    autoHideFilters: true,
                    events: {
                    keyup: function (editor, event) {
                        if (event.which == 13) {
                        angular.element('#app-container').scope().addChat(this.getText());
                        this.setText('');
                        }
                    }
                    }
                    });
                $('.chat-header').on('click', () => {
                    $('.chat-body').slideToggle();
                    $('span.right').find('i').toggleClass('fa-caret-down fa-caret-up');
                });
            });

            $scope.addChat = (messageContent) => {
                const timestamp = (new Date()).toLocaleTimeString('en-US');
                if (game.gameID !== null) {
                  $scope.gameChats.$add({
                    postedOn: timestamp,
                    avatar: game.players[game.playerIndex].avatar,
                    message: messageContent,
                    postedBy: game.players[game.playerIndex].username
                  });
                  $scope.gameChat = '';
                }
              }

            $scope.sendPickedCards = function() {
                game.pickCards($scope.pickedCards);
                $scope.showTable = true;
            };

            $scope.cardIsFirstSelected = function(card) {
                if (game.curQuestion.numAnswers > 1) {
                    return card === $scope.pickedCards[0];
                } else {
                    return false;
                }
            };

            $scope.cardIsSecondSelected = function(card) {
                if (game.curQuestion.numAnswers > 1) {
                    return card === $scope.pickedCards[1];
                } else {
                    return false;
                }
            };

            $scope.firstAnswer = function($index) {
                if ($index % 2 === 0 && game.curQuestion.numAnswers > 1) {
                    return true;
                } else {
                    return false;
                }
            };

            $scope.secondAnswer = function($index) {
                if ($index % 2 === 1 && game.curQuestion.numAnswers > 1) {
                    return true;
                } else {
                    return false;
                }
            };

            $scope.showFirst = function(card) {
                return game.curQuestion.numAnswers > 1 && $scope.pickedCards[0] === card.id;
            };

            $scope.showSecond = function(card) {
                return game.curQuestion.numAnswers > 1 && $scope.pickedCards[1] === card.id;
            };

            $scope.isCzar = function() {
                return game.czar === game.playerIndex;
            };

            $scope.isPlayer = function($index) {
                return $index === game.playerIndex;
            };

            $scope.isCustomGame = function() {
                return !(/^\d+$/).test(game.gameID) && game.state === 'awaiting players';
            };

            $scope.isPremium = function($index) {
                return game.players[$index].premium;
            };

            $scope.currentCzar = function($index) {
                return $index === game.czar;
            };

            $scope.winningColor = function($index) {
                if (game.winningCardPlayer !== -1 && $index === game.winningCard) {
                    return $scope.colors[game.players[game.winningCardPlayer].color];
                } else {
                    return '#f9f9f9';
                }
            };

            $scope.pickWinning = function(winningSet) {
                if ($scope.isCzar()) {
                    game.pickWinning(winningSet.card[0]);
                    $scope.winningCardPicked = true;
                }
            };

            $scope.winnerPicked = function() {
                return game.winningCard !== -1;
            }

            $scope.startGame = () => {
                // check Player length
                const $ = $scope.$;
                if (game.players.length < game.playerMinLimit) {
                    $('.modal').modal();
                    console.log('Here, Hello');
                } else {
                    game.startGame();
                }
            };
            $scope.sendInvite = (email) => {
                Users.sendInvites(email).then((response) => {
                    Materialize.toast(`${response.message}`, 2000, 'green');
                    if($scope.usersInvited >=11){ 
                        $scope.sendInviteButton = false;
                        Materialize.toast('Sorry Maximum number of invites sent', 3000, 'blue');
                    }
                }).catch((error) => {
                    $scope.inviteMessage = error;
                });
            };


            $scope.searchedUsers = () => {
                const username = $scope.userName;
                if ($scope.userName === undefined) {
                    $scope.message = 'Please enter a name';
                } else {
                    Users.searchedUsers(username)
                        .then((foundUsers) => {
                            $scope.foundUsers = foundUsers;
                        });
                }
            };
            $scope.getFriends = () => {
                const userId = window.localStorage.userId;
                Users.getFriends(userId).then((friendsArray) => {
                    $scope.myFriends = friendsArray;
                    // console.log($scope.myFriends);
                });
            };
            $scope.addAsFriends = (email, name) => {
                const userId = window.localStorage.userId;
                Users.addFriend(email, userId, name).then((response) => {
                    const friendName = response.friendName;
                    Materialize.toast(`${friendName}, has been added to your friend's list`, 3000, 'blue')
                    // $scope.messages = `${friendName}, has been added to your friend's list`;
                $scope.getFriends();
                })
                    .catch((error) => {
                        $scope.messages = error;
                    });
            };

           $scope.sendFriendInvite = (email) => {
               $scope.usersInvited.push(email);
                const userId = window.localStorage.userId;
                const senderName = window.localStorage.name;
                const myEmail = window.localStorage.email;
                // console.log(email, userId, senderName,myEmail, 'This is the Controller');
                game.sendFriendInvite(email, userId, senderName,myEmail);
            }     
            

            // const handleNewRequests = () => {

            // }

            // game.getRequests(email, handleNewRequests);

            $scope.friendsModal = () => {
                const userId = window.localStorage.userId;
                $('.invite-friends').modal();
                Users.getFriends(userId)
                    .then((myFriends) => {
                        $scope.myFriends = myFriends;
                        // console.log($scope.myFriends);
                    })
                    .catch((error) => {
                        console.log(error, "in game file");
                    });
            }
            $scope.invitePlayers = () => {
                $('.modal-invite').modal();
                $scope.getFriends();
            };
            $scope.abandonGame = () => {
                game.leaveGame();
                $location.path('/');
            };

            $scope.shuffleCards = () => { // Shu
                const card = $(`#${event.target.id}`);
                card.addClass('animated flipOutY');
                setTimeout(() => {
                    $scope.startNext();
                    card.removeClass('animated flipOutY');
                    console.log('Hey!!!, Ar!!!!');
                    $('.startModal').modal('close');
                }, 750);
            };

            $scope.startNext = () => { // shuffle
                if ($scope.isCzar()) {
                    game.startNext();
                }
            };

            // Catches changes to round to update when no players pick card
            // (because game.state remains the same)
            $scope.$watch('game.round', function() {
                $scope.hasPickedCards = false;
                $scope.showTable = false;
                $scope.winningCardPicked = false;
                $scope.makeAWishFact = makeAWishFacts.pop();
                if (!makeAWishFacts.length) {
                    makeAWishFacts = MakeAWishFactsService.getMakeAWishFacts();
                }
                $scope.pickedCards = [];
            });

            // In case player doesn't pick a card in time, show the table
            $scope.$watch('game.state', () => { // game.state
                if (game.state === 'waiting for czar to decide' && $scope.showTable === false) {
                    $scope.showTable = true;
                }
                if ($scope.isCzar() && game.state === 'czar pick card' && game.table.length === 0) {
                    const myModal = $('.startModal');
                    console.log('I am the Modal');
                    myModal.modal('open');
                }
                if (game.state === 'game dissolved') {
                    $('.startModal').modal('close');
                }

                if ($scope.isCzar() === false && game.state === 'czar pick card' && game.state !== 'game dissolved' &&
                    game.state !== 'awaiting players' && game.table.length === 0) {
                    $scope.czarHasDrawn = 'Wait! Czar is drawing Card';
                }
                if (game.state !== 'czar pick card' && game.state !== 'awaiting players' &&
                    game.state !== 'game dissolve') {
                    $scope.czarHasDrawn = '';
                }
            });

            $scope.$watch('game.gameID', function() {
                if (game.gameID && game.state === 'awaiting players') {
                    if (!$scope.isCustomGame() && $location.search().game) {
                        // If the player didn't successfully enter the request room,
                        // reset the URL so they don't think they're in the requested room.
                        $location.search({});
                    } else if ($scope.isCustomGame() && !$location.search().game) {
                        // Once the game ID is set, update the URL if this is a game with friends,
                        // where the link is meant to be shared.
                        $location.search({ game: game.gameID });
                        if (!$scope.modalShown) {
                            setTimeout(function() {
                                var link = document.URL;
                                var txt = 'Give the following link to your friends so they can join your game: ';
                                $('#lobby-how-to-play').text(txt);
                                $('#oh-el').css({ 'text-align': 'center', 'font-size': '22px', 'background': 'white', 'color': 'black' }).text(link);
                            }, 200);
                            $scope.modalShown = true;
                        }
                    }
                }
            });

            if ($location.search().game && !(/^\d+$/).test($location.search().game)) {
                console.log('joining custom game');
                game.joinGame('joinGame', $location.search().game, localStorage.getItem('region'));
            } else if ($location.search().custom) {
                game.joinGame('joinGame', null, true, localStorage.getItem('region'));
            } else {
                game.joinGame(null, null, null, localStorage.getItem('region'));
            }
            $scope.gameTour = introJs();
            
                 $scope.gameTour.setOptions({
                    steps: [{
                      intro: 'Welcome to the game Cards for Humanity, You want to play this game?, then let me take you on a tour.'
                    },
                    {
                      element: '#timer-container',
                      intro: 'This is the timer for the game. Choose an answer to the current question. After time out, CZAR then select a favorite answer. whoever submits CZAR\'s favorite answer wins the round'
                    },
                    {
                      element: '#question-container-outer',
                      intro: 'Game needs a minimum of 3 players to start. Wait for the minimum number of players and start the game.',
                    },
                    {
                      element: '#info-container',
                      intro: 'These are the rules of the game',
                      position: 'top'
                    },
                    {
                      element: '#player-container',
                      intro: 'Players in the current game are shown here',
                    },
                    {
                      element: '#abandon-game-button',
                      intro: 'Played enough? Click this button to quit the game'
                    },
                    {
                        element: '#tweet',
                        intro: 'you can share your game on twitter'
                    },
                    {
                        element: '#dashboard',
                        intro: 'click here to see leaders in the game'
                    },
                    {
                      element: '#retake-tour',
                      intro: 'You can always take the tour again'
                    }
                    ]
                  });
            
            
                 $scope.takeTour = () => {
                    if (!localStorage.takenTour) {
                      const timeout = setTimeout(() => {
                        $scope.gameTour.start();
                        clearTimeout(timeout);
                      }, 500);
                      localStorage.setItem('takenTour', true); 
                    }
                  };
            
                 $scope.retakeTour = () => {
                    localStorage.removeItem('takenTour');
                    $scope.takeTour();
                  };
            // player game-log logic
            $scope.islogin = false;
            if (window.localStorage.token || window.user) {
              $scope.islogin = true;
              dashboard.getGameLog()
                .then((response) => {
                  const dateOptions = {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  };
                  $scope.gameHistories = response.map((res) => {
                    const date = new Date(res.createdAt).toLocaleString('en-us', dateOptions);
                    res.createdAt = date;
                    return res;
                  });
                });
              // application leaderboard logic
              dashboard.leaderGameLog()
                .then((gameLogs) => {
                  const leaderboard = [];
                  const players = {};
                  gameLogs.forEach((gameLog) => {
                    const numOfWins = players[gameLog.gameWinner];
                    if (numOfWins) {
                      players[gameLog.gameWinner] += 1;
                    } else {
                      players[gameLog.gameWinner] = 1;
                    }
                  });
                  Object.keys(players).forEach((key) => {
                    leaderboard.push({ username: key, numberOfWins: players[key] });
                  });
                  $scope.leaderboard = leaderboard;
                });
              // user donations logic
              dashboard.userDonations()
                .then((userDonations) => {
                  $scope.userDonations = userDonations.donations;
                });
            $scope.friendInvites = game.friendInvites
            // console.log($scope.friendInvites);
            }
          // logout to be used by the player dashboard if logged in
            $scope.logout = () => {
                window.user = null;
                window.localStorage.removeItem('token');
                window.localStorage.removeItem('email');
                window.localStorage.removeItem('userId');
                window.localStorage.removeItem('name');
                $scope.showOptions = true;
                $location.path('/');
            };
            
        }
    ]);