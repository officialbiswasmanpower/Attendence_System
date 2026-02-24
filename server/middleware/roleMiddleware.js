import jwt from "jsonwebtoken";


// 🔐 Verify JWT Token
export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded; // { id, role }
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};



// 🎭 Allow Specific Roles (Flexible)
export const allowRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }
    next();
  };
};



// 👑 Only Superadmin
export const allowSuperAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "superadmin") {
    return res.status(403).json({ message: "Superadmin access only" });
  }
  next();
};



// 🛡 Admin Panel Access (admin + subadmin + superadmin)
export const allowAdminAccess = (req, res, next) => {
  if (
    !req.user ||
    !["admin", "subadmin", "superadmin"].includes(req.user.role)
  ) {
    return res.status(403).json({ message: "Admin access only" });
  }
  next();
};