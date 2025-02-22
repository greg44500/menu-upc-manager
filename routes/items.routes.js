const express = require("express");
const {
    createItem,
    getAllItems,
    getItemById,
    getItemsByUsers,
    updateItem,
    deleteItem
} = require("../controllers/item.controllers");

const {
    authenticateUser,
    authorizeRoles
} = require('../middlewares/auth.middlewares');

const router = express.Router();

router.route("/")
    .post(authenticateUser,createItem) // Ajout authenticateUser, authorizeRoles(["user", "manager", "sueperAdmin"]), 
    .get(authenticateUser, getAllItems) // Liste

router.route("/mine")
    .get(authenticateUser, getItemsByUsers) // Liste Par Utilisateur

router.route("/:id")
    .get(authenticateUser, getItemById) // Détail
    .put(authenticateUser, authorizeRoles(["user", "manager", "superAdmin"]), updateItem) // Modification
    .delete(authenticateUser, authorizeRoles(["superAdmin"]), deleteItem); // Suppression

module.exports = router;