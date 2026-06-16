"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

/* ─────────────── Types ─────────────── */

type Step = "welcome" | "dbtype" | "dbconfig" | "database" | "admin" | "store" | "done";

type DbType = "sqlite" | "postgresql";

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

/* ─────────────── Step indicator ─────────────── */

function StepIndicator({ steps, current }: { steps: Step[]; current: Step }) {
  const idx = steps.indexOf(current);
  if (idx < 0) return null;

  return (
    <nav className="flex items-center justify-center gap-0 mb-10" aria-label="Progress">
      {steps.map((s, i) => {
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
                className={`w-10 sm:w-16 h-0.5 mx-1 transition-colors duration-500 ${
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

/* ─────────────── Database option card ─────────────── */

function DbOptionCard({
  value,
  selected,
  title,
  desc,
  icon,
  onSelect,
}: {
  value: DbType;
  selected: DbType;
  title: string;
  desc: string;
  icon: string;
  onSelect: (v: DbType) => void;
}) {
  const isActive = value === selected;
  return (
    <button
      onClick={() => onSelect(value)}
      className={`w-full text-left p-5 rounded-xl border transition-all ${
        isActive
          ? "border-primary bg-primary/10 ring-1 ring-primary/30"
          : "border-zinc-800 bg-zinc-900/60 hover:border-zinc-700 hover:bg-zinc-800/60"
      }`}
    >
      <div className="flex items-start gap-4">
        <span className="text-2xl">{icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5 mb-1">
            <h3 className="font-semibold text-zinc-100">{title}</h3>
            <div
              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                isActive ? "border-primary" : "border-zinc-600"
              }`}
            >
              {isActive && <div className="w-2 h-2 rounded-full bg-primary" />}
            </div>
          </div>
          <p className="text-sm text-zinc-500 leading-relaxed">{desc}</p>
        </div>
      </div>
    </button>
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

  // Database selection - detect from env on client side
  const [dbType, setDbType] = useState<DbType>(() => {
    if (typeof window !== "undefined") {
      const envDbType = (window as unknown as { __ENV_DB_TYPE?: string }).__ENV_DB_TYPE;
      return envDbType === "postgresql" ? "postgresql" : "sqlite";
    }
    return "sqlite";
  });
  const [connectionString, setConnectionString] = useState("");

  // Forms
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
    setDbLog(`⏳ Initializing ${dbType === "postgresql" ? "PostgreSQL" : "SQLite"} database...\n`);

    try {
      const res = await fetch("/api/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: dbType,
          connectionString: dbType === "postgresql" ? connectionString : undefined,
        }),
      });
      const data = await res.json();

      // Tampilkan info log dari server
      if (data.info) {
        setDbLog((prev) => prev + data.info.map((l: string) => `${l}\n`).join(""));
      }

      if (data.ok) {
        setDbLog((prev) => prev + `✅ ${data.message}\n`);
        if (data.log) setDbLog((prev) => prev + `${data.log}\n`);
        setDbDone(true);
        setTimeout(() => {
          setStep("admin");
          setBusy(false);
        }, 1200);
      } else {
        if (res.status === 409) {
          setDbLog((prev) => prev + "ℹ️ Database already initialized.\n");
          setDbDone(true);
          setTimeout(() => {
            setStep("admin");
            setBusy(false);
          }, 800);
        } else {
          setDbLog((prev) => prev + `❌ ${data.message || "Unknown error"}\n`);
          if (data.error) setDbLog((prev) => prev + `\n${data.error}\n`);
          if (data.tip) setDbLog((prev) => prev + `💡 ${data.tip}\n`);
          setError(data.tip || data.message || "Failed to initialize database");
          setBusy(false);
        }
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      setDbLog((prev) => prev + `❌ ${msg}\n`);
      setError(msg);
      setBusy(false);
    }
  }, [dbType, connectionString]);

  // ── Seed ──
  const runSeed = useCallback(async () => {
    setBusy(true);
    setError(null);

    try {
      const body: { admin?: { username?: string; name?: string; password?: string }; store?: { name?: string; tagline?: string; phone?: string } } = {};
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
        if (
          res.status === 409 ||
          (data.results && data.results.some((r: string) => r.includes("sudah ada")))
        ) {
          setStep("done");
        } else {
          setError(data.message || "Seed failed");
        }
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Unknown error");
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

  // All steps for indicator
  const allSteps: Step[] = ["welcome", "dbtype", "dbconfig", "database", "admin", "store", "done"];

  // ────────────── Render steps ──────────────

  // ── Welcome ──
  if (step === "welcome") {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#09090b]">
        <div className="text-center px-6 animate-[fadeIn_0.7s_ease-out]">
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
            onClick={() => setStep("dbtype")}
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

  // ── Database Type ──
  if (step === "dbtype") {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#09090b] p-6 overflow-y-auto">
        <div className="w-full max-w-lg py-10">
          <StepIndicator steps={allSteps} current={step} />

          <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 sm:p-8 backdrop-blur-sm">
            <div className="mb-8">
              <h2 className="text-xl font-bold text-zinc-100 mb-1">Pilih Database</h2>
              <p className="text-sm text-zinc-500">
                Pilih tipe database yang akan digunakan. SQLite untuk lokal/Docker, PostgreSQL untuk production.
              </p>
            </div>

            <div className="space-y-3.5">
              <DbOptionCard
                value="sqlite"
                selected={dbType}
                title="SQLite"
                desc="Penyimpanan file lokal. Cocok untuk development, testing, dan deployment Docker single-container. Praktis — tanpa setup server database."
                icon="🗄️"
                onSelect={setDbType}
              />
              <DbOptionCard
                value="postgresql"
                selected={dbType}
                title="PostgreSQL"
                desc="Database server production-grade. Cocok untuk deployment Vercel, multi-instance, dan aplikasi skala besar. Membutuhkan koneksi ke server PostgreSQL."
                icon="🐘"
                onSelect={setDbType}
              />
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setStep("welcome")}
                className="px-4 py-2.5 rounded-xl border border-zinc-700 text-zinc-300 font-medium text-sm hover:bg-zinc-800 transition-all"
              >
                Kembali
              </button>
              <button
                onClick={() => {
                  setError(null);
                  if (dbType === "postgresql") {
                    setStep("dbconfig");
                  } else {
                    setStep("database");
                  }
                }}
                className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-black font-semibold text-sm hover:brightness-110 transition-all active:scale-[0.98] shadow-lg shadow-primary/20"
              >
                {dbType === "postgresql" ? "Konfigurasi Koneksi" : "Lanjutkan"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Database Config (PostgreSQL) ──
  if (step === "dbconfig") {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#09090b] p-6 overflow-y-auto">
        <div className="w-full max-w-lg py-10">
          <StepIndicator steps={allSteps} current={step} />

          <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 sm:p-8 backdrop-blur-sm">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">🐘</span>
                <h2 className="text-xl font-bold text-zinc-100">Koneksi PostgreSQL</h2>
              </div>
              <p className="text-sm text-zinc-500 leading-relaxed">
                Masukkan connection string PostgreSQL. Database harus sudah dibuat dan bisa diakses dari lingkungan ini.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="setup-pg-url" className="block text-xs font-medium text-zinc-400 mb-1.5 tracking-wide uppercase">
                  Connection String
                </label>
                <input
                  id="setup-pg-url"
                  type="text"
                  value={connectionString}
                  onChange={(e) => setConnectionString(e.target.value)}
                  className="w-full px-4 py-2.5 bg-zinc-800/80 border border-zinc-700 rounded-xl text-zinc-100 text-sm placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all font-mono"
                  placeholder="postgresql://user:password@host:5432/dbname?sslmode=require"
                  autoFocus
                />
                <p className="mt-2 text-xs text-zinc-600 leading-relaxed">
                  Format: <code className="text-zinc-500">postgresql://user:pass@host:5432/nama_database?sslmode=require</code>
                </p>
              </div>

              {/* Info box */}
              <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
                <p className="text-xs text-amber-400/80 leading-relaxed">
                  <strong className="text-amber-400">Vercel:</strong> Set DATABASE_URL di Vercel Dashboard → Settings → Environment Variables, bukan di sini. Cukup klik Lanjutkan.
                </p>
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
                onClick={() => setStep("dbtype")}
                className="px-4 py-2.5 rounded-xl border border-zinc-700 text-zinc-300 font-medium text-sm hover:bg-zinc-800 transition-all"
              >
                Kembali
              </button>
              <button
                onClick={() => {
                  setError(null);
                  setStep("database");
                }}
                disabled={!connectionString.trim()}
                className={`flex-1 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                  connectionString.trim()
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

  // ── Database init ──
  if (step === "database") {
    // Auto-start db setup sekali
    if (!dbDone && !error && !busy) {
      setTimeout(() => runDatabaseSetup(), 300);
    }

    const displaySteps: Step[] = ["welcome", "dbtype", "database", "admin", "store", "done"];

    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#09090b] p-6">
        <div className="w-full max-w-lg">
          <StepIndicator steps={displaySteps} current={step} />

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
                      : `Menyiapkan ${dbType === "postgresql" ? "PostgreSQL" : "SQLite"}...`}
                </p>
              </div>
            </div>

            {/* Log output */}
            <div className="bg-black/50 rounded-xl p-4 font-mono text-xs leading-relaxed max-h-48 overflow-y-auto mb-6 whitespace-pre-wrap">
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
    const adminSteps: Step[] = ["welcome", "dbtype", "database", "admin", "store", "done"];

    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#09090b] p-6 overflow-y-auto">
        <div className="w-full max-w-lg py-10">
          <StepIndicator steps={adminSteps} current={step} />

          <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 sm:p-8 backdrop-blur-sm">
            <div className="mb-8">
              <h2 className="text-xl font-bold text-zinc-100 mb-1">Buat Akun Admin</h2>
              <p className="text-sm text-zinc-500">Akun ini akan memiliki akses penuh ke seluruh sistem.</p>
            </div>

            <div className="space-y-5">
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
    const storeSteps: Step[] = ["welcome", "dbtype", "database", "admin", "store", "done"];

    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#09090b] p-6 overflow-y-auto">
        <div className="w-full max-w-lg py-10">
          <StepIndicator steps={storeSteps} current={step} />

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
