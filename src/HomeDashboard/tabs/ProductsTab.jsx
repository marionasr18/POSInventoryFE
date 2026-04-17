import React from 'react';
import { useState } from 'react';

const ProductsTab = ({
  editingProduct,
  formData,
  products,
  onFormChange,
  onSaveProduct,
  onResetForm,
  onEditProduct,
  onDeleteProduct,
}) => {
  const [brands,setBrands] = useState([])
  return (
    <div className="tab-content">
      <div className="form-section">
        <h3>{editingProduct ? 'Edit product' : 'Add new product'}</h3>

        <div className="form-group">
          <label>Product name *</label>
          <input
            type="text"
            name="prd_name"
            value={formData.prd_name}
            onChange={onFormChange}
            placeholder="e.g. Laptop"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>SKU *</label>
            <input
              type="text"
              name="prd_sku"
              value={formData.prd_sku}
              onChange={onFormChange}
              placeholder="Unique code"
            />
          </div>
          <div className="form-group">
            <label>Unit</label>
            <input
              type="text"
              name="prd_unit"
              value={formData.prd_unit}
              onChange={onFormChange}
              placeholder="pcs"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Barcode</label>
            <input
              type="text"
              name="prd_barcode"
              value={formData.prd_barcode}
              onChange={onFormChange}
              placeholder="Optional"
            />
          </div>
          <div className="form-group">
  <label>Brand</label>
  <select
    name="prd_brand"
    value={formData.prd_brand}
    onChange={onFormChange}
  >
    <option value="">Select a brand</option>
    {brands.map((brand) => (
      <option key={brand.brn_id} value={brand.brn_name}>
        {brand.brn_name}
      </option>
    ))}
  </select>
</div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Category ID</label>
            <input
              type="number"
              name="prd_category_id"
              value={formData.prd_category_id}
              onChange={onFormChange}
              placeholder="Optional"
              min="1"
            />
          </div>
          <div className="form-group">
            <label>Supplier ID</label>
            <input
              type="number"
              name="prd_supplier_id"
              value={formData.prd_supplier_id}
              onChange={onFormChange}
              placeholder="Optional"
              min="1"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Stock *</label>
            <input
              type="number"
              name="prd_stock"
              value={formData.prd_stock}
              onChange={onFormChange}
              placeholder="0"
              min="0"
            />
          </div>
          <div className="form-group">
            <label>Min stock alert *</label>
            <input
              type="number"
              name="prd_min_stock"
              value={formData.prd_min_stock}
              onChange={onFormChange}
              placeholder="10"
              min="0"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Cost price *</label>
            <input
              type="number"
              name="prd_cost_price"
              value={formData.prd_cost_price}
              onChange={onFormChange}
              placeholder="0.00"
              step="0.01"
              min="0"
            />
          </div>
          <div className="form-group">
            <label>Selling price *</label>
            <input
              type="number"
              name="prd_selling_price"
              value={formData.prd_selling_price}
              onChange={onFormChange}
              placeholder="0.00"
              step="0.01"
              min="0"
            />
          </div>
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            name="prd_description"
            value={formData.prd_description}
            onChange={onFormChange}
            placeholder="Optional notes"
            rows={3}
            className="form-textarea"
          />
        </div>

        <div className="form-group form-group--checkbox">
          <label>
            <input
              type="checkbox"
              name="prd_is_active"
              checked={!!formData.prd_is_active}
              onChange={onFormChange}
            />
            <span>Active (visible for sale)</span>
          </label>
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-primary" onClick={onSaveProduct}>
            {editingProduct ? 'Update product' : 'Add product'}
          </button>
          {editingProduct && (
            <button type="button" className="btn btn-secondary" onClick={onResetForm}>
              Cancel
            </button>
          )}
        </div>
      </div>

      <div className="products-section">
        <h3>Products list</h3>
        <div className="products-list">
          {products.length === 0 ? (
            <div className="empty-state">No products yet. Add your first product!</div>
          ) : (
            products.map((product) => {
              const low =
                Number(product.prd_stock) < Number(product.prd_min_stock);
              const active = product.prd_is_active !== 0 && product.prd_is_active !== false;
              return (
                <div key={product.prd_id} className="product-card">
                  <div className="product-header">
                    <div className="product-name">{product.prd_name}</div>
                    <div className={`stock-badge ${low ? 'low' : 'ok'}`}>
                      {product.prd_stock} {product.prd_unit || 'pcs'}
                    </div>
                  </div>
                  {!active && (
                    <div className="product-inactive-badge">Inactive</div>
                  )}
                  <div className="product-details">
                    <div className="detail-row">
                      <span className="label">SKU:</span>
                      <span className="value">{product.prd_sku}</span>
                    </div>
                    {product.prd_barcode && (
                      <div className="detail-row">
                        <span className="label">Barcode:</span>
                        <span className="value">{product.prd_barcode}</span>
                      </div>
                    )}
                    {product.prd_brand && (
                      <div className="detail-row">
                        <span className="label">Brand:</span>
                        <span className="value">{product.prd_brand}</span>
                      </div>
                    )}
                    <div className="detail-row">
                      <span className="label">Sell:</span>
                      <span className="value">${Number(product.prd_selling_price).toFixed(2)}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Cost:</span>
                      <span className="value">${Number(product.prd_cost_price).toFixed(2)}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Min stock:</span>
                      <span className="value">{product.prd_min_stock}</span>
                    </div>
                  </div>
                  <div className="product-actions">
                    <button
                      type="button"
                      className="btn-icon edit"
                      onClick={() => onEditProduct(product)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="btn-icon delete"
                      onClick={() => onDeleteProduct(product.prd_id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductsTab;
