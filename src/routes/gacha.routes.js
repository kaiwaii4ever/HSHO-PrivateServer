const express = require('express');
const router = express.Router();

const gacha = require('@controllers/gacha.controller');

router.post('/api/open', gacha.OpenLootBox);

module.exports = router;
