'use strict';

var express = require('express');
var controller = require('./place.controller');

var router = express.Router();

router.get('/:placeId', controller.getPeopleGoingTonight);
// router.get('/:id', controller.show);
router.post('/', controller.going);
// router.put('/:id', controller.update);
// router.patch('/:id', controller.update);
// router.delete('/:id', controller.destroy);
module.exports = router;