import React, { useEffect, useState, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Calendar, CreditCard, ShieldAlert, Truck, ArrowLeft } from 'lucide-react';
import api from '../services/api';
import { CartContext } from '../context/CartContext';
import { formatPrice } from '../utils/currency';

export default function Orders() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, fetchCart } = useContext(CartContext);

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reordering, setReordering] = useState(false);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const { data } = await api.get(`/orders/${id}`);
        setOrder(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch order details.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  const handleReorder = async () => {
    if (!order) return;
    setReordering(true);
    try {
      await Promise.all(
        order.orderItems.map((item) =>
          addToCart(item.product?._id || item.product, item.quantity)
        )
      );
      await fetchCart();
      alert('Items from this order have been added to your cart!');
      navigate('/cart');
    } catch (err) {
      alert(err.message || 'Failed to reorder items.');
    } finally {
      setReordering(false);
    }
  };

  if (loading) {
    return <div className="loader-container"><div className="spinner"></div></div>;
  }

  if (error) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '4rem 0' }}>
        <ShieldAlert size={48} style={{ color: 'var(--error)', marginBottom: '1rem' }} />
        <h2>Error Accessing Order</h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', marginBottom: '2rem' }}>{error}</p>
        <Link to="/dashboard" className="btn btn-primary">Back to Dashboard</Link>
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="container fade-in" style={{ maxWidth: '840px' }}>
      
      {/* Back button */}
      <Link to="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
        <ArrowLeft size={16} /> Back to Dashboard
      </Link>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Order Reference</span>
          <h1 style={{ fontSize: '1.75rem', marginTop: '0.25rem' }}>#{order._id}</h1>
        </div>
        
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <span className={`badge ${order.isPaid ? 'badge-success' : 'badge-danger'}`} style={{ padding: '0.375rem 0.75rem', fontSize: '0.8rem' }}>
            {order.isPaid ? 'Paid' : 'Unpaid'}
          </span>
          <span className={`badge ${order.orderStatus === 'Delivered' ? 'badge-success' : order.orderStatus === 'Cancelled' ? 'badge-danger' : 'badge-warning'}`} style={{ padding: '0.375rem 0.75rem', fontSize: '0.8rem' }}>
            {order.orderStatus}
          </span>
          
          <button
            onClick={handlePrint}
            className="btn btn-outline"
            style={{ padding: '0.375rem 0.75rem', fontSize: '0.8rem', height: 'auto', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
          >
            Download Invoice (PDF)
          </button>
          
          {order.orderStatus !== 'Cancelled' && (
            <button
              onClick={handleReorder}
              className="btn btn-primary"
              style={{ padding: '0.375rem 0.75rem', fontSize: '0.8rem', height: 'auto', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
              disabled={reordering}
            >
              {reordering ? 'Adding...' : 'Reorder'}
            </button>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2.5rem' }} className="order-details-layout">
        
        {/* Left main info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Order Items list */}
          <div className="glass" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', fontWeight: 700 }}>Order Items</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {order.orderItems.map((item, idx) => {
                const productId = item.product?._id || item.product;
                const itemContent = (
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <img
                      src={item.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60'}
                      alt={item.name}
                      style={{ width: '56px', height: '56px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }}
                    />
                    <div style={{ flex: 1, fontSize: '0.9rem' }}>
                      <h4 style={{ color: '#fff', fontWeight: 600 }}>{item.name}</h4>
                      <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                        {formatPrice(item.price)} x {item.quantity}
                      </p>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#fff' }}>
                      {formatPrice(item.price * item.quantity)}
                    </div>
                  </div>
                );

                return productId ? (
                  <Link
                    key={idx}
                    to={`/product/${productId}`}
                    style={{ textDecoration: 'none', display: 'block', borderBottom: idx < order.orderItems.length - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none', paddingBottom: idx < order.orderItems.length - 1 ? '1rem' : 0 }}
                  >
                    {itemContent}
                  </Link>
                ) : (
                  <div
                    key={idx}
                    style={{ borderBottom: idx < order.orderItems.length - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none', paddingBottom: idx < order.orderItems.length - 1 ? '1rem' : 0 }}
                  >
                    {itemContent}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Logistics Tracking */}
          <div className="glass" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', fontWeight: 700 }}>Status History</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'start' }}>
                <div style={{ color: 'var(--primary)', marginTop: '3px' }}><Calendar size={18} /></div>
                <div>
                  <h4 style={{ color: '#fff', fontWeight: 600 }}>Order Placed</h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.15rem' }}>
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', alignItems: 'start' }}>
                <div style={{ color: order.isPaid ? 'var(--success)' : 'var(--error)', marginTop: '3px' }}><CreditCard size={18} /></div>
                <div>
                  <h4 style={{ color: '#fff', fontWeight: 600 }}>Payment Info</h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.15rem' }}>
                    Method: {order.paymentMethod}
                  </p>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                    {order.isPaid ? `Paid on ${new Date(order.paidAt).toLocaleString()}` : 'Payment pending verification'}
                  </p>
                  {order.transactionId && (
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.15rem' }}>
                      Transaction: {order.transactionId}
                    </p>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', alignItems: 'start' }}>
                <div style={{ color: order.isDelivered ? 'var(--success)' : 'var(--warning)', marginTop: '3px' }}><Truck size={18} /></div>
                <div>
                  <h4 style={{ color: '#fff', fontWeight: 600 }}>Shipment Delivery</h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.15rem' }}>
                    Status: {order.orderStatus}
                  </p>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                    {order.isDelivered ? `Delivered on ${new Date(order.deliveredAt).toLocaleString()}` : 'Awaiting fulfillment'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right side widgets (Address and price summary) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Shipping Address info */}
          <div className="glass" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)', fontSize: '0.85rem' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', fontWeight: 700 }}>Shipping Address</h3>
            <p style={{ fontWeight: 600, color: '#fff', marginBottom: '0.25rem' }}>{order.shippingAddress.fullName}</p>
            <p style={{ color: 'var(--text-secondary)' }}>{order.shippingAddress.address}</p>
            <p style={{ color: 'var(--text-secondary)' }}>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.postalCode}</p>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Phone: {order.shippingAddress.phone}</p>
          </div>

          {/* Order Summary Pricing */}
          <div className="glass" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', fontWeight: 700 }}>Summary</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Items Subtotal</span>
                <span>{formatPrice(order.itemsPrice)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Shipping</span>
                <span>{formatPrice(order.shippingPrice)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Tax</span>
                <span>{formatPrice(order.taxPrice)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.05rem', fontWeight: 700, color: '#fff', borderTop: '1px solid var(--border)', paddingTop: '0.75rem', marginTop: '0.25rem' }}>
                <span>Total</span>
                <span>{formatPrice(order.totalPrice)}</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .fade-in, .fade-in * {
            visibility: visible;
          }
          .fade-in {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          button, a, nav, footer {
            display: none !important;
          }
        }
        @media (max-width: 768px) {
          .order-details-layout {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
