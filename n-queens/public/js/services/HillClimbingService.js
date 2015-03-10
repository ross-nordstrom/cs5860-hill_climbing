angular.module('HillClimbingService', []).factory('HillClimb', ['Queens', function (Queens) {
    var MAX_ATTEMPTS = 10000;

    /**
     * Given a board, move the queen in a given column to the best neighboring spot in that column
     * @param boardObj
     * @param col       - Which column to move
     * @returns {*}     - Resulting board after the move
     */
    function climbingStep(boardObj, col) {
        var range = _.range(boardObj.queens.length);
        var currentQueenRowIdx = _.find(boardObj.board[col], {queen: true}).row;

        // Enumerate each possible neighboring board within the column
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
        return Queens.bestBoard(neighborBoards);
    }

    /**
     * Run a full evaluation of the board using parametrized hill climbing.
     * @param boardObj
     * @param sideMovesAllowed      - How many side moves allowed **per restart**
     * @param restartsAllowed       - How many restarts allowed when we cannot make any more moves (out of side moves, stuck in local minima)
     * @param restartRate           - **NOT IMPLEMENTED** Would randomly restart regardless of better moves being available
     * @returns {*}                 - Resulting board after the full hill climb, including iterations (steps) to accomplish it.
     */
    function climb(boardObj, sideMovesAllowed, restartsAllowed, restartRate) {

        var i;
        var sideMovesRemaining = sideMovesAllowed;
        var restartsRemaining = restartsAllowed;
        var initialBoard = JSON.parse(JSON.stringify(boardObj));
        initialBoard.start = moment();
        var curBoard = JSON.parse(JSON.stringify(initialBoard));
        var nextBoard, neighborBoards;
        curBoard.iterations = 0;
        var activityLog = [];

        // Start searching until we get a solution
        for (i = 1; i < MAX_ATTEMPTS && curBoard.h !== 0; i++) {

            // Find best move for each column
            neighborBoards = _.map(_.range(curBoard.queens.length), function (colIdx) {
                return climbingStep(curBoard, colIdx);
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

        var resultingBoard = Queens.mergeBoards(Queens.storeBoard(initialBoard), curBoard);
        resultingBoard.activityLog = _.flatten([
            [moment(resultingBoard.start).format('HH:mm:ss.SSS'), '-', 'Started up to', MAX_ATTEMPTS, 'attempts via hill climbing'].join(' '),
            [].join(' '),
            activityLog,
            [moment(resultingBoard.end).format('HH:mm:ss.SSS'), '-', 'Finished', resultingBoard.iterations, 'attempts'].join(' ')
        ]);
        resultingBoard.iterations = i;
        resultingBoard.end = new Date();

        return resultingBoard;
    }


    // Service object - public interface
    return {
        climbingStep: climbingStep,
        climb: climb
    };
}]);
