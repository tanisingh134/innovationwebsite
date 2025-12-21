const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');

// Helper function to calculate match score based on skills
const calculateMatchScore = (userSkills, targetSkills) => {
    if (!userSkills || !targetSkills || userSkills.length === 0 || targetSkills.length === 0) {
        return 50; // Base score if no skills
    }
    
    const userSkillsLower = userSkills.map(s => s.toLowerCase());
    const targetSkillsLower = targetSkills.map(s => s.toLowerCase());
    
    // Find common skills
    const commonSkills = userSkillsLower.filter(skill => targetSkillsLower.includes(skill));
    
    // Calculate score: base 50 + (common skills / total unique skills) * 50
    const totalUniqueSkills = new Set([...userSkillsLower, ...targetSkillsLower]).size;
    const score = 50 + (commonSkills.length / totalUniqueSkills) * 50;
    
    return Math.min(100, Math.max(50, Math.round(score)));
};

// @route   GET api/team/match
// @desc    Find potential teammates based on logged-in user's skills
// @access  Private
router.get('/match', auth, async (req, res) => {
    try {
        const currentUser = await User.findById(req.user.id).select('-password');
        if (!currentUser) {
            return res.status(404).json({ msg: 'User not found' });
        }

        const { role, skills } = req.query;
        const matchRole = role || 'Student';
        
        // Find users with matching role and complementary skills
        const query = {
            _id: { $ne: req.user.id }, // Exclude current user
            role: matchRole
        };

        const matches = await User.find(query)
            .select('-password')
            .limit(20);

        // Calculate match scores based on skills
        const currentUserSkills = currentUser.skills || [];
        const results = matches.map(user => {
            const userSkills = user.skills || [];
            const matchScore = calculateMatchScore(currentUserSkills, userSkills);
            
            // Find common skills
            const commonSkills = currentUserSkills.filter(skill => 
                userSkills.some(us => us.toLowerCase() === skill.toLowerCase())
            );
            
            return {
                ...user.toObject(),
                matchScore,
                commonInterests: commonSkills.slice(0, 3)
            };
        }).sort((a, b) => b.matchScore - a.matchScore).slice(0, 10);

        res.json(results);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/team/connect
// @desc    Send connection request to a user
// @access  Private
router.post('/connect', auth, async (req, res) => {
    try {
        const { userId, message } = req.body;
        
        if (!userId) {
            return res.status(400).json({ msg: 'User ID is required' });
        }

        const targetUser = await User.findById(userId).select('-password');
        if (!targetUser) {
            return res.status(404).json({ msg: 'User not found' });
        }

        // In a real app, you'd store connection requests in a database
        // For now, we'll just return success
        res.json({ 
            msg: 'Connection request sent successfully',
            targetUser: {
                id: targetUser._id,
                username: targetUser.username
            }
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server Error', error: err.message });
    }
});

// @route   GET api/team/user/:id
// @desc    Get user info for chat
// @access  Private
router.get('/user/:id', auth, async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        res.json({
            id: user._id,
            username: user.username,
            avatar: user.avatar,
            role: user.role,
            bio: user.bio,
            skills: user.skills
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server Error', error: err.message });
    }
});

module.exports = router;
