import React, { useContext } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { AuthContext } from '../context/AuthContext';

export default function MainLayout() {
  const { user } = useContext(AuthContext);
  
  // Sync preview query parameters to sessionStorage for tab session persistence
  const queryParams = new URLSearchParams(window.location.search);
  if (queryParams.get('preview') === 'true') {
    sessionStorage.setItem('adminStorefrontPreview', 'true');
  }

  const isPreview = sessionStorage.getItem('adminStorefrontPreview') === 'true';

  if (user && user.role === 'admin' && user.email === 'admin@auracart.com' && !isPreview) {
    return <Navigate to="/admin" replace />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <main style={{ flex: 1, padding: '2rem 0' }}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
