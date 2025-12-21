import React, { useState, useEffect } from 'react';
import { Briefcase, Search, MapPin, Code, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const OpenRoles = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const { isAuthenticated } = useAuth();

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/projects?search=Hiring');
            if (res.ok) {
                const data = await res.json();
                // Filter projects that have "Hiring" tag and open roles
                const hiringProjects = data.filter(p => 
                    p.tags && p.tags.some(tag => tag.toLowerCase() === 'hiring') &&
                    p.openRoles && p.openRoles.length > 0 && p.openRoles.some(r => r.status === 'open')
                );
                setProjects(hiringProjects);
            }
        } catch (err) {
            console.error('Error fetching projects:', err);
        } finally {
            setLoading(false);
        }
    };

    const filteredProjects = projects.filter(project => {
        if (!search.trim()) return true;
        const searchLower = search.toLowerCase();
        return (
            project.title.toLowerCase().includes(searchLower) ||
            project.openRoles.some(role => 
                role.role.toLowerCase().includes(searchLower) ||
                role.skills.some(skill => skill.toLowerCase().includes(searchLower))
            )
        );
    });

    return (
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
            <div className="glass-panel" style={{ padding: '3rem', marginBottom: '2rem', textAlign: 'center' }}>
                <div style={{ background: 'rgba(16, 185, 129, 0.1)', display: 'inline-block', padding: '1rem', borderRadius: '50%', marginBottom: '1.5rem' }}>
                    <Briefcase size={48} style={{ color: '#10b981' }} />
                </div>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Open Roles Board</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
                    Find projects looking for team members. Browse open roles and connect with project creators.
                </p>
            </div>

            {/* Search */}
            <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
                <div style={{ position: 'relative' }}>
                    <Search size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by role, skill, or project name..."
                        className="glass-input"
                        style={{ width: '100%', paddingLeft: '3rem' }}
                    />
                </div>
            </div>

            {loading ? (
                <p style={{ textAlign: 'center' }}>Loading open roles...</p>
            ) : filteredProjects.length === 0 ? (
                <div className="glass-panel" style={{ padding: '4rem', textAlign: 'center' }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>
                        {search ? 'No matching roles found.' : 'No projects with open roles at the moment. Add "Hiring" tag to your project to appear here!'}
                    </p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {filteredProjects.map(project => (
                        <Link key={project._id} to={`/project/${project._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                            <div className="glass-panel" style={{ padding: '2rem', transition: 'transform 0.2s' }}
                                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1.5rem' }}>
                                    <div>
                                        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{project.title}</h2>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                            By {project.user?.username || 'Unknown'}
                                        </p>
                                    </div>
                                    <span style={{
                                        padding: '0.5rem 1rem',
                                        borderRadius: '999px',
                                        background: 'rgba(16, 185, 129, 0.2)',
                                        color: '#10b981',
                                        fontWeight: '600',
                                        fontSize: '0.9rem'
                                    }}>
                                        {project.openRoles.filter(r => r.status === 'open').length} Open {project.openRoles.filter(r => r.status === 'open').length === 1 ? 'Role' : 'Roles'}
                                    </span>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
                                    {project.openRoles.filter(r => r.status === 'open').map((role, idx) => (
                                        <div key={idx} style={{
                                            padding: '1rem',
                                            background: 'rgba(16, 185, 129, 0.05)',
                                            borderRadius: '8px',
                                            border: '1px solid rgba(16, 185, 129, 0.2)'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                                <Code size={16} style={{ color: '#10b981' }} />
                                                <h4 style={{ margin: 0, color: '#10b981' }}>{role.role}</h4>
                                            </div>
                                            {role.description && (
                                                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                                                    {role.description}
                                                </p>
                                            )}
                                            {role.skills && role.skills.length > 0 && (
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                                                    {role.skills.slice(0, 3).map((skill, sIdx) => (
                                                        <span key={sIdx} style={{
                                                            fontSize: '0.75rem',
                                                            padding: '0.25rem 0.5rem',
                                                            background: 'rgba(16, 185, 129, 0.1)',
                                                            borderRadius: '4px',
                                                            color: '#10b981'
                                                        }}>
                                                            {skill}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

export default OpenRoles;

