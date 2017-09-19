angular.module('mean.directives', [])
  .directive('player', function (){
    return{
      restrict: 'EA',
      templateUrl: '/views/player.html',
      link: function(scope, elem, attr){
        scope.colors = ['#735CDD', '#4a148c ', '#FC575E', '#880e4f', '#398EC4', '#00838f','#006064',"#c51162",'#6200ea','#795548','#37474f','#1b5e20'];
      }
    };
  }).directive('answers', function() {
    return {
      restrict: 'EA',
      templateUrl: '/views/answers.html',
      link: function(scope, elem, attr) {

        scope.$watch('game.state', function() {
          if (scope.game.state === 'winner has been chosen') {
            var curQ = scope.game.curQuestion;
            var curQuestionArr = curQ.text.split('_');
            var startStyle = "<br/></br><center><span style='color: "+scope.colors[scope.game.players[scope.game.winningCardPlayer].color]+"'>answer is ";
            var endStyle = "</span></center>";
            var shouldRemoveQuestionPunctuation = false;
            var removePunctuation = function(cardIndex) {
              var cardText = scope.game.table[scope.game.winningCard].card[cardIndex].text;
              if (cardText.indexOf('.',cardText.length-2) === cardText.length-1) {
                cardText = cardText.slice(0,cardText.length-1);
              } else if ((cardText.indexOf('!',cardText.length-2) === cardText.length-1 ||
                cardText.indexOf('?',cardText.length-2) === cardText.length-1) &&
                cardIndex === curQ.numAnswers-1) {
                shouldRemoveQuestionPunctuation = true;
              }
              return cardText;
            };
            if (curQuestionArr.length > 1) {
              var cardText = removePunctuation(0);
              curQuestionArr.splice(1,0,startStyle+cardText+endStyle);
              if (curQ.numAnswers === 2) {
                cardText = removePunctuation(1);
                curQuestionArr.splice(3,0,startStyle+cardText+endStyle);
              }
              curQ.text = curQuestionArr.join("");
              // Clean up the last punctuation mark in the question if there already is one in the answer
              if (shouldRemoveQuestionPunctuation) {
                if (curQ.text.indexOf('.',curQ.text.length-2) === curQ.text.length-1) {
                  curQ.text = curQ.text.slice(0,curQ.text.length-2);
                }
              }
            } else {
              curQ.text += ' '+startStyle+scope.game.table[scope.game.winningCard].card[0].text+endStyle;
            }
          }
        });
      }
    };
  }).directive('question', function() {
    return {
      restrict: 'EA',
      templateUrl: '/views/question.html',
      link: function(scope, elem, attr) {}
    };
  })
  .directive('timer', function(){
    return{
      restrict: 'EA',
      templateUrl: '/views/timer.html',
      link: function(scope, elem, attr){}
    };
  }).directive('landing', function() {
    return {
      restrict: 'EA',
      link: function(scope, elem, attr) {

        scope.showOptions = true;
        if (window.localStorage.token || window.user) {
          scope.showOptions = false;
        }  else {
          scope.showOptions = true;
        }

        // if (scope.$$childHead.global.authenticated === true) {
        //   scope.showOptions = false;
        // }
      }
    }
  })