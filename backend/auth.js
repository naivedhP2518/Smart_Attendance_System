const express = require("express");
const { getDB } = require("./db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || "campusconnect_secret_key_change_in_production";
const JWT_EXPIRES_IN = "8h";

// ─── Middleware: Verify JWT Token ────────────────────────────────────────────
const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer <token>

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Access denied. No token provided.",
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({
      success: false,
      message: "Invalid or expired token.",
    });
  }
};

// ─── Middleware: Role Guard ───────────────────────────────────────────────────
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${roles.join(" or ")}.`,
      });
    }
    next();
  };
};

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
// Body: { uniqueId, password, role }
// role must be either "student" or "faculty"
router.post("/login", async (req, res) => {
  try {
    const { uniqueId, password, role } = req.body;

    // ── Validate input ──────────────────────────────────────────────────────
    if (!uniqueId || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "uniqueId, password, and role are required.",
      });
    }

    const normalizedRole = role.toLowerCase();
    if (!["student", "faculty"].includes(normalizedRole)) {
      return res.status(400).json({
        success: false,
        message: "Role must be either 'student' or 'faculty'.",
      });
    }

    // ── Fetch user from the correct collection ──────────────────────────────
    const db = getDB();
    const collection = db.collection(
      normalizedRole === "student" ? "students" : "faculty"
    );

    const user = await collection.findOne({ uniqueId: uniqueId.trim() });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Wrong ID or Password.",
      });
    }

    // ── Verify password (supports both bcrypt-hashed and plain for seeding) ──
    let passwordMatch = false;

    if (user.password.startsWith("$2")) {
      // bcrypt hash
      passwordMatch = await bcrypt.compare(password, user.password);
    } else {
      // plain text (only for initial seed — hash passwords in production!)
      passwordMatch = password === user.password;
    }

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Wrong ID or Password.",
      });
    }

    // ── Build JWT payload ───────────────────────────────────────────────────
    const payload = {
      id: user._id,
      uniqueId: user.uniqueId,
      name: user.name,
      role: normalizedRole,
      ...(normalizedRole === "student" && {
        branch: user.branch,
        semester: user.semester,
      }),
      ...(normalizedRole === "faculty" && {
        department: user.department,
      }),
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      token,
      user: payload,
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
});

// ─── GET /api/auth/me ─────────────────────────────────────────────────────────
// Returns the currently logged-in user's info from the token
router.get("/me", verifyToken, (req, res) => {
  return res.status(200).json({
    success: true,
    user: req.user,
  });
});

// ─── POST /api/auth/logout ────────────────────────────────────────────────────
// JWT is stateless; logout is handled client-side by deleting the token.
// This endpoint is provided for a clean API contract.
router.post("/logout", verifyToken, (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Logged out successfully. Please delete the token on the client.",
  });
});

module.exports = { router, verifyToken, requireRole };
