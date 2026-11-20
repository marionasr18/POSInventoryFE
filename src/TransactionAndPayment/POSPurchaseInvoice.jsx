import { useState, useRef } from "react";
import "./POSPurchaseInvoice.css";
import { lineSubtotal, invoiceTotal, stockQty } from "./purchaseLineMath";

// ── Helpers ──────────────────────────────────────────────────────────────────
const fmt    = (n) => new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
const nowStr = ()  => new Date().toLocaleString("en-GB", { dateStyle: "short", timeStyle: "short" });
const uid    = ()  => Math.random().toString(36).slice(2, 8).toUpperCase();
const lineTotal = (l) =>
  lineSubtotal(l.qty, l.qtyPerPcs ?? 1, l.costPrice, l.discountPct ?? 0);

// ── Confirmation Modal ────────────────────────────────────────────────────────
function ConfirmModal({ invoice, onConfirm, onCancel, busy }) {
  const total = invoice.total ?? invoiceTotal(invoice.lines);
  return (
    <div className="pi-overlay" onClick={onCancel}>
      <div className="pi-modal" onClick={(e) => e.stopPropagation()}>
        <div className="pi-modal__header">
          <h2 className="pi-modal__title">Confirm Purchase</h2>
          <p className="pi-modal__sub">Review before committing to inventory</p>
        </div>

        <div className="pi-modal__meta">
          <span><strong>Supplier:</strong> {invoice.supplier || "—"}</span>
          <span><strong>Invoice #:</strong> {invoice.supplierInvoiceNo || invoice.ref}</span>
          <span><strong>Currency:</strong> {invoice.currency || "USD"}</span>
          <span><strong>Date:</strong> {invoice.date}</span>
        </div>

        <div className="pi-modal__table-wrap">
          <table className="pi-modal__table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Product</th>
                <th>Unit</th>
                <th>Qty</th>
                <th>Qty/Pcs</th>
                <th>Stock +</th>
                <th>Price</th>
                <th>Disc%</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {invoice.lines.map((l, i) => (
                <tr key={i}>
                  <td><span className="pi-sku-chip">{l.sku}</span></td>
                  <td>{l.name}{l.brand ? <em className="pi-success__sku"> · {l.brand}</em> : null}</td>
                  <td className="pi-num">{(l.unit || "pcs").toUpperCase()}</td>
                  <td className="pi-num">{l.qty}</td>
                  <td className="pi-num">{l.qtyPerPcs ?? 1}</td>
                  <td className="pi-num">+{stockQty(l.qty, l.qtyPerPcs ?? 1)}</td>
                  <td className="pi-num">${fmt(l.costPrice)}</td>
                  <td className="pi-num">{l.discountPct || 0}%</td>
                  <td className="pi-num pi-num--accent">${fmt(lineTotal(l))}</td>
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
            <button className="pi-btn pi-btn--primary" onClick={onConfirm} disabled={busy}>
              {busy ? "Saving…" : "✓ Confirm & Update Inventory"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Success Receipt ───────────────────────────────────────────────────────────
function SuccessView({ invoice, onNew }) {
  const total = invoice.total ?? invoiceTotal(invoice.lines);
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
      sku: p.sku,
      name: p.name,
      brand: p.brand || "",
      unit: p.unit || "pcs",
      sellPrice: p.price,
      costPrice: p.cost ?? line.costPrice,
      prd_id: p.prd_id,
      isNew: false,
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
      onChange(index, {
        sku: val.toUpperCase(),
        name: exact.name,
        brand: exact.brand || "",
        unit: exact.unit || "pcs",
        sellPrice: exact.price,
        costPrice: exact.cost ?? line.costPrice,
        prd_id: exact.prd_id,
        isNew: false,
      });
    } else {
      onChange(index, { sku: val.toUpperCase(), prd_id: null, isNew: val.length > 0 });
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
          placeholder="Description / الصنف"
          value={line.name}
          onChange={(e) => onChange(index, { name: e.target.value })}
        />
      </div>

      {/* Brand */}
      <div className="pi-line-row__field pi-line-row__field--xs">
        <input
          className="pi-input"
          placeholder="Brand"
          value={line.brand || ""}
          onChange={(e) => onChange(index, { brand: e.target.value })}
        />
      </div>

      {/* Unit */}
      <div className="pi-line-row__field pi-line-row__field--xs">
        <input
          className="pi-input pi-input--center"
          placeholder="PCS"
          value={line.unit || ""}
          onChange={(e) => onChange(index, { unit: e.target.value })}
        />
      </div>

      {/* Qty */}
      <div className="pi-line-row__field pi-line-row__field--sm">
        <input
          className="pi-input pi-input--center"
          type="number"
          min="0"
          step="0.01"
          placeholder="Qty"
          value={line.qty || ""}
          onChange={(e) => onChange(index, { qty: parseFloat(e.target.value) || 0 })}
        />
      </div>

      {/* Qty per pack */}
      <div className="pi-line-row__field pi-line-row__field--xs">
        <input
          className="pi-input pi-input--center"
          type="number"
          min="1"
          step="1"
          placeholder="1"
          title="Pieces per unit (Ghazzawi Qty/Pcs). Use 1 for PCS invoices."
          value={line.qtyPerPcs ?? 1}
          onChange={(e) => onChange(index, { qtyPerPcs: parseInt(e.target.value, 10) || 1 })}
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

      {/* Discount % */}
      <div className="pi-line-row__field pi-line-row__field--xs">
        <input
          className="pi-input pi-input--center"
          type="number"
          min="0"
          max="100"
          step="0.01"
          placeholder="0"
          value={line.discountPct ?? ""}
          onChange={(e) => onChange(index, { discountPct: parseFloat(e.target.value) || 0 })}
        />
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
        ${fmt(lineTotal(line))}
        <span className="pi-line-stock-hint">+{stockQty(line.qty, line.qtyPerPcs ?? 1)} pcs</span>
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
  sku: "",
  name: "",
  brand: "",
  unit: "pcs",
  qty: 0,
  qtyPerPcs: 1,
  costPrice: 0,
  sellPrice: 0,
  discountPct: 0,
  minStock: 10,
  isNew: true,
  prd_id: null,
});

// ── Main Component ────────────────────────────────────────────────────────────
export default function POSPurchaseInvoice({ existingProducts = [], onSave }) {
  const [supplier, setSupplier] = useState("");
  const [supplierInvoiceNo, setSupplierInvoiceNo] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [notes, setNotes] = useState("");
  const [lines, setLines] = useState([emptyLine()]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [saved, setSaved] = useState(false);
  const [savedInvoice, setSavedInvoice] = useState(null);
  const [toast, setToast] = useState(null);
  const [saving, setSaving] = useState(false);

  const invoiceRef = useRef(`GRN-${uid()}`);
  const dateRef = useRef(nowStr());

  const total = invoiceTotal(lines);
  const totalStockUnits = lines.reduce(
    (s, l) => s + stockQty(l.qty, l.qtyPerPcs ?? 1),
    0
  );

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
  const handleConfirm = async () => {
    const invoice = {
      ref: invoiceRef.current,
      date: dateRef.current,
      supplier,
      supplierInvoiceNo,
      currency,
      deliveryDate,
      notes,
      lines,
      total,
    };

    if (!onSave) {
      fireToast("Purchase API is not configured", "error");
      return;
    }

    setSaving(true);
    try {
      await onSave(invoice);
      setSavedInvoice(invoice);
      setSaved(true);
      setShowConfirm(false);
    } catch (err) {
      fireToast(err.message || "Failed to save purchase", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleNew = () => {
    setLines([emptyLine()]);
    setSupplier("");
    setSupplierInvoiceNo("");
    setCurrency("USD");
    setDeliveryDate("");
    setNotes("");
    setSaved(false);
    setSavedInvoice(null);
    invoiceRef.current = `GRN-${uid()}`;
    dateRef.current = nowStr();
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
          <label className="pi-label">Supplier</label>
          <input
            className="pi-input"
            placeholder="e.g. Ghazzawi Bros."
            value={supplier}
            onChange={(e) => setSupplier(e.target.value)}
          />
        </div>
        <div className="pi-field-group">
          <label className="pi-label">Supplier invoice #</label>
          <input
            className="pi-input"
            placeholder="e.g. SAL-260006255 or 10003440"
            value={supplierInvoiceNo}
            onChange={(e) => setSupplierInvoiceNo(e.target.value)}
          />
        </div>
        <div className="pi-field-group pi-field-group--narrow">
          <label className="pi-label">Currency</label>
          <select className="pi-input" value={currency} onChange={(e) => setCurrency(e.target.value)}>
            <option value="USD">USD</option>
            <option value="LBP">LBP</option>
          </select>
        </div>
        <div className="pi-field-group">
          <label className="pi-label">Delivery date</label>
          <input
            className="pi-input"
            type="date"
            value={deliveryDate}
            onChange={(e) => setDeliveryDate(e.target.value)}
          />
        </div>
        <div className="pi-field-group pi-field-group--grow">
          <label className="pi-label">Notes</label>
          <input
            className="pi-input"
            placeholder="Driver, zone, internal reference…"
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

        <div className="pi-lines-scroll">
        {/* Column headers */}
        <div className="pi-col-headers">
          <div className="pi-col-headers__num">#</div>
          <div className="pi-col-headers__sku">Code</div>
          <div className="pi-col-headers__name">Description</div>
          <div className="pi-col-headers__xs">Brand</div>
          <div className="pi-col-headers__xs">Unit</div>
          <div className="pi-col-headers__sm">Qty</div>
          <div className="pi-col-headers__xs">Qty/Pcs</div>
          <div className="pi-col-headers__sm">Cost</div>
          <div className="pi-col-headers__xs">Disc%</div>
          <div className="pi-col-headers__sm">Sell</div>
          <div className="pi-col-headers__sm">Min</div>
          <div className="pi-col-headers__sub">Total</div>
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
      </div>

      {/* Footer totals + actions */}
      <div className="pi-footer">
        <div className="pi-footer__summary">
          <div className="pi-footer__row">
            <span>Lines</span><span>{lines.length}</span>
          </div>
          <div className="pi-footer__row">
            <span>Stock pieces</span>
            <span>{totalStockUnits}</span>
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
          invoice={{
            ref: invoiceRef.current,
            date: dateRef.current,
            supplier,
            supplierInvoiceNo,
            currency,
            notes,
            lines,
            total,
          }}
          onConfirm={handleConfirm}
          onCancel={() => setShowConfirm(false)}
          busy={saving}
        />
      )}
    </div>
  );
}