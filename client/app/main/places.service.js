(function() {
    'use strict';

    angular
        .module('nightlifeCoordinatorApp')
        .service('PlacesService', PlacesService);

    PlacesService.$inject = ['$q'];

    /* @ngInject */
    function PlacesService($q) {
        var map;
        var infoWindow;
        this.initMap = initMap;

        ////////////////

        function initMap(element) {
            var currentLocation = {};
            map = new google.maps.Map(element, {
                center: {
                    lat: -34.397,
                    lng: 150.644
                },
                zoom: 16
            });
            infoWindow = new google.maps.InfoWindow({
                map: map
            });
            getCurrentLocation().then(function(currentLocation) {
                if (currentLocation) {
                    infoWindow.setPosition(currentLocation);
                    map.setCenter(currentLocation);
                    getLocations(currentLocation);
                }
            });
            map.addListener('idle', getLocations);
        }

        function getCurrentLocation() {
            var pos;
            var deferred = $q.defer();
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(function(position) {
                    pos = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    deferred.resolve(pos);
                });

            } else {
                deferred.reject();
                //handleLocationError();
            }
            return deferred.promise;
        }

        function getLocations(currentLocation) {
            var service = new google.maps.places.PlacesService(map);
            var request = {
                bounds: map.getBounds(),
                types: ['bar'],
                openNow: true
            };
            service.nearbySearch(request, callback);
        }

        function callback(results, status) {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
                for (var i = 0; i < results.length; i++) {
                    createMarker(results[i]);
                }
            }
        }

        function createMarker(place) {
            var placeLoc = place.geometry.location;
            var marker = new google.maps.Marker({
                map: map,
                position: place.geometry.location
            });

            google.maps.event.addListener(marker, 'click', function() {
                infoWindow.setContent(place.name);
                infoWindow.open(map, this);
            });
        }

    }
})();