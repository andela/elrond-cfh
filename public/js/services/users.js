angular.module('mean.system')
  .factory('Users', ['$http', '$window', 'socket', ($http, $window, socket) => {
    const signup = (name, email, password) => new Promise((resolve, reject) => {
      const newuser = {
        name,
        email,
        password
      };
      $http.post('/api/user/signup', newuser)
        .success((response) => {
          resolve(response);
        })
        .error((error) => {
          reject(error);
        });
    });

    const signin = (email, password) => new Promise((resolve, reject) => {
      const user = {
        email,
        password
      };
      $http.post('/api/user/signin', user)
        .success((response) => {
          resolve(response);
        })
        .error((error) => {
          reject(error);
        });
    });

    const searchedUsers = (userName) => new Promise((resolve, reject) => {
      $http.get(`api/users/search?${userName}`)
        .then((response) => {
          const gameUsers = response.data;
          resolve(gameUsers);
        }, (error) => {
          reject(error);
        });
    });

    return {
      signin,
      signup,
      searchedUsers
    };
  }]);
