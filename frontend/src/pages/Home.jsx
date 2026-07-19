import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, ShieldCheck, Zap, Award } from 'lucide-react';
import api from '../services/api';
import ProductCard from '../components/ProductCard';

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [trendingData, setTrendingData] = useState({
    bestSellers: [],
    newArrivals: [],
    topRated: [],
    featured: [],
  });
  const [activeTab, setActiveTab] = useState('bestSellers');
  const [recommended, setRecommended] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Load categories
        const categoriesRes = await api.get('/categories').catch(() => ({ data: [] }));
        setCategories(categoriesRes.data);

        // Load trending sections (Best Sellers, New Arrivals, Top Rated, Featured) in a single request
        const trendingRes = await api.get('/search/trending').catch(() => ({
          data: {
            bestSellers: [],
            newArrivals: [],
            topRated: [],
            featured: [],
          },
        }));
        setTrendingData(trendingRes.data);

        // Load personalized recommendations
        const recsRes = await api.get('/search/recommendations').catch(() => ({ data: [] }));
        setRecommended(recsRes.data);

        // Load recently viewed products details
        const storedIds = localStorage.getItem('recentlyViewed');
        if (storedIds) {
          const viewedRes = await api.get(`/search/recently-viewed?ids=${storedIds}`).catch(() => ({ data: [] }));
          setRecentlyViewed(viewedRes.data);
        }
      } catch (err) {
        console.error('Error fetching home page data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="fade-in">
      {/* Hero Section */}
      <section style={{ position: 'relative', overflow: 'hidden', padding: '6rem 0', background: 'radial-gradient(circle at 10% 20%, rgba(99, 102, 241, 0.15) 0%, transparent 40%), radial-gradient(circle at 90% 80%, rgba(168, 85, 247, 0.15) 0%, transparent 40%)' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '3rem', alignItems: 'center' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', padding: '0.375rem 0.875rem', borderRadius: '9999px', fontSize: '0.85rem', fontWeight: 600, marginBottom: '1.5rem' }}>
              <Sparkles size={14} /> Future of Shopping
            </div>
            
            <h1 style={{ fontSize: '3.5rem', lineHeight: '1.1', fontWeight: 800, marginBottom: '1.5rem', fontFamily: 'var(--font-heading)' }}>
              Next-Gen E-Commerce, <br />
              <span style={{ background: 'linear-gradient(to right, var(--primary), var(--secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Aura Style.
              </span>
            </h1>
            
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginBottom: '2.5rem', maxWidth: '480px' }}>
              Discover curated luxury items, tech essentials, and trending apparel. Re-imagined with a smooth glassmorphism UI.
            </p>
            
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <Link to="/products" className="btn btn-primary" style={{ padding: '0.875rem 2rem', fontSize: '1rem' }}>
                Shop Collection <ArrowRight size={18} />
              </Link>
              <Link to="/products?sort=latest" className="btn btn-outline" style={{ padding: '0.875rem 2rem', fontSize: '1rem' }}>
                New Arrivals
              </Link>
            </div>
          </div>

          {/* Right Banner Image */}
          <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
            <div className="glass" style={{ width: '100%', maxWidth: '440px', height: '400px', borderRadius: 'var(--radius-xl)', overflow: 'hidden', padding: '1rem', position: 'relative' }}>
              <img
                src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&auto=format&fit=crop&q=80"
                alt="Banner Model"
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'var(--radius-lg)' }}
              />
              <div className="glass" style={{ position: 'absolute', bottom: '30px', left: '30px', padding: '1rem', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '1rem', border: '1px solid var(--border)' }}>
                <div style={{ background: 'var(--primary)', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Award size={20} color="white" />
                </div>
                <div>
                  <h4 style={{ fontSize: '1rem', margin: 0, color: '#fff' }}>4.9 ★ Rating</h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>Over 10k Customer Reviews</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section style={{ padding: '3rem 0', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', background: 'rgba(255, 255, 255, 0.01)' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2rem' }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ color: 'var(--primary)' }}><ShieldCheck size={36} /></div>
            <div>
              <h4 style={{ fontSize: '1.05rem', marginBottom: '0.25rem', color: '#fff' }}>Secure Checkout</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Fully encrypted payments</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ color: 'var(--primary)' }}><Zap size={36} /></div>
            <div>
              <h4 style={{ fontSize: '1.05rem', marginBottom: '0.25rem', color: '#fff' }}>Fast Delivery</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Shipped within 24 hours</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ color: 'var(--primary)' }}><Award size={36} /></div>
            <div>
              <h4 style={{ fontSize: '1.05rem', marginBottom: '0.25rem', color: '#fff' }}>Top Quality</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Selected items verified by experts</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      {categories.length > 0 && (
        <section style={{ padding: '5rem 0' }}>
          <div className="container">
            <h2 style={{ fontSize: '2rem', marginBottom: '2.5rem', textAlign: 'center', fontWeight: 800 }}>Shop by Category</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
              {categories.map((cat) => (
                <Link
                  key={cat._id}
                  to={`/products?category=${cat._id}`}
                  className="glass category-card"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    padding: '2rem',
                    borderRadius: 'var(--radius-lg)',
                    textAlign: 'center',
                    transition: 'var(--transition)',
                  }}
                >
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: '#fff' }}>{cat.name}</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{cat.description || 'Premium selection'}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Trending Collections with Tabs */}
      <section style={{ padding: '5rem 0', backgroundColor: 'rgba(255,255,255,0.01)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '3rem', textAlign: 'center' }}>
            <h2 style={{ fontSize: '2.25rem', marginBottom: '0.5rem', fontWeight: 800 }}>Trending Collection</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Discover the most popular products in our store</p>

            <div style={{ display: 'inline-flex', gap: '0.5rem', marginTop: '1.5rem', padding: '0.25rem', borderRadius: '9999px', border: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)' }}>
              {Object.keys(trendingData).map((key) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className="btn"
                  style={{
                    borderRadius: '9999px',
                    padding: '0.5rem 1.25rem',
                    fontSize: '0.85rem',
                    border: 'none',
                    background: activeTab === key ? 'var(--primary)' : 'none',
                    color: activeTab === key ? '#fff' : 'var(--text-secondary)',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {key === 'bestSellers' ? 'Best Sellers' : key === 'newArrivals' ? 'New Arrivals' : key === 'topRated' ? 'Top Rated' : 'Featured'}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="grid-cols-4">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="card-skeleton" style={{ height: '340px', borderRadius: 'var(--radius-lg)' }}></div>
              ))}
            </div>
          ) : trendingData[activeTab]?.length > 0 ? (
            <div className="grid-cols-4">
              {trendingData[activeTab].map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : (
            <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No items found in this section.</p>
          )}
        </div>
      </section>

      {/* Recommended for You Section */}
      {!loading && recommended.length > 0 && (
        <section style={{ padding: '5rem 0', borderBottom: '1px solid var(--border)' }}>
          <div className="container">
            <div style={{ marginBottom: '2.5rem' }}>
              <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem', fontWeight: 800 }}>Recommended for You</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Tailored recommendations based on your preferences</p>
            </div>

            <div className="grid-cols-4">
              {recommended.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Recently Viewed Products Section */}
      {!loading && recentlyViewed.length > 0 && (
        <section style={{ padding: '5rem 0' }}>
          <div className="container">
            <div style={{ marginBottom: '2.5rem' }}>
              <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem', fontWeight: 800 }}>Recently Viewed</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Your recently explored items</p>
            </div>

            <div className="grid-cols-4">
              {recentlyViewed.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      <style>{`
        .category-card:hover {
          transform: translateY(-4px);
          border-color: var(--primary);
          background-color: var(--bg-surface-hover);
        }
        .card-skeleton {
          background: linear-gradient(90deg, rgba(255,255,255,0.02) 25%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0.02) 75%);
          background-size: 200% 100%;
          animation: pulse-skeleton 1.5s infinite;
        }
        @keyframes pulse-skeleton {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}
