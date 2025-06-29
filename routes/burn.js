const express = require('express');
const router = express.Router();
const BurnEntry = require('../models/BurnEntry');
const { analyzeActivity } = require('../services/gptBurnService');
const mongoose = require('mongoose');

// Analyze and save burn entry
router.post('/analyze', async (req, res) => {
    const { activityText } = req.body;
    if (!activityText) return res.status(400).json({ error: 'activityText is required' });

    try {
        const macros = await analyzeActivity(activityText);

        // If duration is missing, alert user to add it
        if (!macros.duration) {
            return res.status(400).json({ error: 'Please include the duration of activity for accurate calorie estimation.' });
        }

        const newEntry = new BurnEntry({ activityText, burn: macros });
        await newEntry.save();
        res.json(macros);
    } catch (err) {
        console.error('Error analyzing activity:', err);
        res.status(500).json({ error: 'Something went wrong' });
    }
});

// Get all burn entries
router.get('/history', async (req, res) => {
    try {
        const entries = await BurnEntry.find().sort({ createdAt: -1 });
        res.json(entries);
    } catch (err) {
        console.error('Error fetching burn history:', err);
        res.status(500).json({ error: 'Something went wrong' });
    }
});

// Delete a burn entry
router.delete('/delete/:id', async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ error: 'Invalid entry ID' });

    try {
        await BurnEntry.findByIdAndDelete(id);
        res.json({ message: 'Entry deleted' });
    } catch (err) {
        console.error('Error deleting burn entry: ', err);
        res.status(500).json({ error: 'Something went wrong while deleting burn entry' });
    }
});

// Update a burn entry
router.put('/update/:id', async (req, res) => {
    const { id } = req.params;
    const { activityText } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ error: 'Invalid entry ID' });
    if (!activityText) return res.status(400).json({ error: 'activityText is required' });

    try {
        const updatedBurn = await analyzeActivity(activityText);

        // If duration is missing, alert user to add it
        if (!updatedBurn.duration) {
            return res.status(400).json({ error: 'Please include the duration of activity for accurate calorie estimation.' });
        }

        await BurnEntry.findByIdAndUpdate(id, { activityText, burn: updatedBurn });
        res.json({ message: 'Entry updated' });
    } catch (err) {
        console.error('Error updating burn entry: ', err);
        res.status(500).json({ error: 'Something went wrong while updating burn entry' });
    }
});

// Dashboard summary: total burned today
router.get('/summary/today', async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        const entries = await BurnEntry.find({
            createdAt: {
                $gte: today,
                $lt: tomorrow
            }
        });

        const totalBurned = entries.reduce((sum, entry) => sum + (entry.burn?.calories || 0), 0);
        res.json({ totalBurned });
    } catch (err) {
        console.error('Error fetching today burn summary:', err);
        res.status(500).json({ error: 'Something went wrong while fetching summary' });
    }
});

module.exports = router;
