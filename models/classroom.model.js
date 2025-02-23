const mongoose = require("mongoose");

const classroomSchema = new mongoose.Schema({
    diploma: {
        type: String,
        Enum: ['CAP', 'BAC', "BP", "BTS", "CS"],
    },
    category: {
        type: String,
        enum: ['CUIS', 'CSHCR', 'CSR', 'AC', 'ACSR', 'MHR', 'CDR', 'BAR', 'SOM'],
    },
    alternationNumber: {
        type: Number,
        Enum: [1, 2, 3]
    },
    group: {
        type: String,
        enum: ['A', 'B', 'C']
    },
    certificationSession: {
        type: Number,
    },
    name: {
        type: String,
    },
    assignedTeachers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, {
    timestamps: true
});

// Ajouter un champ virtuel pour concaténer les valeurs
// Champ virtuel pour créer `virtualName`
classroomSchema.virtual('virtualName').get(function() {
    const parts = [];
    
    if (this.diploma) parts.push(this.diploma);
    if (this.category) parts.push(this.category);
    if (this.certificationSession) parts.push(this.certificationSession);
  
    return parts.join('');  // Concatène les valeurs disponibles
  });

// Activer les champs virtuels lors de la conversion en JSON ou en objet
classroomSchema.set("toJSON", { virtuals: true });
classroomSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Classroom", classroomSchema);