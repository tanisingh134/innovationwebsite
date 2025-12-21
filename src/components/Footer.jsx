import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer style={{
            marginTop: 'auto',
            padding: '3rem 2rem',
            borderTop: '1px solid var(--glass-border)',
            background: 'var(--bg-card)',
            color: 'var(--text-muted)'
        }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', textAlign: 'left' }}>
                <div>
                    <h3 style={{ color: 'white', marginBottom: '1rem' }}>InnoSphere</h3>
                    <p style={{ fontSize: '0.9rem' }}>Empowering student innovators to build the future.</p>
                </div>
                <div>
                    <h4 style={{ color: 'white', marginBottom: '1rem' }}>Platform</h4>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        <li style={{ marginBottom: '0.5rem' }}><Link to="/validator" style={{ color: 'inherit', textDecoration: 'none' }}>AI Validator</Link></li>
                        <li style={{ marginBottom: '0.5rem' }}><Link to="/team" style={{ color: 'inherit', textDecoration: 'none' }}>Find Team</Link></li>
                        <li style={{ marginBottom: '0.5rem' }}><Link to="/mentors" style={{ color: 'inherit', textDecoration: 'none' }}>Mentors</Link></li>
                    </ul>
                </div>
                <div>
                    <h4 style={{ color: 'white', marginBottom: '1rem' }}>Community</h4>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        <li style={{ marginBottom: '0.5rem' }}><Link to="/dashboard" style={{ color: 'inherit', textDecoration: 'none' }}>Dashboard</Link></li>
                        <li style={{ marginBottom: '0.5rem' }}><Link to="/roadmap" style={{ color: 'inherit', textDecoration: 'none' }}>Roadmap</Link></li>
                    </ul>
                </div>
                <div>
                    <h4 style={{ color: 'white', marginBottom: '1rem' }}>Legal</h4>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        <li style={{ marginBottom: '0.5rem' }}><span style={{ color: 'var(--text-muted)', cursor: 'not-allowed' }}>Privacy</span></li>
                        <li style={{ marginBottom: '0.5rem' }}><span style={{ color: 'var(--text-muted)', cursor: 'not-allowed' }}>Terms</span></li>
                    </ul>
                </div>
            </div>
            <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid var(--glass-border)', textAlign: 'center', fontSize: '0.9rem' }}>
                <p>&copy; {new Date().getFullYear()} InnoSphere. All rights reserved.</p>
            </div>
        </footer>
    );
};

export default Footer;
