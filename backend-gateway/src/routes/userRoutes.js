const express = require('express');
const router = express.Router();
const { registerUser } = require('../controller/user');
const { loginUser } = require('../controller/user');
const { authenticateToken } = require('../middleware/auth');

router.post('/register', registerUser);
router.post('/login', loginUser);

module.exports = router;