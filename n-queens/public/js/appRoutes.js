angular.module('appRoutes', []).config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {

    $routeProvider

        .when('/', {
            templateUrl: 'views/climb.html',
            controller: 'ClimbController'
        })

        .when('/brute', {
            templateUrl: 'views/brute.html',
            controller: 'BruteController'
        })

    $locationProvider.html5Mode(false);

}]);
