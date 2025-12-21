import React, { useState, useEffect } from 'react';
import { Users, Briefcase, Code, Star, MessageCircle, UserPlus, Send, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const TeamBuilder = () => {
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [chatModal, setChatModal] = useState(null);
    const [chatMessage, setChatMessage] = useState('');
    const { isAuthenticated } = useAuth();

    useEffect(() => {
        fetchMatches();
    }, []);

    const fetchMatches = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setLoading(false);
                return;
            }

            const res = await fetch('http://localhost:5000/api/team/match', {
                headers: { 'x-auth-token': token }
            });
            
            if (res.ok) {
                const data = await res.json();
                setMatches(data);
            } else {
                console.error('Failed to fetch matches');
                setMatches([]);
            }
        } catch (err) {
            console.error("Error fetching team matches:", err);
            setMatches([]);
        } finally {
            setLoading(false);
        }
    };

    const handleConnect = async (userId) => {
        if (!isAuthenticated) {
            alert('Please login to connect');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:5000/api/team/connect', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify({ userId, message: 'I would like to connect with you!' })
            });

            if (res.ok) {
                alert('Connection request sent!');
            } else {
                const error = await res.json();
                alert(error.msg || 'Failed to send connection request');
            }
        } catch (err) {
            console.error('Error sending connection request:', err);
            alert('Error sending connection request');
        }
    };

    const handleChat = async (userId) => {
        if (!isAuthenticated) {
            alert('Please login to send a message');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`http://localhost:5000/api/team/user/${userId}`, {
                headers: { 'x-auth-token': token }
            });

            if (res.ok) {
                const userInfo = await res.json();
                setChatModal(userInfo);
            } else {
                alert('Failed to load user info');
            }
        } catch (err) {
            console.error('Error loading user:', err);
            alert('Error loading user');
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
                    recipientId: chatModal.id,
                    message: chatMessage,
                    type: 'team'
                })
            });

            if (res.ok) {
                alert('Message sent successfully!');
                setChatMessage('');
                setChatModal(null);
            } else {
                const error = await res.json();
                alert(error.msg || 'Failed to send message');
            }
        } catch (err) {
            console.error('Error sending message:', err);
            alert('Error sending message');
        }
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
            <div className="glass-panel" style={{ padding: '3rem', marginBottom: '2rem', textAlign: 'center' }}>
                <div style={{ background: 'rgba(16, 185, 129, 0.1)', display: 'inline-block', padding: '1rem', borderRadius: '50%', marginBottom: '1.5rem' }}>
                    <Users size={48} style={{ color: '#10b981' }} />
                </div>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Smart Team Builder</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
                    Find the perfect co-founders and teammates. Our algorithm matches you based on complementary skills and shared interests.
                </p>
            </div>

            {loading ? (
                <p style={{ textAlign: 'center' }}>Finding your perfect match...</p>
            ) : matches.length === 0 ? (
                <div className="glass-panel" style={{ padding: '4rem', textAlign: 'center' }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>
                        No matches found. Make sure you've added skills to your profile!
                    </p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
                    {matches.map(user => (
                        <div key={user._id} className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'relative', overflow: 'hidden' }}>
                            {/* Match Score Badge */}
                            <div style={{
                                position: 'absolute',
                                top: '1rem',
                                right: '1rem',
                                background: 'rgba(16, 185, 129, 0.2)',
                                color: '#10b981',
                                padding: '0.25rem 0.75rem',
                                borderRadius: '999px',
                                fontSize: '0.8rem',
                                fontWeight: 'bold',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.25rem'
                            }}>
                                <Star size={12} fill="#10b981" /> {user.matchScore}% Match
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{
                                    width: '64px',
                                    height: '64px',
                                    borderRadius: '50%',
                                    background: 'var(--glass-border)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '1.5rem',
                                    fontWeight: 'bold',
                                    color: 'white'
                                }}>
                                    {user.avatar ? <img src={user.avatar} alt={user.username} style={{ width: '100%', height: '100%', borderRadius: '50%' }} /> : user.username[0].toUpperCase()}
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{user.username}</h3>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{user.role}</p>
                                </div>
                            </div>

                            <div>
                                <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Code size={14} /> Skills
                                </h4>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                    {user.skills && user.skills.length > 0 ? (
                                        user.skills.slice(0, 4).map((skill, idx) => (
                                            <span key={idx} style={{
                                                background: 'rgba(255,255,255,0.05)',
                                                padding: '0.25rem 0.5rem',
                                                borderRadius: '4px',
                                                fontSize: '0.8rem'
                                            }}>
                                                {skill}
                                            </span>
                                        ))
                                    ) : (
                                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>No skills listed</span>
                                    )}
                                </div>
                                {user.commonInterests && user.commonInterests.length > 0 && (
                                    <div style={{ marginTop: '0.75rem' }}>
                                        <h5 style={{ fontSize: '0.8rem', color: '#10b981', marginBottom: '0.25rem' }}>Common Interests</h5>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                            {user.commonInterests.map((interest, idx) => (
                                                <span key={idx} style={{
                                                    background: 'rgba(16, 185, 129, 0.1)',
                                                    padding: '0.25rem 0.5rem',
                                                    borderRadius: '4px',
                                                    fontSize: '0.75rem',
                                                    color: '#10b981'
                                                }}>
                                                    {interest}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                                <p style={{ fontSize: '0.9rem', fontStyle: 'italic', color: 'var(--text-muted)' }}>
                                    "{user.bio || "Ready to build something amazing!"}"
                                </p>
                            </div>

                            <div style={{ marginTop: 'auto', display: 'flex', gap: '1rem' }}>
                                <button 
                                    onClick={() => handleConnect(user._id)}
                                    className="btn-primary" 
                                    style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
                                    <UserPlus size={18} /> Connect
                                </button>
                                <button 
                                    onClick={() => handleChat(user._id)}
                                    style={{
                                        padding: '0.8rem',
                                        borderRadius: '8px',
                                        background: 'rgba(255,255,255,0.1)',
                                        border: 'none',
                                        color: 'white',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                                    }}
                                    title="Send message"
                                >
                                    <MessageCircle size={20} />
                                </button>
                            </div>
                        </div>
                    ))}
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
                                <div style={{
                                    width: '48px',
                                    height: '48px',
                                    borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white',
                                    fontSize: '1.2rem',
                                    fontWeight: 'bold'
                                }}>
                                    {chatModal.username?.[0]?.toUpperCase() || 'U'}
                                </div>
                                <div>
                                    <h3 style={{ margin: 0 }}>{chatModal.username}</h3>
                                    <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                        {chatModal.role || 'Student'}
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

export default TeamBuilder;
