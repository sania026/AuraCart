import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { DollarSign, Users, Package, Tags, Clipboard, Plus, Trash2, Edit } from 'lucide-react';
import api from '../services/api';
import { formatPrice } from '../utils/currency';

export default function AdminDashboard() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const activeTab = queryParams.get('tab') || 'overview';

  // Stats State
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // Products CRUD State
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productData, setProductData] = useState({
    name: '',
    price: '',
    description: '',
    category: '',
    stock: '',
    sku: '',
    brand: '',
    images: '',
    isActive: true,
  });

  // Categories CRUD State
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryData, setCategoryData] = useState({ name: '', description: '' });

  // Coupons CRUD State
  const [coupons, setCoupons] = useState([]);
  const [loadingCoupons, setLoadingCoupons] = useState(false);
  const [showCouponForm, setShowCouponForm] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [couponData, setCouponData] = useState({
    code: '',
    discountType: 'percentage',
    discountValue: '',
    minOrderValue: 0,
    expiryDate: '',
    isActive: true,
    usageLimit: '',
  });

  // Orders CRUD State
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Image upload state
  const [uploadingImages, setUploadingImages] = useState(false);

  // Users Management State
  const [usersList, setUsersList] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    if (activeTab === 'products') {
      fetchProductsAndCategories();
    } else if (activeTab === 'categories') {
      fetchCategories();
    } else if (activeTab === 'coupons') {
      fetchCoupons();
    } else if (activeTab === 'orders') {
      fetchOrders();
    } else if (activeTab === 'users') {
      fetchUsers();
    }
  }, [activeTab]);

  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      const { data } = await api.get('/dashboard/admin');
      setStats(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchProductsAndCategories = async () => {
    setLoadingProducts(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        api.get('/search?limit=100'), // get bulk products
        api.get('/categories'),
      ]);
      setProducts(prodRes.data.products);
      setCategories(catRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingProducts(false);
    }
  };

  const fetchCategories = async () => {
    setLoadingCategories(true);
    try {
      const { data } = await api.get('/categories');
      setCategories(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingCategories(false);
    }
  };

  const fetchCoupons = async () => {
    setLoadingCoupons(true);
    try {
      const { data } = await api.get('/coupons');
      setCoupons(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingCoupons(false);
    }
  };

  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const { data } = await api.get('/orders');
      setOrders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingOrders(false);
    }
  };

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const { data } = await api.get('/users');
      setUsersList(data);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to fetch users');
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleToggleRole = async (userId) => {
    try {
      const { data } = await api.put(`/users/${userId}/role`);
      alert(data.message || 'Role updated successfully!');
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update role');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user account?')) return;
    try {
      const { data } = await api.delete(`/users/${userId}`);
      alert(data.message || 'User deleted successfully!');
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete user');
    }
  };

  // PRODUCT CRUD HANDLERS
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploadingImages(true);
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('images', file);
    });

    try {
      const { data } = await api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      const existing = productData.images
        ? productData.images.split(',').map((s) => s.trim()).filter(Boolean)
        : [];
      const updated = [...existing, ...data.urls].join(', ');
      setProductData({ ...productData, images: updated });
      alert('Images uploaded successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to upload images.');
    } finally {
      setUploadingImages(false);
    }
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    try {
      // Split images by comma into array if string
      const imgsArray = typeof productData.images === 'string'
        ? productData.images.split(',').map(s => s.trim()).filter(Boolean)
        : productData.images;

      const payload = {
        ...productData,
        price: Number(productData.price),
        stock: Number(productData.stock),
        images: imgsArray,
      };

      if (editingProduct) {
        await api.put(`/products/${editingProduct._id}`, payload);
        alert('Product updated successfully!');
      } else {
        await api.post('/products', payload);
        alert('Product created successfully!');
      }
      setShowProductForm(false);
      setEditingProduct(null);
      fetchProductsAndCategories();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save product.');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await api.delete(`/products/${id}`);
        fetchProductsAndCategories();
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete product.');
      }
    }
  };

  const handleEditProduct = (prod) => {
    setEditingProduct(prod);
    setProductData({
      name: prod.name,
      price: prod.price,
      description: prod.description || '',
      category: prod.category?._id || prod.category || '',
      stock: prod.stock,
      sku: prod.sku || '',
      brand: prod.brand || '',
      images: prod.images ? prod.images.join(', ') : '',
      isActive: prod.isActive,
    });
    setShowProductForm(true);
  };

  // CATEGORY CRUD HANDLERS
  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await api.put(`/categories/${editingCategory._id}`, categoryData);
        alert('Category updated!');
      } else {
        await api.post('/categories', categoryData);
        alert('Category created!');
      }
      setShowCategoryForm(false);
      setEditingCategory(null);
      setCategoryData({ name: '', description: '' });
      fetchCategories();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save category.');
    }
  };

  const handleDeleteCategory = async (id) => {
    if (window.confirm('Delete this category?')) {
      try {
        await api.delete(`/categories/${id}`);
        fetchCategories();
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete category.');
      }
    }
  };

  // COUPON CRUD HANDLERS
  const handleCouponSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...couponData,
        discountValue: Number(couponData.discountValue),
        minOrderValue: Number(couponData.minOrderValue),
        usageLimit: couponData.usageLimit ? Number(couponData.usageLimit) : null,
      };

      if (editingCoupon) {
        await api.put(`/coupons/${editingCoupon._id}`, payload);
        alert('Coupon updated!');
      } else {
        await api.post('/coupons', payload);
        alert('Coupon created!');
      }
      setShowCouponForm(false);
      setEditingCoupon(null);
      setCouponData({
        code: '',
        discountType: 'percentage',
        discountValue: '',
        minOrderValue: 0,
        expiryDate: '',
        isActive: true,
        usageLimit: '',
      });
      fetchCoupons();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save coupon.');
    }
  };

  const handleDeleteCoupon = async (id) => {
    if (window.confirm('Delete this coupon?')) {
      try {
        await api.delete(`/coupons/${id}`);
        fetchCoupons();
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete coupon.');
      }
    }
  };

  // ORDER STATUS HANDLERS
  const handleOrderStatusChange = async (orderId, newStatus) => {
    try {
      await api.put(`/orders/${orderId}/status`, { orderStatus: newStatus });
      alert('Order status updated!');
      if (activeTab === 'overview') {
        fetchStats();
      } else {
        fetchOrders();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update order status.');
    }
  };

  return (
    <div className="fade-in" style={{ width: '100%' }}>

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div>
          {loadingStats ? (
            <div className="spinner"></div>
          ) : stats ? (
            <div>
              {/* Stats Cards Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
                <div className="glass" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                  <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
                    <DollarSign size={24} />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Revenue</span>
                    <h3 style={{ fontSize: '1.5rem', margin: 0 }}>{formatPrice(stats.totalRevenue)}</h3>
                  </div>
                </div>

                <div className="glass" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                  <div style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
                    <Clipboard size={24} />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Orders</span>
                    <h3 style={{ fontSize: '1.5rem', margin: 0 }}>{stats.totalOrders}</h3>
                  </div>
                </div>

                <div className="glass" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                  <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
                    <Clipboard size={24} />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Pending Orders</span>
                    <h3 style={{ fontSize: '1.5rem', margin: 0 }}>{stats.pendingOrders || 0}</h3>
                  </div>
                </div>

                <div className="glass" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                  <div style={{ background: 'rgba(168, 85, 247, 0.1)', color: 'var(--secondary)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
                    <Package size={24} />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Products</span>
                    <h3 style={{ fontSize: '1.5rem', margin: 0 }}>{stats.totalProducts}</h3>
                  </div>
                </div>

                <div className="glass" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                  <div style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
                    <Tags size={24} />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Categories</span>
                    <h3 style={{ fontSize: '1.5rem', margin: 0 }}>{stats.totalCategories}</h3>
                  </div>
                </div>
              </div>

              {/* Sales & Orders Analytics Chart */}
              {stats.salesHistory && stats.salesHistory.length > 0 && (
                <div className="glass" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.5rem', marginBottom: '2.5rem' }}>
                  {/* Sales Trend Chart */}
                  <div>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: '#fff' }}>
                      Sales Trend (Last 7 Days)
                    </h3>
                    
                    <div style={{ position: 'relative', width: '100%', height: '180px' }}>
                      <svg viewBox="0 0 400 180" width="100%" height="100%" style={{ overflow: 'visible' }}>
                        <line x1="0" y1="30" x2="400" y2="30" stroke="rgba(255,255,255,0.05)" />
                        <line x1="0" y1="80" x2="400" y2="80" stroke="rgba(255,255,255,0.05)" />
                        <line x1="0" y1="130" x2="400" y2="130" stroke="rgba(255,255,255,0.05)" />
                        <line x1="0" y1="160" x2="400" y2="160" stroke="rgba(255,255,255,0.1)" />

                        {(() => {
                          const maxSales = Math.max(...stats.salesHistory.map(d => d.sales), 100);
                          const points = stats.salesHistory.map((d, i) => {
                            const x = (i * 400) / 6;
                            const y = 160 - (d.sales * 130) / maxSales;
                            return `${x},${y}`;
                          }).join(' ');

                          return (
                            <>
                              <polyline fill="none" stroke="var(--primary)" strokeWidth="3" points={points} />
                              {stats.salesHistory.map((d, i) => {
                                const x = (i * 400) / 6;
                                const y = 160 - (d.sales * 130) / maxSales;
                                return (
                                  <g key={i}>
                                    <circle cx={x} cy={y} r="4" fill="var(--primary)" />
                                    <text x={x} y={y - 8} fill="#fff" fontSize="8" textAnchor="middle">${d.sales.toFixed(0)}</text>
                                    <text x={x} y="175" fill="var(--text-secondary)" fontSize="8" textAnchor="middle">{d.date.substring(5)}</text>
                                  </g>
                                );
                              })}
                            </>
                          );
                        })()}
                      </svg>
                    </div>
                  </div>

                  {/* Orders Volume Chart */}
                  <div>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: '#fff' }}>
                      Order Volume (Last 7 Days)
                    </h3>
                    
                    <div style={{ position: 'relative', width: '100%', height: '180px' }}>
                      <svg viewBox="0 0 400 180" width="100%" height="100%" style={{ overflow: 'visible' }}>
                        <line x1="0" y1="30" x2="400" y2="30" stroke="rgba(255,255,255,0.05)" />
                        <line x1="0" y1="80" x2="400" y2="80" stroke="rgba(255,255,255,0.05)" />
                        <line x1="0" y1="130" x2="400" y2="130" stroke="rgba(255,255,255,0.05)" />
                        <line x1="0" y1="160" x2="400" y2="160" stroke="rgba(255,255,255,0.1)" />

                        {(() => {
                          const maxOrders = Math.max(...stats.salesHistory.map(d => d.orders), 5);
                          return stats.salesHistory.map((d, i) => {
                            const x = (i * 400) / 6 + 15;
                            const barHeight = (d.orders * 130) / maxOrders;
                            const y = 160 - barHeight;
                            return (
                              <g key={i}>
                                <rect x={x - 10} y={y} width="20" height={barHeight} fill="var(--secondary)" rx="2" />
                                <text x={x} y={y - 6} fill="#fff" fontSize="8" textAnchor="middle">{d.orders}</text>
                                <text x={x} y="175" fill="var(--text-secondary)" fontSize="8" textAnchor="middle">{d.date.substring(5)}</text>
                              </g>
                            );
                          });
                        })()}
                      </svg>
                    </div>
                  </div>
                </div>
              )}

              {/* Latest Orders List */}
              <div className="glass" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Recent Order Inflows</h3>
                {stats.latestOrders.length > 0 ? (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', textAlign: 'left' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                          <th style={{ padding: '0.75rem 1rem' }}>Order ID</th>
                          <th style={{ padding: '0.75rem 1rem' }}>User</th>
                          <th style={{ padding: '0.75rem 1rem' }}>Total Price</th>
                          <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                          <th style={{ padding: '0.75rem 1rem' }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.latestOrders.map((ord) => (
                          <tr key={ord._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                            <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>{ord._id}</td>
                            <td style={{ padding: '0.75rem 1rem' }}>{ord.user?.name || 'Guest'}</td>
                            <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>${ord.totalPrice?.toFixed(2)}</td>
                            <td style={{ padding: '0.75rem 1rem' }}>
                              <span className={`badge ${
                                ord.orderStatus === 'Delivered' ? 'badge-success' :
                                ord.orderStatus === 'Cancelled' ? 'badge-danger' : 'badge-warning'
                              }`}>
                                {ord.orderStatus}
                              </span>
                            </td>
                            <td style={{ padding: '0.75rem 1rem' }}>
                              <select
                                className="input-field"
                                value={ord.orderStatus}
                                onChange={(e) => handleOrderStatusChange(ord._id, e.target.value)}
                                style={{ width: '120px', padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                                disabled={ord.orderStatus === 'Delivered'}
                              >
                                <option value="Pending">Pending</option>
                                <option value="Processing">Processing</option>
                                <option value="Shipped">Shipped</option>
                                <option value="Delivered">Delivered</option>
                                <option value="Cancelled">Cancelled</option>
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p style={{ color: 'var(--text-secondary)' }}>No orders record found.</p>
                )}
              </div>
            </div>
          ) : (
            <p>Failed to load statistics.</p>
          )}
        </div>
      )}

      {/* PRODUCTS CRUD TAB */}
      {activeTab === 'products' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Catalog Manager</h2>
            {!showProductForm && (
              <button onClick={() => { setEditingProduct(null); setProductData({ name: '', price: '', description: '', category: '', stock: '', sku: '', brand: '', images: '', isActive: true }); setShowProductForm(true); }} className="btn btn-primary">
                <Plus size={16} /> Add Product
              </button>
            )}
          </div>

          {showProductForm && (
            <form onSubmit={handleProductSubmit} className="glass" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)', marginBottom: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <h3 style={{ fontSize: '1.25rem', color: '#fff' }}>{editingProduct ? 'Update Product Details' : 'Register New Product'}</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
                <div>
                  <label className="input-label">Product Name</label>
                  <input
                    type="text"
                    className="input-field"
                    value={productData.name}
                    onChange={(e) => setProductData({ ...productData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="input-label">Brand</label>
                  <input
                    type="text"
                    className="input-field"
                    value={productData.brand}
                    onChange={(e) => setProductData({ ...productData, brand: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.25rem' }}>
                <div>
                  <label className="input-label">Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="input-field"
                    value={productData.price}
                    onChange={(e) => setProductData({ ...productData, price: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="input-label">Stock Quantity</label>
                  <input
                    type="number"
                    className="input-field"
                    value={productData.stock}
                    onChange={(e) => setProductData({ ...productData, stock: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="input-label">SKU</label>
                  <input
                    type="text"
                    className="input-field"
                    value={productData.sku}
                    onChange={(e) => setProductData({ ...productData, sku: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
                <div>
                  <label className="input-label">Category</label>
                  <select
                    className="input-field"
                    value={productData.category}
                    onChange={(e) => setProductData({ ...productData, category: e.target.value })}
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="input-label">Status</label>
                  <select
                    className="input-field"
                    value={productData.isActive}
                    onChange={(e) => setProductData({ ...productData, isActive: e.target.value === 'true' })}
                  >
                    <option value="true">Active (Visible)</option>
                    <option value="false">Inactive (Hidden)</option>
                  </select>
                </div>
              </div>

               <div>
                <label className="input-label">Product Images</label>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
                  <input
                    type="text"
                    placeholder="e.g. url1, url2"
                    className="input-field"
                    value={productData.images}
                    onChange={(e) => setProductData({ ...productData, images: e.target.value })}
                    style={{ flex: 1 }}
                  />
                  <div style={{ position: 'relative' }}>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploadingImages}
                      style={{ display: 'none' }}
                      id="upload-images-input"
                    />
                    <label
                      htmlFor="upload-images-input"
                      className="btn btn-outline"
                      style={{ padding: '0.625rem 1rem', cursor: uploadingImages ? 'not-allowed' : 'pointer', display: 'inline-flex', whiteSpace: 'nowrap' }}
                    >
                      {uploadingImages ? 'Uploading...' : 'Upload Files'}
                    </label>
                  </div>
                </div>

                {/* Previews with delete buttons */}
                {productData.images && (
                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                    {productData.images.split(',').map(s => s.trim()).filter(Boolean).map((url, index) => (
                      <div key={index} style={{ position: 'relative', width: '64px', height: '64px', borderRadius: 'var(--radius-sm)', overflow: 'hidden', border: '1px solid var(--border)' }}>
                        <img src={url} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <button
                          type="button"
                          onClick={() => {
                            const list = productData.images.split(',').map(s => s.trim()).filter(Boolean);
                            const filtered = list.filter((_, i) => i !== index);
                            setProductData({ ...productData, images: filtered.join(', ') });
                          }}
                          style={{ position: 'absolute', top: '2px', right: '2px', background: 'rgba(239, 68, 68, 0.85)', border: 'none', borderRadius: '50%', width: '18px', height: '18px', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', cursor: 'pointer', padding: 0 }}
                          title="Delete image"
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="input-label">Product Description</label>
                <textarea
                  rows={3}
                  className="input-field"
                  value={productData.description}
                  onChange={(e) => setProductData({ ...productData, description: e.target.value })}
                ></textarea>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="submit" className="btn btn-primary">Save Product</button>
                <button type="button" onClick={() => setShowProductForm(false)} className="btn btn-outline">Cancel</button>
              </div>
            </form>
          )}

          {loadingProducts ? (
            <div className="spinner"></div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left', color: 'var(--text-secondary)' }}>
                    <th style={{ padding: '0.75rem 1rem' }}>Name</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Brand</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Price</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Stock</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: 500, color: '#fff' }}>{p.name}</td>
                      <td style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)' }}>{p.brand || 'Aura'}</td>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>{formatPrice(p.price)}</td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span>{p.stock}</span>
                          {p.stock === 0 ? (
                            <span className="badge badge-danger" style={{ fontSize: '0.7rem', padding: '0.125rem 0.375rem' }}>Out of Stock</span>
                          ) : p.stock < 5 ? (
                            <span className="badge badge-warning" style={{ fontSize: '0.7rem', padding: '0.125rem 0.375rem' }}>Low Stock</span>
                          ) : null}
                        </div>
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <span className={`badge ${p.isActive ? 'badge-success' : 'badge-danger'}`}>
                          {p.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem 1rem', display: 'flex', gap: '0.5rem' }}>
                        <button onClick={() => handleEditProduct(p)} className="btn btn-outline" style={{ padding: '0.375rem', color: 'var(--primary)' }} title="Edit">
                          <Edit size={14} />
                        </button>
                        <button onClick={() => handleDeleteProduct(p._id)} className="btn btn-outline" style={{ padding: '0.375rem', color: 'var(--error)' }} title="Delete">
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* CATEGORIES CRUD TAB */}
      {activeTab === 'categories' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Category Manager</h2>
            {!showCategoryForm && (
              <button onClick={() => { setEditingCategory(null); setCategoryData({ name: '', description: '' }); setShowCategoryForm(true); }} className="btn btn-primary">
                <Plus size={16} /> Add Category
              </button>
            )}
          </div>

          {showCategoryForm && (
            <form onSubmit={handleCategorySubmit} className="glass" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)', marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '500px' }}>
              <h3>{editingCategory ? 'Update Category' : 'Register Category'}</h3>
              <div>
                <label className="input-label">Category Name</label>
                <input
                  type="text"
                  className="input-field"
                  value={categoryData.name}
                  onChange={(e) => setCategoryData({ ...categoryData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="input-label">Description</label>
                <input
                  type="text"
                  className="input-field"
                  value={categoryData.description}
                  onChange={(e) => setCategoryData({ ...categoryData, description: e.target.value })}
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="submit" className="btn btn-primary">Save</button>
                <button type="button" onClick={() => setShowCategoryForm(false)} className="btn btn-outline">Cancel</button>
              </div>
            </form>
          )}

          {loadingCategories ? (
            <div className="spinner"></div>
          ) : (
            <div style={{ overflowX: 'auto', maxWidth: '720px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left', color: 'var(--text-secondary)' }}>
                    <th style={{ padding: '0.75rem 1rem' }}>Name</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Description</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((c) => (
                    <tr key={c._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#fff' }}>{c.name}</td>
                      <td style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)' }}>{c.description || 'N/A'}</td>
                      <td style={{ padding: '0.75rem 1rem', display: 'flex', gap: '0.5rem' }}>
                        <button onClick={() => { setEditingCategory(c); setCategoryData({ name: c.name, description: c.description || '' }); setShowCategoryForm(true); }} className="btn btn-outline" style={{ padding: '0.375rem', color: 'var(--primary)' }}>
                          <Edit size={14} />
                        </button>
                        <button onClick={() => handleDeleteCategory(c._id)} className="btn btn-outline" style={{ padding: '0.375rem', color: 'var(--error)' }}>
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* COUPONS CRUD TAB */}
      {activeTab === 'coupons' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Coupon Manager</h2>
            {!showCouponForm && (
              <button onClick={() => { setEditingCoupon(null); setCouponData({ code: '', discountType: 'percentage', discountValue: '', minOrderValue: 0, expiryDate: '', isActive: true, usageLimit: '' }); setShowCouponForm(true); }} className="btn btn-primary">
                <Plus size={16} /> Create Coupon
              </button>
            )}
          </div>

          {showCouponForm && (
            <form onSubmit={handleCouponSubmit} className="glass" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)', marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '600px' }}>
              <h3>{editingCoupon ? 'Update Coupon' : 'Create New Coupon'}</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="input-label">Coupon Code (Uppercase)</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. OFF50"
                    value={couponData.code}
                    onChange={(e) => setCouponData({ ...couponData, code: e.target.value.toUpperCase() })}
                    required
                    disabled={!!editingCoupon}
                  />
                </div>
                <div>
                  <label className="input-label">Discount Type</label>
                  <select
                    className="input-field"
                    value={couponData.discountType}
                    onChange={(e) => setCouponData({ ...couponData, discountType: e.target.value })}
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="input-label">Discount Value</label>
                  <input
                    type="number"
                    className="input-field"
                    value={couponData.discountValue}
                    onChange={(e) => setCouponData({ ...couponData, discountValue: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="input-label">Min Order Value Required (₹)</label>
                  <input
                    type="number"
                    className="input-field"
                    value={couponData.minOrderValue}
                    onChange={(e) => setCouponData({ ...couponData, minOrderValue: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="input-label">Expiry Date</label>
                  <input
                    type="date"
                    className="input-field"
                    value={couponData.expiryDate ? couponData.expiryDate.split('T')[0] : ''}
                    onChange={(e) => setCouponData({ ...couponData, expiryDate: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="input-label">Usage Limit (leave empty if unlimited)</label>
                  <input
                    type="number"
                    className="input-field"
                    value={couponData.usageLimit}
                    onChange={(e) => setCouponData({ ...couponData, usageLimit: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="input-label">Status</label>
                <select
                  className="input-field"
                  value={couponData.isActive}
                  onChange={(e) => setCouponData({ ...couponData, isActive: e.target.value === 'true' })}
                  style={{ width: '150px' }}
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="submit" className="btn btn-primary">Save Coupon</button>
                <button type="button" onClick={() => setShowCouponForm(false)} className="btn btn-outline">Cancel</button>
              </div>
            </form>
          )}

          {loadingCoupons ? (
            <div className="spinner"></div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left', color: 'var(--text-secondary)' }}>
                    <th style={{ padding: '0.75rem 1rem' }}>Code</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Discount</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Min Order</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Expiry</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Usage Limit</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {coupons.map((cop) => (
                    <tr key={cop._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: '#fff' }}>{cop.code}</td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        {cop.discountType === 'percentage' ? `${cop.discountValue}%` : formatPrice(cop.discountValue)}
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>{formatPrice(cop.minOrderValue)}</td>
                      <td style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)' }}>{new Date(cop.expiryDate).toLocaleDateString()}</td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        {cop.usageLimit === null ? 'Unlimited' : `${cop.usageCount}/${cop.usageLimit}`}
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <span className={`badge ${cop.isActive ? 'badge-success' : 'badge-danger'}`}>
                          {cop.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem 1rem', display: 'flex', gap: '0.5rem' }}>
                        <button onClick={() => { setEditingCoupon(cop); setCouponData({ code: cop.code, discountType: cop.discountType, discountValue: cop.discountValue, minOrderValue: cop.minOrderValue, expiryDate: cop.expiryDate, isActive: cop.isActive, usageLimit: cop.usageLimit || '' }); setShowCouponForm(true); }} className="btn btn-outline" style={{ padding: '0.375rem', color: 'var(--primary)' }}>
                          <Edit size={14} />
                        </button>
                        <button onClick={() => handleDeleteCoupon(cop._id)} className="btn btn-outline" style={{ padding: '0.375rem', color: 'var(--error)' }}>
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ORDERS TAB */}
      {activeTab === 'orders' && (
        <div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>All Customer Orders</h2>
          {loadingOrders ? (
            <div className="spinner"></div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                    <th style={{ padding: '0.75rem 1rem' }}>Order ID</th>
                    <th style={{ padding: '0.75rem 1rem' }}>User Name</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Total Price</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Payment Status</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Order Status</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Update Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((ord) => (
                    <tr key={ord._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>{ord._id}</td>
                      <td style={{ padding: '0.75rem 1rem' }}>{ord.user?.name || 'Guest'}</td>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>{formatPrice(ord.totalPrice)}</td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <span className={`badge ${ord.isPaid ? 'badge-success' : 'badge-danger'}`}>
                          {ord.isPaid ? 'Paid' : 'Unpaid'}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <span className={`badge ${
                          ord.orderStatus === 'Delivered' ? 'badge-success' :
                          ord.orderStatus === 'Cancelled' ? 'badge-danger' : 'badge-warning'
                        }`}>
                          {ord.orderStatus}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <select
                          className="input-field"
                          value={ord.orderStatus}
                          onChange={(e) => handleOrderStatusChange(ord._id, e.target.value)}
                          style={{ width: '130px', padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                          disabled={ord.orderStatus === 'Delivered'}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Processing">Processing</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* USERS TAB */}
      {activeTab === 'users' && (
        <div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>User Accounts</h2>
          {loadingUsers ? (
            <div className="spinner"></div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                    <th style={{ padding: '0.75rem 1rem' }}>Name</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Email</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Verified</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Role</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Created At</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {usersList.map((usr) => (
                    <tr key={usr._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#fff' }}>{usr.name}</td>
                      <td style={{ padding: '0.75rem 1rem' }}>{usr.email}</td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <span className={`badge ${usr.isVerified ? 'badge-success' : 'badge-danger'}`}>
                          {usr.isVerified ? 'Verified' : 'Unverified'}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <span className={`badge ${usr.role === 'admin' ? 'badge-info' : 'badge-outline'}`}>
                          {usr.role}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)' }}>
                        {new Date(usr.createdAt).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => handleToggleRole(usr._id)}
                          className="btn btn-outline"
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', color: 'var(--primary)' }}
                          title="Toggle Role"
                        >
                          Change Role
                        </button>
                        <button
                          onClick={() => handleDeleteUser(usr._id)}
                          className="btn btn-outline"
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', color: 'var(--error)' }}
                          title="Delete Account"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* REPORTS TAB */}
      {activeTab === 'reports' && (
        <div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Analytical Reports</h2>
          {loadingStats ? (
            <div className="spinner"></div>
          ) : stats ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
              <div className="glass" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--primary)' }}>Sales Performance</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                  Total aggregate revenue: <strong style={{ color: '#fff' }}>{formatPrice(stats.totalRevenue)}</strong>
                </p>
                <div style={{ height: '200px', display: 'flex', alignItems: 'flex-end', gap: '0.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                  {stats.salesHistory?.map((day, idx) => {
                    const maxSales = Math.max(...stats.salesHistory.map(d => d.sales), 1);
                    const pct = (day.sales / maxSales) * 100;
                    return (
                      <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
                        <div style={{ background: 'var(--primary)', width: '100%', height: `${Math.max(pct, 5)}%`, minHeight: '4px', borderRadius: '2px 2px 0 0', opacity: 0.8 }} title={`₹${day.sales}`} />
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', transform: 'rotate(-45deg)', whiteSpace: 'nowrap', marginTop: '0.5rem' }}>{day.date.split('-')[2]}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="glass" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--secondary)' }}>Order Volume Metrics</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                  Total orders submitted: <strong style={{ color: '#fff' }}>{stats.totalOrders}</strong>
                </p>
                <div style={{ height: '200px', display: 'flex', alignItems: 'flex-end', gap: '0.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                  {stats.salesHistory?.map((day, idx) => {
                    const maxOrders = Math.max(...stats.salesHistory.map(d => d.orders), 1);
                    const pct = (day.orders / maxOrders) * 100;
                    return (
                      <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
                        <div style={{ background: 'var(--secondary)', width: '100%', height: `${Math.max(pct, 5)}%`, minHeight: '4px', borderRadius: '2px 2px 0 0', opacity: 0.8 }} title={`${day.orders} orders`} />
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', transform: 'rotate(-45deg)', whiteSpace: 'nowrap', marginTop: '0.5rem' }}>{day.date.split('-')[2]}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <p>Failed to aggregate reports data.</p>
          )}
        </div>
      )}

      {/* SETTINGS TAB */}
      {activeTab === 'settings' && (
        <div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>System Settings</h2>
          <div className="glass" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)', maxWidth: '600px' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem' }}>System Properties</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label className="input-label">Admin Control Email</label>
                <input type="text" className="input-field" value="admin@auracart.com" disabled />
              </div>
              <div>
                <label className="input-label">Role Access Control</label>
                <input type="text" className="input-field" value="System Administrator (Single Account Mode)" disabled />
              </div>
              <div>
                <label className="input-label">Environment Mode</label>
                <input type="text" className="input-field" value="Production Hardened" disabled />
              </div>
              <div>
                <label className="input-label">Currency Base</label>
                <input type="text" className="input-field" value="Indian Rupee (INR - ₹)" disabled />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
