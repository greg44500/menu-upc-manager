const express = require("express");
const Service = require("../models/service.model")
const asyncHandler = require("express-async-handler")
const {
    authenticateUser,
    authorizeRoles
} = require('../middlewares/auth.middlewares');
const { getServices } = require("../controllers/service.controllers");


const router = express.Router();

router.get('/test/all', asyncHandler(async (req, res) => {
    const services = await Service.find();
    res.json(services);
}));
router.get('/progressions/:progressionId/services', getServices);

router.route("/mine")
    .get() // Liste Par Utilisateur

router.route("/:id")
    .get() // Détail
    .put() // Modification
    .delete(); // Suppression

router.get("/classroom/:classroomId" )
router.get("/teacher/:teacherId" )

module.exports = router;