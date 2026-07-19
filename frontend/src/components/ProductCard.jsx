import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart } from 'lucide-react';
import { CartContext } from '../context/CartContext';
import { WishlistContext } from '../context/WishlistContext';
import { AuthContext } from '../context/AuthContext';
import { formatPrice } from '../utils/currency';

export default function ProductCard({ product }) {
  const { addToCart } = useContext(CartContext);
  const { addToWishlist, removeFromWishlist, isInWishlist } = useContext(WishlistContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const isLiked = isInWishlist(product._id);

  const handleWishlistToggle = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('Please login to save items to your wishlist.');
      return;
    }
    try {
      if (isLiked) {
        await removeFromWishlist(product._id);
      } else {
        await addToWishlist(product._id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('Please login to add items to your cart.');
      return;
    }
    try {
      await addToCart(product._id, 1);
      alert('Added to cart successfully!');
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCardClick = (e) => {
    // Prevent navigation if user clicked a button (Wishlist or Add to Cart)
    if (e.target.closest('button')) {
      return;
    }
    navigate(`/product/${product._id}`);
  };

  // Extract first image or use a default
  const imageUrl = product.images && product.images.length > 0 
    ? product.images[0] 
    : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3';

  return (
    <div 
      className="product-card fade-in" 
      onClick={handleCardClick} 
      style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}
    >
      {/* Wishlist Button Overlay */}
      <button
        onClick={handleWishlistToggle}
        style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          background: 'rgba(15, 23, 42, 0.6)',
          border: 'none',
          borderRadius: '50%',
          width: '36px',
          height: '36px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          color: isLiked ? 'var(--secondary)' : '#fff',
          zIndex: 10,
          backdropFilter: 'blur(4px)',
          transition: 'var(--transition)',
        }}
        className="wishlist-btn"
      >
        <Heart size={18} fill={isLiked ? 'var(--secondary)' : 'none'} />
      </button>

      {/* Product Image Box */}
      <div style={{ display: 'block', overflow: 'hidden', height: '240px', borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0' }}>
        <img
          src={imageUrl}
          alt={product.name}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.5s ease',
          }}
          className="product-img"
        />
      </div>

      {/* Card Info Content */}
      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 600, letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
          {product.brand || 'Aura'}
        </span>
        
        <div style={{ display: 'block', marginBottom: '0.5rem' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical' }}>
            {product.name}
          </h3>
        </div>

        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', marginBottom: '1rem', height: '36px' }}>
          {product.description || 'No description available for this premium quality product.'}
        </p>

        {/* Footer info (price & add button) */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '0.5rem' }}>
          <div>
            <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff' }}>
              {formatPrice(product.price)}
            </span>
          </div>

          {product.stock > 0 ? (
            <button
              onClick={handleAddToCart}
              className="btn btn-primary"
              style={{
                borderRadius: '50%',
                width: '38px',
                height: '38px',
                padding: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              title="Add to Cart"
            >
              <ShoppingCart size={18} />
            </button>
          ) : (
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--error)', background: 'rgba(239, 68, 68, 0.1)', padding: '0.25rem 0.5rem', borderRadius: 'var(--radius-sm)' }}>
              Out of stock
            </span>
          )}
        </div>
      </div>

      <style>{`
        .product-card:hover .product-img {
          transform: scale(1.05);
        }
        .wishlist-btn:hover {
          transform: scale(1.1);
          background: rgba(15, 23, 42, 0.8);
        }
      `}</style>
    </div>
  );
}
