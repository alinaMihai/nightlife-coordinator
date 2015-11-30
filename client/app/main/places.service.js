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
        var autocomplete;
        var marker;
        this.initMap = initMap;

        ////////////////

        function initMap(element, input) {
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
                    marker = new google.maps.Marker({
                        map: map,
                        anchorPoint: new google.maps.Point(0, -29)
                    });
                    addAutocomplete(input);
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
            marker = new google.maps.Marker({
                map: map,
                position: place.geometry.location
            });

            google.maps.event.addListener(marker, 'click', function() {
                infoWindow.setContent(place.name);
                infoWindow.open(map, this);
            });
        }

        function addAutocomplete(input) {
            map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
            var autocomplete = new google.maps.places.Autocomplete(input);
            autocomplete.bindTo('bounds', map);

            autocomplete.addListener('place_changed', function() {
                infoWindow.close();
                marker.setVisible(false);
                var place = autocomplete.getPlace();
                if (!place.geometry) {
                    window.alert("Autocomplete's returned place contains no geometry");
                    return;
                }

                // If the place has a geometry, then present it on a map.
                if (place.geometry.viewport) {
                    map.fitBounds(place.geometry.viewport);
                } else {
                    map.setCenter(place.geometry.location);
                    map.setZoom(17); // Why 17? Because it looks good.
                }
                marker.setIcon( /** @type {google.maps.Icon} */ ({
                    url: place.icon,
                    size: new google.maps.Size(71, 71),
                    origin: new google.maps.Point(0, 0),
                    anchor: new google.maps.Point(17, 34),
                    scaledSize: new google.maps.Size(35, 35)
                }));
                marker.setPosition(place.geometry.location);
                marker.setVisible(true);

                var address = '';
                if (place.address_components) {
                    address = [
                        (place.address_components[0] && place.address_components[0].short_name || ''), (place.address_components[1] && place.address_components[1].short_name || ''), (place.address_components[2] && place.address_components[2].short_name || '')
                    ].join(' ');
                }

                infoWindow.setContent('<div><strong>' + place.name + '</strong><br>' + address);
                infoWindow.open(map, marker);

            });
        }

    }
})();