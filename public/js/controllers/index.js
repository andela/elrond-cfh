angular.module('mean.system')
  .controller('IndexController', ['$scope', '$window', 'Global', '$location', 'socket', 'game', 'AvatarService', 'Users',
    function ($scope, $window, Global, $location, socket, game, AvatarService, Users) {
      $scope.global = Global;
      $scope.playerRegion = 'Africa';
      $scope.gameType = 'guest';

      $scope.regions = ['Africa', 'Europe'];
      $scope.playAsGuest = function () {
        game.joinGame();
        console.log('run');
        
        if ($scope.gameType === 'guest') {
          console.log('guest run');
          $location.path('/app');
        }

        if ($scope.gameType === 'strangers') {
          console.log('strangers run');
          location.href = '/play';
        }

        if ($scope.gameType === 'friends') {
          console.log('friends run');
          location.href = '/play?custom';
        }
      };

      $scope.setGameType = function (gameType) {
        $scope.gameType = gameType;
        console.log('Scope Type: ', $scope.gameType);
      };

      $scope.setPlayerRegion = function () {
        const region = $scope.playerRegion;
        localStorage.setItem('region', region);
        console.log('Player region set to ', region);
        if ($scope.gameType === 'guest') {
          console.log('guest run');
          $location.path('/app');
        }

        if ($scope.gameType === 'strangers') {
          console.log('strangers run');
          location.href = '/play';
        }

        if ($scope.gameType === 'friends') {
          console.log('friends run');
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
