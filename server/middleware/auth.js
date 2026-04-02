const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error("FATAL: JWT_SECRET is not defined in environment variables.");
  // In production, we must throw an error to prevent insecure operation.
  if (process.env.NODE_ENV === "production") {
    throw new Error("JWT_SECRET is missing");
  }
}


// Middleware to verify if the request has a valid JWT token
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, error: "Access denied. No token provided." });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { id, username, role }
    next();
  } catch (error) {
    return res.status(401).json({ success: false, error: "Invalid or expired token." });
  }
};

// Middleware to verify if the authenticated user is an admin
const isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ success: false, error: "Access forbidden. Admin privileges required." });
  }
  next();
};

module.exports = {
  verifyToken,
  isAdmin,
  JWT_SECRET,
};
