'use strict';

var express = require('express');
var controller = require('./place.controller');

var router = express.Router();

router.get('/:placeId', controller.getPeopleGoingTonight);
router.post('/', controller.going);
module.exports = router;