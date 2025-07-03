const User = require("../models/User")

// Obtener perfil del usuario actual
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password -refreshTokens")
    res.json(user)
  } catch (error) {
    console.error("Error obteniendo perfil:", error)
    res.status(500).json({ message: "Error interno del servidor" })
  }
}

// Actualizar perfil del usuario
const updateProfile = async (req, res) => {
  try {
    const { username, email } = req.body
    const user = await User.findById(req.user._id)

    // Verificar si el username o email ya existen (excluyendo el usuario actual)
    if (username && username !== user.username) {
      const existingUser = await User.findOne({ username, _id: { $ne: req.user._id } })
      if (existingUser) {
        return res.status(400).json({ message: "El nombre de usuario ya existe" })
      }
      user.username = username
    }

    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email, _id: { $ne: req.user._id } })
      if (existingUser) {
        return res.status(400).json({ message: "El email ya existe" })
      }
      user.email = email
    }

    await user.save()

    res.json({
      message: "Perfil actualizado exitosamente",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    })
  } catch (error) {
    console.error("Error actualizando perfil:", error)
    res.status(500).json({ message: "Error interno del servidor" })
  }
}

// Obtener todos los usuarios (solo admin)
const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, role, search } = req.query

    const filter = { isActive: true }

    if (role) filter.role = role
    if (search) {
      filter.$or = [{ username: { $regex: search, $options: "i" } }, { email: { $regex: search, $options: "i" } }]
    }

    const users = await User.find(filter)
      .select("-password -refreshTokens")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 })

    const total = await User.countDocuments(filter)

    res.json({
      users,
      pagination: {
        currentPage: Number.parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalUsers: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    })
  } catch (error) {
    console.error("Error obteniendo usuarios:", error)
    res.status(500).json({ message: "Error interno del servidor" })
  }
}

// Actualizar rol de usuario (solo admin)
const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body
    const { id } = req.params

    if (!["user", "admin"].includes(role)) {
      return res.status(400).json({ message: "Rol inválido" })
    }

    const user = await User.findById(id)
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" })
    }

    // No permitir que un admin se quite sus propios permisos
    if (user._id.equals(req.user._id) && role !== "admin") {
      return res.status(400).json({ message: "No puedes cambiar tu propio rol de admin" })
    }

    user.role = role
    await user.save()

    res.json({
      message: "Rol actualizado exitosamente",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    })
  } catch (error) {
    console.error("Error actualizando rol:", error)
    res.status(500).json({ message: "Error interno del servidor" })
  }
}

// Desactivar usuario (solo admin)
const deactivateUser = async (req, res) => {
  try {
    const { id } = req.params
    const user = await User.findById(id)

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" })
    }

    // No permitir que un admin se desactive a sí mismo
    if (user._id.equals(req.user._id)) {
      return res.status(400).json({ message: "No puedes desactivarte a ti mismo" })
    }

    user.isActive = false
    user.refreshTokens = [] // Cerrar todas las sesiones
    await user.save()

    res.json({ message: "Usuario desactivado exitosamente" })
  } catch (error) {
    console.error("Error desactivando usuario:", error)
    res.status(500).json({ message: "Error interno del servidor" })
  }
}

module.exports = {
  getProfile,
  updateProfile,
  getAllUsers,
  updateUserRole,
  deactivateUser,
}
