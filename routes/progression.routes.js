const express = require("express");
const {
    authenticateUser,
    authorizeRoles
} = require('../middlewares/auth.middlewares');
const { createProgression, updateProgression, deleteOneProgression, deleteAllProgressions } = require("../controllers/progression.controllers");

const router = express.Router();

router.route("/")
    .post(createProgression) // Ajout authenticateUser, authorizeRoles(["user", "manager", "sueperAdmin"]), 
    .get() // Liste de toutes les progressions
    .delete(deleteAllProgressions)

router.route("/mine")
    .get() // Liste Par Utilisateur

router.route("/:id")
    .get() // Détail
    .put(updateProgression) // Modification
    .delete(deleteOneProgression); // Suppression

module.exports = router;