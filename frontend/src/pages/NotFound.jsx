import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="container fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center' }}>
      <div style={{ color: 'var(--secondary)', marginBottom: '1.5rem' }}>
        <ShieldAlert size={64} />
      </div>
      <h1 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '0.5rem', fontFamily: 'var(--font-heading)' }}>
        404 - Page Not Found
      </h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '480px', marginBottom: '2.5rem', lineHeight: '1.6' }}>
        Oops! The page you are looking for doesn't exist or has been moved to a different address.
      </p>
      <Link to="/" className="btn btn-primary" style={{ padding: '0.75rem 2rem' }}>
        Back to Home
      </Link>
    </div>
  );
}
