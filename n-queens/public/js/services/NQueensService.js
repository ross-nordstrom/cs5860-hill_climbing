angular.module('NQueensService', []).factory('Queens', [function () {
    function randomBoard(numQueens) {
        var range = _.range(numQueens);
        var board = _.chain(range)
            .map(function (rowIdx) {
                var row = _.map(range, function (colIdx) {
                    return {
                        id: [rowIdx, colIdx].join('-'),
                        row: rowIdx,
                        col: colIdx,
                        h: null, // To be calculated later
                        queen: false
                    };
                });
                row[_.sample(range, 1)].queen = true;
                return row;
            })
            .value();

        // Transpose so we have 1 queen per column
        var b = transpose(board);
        return {
            board: b,
            initialH: numAttackingQueens(b),
            finalH: null
        };
    }

    function transpose(a) {
        return a[0].map(function (_, c) {
            return a.map(function (r) {
                return r[c];
            });
        });
    }

    function numAttackingQueens(board) {
        return 33;
    }

    return {
        randomBoard: randomBoard
    };
}]);
