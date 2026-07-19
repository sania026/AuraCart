import React, { useContext, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  Tags, 
  ClipboardList, 
  Users, 
  Ticket, 
  BarChart3, 
  Settings as SettingsIcon, 
  LogOut, 
  Eye, 
  User 
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

export default function AdminLayout() {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  
  const queryParams = new URLSearchParams(location.search);
  const currentTab = queryParams.get('tab') || 'overview';

  useEffect(() => {
    sessionStorage.removeItem('adminStorefrontPreview');
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'categories', label: 'Categories', icon: Tags },
    { id: 'orders', label: 'Orders', icon: ClipboardList },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'coupons', label: 'Coupons', icon: Ticket },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0a0b10', color: '#f3f4f6' }}>
      
      {/* Sidebar */}
      <aside className="glass" style={{ 
        width: '260px', 
        borderRight: '1px solid var(--border)', 
        display: 'flex', 
        flexDirection: 'column',
        position: 'sticky',
        top: 0,
        height: '100vh',
        zIndex: 100
      }}>
        
        {/* Brand */}
        <div style={{ 
          padding: '2rem 1.5rem', 
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <div style={{
            background: 'linear-gradient(to right, var(--primary), var(--secondary))',
            width: '32px',
            height: '32px',
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            alignItems: 'center',
            justify: 'center',
            fontWeight: 'bold',
            color: 'white'
          }}>
            A
          </div>
          <div>
            <h1 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, letterSpacing: '0.05em' }}>
              AuraCart <span style={{ color: 'var(--secondary)', fontSize: '0.75rem', fontWeight: 600 }}>ADMIN</span>
            </h1>
          </div>
        </div>

        {/* Sidebar Nav */}
        <nav style={{ flex: 1, padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <Link
                key={item.id}
                to={`/admin?tab=${item.id}`}
                className="dropdown-item"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  color: isActive ? '#fff' : 'var(--text-secondary)',
                  background: isActive ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                  borderLeft: isActive ? '3px solid var(--primary)' : '3px solid transparent',
                  fontWeight: isActive ? 600 : 500,
                  textDecoration: 'none',
                  transition: 'all 0.2s ease'
                }}
              >
                <Icon size={18} style={{ color: isActive ? 'var(--primary)' : 'inherit' }} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer (Logout) */}
        <div style={{ padding: '1.5rem 1rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <button 
            onClick={handleLogout}
            className="btn btn-outline"
            style={{ 
              width: '100%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '0.5rem',
              color: 'var(--error)',
              borderColor: 'rgba(239,68,68,0.2)'
            }}
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        
        {/* Header */}
        <header className="glass" style={{ 
          height: '70px', 
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 2rem',
          position: 'sticky',
          top: 0,
          zIndex: 99
        }}>
          <div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
              System Panel / <span style={{ color: 'var(--primary)' }}>{currentTab}</span>
            </span>
          </div>

          {/* Quick Actions & Profile */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            
            {/* View Store storefront shortcut */}
            <a 
              href="/?preview=true" 
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline" 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                fontSize: '0.85rem',
                textDecoration: 'none'
              }}
            >
              <Eye size={16} />
              <span>View Store</span>
            </a>

            {/* Profile Avatar Card */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingLeft: '1.5rem', borderLeft: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ 
                background: 'rgba(99, 102, 241, 0.1)', 
                width: '36px', 
                height: '36px', 
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justify: 'center',
                color: 'var(--primary)',
                border: '1px solid rgba(99, 102, 241, 0.2)'
              }}>
                <User size={18} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff' }}>{user?.name || 'Administrator'}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{user?.email}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Route Dashboard Page Container */}
        <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
