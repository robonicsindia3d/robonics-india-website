import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Menu, X, Heart, User } from 'lucide-react';
import { CartContext } from '../context/CartContext';
import { WishlistContext } from '../context/WishlistContext';
import { AuthContext } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { cartItems } = useContext(CartContext);
  const { wishlistItems } = useContext(WishlistContext);
  const { currentUser } = useContext(AuthContext);
  
  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`navbar ${isScrolled ? 'glass-nav scrolled' : ''}`}>
      <div className="container navbar-content">
        <Link to="/" className="navbar-logo">
          <img src="/Group 1.png" alt="RobonicsIndia 3D Logo" style={{ height: '40px', width: 'auto' }} onError={(e) => e.target.style.display='none'} />
          <span>RobonicsIndia 3D</span>
        </Link>

        <div className="navbar-links desktop-only">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/shop" className="nav-link">Shop Figures</Link>
          <Link to="/custom-print" className="nav-link">Custom Print</Link>
        </div>

        <div className="navbar-actions desktop-only">
          {currentUser?.role === 'admin' && (
            <Link to="/admin" className="cart-button" style={{ color: 'var(--primary-blue)', textDecoration: 'none' }}>
              <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>Admin</span>
            </Link>
          )}
          <Link to="/wishlist" className="cart-button">
            <Heart size={20} />
            {wishlistItems.length > 0 && <span className="cart-badge">{wishlistItems.length}</span>}
          </Link>
          <Link to={currentUser ? "/dashboard" : "/login"} className="cart-button">
            <User size={20} />
          </Link>
          <Link to="/cart" className="cart-button">
            <ShoppingCart size={20} />
            {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
          </Link>
        </div>

        <button 
          className="mobile-menu-button mobile-only"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="mobile-menu animate-fade-in">
          <Link to="/" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
          {currentUser?.role === 'admin' && (
            <Link to="/admin" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)} style={{ color: 'var(--primary-blue)' }}>Admin Panel</Link>
          )}
          <Link to="/shop" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>Shop Figures</Link>
          <Link to="/custom-print" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>Custom Print</Link>
          <Link to="/wishlist" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>Wishlist ({wishlistItems.length})</Link>
          <Link to={currentUser ? "/dashboard" : "/login"} className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>{currentUser ? 'My Profile' : 'Log In'}</Link>
          <Link to="/cart" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>Cart ({totalItems})</Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
