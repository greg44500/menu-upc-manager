const mongoose = require('mongoose')
const Classroom = require('../models/classroom.model')
const asyncHandler = require('express-async-handler');
const {
    isValidObjectId
} = require('../helpers/classroom.helper');

// **@desc : Create Classroom
// **@Method : POST /api/classrooms/create-classroom
// ** @Access : superAdmin, manager
const createClassroom = asyncHandler(async (req, res, next) => {
    const {
        diploma,
        category,
        alternationNumber,
        group,
        certificationSession,
        assignedTeachers,
        name,
        virtualName
    } = req.body

    // Vérifier si une classe avec les mêmes paramètres existe déjà
    const existingClassroom = await Classroom.findOne({
        diploma,
        category,
        alternationNumber,
        group,
        certificationSession
    });

    if (existingClassroom) {
        const error = new Error("Une classe avec ces caractéristiques existe déjà.");
        error.statusCode = 400; // Définir le bon code d'erreur
        return next(error)
    }

    try {
        const newClassroom = new Classroom({
            diploma,
            category,
            alternationNumber,
            group,
            certificationSession,
            assignedTeachers: assignedTeachers || [],
            name: virtualName
        });

        const savedClassroom = await newClassroom.save();

        return res.status(201).json({
            success: true,
            message: 'Classe créeé avec succès',
            data: savedClassroom
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Erreur lors de la création de la classe: ${error.message}`
        });
    }
})

// **@desc : update Classroom
// **@Method : PUT /api/classrooms/create-classroom/:id
// ** @Access : superAdmin, manager

const updateClassroom = asyncHandler(async (req, res, next) => {
    const {
        diploma,
        category,
        alternationNumber,
        group,
        certificationSession,
        assignedTeachers,
        virtualName
    } = req.body
    const {
        id
    } = req.params
    if (!isValidObjectId(id)) {
        return next(new Error("ID Classe invalide"));
    }

    const existingClassroom = await Classroom.findById(id)
    if (!existingClassroom) {
        return next(new Error("Ressource introuvable"));
    }

    // Mise à jour des champs modifiables uniquement s'ils sont présents dans la requête
    if (diploma) existingClassroom.diploma = diploma;
    if (category) existingClassroom.category = category;
    if (alternationNumber) existingClassroom.alternationNumber = alternationNumber;
    if (group) existingClassroom.group = group;
    if (certificationSession) existingClassroom.certificationSession = certificationSession;
    if (assignedTeachers) existingClassroom.assignedTeachers = assignedTeachers;

    // Génération automatique du nom virtuel
    existingClassroom.virtualName = `${existingClassroom.diploma}-${existingClassroom.category}-${existingClassroom.alternationNumber}${existingClassroom.group}-${existingClassroom.certificationSession}`;

    // Sauvegarde en base de données
    await existingClassroom.save();

    // Réponse avec la classe mise à jour
    res.status(200).json({
        message: "Classe mise à jour avec succès",
        classroom: existingClassroom
    });
})

// **@desc : get One Classroom
// **@Method : get /api/classrooms/:id
// ** @Access : superAdmin, manager
const getOneClassroom = asyncHandler(async (req, res, next) => {
    const {
        id
    } = req.params

    const searchClassroom = await Classroom.findById(id)
    if (!isValidObjectId(id)) {
        return next(new Error("ID Classe invalide"));
    }
    if (!searchClassroom) {
        return next(new Error("Ressource introuvable"));
    }
    res.status(200).json({
        success: true,
        data: searchClassroom
    })
})
// **@desc : Get All Classrooms
// **@Method : GET /api/classrooms/get-all-classrooms
// ** @Access : superAdmin, manager
const getAllClassrooms = asyncHandler(async (req, res) => {
  const classrooms = await Classroom.find()
    .sort({
      createdAt: -1
    });

  res.status(200).json({
    success: true,
    count: classrooms.length,
    classrooms: classrooms.length ? classrooms : "Aucune classe trouvée",
  });
});


// **@desc : Delete One Classroom
// **@Method : DELETE /api/classrooms/:id
// ** @Access : superAdmin, manager
const deleteOneClassroom = asyncHandler(async (req, res, next) => {
    const {
        id
    } = req.params

    const searchClassroom = await Classroom.findByIdAndDelete(id)
    if (!isValidObjectId(id)) {
        return next(new Error("ID Classe invalide"));
    }
    if (!searchClassroom) {
        return next(new Error("Ressource introuvable"));
    }
    res.status(200).json({
        success: true,
        message: "Classe supprimée !!",
    })
})

// **@desc : Delete One Classroom
// **@Method : DELETE /api/classrooms/:id
// ** @Access : superAdmin, manager
const deleteAllClassrooms = asyncHandler(async (req, res, next) => {
  
    const classroomToDelete = await Classroom.deleteMany()

    if (!classroomToDelete) {
        return next(new Error("Ressource introuvable"));
    }
    res.status(200).json({
        success: true,
        message: "Toutes les classes ont été supprimées avec succés !!",
    })
})




module.exports = {
    createClassroom,
    updateClassroom,
    getOneClassroom,
    getAllClassrooms,
    deleteOneClassroom,
    deleteAllClassrooms,
}