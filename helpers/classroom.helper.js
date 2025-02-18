const Classroom = require('../models/classroom.model')
const mongoose = require('mongoose')

// Vérifie si l'ID de la Classroom est valide
const isValidObjectId = (id) => mongoose.isValidObjectId(id);

module.exports = {
    isValidObjectId
}