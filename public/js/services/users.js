angular.module('mean.system')
  .factory('Users', ['$http', '$window', 'socekt', ($http, $window, socket) => {
    const signup = (name, email, password) => new Promise((resolve, reject) => {
      const newuser = {
        name,
        email,
        password
      };
      $http.post('/api/user/signup', newuser)
        .then((response) => {
          resolve(response);
        })
        .catch((error) => {
          reject(error);
        });
    });

    const signin = (email, password) => new Promise((resolve, reject) => {
      const user = {
        email,
        password
      };
      $http.post('/api/user/signin', user)
        .then((response) => {
          resolve(response);
        })
        .catch((error) => {
          reject(error);
        });
    });
    return {
      signin,
      signup
    };
  }]);
