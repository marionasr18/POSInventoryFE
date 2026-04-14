import React, { useState, useMemo } from 'react';

const fmtMoney = (n) =>
  new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(
    Number(n) || 0
  );

function lineTotal(d) {
  if (d.ptd_total != null && d.ptd_total !== '') return Number(d.ptd_total);
  return Number(d.ptd_quantity) * Number(d.ptd_price);
}

function saleTotal(details) {
  if (!details?.length) return 0;
  return details.reduce((s, d) => {
    const line = lineTotal(d);
    return s + (Number.isFinite(line) ? line : 0);
  }, 0);
}

function saleUnits(details) {
  if (!details?.length) return 0;
  return details.reduce((s, d) => s + Number(d.ptd_quantity || 0), 0);
}

const TransactionsTab = ({ transactions, loading, error, onRetry }) => {
  const [selectedId, setSelectedId] = useState(null);

  const sorted = useMemo(
    () =>
      [...transactions].sort((a, b) => Number(b.pth_id) - Number(a.pth_id)),
    [transactions]
  );

  const toggleSelect = (pthId) => {
    setSelectedId((prev) => (prev === pthId ? null : pthId));
  };

  if (loading && transactions.length === 0) {
    return (
      <div className="tab-content">
        <div className="empty-state">Loading transactions…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="tab-content">
        <div className="empty-state">
          {error}
          {onRetry && (
            <button type="button" className="tab-retry-btn" onClick={onRetry}>
              Retry
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="tab-content">
      <p className="transactions-tab-hint">Select a sale to view line items.</p>
      <div className="transactions-list">
        {sorted.length === 0 ? (
          <div className="empty-state">No sales recorded yet</div>
        ) : (
          sorted.map((t) => {
            const id = t.pth_id;
            const isOpen = selectedId === id;
            const details = t.details || [];
            const units = saleUnits(details);
            const total = saleTotal(details);
            const when = t.pth_created_at ? new Date(t.pth_created_at) : null;
            const typeLabel =
              (t.pth_type || '').toUpperCase() === 'OUT' ? 'Sale' : String(t.pth_type || '—');

            return (
              <div
                key={id}
                className={`transaction-card transaction-card--clickable${isOpen ? ' transaction-card--selected' : ''}`}
                role="button"
                tabIndex={0}
                onClick={() => toggleSelect(id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleSelect(id);
                  }
                }}
              >
                <div className="transaction-header">
                  <div>
                    <div className="transaction-title">Sale #{id}</div>
                    <div className="transaction-sub">
                      {when ? when.toLocaleString() : '—'}
                      {t.pth_customer_name ? ` · ${t.pth_customer_name}` : ''}
                    </div>
                  </div>
                  <div className="transaction-header__right">
                    <div className={`badge ${(t.pth_type || '').toLowerCase() === 'out' ? 'out' : 'in'}`}>
                      {typeLabel}
                    </div>
                  </div>
                </div>
                <div className="transaction-body">
                  <div className="row">
                    <span className="label">Items</span>
                    <span className="value">{details.length} SKU(s) · {units} units</span>
                  </div>
                  <div className="row">
                    <span className="label">Total</span>
                    <span className="value">${fmtMoney(total)}</span>
                  </div>
                  {t.pth_reference ? (
                    <div className="row">
                      <span className="label">Reference</span>
                      <span className="value note">{t.pth_reference}</span>
                    </div>
                  ) : null}
                </div>
                {isOpen && details.length > 0 && (
                  <div className="transaction-lines">
                    <table className="transaction-lines__table">
                      <thead>
                        <tr>
                          <th>Product</th>
                          <th className="num">Qty</th>
                          <th className="num">Price</th>
                          <th className="num">Line total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {details.map((d) => (
                          <tr key={d.ptd_id}>
                            <td>{d.prd_name}</td>
                            <td className="num">{d.ptd_quantity}</td>
                            <td className="num">${fmtMoney(d.ptd_price)}</td>
                            <td className="num">${fmtMoney(lineTotal(d))}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default TransactionsTab;
