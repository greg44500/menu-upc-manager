const express = require('express');
const router = express.Router();

const {
    authenticateUser,
    authorizeRoles
} = require('../middlewares/auth.middlewares');
const {
    createProductionType,
    updateProductionType,
    getOneProductionType,
    deleteOneProductionType,
    getAllProductionTypes,
    deleteAllProductionTypes
} = require('../controllers/productionType.controller');

// Main routes for Production Type
router.route("/")
    .post(authenticateUser,
        authorizeRoles(["superAdmin", "manager"]), createProductionType) //CREATE ONE
    .get(authenticateUser, getAllProductionTypes) // GET ALL
    .delete(authenticateUser,
        authorizeRoles(["superAdmin"]), deleteAllProductionTypes) // DELETE ALL
        
router.route("/:id")
    .put(authenticateUser,
        authorizeRoles(["superAdmin", "manager"]), updateProductionType) // UPDATE ONE
    .get(authenticateUser, getOneProductionType) // GET ONE
    .delete(authenticateUser,
        authorizeRoles(["superAdmin"]), deleteOneProductionType) // DELETE ONE

module.exports = router