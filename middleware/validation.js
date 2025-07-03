const { body, validationResult } = require("express-validator")

// Middleware para manejar errores de validación
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: "Errores de validación",
      errors: errors.array(),
    })
  }
  next()
}

// Validaciones para registro de usuario
const validateUserRegistration = [
  body("username")
    .isLength({ min: 3, max: 30 })
    .withMessage("El nombre de usuario debe tener entre 3 y 30 caracteres")
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage("El nombre de usuario solo puede contener letras, números y guiones bajos"),

  body("email").isEmail().withMessage("Email inválido").normalizeEmail(),

  body("password")
    .isLength({ min: 6 })
    .withMessage("La contraseña debe tener al menos 6 caracteres")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage("La contraseña debe contener al menos una minúscula, una mayúscula y un número"),

  handleValidationErrors,
]

// Validaciones para login
const validateUserLogin = [
  body("email").isEmail().withMessage("Email inválido").normalizeEmail(),

  body("password").notEmpty().withMessage("La contraseña es requerida"),

  handleValidationErrors,
]

// Validaciones para tareas
const validateTask = [
  body("title").isLength({ min: 1, max: 100 }).withMessage("El título debe tener entre 1 y 100 caracteres").trim(),

  body("description")
    .optional()
    .isLength({ max: 500 })
    .withMessage("La descripción no puede exceder 500 caracteres")
    .trim(),

  body("status").optional().isIn(["pending", "in-progress", "completed"]).withMessage("Estado inválido"),

  body("priority").optional().isIn(["low", "medium", "high"]).withMessage("Prioridad inválida"),

  body("dueDate").optional().isISO8601().withMessage("Fecha inválida"),

  handleValidationErrors,
]

module.exports = {
  validateUserRegistration,
  validateUserLogin,
  validateTask,
  handleValidationErrors,
}
