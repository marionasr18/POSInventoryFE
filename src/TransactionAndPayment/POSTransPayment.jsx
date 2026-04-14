import { useState, useRef, useEffect, useCallback } from "react";
import "./POSTransPayment.css";
import { FetchData } from "../functions";

const PRODUCTS_API = "http://localhost:3001/api/products";
const TRANSACTIONS_API = "http://localhost:3001/api/transactions";

function mapApiProduct(p) {
  return {
    prd_id: p.prd_id,
    name: p.prd_name,
    sku: p.prd_sku,
    price: Number(p.prd_selling_price),
    stock: Number(p.prd_stock),
    min_stock: Number(p.prd_min_stock ?? 10),
    prd_is_active: p.prd_is_active !== 0 && p.prd_is_active !== false,
  };
}

// ── Constants ────────────────────────────────────────────────────────────────
const LBP_RATE = 89500;

// ── Helpers ──────────────────────────────────────────────────────────────────
const fmt    = (n) => new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
const fmtLBP = (n) => new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(Math.round(n));
const nowStr = ()  => new Date().toLocaleString("en-GB", { dateStyle: "short", timeStyle: "short" });

const stockStatus = (product) => {
  if (!product.prd_is_active)               return "out";
  if (product.stock === 0)                    return "out";
  if (product.stock <= product.min_stock)     return "low";
  return "ok";
};

