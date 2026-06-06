"use client";

import { useState, useRef, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Wrench, AlertCircle, Loader2, Eye, EyeOff } from "lucide-react";
import { UserRole } from "@/lib/constants";

export function LoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const usernameRef = useRef<HTMLInputElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    usernameRef.current?.focus();
  }, []);

  useEffect(() => {
    if (error && errorRef.current) {
      errorRef.current.focus();
    }
  }, [error]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await signIn("credentials", {
      username,
      password,
      redirect: false,
    });

    if (res?.error) {
      setError("Username atau password salah");
      setLoading(false);
      return;
    }

    const res2 = await fetch("/api/auth/session");
    const session = await res2.json();

    const role = session?.user?.role;
    if (role === UserRole.ADMIN) {
      router.push(search.get("callbackUrl") || "/admin");
    } else if (role === UserRole.KASIR) {
      router.push(search.get("callbackUrl") || "/pos");
    } else {
      router.push("/");
    }
    router.refresh();
  }

  return (
    <div className="min-h-dvh flex items-center justify-center bg-surface-base px-4 safe-area-top safe-area-bottom">
      <div className="w-full max-w-sm animate-fade-in">
        <div className="card p-6">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-10 h-10 bg-primary text-surface-base rounded-lg mb-3">
              <Wrench className="h-5 w-5" aria-hidden="true" />
            </div>
            <h1 className="text-lg font-bold text-zinc-100 tracking-tight">RIZKI MOTOR</h1>
            <p className="text-xs text-zinc-500 mt-0.5 font-mono uppercase tracking-widest">Login Admin / Kasir</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3" noValidate>
            <div>
              <label htmlFor="username" className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                Username
              </label>
              <input
                ref={usernameRef}
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
                aria-label="Username"
                className="input"
                placeholder="admin atau kasir"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  aria-label="Password"
                  className="input pr-10"
                  placeholder="Masukkan password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors p-1.5 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/40 min-h-[36px] min-w-[36px]"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
                </button>
              </div>
            </div>

            {error && (
              <div
                ref={errorRef}
                role="alert"
                aria-live="assertive"
                tabIndex={-1}
                className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400 focus:outline-none focus:ring-2 focus:ring-red-500/40"
              >
                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" aria-hidden="true" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !username || !password}
              className="btn-primary w-full mt-1"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  Masuk...
                </>
              ) : (
                "Masuk"
              )}
            </button>
          </form>

          <div className="mt-5 pt-4 border-t border-surface-outline-variant text-center">
            <p className="text-[10px] text-zinc-600 mb-2 font-mono uppercase tracking-widest">Default login</p>
            <div className="bg-surface-container-low rounded-lg p-2.5 text-xs text-zinc-500 font-mono space-y-0.5 border border-surface-outline-variant">
              <p><span className="font-semibold text-zinc-200">admin</span> / admin123 <span className="text-zinc-600">(Admin)</span></p>
              <p><span className="font-semibold text-zinc-200">kasir</span> / kasir123 <span className="text-zinc-600">(Kasir)</span></p>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-zinc-600 mt-3">
          <Link href="/" className="hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40 rounded-sm">
            &larr; Kembali ke katalog
          </Link>
        </p>
      </div>
    </div>
  );
}
