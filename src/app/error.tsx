"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";
import { Button } from "@/components/ui/Button";

// Global error boundary for the app. Catches uncaught exceptions in
// server components and shows a graceful recovery UI. Logs to console
// for dev visibility; in production you'd forward to Sentry/PostHog etc.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App error:", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 mb-6">
          <AlertTriangle className="h-7 w-7 text-red-400" aria-hidden="true" />
        </div>

        <p className="text-[10px] font-mono text-red-400 uppercase tracking-widest mb-2">
          Terjadi Kesalahan
        </p>

        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-100 mb-3">
          Waduh, ada masalah
        </h1>

        <p className="text-zinc-400 leading-relaxed mb-2">
          Aplikasi mengalami kesalahan tak terduga. Tim kami sudah otomatis mencatat
          laporan ini.
        </p>

        {error.digest && (
          <p className="text-[10px] font-mono text-zinc-600 mb-6">
            ID: {error.digest}
          </p>
        )}
        {!error.digest && <div className="mb-6" />}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            variant="primary"
            size="md"
            onClick={reset}
            className="w-full sm:w-auto"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Coba Lagi
          </Button>
          <Link href="/">
            <Button variant="secondary" size="md" className="w-full sm:w-auto">
              <Home className="h-4 w-4" aria-hidden="true" />
              Beranda
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
