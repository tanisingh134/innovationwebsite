import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Github, ExternalLink, Heart, MessageSquare, ArrowLeft, Send, Share2, User, Copy, Check, Briefcase, History, Layout, Plus, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ProjectDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();
    const [project, setProject] = useState(null);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);
    const [contributions, setContributions] = useState([]);
    const [showRoleModal, setShowRoleModal] = useState(false);
    const [newRole, setNewRole] = useState({ role: '', skills: '', description: '' });

    useEffect(() => {
        fetchProject();
        fetchContributions();
    }, [id]);

    const fetchContributions = async () => {
        try {
            const res = await fetch(`http://localhost:5000/api/projects/${id}/contributions`);
            if (res.ok) {
                const data = await res.json();
                setContributions(data);
            }
        } catch (err) {
            console.error('Error fetching contributions:', err);
        }
    };

    const addOpenRole = async () => {
        if (!newRole.role.trim()) return;

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`http://localhost:5000/api/projects/${id}/roles`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify(newRole)
            });

            if (res.ok) {
                const updatedProject = await fetch(`http://localhost:5000/api/projects/${id}`).then(r => r.json());
                setProject(updatedProject);
                setNewRole({ role: '', skills: '', description: '' });
                setShowRoleModal(false);
                fetchContributions();
            }
        } catch (err) {
            console.error('Error adding role:', err);
        }
    };

    const fetchProject = async () => {
        try {
            const res = await fetch(`http://localhost:5000/api/projects/${id}`);
            if (res.ok) {
                const data = await res.json();
                setProject(data);
            } else {
                console.error('Project not found');
            }
        } catch (err) {
            console.error('Error fetching project:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleLike = async () => {
        if (!isAuthenticated) {
            alert('Please login to like projects');
            navigate('/login');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`http://localhost:5000/api/projects/like/${id}`, {
                method: 'PUT',
                headers: { 'x-auth-token': token }
            });
            
            if (res.ok) {
                const likes = await res.json();
                setProject({ ...project, likes });
            } else {
                const error = await res.json();
                alert(error.msg || 'Failed to like project');
            }
        } catch (err) {
            console.error('Error liking project:', err);
            alert('Error liking project');
        }
    };

    const handleShare = async () => {
        const url = window.location.href;
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = url;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const viewUserProfile = () => {
        if (project?.user?._id) {
            navigate(`/profile/${project.user._id}`);
        }
    };

    const handleComment = async (e) => {
        e.preventDefault();
        if (!isAuthenticated) {
            alert('Please login to comment');
            navigate('/login');
            return;
        }

        if (!comment.trim()) {
            alert('Please enter a comment');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`http://localhost:5000/api/projects/comment/${id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify({ text: comment })
            });
            
            if (res.ok) {
                const comments = await res.json();
                setProject({ ...project, comments });
                setComment('');
            } else {
                const error = await res.json();
                alert(error.msg || 'Failed to add comment');
            }
        } catch (err) {
            console.error('Error adding comment:', err);
            alert('Error adding comment');
        }
    };

    if (loading) return <div className="container" style={{ padding: '2rem' }}>Loading...</div>;
    if (!project) return <div className="container" style={{ padding: '2rem' }}>Project not found</div>;

    return (
        <div className="container" style={{ padding: '0 2rem 4rem 2rem', maxWidth: '1000px', margin: '0 auto' }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', textDecoration: 'none', marginBottom: '2rem' }}>
                <ArrowLeft size={20} /> Back to Projects
            </Link>

            <div className="glass-panel" style={{ padding: '3rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '2rem' }}>
                    <div>
                        <h1 style={{ fontSize: '3rem', lineHeight: 1.2, marginBottom: '0.5rem' }}>{project.title}</h1>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <p style={{ color: 'var(--text-muted)', margin: 0 }}>Posted by </p>
                            <button
                                onClick={viewUserProfile}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--primary)',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.25rem',
                                    padding: 0,
                                    fontWeight: '600'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                                onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                            >
                                <User size={16} />
                                {project.user?.username || 'Unknown'}
                            </button>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        {project.github && (
                            <a href={project.github} target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
                                <Github size={20} /> GitHub
                            </a>
                        )}
                        {project.link && (
                            <a href={project.link} target="_blank" rel="noopener noreferrer" style={{ padding: '0.75rem 1.5rem', borderRadius: '9999px', border: '1px solid var(--glass-border)', color: 'white', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.2s' }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                                    e.currentTarget.style.borderColor = 'var(--primary)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'transparent';
                                    e.currentTarget.style.borderColor = 'var(--glass-border)';
                                }}
                            >
                                <ExternalLink size={20} /> Demo
                            </a>
                        )}
                        <button
                            onClick={handleShare}
                            style={{
                                padding: '0.75rem 1.5rem',
                                borderRadius: '9999px',
                                border: '1px solid var(--glass-border)',
                                background: copied ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
                                color: copied ? '#10b981' : 'white',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                transition: 'all 0.2s'
                            }}
                            title="Share project"
                        >
                            {copied ? <Check size={20} /> : <Share2 size={20} />}
                            {copied ? 'Copied!' : 'Share'}
                        </button>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                    {project.tags.map((tag, idx) => (
                        <span key={idx} style={{ padding: '0.5rem 1rem', borderRadius: '8px', background: 'rgba(255,255,255,0.1)', color: 'var(--text-muted)' }}>
                            {tag}
                        </span>
                    ))}
                    {project.tags.some(t => t.toLowerCase() === 'hiring') && (
                        <span style={{ padding: '0.5rem 1rem', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', fontWeight: '600' }}>
                            🎯 Hiring
                        </span>
                    )}
                </div>

                {/* Open Roles Section */}
                {project.openRoles && project.openRoles.length > 0 && (
                    <div style={{ marginBottom: '2rem', padding: '1.5rem', background: 'rgba(16, 185, 129, 0.05)', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                                <Briefcase size={20} /> Open Roles
                            </h3>
                            {isAuthenticated && project.user?._id === user?.id && (
                                <button onClick={() => setShowRoleModal(true)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                                    <Plus size={16} /> Add Role
                                </button>
                            )}
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
                            {project.openRoles.filter(r => r.status === 'open').map((role, idx) => (
                                <div key={idx} style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                                    <h4 style={{ marginBottom: '0.5rem', color: '#10b981' }}>{role.role}</h4>
                                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>{role.description}</p>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                        {role.skills?.map((skill, sIdx) => (
                                            <span key={sIdx} style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '4px', color: '#10b981' }}>
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Add Role Button if project owner */}
                {isAuthenticated && project.user?._id === user?.id && (!project.openRoles || project.openRoles.length === 0) && (
                    <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                        <button onClick={() => setShowRoleModal(true)} className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Plus size={18} /> Add Open Roles
                        </button>
                    </div>
                )}

                {/* Workspace Link */}
                <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                    <Link to={`/project/${id}/workspace`} className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
                        <Layout size={18} /> Open Workspace
                    </Link>
                </div>

                <p style={{ fontSize: '1.2rem', lineHeight: '1.8', marginBottom: '3rem', whiteSpace: 'pre-line' }}>
                    {project.description}
                </p>

                <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '2rem' }}>
                        <button onClick={handleLike} style={{ background: 'none', border: 'none', color: 'var(--secondary)', fontSize: '1.2rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Heart size={24} fill={project.likes && project.likes.find(l => l.user && (l.user._id || l.user) === localStorage.getItem('userId')) ? 'currentColor' : 'none'} />
                            {project.likes?.length || 0} Likes
                        </button>
                        <div style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                            <MessageSquare size={24} /> {project.comments?.length || 0} Comments
                        </div>
                    </div>

                    {isAuthenticated ? (
                        <form onSubmit={handleComment} style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                            <input
                                type="text"
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Add a comment..."
                                style={{ flex: 1, padding: '1rem', borderRadius: '12px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white', outline: 'none' }}
                            />
                            <button type="submit" className="btn-primary" style={{ borderRadius: '12px' }}><Send size={20} /></button>
                        </form>
                    ) : (
                        <div style={{ padding: '1rem', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.05)', marginBottom: '2rem', textAlign: 'center' }}>
                            <p style={{ color: 'var(--text-muted)', margin: 0 }}>
                                <Link to="/login" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Login</Link> to add a comment
                            </p>
                        </div>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {project.comments && project.comments.length > 0 ? (
                            project.comments.map((comment, idx) => (
                                <div key={idx} style={{ padding: '1rem', borderRadius: '12px', background: 'rgba(255,255,255,0.05)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                        <span style={{ fontWeight: '600', color: 'var(--primary)' }}>{comment.name || comment.user?.username || 'Anonymous'}</span>
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{comment.date ? new Date(comment.date).toLocaleDateString() : 'Recently'}</span>
                                    </div>
                                    <p>{comment.text}</p>
                                </div>
                            ))
                        ) : (
                            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>No comments yet. Be the first to comment!</p>
                        )}
                    </div>
                </div>

                {/* Contribution History */}
                {contributions.length > 0 && (
                    <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '2rem', marginTop: '2rem' }}>
                        <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <History size={20} /> Contribution History
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {contributions.slice(0, 10).map((contribution, idx) => (
                                <div key={idx} style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                            <span style={{ fontWeight: '600' }}>{contribution.user?.username || 'Unknown'}</span>
                                            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{contribution.action}</span>
                                        </div>
                                        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: 0 }}>{contribution.description}</p>
                                    </div>
                                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                        {new Date(contribution.timestamp).toLocaleDateString()}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Add Role Modal */}
            {showRoleModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)',
                    display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
                }}>
                    <div className="glass-panel" style={{ width: '90%', maxWidth: '500px', padding: '2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                            <h2>Add Open Role</h2>
                            <button onClick={() => setShowRoleModal(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
                                <X size={24} />
                            </button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <input
                                className="glass-input"
                                placeholder="Role (e.g., Frontend Developer)"
                                value={newRole.role}
                                onChange={e => setNewRole({ ...newRole, role: e.target.value })}
                                required
                            />
                            <input
                                className="glass-input"
                                placeholder="Required Skills (comma separated)"
                                value={newRole.skills}
                                onChange={e => setNewRole({ ...newRole, skills: e.target.value })}
                            />
                            <textarea
                                className="glass-input"
                                placeholder="Role Description"
                                rows={3}
                                value={newRole.description}
                                onChange={e => setNewRole({ ...newRole, description: e.target.value })}
                            />
                            <button onClick={addOpenRole} className="btn-primary">Add Role</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProjectDetails;
