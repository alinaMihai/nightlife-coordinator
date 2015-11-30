(function() {
    'use strict';

    angular
        .module('nightlifeCoordinatorApp')
        .directive('mapDir', mapDirective);

    mapDirective.$inject = ['PlacesService', 'API_KEY'];

    /* @ngInject */
    function mapDirective(PlacesService, API_KEY) {
        // Usage:
        //
        // Creates:
        //
        var directive = {
            link: link,
            restrict: 'A',
            scope: {}
        };
        return directive;


        function link(scope, element, attrs) {
            var elem = document.getElementById(attrs.id);
            loadScript(API_KEY, elem);
        }

        function loadScript(key, elem) {
            var googleScript = document.createElement('script');
            googleScript.src = 'https://maps.googleapis.com/maps/api/js?key=' + API_KEY + '&libraries=places';
            document.getElementsByTagName("head")[0].appendChild(googleScript);
            googleScript.onload = function() {
                PlacesService.initMap(elem);
            }
        }
    }
})();