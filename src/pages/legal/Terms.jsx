import React from 'react';

const Terms = () => (
  <div className="page-transition container" style={{ paddingTop: '8rem', paddingBottom: '6rem', maxWidth: '800px' }}>
    <h1 style={{ marginBottom: '2rem' }}>Terms & Conditions</h1>
    <div style={{ lineHeight: '1.8', color: 'var(--text-secondary)' }}>
      <p>Welcome to RoboPrint 3D. By accessing our website, you agree to these Terms and Conditions.</p>
      
      <h3 style={{ color: 'var(--text-primary)', marginTop: '2rem', marginBottom: '1rem' }}>1. Custom Prints & Compliance</h3>
      <p>All custom 3D printing orders are final once production begins. We reserve the right to refuse printing any copyrighted material or inappropriate content. 
      <strong>Strict Compliance Policy:</strong> We do NOT manufacture or print weapons, functional firearm components, drone/quadcopter/UAV frames or parts, aerospace components, or any regulated industrial or military equipment. Our custom printing service is strictly limited to artistic, educational, novelty figurines, cosplay props, and decorative items. Any submitted models matching prohibited categories will be automatically cancelled and refunded.</p>

      <h3 style={{ color: 'var(--text-primary)', marginTop: '2rem', marginBottom: '1rem' }}>2. Pricing & Payments</h3>
      <p>All prices are listed in INR. We use Razorpay for secure payments. Cash on Delivery is available at our discretion.</p>

      <h3 style={{ color: 'var(--text-primary)', marginTop: '2rem', marginBottom: '1rem' }}>3. Product Variations</h3>
      <p>Because 3D printing is a manufacturing process, minor variations, layer lines, or support marks may be present. These are not considered defects.</p>
    </div>
  </div>
);

export default Terms;
