angular.module('BasicCtrl', [])
    .controller('BasicController', ['$scope', 'Queens', 'HillClimb', function ($scope, Queens, HillClimb) {

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
        $scope.attemptsLimit = 1;
        $scope.maxAttempts = 0;
        $scope.attemptsDisabled = true;
        $scope.numQueens = 8;
        $scope.queensBoard = null; //Queens.randomBoard($scope.numQueens);

        function climb(boardObj, sideMoves, restartsAllowed) {
            // Untranspose for operating on
            boardObj.board = Queens.transpose(boardObj.board);

            var curBoard = Queens.storeBoard(boardObj);
            var initialBoard = curBoard;
            curBoard.iterations = 0;
            $scope.activityLog = [];

            $scope.loading = true;

            $timeout(function () {

                for (i = 1; i < MAX_ATTEMPTS && curBoard.h !== 0; i++) {

                }

                $scope.queensBoard = Queens.mergeBoards($scope.queensBoard, nextBoardObj);
                // Transpose for viewing
                $scope.queensBoard.board = Queens.transpose($scope.queensBoard.board);

                $scope.loading = false;
            });
        }

        $scope.regenerate = function (maxAttempts, num) {
            var boardObj = Queens.randomBoard(num);
            boardObj.board = Queens.transpose(boardObj.board);
            $scope.queensBoard = boardObj;

            $scope.queensBoard.iterations = 0;
            $scope.iteration($scope.queensBoard);
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
    }]);
