import React, { useState } from 'react';

const BrandsTab = ({ initialBrands = [] }) => {
  const emptyForm = {
    brn_name: '',
    brn_code: '',
    brn_country: '',
    brn_website: '',
    brn_email: '',
    brn_description: '',
    brn_is_active: true,
  };

  const [brands, setBrands] = useState(initialBrands);
  const [formData, setFormData] = useState(emptyForm);
  const [editingBrand, setEditingBrand] = useState(null);

  // Handle input changes
  const onFormChange = (e) => {
    const { name, type, value, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Reset form
  const onResetForm = () => {
    setFormData(emptyForm);
    setEditingBrand(null);
  };

  // Save brand (add or update)
  const onSaveBrand = () => {
    if (!formData.brn_name.trim()) return;

    if (editingBrand) {
      // update
      setBrands((prev) =>
        prev.map((b) =>
          b.brn_id === editingBrand.brn_id
            ? { ...b, ...formData }
            : b
        )
      );
    } else {
      // add
      const newBrand = {
        ...formData,
        brn_id: Date.now(),
      };

      setBrands((prev) => [...prev, newBrand]);
    }

    onResetForm();
  };

  // Edit brand
  const onEditBrand = (brand) => {
    setEditingBrand(brand);
    setFormData(brand);
  };

  // Delete brand
  const onDeleteBrand = (id) => {
    setBrands((prev) => prev.filter((b) => b.brn_id !== id));

    if (editingBrand?.brn_id === id) {
      onResetForm();
    }
  };

  return (
    <div className="tab-content">
      {/* FORM */}
      <div className="form-section">
        <h3>{editingBrand ? 'Edit brand' : 'Add new brand'}</h3>

        <div className="form-group">
          <label>Brand name *</label>
          <input
            type="text"
            name="brn_name"
            value={formData.brn_name}
            onChange={onFormChange}
            placeholder="e.g. Apple, Samsung"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Brand code</label>
            <input
              type="text"
              name="brn_code"
              value={formData.brn_code}
              onChange={onFormChange}
            />
          </div>

          <div className="form-group">
            <label>Country</label>
            <input
              type="text"
              name="brn_country"
              value={formData.brn_country}
              onChange={onFormChange}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Website</label>
            <input
              type="url"
              name="brn_website"
              value={formData.brn_website}
              onChange={onFormChange}
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="brn_email"
              value={formData.brn_email}
              onChange={onFormChange}
            />
          </div>
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            name="brn_description"
            value={formData.brn_description}
            onChange={onFormChange}
            rows={3}
          />
        </div>

        <div className="form-group form-group--checkbox">
          <label>
            <input
              type="checkbox"
              name="brn_is_active"
              checked={!!formData.brn_is_active}
              onChange={onFormChange}
            />
            <span>Active brand</span>
          </label>
        </div>

        <div className="form-actions">
          <button className="btn btn-primary" onClick={onSaveBrand}>
            {editingBrand ? 'Update brand' : 'Add brand'}
          </button>

          {editingBrand && (
            <button className="btn btn-secondary" onClick={onResetForm}>
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* LIST */}
      <div className="products-section">
        <h3>Brands list</h3>

        <div className="products-list">
          {brands.length === 0 ? (
            <div className="empty-state">No brands yet.</div>
          ) : (
            brands.map((brand) => {
              const active =
                brand.brn_is_active !== 0 &&
                brand.brn_is_active !== false;

              return (
                <div key={brand.brn_id} className="product-card">
                  <div className="product-header">
                    <div className="product-name">{brand.brn_name}</div>
                    {!active && (
                      <div className="stock-badge low">Inactive</div>
                    )}
                  </div>

                  <div className="product-details">
                    {brand.brn_code && (
                      <div className="detail-row">
                        <span className="label">Code:</span>
                        <span className="value">{brand.brn_code}</span>
                      </div>
                    )}

                    {brand.brn_country && (
                      <div className="detail-row">
                        <span className="label">Country:</span>
                        <span className="value">{brand.brn_country}</span>
                      </div>
                    )}

                    {brand.brn_email && (
                      <div className="detail-row">
                        <span className="label">Email:</span>
                        <span className="value">{brand.brn_email}</span>
                      </div>
                    )}
                  </div>

                  <div className="product-actions">
                    <button
                      className="btn-icon edit"
                      onClick={() => onEditBrand(brand)}
                    >
                      Edit
                    </button>

                    <button
                      className="btn-icon delete"
                      onClick={() => onDeleteBrand(brand.brn_id)}
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

export default BrandsTab;