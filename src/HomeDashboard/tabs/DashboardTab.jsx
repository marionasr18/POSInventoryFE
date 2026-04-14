import React from 'react';

const fmtMoney = (n) =>
  new Intl.NumberFormat('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(
    Number(n) || 0
  );

function lineTotal(d) {
  if (d.ptd_total != null && d.ptd_total !== '') return Number(d.ptd_total);
  return Number(d.ptd_quantity) * Number(d.ptd_price);
}

function saleSummary(t) {
  const details = t.details || [];
  const qty = details.reduce((s, d) => s + Number(d.ptd_quantity || 0), 0);
  const total = details.reduce((s, d) => {
    const line = lineTotal(d);
    return s + (Number.isFinite(line) ? line : 0);
  }, 0);
  const label =
    details.length === 1
      ? details[0].prd_name
      : details.length > 1
        ? `${details.length} products`
        : 'Sale';
  return { label, qty, total, when: t.pth_created_at };
}

const DashboardTab = ({ products, transactions, lowStockAlerts }) => {
  const recent = [...(transactions || [])]
    .sort((a, b) => Number(b.pth_id) - Number(a.pth_id))
    .slice(0, 3);

  return (
    <div className="dashboard-grid">
      <div className="stat-card">
        <div className="stat-value">{products.length}</div>
        <div className="stat-label">Total products</div>
      </div>
      <div className="stat-card">
        <div className="stat-value">
          {products.reduce((sum, p) => sum + Number(p.prd_stock || 0), 0)}
        </div>
        <div className="stat-label">Total stock</div>
      </div>
      <div className="stat-card alert">
        <div className="stat-value">{lowStockAlerts.length}</div>
        <div className="stat-label">Low stock items</div>
      </div>
      <div className="stat-card success">
        <div className="stat-value">
          $
          {products
            .reduce(
              (sum, p) => sum + Number(p.prd_stock || 0) * Number(p.prd_cost_price || 0),
              0
            )
            .toLocaleString('en-US', { maximumFractionDigits: 0 })}
        </div>
        <div className="stat-label">Inventory value (at cost)</div>
      </div>

      <div className="quick-stats">
        <h3>Recent sales</h3>
        <div className="transaction-list">
          {recent.length === 0 ? (
            <div className="transaction-item transaction-item--muted">
              <div className="transaction-info">
                <div className="transaction-product">No sales yet</div>
              </div>
            </div>
          ) : (
            recent.map((t) => {
              const s = saleSummary(t);
              return (
                <div key={t.pth_id} className="transaction-item">
                  <div className="transaction-info">
                    <div className="transaction-product">
                      #{t.pth_id} · {s.label}
                    </div>
                    <div className="transaction-note">
                      {s.when ? new Date(s.when).toLocaleString() : ''} · ${fmtMoney(s.total)}
                    </div>
                  </div>
                  <div className="transaction-qty out">−{s.qty}</div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardTab;
