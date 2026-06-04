"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

/* ─────────────── Types ─────────────── */

type Step = "welcome" | "database" | "admin" | "store" | "done";

interface AdminForm {
  username: string;
  name: string;
  password: string;
  confirmPassword: string;
}

interface StoreForm {
  name: string;
  tagline: string;
  phone: string;
}

/* ─────────────── Icons (inline — zero deps) ─────────────── */

function CheckIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );
}

function Spinner() {
  return (
    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
    </svg>
  );
}

/* ─────────────── Components ─────────────── */

function StepIndicator({ steps, current }: { steps: Step[]; current: Step }) {
  const labels: Record<Step, string> = {
    welcome: "Mulai",
    database: "Database",
    admin: "Admin",
    store: "Toko",
    done: "Selesai",
  };
  const idx = steps.indexOf(current);

  return (
    <nav className="flex items-center justify-center gap-0 mb-10" aria-label="Progress">
      {steps.map((s, i) => {
        const isActive = i <= idx;
        return (
          <div key={s} className="flex items-center">
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold transition-all duration-500 ${
                i < idx
                  ? "bg-primary text-black"
                  : i === idx
                    ? "ring-2 ring-primary bg-primary/20 text-primary"
                    : "bg-zinc-800 text-zinc-500"
              }`}
            >
              {i < idx ? <CheckIcon /> : i + 1}
            </div>
            {i < steps.length - 1 && (
              <div
                className={`w-12 sm:w-20 h-0.5 mx-1.5 transition-colors duration-500 ${
                  i < idx ? "bg-primary" : "bg-zinc-800"
                }`}
              />
            )}
          </div>
        );
      })}
    </nav>
  );
}

/* ─────────────── Main Wizard ─────────────── */

export function SetupWizard() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("welcome");
  const [error, setError] = useState<string | null>(null);
  const [dbLog, setDbLog] = useState<string>("");
  const [dbDone, setDbDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [adminForm, setAdminForm] = useState<AdminForm>({
    username: "admin",
    name: "Administrator",
    password: "",
    confirmPassword: "",
  });
  const [storeForm, setStoreForm] = useState<StoreForm>({
    name: "RIZKI MOTOR",
    tagline: "Sparepart Motor Terlengkap",
    phone: "",
  });
  const logEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll log
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [dbLog]);

  // ── Database init ──
  const runDatabaseSetup = useCallback(async () => {
    setBusy(true);
    setError(null);
    setDbLog("⏳ Initializing database...\n");

    try {
      const res = await fetch("/api/setup", { method: "POST" });
      const data = await res.json();

      if (data.ok) {
        setDbLog((prev) => prev + `✅ ${data.message}\n`);
        if (data.log) setDbLog((prev) => prev + `${data.log}\n`);
        setDbDone(true);

        // Auto-proceed after 1.2s
        setTimeout(() => {
          setStep("admin");
          setBusy(false);
        }, 1200);
      } else {
        // Jika error karena table sudah ada (409), tetap proceed
        if (res.status === 409) {
          setDbLog((prev) => prev + "ℹ️ Database already initialized.\n");
          setDbDone(true);
          setTimeout(() => {
            setStep("admin");
            setBusy(false);
          }, 800);
        } else {
          setDbLog((prev) => prev + `❌ ${data.message || "Unknown error"}\n`);
          setError(data.message || "Failed to initialize database");
          setBusy(false);
        }
      }
    } catch (e: any) {
      setDbLog((prev) => prev + `❌ ${e.message}\n`);
      setError(e.message);
      setBusy(false);
    }
  }, []);

  // ── Seed (admin + store settings) ──
  const runSeed = useCallback(async () => {
    setBusy(true);
    setError(null);

    try {
      const body: any = {};
      if (adminForm.username || adminForm.name || adminForm.password) {
        body.admin = {
          username: adminForm.username || undefined,
          name: adminForm.name || undefined,
          password: adminForm.password || undefined,
        };
      }
      if (storeForm.name || storeForm.tagline || storeForm.phone) {
        body.store = {
          name: storeForm.name || undefined,
          tagline: storeForm.tagline || undefined,
          phone: storeForm.phone || undefined,
        };
      }

      const res = await fetch("/api/seed", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-allow-seed": "1" },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (data.ok) {
        setStep("done");
      } else {
        // If users already exist, that's OK too
        if (res.status === 409 || (data.results && data.results.some((r: string) => r.includes("sudah ada")))) {
          setStep("done");
        } else {
          setError(data.message || "Seed failed");
        }
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }, [adminForm, storeForm]);

  // ── Validation ──
  const adminValid =
    adminForm.username.trim().length >= 3 &&
    adminForm.name.trim().length >= 1 &&
    adminForm.password.length >= 6 &&
    adminForm.password === adminForm.confirmPassword;

  const storeValid = storeForm.name.trim().length >= 1;

  // ── Welcome ──
  if (step === "welcome") {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#09090b]">
        <div className="text-center px-6 animate-[fadeIn_0.7s_ease-out]">
          {/* Logo mark */}
          <div className="mx-auto mb-8 w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg shadow-primary/20">
            <span className="text-3xl font-bold text-black">RM</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-100 mb-3">
            RIZKI MOTOR
          </h1>
          <p className="text-zinc-500 text-sm sm:text-base max-w-md mx-auto mb-10 leading-relaxed">
            Sistem POS & Manajemen Toko Sparepart Motor.
            <br />
            Siapkan toko Anda dalam beberapa langkah.
          </p>

          <button
            onClick={() => setStep("database")}
            className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-primary text-black font-semibold text-sm hover:brightness-110 transition-all active:scale-[0.98] shadow-lg shadow-primary/25"
          >
            Mulai Setup
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </button>

          <p className="mt-8 text-[11px] text-zinc-700">v1.0.0 — Next.js 16 + Prisma</p>
        </div>
      </div>
    );
  }

  // ── Database ──
  if (step === "database") {
    // Auto-start db setup
    if (!dbDone && !error && !busy) {
      // Use setTimeout to allow render first
      setTimeout(() => runDatabaseSetup(), 300);
    }

    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#09090b] p-6">
        <div className="w-full max-w-lg">
          <StepIndicator steps={["welcome", "database", "admin", "store", "done"]} current={step} />

          <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 sm:p-8 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-6">
              {dbDone ? (
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <CheckIcon />
                </div>
              ) : error ? (
                <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center">
                  <AlertIcon />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-xl bg-primary/20 text-primary flex items-center justify-center">
                  <Spinner />
                </div>
              )}
              <div>
                <h2 className="text-lg font-semibold text-zinc-100">Database Setup</h2>
                <p className="text-sm text-zinc-500">
                  {dbDone
                    ? "Database siap"
                    : error
                      ? "Gagal menginisialisasi database"
                      : "Menyiapkan database..."}
                </p>
              </div>
            </div>

            {/* Log output */}
            <div className="bg-black/50 rounded-xl p-4 font-mono text-xs leading-relaxed max-h-40 overflow-y-auto mb-6">
              {dbLog || "⏳ Menunggu..."}
              <div ref={logEndRef} />
            </div>

            {error && (
              <div className="flex gap-3">
                <button
                  onClick={runDatabaseSetup}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-black font-semibold text-sm hover:brightness-110 transition-all"
                >
                  Coba Lagi
                </button>
                <button
                  onClick={() => setStep("admin")}
                  className="px-4 py-2.5 rounded-xl border border-zinc-700 text-zinc-300 font-medium text-sm hover:bg-zinc-800 transition-all"
                >
                  Lewati
                </button>
              </div>
            )}

            {dbDone && !error && (
              <div className="flex justify-center">
                <div className="w-6 h-6 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Admin ──
  if (step === "admin") {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#09090b] p-6 overflow-y-auto">
        <div className="w-full max-w-lg py-10">
          <StepIndicator steps={["welcome", "database", "admin", "store", "done"]} current={step} />

          <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 sm:p-8 backdrop-blur-sm">
            <div className="mb-8">
              <h2 className="text-xl font-bold text-zinc-100 mb-1">Buat Akun Admin</h2>
              <p className="text-sm text-zinc-500">Akun ini akan memiliki akses penuh ke seluruh sistem.</p>
            </div>

            <div className="space-y-5">
              {/* Username */}
              <div>
                <label htmlFor="setup-username" className="block text-xs font-medium text-zinc-400 mb-1.5 tracking-wide uppercase">
                  Username
                </label>
                <input
                  id="setup-username"
                  type="text"
                  value={adminForm.username}
                  onChange={(e) => setAdminForm((f) => ({ ...f, username: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-zinc-800/80 border border-zinc-700 rounded-xl text-zinc-100 text-sm placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                  placeholder="admin"
                  autoFocus
                />
              </div>

              {/* Name */}
              <div>
                <label htmlFor="setup-name" className="block text-xs font-medium text-zinc-400 mb-1.5 tracking-wide uppercase">
                  Nama Lengkap
                </label>
                <input
                  id="setup-name"
                  type="text"
                  value={adminForm.name}
                  onChange={(e) => setAdminForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-zinc-800/80 border border-zinc-700 rounded-xl text-zinc-100 text-sm placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                  placeholder="Administrator"
                />
              </div>

              {/* Password */}
              <div>
                <label htmlFor="setup-password" className="block text-xs font-medium text-zinc-400 mb-1.5 tracking-wide uppercase">
                  Password
                </label>
                <input
                  id="setup-password"
                  type="password"
                  value={adminForm.password}
                  onChange={(e) => setAdminForm((f) => ({ ...f, password: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-zinc-800/80 border border-zinc-700 rounded-xl text-zinc-100 text-sm placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                  placeholder="Minimal 6 karakter"
                />
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="setup-confirm" className="block text-xs font-medium text-zinc-400 mb-1.5 tracking-wide uppercase">
                  Konfirmasi Password
                </label>
                <input
                  id="setup-confirm"
                  type="password"
                  value={adminForm.confirmPassword}
                  onChange={(e) => setAdminForm((f) => ({ ...f, confirmPassword: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-zinc-800/80 border border-zinc-700 rounded-xl text-zinc-100 text-sm placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                  placeholder="Ketik ulang password"
                />
                {adminForm.confirmPassword && adminForm.password !== adminForm.confirmPassword && (
                  <p className="mt-1.5 text-xs text-red-400">Password tidak cocok</p>
                )}
              </div>
            </div>

            {error && (
              <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-2.5">
                <AlertIcon />
                <p className="text-sm text-red-300">{error}</p>
              </div>
            )}

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setStep("database")}
                className="px-4 py-2.5 rounded-xl border border-zinc-700 text-zinc-300 font-medium text-sm hover:bg-zinc-800 transition-all"
              >
                Kembali
              </button>
              <button
                onClick={() => {
                  setError(null);
                  setStep("store");
                }}
                disabled={!adminValid}
                className={`flex-1 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                  adminValid
                    ? "bg-primary text-black hover:brightness-110 active:scale-[0.98] shadow-lg shadow-primary/20"
                    : "bg-zinc-800 text-zinc-600 cursor-not-allowed"
                }`}
              >
                Lanjutkan
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Store ──
  if (step === "store") {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#09090b] p-6 overflow-y-auto">
        <div className="w-full max-w-lg py-10">
          <StepIndicator steps={["welcome", "database", "admin", "store", "done"]} current={step} />

          <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 sm:p-8 backdrop-blur-sm">
            <div className="mb-8">
              <h2 className="text-xl font-bold text-zinc-100 mb-1">Pengaturan Toko</h2>
              <p className="text-sm text-zinc-500">Informasi toko Anda akan tampil di struk dan halaman publik.</p>
            </div>

            <div className="space-y-5">
              <div>
                <label htmlFor="setup-store-name" className="block text-xs font-medium text-zinc-400 mb-1.5 tracking-wide uppercase">
                  Nama Toko
                </label>
                <input
                  id="setup-store-name"
                  type="text"
                  value={storeForm.name}
                  onChange={(e) => setStoreForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-zinc-800/80 border border-zinc-700 rounded-xl text-zinc-100 text-sm placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                  placeholder="RIZKI MOTOR"
                  autoFocus
                />
              </div>

              <div>
                <label htmlFor="setup-tagline" className="block text-xs font-medium text-zinc-400 mb-1.5 tracking-wide uppercase">
                  Tagline
                </label>
                <input
                  id="setup-tagline"
                  type="text"
                  value={storeForm.tagline}
                  onChange={(e) => setStoreForm((f) => ({ ...f, tagline: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-zinc-800/80 border border-zinc-700 rounded-xl text-zinc-100 text-sm placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                  placeholder="Sparepart Motor Terlengkap"
                />
              </div>

              <div>
                <label htmlFor="setup-phone" className="block text-xs font-medium text-zinc-400 mb-1.5 tracking-wide uppercase">
                  No. Telepon
                </label>
                <input
                  id="setup-phone"
                  type="text"
                  value={storeForm.phone}
                  onChange={(e) => setStoreForm((f) => ({ ...f, phone: e.target.value.replace(/\D/g, "") }))}
                  className="w-full px-4 py-2.5 bg-zinc-800/80 border border-zinc-700 rounded-xl text-zinc-100 text-sm placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                  placeholder="0812-3456-7890"
                />
              </div>
            </div>

            {error && (
              <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-2.5">
                <AlertIcon />
                <p className="text-sm text-red-300">{error}</p>
              </div>
            )}

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setStep("admin")}
                className="px-4 py-2.5 rounded-xl border border-zinc-700 text-zinc-300 font-medium text-sm hover:bg-zinc-800 transition-all"
              >
                Kembali
              </button>
              <button
                onClick={runSeed}
                disabled={!storeValid || busy}
                className={`flex-1 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                  storeValid && !busy
                    ? "bg-primary text-black hover:brightness-110 active:scale-[0.98] shadow-lg shadow-primary/20"
                    : "bg-zinc-800 text-zinc-600 cursor-not-allowed"
                }`}
              >
                {busy ? (
                  <>
                    <Spinner />
                    Menyimpan...
                  </>
                ) : (
                  "Selesai & Simpan"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Done ──
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#09090b]">
      <div className="text-center px-6 animate-[fadeIn_0.5s_ease-out]">
        {/* Success check */}
        <div className="mx-auto mb-8 w-20 h-20 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
          <svg className="w-10 h-10 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>

        <h2 className="text-2xl font-bold text-zinc-100 mb-2">Setup Selesai!</h2>
        <p className="text-zinc-500 text-sm max-w-sm mx-auto mb-10 leading-relaxed">
          Toko Anda sudah siap digunakan. Silakan masuk dengan akun admin yang baru dibuat.
        </p>

        <button
          onClick={() => router.push("/login")}
          className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-primary text-black font-semibold text-sm hover:brightness-110 transition-all active:scale-[0.98] shadow-lg shadow-primary/25"
        >
          Masuk ke Aplikasi
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </button>

        <p className="mt-6 text-xs text-zinc-700">
          Data user KASIR: <span className="font-mono text-zinc-600">kasir / kasir123</span>
        </p>
      </div>
    </div>
  );
}
