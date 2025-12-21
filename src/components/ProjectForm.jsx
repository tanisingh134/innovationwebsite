import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ProjectForm = ({ onClose, onSuccess, initialData = null }) => {
    const [formData, setFormData] = useState({
        title: initialData ? initialData.title : '',
        description: initialData ? initialData.description : '',
        tags: initialData ? (Array.isArray(initialData.tags) ? initialData.tags.join(', ') : initialData.tags) : '',
        link: initialData ? initialData.link || '' : '',
        github: initialData ? initialData.github || '' : ''
    });
    const [loading, setLoading] = useState(false);
    const { logout } = useAuth();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const url = initialData
                ? `http://localhost:5000/api/projects/${initialData._id}`
                : 'http://localhost:5000/api/projects';

            const method = initialData ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': localStorage.getItem('token')
                },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (res.status === 401) {
                logout();
                alert('Session expired. Please login again.');
                onClose();
                return;
            }

            if (!res.ok) throw new Error(data.msg || 'Error saving project');

            onSuccess(data);
            onClose();
        } catch (err) {
            console.error(err);
            // Fallback for Demo Mode (if offline)
            if (err.message === 'Failed to fetch' || err.message.includes('NetworkError')) {
                const demoProject = {
                    ...formData,
                    _id: initialData ? initialData._id : Date.now().toString(),
                    tags: formData.tags.split(',').map(tag => tag.trim()),
                    user: 'demo-user-id',
                    likes: [],
                    createdAt: new Date()
                };
                onSuccess(demoProject);
                alert(`Project ${initialData ? 'updated' : 'created'} in Demo Mode (Offline).`);
            } else {
                alert(err.message);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0,0,0,0.8)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 2000
        }}>
            <div className="glass-panel" style={{ width: '90%', maxWidth: '600px', padding: '2rem', maxHeight: '90vh', overflowY: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.5rem' }}>{initialData ? 'Edit Project' : 'Create New Project'}</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Project Title *</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white', outline: 'none' }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Description *</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            required
                            rows={4}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white', outline: 'none', resize: 'vertical' }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Tags (comma separated)</label>
                        <input
                            type="text"
                            name="tags"
                            value={formData.tags}
                            onChange={handleChange}
                            placeholder="React, CSS, Node.js, Hiring"
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white', outline: 'none' }}
                        />
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                            💡 Tip: Add "Hiring" tag to show your project on the Open Roles Board
                        </p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Demo Link</label>
                            <input
                                type="url"
                                name="link"
                                value={formData.link}
                                onChange={handleChange}
                                placeholder="https://"
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white', outline: 'none' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>GitHub Repo</label>
                            <input
                                type="url"
                                name="github"
                                value={formData.github}
                                onChange={handleChange}
                                placeholder="https://"
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white', outline: 'none' }}
                            />
                        </div>
                    </div>

                    <button className="btn-primary" disabled={loading} style={{ marginTop: '1rem' }}>
                        {loading ? 'Saving...' : (initialData ? 'Update Project' : 'Create Project')}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ProjectForm;
