}
};

// $scope.startGame = () => {
// // when user tries to start game without meeting minimum requirement
//   if (game.players.length < game.playerMinLimit) {
//     const myModal = $('#playerRequirement');
//     myModal.find('.modal-title')
//       .text('Player requirement');
//     myModal.find('.modal-body')
//       .text('Sorry! You require a minimum of three(3) players to play this game');
//     myModal.modal('show');
//   } else {
//     game.startGame();
//   }
// };

$scope.pointerCursorStyle = function() {
    if ($scope.isCzar() && $scope.game.state === 'waiting for czar to decide') {
        return { cursor: 'pointer' };
    }
    return {};
};

$scope.sendPickedCards = function() {
    game.pickCards($scope.pickedCards);
    $scope.showTable = true;
};

$scope.cardIsFirstSelected = function(card) {
    if (game.curQuestion.numAnswers > 1) {
        return card === $scope.pickedCards[0];
    }
    return false;
};

$scope.cardIsSecondSelected = function(card) {
    if (game.curQuestion.numAnswers > 1) {
        return card === $scope.pickedCards[1];
    }
    return false;
};

$scope.firstAnswer = function($index) {
    if ($index % 2 === 0 && game.curQuestion.numAnswers > 1) {
        return true;
    }
    return false;
};

$scope.secondAnswer = function($index) {
    if ($index % 2 === 1 && game.curQuestion.numAnswers > 1) {
        return true;
    }
    return false;
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
    }
    return '#f9f9f9';
};

$scope.pickWinning = function(winningSet) {
    if ($scope.isCzar()) {
        game.pickWinning(winningSet.card[0]);
        $scope.winningCardPicked = true;
    }
};

$scope.winnerPicked = function() {
    return game.winningCard !== -1;
};
$scope.startGame = function() {
    // when user tries to start game without meeting minimum requirement
    if (game.players.length < game.playerMinLimit) {
        $('.modal').modal();
        $('select').material_select();
    } else {
        game.startGame();
    }
};

$scope.invitePlayers = function() {
    $('.modal-invite').modal();
    $('select').material_select();
};

$scope.abandonGame = function() {
    game.leaveGame();
    $location.path('/');
};

$scope.shuffleCards = () => { // Shu
    const card = $(`#${event.target.id}`);
    card.addClass('animated flipOutY');
    setTimeout(() => {
        $scope.startNext();
        card.removeClass('animated flipOutY');
        $('#start-modal').modal('close');
    }, 750);
};

$scope.startNext = () => { // shuffle
    if ($scope.isCzar()) {
        game.startNext();
    }
};

// Catches changes to round to update when no players pick card
// (because game.state remains the same)
$scope.$watch('game.round', () => {
    $scope.hasPickedCards = false;
    $scope.showTable = false;
    $scope.winningCardPicked = false;
    $scope.makeAWishFact = makeAWishFacts.pop();
    if (!makeAWishFacts.length) {
        makeAWishFacts = MakeAWishFactsService.getMakeAWishFacts();
    }
    $scope.pickedCards = [];
});

newFunction();

$scope.$watch('game.gameID', () => {
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
                setTimeout(() => {
                    const link = document.URL;
                    const txt = 'Give the following link to your friends so they can join your game: ';
                    $('#lobby-how-to-play').text(txt);
                    $('#oh-el').css({ 'text-align': 'center', 'font-size': '22px', background: 'white', color: 'black' }).text(link);
                }, 200);
                $scope.modalShown = true;
            }
        }
    }
});

if ($location.search().game && !(/^\d+$/).test($location.search().game)) {
    console.log('joining custom game');
    game.joinGame('joinGame', $location.search().game);
} else if ($location.search().custom) {
    game.joinGame('joinGame', null, true);
} else {
    game.joinGame();
}

function newFunction() {
    // In case player doesn't pick a card in time, show the table
    $scope.$watch('game.state', () => {
        if (game.state === 'waiting for czar to decide' && $scope.showTable === false) {
            $scope.showTable = true;
        }
        if ($scope.isCzar() && game.state === 'czar pick card' && game.table.length === 0) {
            const myModal = $('.startModal');
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
}