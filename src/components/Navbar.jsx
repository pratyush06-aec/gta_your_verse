import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="glass" style={{
      position: 'fixed',
      top: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      width: '80%',
      maxWidth: '1000px',
      borderRadius: '50px',
      zIndex: 100,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '1rem 2.5rem',
      backgroundColor: 'rgba(11, 15, 25, 0.15)', // Extra transparency for navbar
    }}>
      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', letterSpacing: '2px' }}>
        YOUR VERSE
      </div>
      <ul style={{
        display: 'flex',
        listStyle: 'none',
        gap: '2rem',
        fontSize: '1rem',
      }}>
        <li style={{ cursor: 'pointer' }}><Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>Home</Link></li>
        <li style={{ cursor: 'pointer' }}><Link to="/explore" style={{ color: 'inherit', textDecoration: 'none' }}>Explore</Link></li>
        <li style={{ cursor: 'pointer' }}><Link to="/about" style={{ color: 'inherit', textDecoration: 'none' }}>About</Link></li>
      </ul>
    </nav>
  );
};

export default Navbar;
