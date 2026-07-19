import React, { useContext, useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { Trash2, ArrowRight, ShoppingBag, Percent } from 'lucide-react';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { formatPrice } from '../utils/currency';

export default function Cart() {
  const { cartItems, subtotal, updateQuantity, removeFromCart, loading } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  // Coupon State
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  const handleQuantityChange = async (productId, quantity, stock) => {
    if (quantity < 1) return;
    if (quantity > stock) {
      alert(`Only ${stock} items available in stock.`);
      return;
    }
    try {
      await updateQuantity(productId, quantity);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    setCouponError('');
    setCouponSuccess('');
    
    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code.');
      return;
    }

    try {
      const { data } = await api.post('/coupons/validate', {
        code: couponCode.trim(),
        orderValue: subtotal,
      });
      setAppliedCoupon(data);
      setCouponSuccess(`Coupon "${data.code}" applied! Discount: $${data.discountAmount}`);
      // Save coupon to session storage for use in Checkout
      sessionStorage.setItem('appliedCoupon', JSON.stringify(data));
    } catch (err) {
      setCouponError(err.response?.data?.message || 'Invalid coupon code.');
      setAppliedCoupon(null);
      sessionStorage.removeItem('appliedCoupon');
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponSuccess('');
    setCouponError('');
    sessionStorage.removeItem('appliedCoupon');
  };

  // Calculations
  const discount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const priceAfterDiscount = Math.max(subtotal - discount, 0);
  const shipping = subtotal > 0 && priceAfterDiscount < 999 ? 99 : 0;
  const tax = Number((priceAfterDiscount * 0.08).toFixed(0)); // 8% Tax
  const total = Number((priceAfterDiscount + shipping + tax).toFixed(0));

  const handleProceedToCheckout = () => {
    // Store price details in session storage for checkout access
    sessionStorage.setItem('checkoutSummary', JSON.stringify({
      itemsPrice: subtotal,
      discount,
      shippingPrice: shipping,
      taxPrice: tax,
      totalPrice: total,
      couponCode: appliedCoupon?.code || '',
    }));
    navigate('/checkout');
  };

  if (loading && cartItems.length === 0) {
    return <div className="loader-container"><div className="spinner"></div></div>;
  }

  return (
    <div className="container fade-in">
      <h1 style={{ fontSize: '2rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <ShoppingBag size={28} /> Shopping Cart
      </h1>

      {cartItems.length === 0 ? (
        <div className="glass" style={{ padding: '4rem 2rem', textAlign: 'center', borderRadius: 'var(--radius-lg)' }}>
          <ShoppingBag size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
          <h3>Your cart is empty</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.5rem', marginBottom: '1.5rem' }}>
            Looks like you haven't added anything to your cart yet.
          </p>
          <RouterLink to="/products" className="btn btn-primary">
            Start Shopping
          </RouterLink>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2.5rem' }} className="cart-layout">
          {/* Cart Items List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {cartItems.map((item) => {
              const product = item.product;
              if (!product) return null;
              
              const imageUrl = product.images && product.images.length > 0 
                ? product.images[0] 
                : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3';

              return (
                <div 
                  key={product._id} 
                  className="glass" 
                  onClick={(e) => {
                    if (e.target.closest('button') || e.target.closest('input')) return;
                    navigate(`/product/${product._id}`);
                  }}
                  style={{ display: 'flex', gap: '1.25rem', padding: '1.25rem', borderRadius: 'var(--radius-lg)', alignItems: 'center', border: '1px solid var(--border)', flexWrap: 'wrap', cursor: 'pointer' }}
                >
                  {/* Product Thumbnail */}
                  <div style={{ width: '80px', height: '80px', borderRadius: 'var(--radius-md)', overflow: 'hidden', flexShrink: 0 }}>
                    <img src={imageUrl} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>

                  {/* Product Info */}
                  <div style={{ flex: 1, minWidth: '180px' }}>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#fff', marginBottom: '0.25rem' }}>
                      {product.name}
                    </h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Brand: {product.brand || 'Aura'}</p>
                    <p style={{ fontSize: '0.9rem', fontWeight: 600, color: '#fff', marginTop: '0.25rem' }}>{formatPrice(product.price)}</p>
                  </div>

                  {/* Quantity controls */}
                  <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                    <button
                      onClick={() => handleQuantityChange(product._id, item.quantity - 1, product.stock)}
                      style={{ background: 'none', border: 'none', color: '#fff', width: '32px', height: '32px', cursor: 'pointer' }}
                    >
                      -
                    </button>
                    <span style={{ width: '32px', textAlign: 'center', fontWeight: 600, fontSize: '0.875rem' }}>{item.quantity}</span>
                    <button
                      onClick={() => handleQuantityChange(product._id, item.quantity + 1, product.stock)}
                      style={{ background: 'none', border: 'none', color: '#fff', width: '32px', height: '32px', cursor: 'pointer' }}
                    >
                      +
                    </button>
                  </div>

                  {/* Total price for item */}
                  <div style={{ width: '80px', textAlign: 'right', fontWeight: 700, fontSize: '1rem', color: '#fff' }}>
                    {formatPrice(product.price * item.quantity)}
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeFromCart(product._id)}
                    style={{ background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer', padding: '0.5rem' }}
                    title="Remove from cart"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Cart Summary Panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* Promo Code Form */}
            <div className="glass" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Percent size={18} /> Promo Code
              </h3>
              
              {couponError && (
                <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-md)', fontSize: '0.75rem', marginBottom: '0.75rem' }}>
                  {couponError}
                </div>
              )}
              {couponSuccess && (
                <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-md)', fontSize: '0.75rem', marginBottom: '0.75rem' }}>
                  {couponSuccess}
                </div>
              )}

              {appliedCoupon ? (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--success)' }}>
                    {appliedCoupon.code} Applied
                  </span>
                  <button onClick={handleRemoveCoupon} style={{ background: 'none', border: 'none', color: 'var(--error)', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="text"
                    placeholder="Enter code (e.g. SAVE10)"
                    className="input-field"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    style={{ textTransform: 'uppercase' }}
                  />
                  <button type="submit" className="btn btn-outline" style={{ padding: '0.5rem 1rem' }}>
                    Apply
                  </button>
                </form>
              )}
            </div>

            {/* Price Calculations */}
            <div className="glass" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>Order Summary</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Subtotal</span>
                  <span style={{ color: '#fff', fontWeight: 500 }}>{formatPrice(subtotal)}</span>
                </div>
                
                {discount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'between', color: 'var(--success)' }}>
                    <span>Discount</span>
                    <span>-{formatPrice(discount)}</span>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Shipping</span>
                  <span style={{ color: '#fff', fontWeight: 500 }}>
                    {shipping === 0 ? 'FREE' : formatPrice(shipping)}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Tax (8%)</span>
                  <span style={{ color: '#fff', fontWeight: 500 }}>{formatPrice(tax)}</span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'between', fontSize: '1.15rem', fontWeight: 700, borderTop: '1px solid var(--border)', paddingTop: '1rem', marginBottom: '1.5rem', color: '#fff' }}>
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>

              <button
                onClick={handleProceedToCheckout}
                className="btn btn-primary"
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.875rem' }}
              >
                Checkout <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .cart-layout {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
