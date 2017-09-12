angular.module('mean.system')
  .controller('IndexController', ['$scope', '$window', 'Global', '$location', 'socket', 'game', 'AvatarService', 'Users',
    function ($scope, $window, Global, $location, socket, game, AvatarService, Users) {
      $scope.global = Global;
      $scope.playerRegion = 'Africa';
      $scope.gameType = 'guest';

      $scope.setGameType = function (gameType) {
        $scope.gameType = gameType;
      };

      $scope.setPlayerRegion = function () {
        const region = $scope.playerRegion;
        localStorage.setItem('region', region);
        if ($scope.gameType === 'guest') {
          $location.path('/app');
        }

        if ($scope.gameType === 'strangers') {
          location.href = '/play';
        }

        if ($scope.gameType === 'friends') {
          location.href = '/play?custom';
        }
      };

      $scope.showError = function () {
        if ($location.search().error) {
          return $location.search().error;
        } else {
          return false;
        }
      };

      $scope.avatars = [];
      AvatarService.getAvatars()
        .then(function(data) {
          $scope.avatars = data;
        });
      // handles auth
      function storeUserAndRedirect(data){
        window.localStorage.setItem('token', data.token);
        window.localStorage.setItem('email', data.email);
        window.localStorage.setItem('userId', data.id);
        window.localStorage.setItem('name', data.name);
        $location.path('/');
      }
      $scope.errStatus = false;
      $scope.signin = () => {
        Users.signin($scope.email, $scope.password)
          .then((response) => {
            $scope.signinErrorMsg = '';
            $scope.errStatus = false;
            storeUserAndRedirect(response);
          })
          .catch((err) => {
            $scope.signinErrorMsg = err.message;
            $scope.errStatus = true;
          });
      }
      $scope.signupErrStatus = false;
      $scope.signup = () => {
        Users.signup($scope.name, $scope.email, $scope.password)
          .then((response) => {
            $scope.signupErrMsg = '';
            $scope.signupErrStatus = false;
            storeUserAndRedirect(response);
          })
          .catch((err) => {
            $scope.signupErrMsg = err.message;
            $scope.signupErrStatus = true;
          });
      };
      $scope.logout = () => {
        window.localStorage.removeItem('token');
        window.localStorage.removeItem('email');
        window.localStorage.removeItem('userId');
        window.localStorage.removeItem('name');
        $scope.showOptions = true;
        $location.path('/');
      };
    }]);
