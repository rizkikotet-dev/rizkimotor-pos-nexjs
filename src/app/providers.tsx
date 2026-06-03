// DEPRECATED: providers.tsx dulu berisi SessionProvider, tapi kombinasi
// next-auth@4.24.10 + next@14.2.35 + React Refresh menyebabkan error
// "Cannot read properties of undefined (reading 'call')" di bundle.
// Sekarang session di-pass via props dari server component (lihat pos/page.tsx).
// File ini dipertahankan sebagai no-op untuk backward-compat, tapi tidak dipakai.
export function Providers({ children }: { children: React.ReactNode }) {
  return children;
}
