const express = require("express")
const router = express.Router()
const authController = require("../controllers/authController")
const { authenticateToken } = require("../middleware/auth")
const { validateUserRegistration, validateUserLogin } = require("../middleware/validation")

// Rutas públicas
router.post("/register", validateUserRegistration, authController.register)
router.post("/login", validateUserLogin, authController.login)
router.post("/refresh-token", authController.refreshToken)

// Rutas protegidas
router.post("/logout", authenticateToken, authController.logout)
router.post("/logout-all", authenticateToken, authController.logoutAll)

module.exports = router
