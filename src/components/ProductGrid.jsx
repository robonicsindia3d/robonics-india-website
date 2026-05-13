import React, { useState } from 'react';
import ProductCard from './ProductCard';
import './ProductGrid.css';

const ProductGrid = ({ products = [], limit }) => {
  const [displayCount, setDisplayCount] = useState(limit || 24);
  
  const displayProducts = limit ? products.slice(0, limit) : products.slice(0, displayCount);

  const handleLoadMore = () => {
    setDisplayCount(prev => prev + 24);
  };

  return (
    <section className="product-section">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Featured Figures</h2>
          <p className="section-subtitle">Discover our most popular 3D printed models</p>
        </div>
        
        <div className="product-grid">
          {displayProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {!limit && displayCount < products.length && (
          <div className="load-more-container">
            <button className="btn-secondary btn-large" onClick={handleLoadMore}>
              Load More
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductGrid;
