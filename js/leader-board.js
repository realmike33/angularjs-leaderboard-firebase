var app = angular.module('leaderboard', ['firebase', 'ui.router']);

app.config(function($stateProvider, $urlRouterProvider){
  $urlRouterProvider.otherwise('/');

  $stateProvider
    .state('main', {
      url: '/',
      templateUrl: 'templates/main.html'
    })
    .state('admin', {
      url: '/admin',
      templateUrl: 'templates/admin.html'
    })
});

app.constant('FIREBASE_URI', 'https://horse-race.firebaseio.com/');

app.controller('MainCtrl', function(ContestantsService, $scope, $interval) {
    var main = this;
    main.newContestant = {lane: '', name: '', score: ''};
    main.currentContestant = null;
    main.contestants = ContestantsService.getContestants();

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

    main.incrementScore = function () {
        main.currentContestant.score = parseInt(main.currentContestant.score, 10) + 1;
        main.updateContestant(main.currentContestant);
    };

    main.decrementScore = function () {
        main.currentContestant.score = parseInt(main.currentContestant.score, 10) - 1;
        main.updateContestant(main.currentContestant);
    };

    $scope.start = function(){
      var contestants = ContestantsService.getContestants();
      contestants.forEach(function(contestant){
         $interval(function(){
          contestant.score = parseFloat(contestant.score);
          contestant.score += Math.floor(Math.random() * 10);

          }, 1000, 10);
      });
    };

    $scope.winner = function(){
      var winner = {score: 0};
      var contestants = ContestantsService.getContestants();
      contestants.forEach(function(contestant){
        if(contestant.score > winner.score){
          winner = contestant;
        }
      });
      swal(winner.name, "You won!", "success")

    };
});

app.service('ContestantsService', function ($firebaseArray, FIREBASE_URI) {
    var service = this;
    var ref = new Firebase(FIREBASE_URI);
    var contestants = $firebaseArray(ref);

    service.getContestants = function () {
        return contestants;
    };

    service.addContestant = function (contestant) {
        contestants.$add(contestant);
    };

    service.updateContestant = function (contestant) {
        contestants.$save(contestant);
    };

    service.removeContestant = function (contestant) {
        contestants.$remove(contestant);
    };
});
