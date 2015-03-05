angular.module('BasicCtrl', [])
    .controller('BasicController', ['$scope', 'Queens', 'HillClimb', function ($scope, Queens, HillClimb) {

        $scope.attemptsLimit = 1;
        $scope.maxAttempts = 0;
        $scope.attemptsDisabled = true;
        $scope.numQueens = 8;
        $scope.queensBoard = null; //Queens.randomBoard($scope.numQueens);

        $scope.regenerate = function (maxAttempts, num) {
            var boardObj = Queens.randomBoard(num);
            boardObj.board = Queens.transpose(boardObj.board);
            $scope.queensBoard = boardObj;
        };
        $scope.iteration = function (boardObj) {
            boardObj.board = Queens.transpose(boardObj.board);

            var nextBoardObj = _.reduce(_.range(boardObj.queens.length), function (workingBoardObj, colIdx) {
                return HillClimb.basicHillClimbStep(workingBoardObj, colIdx);
            }, boardObj);

            nextBoardObj.board = Queens.transpose(nextBoardObj.board);
            $scope.queensBoard = nextBoardObj;
        };

        $scope.step = function (boardObj, colIdx) {
            boardObj.board = Queens.transpose(boardObj.board);

            boardObj = Queens.incrementBoard(boardObj);
            var nextBoardObj = HillClimb.basicHillClimbStep(boardObj, colIdx);

            nextBoardObj.board = Queens.transpose(nextBoardObj.board);
            $scope.queensBoard = nextBoardObj;
        };
        $scope.columnClick = $scope.step;
        $scope.boardStep = $scope.iteration;

        // Initialize
        $scope.regenerate($scope.maxAttempts, $scope.numQueens);
        $scope.iteration($scope.queensBoard);
    }]);
