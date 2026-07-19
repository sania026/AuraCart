import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, Star, CheckCircle, Trash2, Sparkles } from 'lucide-react';
import api from '../services/api';
import { CartContext } from '../context/CartContext';
import { WishlistContext } from '../context/WishlistContext';
import { AuthContext } from '../context/AuthContext';
import ProductCard from '../components/ProductCard';
import { formatPrice } from '../utils/currency';

export default function ProductDetails() {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const { addToCart } = useContext(CartContext);
  const { addToWishlist, removeFromWishlist, isInWishlist } = useContext(WishlistContext);
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [togetherProducts, setTogetherProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Carousel State
  const [activeImage, setActiveImage] = useState('');

  // Cart Qty State
  const [quantity, setQuantity] = useState(1);

  // Review Form States
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');

  const isLiked = product ? isInWishlist(product._id) : false;

  const fetchProductData = async () => {
    setLoading(true);
    try {
      const [prodRes, reviewsRes, relatedRes, togetherRes] = await Promise.all([
        api.get(`/products/${id}`),
        api.get(`/reviews/product/${id}`).catch(() => ({ data: [] })),
        api.get(`/search/related/${id}`).catch(() => ({ data: [] })),
        api.get(`/search/together/${id}`).catch(() => ({ data: [] })),
      ]);

      setProduct(prodRes.data);
      setReviews(reviewsRes.data);
      setRelatedProducts(relatedRes.data);
      setTogetherProducts(togetherRes.data);
      
      // Default to first image
      if (prodRes.data.images && prodRes.data.images.length > 0) {
        setActiveImage(prodRes.data.images[0]);
      } else {
        setActiveImage('https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductData();
    window.scrollTo(0, 0);
    // Add product ID to recentlyViewed list in localStorage
    if (id) {
      const viewedStr = localStorage.getItem('recentlyViewed');
      let viewedList = viewedStr ? viewedStr.split(',') : [];
      viewedList = viewedList.filter((v) => v !== id);
      viewedList.unshift(id);
      viewedList = viewedList.slice(0, 4); // Limit to top 4 products
      localStorage.setItem('recentlyViewed', viewedList.join(','));
    }
    // Reset review form when switching products
    setComment('');
    setRating(5);
    setReviewError('');
    setReviewSuccess('');
    setQuantity(1);
  }, [id]);

  const handleWishlistToggle = async () => {
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

  const handleAddToCart = async () => {
    if (!user) {
      alert('Please login to add items to your cart.');
      return;
    }
    try {
      await addToCart(product._id, quantity);
      alert('Added to cart successfully!');
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAddBundleToCart = async () => {
    if (!user) {
      alert('Please login to add items to your cart.');
      return;
    }
    try {
      await Promise.all([
        addToCart(product._id, 1),
        ...togetherProducts.map((p) => addToCart(p._id, 1)),
      ]);
      alert('Bundle added to your cart successfully!');
      navigate('/cart');
    } catch (err) {
      alert(err.message || 'Failed to add bundle to cart.');
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewError('');
    setReviewSuccess('');

    try {
      await api.post(`/reviews`, {
        product: product._id,
        rating,
        comment,
      });
      setReviewSuccess('Review submitted successfully!');
      setComment('');
      // Reload reviews
      const reviewsRes = await api.get(`/reviews/product/${product._id}`);
      setReviews(reviewsRes.data);
    } catch (err) {
      setReviewError(err.response?.data?.message || 'Failed to submit review.');
    }
  };

  const handleReviewDelete = async (reviewId) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      try {
        await api.delete(`/reviews/${reviewId}`);
        setReviews(reviews.filter((r) => r._id !== reviewId));
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete review.');
      }
    }
  };

  if (loading) {
    return <div className="loader-container"><div className="spinner"></div></div>;
  }

  if (!product) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '4rem 0' }}>
        <h2>Product Not Found</h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', marginBottom: '2rem' }}>The product you are looking for does not exist or has been removed.</p>
        <Link to="/products" className="btn btn-primary">Back to Catalog</Link>
      </div>
    );
  }

  return (
    <div className="container fade-in">
      {/* Breadcrumbs */}
      <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '2rem' }}>
        <Link to="/" style={{ color: 'var(--text-secondary)' }}>Home</Link>
        <span>/</span>
        <Link to="/products" style={{ color: 'var(--text-secondary)' }}>Catalog</Link>
        <span>/</span>
        <span style={{ color: '#fff' }}>{product.name}</span>
      </div>

      {/* Main product showcase */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '3rem', marginBottom: '3rem' }}>
        
        {/* Images Display */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="glass" style={{ width: '100%', aspectRatio: '1/1', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--border)', padding: '0.75rem' }}>
            <img src={activeImage} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: 'var(--radius-md)' }} />
          </div>
          
          {/* Thumbnails list */}
          {product.images && product.images.length > 1 && (
            <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
              {product.images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setActiveImage(img)}
                  className="glass"
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: 'var(--radius-sm)',
                    overflow: 'hidden',
                    border: activeImage === img ? '2px solid var(--primary)' : '1px solid var(--border)',
                    padding: '2px',
                    cursor: 'pointer',
                    flexShrink: 0,
                  }}
                >
                  <img src={img} alt="thumbnail" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info Area */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>
              {product.brand || 'Aura'}
            </span>
            <h1 style={{ fontSize: '2.5rem', lineHeight: '1.2', fontWeight: 800, marginTop: '0.25rem' }}>{product.name}</h1>
          </div>

          {/* Ratings Info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ display: 'flex', color: 'var(--warning)' }}>
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={18}
                  fill={i < Math.round(product.ratings || 0) ? 'var(--warning)' : 'none'}
                />
              ))}
            </div>
            <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{product.ratings?.toFixed(1) || '0.0'}</span>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>({product.numReviews} reviews)</span>
          </div>

          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#fff' }}>
            {formatPrice(product.price)}
          </div>

          <p style={{ color: 'var(--text-secondary)', fontSize: '0.975rem', lineHeight: '1.6' }}>
            {product.description || 'Elevate your lifestyle with this premium selection. Tailored for absolute style, convenience, and modern functionality.'}
          </p>

          <div style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '1rem 0', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Availability</span>
              <span style={{ fontWeight: 600, color: product.stock > 0 ? 'var(--success)' : 'var(--error)' }}>
                {product.stock > 0 ? `In Stock (${product.stock} units)` : 'Out of Stock'}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>SKU</span>
              <span style={{ fontWeight: 500, color: '#fff' }}>{product.sku || 'N/A'}</span>
            </div>
          </div>

          {product.stock > 0 && (
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                <button
                  onClick={() => setQuantity((prev) => Math.max(prev - 1, 1))}
                  style={{ background: 'none', border: 'none', color: '#fff', width: '36px', height: '36px', cursor: 'pointer' }}
                >
                  -
                </button>
                <span style={{ width: '40px', textAlign: 'center', fontWeight: 600 }}>{quantity}</span>
                <button
                  onClick={() => setQuantity((prev) => Math.min(prev + 1, product.stock))}
                  style={{ background: 'none', border: 'none', color: '#fff', width: '36px', height: '36px', cursor: 'pointer' }}
                >
                  +
                </button>
              </div>

              <button onClick={handleAddToCart} className="btn btn-primary" style={{ flex: 1, height: '42px' }}>
                <ShoppingCart size={18} /> Add to Cart
              </button>

              <button
                onClick={handleWishlistToggle}
                className="btn btn-outline"
                style={{ width: '42px', height: '42px', padding: 0, color: isLiked ? 'var(--secondary)' : 'var(--text-secondary)' }}
              >
                <Heart size={18} fill={isLiked ? 'var(--secondary)' : 'none'} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Frequently Bought Together Bundle */}
      {togetherProducts.length > 0 && (
        <section style={{ margin: '3.5rem 0', padding: '2rem', borderRadius: 'var(--radius-lg)', background: 'rgba(255, 255, 255, 0.01)', border: '1px solid var(--border)' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={18} style={{ color: 'var(--secondary)' }} /> Frequently Bought Together
          </h3>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
            <Link to={`/product/${product._id}`} style={{ display: 'flex', gap: '1rem', alignItems: 'center', textDecoration: 'none' }}>
              <div style={{ position: 'relative' }}>
                <img src={activeImage} alt={product.name} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} />
                <span style={{ position: 'absolute', bottom: 0, right: 0, background: 'var(--primary)', color: 'white', padding: '2px 6px', fontSize: '0.65rem', borderRadius: 'var(--radius-sm)', fontWeight: 600 }}>Main</span>
              </div>
              <div>
                <h4 style={{ fontSize: '0.9rem', color: '#fff', maxWidth: '120px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{product.name}</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{formatPrice(product.price)}</p>
              </div>
            </Link>

            {togetherProducts.map((p, idx) => (
              <React.Fragment key={p._id}>
                <div style={{ fontSize: '1.5rem', color: 'var(--text-muted)' }}>+</div>
                <Link to={`/product/${p._id}`} style={{ display: 'flex', gap: '1rem', alignItems: 'center', textDecoration: 'none' }}>
                  <img src={p.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60'} alt={p.name} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} />
                  <div>
                    <h4 style={{ fontSize: '0.9rem', color: '#fff', maxWidth: '120px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{formatPrice(p.price)}</p>
                  </div>
                </Link>
              </React.Fragment>
            ))}

            <div style={{ marginLeft: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem', borderLeft: '1px solid var(--border)', paddingLeft: '1.5rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Bundle Price:</span>
              <strong style={{ fontSize: '1.25rem', color: 'var(--secondary)' }}>
                {formatPrice(product.price + togetherProducts.reduce((acc, p) => acc + p.price, 0))}
              </strong>
              <button
                onClick={handleAddBundleToCart}
                className="btn btn-primary"
                style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
              >
                Add Bundle to Cart
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Review Section */}
      <section style={{ borderTop: '1px solid var(--border)', paddingTop: '3rem', marginBottom: '4rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '4rem' }}>
          
          {/* Reviews List */}
          <div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', fontWeight: 800 }}>Customer Reviews ({reviews.length})</h2>
            {reviews.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {reviews.map((rev) => (
                  <div key={rev._id} className="glass" style={{ borderRadius: 'var(--radius-md)', padding: '1.25rem', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', justifycontent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#fff' }}>{rev.user?.name || 'Anonymous'}</h4>
                        <div style={{ display: 'flex', color: 'var(--warning)', margin: '0.25rem 0' }}>
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={14}
                              fill={i < rev.rating ? 'var(--warning)' : 'none'}
                            />
                          ))}
                        </div>
                      </div>
                      
                      {user && (user._id === rev.user?._id || user.role === 'admin') && (
                        <button
                          onClick={() => handleReviewDelete(rev._id)}
                          style={{ background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer' }}
                          title="Delete review"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>

                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{rev.comment}</p>
                    
                    {rev.isVerifiedPurchase && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: 'var(--success)', fontSize: '0.75rem', fontWeight: 600, marginTop: '0.75rem' }}>
                        <CheckCircle size={12} /> Verified Purchase
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--text-secondary)' }}>No reviews yet. Be the first to review this product!</p>
            )}
          </div>

          {/* Add Review Form */}
          <div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', fontWeight: 800 }}>Write a Review</h2>
            
            {user ? (
              <form onSubmit={handleReviewSubmit} className="glass" style={{ borderRadius: 'var(--radius-lg)', padding: '1.5rem', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {reviewError && (
                  <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', padding: '0.75rem', borderRadius: 'var(--radius-md)', fontSize: '0.85rem' }}>
                    {reviewError}
                  </div>
                )}
                {reviewSuccess && (
                  <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', padding: '0.75rem', borderRadius: 'var(--radius-md)', fontSize: '0.85rem' }}>
                    {reviewSuccess}
                  </div>
                )}

                <div>
                  <label className="input-label">Rating</label>
                  <select
                    className="input-field"
                    value={rating}
                    onChange={(e) => setRating(Number(e.target.value))}
                    style={{ width: '150px' }}
                  >
                    <option value={5}>5 ★ Excellent</option>
                    <option value={4}>4 ★ Very Good</option>
                    <option value={3}>3 ★ Average</option>
                    <option value={2}>2 ★ Poor</option>
                    <option value={1}>1 ★ Terrible</option>
                  </select>
                </div>

                <div>
                  <label className="input-label" htmlFor="comment">Comments</label>
                  <textarea
                    id="comment"
                    rows={4}
                    className="input-field"
                    placeholder="Share your experience with this product..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    required
                    style={{ resize: 'vertical' }}
                  ></textarea>
                </div>

                <button type="submit" className="btn btn-primary" style={{ alignSelf: 'start' }}>
                  Submit Review
                </button>
              </form>
            ) : (
              <div className="glass" style={{ padding: '2rem', textAlign: 'center', borderRadius: 'var(--radius-lg)' }}>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                  Please sign in to write customer reviews.
                </p>
                <Link to={`/login?redirect=/product/${product._id}`} className="btn btn-primary">
                  Sign In
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <section style={{ borderTop: '1px solid var(--border)', paddingTop: '3rem' }}>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '2rem', fontWeight: 800 }}>Related Products</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.5rem' }}>
            {relatedProducts.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
