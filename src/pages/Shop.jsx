import { useState, useEffect, useMemo } from 'react';
import ProductGrid from '../components/ProductGrid';
import SEO from '../components/SEO';
import './Shop.css';

const Shop = () => {
  const [productsData, setProductsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL || '';
    fetch(`${apiUrl}/api/products`)
      .then(res => res.json())
      .then(data => {
        if (data.success) setProductsData(data.products);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch products", err);
        setLoading(false);
      });
  }, []);

  // Extract unique categories
  const categories = useMemo(() => {
    const cats = new Set(productsData.map(p => p.category));
    return ['All', ...Array.from(cats)].sort();
  }, [productsData]);

  const filteredProducts = useMemo(() => {
    if (selectedCategory === 'All') return productsData;
    return productsData.filter(p => p.category === selectedCategory);
  }, [selectedCategory, productsData]);

  return (
    <div className="page-transition animate-fade-in shop-page page-container">
      <SEO 
        title="Shop 3D Anime Figures" 
        description="Browse our extensive catalog of high-quality 3D printed anime figures. Filter by your favorite anime series like Naruto, One Piece, DBZ, and more." 
        url="/shop" 
      />
      <div className="container">
        <h1 className="page-title">All Figures</h1>
        <p className="page-subtitle">
          Browse our entire collection of premium 3D printed anime figures.
        </p>
      </div>
      
      <div className="container shop-layout">
        <aside className="shop-sidebar">
          <h3>Categories</h3>
          <ul className="category-list">
            {categories.map(category => (
              <li key={category}>
                <button 
                  className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </button>
              </li>
            ))}
          </ul>
        </aside>
        
        <main className="shop-main">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem 0' }}><p>Loading products...</p></div>
          ) : (
            <ProductGrid products={filteredProducts} />
          )}
        </main>
      </div>
    </div>
  );
};

export default Shop;
