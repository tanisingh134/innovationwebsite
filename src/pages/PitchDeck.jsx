import React, { useState } from 'react';
import { FileText, Download, Sparkles, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const PitchDeck = () => {
    const [projectTitle, setProjectTitle] = useState('');
    const [projectDescription, setProjectDescription] = useState('');
    const [pitchDeck, setPitchDeck] = useState(null);
    const [loading, setLoading] = useState(false);
    const { isAuthenticated } = useAuth();

    const generatePitchDeck = async (e) => {
        e.preventDefault();
        if (!isAuthenticated) {
            alert('Please login to generate pitch decks.');
            return;
        }

        setLoading(true);
        setPitchDeck(null);

        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:5000/api/ai/pitch-deck', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    ...(token && { 'x-auth-token': token })
                },
                body: JSON.stringify({
                    projectData: {
                        title: projectTitle,
                        description: projectDescription
                    }
                })
            });

            // Read response body once (can only be read once)
            let responseText = '';
            try {
                responseText = await res.text();
            } catch (readError) {
                console.error('Error reading response:', readError);
                alert('Failed to read server response. Please try again.');
                return;
            }

            // Check if response is empty
            if (!responseText || responseText.trim() === '') {
                console.error('Empty response from server');
                alert('Server returned an empty response. Please try again.');
                return;
            }

            // Handle error responses
            if (!res.ok) {
                try {
                    const errorJson = JSON.parse(responseText);
                    if (errorJson.msg) {
                        alert(`Failed to generate pitch deck: ${errorJson.msg}`);
                    } else if (errorJson.error) {
                        alert(`Failed to generate pitch deck: ${errorJson.error}`);
                    } else {
                        alert(`Failed to generate pitch deck: ${res.status} ${res.statusText}`);
                    }
                } catch {
                    alert(`Failed to generate pitch deck: ${res.status} ${res.statusText}`);
                }
                return;
            }

            // Check if response has content type
            const contentType = res.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                console.error('Non-JSON response:', responseText);
                alert('Server returned invalid response format. Please try again.');
                return;
            }

            // Try to parse JSON
            let data;
            try {
                data = JSON.parse(responseText);
            } catch (parseError) {
                console.error('JSON Parse Error:', parseError);
                console.error('Response status:', res.status);
                console.error('Response text:', responseText.substring(0, 200));
                console.error('Response headers:', Object.fromEntries(res.headers.entries()));
                alert('Error parsing server response. The server may be experiencing issues. Please try again.');
                return;
            }

            // Validate data structure
            if (data && typeof data === 'object') {
                // Check if it's an error response
                if (data.error && !data.title) {
                    alert(`Error: ${data.msg || data.error || 'Failed to generate pitch deck'}`);
                    return;
                }
                
                // Check if required fields exist
                if (data.title || data.problem || data.solution) {
                    setPitchDeck(data);
                } else {
                    console.error('Invalid data format - missing required fields:', data);
                    alert('Server returned incomplete data. Please try again.');
                }
            } else {
                console.error('Invalid data format:', data);
                alert('Server returned invalid data format. Please try again.');
            }
        } catch (err) {
            console.error('Error:', err);
            if (err instanceof SyntaxError) {
                alert('Error: Server returned invalid JSON. Please try again.');
            } else {
                alert(`Error generating pitch deck: ${err.message || 'Unknown error'}`);
            }
        } finally {
            setLoading(false);
        }
    };

    const exportToPDF = () => {
        if (!pitchDeck) return;

        const content = `
PITCH DECK: ${pitchDeck.title}

PROBLEM
${pitchDeck.problem}

SOLUTION
${pitchDeck.solution}

MARKET OPPORTUNITY
${pitchDeck.market}

BUSINESS MODEL
${pitchDeck.businessModel}

TRACTION
${pitchDeck.traction}

TEAM
${pitchDeck.team}

THE ASK
${pitchDeck.ask}
        `;

        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${pitchDeck.title.replace(/\s+/g, '_')}_PitchDeck.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
            <div className="glass-panel" style={{ padding: '3rem', marginBottom: '2rem', textAlign: 'center' }}>
                <div style={{ background: 'rgba(59, 130, 246, 0.1)', display: 'inline-block', padding: '1rem', borderRadius: '50%', marginBottom: '1.5rem' }}>
                    <FileText size={48} className="text-gradient" />
                </div>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>AI Pitch Deck Generator</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
                    Generate investor-ready pitch deck content with one click. Export to PDF or slides.
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                {/* Input Form */}
                <div className="glass-panel" style={{ padding: '2rem' }}>
                    <form onSubmit={generatePitchDeck} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Project Title</label>
                            <input
                                type="text"
                                value={projectTitle}
                                onChange={(e) => setProjectTitle(e.target.value)}
                                placeholder="My Startup"
                                className="glass-input"
                                required
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Description</label>
                            <textarea
                                value={projectDescription}
                                onChange={(e) => setProjectDescription(e.target.value)}
                                placeholder="Describe your startup idea..."
                                className="glass-input"
                                rows={6}
                                required
                            />
                        </div>
                        <button type="submit" className="btn-primary" disabled={loading} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                            <Sparkles size={18} /> {loading ? 'Generating...' : 'Generate Pitch Deck'}
                        </button>
                    </form>
                </div>

                {/* Pitch Deck Display */}
                <div className="glass-panel" style={{ padding: '2rem' }}>
                    {pitchDeck ? (
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                                <h2>{pitchDeck.title}</h2>
                                <button onClick={exportToPDF} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Download size={18} /> Export
                                </button>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <section>
                                    <h3 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>Problem</h3>
                                    <p style={{ color: 'var(--text-muted)' }}>{pitchDeck.problem}</p>
                                </section>
                                <section>
                                    <h3 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>Solution</h3>
                                    <p style={{ color: 'var(--text-muted)' }}>{pitchDeck.solution}</p>
                                </section>
                                <section>
                                    <h3 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>Market Opportunity</h3>
                                    <p style={{ color: 'var(--text-muted)' }}>{pitchDeck.market}</p>
                                </section>
                                <section>
                                    <h3 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>Business Model</h3>
                                    <p style={{ color: 'var(--text-muted)' }}>{pitchDeck.businessModel}</p>
                                </section>
                                <section>
                                    <h3 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>Traction</h3>
                                    <p style={{ color: 'var(--text-muted)' }}>{pitchDeck.traction}</p>
                                </section>
                                <section>
                                    <h3 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>Team</h3>
                                    <p style={{ color: 'var(--text-muted)' }}>{pitchDeck.team}</p>
                                </section>
                                <section>
                                    <h3 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>The Ask</h3>
                                    <p style={{ color: 'var(--text-muted)' }}>{pitchDeck.ask}</p>
                                </section>
                            </div>
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                            <FileText size={64} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                            <p>Fill in the form to generate your pitch deck</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PitchDeck;

