const mongoose = require('mongoose');
const asyncHandler = require('express-async-handler');
const Location = require('../models/location.model');


const {
    isValidObjectId,
    canAccessOwnData
} = require('../helpers/user.helper');

// ** @desc : Create location
// ** @Route : POST /api/locations/
// ** @Access : superAdmin
const createLocation = asyncHandler(async (req, res) => {
    const {
        name
    } = req.body;
    // Validation des champs requis
    if (!name) {

        return res.status(400).json({
            success: false,
            message: 'Tous les champs requis doivent être remplis'
        });
    }

    // Vérification de l'unicité de la ressource
    const existingLocation = await Location.findOne({
        name
    });
    if (existingLocation) {
        res.status(400);
        throw new Error('Local déjà existant')
    }
    try {

        const newLocation = new Location({
            name
        });

        const location = await newLocation.save();

        return res.status(201).json({
            success: true,
            message: 'Local créé avec succès',
            data: location,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Erreur lors de la création de l'utilisateur: ${error.message}`
        });
    }
});

// ** @Desc : update Location Name
// ** @Route : PUT /api/locations/:id
// ** @Access : superAdmin, manager

const updateLocation = asyncHandler(async (req, res, next) => {
    const {
        name,
    } = req.body
    const {
        id
    } = req.params
    if (!isValidObjectId(id)) {
        return next(new Error("ID Local invalide"));
    }

    const existingLocation = await Location.findById(id)
    if (!existingLocation) {
        return next(new Error("Ressource introuvable"));
    }

    // Mise à jour des champs modifiables uniquement s'ils sont présents dans la requête
    if (name) existingLocation.name = name.toUpperCase();

    // Sauvegarde en base de données
    await existingLocation.save();

    // Réponse avec la classe mise à jour
    res.status(200).json({
        message: "Local mise à jour avec succès",
        Location: existingLocation
    });
})

// ** @Desc : Get One Location
// ** @Route : PUT /api/locations/:id
// ** @Access : superAdmin, manager

const getOneLocation = asyncHandler(async (req, res, next) => {
    const {
        name,
    } = req.body
    const {
        id
    } = req.params
    if (!isValidObjectId(id)) {
        return next(new Error("ID Local invalide"));
    }

    const existingLocation = await Location.findById(id)
    if (!existingLocation) {
        return next(new Error("Ressource introuvable"));
    }

    // Réponse avec la classe mise à jour
    res.status(200).json({
        succress: true,
        Location: existingLocation
    });
})

// ** @Desc : Get All Locations
// ** @Route : GET /api/locations/
// ** @Access : superAdmin, manager

const getAllLocations = asyncHandler(async (req, res, next) => {

    const locations = await Location.find()
    if (!locations) {
        return next(new Error("Ressource introuvable"));
    }

    // Réponse avec la classe mise à jour
    res.status(200).json({
        success: true,
        count: locations.length,
        data: locations.length ? locations : "Aucun local trouvé",
    });
})
// ** @Desc : Delete One Location
// ** @Route : DELETE /api/locations/:id
// ** @Access : superAdmin, manager
const deleteOneLocation = asyncHandler(async (req, res, next) => {
    const {
        id
    } = req.params
    if (!isValidObjectId(id)) {
        return next(new Error("ID Local invalide"));
    }

    const existingLocation = await Location.findByIdAndDelete(id)
    if (!existingLocation) {
        return next(new Error("Ressource introuvable"));
    }

    // Réponse avec la classe mise à jour
    res.status(200).json({
        message: "Local supprimé avec succès",
    });
})
// ** @Desc : Delete All Locations
// ** @Route : DELETE /api/locations
// ** @Access : superAdmin, manager
const deleAllLocations = asyncHandler(async (req, res, next) => {

    const locations = await Location.deleteMany()
    if (!locations) {
        return next(new Error("Ressource introuvable"));
    }

    // Réponse avec la classe mise à jour
    res.status(200).json({
        message: "Locaux supprimés avec succès",
    });
})

module.exports = {
    createLocation,
    updateLocation,
    getOneLocation,
    getAllLocations,
    deleteOneLocation,
    deleAllLocations
}