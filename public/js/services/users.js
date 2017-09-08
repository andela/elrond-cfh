angular.module('mean.system')
  .factory('Users', ['$http', '$window', ($http) => {
    const invitesSent = [];
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

    const searchedUsers = userName => new Promise((resolve, reject) => {
      $http.get(`api/users/search?name=${userName}`,
        { headers: { authorization: window.localStorage.token } })
        .then((response) => {
          const gameUsers = response.data;
          resolve(gameUsers);
        }, (error) => {
          reject(error);
        });
    });
    const sendInvites = email => new Promise((resolve, reject) => {
      const userEmail = email;
      const gameUrl = encodeURIComponent(window.location.href);
      const postData = {
        userEmail,
        gameUrl
      };
      $http.post('/api/users/sendInvites', postData,
        { headers: { authorization: window.localStorage.token } })
        .then((response) => {
          if (invitesSent.indexOf(response.data) <= -1) {
            invitesSent.push(response.data);
          }
          resolve({
            message: 'Invite has been sent',
            invitesSent });
        })
        .catch((error) => {
          reject({ message: 'Oops, Could not send Invite', error });
        });
    });

    return {
      signin,
      signup,
      searchedUsers,
      sendInvites,
      invitesSent
    };
  }]);
