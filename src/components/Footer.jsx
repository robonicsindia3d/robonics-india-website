import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, MessageCircle, Globe } from 'lucide-react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container footer-content">
        <div className="footer-brand">
          <Link to="/" className="footer-logo">
            <img src="/Group 1.png" alt="RobonicsIndia 3D Logo" style={{ height: '40px', width: 'auto' }} onError={(e) => e.target.style.display='none'} />
            <span>RobonicsIndia 3D</span>
          </Link>
          <p className="footer-description">
            Bringing your favorite anime characters to life with premium 3D printing technology and hand-finished details.
          </p>
          <div className="social-links">
            <a href="#" className="social-link"><Globe size={20} /></a>
            <a href="#" className="social-link"><MessageCircle size={20} /></a>
            <a href="#" className="social-link"><Mail size={20} /></a>
          </div>
        </div>

        <div className="footer-links-group">
          <h3>Quick Links</h3>
          <Link to="/">Home</Link>
          <Link to="/shop">Shop Figures</Link>
          <Link to="/custom-print">Custom Printing</Link>
          <Link to="/contact">Contact Us</Link>
        </div>

        <div className="footer-links-group">
          <h3>Support & Legal</h3>
          <Link to="/shipping-policy">Shipping Policy</Link>
          <Link to="/refund-policy">Cancellation & Refunds</Link>
          <Link to="/privacy-policy">Privacy Policy</Link>
          <Link to="/terms-conditions">Terms & Conditions</Link>
        </div>

        <div className="footer-newsletter">
          <h3>Newsletter</h3>
          <p>Subscribe for updates on new figures and exclusive discounts.</p>
          <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
            <input type="email" placeholder="Your email address" required />
            <button type="submit" className="btn-primary">Subscribe</button>
          </form>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} RobonicsIndia 3D. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
