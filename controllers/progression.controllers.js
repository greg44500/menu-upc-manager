const asyncHandler = require('express-async-handler');
const Progression = require('../models/progression.model');
const Service = require('../models/service.model');
const Classroom = require('../models/classroom.model');
const User = require('../models/user.model');
const {
    validateObjectId
} = require('../helpers/user.helper');

/**
 * @desc    Créer une nouvelle progression avec génération automatique des services
 * @route   POST /api/progressions
 * @access  Admin / Manager (via middleware)
 */
const createProgression = asyncHandler(async (req, res) => {
    const {
        classrooms,
        teachers,
        weekNumbers
    } = req.body;

    // Validation des champs obligatoires
    if (!classrooms ?.length || !teachers ?.length || !weekNumbers ?.length) {
        res.status(400);
        throw new Error('Tous les champs classes, formateurs et semaines sont requis.');
    }

    // Vérifier si une progression existe déjà avec les mêmes classes et semaines
    const existingProgression = await Progression.findOne({
        classrooms,
        weekNumbers
    });
    if (existingProgression) {
        res.status(400);
        throw new Error('Une progression avec ces classes et semaines existe déjà.');
    }

    // Création des services pour chaque numéro de semaine
    const createdServices = await Promise.all(
        weekNumbers.map(async (week) => {
            const newService = await Service.create({
                weekNumber: week,
                classrooms,
                teachers,
                menus: []
            });

            return {
                weekNumber: week,
                service: newService._id,
                menu: []
            };
        })
    );

    // Création de la progression avec les services générés
    const progression = await Progression.create({
        classrooms,
        teachers,
        weekNumbers,
        services: createdServices
        // author: req.user._id,
        // modifiedBy: req.user._id
    });

    // Mise à jour des classes : Ajout des formateurs assignés
    await Classroom.updateMany({
        _id: {
            $in: classrooms
        }
    }, {
        $addToSet: {
            assignedTeachers: {
                $each: teachers
            }
        }
    });

    // Mise à jour des formateurs : Ajout des classes assignées et de la progression
    await User.updateMany({
        _id: {
            $in: teachers
        }
    }, {
        $addToSet: {
            assignedClassrooms: {
                $each: classrooms
            },
            assignedProgressions: progression._id
        }
    });

    res.status(201).json(progression);
});


/**
 * @desc    Créer une nouvelle progression avec génération automatique des services
 * @route   POST /api/progressions
 * @access  Admin / Manager (via middleware)
 */
// Modifier une progression existante
const updateProgression = asyncHandler(async (req, res) => {
    const { classrooms, teachers, weekNumbers } = req.body;
    const { id } = req.params;

    // Vérifier si la progression existe
    const progression = await Progression.findById(id);
    if (!progression) {
        res.status(404);
        throw new Error('Progression non trouvée');
    }

    // Récupération des anciennes valeurs
    const oldClassrooms = progression.classrooms.map(String);
    const oldTeachers = progression.teachers.map(String);
    const oldWeekNumbers = progression.weekNumbers;

    // Mise à jour des classes et formateurs dans la progression
    progression.classrooms = classrooms;
    progression.teachers = teachers;
    progression.weekNumbers = weekNumbers;

    // Sauvegarde de la progression mise à jour
    await progression.save();

    // Mise à jour des formateurs et classes dans leurs modèles respectifs
    await Classroom.updateMany(
        { _id: { $in: oldClassrooms } },
        { $pull: { assignedTeachers: { $in: oldTeachers } } }
    );
    await Classroom.updateMany(
        { _id: { $in: classrooms } },
        { $addToSet: { assignedTeachers: { $each: teachers } } }
    );

    await User.updateMany(
        { _id: { $in: oldTeachers } },
        { $pull: { assignedClassrooms: { $in: oldClassrooms }, assignedProgressions: id } }
    );
    await User.updateMany(
        { _id: { $in: teachers } },
        { $addToSet: { assignedClassrooms: { $each: classrooms }, assignedProgressions: id } }
    );

    // Mise à jour des services existants
    const oldServices = progression.services || [];
    const oldServiceWeeks = oldServices.map(s => s.weekNumber);
    const newServiceWeeks = weekNumbers;

    // Trouver les semaines à supprimer
    const weeksToRemove = oldServiceWeeks.filter(week => !newServiceWeeks.includes(week));
    if (weeksToRemove.length > 0) {
        await Service.deleteMany({ _id: { $in: oldServices.filter(s => weeksToRemove.includes(s.weekNumber)).map(s => s.service) } });
        progression.services = progression.services.filter(s => !weeksToRemove.includes(s.weekNumber));
    }

    // Trouver les semaines à ajouter
    const weeksToAdd = newServiceWeeks.filter(week => !oldServiceWeeks.includes(week));
    for (const week of weeksToAdd) {
        const newService = await Service.create({
            weekNumber: week,
            classrooms: classrooms,
            teachers: teachers,
        });

        progression.services.push({
            weekNumber: week,
            service: newService._id
        });
    }

    // Sauvegarde finale avec les services mis à jour
    await progression.save();

    res.status(200).json({ message: 'Progression mise à jour avec succès', progression });
});

// @desc    Supprimer une progression par ID
// @route   DELETE /api/progressions/:id
// @access  Admin uniquement (géré par middleware)
const deleteOneProgression = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Vérifier si la progression existe
    const progression = await Progression.findById(id);
    if (!progression) {
        res.status(404);
        throw new Error('Progression non trouvée');
    }

    // Suppression des services liés à la progression
    await Service.deleteMany({ _id: { $in: progression.services.map(s => s.service) } });

    // Mise à jour des formateurs et classes pour retirer la progression
    await Classroom.updateMany(
        { _id: { $in: progression.classrooms } },
        { $pull: { assignedProgressions: id } }
    );

    await User.updateMany(
        { _id: { $in: progression.teachers } },
        { $pull: { assignedProgressions: id } }
    );

    // Suppression de la progression
    await progression.deleteOne();

    res.status(200).json({ message: 'Progression supprimée avec succès' });
});

// @desc    Supprimer toutes les progressions - RAZ
// @route   DELETE /api/progressions
// @access  Admin uniquement (géré par middleware)
const deleteAllProgressions = asyncHandler(async (req, res) => {
    // Suppression de tous les services liés aux progressions
    await Service.deleteMany({});

    // Suppression des progressions
    await Progression.deleteMany({});

    // Mise à jour des formateurs et classes pour supprimer toutes les progressions assignées
    await Classroom.updateMany({}, { $set: { assignedProgressions: [] } });
    await User.updateMany({}, { $set: { assignedProgressions: [] } });

    res.status(200).json({ message: 'Toutes les progressions ont été supprimées' });
});

module.exports = { createProgression, updateProgression, deleteOneProgression, deleteAllProgressions }