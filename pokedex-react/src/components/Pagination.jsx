import React from "react";

const Pagination = ({ onPrev, onNext, hasPrev, hasNext, isLoading, mode }) => {
  if (mode === "favorites") return null;

  return (
    <div className="d-flex justify-content-between my-3">
      <button className="btn btn-primary" onClick={onPrev} disabled={!hasPrev || isLoading}>
        <i className="fas fa-arrow-left"></i> Anterior
      </button>
      <button className="btn btn-primary" onClick={onNext} disabled={!hasNext || isLoading}>
        Próxima <i className="fas fa-arrow-right"></i>
      </button>
    </div>
  );
};

export default Pagination;
