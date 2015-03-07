angular.module('BruteCtrl', [])
    .controller('BruteController', ['$scope', '$timeout', 'Queens', function ($scope, $timeout, Queens) {

        var NUMBER_OF_BEST_TO_KEEP = 5;

        $scope.title = "Brute Force via Random Search";
        $scope.description = "Select a number of max search attempts and a number of queens in the upper right," +
        "then select 'Generate' to start the search. You can see how long it took and what the best result was at" +
        "the bottom of the panel. White queens show the starting positions, while black queens show the best result.\n" +
        "The Activity Log will show you when each of the top results were found.";

        $scope.attemptsLimit = 100000;
        $scope.maxAttempts = 100;
        $scope.numQueens = 8;
        $scope.queensBoard = null; //Queens.randomBoard($scope.numQueens);

        $scope.regenerate = function (maxAttempts, num) {
            var i;
            var curBoard = Queens.randomBoard(num);
            var initialBoard = curBoard;
            curBoard.iterations = 0;
            var bestBoards = [curBoard];
            $scope.activityLog = [];

            $scope.loading = true;

            $timeout(function () {

                for (i = 1; i < maxAttempts && curBoard.h !== 0; i++) {
                    curBoard = Queens.randomBoard(num);
                    if (curBoard.h < bestBoards[bestBoards.length - 1].h || bestBoards.length < NUMBER_OF_BEST_TO_KEEP) {
                        curBoard.iterations = i;
                        var targetIndex = _.sortedIndex(bestBoards, curBoard, function (b) {
                            // Sorted insert by lowest h
                            return b.h;
                        });
                        if (targetIndex < NUMBER_OF_BEST_TO_KEEP) {
                            bestBoards.splice(targetIndex, 0, curBoard);
                            if (bestBoards.length > NUMBER_OF_BEST_TO_KEEP) {
                                bestBoards.splice(NUMBER_OF_BEST_TO_KEEP);
                            }
                        }
                    }
                }

                $scope.queensBoard = Queens.mergeBoards(Queens.storeBoard(initialBoard), bestBoards[0]);
                $scope.queensBoard.board = Queens.transpose($scope.queensBoard.board);

                $scope.queensBoard.iterations = i;
                $scope.queensBoard.end = new Date();

                $scope.activityLog = _.flatten([
                    [moment($scope.queensBoard.start).format('HH:mm:ss.SSS'), '-', 'Start up to', $scope.maxAttempts, 'attempts via random board generation'].join(' '),
                    ['Top', NUMBER_OF_BEST_TO_KEEP, 'best boards:'].join(' '),
                    _.map(_.sortBy(bestBoards, 'end'), function (b) {
                        return [moment(b.end).format('HH:mm:ss.SSS'), '-', b.iterations + 1, 'tries', b.h, 'attacking pairs'].join(' ');
                    }),
                    [moment($scope.queensBoard.end).format('HH:mm:ss.SSS'), '-', 'Finished', $scope.queensBoard.iterations, 'attempts'].join(' ')
                ]);

                $scope.loading = false;
            });
        };

        $scope.analyzeMoves = function (boardObj) {
            // Untranspose for operating on
            boardObj.board = Queens.transpose(boardObj.board);

            var nextBoardObj = _.reduce(_.range(boardObj.queens.length), function (workingBoardObj, colIdx) {
                return Queens.analyzeColumn(workingBoardObj, colIdx);
            }, boardObj);

            $scope.queensBoard = Queens.mergeBoards($scope.queensBoard, nextBoardObj);
            // Transpose for viewing
            $scope.queensBoard.board = Queens.transpose($scope.queensBoard.board);
        };


        // Common functions called by shared board.html
        $scope.boardDebug = $scope.analyzeMoves;
        $scope.resetBoard = Queens.resetBoard;

        // Initialize
        $scope.regenerate($scope.maxAttempts, $scope.numQueens);
    }]);
