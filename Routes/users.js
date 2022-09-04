const express = require('express');
const router = express.Router();
const cleanBody = require('../middleware/cleanBody');
const authControl = require('../controller/controller');

router.post('/signup', cleanBody, authControl.signUp);
router.post('/login', cleanBody, authControl.login);
router.post('/activate', cleanBody, authControl.activate);
router.post('/forgot', cleanBody, authControl.forgotPass);
router.post('/reset', cleanBody, authControl.resetPass);

module.exports = router;
