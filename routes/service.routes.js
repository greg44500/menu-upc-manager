const express = require("express");
const {
    authenticateUser,
    authorizeRoles
} = require('../middlewares/auth.middlewares');
const {
    getServices,
    updateServiceOrMenu,
    getServiceById,
    deleteService
} = require("../controllers/service.controllers");


const router = express.Router();


// Routes pour les services au sein d'une progression
router.get('/:progressionId/services', getServices);
// router.post('/progressions/:progressionId/services', createService);
router.get('/:progressionId/services/:serviceId', authenticateUser, getServiceById);
router.put('/:progressionId/services/:serviceId', authenticateUser, updateServiceOrMenu);
router.delete('/:progressionId/services/:serviceId', authenticateUser, deleteService);



router.get("/classroom/:classroomId")
router.get("/teacher/:teacherId")

module.exports = router;