var app = angular.module('leaderboard', ['firebase', 'ui.router']);

app.config(function($stateProvider, $urlRouterProvider){
  $urlRouterProvider.otherwise('/');

  $stateProvider
    .state('main', {
      url: '/main',
      templateUrl: 'templates/main.html'
    })
    .state('admin', {
      url: '/admin',
      templateUrl: 'templates/admin.html'
    })
    .state('bidder', {
      url: '/bidder',
      templateUrl: 'templates/bidder.html'
    })
    .state('login', {
      url: '/',
      templateUrl: 'templates/userAuth.html'
    })

});

app.constant('FIREBASE_URI', 'https://horse-race.firebaseio.com/');

app.controller('MainCtrl', function(ContestantsService, $scope, $interval, $state) {
    $scope.userBet = {};
    var main = this;
    main.newContestant = {lane: '', name: '', score: ''};
    main.currentContestant = null;
    main.contestants = ContestantsService.getContestants();
    main.bidders = ContestantsService.getUsers();

    main.addContestant = function () {
        ContestantsService.addContestant(angular.copy(main.newContestant));
        main.newContestant = {lane: '', name: '', score: ''};
    };

    main.updateContestant = function (contestant) {
        ContestantsService.updateContestant(contestant);
    };

    main.removeContestant = function (contestant) {
        ContestantsService.removeContestant(contestant);
    };

    $scope.bet = function(amount, name){
      var user = {};
      user.name = $scope.name
      user.contestant = $scope.userBet.name;
      user.amount = $scope.userBet.amount;
      console.log(user);
      ContestantsService.addUser(user);
    };

    $scope.start = function(){
      var contestants = ContestantsService.getContestants();
      contestants.forEach(function(contestant){
         $interval(function(){
          contestant.score = parseFloat(contestant.score);
          contestant.score += Math.floor(Math.random() * 10);
          ContestantsService.updateContestant(contestant);
          }, 1000, 10);
      });
    };

    $scope.winner = function(){
      var winner = {score: 0};
      var contestants = ContestantsService.getContestants();
      var users = ContestantsService.getUsers();
      contestants.forEach(function(contestant){
        if(contestant.score > winner.score){
          winner = contestant;
        }
      });
      if(!winner.name){
        swal("Race has not begun", "Please start the race!", "error");
      }
      users.forEach(function(user){
        if(user.contestant === winner.name){
          var userBet = parseFloat(user.amount);
          userBet *= Math.floor(Math.random() * 10);
          user.winning = userBet;
          ContestantsService.updateUser(user);
          swal(user.name, "You won " + user.winning + "!", "success");
        }
      });
    };

    $scope.login = function(){
      var ref = new Firebase('https://horse-race.firebaseio.com/');
      ref.authWithOAuthPopup("google", function(error, authData) {
        if (error) {
          console.log("Login Failed!", error);
        } else {
          $scope.name = authData.google.displayName;
          $state.go('admin');
        };
      });
    };
});

app.service('ContestantsService', function ($firebaseArray, FIREBASE_URI) {
    var service = this;
    var ref = new Firebase(FIREBASE_URI);
    var contestants = $firebaseArray(ref.child('horses'));
    var users = $firebaseArray(ref.child('users'));

    service.getContestants = function () {
        return contestants;
    };

    service.addContestant = function (contestant) {
        contestants.$add(contestant);
    };

    service.updateContestant = function (contestant) {
        contestants.$save(contestant);
    };

    service.removeUser = function (user) {
        users.$remove(user);
    };
    service.getUsers = function () {
        return users;
    };

    service.addUser = function (user) {
        users.$add(user);
    };

    service.updateUser = function (user) {
        users.$save(user);
    };

});
