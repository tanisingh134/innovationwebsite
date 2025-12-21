const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Mentor = require('../models/Mentor');
const auth = require('../middleware/auth');

// Simple in-memory message store (in production, use a database)
const messages = [];

// @route   POST api/messages
// @desc    Send a message
// @access  Private
router.post('/', auth, async (req, res) => {
    try {
        const { recipientId, message, type, mentorId } = req.body; // type: 'mentor' or 'team'
        
        if (!message) {
            return res.status(400).json({ msg: 'Message is required' });
        }

        const sender = await User.findById(req.user.id).select('username avatar');
        if (!sender) {
            return res.status(404).json({ msg: 'Sender not found' });
        }

        // Handle mentor messages differently
        if (type === 'mentor' && mentorId) {
            const mentor = await Mentor.findById(mentorId);
            if (!mentor) {
                return res.status(404).json({ msg: 'Mentor not found' });
            }

            // Store message in mentor's requests or create a simple notification
            if (!mentor.requests) {
                mentor.requests = [];
            }

            mentor.requests.push({
                user: req.user.id,
                message: message,
                status: 'pending',
                createdAt: new Date()
            });

            await mentor.save();

            return res.json({ 
                msg: 'Message sent to mentor successfully',
                message: {
                    id: Date.now().toString(),
                    senderId: req.user.id,
                    senderName: sender.username,
                    recipientId: mentorId,
                    recipientName: mentor.username,
                    message,
                    type: 'mentor',
                    timestamp: new Date()
                }
            });
        }

        // Handle user-to-user messages
        if (!recipientId) {
            return res.status(400).json({ msg: 'Recipient ID is required for team messages' });
        }

        const recipient = await User.findById(recipientId).select('username');
        if (!recipient) {
            return res.status(404).json({ msg: 'Recipient not found' });
        }

        const newMessage = {
            id: Date.now().toString(),
            senderId: req.user.id,
            senderName: sender.username,
            senderAvatar: sender.avatar,
            recipientId,
            recipientName: recipient.username,
            message,
            type: type || 'team',
            timestamp: new Date(),
            read: false
        };

        messages.push(newMessage);

        res.json({ 
            msg: 'Message sent successfully',
            message: newMessage
        });
    } catch (err) {
        console.error('Error sending message:', err);
        res.status(500).json({ msg: 'Server Error', error: err.message });
    }
});

// @route   GET api/messages
// @desc    Get user's messages
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        const userMessages = messages.filter(
            msg => msg.recipientId === req.user.id || msg.senderId === req.user.id
        ).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        res.json(userMessages);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server Error', error: err.message });
    }
});

// @route   POST api/messages/:id/read
// @desc    Mark message as read
// @access  Private
router.post('/:id/read', auth, async (req, res) => {
    try {
        const message = messages.find(m => m.id === req.params.id);
        if (message && message.recipientId === req.user.id) {
            message.read = true;
            res.json({ msg: 'Message marked as read' });
        } else {
            res.status(404).json({ msg: 'Message not found' });
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server Error', error: err.message });
    }
});

module.exports = router;

