const mongoose = require('mongoose');
const Service = require('./service.model'); // Import du modèle Service

const progressionSchema = new mongoose.Schema({
    classrooms: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Classroom', required: true }],
    teachers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
    
    weekNumbers: [{ type: Number, required: true }], // Stocke uniquement les numéros de semaines

    services: [{
        weekNumber: { type: Number, required: true },
        service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service' }, // Lien vers le Service
    }],

    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

/**
 * 🔄 Middleware : Création automatique des services avant de sauvegarder la progression
 */
progressionSchema.pre('save', async function (next) {
    if (!this.isNew) return next(); // Exécuter seulement lors de la création d'une nouvelle progression

    try {
        const createdServices = await Promise.all(
            this.weekNumbers.map(async (week) => {
                const newService = await Service.create({
                    weekNumber: week,
                    classrooms: this.classrooms,
                    teachers: this.teachers,
                    menus: []
                });

                return {
                    weekNumber: week,
                    service: newService._id,
                    menu: []
                };
            })
        );

        this.services = createdServices;
        next();
    } catch (error) {
        next(error);
    }
});

module.exports = mongoose.model('Progression', progressionSchema);
