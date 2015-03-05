angular.module('NQueensService', []).factory('Queens', [function () {
    // Store Combination results at LUT for better performance
    // TODO: Generate this dynamically when the board is generated so we support N arbitrary queens
    var COMB_2 = [
        0, 0, 1, 3, /*4:*/ 6, 10, 15, 21, /*8:*/ 28,
        36, 45, 55, /*12:*/ 66, 78, 91, 105, /*16:*/ 120
    ];

    function randomBoard(numQueens) {
        var start = new Date();
        var range = _.range(numQueens);
        var queens = [];
        var board = _.chain(range)
            .map(function (rowIdx) {
                var row = _.map(range, function (colIdx) {
                    return {
                        id: [rowIdx, colIdx].join('-'),
                        row: rowIdx,
                        col: colIdx,
                        h: null, // To be calculated later
                        best: null,
                        initialQueen: false,
                        finalQueen: false
                    };
                });

                // Randomly set one of the cells to have a queen
                var queenCol = _.sample(range, 1)[0];
                row[queenCol].initialQueen = true;

                // Flip ahead of time since we're going to transpose later on
                queens.push({row: queenCol, col: rowIdx});
                return row;
            })
            .value();

        // Transpose so we have 1 queen per column
        var h = numAttackingQueens(queens);
        return {
            board: transpose(board),
            queens: queens,
            initialH: h,
            best: h,
            finalH: null,
            iterations: 1,
            created: start,
            updated: new Date()
        };
    }

    function transpose(a) {
        return a[0].map(function (_, c) {
            return a.map(function (r) {
                return r[c];
            });
        });
    }

    function numAttackingQueens(queens) {
        return numHorizontalAttackingQueens(queens)
            + numVerticalAttackingQueens(queens)
            + numDiagonalAttackingQueens(queens);
    }

    function numHorizontalAttackingQueens(queens) {
        var sameRows = _.countBy(queens, 'row');
        return _.reduce(sameRows, function (count, rowCnt, rowIdx) {
            return count + COMB_2[rowCnt];
        }, 0);
    }

    function numVerticalAttackingQueens(queens) {
        var sameRows = _.countBy(queens, 'col');
        return _.reduce(sameRows, function (count, rowCnt, rowIdx) {
            return count + COMB_2[rowCnt];
        }, 0);
    }

    function numDiagonalAttackingQueens(queens) {
        return _.reduce(queens, function (allSum, pinnedQueen) {
            return allSum + _.reduce(queens, function (rowSum, compareQueen) {
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
        randomBoard: randomBoard
    };

}]);
