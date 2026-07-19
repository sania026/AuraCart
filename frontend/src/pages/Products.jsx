import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Filter, SlidersHorizontal, Search, Star } from 'lucide-react';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import { formatPrice } from '../utils/currency';

export default function Products() {
  const location = useLocation();
  const navigate = useNavigate();

  const queryParams = new URLSearchParams(location.search);
  const initialCategory = queryParams.get('category') || '';
  const initialSearch = queryParams.get('search') || '';

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);

  // Filter States
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [searchKeyword, setSearchKeyword] = useState(initialSearch);
  const [debouncedSearchKeyword, setDebouncedSearchKeyword] = useState(initialSearch);
  const [sortOption, setSortOption] = useState('latest');
  const [priceMax, setPriceMax] = useState(250000);
  
  const initialBrand = queryParams.get('brand') ? queryParams.get('brand').split(',') : [];
  const [selectedBrands, setSelectedBrands] = useState(initialBrand);
  
  const [minRating, setMinRating] = useState(0);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Sync state with URL parameter triggers
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setSelectedCategory(params.get('category') || '');
    setSearchKeyword(params.get('search') || '');
    const brandParam = params.get('brand');
    setSelectedBrands(brandParam ? brandParam.split(',') : []);
    setCurrentPage(1);
  }, [location.search]);

  // Debounce search keyword updates (300ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchKeyword(searchKeyword);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchKeyword]);

  // Fetch categories list
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await api.get('/categories');
        setCategories(data);
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };
    fetchCategories();
  }, []);

  // Fetch catalog listing dynamically
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = {
          page: currentPage,
          limit: 9,
          sort: sortOption,
        };

        if (selectedCategory) params.category = selectedCategory;
        if (debouncedSearchKeyword) params.keyword = debouncedSearchKeyword;
        if (priceMax) params.priceMax = priceMax;
        if (selectedBrands.length > 0) params.brand = selectedBrands.join(',');
        if (minRating) params.ratingMin = minRating;
        if (inStockOnly) params.inStockOnly = true;

        const { data } = await api.get('/search', { params });
        setProducts(data.products);
        setTotalPages(data.pages);
        setTotalProducts(data.total);
      } catch (err) {
        console.error('Error fetching catalog data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [selectedCategory, debouncedSearchKeyword, sortOption, priceMax, selectedBrands, minRating, inStockOnly, currentPage]);

  const handleResetFilters = () => {
    setSelectedCategory('');
    setSearchKeyword('');
    setPriceMax(3000);
    setSelectedBrands([]);
    setMinRating(0);
    setInStockOnly(false);
    setSortOption('latest');
    setCurrentPage(1);
    navigate('/products');
  };

  return (
    <div className="container fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem', fontWeight: 800 }}>Product Catalog</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Showing {products.length} of {totalProducts} premium products
          </p>
        </div>
        
        {/* Sorting Dropdown */}
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <label style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Sort By:</label>
          <select
            className="input-field"
            value={sortOption}
            onChange={(e) => { setSortOption(e.target.value); setCurrentPage(1); }}
            style={{ width: '180px', padding: '0.375rem 0.75rem', cursor: 'pointer' }}
          >
            <option value="latest">Newest Arrivals</option>
            <option value="priceAsc">Price: Low to High</option>
            <option value="priceDesc">Price: High to Low</option>
            <option value="highestRated">Highest Rated</option>
            <option value="mostPopular">Most Popular</option>
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '2.5rem' }} className="catalog-layout">
        
        {/* Filter Sidebar Panel */}
        <aside className="glass" style={{ borderRadius: 'var(--radius-lg)', padding: '1.5rem', height: 'fit-content', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
            <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}>
              <Filter size={18} /> Filters
            </h3>
            <button onClick={handleResetFilters} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>
              Reset All
            </button>
          </div>

          {/* Keyword Search */}
          <div>
            <label className="input-label" style={{ fontWeight: 600 }}>Search Keyword</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="input-field"
                placeholder="Type to search..."
                value={searchKeyword}
                onChange={(e) => { setSearchKeyword(e.target.value); setCurrentPage(1); }}
                style={{ paddingRight: '2rem' }}
              />
              <Search size={16} style={{ position: 'absolute', right: '10px', top: '12px', color: 'var(--text-muted)' }} />
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <label className="input-label" style={{ marginBottom: '0.75rem', fontWeight: 600 }}>Categories</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <button
                onClick={() => { setSelectedCategory(''); setCurrentPage(1); }}
                style={{
                  textAlign: 'left',
                  background: 'none',
                  border: 'none',
                  color: selectedCategory === '' ? 'var(--primary)' : 'var(--text-secondary)',
                  fontWeight: selectedCategory === '' ? 600 : 400,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  padding: '0.25rem 0',
                }}
              >
                All Categories
              </button>
              {categories.map((cat) => (
                <button
                  key={cat._id}
                  onClick={() => { setSelectedCategory(cat._id); setCurrentPage(1); }}
                  style={{
                    textAlign: 'left',
                    background: 'none',
                    border: 'none',
                    color: selectedCategory === cat._id ? 'var(--primary)' : 'var(--text-secondary)',
                    fontWeight: selectedCategory === cat._id ? 600 : 400,
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    padding: '0.25rem 0',
                  }}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Slider */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <label className="input-label" style={{ fontWeight: 600, margin: 0 }}>Max Price</label>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary)' }}>{formatPrice(priceMax)}</span>
            </div>
            <input
              type="range"
              min="0"
              max="250000"
              step="5000"
              value={priceMax}
              onChange={(e) => { setPriceMax(Number(e.target.value)); setCurrentPage(1); }}
              style={{ width: '100%', cursor: 'pointer', accentColor: 'var(--primary)' }}
            />
          </div>

          {/* Brand Filter */}
          <div>
            <label className="input-label" style={{ marginBottom: '0.75rem', fontWeight: 600 }}>Brands</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {['Apple', 'Samsung', 'Sony', 'Logitech', 'Google', 'OnePlus', 'Dell', 'HP', 'Canon', 'Nintendo', 'LG', 'Dyson', 'Philips'].map((brand) => (
                <label key={brand} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={selectedBrands.includes(brand)}
                    onChange={(e) => {
                      const updated = e.target.checked
                        ? [...selectedBrands, brand]
                        : selectedBrands.filter((b) => b !== brand);
                      setSelectedBrands(updated);
                      setCurrentPage(1);
                    }}
                    style={{ accentColor: 'var(--primary)' }}
                  />
                  <span>{brand}</span>
                </label>
              ))}
              {selectedBrands.length > 0 && (
                <button
                  onClick={() => { setSelectedBrands([]); setCurrentPage(1); }}
                  style={{ background: 'none', border: 'none', color: 'var(--error)', fontSize: '0.75rem', textAlign: 'left', cursor: 'pointer', marginTop: '0.25rem' }}
                >
                  Clear Brand Selection
                </button>
              )}
            </div>
          </div>

          {/* Rating Filter */}
          <div>
            <label className="input-label" style={{ marginBottom: '0.75rem', fontWeight: 600 }}>Minimum Rating</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {[4, 3, 2].map((stars) => (
                <label key={stars} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="ratingGroup"
                    checked={minRating === stars}
                    onChange={() => { setMinRating(stars); setCurrentPage(1); }}
                    style={{ accentColor: 'var(--primary)' }}
                  />
                  <span>{stars} ★ & Above</span>
                </label>
              ))}
              {minRating > 0 && (
                <button
                  onClick={() => { setMinRating(0); setCurrentPage(1); }}
                  style={{ background: 'none', border: 'none', color: 'var(--error)', fontSize: '0.75rem', textAlign: 'left', cursor: 'pointer', marginTop: '0.25rem' }}
                >
                  Clear Rating Selection
                </button>
              )}
            </div>
          </div>

          {/* Availability Toggle */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-primary)', cursor: 'pointer', fontWeight: 600 }}>
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => { setInStockOnly(e.target.checked); setCurrentPage(1); }}
                style={{ accentColor: 'var(--primary)' }}
              />
              <span>In Stock Only</span>
            </label>
          </div>
        </aside>

        {/* Catalog Listing */}
        <div>
          {loading ? (
            <div className="grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="card-skeleton" style={{ height: '340px', borderRadius: 'var(--radius-lg)' }}></div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '2rem' }}>
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="btn btn-outline"
                    style={{ padding: '0.5rem 1rem' }}
                  >
                    Previous
                  </button>
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`btn ${currentPage === i + 1 ? 'btn-primary' : 'btn-outline'}`}
                      style={{ padding: '0.5rem 1rem', minWidth: '40px' }}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="btn btn-outline"
                    style={{ padding: '0.5rem 1rem' }}
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="glass" style={{ padding: '4rem 2rem', textAlign: 'center', borderRadius: 'var(--radius-lg)' }}>
              <SlidersHorizontal size={40} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
              <h3>No products found</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.5rem', marginBottom: '1.5rem' }}>
                Try adjusting your search filters or resetting to default.
              </p>
              <button onClick={handleResetFilters} className="btn btn-primary">
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .card-skeleton {
          background: linear-gradient(90deg, rgba(255,255,255,0.02) 25%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0.02) 75%);
          background-size: 200% 100%;
          animation: pulse-skeleton 1.5s infinite;
        }
        @keyframes pulse-skeleton {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @media (max-width: 768px) {
          .catalog-layout {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
