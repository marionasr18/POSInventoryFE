import { useState, useMemo } from "react";
import transactionsData from "./transactions.json";
import "./DailyReportTab.css";

const LBP_RATE = 89500;

const fmt    = (n) => new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
const fmtLBP = (n) => new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(Math.round(n));

const COLORS = ["c0","c1","c2","c3","c4","c5","c6","c7"];

function timeStr(iso) {
  return new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

function todayLabel() {
  return new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

function TransactionCard({ tx, colorClass, expanded, onToggle }) {
  const amount = Number(tx.pth_TotalPrice);
  const itemCount = tx.details.reduce((s, d) => s + Number(d.ptd_quantity), 0);

  return (
    <div className={`txn-card txn-card--${colorClass}`} onClick={onToggle}>
      <div className="txn-card__top">
        <div className="txn-card__accent" />
        <div className="txn-card__body">
          <div className="txn-card__row1">
            <div className="txn-card__id-wrap">
              <span className="txn-card__id">#{tx.pth_id}</span>
              {tx.pth_customer_name && (
                <span className="txn-card__customer">{tx.pth_customer_name}</span>
              )}
            </div>
            <div className="txn-card__amount-wrap">
              <span className="txn-card__usd">${fmt(amount)}</span>
              <span className="txn-card__lbp">LL {fmtLBP(amount * LBP_RATE)}</span>
            </div>
            <span className={`txn-card__chevron${expanded ? " txn-card__chevron--open" : ""}`}>›</span>
          </div>
          <div className="txn-card__row2">
            <span className="txn-card__time">{timeStr(tx.pth_date)}</span>
            {tx.pth_reference && (
              <>
                <span className="txn-card__dot" />
                <span className="txn-card__ref">{tx.pth_reference}</span>
              </>
            )}
            <span className="txn-card__items-count">{itemCount} item{itemCount !== 1 ? "s" : ""}</span>
          </div>
        </div>
      </div>

      {expanded && (
        <div className="txn-card__details">
          <div className="txn-details-header">
            <span>Product</span>
            <span>Qty</span>
            <span>Total</span>
          </div>
          {tx.details.map((d, i) => {
            const lineTotal = Number(d.ptd_price) * Number(d.ptd_quantity);
            return (
              <div key={i} className="txn-detail-row">
                <span className="txn-detail-name">{d.prd_name}</span>
                <span className="txn-detail-qty">×{d.ptd_quantity}</span>
                <span className="txn-detail-total">${fmt(lineTotal)}</span>
              </div>
            );
          })}
          <div className="txn-detail-subtotal-row">
            <span className="txn-detail-subtotal-label">Sale total</span>
            <div style={{ textAlign: "right" }}>
              <span className="txn-detail-subtotal-value">${fmt(amount)}</span>
              <div style={{ fontSize: "10px", color: "#9a9ab0", marginTop: "1px" }}>
                LL {fmtLBP(amount * LBP_RATE)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DailyReport() {
  const [expandedId, setExpandedId] = useState(null);
  const txs = transactionsData.transactions;

  const stats = useMemo(() => {
    const total = txs.reduce((s, t) => s + Number(t.pth_TotalPrice), 0);
    const avg   = txs.length > 0 ? total / txs.length : 0;
    const items = txs.reduce((s, t) => s + t.details.reduce((ss, d) => ss + Number(d.ptd_quantity), 0), 0);
    const largest = txs.length > 0 ? Math.max(...txs.map(t => Number(t.pth_TotalPrice))) : 0;
    return { total, avg, items, count: txs.length, largest };
  }, [txs]);

  const toggle = (id) => setExpandedId((prev) => (prev === id ? null : id));
  const sorted = txs.slice().reverse();

  return (
    <div className="tab-content">
      <div className="txn-hero">
        <div className="txn-hero__date">{todayLabel()}</div>
        <div className="txn-hero__label">Total revenue</div>
        <div className="txn-hero__usd">${fmt(stats.total)}</div>
        <div className="txn-hero__lbp">LL {fmtLBP(stats.total * LBP_RATE)}</div>
      </div>

      <div className="txn-pills">
        <div className="txn-pill txn-pill--teal">
          <span className="txn-pill__label">Transactions</span>
          <span className="txn-pill__value">{stats.count}</span>
        </div>
        <div className="txn-pill txn-pill--amber">
          <span className="txn-pill__label">Items sold</span>
          <span className="txn-pill__value">{stats.items}</span>
        </div>
        <div className="txn-pill txn-pill--purple">
          <span className="txn-pill__label">Avg. sale</span>
          <span className="txn-pill__value">${fmt(stats.avg)}</span>
        </div>
        <div className="txn-pill txn-pill--teal">
          <span className="txn-pill__label">Largest</span>
          <span className="txn-pill__value">${fmt(stats.largest)}</span>
        </div>
      </div>

      <div className="txn-section-head">
        <span className="txn-section-head__title">Transactions</span>
        <span className="txn-section-head__count">{stats.count} today</span>
      </div>

      <div className="txn-list">
        {sorted.map((tx, i) => (
          <TransactionCard
            key={tx.pth_id}
            tx={tx}
            colorClass={COLORS[i % COLORS.length]}
            expanded={expandedId === tx.pth_id}
            onToggle={() => toggle(tx.pth_id)}
          />
        ))}
      </div>
    </div>
  );
}