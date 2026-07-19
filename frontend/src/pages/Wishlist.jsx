import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag } from 'lucide-react';
import { WishlistContext } from '../context/WishlistContext';
import ProductCard from '../components/ProductCard';

export default function Wishlist() {
  const { wishlistProducts, loading } = useContext(WishlistContext);

  if (loading && wishlistProducts.length === 0) {
    return <div className="loader-container"><div className="spinner"></div></div>;
  }

  return (
    <div className="container fade-in">
      <h1 style={{ fontSize: '2rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Heart size={28} /> My Wishlist
      </h1>

      {wishlistProducts.length === 0 ? (
        <div className="glass" style={{ padding: '4rem 2rem', textAlign: 'center', borderRadius: 'var(--radius-lg)' }}>
          <Heart size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
          <h3>Your wishlist is empty</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.5rem', marginBottom: '1.5rem' }}>
            Save items here to buy them later or keep track of stock.
          </p>
          <Link to="/products" className="btn btn-primary">
            Explore Products
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {wishlistProducts.map((product) => {
            if (!product) return null;
            return <ProductCard key={product._id} product={product} />;
          })}
        </div>
      )}
    </div>
  );
}
