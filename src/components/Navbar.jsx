import React from 'react';

const Navbar = () => {
  return (
    <nav className="glass" style={{
      position: 'fixed',
      top: 0,
      width: '100%',
      zIndex: 100,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '1.5rem 2rem',
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
        <li style={{ cursor: 'pointer' }}>Home</li>
        <li style={{ cursor: 'pointer' }}>Explore</li>
        <li style={{ cursor: 'pointer' }}>About</li>
      </ul>
    </nav>
  );
};

export default Navbar;
