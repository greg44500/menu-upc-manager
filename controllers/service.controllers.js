const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const Progression = require('../models/progression.model');

// @desc    Obtenir toutes les progressions
// @route   GET /api/progressions
// @access  Admin, Manager
const getServices = asyncHandler(async (req, res) => {
    const {
        progressionId
    } = req.params;

    // Vérifier si l'ID est valide
    if (!mongoose.Types.ObjectId.isValid(progressionId)) {
        res.status(400);
        throw new Error('ID de progression invalide');
    }

    // Récupérer la progression avec les services populés
    const progression = await Progression.findById(progressionId)
        .populate({
            path: 'services', //
            select: 'items isMenuValidate isRestaurant author'
        })
        .lean();

    if (!progression) {
        res.status(404);
        throw new Error('Progression non trouvée');
    }

    // Filtrer par numéro de semaine si spécifié
    const {
        weekNumber
    } = req.query;
    let services = progression.services;

    if (weekNumber) {
        services = services.filter(service => service.weekNumber === parseInt(weekNumber));
    }

    res.status(200).json({
        success: true,
        count: services.length,
        data: services.length ? services : []
    });
});

module.exports = {
    getServices
}