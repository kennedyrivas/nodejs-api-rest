const Task = require("../models/Task")
const User = require("../models/User")

// Obtener todas las tareas
const getTasks = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, priority, sortBy = "createdAt", sortOrder = "desc" } = req.query

    // Construir filtros
    const filter = { isActive: true }

    // Los usuarios normales solo ven sus tareas
    if (req.user.role !== "admin") {
      filter.$or = [{ createdBy: req.user._id }, { assignedTo: req.user._id }]
    }

    if (status) filter.status = status
    if (priority) filter.priority = priority

    // Opciones de paginación y ordenamiento
    const options = {
      page: Number.parseInt(page),
      limit: Number.parseInt(limit),
      sort: { [sortBy]: sortOrder === "desc" ? -1 : 1 },
      populate: [
        { path: "createdBy", select: "username email" },
        { path: "assignedTo", select: "username email" },
      ],
    }

    const tasks = await Task.find(filter)
      .populate(options.populate)
      .sort(options.sort)
      .limit(options.limit * 1)
      .skip((options.page - 1) * options.limit)

    const total = await Task.countDocuments(filter)

    res.json({
      tasks,
      pagination: {
        currentPage: options.page,
        totalPages: Math.ceil(total / options.limit),
        totalTasks: total,
        hasNext: options.page < Math.ceil(total / options.limit),
        hasPrev: options.page > 1,
      },
    })
  } catch (error) {
    console.error("Error obteniendo tareas:", error)
    res.status(500).json({ message: "Error interno del servidor" })
  }
}

// Obtener tarea por ID
const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate("createdBy", "username email")
      .populate("assignedTo", "username email")

    if (!task || !task.isActive) {
      return res.status(404).json({ message: "Tarea no encontrada" })
    }

    // Verificar permisos
    if (
      req.user.role !== "admin" &&
      !task.createdBy._id.equals(req.user._id) &&
      (!task.assignedTo || !task.assignedTo._id.equals(req.user._id))
    ) {
      return res.status(403).json({ message: "No tienes permisos para ver esta tarea" })
    }

    res.json(task)
  } catch (error) {
    console.error("Error obteniendo tarea:", error)
    res.status(500).json({ message: "Error interno del servidor" })
  }
}

// Crear nueva tarea
const createTask = async (req, res) => {
  try {
    const { title, description, status, priority, dueDate, assignedTo, tags } = req.body

    // Verificar si el usuario asignado existe
    if (assignedTo) {
      const assignedUser = await User.findById(assignedTo)
      if (!assignedUser) {
        return res.status(400).json({ message: "Usuario asignado no encontrado" })
      }
    }

    const task = new Task({
      title,
      description,
      status,
      priority,
      dueDate,
      assignedTo,
      tags,
      createdBy: req.user._id,
    })

    await task.save()
    await task.populate([
      { path: "createdBy", select: "username email" },
      { path: "assignedTo", select: "username email" },
    ])

    res.status(201).json({
      message: "Tarea creada exitosamente",
      task,
    })
  } catch (error) {
    console.error("Error creando tarea:", error)
    res.status(500).json({ message: "Error interno del servidor" })
  }
}

// Actualizar tarea
const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)

    if (!task || !task.isActive) {
      return res.status(404).json({ message: "Tarea no encontrada" })
    }

    // Verificar permisos
    if (req.user.role !== "admin" && !task.createdBy.equals(req.user._id)) {
      return res.status(403).json({ message: "No tienes permisos para actualizar esta tarea" })
    }

    const { title, description, status, priority, dueDate, assignedTo, tags } = req.body

    // Verificar si el usuario asignado existe
    if (assignedTo && assignedTo !== task.assignedTo?.toString()) {
      const assignedUser = await User.findById(assignedTo)
      if (!assignedUser) {
        return res.status(400).json({ message: "Usuario asignado no encontrado" })
      }
    }

    // Actualizar campos
    if (title !== undefined) task.title = title
    if (description !== undefined) task.description = description
    if (status !== undefined) task.status = status
    if (priority !== undefined) task.priority = priority
    if (dueDate !== undefined) task.dueDate = dueDate
    if (assignedTo !== undefined) task.assignedTo = assignedTo
    if (tags !== undefined) task.tags = tags

    await task.save()
    await task.populate([
      { path: "createdBy", select: "username email" },
      { path: "assignedTo", select: "username email" },
    ])

    res.json({
      message: "Tarea actualizada exitosamente",
      task,
    })
  } catch (error) {
    console.error("Error actualizando tarea:", error)
    res.status(500).json({ message: "Error interno del servidor" })
  }
}

// Eliminar tarea (soft delete)
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)

    if (!task || !task.isActive) {
      return res.status(404).json({ message: "Tarea no encontrada" })
    }

    // Verificar permisos
    if (req.user.role !== "admin" && !task.createdBy.equals(req.user._id)) {
      return res.status(403).json({ message: "No tienes permisos para eliminar esta tarea" })
    }

    task.isActive = false
    await task.save()

    res.json({ message: "Tarea eliminada exitosamente" })
  } catch (error) {
    console.error("Error eliminando tarea:", error)
    res.status(500).json({ message: "Error interno del servidor" })
  }
}

// Obtener estadísticas de tareas (solo admin)
const getTaskStats = async (req, res) => {
  try {
    const stats = await Task.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          pending: { $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] } },
          inProgress: { $sum: { $cond: [{ $eq: ["$status", "in-progress"] }, 1, 0] } },
          completed: { $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] } },
          highPriority: { $sum: { $cond: [{ $eq: ["$priority", "high"] }, 1, 0] } },
          mediumPriority: { $sum: { $cond: [{ $eq: ["$priority", "medium"] }, 1, 0] } },
          lowPriority: { $sum: { $cond: [{ $eq: ["$priority", "low"] }, 1, 0] } },
        },
      },
    ])

    res.json(
      stats[0] || {
        total: 0,
        pending: 0,
        inProgress: 0,
        completed: 0,
        highPriority: 0,
        mediumPriority: 0,
        lowPriority: 0,
      },
    )
  } catch (error) {
    console.error("Error obteniendo estadísticas:", error)
    res.status(500).json({ message: "Error interno del servidor" })
  }
}

module.exports = {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  getTaskStats,
}
