const mongoose = require('mongoose')

const productionTypeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
}, {
    timestamps: true
})

module.exports = mongoose.model("ProductionType", productionTypeSchema);