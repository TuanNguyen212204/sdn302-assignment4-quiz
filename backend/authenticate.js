const jwt = require("jsonwebtoken");
const User = require("./models/user");

function getToken(user) {
  return jwt.sign({ id: user._id.toString() }, process.env.JWT_SECRET, {
    algorithm: "HS256",
    expiresIn: "2h",
  });
}

async function verifyUser(req, res, next) {
  const authorization = req.headers.authorization || "";
  if (!authorization.startsWith("Bearer ")) {
    res.status(401).json({ message: "Please log in first" });
    return;
  }
  let payload;
  try {
    const token = authorization.slice(7);
    payload = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ["HS256"],
    });
  } catch {
    res
      .status(401)
      .json({ message: "Your session has expired. Please log in again" });
    return;
  }
  try {
    const user = await User.findById(payload.id);
    if (!user) {
      res.status(401).json({ message: "User not found. Please log in again" });
      return;
    }
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}

function verifyAdmin(req, res, next) {
  if (!req.user || !req.user.admin) {
    res
      .status(403)
      .json({ message: "You are not authorized to perform this operation!" });
    return;
  }
  next();
}

module.exports = { getToken, verifyUser, verifyAdmin };
