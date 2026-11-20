import { useState, useEffect, useCallback } from "react";
import POSPurchaseInvoice from "./POSPurchaseInvoice";
import { FetchData } from "../functions";

const PRODUCTS_API = "http://localhost:3001/api/products";
const PURCHASES_API = "http://localhost:3001/api/purchases";

function mapApiProduct(p) {
  return {
    prd_id: p.prd_id,
    name: p.prd_name,
    sku: p.prd_sku,
    brand: p.prd_brand || "",
    unit: (p.prd_unit || "pcs").toLowerCase(),
    price: Number(p.prd_selling_price),
    cost: Number(p.prd_cost_price),
    stock: Number(p.prd_stock),
    min_stock: Number(p.prd_min_stock ?? 10),
  };
}

export default function POSPurchasePage() {
  const [products, setProducts] = useState([]);

  const loadProducts = useCallback(async () => {
    try {
      const data = await FetchData(PRODUCTS_API, "get");
      if (data.status === 200 && Array.isArray(data.data)) {
        setProducts(data.data.map(mapApiProduct));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleSave = async (invoice) => {
    const payload = {
      pth_reference: invoice.supplierInvoiceNo?.trim() || invoice.ref,
      pth_supplier_name: invoice.supplier,
      pth_currency: invoice.currency || "USD",
      pth_notes: [invoice.notes, invoice.deliveryDate ? `Delivery: ${invoice.deliveryDate}` : ""]
        .filter(Boolean)
        .join(" · "),
      pth_TotalPrice: invoice.total,
      lines: invoice.lines.map((l) => ({
        prd_id: l.prd_id,
        prd_sku: l.sku,
        prd_name: l.name,
        prd_brand: l.brand,
        prd_unit: l.unit,
        qty: l.qty,
        qty_per_pack: l.qtyPerPcs || 1,
        unit_cost: l.costPrice,
        discount_pct: l.discountPct || 0,
        selling_price: l.sellPrice,
        min_stock: l.minStock,
      })),
    };
    const res = await FetchData(PURCHASES_API, "post", payload);
    if (res.status !== 201) {
      throw new Error(res.data?.error || res.data?.message || "Failed to save purchase");
    }
    await loadProducts();
    return res.data;
  };

  return <POSPurchaseInvoice existingProducts={products} onSave={handleSave} />;
}