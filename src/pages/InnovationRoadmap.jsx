import React, { useState } from 'react';
import { Map, Flag, CheckCircle, ArrowRight, Layout } from 'lucide-react';

const InnovationRoadmap = () => {
    const [title, setTitle] = useState('');
    const [type, setType] = useState('Software');
    const [roadmap, setRoadmap] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleGenerate = async (e) => {
        e.preventDefault();
        setLoading(true);
        setRoadmap(null);
        try {
            const res = await fetch('http://localhost:5000/api/ai/roadmap', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, type })
            });
            
            if (res.ok) {
                const data = await res.json();
                setRoadmap(data);
            } else {
                const errorData = await res.json();
                alert(errorData.msg || 'Failed to generate roadmap. Please try again.');
            }
        } catch (err) {
            console.error("Error generating roadmap:", err);
            alert('Error connecting to roadmap service. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
            <div className="glass-panel" style={{ padding: '3rem', marginBottom: '2rem', textAlign: 'center' }}>
                <div style={{ background: 'rgba(59, 130, 246, 0.1)', display: 'inline-block', padding: '1rem', borderRadius: '50%', marginBottom: '1.5rem' }}>
                    <Map size={48} className="text-gradient" />
                </div>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Innovation Roadmap Generator</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
                    Get a step-by-step execution plan for your project. From validation to scale, we guide you through every phase.
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
                <div className="glass-panel" style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto', width: '100%' }}>
                    <form onSubmit={handleGenerate} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Project Name</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="My Startup"
                                className="glass-input"
                                style={{
                                    width: '100%',
                                    padding: '0.8rem',
                                    borderRadius: '8px',
                                    border: '1px solid var(--glass-border)',
                                    background: 'rgba(255,255,255,0.05)',
                                    color: 'white'
                                }}
                                required
                            />
                        </div>
                        <div style={{ width: '150px' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Type</label>
                            <select
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '0.8rem',
                                    borderRadius: '8px',
                                    border: '1px solid var(--glass-border)',
                                    background: 'var(--bg-card)',
                                    color: 'white'
                                }}
                            >
                                <option value="Software">App/Web</option>
                                <option value="Hardware">Hardware</option>
                                <option value="Service">Service</option>
                                <option value="Social">Social Impact</option>
                            </select>
                        </div>
                        <button
                            type="submit"
                            className="btn-primary"
                            disabled={loading}
                            style={{
                                padding: '0.8rem 1.5rem',
                                height: '46px',
                                opacity: loading ? 0.7 : 1
                            }}
                        >
                            {loading ? 'Generating...' : 'Go'}
                        </button>
                    </form>
                </div>

                {roadmap && (
                    <div className="animate-fade-in" style={{ position: 'relative', paddingLeft: '2rem' }}>
                        {/* Vertical Line */}
                        <div style={{
                            position: 'absolute',
                            left: '7px',
                            top: '0',
                            bottom: '0',
                            width: '2px',
                            background: 'var(--primary-glow)',
                            opacity: 0.3
                        }}></div>

                        {roadmap.phases.map((phase, idx) => (
                            <div key={idx} className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem', position: 'relative' }}>
                                {/* Timeline Dot */}
                                <div style={{
                                    position: 'absolute',
                                    left: '-2.5rem',
                                    top: '2.5rem',
                                    width: '16px',
                                    height: '16px',
                                    background: 'var(--primary-glow)',
                                    borderRadius: '50%',
                                    boxShadow: '0 0 10px var(--primary-glow)'
                                }}></div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                    <h3 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <Flag size={20} className="text-gradient" /> {phase.name}
                                    </h3>
                                    <span style={{
                                        padding: '0.25rem 0.75rem',
                                        borderRadius: '999px',
                                        background: 'rgba(255,255,255,0.1)',
                                        fontSize: '0.9rem'
                                    }}>
                                        {phase.duration}
                                    </span>
                                </div>

                                <div style={{ display: 'grid', gap: '1rem' }}>
                                    {phase.steps.map((step, sIdx) => (
                                        <div key={sIdx} style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '1rem',
                                            padding: '1rem',
                                            background: 'rgba(255,255,255,0.03)',
                                            borderRadius: '8px'
                                        }}>
                                            <div style={{
                                                width: '24px',
                                                height: '24px',
                                                borderRadius: '50%',
                                                border: '2px solid var(--text-muted)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                flexShrink: 0
                                            }}>
                                                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{sIdx + 1}</span>
                                            </div>
                                            <span>{step}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default InnovationRoadmap;
