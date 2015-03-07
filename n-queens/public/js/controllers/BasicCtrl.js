angular.module('BasicCtrl', [])
    .controller('BasicController', ['$scope', '$timeout', 'Queens', 'HillClimb',
        function ($scope, $timeout, Queens, HillClimb) {

            $scope.title = "Basic Hill Climbing Demo";
            $scope.description = "Select number of queens in upper right and generate a random board.\n" +
            "You can dive straight into Evaluation of the hill climbing with 'Evaluate'.\n" +
            "If you'd like a closer look at what's going on, click 'Debug board' to see the resulting" +
            "number of attacking pairs from moving a queen to another cell in the same column.\n" +
            "Click a column to see which cell that queen would move to (the lowest number).\n" +
            "Use 'Step board' to shuffle each queen once in order.\n\n" +
            "For a comparison, select the 'Brute Force' tab to see how much longer it takes using random" +
            "search!";

            $scope.configurations = [];
            $scope.editConfig = false;
            $scope.sideMovesAllowed = 0;
            $scope.restartsAllowed = 0;
            $scope.attemptsLimit = 1;
            $scope.maxAttempts = 0;
            $scope.attemptsDisabled = true;
            $scope.numQueens = 8;
            $scope.queensBoard = null; //Queens.randomBoard($scope.numQueens);

            $scope.addConfig = function (config) {
                if (!_.isArray($scope.configurations)) {
                    $scope.configurations = [];
                }
                $scope.configurations.push(config);
            };
            $scope.removeConfig = function (configIdx) {
                if (!_.isArray($scope.configurations)) {
                    $scope.configurations = [];
                }
                if ($scope.configurations.length < configIdx) {
                    return; // Out of bounds
                }
                $scope.configurations.splice(configIdx, 1);
            };

            function climb(boardObj, sideMovesAllowed, restartsAllowed) {
                // Untranspose for operating on
                boardObj.board = Queens.transpose(boardObj.board);

                $scope.evaluating = true;

                $timeout(function () {

                        $scope.queensBoard = HillClimb.climb(boardObj, sideMovesAllowed, restartsAllowed);
                        // Transpose for viewing
                        $scope.queensBoard.board = Queens.transpose($scope.queensBoard.board);

                        $scope.activityLog = $scope.queensBoard.activityLog;

                        $scope.evaluating = false;
                    }
                );
            }

            $scope.regenerate = function (maxAttempts, num) {
                var boardObj = Queens.randomBoard(num);
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
                    return HillClimb.climbingStep(workingBoardObj, colIdx);
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
                var nextBoardObj = HillClimb.climbingStep(boardObj, colIdx);

                $scope.queensBoard = Queens.mergeBoards($scope.queensBoard, nextBoardObj);
                $scope.queensBoard.board = Queens.transpose($scope.queensBoard.board);
            };


            // Common functions called by shared board.html
            $scope.columnClick = $scope.step;
            $scope.boardStep = $scope.iteration;
            $scope.boardDebug = $scope.analyzeMoves;
            $scope.evaluate = climb;
            $scope.resetBoard = Queens.resetBoard;

            // Initialize
            $scope.regenerate($scope.maxAttempts, $scope.numQueens);
        }

    ])
;
