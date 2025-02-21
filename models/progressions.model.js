const mongoose = require('mongoose');

const progressionSchema = new mongoose.Schema({
    classrooms: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Classroom'
    }],
    teachers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    weeks: [{
        weekNumber: {
            type: Number,
            required: true,
        },
        service: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Service',
        },
        Menu: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Menu'
        }]
    }, ],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    modifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
}, {
    timestamps: true,
});

// Middleware pour lier automatiquement les services aux progressions
progressionSchema.pre('save', async function (next) {
    try {
        const Service = mongoose.model('Service');

        for (let week of this.weeks) {
            let existingService = await Service.findOne({
                class: this.class,
                weekNumber: week.weekNumber,
            });

            if (existingService) {
                week.service = existingService._id;
            }
        }

        next();
    } catch (error) {
        next(error);
    }
});

const Progression = mongoose.model('Progression', progressionSchema);
module.exports = Progression;