const mongoose = require('mongoose');

const MentorSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    role: {
        type: String, // e.g., "Senior Engineer", "Product Manager"
        required: true
    },
    company: {
        type: String
    },
    bio: {
        type: String,
        required: true
    },
    skills: {
        type: [String],
        required: true
    },
    avatar: {
        type: String
    },
    socials: {
        linkedin: String,
        twitter: String,
        email: String
    },
    requests: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        message: String,
        status: {
            type: String,
            enum: ['pending', 'accepted', 'rejected'],
            default: 'pending'
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Mentor', MentorSchema);
