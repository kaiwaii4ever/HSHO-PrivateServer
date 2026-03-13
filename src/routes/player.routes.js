const router = require('express').Router();
const authController = require('@controllers/auth.controller');

router.post('/authen', authController.authenticate.bind(authController));

module.exports = router;
