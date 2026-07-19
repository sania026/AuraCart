import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer style={{ backgroundColor: 'var(--bg-surface)', borderTop: '1px solid var(--border)', padding: '4rem 0 2rem 0', marginTop: 'auto' }}>
      <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2.5rem', marginBottom: '3rem' }}>
        
        {/* Brand Section */}
        <div>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1rem', background: 'linear-gradient(to right, var(--primary), var(--secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            AuraCart
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Premium e-commerce platform offering state-of-the-art products and services with a seamless checkout experience.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 style={{ color: '#fff', fontSize: '1rem', marginBottom: '1.25rem' }}>Shop</h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            <li><Link to="/products" className="footer-link">All Products</Link></li>
            <li><Link to="/products?category=electronics" className="footer-link">Electronics</Link></li>
            <li><Link to="/products?category=clothing" className="footer-link">Clothing</Link></li>
          </ul>
        </div>

        {/* Support */}
        <div>
          <h4 style={{ color: '#fff', fontSize: '1rem', marginBottom: '1.25rem' }}>Support</h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            <li><Link to="/dashboard" className="footer-link">Track Order</Link></li>
            <li><Link to="/faq" className="footer-link">FAQs</Link></li>
            <li><Link to="/terms" className="footer-link">Terms & Services</Link></li>
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h4 style={{ color: '#fff', fontSize: '1rem', marginBottom: '1.25rem' }}>Get in Touch</h4>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
            Email: support@auracart.com
          </p>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Phone: +1 (555) 000-0000
          </p>
        </div>
      </div>

      {/* Copyright Footer */}
      <div className="container" style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
        <p>&copy; {new Date().getFullYear()} AuraCart. All rights reserved.</p>
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          <a href="#" className="footer-link">Privacy Policy</a>
          <a href="#" className="footer-link">Terms of Use</a>
        </div>
      </div>

      <style>{`
        .footer-link:hover {
          color: #fff;
        }
      `}</style>
    </footer>
  );
}
