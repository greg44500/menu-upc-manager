const mongoose = require('mongoose');
const asyncHandler = require('express-async-handler');
const bcrypt = require('bcryptjs');
const UserModel = require('../models/user.model');
const errorHandler = require('../middlewares/errorHandler');

const {
  isValidObjectId,
  canAccessOwnData
} = require('../helpers/user.helper');

// @desc : Get user Profile
// @Method : GET /api/users/profile
// @Access : private, superAdmin
const getUserProfile = asyncHandler(async (req, res, next) => {
  if (!isValidObjectId(req.user.id)) {
    return next(new Error("ID utilisateur invalide"));
  }

  const user = await UserModel.findById(req.user.id)
    .select('-password')

  if (!user) {
    return next(new Error("Utilisateur non trouvé"));
  }

  res.status(200).json({
    success: true,
    user
  });
});

// @Desc : update password
// @Method : PATCH /api/users/password
// @Access : private
const updatePassword = asyncHandler(async (req, res, next) => {
  const {
    newPassword
  } = req.body;
  const {
    id
  } = req.params;

  if (!isValidObjectId(id)) {
    return next(new Error("ID utilisateur invalide"));
  }

  const user = await UserModel.findById(id);
  if (!user) {
    return next(new Error("Utilisateur non trouvé"));
  }

  if (!canAccessOwnData(id, req.user.id)) {
    return next(new Error("Vous n'avez pas accés à ces données"));
  }

  // Hash du nouveau mot de passe avant de sauvegarder

  user.password = newPassword
  user.isTemporaryPassword = false
  await user.save();

  res.status(200).json({
    success: true,
    message: "Mot de passe mis à jour avec succès"
  });
});

// @desc : Get trainers list
// @Method : GET /api/users/
// @Access : superAdmin, manager
const getAllTeachers = asyncHandler(async (req, res) => {
  const teachers = await UserModel.find({
      role: 'user'
    })
    .select('-password')
    .sort({
      createdAt: -1
    });

  res.status(200).json({
    success: true,
    count: teachers.length,
    teachers: teachers.length ? teachers : "Aucun formateur trouvé",
  });
});

// @desc : Delete One trainer
// @Method : DELETE /api/users/:id
// @Access : superAdmin
const deleteTeacher = asyncHandler(async (req, res) => {
  const {
    id
  } = req.params;

  if (!isValidObjectId(id)) {
    return errorHandler(res, 400, "ID utilisateur invalide");
  }

  const teacher = await UserModel.findByIdAndDelete(id);
  if (!teacher) {
    return errorHandler(res, 404, "Formateur non trouvé");
  }

  res.status(200).json({
    success: true,
    message: "Formateur supprimé avec succès"
  });
});

module.exports = {
  getUserProfile,
  updatePassword,
  getAllTeachers,
  deleteTeacher
};