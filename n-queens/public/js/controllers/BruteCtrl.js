angular.module('BruteCtrl', [])
    .controller('BruteController', ['$scope', '$timeout', 'Queens', function ($scope, $timeout, Queens) {

        $scope.attemptsLimit = 100000;
        $scope.maxAttempts = 100;
        $scope.numQueens = 8;
        $scope.queensBoard = null; //Queens.randomBoard($scope.numQueens);

        $scope.regenerate = function (maxAttempts, num) {
            var i;
            var curBoard = $scope.queensBoard = Queens.randomBoard(num);
            var bestBoard = curBoard;
            var best = curBoard.best;

            $scope.loading = true;

            $timeout(function () {

                for (i = 1; i < maxAttempts && curBoard.h !== 0; i++) {
                    curBoard = Queens.randomBoard(num);
                    best = Math.min(best, curBoard.best);
                    if (best === curBoard.best) {
                        bestBoard = curBoard;
                    }
                }

                $scope.queensBoard = Queens.mergeBoards(Queens.storeBoard($scope.queensBoard), bestBoard);
                $scope.queensBoard.board = Queens.transpose($scope.queensBoard.board);

                $scope.queensBoard.h = bestBoard.h;
                $scope.queensBoard.best = best;
                $scope.queensBoard.iterations = i;
                $scope.queensBoard.end = new Date();

                $scope.loading = false;
            });
        };

        // Initialize
        $scope.regenerate($scope.maxAttempts, $scope.numQueens);
    }]);
