const express = require('express');
const router = express.Router();

const {
    authenticateUser,
    authorizeRoles
} = require('../middlewares/auth.middlewares');
const {
    createLocation,
    updateLocation,
    getAllLocations,
    getOneLocation,
    deleteOneLocation,
    deleAllLocations

} = require('../controllers/location.controller');

// Main routes for Location
router.post("/", authenticateUser,
    authorizeRoles(["superAdmin", "manager"]), createLocation)
router.put("/:id", authenticateUser,
    authorizeRoles(["superAdmin", "manager"]), updateLocation)
router.get("/:id", authenticateUser, getOneLocation)
router.delete("/:id", authenticateUser,
    authorizeRoles(["superAdmin"]), deleteOneLocation)
router.get("/", authenticateUser, getAllLocations)

// PROTECTED ROUTE DELETE ALL
router.delete("/", authenticateUser,
    authorizeRoles(["superAdmin"]), deleAllLocations)

module.exports = router