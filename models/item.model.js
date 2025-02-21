const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true, // Empêche les doublons
        trim: true
    },
    category: {
        type: String,
        enum: ["AB", "Entrée", "Plat", "Fromage", "Dessert", "Boisson"],
        required: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // Le formateur qui a créé l'item
    },

}, {
    timestamps: true
});


module.exports = mongoose.model("Item", itemSchema);