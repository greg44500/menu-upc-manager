const mongoose = require('mongoose');
const asyncHandler = require('express-async-handler');
const ProductionType = require('../models/productionType.model');


const {
    isValidObjectId,
    canAccessOwnData
} = require('../helpers/user.helper');

// ** @desc : Create Service Type
// ** @Route : POST /api/productionTypes
// ** @Access : superAdmin
const createProductionType = asyncHandler(async (req, res) => {
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
    const existingProductionType = await ProductionType.findOne({
        name
    });
    if (existingProductionType) {
        res.status(400);
        throw new Error('Local déjà existant')
    }
    try {

        const newProductionType = new ProductionType({
            name
        });

        const productionType = await newProductionType.save();

        return res.status(201).json({
            success: true,
            message: 'Nouveau type de production créé avec succès',
            data: productionType,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Erreur lors de la création de l'utilisateur: ${error.message}`
        });
    }
});

// ** @Desc : update ProductionType Name
// ** @Route : PUT /api/production-type/:id
// ** @Access : superAdmin, manager

const updateProductionType = asyncHandler(async (req, res, next) => {
    const {
        name,
    } = req.body
    const {
        id
    } = req.params
    if (!isValidObjectId(id)) {
        return next(new Error("ID Type de production invalide"));
    }

    const existingProductionType = await ProductionType.findById(id)
    if (!existingProductionType) {
        return next(new Error("Ressource introuvable"));
    }

    // Mise à jour des champs modifiables uniquement s'ils sont présents dans la requête
    if (name) existingProductionType.name = name.toUpperCase();

    // Sauvegarde en base de données
    await existingProductionType.save();

    // Réponse avec la classe mise à jour
    res.status(200).json({
        message: "Local mise à jour avec succès",
        data: existingProductionType
    });
})

// ** @Desc : Get One Production Type
// ** @Route : GET /api/locations/:id
// ** @Access : superAdmin, manager

const getOneProductionType = asyncHandler(async (req, res, next) => {
    const {
        name,
    } = req.body
    const {
        id
    } = req.params
    if (!isValidObjectId(id)) {
        return next(new Error("ID Type de production invalide"));
    }

    const existingProductionType = await ProductionType.findById(id)
    if (!existingProductionType) {
        return next(new Error("Ressource introuvable"));
    }

    // Réponse avec la classe mise à jour
    res.status(200).json({
        succress: true,
        data : existingProductionType
    });
})

// ** @Desc : Get All Production Type
// ** @Route : GET /api/locations/
// ** @Access : superAdmin, manager

const getAllProductionTypes = asyncHandler(async (req, res, next) => {

    const productionTypes = await ProductionType.find()
    if (!productionTypes) {
        return next(new Error("Ressource introuvable"));
    }

    // Réponse avec la classe mise à jour
    res.status(200).json({
        success: true,
        count: productionTypes.length,
        data: productionTypes.length ? productionTypes : "Aucun type de production trouvé",
    });
})
// ** @Desc : Delete All Production Type
// ** @Route : DELETE /api/locations/:id
// ** @Access : superAdmin, manager
const deleteOneProductionType = asyncHandler(async (req, res, next) => {
    const {
        id
    } = req.params
    if (!isValidObjectId(id)) {
        return next(new Error("ID type de production invalide"));
    }

    const existingProductionType = await ProductionType.findByIdAndDelete(id)
    if (!existingProductionType) {
        return next(new Error("Ressource introuvable"));
    }

    // Réponse avec la classe mise à jour
    res.status(200).json({
        message: "Type de production supprimé avec succès",
    });
})
// ** @Desc : Delete All Production Type - RAZ
// ** @Route : DELETE /api/locations/
// ** @Access : superAdmin, manager
const deleteAllProductionTypes = asyncHandler(async (req, res, next) => {

    const productionTypes = await ProductionType.deleteMany()
    if (!productionTypes) {
        return next(new Error("Ressource introuvable"));
    }

    // Réponse avec la classe mise à jour
    res.status(200).json({
        message: "Locaux supprimés avec succès",
    });
})

module.exports = {
    createProductionType,
    updateProductionType,
    getOneProductionType,
    getAllProductionTypes,
    deleteOneProductionType,
    deleteAllProductionTypes
}