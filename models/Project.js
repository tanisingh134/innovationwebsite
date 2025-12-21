const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    tags: {
        type: [String],
        default: []
    },
    likes: [
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            }
        }
    ],
    comments: [
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            text: {
                type: String,
                required: true
            },
            name: {
                type: String
            },
            date: {
                type: Date,
                default: Date.now
            }
        }
    ],
    link: {
        type: String
    },
    github: {
        type: String
    },
    openRoles: [{
        role: String,
        skills: [String],
        description: String,
        status: {
            type: String,
            enum: ['open', 'filled'],
            default: 'open'
        }
    }],
    workspace: {
        kanban: {
            todo: [{ title: String, description: String, assignee: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, createdAt: Date }],
            inProgress: [{ title: String, description: String, assignee: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, createdAt: Date }],
            done: [{ title: String, description: String, assignee: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, completedAt: Date }]
        },
        notes: [{
            content: String,
            author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            createdAt: { type: Date, default: Date.now }
        }]
    },
    contributions: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        action: String,
        description: String,
        timestamp: { type: Date, default: Date.now }
    }],
    leanCanvas: {
        problem: String,
        solution: String,
        keyMetrics: String,
        uniqueValue: String,
        unfairAdvantage: String,
        channels: String,
        customerSegments: String,
        costStructure: String,
        revenueStreams: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Project', ProjectSchema);
