import React from 'react';

const AlertsTab = ({ lowStockAlerts }) => {
  return (
    <div className="tab-content">
      {lowStockAlerts.length === 0 ? (
        <div className="empty-state success-state">
          <div className="empty-icon">✓</div>
          <div>All items are fully stocked!</div>
        </div>
      ) : (
        <div className="alerts-list">
          {lowStockAlerts.map((product) => (
            <div key={product.prd_id} className="alert-card">
              <div className="alert-icon">!</div>
              <div className="alert-content">
                <div className="alert-title">{product.prd_name}</div>
                <div className="alert-details">
                  <span className="current">Current: {product.prd_stock}</span>
                  <span className="separator">•</span>
                  <span className="minimum">Minimum: {product.prd_min_stock}</span>
                </div>
                <div className="alert-deficit">
                  Need {Number(product.prd_min_stock) - Number(product.prd_stock)} more units
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AlertsTab;
