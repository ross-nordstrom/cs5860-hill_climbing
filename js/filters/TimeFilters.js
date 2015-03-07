angular.module('TimeFilters', [])
    .filter('timespan', [function () {
        function niceTimespan(item) {
            return !_.isObject(item) ? null : moment(item.end).from(moment(item.start), true);
        }

        function accurateTimespan(item) {
            return !_.isObject(item) ? null : moment(item.end).diff(moment(item.start), 'ms');
        }

        return function (item, nice) {
            return nice ? niceTimespan(item) : accurateTimespan(item);
        }
    }]);
