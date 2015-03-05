angular.module('BruteCtrl', [])
    .controller('BruteController', ['$scope', 'Queens', function ($scope, Queens) {

        $scope.attemptsLimit = 100000;
        $scope.maxAttempts = 100;
        $scope.numQueens = 8;
        $scope.queensBoard = null; //Queens.randomBoard($scope.numQueens);

        $scope.regenerate = function (maxAttempts, num) {
            var i;
            var curBoard = $scope.queensBoard = Queens.randomBoard(num);
            var bestBoard = curBoard;
            var best = curBoard.best;
            for (i = 1; i < maxAttempts && curBoard.h !== 0; i++) {
                curBoard = Queens.randomBoard(num);
                best = Math.min(best, curBoard.best);
                if (best === curBoard.best) {
                    bestBoard = curBoard;
                }
            }

            $scope.queensBoard = Queens.storeBoard($scope.queensBoard);
            _.each(bestBoard.queens, function (queen) {
                $scope.queensBoard.board[queen.row][queen.col].queen = true;
            });

            $scope.queensBoard.h = bestBoard.h;
            $scope.queensBoard.best = best;
            $scope.queensBoard.iterations = i;
            $scope.queensBoard.end = new Date();
        };

        // Initialize
        $scope.regenerate($scope.maxAttempts, $scope.numQueens);
    }]);
