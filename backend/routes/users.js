const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/user");
const authenticate = require("../authenticate");

const router = express.Router();

router.post("/register", async function (req, res) {
  const username = req.body.username;
  const password = req.body.password;

  if (
    typeof username !== "string" ||
    !username.trim() ||
    username.trim().length > 50
  ) {
    res
      .status(400)
      .json({ message: "Enter a username with 1 to 50 characters" });
    return;
  }
  if (
    typeof password !== "string" ||
    password.length < 6 ||
    Buffer.byteLength(password) > 72
  ) {
    res
      .status(400)
      .json({
        message:
          "Password must have at least 6 characters and at most 72 bytes",
      });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  // Public signup always creates a regular user. Admin is provisioned by seed.
  const user = await User.create({
    username: username.trim(),
    password: passwordHash,
    admin: false,
  });
  res.status(201).json({ user: user });
});

router.post("/login", async function (req, res) {
  const username = req.body.username;
  const password = req.body.password;
  if (typeof username !== "string" || typeof password !== "string") {
    res.status(400).json({ message: "Username and password are required" });
    return;
  }

  const user = await User.findOne({ username: username.trim() }).select(
    "+password",
  );
  if (!user) {
    res.status(401).json({ message: "Invalid username or password" });
    return;
  }
  const passwordMatches = await bcrypt.compare(password, user.password);
  if (!passwordMatches) {
    res.status(401).json({ message: "Invalid username or password" });
    return;
  }

  const token = authenticate.getToken(user);
  res.json({ token: token, user: user });
});

router.get("/me", authenticate.verifyUser, function (req, res) {
  res.json({ user: req.user });
});

module.exports = router;
