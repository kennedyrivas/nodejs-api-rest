const express = require("express")
const router = express.Router()
const taskController = require("../controllers/taskController")
const { authenticateToken, authorizeRoles } = require("../middleware/auth")
const { validateTask } = require("../middleware/validation")

// Todas las rutas requieren autenticación
router.use(authenticateToken)

// Rutas para tareas
router.get("/", taskController.getTasks)
router.get("/stats", authorizeRoles("admin"), taskController.getTaskStats)
router.get("/:id", taskController.getTaskById)
router.post("/", validateTask, taskController.createTask)
router.put("/:id", validateTask, taskController.updateTask)
router.delete("/:id", taskController.deleteTask)

module.exports = router
