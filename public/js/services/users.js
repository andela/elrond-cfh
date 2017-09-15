angular.module('mean.system')
  .factory('Users', ['$http', '$window', ($http) => {
    const usersInvited = [];
    const friendsAdded = [];
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
          if (usersInvited.indexOf(response.data) <= -1) {
            usersInvited.push(response.data);
          }
          const message = `${response.data} Invite sent`;
          resolve({
            message,
            usersInvited
          });
        }, (error) => {
          reject('Oops, Could not send Invite', error);
        });
    });
    const addFriend = (email, userId) => new Promise((resolve, reject) => {
      const postData = {
        friendsEmail: email,
        userId,
      };
      // console.log(postData);
      $http.post('/api/users/addFriend', postData, 
      { headers: { authorization: window.localStorage.token } })
        .then((response) => {
          if (friendsAdded.indexOf(response.data) <= -1) {
            friendsAdded.push(response.data);
          }
          const msg = `${response.data} has recently been added to friends list`;
          const friendName = response.data;
          resolve({
            msg,
            friendName
          });
        }, (error) => {
          reject(error);
        });
    });

    const getFriends = userId => new Promise((resolve, reject) => {
      const postData = {
        userId,
      };
      $http.post('/api/users/getFriends', postData, 
      { headers: { authorization: window.localStorage.token } })
        .then((response) => {
          resolve(response.data);
          console.log(response.data);
        }, (error) => {
          reject(error);
        });
    });

    return {
      signin,
      signup,
      searchedUsers,
      sendInvites,
      usersInvited,
      addFriend,
      friendsAdded,
      getFriends
    };
  }]);

