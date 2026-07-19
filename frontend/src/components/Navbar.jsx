import React, { useContext, useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { formatPrice } from '../utils/currency';
import { ShoppingBag, Heart, User, Search, LogOut, Menu, X, Settings, Bell, Trash, Check } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import { WishlistContext } from '../context/WishlistContext';
import { NotificationContext } from '../context/NotificationContext';
import api from '../services/api';

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const { itemsCount } = useContext(CartContext);
  const { wishlistProducts } = useContext(WishlistContext);
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
  } = useContext(NotificationContext);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Dropdown Refs
  const notifRef = useRef(null);
  const profileRef = useRef(null);
  const wishlistRef = useRef(null);
  const suggestionsRef = useRef(null);

  // Toggle Handlers (Mutual Exclusion)
  const toggleNotif = () => {
    setNotifOpen(!notifOpen);
    setProfileDropdownOpen(false);
    setWishlistOpen(false);
    setShowSuggestions(false);
  };

  const toggleProfile = () => {
    setProfileDropdownOpen(!profileDropdownOpen);
    setNotifOpen(false);
    setWishlistOpen(false);
    setShowSuggestions(false);
  };

  const toggleWishlist = () => {
    setWishlistOpen(!wishlistOpen);
    setNotifOpen(false);
    setProfileDropdownOpen(false);
    setShowSuggestions(false);
  };

  // Outside click & keydown listeners
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifOpen && notifRef.current && !notifRef.current.contains(event.target)) {
        setNotifOpen(false);
      }
      if (profileDropdownOpen && profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
      if (wishlistOpen && wishlistRef.current && !wishlistRef.current.contains(event.target)) {
        setWishlistOpen(false);
      }
      if (showSuggestions && suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        setNotifOpen(false);
        setProfileDropdownOpen(false);
        setWishlistOpen(false);
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    document.addEventListener('keydown', handleEscapeKey);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [notifOpen, profileDropdownOpen, wishlistOpen, showSuggestions]);


  const navigate = useNavigate();

  // debounced suggestions search query
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim().length >= 2) {
        try {
          const { data } = await api.get(`/search/suggestions?keyword=${encodeURIComponent(searchQuery.trim())}`);
          setSuggestions(data);
          setShowSuggestions(true);
          // Close other dropdowns when suggestions are shown
          setNotifOpen(false);
          setProfileDropdownOpen(false);
          setWishlistOpen(false);
        } catch (err) {
          console.error(err);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setShowSuggestions(false);
      setMobileMenuOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    setProfileDropdownOpen(false);
    navigate('/login');
  };

  return (
    <nav className="glass sticky-nav" style={{ position: 'sticky', top: 0, zIndex: 1000, borderBottom: '1px solid var(--border)' }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'between', height: '70px', padding: '0 1.5rem' }}>
        
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-heading)', background: 'linear-gradient(to right, var(--primary), var(--secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            AuraCart
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="nav-links-desktop" style={{ display: 'flex', gap: '2rem', marginLeft: '2rem' }}>
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/products" className="nav-link">Catalog</Link>
        </div>

        {/* Search Bar */}
        <form ref={suggestionsRef} onSubmit={handleSearchSubmit} style={{ flex: 1, maxWidth: '400px', margin: '0 2rem', position: 'relative', display: 'flex', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Search products..."
            className="input-field"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingRight: '2.5rem', borderRadius: '9999px', height: '38px' }}
            onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
          />
          <button type="submit" style={{ position: 'absolute', right: '12px', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            <Search size={18} />
          </button>

          {/* Autocomplete Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="glass" style={{ position: 'absolute', left: 0, right: 0, top: '44px', borderRadius: 'var(--radius-md)', padding: '0.5rem 0', boxShadow: 'var(--shadow-lg)', zIndex: 1002, border: '1px solid var(--border)' }}>
              {suggestions.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    if (item.type === 'category') {
                      navigate(`/products?category=${item.id}`);
                    } else {
                      navigate(`/product/${item.id}`);
                    }
                    setSearchQuery('');
                    setShowSuggestions(false);
                  }}
                  className="dropdown-item"
                  style={{ padding: '0.625rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', fontSize: '0.85rem' }}
                >
                  <div>
                    <span style={{ color: '#fff', fontWeight: 500 }}>{item.text}</span>
                    {item.brand && <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginLeft: '0.5rem' }}>({item.brand})</span>}
                  </div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'capitalize', border: '1px solid var(--border)', padding: '0.125rem 0.375rem', borderRadius: 'var(--radius-sm)' }}>
                    {item.type}
                  </span>
                </div>
              ))}
            </div>
          )}
        </form>

        {/* Actions & Profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          
          {/* Notification Bell Dropdown */}
          {user && (
            <div ref={notifRef} style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={toggleNotif}
                style={{ background: 'none', border: 'none', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', cursor: 'pointer', padding: 0 }}
                title="Notifications"
              >
                <Bell size={22} className="hover-icon" />
                {unreadCount > 0 && (
                  <span className="badge-pulse" style={{ position: 'absolute', top: '-6px', right: '-8px', background: 'var(--secondary)', color: 'white', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.675rem', fontWeight: 700 }}>
                    {unreadCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="glass" style={{ position: 'absolute', right: '-80px', top: '35px', width: '320px', borderRadius: 'var(--radius-lg)', padding: '1rem', boxShadow: 'var(--shadow-xl)', border: '1px solid var(--border)', zIndex: 1001 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', marginBottom: '0.75rem' }}>
                    <h4 style={{ fontWeight: 700, fontSize: '0.95rem' }}>Notifications ({unreadCount})</h4>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={markAllAsRead} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>Mark read</button>
                      <span style={{ color: 'var(--border)' }}>|</span>
                      <button onClick={clearAllNotifications} style={{ background: 'none', border: 'none', color: 'var(--error)', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>Clear all</button>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '250px', overflowY: 'auto', paddingRight: '4px' }}>
                    {notifications.length > 0 ? (
                      notifications.map(n => (
                        <div key={n._id} style={{ display: 'flex', gap: '0.5rem', fontSize: '0.8rem', padding: '0.5rem', borderRadius: 'var(--radius-sm)', background: n.isRead ? 'transparent' : 'rgba(79, 70, 229, 0.05)', border: '1px solid rgba(255,255,255,0.02)', position: 'relative' }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <strong style={{ color: '#fff', fontSize: '0.825rem' }}>{n.title}</strong>
                              <span style={{ fontSize: '0.675rem', color: 'var(--text-muted)' }}>{new Date(n.createdAt).toLocaleDateString()}</span>
                            </div>
                            <p style={{ color: 'var(--text-secondary)', marginTop: '0.15rem', lineHeight: '1.25' }}>{n.message}</p>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                            {!n.isRead && (
                              <button onClick={() => markAsRead(n._id)} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', padding: 0 }} title="Mark read">
                                <Check size={12} />
                              </button>
                            )}
                            <button onClick={() => deleteNotification(n._id)} style={{ background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer', padding: 0, marginTop: 'auto' }} title="Delete">
                              <Trash size={12} />
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '1rem 0' }}>No notifications yet.</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Wishlist Quick View Dropdown */}
          <div ref={wishlistRef} style={{ position: 'relative' }}>
            <button
              onClick={toggleWishlist}
              style={{ background: 'none', border: 'none', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', cursor: 'pointer', padding: 0 }}
              title="Wishlist Quick View"
            >
              <Heart size={22} className="hover-icon" />
              {wishlistProducts.length > 0 && (
                <span className="badge-pulse" style={{ position: 'absolute', top: '-6px', right: '-8px', background: 'var(--secondary)', color: 'white', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.675rem', fontWeight: 700 }}>
                  {wishlistProducts.length}
                </span>
              )}
            </button>
            
            {wishlistOpen && (
              <div className="glass" style={{ position: 'absolute', right: '-40px', top: '35px', width: '280px', borderRadius: 'var(--radius-lg)', padding: '1rem', boxShadow: 'var(--shadow-xl)', border: '1px solid var(--border)', zIndex: 1002 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', marginBottom: '0.75rem' }}>
                  <h4 style={{ fontWeight: 700, fontSize: '0.95rem', margin: 0 }}>Wishlist ({wishlistProducts.length})</h4>
                  <Link to="/wishlist" onClick={() => setWishlistOpen(false)} style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>View full</Link>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '250px', overflowY: 'auto', paddingRight: '4px' }}>
                  {wishlistProducts.length > 0 ? (
                    wishlistProducts.map(p => (
                      <Link 
                        key={p._id} 
                        to={`/product/${p._id}`}
                        onClick={() => setWishlistOpen(false)}
                        style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', textDecoration: 'none', color: 'inherit' }}
                      >
                        <img src={p.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60'} alt={p.name} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} />
                        <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                          <h5 style={{ fontSize: '0.8rem', color: '#fff', fontWeight: 600, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</h5>
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>{formatPrice(p.price)}</p>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '1rem 0' }}>Your wishlist is empty.</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Cart */}
          <Link to="/cart" style={{ position: 'relative', color: 'var(--text-primary)', display: 'flex', alignItems: 'center' }}>
            <ShoppingBag size={22} className="hover-icon" />
            {itemsCount > 0 && (
              <span className="badge-pulse" style={{ position: 'absolute', top: '-6px', right: '-8px', background: 'var(--primary)', color: 'white', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.675rem', fontWeight: 700 }}>
                {itemsCount}
              </span>
            )}
          </Link>

          {/* User Profile / Auth */}
          {user ? (
            <div ref={profileRef} style={{ position: 'relative' }}>
              <button
                onClick={toggleProfile}
                className="btn btn-outline"
                style={{ borderRadius: '9999px', padding: '0.375rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid var(--border)' }}
              >
                {user.profilePicture ? (
                  <img src={user.profilePicture} alt="Avatar" style={{ width: '20px', height: '20px', borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  <User size={16} />
                )}
                <span style={{ fontSize: '0.85rem' }}>{user.name.split(' ')[0]}</span>
              </button>
              
              {profileDropdownOpen && (
                <div className="glass" style={{ position: 'absolute', right: 0, top: '48px', width: '200px', borderRadius: 'var(--radius-md)', padding: '0.5rem 0', boxShadow: 'var(--shadow-lg)', zIndex: 1003 }}>
                  <Link to="/dashboard" onClick={() => setProfileDropdownOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', fontSize: '0.875rem' }} className="dropdown-item">
                    <User size={16} />
                    My Profile
                  </Link>
                  {user.role === 'admin' && user.email === 'admin@auracart.com' && (
                    <Link to="/admin" onClick={() => setProfileDropdownOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', fontSize: '0.875rem', color: 'var(--secondary)' }} className="dropdown-item">
                      <Settings size={16} />
                      Admin Panel
                    </Link>
                  )}
                  <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', border: 'none', background: 'none', color: 'var(--error)', padding: '0.75rem 1rem', fontSize: '0.875rem', textAlign: 'left', cursor: 'pointer' }} className="dropdown-item">
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="btn btn-primary" style={{ padding: '0.5rem 1.25rem', borderRadius: '9999px' }}>
              Sign In
            </Link>
          )}

          {/* Mobile Menu Icon */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', display: 'none' }}
            className="mobile-toggle"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Links */}
      {mobileMenuOpen && (
        <div className="glass" style={{ padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', borderBottom: '1px solid var(--border)' }}>
          <Link to="/" onClick={() => setMobileMenuOpen(false)}>Home</Link>
          <Link to="/products" onClick={() => setMobileMenuOpen(false)}>Catalog</Link>
          <Link to="/wishlist" onClick={() => setMobileMenuOpen(false)}>Wishlist ({wishlistProducts.length})</Link>
          <Link to="/cart" onClick={() => setMobileMenuOpen(false)}>Cart ({itemsCount})</Link>
          {user ? (
            <>
              <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>Dashboard</Link>
              {user.role === 'admin' && user.email === 'admin@auracart.com' && <Link to="/admin" onClick={() => setMobileMenuOpen(false)}>Admin Panel</Link>}
              <button onClick={handleLogout} style={{ border: 'none', background: 'none', color: 'var(--error)', textAlign: 'left', cursor: 'pointer' }}>Logout</button>
            </>
          ) : (
            <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="btn btn-primary" style={{ textAlign: 'center' }}>Sign In</Link>
          )}
        </div>
      )}

      {/* Embedded styles for modern dropdown list hover items */}
      <style>{`
        .nav-link {
          font-weight: 500;
          color: var(--text-secondary);
        }
        .nav-link:hover {
          color: #fff;
        }
        .hover-icon {
          transition: transform 0.2s ease;
        }
        .hover-icon:hover {
          transform: scale(1.1);
        }
        .dropdown-item:hover {
          background-color: var(--bg-surface-hover);
        }
        .badge-pulse {
          animation: badgePulse 2s infinite;
        }
        @keyframes badgePulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.15); }
          100% { transform: scale(1); }
        }
        @media (max-width: 768px) {
          .nav-links-desktop { display: none !important; }
          .mobile-toggle { display: block !important; }
        }
      `}</style>
    </nav>
  );
}
