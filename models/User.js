const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    bio: {
        type: String
    },
    skills: {
        type: [String]
    },
    avatar: {
        type: String
    },
    createAt: {
        type: Date,
        default: Date.now
    },
    role: {
        type: String,
        enum: ['Student', 'Mentor', 'Recruiter', 'Admin'],
        default: 'Student'
    },
    achievements: [{
        title: String,
        description: String,
        date: { type: Date, default: Date.now },
        icon: String
    }],
    mentorshipInterests: [String],
    lookingFor: [String], // 'Teammates', 'Mentorship', 'Investment'
    socialLinks: {
        linkedin: String,
        github: String,
        portfolio: String
    }
});

module.exports = mongoose.model('User', UserSchema);
