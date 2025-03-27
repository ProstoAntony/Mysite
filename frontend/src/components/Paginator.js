import React from 'react';
import PropTypes from 'prop-types';

const Paginator = ({ currentPage, totalPages, onPageChange }) => {
  return (
    <nav aria-label="Page navigation">
      <ul className="pagination justify-content-center">
        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
          <button 
            className="page-link" 
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </button>
        </li>
        
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
          <li 
            key={page} 
            className={`page-item ${page === currentPage ? 'active' : ''}`}
          >
            <button 
              className="page-link" 
              onClick={() => onPageChange(page)}
            >
              {page}
            </button>
          </li>
        ))}
        
        <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
          <button 
            className="page-link" 
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </li>
      </ul>
    </nav>
  );
};

Paginator.propTypes = {
  currentPage: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired
};

export default Paginator;