'use strict';

angular.module('nightlifeCoordinatorApp')
    .controller('MainCtrl', ['$q',
        function($q) {
            var vm = this;
            var map;
            var infoWindow;
            var autocomplete;
            var marker;
            var service;
            vm.initMap = initMap;

            ////////////////
            function initMap(element, input) {
                var currentLocation = {};
                map = new google.maps.Map(element, {
                    center: {
                        lat: -34.397,
                        lng: 150.644
                    },
                    zoom: 15
                });
                infoWindow = new google.maps.InfoWindow({
                    map: map
                });
                marker = new google.maps.Marker({
                    map: map,
                    anchorPoint: new google.maps.Point(0, -29)
                });
                service = new google.maps.places.PlacesService(map);

                getCurrentLocation().then(function(currentLocation) {
                    if (currentLocation) {
                        infoWindow.setPosition(currentLocation);
                        map.setCenter(currentLocation);
                        map.addListener('idle', function() {
                            clearResultsList();
                            getLocations();
                        });
                        addAutocomplete(input);
                    }
                });
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
                console.log('call' + currentLocation);
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
                service.getDetails({
                    placeId: place.place_id
                }, function(place, status) {
                    if (status === google.maps.places.PlacesServiceStatus.OK) {
                        marker = new google.maps.Marker({
                            map: map,
                            position: place.geometry.location
                        });
                        marker.setIcon( /** @type {google.maps.Icon} */ ({
                            url: place.icon,
                            size: new google.maps.Size(71, 71),
                            origin: new google.maps.Point(0, 0),
                            anchor: new google.maps.Point(17, 34),
                            scaledSize: new google.maps.Size(35, 35)
                        }));
                        marker.setVisible(true);
                        addResultsRow(place);
                        google.maps.event.addListener(marker, 'click', function() {
                            infoWindow.setContent('<div><strong>' + place.name + '</strong><br>' + place.formatted_address);
                            infoWindow.open(map, this);
                        });
                    }
                });
            }

            function addAutocomplete(input) {
                map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
                var autocomplete = new google.maps.places.Autocomplete(input);
                autocomplete.bindTo('bounds', map);

                autocomplete.addListener('place_changed', function() {
                    infoWindow.close();
                    clearResultsList();
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
                        map.setZoom(15); // Why 17? Because it looks good.
                    }
                });
            }

            function addResultsRow(place) {
                console.log(place);
                var resultsList = document.getElementById('resultsList');
                var result = document.createElement('div');
                result.className = 'list-group-item';
                var html = "";
                if (place.photos) {
                    html = '<img src=' + place.photos[0].getUrl({
                        'maxWidth': 100,
                        'maxHeight': 100
                    }) + '><br/>';
                }
                var website = place.website ? place.website : '#'
                html += '<a href=' + website + '><strong>' + place.name + '</strong></a>';
                html += '<p>' + place.formatted_address + '</p>';
                html += '<p>' + place.international_phone_number + '</p>';
                result.innerHTML = html;
                resultsList.appendChild(result);
            }

            function clearResultsList() {
                var resultsList = document.getElementById('resultsList');
                resultsList.innerHTML = '';
            }

        }
    ]);