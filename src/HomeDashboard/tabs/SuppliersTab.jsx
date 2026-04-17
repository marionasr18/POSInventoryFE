import React, { useState } from 'react';

const SuppliersTab = ({ initialSuppliers = [] }) => {
  const emptyForm = {
    sup_name: '',
    sup_contact_person: '',
    sup_email: '',
    sup_phone: '',
    sup_tax_id: '',
    sup_address: '',
    sup_notes: '',
    sup_is_active: true,
  };

  const [suppliers, setSuppliers] = useState(initialSuppliers);
  const [formData, setFormData] = useState(emptyForm);
  const [editingSupplier, setEditingSupplier] = useState(null);

  // Handle input changes (text + checkbox)
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
    setEditingSupplier(null);
  };

  // Save (add or update)
  const onSaveSupplier = () => {
    if (!formData.sup_name.trim()) return;

    if (editingSupplier) {
      // update
      setSuppliers((prev) =>
        prev.map((s) =>
          s.sup_id === editingSupplier.sup_id
            ? { ...s, ...formData }
            : s
        )
      );
    } else {
      // add
      const newSupplier = {
        ...formData,
        sup_id: Date.now(),
      };

      setSuppliers((prev) => [...prev, newSupplier]);
    }

    onResetForm();
  };

  // Edit
  const onEditSupplier = (supplier) => {
    setEditingSupplier(supplier);
    setFormData(supplier);
  };

  // Delete
  const onDeleteSupplier = (id) => {
    setSuppliers((prev) => prev.filter((s) => s.sup_id !== id));
    if (editingSupplier?.sup_id === id) {
      onResetForm();
    }
  };

  return (
    <div className="tab-content">
      <div className="form-section">
        <h3>{editingSupplier ? 'Edit supplier' : 'Add new supplier'}</h3>

        <div className="form-group">
          <label>Supplier name *</label>
          <input
            type="text"
            name="sup_name"
            value={formData.sup_name}
            onChange={onFormChange}
          />
        </div>

        <div className="form-group">
          <label>Contact person</label>
          <input
            type="text"
            name="sup_contact_person"
            value={formData.sup_contact_person}
            onChange={onFormChange}
          />
        </div>

        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            name="sup_email"
            value={formData.sup_email}
            onChange={onFormChange}
          />
        </div>

        <div className="form-group">
          <label>Phone</label>
          <input
            type="tel"
            name="sup_phone"
            value={formData.sup_phone}
            onChange={onFormChange}
          />
        </div>

        <div className="form-group">
          <label>Tax ID</label>
          <input
            type="text"
            name="sup_tax_id"
            value={formData.sup_tax_id}
            onChange={onFormChange}
          />
        </div>

        <div className="form-group">
          <label>Address</label>
          <textarea
            name="sup_address"
            value={formData.sup_address}
            onChange={onFormChange}
            rows={2}
          />
        </div>

        <div className="form-group">
          <label>Notes</label>
          <textarea
            name="sup_notes"
            value={formData.sup_notes}
            onChange={onFormChange}
            rows={3}
          />
        </div>

        <div className="form-group form-group--checkbox">
          <label>
            <input
              type="checkbox"
              name="sup_is_active"
              checked={!!formData.sup_is_active}
              onChange={onFormChange}
            />
            <span>Active supplier</span>
          </label>
        </div>

        <div className="form-actions">
          <button className="btn btn-primary" onClick={onSaveSupplier}>
            {editingSupplier ? 'Update supplier' : 'Add supplier'}
          </button>

          {editingSupplier && (
            <button className="btn btn-secondary" onClick={onResetForm}>
              Cancel
            </button>
          )}
        </div>
      </div>

      <div className="products-section">
        <h3>Suppliers list</h3>

        <div className="products-list">
          {suppliers.length === 0 ? (
            <div className="empty-state">No suppliers yet.</div>
          ) : (
            suppliers.map((supplier) => {
              const active =
                supplier.sup_is_active !== 0 &&
                supplier.sup_is_active !== false;

              return (
                <div key={supplier.sup_id} className="product-card">
                  <div className="product-header">
                    <div className="product-name">
                      {supplier.sup_name}
                    </div>
                    {!active && (
                      <div className="stock-badge low">Inactive</div>
                    )}
                  </div>

                  <div className="product-actions">
                    <button
                      className="btn-icon edit"
                      onClick={() => onEditSupplier(supplier)}
                    >
                      Edit
                    </button>

                    <button
                      className="btn-icon delete"
                      onClick={() => onDeleteSupplier(supplier.sup_id)}
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

export default SuppliersTab;