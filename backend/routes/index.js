const express = require("express");
const router = express.Router();

router.get("/", function (req, res) {
  res.json({ message: "Assignment 4 Quiz API" });
});

module.exports = router;
