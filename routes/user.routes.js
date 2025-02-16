const express = require('express');
const router = express.Router();

const {
    authenticateUser,
    authorizeRoles
} = require('../middlewares/auth.middlewares');

const { getUserProfile, updatePassword } = require('../controllers/user.controllers');
// Main User Profile Info Routes
router.get('/profile', authenticateUser, getUserProfile);
router.patch('/password/:id', authenticateUser, updatePassword);
// router.get('/logout', authenticateUser, logout); //authenticateUser

module.exports = router