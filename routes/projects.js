const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Middleware to verify token
const auth = (req, res, next) => {
    const token = req.header('x-auth-token');
    if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        req.user = decoded.user;
        next();
    } catch (err) {
        res.status(401).json({ msg: 'Token is not valid' });
    }
};

// @route   GET api/projects
// @desc    Get all projects
// @access  Public
router.get('/', async (req, res) => {
    try {
        const { search } = req.query;
        let query = {};

        // Only add search query if search term is provided and not empty
        if (search && search.trim()) {
            query = {
                $or: [
                    { title: { $regex: search.trim(), $options: 'i' } },
                    { tags: { $regex: search.trim(), $options: 'i' } }
                ]
            };
        }

        const projects = await Project.find(query)
            .sort({ createdAt: -1 })
            .populate('user', 'username avatar');

        // Convert to plain objects and handle null users
        const projectsData = projects.map(project => {
            const projectData = project.toObject();
            return {
                ...projectData,
                user: projectData.user || { username: 'Unknown', avatar: null },
                likes: projectData.likes || [],
                comments: projectData.comments || [],
                tags: projectData.tags || []
            };
        });

        res.json(projectsData);
    } catch (err) {
        console.error('Error fetching projects:', err);
        res.status(500).json({ msg: 'Server Error', error: err.message });
    }
});

// @route   GET api/projects/me
// @desc    Get current user projects
// @access  Private
router.get('/me', auth, async (req, res) => {
    try {
        const projects = await Project.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.json(projects);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/projects/:id
// @desc    Get project by ID
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const project = await Project.findById(req.params.id)
            .populate('user', ['username', 'avatar'])
            .populate('likes.user', ['username'])
            .populate('comments.user', ['username', 'avatar']);

        if (!project) {
            return res.status(404).json({ msg: 'Project not found' });
        }

        res.json(project);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Project not found' });
        }
        res.status(500).send('Server Error');
    }
});

// @route   POST api/projects
// @desc    Create a project
// @access  Private
router.post('/', auth, async (req, res) => {
    try {
        const { title, description, tags, link, github } = req.body;

        const newProject = new Project({
            title,
            description,
            tags: Array.isArray(tags) ? tags : tags.split(',').map(tag => tag.trim()),
            link,
            github,
            user: req.user.id,
            contributions: [{
                user: req.user.id,
                action: 'created',
                description: `Created project "${title}"`,
                timestamp: new Date()
            }]
        });

        const project = await newProject.save();
        res.json(project);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server Error', error: err.message });
    }
});

// @route   PUT api/projects/:id
// @desc    Update a project
// @access  Private
router.put('/:id', auth, async (req, res) => {
    try {
        const { title, description, tags, link, github } = req.body;

        // Build project object
        const projectFields = {};
        if (title) projectFields.title = title;
        if (description) projectFields.description = description;
        if (tags) {
            projectFields.tags = Array.isArray(tags) ? tags : tags.split(',').map(tag => tag.trim());
        }
        if (link) projectFields.link = link;
        if (github) projectFields.github = github;

        let project = await Project.findById(req.params.id);

        if (!project) return res.status(404).json({ msg: 'Project not found' });

        // Make sure user owns project
        if (project.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        project = await Project.findByIdAndUpdate(
            req.params.id,
            { $set: projectFields },
            { new: true }
        );

        // Add contribution
        if (!project.contributions) {
            project.contributions = [];
        }
        project.contributions.push({
            user: req.user.id,
            action: 'updated',
            description: `Updated project "${title || project.title}"`,
            timestamp: new Date()
        });
        await project.save();

        res.json(project);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Project not found' });
        }
        res.status(500).send('Server Error');
    }
});

// @route   DELETE api/projects/:id
// @desc    Delete a project
// @access  Private
router.delete('/:id', auth, async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({ msg: 'Project not found' });
        }

        // Check user
        if (project.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        await project.deleteOne();

        res.json({ msg: 'Project removed' });
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Project not found' });
        }
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/projects/like/:id
// @desc    Like a project
// @access  Private
router.put('/like/:id', auth, async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);

        const wasLiked = project.likes.filter(like => like.user.toString() === req.user.id).length > 0;

        // Check if the project has already been liked
        if (wasLiked) {
            // Remove like
            project.likes = project.likes.filter(like => like.user.toString() !== req.user.id);
        } else {
            // Add like
            project.likes.unshift({ user: req.user.id });
        }

        // Add contribution
        if (!project.contributions) {
            project.contributions = [];
        }
        project.contributions.push({
            user: req.user.id,
            action: wasLiked ? 'unliked' : 'liked',
            description: wasLiked ? `Unliked ${project.title}` : `Liked ${project.title}`,
            timestamp: new Date()
        });

        await project.save();

        res.json(project.likes);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server Error', error: err.message });
    }
});

