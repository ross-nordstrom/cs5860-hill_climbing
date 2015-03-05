angular.module('BasicCtrl', [])
    .controller('BasicController', ['$scope', 'Queens', function ($scope, Queens) {

        $scope.attemptsLimit = 1;
        $scope.maxAttempts = 0;
        $scope.attemptsDisabled = true;
        $scope.numQueens = 8;
        $scope.queensBoard = null; //Queens.randomBoard($scope.numQueens);

        $scope.regenerate = function (maxAttempts, num) {
            $scope.queensBoard = Queens.randomBoard(num);
        };

        // Initialize
        $scope.regenerate($scope.maxAttempts, $scope.numQueens);
    }]);
