'use strict';

angular.module('nightlifeCoordinatorApp')
    .controller('MainCtrl', ['$q', 'CheckinService',
        function($q, CheckinService) {
            var vm = this;
            var map;
            var infoWindow;
            var autocomplete;
            var marker;
            var service;
            vm.initMap = initMap;
            vm.checkIn = checkIn;
            vm.people = 0;

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
                infoWindow.setContent('You are here');

                marker = new google.maps.Marker({
                    map: map,
                    anchorPoint: new google.maps.Point(0, -29)
                });
                infoWindow.open(map, marker);
                service = new google.maps.places.PlacesService(map);

                getCurrentLocation().then(function(currentLocation) {
                    if (currentLocation) {
                        infoWindow.setPosition(currentLocation);
                        map.setCenter(currentLocation);
                        getLocations(currentLocation);
                        setEvent('dragend');
                        setEvent('zoom_changed');
                        addAutocomplete(input);
                    }
                });
            }

            function checkIn(placeId) {
                console.log(placeId);
            }

            function commonHandling() {
                clearResultsList();
                getLocations();
            }

            function setEvent(eventName) {
                map.addListener(eventName, function() {
                    commonHandling();
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

                var request = {
                    bounds: map.getBounds(),
                    types: ['bar'],
                    openNow: true,
                    location: currentLocation,
                    radius: 500
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
                        getPeopleGoing(place.place_id);
                        checkInHandler(place.place_id);
                        google.maps.event.addListener(marker, 'click', function() {
                            infoWindow.setContent('<div><strong>' + place.name + '</strong><br>' + place.formatted_address);
                            infoWindow.open(map, this);
                        });
                    }
                });
            }

            function checkInHandler(placeId) {
                document.getElementById(placeId).onclick = function() {
                    var placeBtn = this;
                    CheckinService.checkIn(placeId).then(function(place) {
                        var people = place.users.length;
                        placeBtn.firstChild.innerHTML = people || "";

                    });

                };
            }

            function getPeopleGoing(placeId) {
                CheckinService.getPeopleGoingTonight(placeId).then(function(people) {
                    document.getElementById(placeId).firstChild.innerHTML = people;
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
                        map.setZoom(15);
                    }
                    getLocations();
                });
            }

            function addResultsRow(place) {
                console.log(place);
                var resultsList = document.getElementById('resultsList');
                var result = document.createElement('div');
                result.className = 'list-group-item result';
                var html = '<div class="col-lg-2">';

                if (place.photos) {
                    html += '<img src=' + place.photos[0].getUrl({
                        'maxWidth': 100,
                        'maxHeight': 100
                    }) + '><br/>';
                }

                var website = place.website ? place.website : place.url
                html += '<a href=' + website + ' target="_blank"><strong>' + place.name + '</strong></a>';
                if (place.rating) {
                    html += showRating(place.rating);
                }
                if (place.formatted_phone_number) {
                    html += '<p><b>Phone:</b> ' + place.formatted_phone_number + '</p>';
                }

                html += '</div><div class="col-lg-10">';
                html += '<p><b>Address:</b> ' + place.formatted_address + ' <button class="btn btn-success" id="' + place.place_id + '"><span></span> GOING</button></p>';
                html += addReviews(place);
                html += "</div>";
                result.innerHTML = html;
                resultsList.appendChild(result);
            }

            function clearResultsList() {
                var resultsList = document.getElementById('resultsList');
                resultsList.innerHTML = '';
            }

            function addReviews(place) {
                var html = "";
                if (place.reviews) {
                    var firstReview = place.reviews[0];
                    html += "Client review: <p><b> " + firstReview.author_name + "</b> '" + firstReview.text + "'</p>";
                }
                return html;
            }

            function showRating(rating) {
                var html = "<div class='stars'>";

                while (rating > 1) {
                    html += "<span class='star on'></span>";
                    rating -= 1;
                }
                if (rating !== 0) {
                    html += "<span class='star half'></span>";
                }

                html += "</div>";
                return html;
            }

        }
    ]);