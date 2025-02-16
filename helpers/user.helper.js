const User = require("../models/user.model");
const mongoose = require("mongoose");

// Vérifie si l'utilisateur a accès à ses propres données
const canAccessOwnData = (userId, requestUserId) => {
  return userId === requestUserId;
};

// Vérifie si un manager tente de modifier un admin
const isManagerModifyingAdmin = async (userId, role) => {
  if (role === "manager") {
    const targetUser = await User.findById(userId);
    if (targetUser && targetUser.role === "admin") {
      return true; // Le manager ne peut pas modifier un admin
    }
  }
  return false;
};

// Vérifie si un manager tente de supprimer un utilisateur admin
const isManagerDeletingAdmin = async (userId, role) => {
  if (role === "manager") {
    const targetUser = await User.findById(userId);
    if (targetUser && targetUser.role === "admin") {
      return true; // Le manager ne peut pas supprimer un admin
    }
  }
  return false;
};

// Vérifie si l'ID de l'utilisateur est valide
const isValidObjectId = (id) => mongoose.isValidObjectId(id);

module.exports = {
  canAccessOwnData,
  isManagerModifyingAdmin,
  isManagerDeletingAdmin,
  isValidObjectId,
};