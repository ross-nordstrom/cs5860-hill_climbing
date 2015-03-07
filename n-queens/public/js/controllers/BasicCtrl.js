angular.module('BasicCtrl', [])
    .controller('BasicController', ['$scope', '$timeout', 'Queens', 'HillClimb',
        function ($scope, $timeout, Queens, HillClimb) {

            var NUMBER_OF_BEST_TO_KEEP = 5;
            var MAX_ATTEMPTS = 10000;

            $scope.title = "Basic Hill Climbing Demo";
            $scope.description = "Select number of queens in upper right and generate a random board.\n" +
            "You can dive straight into Evaluation of the hill climbing with 'Evaluate'.\n" +
            "If you'd like a closer look at what's going on, click 'Debug board' to see the resulting" +
            "number of attacking pairs from moving a queen to another cell in the same column.\n" +
            "Click a column to see which cell that queen would move to (the lowest number).\n" +
            "Use 'Step board' to shuffle each queen once in order.\n\n" +
            "For a comparison, select the 'Brute Force' tab to see how much longer it takes using random" +
            "search!";

            $scope.sideMovesAllowed = 0;
            $scope.restartsAllowed = 0;
            $scope.attemptsLimit = 1;
            $scope.maxAttempts = 0;
            $scope.attemptsDisabled = true;
            $scope.numQueens = 8;
            $scope.queensBoard = null; //Queens.randomBoard($scope.numQueens);

            function climb(boardObj, sideMovesAllowed, restartsAllowed, restartRate) {
                // Untranspose for operating on
                boardObj.board = Queens.transpose(boardObj.board);

                $scope.evaluating = true;

                $timeout(function () {
                        var i;
                        var sideMovesRemaining = sideMovesAllowed;
                        var restartsRemaining = restartsAllowed;
                        var initialBoard = JSON.parse(JSON.stringify(boardObj));
                        initialBoard.start = moment();
                        var curBoard = JSON.parse(JSON.stringify(initialBoard));
                        var nextBoard, neighborBoards;
                        curBoard.iterations = 0;
                        var activityLog = [];


                        for (i = 1; i < MAX_ATTEMPTS && curBoard.h !== 0; i++) {

                            // Find best move for each column
                            neighborBoards = _.map(_.range(curBoard.queens.length), function (colIdx) {
                                return HillClimb.basicHillClimbStep(curBoard, colIdx);
                            });

                            nextBoard = Queens.bestBoard(neighborBoards);

                            // Total failure?
                            if (nextBoard.h > curBoard.h) {
                                activityLog.push(
                                    [moment().format('HH:mm:ss.SSS'), '-', i, 'tries,',
                                        curBoard.h, 'attacking pairs.', 'Neighboring moves are all worse.']
                                        .join(' ')
                                );
                                if (restartsRemaining > 0) {
                                    activityLog.push(
                                        [moment().format('HH:mm:ss.SSS'), '-', i, 'tries,',
                                            curBoard.h, 'attacking pairs.', 'Restart to avoid total failure.',
                                            --restartsRemaining, 'remaining.'].join(' ')
                                    );
                                    sideMovesRemaining = sideMovesAllowed;
                                } else {
                                    activityLog.push(
                                        [moment().format('HH:mm:ss.SSS'), '-', i, 'tries,',
                                            curBoard.h, 'attacking pairs.', 'Out of restarts.']
                                            .join(' ')
                                    );
                                    break;
                                }
                            }

                            // Need side move?
                            if (nextBoard.h == curBoard.h) {
                                if (sideMovesRemaining > 0) {
                                    activityLog.push(
                                        [moment().format('HH:mm:ss.SSS'), '-', i, 'tries,',
                                            curBoard.h, 'attacking pairs.',
                                            'Side move.', --sideMovesRemaining, 'remaining.'].join(' ')
                                    );
                                } else {
                                    activityLog.push(
                                        [moment().format('HH:mm:ss.SSS'), '-', i, 'tries,',
                                            curBoard.h, 'attacking pairs.', 'Out of side moves.'].join(' ')
                                    );
                                    if (restartsRemaining > 0) {
                                        activityLog.push(
                                            [moment().format('HH:mm:ss.SSS'), '-', i, 'tries,',
                                                curBoard.h, 'attacking pairs.',
                                                'Restart to avoid failure.', --restartsRemaining, 'remaining.'].join(' ')
                                        );
                                        sideMovesRemaining = sideMovesAllowed;
                                    } else {
                                        activityLog.push(
                                            [moment().format('HH:mm:ss.SSS'), '-', i, 'tries,',
                                                curBoard.h, 'attacking pairs.', 'Out of restarts.'].join(' ')
                                        );
                                        break;
                                    }
                                }
                            }

                            // Random restart?
                            if (Math.random() < restartRate) {
                                activityLog.push(
                                    [moment().format('HH:mm:ss.SSS'), '-', i, 'tries,',
                                        curBoard.h, 'attacking pairs', 'Random restart!']
                                        .join(' ')
                                );
                                curBoard = Queens.randomBoard($scope.numQueens);
                            } else {
                                curBoard = nextBoard;
                            }
                        }

                        $scope.queensBoard = Queens.mergeBoards(Queens.storeBoard(initialBoard), curBoard);
                        // Transpose for viewing
                        $scope.queensBoard.board = Queens.transpose($scope.queensBoard.board);

                        $scope.queensBoard.iterations = i;
                        $scope.queensBoard.end = new Date();

                        $scope.activityLog = _.flatten([
                            [moment($scope.queensBoard.start).format('HH:mm:ss.SSS'), '-', 'Started up to', MAX_ATTEMPTS, 'attempts via hill climbing'].join(' '),
                            [].join(' '),
                            activityLog,
                            [moment($scope.queensBoard.end).format('HH:mm:ss.SSS'), '-', 'Finished', $scope.queensBoard.iterations, 'attempts'].join(' ')
                        ]);

                        $scope.evaluating = false;
                    }
                );
            }

            $scope.regenerate = function (maxAttempts, num) {
                var boardObj = Queens.randomBoard(num);
                boardObj.board = Queens.transpose(boardObj.board);
                $scope.queensBoard = boardObj;
                $scope.activityLog = [];

                $scope.queensBoard.iterations = 0;
                // Transpose for viewing
                $scope.queensBoard.board = Queens.transpose($scope.queensBoard.board);
            };

            $scope.iteration = function (boardObj) {
                // Untranspose for operating on
                boardObj.board = Queens.transpose(boardObj.board);

                var nextBoardObj = _.reduce(_.range(boardObj.queens.length), function (workingBoardObj, colIdx) {
                    return HillClimb.basicHillClimbStep(workingBoardObj, colIdx);
                }, boardObj);

                $scope.queensBoard = Queens.mergeBoards(Queens.storeBoard($scope.queensBoard), nextBoardObj);
                // Transpose for viewing
                $scope.queensBoard.board = Queens.transpose($scope.queensBoard.board);
                $scope.queensBoard.iterations++;
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

            $scope.step = function (boardObj, colIdx) {
                boardObj.board = Queens.transpose(boardObj.board);

                //boardObj = Queens.storeBoard(boardObj);
                var nextBoardObj = HillClimb.basicHillClimbStep(boardObj, colIdx);

                $scope.queensBoard = Queens.mergeBoards($scope.queensBoard, nextBoardObj);
                $scope.queensBoard.board = Queens.transpose($scope.queensBoard.board);
            };


            // Common functions called by shared board.html
            $scope.columnClick = $scope.step;
            $scope.boardStep = $scope.iteration;
            $scope.boardDebug = $scope.analyzeMoves;
            $scope.evaluate = climb;

            // Initialize
            $scope.regenerate($scope.maxAttempts, $scope.numQueens);
        }

    ])
;
