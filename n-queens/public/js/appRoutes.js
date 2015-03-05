angular.module('appRoutes', []).config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {

    $routeProvider

        .when('/', {
            templateUrl: 'views/basic.html',
            controller: 'BasicController'
        })

        .when('/brute', {
            templateUrl: 'views/brute.html',
            controller: 'BruteController'
        })

        .when('/advanced', {
            templateUrl: 'views/advanced.html',
            controller: 'AdvancedController'
        });

    $locationProvider.html5Mode(true);

}]);
