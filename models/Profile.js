const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
    name: String,
    email: {type: String, required: true, unique: true},
    age: Number,
    gender: { type: String, enum: ['male', 'female'], required: true },
    height: Number, // in cm
    weight: Number, // in kg
    activityLevel: {
        type: String,
        enum: ['sedentary', 'light', 'moderate', 'active', 'very_active'],
    },
    BMR: Number,
    TDEE: Number
}, {
    timestamps: true
});

module.exports = mongoose.model('Profile', profileSchema);
