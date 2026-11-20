import { useState, useMemo } from "react";
import "./DailyReportTab.css";

const LBP_RATE = 89500;

const fmt = (n) =>
  new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(
    Number(n) || 0
  );
const fmtLBP = (n) =>
  new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(
    Math.round(Number(n) || 0)
  );

function toLocalDateKey(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function todayKey() {
  return toLocalDateKey(new Date());
}

function txDateKey(tx) {
  const raw = tx.pth_created_at || tx.pth_date;
  if (!raw) return null;
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? null : toLocalDateKey(d);
}

function timeStr(tx) {
  const raw = tx.pth_created_at || tx.pth_date;
  if (!raw) return "—";
  return new Date(raw).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

function lineTotal(d) {
  if (d.ptd_total != null && d.ptd_total !== "") return Number(d.ptd_total);
  return Number(d.ptd_quantity) * Number(d.ptd_price);
}

function txAmount(tx) {
  const header = Number(tx.pth_TotalPrice);
  if (Number.isFinite(header) && header > 0) return header;
  return (tx.details || []).reduce((s, d) => s + lineTotal(d), 0);
}

function txUnits(tx) {
  return (tx.details || []).reduce((s, d) => s + Number(d.ptd_quantity || 0), 0);
}

function formatDateHeading(dateKey) {
  const [y, m, d] = dateKey.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  return dt.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function TransactionCard({ tx, expanded, onToggle }) {
  const amount = txAmount(tx);
  const isPurchase = (tx.pth_type || "").toUpperCase() === "IN";
  const typeLabel = isPurchase ? "Purchase" : "Sale";
  const party = tx.pth_customer_name;

  return (
    <article className={`dr-card dr-card--${isPurchase ? "in" : "out"}`}>
      <button type="button" className="dr-card__head" onClick={onToggle} aria-expanded={expanded}>
        <span className="dr-card__type">{typeLabel}</span>
        <div className="dr-card__main">
          <div className="dr-card__title-row">
            <span className="dr-card__id">#{tx.pth_id}</span>
            {party ? <span className="dr-card__party">{party}</span> : null}
            {tx.pth_reference ? (
              <span className="dr-card__ref" title="Reference">
                {tx.pth_reference}
              </span>
            ) : null}
          </div>
          <div className="dr-card__meta">
            <span>{timeStr(tx)}</span>
            <span className="dr-card__meta-sep">·</span>
            <span>
              {tx.details?.length || 0} line{(tx.details?.length || 0) !== 1 ? "s" : ""}
            </span>
            <span className="dr-card__meta-sep">·</span>
            <span>{txUnits(tx)} units</span>
          </div>
        </div>
        <div className="dr-card__amounts">
          <span className="dr-card__usd">${fmt(amount)}</span>
          <span className="dr-card__lbp">LL {fmtLBP(amount * LBP_RATE)}</span>
        </div>
        <span className={`dr-card__chevron${expanded ? " dr-card__chevron--open" : ""}`} aria-hidden>
          ▾
        </span>
      </button>

      {expanded && tx.details?.length > 0 && (
        <div className="dr-card__body">
          <table className="dr-lines-table">
            <thead>
              <tr>
                <th>Product</th>
                <th className="num">Code</th>
                <th className="num">Qty</th>
                <th className="num">Price</th>
                <th className="num">Line total</th>
              </tr>
            </thead>
            <tbody>
              {tx.details.map((d) => (
                <tr key={d.ptd_id ?? `${d.ptd_prd_id}-${d.prd_name}`}>
                  <td>
                    <span className="dr-lines-table__name">{d.prd_name}</span>
                    {d.ptd_brand ? (
                      <span className="dr-lines-table__sub">{d.ptd_brand}</span>
                    ) : null}
                  </td>
                  <td className="num muted">{d.prd_sku || "—"}</td>
                  <td className="num">{d.ptd_quantity}</td>
                  <td className="num">${fmt(d.ptd_price)}</td>
                  <td className="num strong">${fmt(lineTotal(d))}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={4} className="dr-lines-table__foot-label">
                  {typeLabel} total
                </td>
                <td className="num">
                  <div className="strong">${fmt(amount)}</div>
                  <div className="dr-lines-table__lbp">LL {fmtLBP(amount * LBP_RATE)}</div>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </article>
  );
}

export default function DailyReport({
  transactions = [],
  loading = false,
  error = "",
  onRetry,
}) {
  const [selectedDate, setSelectedDate] = useState(todayKey());
  const [expandedId, setExpandedId] = useState(null);
  const [filter, setFilter] = useState("all");

  const dayTx = useMemo(
    () => transactions.filter((t) => txDateKey(t) === selectedDate),
    [transactions, selectedDate]
  );

  const filtered = useMemo(() => {
    if (filter === "sales") return dayTx.filter((t) => (t.pth_type || "OUT").toUpperCase() !== "IN");
    if (filter === "purchases") return dayTx.filter((t) => (t.pth_type || "").toUpperCase() === "IN");
    return dayTx;
  }, [dayTx, filter]);

  const stats = useMemo(() => {
    const sales = dayTx.filter((t) => (t.pth_type || "OUT").toUpperCase() !== "IN");
    const purchases = dayTx.filter((t) => (t.pth_type || "").toUpperCase() === "IN");

    const salesRevenue = sales.reduce((s, t) => s + txAmount(t), 0);
    const purchaseCost = purchases.reduce((s, t) => s + txAmount(t), 0);
    const itemsSold = sales.reduce((s, t) => s + txUnits(t), 0);
    const itemsPurchased = purchases.reduce((s, t) => s + txUnits(t), 0);
    const avgSale = sales.length > 0 ? salesRevenue / sales.length : 0;
    const largestSale =
      sales.length > 0 ? Math.max(...sales.map((t) => txAmount(t))) : 0;

    return {
      salesRevenue,
      purchaseCost,
      salesCount: sales.length,
      purchaseCount: purchases.length,
      itemsSold,
      itemsPurchased,
      avgSale,
      largestSale,
      totalCount: dayTx.length,
    };
  }, [dayTx]);

  const sorted = useMemo(
    () =>
      [...filtered].sort((a, b) => {
        const ta = new Date(a.pth_created_at || a.pth_date || 0).getTime();
        const tb = new Date(b.pth_created_at || b.pth_date || 0).getTime();
        return tb - ta;
      }),
    [filtered]
  );

  const toggle = (id) => setExpandedId((prev) => (prev === id ? null : id));

  return (
    <div className="tab-content daily-report">
      <header className="dr-toolbar">
        <div className="dr-toolbar__left">
          <label className="dr-date-label" htmlFor="dr-date">
            Report date
          </label>
          <input
            id="dr-date"
            type="date"
            className="dr-date-input"
            value={selectedDate}
            onChange={(e) => {
              setExpandedId(null);
              setSelectedDate(e.target.value);
            }}
          />
          <button
            type="button"
            className="dr-btn dr-btn--ghost"
            onClick={() => setSelectedDate(todayKey())}
          >
            Today
          </button>
        </div>
        {onRetry && (
          <button
            type="button"
            className="dr-btn dr-btn--primary"
            onClick={onRetry}
            disabled={loading}
          >
            {loading ? "Refreshing…" : "Refresh"}
          </button>
        )}
      </header>

      <section className="dr-hero">
        <p className="dr-hero__date">{formatDateHeading(selectedDate)}</p>
        <p className="dr-hero__label">Net sales revenue</p>
        <p className="dr-hero__usd">${fmt(stats.salesRevenue)}</p>
        <p className="dr-hero__lbp">LL {fmtLBP(stats.salesRevenue * LBP_RATE)}</p>
        {stats.purchaseCost > 0 && (
          <p className="dr-hero__sub">
            Stock received today: ${fmt(stats.purchaseCost)} ({stats.purchaseCount} purchase
            {stats.purchaseCount !== 1 ? "s" : ""})
          </p>
        )}
      </section>

      <section className="dr-stats" aria-label="Summary">
        <div className="dr-stat">
          <span className="dr-stat__label">Sales</span>
          <span className="dr-stat__value">{stats.salesCount}</span>
        </div>
        <div className="dr-stat">
          <span className="dr-stat__label">Items sold</span>
          <span className="dr-stat__value">{stats.itemsSold}</span>
        </div>
        <div className="dr-stat">
          <span className="dr-stat__label">Avg. sale</span>
          <span className="dr-stat__value">${fmt(stats.avgSale)}</span>
        </div>
        <div className="dr-stat">
          <span className="dr-stat__label">Largest sale</span>
          <span className="dr-stat__value">${fmt(stats.largestSale)}</span>
        </div>
        <div className="dr-stat dr-stat--muted">
          <span className="dr-stat__label">Purchases</span>
          <span className="dr-stat__value">{stats.purchaseCount}</span>
        </div>
        <div className="dr-stat dr-stat--muted">
          <span className="dr-stat__label">Units in</span>
          <span className="dr-stat__value">{stats.itemsPurchased}</span>
        </div>
      </section>

      <div className="dr-section-head">
        <h2 className="dr-section-head__title">Activity</h2>
        <div className="dr-filters" role="tablist" aria-label="Filter transactions">
          {[
            { key: "all", label: `All (${stats.totalCount})` },
            { key: "sales", label: `Sales (${stats.salesCount})` },
            { key: "purchases", label: `Purchases (${stats.purchaseCount})` },
          ].map(({ key, label }) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={filter === key}
              className={`dr-filter${filter === key ? " dr-filter--active" : ""}`}
              onClick={() => {
                setFilter(key);
                setExpandedId(null);
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="dr-empty dr-empty--error">
          <p>{error}</p>
          {onRetry && (
            <button type="button" className="dr-btn dr-btn--primary" onClick={onRetry}>
              Try again
            </button>
          )}
        </div>
      )}

      {!error && loading && dayTx.length === 0 && (
        <div className="dr-empty">Loading transactions…</div>
      )}

      {!error && !loading && sorted.length === 0 && (
        <div className="dr-empty">
          <p className="dr-empty__title">
            {dayTx.length === 0
              ? "No activity on this date"
              : `No ${filter === "purchases" ? "purchases" : filter === "sales" ? "sales" : "transactions"} to show`}
          </p>
          <p className="dr-empty__hint">
            {dayTx.length === 0
              ? "Pick another day or record sales from POS and purchases from the purchase invoice screen."
              : "Try another filter or expand the date range."}
          </p>
        </div>
      )}

      <div className="dr-list">
        {sorted.map((tx) => (
          <TransactionCard
            key={tx.pth_id}
            tx={tx}
            expanded={expandedId === tx.pth_id}
            onToggle={() => toggle(tx.pth_id)}
          />
        ))}
      </div>

      <p className="dr-footnote">
        Exchange rate for display: 1 USD = LL {fmtLBP(LBP_RATE)}
      </p>
    </div>
  );
}