const express = require('express');
const router = express.Router();

const {
    authenticateUser,
    authorizeRoles
} = require('../middlewares/auth.middlewares');
const {
    createUser,
    login,
    logout
} = require('../Controllers/auth.controllers');
// Routes d'authentification de base
router.post('/create-user', createUser);
router.post('/login', login);
router.get('/logout', authenticateUser, logout); //authenticateUser

module.exports = router