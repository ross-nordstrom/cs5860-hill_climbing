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
                        queen: false
                    };
                });
                row[_.sample(range, 1)].queen = true;
                return row;
            })
            .value();

        // Transpose so we have 1 queen per column
        return transpose(board);
    }

    function transpose(a) {
        return a[0].map(function (_, c) {
            return a.map(function (r) {
                return r[c];
            });
        });
    }

    return {
        randomBoard: randomBoard
    };
}]);
