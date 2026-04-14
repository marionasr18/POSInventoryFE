import React from 'react';

const StockTab = ({ products }) => {
  return (
    <div className="tab-content">
      <div className="stock-overview">
        <div className="stock-item-header">
          <div>Product</div>
          <div>Current stock</div>
          <div>Value</div>
        </div>
        {products.map((product) => (
          <div key={product.prd_id} className="stock-item">
            <div className="stock-product">
              <div className="stock-name">{product.prd_name}</div>
              <div className="stock-sku">{product.prd_sku}</div>
            </div>
            <div className="stock-qty">
              <div
                className={`qty-value ${
                  Number(product.prd_stock) < Number(product.prd_min_stock) ? 'low' : ''
                }`}
              >
                {product.prd_stock}
              </div>
              <div className="qty-min">Min: {product.prd_min_stock}</div>
            </div>
            <div className="stock-value">
              $
              {(Number(product.prd_stock) * Number(product.prd_cost_price || 0)).toFixed(2)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StockTab;
