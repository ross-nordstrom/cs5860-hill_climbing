angular.module('appRoutes', []).config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {

    $routeProvider

        .when('/', {
            templateUrl: 'views/basic.html',
            controller: 'BasicController'
        })

        .when('/advanced', {
            templateUrl: 'views/advanced.html',
            controller: 'AdvancedController'
        });

    $locationProvider.html5Mode(true);

}]);
