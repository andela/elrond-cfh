angular.module('mean.system')
  .factory('dashboard', ['$http', ($http) => {
    const getGameLog = () => new Promise((resolve, reject) => {
      $http.get('/api/games/history', { headers: { authorization: window.localStorage.token } })
        .success((response) => {
          resolve(response);
        })
        .error((error) => {
          reject(error);
        });
    });
    const leaderGameLog = () => new Promise((resolve, reject) => {
      $http.get('/api/games/leaderboard', { headers: { authorization: window.localStorage.token } })
        .success((response) => {
          resolve(response);
        })
        .error((error) => {
          reject(error);
        });
    });
    const userDonations = () => new Promise((resolve, reject) => {
      $http.get('/api/donations', { headers: { authorization: window.localStorage.token } })
        .success((response) => {
          resolve(response);
        })
        .error((error) => {
          reject(error);
        });
    });
    return {
      getGameLog,
      leaderGameLog,
      userDonations
    };
  }]);