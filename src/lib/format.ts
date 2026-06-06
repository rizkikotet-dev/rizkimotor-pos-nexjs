// Utilitas format Rupiah & tanggal Indonesia
//
// Intl.NumberFormat dan Intl.DateTimeFormat cukup mahal untuk dibuat.
// Kita cache instance di module scope supaya tidak di-instantiate
// ulang setiap kali formatRupiah dipanggil (dipanggil puluhan kali
// per render halaman POS, katalog, dll).
const idIDR = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});
const idNumber = new Intl.NumberFormat("id-ID");
const idDate = new Intl.DateTimeFormat("id-ID", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});
const idDateTime = new Intl.DateTimeFormat("id-ID", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export function formatRupiah(amount: number): string {
  return idIDR.format(amount);
}

export function formatRupiahShort(amount: number): string {
  // Rp 50.000 (lebih ringkas, tanpa "Rp" prefix double)
  return "Rp " + idNumber.format(amount);
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return idDate.format(d);
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return idDateTime.format(d);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export function generateInvoiceNo(): string {
  // INV-YYYYMMDD-HHMMSS-XXX
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const hh = String(now.getHours()).padStart(2, "0");
  const min = String(now.getMinutes()).padStart(2, "0");
  const ss = String(now.getSeconds()).padStart(2, "0");
  const random = Math.floor(100 + Math.random() * 900);
  return `INV-${yyyy}${mm}${dd}-${hh}${min}${ss}-${random}`;
}
