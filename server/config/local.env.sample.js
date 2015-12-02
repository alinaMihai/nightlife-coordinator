'use strict';

// Use local.env.js for environment variables that grunt will set when the server starts locally.
// Use for your api keys, secrets, etc. This file should not be tracked by git.
//
// You will need to set these on the server you deploy to.

module.exports = {
    DOMAIN: 'http://localhost:9000',
    SESSION_SECRET: 'nightlifecoordinator-secret',

    TWITTER_ID: 'xq6rwerg8iMFuxJum0tvzQ5aB',
    TWITTER_SECRET: '2U1CRnghS2flgtIcG4ciEq8NYlBi8gB6P0IROb8iQId8LyvzsU',

    // Control debug level for modules using visionmedia/debug
    DEBUG: ''
};