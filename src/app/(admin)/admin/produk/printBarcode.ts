"use client";

import JsBarcode from "jsbarcode";
import { encodePrice } from "@/lib/barcode-encode";

interface BarcodeProduct {
  id: number;
  name: string;
  sku: string;
  price: number;
  priceReseller: number | null;
  cost: number | null;
}

interface PrintOptions {
  showCost?: boolean;
  showReseller?: boolean;
  showNormal?: boolean;
}

function generateBarcodeSvg(product: BarcodeProduct): string {
  const canvas = document.createElement("canvas");
  try {
    JsBarcode(canvas, product.sku, {
      format: "CODE128",
      width: 1.5,
      height: 40,
      displayValue: true,
      fontSize: 12,
      textMargin: 2,
      margin: 5,
      background: "#ffffff",
      lineColor: "#000000",
    });
    return canvas.toDataURL("image/png");
  } catch {
    return "";
  }
}

function buildBarcodeHtml(products: BarcodeProduct[], copies: number, options: PrintOptions): string {
  const { showCost = false, showReseller = false, showNormal = false } = options;
      let labelsHtml = "";

  for (const product of products) {
    for (let c = 0; c < copies; c++) {
      const barcodeDataUrl = generateBarcodeSvg(product);

      const hiddenPrices: string[] = [];
      if (showNormal) {
        hiddenPrices.push(`HJ-${encodePrice(product.price)}`);
      }
      if (showCost && product.cost !== null) {
        hiddenPrices.push(`HB-${encodePrice(product.cost)}`);
      }
      if (showReseller && product.priceReseller !== null) {
        hiddenPrices.push(`HR-${encodePrice(product.priceReseller)}`);
      }
      const hiddenStr = hiddenPrices.length > 0 ? hiddenPrices.join(" | ") : "";

      labelsHtml += `
        <div class="label">
          ${barcodeDataUrl ? `<img src="${barcodeDataUrl}" alt="Barcode ${product.sku}" />` : ""}
          <div class="product-name">${product.name}</div>
          ${showNormal ? "" : `<div class="product-price">Rp ${product.price.toLocaleString("id-ID")}</div>`}
          ${hiddenStr ? `<div class="product-code">${hiddenStr}</div>` : ""}
        </div>`;
    }
  }

  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <title>Cetak Barcode</title>
  <style>
    @page {
      size: A4 auto;
      margin: 10mm;
    }
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    html, body {
      background: #fff;
      color: #000;
      font-family: "Arial", "Helvetica", sans-serif;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 4mm;
    }
    .label {
      border: 1px dashed #ccc;
      padding: 3mm;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 30mm;
      page-break-inside: avoid;
    }
    .label img {
      max-width: 100%;
      height: auto;
    }
    .product-name {
      font-size: 8pt;
      font-weight: 700;
      margin-top: 1mm;
      color: #000;
      max-width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .product-price {
      font-size: 8pt;
      font-weight: 700;
      color: #000;
      margin-top: 0.5mm;
    }
    .product-code {
      font-size: 6pt;
      color: #444;
      font-family: "Courier New", monospace;
      margin-top: 0.3mm;
      letter-spacing: 0.5px;
    }
  </style>
</head>
<body>
  <div class="grid">
    ${labelsHtml}
  </div>
</body>
</html>`;
}

export function printBarcodes(products: BarcodeProduct[], copies: number = 1, options: PrintOptions = {}) {
  if (products.length === 0) return;

  const html = buildBarcodeHtml(products, copies, options);
  const printWindow = window.open("", "_blank", "width=800,height=600");
  if (!printWindow) {
    alert("Popup diblokir browser. Izinkan popup untuk cetak barcode.");
    return;
  }
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 500);
  };
}
