const express = require("express");
const {
  getMemory,
  postMemory,
  deleteMemory,
  patchMemory,
} = require("../controller/memory");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

router.get("/memories", authenticateToken, getMemory);
router.post("/events", authenticateToken, postMemory);
router.patch("/memories/:id", authenticateToken, patchMemory);
router.delete("/memories/:id", authenticateToken, deleteMemory);

module.exports = router;
