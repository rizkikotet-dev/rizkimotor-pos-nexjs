"use client";

import { formatRupiah, formatDateTime } from "@/lib/format";
import { PaperSize } from "@/lib/constants";
import type { Settings } from "@/lib/settings";

interface StrukItem {
  id: number;
  productName: string;
  productSku: string;
  quantity: number;
  price: number;
  subtotal: number;
}

interface StrukTransaction {
  id: number;
  invoiceNo: string;
  createdAt: Date | string;
  total: number;
  payment: number;
  change: number;
  user: { name: string };
  items: StrukItem[];
}

function buildStrukHtml(
  transaction: StrukTransaction,
  settings: Settings,
  paperSize: PaperSize
): string {
  const s = settings;
  const showAddress = s["receipt.showAddress"] === "true" && s["store.address"];
  const showPhone   = s["receipt.showPhone"]   === "true" && s["store.phone"];
  const showEmail   = s["receipt.showEmail"]   === "true" && s["store.email"];
  const showWebsite = s["receipt.showWebsite"] === "true" && s["store.website"];
  const showKasir   = s["receipt.showKasir"]   === "true";
  const showDate    = s["receipt.showInvoiceDate"] === "true";
  const headerNote  = s["receipt.headerNote"];

  const is58 = paperSize === PaperSize.P58MM;
  const rp   = (n: number) => formatRupiah(n);

  // font sizes (base / small / xsmall / large / xlarge)
  const fs   = is58 ? 11 : 13;
  const fsS  = is58 ? 10 : 12;
  const fsXS = is58 ?  9 : 10;
  const fsL  = is58 ? 13 : 15;
  const fsXL = is58 ? 18 : 22;

  const width      = is58 ? "56mm" : "76mm";
  const pageMargin = is58 ? "1mm 1mm" : "2mm 2mm";

  /* ── items ── */
  let itemsHtml = "";
  for (const item of transaction.items) {
    const qtyPrice = `${item.quantity} x ${rp(item.price)}`;
    const sub      = rp(item.subtotal);
    itemsHtml += `
      <tr>
        <td colspan="2" style="padding:0 0 1px 0;font-size:${fs}px;font-weight:900;color:#000;line-height:1.35">
          ${item.productName}
        </td>
      </tr>
      <tr style="border-bottom:1px dashed #000">
        <td style="padding:0 0 5px 2px;font-size:${fsS}px;font-weight:900;color:#000;line-height:1.3">
          ${qtyPrice}
        </td>
        <td style="padding:0 0 5px 0;font-size:${fsS}px;font-weight:900;color:#000;text-align:right;line-height:1.3">
          ${sub}
        </td>
      </tr>`;
  }

  const storeName  = s["store.name"] || "TOKO";
  const totalStr   = rp(transaction.total);
  const bayarStr   = rp(transaction.payment);
  const kembaliStr = rp(transaction.change);

  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Struk ${transaction.invoiceNo}</title>
  <style>
    @page {
      size: ${paperSize} auto;
      margin: ${pageMargin};
    }
    *, *::before, *::after {
      margin: 0; padding: 0;
      box-sizing: border-box;
    }
    html, body {
      width: 100%;
      background: #fff;
      color: #000;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      font-family: "Courier New", Courier, monospace;
      font-size: ${fs}px;
      font-weight: 900;
      line-height: 1.4;
      color: #000;
    }
    .receipt {
      width: ${width};
      max-width: ${width};
      margin: 0 auto;
      padding: 2mm 1mm 4mm;
    }

    /* ── dividers ── */
    .divider-solid {
      border: none;
      border-top: 2.5px solid #000;
      margin: 5px 0;
    }
    .divider-dash {
      border: none;
      border-top: 1.5px dashed #000;
      margin: 5px 0;
    }

    /* ── header ── */
    .store-name {
      font-size: ${fsXL}px;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 2px;
      text-align: center;
      color: #000;
      line-height: 1.2;
      margin-bottom: 2px;
    }
    .header-note {
      font-size: ${fsS}px;
      font-weight: 900;
      text-align: center;
      color: #000;
      line-height: 1.3;
    }
    .header-sub {
      font-size: ${fsXS}px;
      font-weight: 900;
      text-align: center;
      color: #000;
      line-height: 1.4;
    }

    /* ── info rows ── */
    .info-table {
      width: 100%;
      border-collapse: collapse;
    }
    .info-table td {
      font-size: ${fsS}px;
      font-weight: 900;
      color: #000;
      line-height: 1.6;
      vertical-align: top;
    }
    .info-table td.label {
      white-space: nowrap;
      padding-right: 3px;
    }
    .info-table td.value {
      font-weight: 900;
      color: #000;
    }

    /* ── items table ── */
    .items-table {
      width: 100%;
      border-collapse: collapse;
    }

    /* ── totals ── */
    .totals-table {
      width: 100%;
      border-collapse: collapse;
    }
    .totals-table td {
      font-size: ${fsS}px;
      font-weight: 900;
      color: #000;
      line-height: 1.7;
    }
    .totals-table td.amount {
      text-align: right;
      font-weight: 900;
      color: #000;
    }
    .total-main {
      font-size: ${fsL}px !important;
      font-weight: 900 !important;
      color: #000 !important;
      letter-spacing: 0.5px;
    }

    /* ── footer ── */
    .footer {
      text-align: center;
      margin-top: 4px;
    }
    .footer-line1 {
      font-size: ${fsS}px;
      font-weight: 900;
      color: #000;
      line-height: 1.5;
    }
    .footer-line2 {
      font-size: ${fsXS}px;
      font-weight: 900;
      color: #000;
      line-height: 1.5;
    }
    .footer-invoice {
      font-size: ${fsXS}px;
      font-weight: 900;
      color: #000;
      margin-top: 3px;
      letter-spacing: 1px;
    }
  </style>
</head>
<body>
<div class="receipt">

  <!-- HEADER -->
  <div style="margin-bottom:4px">
    <div class="store-name">${storeName}</div>
    ${headerNote  ? `<div class="header-note">${headerNote}</div>` : ""}
    ${showAddress ? `<div class="header-sub">${s["store.address"]}</div>` : ""}
    ${showPhone   ? `<div class="header-sub">Telp: ${s["store.phone"]}</div>` : ""}
    ${showEmail   ? `<div class="header-sub">${s["store.email"]}</div>` : ""}
    ${showWebsite ? `<div class="header-sub">${s["store.website"]}</div>` : ""}
  </div>

  <hr class="divider-solid">

  <!-- INFO TRANSAKSI -->
  <table class="info-table" style="margin-bottom:4px">
    ${showDate ? `
    <tr>
      <td class="label">Tanggal</td>
      <td class="label" style="width:6px">:</td>
      <td class="value">${formatDateTime(transaction.createdAt)}</td>
    </tr>` : ""}
    <tr>
      <td class="label">Invoice</td>
      <td class="label" style="width:6px">:</td>
      <td class="value">${transaction.invoiceNo}</td>
    </tr>
    ${showKasir ? `
    <tr>
      <td class="label">Kasir</td>
      <td class="label" style="width:6px">:</td>
      <td class="value">${transaction.user.name}</td>
    </tr>` : ""}
  </table>

  <hr class="divider-solid">

  <!-- ITEMS -->
  <table class="items-table" style="margin-bottom:4px">
    <tbody>
      ${itemsHtml}
    </tbody>
  </table>

  <hr class="divider-solid">

  <!-- TOTAL & PEMBAYARAN -->
  <table class="totals-table" style="margin-bottom:2px">
    <tr>
      <td class="total-main">TOTAL</td>
      <td class="amount total-main">${totalStr}</td>
    </tr>
    <tr>
      <td>Bayar</td>
      <td class="amount">${bayarStr}</td>
    </tr>
    <tr>
      <td>Kembali</td>
      <td class="amount">${kembaliStr}</td>
    </tr>
  </table>

  <hr class="divider-solid">

  <!-- FOOTER -->
  <div class="footer">
    ${s["receipt.footerLine1"] ? `<div class="footer-line1">${s["receipt.footerLine1"]}</div>` : ""}
    ${s["receipt.footerLine2"] ? `<div class="footer-line2">${s["receipt.footerLine2"]}</div>` : ""}
    <div class="footer-invoice">— ${transaction.invoiceNo} —</div>
  </div>

</div>
</body>
</html>`;
}

export function printStruk(
  transaction: StrukTransaction,
  settings: Settings,
  paperSize: PaperSize
) {
  const html = buildStrukHtml(transaction, settings, paperSize);
  const winW = paperSize === PaperSize.P58MM ? 240 : 320;
  const printWindow = window.open("", "_blank", `width=${winW},height=620`);
  if (!printWindow) {
    alert("Popup diblokir browser. Izinkan popup untuk cetak struk.");
    return;
  }
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 300);
  };
}