import React from 'react';

const ErrorMessage = ({ error, errorType, onRetry }) => {
  if (!error) return null;

  return (
    <div className="alert alert-warning text-center my-3">
      <i className="fas fa-exclamation-triangle"></i>
      <strong> Erro:</strong> {error}
      {onRetry && (
        <button className="btn btn-sm btn-primary ms-3" onClick={onRetry}>
          <i className="fas fa-redo-alt"></i> Tentar Novamente
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
