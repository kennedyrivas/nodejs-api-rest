const jwt = require("jsonwebtoken")
const User = require("../models/User")

// Middleware para verificar token de acceso
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"]
    const token = authHeader && authHeader.split(" ")[1] // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ message: "Token de acceso requerido" })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.userId).select("-password -refreshTokens")

    if (!user || !user.isActive) {
      return res.status(401).json({ message: "Usuario no válido" })
    }

    req.user = user
    next()
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expirado" })
    }
    return res.status(403).json({ message: "Token inválido" })
  }
}

// Middleware para verificar roles
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Usuario no autenticado" })
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: "No tienes permisos para realizar esta acción",
      })
    }

    next()
  }
}

// Middleware para verificar si el usuario puede acceder al recurso
const checkResourceOwnership = (resourceField = "createdBy") => {
  return (req, res, next) => {
    // Los admins pueden acceder a cualquier recurso
    if (req.user.role === "admin") {
      return next()
    }

    // Para usuarios normales, verificar ownership en el siguiente middleware
    req.checkOwnership = resourceField
    next()
  }
}

module.exports = {
  authenticateToken,
  authorizeRoles,
  checkResourceOwnership,
}
