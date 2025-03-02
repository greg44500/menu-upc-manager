const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const Progression = require('../models/progression.model');

// **@desc    Obtenir tous les services
// **@route   GET /api/progressions/:progressionId/services
// **@access  Admin, Manager
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

// ** @desc    Modifier un service (Admin) ou un menu (User)
// ** @route   PUT /api/progressions/:progressionId/services/:serviceId
// ** @access  Private (User → menu uniquement, Admin → tout)
const updateServiceOrMenu = asyncHandler(async (req, res) => {
    const { progressionId, serviceId } = req.params;
    const { role, _id: userId } = req.user; // Rôle et ID de l'utilisateur récupérés via le middleware d'authentification
    const updateData = req.body;

    // Récupération optimisée de la progression
    const progression = await Progression.findById(progressionId)
        .select('services')
        .lean();
        
    if (!progression) {
        res.status(404);
        throw new Error("Progression non trouvée");
    }

    // Vérification de l'existence du service dans cette progression
    const serviceIndex = progression.services.findIndex(
        (s) => s.service.toString() === serviceId
    );
    
    if (serviceIndex === -1) {
        res.status(404);
        throw new Error("Service non trouvé dans cette progression");
    }

    // Traitement selon le rôle de l'utilisateur
    if (role === "admin") {
        // Pour les administrateurs : ajout du champ lastModifiedBy
        // Combine les données de mise à jour avec l'information sur qui modifie
        const adminUpdateData = {
            ...updateData,
            lastModifiedBy: userId  // Ajout de l'ID de l'utilisateur qui fait la modification
        };

        const updatedService = await Service.findByIdAndUpdate(
            serviceId, 
            adminUpdateData,
            {
                new: true,
                runValidators: true
            }
        );

        if (!updatedService) {
            res.status(404);
            throw new Error("Service introuvable");
        }

        return res.status(200).json(updatedService);
    }
    
    if (role === "user") {
        // Pour les utilisateurs : extraction sécurisée des données du menu
        const { items } = updateData;
        
        // Validation du format des items
        if (items !== undefined && !Array.isArray(items)) {
            res.status(400);
            throw new Error("Le format des items du menu est invalide");
        }

        // Mise à jour ou création du menu avec trace de qui a modifié
        const updatedMenu = await Menu.findOneAndUpdate(
            { service: serviceId },
            {
                items: items || [],
                lastModifiedBy: userId  // Ajout de l'ID de l'utilisateur qui fait la modification
            },
            {
                new: true,
                upsert: true,
                runValidators: true,
                setDefaultsOnInsert: true  // Applique les valeurs par défaut du schéma si création
            }
        );

        return res.status(200).json(updatedMenu);
    }

    // Si l'utilisateur a un rôle non géré
    res.status(403);
    throw new Error("Accès interdit");
});


// ** @desc    Supprimer un service spécifique et son menu associé
// ** @route   DELETE /api/progressions/:progressionId/services/:serviceId
// ** @access  Private (Admin uniquement)

const deleteService = asyncHandler(async (req, res) => {
    const { progressionId, serviceId } = req.params;
    const { role } = req.user;

    // Vérification du rôle administrateur
    if (role !== "admin") {
        res.status(403);
        throw new Error("Accès restreint aux administrateurs");
    }

    // Vérifier si la progression existe
    const progression = await Progression.findById(progressionId);
    if (!progression) {
        res.status(404);
        throw new Error("Progression non trouvée");
    }

    // Vérifier si le service appartient à cette progression
    const serviceIndex = progression.services.findIndex(
        (s) => s.service.toString() === serviceId
    );
    
    if (serviceIndex === -1) {
        res.status(404);
        throw new Error("Service non trouvé dans cette progression");
    }

    // Supprimer le service de l'array services dans la progression
    progression.services.splice(serviceIndex, 1);
    await progression.save();

    // Supprimer le service de la collection Service
    const deletedService = await Service.findByIdAndDelete(serviceId);
    if (!deletedService) {
        res.status(404);
        throw new Error("Service introuvable");
    }

    // Supprimer le menu associé au service
    await Menu.deleteOne({ service: serviceId });

    return res.status(200).json({
        success: true,
        message: "Service et menu associé supprimés avec succès"
    });
});


// ** @desc    Supprimer un menu spécifique
// ** @route   DELETE /api/progressions/:progressionId/services/:serviceId/menu
// ** @access  Private (Admin uniquement)

const deleteMenu = asyncHandler(async (req, res) => {
    const { progressionId, serviceId } = req.params;
    const { role } = req.user;

    // Vérification du rôle administrateur
    if (role !== "admin") {
        res.status(403);
        throw new Error("Accès restreint aux administrateurs");
    }

    // Vérifier si la progression existe
    const progression = await Progression.findById(progressionId);
    if (!progression) {
        res.status(404);
        throw new Error("Progression non trouvée");
    }

    // Vérifier si le service appartient à cette progression
    const serviceExists = progression.services.some(
        (s) => s.service.toString() === serviceId
    );
    
    if (!serviceExists) {
        res.status(404);
        throw new Error("Service non trouvé dans cette progression");
    }

    // Supprimer le menu associé au service
    const deletedMenu = await Menu.findOneAndDelete({ service: serviceId });
    
    if (!deletedMenu) {
        res.status(404);
        throw new Error("Menu introuvable pour ce service");
    }

    return res.status(200).json({
        success: true,
        message: "Menu supprimé avec succès"
    });
});


// ** @desc    Supprimer tous les services et menus d'une progression
// ** @route   DELETE /api/progressions/:progressionId/services
// ** @access  Private (Admin uniquement)

const deleteAllServicesForProgression = asyncHandler(async (req, res) => {
    const { progressionId } = req.params;
    const { role } = req.user;

    // Vérification du rôle administrateur
    if (role !== "admin") {
        res.status(403);
        throw new Error("Accès restreint aux administrateurs");
    }

    // Vérifier si la progression existe
    const progression = await Progression.findById(progressionId);
    if (!progression) {
        res.status(404);
        throw new Error("Progression non trouvée");
    }

    // Récupérer les IDs de tous les services associés à cette progression
    const serviceIds = progression.services.map(s => s.service);

    // Supprimer tous les menus associés à ces services
    const deletedMenusResult = await Menu.deleteMany({ 
        service: { $in: serviceIds } 
    });

    // Supprimer tous les services
    const deletedServicesResult = await Service.deleteMany({ 
        _id: { $in: serviceIds } 
    });

    // Vider le tableau de services dans la progression
    progression.services = [];
    await progression.save();

    return res.status(200).json({
        success: true,
        message: "Tous les services et menus de cette progression ont été supprimés",
        details: {
            servicesSupprimes: deletedServicesResult.deletedCount,
            menusSupprimes: deletedMenusResult.deletedCount
        }
    });
});

module.exports = {
    getServices,
    updateServiceOrMenu,
    deleteService,
    deleteMenu,
    deleteAllServicesForProgression
}