const mongoose = require("mongoose");

const classroomSchema = new mongoose.Schema({
    diploma: {
        type: String,
        Enum: ['CAP', 'BAC', "BP", "BTS", "CS"],
        required: true
    },
    category: {
        type: String,
        enum: ['CUIS', 'CSR', 'AC', 'ACSR', 'MHR', 'CDR', 'BAR', 'SOM'],
        required: true
    },
    alternationNumber: {
        type: Number,
        Enum: [1, 2, 3],
        required: true
    },
    group: {
        type: String,
        enum: ['A', 'B', 'C'],
        required: true
    },
    certificationSession: {
        type: Number,
        required: true,
    },
    assignedTeachers: [{
        teacherId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    }]
}, {
    timestamps: true
});

// Ajouter un champ virtuel pour concaténer les valeurs
classroomSchema.virtual("virtualName").get(function () {
    return `${this.diploma}${this.category}${this.alternationNumber}${this.group}${this.certificationSession}`;
});

// Activer les champs virtuels lors de la conversion en JSON ou en objet
classroomSchema.set("toJSON", { virtuals: true });
classroomSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Classroom", classroomSchema);