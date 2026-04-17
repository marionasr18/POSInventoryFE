import React, { useState } from 'react';

const CategoryTab = ({ initialCategories = [] }) => {
  const emptyForm = {
    cat_name: '',
    cat_code: '',
    cat_description: '',
    cat_is_active: true,
  };

  const [categories, setCategories] = useState(initialCategories);
  const [formData, setFormData] = useState(emptyForm);
  const [editingCategory, setEditingCategory] = useState(null);

  // handle input changes
  const onFormChange = (e) => {
    const { name, type, value, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // reset form
  const onResetForm = () => {
    setFormData(emptyForm);
    setEditingCategory(null);
  };

  // save category (add or update)
  const onSaveCategory = () => {
    if (!formData.cat_name.trim()) return;

    if (editingCategory) {
      setCategories((prev) =>
        prev.map((c) =>
          c.cat_id === editingCategory.cat_id
            ? { ...c, ...formData }
            : c
        )
      );
    } else {
      const newCategory = {
        ...formData,
        cat_id: Date.now(),
      };

      setCategories((prev) => [...prev, newCategory]);
    }

    onResetForm();
  };

  // edit
  const onEditCategory = (category) => {
    setEditingCategory(category);
    setFormData(category);
  };

  // delete
  const onDeleteCategory = (id) => {
    setCategories((prev) => prev.filter((c) => c.cat_id !== id));

    if (editingCategory?.cat_id === id) {
      onResetForm();
    }
  };

  return (
    <div className="tab-content">
      {/* FORM */}
      <div className="form-section">
        <h3>
          {editingCategory ? 'Edit category' : 'Add new category'}
        </h3>

        <div className="form-group">
          <label>Category name *</label>
          <input
            type="text"
            name="cat_name"
            value={formData.cat_name}
            onChange={onFormChange}
            placeholder="e.g. Electronics, Tools"
          />
        </div>

        <div className="form-group">
          <label>Category code</label>
          <input
            type="text"
            name="cat_code"
            value={formData.cat_code}
            onChange={onFormChange}
            placeholder="Optional"
          />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            name="cat_description"
            value={formData.cat_description}
            onChange={onFormChange}
            rows={3}
          />
        </div>

        <div className="form-group form-group--checkbox">
          <label>
            <input
              type="checkbox"
              name="cat_is_active"
              checked={!!formData.cat_is_active}
              onChange={onFormChange}
            />
            <span>Active category</span>
          </label>
        </div>

        <div className="form-actions">
          <button className="btn btn-primary" onClick={onSaveCategory}>
            {editingCategory ? 'Update category' : 'Add category'}
          </button>

          {editingCategory && (
            <button className="btn btn-secondary" onClick={onResetForm}>
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* LIST */}
      <div className="products-section">
        <h3>Categories list</h3>

        <div className="products-list">
          {categories.length === 0 ? (
            <div className="empty-state">
              No categories yet. Add your first category!
            </div>
          ) : (
            categories.map((category) => {
              const active =
                category.cat_is_active !== 0 &&
                category.cat_is_active !== false;

              return (
                <div key={category.cat_id} className="product-card">
                  <div className="product-header">
                    <div className="product-name">
                      {category.cat_name}
                    </div>

                    {!active && (
                      <div className="stock-badge low">Inactive</div>
                    )}
                  </div>

                  <div className="product-details">
                    {category.cat_code && (
                      <div className="detail-row">
                        <span className="label">Code:</span>
                        <span className="value">
                          {category.cat_code}
                        </span>
                      </div>
                    )}

                    {category.cat_description && (
                      <div className="detail-row">
                        <span className="label">Description:</span>
                        <span className="value">
                          {category.cat_description}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="product-actions">
                    <button
                      className="btn-icon edit"
                      onClick={() => onEditCategory(category)}
                    >
                      Edit
                    </button>

                    <button
                      className="btn-icon delete"
                      onClick={() => onDeleteCategory(category.cat_id)}
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

export default CategoryTab;