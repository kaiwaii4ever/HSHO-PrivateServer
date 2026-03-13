const express = require('express');
const router = express.Router();
const Auth = require('@controllers/auth.controller');

const Immortal = require('@controllers/immortal.controller');

router.post('/immortal/player/get', Auth.verifySession, Immortal.getImmortalPlayer);
router.post('/immortal/player/getmatch', Immortal.getImmortalPlayerMatch);

module.exports = router;
