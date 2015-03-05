angular.module('BasicCtrl', [])
    .controller('BasicController', ['$scope', 'Queens', function ($scope, Queens) {

        $scope.attemptsLimit = 100;
        $scope.numQueens = 8;
        $scope.queensBoard = null; //Queens.randomBoard($scope.numQueens);

        $scope.regenerate = function (num) {
            $scope.queensBoard = Queens.randomBoard(num);
        };

        // Initialize
        $scope.regenerate($scope.numQueens);
    }]);
