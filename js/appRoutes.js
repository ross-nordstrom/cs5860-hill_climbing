angular.module('appRoutes', []).config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {

    $routeProvider

        .when('/', {
            templateUrl: 'cs5860-hill_climbing/views/basic.html',
            controller: 'BasicController'
        })

        .when('/brute', {
            templateUrl: 'cs5860-hill_climbing/views/brute.html',
            controller: 'BruteController'
        })

        .when('/advanced', {
            templateUrl: 'cs5860-hill_climbing/views/advanced.html',
            controller: 'AdvancedController'
        });

    $locationProvider.html5Mode(false);

}]);
