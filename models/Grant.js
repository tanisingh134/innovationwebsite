const mongoose = require('mongoose');

const GrantSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['Grant', 'Competition', 'Scholarship', 'Hackathon', 'VC'],
        required: true
    },
    amount: {
        type: String // e.g., "$10,000" or "Up to $50,000"
    },
    deadline: {
        type: Date,
        required: true
    },
    eligibility: [String],
    link: {
        type: String,
        required: true
    },
    tags: [String],
    featured: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Grant', GrantSchema);

