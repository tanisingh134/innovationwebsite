const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    bio: {
        type: String
    },
    role: {
        type: String,
        default: 'Student Innovator'
    },
    skills: {
        type: [String]
    },
    company: {
        type: String
    },
    website: {
        type: String
    },
    location: {
        type: String
    },
    social: {
        youtube: { type: String },
        twitter: { type: String },
        facebook: { type: String },
        linkedin: { type: String },
        instagram: { type: String },
        github: { type: String }
    },
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('profile', ProfileSchema);
