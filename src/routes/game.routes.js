const express = require('express');
const router = express.Router();

const game = require("@controllers/game.controller");

router.post('/player/gameplay/checkversion', game.checkVersion);
router.post('/player/getban', game.getBan);

module.exports = router;