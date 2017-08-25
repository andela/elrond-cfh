angular.module('mean.system')
.factory('socket', ['$rootScope', function($rootScope){
  let socket = io.connect();
  return {
    on: function(eventName, callback){
      socket.on(eventName, function(){
        let args = arguments;
        $rootScope.safeApply(function(){
          callback.apply(socket, args);
        });
      });
    },
    emit: function(eventName, data, callback){
      socket.emit(eventName, data, function(){
        let args = arguments;
      });
      $rootScope.safeApply(function(){
        if(callback){
          callback.apply(socket, args);
        }
      });
    },
    removeAllListeners: function(eventName, callback){
      socket.removeAllListeners(eventName, function () {
        let args = arguments;
        $rootScope.safeApply(function() {
          if(callback) {
            callback.apply(socket, args);
          }
        });
      });
    }
  };
}]);