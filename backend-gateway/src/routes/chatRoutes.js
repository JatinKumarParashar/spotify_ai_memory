const express = require("express");
const { chat } = require("../controller/chat");
const { authenticateToken } = require("../middleware/auth");
const router = express.Router();

router.post("/chat", authenticateToken, chat);

module.exports = router;
