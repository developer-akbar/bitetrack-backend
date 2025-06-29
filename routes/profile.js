const express = require('express');
const router = express.Router();
const Profile = require('../models/Profile');
const mongoose = require('mongoose');

// Save user profile data
router.post('/create', async (req, res) => {
    const { name, email, age, gender, height, weight, activityLevel } = req.body;

    if (!name || !email || !age || !gender || !height || !weight || !activityLevel) {
        return res.status(400).json({ error: 'All profile fields are required' });
    }

    try {
        const existing = await Profile.findOne({ email });
        if (existing) {
            return res.status(409).json({ error: 'Email already exists. Please update profile instead.' });
        }

        const BMR =
            gender === 'male'
                ? (10 * weight) + (6.25 * height) - (5 * age) + 5
                : (10 * weight) + (6.25 * height) - (5 * age) - 161;

        const activityMultipliers = {
            sedentary: 1.2,
            light: 1.375,
            moderate: 1.55,
            active: 1.725,
            very_active: 1.9
        };

        const TDEE = Math.round(BMR * (activityMultipliers[activityLevel] || 1.2));

        const profile = new Profile({ name, email, age, gender, height, weight, activityLevel, BMR: Math.round(BMR), TDEE });
        await profile.save();

        res.json(profile);
    } catch (err) {
        console.error('Error calculating profile data:', err);
        res.status(500).json({ error: 'Something went wrong' });
    }
});

// Retrieve profile data
router.get('/latest-profile', async (req, res) => {
    try {
        const latestProfile = await Profile.findOne().sort({ createdAt: -1 });
        if (!latestProfile) {
            return res.status(400).json({ error: 'No profile found' });
        }

        res.json(latestProfile);
    } catch (err) {
        console.error('Error getting profile data:', err);
        res.status(500).json({ error: 'Something went wrong' });
    }
});

// Update profile data
router.put('/update/:id', async (req, res) => {
    const { id } = req.params;
    const { name, age, gender, height, weight, activityLevel } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ error: 'Invalid profile ID' });

    try {
        const BMR =
            gender === 'male'
                ? 10 * weight + 6.25 * height - 5 * age + 5
                : 10 * weight + 6.25 * height - 5 * age - 161;

        const activityMultipliers = {
            sedentary: 1.2,
            light: 1.375,
            moderate: 1.55,
            active: 1.725,
            very_active: 1.9
        };

        const TDEE = Math.round(BMR * (activityMultipliers[activityLevel] || 1.2));

        const updatedProfile = await Profile.findByIdAndUpdate(
            id,
            { name, age, gender, height, weight, activityLevel, BMR: Math.round(BMR), TDEE },
            { new: true }
        );

        res.json(updatedProfile);
    } catch (err) {
        console.error('Error updating profile:', err);
        res.status(500).json({ error: 'Something went wrong during profile update' });
    }
});

// GET /by-email/:email
router.get('/email/:email', async (req, res) => {
    const { email } = req.params;

    if (!email) return res.status(400).json({ error: 'Email is required' });

    try {
        const profile = await Profile.findOne({ email });
        if (!profile) return res.status(404).json({ error: 'No profile found' });

        res.json(profile);
    } catch (err) {
        console.error('Error fetching profile:', err);
        res.status(500).json({ error: 'Something went wrong' });
    }
});

// PUT /update/:email
router.put('/update/:email', async (req, res) => {
    const { email } = req.params;
    const { name, age, gender, height, weight, activityLevel } = req.body;

    if (!email) return res.status(400).json({ error: 'Email is required' });

    try {
        const BMR = gender === 'male'
            ? 10 * weight + 6.25 * height - 5 * age + 5
            : 10 * weight + 6.25 * height - 5 * age - 161;

        const TDEE = Math.round(BMR * (activityMultipliers[activityLevel] || 1.2));

        const updated = await Profile.findOneAndUpdate(
            { email },
            { name, age, gender, height, weight, activityLevel, BMR: Math.round(BMR), TDEE },
            { new: true }
        );

        if (!updated) return res.status(404).json({ error: 'Profile not found' });

        res.json(updated);

    } catch (err) {
        console.error('Error updating profile:', err);
        res.status(500).json({ error: 'Something went wrong while updating profile' });
    }
});

module.exports = router;