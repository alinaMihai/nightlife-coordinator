'use strict';

var _ = require('lodash');
var Place = require('./place.model');


exports.getPeopleGoingTonight = function(req, res) {
    var query = Place.findOne({});
    query.where('placeId', decodeURIComponent(req.params.placeId));
    query.exec(function(err, place) {
        if (!place) {
            return res.status(200).send(0);
        }
        if (err) {
            return handleError(res, err);
        }
        if (place) {
            var users = place.users;
            var people = filterGoingUsers(users);
            console.log(people);
            return res.status(200).json(people);
        }
    });
}

exports.going = function(req, res) {
    var query = Place.findOne({});

    query.where('placeId', req.body.placeId);
    query.exec(function(err, place) {
        if (err) {
            return handleError(res, err);
        } else if (!place) {
            create(res, req.body);
        } else {

            var user = req.body.user;
            var userIndex = findUserIndex(place.users, user);

            if (userIndex !== -1) {
                place = removeUser(place, user, userIndex);
            } else {
                place = addUser(place, user);
            }
            place.save(function(err) {
                if (err) {
                    return handleError(res, err);
                }
                return res.status(200).json(place);
            });
        }

    });

};

function create(res, place) {
    var newPlace = {
        placeId: place.placeId
    };
    var user = {
        name: place.user,
        date: new Date().getTime()
    }
    newPlace.users = [user];
    Place.create(newPlace, function(err, place) {
        return res.status(201).json(place);
    });
}

function removeUser(place, user, userIndex) {
    place.users.splice(userIndex, 1);
    place.users = filterGoingUsers(place.users);
    return place;
}

function addUser(place, userName) {
    var user = {
        name: userName,
        date: new Date().getTime()
    }
    place.users.push(user);
    place.users = filterGoingUsers(place.users);
    return place;
}

function findUserIndex(users, userName) {
    var start = new Date();
    start.setHours(0, 0, 0, 0);
    for (var i = 0; i < users.length; i++) {

        if (users[i].name == userName && users[i].date > start.getTime()) {
            return i;
        }
    }
    return -1;
}

function filterGoingUsers(users) {
    var start = new Date();
    start.setHours(0, 0, 0, 0);
    var end = new Date();
    end.setHours(23, 59, 59, 999);
    var people = users.filter(function(user) {
        return user.date > start.getTime() && user.date < end.getTime();
    });
    return people;

}

function handleError(res, err) {
    return res.status(500).send(err);
}