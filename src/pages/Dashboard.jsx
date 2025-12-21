import React, { useEffect, useState } from 'react';
import { Plus, Github, ExternalLink, Trash2, Edit } from 'lucide-react';
import ProjectForm from '../components/ProjectForm';

const Dashboard = () => {
    const [projects, setProjects] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingProject, setEditingProject] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchProjects = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setLoading(false);
                return;
            }

            const res = await fetch('http://localhost:5000/api/projects/me', {
                headers: { 'x-auth-token': token }
            });

            if (res.ok) {
                const data = await res.json();
                setProjects(data);
            } else {
                const errorData = await res.json();
                console.error('Failed to fetch projects:', errorData.msg || 'Unknown error');
                setProjects([]);
            }
        } catch (err) {
            console.error('Error fetching projects:', err);
            setProjects([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this project?')) return;
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`http://localhost:5000/api/projects/${id}`, {
                method: 'DELETE',
                headers: { 'x-auth-token': token }
            });

            if (res.ok) {
                setProjects(projects.filter(p => p._id !== id));
            } else {
                const errorData = await res.json();
                alert(errorData.msg || 'Failed to delete project');
            }
        } catch (err) {
            console.error('Error deleting project:', err);
            alert('Error deleting project. Please try again.');
        }
    };

    const handleCreateSuccess = (newProject) => {
        setProjects([newProject, ...projects]);
        setShowForm(false);
    };

    const handleUpdateSuccess = (updatedProject) => {
        setProjects(projects.map(p => p._id === updatedProject._id ? updatedProject : p));
        setEditingProject(null);
    };

    const openEditModal = (project) => {
        setEditingProject(project);
    };

    const filteredProjects = projects.filter(project =>
        project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className="container" style={{ padding: '0 2rem 4rem 2rem', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>My Projects</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Manage and showcase your innovations</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <input
                        type="text"
                        placeholder="Search projects..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="glass-input"
                        style={{ padding: '0.6rem 1rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)', color: 'white', outline: 'none' }}
                    />
                    <button className="btn-primary" onClick={() => setShowForm(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Plus size={20} /> New Project
                    </button>
                </div>
            </header>

            {loading ? (
                <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Loading projects...</p>
            ) : filteredProjects.length === 0 ? (
                <div className="glass-panel" style={{ padding: '4rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
                    <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)' }}>{searchQuery ? 'No matching projects found.' : "You haven't posted any projects yet."}</p>
                    {!searchQuery && <button className="btn-primary" onClick={() => setShowForm(true)} style={{ opacity: 0.8 }}>Create your first project</button>}
                </div>
            ) : (
                <div className="grid-responsive">
                    {filteredProjects.map(project => (
                        <div key={project._id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: '600' }}>{project.title}</h3>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button onClick={() => openEditModal(project)} style={{ background: 'none', border: 'none', color: '#60a5fa', cursor: 'pointer', opacity: 0.7 }} title="Edit">
                                        <Edit size={18} />
                                    </button>
                                    <button onClick={() => handleDelete(project._id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', opacity: 0.7 }} title="Delete">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>

                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', flex: 1 }}>
                                {project.description.length > 100 ? project.description.substring(0, 100) + '...' : project.description}
                            </p>

                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                {project.tags.map((tag, idx) => (
                                    <span key={idx} style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem', borderRadius: '4px', background: 'rgba(255,255,255,0.1)', color: 'var(--text-muted)' }}>
                                        {tag}
                                    </span>
                                ))}
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid var(--glass-border)' }}>
                                {project.github && (
                                    <a href={project.github} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.25rem', textDecoration: 'none', fontSize: '0.9rem' }}>
                                        <Github size={16} /> Code
                                    </a>
                                )}
                                {project.link && (
                                    <a href={project.link} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.25rem', textDecoration: 'none', fontSize: '0.9rem' }}>
                                        <ExternalLink size={16} /> Demo
                                    </a>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showForm && (
                <ProjectForm
                    onClose={() => setShowForm(false)}
                    onSuccess={handleCreateSuccess}
                />
            )}

            {editingProject && (
                <ProjectForm
                    initialData={editingProject}
                    onClose={() => setEditingProject(null)}
                    onSuccess={handleUpdateSuccess}
                />
            )}
        </div>
    );
};

export default Dashboard;