// @route   POST api/projects/comment/:id
// @desc    Comment on a project
// @access  Private
router.post('/comment/:id', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        const project = await Project.findById(req.params.id);

        const newComment = {
            text: req.body.text,
            name: user.username,
            avatar: user.avatar,
            user: req.user.id
        };

        project.comments.unshift(newComment);

        // Add contribution history
        if (!project.contributions) {
            project.contributions = [];
        }
        project.contributions.push({
            user: req.user.id,
            action: 'commented',
            description: `Commented on ${project.title}`,
            timestamp: new Date()
        });

        await project.save();

        res.json(project.comments);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server Error', error: err.message });
    }
});

// @route   PUT api/projects/:id/roles
// @desc    Add or update open roles for a project
// @access  Private
router.put('/:id/roles', auth, async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) {
            return res.status(404).json({ msg: 'Project not found' });
        }

        if (project.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        const { role, skills, description } = req.body;

        if (!project.openRoles) {
            project.openRoles = [];
        }

        project.openRoles.push({
            role,
            skills: Array.isArray(skills) ? skills : skills.split(',').map(s => s.trim()),
            description,
            status: 'open'
        });

        // Add contribution
        if (!project.contributions) {
            project.contributions = [];
        }
        project.contributions.push({
            user: req.user.id,
            action: 'added_role',
            description: `Added open role: ${role}`,
            timestamp: new Date()
        });

        await project.save();
        res.json(project.openRoles);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server Error', error: err.message });
    }
});

// @route   GET api/projects/:id/workspace
// @desc    Get project workspace
// @access  Public
router.get('/:id/workspace', async (req, res) => {
    try {
        const project = await Project.findById(req.params.id)
            .populate('workspace.kanban.todo.assignee', 'username')
            .populate('workspace.kanban.inProgress.assignee', 'username')
            .populate('workspace.kanban.done.assignee', 'username')
            .populate('workspace.notes.author', 'username')
            .select('workspace');

        if (!project) {
            return res.status(404).json({ msg: 'Project not found' });
        }

        res.json(project.workspace || { kanban: { todo: [], inProgress: [], done: [] }, notes: [] });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server Error', error: err.message });
    }
});

// @route   PUT api/projects/:id/workspace/kanban
// @desc    Update Kanban board
// @access  Private
router.put('/:id/workspace/kanban', auth, async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) {
            return res.status(404).json({ msg: 'Project not found' });
        }

        if (!project.workspace) {
            project.workspace = { kanban: { todo: [], inProgress: [], done: [] }, notes: [] };
        }

        const { column, task } = req.body;

        if (column === 'todo') {
            project.workspace.kanban.todo.push({
                title: task.title,
                description: task.description,
                assignee: task.assignee || req.user.id,
                createdAt: new Date()
            });
        } else if (column === 'inProgress') {
            project.workspace.kanban.inProgress.push({
                title: task.title,
                description: task.description,
                assignee: task.assignee || req.user.id,
                createdAt: new Date()
            });
        } else if (column === 'done') {
            project.workspace.kanban.done.push({
                title: task.title,
                description: task.description,
                assignee: task.assignee || req.user.id,
                completedAt: new Date()
            });
        }

        // Add contribution
        if (!project.contributions) {
            project.contributions = [];
        }
        project.contributions.push({
            user: req.user.id,
            action: 'updated_kanban',
            description: `Added task "${task.title}" to ${column}`,
            timestamp: new Date()
        });

        await project.save();
        res.json(project.workspace.kanban);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server Error', error: err.message });
    }
});

// @route   POST api/projects/:id/workspace/notes
// @desc    Add note to workspace
// @access  Private
router.post('/:id/workspace/notes', auth, async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) {
            return res.status(404).json({ msg: 'Project not found' });
        }

        if (!project.workspace) {
            project.workspace = { kanban: { todo: [], inProgress: [], done: [] }, notes: [] };
        }

        project.workspace.notes.push({
            content: req.body.content,
            author: req.user.id,
            createdAt: new Date()
        });

        // Add contribution
        if (!project.contributions) {
            project.contributions = [];
        }
        project.contributions.push({
            user: req.user.id,
            action: 'added_note',
            description: 'Added a note to workspace',
            timestamp: new Date()
        });

        await project.save();
        res.json(project.workspace.notes);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server Error', error: err.message });
    }
});

// @route   GET api/projects/:id/contributions
// @desc    Get project contribution history
// @access  Public
router.get('/:id/contributions', async (req, res) => {
    try {
        const project = await Project.findById(req.params.id)
            .populate('contributions.user', 'username avatar')
            .select('contributions');

        if (!project) {
            return res.status(404).json({ msg: 'Project not found' });
        }

        res.json(project.contributions || []);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server Error', error: err.message });
    }
});

// @route   PUT api/projects/:id/lean-canvas
// @desc    Update Lean Canvas
// @access  Private
router.put('/:id/lean-canvas', auth, async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) {
            return res.status(404).json({ msg: 'Project not found' });
        }

        if (project.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        project.leanCanvas = req.body;

        // Add contribution
        if (!project.contributions) {
            project.contributions = [];
        }
        project.contributions.push({
            user: req.user.id,
            action: 'updated_canvas',
            description: 'Updated Lean Canvas',
            timestamp: new Date()
        });

        await project.save();
        res.json(project.leanCanvas);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server Error', error: err.message });
    }
});

module.exports = router;
