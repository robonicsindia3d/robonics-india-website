const Contact = () => (
  <div className="page-transition container" style={{ paddingTop: '8rem', paddingBottom: '6rem', maxWidth: '800px' }}>
    <h1 style={{ marginBottom: '2rem' }}>Contact Us</h1>
    <div style={{ lineHeight: '1.8', color: 'var(--text-secondary)' }}>
      <p>If you have any questions, concerns, or custom inquiries, we would love to hear from you!</p>
      
      <div style={{ background: 'var(--bg-secondary)', padding: '2rem', borderRadius: 'var(--radius-lg)', marginTop: '2rem' }}>
        <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>Get in Touch</h3>
        <p><strong>Email:</strong> robonicsindia3d@gmail.com</p>
        <p><strong>Phone:</strong> +91 8595303401</p>
        <p><strong>Business Hours:</strong> Monday - Saturday, 10:00 AM - 6:00 PM IST</p>
      </div>

      <h3 style={{ color: 'var(--text-primary)', marginTop: '3rem', marginBottom: '1rem' }}>Operating Address</h3>
      <p>
        <strong>RobonicsIndia 3D</strong><br/>
        SCC Height, Rajnagar Extension,<br/>
        Ghaziabad, Uttar Pradesh, 201017<br/>
        India
      </p>
    </div>
  </div>
);

export default Contact;
