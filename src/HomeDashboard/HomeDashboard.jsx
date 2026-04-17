import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserRole, clearAuthSession } from '../authRole';
import './HomeDashboard.css';
import DashboardTab from './tabs/DashboardTab';
import ProductsTab from './tabs/ProductsTab';
import StockTab from './tabs/StockTab';
import TransactionsTab from './tabs/TransactionsTab';
import AlertsTab from './tabs/AlertsTab';
import { FetchData } from '../functions';
import Swal from 'sweetalert2';
import SuppliersTab from './tabs/SuppliersTab';
import BrandsTab from './tabs/BrandsTab';
import CategoryTab from './tabs/CategoryTab';

const API = 'http://localhost:3001/api/products';
const TRANSACTIONS_API = 'http://localhost:3001/api/transactions';

const emptyProductForm = () => ({
  prd_name: '',
  prd_sku: '',
  prd_barcode: '',
  prd_brand: '',
  prd_category_id: '',
  prd_supplier_id: '',
  prd_unit: 'pcs',
  prd_stock: '',
  prd_min_stock: '10',
  prd_cost_price: '',
  prd_selling_price: '',
  prd_description: '',
  prd_is_active: true,
});

function productToForm(p) {
  return {
    prd_name: p.prd_name ?? '',
    prd_sku: p.prd_sku ?? '',
    prd_barcode: p.prd_barcode ?? '',
    prd_brand: p.prd_brand ?? '',
    prd_category_id:
      p.prd_category_id != null && p.prd_category_id !== '' ? String(p.prd_category_id) : '',
    prd_supplier_id:
      p.prd_supplier_id != null && p.prd_supplier_id !== '' ? String(p.prd_supplier_id) : '',
    prd_unit: p.prd_unit ?? 'pcs',
    prd_stock: p.prd_stock != null ? String(p.prd_stock) : '',
    prd_min_stock: p.prd_min_stock != null ? String(p.prd_min_stock) : '10',
    prd_cost_price: p.prd_cost_price != null ? String(p.prd_cost_price) : '',
    prd_selling_price: p.prd_selling_price != null ? String(p.prd_selling_price) : '',
    prd_description: p.prd_description ?? '',
    prd_is_active: p.prd_is_active !== 0 && p.prd_is_active !== false,
  };
}

function optInt(v) {
  if (v === '' || v === undefined || v === null) return null;
  const n = Number(v);
  return Number.isNaN(n) ? null : n;
}

function formToPayload(formData) {
  return {
    prd_name: formData.prd_name.trim(),
    prd_sku: formData.prd_sku.trim(),
    prd_barcode: formData.prd_barcode.trim(),
    prd_brand: formData.prd_brand.trim(),
    prd_category_id: optInt(formData.prd_category_id),
    prd_supplier_id: optInt(formData.prd_supplier_id),
    prd_unit: (formData.prd_unit || 'pcs').trim() || 'pcs',
    prd_stock: Number(formData.prd_stock),
    prd_min_stock: Number(formData.prd_min_stock),
    prd_cost_price: Number(formData.prd_cost_price),
    prd_selling_price: Number(formData.prd_selling_price),
    prd_description: formData.prd_description.trim(),
    prd_is_active: !!formData.prd_is_active,
  };
}

const HomeDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    if (getUserRole() !== 'admin') {
      navigate('/pos/sales', { replace: true });
    }
  }, [navigate]);

  const [products, setProducts] = useState([]);

  const loadProducts = useCallback(async () => {
    try {
      const data = await FetchData(API, 'get');
      if (data.status === 200 && Array.isArray(data.data)) {
        setProducts(data.data);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const [transactions, setTransactions] = useState([]);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [transactionsError, setTransactionsError] = useState('');

  const loadTransactions = useCallback(async () => {
    setTransactionsLoading(true);
    setTransactionsError('');
    try {
      const data = await FetchData(TRANSACTIONS_API, 'get');
      if (data.status === 200 && Array.isArray(data.data)) {
        setTransactions(data.data);
      } else {
        setTransactionsError('Failed to load transactions');
      }
    } catch (e) {
      setTransactionsError(e.response?.data?.error || e.message || 'Failed to load transactions');
    } finally {
      setTransactionsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  useEffect(() => {
    if (activeTab === 'transactions') {
      loadTransactions();
    }
  }, [activeTab, loadTransactions]);

  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState(emptyProductForm);

  const getLowStockAlerts = () =>
    products.filter((p) => Number(p.prd_stock) < Number(p.prd_min_stock));

  const lowStockAlerts = getLowStockAlerts();

  const handleFormChange = (e) => {
    const { name, type, checked, value } = e.target;
    const next = type === 'checkbox' ? checked : value;
    setFormData((prev) => ({
      ...prev,
      [name]: next,
    }));
  };

  const handleSaveProduct = async () => {
    if (
      !formData.prd_name?.trim() ||
      !formData.prd_sku?.trim() ||
      formData.prd_stock === '' ||
      formData.prd_min_stock === '' ||
      formData.prd_cost_price === '' ||
      formData.prd_selling_price === ''
    ) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing fields',
        text: 'Please fill all required fields (name, SKU, stock, min stock, cost & selling price).',
      });
      return;
    }

    const payload = formToPayload(formData);
    if (Number.isNaN(payload.prd_stock) || Number.isNaN(payload.prd_min_stock)) {
      Swal.fire({
        icon: 'warning',
        title: 'Invalid fields',
        text: 'Stock fields must be valid numbers.',
      });
      return;
    }
    if (Number.isNaN(payload.prd_cost_price) || Number.isNaN(payload.prd_selling_price)) {
      Swal.fire({
        icon: 'warning',
        title: 'Invalid fields',
        text: 'Prices must be valid numbers.',
      });
      return;
    }

    try {
      if (editingProduct) {
        const res = await FetchData(`${API}/${editingProduct.prd_id}`, 'put', payload);
        if (res.status !== 200) {
          Swal.fire({
            icon: 'warning',
            title: 'Update failed',
            text: res.data?.error || 'Update failed',
          });
          return;
        }
      } else {
        debugger
        const res = await FetchData("http://localhost:3001/api/addProducts", 'post', payload);
        if (res.status !== 201) {
          Swal.fire({
            icon: 'warning',
            title: 'Create failed',
            text: res.data?.error || 'Create failed',
          });
          return;
        }
      }
      await loadProducts();
      resetForm();
    } catch (e) {
      const msg = e.response?.data?.error || e.message || 'Request failed';
      Swal.fire({
        icon: 'warning',
        title: 'Create failed',
        text: msg,
      });
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setFormData(productToForm(product));
  };

  const handleDeleteProduct = async (prdId) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      const res = await FetchData(`${API}/${prdId}`, 'delete');
      if (res.status !== 200) {
        alert(res.data?.error || 'Delete failed');
        return;
      }
      if (editingProduct?.prd_id === prdId) resetForm();
      await loadProducts();
    } catch (e) {
      alert(e.response?.data?.error || e.message || 'Delete failed');
    }
  };

  const resetForm = () => {
    setEditingProduct(null);
    setFormData(emptyProductForm());
  };

  const handleLogout = () => {
    clearAuthSession();
    navigate('/login', { replace: true });
  };

  const tabs = [
    { key: 'dashboard', label: 'Dashboard' },
    { key: 'products', label: 'Products' },
    { key: 'stock', label: 'Stock' },
    { key: 'transactions', label: 'History' },
    { key: 'alerts', label: 'Alerts' },
    { key: 'suppliers', label: 'Suppliers' },
    { key: 'brands', label: 'Brands' },
    { key: 'category', label: 'Categories' },
  ];

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="dashboard-header-content">
          <div className="dashboard-header-text">
            <h1>Inventory admin</h1>
            <p>Manage your products and stock</p>
          </div>
          <button type="button" className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <nav className="tab-navigation">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={`tab-btn ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
            {tab.key === 'alerts' && lowStockAlerts.length > 0 && (
              <span className="alert-badge">{lowStockAlerts.length}</span>
            )}
          </button>
        ))}
      </nav>

      <main className="tab-container">
        {activeTab === 'dashboard' && (
          <DashboardTab
            products={products}
            transactions={transactions}
            lowStockAlerts={lowStockAlerts}
          />
        )}
        {activeTab === 'products' && (
          <ProductsTab
            editingProduct={editingProduct}
            formData={formData}
            products={products}
            onFormChange={handleFormChange}
            onSaveProduct={handleSaveProduct}
            onResetForm={resetForm}
            onEditProduct={handleEditProduct}
            onDeleteProduct={handleDeleteProduct}
          />
        )}
        {activeTab === 'stock' && <StockTab products={products} />}
        {activeTab === 'transactions' && (
          <TransactionsTab
            transactions={transactions}
            loading={transactionsLoading}
            error={transactionsError}
            onRetry={loadTransactions}
          />
        )}
        {activeTab === 'alerts' && <AlertsTab lowStockAlerts={lowStockAlerts} />}
        {activeTab === 'suppliers' && <SuppliersTab  />}
        {activeTab === 'brands' && <BrandsTab  />}
        {activeTab === 'category' && <CategoryTab  />}
      </main>
    </div>
  );
};

export default HomeDashboard;
