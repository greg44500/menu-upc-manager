const express = require('express');
const router = express.Router();

const {
    authenticateUser,
    authorizeRoles
} = require('../middlewares/auth.middlewares');

const { getUserProfile, updatePassword, requestPasswordReset, resetPassword } = require('../controllers/user.controllers');
const sendReminderEmails = require('../utils/sendReminderMails');
// Main User Profile Info Routes
router.get('/profile', authenticateUser, getUserProfile);
router.patch('/password/:id', authenticateUser, updatePassword);
// router.get('/logout', authenticateUser, logout); //authenticateUser


//** REQUEST AND RESET PASSWORD */
// Route pour demander la réinitialisation du mot de passe
router.post("/request-password-reset", requestPasswordReset);

// Route pour réinitialiser le mot de passe avec le token
router.post("/reset-password", resetPassword);

// Route pour rappeler le changement de mot de passe temporaire
router.post("/send-password-reminders", sendReminderEmails);
module.exports = router