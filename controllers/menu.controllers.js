const mongoose = require ('mongoose')
const Menu = require('../models/menu.model')
const asyncHandler = require('express-async-handler')
// ** @desc    Créer un nouveau Menu (unique)
// ** @route   POST /api/menus
// ** @access  Formateur, Manager, Admin
const asyncHandler = require("express-async-handler");
const Menu = require("../models/menuModel");
const Service = require("../models/serviceModel");

// @desc    Créer un menu
// @route   POST /api/menus
// @access  Private (seuls les utilisateurs connectés peuvent créer un menu)
const createMenu = asyncHandler(async (req, res) => {
    const { serviceId, items, isRestaurant } = req.body;
    const userId = req.user._id; // Récupération de l'utilisateur connecté

    // Vérifier si le service existe
    const service = await Service.findById(serviceId);
    if (!service) {
        res.status(404);
        throw new Error("Service non trouvé");
    }

    // Vérifier si un menu existe déjà pour ce service
    const existingMenu = await Menu.findOne({ service: serviceId });
    if (existingMenu) {
        res.status(400);
        throw new Error("Un menu existe déjà pour ce service");
    }

    // Création du menu
    const menu = new Menu({
        service: serviceId,
        items: items || [],
        isRestaurant: isRestaurant || false,
        author: userId
    });

    // Sauvegarde du menu
    const createdMenu = await menu.save();

    // Mise à jour du service avec l'ID du menu
    service.menu = createdMenu._id;
    await service.save();

    res.status(201).json(createdMenu);
});

module.exports = { createMenu };
