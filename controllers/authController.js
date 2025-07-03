const User = require("../models/User")
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require("../utils/jwt")

// Registro de usuario
const register = async (req, res) => {
  try {
    const { username, email, password, role } = req.body

    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    })

    if (existingUser) {
      return res.status(400).json({
        message: "El usuario o email ya existe",
      })
    }

    // Crear nuevo usuario
    const user = new User({
      username,
      email,
      password,
      role: role || "user",
    })

    await user.save()

    // Generar tokens
    const accessToken = generateAccessToken(user._id)
    const refreshToken = generateRefreshToken(user._id)

    // Guardar refresh token
    user.refreshTokens.push({ token: refreshToken })
    await user.save()

    res.status(201).json({
      message: "Usuario registrado exitosamente",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      accessToken,
      refreshToken,
    })
  } catch (error) {
    console.error("Error en registro:", error)
    res.status(500).json({ message: "Error interno del servidor" })
  }
}

// Login de usuario
const login = async (req, res) => {
  try {
    const { email, password } = req.body

    // Buscar usuario
    const user = await User.findOne({ email, isActive: true })
    if (!user) {
      return res.status(401).json({ message: "Credenciales inválidas" })
    }

    // Verificar contraseña
    const isPasswordValid = await user.comparePassword(password)
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Credenciales inválidas" })
    }

    // Limpiar tokens expirados
    user.cleanExpiredTokens()

    // Generar nuevos tokens
    const accessToken = generateAccessToken(user._id)
    const refreshToken = generateRefreshToken(user._id)

    // Guardar refresh token
    user.refreshTokens.push({ token: refreshToken })
    await user.save()

    res.json({
      message: "Login exitoso",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      accessToken,
      refreshToken,
    })
  } catch (error) {
    console.error("Error en login:", error)
    res.status(500).json({ message: "Error interno del servidor" })
  }
}

// Renovar token
const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body

    if (!refreshToken) {
      return res.status(401).json({ message: "Refresh token requerido" })
    }

    // Verificar refresh token
    const decoded = verifyRefreshToken(refreshToken)
    const user = await User.findById(decoded.userId)

    if (!user || !user.isActive) {
      return res.status(401).json({ message: "Usuario no válido" })
    }

    // Verificar si el refresh token existe en la base de datos
    const tokenExists = user.refreshTokens.some((tokenObj) => tokenObj.token === refreshToken)
    if (!tokenExists) {
      return res.status(401).json({ message: "Refresh token inválido" })
    }

    // Limpiar tokens expirados
    user.cleanExpiredTokens()

    // Generar nuevo access token
    const newAccessToken = generateAccessToken(user._id)
    const newRefreshToken = generateRefreshToken(user._id)

    // Remover el refresh token usado y agregar el nuevo
    user.refreshTokens = user.refreshTokens.filter((tokenObj) => tokenObj.token !== refreshToken)
    user.refreshTokens.push({ token: newRefreshToken })
    await user.save()

    res.json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    })
  } catch (error) {
    console.error("Error renovando token:", error)
    res.status(401).json({ message: "Refresh token inválido" })
  }
}

// Logout
const logout = async (req, res) => {
  try {
    const { refreshToken } = req.body
    const user = await User.findById(req.user.id)

    if (refreshToken && user) {
      // Remover el refresh token específico
      user.refreshTokens = user.refreshTokens.filter((tokenObj) => tokenObj.token !== refreshToken)
      await user.save()
    }

    res.json({ message: "Logout exitoso" })
  } catch (error) {
    console.error("Error en logout:", error)
    res.status(500).json({ message: "Error interno del servidor" })
  }
}

// Logout de todos los dispositivos
const logoutAll = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
    user.refreshTokens = []
    await user.save()

    res.json({ message: "Logout de todos los dispositivos exitoso" })
  } catch (error) {
    console.error("Error en logout all:", error)
    res.status(500).json({ message: "Error interno del servidor" })
  }
}

module.exports = {
  register,
  login,
  refreshToken,
  logout,
  logoutAll,
}
