const express = require('express');
const router = express.Router();
const Grant = require('../models/Grant');
const auth = require('../middleware/auth');

// @route   GET api/grants
// @desc    Get all grants/competitions
// @access  Public
router.get('/', async (req, res) => {
    try {
        const { type, search } = req.query;
        let query = {};

        if (type) {
            query.type = type;
        }

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { tags: { $regex: search, $options: 'i' } }
            ];
        }

        const grants = await Grant.find(query)
            .sort({ deadline: 1, featured: -1 });

        res.json(grants);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server Error', error: err.message });
    }
});

// @route   POST api/grants
// @desc    Add a new grant/competition
// @access  Private
router.post('/', auth, async (req, res) => {
    try {
        const { title, description, type, amount, deadline, eligibility, link, tags, featured } = req.body;

        const newGrant = new Grant({
            title,
            description,
            type,
            amount,
            deadline,
            eligibility: Array.isArray(eligibility) ? eligibility : eligibility.split(',').map(e => e.trim()),
            link,
            tags: Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim()),
            featured: featured || false
        });

        const grant = await newGrant.save();
        res.json(grant);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server Error', error: err.message });
    }
});

// @route   DELETE api/grants/:id
// @desc    Delete a grant
// @access  Private
router.delete('/:id', auth, async (req, res) => {
    try {
        const grant = await Grant.findById(req.params.id);
        if (!grant) {
            return res.status(404).json({ msg: 'Grant not found' });
        }

        await grant.deleteOne();
        res.json({ msg: 'Grant removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server Error', error: err.message });
    }
});

module.exports = router;

