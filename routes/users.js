const express = require("express")
const router = express.Router()
const userController = require("../controllers/userController")
const { authenticateToken, authorizeRoles } = require("../middleware/auth")

// Todas las rutas requieren autenticación
router.use(authenticateToken)

// Rutas para el perfil del usuario
router.get("/profile", userController.getProfile)
router.put("/profile", userController.updateProfile)

// Rutas solo para admin
router.get("/", authorizeRoles("admin"), userController.getAllUsers)
router.put("/:id/role", authorizeRoles("admin"), userController.updateUserRole)
router.delete("/:id", authorizeRoles("admin"), userController.deactivateUser)

module.exports = router
