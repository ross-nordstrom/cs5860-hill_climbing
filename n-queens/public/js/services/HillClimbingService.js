angular.module('HillClimbingService', []).factory('HillClimb', ['Queens', function (Queens) {

    function basicHillClimbStep(boardObj, col) {
        var range = _.range(boardObj.queens.length);
        var currentQueenRowIdx = _.find(boardObj.board[col], {queen: true}).row;
        var neighborBoards = _.chain(range)
            .map(function (neighborIdx) {
                var neighborBoard = JSON.parse(JSON.stringify(boardObj));

                // Move the target queen to this neighboring location
                neighborBoard.board[col][currentQueenRowIdx].queen = false;
                neighborBoard.board[col][neighborIdx].queen = true;
                return Queens.updateBoard(neighborBoard);
            })
            .compact()
            .value();

        // Best neighbor board
        return _.min(neighborBoards, function (nbrBoardObj) {
            return nbrBoardObj.h;
        });
    }


    // Service object - public interface
    return {
        basicHillClimbStep: basicHillClimbStep
    };

}]);
