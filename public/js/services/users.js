angular.module('mean.system')
  .factory('Users', ['$http', '$window', ($http) => {
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


    return {
      signin,
      signup
    };
  }]);
