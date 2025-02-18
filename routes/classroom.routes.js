const express = require('express');
const router = express.Router();

const {
    authenticateUser,
    authorizeRoles
} = require('../middlewares/auth.middlewares');
const {
    createClassroom,
    updateClassroom,
    getOneClassroom,
    getAllClassrooms
} = require('../controllers/classroom.controllers');

// CLASSROOMS CRUD 
router.post('/create-classroom', createClassroom);
router.put('/update-classroom/:id', updateClassroom);

router.get('/:id', getOneClassroom)
router.get('/', getAllClassrooms ); //authenticateUser

// SPECIAL MANAGER AND SUPERADMIN
router.delete('delete-one-classroom/:id', )

// PROTECTED FOR SUPERADMIN ONLY
router.delete('delete-all-classrooms', )


module.exports = router