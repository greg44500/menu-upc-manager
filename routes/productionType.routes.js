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
router.post("/", authenticateUser,
    authorizeRoles(["superAdmin", "manager"]), createProductionType)
router.put("/:id", authenticateUser,
    authorizeRoles(["superAdmin", "manager"]), updateProductionType)
router.get("/:id", authenticateUser, getOneProductionType)
router.delete("/:id", authenticateUser,
    authorizeRoles(["superAdmin"]), deleteOneProductionType)
router.get("/", authenticateUser, getAllProductionTypes)

// PROTECTED ROUTE DELETE ALL
router.delete("/", authenticateUser,
    authorizeRoles(["superAdmin"]), deleteAllProductionTypes)

module.exports = router