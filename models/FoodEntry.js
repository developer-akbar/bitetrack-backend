const mongoose = require("mongoose");

const foodEntrySchema = new mongoose.Schema({
    foodText: String,
    macros: {
        protein: Number,
        carbs: Number,
        fat: Number,
        calories: Number,
        fiber: Number,
        sugar: Number,
        sodium: Number,
        saturate_fat: Number,
        cholesterol: Number
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model("FoodEntry", foodEntrySchema);