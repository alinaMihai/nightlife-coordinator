(function() {
    'use strict';

    angular
        .module('nightlifeCoordinatorApp')
        .directive('mapDir', mapDirective);

    mapDirective.$inject = ['API_KEY'];

    /* @ngInject */
    function mapDirective(API_KEY) {
        // Usage:
        //
        // Creates:
        //
        var directive = {
            link: link,
            restrict: 'A',
            scope: {},
            controller: 'MainCtrl',
            controllerAs: 'vm',
            bindToController: true
        };
        return directive;


        function link(scope, element, attrs, ctrl) {
            var elem = document.getElementById(attrs.id);
            var input = document.getElementById('pac-input');
            loadScript(API_KEY, elem, input, ctrl.initMap);
        }

        function loadScript(key, elem, input, callback) {
            var googleScript = document.createElement('script');
            googleScript.src = 'https://maps.googleapis.com/maps/api/js?key=' + API_KEY + '&libraries=places';
            document.getElementsByTagName("head")[0].appendChild(googleScript);
            googleScript.onload = function() {
                callback(elem, input);

            }
        }
    }
})();