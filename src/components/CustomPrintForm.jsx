import React, { useState } from 'react';
import { Upload, Mail, CheckCircle } from 'lucide-react';
import './CustomPrintForm.css';

const CustomPrintForm = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    filament: 'PLA',
    infill: '20%',
    color: 'White',
    details: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.formAction = `mailto:admin@robonicsindia3d.com?subject=Custom Print Request from ${formData.name}&body=Filament: ${formData.filament}%0D%0AInfill: ${formData.infill}%0D%0AColor: ${formData.color}%0D%0ADetails: ${formData.details}`;
    setIsSubmitted(true);
    // In a real app, this would be an API call to a backend service like Formspree, SendGrid, or a custom node server.
    // For now, we are relying on mailto link behavior or just showing a success state.
  };

  if (isSubmitted) {
    return (
      <div className="success-message animate-fade-in">
        <CheckCircle size={64} className="success-icon" />
        <h3>Request Submitted!</h3>
        <p>We've received your requirements and will reach out via email shortly with a quote.</p>
        <button className="btn-primary mt-4" onClick={() => setIsSubmitted(false)}>Submit Another Request</button>
      </div>
    );
  }

  return (
    <form className="custom-print-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label>Personal Info</label>
        <div className="input-grid">
          <input required type="text" name="name" placeholder="Your Name" value={formData.name} onChange={handleChange} />
          <input required type="email" name="email" placeholder="Your Email" value={formData.email} onChange={handleChange} />
        </div>
      </div>

      <div className="form-group">
        <label>Print Specifications</label>
        <div className="input-grid">
          <select name="filament" value={formData.filament} onChange={handleChange}>
            <option value="PLA">PLA (Standard)</option>
            <option value="PETG">PETG (Durable)</option>
            <option value="ABS">ABS (Heat Resistant)</option>
            <option value="Resin">Resin (High Detail)</option>
          </select>
          
          <select name="infill" value={formData.infill} onChange={handleChange}>
            <option value="10%">10% (Display only)</option>
            <option value="20%">20% (Standard)</option>
            <option value="50%">50% (Strong)</option>
            <option value="100%">100% (Solid)</option>
          </select>
          
          <select name="color" value={formData.color} onChange={handleChange}>
            <option value="White">White</option>
            <option value="Black">Black</option>
            <option value="Grey">Grey</option>
            <option value="Blue">Blue</option>
            <option value="Custom">Custom (Specify in details)</option>
          </select>
        </div>
      </div>

      <div className="form-group upload-group">
        <label>Upload STL File</label>
        <div className="file-upload-wrapper">
          <input type="file" id="file" className="file-input" accept=".stl,.obj" />
          <div className="file-upload-ui">
            <Upload size={32} className="upload-icon" />
            <p>Drag & Drop your STL/OBJ file here or <span>browse</span></p>
          </div>
        </div>
      </div>

      <div className="form-group">
        <label>Additional Details</label>
        <textarea 
          name="details" 
          rows="4" 
          placeholder="Any specific requests for painting, smoothing, or scale adjustments?"
          value={formData.details}
          onChange={handleChange}
        ></textarea>
      </div>

      <button type="submit" className="btn-primary submit-btn">
        <Mail size={20} /> Request Quote
      </button>
    </form>
  );
};

export default CustomPrintForm;
