"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Wrench, AlertCircle, Loader2, Eye, EyeOff } from "lucide-react";

export function LoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
    if (role === "ADMIN") {
      router.push(search.get("callbackUrl") || "/admin");
    } else if (role === "KASIR") {
      router.push(search.get("callbackUrl") || "/pos");
    } else {
      router.push("/");
    }
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-surface-50 via-surface-100 to-brand-50 px-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="card p-8 sm:p-10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-brand-600 text-white rounded-2xl mb-4 shadow-lg shadow-brand-600/20">
              <Wrench className="h-7 w-7" />
            </div>
            <h1 className="text-2xl font-bold text-surface-900 tracking-tight">RIZKI MOTOR</h1>
            <p className="text-sm text-surface-500 mt-1">Login Admin / Kasir</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-surface-700 mb-1.5">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
                className="input"
                placeholder="admin atau kasir"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-surface-700 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="input pr-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2.5 p-3.5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 text-base mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Masuk...
                </>
              ) : (
                "Masuk"
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-surface-200 text-center">
            <p className="text-xs text-surface-500 mb-2">Default login:</p>
            <div className="bg-surface-50 rounded-xl p-3 text-xs text-surface-600 font-mono space-y-1">
              <p><span className="font-semibold text-surface-900">admin</span> / admin123 <span className="text-surface-400">(Administrator)</span></p>
              <p><span className="font-semibold text-surface-900">kasir</span> / kasir123 <span className="text-surface-400">(Kasir)</span></p>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-surface-500 mt-4">
          <a href="/" className="hover:text-brand-600 transition-colors">
            &larr; Kembali ke katalog
          </a>
        </p>
      </div>
    </div>
  );
}
