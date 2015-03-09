angular.module('NQueensService', []).factory('Queens', [function () {

    // Store Combination results at LUT for better performance. Combinations are needed so we can
    // convert "k Queens in same {row|column|diagonal}" into "l pairs of attacking queens"
    // In other words,
    // l = ( k )
    //     ( 2 ) = `k choose 2`
    // Example: http://www.wolframalpha.com/input/?i=4+choose+2
    // TODO: Generate this dynamically when the board is generated so we support N arbitrary queens
    var COMB_2 = [
        0, 0, 1, 3, /*4:*/ 6, 10, 15, 21, /*8:*/ 28,
        36, 45, 55, /*12:*/ 66, 78, 91, 105, /*16:*/ 120
    ];

    /**
     * Generate a board with a random queen layout, with the constraint of 1 queen per column.
     * Additionally, I store some metadata on the board layout describing how many attacking
     * queens there are and some other variables useful in the display and analysis of the board
     *
     * TODO: A major improvement would come from simply using the `queens` array as
     *          the entire representation of the board. This would save a lot of space.
     *          I would need to duplicate (denormalize) the queens to be also stored in
     *          a LUT object for the UI to easily see where the queens live. Example LUT structure:
     *              {
     *                  "<col_queen1>": {
     *                      "<row_queen1>": true
     *                  },
     *                  "<col_queen2>": {
     *                      "<row_queen2>": true
     *                  },
     *                  ...
     *                  "<col_queenN>": {
     *                      "<row_queen\N>": true
     *                  }
     *              }
     *
     * @param numQueens     - How many queens to generate the board for. Aka N for the N*N board
     * @returns {{board: *, queens: Array, best: *, h: *, iterations: number, start: Date, end: Date}}
     */
    function randomBoard(numQueens) {
        var start = new Date();
        var range = _.range(numQueens);
        var queens = [];
        var board = _.map(range, function (colIdx) {
            var col = _.map(range, function (rowIdx) {
                return {
                    id: [rowIdx, colIdx].join('-'),
                    row: rowIdx,
                    col: colIdx,
                    queen: false
                };
            });

            // Randomly set one of the cells to have a queen
            var queenRow = _.sample(range, 1)[0];
            col[queenRow].queen = true;

            // Flip ahead of time since we're going to transpose later on
            queens.push({row: queenRow, col: colIdx});
            return col;
        });

        // Transpose so we have 1 queen per column
        var h = numAttackingQueens(queens);
        var now = new Date();
        return {
            board: board,
            queens: queens,
            best: h,
            h: h,
            iterations: 1,
            start: start,
            end: now
        };
    }

    /**
     * Update the queens and metadata on the board to match the contents of the board matrix
     * @param boardObj
     * @returns {*}         - Updated board
     */
    function updateBoard(boardObj) {
        var queens = _.map(boardObj.board, function (col) {
            var rowWithQueen = _.find(col, {queen: true});
            return {row: rowWithQueen.row, col: rowWithQueen.col};
        });

        var h = numAttackingQueens(queens);
        var now = new Date();

        return _.extend({}, boardObj, {
            queens: queens,
            h: h,
            end: now
        });
    }

    /**
     * Store a board state as the "initial" board state. Useful in comparing starting vs ending layout
     * @param boardObj
     * @returns {*}     - Stored board, with final layout stored as initial
     */
    function storeBoard(boardObj) {
        _.each(boardObj.board, function (col) {
            _.each(col, function (row) {
                row.initialQueen = row.queen;
                row.queen = false;
                row.opportunity = null;
            })
        });
        boardObj.initialH = boardObj.h;

        return boardObj;
    }

    /**
     * Restore the "initial" board state so it is the main board state.
     * @param boardObj
     * @returns {*}     - Restored board from initial state
     */
    function resetBoard(boardObj) {
        _.each(boardObj.board, function (col) {
            _.each(col, function (row) {
                row.queen = row.initialQueen;
                row.initialQueen = false;
                row.opportunity = null;
            })
        });
        boardObj.h = boardObj.initialH;
        boardObj.best = boardObj.initialH;
        boardObj.iterations = 0;

        return boardObj;
    }

    /**
     * Given two board layout, merge them into a single object so the first board is the initial state and second board is the final state
     * @param firstBoard        - Initial board state
     * @param secondBoard       - Final board state
     * @returns {*}             - Resulting, merged board
     */
    function mergeBoards(firstBoard, secondBoard) {
        var boardObj = JSON.parse(JSON.stringify(firstBoard));

        _.each(boardObj.board, function (col, colIdx) {
            _.each(col, function (row, rowIdx) {
                row.queen = secondBoard.board[colIdx][rowIdx].queen;
            })
        });
        boardObj.initialH = boardObj.h;
        boardObj.h = secondBoard.h;
        boardObj.best = Math.min(boardObj.best, secondBoard.h);
        boardObj.queens = JSON.parse(JSON.stringify(secondBoard.queens));

        return boardObj;
    }

    /**
     * For each potential queen position in the column, evaluate the resulting H value of the board. Useful for
     * visually understanding how the Hill Climbing algorithm works. Click "Debug board" to use this in the UI
     * @param boardObj
     * @param col           - Which column to analyze
     * @returns {*}         - Board with "opportunity" annotations describing what the H would be for each move within the column
     */
    function analyzeColumn(boardObj, col) {
        var range = _.range(boardObj.queens.length);
        var currentQueenRowIdx = _.find(boardObj.board[col], {queen: true}).row;
        var neighborBoards = _.chain(range)
            .map(function (neighborIdx) {
                var neighborBoard = JSON.parse(JSON.stringify(boardObj));

                // Move the target queen to this neighboring location
                neighborBoard.board[col][currentQueenRowIdx].queen = false;
                neighborBoard.board[col][neighborIdx].queen = true;
                return updateBoard(neighborBoard);
            })
            .compact()
            .value();

        // Insert the opportunity at each spot
        _.each(neighborBoards, function (neighborBoard, neighborIdx) {
            boardObj.board[col][neighborIdx].opportunity = neighborBoard.h; // Show slope of hill
        });

        return boardObj;
    }

    /**
     * Return the board with the fewest attacking queens, but introduce some randomness so we boards with the same H
     * have an equal chance of being considered the best board. This prevents tight cycles when allowing sideways moves
     * @param boards        - List of boards to consider
     * @returns {*}         - The board with the best (min) # attacking pairs. Ties broken randomly
     */
    function bestBoard(boards) {
        return _.min(boards, function (b) {
            return b.h + Math.random() / 2; // Add random fraction for changing sorts
        });
    }

    /**
     * The UI likes the board to be [row][col], but for computation I prefer [col][row]
     * @param a
     * @returns {Array|*}
     */
    function transpose(a) {
        return a[0].map(function (_, c) {
            return a.map(function (r) {
                return r[c];
            });
        });
    }

    /**
     * Number of PAIRS of attacking queens on the board
     * @param queens
     * @returns {*}
     */
    function numAttackingQueens(queens) {
        return numHorizontalAttackingQueens(queens)
            + numVerticalAttackingQueens(queens)
            + numDiagonalAttackingQueens(queens);
    }

    /**
     * PAIRS of attacking queens, looking at rows only
     * O(n), where n is num queens.
     * @param queens
     * @returns {*}
     */
    function numHorizontalAttackingQueens(queens) {
        var sameRows = _.countBy(queens, 'row');

        // Count attacking pairs in each row, and sum for total
        return _.reduce(sameRows, function (count, rowCnt, rowIdx) {
            return count + COMB_2[rowCnt];
        }, 0);
    }

    /**
     * PAIRS of attacking queens, looking at columns only
     * O(n), where n is num queens.
     * @param queens
     * @returns {*}
     */
    function numVerticalAttackingQueens(queens) {
        var sameCols = _.countBy(queens, 'col');

        // Count attacking pairs in each column, and sum for total
        return _.reduce(sameCols, function (count, colCnt, colIdx) {
            return count + COMB_2[colCnt];
        }, 0);
    }

    /**
     * PAIRS of attacking queens, looking at diagonals only
     * Relies on the knowledge that queens sharing a diagonal have a slope of 1 or -1 when looking at their positions
     * O(n^2), where n is num queens. This is because we must look at each pair of queens to compare their slope.
     * @param queens
     * @returns {*}
     */
    function numDiagonalAttackingQueens(queens) {
        return _.reduce(queens, function (allSum, pinnedQueen) {
            return allSum + _.reduce(queens, function (rowSum, compareQueen) {
                    // Prevent divide by 0. Plus if they're in the same col they definitely don't share a diagonal
                    if (compareQueen.col === pinnedQueen.col) {
                        return rowSum;
                    }

                    // If the slope between the 2 queens is 1 or -1, they share a diagonal
                    var slope = (compareQueen.row - pinnedQueen.row) / (compareQueen.col - pinnedQueen.col);
                    return rowSum + (Math.abs(slope) === 1) ? 1 : 0;
                }, 0);
        }, 0);
    }


    // Service object - public interface
    return {
        randomBoard: randomBoard,
        updateBoard: updateBoard,
        storeBoard: storeBoard,
        resetBoard: resetBoard,
        mergeBoards: mergeBoards,
        analyzeColumn: analyzeColumn,
        bestBoard: bestBoard,
        transpose: transpose
    };

}]);
