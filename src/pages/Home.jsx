import React, { useState, useEffect } from 'react';
import { ArrowRight, Code, Rocket, Search, Heart, MessageSquare, Filter, ArrowUpDown, TrendingUp, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

const Home = () => {
    const [projects, setProjects] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState('newest'); // newest, popular, likes
    const [filterTag, setFilterTag] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        fetchProjects(search);
    }, []);

    const fetchProjects = async (searchQuery = '') => {
        try {
            setLoading(true);
            const res = await fetch(`http://localhost:5000/api/projects?search=${encodeURIComponent(searchQuery)}`);
            
            if (res.ok) {
                const data = await res.json();
                let filteredProjects = Array.isArray(data) ? data : [];
                
                // Filter by tag if selected
                if (filterTag) {
                    filteredProjects = filteredProjects.filter(project => 
                        project.tags && project.tags.some(tag => 
                            tag.toLowerCase().includes(filterTag.toLowerCase())
                        )
                    );
                }
                
                // Sort projects
                filteredProjects = [...filteredProjects].sort((a, b) => {
                    switch (sortBy) {
                        case 'popular':
                            return (b.likes?.length || 0) - (a.likes?.length || 0);
                        case 'comments':
                            return (b.comments?.length || 0) - (a.comments?.length || 0);
                        case 'newest':
                        default:
                            return new Date(b.createdAt) - new Date(a.createdAt);
                    }
                });
                
                setProjects(filteredProjects);
            } else {
                console.error('Failed to fetch projects');
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
        fetchProjects(search);
    }, [sortBy, filterTag]);

    const handleSearch = (e) => {
        e.preventDefault();
        fetchProjects(search);
    };

    return (
        <div className="container" style={{ padding: '0 2rem', display: 'flex', flexDirection: 'column', gap: '4rem', paddingBottom: '4rem' }}>
            {/* Hero Section */}
            <section style={{
                minHeight: '60vh',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center',
                paddingTop: '2rem'
            }}>
                <div className="glass-panel" style={{ padding: '4rem', maxWidth: '900px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem' }}>
                    <div style={{
                        background: 'var(--primary-glow)',
                        padding: '1rem',
                        borderRadius: '50%',
                        marginBottom: '1rem',
                        boxShadow: '0 0 40px var(--primary-glow)'
                    }}>
                        <Rocket size={48} className="text-gradient" />
                    </div>

                    <h1 style={{ fontSize: '4rem', lineHeight: '1.1' }}>
                        Transform Ideas into <br />
                        <span className="text-gradient">Digital Reality</span>
                    </h1>

                    <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', maxWidth: '600px' }}>
                        The ultimate platform for student innovators to build, showcase, and launch their projects to the world.
                    </p>

                    <form onSubmit={handleSearch} style={{ display: 'flex', gap: '1rem', width: '100%', maxWidth: '600px', marginTop: '1rem' }}>
                        <div style={{ position: 'relative', flex: 1 }}>
                            <Search size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search projects by title or tag..."
                                style={{
                                    width: '100%',
                                    padding: '0.8rem 1rem 0.8rem 3rem',
                                    borderRadius: '9999px',
                                    border: '1px solid var(--glass-border)',
                                    background: 'var(--bg-card)',
                                    color: 'white',
                                    outline: 'none'
                                }}
                            />
                        </div>
                        <button type="submit" className="btn-primary">Search</button>
                        <button 
                            type="button"
                            onClick={() => setShowFilters(!showFilters)}
                            className="btn-primary"
                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                        >
                            <Filter size={18} /> Filters
                        </button>
                    </form>
                </div>
            </section>

            {/* Filters */}
            {showFilters && (
                <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Filter size={20} /> Filters & Sort
                        </h3>
                        <button onClick={() => { setFilterTag(''); setSortBy('newest'); }} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                            Clear
                        </button>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Sort By</label>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    borderRadius: '8px',
                                    border: '1px solid var(--glass-border)',
                                    background: 'var(--bg-card)',
                                    color: 'white',
                                    outline: 'none'
                                }}
                            >
                                <option value="newest">Newest First</option>
                                <option value="popular">Most Popular</option>
                                <option value="comments">Most Comments</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Filter by Tag</label>
                            <input
                                type="text"
                                value={filterTag}
                                onChange={(e) => setFilterTag(e.target.value)}
                                placeholder="e.g. React, AI, IoT..."
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    borderRadius: '8px',
                                    border: '1px solid var(--glass-border)',
                                    background: 'var(--bg-card)',
                                    color: 'white',
                                    outline: 'none'
                                }}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Projects Grid */}
            <section>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '2rem', margin: 0 }}>Explore Innovations</h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        {projects.length} {projects.length === 1 ? 'project' : 'projects'} found
                    </div>
                </div>
                {loading ? (
                    <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Loading projects...</p>
                ) : projects.length === 0 ? (
                    <div className="glass-panel" style={{ padding: '4rem', textAlign: 'center' }}>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>
                            {search ? 'No projects found matching your search.' : 'No projects available yet. Be the first to share your innovation!'}
                        </p>
                    </div>
                ) : (
                    <div className="grid-responsive">
                        {projects.map(project => (
                            <Link to={`/project/${project._id}`} key={project._id} style={{ textDecoration: 'none', color: 'inherit' }}>
                                <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%', transition: 'transform 0.3s' }}
                                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>

                                    <h3 style={{ fontSize: '1.25rem', fontWeight: '600' }}>{project.title}</h3>

                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', flex: 1 }}>
                                        {project.description.substring(0, 100)}...
                                    </p>

                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                        {project.tags.map((tag, idx) => (
                                            <span key={idx} style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem', borderRadius: '4px', background: 'rgba(255,255,255,0.1)', color: 'var(--text-muted)' }}>
                                                {tag}
                                            </span>
                                        ))}
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid var(--glass-border)', color: 'var(--text-muted)', fontSize: '0.9rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <Heart size={16} /> {project.likes?.length || 0}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <MessageSquare size={16} /> {project.comments?.length || 0}
                                        </div>
                                        <span style={{ marginLeft: 'auto' }}>By {project.user?.username || 'Unknown'}</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
};

export default Home;
