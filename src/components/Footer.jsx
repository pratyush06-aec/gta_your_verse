import React from 'react';
import { useLocation } from 'react-router-dom';

const Footer = () => {
  const location = useLocation();

  if (location.pathname !== '/') {
    return null;
  }

  return (
    <footer className="glass" style={{
      position: 'relative',
      zIndex: 10,
      padding: '3rem 2rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      borderTop: '1px solid var(--glass-border)',
      borderBottom: 'none'
    }}>
      <h2 style={{ marginBottom: '1rem' }}>Enter the Verse</h2>
      <p style={{ opacity: 0.7, marginBottom: '2rem' }}>Experience the ultimate sandbox.</p>
      <div style={{ fontSize: '0.8rem', opacity: 0.5 }}>
        &copy; {new Date().getFullYear()} Your Verse. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
