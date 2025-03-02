const express = require("express");
const {
    authenticateUser,
    authorizeRoles
} = require('../middlewares/auth.middlewares');
const {
    createProgression,
    updateProgression,
    deleteOneProgression,
    deleteAllProgressions,
    getProgressionById,
    getAllProgressions,
    getProgressionsByClassroom,
    getProgressionsByTeacher
} = require("../controllers/progression.controllers");
const {
    getServices
} = require("../controllers/service.controllers");

const router = express.Router();

router.route("/")
    .post(createProgression) // Ajout authenticateUser, authorizeRoles(["user", "manager", "sueperAdmin"]), 
    .get(getAllProgressions) // Liste de toutes les progressions
    .delete(deleteAllProgressions)

router.route("/mine")
    .get() // Liste Par Utilisateur

router.route("/:id")
    .get(getProgressionById) // Détail
    .put(updateProgression) // Modification
    .delete(deleteOneProgression); // Suppression

router.route("/:progressionId/services").get(getServices)



router.get("/classroom/:classroomId", getProgressionsByClassroom)
router.get("/teacher/:teacherId", getProgressionsByTeacher)


module.exports = router;