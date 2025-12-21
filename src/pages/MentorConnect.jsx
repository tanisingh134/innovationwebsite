import React, { useState, useEffect } from 'react';
import { Award, UserCheck, MessageCircle, Plus, Trash2, X, Send } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const MentorConnect = () => {
    const [mentors, setMentors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [chatModal, setChatModal] = useState(null);
    const [chatMessage, setChatMessage] = useState('');
    const { isAuthenticated, user } = useAuth();

    // Form State
    const [formData, setFormData] = useState({
        username: '',
        role: '',
        company: '',
        bio: '',
        skills: ''
    });

    const handleChat = async (mentorId) => {
        if (!isAuthenticated) {
            alert('Please login to send a message');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`http://localhost:5000/api/mentors/${mentorId}/chat`, {
                headers: { 'x-auth-token': token }
            });

            if (res.ok) {
                const mentorInfo = await res.json();
                setChatModal(mentorInfo);
            } else {
                alert('Failed to load mentor info');
            }
        } catch (err) {
            console.error('Error loading mentor:', err);
            alert('Error loading mentor');
        }
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!chatMessage.trim()) return;

        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:5000/api/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify({
                    mentorId: chatModal.id,
                    message: chatMessage,
                    type: 'mentor'
                })
            });

            if (res.ok) {
                alert('Message sent successfully!');
                setChatMessage('');
                setChatModal(null);
            } else {
                const error = await res.json().catch(() => ({ msg: 'Failed to send message' }));
                alert(error.msg || 'Failed to send message');
            }
        } catch (err) {
            console.error('Error sending message:', err);
            alert('Error sending message');
        }
    };

    useEffect(() => {
        fetchMentors();
    }, []);

    const fetchMentors = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/mentors');
            if (res.ok) {
                const data = await res.json();
                setMentors(Array.isArray(data) ? data : []);
            } else {
                console.error('Failed to fetch mentors');
                setMentors([]);
            }
        } catch (err) {
            console.error("Error fetching mentors:", err);
            setMentors([]);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this mentor?")) return;

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`http://localhost:5000/api/mentors/${id}`, {
                method: 'DELETE',
                headers: { 'x-auth-token': token }
            });

            if (res.ok) {
                setMentors(mentors.filter(m => m._id !== id));
            } else {
                alert("Failed to delete. Ensure you are logged in.");
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:5000/api/mentors', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                const newMentor = await res.json();
                setMentors([newMentor, ...mentors]);
                setShowModal(false);
                setFormData({ username: '', role: '', company: '', bio: '', skills: '' });
            } else {
                alert("Failed to add mentor. Please login.");
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleMentorRequest = async (mentorId) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Please login to send a mentor request');
                return;
            }

            const message = prompt('Add a message to your mentor request (optional):') || '';
            const res = await fetch(`http://localhost:5000/api/mentors/${mentorId}/request`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify({ message: message || undefined })
            });

            if (res.ok) {
                const data = await res.json();
                alert(data.msg || 'Mentor request sent successfully!');
            } else {
                const error = await res.json().catch(() => ({ msg: 'Failed to send mentor request' }));
                alert(error.msg || 'Failed to send mentor request');
            }
        } catch (err) {
            console.error('Error sending mentor request:', err);
            alert('Error sending mentor request. Please try again.');
        }
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
            <div className="glass-panel" style={{ padding: '3rem', marginBottom: '2rem', textAlign: 'center', position: 'relative' }}>
                <div style={{ background: 'rgba(124, 58, 237, 0.1)', display: 'inline-block', padding: '1rem', borderRadius: '50%', marginBottom: '1.5rem' }}>
                    <Award size={48} style={{ color: '#8b5cf6' }} />
                </div>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Mentor Connect</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
                    Get guidance from industry experts. Connect with mentors who can accelerate your innovation journey.
                </p>

                <button
                    className="btn-primary"
                    onClick={() => setShowModal(true)}
                    style={{ position: 'absolute', top: '2rem', right: '2rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}
                >
                    <Plus size={18} /> Add Mentor
                </button>
            </div>

            {loading ? (
                <p style={{ textAlign: 'center' }}>Connecting to mentor network...</p>
            ) : mentors.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                    <p>No mentors found. Be the first to add one!</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '2rem' }}>
                    {mentors.map(mentor => (
                        <div key={mentor._id} className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', borderTop: '4px solid #8b5cf6', position: 'relative' }}>
                            {isAuthenticated && user && (
                                <button
                                    onClick={() => handleDelete(mentor._id)}
                                    style={{
                                        position: 'absolute', top: '1rem', right: '1rem',
                                        background: 'none', border: 'none', color: '#ef4444',
                                        cursor: 'pointer', opacity: 0.6,
                                        transition: 'opacity 0.2s'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
                                    onMouseLeave={(e) => e.currentTarget.style.opacity = 0.6}
                                    title="Delete mentor"
                                >
                                    <Trash2 size={16} />
                                </button>
                            )}

                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <img
                                    src={mentor.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${mentor.username}`}
                                    alt={mentor.username}
                                    style={{ width: '80px', height: '80px', borderRadius: '50%', border: '2px solid rgba(139, 92, 246, 0.5)' }}
                                />
                                <div>
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{mentor.username}</h3>
                                    <span style={{
                                        color: '#8b5cf6',
                                        fontSize: '0.9rem',
                                        fontWeight: '500',
                                        background: 'rgba(139, 92, 246, 0.1)',
                                        padding: '0.2rem 0.5rem',
                                        borderRadius: '4px'
                                    }}>
                                        {mentor.role} {mentor.company && `at ${mentor.company}`}
                                    </span>
                                </div>
                            </div>

                            <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>
                                {mentor.bio}
                            </p>

                            <div>
                                <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                    Expertise
                                </h4>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                    {mentor.skills.map((skill, idx) => (
                                        <span key={idx} style={{
                                            background: 'rgba(255,255,255,0.05)',
                                            padding: '0.25rem 0.75rem',
                                            borderRadius: '999px',
                                            fontSize: '0.85rem',
                                            border: '1px solid rgba(255,255,255,0.1)'
                                        }}>
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div style={{ marginTop: 'auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <button 
                                    onClick={() => handleMentorRequest(mentor._id)}
                                    className="btn-primary" 
                                    style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', background: '#8b5cf6' }}>
                                    <UserCheck size={18} /> Request
                                </button>
                                <button 
                                    onClick={() => handleChat(mentor._id)}
                                    style={{
                                        padding: '0.8rem',
                                        borderRadius: '8px',
                                        background: 'transparent',
                                        border: '1px solid var(--glass-border)',
                                        color: 'white',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                                        e.currentTarget.style.borderColor = 'var(--primary)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = 'transparent';
                                        e.currentTarget.style.borderColor = 'var(--glass-border)';
                                    }}
                                >
                                    <MessageCircle size={18} /> Chat
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add Mentor Modal */}
            {showModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)',
                    display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
                }}>
                    <div className="glass-panel" style={{ width: '90%', maxWidth: '500px', padding: '2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                            <h2>Add New Mentor</h2>
                            <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <input
                                className="glass-input" placeholder="Full Name" required
                                value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value })}
                            />
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <input
                                    className="glass-input" placeholder="Role (e.g. Senior Engineer)" required
                                    value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })}
                                />
                                <input
                                    className="glass-input" placeholder="Company (Optional)"
                                    value={formData.company} onChange={e => setFormData({ ...formData, company: e.target.value })}
                                />
                            </div>
                            <textarea
                                className="glass-input" placeholder="Short Bio" rows={3} required
                                value={formData.bio} onChange={e => setFormData({ ...formData, bio: e.target.value })}
                            />
                            <input
                                className="glass-input" placeholder="Skills (comma separated)" required
                                value={formData.skills} onChange={e => setFormData({ ...formData, skills: e.target.value })}
                            />
                            <button type="submit" className="btn-primary" style={{ marginTop: '1rem' }}>
                                Add Mentor
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Chat Modal */}
            {chatModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)',
                    display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1001
                }}>
                    <div className="glass-panel" style={{ width: '90%', maxWidth: '500px', padding: '2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <img 
                                    src={chatModal.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${chatModal.username}`}
                                    alt={chatModal.username}
                                    style={{ width: '48px', height: '48px', borderRadius: '50%' }}
                                />
                                <div>
                                    <h3 style={{ margin: 0 }}>{chatModal.username}</h3>
                                    <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                        {chatModal.role} {chatModal.company && `at ${chatModal.company}`}
                                    </p>
                                </div>
                            </div>
                            <button onClick={() => { setChatModal(null); setChatMessage(''); }} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={sendMessage} style={{ display: 'flex', gap: '0.5rem' }}>
                            <input
                                type="text"
                                value={chatMessage}
                                onChange={(e) => setChatMessage(e.target.value)}
                                placeholder="Type your message..."
                                className="glass-input"
                                style={{ flex: 1 }}
                                required
                            />
                            <button type="submit" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Send size={18} /> Send
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MentorConnect;
