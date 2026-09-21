import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { FaLinkedin, FaTwitter, FaGithub } from 'react-icons/fa';

const Footer = () => {
  const location = useLocation();
  const footerRef = useRef(null);

  useEffect(() => {
    if (location.pathname !== '/') {
      window.dispatchEvent(new CustomEvent('footer-visible', { detail: false }));
      return;
    }

    const observer = new IntersectionObserver(([entry]) => {
      window.dispatchEvent(new CustomEvent('footer-visible', { detail: entry.isIntersecting }));
    }, { threshold: 0.1 });

    if (footerRef.current) {
      observer.observe(footerRef.current);
    }

    return () => {
      window.dispatchEvent(new CustomEvent('footer-visible', { detail: false }));
      observer.disconnect();
    };
  }, [location.pathname]);

  if (location.pathname !== '/') {
    return null;
  }

  return (
    <footer ref={footerRef} className="glass" style={{
      position: 'relative',
      zIndex: 10,
      padding: '5rem 2rem',
      backgroundColor: 'rgba(11, 15, 25, 0.2)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      borderTop: '1px solid var(--glass-border)',
      borderBottom: 'none'
    }}>
      <h2 style={{ marginBottom: '1.5rem', fontSize: '3rem', letterSpacing: '2px' }}>WELCOME</h2>
      <p style={{ opacity: 0.8, marginBottom: '3rem', fontSize: '1.25rem', fontWeight: 300 }}>Give yourself the ultimate taste</p>
      <div style={{ fontSize: '1rem', opacity: 0.6, letterSpacing: '1px' }}>
        &copy; {new Date().getFullYear()} Your Verse. All rights reserved.
      </div>
      
      <div style={{
        position: 'absolute',
        bottom: '2rem',
        right: '2.5rem',
        display: 'flex',
        gap: '1.5rem',
        fontSize: '1.5rem'
      }}>
        <a href="https://www.linkedin.com/in/pratyush-dutta-221b94302/" target="_blank" rel="noopener noreferrer" style={{ color: 'white', opacity: 0.7, transition: 'opacity 0.3s' }} onMouseOver={(e) => e.currentTarget.style.opacity = 1} onMouseOut={(e) => e.currentTarget.style.opacity = 0.7}>
          <FaLinkedin />
        </a>
        <a href="https://x.com/pd_0406official" target="_blank" rel="noopener noreferrer" style={{ color: 'white', opacity: 0.7, transition: 'opacity 0.3s' }} onMouseOver={(e) => e.currentTarget.style.opacity = 1} onMouseOut={(e) => e.currentTarget.style.opacity = 0.7}>
          <FaTwitter />
        </a>
        <a href="https://github.com/pratyush06-aec/gta_your_verse" target="_blank" rel="noopener noreferrer" style={{ color: 'white', opacity: 0.7, transition: 'opacity 0.3s' }} onMouseOver={(e) => e.currentTarget.style.opacity = 1} onMouseOut={(e) => e.currentTarget.style.opacity = 0.7}>
          <FaGithub />
        </a>
      </div>
    </footer>
  );
};

export default Footer;
