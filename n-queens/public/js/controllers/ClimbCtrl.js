angular.module('ClimbCtrl', [])
    .controller('ClimbController', ['$scope', '$timeout', '$filter', 'Queens', 'HillClimb',
        function ($scope, $timeout, $filter, Queens, HillClimb) {
            var DEFAULT_CONFIG = {sideMovesAllowed: 0, restartsAllowed: 0, repeat: 10};

            $scope.title = "Basic Hill Climbing Demo";
            $scope.description = "Select number of queens in upper right and generate a random board.\n" +
            "You can dive straight into Evaluation of the hill climbing with 'Evaluate'.\n" +
            "If you'd like a closer look at what's going on, click 'Debug board' to see the resulting" +
            "number of attacking pairs from moving a queen to another cell in the same column.\n" +
            "Click a column to see which cell that queen would move to (the lowest number).\n" +
            "Use 'Step board' to shuffle each queen once in order.\n\n" +
            "For a comparison, select the 'Brute Force' tab to see how much longer it takes using random" +
            "search!";

            $scope.newConfig = _.clone(DEFAULT_CONFIG);
            $scope.editConfig = false;
            $scope.showActivityLog = false;
            $scope.sideMovesAllowed = 0;
            $scope.restartsAllowed = 0;
            $scope.attemptsLimit = 1;
            $scope.maxAttempts = 0;
            $scope.attemptsDisabled = true;
            $scope.numQueens = 8;
            $scope.queensBoard = null; //Queens.randomBoard($scope.numQueens);
            $scope.configurationsText = '';

            function setConfigText() {
                $scope.configurationsText = _.map($scope.configurations, function (config) {
                    return [config.sideMovesAllowed, 'side moves,', config.restartsAllowed, 'restarts,', config.repeat, 'times'].join(' ');
                }).join('\n');
            }

            function saveConfig() {
                sessionStorage.evalConfigurations = JSON.stringify($scope.configurations);
            }

            function restoreConfig() {
                try {
                    $scope.configurations = JSON.parse(sessionStorage.evalConfigurations);
                } catch (e) {
                }
                $scope.configurations = $scope.configurations || [_.clone(DEFAULT_CONFIG)];
            }

            restoreConfig();
            setConfigText();

            $scope.toggleConfig = function () {
                $scope.editConfig = !$scope.editConfig
            };

            $scope.addConfig = function (config) {
                if (!_.isArray($scope.configurations)) {
                    $scope.configurations = [];
                }
                $scope.configurations.push(config);
                saveConfig();
                setConfigText();
                $scope.newConfig = _.clone(config);
            };
            $scope.removeConfig = function (configIdx) {
                if (!_.isArray($scope.configurations)) {
                    $scope.configurations = [];
                }
                if ($scope.configurations.length < configIdx) {
                    return; // Out of bounds
                }
                $scope.configurations.splice(configIdx, 1);
                saveConfig();
                setConfigText();
            };

            $scope.$watch('editConfig', function (newEdit, oldEdit) {
                if (!newEdit && oldEdit) {
                    saveConfig();
                }
            });

            function climb(boardObj, configurations) {
                // Untranspose for operating on
                boardObj.board = Queens.transpose(boardObj.board);

                $scope.evaluating = true;

                $timeout(function () {

                        var activityLog = [];
                        $scope.results = [];

                        var results = _.map(configurations, function (config) {

                            activityLog.push(['**Evaluate configuration**'].join(' '));
                            activityLog.push([' |--> ',
                                config.sideMovesAllowed, 'side moves,',
                                config.restartsAllowed, 'restarts,',
                                config.repeat, 'times'
                            ].join(' '));

                            var result = _.reduce(_.range(config.repeat), function (result, i) {
                                    var boardResult = HillClimb.climb(boardObj, config.sideMovesAllowed, config.restartsAllowed);
                                    activityLog.concat(boardResult.activityLog);

                                    // Record best for optional display
                                    if (boardResult.best < result.best || (boardResult.best === result.best && boardResult.iterations < result.iterations)) {
                                        result.best = boardResult.best;
                                        result.iterations = boardResult.iterations;
                                        result.bestQueens = boardResult.queens;
                                    }

                                    // Update summary indexed by # attacking queens (h)
                                    var curSummary = result.summaryByH[boardResult.h] || {};
                                    var duration = $filter('timespan')(boardResult);
                                    result.summaryByH[boardResult.h] = {
                                        count: (curSummary.count || 0) + 1,
                                        meanTime: ( (curSummary.mean || 0) * (curSummary.count || 0) + duration ) / ((curSummary.count || 0) + 1),
                                        maxTime: Math.max(curSummary.max || -Infinity, duration),
                                        minTime: Math.min(curSummary.min || Infinity, duration)
                                    };

                                    // Update summary indexed by success vs failure
                                    var resultStr = boardResult.h === 0 ? 'success' : 'failure';
                                    curSummary = result.summaryByResult[resultStr] || {};
                                    result.summaryByResult[resultStr] = {
                                        count: (curSummary.count || 0) + 1,
                                        meanTime: ( (curSummary.meanTime || 0) * (curSummary.count || 0) + duration ) / ((curSummary.count || 0) + 1),
                                        maxTime: Math.max(curSummary.maxTime || -Infinity, duration),
                                        minTime: Math.min(curSummary.minTime || Infinity, duration)
                                    };

                                    return _.extend(result, {configuration: config});
                                },

                                // Reduce accumulator object
                                {
                                    iterations: Infinity,
                                    summaryByH: {},
                                    summaryByResult: {success: {}, failure: {}},
                                    best: Infinity,
                                    bestQueens: null
                                }
                            );

                            activityLog.push([' |----> Best ', result.best === 0 ?
                                '(success)' : '(fail: ' + result.best + ' attacking queens)',
                                'in', result.iterations, 'tries (' + (100 * result.summaryByResult.success.count / config.repeat).toFixed(1) + '% won):'
                            ].join(' '));

                            _.each(_.range(3), function (i) {
                                var hSum = result.summaryByH[result.best + i];
                                activityLog.push([' |------> H=' + (result.best + i) + ':', !hSum ? 'N/A' : JSON.stringify(hSum)].join(' '));
                            });

                            activityLog.push([' `------> Failure summary:', JSON.stringify(result.summaryByResult.failure)].join(' '));
                            activityLog.push([' |------> Success summary:', result.best > 0 ? 'N/A' : JSON.stringify(result.summaryByResult.success)].join(' '));

                            return result;
                        });
                        $scope.activityLog = activityLog;
                        $scope.results = results;

                        // Transpose for viewing
                        $scope.queensBoard.board = Queens.transpose($scope.queensBoard.board);

                        $scope.evaluating = false;
                    }
                );
            }

            $scope.regenerate = function (maxAttempts, num) {
                var boardObj = Queens.randomBoard(num);
                $scope.queensBoard = boardObj;
                $scope.activityLog = [];
                $scope.results = [];

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

                // Redo debug if they had it on
                if ($scope.debugging) {
                    $scope.analyzeMoves($scope.queensBoard);
                }
            };

            $scope.analyzeMoves = function (boardObj) {
                $scope.debugging = true;
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
                $scope.queensBoard.iterations++;

                // Redo debug if they had it on
                if ($scope.debugging) {
                    $scope.analyzeMoves($scope.queensBoard);
                }
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
