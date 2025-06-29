const express = require('express');
const router = express.Router();
const { analyzeFood } = require('../services/gptService');
const FoodEntry = require('../models/FoodEntry');
const mongoose = require('mongoose');

router.post('/analyze', async (req, res) => {
    const { foodText } = req.body;
    if (!foodText) {
        return res.status(400).json({ error: 'foodText is required' });
    }

    try {
        const macros = await analyzeFood(foodText);

        // Save macros to MongoDB
        const foodEntry = new FoodEntry({ foodText, macros });
        await foodEntry.save();

        res.json(macros);
    } catch (err) {
        console.error('Error analyzing food:', err);
        res.status(500).json({ error: 'Something went wrong while analyzing food' });
    }
});

router.get('/history', async (req, res) => {
    try {
        const entries = await FoodEntry.find().sort({ createdAt: -1 }); // latest first
        res.json(entries);
    } catch (err) {
        console.error('Error fetching food history ', err);
        res.status(500).json({ error: 'Something went wrong while fetching food history' });
    }
});

router.put('/update/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { foodText } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid entry ID' });
        }

        if (!foodText) {
            return res.status(400).json({ error: 'Food text is required' });
        }

        const macros = await analyzeFood(foodText);

        const updatedEntry = await FoodEntry.findByIdAndUpdate(id,
            { foodText, macros },
            { new: true }
        );
        res.json({ message: 'Entry updated' });
    } catch (err) {
        console.error('Error updating food entry: ', err);
        res.status(500).json({ error: 'Something went wrong while updating food entry' });
    }
});

router.delete('/delete/:id', async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid entry ID' });
        }

        await FoodEntry.findByIdAndDelete(id);
        res.json({ message: 'Entry deleted' });
    } catch (err) {
        console.error('Error deleting food entry: ', err);
        res.status(500).json({ error: 'Something went wrong while deleting food entry' });
    }
});// Get total calories consumed today
router.get('/summary/today', async (req, res) => {
    try {
        const start = new Date();
        start.setHours(0, 0, 0, 0);
        const end = new Date();
        end.setHours(23, 59, 59, 999);

        const entries = await FoodEntry.find({
            createdAt: { $gte: start, $lte: end }
        });

        const totalConsumed = entries.reduce((sum, entry) => {
            return sum + (entry.macros?.calories || 0);
        }, 0);

        res.json({ totalConsumed });
    } catch (err) {
        console.error('Error calculating consumed calories:', err);
        res.status(500).json({ error: 'Failed to fetch calorie summary' });
    }
});


module.exports = router;
