import React, { useState } from 'react';
import { MessageSquare, Send, Sparkles, Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LeanCanvas = () => {
    const [conversation, setConversation] = useState([]);
    const [message, setMessage] = useState('');
    const [canvas, setCanvas] = useState(null);
    const [loading, setLoading] = useState(false);
    const { isAuthenticated } = useAuth();

    const handleSend = async (e) => {
        e.preventDefault();
        if (!message.trim()) return;
        if (!isAuthenticated) {
            alert('Please login to use the AI Lean Canvas.');
            return;
        }

        const userMessage = { role: 'user', content: message };
        const newConversation = [...conversation, userMessage];
        setConversation(newConversation);
        setMessage('');
        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:5000/api/ai/lean-canvas', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    ...(token && { 'x-auth-token': token })
                },
                body: JSON.stringify({ 
                    conversation: newConversation.map(c => c.content),
                    projectData: canvas || {}
                })
            });

            if (res.ok) {
                const data = await res.json();
                setCanvas(data);
                setConversation([
                    ...newConversation, 
                    { 
                        role: 'assistant', 
                        content: 'I\'ve analyzed your idea and updated your Lean Canvas! Check out the canvas on the right to see the details filled in. Feel free to ask me to refine any section or add more details!' 
                    }
                ]);
            } else {
                const errorData = await res.json().catch(() => ({ msg: 'Failed to generate canvas' }));
                setConversation([
                    ...newConversation, 
                    { 
                        role: 'assistant', 
                        content: `Sorry, I encountered an error: ${errorData.msg || 'Failed to generate canvas. Please try again.'}` 
                    }
                ]);
            }
        } catch (err) {
            console.error('Error:', err);
            setConversation([
                ...newConversation, 
                { 
                    role: 'assistant', 
                    content: 'Sorry, I encountered an error connecting to the AI service. Please try again later.' 
                }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const canvasSections = [
        { key: 'problem', label: 'Problem', icon: '⚠️' },
        { key: 'solution', label: 'Solution', icon: '💡' },
        { key: 'keyMetrics', label: 'Key Metrics', icon: '📊' },
        { key: 'uniqueValue', label: 'Unique Value Prop', icon: '⭐' },
        { key: 'unfairAdvantage', label: 'Unfair Advantage', icon: '🛡️' },
        { key: 'channels', label: 'Channels', icon: '📢' },
        { key: 'customerSegments', label: 'Customer Segments', icon: '👥' },
        { key: 'costStructure', label: 'Cost Structure', icon: '💰' },
        { key: 'revenueStreams', label: 'Revenue Streams', icon: '💵' }
    ];

    return (
        <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
            <div className="glass-panel" style={{ padding: '3rem', marginBottom: '2rem', textAlign: 'center' }}>
                <div style={{ background: 'rgba(59, 130, 246, 0.1)', display: 'inline-block', padding: '1rem', borderRadius: '50%', marginBottom: '1.5rem' }}>
                    <Sparkles size={48} className="text-gradient" />
                </div>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Interactive Lean Canvas</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
                    Chat with AI to build your business model canvas. Just describe your idea and watch it come to life!
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                {/* Chat Interface */}
                <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', height: '600px' }}>
                    <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <MessageSquare size={20} /> AI Assistant
                    </h3>
                    <div style={{ flex: 1, overflowY: 'auto', marginBottom: '1rem', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                        {conversation.length === 0 ? (
                            <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: '2rem' }}>
                                Start by describing your startup idea...
                            </p>
                        ) : (
                            conversation.map((msg, idx) => (
                                <div key={idx} style={{ marginBottom: '1rem', textAlign: msg.role === 'user' ? 'right' : 'left' }}>
                                    <div style={{
                                        display: 'inline-block',
                                        padding: '0.75rem 1rem',
                                        borderRadius: '12px',
                                        background: msg.role === 'user' ? 'rgba(124, 58, 237, 0.2)' : 'rgba(255,255,255,0.05)',
                                        maxWidth: '80%'
                                    }}>
                                        {msg.content}
                                    </div>
                                </div>
                            ))
                        )}
                        {loading && (
                            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                                <div className="spinner" style={{ margin: '0 auto', width: '24px', height: '24px', border: '2px solid var(--glass-border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                                <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>AI is analyzing your idea...</p>
                            </div>
                        )}
                    </div>
                    <form onSubmit={handleSend} style={{ display: 'flex', gap: '0.5rem' }}>
                        <input
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Describe your idea..."
                            className="glass-input"
                            style={{ flex: 1 }}
                        />
                        <button type="submit" className="btn-primary" disabled={loading} style={{ opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}>
                            <Send size={18} />
                        </button>
                    </form>
                </div>

                {/* Canvas Display */}
                <div className="glass-panel" style={{ padding: '2rem' }}>
                    <h3 style={{ marginBottom: '1.5rem' }}>Your Lean Canvas</h3>
                    {canvas ? (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                            {canvasSections.map(section => (
                                <div key={section.key} style={{
                                    padding: '1rem',
                                    borderRadius: '8px',
                                    background: 'rgba(255,255,255,0.03)',
                                    border: '1px solid var(--glass-border)',
                                    minHeight: '120px'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                        <span>{section.icon}</span>
                                        <h4 style={{ fontSize: '0.9rem', margin: 0 }}>{section.label}</h4>
                                    </div>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                                        {canvas[section.key] || 'Not filled yet'}
                                    </p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                            <p>Start chatting to generate your Lean Canvas!</p>
                        </div>
                    )}
                </div>
            </div>
            <style>{`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default LeanCanvas;

