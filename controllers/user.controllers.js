const mongoose = require('mongoose');
const asyncHandler = require('express-async-handler');
const bcrypt = require('bcryptjs');
const crypto = require("crypto")
const UserModel = require('../models/user.model');
const sendMail = require('../utils/sendMail')
// const errorHandler = require('../middlewares/errorHandler');

const {
  isValidObjectId,
  canAccessOwnData
} = require('../helpers/user.helper');

// **@desc : Get user Profile
// **@Method : GET /api/users/profile
// **@Access : private, superAdmin
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

// **@Desc : update password
// **@Method : PATCH /api/users/password
// **@Access : private
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
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(newPassword, salt);
  user.isTemporaryPassword = false
  user.requirePasswordChange = false;
  await user.save();

  res.status(200).json({
    success: true,
    message: "Mot de passe mis à jour avec succès"
  });
});
// **@desc : Reset Password Request
// **@Method : POST /api/users/request-password-reset
// **@Access : Private
const requestPasswordReset = asyncHandler(async (req, res, next) => {
  const {
    email
  } = req.body;
  const user = await UserModel.findOne({
    email
  })

  if (!user) {
    res.status(404);
    throw new Error('Identité invalide');
  }

  // Générer un token sécurisé
  const resetToken = crypto.randomBytes(32).toString("hex");
  const resetTokenExpires = new Date(Date.now() + 24*3600000); // Expire dans 24H

  // Sauvegarder dans la base de données
  user.resetToken = resetToken;
  user.resetTokenExpires = resetTokenExpires;
  await user.save();


  // Envoyer un email avec le lien de réinitialisation (exemple simplifié)
  console.log(`Lien de réinitialisation: https://ton-site.com/reset-password?token=${resetToken}`);

  // URL de réinitialisation
  const resetUrl = `https://ton-site.com/reset-password?token=${resetToken}`;

  // (Optionnel) Envoyer l'email avec le lien de réinitialisation
  await sendMail(user.email, "Réinitialisation de votre mot de passe", `Cliquez sur ce lien pour réinitialiser votre mot de passe : ${resetUrl}`);

  // Envoyer une réponse JSON au client
  res.status(200).json({
    message: "Email de réinitialisation envoyé si l'utilisateur existe"
  });
})

//**  @desc : Reset password
//**  @Method : POST /api/users/reset-password
//**  @Access : Private

const resetPassword = asyncHandler(async (req, res, next) => {
  const {
    token,
    password
  } = req.body;
  const user = await UserModel.findOne({
    resetToken: token,
    resetTokenExpires: {
      $gt: Date.now()
    }, // Vérifier l'expiration
  });
  if (!user) {
    res.status(404);
    throw new Error('Identité invalide');
  }

  // Supprimer le resetToken après utilisation
  user.isTemporaryPassword = false;
  user.requirePasswordChange = false;
  user.password = password
  user.resetToken = undefined;
  user.resetTokenExpires = undefined;
  await user.save();
  res.json({
    message: "Mot de passe réinitialisé avec succès."
  });
})

// **@desc : Get trainers list
// **@Method : GET /api/users/
// **@Access : superAdmin, manager
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

// **@desc : Delete One trainer
// **@Method : DELETE /api/users/:id
// **@Access : superAdmin
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
  requestPasswordReset,
  resetPassword,
  getAllTeachers,
  deleteTeacher
};