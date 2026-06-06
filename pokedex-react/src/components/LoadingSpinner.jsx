import React from 'react';

const LoadingSpinner = ({ show, message = "Carregando..." }) => {
  if (!show) return null;

  return (
    <div className="text-center my-4">
      <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
        <span className="visually-hidden">Carregando...</span>
      </div>
      <p className="mt-2">{message}</p>
    </div>
  );
};

export default LoadingSpinner;
