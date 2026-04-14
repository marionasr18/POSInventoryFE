import { useState, useRef } from "react";
import "./POSPurchaseInvoice.css";

// ── Helpers ──────────────────────────────────────────────────────────────────
const fmt    = (n) => new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
const nowStr = ()  => new Date().toLocaleString("en-GB", { dateStyle: "short", timeStyle: "short" });
const uid    = ()  => Math.random().toString(36).slice(2, 8).toUpperCase();

// ── Confirmation Modal ────────────────────────────────────────────────────────
function ConfirmModal({ invoice, onConfirm, onCancel }) {
  const total = invoice.lines.reduce((s, l) => s + l.qty * l.costPrice, 0);
  return (
    <div className="pi-overlay" onClick={onCancel}>
      <div className="pi-modal" onClick={(e) => e.stopPropagation()}>
        <div className="pi-modal__header">
          <h2 className="pi-modal__title">Confirm Purchase</h2>
          <p className="pi-modal__sub">Review before committing to inventory</p>
        </div>

        <div className="pi-modal__meta">
          <span><strong>Supplier:</strong> {invoice.supplier || "—"}</span>
          <span><strong>Ref #:</strong> {invoice.ref}</span>
          <span><strong>Date:</strong> {invoice.date}</span>
        </div>

        <div className="pi-modal__table-wrap">
          <table className="pi-modal__table">
            <thead>
              <tr>
                <th>SKU</th>
                <th>Product</th>
                <th>Action</th>
                <th>Qty</th>
                <th>Cost/Unit</th>
                <th>Sell Price</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {invoice.lines.map((l, i) => (
                <tr key={i}>
                  <td><span className="pi-sku-chip">{l.sku}</span></td>
                  <td>{l.name}</td>
                  <td>
                    <span className={`pi-action-badge pi-action-badge--${l.isNew ? "new" : "restock"}`}>
                      {l.isNew ? "NEW PRODUCT" : "RESTOCK"}
                    </span>
                  </td>
                  <td className="pi-num">+{l.qty}</td>
                  <td className="pi-num">${fmt(l.costPrice)}</td>
                  <td className="pi-num">${fmt(l.sellPrice)}</td>
                  <td className="pi-num pi-num--accent">${fmt(l.qty * l.costPrice)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="pi-modal__footer">
          <div className="pi-modal__total">
            <span>Total Purchase Cost</span>
            <strong>${fmt(total)}</strong>
          </div>
          <div className="pi-modal__actions">
            <button className="pi-btn pi-btn--ghost" onClick={onCancel}>Cancel</button>
            <button className="pi-btn pi-btn--primary" onClick={onConfirm}>
              ✓ Confirm &amp; Update Inventory
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Success Receipt ───────────────────────────────────────────────────────────
function SuccessView({ invoice, onNew }) {
  const total = invoice.lines.reduce((s, l) => s + l.qty * l.costPrice, 0);
  return (
    <div className="pi-success">
      <div className="pi-success__icon">✓</div>
      <h2 className="pi-success__title">Purchase Recorded</h2>
      <p className="pi-success__sub">Inventory has been updated successfully</p>

      <div className="pi-success__card">
        <div className="pi-success__row">
          <span>Reference</span><strong>{invoice.ref}</strong>
        </div>
        <div className="pi-success__row">
          <span>Supplier</span><strong>{invoice.supplier || "—"}</strong>
        </div>
        <div className="pi-success__row">
          <span>Date</span><strong>{invoice.date}</strong>
        </div>
        <div className="pi-success__row pi-success__row--divider" />
        {invoice.lines.map((l, i) => (
          <div key={i} className="pi-success__row">
            <span>{l.name} <em className="pi-success__sku">({l.sku})</em></span>
            <strong>+{l.qty} units</strong>
          </div>
        ))}
        <div className="pi-success__row pi-success__row--divider" />
        <div className="pi-success__row pi-success__row--total">
          <span>Total Cost</span><strong>${fmt(total)}</strong>
        </div>
      </div>

      <button className="pi-btn pi-btn--primary pi-success__new" onClick={onNew}>
        + New Purchase Invoice
      </button>
    </div>
  );
}

// ── Line Row ──────────────────────────────────────────────────────────────────
function LineRow({ line, index, existingProducts, onChange, onRemove }) {
  const [skuSearch, setSkuSearch]   = useState(line.sku);
  const [showDrop, setShowDrop]     = useState(false);

  const matches = skuSearch.length >= 1
    ? existingProducts.filter(
        (p) =>
          p.sku.toLowerCase().includes(skuSearch.toLowerCase()) ||
          p.name.toLowerCase().includes(skuSearch.toLowerCase())
      )
    : [];

  const pickProduct = (p) => {
    setSkuSearch(p.sku);
    setShowDrop(false);
    onChange(index, {
      sku:       p.sku,
      name:      p.name,
      sellPrice: p.price,
      isNew:     false,
    });
  };

  const handleSkuChange = (val) => {
    setSkuSearch(val);
    setShowDrop(true);
    // If no match, treat as new product
    const exact = existingProducts.find(
      (p) => p.sku.toLowerCase() === val.toLowerCase()
    );
    if (exact) {
      onChange(index, { sku: val.toUpperCase(), name: exact.name, sellPrice: exact.price, isNew: false });
    } else {
      onChange(index, { sku: val.toUpperCase(), isNew: val.length > 0 });
    }
  };

  return (
    <div className="pi-line-row">
      <div className="pi-line-row__num">{index + 1}</div>

      {/* SKU / search */}
      <div className="pi-line-row__field pi-line-row__field--sku">
        <div className="pi-autocomplete">
          <input
            className="pi-input"
            placeholder="SKU or search…"
            value={skuSearch}
            onChange={(e) => handleSkuChange(e.target.value)}
            onFocus={() => setShowDrop(true)}
            onBlur={() => setTimeout(() => setShowDrop(false), 160)}
          />
          {showDrop && matches.length > 0 && (
            <div className="pi-autocomplete__drop">
              {matches.map((p) => (
                <div key={p.sku} className="pi-autocomplete__item" onMouseDown={() => pickProduct(p)}>
                  <span className="pi-sku-chip pi-sku-chip--sm">{p.sku}</span>
                  <span className="pi-autocomplete__name">{p.name}</span>
                  <span className="pi-autocomplete__stock">{p.stock} in stock</span>
                </div>
              ))}
            </div>
          )}
        </div>
        {line.isNew && line.sku && (
          <span className="pi-new-tag">NEW</span>
        )}
      </div>

      {/* Product name */}
      <div className="pi-line-row__field pi-line-row__field--name">
        <input
          className="pi-input"
          placeholder="Product name"
          value={line.name}
          onChange={(e) => onChange(index, { name: e.target.value })}
        />
      </div>

      {/* Qty */}
      <div className="pi-line-row__field pi-line-row__field--sm">
        <input
          className="pi-input pi-input--center"
          type="number"
          min="1"
          placeholder="Qty"
          value={line.qty || ""}
          onChange={(e) => onChange(index, { qty: parseInt(e.target.value) || 0 })}
        />
      </div>

      {/* Cost price */}
      <div className="pi-line-row__field pi-line-row__field--sm">
        <div className="pi-input-prefix">
          <span className="pi-input-prefix__sym">$</span>
          <input
            className="pi-input pi-input--prefix"
            type="number"
            min="0"
            step="0.01"
            placeholder="Cost"
            value={line.costPrice || ""}
            onChange={(e) => onChange(index, { costPrice: parseFloat(e.target.value) || 0 })}
          />
        </div>
      </div>

      {/* Selling price */}
      <div className="pi-line-row__field pi-line-row__field--sm">
        <div className="pi-input-prefix">
          <span className="pi-input-prefix__sym">$</span>
          <input
            className="pi-input pi-input--prefix"
            type="number"
            min="0"
            step="0.01"
            placeholder="Sell"
            value={line.sellPrice || ""}
            onChange={(e) => onChange(index, { sellPrice: parseFloat(e.target.value) || 0 })}
          />
        </div>
      </div>

      {/* Min stock (only for new products) */}
      <div className="pi-line-row__field pi-line-row__field--sm">
        <input
          className={`pi-input pi-input--center${!line.isNew ? " pi-input--disabled" : ""}`}
          type="number"
          min="0"
          placeholder="Min"
          disabled={!line.isNew}
          value={line.minStock || ""}
          onChange={(e) => onChange(index, { minStock: parseInt(e.target.value) || 0 })}
          title={!line.isNew ? "Only required for new products" : "Minimum stock threshold"}
        />
      </div>

      {/* Subtotal */}
      <div className="pi-line-row__subtotal">
        ${fmt((line.qty || 0) * (line.costPrice || 0))}
      </div>

      {/* Remove */}
      <button className="pi-line-row__remove" onClick={() => onRemove(index)} title="Remove line">
        ✕
      </button>
    </div>
  );
}

// ── Empty line factory ────────────────────────────────────────────────────────
const emptyLine = () => ({
  sku: "", name: "", qty: 0, costPrice: 0, sellPrice: 0, minStock: 10, isNew: true,
});

// ── Main Component ────────────────────────────────────────────────────────────
export default function POSPurchaseInvoice({ existingProducts = [], onSave }) {
  const [supplier, setSupplier] = useState("");
  const [notes, setNotes]       = useState("");
  const [lines, setLines]       = useState([emptyLine()]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [saved, setSaved]             = useState(false);
  const [savedInvoice, setSavedInvoice] = useState(null);
  const [toast, setToast]             = useState(null);

  const invoiceRef = useRef(`PO-${uid()}`);
  const dateRef    = useRef(nowStr());

  const total = lines.reduce((s, l) => s + (l.qty || 0) * (l.costPrice || 0), 0);

  // ── Toast ─────────────────────────────────────────────────────────────────
  const fireToast = (msg, type = "success") => {
    setToast({ msg, type, key: Date.now() });
    setTimeout(() => setToast(null), 2500);
  };

  // ── Line helpers ──────────────────────────────────────────────────────────
  const updateLine = (idx, patch) =>
    setLines((prev) => prev.map((l, i) => (i === idx ? { ...l, ...patch } : l)));

  const removeLine = (idx) =>
    setLines((prev) => prev.filter((_, i) => i !== idx));

  const addLine = () => setLines((prev) => [...prev, emptyLine()]);

  // ── Validation ────────────────────────────────────────────────────────────
  const validate = () => {
    if (lines.length === 0) { fireToast("Add at least one product line", "error"); return false; }
    for (let i = 0; i < lines.length; i++) {
      const l = lines[i];
      if (!l.sku.trim())        { fireToast(`Line ${i + 1}: SKU is required`, "error"); return false; }
      if (!l.name.trim())       { fireToast(`Line ${i + 1}: Product name is required`, "error"); return false; }
      if (!l.qty || l.qty < 1)  { fireToast(`Line ${i + 1}: Quantity must be ≥ 1`, "error"); return false; }
      if (!l.costPrice || l.costPrice <= 0) { fireToast(`Line ${i + 1}: Cost price is required`, "error"); return false; }
      if (!l.sellPrice || l.sellPrice <= 0) { fireToast(`Line ${i + 1}: Selling price is required`, "error"); return false; }
    }
    return true;
  };

  // ── Confirm & save ────────────────────────────────────────────────────────
  const handleConfirm = () => {
    const invoice = {
      ref:      invoiceRef.current,
      date:     dateRef.current,
      supplier,
      notes,
      lines,
    };

    // In real app: call your API here to:
    // 1. INSERT/UPDATE tbl_products (name, sku, price, stock += qty, min_stock)
    // 2. INSERT tbl_stock_movements (product_id, qty, type='purchase', note, ref)
    if (onSave) onSave(invoice);

    setSavedInvoice(invoice);
    setSaved(true);
    setShowConfirm(false);
  };

  const handleNew = () => {
    setLines([emptyLine()]);
    setSupplier("");
    setNotes("");
    setSaved(false);
    setSavedInvoice(null);
    invoiceRef.current = `PO-${uid()}`;
    dateRef.current    = nowStr();
  };

  // ── Render: success ───────────────────────────────────────────────────────
  if (saved && savedInvoice) {
    return (
      <div className="pi-page">
        <SuccessView invoice={savedInvoice} onNew={handleNew} />
      </div>
    );
  }

  // ── Render: form ──────────────────────────────────────────────────────────
  return (
    <div className="pi-page">

      {/* Toast */}
      {toast && (
        <div key={toast.key} className={`pi-toast pi-toast--${toast.type}`}>
          {toast.type === "error" ? "✕" : "✓"}{"  "}{toast.msg}
        </div>
      )}

      {/* Page header */}
      <div className="pi-page-header">
        <div>
          <h1 className="pi-page-title">Purchase Invoice</h1>
          <p className="pi-page-sub">Receive stock from supplier — updates inventory automatically</p>
        </div>
        <div className="pi-page-header__meta">
          <span className="pi-ref-chip">{invoiceRef.current}</span>
          <span className="pi-date-chip">{dateRef.current}</span>
        </div>
      </div>

      {/* Invoice header fields */}
      <div className="pi-card pi-header-fields">
        <div className="pi-field-group">
          <label className="pi-label">Supplier Name</label>
          <input
            className="pi-input"
            placeholder="e.g. ABC Distributors"
            value={supplier}
            onChange={(e) => setSupplier(e.target.value)}
          />
        </div>
        <div className="pi-field-group pi-field-group--grow">
          <label className="pi-label">Notes / Reference</label>
          <input
            className="pi-input"
            placeholder="Optional delivery note, PO number…"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
      </div>

      {/* Lines table */}
      <div className="pi-card">
        <div className="pi-lines-header">
          <span className="pi-section-title">Products Received</span>
          <span className="pi-lines-count">{lines.length} line{lines.length !== 1 ? "s" : ""}</span>
        </div>

        {/* Column headers */}
        <div className="pi-col-headers">
          <div className="pi-col-headers__num">#</div>
          <div className="pi-col-headers__sku">SKU</div>
          <div className="pi-col-headers__name">Product Name</div>
          <div className="pi-col-headers__sm">Qty</div>
          <div className="pi-col-headers__sm">Cost Price</div>
          <div className="pi-col-headers__sm">Sell Price</div>
          <div className="pi-col-headers__sm">Min Stock</div>
          <div className="pi-col-headers__sub">Subtotal</div>
          <div className="pi-col-headers__rm" />
        </div>

        {/* Line rows */}
        <div className="pi-lines-list">
          {lines.map((line, idx) => (
            <LineRow
              key={idx}
              line={line}
              index={idx}
              existingProducts={existingProducts}
              onChange={updateLine}
              onRemove={removeLine}
            />
          ))}
        </div>

        <button className="pi-add-line-btn" onClick={addLine}>
          + Add Product Line
        </button>
      </div>

      {/* Footer totals + actions */}
      <div className="pi-footer">
        <div className="pi-footer__summary">
          <div className="pi-footer__row">
            <span>Lines</span><span>{lines.length}</span>
          </div>
          <div className="pi-footer__row">
            <span>Total Units</span>
            <span>{lines.reduce((s, l) => s + (l.qty || 0), 0)}</span>
          </div>
          <div className="pi-footer__divider" />
          <div className="pi-footer__row pi-footer__row--total">
            <span>Total Purchase Cost</span>
            <strong>${fmt(total)}</strong>
          </div>
        </div>
        <div className="pi-footer__actions">
          <button className="pi-btn pi-btn--ghost" onClick={handleNew}>
            Reset
          </button>
          <button
            className="pi-btn pi-btn--primary"
            onClick={() => { if (validate()) setShowConfirm(true); }}
          >
            Review &amp; Confirm →
          </button>
        </div>
      </div>

      {/* Confirm modal */}
      {showConfirm && (
        <ConfirmModal
          invoice={{ ref: invoiceRef.current, date: dateRef.current, supplier, notes, lines }}
          onConfirm={handleConfirm}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </div>
  );
}