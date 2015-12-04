(function() {
    'use strict';

    angular
        .module('nightlifeCoordinatorApp')
        .service('CheckinService', CheckinService);

    CheckinService.$inject = ['$window', '$http', '$q', 'Auth'];

    /* @ngInject */
    function CheckinService($window, $http, $q, Auth) {
        this.checkIn = checkIn;
        this.getPeopleGoingTonight = getPeopleGoingTonight;
        ////////////////

        function checkIn(place) {
            if (!Auth.isLoggedIn()) {
                $window.location.href = '/auth/twitter';
            } else {
                return going(place);
            }
        }

        function going(placeId) {
            var place = {
                placeId: placeId,
                user: Auth.getCurrentUser().twitter.id
            };
            var deferred = $q.defer();
            $http.post('/api/place/', place).success(function(place) {
                deferred.resolve(place);
            });
            return deferred.promise;
        }

        function getPeopleGoingTonight(placeId) {
            var deferred = $q.defer();
            $http.get('/api/place/' + encodeURIComponent(placeId)).success(function(people) {
                var currentUserGoing = isCurrentUserGoing(people);
                deferred.resolve([people.length, currentUserGoing]);
            });
            return deferred.promise;
        }

        function isCurrentUserGoing(users) {

            if (Auth.getCurrentUser().twitter) {
                var isGoing = users.filter(function(user) {
                    return user.name == Auth.getCurrentUser().twitter.id;
                });
                return isGoing[0];
            }
        }
    }
})();