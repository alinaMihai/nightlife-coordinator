'use strict';

angular.module('nightlifeCoordinatorApp')
    .controller('MainCtrl', function(PlacesService) {
        var vm = this;
        vm.placesService = PlacesService;
    });