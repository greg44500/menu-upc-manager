const mongoose = require("mongoose");

const menuSchema = new mongoose.Schema({
    service: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Service",
        required: true
    },
    items: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Item"
    }],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
}, {
    timestamps: true
});

// Met à jour la date de modification automatiquement
menuSchema.pre("save", function (next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model("Menu", menuSchema);