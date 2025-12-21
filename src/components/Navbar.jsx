import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Rocket, Menu, X, User, LogOut, LayoutDashboard, Sparkles, Users, UserCheck, Map, Settings, ChevronDown, FileText, DollarSign, Layout, Briefcase, Wrench, Compass } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { isAuthenticated, user, logout, loading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [toolsMenuOpen, setToolsMenuOpen] = useState(false);
    const [discoverMenuOpen, setDiscoverMenuOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/');
        setUserMenuOpen(false);
    };

    // Close menus when route changes
    useEffect(() => {
        setMobileMenuOpen(false);
        setUserMenuOpen(false);
        setToolsMenuOpen(false);
        setDiscoverMenuOpen(false);
    }, [location.pathname]);

    // Close menus when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (userMenuOpen && !e.target.closest('.user-menu-container')) {
                setUserMenuOpen(false);
            }
            if (toolsMenuOpen && !e.target.closest('.tools-menu-container')) {
                setToolsMenuOpen(false);
            }
            if (discoverMenuOpen && !e.target.closest('.discover-menu-container')) {
                setDiscoverMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [userMenuOpen, toolsMenuOpen, discoverMenuOpen]);

    // Main navigation links (always visible)
    const mainNavLinks = [
        { path: '/', label: 'Home', icon: Rocket, public: true },
        { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, public: false },
    ];

    // AI Tools dropdown items
    const toolsMenuItems = [
        { path: '/validator', label: 'AI Validator', icon: Sparkles },
        { path: '/lean-canvas', label: 'Lean Canvas', icon: Layout },
        { path: '/pitch-deck', label: 'Pitch Deck', icon: FileText },
        { path: '/roadmap', label: 'Roadmap', icon: Map },
    ];

    // Discover dropdown items
    const discoverMenuItems = [
        { path: '/team', label: 'Team Builder', icon: Users },
        { path: '/mentors', label: 'Mentors', icon: UserCheck },
        { path: '/grants', label: 'Grants', icon: DollarSign },
        { path: '/open-roles', label: 'Open Roles', icon: Briefcase },
    ];

    const isActive = (path) => location.pathname === path;
    const isInDropdownActive = (items) => items.some(item => location.pathname === item.path);

    const NavLink = ({ to, icon: Icon, children, onClick }) => {
        const active = isActive(to);
        return (
            <Link
                to={to}
                onClick={onClick}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 1rem',
                    borderRadius: '8px',
                    color: active ? 'var(--primary)' : 'var(--text-muted)',
                    textDecoration: 'none',
                    fontWeight: active ? '600' : '500',
                    fontSize: '0.9rem',
                    background: active ? 'rgba(124, 58, 237, 0.1)' : 'transparent',
                    transition: 'all 0.2s',
                    border: active ? '1px solid rgba(124, 58, 237, 0.3)' : '1px solid transparent'
                }}
                onMouseEnter={(e) => {
                    if (!active) {
                        e.currentTarget.style.color = 'var(--text-main)';
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                    }
                }}
                onMouseLeave={(e) => {
                    if (!active) {
                        e.currentTarget.style.color = 'var(--text-muted)';
                        e.currentTarget.style.background = 'transparent';
                    }
                }}
            >
                {Icon && <Icon size={16} />}
                {children}
            </Link>
        );
    };

    const DropdownButton = ({ label, icon: Icon, isOpen, onClick, containerClass, items }) => {
        const hasActive = isInDropdownActive(items);
        return (
            <div className={containerClass} style={{ position: 'relative' }}>
                <button
                    onClick={onClick}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.5rem 1rem',
                        borderRadius: '8px',
                        color: hasActive || isOpen ? 'var(--primary)' : 'var(--text-muted)',
                        textDecoration: 'none',
                        fontWeight: hasActive || isOpen ? '600' : '500',
                        fontSize: '0.9rem',
                        background: hasActive || isOpen ? 'rgba(124, 58, 237, 0.1)' : 'transparent',
                        transition: 'all 0.2s',
                        border: hasActive || isOpen ? '1px solid rgba(124, 58, 237, 0.3)' : '1px solid transparent',
                        cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                        if (!hasActive && !isOpen) {
                            e.currentTarget.style.color = 'var(--text-main)';
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                        }
                    }}
                    onMouseLeave={(e) => {
                        if (!hasActive && !isOpen) {
                            e.currentTarget.style.color = 'var(--text-muted)';
                            e.currentTarget.style.background = 'transparent';
                        }
                    }}
                >
                    {Icon && <Icon size={16} />}
                    {label}
                    <ChevronDown size={14} style={{ opacity: 0.7, transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
                </button>
                {isOpen && (
                    <div style={{
                        position: 'absolute',
                        top: 'calc(100% + 0.5rem)',
                        left: 0,
                        minWidth: '200px',
                        background: 'rgba(0, 0, 0, 0.9)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '12px',
                        padding: '0.5rem',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                        zIndex: 1001
                    }}>
                        {items.map(item => {
                            const active = isActive(item.path);
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => {
                                        setToolsMenuOpen(false);
                                        setDiscoverMenuOpen(false);
                                    }}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.75rem',
                                        padding: '0.75rem 1rem',
                                        borderRadius: '8px',
                                        color: active ? 'var(--primary)' : 'var(--text-main)',
                                        textDecoration: 'none',
                                        transition: 'all 0.2s',
                                        background: active ? 'rgba(124, 58, 237, 0.1)' : 'transparent'
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!active) {
                                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!active) {
                                            e.currentTarget.style.background = 'transparent';
                                        }
                                    }}
                                >
                                    {item.icon && <item.icon size={18} />}
                                    <span>{item.label}</span>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        );
    };

    const filteredMainLinks = mainNavLinks.filter(link => link.public || isAuthenticated);

    return (
        <nav style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            padding: isMobile ? '0.75rem 1rem' : '0.75rem 2rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            zIndex: 1000,
            background: 'rgba(0, 0, 0, 0.3)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
            {/* Logo */}
            <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    padding: '0.5rem',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <Rocket size={20} style={{ color: 'white' }} />
                </div>
                <span style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-main)' }}>
                    Inno<span style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Sphere</span>
                </span>
            </Link>

            {/* Desktop Navigation */}
            <div style={{ display: isMobile ? 'none' : 'flex', gap: '0.5rem', alignItems: 'center', flex: 1, justifyContent: 'center', maxWidth: '600px' }}>
                {filteredMainLinks.map(link => (
                    <NavLink key={link.path} to={link.path} icon={link.icon}>
                        {link.label}
                    </NavLink>
                ))}
                <DropdownButton
                    label="AI Tools"
                    icon={Wrench}
                    isOpen={toolsMenuOpen}
                    onClick={() => {
                        setToolsMenuOpen(!toolsMenuOpen);
                        setDiscoverMenuOpen(false);
                    }}
                    containerClass="tools-menu-container"
                    items={toolsMenuItems}
                />
                <DropdownButton
                    label="Discover"
                    icon={Compass}
                    isOpen={discoverMenuOpen}
                    onClick={() => {
                        setDiscoverMenuOpen(!discoverMenuOpen);
                        setToolsMenuOpen(false);
                    }}
                    containerClass="discover-menu-container"
                    items={discoverMenuItems}
                />
            </div>

            {/* Right Side Actions */}
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', position: 'relative' }}>
                {loading ? (
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', border: '2px solid var(--glass-border)', borderTopColor: 'var(--primary)', animation: 'spin 1s linear infinite' }} />
                ) : isAuthenticated ? (
                    <div className="user-menu-container" style={{ position: 'relative' }}>
                        <button
                            onClick={() => setUserMenuOpen(!userMenuOpen)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.5rem 1rem',
                                borderRadius: '9999px',
                                border: '1px solid var(--glass-border)',
                                background: userMenuOpen ? 'rgba(124, 58, 237, 0.1)' : 'transparent',
                                color: 'var(--text-main)',
                                cursor: 'pointer',
                                fontWeight: '500',
                                fontSize: '0.9rem',
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => {
                                if (!userMenuOpen) {
                                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                                    e.currentTarget.style.borderColor = 'var(--primary)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!userMenuOpen) {
                                    e.currentTarget.style.background = 'transparent';
                                    e.currentTarget.style.borderColor = 'var(--glass-border)';
                                }
                            }}
                        >
                            <div style={{
                                width: '24px',
                                height: '24px',
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontSize: '0.75rem',
                                fontWeight: 'bold'
                            }}>
                                {user?.username?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            {!isMobile && <span>{user?.username || 'User'}</span>}
                            <ChevronDown size={14} style={{ opacity: 0.7, transform: userMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
                        </button>

                        {/* User Dropdown Menu */}
                        {userMenuOpen && (
                            <div style={{
                                position: 'absolute',
                                top: 'calc(100% + 0.5rem)',
                                right: 0,
                                minWidth: '200px',
                                background: 'rgba(0, 0, 0, 0.9)',
                                backdropFilter: 'blur(20px)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '12px',
                                padding: '0.5rem',
                                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                                zIndex: 1001
                            }}>
                                <Link
                                    to="/profile"
                                    onClick={() => setUserMenuOpen(false)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.75rem',
                                        padding: '0.75rem 1rem',
                                        borderRadius: '8px',
                                        color: 'var(--text-main)',
                                        textDecoration: 'none',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = 'transparent';
                                    }}
                                >
                                    <User size={18} />
                                    <span>Profile</span>
                                </Link>
                                <Link
                                    to="/dashboard"
                                    onClick={() => setUserMenuOpen(false)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.75rem',
                                        padding: '0.75rem 1rem',
                                        borderRadius: '8px',
                                        color: 'var(--text-main)',
                                        textDecoration: 'none',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = 'transparent';
                                    }}
                                >
                                    <Settings size={18} />
                                    <span>Settings</span>
                                </Link>
                                <div style={{ height: '1px', background: 'rgba(255, 255, 255, 0.1)', margin: '0.5rem 0' }} />
                                <button
                                    onClick={handleLogout}
                                    style={{
                                        width: '100%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.75rem',
                                        padding: '0.75rem 1rem',
                                        borderRadius: '8px',
                                        background: 'transparent',
                                        border: 'none',
                                        color: '#ef4444',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        textAlign: 'left'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = 'transparent';
                                    }}
                                >
                                    <LogOut size={18} />
                                    <span>Logout</span>
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <>
                        <Link
                            to="/login"
                            style={{
                                padding: '0.5rem 1rem',
                                borderRadius: '9999px',
                                border: '1px solid var(--glass-border)',
                                color: 'var(--text-main)',
                                textDecoration: 'none',
                                fontWeight: '500',
                                fontSize: '0.9rem',
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                                e.currentTarget.style.borderColor = 'var(--primary)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'transparent';
                                e.currentTarget.style.borderColor = 'var(--glass-border)';
                            }}
                        >
                            Login
                        </Link>
                        <Link
                            to="/register"
                            style={{
                                padding: '0.5rem 1.25rem',
                                borderRadius: '9999px',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                color: 'white',
                                textDecoration: 'none',
                                fontWeight: '600',
                                fontSize: '0.9rem',
                                transition: 'all 0.2s',
                                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.6)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
                            }}
                        >
                            Get Started
                        </Link>
                    </>
                )}

                {/* Mobile Menu Button */}
                {isMobile && (
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '0.5rem',
                            borderRadius: '8px',
                            border: '1px solid var(--glass-border)',
                            background: 'transparent',
                            color: 'var(--text-main)',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                        }}
                    >
                        {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                )}
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div style={{
                    position: 'fixed',
                    top: '60px',
                    left: 0,
                    right: 0,
                    background: 'rgba(0, 0, 0, 0.95)',
                    backdropFilter: 'blur(20px)',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                    padding: '1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                    zIndex: 999,
                    maxHeight: 'calc(100vh - 60px)',
                    overflowY: 'auto'
                }}>
                    {filteredMainLinks.map(link => (
                        <NavLink key={link.path} to={link.path} icon={link.icon} onClick={() => setMobileMenuOpen(false)}>
                            {link.label}
                        </NavLink>
                    ))}
                    <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '600', marginBottom: '0.5rem', paddingLeft: '1rem' }}>AI TOOLS</div>
                        {toolsMenuItems.map(link => (
                            <NavLink key={link.path} to={link.path} icon={link.icon} onClick={() => setMobileMenuOpen(false)}>
                                {link.label}
                            </NavLink>
                        ))}
                    </div>
                    <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '600', marginBottom: '0.5rem', paddingLeft: '1rem' }}>DISCOVER</div>
                        {discoverMenuItems.map(link => (
                            <NavLink key={link.path} to={link.path} icon={link.icon} onClick={() => setMobileMenuOpen(false)}>
                                {link.label}
                            </NavLink>
                        ))}
                    </div>
                </div>
            )}

            <style>{`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </nav>
    );
};

export default Navbar;
