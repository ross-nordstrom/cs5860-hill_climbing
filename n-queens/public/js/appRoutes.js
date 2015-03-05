angular.module('appRoutes', []).config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {

    $routeProvider

        // home page
        .when('/', {
            templateUrl: 'views/home.html',
            controller: 'MainController'
        })

        .when('/nerds', {
            templateUrl: 'views/basic.html',
            controller: 'BasicController'
        })

        .when('/geeks', {
            templateUrl: 'views/advanced.html',
            controller: 'AdvancedController'
        });

    $locationProvider.html5Mode(true);

}]);
