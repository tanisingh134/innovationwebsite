import React, { useState, useEffect } from 'react';
import { User, Award, BookOpen, Briefcase, Share2, Edit3, Eye, Settings, Github, Linkedin, Globe, Save, History, Link as LinkIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

const Profile = () => {
    const [viewMode, setViewMode] = useState('owner'); // 'owner', 'recruiter'
    const [showEdit, setShowEdit] = useState(false);
    const [loading, setLoading] = useState(true);
    const [contributions, setContributions] = useState([]);

    const defaultUser = {
        name: "",
        role: "Student Innovator",
        bio: "Tell us about yourself...",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Generative",
        stats: { projects: 0, contributions: 0, reputation: 0 },
        skills: [],
        badges: [],
        experience: [],
        socials: { github: "", linkedin: "", portfolio: "" }
    };

    const [user, setUser] = useState(defaultUser);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            // Fetch profile and stats in parallel
            const [profileRes, statsRes] = await Promise.all([
                fetch('http://localhost:5000/api/profile/me', {
                    headers: { 'x-auth-token': token }
                }),
                fetch('http://localhost:5000/api/profile/stats', {
                    headers: { 'x-auth-token': token }
                })
            ]);

            let profileData;
            let statsData = { projects: 0, contributions: 0, reputation: 0, likes: 0 };

            if (profileRes.ok) {
                profileData = await profileRes.json();
            } else {
                const errorData = await profileRes.json().catch(() => ({ msg: 'Failed to fetch profile' }));
                throw new Error(errorData.msg || 'Failed to fetch profile');
            }

            if (statsRes.ok) {
                statsData = await statsRes.json();
            }

            // Fetch contributions if authenticated
            if (token) {
                try {
                    const contribRes = await fetch('http://localhost:5000/api/profile/contributions', {
                        headers: { 'x-auth-token': token }
                    });
                    if (contribRes.ok) {
                        const contribData = await contribRes.json();
                        setContributions(contribData);
                    }
                } catch (err) {
                    console.error('Error fetching contributions:', err);
                }
            }

            // Map backend data to frontend structure
            const mappedUser = {
                name: profileData.user?.username || "User",
                role: profileData.role || "Student Innovator",
                bio: profileData.bio || "",
                avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${profileData.user?.username || 'User'}`,
                stats: {
                    projects: statsData.projects || 0,
                    contributions: statsData.contributions || 0,
                    reputation: statsData.reputation || 0
                },
                skills: profileData.skills || [],
                badges: [
                    { name: "Early Adopter", icon: "🚀", date: "2024" }
                ],
                experience: profileData.experience || [],
                socials: {
                    github: profileData.social?.github || "",
                    linkedin: profileData.social?.linkedin || "",
                    portfolio: profileData.website || ""
                }
            };
            setUser(mappedUser);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        if (name.startsWith('socials.')) {
            const socialField = name.split('.')[1];
            setUser(prev => ({ ...prev, socials: { ...prev.socials, [socialField]: value } }));
        } else {
            setUser(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSkillChange = (e) => {
        setUser(prev => ({ ...prev, skills: e.target.value.split(',').map(s => s.trim()) }));
    };

    const saveProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            const body = {
                bio: user.bio,
                role: user.role,
                skills: user.skills,
                website: user.socials.portfolio,
                githubusername: user.socials.github,
                linkedin: user.socials.linkedin,
                // Add other fields as needed
            };

            const res = await fetch('http://localhost:5000/api/profile', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify(body)
            });

            if (res.ok) {
                setShowEdit(false);
                alert('Profile Saved!');
                fetchProfile(); // Refresh
            } else {
                alert('Error saving profile');
            }
        } catch (err) {
            console.error(err);
            alert('Server Error');
        }
    };

    if (loading) return <div className="container" style={{ paddingTop: '4rem', textAlign: 'center' }}>Loading Profile...</div>;

    return (
        <div className="container" style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem' }}>
            {/* View Mode Toggle */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                <div className="glass-panel" style={{ padding: '0.5rem', display: 'flex', gap: '0.5rem', borderRadius: '999px' }}>
                    <button
                        onClick={() => setViewMode('owner')}
                        style={{
                            padding: '0.5rem 1rem',
                            borderRadius: '999px',
                            background: viewMode === 'owner' ? 'var(--primary)' : 'transparent',
                            color: 'white',
                            border: 'none',
                            cursor: 'pointer'
                        }}>
                        Edit View
                    </button>
                    <button
                        onClick={() => setViewMode('recruiter')}
                        style={{
                            padding: '0.5rem 1rem',
                            borderRadius: '999px',
                            background: viewMode === 'recruiter' ? 'var(--primary)' : 'transparent',
                            color: 'white',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}>
                        <Eye size={16} /> Recruiter View
                    </button>
                </div>
            </div>

            {/* Main Passport Card */}
            <div className="glass-panel" style={{ position: 'relative', overflow: 'hidden', padding: 0 }}>
                {/* Banner */}
                <div style={{ height: '200px', background: 'linear-gradient(45deg, #3b82f6, #8b5cf6)' }}></div>

                <div style={{ padding: '0 3rem 3rem', flexDirection: 'column', display: 'flex' }}>
                    <div className="flex-stack-mobile" style={{ justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '-60px', marginBottom: '2rem' }}>
                        <div className="flex-stack-mobile" style={{ alignItems: 'flex-end', gap: '2rem' }}>
                            <img src={user.avatar} alt="Profile" style={{ width: '150px', height: '150px', borderRadius: '50%', border: '4px solid var(--bg-card)', background: 'var(--bg-card)' }} />
                            <div style={{ marginBottom: '1rem' }}>
                                <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{user.name}</h1>
                                <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}>{user.role}</p>
                            </div>
                        </div>
                        <div style={{ marginBottom: '2rem', display: 'flex', gap: '1rem' }}>
                            {viewMode === 'owner' ? (
                                <button
                                    className="btn-primary"
                                    onClick={() => setShowEdit(true)}
                                    style={{ display: 'flex', gap: '0.5rem' }}
                                >
                                    <Edit3 size={18} /> Edit Profile
                                </button>
                            ) : (
                                <button 
                                    onClick={() => {
                                        const email = user.socials?.github || user.socials?.linkedin || user.socials?.portfolio;
                                        if (email) {
                                            window.open(email, '_blank');
                                        } else {
                                            alert('No contact information available. Add social links to your profile.');
                                        }
                                    }}
                                    className="btn-primary" 
                                    style={{ display: 'flex', gap: '0.5rem' }}
                                >
                                    <Share2 size={18} /> Contact
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="grid-responsive" style={{ gap: '3rem' }}>
                        {/* Left Column */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            <section>
                                <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <User size={20} className="text-gradient" /> About
                                </h2>
                                <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>{user.bio || "No bio added yet."}</p>
                            </section>

                            <section>
                                <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <BookOpen size={20} className="text-gradient" /> Skills
                                </h2>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                    {user.skills.length > 0 ? user.skills.map((skill, i) => (
                                        <span key={i} style={{ padding: '0.5rem 1rem', borderRadius: '999px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)' }}>
                                            {skill}
                                        </span>
                                    )) : <span style={{ color: 'var(--text-muted)' }}>No skills listed.</span>}
                                </div>
                            </section>

                            {/* Contribution History */}
                            {contributions.length > 0 && (
                                <section>
                                    <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <History size={20} className="text-gradient" /> Contribution History
                                    </h2>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '400px', overflowY: 'auto' }}>
                                        {contributions.slice(0, 10).map((contrib, idx) => (
                                            <div key={idx} style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                                                    <div>
                                                        <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                                                            {contrib.projectTitle && (
                                                                <Link to={`/project/${contrib.projectId}`} style={{ color: 'var(--primary)', textDecoration: 'none' }}>
                                                                    {contrib.projectTitle}
                                                                </Link>
                                                            )}
                                                        </div>
                                                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{contrib.action}</span>
                                                    </div>
                                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                                        {new Date(contrib.timestamp).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: 0 }}>{contrib.description}</p>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}
                        </div>

                        {/* Right Column */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            <div className="glass-panel" style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)' }}>
                                <h3 style={{ marginBottom: '1rem' }}>Stats</h3>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                    <span style={{ color: 'var(--text-muted)' }}>Reputation</span>
                                    <span style={{ color: '#10b981' }}>{user.stats.reputation}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                    <span style={{ color: 'var(--text-muted)' }}>Projects</span>
                                    <span>{user.stats.projects}</span>
                                </div>
                            </div>

                            <div className="glass-panel" style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)' }}>
                                <h3 style={{ marginBottom: '1rem' }}>Socials</h3>
                                <div style={{ display: 'grid', gap: '0.5rem' }}>
                                    {user.socials.github && (
                                        <a href={user.socials.github} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', textDecoration: 'none' }}>
                                            <Github size={18} /> GitHub
                                        </a>
                                    )}
                                    {user.socials.linkedin && (
                                        <a href={user.socials.linkedin} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', textDecoration: 'none' }}>
                                            <Linkedin size={18} /> LinkedIn
                                        </a>
                                    )}
                                    {user.socials.portfolio && (
                                        <a href={user.socials.portfolio} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', textDecoration: 'none' }}>
                                            <Globe size={18} /> Portfolio
                                        </a>
                                    )}
                                    {!user.socials.github && !user.socials.linkedin && !user.socials.portfolio && (
                                        <span style={{ color: 'var(--text-muted)' }}>No socials linked.</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Profile Modal */}
            {showEdit && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)',
                    display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000
                }}>
                    <div className="glass-panel" style={{ width: '90%', maxWidth: '500px', padding: '2rem', maxHeight: '90vh', overflowY: 'auto' }}>
                        <h2 style={{ marginBottom: '1.5rem' }}>Edit Profile</h2>
                        <div style={{ display: 'grid', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Role</label>
                                <input name="role" value={user.role} onChange={handleEditChange} className="glass-input" style={{ width: '100%' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Bio</label>
                                <textarea name="bio" value={user.bio} onChange={handleEditChange} rows={3} className="glass-input" style={{ width: '100%', fontFamily: 'inherit' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Skills (comma separated)</label>
                                <input value={user.skills.join(', ')} onChange={handleSkillChange} className="glass-input" style={{ width: '100%' }} />
                            </div>

                            <h3 style={{ marginTop: '1rem', fontSize: '1.1rem' }}>Social Links</h3>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>GitHub URL</label>
                                <input name="socials.github" value={user.socials.github} onChange={handleEditChange} className="glass-input" style={{ width: '100%' }} placeholder="https://github.com/..." />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>LinkedIn URL</label>
                                <input name="socials.linkedin" value={user.socials.linkedin} onChange={handleEditChange} className="glass-input" style={{ width: '100%' }} placeholder="https://linkedin.com/..." />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Portfolio / Website</label>
                                <input name="socials.portfolio" value={user.socials.portfolio} onChange={handleEditChange} className="glass-input" style={{ width: '100%' }} placeholder="https://..." />
                            </div>

                            <button className="btn-primary" onClick={saveProfile} style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
                                <Save size={18} /> Save Changes
                            </button>
                            <button onClick={() => setShowEdit(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', marginTop: '0.5rem' }}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;
