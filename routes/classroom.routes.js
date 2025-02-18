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
    getAllClassrooms,
    deleteOneClassroom,
    deleteAllClassrooms
} = require('../controllers/classroom.controllers');

// CLASSROOMS CRUD 
router.post('/create-classroom', createClassroom); //authenticateUser, authorizeRoles(['superAdmin', 'manager'])
router.put('/update-classroom/:id', updateClassroom); //authenticateUser, authorizeRoles(['superAdmin', 'manager'])

router.get('/:id', getOneClassroom) //authenticateUser
router.get('/', getAllClassrooms ); //authenticateUser

// SPECIAL MANAGER AND SUPERADMIN
router.delete('/:id',deleteOneClassroom ) //authenticateUser, authorizeRoles(['superAdmin', 'manager'])

// PROTECTED FOR SUPERADMIN ONLY
router.delete('/',deleteAllClassrooms ) // authenticateUser, authorizeRoles(['superAdmin']) 


module.exports = router