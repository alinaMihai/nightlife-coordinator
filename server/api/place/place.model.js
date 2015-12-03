'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var PlaceSchema = new Schema({
    placeId: String,
    users: [{
        name: String,
        date: Date
    }]
});

module.exports = mongoose.model('Place', PlaceSchema);