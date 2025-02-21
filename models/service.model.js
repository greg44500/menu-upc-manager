const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
    serviceDate: {
        type: Date,
        required: true
    }, // Date exacte du service
    classrooms: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Classroom',
        required: true
    }], // Classes associées
    teachers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }], // Formateur en charge
    serviceType: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TypeService',
        required: true
    }, // Type de service
    location: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Local',
        required: true
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
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
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