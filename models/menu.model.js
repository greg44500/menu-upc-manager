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
    isMenuValidate : {
        type: Boolean,
        default: false
    },
    isRestaurant : {
        type: Boolean, 
        default: false
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
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