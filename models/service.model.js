const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
    serviceDate: {
        type: Date,
        default: Date.now,
    }, // Date exacte du service
    classrooms: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Classroom',
    }], // Classes associées
    teachers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }], // Formateur en charge
    serviceType: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TypeService',
    }, // Type de service
    location: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Local',
    }, // Lieu où se déroule le service
    menu: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Menu',
        default: null
    }, // Menu assigné au service
    isRestaurantOpen: {
        type: Boolean,
        default: false
    }, // Est réellement ouvert aux clients ?
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }, // Qui a créé ce service
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }, // Qui l'a modifié en dernier
}, {
    timestamps: true
});

const Service = mongoose.model('Service', serviceSchema);
module.exports = Service;