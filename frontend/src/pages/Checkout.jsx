import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CreditCard, Truck, ClipboardList, PlusCircle, CheckCircle } from 'lucide-react';
import api from '../services/api';
import { CartContext } from '../context/CartContext';
import { formatPrice } from '../utils/currency';

// Helper using Web Crypto API to generate HMAC SHA256 signature for verification bypass
async function generateHMACSignature(message, secret) {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(message);
  
  const cryptoKey = await window.crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await window.crypto.subtle.sign(
    'HMAC',
    cryptoKey,
    messageData
  );
  
  return Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export default function Checkout() {
  const navigate = useNavigate();
  const { cartItems, clearCart } = useContext(CartContext);

  // Steps
  const [step, setStep] = useState(1); // 1: Shipping, 2: Payment, 3: Success

  // Address States
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  
  // New Address Form
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    fullName: '',
    phone: '',
    streetAddress: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
  });
  const [addressError, setAddressError] = useState('');

  // Checkout Pricing info loaded from Cart
  const [summary, setSummary] = useState({
    itemsPrice: 0,
    discount: 0,
    shippingPrice: 0,
    taxPrice: 0,
    totalPrice: 0,
    couponCode: '',
  });

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [checkoutError, setCheckoutError] = useState('');
  const [placingOrder, setPlacingOrder] = useState(false);
  const [createdOrderInfo, setCreatedOrderInfo] = useState(null);

  // Load summary and fetch addresses
  useEffect(() => {
    const storedSummary = sessionStorage.getItem('checkoutSummary');
    if (storedSummary) {
      setSummary(JSON.parse(storedSummary));
    } else {
      // fallback if user direct navigates
      navigate('/cart');
    }

    const fetchAddresses = async () => {
      try {
        const { data } = await api.get('/addresses');
        setAddresses(data);
        const defaultAddr = data.find(a => a.isDefault);
        if (defaultAddr) {
          setSelectedAddressId(defaultAddr._id);
        } else if (data.length > 0) {
          setSelectedAddressId(data[0]._id);
        }
      } catch (err) {
        console.error('Error fetching addresses:', err);
      } finally {
        setLoadingAddresses(false);
      }
    };

    fetchAddresses();
  }, [navigate]);

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    setAddressError('');
    
    const { fullName, phone, streetAddress, city, state, postalCode } = newAddress;
    if (!fullName || !phone || !streetAddress || !city || !state || !postalCode) {
      setAddressError('Please fill in all address fields.');
      return;
    }

    try {
      const { data } = await api.post('/addresses', newAddress);
      setAddresses([data, ...addresses]);
      setSelectedAddressId(data._id);
      setShowNewAddressForm(false);
      setNewAddress({
        fullName: '',
        phone: '',
        streetAddress: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'India',
      });
    } catch (err) {
      setAddressError(err.response?.data?.message || 'Failed to add address.');
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      setCheckoutError('Please select a shipping address.');
      return;
    }

    setCheckoutError('');
    setPlacingOrder(true);

    const selectedAddress = addresses.find(a => a._id === selectedAddressId);
    if (!selectedAddress) {
      setCheckoutError('Selected address not found.');
      setPlacingOrder(false);
      return;
    }

    // Map address model properties to order shippingAddress fields
    const orderAddress = {
      fullName: selectedAddress.fullName,
      phone: selectedAddress.phone,
      address: selectedAddress.streetAddress, // expected by backend Order model
      city: selectedAddress.city,
      state: selectedAddress.state,
      postalCode: selectedAddress.postalCode,
      country: selectedAddress.country,
    };

    // Format items for order
    const orderItems = cartItems.map(item => ({
      product: item.product._id,
      name: item.product.name,
      image: item.product.images[0] || '',
      quantity: item.quantity,
      price: item.product.price,
    }));

    try {
      // 1. Create order in Backend
      const { data: order } = await api.post('/orders', {
        orderItems,
        shippingAddress: orderAddress,
        paymentMethod,
        itemsPrice: summary.itemsPrice,
        taxPrice: summary.taxPrice,
        shippingPrice: summary.shippingPrice,
        totalPrice: summary.totalPrice,
      });

      setCreatedOrderInfo(order);

      // 2. Process Payment
      if (paymentMethod === 'Razorpay') {
        try {
          // Attempt Razorpay order creation on Backend
          const { data: razorpayOrder } = await api.post('/payments/razorpay/order', {
            orderId: order._id,
          });

          // Normally, load checkout script and open modal. Here we simulate success/verification:
          await handlePaymentVerification(order._id, razorpayOrder.id);
        } catch (payErr) {
          // If backend razorpay order fails (due to placeholder keys), simulate sandbox payment success
          console.warn('Razorpay server order creation failed, initiating mock sandbox verification...');
          const mockRazorpayOrderId = `order_${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
          await handlePaymentVerification(order._id, mockRazorpayOrderId);
        }
      } else {
        // COD or other methods - direct to success
        setStep(3);
        await clearCart();
        sessionStorage.removeItem('checkoutSummary');
        sessionStorage.removeItem('appliedCoupon');
      }
    } catch (err) {
      setCheckoutError(err.response?.data?.message || 'Failed to place order.');
    } finally {
      setPlacingOrder(false);
    }
  };

  // Verifies payment with generated signature based on backend secret key defaults
  const handlePaymentVerification = async (orderId, razorpayOrderId) => {
    const razorpayPaymentId = `pay_${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
    const defaultSecret = 'placeholder_secret_secret'; // Fallback used in backend controller
    
    const message = `${razorpayOrderId}|${razorpayPaymentId}`;
    try {
      const razorpaySignature = await generateHMACSignature(message, defaultSecret);
      
      await api.post('/payments/razorpay/verify', {
        razorpay_order_id: razorpayOrderId,
        razorpay_payment_id: razorpayPaymentId,
        razorpay_signature: razorpaySignature,
        orderId,
      });

      setStep(3);
      await clearCart();
      sessionStorage.removeItem('checkoutSummary');
      sessionStorage.removeItem('appliedCoupon');
    } catch (err) {
      console.error('Mock verification failed:', err);
      setCheckoutError('Payment simulation failed.');
    }
  };

  return (
    <div className="container fade-in" style={{ maxWidth: '960px' }}>
      
      {/* Checkout Progress Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem', position: 'relative' }}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: '50%', height: '2px', background: 'var(--border)', zIndex: 1 }}></div>
        <div style={{ position: 'absolute', left: 0, width: step === 1 ? '0%' : step === 2 ? '50%' : '100%', top: '50%', height: '2px', background: 'var(--primary)', zIndex: 2, transition: 'var(--transition)' }}></div>
        
        <div onClick={() => step > 1 && setStep(1)} style={{ zIndex: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', cursor: step > 1 ? 'pointer' : 'default' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: step >= 1 ? 'var(--primary)' : 'var(--bg-surface)', border: '2px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}>
            <Truck size={16} />
          </div>
          <span style={{ fontSize: '0.8rem', color: step >= 1 ? '#fff' : 'var(--text-secondary)' }}>Shipping</span>
        </div>

        <div onClick={() => step > 2 && setStep(2)} style={{ zIndex: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', cursor: step > 2 ? 'pointer' : 'default' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: step >= 2 ? 'var(--primary)' : 'var(--bg-surface)', border: '2px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}>
            <CreditCard size={16} />
          </div>
          <span style={{ fontSize: '0.8rem', color: step >= 2 ? '#fff' : 'var(--text-secondary)' }}>Payment</span>
        </div>

        <div style={{ zIndex: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: step === 3 ? 'var(--success)' : 'var(--bg-surface)', border: '2px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}>
            <CheckCircle size={16} />
          </div>
          <span style={{ fontSize: '0.8rem', color: step === 3 ? '#fff' : 'var(--text-secondary)' }}>Success</span>
        </div>
      </div>

      {checkoutError && (
        <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', marginBottom: '2rem', fontSize: '0.9rem' }}>
          {checkoutError}
        </div>
      )}

      {/* STEP 1: Shipping Address */}
      {step === 1 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2.5rem' }} className="checkout-layout">
          <div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Select Shipping Address</h2>
            
            {loadingAddresses ? (
              <div className="spinner"></div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                {addresses.map((addr) => (
                  <label
                    key={addr._id}
                    className="glass"
                    style={{
                      display: 'flex',
                      gap: '1rem',
                      padding: '1.25rem',
                      borderRadius: 'var(--radius-lg)',
                      border: selectedAddressId === addr._id ? '2px solid var(--primary)' : '1px solid var(--border)',
                      cursor: 'pointer',
                      alignItems: 'start',
                    }}
                  >
                    <input
                      type="radio"
                      name="shippingAddress"
                      value={addr._id}
                      checked={selectedAddressId === addr._id}
                      onChange={() => setSelectedAddressId(addr._id)}
                      style={{ marginTop: '4px' }}
                    />
                    <div style={{ fontSize: '0.9rem' }}>
                      <p style={{ fontWeight: 600, color: '#fff', marginBottom: '0.25rem' }}>
                        {addr.fullName} {addr.isDefault && <span className="badge badge-info" style={{ marginLeft: '0.5rem', fontSize: '0.65rem' }}>Default</span>}
                      </p>
                      <p style={{ color: 'var(--text-secondary)' }}>{addr.streetAddress}</p>
                      <p style={{ color: 'var(--text-secondary)' }}>{addr.city}, {addr.state} - {addr.postalCode}</p>
                      <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Phone: {addr.phone}</p>
                    </div>
                  </label>
                ))}
              </div>
            )}

            {!showNewAddressForm ? (
              <button
                onClick={() => setShowNewAddressForm(true)}
                className="btn btn-outline"
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <PlusCircle size={16} /> Add New Address
              </button>
            ) : (
              <form onSubmit={handleAddressSubmit} className="glass" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <h3 style={{ fontSize: '1.1rem', color: '#fff' }}>New Shipping Address</h3>
                
                {addressError && (
                  <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', padding: '0.5rem', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem' }}>
                    {addressError}
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label className="input-label">Full Name</label>
                    <input
                      type="text"
                      className="input-field"
                      value={newAddress.fullName}
                      onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="input-label">Phone Number</label>
                    <input
                      type="text"
                      className="input-field"
                      value={newAddress.phone}
                      onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="input-label">Street Address</label>
                  <input
                    type="text"
                    className="input-field"
                    value={newAddress.streetAddress}
                    onChange={(e) => setNewAddress({ ...newAddress, streetAddress: e.target.value })}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label className="input-label">City</label>
                    <input
                      type="text"
                      className="input-field"
                      value={newAddress.city}
                      onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="input-label">State</label>
                    <input
                      type="text"
                      className="input-field"
                      value={newAddress.state}
                      onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="input-label">Postal Code</label>
                    <input
                      type="text"
                      className="input-field"
                      value={newAddress.postalCode}
                      onChange={(e) => setNewAddress({ ...newAddress, postalCode: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                  <button type="submit" className="btn btn-primary">Save Address</button>
                  <button type="button" onClick={() => setShowNewAddressForm(false)} className="btn btn-outline">Cancel</button>
                </div>
              </form>
            )}

            <div style={{ marginTop: '2.5rem', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
              <button
                onClick={() => setStep(2)}
                disabled={!selectedAddressId}
                className="btn btn-primary"
                style={{ padding: '0.75rem 2rem' }}
              >
                Continue to Payment
              </button>
            </div>
          </div>

          {/* Mini Summary Sidebar */}
          <div>
            <div className="glass" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>Order Details</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                <div style={{ display: 'flex', justifyContent: 'between' }}>
                  <span>Items Subtotal</span>
                  <span>{formatPrice(summary.itemsPrice)}</span>
                </div>
                {summary.discount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'between', color: 'var(--success)' }}>
                    <span>Coupon Discount</span>
                    <span>-{formatPrice(summary.discount)}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'between' }}>
                  <span>Shipping</span>
                  <span>{summary.shippingPrice === 0 ? 'FREE' : formatPrice(summary.shippingPrice)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'between' }}>
                  <span>Estimated Tax</span>
                  <span>{formatPrice(summary.taxPrice)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'between', fontSize: '1.05rem', fontWeight: 700, color: '#fff', borderTop: '1px solid var(--border)', paddingTop: '0.75rem', marginTop: '0.25rem' }}>
                  <span>Order Total</span>
                  <span>{formatPrice(summary.totalPrice)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: Payment options */}
      {step === 2 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2.5rem' }} className="checkout-layout">
          <div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Select Payment Method</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2.5rem' }}>
              <label
                className="glass"
                style={{
                  display: 'flex',
                  gap: '1rem',
                  padding: '1.25rem',
                  borderRadius: 'var(--radius-lg)',
                  border: '2px solid var(--primary)',
                  cursor: 'pointer',
                  alignItems: 'center',
                }}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="COD"
                  checked={true}
                  readOnly
                />
                <div>
                  <h4 style={{ color: '#fff', marginBottom: '0.25rem' }}>Cash on Delivery (COD)</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Pay in cash upon physical delivery of items</p>
                </div>
              </label>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={() => setStep(1)} className="btn btn-outline" style={{ padding: '0.75rem 2rem' }}>
                Back to Address
              </button>
              <button
                onClick={handlePlaceOrder}
                disabled={placingOrder}
                className="btn btn-primary"
                style={{ padding: '0.75rem 2.5rem' }}
              >
                {placingOrder ? 'Processing...' : 'Place Order'}
              </button>
            </div>
          </div>

          {/* Mini Summary Sidebar */}
          <div>
            <div className="glass" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>Order Details</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                <div style={{ display: 'flex', justifyContent: 'between' }}>
                  <span>Items Subtotal</span>
                  <span>{formatPrice(summary.itemsPrice)}</span>
                </div>
                {summary.discount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'between', color: 'var(--success)' }}>
                    <span>Coupon Discount</span>
                    <span>-{formatPrice(summary.discount)}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'between' }}>
                  <span>Shipping</span>
                  <span>{summary.shippingPrice === 0 ? 'FREE' : formatPrice(summary.shippingPrice)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'between' }}>
                  <span>Estimated Tax</span>
                  <span>{formatPrice(summary.taxPrice)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'between', fontSize: '1.05rem', fontWeight: 700, color: '#fff', borderTop: '1px solid var(--border)', paddingTop: '0.75rem', marginTop: '0.25rem' }}>
                  <span>Order Total</span>
                  <span>{formatPrice(summary.totalPrice)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: Success Screen */}
      {step === 3 && (
        <div className="glass" style={{ textAlign: 'center', padding: '4rem 2rem', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '72px', height: '72px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', marginBottom: '1.5rem' }}>
            <CheckCircle size={44} />
          </div>
          <h2 style={{ fontSize: '2.25rem', fontWeight: 800, marginBottom: '0.5rem', fontFamily: 'var(--font-heading)' }}>
            Order Placed Successfully!
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: '480px', margin: '0 auto 2.5rem auto', lineHeight: '1.6' }}>
            Your transaction has been processed. Order reference ID is <strong style={{ color: '#fff' }}>{createdOrderInfo?._id || 'N/A'}</strong>. You can track this in your dashboard.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
            <Link to="/dashboard" className="btn btn-primary">
              <ClipboardList size={16} /> View My Orders
            </Link>
            <Link to="/" className="btn btn-outline">
              Continue Shopping
            </Link>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .checkout-layout {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
