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
router.route("/")
    .post(authenticateUser,
        authorizeRoles(["superAdmin", "manager"]), createLocation) // CREATE ONE
    .get(authenticateUser, getAllLocations) // READ ALL
    .delete(authenticateUser,
        authorizeRoles(["superAdmin"]), deleAllLocations) // DELETE ALL
        
router.route("/:id")
    .put(authenticateUser,
        authorizeRoles(["superAdmin", "manager"]), updateLocation) // UPDATE ONE
    .get(authenticateUser, getOneLocation) // GET ONE
    .delete(authenticateUser,
        authorizeRoles(["superAdmin"]), deleteOneLocation) // DELETE ONE




module.exports = router