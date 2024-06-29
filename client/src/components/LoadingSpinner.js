import React from 'react';
import './LoadingSpinner.css';

function LoadingSpinner({ message }) {
  return (
    <div className="loading-spinner">
      <div className="spinner"></div>
      <p>{message}</p>
    </div>
  );
}

export default LoadingSpinner;
