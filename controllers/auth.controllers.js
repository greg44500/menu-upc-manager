const asyncHandler = require('express-async-handler')
const mongoose = require('mongoose'); // isValidObjectId
const userHelper = require('../helpers/user.helper');
const User = require("../models/user.model")
const Session = require('../models/session.model');
const jwt = require('jsonwebtoken');

const createUser = asyncHandler(async (req, res) => {
    const {
        firstname,
        lastname,
        email,
        password,
        role,
        isActive,
        specialization,
        assignedClasses,
        replacementClasses,
        assignedProgressions,
        replacementProgressions
    } = req.body;

    // Validation des champs requis
    if (!firstname || !lastname || !email || !password || !role || !specialization) {
        return res.status(400).json({
            success: false,
            message: 'Tous les champs requis doivent être remplis'
        });
    }

    // Regex pour valider l'email
    const emailRegex = /^[a-zA-Z0-9._%+-]+@citeformations\.com$/;
    if (!emailRegex.test(email)) {
        res.status(400);
        throw new Error("Format d'email invalide")
    }

    // Vérification de l'unicité de l'email
    const existingUser = await User.findOne({
        email
    });
    if (existingUser) {
        res.status(400);
        throw new Error('Compte/Email déjà existant')
    }
    try {
        const newUser = new User({
            firstname,
            lastname,
            email,
            password,
            role,
            isActive,
            specialization,
            isTemporaryPassword: true,
            temporaryPasswordExpires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),// 1 mois
            assignedClasses: assignedClasses || [],
            replacementClasses: replacementClasses || [],
            assignedProgressions: assignedProgressions || [],
            replacementProgressions: replacementProgressions || [],
        });

        const user = await newUser.save();

        // // Nettoyage des données sensibles
        // const userResponse = savedUser.toObject();
        // delete userResponse.password;

        return res.status(201).json({
            success: true,
            message: 'Utilisateur créé avec succès',
            data: user
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Erreur lors de la création de l'utilisateur: ${error.message}`
        });
    }
})
const login = asyncHandler(async (req, res) => {
    const {
        email,
        password
    } = req.body;

    // Vérification des champs requis
    if (!email || !password) {
        res.status(400);
        throw new Error('Email et mot de passe requis');
    }

    // Recherche de l'utilisateur
    const user = await User.findOne({
        email
    });
    if (!user) {
        res.status(401);
        throw new Error('Email ou mot de passe incorrect');
    }

    // Vérification du mot de passe
    const isPasswordValid = await user.matchPassword(password);
    console.log(isPasswordValid)
    if (!isPasswordValid) {
        res.status(401);
        throw new Error('Email ou mot de passe incorrect');
    }
    // Vérification du type de mmot de passe (temporaire et expiré ou non) 
    const now = new Date()
    if (user.temporaryPasswordExpires < now) {
        res.status(401);
        throw new Error('Votre mot de passe a expiré');
    }
    // Vérifier si c'est un mot de passe temporaire
    const mustChangePassword = user.isTemporaryPassword;
    if (mustChangePassword === true) {
        console.log("Votre mot de passe est temporaire, changez le avant l'expiration !!!")
    }
    // Création d'une nouvelle session
    const session = new Session({
        userId: user._id,
        lastActivity: new Date(),
        isActive: true
    });
    await session.save();

    // Création du token JWT
    const token = jwt.sign({
            userId: user._id,
            sessionId: session._id
        },
        process.env.JWT_SECRET, {
            expiresIn: '24h'
        }
    );

    // Configuration du cookie
    res.cookie('jwt', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000
    });

    // Si mot de passe temporaire
    if (user.isTemporaryPassword) {
        return res.status(200).json({
            success: true,
            message: 'Connexion réussie - Changement de mot de passe requis',
            requirePasswordChange: true,
            user: {
                id: user._id,
                firstname: user.firstname,
                lastname: user.lastname,
                email: user.email,
                role: user.role,
                specialization: user.specialization,

            }
        });
    }

    // Réponse standard
    res.status(200).json({
        success: true,
        message: 'Connexion réussie',
        user: {
            id: user._id,
            firstname: user.firstname,
            lastname: user.lastname,
            email: user.email,
            role: user.role,
            specialization: user.specialization
        }
    });
});

// Contrôleur pour la déconnexion de l'utilisateur
const logout = asyncHandler(async (req, res) => {
    const token = req.cookies.jwt;

    if (!token) {
        res.status(400);
        throw new Error("Aucune session active");
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Désactiver la session
        const session = await Session.findOneAndUpdate({
            _id: decoded.sessionId,
            isActive: true
        }, {
            isActive: false,
            lastActivity: new Date()
        });

        if (!session) {
            res.status(404);
            throw new Error("Session non trouvée");
        }

        // Supprimer le cookie contenant le token
        res.cookie("token", "", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            expires: new Date(0),
        });

        res.status(200).json({
            message: "Déconnexion réussie"
        });
    } catch (error) {

        if (error instanceof jwt.JsonWebTokenError) {
            res.status(401);

            throw new Error("Token invalide");
        }
        if (error instanceof jwt.TokenExpiredError) {
            res.status(401);

            throw new Error("Token expiré");
        }
        throw error; // Laisser l'errorHandler gérer les autres erreurs

    }
});

module.exports = {
    createUser,
    login,
    logout
};