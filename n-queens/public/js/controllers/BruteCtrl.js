angular.module('BruteCtrl', [])
    .controller('BruteController', ['$scope', 'Queens', function ($scope, Queens) {

        $scope.attemptsLimit = 100000;
        $scope.maxAttempts = 100;
        $scope.numQueens = 8;
        $scope.queensBoard = null; //Queens.randomBoard($scope.numQueens);

        $scope.regenerate = function (maxAttempts, num) {
            var i;
            var curBoard = $scope.queensBoard = Queens.randomBoard(num);
            var best = curBoard.best;
            for (i = 1; i < maxAttempts && curBoard.initialH !== 0; i++) {
                curBoard = Queens.randomBoard(num);
                best = Math.min(best, curBoard.best);
            }

            _.each(curBoard.queens, function (queen) {
                $scope.queensBoard.board[queen.col][queen.row].finalQueen = true;
            });

            $scope.queensBoard.finalH = curBoard.initialH;
            $scope.queensBoard.best = best;
            $scope.queensBoard.iterations = i;
            $scope.queensBoard.end = new Date();
        };

        // Initialize
        $scope.regenerate($scope.maxAttempts, $scope.numQueens);
    }]);
