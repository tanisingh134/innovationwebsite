import React, { useState, useEffect } from 'react';
import { DollarSign, Calendar, ExternalLink, Filter, Plus, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const GrantTracker = () => {
    const [grants, setGrants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [showModal, setShowModal] = useState(false);
    const { isAuthenticated } = useAuth();

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        type: 'Grant',
        amount: '',
        deadline: '',
        eligibility: '',
        link: '',
        tags: ''
    });

    useEffect(() => {
        fetchGrants();
    }, []);

    const fetchGrants = async () => {
        try {
            const params = new URLSearchParams();
            if (filter) params.append('search', filter);
            if (typeFilter) params.append('type', typeFilter);

            const res = await fetch(`http://localhost:5000/api/grants?${params}`);
            if (res.ok) {
                const data = await res.json();
                setGrants(data);
            }
        } catch (err) {
            console.error('Error fetching grants:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGrants();
    }, [filter, typeFilter]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:5000/api/grants', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                fetchGrants();
                setShowModal(false);
                setFormData({ title: '', description: '', type: 'Grant', amount: '', deadline: '', eligibility: '', link: '', tags: '' });
            }
        } catch (err) {
            console.error('Error adding grant:', err);
        }
    };

    const getTypeColor = (type) => {
        const colors = {
            'Grant': '#10b981',
            'Competition': '#3b82f6',
            'Scholarship': '#8b5cf6',
            'Hackathon': '#f59e0b',
            'VC': '#ef4444'
        };
        return colors[type] || '#6b7280';
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
            <div className="glass-panel" style={{ padding: '3rem', marginBottom: '2rem', textAlign: 'center', position: 'relative' }}>
                <div style={{ background: 'rgba(16, 185, 129, 0.1)', display: 'inline-block', padding: '1rem', borderRadius: '50%', marginBottom: '1.5rem' }}>
                    <DollarSign size={48} style={{ color: '#10b981' }} />
                </div>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Grant & Competition Tracker</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
                    Discover funding opportunities, scholarships, hackathons, and VC grants all in one place.
                </p>
                {isAuthenticated && (
                    <button
                        onClick={() => setShowModal(true)}
                        className="btn-primary"
                        style={{ position: 'absolute', top: '2rem', right: '2rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}
                    >
                        <Plus size={18} /> Add Opportunity
                    </button>
                )}
            </div>

            {/* Filters */}
            <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: '200px' }}>
                    <Filter size={18} />
                    <input
                        type="text"
                        placeholder="Search opportunities..."
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="glass-input"
                        style={{ flex: 1 }}
                    />
                </div>
                <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    style={{
                        padding: '0.75rem',
                        borderRadius: '8px',
                        border: '1px solid var(--glass-border)',
                        background: 'var(--bg-card)',
                        color: 'white',
                        outline: 'none'
                    }}
                >
                    <option value="">All Types</option>
                    <option value="Grant">Grants</option>
                    <option value="Competition">Competitions</option>
                    <option value="Scholarship">Scholarships</option>
                    <option value="Hackathon">Hackathons</option>
                    <option value="VC">VC Funding</option>
                </select>
            </div>

            {loading ? (
                <p style={{ textAlign: 'center' }}>Loading opportunities...</p>
            ) : grants.length === 0 ? (
                <div className="glass-panel" style={{ padding: '4rem', textAlign: 'center' }}>
                    <p style={{ color: 'var(--text-muted)' }}>No opportunities found. Be the first to add one!</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '2rem' }}>
                    {grants.map(grant => (
                        <div key={grant._id} className="glass-panel" style={{ padding: '2rem', borderTop: `4px solid ${getTypeColor(grant.type)}` }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                                <div>
                                    <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{grant.title}</h3>
                                    <span style={{
                                        padding: '0.25rem 0.75rem',
                                        borderRadius: '999px',
                                        background: `${getTypeColor(grant.type)}20`,
                                        color: getTypeColor(grant.type),
                                        fontSize: '0.85rem',
                                        fontWeight: '500'
                                    }}>
                                        {grant.type}
                                    </span>
                                </div>
                                {grant.amount && (
                                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: getTypeColor(grant.type) }}>
                                        {grant.amount}
                                    </div>
                                )}
                            </div>

                            <p style={{ color: 'var(--text-muted)', marginBottom: '1rem', lineHeight: '1.6' }}>
                                {grant.description}
                            </p>

                            {grant.eligibility && grant.eligibility.length > 0 && (
                                <div style={{ marginBottom: '1rem' }}>
                                    <h4 style={{ fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Eligibility:</h4>
                                    <ul style={{ paddingLeft: '1.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                        {grant.eligibility.map((item, idx) => (
                                            <li key={idx}>{item}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--glass-border)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                    <Calendar size={16} />
                                    {new Date(grant.deadline).toLocaleDateString()}
                                </div>
                                <a href={grant.link} target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', fontSize: '0.9rem' }}>
                                    Apply <ExternalLink size={16} />
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add Grant Modal */}
            {showModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)',
                    display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
                }}>
                    <div className="glass-panel" style={{ width: '90%', maxWidth: '600px', padding: '2rem', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                            <h2>Add Opportunity</h2>
                            <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <input className="glass-input" placeholder="Title" required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                            <textarea className="glass-input" placeholder="Description" rows={3} required value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                            <select className="glass-input" value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })}>
                                <option value="Grant">Grant</option>
                                <option value="Competition">Competition</option>
                                <option value="Scholarship">Scholarship</option>
                                <option value="Hackathon">Hackathon</option>
                                <option value="VC">VC Funding</option>
                            </select>
                            <input className="glass-input" placeholder="Amount (e.g., $10,000)" value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })} />
                            <input type="date" className="glass-input" placeholder="Deadline" required value={formData.deadline} onChange={e => setFormData({ ...formData, deadline: e.target.value })} />
                            <input className="glass-input" placeholder="Eligibility (comma separated)" value={formData.eligibility} onChange={e => setFormData({ ...formData, eligibility: e.target.value })} />
                            <input className="glass-input" placeholder="Application Link" type="url" required value={formData.link} onChange={e => setFormData({ ...formData, link: e.target.value })} />
                            <input className="glass-input" placeholder="Tags (comma separated)" value={formData.tags} onChange={e => setFormData({ ...formData, tags: e.target.value })} />
                            <button type="submit" className="btn-primary">Add Opportunity</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GrantTracker;

