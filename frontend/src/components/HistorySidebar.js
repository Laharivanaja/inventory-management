import React, { useState, useEffect } from 'react';
import { productAPI } from '../services/api';
import './HistorySidebar.css';

const HistorySidebar = ({ product, onClose }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, [product.id]);

  const loadHistory = async () => {
    try {
      const response = await productAPI.getHistory(product.id);
      setHistory(response.data.history);
    } catch (error) {
      console.error('Load history error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <>
      <div className="sidebar-overlay" onClick={onClose}></div>
      <div className="history-sidebar">
        <div className="sidebar-header">
          <div>
            <h3>Inventory History</h3>
            <p className="product-name">{product.name}</p>
          </div>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="sidebar-content">
          {loading ? (
            <div className="loading">Loading history...</div>
          ) : history.length === 0 ? (
            <div className="empty-history">
              <p>📊 No history available</p>
              <p className="empty-subtitle">Changes will appear here when stock is updated</p>
            </div>
          ) : (
            <div className="history-list">
              {history.map((entry) => (
                <div key={entry.id} className="history-item">
                  <div className="history-header">
                    <span className="history-date">{formatDate(entry.change_date)}</span>
                  </div>
                  <div className="history-details">
                    <div className="quantity-change">
                      <span className="old-quantity">{entry.old_quantity}</span>
                      <span className="arrow">→</span>
                      <span className="new-quantity">{entry.new_quantity}</span>
                    </div>
                    <div className="change-info">
                      <span className="change-label">Changed by:</span>
                      <span className="changed-by">{entry.changed_by || 'System'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default HistorySidebar;
