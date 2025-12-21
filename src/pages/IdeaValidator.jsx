import React, { useState } from 'react';
import { Lightbulb, CheckCircle, AlertTriangle, TrendingUp, Cpu } from 'lucide-react';

const IdeaValidator = () => {
    const [idea, setIdea] = useState('');
    const [description, setDescription] = useState('');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleValidate = async (e) => {
        e.preventDefault();
        setLoading(true);
        setResult(null);
        try {
            const res = await fetch('http://localhost:5000/api/ai/validate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ idea, description })
            });

            if (res.ok) {
                const data = await res.json();
                setResult(data);
            } else {
                const errorData = await res.json();
                alert(errorData.msg || 'Failed to validate idea. Please try again.');
            }
        } catch (err) {
            console.error("AI Service Error:", err);
            alert('Error connecting to AI service. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
            <div className="glass-panel" style={{ padding: '3rem', marginBottom: '2rem', textAlign: 'center' }}>
                <div style={{ background: 'rgba(59, 130, 246, 0.1)', display: 'inline-block', padding: '1rem', borderRadius: '50%', marginBottom: '1.5rem' }}>
                    <Cpu size={48} className="text-gradient" />
                </div>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>AI Idea Validator & Enhancer</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
                    Validate your startup idea instantly with our advanced AI analysis engine. Get viability scores, strengths, and actionable improvement suggestions.
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                {/* Input Section */}
                <div className="glass-panel" style={{ padding: '2rem' }}>
                    <form onSubmit={handleValidate} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Project Title</label>
                            <input
                                type="text"
                                value={idea}
                                onChange={(e) => setIdea(e.target.value)}
                                placeholder="e.g. Eco-Friendly Food Delivery"
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
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Problem & Solution Description</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Describe the problem you are solving and your proposed solution..."
                                style={{
                                    width: '100%',
                                    padding: '0.8rem',
                                    borderRadius: '8px',
                                    border: '1px solid var(--glass-border)',
                                    background: 'rgba(255,255,255,0.05)',
                                    color: 'white',
                                    minHeight: '150px',
                                    resize: 'vertical'
                                }}
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className="btn-primary"
                            disabled={loading}
                            style={{
                                padding: '1rem',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                gap: '0.5rem',
                                opacity: loading ? 0.7 : 1
                            }}
                        >
                            {loading ? 'Analyzing...' : <><Lightbulb size={20} /> Validate Idea</>}
                        </button>
                    </form>
                </div>

                {/* Results Section */}
                <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    {!result && !loading && (
                        <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                            <TrendingUp size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                            <p>Enter your idea details to generate an AI analysis.</p>
                        </div>
                    )}

                    {loading && (
                        <div style={{ textAlign: 'center' }}>
                            <div className="spinner" style={{ margin: '0 auto 1rem' }}></div>
                            <p>AI Engine is analyzing market trends...</p>
                        </div>
                    )}

                    {result && (
                        <div className="animate-fade-in">
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
                                <h3 style={{ fontSize: '1.5rem' }}>Viability Score</h3>
                                <div style={{
                                    fontSize: '2.5rem',
                                    fontWeight: 'bold',
                                    color: result.viabilityScore > 80 ? '#4ade80' : result.viabilityScore > 60 ? '#facc15' : '#f87171'
                                }}>
                                    {result.viabilityScore}/100
                                </div>
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: '#4ade80' }}>
                                    <CheckCircle size={18} /> Strengths
                                </h4>
                                <ul style={{ paddingLeft: '1.5rem', color: 'var(--text-muted)' }}>
                                    {result.analysis.strengths.map((s, i) => <li key={i}>{s}</li>)}
                                </ul>
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: '#f87171' }}>
                                    <AlertTriangle size={18} /> Potential Challenges
                                </h4>
                                <ul style={{ paddingLeft: '1.5rem', color: 'var(--text-muted)' }}>
                                    {result.analysis.weaknesses.map((w, i) => <li key={i}>{w}</li>)}
                                </ul>
                            </div>

                            <div>
                                <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: '#60a5fa' }}>
                                    <Lightbulb size={18} /> AI Suggestions
                                </h4>
                                <ul style={{ paddingLeft: '1.5rem', color: 'var(--text-muted)' }}>
                                    {result.analysis.suggestions.map((s, i) => <li key={i}>{s}</li>)}
                                </ul>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Roadmap Generator Section */}
            <div style={{ marginTop: '3rem', borderTop: '1px solid var(--glass-border)', paddingTop: '3rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Innovation Roadmap Generator</h2>
                    <p style={{ color: 'var(--text-muted)' }}>Get a step-by-step execution plan for your project.</p>
                </div>

                <RoadmapGenerator />
            </div>
        </div>
    );
};

const RoadmapGenerator = () => {
    const [title, setTitle] = useState('');
    const [type, setType] = useState('Web App');
    const [description, setDescription] = useState('');
    const [roadmap, setRoadmap] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleGenerate = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('http://localhost:5000/api/ai/roadmap', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, type, description })
            });
            const data = await res.json();
            setRoadmap(data);
        } catch (err) {
            console.error("Error generating roadmap:", err);
            alert("Failed to generate roadmap");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            <div className="glass-panel" style={{ padding: '2rem' }}>
                <form onSubmit={handleGenerate} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Project Name</label>
                        <input className="glass-input" value={title} onChange={e => setTitle(e.target.value)} required placeholder="e.g. EduTech AI" style={{ width: '100%', padding: '0.8rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white' }} />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Description</label>
                        <textarea className="glass-input" value={description} onChange={e => setDescription(e.target.value)} placeholder="Use the same description as above..." style={{ width: '100%', padding: '0.8rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white', minHeight: '80px' }} />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Type</label>
                        <select className="glass-input" value={type} onChange={e => setType(e.target.value)} style={{ width: '100%', padding: '0.8rem', background: 'var(--bg-card)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white' }}>
                            <option>Web App</option>
                            <option>Mobile App</option>
                            <option>Hardware/IoT</option>
                            <option>Service</option>
                        </select>
                    </div>
                    <button type="submit" className="btn-primary" disabled={loading} style={{ padding: '1rem' }}>
                        {loading ? 'Generating Plan...' : 'Generate Roadmap'}
                    </button>
                </form>
            </div>

            <div className="glass-panel" style={{ padding: '2rem' }}>
                {!roadmap ? (
                    <div style={{ textAlign: 'center', color: 'var(--text-muted)', paddingTop: '2rem' }}>
                        Generate a roadmap to see phrases here.
                    </div>
                ) : (
                    <div>
                        <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: '#60a5fa' }}>{roadmap.title}</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            {roadmap.phases.map((phase, idx) => (
                                <div key={idx} style={{ paddingLeft: '1rem', borderLeft: '2px solid #8b5cf6' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                        <h4 style={{ fontWeight: 'bold' }}>{phase.name}</h4>
                                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.1)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>{phase.duration}</span>
                                    </div>
                                    <ul style={{ margin: 0, paddingLeft: '1.2rem', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                                        {phase.steps.map((step, sIdx) => (
                                            <li key={sIdx}>{step}</li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default IdeaValidator;
