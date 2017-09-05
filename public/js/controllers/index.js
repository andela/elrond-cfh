angular.module('mean.system')
  .controller('IndexController', ['$scope', 'Global', '$location', 'socket', 'game', 'AvatarService', function ($scope, Global, $location, socket, game, AvatarService) {
    $scope.global = Global;

    $scope.playAsGuest = function () {
      game.joinGame();
      $location.path('/app');
    };

    $scope.showError = function () {
      if ($location.search().error) {
        return $location.search().error;
      }
      return false;
    };

    $scope.requestGameLocale = function () {
      $.sweetModal({
        title: 'HTML Content',
        content: '<div><select><option>Africa</option><option>Europe</option></select>'
      });
      $('select').material_select();
    }

    $scope.avatars = [];
    AvatarService.getAvatars()
      .then((data) => {
        $scope.avatars = data;
      });
  }]);