// ── Receipt ──────────────────────────────────────────────────────────────────
function Receipt({ items, total, saleId, onClose }) {
  const timestamp = useRef(nowStr());

  return (
    <div className="receipt-overlay" onClick={onClose}>
      <div className="receipt-paper" onClick={(e) => e.stopPropagation()}>
        <div className="receipt-tear receipt-tear--top" />

        <div className="receipt-inner">
          <p className="receipt-store">QUICK MART</p>
          <p className="receipt-sub">Point of Sale Receipt</p>
          {saleId != null && <p className="receipt-sub">Sale #{saleId}</p>}
          <p className="receipt-date">{timestamp.current}</p>

          <div className="receipt-divider" />

          {items.map((it, i) => (
            <div key={i} className="receipt-row">
              <div className="receipt-row__info">
                <p className="receipt-row__name">{it.name}</p>
                <p className="receipt-row__detail">
                  {it.qty} × ${fmt(it.price)}  ·  SKU: {it.sku}
                </p>
              </div>
              <p className="receipt-row__total">${fmt(it.price * it.qty)}</p>
            </div>
          ))}

          <div className="receipt-divider" />

          <div className="receipt-total-row">
            <span className="receipt-total-row__label">TOTAL USD</span>
            <span className="receipt-total-row__value">${fmt(total)}</span>
          </div>
          <div className="receipt-total-row">
            <span className="receipt-total-row__label">TOTAL LBP</span>
            <span className="receipt-total-row__value receipt-total-row__value--lbp">
              LL {fmtLBP(total * LBP_RATE)}
            </span>
          </div>

          <div className="receipt-divider" />
          <p className="receipt-thanks">Thank you for shopping with us!</p>
          <p className="receipt-rate">Rate: 1 USD = LL {fmtLBP(LBP_RATE)}</p>
        </div>

        <div className="receipt-tear receipt-tear--bottom" />
        <button className="receipt-close-btn" onClick={onClose}>CLOSE &amp; NEW SALE</button>
      </div>
    </div>
  );
}

// ── Stock badge ───────────────────────────────────────────────────────────────
function StockBadge({ product }) {
  const status = stockStatus(product);
  if (status === "out") return <span className="stock-badge stock-badge--out">OUT OF STOCK</span>;
  if (status === "low") return <span className="stock-badge stock-badge--low">LOW  {product.stock} left</span>;
  return <span className="stock-badge stock-badge--ok">{product.stock} in stock</span>;
}

// ── Product Picker ────────────────────────────────────────────────────────────
function ProductPicker({ products, onSelect }) {
  const [search, setSearch] = useState("");
  const searchRef = useRef(null);

  useEffect(() => { searchRef.current?.focus(); }, []);

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="picker">
      <input
        ref={searchRef}
        className="picker-search"
        placeholder="Search by name or SKU…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <div className="picker-list">
        {filtered.length === 0 ? (
          <p className="picker-empty">No products match &ldquo;{search}&rdquo;</p>
        ) : (
          filtered.map((p) => {
            const outOfStock = stockStatus(p) === "out";
            return (
              <div
                key={p.sku}
                className={`picker-item${outOfStock ? " picker-item--disabled" : ""}`}
                onClick={() => !outOfStock && onSelect(p)}
                title={outOfStock ? "Out of stock" : ""}
              >
                <span className="picker-item__sku">{p.sku}</span>
                <span className="picker-item__name">{p.name}</span>
                <StockBadge product={p} />
                <span className="picker-item__price">${fmt(p.price)}</span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// ── Main POS ──────────────────────────────────────────────────────────────────
export default function POSTransPayment() {
  const [tab, setTab]                 = useState("serial");
  const [skuInput, setSkuInput]       = useState("");
  const [items, setItems]             = useState([]);
  const [error, setError]             = useState("");
  const [toast, setToast]             = useState(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [products, setProducts]       = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError]   = useState("");
  const [paying, setPaying]           = useState(false);
  const [lastSaleId, setLastSaleId]   = useState(null);
  const skuRef = useRef(null);

  const total = items.reduce((s, it) => s + it.price * it.qty, 0);

  const loadProducts = useCallback(async () => {
    setProductsLoading(true);
    setProductsError("");
    try {
      const res = await FetchData(PRODUCTS_API, "get");
      if (res.status === 200 && Array.isArray(res.data)) {
        setProducts(res.data.map(mapApiProduct));
      } else {
        setProductsError("Could not load products.");
      }
    } catch (e) {
      setProductsError(e.response?.data?.error || e.message || "Could not load products.");
    } finally {
      setProductsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // ── Toast ─────────────────────────────────────────────────────────────────
  const fireToast = (msg, type = "success") => {
    setToast({ msg, type, key: Date.now() });
    setTimeout(() => setToast(null), 2400);
  };

  // ── Add product (with stock check) ────────────────────────────────────────
  const addProduct = (product) => {
    if (stockStatus(product) === "out") {
      fireToast(`${product.name} is out of stock`, "error");
      return;
    }
    setItems((prev) => {
      const existing = prev.find((i) => i.sku === product.sku);
      if (existing) {
        // Check we're not exceeding available stock
        if (existing.qty >= product.stock) {
          fireToast(`Only ${product.stock} unit(s) available`, "error");
          return prev;
        }
        fireToast(`+1  ${product.name}`);
        return prev.map((i) =>
          i.sku === product.sku ? { ...i, qty: i.qty + 1 } : i
        );
      }
      if (stockStatus(product) === "low") {
        fireToast(`Added  ${product.name}  (low stock!)`, "warn");
      } else {
        fireToast(`Added  ${product.name}`);
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  // ── Add by SKU input ──────────────────────────────────────────────────────
  const addBySku = () => {
    const sku = skuInput.trim().toUpperCase();
    if (!sku) return;
    const product = products.find((p) => p.sku.toUpperCase() === sku);
    if (!product) {
      setError(`SKU "${sku}" not found in catalog.`);
      fireToast("Product not found", "error");
      setSkuInput("");
      skuRef.current?.focus();
      return;
    }
    setError("");
    addProduct(product);
    setSkuInput("");
    skuRef.current?.focus();
  };

  // ── Qty controls ──────────────────────────────────────────────────────────
  const changeQty = (sku, delta) => {
    if (delta > 0) {
      const product = products.find((p) => p.sku === sku);
      const item = items.find((i) => i.sku === sku);
      if (product && item && item.qty >= product.stock) {
        fireToast(`Only ${product.stock} unit(s) available`, "error");
        return;
      }
    }
    setItems((prev) =>
      prev
        .map((i) => (i.sku === sku ? { ...i, qty: i.qty + delta } : i))
        .filter((i) => i.qty > 0)
    );
  };

  const removeItem = (sku) => setItems((prev) => prev.filter((i) => i.sku !== sku));

  // ── New sale ──────────────────────────────────────────────────────────────
  const handleNewSale = () => {
    setItems([]);
    setShowReceipt(false);
    setLastSaleId(null);
    setSkuInput("");
    setError("");
    setTab("serial");
    loadProducts();
    setTimeout(() => skuRef.current?.focus(), 80);
  };

  const handleProceedToPay = async () => {
    if (items.length === 0 || paying) return;
    const missingId = items.some((it) => it.prd_id == null);
    if (missingId) {
      fireToast("Invalid cart: refresh and try again", "error");
      return;
    }
    setPaying(true);
    try {
        debugger
      const res = await FetchData(TRANSACTIONS_API, "post", {
        pth_reference: null,
        pth_customer_name: null,
        pth_TotalPrice: total?total:0,
        details: items.map((it) => ({
          ptd_prd_id: it.prd_id,
          ptd_quantity: it.qty,
          ptd_price: it.price,
        })),
      });
      if (res.status !== 201) {
        fireToast(res.data?.error || "Payment failed", "error");
        return;
      }
      const id = res.data?.pth_id;
      setLastSaleId(id ?? null);
      setShowReceipt(true);
      fireToast("Sale recorded");
    } catch (e) {
      const msg = e.response?.data?.error || e.response?.data?.message || e.message || "Payment failed";
      fireToast(msg, "error");
    } finally {
      setPaying(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <>
      <div className="pos-app">

        {/* Header */}
        <header className="pos-header">
          <div className="pos-header__left">
            <span className="pos-header__logo">⬡</span>
            <div>
              <p className="pos-header__store">QUICK MART</p>
              <p className="pos-header__sub">Point of Sale Terminal</p>
            </div>
          </div>
          <span className="pos-header__rate">1 USD = LL {fmtLBP(LBP_RATE)}</span>
        </header>

        {/* Toast */}
        {toast && (
          <div
            key={toast.key}
            className={`pos-toast pos-toast--${toast.type}`}
          >
            {toast.type === "error" ? "✕" : toast.type === "warn" ? "⚠" : "✓"}{"  "}{toast.msg}
          </div>
        )}

        <div className="pos-body">

          {/* ── LEFT ── */}
          <div className="pos-left">

            {productsError && (
              <div className="card" style={{ marginBottom: "1rem", borderLeft: "4px solid #ef4444" }}>
                <p className="card__label">Catalog</p>
                <p style={{ marginTop: "0.5rem", color: "#b91c1c" }}>{productsError}</p>
                <button type="button" className="scan-btn" style={{ marginTop: "0.75rem" }} onClick={loadProducts}>
                  Retry
                </button>
              </div>
            )}

            {/* Add product card */}
            <div className="card">
              <p className="card__label">Add Product</p>

              <div className="scan-tabs">
                <button
                  className={`scan-tab ${tab === "serial" ? "scan-tab--active" : ""}`}
                  onClick={() => {
                    setTab("serial");
                    setTimeout(() => skuRef.current?.focus(), 50);
                  }}
                >
                  SKU / SCAN
                </button>
                <button
                  className={`scan-tab ${tab === "list" ? "scan-tab--active" : ""}`}
                  onClick={() => setTab("list")}
                >
                  BROWSE LIST
                </button>
              </div>

              {tab === "serial" && (
                <>
                  <div className="scan-row">
                    <input
                      ref={skuRef}
                      autoFocus
                      disabled={productsLoading || !!productsError}
                      className={`scan-input${error ? " scan-input--error" : ""}`}
                      value={skuInput}
                      placeholder={productsLoading ? "Loading catalog…" : "e.g. SKU-001"}
                      onChange={(e) => { setSkuInput(e.target.value); setError(""); }}
                      onKeyDown={(e) => e.key === "Enter" && addBySku()}
                    />
                    <button className="scan-btn" disabled={productsLoading || !!productsError} onClick={addBySku}>ADD</button>
                  </div>
                  {error && <p className="scan-error">{error}</p>}
                  {!productsLoading && products.length > 0 && (
                    <p className="scan-hint">{products.length} products in catalog</p>
                  )}
                </>
              )}

              {tab === "list" && (
                productsLoading ? (
                  <p className="picker-empty">Loading products…</p>
                ) : productsError ? (
                  <p className="picker-empty">Catalog unavailable</p>
                ) : (
                  <ProductPicker products={products} onSelect={addProduct} />
                )
              )}
            </div>

            {/* Items list card */}
            <div className="card">
              <div className="items-header">
                <p className="card__label" style={{ marginBottom: 0 }}>Order Items</p>
                <span className="items-count">{items.reduce((s, i) => s + i.qty, 0)} pcs</span>
              </div>

              {items.length === 0 ? (
                <div className="items-empty">
                  <p className="items-empty__icon">◎</p>
                  <p className="items-empty__text">No items added yet</p>
                </div>
              ) : (
                <div className="items-list">
                  {items.map((it) => {
                    const source = products.find((p) => p.sku === it.sku);
                    const atMax  = source && it.qty >= source.stock;
                    return (
                      <div key={it.sku} className="item-row">
                        <div className="item-row__info">
                          <p className="item-row__name">{it.name}</p>
                          <p className="item-row__meta">
                            {it.sku}  ·  ${fmt(it.price)}
                            {source && stockStatus(source) === "low" && (
                              <span className="item-row__low-warn"> · ⚠ low stock</span>
                            )}
                          </p>
                        </div>
                        <div className="item-row__controls">
                          <button className="qty-btn" onClick={() => changeQty(it.sku, -1)}>−</button>
                          <span className="qty-num">{it.qty}</span>
                          <button
                            className={`qty-btn${atMax ? " qty-btn--disabled" : ""}`}
                            onClick={() => changeQty(it.sku, +1)}
                            disabled={atMax}
                            title={atMax ? "Max stock reached" : ""}
                          >
                            +
                          </button>
                          <button className="remove-btn" onClick={() => removeItem(it.sku)} title="Remove">✕</button>
                        </div>
                        <p className="item-row__total">${fmt(it.price * it.qty)}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* ── RIGHT ── */}
          <div className="pos-right">
            <div className="card totals-card">
              <p className="card__label">Order Summary</p>

              <div className="total-block">
                <p className="total-block__currency">USD</p>
                <p className="total-block__amount">${fmt(total)}</p>
              </div>

              <div className="divider" />

              <div className="total-block">
                <p className="total-block__currency">LBP</p>
                <p className="total-block__amount total-block__amount--lbp">
                  LL {fmtLBP(total * LBP_RATE)}
                </p>
              </div>

              <div className="divider" />

              <div className="summary-lines">
                <div className="summary-line">
                  <span>Items</span>
                  <span>{items.reduce((s, i) => s + i.qty, 0)}</span>
                </div>
                <div className="summary-line">
                  <span>Unique SKUs</span>
                  <span>{items.length}</span>
                </div>
              </div>

              <button
                className="pay-btn"
                disabled={items.length === 0 || paying || productsLoading || !!productsError}
                onClick={handleProceedToPay}
              >
                {paying ? "PROCESSING…" : "PROCEED TO PAY"}
              </button>

              {items.length > 0 && (
                <button className="clear-btn" onClick={handleNewSale}>
                  Clear Sale
                </button>
              )}
            </div>
          </div>

        </div>
      </div>

      {showReceipt && (
        <Receipt items={items} total={total} saleId={lastSaleId} onClose={handleNewSale} />
      )}
    </>
  );
}