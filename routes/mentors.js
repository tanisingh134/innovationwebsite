const express = require('express');
const router = express.Router();
const Mentor = require('../models/Mentor');
const User = require('../models/User');
const auth = require('../middleware/auth'); // Optional: Protect write routes

// @route   GET api/mentors
// @desc    Get all mentors
// @access  Public
router.get('/', async (req, res) => {
    try {
        const mentors = await Mentor.find().sort({ createdAt: -1 });
        res.json(mentors);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/mentors
// @desc    Add a new mentor
// @access  Private (using auth middleware mainly to check token presence)
router.post('/', auth, async (req, res) => {
    const { username, role, company, bio, skills, socials } = req.body;

    try {
        const newMentor = new Mentor({
            username,
            role,
            company,
            bio,
            skills: Array.isArray(skills) ? skills : skills.split(',').map(s => s.trim()),
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
            socials
        });

        const mentor = await newMentor.save();
        res.json(mentor);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/mentors/:id/request
// @desc    Send mentor request
// @access  Private
router.post('/:id/request', auth, async (req, res) => {
    try {
        const mentor = await Mentor.findById(req.params.id);
        if (!mentor) {
            return res.status(404).json({ msg: 'Mentor not found' });
        }

        const { message } = req.body;
        const user = await User.findById(req.user.id).select('username');
        
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        // Initialize requests array if it doesn't exist (for old mentors)
        if (!mentor.requests) {
            mentor.requests = [];
        }

        // Check if request already exists
        const userId = req.user.id.toString();
        const existingRequest = mentor.requests.find(
            request => request.user && request.user.toString() === userId && request.status === 'pending'
        );

        if (existingRequest) {
            return res.status(400).json({ msg: 'You already have a pending request with this mentor' });
        }

        mentor.requests.push({
            user: req.user.id,
            message: message || `Hi, I would like to connect with you!`,
            status: 'pending'
        });

        await mentor.save();
        res.json({ msg: 'Mentor request sent successfully' });
    } catch (err) {
        console.error('Error sending mentor request:', err);
        res.status(500).json({ msg: 'Server Error', error: err.message });
    }
});

// @route   DELETE api/mentors/:id
// @desc    Delete a mentor
// @access  Private
router.delete('/:id', auth, async (req, res) => {
    try {
        const mentor = await Mentor.findById(req.params.id);
        if (!mentor) {
            return res.status(404).json({ msg: 'Mentor not found' });
        }

        await mentor.deleteOne();
        res.json({ msg: 'Mentor removed' });
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Mentor not found' });
        }
        res.status(500).json({ msg: 'Server Error', error: err.message });
    }
});

// @route   GET api/mentors/:id/chat
// @desc    Get mentor info for chat
// @access  Private
router.get('/:id/chat', auth, async (req, res) => {
    try {
        const mentor = await Mentor.findById(req.params.id);
        if (!mentor) {
            return res.status(404).json({ msg: 'Mentor not found' });
        }

        res.json({
            id: mentor._id,
            username: mentor.username,
            avatar: mentor.avatar,
            role: mentor.role,
            company: mentor.company
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server Error', error: err.message });
    }
});

module.exports = router;
