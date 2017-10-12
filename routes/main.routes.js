const router = require('express').Router()

import {
    slashHome,
    indexButton,
    slackAuth
} from './main.controller.js'


router.route('/').post(slashHome);
router.route('/slack').get(slackAuth);
router.route('/index').get(indexButton);

module.exports = router